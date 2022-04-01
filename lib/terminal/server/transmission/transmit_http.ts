
/* lib/terminal/server/transmission/agent_http - This library launches the HTTP service and all supporting service utilities. */

import { exec } from "child_process";
import { stat } from "fs";
import {
    ClientRequest,
    createServer as httpServer,
    request as httpRequest,
    IncomingMessage,
    OutgoingHttpHeaders,
    ServerResponse
} from "http";
import { createServer as httpsServer, request as httpsRequest, RequestOptions } from "https";
import { AddressInfo, Server } from "net";
import { Readable } from "stream";
import { StringDecoder } from "string_decoder";

import agent_status from "../services/agent_status.js";
import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import hash from "../../commands/hash.js";
import log from "../../utilities/log.js";
import methodGET from "./methodGET.js";
import readCerts from "../readCerts.js";
import readStorage from "../../utilities/readStorage.js";
import receiver from "./receiver.js";
import responder from "./responder.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

// cspell:words nosniff

/**
 * The HTTP library.
 * ```typescript
 * interface transmit_http {
 *     receive     : (request:IncomingMessage, serverResponse:ServerResponse) => void;          // Processes incoming HTTP requests.
 *     request     : (config:config_http_request) => void;                                      // Send an arbitrary HTTP request.
 *     respond     : (config:config_http_respond) => void;                                      // Formats and sends HTTP response messages.
 *     respondEmpty: (transmit:transmit)                                                        // Responds to a request with an empty payload.
 *     server      : (serverOptions:config_http_server, serverCallback:serverCallback) => void; // Creates an HTTP server.
 * }
 * ``` */
const transmit_http:module_transmit_http = {
    receive: function terminal_server_transmission_transmitHttp_receive(request:IncomingMessage, serverResponse:ServerResponse):void {
        let ended:boolean = false,
            host:string = (function terminal_server_transmission_transmitHttp_receive_host():string {
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
            requestEnd = function terminal_server_transmission_transmitHttp_receive_requestEnd():void {
                const requestType:string = (request.method === "GET") ? "GET" : request.headers["request-type"] as requestType,
                    setIdentity = function terminal_server_transmission_transmitHttp_receive_setIdentity(forbidden:boolean):void {
                        if (request.headers["agent-hash"] === undefined) {
                            return;
                        }
                        if (forbidden === true) {
                            serverResponse.setHeader("agent-hash", agent);
                            serverResponse.setHeader("agent-type", agentType);
                        } else {
                            const self:string = (agentType === "device")
                                    ? vars.settings.hashDevice
                                    : vars.settings.hashUser;
                            if (self !== undefined) {
                                host = self;
                                serverResponse.setHeader("agent-hash", self);
                                serverResponse.setHeader("agent-type", agentType);
                            }
                        }
                    },
                    destroy = function terminal_server_transmission_transmitHttp_receive_destroy():void {
                        setIdentity(true);
                        request.destroy({
                            name: "FORBIDDEN",
                            message: `Agent type ${agentType} does not contain agent identity ${agent}.`
                        });
                    },
                    post = function terminal_server_transmission_transmitHttp_receive_post():void {
                        const body:string = chunks.join(""),
                            receivedLength:number = Buffer.byteLength(body),
                            contentLength:number = Number(request.headers["content-length"]),
                            socketData:socketData = JSON.parse(body);
                        if (receivedLength > contentLength) {
                            request.destroy({
                                name: "TOO_LARGE",
                                message: "Request destroyed for size in excess of its content-length header."
                            });
                            return;
                        }
                        setIdentity(false);
                        if (socketData.service === undefined) {
                            request.socket.destroy();
                            serverResponse.socket.destroy();
                        } else {
                            receiver(socketData, {
                                socket: serverResponse,
                                type: "http"
                            });
                            responder({
                                data: null,
                                service: "response-no-action"
                            }, {
                                socket: serverResponse,
                                type: "http"
                            });
                        }
                    },
                    postTest = function terminal_server_transmission_transmitHttp_receive_postTest():boolean {
                        if (
                            request.method === "POST" && 
                            requestType !== undefined && (
                                host === "localhost" || (
                                    host !== "localhost" && (
                                        (vars.settings[agentType] !== undefined && vars.settings[agentType][agent] !== undefined) ||
                                        requestType === "agent-hash" ||
                                        requestType === "invite" ||
                                        vars.test.type.indexOf("browser") === 0
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
                    setTimeout(function terminal_server_transmission_transmitHttp_receive_requestEnd_delay():void {
                        if (postTest() === true) {
                            post();
                        } else {
                            stat(`${vars.path.project}lib${vars.path.sep}settings${vars.path.sep}user.json`, function terminal_server_transmission_transmitHttp_receive_requestEnd_delay_userStat(err:Error):void {
                                if (err === null) {
                                    destroy();
                                }
                            });
                            destroy();
                        }
                    }, 50);
                }
            },
            requestError = function terminal_server_transmission_transmitHttp_receive_requestError(errorMessage:NodeJS.ErrnoException):void {
                const errorString:string = JSON.stringify(errorMessage);
                if (errorMessage.code !== "ETIMEDOUT" && (ended === false || (ended === true && errorString.indexOf("Error: aborted") < 0))) {
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
            responseError = function terminal_server_transmission_transmitHttp_receive_responseError(errorMessage:NodeJS.ErrnoException):void {
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
        request.on("data", function terminal_server_transmission_transmitHttp_receive_onData(data:Buffer):void {
            chunks.push(decoder.write(data));
        });
        request.on("error", requestError);
        serverResponse.on("error", responseError);
        request.on("end", requestEnd);
    },
    request: function terminal_server_transmission_transmitHttp_request(config:config_http_request):void {
        if (vars.settings.secure === false) {
            return;
        }
        const dataString:string = JSON.stringify(config.payload),
            headers:OutgoingHttpHeaders = {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": Buffer.byteLength(dataString),
                "agent-hash": (config.agentType === "device")
                    ? vars.settings.hashDevice
                    : vars.settings.hashUser,
                "agent-name": (config.agentType === "device")
                    ? vars.settings.nameDevice
                    : vars.settings.nameUser,
                "agent-type": config.agentType,
                "request-type": config.payload.service
            },
            payload:RequestOptions = {
                headers: headers,
                host: config.ip,
                method: "POST",
                path: "/",
                port: config.port,
                rejectUnauthorized: false,
                timeout: (config.payload.service === "agent-online")
                    ? 1000
                    : (config.payload.service.indexOf("copy") === 0)
                        ? 7200000
                        : 5000
            },
            errorMessage = function terminal_sever_transmission_transmitHttp_request_errorMessage(type:"request"|"response", errorItem:NodeJS.ErrnoException):string[] {
                const agent:agent = vars.settings[config.agentType][config.agent],
                    errorText:string[] = [`${vars.text.angry}Error on client HTTP ${type} for service:${vars.text.none} ${config.payload.service}`];
                if (agent === undefined) {
                    errorText.push( `Agent data is undefined: agentType - ${config.agentType}, agent - ${config.agent}`);
                    errorText.push("If running remote browser test automation examine the health of the remote agents.");
                } else {
                    errorText.push(`Agent Name: ${agent.name}, Agent Type: ${config.agentType},  Agent ID: ${config.agent}`);
                }
                errorText.push(JSON.stringify(errorItem));
                return errorText;
            },
            requestError = function terminal_server_transmission_transmitHttp_request_requestError(erRequest:NodeJS.ErrnoException):void {
                if (vars.settings.verbose === true && erRequest.code !== "ETIMEDOUT" && erRequest.code !== "ECONNREFUSED") {
                    log(errorMessage("request", erRequest));
                }
            },
            requestCallback = function terminal_server_transmission_transmitHttp_request_requestCallback(fsResponse:IncomingMessage):void {
                const chunks:Buffer[] = [];
                fsResponse.setEncoding("utf8");
                fsResponse.on("data", function terminal_server_transmission_transmitHttp_request_requestCallback_onData(chunk:Buffer):void {
                    chunks.push(chunk);
                });
                fsResponse.on("end", function terminal_server_transmission_transmitHttp_request_requestCallback_onEnd():void {
                    const body:string = (Buffer.isBuffer(chunks[0]) === true)
                        ? Buffer.concat(chunks).toString()
                        : chunks.join("");
                    if (config.callback !== null && body !== "") {
                        config.callback(JSON.parse(body));
                    }
                });
                fsResponse.on("error", function terminal_server_transmission_transmitHttp_request_requestCallback_onError(erResponse:NodeJS.ErrnoException):void {
                    if (erResponse.code !== "ETIMEDOUT") {
                        errorMessage("response", erResponse);
                    }
                });
            },
            fsRequest:ClientRequest = (vars.settings.secure === true)
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
    respond: function terminal_server_transmission_transmitHttp_respond(config:config_http_respond):void {
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
                    contains = function terminal_server_transmission_transmitHttp_respond_contains(input:string):boolean {
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
                if (config.mimeType === "text/html" || config.mimeType === "application/xhtml+xml") {
                    const csp:string = `default-src 'self'; base-uri 'self'; font-src 'self' data:; form-action 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' wss://localhost:${vars.environment.ports.ws}/; frame-ancestors 'none'; media-src 'none'; object-src 'none'; worker-src 'none'; manifest-src 'none'`;
                    config.serverResponse.setHeader("content-security-policy", csp);
                }
                config.serverResponse.setHeader("cache-control", "no-store");
                config.serverResponse.setHeader("strict-transport-security", "max-age=63072000");
                config.serverResponse.setHeader("alt-svc", "clear");
                config.serverResponse.setHeader("connection", "keep-alive");
                config.serverResponse.setHeader("content-length", Buffer.byteLength(config.message));
                config.serverResponse.setHeader("referrer-policy", "no-referrer");
                config.serverResponse.setHeader("response-type", config.responseType);
                config.serverResponse.setHeader("x-content-type-options", "nosniff");
                config.serverResponse.writeHead(status, {"content-type": type});
                readStream.pipe(config.serverResponse);
                // pipe will automatically close the serverResponse at stream end
            }
        }
    },
    respondEmpty: function terminal_server_transmission_transmitHttp_respondEmpty(transmit:transmit):void {
        if (transmit.type === "http") {
            transmit_http.respond({
                message: "",
                mimeType: "text/plain",
                responseType: "response-no-action",
                serverResponse: transmit.socket as ServerResponse
            });
        }
    },
    server: function terminal_server_transmission_transmitHttp_server(serverOptions:config_http_server, serverCallback:serverCallback):void {
        // at this time the serverCallback argument is only used by test automation and so its availability
        // * locks the server to address ::1 (loopback)
        // * bypasses messaging users on server start up
        // * bypasses some security checks
        let portWeb:number,
            portWs:number,
            tlsOptions:tlsOptions = {
                options: {
                    ca: "",
                    cert: "",
                    key: ""
                },
                fileFlag: {
                    ca: false,
                    crt: false,
                    key: false
                }
            },
            portString:string = "",
            certLogs:string[] = null;
        const scheme:string = (vars.settings.secure === true)
                ? "https"
                : "http",
            browser = function terminal_server_transmission_transmitHttp_server_browser(server:Server):void {
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
                    const browserCommand:string = `${vars.terminal.executionKeyword} ${scheme}://localhost${portString}/`;
                    exec(browserCommand, {cwd: vars.terminal.cwd}, function terminal_server_transmission_transmitHttp_server_browser_child(errs:Error, stdout:string, stdError:Buffer | string):void {
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
            port:number = (function terminal_server_transmission_transmitHttp_server_port():number {
                if (serverOptions.port > -1) {
                    return serverOptions.port;
                }
                return (vars.test.type === "service" || vars.test.type === "browser_self" )
                    ? 0
                    : (vars.settings.secure === true)
                        ? 443
                        : 80;
            }()),
            start = function terminal_server_transmission_transmitHttp_server_start(server:Server):void {
                const serverError = function terminal_server_transmission_transmitHttp_server_start_serverError(errorMessage:NetworkError):void {
                        if (errorMessage.code === "EADDRINUSE") {
                            error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`], true);
                        } else if (errorMessage.code === "EACCES" && process.platform === "linux" && errorMessage.syscall === "listen" && errorMessage.port < 1025) {
                            error([
                                errorMessage.toString(),
                                `${vars.text.angry}Restricted access to reserved port.${vars.text.none}`,
                                "Run the build against with option force_port:",
                                `${vars.text.cyan + vars.terminal.command_instruction} build force_port${vars.text.none}`
                            ]);
                        } else if (errorMessage.code !== "ETIMEDOUT") {
                            error([errorMessage.toString()]);
                        }
                    },
                    ipList = function terminal_server_transmission_transmitHttp_server_start_ipList(callback:(ip:string) => void):void {
                        const addresses = function terminal_server_transmission_transmitHttp_server_start_ipList_addresses(ipType:"IPv4"|"IPv6"):void {
                            let a:number = vars.environment.addresses[ipType].length;
                            if (a > 0) {
                                do {
                                    a = a - 1;
                                    callback(vars.environment.addresses[ipType][a]);
                                } while (a > 0);
                            }
                        };
                        addresses("IPv6");
                        addresses("IPv4");
                    },
                    logOutput = function terminal_server_transmission_transmitHttp_server_start_logOutput():void {
                        const output:string[] = [],
                            section = function terminal_server_transmission_transmitHttp_server_start_logOutput_section(text:string[], color:string):void {
                                output.push(`${vars.text.angry}*${vars.text.none} ${vars.text.underline + text[0] + vars.text.none}`);
                                if (text.length < 3) {
                                    if (color === "white") {
                                        output.push(`  ${text[1]}`);
                                    } else {
                                        output.push(`  ${vars.text[color] + text[1] + vars.text.none}`);
                                    }
                                } else {
                                    const total:number = text.length;
                                    let index:number = 1;
                                    do {
                                        output.push(`   ${vars.text.angry}-${vars.text.none} ${text[index]}`);
                                        index = index + 1;
                                    } while (index < total);
                                }
                                output.push("");
                            };
    
                        // exclude from tests except for browser tests
                        if (vars.test.type === "browser_remote" || vars.test.type === "") {
                            const networkList:string[] = [
                                    "Network Addresses"
                                ],
                                certificateList:string[] = [
                                    "Certificate Logs"
                                ],
                                secureList:string[] = [
                                    "Security Posture"
                                ];
                            section([
                                "Project Location",
                                vars.path.project
                            ], "cyan");

                            ipList(function terminal_server_transmission_transmitHttp_server_start_logOutput_ipList(ip:string):void {
                                networkList.push(ip);
                            });
                            section(networkList, "white");

                            section([
                                "Ports",
                                `HTTP server: ${vars.text.bold + vars.text.green + portWeb + vars.text.none}`,
                                `Web Sockets: ${vars.text.bold + vars.text.green + portWs + vars.text.none}`
                            ], "white");

                            if (vars.settings.secure === true) {
                                secureList.push(`${vars.text.bold + vars.text.green}Secure${vars.text.none} - Protocols: https, wss`);
                            } else {
                                secureList.push(`${vars.text.angry}Insecure${vars.text.none} - Protocols: http, ws`);
                                secureList.push("Insecure mode is for local testing only and prevents communication to remote agents.");
                            }
                            section(secureList, "white");

                            section([
                                "Web Page Address",
                                `${scheme}://localhost${portString}`
                            ], "cyan");

                            if (certLogs !== null) {
                                certLogs.forEach(function terminal_server_transmission_transmitHttp_server_start_logOutput_certLogs(value:string):void {
                                    certificateList.push(value);
                                });
                                section(certificateList, "white");
                            }

                            section([
                                "Text Message Count",
                                common.commas(vars.settings.message.length)
                            ], "white");

                            section([
                                "Verbose Messaging",
                                (vars.settings.verbose)
                                    ? `${vars.text.green + vars.text.bold}On${vars.text.none} - will display network messaging data`
                                    : `${vars.text.angry}Off${vars.text.none} (default)`,
                                "Activated with option 'verbose'.",
                                `Command example: ${vars.text.green + vars.terminal.command_instruction}verbose${vars.text.none}`
                            ], "white");

                            section([
                                "Interactive Documentation from Terminal",
                                `Command example: ${vars.text.green + vars.terminal.command_instruction}commands${vars.text.none}`
                            ], "white");

                            if (vars.test.type !== "browser_remote") {
                                log.title("Local Server");
                            }
                            log(output, true);
                        }
                        browser(server);
                    },
                    listen = function terminal_server_transmission_transmitHttp_server_start_listen():void {
                        const serverAddress:AddressInfo = server.address() as AddressInfo;
                        transmit_ws.server({
                            address: "",
                            callback: function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback(addressInfo:AddressInfo):void {
                                portWs = addressInfo.port;
                                vars.environment.ports.ws = addressInfo.port;
                                if (vars.test.type === "service") {
                                    logOutput();
                                } else {
                                    readStorage(function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete(settings:settingsItems):void {
                                        vars.settings.brotli = settings.configuration.brotli;
                                        vars.settings.device = settings.device;
                                        vars.settings.hashDevice = settings.configuration.hashDevice;
                                        vars.settings.hashType = settings.configuration.hashType;
                                        vars.settings.hashUser = settings.configuration.hashUser;
                                        vars.settings.message = settings.message;
                                        vars.settings.nameDevice = settings.configuration.nameDevice;
                                        vars.settings.nameUser = settings.configuration.nameUser;
                                        vars.settings.user = settings.user;

                                        if (vars.settings.hashDevice === "") {
                                            const input:config_command_hash = {
                                                algorithm: "sha3-512",
                                                callback: function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_hash(output:hashOutput):void {
                                                    vars.settings.hashDevice = output.hash;
                                                    logOutput();
                                                },
                                                directInput: true,
                                                source: process.release.libUrl + JSON.stringify(process.env) + process.hrtime.bigint().toString()
                                            };
                                            hash(input);
                                        } else {
                                            if (vars.test.type === "" && vars.settings.device[vars.settings.hashDevice] !== undefined) {
                                                // open sockets and let everybody know this agent was offline but is now active
                                                const agent = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_agent(type:agentType, agent:string):void {
                                                        transmit_ws.clientList[type][agent] = null;
                                                        transmit_ws.open({
                                                            agent: agent,
                                                            agentType: type,
                                                            callback: null
                                                        });
                                                        
                                                        count = count + 1;
                                                        if (count === agents) {
                                                            setTimeout(function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_agent_statusDelay():void {
                                                                agent_status({
                                                                    data: {
                                                                        agent: vars.settings.hashDevice,
                                                                        agentType: "device",
                                                                        broadcast: true,
                                                                        respond: false,
                                                                        status: "active"
                                                                    },
                                                                    service: "agent-status"
                                                                });
                                                            }, 200);
                                                        }
                                                    },
                                                    list = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_list(type:agentType):void {
                                                        const keys:string[] = Object.keys(vars.settings[type]);
                                                        let a:number = keys.length;
                                                        if (a > 0) {
                                                            do {
                                                                a = a - 1;
                                                                if (type !== "device" || (type === "device" && keys[a] !== vars.settings.hashDevice)) {
                                                                    agent(type, keys[a]);
                                                                }
                                                            } while (a > 0);
                                                        }
                                                    },
                                                    agents:number = Object.keys(vars.settings.user).length + (Object.keys(vars.settings.device).length - 1);
                                                let count:number = 0;

                                                if (vars.settings.secure === true) {
                                                    list("device");
                                                    list("user");
                                                }
                                                logOutput();
                    
                                                vars.settings.device[vars.settings.hashDevice].ports = vars.environment.ports;
                                            } else {
                                                logOutput();
                                            }
                                        }
                                    });
                                }
                            },
                            options: tlsOptions,
                            port: (port === 0)
                                ? 0
                                : serverAddress.port + 1
                        });
                        vars.environment.ports.http = serverAddress.port;
                        portWeb = serverAddress.port;
                        portString = (vars.settings.secure === true)
                            ? (portWeb === 443)
                                ? ""
                                : `:${portWeb}`
                            : (portWeb === 80)
                                ? ""
                                : `:${portWeb}`;
                    };
    
                if (process.cwd() !== vars.path.project) {
                    process.chdir(vars.path.project);
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
            vars.path.settings = `${vars.path.project}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}storageBrowser${vars.path.sep}`;
        }
        if (isNaN(serverOptions.port) === true || serverOptions.port < 0 || serverOptions.port > 65535) {
            serverOptions.port = -1;
        } else {
            serverOptions.port = Math.floor(serverOptions.port);
        }
        if (serverCallback === undefined) {
            serverCallback = null;
        }
        if (vars.settings.secure === true) {
            readCerts(function terminal_server_transmission_transmitHttp_server_readCerts(options:tlsOptions, logs:string[]):void {
                certLogs = logs;
                tlsOptions = options;
                start(httpsServer(tlsOptions.options, transmit_http.receive));
            });
        } else {
            start(httpServer(transmit_http.receive));
        }
    }
};

export default transmit_http;