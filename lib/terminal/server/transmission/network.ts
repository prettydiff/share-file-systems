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
    /* Library for handling all traffic related to incoming messages. */
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
            },
            unmask = function terminal_server_transmission_network_receiver_unmask(actualDevice:string):void {
                if (actualDevice === vars.identity.hashDevice && actions[services] !== undefined) {
                    actions[services](socketData, transmit);
                }
            },
            device:string = (socketData.route === null || socketData.route === undefined)
                ? null
                : socketData.route.device;
        if (socketData.route.user === vars.identity.hashUser) {
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
            if (device !== null && device.length === 141) {
                mask.unmaskDevice(device, unmask);
            } else {
                if (device === "broadcast") {
                    network.send(socketData);
                }
                if (
                    (
                        device === "broadcast" ||
                        device === vars.identity.hashDevice ||
                        (transmit.socket.type === "user" && device === "") ||
                        (device === null && transmit.socket.type !== "device" && transmit.socket.type !== "user")
                    ) && actions[services] !== undefined
                ) {
                    actions[services](socketData, transmit);
                }
            }
        } else {
            network.send(socketData);
        }
    },
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

    // direct a data payload to a specific agent as determined by the service name and the agent details in the data payload
    routeFile: function terminal_server_transmission_network_routeFile(config:config_routeFile):void {
        const sendSelf = function terminal_server_transmission_network_routeFile_sendSelf(device:string):void {
                if (device === vars.identity.hashDevice) {
                    config.callback({
                        data: config.data,
                        route: null,
                        service: config.service
                    });
                } else {
                    network.send({
                        data: config.data,
                        route: {
                            device: device,
                            user: vars.identity.hashUser
                        },
                        service: config.service
                    });
                }
            },
            unmask = function terminal_server_transmission_network_routeFile_unmask(device:string, callback:(device:string) => void):void {
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
            const resolveUser = function terminal_server_transmission_network_routeFile_resolveUser(user:string):string {
                    const socketKeys:string[] = Object.keys(transmit_ws.socketList);
                    let indexKeys:number = socketKeys.length,
                        indexList:number = 0;
                    if (indexKeys > 0) {
                        do {
                            indexKeys = indexKeys - 1;
                            indexList = transmit_ws.socketList[socketKeys[indexKeys]].length;
                            if (indexList > 0) {
                                do {
                                    indexList = indexList - 1;
                                    if (transmit_ws.socketList[socketKeys[indexKeys]][indexList].type === "user" && transmit_ws.socketList[socketKeys[indexKeys]][indexList].name === user) {
                                        return socketKeys[indexKeys];
                                    }
                                } while (indexList > 0);
                            }
                        } while (indexKeys > 0);
                    }
                    return "";
                },
                sendUser = function terminal_server_transmission_network_routeFile_sendUser(device:string):void {
                    if (device === vars.identity.hashDevice) {
                        // if current device holds socket to destination user, send data to user with masked device identity
                        mask.fileAgent(config.data[config.origination], function terminal_server_transmission_network_routeFile_sendUser_mask(device:string):void {
                            config.data[config.origination].device = device;
                            network.send({
                                data: config.data,
                                route: {
                                    device: "",
                                    user: destination.user
                                },
                                service: config.service
                            });
                        });
                    } else {
                        // send to device containing socket to destination user
                        unmask(device, function terminal_server_transmission_network_routeFile_sendUser_callback(unmasked:string):void {
                            network.send({
                                data: config.data,
                                route: {
                                    device: unmasked,
                                    user: vars.identity.hashUser
                                },
                                service: config.service
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

    // send a specified data package to either a specified agent or broadcast by socket type or devices of a user
    send: function terminal_server_transmission_network_send(data:socketData):void {
        if (data.route === null) {
            return;
        }
        const agentQueue = function terminal_server_transmission_network_send_agentQueue(type:socketType, agent:string, payload:socketData):void {
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
                            route: null,
                            service: "settings"
                        });
                    }
                }
            },
            broadcast = function terminal_server_transmission_network_send_broadcast(listType:string):void {
                const list:string[] = transmit_ws.getSocketKeys(listType);
                if (list.length > 0) {
                    let index:number = list.length;
                    if (index > 0) {
                        if (listType === "user" || listType === "device") {
                            do {
                                index = index - 1;
                                if (listType !== "device" || (listType === "device" && list[index] !== vars.identity.hashDevice)) {
                                    if (listType === "user") {
                                        data.route.user = list[index];
                                    } else if (listType === "device") {
                                        data.route.device = list[index];
                                    }
                                    agentQueue(listType, list[index], data);
                                }
                            } while (index > 0);
                        } else {
                            list.forEach(function terminal_server_transmission_network_send_broadcast_each(agent:string):void {
                                transmit_ws.queue(data, transmit_ws.socketMap[listType][agent], 1);
                            });
                        }
                    }
                }
            },
            unmask = function terminal_server_transmission_network_send_unmask(actualDevice:string):void {
                if (actualDevice !== "") {
                    agentQueue("device", actualDevice, data);
                }
            },
            device:string = data.route.device,
            user:string = data.route.user;
        if (device === "browser" || user === "browser") {
            // broadcast to browser
            broadcast("browser");
        } else if (user === "broadcast") {
            // broadcast to all users
            data.route = {
                device: "broadcast",
                user: ""
            };
            broadcast("user");
        } else if (user === vars.identity.hashUser) {
            // same user
            if (device === "broadcast") {
                // broadcast to all devices
                broadcast("device");
            } else if (vars.agents.device[device] !== undefined) {
                if (data.route.device.length === 141) {
                    mask.unmaskDevice(device, unmask);
                } else {
                    agentQueue("device", device, data);
                }
            }
        } else if (vars.agents.user[user] !== undefined) {
            // route to user
            const devices:string[] = Object.keys(transmit_ws.socketList);
            let lenDevice:number = devices.length,
                deviceList:socketListItem[],
                lenList:number = 0;
            do {
                lenDevice = lenDevice - 1;
                deviceList = transmit_ws.socketList[devices[lenDevice]];
                lenList = deviceList.length;
                if (lenList > 0) {
                    do {
                        lenList = lenList - 1;
                        if (deviceList[lenList].type === "user" && deviceList[lenList].name === user) {
                            if (devices[lenDevice] === vars.identity.hashDevice) {
                                // socket to user on current device
                                agentQueue("user", user, data);
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
};

export default network;