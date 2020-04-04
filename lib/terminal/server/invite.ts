
/* lib/terminal/server/invite - Manages the order of invitation related processes for traffic across the internet. */
import * as http from "http";

import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";

const invite = function terminal_server_invite(dataString:string, response:http.ServerResponse):void {
    const data:invite = JSON.parse(dataString).invite,
        inviteRequest = function local_server_invite_request():void {
            const payload:string = (data.action === "invite-request" || data.action === "invite-complete")
                    ? (function local_server_invite_request_payload():string {
                        const ip:string = data.ip,
                            port:number = data.port;
                        let output:string = "";
                        data.userName = serverVars.name;
                        data.ip = serverVars.addresses[0][1][1];
                        data.port = serverVars.webPort;
                        output = JSON.stringify({
                            invite: data
                        });
                        data.ip = ip;
                        data.port = port;
                        return output;
                    }())
                    : JSON.stringify({
                        invite: data
                    });
            httpClient({
                agentType: data.type,
                callback: function terminal_server_invite_request_callback(responseBody:Buffer|string):void {
                    if (vars.command.indexOf("test") !== 0) {
                        log([<string>responseBody]);
                    }
                },
                callbackType: "body",
                errorMessage: `Error on invite to ${data.ip} and port ${data.port}.`,
                id: "",
                payload: payload,
                remoteName: (data.ip.indexOf(":") > -1)
                    ? `invite@[${data.ip}]:${data.port}`
                    : `invite@${data.ip}:${data.port}`,
                requestError: function terminal_server_invite_request_requestError(errorMessage:nodeError):void {
                    if (errorMessage.code === "ETIMEDOUT") {
                        if (data.action === "invite-request") {
                            data.message = `Remote user, ip - ${data.ip} and port - ${data.port}, timed out. Invitation not sent.`;
                            vars.ws.broadcast(JSON.stringify({
                                "invite-error": data
                            }));
                        } else if (data.action === "invite-complete") {
                            data.message = `Originator, ip - ${serverVars.addresses[0][1][1]} and port - ${serverVars.webPort}, timed out. Invitation incomplete.`;
                            vars.ws.broadcast(JSON.stringify({
                                "invite-error": data
                            }));
                        }
                    }
                    log([data.action, errorMessage.toString()]);
                    vars.ws.broadcast(JSON.stringify({
                        error: errorMessage
                    }));
                },
                response: response,
                responseError: function terminal_server_invite_request_responseError(errorMessage:nodeError):void {
                    log([data.action, errorMessage.toString()]);
                    vars.ws.broadcast(JSON.stringify({
                        error: errorMessage
                    }));
                }
            });
        };
    let responseString:string;
    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
    if (data.action === "invite") {
        data.action = "invite-request";
        responseString = `Invitation received at start terminal ${serverVars.addresses[0][1][1]} from start browser. Sending invitation to remote terminal: ${data.ip}.`;
        inviteRequest();
    } else if (data.action === "invite-request") {
        vars.ws.broadcast(dataString);
        responseString = `Invitation received at remote terminal ${data.ip} and sent to remote browser.`;
    } else if (data.action === "invite-response") {
        const respond:string = ` invitation response processed at remote terminal ${data.ip} and sent to start terminal.`
        data.action = "invite-complete";
        responseString = (data.status === "accepted")
            ? `Accepted${respond}`
            : (data.status === "declined")
                ? `Declined${respond}`
                : `Ignored${respond}`;
        inviteRequest();
    } else if (data.action === "invite-complete") {
        const respond:string = ` invitation sent to from start terminal ${serverVars.addresses[0][1][1]} to start browser.`;
        vars.ws.broadcast(dataString);
        responseString = (data.status === "accepted")
            ? `Accepted${respond}`
            : (data.status === "declined")
                ? `Declined${respond}`
                : `Ignored${respond}`;
    }
     //log([responseString]);
    response.write(responseString);
    response.end();
};

export default invite;