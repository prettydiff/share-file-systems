
/* lib/terminal/server/createServer - This library launches the HTTP server and all supporting service utilities. */

import { IncomingMessage, ServerResponse } from "http";

import vars from "../utilities/vars.js";

import forbiddenUser from "./forbiddenUser.js";
import methodGET from "./methodGET.js";
import methodPOST from "./methodPOST.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
    
const createServer = function terminal_server_createServer(request:IncomingMessage, serverResponse:ServerResponse):void {
    let host:string = (function terminal_server_createServer_host():string {
        let name:string = request.headers.host;
        if (name === undefined) {
            return;
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
    const agentType:agentType = <agentType>request.headers["agent-type"],
        agent:string = <string>request.headers["agent-hash"],
        postTest = function terminal_server_createServer_postTest():boolean {
            if (
                request.method === "POST" && (
                    host === "localhost" || (
                        host !== "localhost" && (
                            (serverVars[<agentType>request.headers["agent-type"]] !== undefined && serverVars[agentType][agent] !== undefined) ||
                            request.headers["request-type"] === "hash-device" ||
                            request.headers["request-type"] === "invite-request" ||
                            request.headers["request-type"] === "invite-complete" ||
                            (serverVars.testBrowser !== null && vars.command === "test_browser")
                        )
                    )
                )
            ) {
                return true;
            }
            return false;
        },
        setIdentity = function terminal_server_createServer_setIdentity(forbidden:boolean):void {
            if (request.headers["agent-hash"] === undefined) {
                return;
            }
            if (forbidden === true) {
                serverResponse.setHeader("agent-hash", request.headers["agent-hash"]);
                serverResponse.setHeader("agent-type", "user");
            } else {
                const type:agentType = <agentType>request.headers["agent-type"],
                    self:string = (type === "device")
                        ? serverVars.hashDevice
                        : serverVars.hashUser;
                host = self;
                serverResponse.setHeader("agent-hash", self);
                serverResponse.setHeader("agent-type", type);
            }
        },
        // eslint-disable-next-line
        requestType:string = (request.method === "GET") ? `GET ${request.url}` : <string>request.headers["request-type"];
    // *** available for troubleshooting:
    //console.log(`${requestType} ${host} ${postTest()} ${agentType} ${agent}`);

    serverVars.requests = serverVars.requests + 1;
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
                message: "ForbiddenAccess:GET method from external agent.",
                mimeType: "text/plain",
                responseType: "forbidden",
                serverResponse: serverResponse
            });
        }
    } else if (postTest() === true) {
        setIdentity(false);
        methodPOST(request, serverResponse, host);
    } else {
        // the delay is necessary to prevent a race condition between service execution and data storage writing
        setTimeout(function terminal_server_createServer_delay():void {
            if (postTest() === true) {
                setIdentity(false);
                methodPOST(request, serverResponse, host);
            } else {
                vars.node.fs.stat(`${vars.projectPath}lib${vars.sep}storage${vars.sep}user.json`, function terminal_server_createServer_delay_userStat(err:nodeError):void {
                    if (err === null) {
                        forbiddenUser(<string>request.headers["agent-hash"], <agentType>request.headers["agent-type"]);
                    }
                });
                setIdentity(true);
                response({
                    message: `ForbiddenAccess:${request.headers["remote-user"]}`,
                    mimeType: "text/plain",
                    responseType: "forbidden",
                    serverResponse: serverResponse
                });
            }
        }, 50);
    }
};

export default createServer;