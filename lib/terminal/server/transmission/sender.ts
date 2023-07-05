/* lib/terminal/server/transmission/sender - Abstracts away the communication channel from the message. */

import deviceMask from "../services/deviceMask.js";
import settings from "../services/settings.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * An abstraction to manage traffic output abstracted away from specific network protocols.
 * ```typescript
 * interface module_transmit_sender {
 *     agentQueue: (type:socketType, agent:string, payload:socketData) => void;  // If the agent is offline the message will be queued.
 *     broadcast : (payload:socketData, listType:agentType | "browser") => void; // Send a specified ata package to all agents of a given agent type.
 *     route     : (destination:agentCopy, socketData:socketData, callback:(socketData:socketData) => void) => void; // Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
 *     send      : (data:socketData, agents:transmit_agents) => void;            // Send a specified data package to a specified agent
 * }
 * ``` */
const sender:module_transmit_sender = {
    agentQueue: function terminal_server_transmission_sender_agentQueue(type:socketType, agent:string, payload:socketData) {
        const socket:websocket_client = transmit_ws.socketList[type as agentType][agent];
        if (socket !== undefined && socket !== null && (socket.status === "open" || socket.status === "pending")) {
            transmit_ws.queue(payload, socket, 1);
        } else if (vars.test.type === "" && (type === "device" || type === "user") && vars.settings[type][agent] !== undefined) {
            const service_exclusions: service_type[] = [
                "agent-hash",
                "agent-management",
                "agent-online",
                "agent-status",
                "copy-list-request",
                "copy-list",
                "copy-send-file",
                "cut",
                "error",
                "hash-share",
                "invite",
                "GET",
                "log",
                "response-no-action",
                "settings",
                "test-browser"
            ];
            if (service_exclusions.indexOf(payload.service) < 0) {
                if (vars.settings.queue[type][agent] === undefined) {
                    vars.settings.queue[type][agent] = [];
                }
                if (vars.settings.queue[type][agent].length > 0 && JSON.stringify(vars.settings.queue[type][agent][vars.settings.queue[type][agent].length - 1]) === JSON.stringify(payload)) {
                    return;
                }
                vars.settings.queue[type][agent].push(payload);
                const settingsData:service_settings = {
                    settings: vars.settings.queue,
                    type: "queue"
                };
                settings({
                    data: settingsData,
                    service: "settings"
                });
            }
        }
    },
    // send to all agents of a given type
    broadcast: function terminal_server_transmission_sender_broadcast(payload:socketData, listType:agentType | "browser"):void {
        if (listType === "browser") {
            const list:string[] = Object.keys(transmit_ws.socketList.browser);
            list.forEach(function terminal_server_transmission_transmitWs_broadcast_each(agent:string):void {
                transmit_ws.queue(payload, transmit_ws.socketList.browser[agent], 1);
            });
        } else {
            const list:string[] = Object.keys(vars.settings[listType]);
            let index:number = list.length;
            if (index > 0) {
                do {
                    index = index - 1;
                    if (listType !== "device" || (listType === "device" && list[index] !== vars.settings.hashDevice)) {
                        sender.agentQueue(listType, list[index], payload);
                    }
                } while (index > 0);
            }
        }
    },

    // direct a data payload to a specific agent as determined by the service name and the agent details in the data payload
    route: function terminal_server_transmission_sender_route(config:config_senderRoute):void {
        const data:service_copy = config.socketData.data as service_copy,
            sendSelf = function terminal_server_transmission_sender_route_sendSelf(device:string):void {
                if (device === vars.settings.hashDevice) {
                    config.callback(config.socketData);
                } else {
                    sender.send(config.socketData, {
                        device: device,
                        user: vars.settings.hashUser
                    });
                }
            },
            unmask = function terminal_server_transmission_sender_route_unmask(device:string, callback:(device:string) => void):void {
                // same user
                if (device.length === 141) {
                    // masked device
                    deviceMask.unmask(device, callback);
                } else if (device.length === 128) {
                    // normal device
                    callback(device);
                } else if (destination.share.length === 128) {
                    // resolve from share
                    callback(deviceMask.resolve(destination));
                }
            };
        let destination:fileAgent = data[config.destination];
        if (destination.user === vars.settings.hashUser) {
            // same user, send to device
            unmask(destination.device, sendSelf);
        } else {
            const resolveUser = function terminal_server_transmission_sender_route_resolveUser(user:string):string {
                    const socketKeys:string[] = Object.keys(transmit_ws.status);
                    let indexKeys:number = socketKeys.length,
                        indexList:number = 0;
                    if (indexKeys > 0) {
                        do {
                            indexKeys = indexKeys - 1;
                            indexList = transmit_ws.status[socketKeys[indexKeys]].length;
                            if (indexList > 0) {
                                do {
                                    indexList = indexList - 1;
                                    if (transmit_ws.status[socketKeys[indexKeys]][indexList].type === "user" && transmit_ws.status[socketKeys[indexKeys]][indexList].name === user) {
                                        return socketKeys[indexKeys];
                                    }
                                } while (indexList > 0);
                            }
                        } while (indexKeys > 0);
                    }
                    return "";
                },
                sendUser = function terminal_server_transmission_sender_route_sendUser(device:string):void {
                    if (device === vars.settings.hashDevice) {
                        // if current device holds socket to destination user, send to user
                        sender.send(config.socketData, {
                            device: "",
                            user: destination.user
                        });
                    } else {
                        // send to device containing socket to destination user
                        unmask(device, function terminal_server_transmission_sender_route_sendUser_callback(unmasked:string):void {
                            sender.send(config.socketData, {
                                device: unmasked,
                                user: vars.settings.hashUser
                            });
                        });
                    }
                },
                userDevice:string = resolveUser(destination.user);

            if (userDevice === "") {
                // if no device contains a socket to the user send to agentRequest only if
                // * destination is not agent request
                // * operation requires more than two agents
                if (config.destination !== "agentRequest" && data.agentWrite !== null && data.agentWrite !== undefined) {
                    destination = data.agentRequest;
                    if (destination.user === vars.settings.hashUser) {
                        // if agentRequest is the same user, send to device
                        unmask(destination.device, sendSelf);
                    } else {
                        // resolve device containing socket to agentRequest
                        const requestor:string = resolveUser(data.agentRequest.user);
                        if (requestor !== "") {
                            sendUser(requestor);
                        }
                    }
                }
            } else {
                sendUser(userDevice);
            }
        }

        /*const payload:service_copy = config.socketData.data as service_copy,
            agent:fileAgent = payload[config.destination];
        if (agent.user === vars.settings.hashUser) {
            const deviceCallback = function terminal_server_transmission_sender_route_deviceCallback(device:string):void {
                    if (vars.settings.device[device] !== undefined) {
                        agent.device = device;
                    }
                    if (device === vars.settings.hashDevice) {
                        // same device
                        config.callback(config.socketData);
                    } else {
                        sender.send(config.socketData, {
                            device: agent.device,
                            user: agent.user
                        });
                    }
                },
                agentLength:number = agent.device.length;
            if (agentLength === 141) {
                deviceMask.unmask(agent.device, deviceCallback);
            } else {
                deviceCallback(deviceMask.resolve(agent));
            }
        } else {
            let count:number = 0;
            const copyAgents:agentCopy[] = ["agentRequest", "agentSource", "agentWrite"],
                agentSelf = function terminal_server_transmission_sender_route_agentSelf(type:agentCopy):void {
                    const maskCallback = function terminal_server_transmission_sender_route_agentSelf_maskCallback():void {
                        count = count + 1;
                        if (count === 2) {
                            sender.send(config.socketData, {
                                device: agent.device,
                                user: agent.user
                            });
                        }
                    };
                    if (payload[type] !== null && payload[type] !== undefined && payload[type].user === vars.settings.hashUser) {
                        if (payload[type].share === "") {
                            deviceMask.mask(payload[type], maskCallback);
                        } else {
                            payload[type].device = "";
                            maskCallback();
                        }
                    } else {
                        maskCallback();
                    }
                };
            copyAgents.splice(copyAgents.indexOf(config.destination), 1);
            agentSelf(copyAgents[0]);
            agentSelf(copyAgents[1]);
        }*/
    },

    // send a specified data package to a specified agent
    send: function terminal_server_transmission_sender_send(data:socketData, agents:transmit_agents):void {
        if (agents !== null) {
            if (agents.user === "browser") {
                sender.broadcast(data, "browser");
            } else {
                if (agents.user === vars.settings.hashUser) {
                    if (agents.device.length === 141) {
                        deviceMask.unmask(agents.device, function terminal_server_transmission_sender_send_unmask(actualDevice:string):void {
                            sender.agentQueue("device", actualDevice, data);
                        });
                    } else {
                        sender.agentQueue("device", agents.device, data);
                    }
                } else {
                    sender.agentQueue("user", agents.user, data);
                }
            }
        }
    }
};

export default sender;