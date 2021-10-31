
/* lib/terminal/server/services/invite - Manages the order of invitation related processes for traffic across the internet. */

import agent_http from "../transmission/agent_http.js";
import agent_ws from "../transmission/agent_ws.js";
import common from "../../../common/common.js";
import getAddress from "../../utilities/getAddress.js";
import heartbeat from "./heartbeat.js";
import ipResolve from "../transmission/ipResolve.js";
import log from "../../utilities/log.js";
import responder from "../transmission/responder.js";
import serverVars from "../serverVars.js";
import settings from "./settings.js";

const invite = function terminal_server_services_invite(socketData:socketData, transmit:transmit):void {
    const data:invite = socketData.data as invite,
        userAddresses:networkAddresses = ipResolve.userAddresses(),
        sourceIP:string = getAddress(transmit).local,
        inviteHttp = function terminal_server_services_invite_inviteHttp(ip:string, ports:ports):void {
            const ipSelected:string = data.ipSelected,
                portsTemp:ports = data.ports,
                userName:string = data.userName,
                payload:invite = (function terminal_server_services_invite_inviteHTTP_payload():invite {
                    data.userName = serverVars.nameUser;
                    data.ipSelected = "";
                    data.ports = serverVars.ports;
                    return data;
                }()),
                httpConfig:httpRequest = {
                    agent: "",
                    agentType: data.type,
                    callback: function terminal_server_services_invite_request_callback(message:socketData):void {
                        if (serverVars.testType === "") {
                            const inviteData:invite = message.data as invite;
                            log([inviteData.message]);
                        }
                    },
                    ip: ip,
                    payload: {
                        data: payload,
                        service: "invite"
                    },
                    port: ports.http
                };
            agent_http.request(httpConfig);
            data.userName = userName;
            data.ipSelected = ipSelected;
            data.ports = portsTemp;
        },
        accepted = function terminal_server_services_invite_accepted(respond:string):void {
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
                    action: "update",
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
                    data: update,
                    service: "heartbeat"
                }, transmit);
            }
            settings({
                data: {
                    settings: serverVars[data.type],
                    type: data.type
                },
                service: "invite"
            });
            data.message = `Accepted${respond}`;
        },
        deviceIP = function terminal_server_services_invite_deviceIP(devices:agents):agents {
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
        actions:inviteActions = {
            "invite-start": function terminal_server_services_invite_invite():void {
                // stage 1 - on start terminal to remote terminal, from start browser
                data.action = "invite-request";
                data.shares = (data.type === "device")
                    ? serverVars.device
                    : {
                        [serverVars.hashUser]: {
                            deviceData: null,
                            ipAll: userAddresses,
                            ipSelected: "",
                            name: serverVars.nameUser,
                            ports: serverVars.ports,
                            shares: common.selfShares(serverVars.device, null),
                            status: "offline"
                        }
                    };
                inviteHttp(data.ipSelected, data.ports);
            },
            "invite-complete": function terminal_server_services_invite_inviteComplete():void {
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
                    data.message = (data.status === "declined")
                        ? `Declined${respond}`
                        : `Ignored${respond}`;
                }
                agent_ws.broadcast({
                    data: data,
                    service: "invite"
                }, "browser");
            },
            "invite-request": function terminal_server_services_invite_inviteRequest():void {
                // stage 2 - on remote terminal to remote browser
                data.message = `Invitation received at remote terminal ${data.ipSelected} and sent to remote browser.`;
                data.ipSelected = sourceIP;
                if (serverVars[data.type][data[`${data.type}Hash` as "deviceHash"|"userHash"]] === undefined) {
                    if (data.type === "device") {
                        data.shares = deviceIP(data.shares);
                    } else {
                        data.shares[data.userHash].ipSelected = sourceIP;
                    }
                    agent_ws.broadcast({
                        data: data,
                        service: "invite"
                    }, "browser");
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
                                ports: serverVars.ports,
                                shares: common.selfShares(serverVars.device, null),
                                status: "offline"
                            }
                        };
                    data.status = "accepted";
                    inviteHttp(data.ipSelected, data.ports);
                }
            },
            "invite-response": function terminal_server_services_invite_inviteResponse():void {
                // stage 3 - on remote terminal to start terminal, from remote browser
                const respond:string = ` invitation response processed at remote terminal ${data.ipSelected} and sent to start terminal.`,
                    ip:string = data.ipSelected,
                    port:ports = data.ports;
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
                                ports: serverVars.ports,
                                shares: common.selfShares(serverVars.device, null),
                                status: "offline"
                            }
                        };
                    }
                    data.ports = serverVars.ports;
                } else {
                    data.message = (data.status === "declined")
                        ? `Declined${respond}`
                        : `Ignored${respond}`;
                }
                data.action = "invite-complete";
                inviteHttp(ip, port);
            }
        };
    actions[data.action]();
    //log([responseString]);
    if (serverVars.testType === "service" || data.action !== "invite-complete" || (data.action === "invite-complete" && data.status === "accepted")) {
        responder({
            data: data,
            service: "invite"
        }, transmit);
    } else {
        transmit.socket.destroy();
    }
};

export default invite;