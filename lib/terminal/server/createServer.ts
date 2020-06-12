
/* lib/terminal/server/createServer - This library launches the HTTP server and all supporting service utilities. */

import { IncomingMessage, ServerResponse } from "http";

import vars from "../utilities/vars.js";

import forbiddenUser from "./forbiddenUser.js";
import methodGET from "./methodGET.js";
import methodPOST from "./methodPOST.js";
import response from "./response.js";
import serverVars from "./serverVars.js";

const createServer = function terminal_server_create(request:IncomingMessage, serverResponse:ServerResponse):void {
    const host:string = (function terminal_server_create_host():string {
            const addresses:[string, string, string][] = serverVars.addresses[0],
                length:number = addresses.length;
            let a:number = 0,
                name:string = request.headers.host;
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
            do {
                if (addresses[a][1] === name) {
                    return "localhost";
                }
                a = a + 1;
            } while (a < length);
            return request.headers.host;
        }()),
        postTest = function terminal_server_create_postTest():boolean {
            if (
                request.method === "POST" && (
                    host === "localhost" || (
                        host !== "localhost" && (
                            serverVars.user[<string>request.headers["agent-name"]] !== undefined ||
                            request.headers.invite === "invite-request" ||
                            request.headers.invite === "invite-complete"
                        )
                    )
                )
            ) {
                return true;
            }
            return false;
        },
        // eslint-disable-next-line
        requestType:string = (request.method === "GET") ? `GET ${request.url}` : <string>request.headers["request-type"];
    //console.log(requestType);
    if (request.method === "GET" && (request.headers["agent-type"] === "device" || request.headers["agent-type"] === "user") && serverVars[request.headers["agent-type"]][<string>request.headers["agent-hash"]] !== undefined) {
        if (request.headers["agent-type"] === "device") {
            serverResponse.setHeader("agent-hash", serverVars.hashDevice);
            serverResponse.setHeader("agent-type", "device");
        } else {
            serverResponse.setHeader("agent-hash", serverVars.hashUser);
            serverResponse.setHeader("agent-type", "user");
        }
        response(serverResponse, "text/plain", `response from ${serverVars.hashDevice}`);
    } else if (request.method === "GET" && host === "localhost") {
        methodGET(request, serverResponse);
    } else if (postTest() === true) {
        methodPOST(request, serverResponse);
    } else {
        // the delay is necessary to prevent a race condition between service execution and data storage writing
        setTimeout(function terminal_server_create_delay():void {
            if (postTest() === true) {
                methodPOST(request, serverResponse);
            } else {
                vars.node.fs.stat(`${vars.projectPath}storage${vars.sep}user.json`, function terminal_server_create_delay_userStat(err:nodeError):void {
                    if (err === null) {
                        forbiddenUser(<string>request.headers["agent-hash"], <agentType>request.headers["agent-type"], serverResponse);
                    }
                });
                response(serverResponse, "text/plain", `ForbiddenAccess:${request.headers["remote-user"]}`);
            }
        }, 50);
    }
};

export default createServer;