/* lib/terminal/server/transmission/sender - Abstracts away the communication channel from the message. */

import mask from "../../utilities/mask.js";
import settings from "../services/settings.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * An abstraction to manage traffic output abstracted away from specific network protocols.
 * ```typescript
 * interface module_transmit_sender {
 *     routeFile : (destination:agentCopy, socketData:socketData, callback:(socketData:socketData) => void) => void; // Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
 *     send      : (data:socketData, agents:transmit_agents|string) => void; // Send a specified data package to a specified agent
 * }
 * ``` */
const sender:module_transmit_sender = {

    // direct a data payload to a specific agent as determined by the service name and the agent details in the data payload
    routeFile: function terminal_server_transmission_sender_routeFile(config:config_senderRoute):void {
        const sendSelf = function terminal_server_transmission_sender_route_sendSelf(device:string):void {
                if (device === vars.identity.hashDevice) {
                    config.callback({
                        data: config.data,
                        service: config.service
                    });
                } else {
                    sender.send({
                        data: config.data,
                        service: config.service
                    }, {
                        device: device,
                        user: vars.identity.hashUser
                    });
                }
            },
            unmask = function terminal_server_transmission_sender_route_unmask(device:string, callback:(device:string) => void):void {
                // same user
                if (device.length === 141) {
                    // masked device
                    mask.unmaskDevice(device, callback);
                } else if (device.length === 128) {
                    // normal device
                    callback(device);
                } else if (destination.share.length === 128) {
                    // resolve from share
                    callback(mask.resolve(destination));
                }
            };
        let destination:fileAgent = config.data[config.destination];
        if (destination.user === vars.identity.hashUser) {
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
                    if (device === vars.identity.hashDevice) {
                        // if current device holds socket to destination user, send data to user with masked device identity
                        mask.fileAgent(config.data[config.origination], function terminal_server_transmission_sender_route_sendUser_mask(device:string):void {
                            config.data[config.origination].device = device;
                            sender.send({
                                data: config.data,
                                service: config.service
                            }, {
                                device: "",
                                user: destination.user
                            });
                        });
                    } else {
                        // send to device containing socket to destination user
                        unmask(device, function terminal_server_transmission_sender_route_sendUser_callback(unmasked:string):void {
                            sender.send({
                                data: config.data,
                                service: config.service
                            }, {
                                device: unmasked,
                                user: vars.identity.hashUser
                            });
                        });
                    }
                },
                userDevice:string = resolveUser(destination.user);

            if (userDevice === "") {
                // if no device contains a socket to the user send to agentRequest only if
                // * destination is not agent request
                // * operation requires more than two agents
                if (config.destination !== "agentRequest" && config.data.agentWrite !== null && config.data.agentWrite !== undefined) {
                    destination = config.data.agentRequest;
                    if (destination.user === vars.identity.hashUser) {
                        // if agentRequest is the same user, send to device
                        unmask(destination.device, sendSelf);
                    } else {
                        // resolve device containing socket to agentRequest
                        const requestor:string = resolveUser(config.data.agentRequest.user);
                        if (requestor !== "") {
                            sendUser(requestor);
                        }
                    }
                }
            } else {
                sendUser(userDevice);
            }
        }
    },

    // send a specified data package to a specified agent
    send: function terminal_server_transmission_sender_send(data:socketData, agents:transmit_agents|string):void {
        if (agents !== null) {
            const agentQueue = function terminal_server_transmission_sender_send_agentQueue(type:socketType, agent:string, payload:socketData) {
                    const socket:websocket_client = transmit_ws.getSocket(type, agent);
                    if (socket !== null && (socket.status === "open" || socket.status === "pending")) {
                        transmit_ws.queue(payload, socket, 1);
                    } else if (vars.test.type === "" && (type === "device" || type === "user") && vars.agents[type][agent] !== undefined) {
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
                broadcast = function terminal_server_transmission_sender_send_broadcast(listType:string) {
                    const list:string[] = transmit_ws.getSocketKeys(listType);
                    if (list.length > 0) {
                        let index:number = list.length;
                        if (index > 0) {
                            if (listType === "user" || listType === "device") {
                                do {
                                    index = index - 1;
                                    if (listType !== "device" || (listType === "device" && list[index] !== vars.identity.hashDevice)) {
                                        agentQueue(listType, list[index], data);
                                    }
                                } while (index > 0);
                            } else {
                                list.forEach(function terminal_server_transmission_sender_send_broadcast(agent:string):void {
                                    transmit_ws.queue(data, transmit_ws.socketList[listType][agent], 1);
                                });
                            }
                        }
                    }
                };
            if (typeof agents === "string") {
                broadcast(agents);
            } else {
                if (agents.user === "browser") {
                    broadcast("browser");
                } else {
                    if (agents.user === vars.identity.hashUser) {
                        if (agents.device.length === 141) {
                            mask.unmaskDevice(agents.device, function terminal_server_transmission_sender_send_unmask(actualDevice:string):void {
                                agentQueue("device", actualDevice, data);
                            });
                        } else {
                            agentQueue("device", agents.device, data);
                        }
                    } else {
                        agentQueue("user", agents.user, data);
                    }
                }
            }
        }
    }
};

export default sender;