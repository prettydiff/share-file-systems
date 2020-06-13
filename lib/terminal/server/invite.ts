
/* lib/terminal/server/invite - Manages the order of invitation related processes for traffic across the internet. */
import * as http from "http";

import deviceShare from "../../common/deviceShare.js";

import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import heartbeat from "./heartbeat.js";
import httpClient from "./httpClient.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";

const invite = function terminal_server_invite(dataString:string, serverResponse:http.ServerResponse):void {
    const data:invite = JSON.parse(dataString).invite,
        inviteHttp = function local_server_invite_inviteHttp(ip:string, port:number):void {
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
                    ip: ip,
                    payload: payload,
                    port: port,
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
        },
        accepted = function local_server_invite_accepted(respond:string):void {
            const keyShares:string[] = Object.keys(data.shares),
                devices:string[] = Object.keys(serverVars.device);
            devices.splice(0, 1);
            if (data.type === "device") {
                let a:number = keyShares.length;
                do {
                    a = a - 1;
                    if (serverVars.device[keyShares[a]] === undefined) {
                        serverVars.device[keyShares[a]] = data.shares[keyShares[a]];
                    }
                } while (a > 0);
            } else if (data.type === "user") {
                serverVars.user[keyShares[0]] = {
                    ip: data.ip,
                    name: data.userName,
                    port: data.port,
                    shares: data.shares[keyShares[0]].shares
                }
            }
            if (devices.length > 0) {
                heartbeat.update({
                    agentFrom: "localhost-terminal",
                    broadcastList: devices,
                    response: null,
                    shares: serverVars[data.type],
                    status: "active",
                    type: data.type
                });
            }
            storage({
                data: serverVars[data.type],
                response: null,
                type: data.type
            });
            responseString = `Accepted${respond}`;
        };
    let responseString:string;
    if (data.action === "invite") {
        vars.testLogger("invite", "invite", "Issue an invitation request to a remote agent.");
        responseString = `Invitation received at start terminal ${serverVars.ipAddress} from start browser. Sending invitation to remote terminal: ${data.ip}.`;
        data.action = "invite-request";
        data.shares = (data.type === "device")
            ? serverVars.device
            : {
                [serverVars.hashUser]: {
                    ip: serverVars.ipAddress,
                    name: serverVars.nameUser,
                    port: serverVars.webPort,
                    shares: deviceShare(serverVars.device, null)
                }
            };
        inviteHttp(data.ip, data.port);
    } else if (data.action === "invite-request") {
        vars.testLogger("invite", "invite-request", "Process an invitation request from a remote agent by sending the request data to the browser.");
        responseString = `Invitation received at remote terminal ${data.ip} and sent to remote browser.`;
        if (serverVars[data.type][data[`${data.type}Hash`]] !== undefined) {
            // if the agent is already registered with the remote then bypass the user by auto-approving the request
            accepted(` invitation. Request processed at remote terminal ${data.ip}.  Agent already present, so auto accepted and returned to start terminal.`);
            data.action = "invite-complete";
            data.shares = (data.type === "device")
                ? serverVars.device
                : {
                    [serverVars.hashUser]: {
                        ip: serverVars.ipAddress,
                        name: serverVars.nameUser,
                        port: serverVars.webPort,
                        shares: deviceShare(serverVars.device, null)
                    }
                };
            data.status = "accepted";
            inviteHttp(data.ip, data.port);
        } else {
            vars.ws.broadcast(dataString);
        }
    } else if (data.action === "invite-response") {
        const respond:string = ` invitation response processed at remote terminal ${data.ip} and sent to start terminal.`,
            ip:string = data.ip,
            port:number = data.port;
        vars.testLogger("invite", "invite-response", "The user has made a decision about the invitation and now that decision must be sent back to the originating agent.");
        if (data.status === "accepted") {
            accepted(respond);
            if (data.type === "device") {
                data.deviceHash = serverVars.hashDevice;
                data.deviceName = serverVars.nameDevice;
                data.shares = serverVars.device;
            } else {
                data.userHash = serverVars.hashUser;
                data.userName = serverVars.nameUser;
                data.shares = {
                    [serverVars.hashUser]: {
                        ip: serverVars.ipAddress,
                        name: serverVars.nameUser,
                        port: serverVars.webPort,
                        shares: deviceShare(serverVars.device, null)
                    }
                };
            }
            data.ip = serverVars.ipAddress;
            data.port = serverVars.webPort;
        } else {
            responseString = (data.status === "declined")
                ? `Declined${respond}`
                : `Ignored${respond}`;
        }
        data.action = "invite-complete";
        inviteHttp(ip, port);
    } else if (data.action === "invite-complete") {
        const respond:string = ` invitation returned to ${data.ip} from this local terminal ${serverVars.ipAddress} and to the local browser(s).`;
        vars.testLogger("invite", "invite-complete", "The invitation is received back to the originating agent and must be sent to the browser.");
        if (data.status === "accepted") {
            accepted(respond);
        } else {
            responseString = (data.status === "declined")
                ? `Declined${respond}`
                : `Ignored${respond}`;
        }
        vars.ws.broadcast(dataString);
    }
    //log([responseString]);
    response(serverResponse, "text/plain", responseString);
};

export default invite;