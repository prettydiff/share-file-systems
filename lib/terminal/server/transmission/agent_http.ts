
/* lib/terminal/server/transmission/agent_http - This library launches the HTTP service and all supporting service utilities. */

import { exec } from "child_process";
import { stat } from "fs";
import {
    ClientRequest,
    createServer as httpServer,
    IncomingMessage,
    OutgoingHttpHeaders,
    request as httpRequest,
    RequestOptions,
    ServerResponse
} from "http";
import {
    createServer as httpsServer,
    request as httpsRequest
} from "https";
import { AddressInfo, Server } from "net";
import { Readable } from "stream";
import { StringDecoder } from "string_decoder";

import agent_ws from "./agent_ws.js";
import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import heartbeat from "../services/heartbeat.js";
import log from "../../utilities/log.js";
import methodGET from "./methodGET.js";
import readCerts from "../readCerts.js";
import readStorage from "../../utilities/readStorage.js";
import receiver from "./receiver.js";
import serverVars from "../serverVars.js";
import vars from "../../utilities/vars.js";

// cspell:words nosniff

/**
 * The HTTP library.
 * * **receive** - Processes incoming HTTP requests.
 * * **request** - Creates an arbitrary client request to a remote HTTP server.
 * * **requestCopy** - A specific client request orchestrated to meet the needs of file copy.
 * * **respond** - Formats and sends HTTP response messages.
 * * **server** - Creates an HTTP server.
 *
 * ```typescript
 * interface agent_http {
 *     receive: (request:IncomingMessage, serverResponse:ServerResponse) => void;
 *     request: (config:httpRequest) => void;
 *     requestCopy: (config:httpCopyRequest) => void;
 *     respond: (config:responseConfig) => void;
 *     server: (serverOptions:serverOptions, serverCallback:serverCallback) => void;
 * }
 * ``` */
const agent_http:module_agent_http = {
    receive: function terminal_server_transmission_agentHttp_receive(request:IncomingMessage, serverResponse:ServerResponse):void {
        let ended:boolean = false,
            host:string = (function terminal_server_transmission_agentHttp_receive_host():string {
                let name:string = request.headers.host;
                if (name === undefined) {
                    return "";
                }
                if (name === "localhost" || (/((localhost)|(\[::\])):\d{0,5}/).test(name) === true || name === "::1" || name === "[::1]" || name === "127.0.0.1") {
                    return "localhost";
                }
                if (name.indexOf(":") > 0) {
                    name = name.slice(0, name.lastIndexOf(":"));
                }
                if (name.charAt(0) === "[") {
                    name = name.slice(1, name.length - 1);
                }
                if (name === "::1" || name === "127.0.0.1") {
                    return "localhost";
                }
                return request.headers.host;
            }());
        const chunks:string[] = [],
            decoder:StringDecoder = new StringDecoder("utf8"),
            agentType:agentType = request.headers["agent-type"] as agentType,
            agent:string = request.headers["agent-hash"] as string,
            requestEnd = function terminal_server_transmission_agentHttp_receive_requestEnd():void {
                const requestType:requestType = (request.method === "GET") ? `GET ${request.url}` as requestType : request.headers["request-type"] as requestType,
                    setIdentity = function terminal_server_transmission_agentHttp_receive_setIdentity(forbidden:boolean):void {
                        if (request.headers["agent-hash"] === undefined) {
                            return;
                        }
                        if (forbidden === true) {
                            serverResponse.setHeader("agent-hash", request.headers["agent-hash"]);
                            serverResponse.setHeader("agent-type", "user");
                        } else {
                            const type:agentType = request.headers["agent-type"] as agentType,
                                self:string = (type === "device")
                                    ? serverVars.hashDevice
                                    : serverVars.hashUser;
                            if (self !== undefined) {
                                host = self;
                                serverResponse.setHeader("agent-hash", self);
                                serverResponse.setHeader("agent-type", type);
                            }
                        }
                    },
                    destroy = function terminal_server_transmission_agentHttp_receive_destroy():void {
                        setIdentity(true);
                        request.destroy({
                            name: "FORBIDDEN",
                            message: `Agent type ${agentType} does not contain agent identity ${agent}.`
                        });
                    },
                    post = function terminal_server_transmission_agentHttp_receive_post():void {
                        const body:string = chunks.join(""),
                            receivedLength:number = Buffer.byteLength(body),
                            contentLength:number = Number(request.headers["content-length"]),
                            socketData:socketData = JSON.parse(body);
                        if (receivedLength > contentLength) {
                            request.destroy({
                                name: "TOO_LARGE",
                                message: "Request destroyed for size in excess of its content-length header."
                            });
                        }
                        setIdentity(false);
                        if (socketData.service === undefined) {
                            request.socket.destroy();
                            serverResponse.socket.destroy();
                        } else {
                            receiver(socketData, {
                                socket: serverResponse,
                                type: "http"
                            }, request);
                        }
                    },
                    postTest = function terminal_server_transmission_agentHttp_receive_postTest():boolean {
                        if (
                            request.method === "POST" && 
                            requestType !== undefined && (
                                host === "localhost" || (
                                    host !== "localhost" && (
                                        (serverVars[agentType] !== undefined && serverVars[agentType][agent] !== undefined) ||
                                        requestType === "hash-device" ||
                                        requestType === "invite" ||
                                        serverVars.testType.indexOf("browser") === 0
                                    )
                                )
                            )
                        ) {
                            return true;
                        }
                        return false;
                    };
                ended = true;
                if (host === "") {
                    destroy();
                } else if (request.method === "GET") {
                    if (host === "localhost") {
                        setIdentity(true);
                        methodGET(request, serverResponse);
                    } else {
                        destroy();
                    }
                } else if (postTest() === true) {
                    post();
                } else {
                    // the delay is necessary to prevent a race condition between service execution and data settings writing
                    setTimeout(function terminal_server_transmission_agentHttp_receive_requestEnd_delay():void {
                        if (postTest() === true) {
                            post();
                        } else {
                            stat(`${vars.projectPath}lib${vars.sep}settings${vars.sep}user.json`, function terminal_server_transmission_agentHttp_receive_requestEnd_delay_userStat(err:Error):void {
                                if (err === null) {
                                    destroy();
                                }
                            });
                            destroy();
                        }
                    }, 50);
                }
            },
            requestError = function terminal_server_transmission_agentHttp_receive_requestError(errorMessage:NodeJS.ErrnoException):void {
                const errorString:string = errorMessage.toString();
                if (errorMessage.code !== "ETIMEDOUT" && (ended === false || (ended === true && errorString !== "Error: aborted"))) {
                    const body:string = chunks.join("");
                    log([
                        `${vars.text.cyan}POST request, ${request.headers["request-type"]}, methodPOST.ts${vars.text.none}`,
                        body.slice(0, 1024),
                        "",
                        `body length: ${body.length}`,
                        vars.text.angry + errorString + vars.text.none,
                        "",
                        ""
                    ]);
                }
            },
            responseError = function terminal_server_transmission_agentHttp_receive_responseError(errorMessage:NodeJS.ErrnoException):void {
                if (errorMessage.code !== "ETIMEDOUT") {
                    const body:string = chunks.join("");
                    log([
                        `${vars.text.cyan}POST response, ${request.headers["request-type"]}, methodPOST.ts${vars.text.none}`,
                        (body.length > 1024)
                            ? `${body.slice(0, 512)}  ...  ${body.slice(body.length - 512)}`
                            : body,
                        "",
                        `body length: ${body.length}`,
                        vars.text.angry + errorMessage.toString() + vars.text.none,
                        "",
                        ""
                    ]);
                }
            };
        // *** available for troubleshooting:
        // console.log(`${requestType} ${host} ${postTest()} ${agentType} ${agent}`);

        // request handling
        request.on("data", function terminal_server_transmission_agentHttp_receive_onData(data:Buffer):void {
            chunks.push(decoder.write(data));
        });
        request.on("error", requestError);
        serverResponse.on("error", responseError);
        request.on("end", requestEnd);
    },
    request: function terminal_server_transmission_agentHttp_request(config:httpRequest):void {
        const dataString:string = JSON.stringify(config.payload),
            headers:OutgoingHttpHeaders = {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": Buffer.byteLength(dataString),
                "agent-hash": (config.agentType === "device")
                    ? serverVars.hashDevice
                    : serverVars.hashUser,
                "agent-name": (config.agentType === "device")
                    ? serverVars.nameDevice
                    : serverVars.nameUser,
                "agent-type": config.agentType,
                "request-type": config.payload.service
            },
            payload:RequestOptions = {
                headers: headers,
                host: config.ip,
                method: "POST",
                path: "/",
                port: config.port,
                timeout: (config.payload.service === "agent-online")
                    ? 1000
                    : (config.payload.service.indexOf("copy") === 0)
                        ? 7200000
                        : 5000
            },
            scheme:"http"|"https" = (serverVars.secure === true)
                ? "https"
                : "http",
            errorMessage = function terminal_sever_transmission_agentHttp_request_errorMessage(type:"request"|"response", errorItem:NodeJS.ErrnoException):string[] {
                const agent:agent = serverVars[config.agentType][config.agent],
                    errorText:string[] = [`${vars.text.angry}Error on client HTTP ${type} for service:${vars.text.none} ${config.payload.service}`];
                if (agent === undefined) {
                    errorText.push( `Agent data is undefined: agentType - ${config.agentType}, agent - ${config.agent}`);
                    errorText.push("If running remote browser test automation examine the health of the remote agents.");
                } else {
                    errorText.push(`Agent Name: ${serverVars[config.agentType][config.agent].name}, Agent Type: ${config.agentType},  Agent ID: ${config.agent}`);
                }
                errorText.push(JSON.stringify(errorItem));
                return errorText;
            },
            requestError = function terminal_server_transmission_agentHttp_request_requestError(erRequest:NodeJS.ErrnoException):void {
                if (erRequest.code !== "ETIMEDOUT") {
                    errorMessage("request", erRequest);
                }
            },
            responseError = function terminal_server_transmission_agentHttp_request_responseError(erResponse:NodeJS.ErrnoException):void {
                if (erResponse.code !== "ETIMEDOUT") {
                    errorMessage("response", erResponse);
                }
            },
            requestCallback = function terminal_server_transmission_agentHttp_request_requestCallback(fsResponse:IncomingMessage):void {
                const chunks:Buffer[] = [];
                fsResponse.setEncoding("utf8");
                fsResponse.on("data", function terminal_server_transmission_agentHttp_request_requestCallback_onData(chunk:Buffer):void {
                    chunks.push(chunk);
                });
                fsResponse.on("end", function terminal_server_transmission_agentHttp_request_requestCallback_onEnd():void {
                    const body:string = (Buffer.isBuffer(chunks[0]) === true)
                        ? Buffer.concat(chunks).toString()
                        : chunks.join("");
                    if (config.callback !== null) {
                        if (body === "") {
                            error(["Error: Response body is empty."]);
                        } else {
                            config.callback(JSON.parse(body));
                        }
                    }
                });
                fsResponse.on("error", responseError);
            },
            fsRequest:ClientRequest = (scheme === "https")
                ? httpsRequest(payload, requestCallback)
                : httpRequest(payload, requestCallback);
        if (fsRequest.writableEnded === true) {
            error([
                "Attempt to write to HTTP request after end:",
                dataString
            ]);
        } else {
            fsRequest.on("error", requestError);
            fsRequest.write(dataString);
            fsRequest.end();
        }
    },
    requestCopy: function terminal_server_transmission_agentHttp_requestCopy(config:httpCopyRequest):void {
        const agent:agent = serverVars[config.agentType][config.agent],
            net:[string, number] = (agent === undefined)
                ? ["", 0]
                : [
                    agent.ipSelected,
                    agent.ports.http
                ],
            scheme:"http"|"https" = (serverVars.secure === true)
                ? "https"
                : "http",
            headers:OutgoingHttpHeaders = {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": Buffer.byteLength(config.dataString),
                "agent-hash": (config.agentType === "device")
                    ? serverVars.hashDevice
                    : serverVars.hashUser,
                "agent-name": (config.agentType === "device")
                    ? serverVars.nameDevice
                    : serverVars.nameUser,
                "agent-type": config.agentType,
                "request-type": "copy-file"
            },
            httpConfig:RequestOptions = {
                headers: headers,
                host: net[0],
                method: "POST",
                path: "/",
                port: net[1],
                timeout: 5000
            },
            requestCallback = function terminal_server_transmission_agentHttp_requestCopy_responseCallback(fsResponse:IncomingMessage):void {
                const serverResponse:ServerResponse = config.transmit.socket as ServerResponse;
                serverResponse.setHeader("compression", fsResponse.headers.compression);
                serverResponse.setHeader("cut_path", fsResponse.headers.cut_path);
                serverResponse.setHeader("file_name", fsResponse.headers.file_name);
                serverResponse.setHeader("file_size", fsResponse.headers.file_size);
                serverResponse.setHeader("hash", fsResponse.headers.hash);
                serverResponse.setHeader("response-type", "copy-file");
                serverResponse.writeHead(200, {"content-type": "application/octet-stream; charset=binary"});
                fsResponse.pipe(serverResponse);
            },
            fsRequest:ClientRequest = (scheme === "https")
                ? httpsRequest(httpConfig, requestCallback)
                : httpRequest(httpConfig, requestCallback);
        if (net[0] === "") {
            return;
        }
        fsRequest.on("error", function terminal_server_transmission_agentHttp_requestCopy_onError(errorMessage:NodeJS.ErrnoException):void {
            if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                error(["Error at client request in requestFile of serviceCopy", config.dataString, errorMessage.toString()]);
            }
        });
        fsRequest.write(config.dataString);
        fsRequest.end();
    },
    respond: function terminal_server_transmission_agentHttp_respond(config:responseConfig):void {
        if (config.serverResponse !== null) {
            if (config.serverResponse.writableEnded === true) {
                const message:string[] = ["Write after end of HTTP response."];
                if (typeof config.message === "string") {
                    message.push("");
                    message.push(`${vars.text.cyan}Response message body:${vars.text.none}`);
                    message.push((config.message === "")
                        ? "(empty string)"
                        : config.message);
                }
                error(message);
            } else {
                const textTypes:string[] = [
                        "application/json",
                        "text/plain",
                        "text/html",
                        "application/javascript",
                        "text/css",
                        "image/svg+xml",
                        "application/xhtml+xml"
                    ],
                    readStream:Readable = Readable.from(config.message),
                    contains = function terminal_server_transmission_agentHttp_respond_contains(input:string):boolean {
                        const stringMessage:string = (Buffer.isBuffer(config.message) === true)
                                ? ""
                                : config.message as string,
                            lower:string = stringMessage.toLowerCase();
                        if (lower.indexOf(input) > -1 && lower.indexOf(input) < 10) {
                            return true;
                        }
                        return false;
                    },
                    type:string = (textTypes.indexOf(config.mimeType) > -1)
                        ? `${config.mimeType}; charset=utf-8`
                        : config.mimeType;
                let status:number;
                if (Buffer.isBuffer(config.message) === true) {
                    status = 200;
                } else if (contains("ENOENT") === true || contains("not found") === true) {
                    status = 404;
                } else if (contains("forbidden") === true || config.message === "Unexpected user.") {
                    status = 403;
                } else {
                    status = 200;
                }
                config.serverResponse.setHeader("cache-control", "no-store");
                if (serverVars.secure === true) {
                    config.serverResponse.setHeader("strict-transport-security", "max-age=63072000");
                }
                config.serverResponse.setHeader("alt-svc", "clear");
                config.serverResponse.setHeader("connection", "keep-alive");
                config.serverResponse.setHeader("content-length", Buffer.byteLength(config.message));
                config.serverResponse.setHeader("referrer-policy", "no-referrer");
                config.serverResponse.setHeader("response-type", config.responseType);
                config.serverResponse.setHeader("x-content-type-options", "nosniff");
                config.serverResponse.writeHead(status, {"content-type": type});
                readStream.pipe(config.serverResponse);
            }
        }
    },
    respondEmpty: function terminal_server_transmission_agentHttp_respondEmpty(transmit:transmit):void {
        if (transmit.type === "http") {
            agent_http.respond({
                message: "",
                mimeType: "text/plain",
                responseType: "response-no-action",
                serverResponse: transmit.socket as ServerResponse
            });
        }
    },
    server: function terminal_server_transmission_agentHttp_server(serverOptions:serverOptions, serverCallback:serverCallback):void {
        // at this time the serverCallback argument is only used by test automation and so its availability
        // * locks the server to address ::1 (loopback)
        // * bypasses messaging users on server start up
        // * bypasses some security checks
        let portWeb:number,
            portWs:number,
            certs:certificate = {
                certificate: {
                    cert: "",
                    key: ""
                },
                flag: {
                    crt: false,
                    key: false
                }
            },
            portString:string = "",
            certLogs:string[] = null;
        const scheme:string = (serverVars.secure === true)
                ? "https"
                : "http",
            browser = function terminal_server_transmission_agentHttp_server_browser(server:Server):void {
                // open a browser from the command line
                if (serverCallback !== null) {
                    serverCallback.callback({
                        agent: serverCallback.agent,
                        agentType: serverCallback.agentType,
                        ports: {
                            http: portWeb,
                            ws: portWs
                        },
                        server: server
                    });
                }
                if (serverOptions.browser === true) {
                    const browserCommand:string = `${serverVars.executionKeyword} ${scheme}://localhost${portString}/`;
                    exec(browserCommand, {cwd: vars.cwd}, function terminal_server_transmission_agentHttp_server_browser_child(errs:Error, stdout:string, stdError:Buffer | string):void {
                        if (errs !== null) {
                            error([errs.toString()]);
                            return;
                        }
                        if (stdError !== "") {
                            error([stdError.toString()]);
                            return;
                        }
                        log(["", "Launching default web browser..."]);
                    });
                }
            },
            port:number = (function terminal_server_transmission_agentHttp_server_port():number {
                if (serverOptions.port > -1) {
                    return serverOptions.port;
                }
                return (serverVars.testType === "service" || serverVars.testType === "browser_self" )
                    ? 0
                    : (serverVars.secure === true)
                        ? 443
                        : 80;
            }()),
            serverError = function terminal_server_transmission_agentHttp_server_serverError(errorMessage:NodeJS.ErrnoException):void {
                if (errorMessage.code === "EADDRINUSE") {
                    error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`], true);
                } else if (errorMessage.code !== "ETIMEDOUT") {
                    error([errorMessage.toString()]);
                }
            },
            start = function terminal_server_transmission_agentHttp_server_start(server:Server):void {
                const ipList = function terminal_server_transmission_agentHttp_server_start_ipList(callback:(ip:string) => void):void {
                        const addresses = function terminal_server_transmission_agentHttp_server_start_ipList_addresses(scheme:"IPv4"|"IPv6"):void {
                            let a:number = serverVars.localAddresses[scheme].length;
                            if (a > 0) {
                                do {
                                    a = a - 1;
                                    callback(serverVars.localAddresses[scheme][a]);
                                } while (a > 0);
                            }
                        };
                        addresses("IPv6");
                        addresses("IPv4");
                    },
                    logOutput = function terminal_server_transmission_agentHttp_server_start_logOutput():void {
                        const output:string[] = [];
    
                        // exclude from tests except for browser tests
                        if (serverVars.testType === "browser_remote" || serverVars.testType === "") {
    
                            // log the port information to the terminal
                            output.push(`${vars.text.cyan}HTTP server${vars.text.none} on port: ${vars.text.bold + vars.text.green + portWeb + vars.text.none}`);
                            output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + portWs + vars.text.none}`);
    
                            output.push("");
                            if (serverVars.localAddresses.IPv6.length + serverVars.localAddresses.IPv4.length === 1) {
                                output.push("Local IP address is:");
                            } else {
                                output.push("Local IP addresses are:");
                            }
                            output.push("");
    
                            output.push(`Address for web browser: ${vars.text.bold + vars.text.green + scheme}://localhost${portString + vars.text.none}`);
                            output.push("Listening on addresses:");
                            ipList(function terminal_server_transmission_agentHttp_server_start_logOutput_ipList(ip:string):void {
                                output.push(`   ${vars.text.angry}*${vars.text.none} ${ip}`);
                            });
                            if (certLogs !== null) {
                                certLogs.forEach(function terminal_server_transmission_agentHttp_server_start_logOutput_certLogs(value:string):void {
                                    output.push(value);
                                });
                            }
                            output.push("");
                            if (serverVars.testType === "browser_remote") {
                                output.push("");
                            } else {
                                log.title("Local Server");
                                output.push(`Total messages sent/received: ${common.commas(serverVars.message.length)}`);
                                output.push(`For command documentation execute: ${vars.text.cyan + vars.command_instruction}commands${vars.text.none}`);
                            }
                            log(output, true);
                        }
                        browser(server);
                    },
                    listen = function terminal_server_transmission_agentHttp_server_start_listen():void {
                        const serverAddress:AddressInfo = server.address() as AddressInfo;
                        agent_ws.server({
                            address: "",
                            callback: function terminal_server_transmission_agentHttp_server_start_listen_websocketCallback(addressInfo:AddressInfo):void {
                                portWs = addressInfo.port;
                                serverVars.ports.ws = addressInfo.port;
                                readStorage(function terminal_server_transmission_agentHttp_server_start_listen_websocketCallback_readComplete(settings:settingsItems):void {
                                    serverVars.brotli = settings.configuration.brotli;
                                    serverVars.hashDevice = settings.configuration.hashDevice;
                                    serverVars.hashType = settings.configuration.hashType;
                                    serverVars.hashUser = settings.configuration.hashUser;
                                    serverVars.message = settings.message;
                                    serverVars.nameDevice = settings.configuration.nameDevice;
                                    serverVars.nameUser = settings.configuration.nameUser;

                                    if (serverVars.testType === "" && serverVars.device[serverVars.hashDevice] !== undefined) {
                                        // open sockets and let everybody know this agent was offline but is now active
                                        const update:service_agentUpdate = {
                                                action: "update",
                                                agentFrom: "localhost-browser",
                                                broadcastList: null,
                                                shares: null,
                                                status: "active",
                                                type: "device"
                                            },
                                            agent = function terminal_server_transmission_agentHttp_server_start_listen_websocketCallback_readComplete_agent(type:agentType, agent:string):void {
                                                agent_ws.clientList[type][agent] = null;
                                                agent_ws.open({
                                                    agent: agent,
                                                    agentType: type,
                                                    callback: function terminal_server_transmission_agentHttp_server_start_listen_websocketCallback_readComplete_agent_callback():void {
                                                        count = count + 1;
                                                        if (count === agents) {
                                                            heartbeat({
                                                                data: update,
                                                                service: "heartbeat"
                                                            }, null);
                                                            logOutput();
                                                        }
                                                    }
                                                });
                                            },
                                            list = function terminal_server_transmission_agentHttp_server_start_listen_websocketCallback_readComplete_list(type:agentType):void {
                                                const keys:string[] = Object.keys(serverVars[type]);
                                                let a:number = keys.length;
                                                if (a > 0) {
                                                    do {
                                                        a = a - 1;
                                                        if (type !== "device" || (type === "device" && keys[a] !== serverVars.hashDevice)) {
                                                            agent(type, keys[a]);
                                                        }
                                                    } while (a > 0);
                                                }
                                            },
                                            agents:number = (function terminal_server_transmission_agentHttp_server_start_listen_websocketCallback_readComplete_agents():number {
                                                serverVars.device = settings.device;
                                                serverVars.hashDevice = settings.configuration.hashDevice;
                                                serverVars.user = settings.user;
                                                return Object.keys(serverVars.user).length + (Object.keys(serverVars.device).length - 1);
                                            }());
                                        let count:number = 0;

                                        if (agents < 1) {
                                            logOutput();
                                        } else {
                                            list("device");
                                            list("user");
                                        }
            
                                        serverVars.device[serverVars.hashDevice].ports = serverVars.ports;
                                    } else {
                                        logOutput();
                                    }
                                });
                            },
                            cert: (serverVars.secure === true)
                                ? {
                                    cert: certs.certificate.cert,
                                    key: certs.certificate.key
                                }
                                : null,
                            port: (port === 0)
                                ? 0
                                : serverAddress.port + 1,
                            secure: serverVars.secure
                        });
                        serverVars.ports.http = serverAddress.port;
                        portWeb = serverAddress.port;
                        portString = ((portWeb === 443 && serverVars.secure === true) || (portWeb === 80 && serverVars.secure === false))
                            ? ""
                            : `:${portWeb}`;
                    };
    
                if (process.cwd() !== vars.projectPath) {
                    process.chdir(vars.projectPath);
                }
    
                // start the service
                server.on("error", serverError);
                if (serverOptions.host === "") {
                    server.listen({
                        port: port
                    }, listen);
                } else {
                    server.listen({
                        host: serverOptions.host,
                        port: port
                    }, listen);
                }
            };
    
        if (serverOptions.test === true) {
            serverVars.settings = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
        }
        serverVars.secure = serverOptions.secure;
        if (isNaN(serverOptions.port) === true || serverOptions.port < 0 || serverOptions.port > 65535) {
            serverOptions.port = -1;
        } else {
            serverOptions.port = Math.floor(serverOptions.port);
        }
        if (serverCallback === undefined) {
            serverCallback = null;
        }
    
        if (serverVars.secure === true) {
            readCerts(function terminal_server_transmission_agentHttp_server_readCerts(https:certificate, logs:string[]):void {
                certLogs = logs;
                certs = https;
                start(httpsServer(https.certificate, agent_http.receive));
            });
        } else {
            start(httpServer(agent_http.receive));
        }
    }
};

export default agent_http;