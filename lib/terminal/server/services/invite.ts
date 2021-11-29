
/* lib/terminal/server/services/invite - Manages the order of invitation related processes for traffic across the internet. */

import agent_management from "./agent_management.js";
import common from "../../../common/common.js";
import getAddress from "../../utilities/getAddress.js";
import ipResolve from "../transmission/ipResolve.js";
import responder from "../transmission/responder.js";
import serverVars from "../serverVars.js";
import transmit_http from "../transmission/transmit_http.js";
import transmit_ws from "../transmission/transmit_ws.js";

const invite = function terminal_server_services_invite(socketData:socketData, transmit:transmit):void {
    const data:service_invite = socketData.data as service_invite,
        addresses:addresses = getAddress(transmit),
        userAddresses:networkAddresses = ipResolve.userAddresses(),
        inviteHttp = function terminal_server_services_invite_inviteHttp():void {
            const httpConfig:httpRequest = {
                agent: "",
                agentType: data.type,
                callback: null,
                ip: (data.action === "invite-request")
                    ? data.agentResponse.ipSelected
                    : data.agentRequest.ipSelected,
                payload: {
                    data: data,
                    service: "invite"
                },
                port: (data.action === "invite-request")
                    ? data.agentResponse.ports.http
                    : data.agentRequest.ports.http
            };
            transmit_http.request(httpConfig);
        },
        addAgent = function terminal_server_services_invite_addAgent(type:"agentRequest"|"agentResponse", callback:() => void):void {
            const addAgent:service_agentManagement = {
                action: "add",
                agents: (data.type === "device")
                    ? {
                        device: data[type].shares,
                        user: {}
                    }
                    : {
                        device: {},
                        user: data[type].shares
                    },
                from: "invite"
            };
            agent_management({
                data: addAgent,
                service: "agent-management"
            }, transmit);

            if (callback !== null) {
                callback();
            }
        },
        /**
         * Methods for processing the various stages of the invitation process.
         * * **invite-complete** - Step 4: Receipt of the response at the originating device terminal for transmission to the browser.
         * * **invite-request** - Step 2: Receipt of the invitation request at the remote machine's terminal for processing to its browser.
         * * **invite-response** - Step 3: Receipt of the remote user's response at the remote machine's terminal for transmission to the originating machine.
         * * **invite-start** - Step 1: Receipt of an invite request from the local browser.
         *
         * ```typescript
         * interface module_inviteActions {
         *     "invite-complete": () => void;
         *     "invite-request": () => void;
         *     "invite-response": () => void;
         *     "invite-start": () => void;
         * }
         * ``` */
        actions:module_inviteActions = {
            "invite-complete": function terminal_server_services_invite_inviteComplete():void {
                // stage 4 - on start terminal to start browser
                const name:string = (data.type === "device")
                        ? data.agentResponse.nameDevice
                        : data.agentResponse.nameUser,
                    respond:string = ` invitation returned from ${data.type} '${name}'.`;
                data.message = common.capitalize(data.status) + respond;
                if (data.status === "accepted") {
                    addAgent("agentResponse", function terminal_server_services_invite_inviteComplete_addAgent():void {
                        const keyShares:string[] = (data.agentResponse.shares === null)
                                ? []
                                : Object.keys(data.agentResponse.shares),
                            payload:agents = (data.type === "device")
                                ? serverVars.device
                                : {};

                        // build the payload for sharing amongst other devices
                        if (data.type === "device") {
                            keyShares.forEach(function terminal_server_service_invite_inviteComplete_devicesEach(deviceName:string):void {
                                payload[deviceName] = data.agentResponse.shares[deviceName];
                                if (serverVars.testType !== "service") {
                                    transmit_ws.open({
                                        agent: deviceName,
                                        agentType: "device",
                                        callback: null
                                    });
                                }
                            });
                        } else if (data.type === "user") {
                            serverVars.user[keyShares[0]] = data.agentResponse.shares[keyShares[0]];
                            payload[keyShares[0]] = serverVars.user[keyShares[0]];
                            if (serverVars.testType !== "service") {
                                transmit_ws.open({
                                    agent: keyShares[0],
                                    agentType: data.type,
                                    callback: null
                                });
                            }
                        }
                    });
                }
                transmit_ws.broadcast({
                    data: data,
                    service: "invite"
                }, "browser");
            },
            "invite-request": function terminal_server_services_invite_inviteRequest():void {
                // stage 2 - on remote terminal to remote browser
                const agent:agent = (data.type === "user")
                    ? serverVars.user[data.agentRequest.hashUser]
                    : serverVars.device[data.agentRequest.hashDevice];
                data.agentResponse = {
                    hashDevice: (data.type === "device")
                        ? serverVars.hashDevice
                        : "",
                    hashUser: serverVars.hashUser,
                    ipAll: serverVars.localAddresses,
                    ipSelected: addresses.local,
                    modal: "",
                    nameDevice: (data.type === "device")
                        ? serverVars.nameDevice
                        : "",
                    nameUser: serverVars.nameUser,
                    ports: serverVars.ports,
                    shares: (data.type === "device")
                        ? serverVars.device
                        : {
                            [serverVars.hashUser]: {
                                deviceData: null,
                                ipAll: serverVars.localAddresses,
                                ipSelected: addresses.local,
                                name: serverVars.nameUser,
                                ports: serverVars.ports,
                                shares: common.selfShares(serverVars.device),
                                status: "active"
                            }
                        }
                };
                serverVars.device[serverVars.hashDevice].ipSelected = addresses.local;
                data.agentRequest.ipSelected = addresses.remote;
                if (data.type === "device") {
                    data.agentRequest.shares[data.agentRequest.hashDevice].ipSelected = addresses.remote;
                } else {
                    data.agentRequest.shares[data.agentRequest.hashUser].ipSelected = addresses.remote;
                }
                if (agent === undefined) {
                    transmit_ws.broadcast({
                        data: data,
                        service: "invite"
                    }, "browser");
                } else {
                    // if the agent is already registered with the remote then bypass the user by auto-approving the request
                    data.message = `Accepted invitation. Request processed at responding terminal ${data.agentResponse.ipSelected} for type ${data.type}.  Agent already present, so auto accepted and returned to requesting terminal.`;
                    data.action = "invite-complete";
                    data.status = "accepted";
                    inviteHttp();
                }
            },
            "invite-response": function terminal_server_services_invite_inviteResponse():void {
                const respond:string = ` invitation response processed at responding terminal ${data.agentResponse.ipSelected} and sent to requesting terminal ${data.agentRequest.ipSelected}.`;
                // stage 3 - on remote terminal to start terminal, from remote browser
                data.message = common.capitalize(data.status) + respond;
                data.action = "invite-complete";
                if (data.status === "accepted") {
                    addAgent("agentRequest", null);
                }
                inviteHttp();
            },
            "invite-start": function terminal_server_services_invite_invite():void {
                // stage 1 - on start terminal to remote terminal, from start browser
                data.action = "invite-request";
                data.agentRequest.shares = (data.type === "device")
                    ? serverVars.device
                    : {
                        [serverVars.hashUser]: {
                            deviceData: null,
                            ipAll: userAddresses,
                            ipSelected: "",
                            name: serverVars.nameUser,
                            ports: serverVars.ports,
                            shares: common.selfShares(serverVars.device),
                            status: "offline"
                        }
                    };
                inviteHttp();
            }
        };
    actions[data.action]();
    /*if (transmit !== null && transmit.type === "http" && transmit.socket.writableEnded === false) {
        if (serverVars.testType === "service" || (data.action !== "invite-complete" && data.action !== "invite-start") || (data.action === "invite-complete" && data.status === "accepted")) {
            responder({
                data: data,
                service: "invite"
            }, transmit);
        } else {
            transmit_http.respondEmpty(transmit);
        }
    }*/
};

export default invite;