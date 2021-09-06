
/* lib/terminal/server/invite - Manages the order of invitation related processes for traffic across the internet. */
import { ServerResponse } from "http";

import common from "../../common/common.js";
import error from "../utilities/error.js";
import heartbeat from "./heartbeat.js";
import httpSender from "./httpSender.js";
import ipResolve from "./ipResolve.js";
import log from "../utilities/log.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import settings from "./settings.js";

const invite = function terminal_server_invite(data:invite, sourceIP:string, serverResponse:ServerResponse):void {
    let responseString:string;
    const userAddresses:networkAddresses = ipResolve.userAddresses(),
        inviteHttp = function terminal_server_invite_inviteHttp(ip:string, port:number):void {
            const payload:string = (function terminal_server_invite_inviteHTTP_payload():string {
                    const ip:string = data.ipSelected,
                        port:number = data.port;
                    let output:string = "";
                    data.userName = serverVars.nameUser;
                    data.ipSelected = "";
                    data.port = serverVars.webPort;
                    output = JSON.stringify(data);
                    data.ipSelected = ip;
                    data.port = port;
                    return output;
                }()),
                httpConfig:httpConfiguration = {
                    agent: "",
                    agentType: data.type,
                    callback: function terminal_server_invite_request_callback(message:Buffer|string):void {
                        if (serverVars.testType === "") {
                            log([message.toString()]);
                        }
                    },
                    ip: ip,
                    payload: payload,
                    port: port,
                    requestError: function terminal_server_invite_request_requestError(errorMessage:NodeJS.ErrnoException):void {
                        if (errorMessage.code === "ETIMEDOUT") {
                            data.message = `IP - ${data.ipSelected} and port - ${data.port}, timed out for action ${data.action}. Invitation not sent.`;
                            serverVars.broadcast("invite-error", JSON.stringify(data));
                        }
                        error([data.action, errorMessage.toString()]);
                    },
                    requestType: data.action,
                    responseError: function terminal_server_invite_request_responseError(errorMessage:Error):void {
                        error([data.action, errorMessage.toString()]);
                    }
                };
            httpSender(httpConfig);
        },
        accepted = function terminal_server_invite_accepted(respond:string):void {
            const keyShares:string[] = Object.keys(data.shares),
                devices:string[] = Object.keys(serverVars.device);
            let payload:agents;
            devices.splice(0, 1);
            if (data.type === "device") {
                let a:number = keyShares.length;
                do {
                    a = a - 1;
                    if (serverVars.device[keyShares[a]] === undefined) {
                        serverVars.device[keyShares[a]] = data.shares[keyShares[a]];
                    }
                } while (a > 0);
                payload = serverVars.device;
            } else if (data.type === "user") {
                serverVars.user[keyShares[0]] = data.shares[keyShares[0]];
                payload = {
                    [keyShares[0]]: serverVars.user[keyShares[0]]
                };
            }
            // updates devices of new agents but does not process invitation
            if (devices.length > 0) {
                const update:heartbeatUpdate = {
                    agentFrom: "localhost-terminal",
                    broadcastList: {
                        distribution: devices,
                        payload: payload,
                        type: data.type
                    },
                    shares: serverVars[data.type],
                    status: "active",
                    type: data.type
                };
                heartbeat({
                    dataString: JSON.stringify(update),
                    ip: "",
                    serverResponse: null,
                    task: "heartbeat-update"
                });
            }
            settings({
                data: serverVars[data.type],
                serverResponse: null,
                type: data.type
            });
            responseString = `Accepted${respond}`;
        },
        deviceIP = function terminal_server_invite_deviceIP(devices:agents):agents {
            const deviceList:string[] = Object.keys(devices);
            let a:number = deviceList.length;
            do {
                a = a - 1;
                if (devices[deviceList[a]].ipAll.IPv6.indexOf(sourceIP) > -1 || devices[deviceList[a]].ipAll.IPv4.indexOf(sourceIP) > -1) {
                    devices[deviceList[a]].ipSelected = sourceIP;
                    break;
                }
            } while (a > 0);
            return devices;
        },
        actions:postActions = {
            "invite": function terminal_server_invite_invite():void {
                // stage 1 - on start terminal to remote terminal, from start browser
                responseString = `Invitation received at this device from start browser. Sending invitation to remote terminal: ${data.ipSelected}.`;
                data.action = "invite-request";

                data.shares = (data.type === "device")
                    ? serverVars.device
                    : {
                        [serverVars.hashUser]: {
                            deviceData: null,
                            ipAll: userAddresses,
                            ipSelected: "",
                            name: serverVars.nameUser,
                            port: serverVars.webPort,
                            shares: common.selfShares(serverVars.device, null),
                            status: "offline"
                        }
                    };
                inviteHttp(data.ipSelected, data.port);
            },
            "invite-complete": function terminal_server_invite_inviteComplete():void {
                // stage 4 - on start terminal to start browser
                const respond:string = ` invitation returned to ${data.ipSelected} from this local terminal and to the local browser(s).`;
                data.ipSelected = sourceIP;
                if (data.status === "accepted") {
                    if (data.type === "device") {
                        data.shares = deviceIP(data.shares);
                    } else {
                        data.shares[data.userHash].ipSelected = sourceIP;
                    }
                    accepted(respond);
                } else {
                    responseString = (data.status === "declined")
                        ? `Declined${respond}`
                        : `Ignored${respond}`;
                }
                serverVars.broadcast("invite-complete", JSON.stringify(data));
            },
            "invite-request": function terminal_server_invite_inviteRequest():void {
                // stage 2 - on remote terminal to remote browser
                responseString = `Invitation received at remote terminal ${data.ipSelected} and sent to remote browser.`;
                data.ipSelected = sourceIP;
                if (serverVars[data.type][data[`${data.type}Hash` as "deviceHash"|"userHash"]] === undefined) {
                    if (data.type === "device") {
                        data.shares = deviceIP(data.shares);
                    } else {
                        data.shares[data.userHash].ipSelected = sourceIP;
                    }
                    serverVars.broadcast("invite", JSON.stringify(data));
                } else {
                    // if the agent is already registered with the remote then bypass the user by auto-approving the request
                    accepted(` invitation. Request processed at remote terminal ${data.ipSelected} for type ${data.type}.  Agent already present, so auto accepted and returned to start terminal.`);
                    data.action = "invite-complete";
                    data.shares = (data.type === "device")
                        ? deviceIP(serverVars.device)
                        : {
                            [serverVars.hashUser]: {
                                deviceData: null,
                                ipAll: userAddresses,
                                ipSelected: sourceIP,
                                name: serverVars.nameUser,
                                port: serverVars.webPort,
                                shares: common.selfShares(serverVars.device, null),
                                status: "offline"
                            }
                        };
                    data.status = "accepted";
                    inviteHttp(data.ipSelected, data.port);
                }
            },
            "invite-response": function terminal_server_invite_inviteResponse():void {
                // stage 3 - on remote terminal to start terminal, from remote browser
                const respond:string = ` invitation response processed at remote terminal ${data.ipSelected} and sent to start terminal.`,
                    ip:string = data.ipSelected,
                    port:number = data.port;
                if (data.status === "accepted") {
                    accepted(respond);
                    if (data.type === "device") {
                        data.deviceHash = serverVars.hashDevice;
                        data.deviceName = serverVars.nameDevice;
                        data.shares = serverVars.device;
                        serverVars.hashUser = data.userHash;
                        serverVars.nameUser = data.userName;
                    } else {
                        data.userHash = serverVars.hashUser;
                        data.userName = serverVars.nameUser;
                        data.shares = {
                            [serverVars.hashUser]: {
                                deviceData: null,
                                ipAll: userAddresses,
                                ipSelected: "",
                                name: serverVars.nameUser,
                                port: serverVars.webPort,
                                shares: common.selfShares(serverVars.device, null),
                                status: "offline"
                            }
                        };
                    }
                    data.port = serverVars.webPort;
                } else {
                    responseString = (data.status === "declined")
                        ? `Declined${respond}`
                        : `Ignored${respond}`;
                }
                data.action = "invite-complete";
                inviteHttp(ip, port);
            }
        };
    actions[data.action]();
    //log([responseString]);
    response({
        message: responseString,
        mimeType: "text/plain",
        responseType: data.action,
        serverResponse: serverResponse
    });
};

export default invite;