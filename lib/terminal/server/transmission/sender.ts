/* lib/terminal/server/transmission/sender - Abstracts away the communication channel from the message. */

import deviceMask from "../services/deviceMask.js";
import fileSystem from "../services/fileSystem.js";
import transmit_http from "./transmit_http.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * An abstraction to manage traffic output abstracted away from specific network protocols.
 * ```typescript
 * interface module_sender {
 *     send     : (data:socketData, device:string, user:string) => void;      // Send a specified data package to a specified agent
 *     broadcast: (payload:socketData, listType:websocketClientType) => void; // Send a specified ata package to all agents of a given agent type.
 *     route    : (payload:socketData, agent:fileAgent, action:(payload:socketData, device:string, thirdDevice:string) => void) => void; // Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
 * }
 * ``` */
const sender:module_sender = {
    // send a specified data package to a specified agent
    send: function terminal_server_transmission_sender_send(data:socketData, device:string, user:string):void {
        if (user === "browser") {
            transmit_ws.send(data, transmit_ws.clientList.browser[device], "browser");
        } else {
            const protocols = function terminal_server_transmission_sender_send_protocols(agent:string, agentType:agentType):void {
                const socket:socketClient = transmit_ws.clientList[agentType][agent];
                if (socket !== undefined && socket !== null && socket.status === "open") {
                    transmit_ws.send(data, socket, agentType);
                } else {
                    transmit_http.request({
                        agent: agent,
                        agentType: agentType,
                        callback: null,
                        ip: vars.settings[agentType][agent].ipSelected,
                        payload: data,
                        port: vars.settings[agentType][agent].ports.http
                    });
                }
            };
            if (user === vars.settings.hashUser) {
                if (device.length === 141) {
                    deviceMask.unmask(device, function terminal_server_transmission_sender_send_unmask(actualDevice:string):void {
                        protocols(actualDevice, "device");
                    });
                } else {
                    protocols(device, "device");
                }
            } else {
                protocols(user, "user");
            }
        }
    },

    // send to all agents of a given type
    broadcast: function terminal_server_transmission_sender_broadcast(payload:socketData, listType:websocketClientType):void {
        if (listType === "browser") {
            const list:string[] = Object.keys(transmit_ws.clientList[listType]);
            list.forEach(function terminal_server_transmission_transmitWs_broadcast_each(agent:string):void {
                transmit_ws.send(payload, transmit_ws.clientList[listType][agent], "browser");
            });
        } else {
            const list:string[] = Object.keys(vars.settings[listType]);
            let index:number = list.length,
                socket:socketClient = null;
            
            if ((listType === "device" && index > 1) || (listType !== "device" && index > 0)) {
                do {
                    index = index - 1;
                    socket = transmit_ws.clientList[listType][list[index]];
                    if (socket !== undefined && socket !== null && socket.status === "open") {
                        transmit_ws.send(payload, socket, listType);
                    } else {
                        transmit_http.request({
                            agent: list[index],
                            agentType: listType,
                            callback: null,
                            ip: vars.settings[listType][list[index]].ipSelected,
                            payload: payload,
                            port: vars.settings[listType][list[index]].ports.http
                        });
                    }
                } while (index > 0);
            }
        }
    },

    // direct a data payload to a specific agent as determined by the service name and the agent details in the data payload
    route: function terminal_server_transmission_sender_route(payload:socketData, agent:fileAgent, action:(payload:socketData, device:string, thirdDevice:string) => void):void {
        const payloadData:service_copy = payload.data as service_copy,
            deviceDist = function terminal_server_transmission_sender_route_deviceDist(device:string, thirdDevice:string):void {
                if (device === vars.settings.hashDevice) {
                    const fileService:service_fileSystem = payload.data as service_fileSystem,
                        actionFile:actionFile|"copy"|"cut" = (fileService.action === undefined)
                            ? (payloadData.cut === true)
                                ? "cut"
                                : "copy"
                            : fileService.action;
                    if (
                        agent.user !== fileService.agentRequest.user && (
                            (agent.user === payloadData.agentWrite.user && (actionFile === "copy" || actionFile === "cut")) ||
                            (agent.user === payloadData.agentSource.user && (actionFile === "fs-destroy" || actionFile === "fs-new" || actionFile === "fs-rename" || actionFile === "fs-write"))
                        ) &&
                        vars.settings.device[device].shares[agent.share].readOnly === true
                    ) {
                        // read only violation if
                        // * routed to target device
                        // * specified share of target agent is read only
                        // * target user is different than requesting user
                        // * target user is agentWrite for copy/cut operations as these operations do not modify agentSource so routes to agentSource for copy/cut must not be considered for exclusion
                        // * target user is agentSource for other excluded actions
                        // * requested action modifies the file system
                        const status:service_fileSystem_status = {
                            agentRequest: payloadData.agentRequest,
                            agentTarget: agent,
                            fileList: null,
                            message: `Requested action <em>${actionFile}</em> cannot be performed in the read only share of the remote user.`
                        };
                        fileSystem.route.browser({
                            data: status,
                            service: "file-system-status"
                        });
                    } else {
                        action(payload, device, thirdDevice);
                    }
                } else {
                    sender.send(payload, device, vars.settings.hashUser);
                }
            },
            agentDist = function terminal_sever_transmission_sender_route_agentDist(destination:fileAgent, thirdAgent:fileAgent):void {
                if (destination.user === vars.settings.hashUser) {
                    const thirdDevice:string = deviceMask.resolve(thirdAgent),
                        third = function terminal_server_transmission_sender_route_agentDist_third(device:string):void {
                            if (thirdDevice !== null && thirdAgent.user === vars.settings.hashUser) {
                                if (thirdDevice.length === 141) {
                                    deviceMask.unmask(thirdDevice, function terminal_server_transmission_sender_route_agentDist_unmaskDevice_thirdAgent(thirdDeviceActual):void {
                                        deviceDist(device, thirdDeviceActual);
                                    });
                                } else {
                                    // 3 point operation, such as file copy, of same user
                                    deviceDist(device, thirdDevice);
                                }
                            } else {
                                deviceDist(device, null);
                            }
                        };
                    if (destination.device.length === 141) {
                        deviceMask.unmask(destination.device, function terminal_server_transmission_sender_route_agentDist_unmaskDevice(destinationDevice:string):void {
                            third(destinationDevice);
                        });
                    } else {
                        third(destination.device);
                    }
                } else {
                    // send to remote user
                    const copy:service_copy = payload.data as service_copy,
                        maskFlags:flagList = {
                            agentRequest: false,
                            agentSource: false,
                            agentWrite: false
                        },
                        mask = function terminal_server_transmission_sender_route_agentDist_mask(key:"agentRequest"|"agentSource"|"agentWrite"):void {
                            const sendTest = function terminal_server_transmission_sender_route_agentDist_mask_sendTest():void {
                                if (maskFlags.agentRequest === true && maskFlags.agentSource === true && maskFlags.agentWrite === true) {
                                    sender.send(payload, "", destination.user);
                                }
                            };
                            if (copy[key] === undefined || copy[key] === null || copy[key].user !== vars.settings.hashUser || copy[key].device.length === 141) {
                                maskFlags[key] = true;
                                sendTest();
                            } else {
                                deviceMask.mask(copy[key], key, function terminal_server_transmission_sender_route_agentDist_mask_callback(maskKey:string):void {
                                    maskFlags[maskKey] = true;
                                    sendTest();
                                });
                            }
                        };
                    mask("agentRequest");
                    mask("agentSource");
                    mask("agentWrite");
                }
            },
            agentWrite:fileAgent = (payloadData.agentWrite === undefined)
                ? null
                : payloadData.agentWrite;
        agentDist(agent, agentWrite);
    }
};

export default sender;