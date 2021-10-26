
/* lib/terminal/server/httpReceiver - This library launches the HTTP service and all supporting service utilities. */

import { stat } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";

import forbiddenUser from "./forbiddenUser.js";
import log from "../utilities/log.js";
import methodGET from "./methodGET.js";
import receiver from "./receiver.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";
    
const httpReceiver = function terminal_server_httpReceiver(request:IncomingMessage, serverResponse:ServerResponse):void {
    let ended:boolean = false,
        host:string = (function terminal_server_httpReceiver_host():string {
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
        postTest = function terminal_server_httpReceiver_postTest():boolean {
            if (
                request.method === "POST" && 
                request.headers["request-type"] !== undefined && (
                    host === "localhost" || (
                        host !== "localhost" && (
                            (serverVars[request.headers["agent-type"] as agentType] !== undefined && serverVars[agentType][agent] !== undefined) ||
                            request.headers["request-type"] === "hash-device" ||
                            request.headers["request-type"] === "invite-request" ||
                            request.headers["request-type"] === "invite-complete" ||
                            serverVars.testType.indexOf("browser") === 0
                        )
                    )
                )
            ) {
                return true;
            }
            return false;
        },
        setIdentity = function terminal_server_httpReceiver_setIdentity(forbidden:boolean):void {
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
        post = function terminal_server_httpReceiver_post():void {
            const body:string = chunks.join(""),
                receivedLength:number = Buffer.byteLength(body),
                contentLength:number = Number(request.headers["content-length"]),
                requestType:requestType = request.headers["request-type"] as requestType;
            if (receivedLength > contentLength) {
                request.destroy({
                    name: "TOO_LARGE",
                    message: "Request destroyed for size in excess of its content-length header."
                });
            }
            setIdentity(false);
            if (requestType.indexOf("heartbeat") === 0) {
                receiver(JSON.parse(body), {
                    socket: serverResponse,
                    type: "http"
                });
            } else {
                receiver({
                    data: JSON.parse(body),
                    service: requestType
                }, {
                    socket: serverResponse,
                    type: "http"
                });
            }
        },
        requestEnd = function terminal_server_httpReceiver_requestEnd():void {
            ended = true;
            if (host === "") {
                setIdentity(true);
                response({
                    message: "ForbiddenAccess: unknown user",
                    mimeType: "text/plain",
                    responseType: "forbidden",
                    serverResponse: serverResponse
                });
            } else if (request.method === "GET") {
                if (host === "localhost") {
                    setIdentity(true);
                    methodGET(request, serverResponse);
                } else {
                    setIdentity(true);
                    response({
                        message: "ForbiddenAccess: GET method from external agent.",
                        mimeType: "text/plain",
                        responseType: "forbidden",
                        serverResponse: serverResponse
                    });
                }
            } else if (postTest() === true) {
                post();
            } else {
                // the delay is necessary to prevent a race condition between service execution and data settings writing
                setTimeout(function terminal_server_httpReceiver_requestEnd_delay():void {
                    if (postTest() === true) {
                        post();
                    } else {
                        stat(`${vars.projectPath}lib${vars.sep}settings${vars.sep}user.json`, function terminal_server_httpReceiver_requestEnd_delay_userStat(err:Error):void {
                            if (err === null) {
                                forbiddenUser(request.headers["agent-hash"] as string, request.headers["agent-type"] as agentType);
                            }
                        });
                        setIdentity(true);
                        response({
                            message: "ForbiddenAccess",
                            mimeType: "text/plain",
                            responseType: "forbidden",
                            serverResponse: serverResponse
                        });
                    }
                }, 50);
            }
        },
        requestError = function terminal_server_httpReceiver_requestError(errorMessage:NodeJS.ErrnoException):void {
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
        responseError = function terminal_server_httpReceiver_responseError(errorMessage:NodeJS.ErrnoException):void {
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
        },
        // eslint-disable-next-line
        requestType:string = (request.method === "GET") ? `GET ${request.url}` : request.headers["request-type"] as string;
    // *** available for troubleshooting:
    // console.log(`${requestType} ${host} ${postTest()} ${agentType} ${agent}`);

        // request handling
        request.on("data", function terminal_server_methodPOST_data(data:Buffer):void {
            chunks.push(decoder.write(data));
        });
        request.on("error", requestError);
        serverResponse.on("error", responseError);
        request.on("end", requestEnd);
};

export default httpReceiver;