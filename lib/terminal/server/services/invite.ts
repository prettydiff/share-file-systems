
/* lib/terminal/server/services/invite - Manages the order of invitation related processes for traffic across the internet. */

import agent_management from "./agent_management.js";
import common from "../../../common/common.js";
import getAddress from "../../utilities/getAddress.js";
import mask from "../../utilities/mask.js";
import sender from "../transmission/sender.js";
import service from "../../test/application/service.js";
import transmit_http from "../transmission/transmit_http.js";
import transmit_ws from "../transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

const invite = function terminal_server_services_invite(socketData:socketData, transmit:transmit_type):void {
    const data:service_invite = socketData.data as service_invite,
        remoteIP:string = (vars.test.type === "service")
            ? null
            : getAddress(transmit).remote.address,
        inviteHttp = function terminal_server_services_invite_inviteHttp(agent:"agentRequest"|"agentSource"):void {
            const payload:socketData = {
                    data: data,
                    service: "invite"
                },
                httpConfig:config_http_request = {
                    agent: "",
                    agentType: data.type,
                    callback: null,
                    ip: data[agent].ipSelected,
                    payload: payload,
                    port: data[agent].ports.http,
                    stream: false
                };
            if (vars.test.type === "service") {
                service.evaluation(payload);
            } else {
                transmit_http.request(httpConfig);
            }
        },
        addAgent = function terminal_server_services_invite_addAgent(type:agentTransmit):void {
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
                                ipAll: data[type].ipAll,
                                ipSelected: remoteIP,
                                name: data[type].nameUser,
                                ports: data[type].ports,
                                secret: data[type].secret,
                                shares: data[type].shares,
                                status: "active"
                            }
                        }
                    },
                agentFrom: vars.identity.hashDevice,
                identity: (data.type === "device" && (data.action === "invite-complete" || data.action === "invite-identity"))
                    ? {
                        hashDevice: null,
                        hashUser: data[type].hashUser,
                        nameDevice: null,
                        nameUser: data[type].nameUser,
                        secretDevice: null,
                        secretUser: data[type].secret
                    }
                    : null
            };
            if (vars.test.type !== "service") {
                agent_management({
                    data: addAgentData,
                    service: "agent-management"
                });
                if (type === "agentRequest") {
                    const keys:string[] = Object.keys(addAgentData.agents[data.type]);
                    if (data.type === "device") {
                        keys.forEach(function terminal_server_services_invite_addAgent_each(device:string):void {
                            if (device !== vars.identity.hashDevice) {
                                transmit_ws.open.agent({
                                    agent: device,
                                    agentType: "device",
                                    callback: null
                                });
                            }
                        });
                    } else {
                        transmit_ws.open.agent({
                            agent: keys[0],
                            agentType: "user",
                            callback: null
                        });
                    }
                }
            }
        },
       /**
         * Methods for processing the various stages of the invitation process.
         * The "invite-complete" step executes as the final step in the terminal at both ends of the transaction.
         * ```typescript
         * interface module_inviteActions {
         *     "invite-start"   : () => void; // Step 1: At local browser send invitation message to local terminal.
         *     "invite-request" : () => void; // Step 2: At local terminal forward invitation message to remote terminal.
         *     "invite-ask"     : () => void; // Step 3: At remote terminal send invitation message to remote browser.
         *     "invite-answer"  : () => void; // Step 4: At remote browser send invitation answer to remote terminal.
         *     "invite-response": () => void; // Step 5: At remote terminal send invitation answer to local terminal.
         *     "invite-complete": () => void; // Step 6: At local terminal send new agent data to local browser.
         *                                    // Step 8: At remote terminal apply new identifiers, send new agent data to remote browser, open necessary sockets.
         *     "invite-identity": () => void; // Step 7: At local terminal send device and identity data by agent type to remote terminal.
         * }
         * ```
         * ``` text
         *               Local               |              Remote
         * ----------------------------------|----------------------------------
         *                 start 1           |    request 2                ask 3
         * x >----------------> xx >>--------|-------->> xx >----------------> x
         * 6 complete            5 response  |            4 answer
         * x <----------------< xx <<--------|--------<< xx <----------------< x
         *                                   |   identity 7           complete 8
         *                      xx >>--------|-------->> xx >----------------> x
         * KEY
         * > - Movement in/out of browser
         * >> - Movement across a network
         * x - Browser instance
         * xx - Shell instance
         * ``` */
        actions:module_inviteActions = {
            "invite-start": function terminal_server_services_invite_start():void {
                // Step 1
                // formulation - local browser
                // execution   - local terminal
                // purpose     - Start the invitation process
                mask.mask(vars.identity.hashDevice, function terminal_server_services_invite_start_mask(key:string):void {
                    data.agentRequest.session = key;
                    data.action = "invite-request";
                    if (vars.test.type === "service") {
                        service.evaluation({
                            data: data,
                            service: "invite"
                        });
                    } else {
                        inviteHttp("agentSource");
                        sender.broadcast({
                            data: data,
                            service: "invite"
                        }, "browser");
                    }
                });
            },
            "invite-request": function terminal_server_services_invite_request():void {
                // Step 2
                // formulation - local terminal
                // execution   - remote terminal
                // purpose     - Push the invitation to remote user UI
                data.action = "invite-ask";
                data.agentRequest.ipSelected = remoteIP;
                if (vars.test.type === "service") {
                    service.evaluation({
                        data: data,
                        service: "invite"
                    });
                } else {
                    sender.broadcast({
                        data: data,
                        service: "invite"
                    }, "browser");
                }
            },
            "invite-ask": function terminal_server_services_invite_ask():void {
                // Step 3
                // formulation - remote terminal
                // execution   - remote browser
                // purpose     - Display the invitation in the browser
                return null;
            },
            "invite-answer": function terminal_server_services_invite_answer():void {
                // Step 4
                // formulation - remote browser
                // execution   - remote terminal
                // purpose     - Inform the terminal of the answer to the invitation
                mask.mask(vars.identity.hashDevice, function terminal_server_services_invite_answer_mask(key:string):void {
                    data.action = "invite-response";
                    if (data.status === "accepted") {
                        const session:string = key;
                        if (data.type === "device") {
                            data.agentSource.devices = vars.agents.device;
                            data.agentSource.ipAll = vars.network.addresses;
                            data.agentSource.ports = vars.network.ports;
                            data.agentSource.secret = vars.identity.secretUser;
                            data.agentSource.session = session;
                        } else {
                            const userData:userData = common.userData(vars.agents.device, "user", "");
                            data.agentSource = {
                                devices: null,
                                hashUser: vars.identity.hashUser,
                                ipAll: userData[1],
                                ipSelected: data.agentSource.ipSelected,
                                modal: data.agentSource.modal,
                                nameUser: vars.identity.nameUser,
                                ports: vars.network.ports,
                                secret: vars.identity.secretUser,
                                session: session,
                                shares: userData[0]
                            };
                        }
                    }
                    if (vars.test.type === "service") {
                        service.evaluation({
                            data: data,
                            service: "invite"
                        });
                    } else {
                        inviteHttp("agentRequest");
                    }
                });
            },
            "invite-response": function terminal_server_services_invite_response():void {
                // Step 5
                // formulation - remote terminal
                // execution   - local terminal
                // purpose     - Respond with the invitation answer
                const unmask = function terminal_server_services_invite_response_unmask(test:boolean):void {
                    if (test === true) {
                        if (data.status === "accepted") {
                            const userData:userData = common.userData(vars.agents.device, "user", "");
                            addAgent("agentSource");
                            data.action = "invite-complete";
                            data.agentRequest = {
                                devices: (data.type === "device")
                                    ? vars.agents.device
                                    : null,
                                hashUser: vars.identity.hashUser,
                                ipAll: userData[1],
                                ipSelected: data.agentRequest.ipSelected,
                                modal: data.agentRequest.modal,
                                nameUser: vars.identity.nameUser,
                                ports: vars.network.ports,
                                secret: vars.identity.secretUser,
                                session: "",
                                shares: (data.type === "device")
                                    ? {}
                                    : userData[0]
                            };
                            // Update existing other devices of the new relationship
                            sender.broadcast({
                                data: data,
                                service: "invite"
                            }, "device");

                            // Send identity data to the remote (and their devices)
                            data.action = "invite-identity";
                            if (vars.test.type === "service") {
                                service.evaluation({
                                    data: data,
                                    service: "invite"
                                });
                            } else {
                                inviteHttp("agentSource");
                            }
                        }
                        data.action = "invite-complete";
                        if (vars.test.type === "service" && data.status !== "accepted") {
                            service.evaluation({
                                data: data,
                                service: "invite"
                            });
                        }
                        if (vars.test.type !== "service") {
                            sender.broadcast({
                                data: data,
                                service: "invite"
                            }, "browser");
                        }
                    }
                };
                if (vars.test.type === "service") {
                    unmask(true);
                } else {
                    mask.unmaskToken(data.agentRequest.session, vars.identity.hashDevice, unmask);
                }
            },
            "invite-complete": function terminal_server_services_invite_complete():void {
                // Step 6/8
                // formulation - local/remote terminal
                // execution   - local/remote browser, local/remote devices
                // purpose     - Update the UI with the invitation changes
                addAgent("agentRequest");
                sender.broadcast(socketData, "browser");
            },
            "invite-identity": function terminal_server_services_invite_identity():void {
                // Step 7
                // formulation - local terminal
                // execution   - remote terminal
                // purpose     - Receive identifying data at the remote, remote opens sockets
                const unmask = function terminal_server_services_invite_identity_unmask(test:boolean):void {
                    if (test === true) {
                        data.action = "invite-complete";
                        if (vars.test.type === "service") {
                            service.evaluation({
                                data: data,
                                service: "invite"
                            });
                        } else {
                            sender.broadcast({
                                data: data,
                                service: "invite"
                            }, "device");
                            addAgent("agentRequest");
                        }
                    }
                };
                if (vars.test.type === "service") {
                    unmask(true);
                } else {
                    mask.unmaskToken(data.agentSource.session, vars.identity.hashDevice, unmask);
                }
            }
        };
    actions[data.action]();
};

export default invite;