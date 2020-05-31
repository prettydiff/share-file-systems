
/* lib/terminal/server/invite - Manages the order of invitation related processes for traffic across the internet. */
import * as http from "http";

import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import heartbeat from "./heartbeat.js";
import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";

const invite = function terminal_server_invite(dataString:string, response:http.ServerResponse):void {
    const data:invite = JSON.parse(dataString).invite,
        inviteHttp = function local_server_invite_inviteHttp():void {
            const payload:string = (function local_server_invite_inviteHTTP_payload():string {
                    const ip:string = data.ip,
                        port:number = data.port;
                    let output:string = "";
                    data.userName = serverVars.nameUser;
                    data.ip = serverVars.ipAddress;
                    data.port = serverVars.webPort;
                    output = JSON.stringify({
                        invite: data
                    });
                    data.ip = ip;
                    data.port = port;
                    return output;
                }()),
                httpConfig:httpConfiguration = {
                    agentType: data.type,
                    callback: function terminal_server_invite_request_callback(responseBody:Buffer|string):void {
                        if (vars.command.indexOf("test") !== 0) {
                            log([<string>responseBody]);
                        }
                    },
                    callbackType: "body",
                    errorMessage: `Error on invite to ${data.ip} and port ${data.port}.`,
                    id: "",
                    ip: data.ip,
                    payload: payload,
                    port: data.port,
                    remoteName: (data.type === "device")
                        ? serverVars.hashDevice
                        : serverVars.hashUser,
                    requestError: function terminal_server_invite_request_requestError(errorMessage:nodeError):void {
                        if (errorMessage.code === "ETIMEDOUT") {
                            if (data.action === "invite-request") {
                                data.message = `Remote user, ip - ${data.ip} and port - ${data.port}, timed out. Invitation not sent.`;
                                vars.ws.broadcast(JSON.stringify({
                                    "invite-error": data
                                }));
                            } else if (data.action === "invite-complete") {
                                data.message = `Originator, ip - ${serverVars.ipAddress} and port - ${serverVars.webPort}, timed out. Invitation incomplete.`;
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
                    requestType: data.action,
                    response: response,
                    responseError: function terminal_server_invite_request_responseError(errorMessage:nodeError):void {
                        log([data.action, errorMessage.toString()]);
                        vars.ws.broadcast(JSON.stringify({
                            error: errorMessage
                        }));
                    }
                };
            vars.testLogger("invite", "inviteHttp", `Send out the invite data in support of action ${data.action}`);
            httpClient(httpConfig);
        };
    let responseString:string;
    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
    if (data.action === "invite") {
        vars.testLogger("invite", "invite", "Issue an invitation request to a remote agent.");
        responseString = `Invitation received at start terminal ${serverVars.ipAddress} from start browser. Sending invitation to remote terminal: ${data.ip}.`;
        data.action = "invite-request";
        inviteHttp();
    } else if (data.action === "invite-request") {
        vars.testLogger("invite", "invite-request", "Process an invitation request from a remote agent by sending the request data to the browser.");
        responseString = `Invitation received at remote terminal ${data.ip} and sent to remote browser.`;

        if (serverVars[data.type][data[`${data.type}Hash`]] !== undefined) {
            // if the agent is already registered with the remote then bypass the user by auto-approving the request
            data.action = "invite-complete";
            data.status = "accepted";
            inviteHttp();
        } else {
            vars.ws.broadcast(dataString);
        }
    } else if (data.action === "invite-response") {
        const respond:string = ` invitation response processed at remote terminal ${data.ip} and sent to start terminal.`;
        vars.testLogger("invite", "invite-response", "The user has made a decision about the invitation and now that decision must be sent back to the originating agent.");
        responseString = (data.status === "accepted")
            ? `Accepted${respond}`
            : (data.status === "declined")
                ? `Declined${respond}`
                : `Ignored${respond}`;

        data.action = "invite-complete";
        inviteHttp();
    } else if (data.action === "invite-complete") {
        const respond:string = ` invitation returned to ${data.ip} from this local terminal ${serverVars.ipAddress} and to the local browser(s).`;
        vars.testLogger("invite", "invite-complete", "The invitation is received back to the originating agent and must be sent to the browser.");
        if (data.status === "accepted") {
            const hbConfig:heartbeatBroadcast = {
                agentFrom: "localhost-terminal",
                shareFrom: "",
                shares: {},
                status: "active"
            };
            serverVars[data.type][data[`${data.type}Hash`]] = {
                ip: data.ip,
                name: data.name,
                port: data.port,
                shares: data.shares
            };
            storage(JSON.stringify({
                [data.type]: serverVars[data.type]
            }), "", data.type);
            heartbeat.broadcast(hbConfig, response);
            responseString = `Accepted${respond}`;
        } else {
            responseString = (data.status === "declined")
                ? `Declined${respond}`
                : `Ignored${respond}`;
        }

        vars.ws.broadcast(dataString);
    }
    if (data.action !== "invite-complete" || (data.action === "invite-complete" && data.status !== "accepted")) {
        //log([responseString]);
        response.write(responseString);
        response.end();
    }
};

export default invite;