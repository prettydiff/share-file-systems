
/* lib/terminal/server/httpClient - A library for handling all child HTTP requests. */
import {ClientRequest, IncomingMessage, OutgoingHttpHeaders, RequestOptions} from "http";

import forbiddenUser from "./forbiddenUser.js";
import response from "./response.js";
import serverVars from "./serverVars.js";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

const httpClient = function terminal_server_httpClient(config:httpConfiguration):void {
    if (config.response === undefined) {
        error([
            "config.response of httpClient is undefined.",
            JSON.stringify(config)
        ]);
        return;
    }
    const callback: Function = (config.callbackType === "object")
            ? config.callback
            : function terminal_server_httpClient_callback(fsResponse:IncomingMessage):void {
                const chunks:Buffer[] = [];
                fsResponse.setEncoding("utf8");
                fsResponse.on("data", function terminal_server_httpClient_data(chunk:Buffer):void {
                    chunks.push(chunk);
                });
                fsResponse.on("end", function terminal_server_httpClient_end():void {
                    const body:Buffer|string = (Buffer.isBuffer(chunks[0]) === true)
                        ? Buffer.concat(chunks)
                        : chunks.join("");
                    if (chunks.length > 0 && chunks[0].toString().indexOf("ForbiddenAccess:") === 0) {
                        forbiddenUser(body.toString().replace("ForbiddenAccess:", ""), "user", config.response);
                    } else {
                        config.callback(body);
                    }
                });
                fsResponse.on("error", responseError);
            },
        requestError = (config.id === "heartbeat")
            ? function terminal_server_httpClient_requestErrorHeartbeat(errorMessage:nodeError):void {
                config.requestError(errorMessage, config.remoteName, config.agentType);
            }
            : (config.requestError === undefined)
                ? function terminal_server_httpClient_requestError(errorMessage:nodeError):void {
                    const copyStatus:copyStatus = {
                            failures: [],
                            message: config.id.slice(config.id.indexOf("|") + 1),
                            target: config.id.slice(0, config.id.indexOf("|"))
                        },
                        fsRemote:fsRemote = {
                            dirs: "missing",
                            fail: [],
                            id: (config.id.indexOf("|Copying ") > 0)
                                ? JSON.stringify({
                                    "file-list-status": copyStatus
                                })
                                : config.id
                        };
                    if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED" && ((vars.command.indexOf("test") === 0 && errorMessage.code !== "ECONNREFUSED") || vars.command.indexOf("test") !== 0)) {
                        log([config.errorMessage, errorMessage.toString()]);
                        vars.ws.broadcast(JSON.stringify({
                            error: errorMessage
                        }));
                    }
                    response(config.response, "application/json", JSON.stringify(fsRemote));
                }
                : config.requestError,
        responseError = (config.id === "heartbeat")
            ? function terminal_server_httpClient_responseErrorHeartbeat(errorMessage:nodeError):void {
                config.requestError(errorMessage, config.remoteName, config.agentType);
            }
            : (config.responseError === undefined)
                ? function terminal_server_httpClient_responseError(errorMessage:nodeError):void {
                    if (errorMessage.code !== "ETIMEDOUT" && ((vars.command.indexOf("test") === 0 && errorMessage.code !== "ECONNREFUSED") || vars.command.indexOf("test") !== 0)) {
                        log([config.errorMessage, errorMessage.toString()]);
                        vars.ws.broadcast(JSON.stringify({
                            error: errorMessage
                        }));
                    }
                }
                : config.responseError,
        invite:string = (config.payload.indexOf("{\"invite\":{\"action\":\"invite-request\"") === 0)
            ? "invite-request"
            : (config.payload.indexOf("{\"invite\":{\"action\":\"invite-complete\"") === 0)
                ? "invite-complete"
                : "",
        headers:OutgoingHttpHeaders = (invite === "")
            ? {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": Buffer.byteLength(config.payload),
                "agent-hash": serverVars.hashUser,
                "agent-name": serverVars.nameUser,
                "agent-type": config.agentType,
                "remote-user": config.remoteName,
                "request-type": config.requestType
            }
            : {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": Buffer.byteLength(config.payload),
                "agent-hash": serverVars.hashUser,
                "agent-name": serverVars.nameUser,
                "agent-type": config.agentType,
                "remote-user": config.remoteName,
                "request-type": config.requestType,
                "invite": invite
            },
        payload:RequestOptions = {
            headers: headers,
            host: config.ip,
            method: "POST",
            path: "/",
            port: config.port,
            timeout: 1000
        },
        fsRequest:ClientRequest = vars.node.http.request(payload, callback);
    vars.testLogger("httpClient", "", "An abstraction over node.http.request in support of this application's data requirements.");
    if (fsRequest.writableEnded === true) {
        error([
            "Attempt to write to HTTP request after end:",
            config.payload.toString()
        ]);
    } else {
        fsRequest.on("error", requestError);
        fsRequest.write(config.payload);
        fsRequest.end();
    }
};

export default httpClient;