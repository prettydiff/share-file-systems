
/* lib/terminal/server/services/invite - Manages the order of invitation related processes for traffic across the internet. */

import agent_management from "./agent_management.js";
import common from "../../../common/common.js";
import getAddress from "../../utilities/getAddress.js";
import sender from "../transmission/sender.js";
import serverVars from "../serverVars.js";
import service from "../../test/application/service.js";
import transmit_http from "../transmission/transmit_http.js";
import transmit_ws from "../transmission/transmit_ws.js";

const invite = function terminal_server_services_invite(socketData:socketData, transmit:transmit):void {
    const data:service_invite = socketData.data as service_invite,
        addresses:addresses = (serverVars.testType === "service")
            ? {
                local: "127.0.0.1",
                remote: "127.0.0.1"
            }
            : getAddress(transmit),
        inviteHttp = function terminal_server_services_invite_inviteHttp():void {
            const payload:socketData = {
                    data: data,
                    service: "invite"
                },
                httpConfig:config_http_request = {
                    agent: "",
                    agentType: data.type,
                    callback: null,
                    ip: (data.action === "invite-request")
                        ? data.agentResponse.ipSelected
                        : data.agentRequest.ipSelected,
                    payload: payload,
                    port: (data.action === "invite-request")
                        ? data.agentResponse.ports.http
                        : data.agentRequest.ports.http
                };
            if (serverVars.testType === "service") {
                service.evaluation(payload);
            } else {
                transmit_http.request(httpConfig);
            }
        },
        addAgent = function terminal_server_services_invite_addAgent(type:"agentRequest"|"agentResponse", callback:(agents:agents) => void):void {
            const addAgentData:service_agentManagement = {
                action: "add",
                agents: (data.type === "device")
                    ? {
                        device: data[type].devices,
                        user: {}
                    }
                    : {
                        device: {},
                        user: {
                            [data[type].hashUser]: {
                                deviceData: null,
                                ipAll: data.agentResponse.ipAll,
                                ipSelected: data.agentResponse.ipSelected,
                                name: data.agentResponse.nameUser,
                                ports: data.agentResponse.ports,
                                shares: data.agentResponse.shares,
                                status: "active"
                            }
                        }
                    },
                agentFrom: serverVars.hashDevice
            };
            if (serverVars.testType !== "service") {
                agent_management({
                    data: addAgentData,
                    service: "agent-management"
                }, transmit);
            }

            if (callback !== null) {
                callback(addAgentData.agents[data.type]);
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
                if (serverVars.testType === "service") {
                    service.evaluation({
                        data: data,
                        service: "invite"
                    });
                } else {
                    if (data.status === "accepted") {
                        addAgent("agentResponse", function terminal_server_services_invite_inviteComplete_addAgent(agents:agents):void {
                            const keys:string[] = Object.keys(agents);
                            if (data.type === "device") {
                                keys.forEach(function terminal_server_services_invite_inviteComplete_addAgent_each(device:string):void {
                                    transmit_ws.open({
                                        agent: device,
                                        agentType: "device",
                                        callback: null
                                    });
                                });
                            } else {
                                transmit_ws.open({
                                    agent: keys[0],
                                    agentType: "user",
                                    callback: null
                                });
                            }
                        });
                    }
                    sender.broadcast({
                        data: data,
                        service: "invite"
                    }, "browser");
                }
            },
            "invite-request": function terminal_server_services_invite_inviteRequest():void {
                // stage 2 - on remote terminal to remote browser
                const agent:agent = (data.type === "user")
                    ? serverVars.user[data.agentRequest.hashUser]
                    : serverVars.device[data.agentRequest.hashDevice];
                serverVars.device[serverVars.hashDevice].ipSelected = addresses.local;
                data.agentResponse = {
                    devices: (data.type === "device")
                        ? serverVars.device
                        : {},
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
                        ? {}
                        : common.selfShares(serverVars.device)
                };
                serverVars.device[serverVars.hashDevice].ipSelected = addresses.local;
                data.agentRequest.ipSelected = addresses.remote;
                if (data.type === "device") {
                    data.agentRequest.devices[data.agentRequest.hashDevice].ipSelected = addresses.remote;
                }
                if (agent === undefined) {
                    sender.broadcast({
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
                serverVars.device[serverVars.hashDevice].ipSelected = data.agentRequest.ipSelected;
                inviteHttp();
            }
        };
    if (serverVars.testType === "service" && data.message.indexOf("Ignored") === 0) {
        data.status = "ignored";
        service.evaluation({
            data: data,
            service: "invite"
        });
    } else {
        actions[data.action]();
    }
};

export default invite;