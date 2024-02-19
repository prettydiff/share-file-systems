
/* lib/terminal/server/transmission/transmit_http - This library launches the HTTP service and all supporting service utilities. */

import agent_management from "../services/agent_management.js";
import common from "../../../common/common.js";
import mask from "../../utilities/mask.js";
import error from "../../utilities/error.js";
import hash from "../../commands/library/hash.js";
import ipList from "../../utilities/ipList.js";
import log from "../../utilities/log.js";
import network from "./network.js";
import node from "../../utilities/node.js";
import readCerts from "../readCerts.js";
import readStorage from "../../utilities/readStorage.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

// cspell:words brotli, nofollow, nosniff, storagetest

/**
 * The HTTP library.
 * ```typescript
 * interface transmit_http {
 *     get         : (request:node_http_IncomingMessage, serverResponse:httpSocket_response) => void;      // Respond to HTTP GET requests.
 *     receive     : (request:node_http_IncomingMessage, serverResponse:node_http_ServerResponse) => void; // Processes incoming HTTP requests.
 *     request     : (config:config_http_request) => void;                                                 // Send an arbitrary HTTP request.
 *     respond     : (config:config_http_respond, get:boolean, url:string) => void;                        // Formats and sends HTTP response messages.
 *     respondEmpty: (transmit:transmit_type)                                                              // Responds to a request with an empty response payload.
 *     server      : (serverOptions:config_http_server, serverCallback:http_server_callback) => void;      // Creates an HTTP server.
 * }
 * ``` */
const transmit_http:module_transmit_http = {
    get: function terminal_server_transmission_transmitHttp_get(request:node_http_IncomingMessage, serverResponse:httpSocket_response):void {
        const quest:number = request.url.indexOf("?"),
            uri:string = (quest > 0)
                ? request.url.slice(0, quest)
                : request.url,
            localPath:string = (uri === "/")
                ? "/"
                : vars.path.project + uri.slice(1).replace(/\/$/, "").replace(/\//g, vars.path.sep);
        if (localPath === "/") {
            const appliedData = function terminal_server_transmission_transmitHttp_get_appliedData(settingsData:state_storage):void {
                settingsData.queue = null;
                if (settingsData.identity.hashDevice === "") {
                    settingsData.identity.hashDevice = vars.identity.hashDevice;
                } else {
                    common.agents({
                        countBy: "agent",
                        perAgent: function terminal_server_transmission_transmitHttp_get_appliedData_perAgent(agentNames:agentNames):void {
                            if (agentNames.agentType === "user" || (agentNames.agentType === "device" && agentNames.agent !== vars.identity.hashDevice)) {
                                settingsData.agents[agentNames.agentType][agentNames.agent].status = vars.agents[agentNames.agentType][agentNames.agent].status;
                            }
                        },
                        source: vars
                    });
                }
                const state:stateData = {
                        name: vars.environment.name,
                        network: {
                            addresses: vars.network.addresses,
                            port: vars.network.port
                        },
                        settings: settingsData,
                        "socket-map": transmit_ws.socketMap,
                        test: (vars.test.browser !== null && request.url.indexOf("?test_browser") > 0)
                            ? vars.test.browser
                            : null
                    },
                    storageString:string = `<input type="hidden" value='${JSON.stringify(state).replace(/'/g, "&#39;")}'/>`,
                    login:string = (settingsData.identity.nameDevice === "")
                        ? " login"
                        : "",
                    pageApplication:string = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8"/>
        <title>${vars.environment.name}</title>
        <meta content="text/html" http-equiv="Content-Type"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <meta content="noindex, nofollow" name="robots"/>
        <meta content="${vars.environment.name}" name="DC.title"/>
        <meta content="#fff" name="theme-color"/>
        <meta content="" name="description"/>
        <meta content="Global" name="distribution"/>
        <meta content="en" http-equiv="Content-Language"/>
        <meta content="blendTrans(Duration=0)" http-equiv="Page-Enter"/>
        <meta content="blendTrans(Duration=0)" http-equiv="Page-Exit"/>
        <meta content="text/css" http-equiv="content-style-type"/>
        <meta content="application/javascript" http-equiv="content-script-type"/>
        <meta content="#bbbbff" name="msapplication-TileColor"/>
        <link href="lib/css/bundle.css" media="all" rel="stylesheet" type="text/css"/>
        <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgo="/>
    </head>
    <body class="${vars.settings.ui.color + login}">
        ${storageString}
        <div id="spaces">
            <div id="login">
                <h1>${vars.environment.name} <span class="application-version">version ${vars.environment.version}</span></h1>
                <p><label for="login-user">Provide a Username</label> <input type="text" id="login-user"/></p>
                <p><label for="login-device">Provide a Name for this Computer/Device</label> <input type="text" id="login-device"/></p>
                <p><button type="button">✓ Confirm</button></p>
            </div>
            <div id="title-bar">
                <button type="button" id="menuToggle" title="Application Menu">&#9776;<span>Application Menu</span></button>
                <button type="button" id="fullscreen" title="Toggle Fullscreen">&#9974;<span>Toggle Fullscreen</span></button>
                <h1>${vars.environment.name} <span class="application-version">version ${vars.environment.version}</span></h1>
                <p>A tool for interactive collaboration.</p>
            </div>
            <ul id="menu"></ul>
            <div id="content-area">
                <div id="agentList">
                    <p class="sockets"><button type="button">🖧 Open Sockets</button></p>
                    <p class="all-shares"><button type="button">⌘ All Shares</button></p>
                    <div id="device"><h2>Device List</h2><ul><li><button type="button" class="device-all-shares">🖳 All Device Shares</button></li></ul><span></span></div>
                    <div id="user"><h2>User List</h2><ul><li><button type="button" class="user-all-shares">👤 All User Shares</button></li></ul><span></span></div>
                </div>
                <div id="tray"><button type="button" id="minimize-all" title="Minimize all modals">⇊ <span>Minimize all modals</span></button><ul></ul></div>
                <p id="message-update" role="status" aria-live="polite"></p>
            </div>
        </div>
        <script type="module" src="js/lib/browser/bundle.js"></script>
    </body>
</html>`;
                if (vars.test.browser !== null) {
                    if (vars.test.browser.index > 0) {
                        vars.test.browser.action = "nothing";
                    } else {
                        vars.test.browser.action = "reset";
                    }
                    vars.test.browser.test = null;
                }
                transmit_http.respond({
                    message: pageApplication,
                    mimeType: "text/html",
                    responseType: "GET",
                    serverResponse: serverResponse
                }, true, request.url);
            };
            readStorage(false, appliedData);
        } else {
            node.fs.stat(localPath, function terminal_server_transmission_transmitHttp_get_stat(ers:node_error, stat:node_fs_Stats):void {
                const random:number = Math.random();
                if (request.url.indexOf("favicon.ico") < 0 && request.url.indexOf("images/apple") < 0) {
                    const page:string = [
                        `<!DOCTYPE html><html lang="en"><head><title>${vars.environment.name}</title><meta content="width=device-width, initial-scale=1" name="viewport"/><meta content="index, follow" name="robots"/><meta content="#fff" name="theme-color"/><meta content="en" http-equiv="Content-Language"/><meta content="text/html;charset=UTF-8" http-equiv="Content-Type"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Enter"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Exit"/><meta content="text/css" http-equiv="content-style-type"/><meta content="application/javascript" http-equiv="content-script-type"/><meta content="#bbbbff" name="msapplication-TileColor"/></head><body>`,
                        `<h1>${vars.environment.name}</h1><div class="section">insertMe</div></body></html>`
                    ].join("");
                    if (ers === null) {
                        if (stat.isDirectory() === true) {
                            node.fs.readdir(localPath, function terminal_server_transmission_transmitHttp_get_stat_dir(erd:node_error, list:string[]) {
                                const dirList:string[] = [`<p>directory of ${localPath}</p> <ul>`];
                                if (erd !== null) {
                                    error([`Error reading directory of ${localPath}`], erd);
                                    return;
                                }
                                list.forEach(function terminal_server_transmission_transmitHttp_get_stat_dir_list(value:string) {
                                    if ((/\.x?html?$/).test(value.toLowerCase()) === true) {
                                        dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}">${value}</a></li>`);
                                    } else {
                                        dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}?${random}">${value}</a></li>`);
                                    }
                                });
                                dirList.push("</ul>");
                                transmit_http.respond({
                                    message: page.replace("insertMe", dirList.join("")),
                                    mimeType: "text/html",
                                    responseType: "GET",
                                    serverResponse: serverResponse
                                }, true, request.url);
                            });
                            return;
                        }
                        if (stat.isFile() === true) {
                            const dataStore:Buffer[] = [],
                                readCallback = function terminal_server_transmission_transmitHttp_get_readCallback():void {
                                    let type:mimeType;
                                    if (localPath.indexOf(".js") === localPath.length - 3) {
                                        type = "application/javascript";
                                    } else if (localPath.indexOf(".css") === localPath.length - 4) {
                                        type = "text/css";
                                    } else if (localPath.indexOf(".jpg") === localPath.length - 4) {
                                        type = "image/jpeg";
                                    } else if (localPath.indexOf(".png") === localPath.length - 4) {
                                        type = "image/png";
                                    } else if (localPath.indexOf(".svg") === localPath.length - 4) {
                                        type = "image/svg+xml";
                                    } else {
                                        type = "text/html";
                                    }
                                    transmit_http.respond({
                                        message: Buffer.concat(dataStore),
                                        mimeType: type,
                                        responseType: "GET",
                                        serverResponse: serverResponse
                                    }, true, request.url);
                                },
                                readStream:node_fs_ReadStream = node.fs.createReadStream(localPath);
                            readStream.on("data", function terminal_server_transmission_transmitHttp_get_readData(chunk:Buffer):void {
                                dataStore.push(chunk);
                            });
                            readStream.on("end", readCallback);
                        } else {
                            serverResponse.end();
                        }
                    } else {
                        if (ers.code === "ENOENT") {
                            log([`${vars.text.angry}404${vars.text.none} for ${uri}`]);
                            transmit_http.respond({
                                message: page.replace("insertMe", `<p>HTTP 404: ${uri}</p>`),
                                mimeType: "text/html",
                                responseType: "GET",
                                serverResponse: serverResponse
                            }, true, request.url);
                        } else {
                            error([`Error on stat of ${localPath}`], ers);
                        }
                    }
                }
            });
        }
    },
    receive: function terminal_server_transmission_transmitHttp_receive(request:node_http_IncomingMessage, serverResponse:node_http_ServerResponse):void {
        let ended:boolean = false,
            host:string = (function terminal_server_transmission_transmitHttp_receive_host():string {
                const name:string = request.headers.host.split("[")[0].split(":")[0];
                if (name === undefined) {
                    return "";
                }
                if (vars.network.domain.indexOf(name) > -1 || request.headers.host.indexOf("::1") > -1 || request.headers.host.indexOf("0:0:0:0:0:0:0:1") > -1 || name === "127.0.0.1") {
                    return "local";
                }
                return request.headers.host;
            }());
        const chunks:string[] = [],
            decoder:node_stringDecoder_StringDecoder = new node.stringDecoder.StringDecoder("utf8"),
            agentType:agentType = request.headers["agent-type"] as agentType,
            agent:string = request.headers["agent-hash"] as string,
            requestEnd = function terminal_server_transmission_transmitHttp_receive_requestEnd():void {
                const requestType:string = (request.method === "GET") ? "GET" : request.headers["request-type"] as service_type,
                    response:httpSocket_response = serverResponse as httpSocket_response,
                    body:string = chunks.join(""),
                    receivedLength:number = Buffer.byteLength(body),
                    contentLength:number = Number(request.headers["content-length"]),
                    setIdentity = function terminal_server_transmission_transmitHttp_receive_setIdentity(forbidden:boolean):void {
                        if (request.headers["agent-hash"] === undefined) {
                            return;
                        }
                        if (forbidden === true) {
                            serverResponse.setHeader("agent-hash", agent);
                            serverResponse.setHeader("agent-type", agentType);
                        } else {
                            const self:string = (agentType === "device")
                                    ? vars.identity.hashDevice
                                    : vars.identity.hashUser;
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
                        const socketData:socketData = JSON.parse(body) as socketData;
                        network.logger({
                            direction: "receive",
                            size: receivedLength,
                            socketData: socketData,
                            transmit: {
                                socket: serverResponse as httpSocket_response,
                                type: "http"
                            }
                        });
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
                            network.receiver(socketData, {
                                socket: response,
                                type: "http"
                            });
                            if (socketData.service !== "copy-send-file") {
                                network.responder({
                                    data: null,
                                    service: "response-no-action"
                                }, {
                                    socket: response,
                                    type: "http"
                                });
                            }
                        }
                    },
                    postTest = function terminal_server_transmission_transmitHttp_receive_postTest(device:string, agency:boolean):void {
                        const test = function terminal_server_transmission_transmitHttp_receive_postTest_test():boolean {
                            if (
                                request.method === "POST" &&
                                requestType !== undefined && (
                                    host === "local" || (
                                        host !== "local" && (
                                            (vars.agents[agentType] !== undefined && (
                                                (agency === true && vars.agents[agentType][device] !== undefined) ||
                                                (agency === false && device === vars.identity.hashDevice)
                                            )) ||
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
                        if (test() === true) {
                            post();
                        } else {
                            // the delay is necessary to prevent a race condition between service execution and data settings writing
                            setTimeout(function terminal_server_transmission_transmitHttp_receive_requestEnd_delay():void {
                                if (test() === true) {
                                    post();
                                } else {
                                    node.fs.stat(`${vars.path.project}lib${vars.path.sep}settings${vars.path.sep}user.json`, function terminal_server_transmission_transmitHttp_receive_requestEnd_delay_userStat(err:node_error):void {
                                        if (err === null) {
                                            destroy();
                                        }
                                    });
                                    destroy();
                                }
                            }, 50);
                        }
                    };
                response.hash = agent;
                response.type = agentType;
                ended = true;
                if (host === "") {
                    destroy();
                } else if (request.method === "GET") {
                    if (host === "local") {
                        setIdentity(true);
                        transmit_http.get(request, response);
                    } else {
                        destroy();
                    }
                } else if (agent.length === 141 && requestType === "copy-send-file") {
                    mask.unmaskDevice(agent, function terminal_server_transmission_transmitHttp_receive_unmask(device:string):void {
                        postTest(device, false);
                    });
                } else {
                    postTest(agent, true);
                }
            },
            requestError = function terminal_server_transmission_transmitHttp_receive_requestError(errorMessage:node_error):void {
                const errorString:string = JSON.stringify(errorMessage);
                if (errorMessage.code !== "ETIMEDOUT" && (ended === false || (ended === true && errorString.indexOf("Error: aborted") < 0))) {
                    const body:string = chunks.join("");
                    log([
                        `${vars.text.cyan}HTTP POST request, type: ${String(request.headers["request-type"]) + vars.text.none}`,
                        body.slice(0, 1024),
                        "",
                        `body length: ${body.length}`,
                        vars.text.angry + errorString + vars.text.none,
                        "",
                        ""
                    ]);
                }
            },
            responseError = function terminal_server_transmission_transmitHttp_receive_responseError(errorMessage:node_error):void {
                if (errorMessage.code !== "ETIMEDOUT") {
                    const body:string = chunks.join("");
                    log([
                        `${vars.text.cyan}HTTP POST response, type: ${String(request.headers["request-type"]) + vars.text.none}`,
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

        // request handling
        request.on("data", function terminal_server_transmission_transmitHttp_receive_onData(data:Buffer):void {
            chunks.push(decoder.write(data));
        });
        request.on("error", requestError);
        serverResponse.on("error", responseError);
        request.on("end", requestEnd);
    },
    request: function terminal_server_transmission_transmitHttp_request(config:config_http_request):void {
        if (config.ip === "") {
            // an empty string defaults to loopback, which creates an endless feedback loop
            return;
        }
        if (vars.settings.secure === true || vars.test.type.indexOf("browser_") === 0) {
            const dataString:string = JSON.stringify(config.payload),
                headers:node_http_OutgoingHttpHeaders = {
                    "content-type": "application/x-www-form-urlencoded",
                    "content-length": Buffer.byteLength(dataString).toString(),
                    "agent-hash": (config.agentType === "device")
                        ? vars.identity.hashDevice
                        : vars.identity.hashUser,
                    "agent-name": (config.agentType === "device")
                        ? vars.identity.nameDevice
                        : vars.identity.nameUser,
                    "agent-type": config.agentType,
                    "request-type": config.payload.service
                },
                payload:node_https_RequestOptions = {
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
                errorMessage = function terminal_sever_transmission_transmitHttp_request_errorMessage(type:"request"|"response", errorItem:node_error):string[] {
                    const agent:agent = vars.agents[config.agentType][config.agent],
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
                requestError = function terminal_server_transmission_transmitHttp_request_requestError(erRequest:node_error):void {
                    if (vars.settings.verbose === true || vars.test.type.indexOf("browser") > -1) {
                        log(errorMessage("request", erRequest));
                    }
                },
                requestCallback = function terminal_server_transmission_transmitHttp_request_requestCallback(fsResponse:node_http_IncomingMessage):void {
                    if (config.stream === true) {
                        config.callback(config.payload, fsResponse);
                    } else {
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
                                config.callback(JSON.parse(body) as socketData, fsResponse);
                            }
                        });
                        fsResponse.on("error", function terminal_server_transmission_transmitHttp_request_requestCallback_onError(erResponse:node_error):void {
                            if (erResponse.code !== "ETIMEDOUT") {
                                errorMessage("response", erResponse);
                            }
                        });
                    }
                },
                fsRequest:httpSocket_request = (vars.settings.secure === true)
                    ? node.https.request(payload, requestCallback) as httpSocket_request
                    : node.http.request(payload, requestCallback) as httpSocket_request;
            if (fsRequest.writableEnded === true) {
                error([
                    "Attempt to write to HTTP request after end:",
                    dataString
                ], null);
            } else {
                fsRequest.hash = config.agent;
                fsRequest.type = config.agentType;
                network.logger({
                    direction: "send",
                    size: dataString.length,
                    socketData: config.payload,
                    transmit: {
                        socket: fsRequest,
                        type: "http"
                    }
                });
                fsRequest.on("error", requestError);
                fsRequest.write(dataString);
                fsRequest.end();
            }
        }
    },
    respond: function terminal_server_transmission_transmitHttp_respond(config:config_http_respond, get:boolean, url:string):void {
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
                error(message, null);
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
                    headers:[string, string][] = [
                        ["cache-control", "no-store"],
                        ["strict-transport-security", "max-age=63072000"],
                        ["alt-svc", "clear"],
                        ["connection", "keep-alive"],
                        ["content-length", Buffer.byteLength(config.message).toString()],
                        ["referrer-policy", "no-referrer"],
                        ["response-type", config.responseType],
                        ["x-content-type-options", "nosniff"]
                    ],
                    readStream:node_stream_Readable = node.stream.Readable.from(config.message),
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
                let status:number,
                    size:number = config.message.length + 11;
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
                    const protocol:"ws"|"wss" = (vars.settings.secure === true)
                            ? "wss"
                            : "ws",
                        csp:string = `default-src 'self'; base-uri 'self'; font-src 'self' data:; form-action 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ${protocol}://localhost:${vars.network.port}/; frame-ancestors 'none'; media-src 'none'; object-src 'none'; worker-src 'none'; manifest-src 'none'`;
                    headers.push(["content-security-policy", csp]);
                }
                headers.forEach(function terminal_server_transmission_transmitHttp_respond_headersEach(header:[string, string]):void {
                    config.serverResponse.setHeader(header[0], header[1]);
                    size = size + header.join("").length + 2;
                });
                config.serverResponse.writeHead(status, {"content-type": type});
                network.logger({
                    direction: "send",
                    size: size,
                    socketData: {
                        data: (get === true)
                            ? url
                            : config.message,
                        service: (get === true)
                            ? "GET"
                            : config.responseType
                    },
                    transmit: {
                        socket: config.serverResponse,
                        type: "http"
                    }
                });
                // pipe will automatically close the serverResponse at stream end
                readStream.pipe(config.serverResponse);
            }
        }
    },
    respondEmpty: function terminal_server_transmission_transmitHttp_respondEmpty(transmit:transmit_type):void {
        const http:httpSocket_request = transmit.socket as httpSocket_request;
        if (transmit.type === "http" && http.writableEnded === false) {
            transmit_http.respond({
                message: "",
                mimeType: "text/plain",
                responseType: "response-no-action",
                serverResponse: transmit.socket as httpSocket_response
            }, false, "");
        }
    },
    server: function terminal_server_transmission_transmitHttp_server(serverOptions:config_service, serverCallback:service_callback):void {
        // at this time the serverCallback argument is only used by test automation and so its availability
        // * locks the server to address ::1 (loopback)
        // * bypasses messaging users on server start up
        // * bypasses some security checks
        let portWeb:number,
            portWs:number,
            tlsOptions:transmit_tlsOptions = {
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
            portString:string = "";
        const scheme:string = (vars.settings.secure === true)
                ? "https"
                : "http",
            browser = function terminal_server_transmission_transmitHttp_server_browser(server:node_http_Server, startupLog:string[]):void {
                // open a browser from the command line
                if (serverCallback !== null) {
                    serverCallback.callback({
                        agent: serverCallback.agent,
                        agentType: serverCallback.agentType,
                        log: startupLog,
                        port: 0,
                        server: server
                    });
                }
                if (serverOptions.browser === true) {
                    const browserCommand:string = `${vars.terminal.executionKeyword} ${scheme}://${vars.network.domain[0] + portString}/`;
                    node.child_process.exec(browserCommand, {cwd: vars.terminal.cwd}, function terminal_server_transmission_transmitHttp_server_browser_child(errs:node_childProcess_ExecException, stdout:string, stdError:Buffer | string):void {
                        if (errs !== null) {
                            error([], errs);
                            return;
                        }
                        if (stdError !== "") {
                            error([
                                "Unexpected data written to stderr when opening browser:",
                                stdError.toString()
                            ], null);
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
            start = function terminal_server_transmission_transmitHttp_server_start(server:node_http_Server):void {
                const serverError = function terminal_server_transmission_transmitHttp_server_start_serverError(errorMessage:NetworkError):void {
                        if (errorMessage.code === "EADDRINUSE") {
                            error([`Specified port, ${vars.text.cyan + String(port) + vars.text.none}, is in use!`], null, true);
                        } else if (errorMessage.code === "EACCES" && process.platform === "linux" && errorMessage.syscall === "listen" && errorMessage.port < 1025) {
                            error([
                                `${vars.text.angry}Restricted access to reserved port.${vars.text.none}`,
                                "Run the build against with option force_port:",
                                `${vars.text.cyan + vars.terminal.command_instruction}build force_port${vars.text.none}`
                            ], errorMessage);
                        } else if (errorMessage.code !== "ETIMEDOUT") {
                            error(["Error from HTTP server."], errorMessage);
                        }
                    },
                    listen = function terminal_server_transmission_transmitHttp_server_start_listen():void {
                        const serverAddress:node_net_AddressInfo = server.address() as node_net_AddressInfo;
                        transmit_ws.server({
                            callback: function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback(addressInfo:node_net_AddressInfo):void {
                                const logOutput = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_logOutput():void {
                                    const output:string[] = [],
                                        section = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_logOutput_section(text:string[], color:string):void {
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
                                        const networkList:string[] = ipList(vars.agents.device[vars.identity.hashDevice], false, ""),
                                            domainList:string[] = [
                                                "Web Page Addresses"
                                            ],
                                            secureList:string[] = [
                                                "Security Posture"
                                            ];
                                        section([
                                            "Project Location",
                                            vars.path.project
                                        ], "cyan");

                                        networkList.splice(0, 0, "Network Addresses");
                                        section(networkList, "white");

                                        section([
                                            "Ports",
                                            `HTTP server: ${vars.text.bold + vars.text.green + String(portWeb) + vars.text.none}`,
                                            `Web Sockets: ${vars.text.bold + vars.text.green + String(portWs) + vars.text.none}`
                                        ], "white");

                                        if (vars.settings.secure === true) {
                                            secureList.push(`${vars.text.bold + vars.text.green}Secure${vars.text.none} - Protocols: https, wss`);
                                        } else {
                                            secureList.push(`${vars.text.angry}Insecure${vars.text.none} - Protocols: http, ws`);
                                            secureList.push("Insecure mode is for local testing only and prevents communication to remote agents.");
                                        }
                                        section(secureList, "white");

                                        vars.network.domain.forEach(function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_logOutput_domainListEach(value:string):void {
                                            domainList.push(`${scheme}://${value + portString}`);
                                        });
                                        section(domainList, "cyan");

                                        section([
                                            "Text Message Count",
                                            common.commas(vars.settings.message.length)
                                        ], "white");

                                        section([
                                            "Process ID",
                                            process.pid.toString()
                                        ], "cyan");

                                        section([
                                            "Node.js Version",
                                            process.version
                                        ], "cyan");

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
                                    }
                                    browser(server, output);
                                };
                                portWs = addressInfo.port;
                                vars.network.port = addressInfo.port;
                                if (vars.test.type === "service" || vars.test.type.indexOf("browser_") === 0) {
                                    logOutput();
                                } else {
                                    readStorage(true, function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete(storage:state_storage):void {
                                        node.fs.stat(storage.ui.storage, function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_storageStat(storageError:node_error):void {
                                            if (storageError === null) {
                                                vars.settings.ui.storage = storage.ui.storage;
                                            }

                                            if (vars.identity.hashDevice === "") {
                                                const input:config_command_hash = {
                                                    algorithm: "sha3-512",
                                                    callback: function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_storageStat_hash(title:string, output:hash_output):void {
                                                        vars.identity.hashDevice = output.hash;
                                                        logOutput();
                                                    },
                                                    digest: "hex",
                                                    directInput: true,
                                                    id: null,
                                                    list: false,
                                                    parent: null,
                                                    source: process.release.libUrl + JSON.stringify(process.env) + process.hrtime.bigint().toString(),
                                                    stat: null
                                                };
                                                hash(input);
                                            } else {
                                                logOutput();
                                                const self:agent = vars.agents.device[vars.identity.hashDevice];
                                                if (self !== undefined) {
                                                    let count:number = 0;
                                                    const keysDevice:string[] = Object.keys(vars.agents.device),
                                                        keysUser:string[] = Object.keys(vars.agents.user),
                                                        totalDevice:number = keysDevice.length,
                                                        totalUser:number = keysUser.length,
                                                        complete = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_storageStat_complete():void {
                                                            count = count + 1;
                                                            if (count === totalDevice + totalUser) {
                                                                if (JSON.stringify(self.ipAll.IPv4.sort()) !== JSON.stringify(vars.network.addresses.IPv4.sort()) || JSON.stringify(self.ipAll.IPv6.sort()) !== JSON.stringify(vars.network.addresses.IPv6.sort())) {
                                                                    self.ipAll.IPv4 = vars.network.addresses.IPv4;
                                                                    self.ipAll.IPv6 = vars.network.addresses.IPv6;
                                                                    const agentManagement:service_agentManagement = {
                                                                        action: "modify",
                                                                        agents: {
                                                                            device: {
                                                                                [vars.identity.hashDevice]: self
                                                                            },
                                                                            user: {}
                                                                        },
                                                                        agentFrom: vars.identity.hashDevice,
                                                                        identity: null
                                                                    };
                                                                    agent_management({
                                                                        data: agentManagement,
                                                                        service: "agent-management"
                                                                    });
                                                                }
                                                            }
                                                        },
                                                        list = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_storageStat_list(type:agentType):void {
                                                            let a:number = (type === "device")
                                                                ? totalDevice
                                                                : totalUser;
                                                            const self:agent = vars.agents.device[vars.identity.hashDevice],
                                                                keys:string[] = (type === "device")
                                                                    ? keysDevice
                                                                    : keysUser;
                                                            if (a > 0) {
                                                                do {
                                                                    a = a - 1;
                                                                    if (type === "device" && keys[a] === vars.identity.hashDevice) {
                                                                        complete();
                                                                    } else if (self.ipAll.IPv4.indexOf(vars.agents[type][keys[a]].ipSelected) > -1 || self.ipAll.IPv6.indexOf(vars.agents[type][keys[a]].ipSelected) > -1) {
                                                                        error([`Selected IP ${vars.agents[type][keys[a]].ipSelected} of ${type} ${keys[a]} is an IP assigned to this local device.`], null);
                                                                        complete();
                                                                    } else {
                                                                        vars.agents[type][keys[a]].status = "offline";
                                                                        transmit_ws.open.agent({
                                                                            agent: keys[a],
                                                                            agentType: type,
                                                                            callback: complete
                                                                        });
                                                                    }
                                                                } while (a > 0);
                                                            }
                                                        };
                                                    if (vars.settings.secure === true) {
                                                        self.port = vars.network.port;
                                                        list("device");
                                                        list("user");
                                                    }
                                                }
                                            }
                                        });
                                    });
                                }
                            },
                            host: "",
                            options: tlsOptions,
                            port: (port === 0)
                                ? 0
                                : serverAddress.port + 1
                        });
                        vars.network.port = serverAddress.port;
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
            vars.path.settings = `${vars.path.project}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}storageTest${vars.path.sep}temp${vars.path.sep}`;
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
            readCerts(function terminal_server_transmission_transmitHttp_server_readCerts(options:transmit_tlsOptions):void {
                tlsOptions = options;
                start(node.https.createServer(tlsOptions.options, transmit_http.receive));
            });
        } else {
            start(node.http.createServer(transmit_http.receive));
        }
    }
};

export default transmit_http;