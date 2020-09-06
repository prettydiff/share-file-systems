
/* lib/terminal/server/createServer - This library launches the HTTP server and all supporting service utilities. */

import { IncomingMessage, ServerResponse } from "http";

import vars from "../utilities/vars.js";

import forbiddenUser from "./forbiddenUser.js";
import methodGET from "./methodGET.js";
import methodPOST from "./methodPOST.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
    
const createServer = function terminal_server_create(request:IncomingMessage, serverResponse:ServerResponse):void {
    const local:boolean = (request.headers[":authority"] === "localhost"),
        postTest = function terminal_server_create_postTest():boolean {
            if (
                request.headers[":method"] === "POST" && (
                    local === true || (
                        local === false && (
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
        requestType:string = (request.headers[":method"] === "GET") ? `GET ${request.headers[":path"]}` : <string>request.headers["request-type"];
    //console.log(requestType+" "+host+" "+postTest());
    if (request.headers[":method"] === "GET" && (request.headers["agent-type"] === "device" || request.headers["agent-type"] === "user") && serverVars[request.headers["agent-type"]][<string>request.headers["agent-hash"]] !== undefined) {
        if (request.headers["agent-type"] === "device") {
            serverResponse.setHeader("agent-hash", serverVars.hashDevice);
            serverResponse.setHeader("agent-type", "device");
        } else {
            serverResponse.setHeader("agent-hash", serverVars.hashUser);
            serverResponse.setHeader("agent-type", "user");
        }
        response(serverResponse, "text/plain", `response from ${serverVars.hashDevice}`);
    } else if (request.headers[":method"] === "GET" && local === true) {
        methodGET(request, serverResponse);
    } else if (postTest() === true) {
        methodPOST(request, serverResponse);
    } else {
        // the delay is necessary to prevent a race condition between service execution and data storage writing
        setTimeout(function terminal_server_create_delay():void {
            if (postTest() === true) {
                methodPOST(request, serverResponse);
            } else {
                vars.node.fs.stat(`${vars.projectPath}lib${vars.sep}storage${vars.sep}user.json`, function terminal_server_create_delay_userStat(err:nodeError):void {
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