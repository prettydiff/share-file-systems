/* lib/terminal/server/transmission/network - Generic transmission tools shared between HTTP and WS libraries. */

import agent_hash from "../services/agent_hash.js";
import agent_management from "../services/agent_management.js";
import agent_online from "../services/agent_online.js";
import agent_status from "../services/agent_status.js";
import browser from "../../test/application/browser.js";
import browserLog from "../services/browserLog.js";
import fileCopy from "../services/fileCopy.js";
import fileSystem from "../services/fileSystem.js";
import hashShare from "../services/hashShare.js";
import importSettings from "../services/importSettings.js";
import invite from "../services/invite.js";
import log from "../../utilities/log.js";
import mask from "../../utilities/mask.js";
import message from "../services/message.js";
import perf from "../../commands/library/perf.js";
import settings from "../services/settings.js";
import terminal from "../services/terminal.js";
import transmit_http from "./transmit_http.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * A collection of transmission tools for use with either HTTP or WS.
 * ```typescript
 * interface module_transmit_tools {
 *     logger: (config:config_transmit_logger) => void;
 *     receiver: (socketData:socketData, transmit:transmit_type) => void;
 *     responder: (socketData:socketData, transmit:transmit_type) => void;
 * }
 * ``` */
const network:module_transmit_network = {
    // direct a data payload to a specific agent as determined by the service name and the agent details in the data payload
    fileRoute: function terminal_server_transmission_network_fileRoute(config:config_fileRoute):void {
        const data:service_copy = config.socketData.data as service_copy,
            sendSelf = function terminal_server_transmission_network_fileRoute_sendSelf(device:string):void {
                if (device === vars.identity.hashDevice) {
                    config.callback(config.socketData);
                } else {
                    network.send(config.socketData, {
                        device: device,
                        user: vars.identity.hashUser
                    });
                }
            },
            unmask = function terminal_server_transmission_network_fileRoute_unmask(device:string, callback:(device:string) => void):void {
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
        let destination:fileAgent = data[config.destination];
        if (destination.user === vars.identity.hashUser) {
            // same user, send to device
            unmask(destination.device, sendSelf);
        } else {
            const resolveUser = function terminal_server_transmission_network_fileRoute_resolveUser(user:string):string {
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
                sendUser = function terminal_server_transmission_network_fileRoute_sendUser(device:string):void {
                    if (device === vars.identity.hashDevice) {
                        // if current device holds socket to destination user, send data to user with masked device identity
                        mask.fileAgent(data[config.origination], function terminal_server_transmission_network_fileRoute_sendUser_mask(device:string):void {
                            data[config.origination].device = device;
                            network.send(config.socketData, {
                                device: "",
                                user: destination.user
                            });
                        });
                    } else {
                        // send to device containing socket to destination user
                        unmask(device, function terminal_server_transmission_network_fileRoute_sendUser_callback(unmasked:string):void {
                            network.send(config.socketData, {
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
                if (config.destination !== "agentRequest" && data.agentWrite !== null && data.agentWrite !== undefined) {
                    destination = data.agentRequest;
                    if (destination.user === vars.identity.hashUser) {
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
    },

    // logs data about incoming and outgoing messages
    logger: function terminal_server_transmission_network_logger(config:config_transmit_logger):void {
        vars.network.count[config.transmit.type][config.direction] = vars.network.count[config.transmit.type][config.direction] + 1;
        vars.network.size[config.transmit.type][config.direction] = vars.network.size[config.transmit.type][config.direction] + config.size;
        if (vars.settings.verbose === true) {
            if (config.socketData.service === "GET") {
                const data:string = (typeof config.socketData.data === "string")
                    ? config.socketData.data
                    : JSON.stringify(config.socketData.data);
                log([
                    `GET response to browser for ${data}`
                ]);
            } else {
                log([
                    `${config.direction} ${config.transmit.type} from ${config.transmit.socket.type} ${config.transmit.socket.hash}`,
                    config.socketData.service,
                    // @ts-ignore - A deliberate type violation to output a formatted object to the terminal
                    config.socketData.data.toString(),
                    ""
                ]);
            }
        }
    },

    // function for handling all traffic related to incoming messages.
    receiver: function terminal_server_transmission_network_receiver(socketData:socketData, transmit:transmit_type):void {
        const services:service_type = socketData.service,
            actions:transmit_receiver = {
                "agent-hash": agent_hash,
                "agent-management": agent_management,
                "agent-online": agent_online,
                "agent-status": agent_status,
                "copy": fileCopy.route,
                "copy-list": fileCopy.route,
                "copy-list-request": fileCopy.route,
                "copy-send-file": fileCopy.actions.fileRespond,
                "cut": fileCopy.route,
                "file-system": fileSystem.route,
                "file-system-details": fileSystem.route,
                "file-system-status": fileSystem.route,
                "file-system-string": fileSystem.route,
                "hash-share": hashShare,
                "import": importSettings,
                "invite": invite,
                "log": browserLog,
                "message": message,
                "perf-socket": perf.conclude.socket,
                "settings": settings,
                "socket-list": transmit_ws.statusUpdate,
                "terminal": terminal.input,
                "test-browser": browser.methods.route
            };
        if (vars.environment.command === "perf" && services.indexOf("perf-") !== 0) {
            return;
        }
        if (vars.test.type === "service") {
            if (services === "invite") {
                vars.test.socket = null;
            } else {
                vars.test.socket = transmit.socket as httpSocket_response;
            }
        }
        if (actions[services] !== undefined) {
            actions[services](socketData, transmit);
        }
    },

    // function for generating generalized HTTP responses
    responder: function terminal_server_transmission_network_responder(data:socketData, transmit:transmit_type):void {
        if (transmit === null || transmit.socket === null) {
            return;
        }
        if (transmit.type === "http") {
            const serverResponse:httpSocket_response = transmit.socket as httpSocket_response;
            transmit_http.respond({
                message: JSON.stringify(data),
                mimeType: "application/json",
                responseType: data.service,
                serverResponse: serverResponse
            }, false, "");
            // account for security of http requests
        } else {
            const socket:websocket_client = transmit.socket as websocket_client;
            transmit_ws.queue(data, socket, 1);
        }
    },

    // send a specified data package to a specified agent
    send: function terminal_server_transmission_network_send(data:socketData, agents:transmit_agents|string):void {
        const agentQueue = function terminal_server_transmission_network_send_agentQueue(type:socketType, agent:string, payload:socketData) {
                const socket:websocket_client = transmit_ws.socketList[type as agentType][agent];
                if (socket !== undefined && socket !== null && (socket.status === "open" || socket.status === "pending")) {
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
            broadcast = function terminal_server_transmission_network_send_broadcast(payload:socketData, listType:string):void {
                if (listType === "device" || listType === "user") {
                    const list:string[] = Object.keys(vars.agents[listType]);
                    let index:number = list.length;
                    if (index > 0) {
                        do {
                            index = index - 1;
                            if (listType !== "device" || (listType === "device" && list[index] !== vars.identity.hashDevice)) {
                                agentQueue(listType, list[index], payload);
                            }
                        } while (index > 0);
                    }
                } else if (transmit_ws.socketList[listType] !== undefined) {
                    const list:string[] = Object.keys(transmit_ws.socketList[listType]);
                    list.forEach(function terminal_server_transmission_network_send_broadcast_each(namedSocket:string):void {
                        transmit_ws.queue(payload, transmit_ws.socketList.browser[namedSocket], 1);
                    });
                }
            };
        if (typeof agents === "string") {
            broadcast(data, agents);
        } else if (agents !== null) {
            if (agents.user === "browser") {
                broadcast(data, "browser");
            } else {
                if (agents.user === vars.identity.hashUser) {
                    if (agents.device.length === 141) {
                        mask.unmaskDevice(agents.device, function terminal_server_transmission_network_send_unmask(actualDevice:string):void {
                            agentQueue("device", actualDevice, data);
                        });
                    } else {
                        agentQueue("device", agents.device, data);
                    }
                } else if (vars.agents.user[agents.user] !== undefined) {
                    // route to user
                    const devices:string[] = Object.keys(transmit_ws.status);
                    let lenDevice:number = devices.length,
                        deviceList:socketListItem[],
                        lenList:number = 0;
                    do {
                        lenDevice = lenDevice - 1;
                        deviceList = transmit_ws.status[devices[lenDevice]];
                        lenList = deviceList.length;
                        if (lenList > 0) {
                            do {
                                lenList = lenList - 1;
                                if (deviceList[lenList].type === "user" && deviceList[lenList].name === agents.user) {
                                    if (devices[lenDevice] === vars.identity.hashDevice) {
                                        // socket to user on current device
                                        agentQueue("user", agents.user, data);
                                    } else {
                                        // send to device containing user socket
                                        agentQueue("device", devices[lenDevice], data);
                                    }
                                    return;
                                }
                            } while (lenList > 0);
                        }
                    } while (lenDevice > 0);
                }
            }
        }
    }
};

export default network;