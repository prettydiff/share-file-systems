/* lib/terminal/server/transmission/sender - Abstracts away the communication channel from the message. */

import deviceMask from "../services/deviceMask.js";
import serverVars from "../serverVars.js";
import transmit_http from "./transmit_http.js";
import transmit_ws from "./transmit_ws.js";

/**
 * An abstraction to manage traffic output abstracted away from specific network protocols.
 * * **send** - Send a specified data package to a specified agent
 * * **broadcast** - Send a specified ata package to all agents of a given agent type.
 * * **route** - Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
 * 
 * ```typescript
 * interface module_sender {
 *     send: (data:socketData, device:string, user:string) => void;
 *     broadcast: (payload:socketData, listType:websocketClientType) => void;
 *     route: (payload:socketData, target:() => void) => void;
 * }
 * ``` */
const sender:module_sender = {
    // send a specified data package to a specified agent
    send: function terminal_server_transmission_sender_send(data:socketData, device:string, user:string):void {
        if (user === "browser") {
            transmit_ws.send(data, transmit_ws.clientList.browser[device], 1);
        } else {
            const protocols = function terminal_server_transmission_sender_send_protocols(agent:string, agentType:agentType):void {
                const socket:socketClient = transmit_ws.clientList[agentType][agent];
                if (socket !== undefined && socket !== null && socket.status === "open") {
                    transmit_ws.send(data, socket, 1);
                } else {
                    transmit_http.request({
                        agent: agent,
                        agentType: agentType,
                        callback: null,
                        ip: serverVars[agentType][agent].ipSelected,
                        payload: data,
                        port: serverVars[agentType][agent].ports.http
                    });
                }
            };
            if (user === serverVars.hashUser) {
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
                transmit_ws.send(payload, transmit_ws.clientList[listType][agent]);
            });
        } else {
            const list:string[] = Object.keys(serverVars[listType]);
            let index:number = list.length,
                socket:socketClient = null;
            
            if ((listType === "device" && index > 1) || (listType !== "device" && index > 0)) {
                do {
                    index = index - 1;
                    socket = transmit_ws.clientList[listType][list[index]];
                    if (socket !== undefined && socket !== null && socket.status === "open") {
                        transmit_ws.send(payload, socket, 1);
                    } else {
                        transmit_http.request({
                            agent: list[index],
                            agentType: listType,
                            callback: null,
                            ip: serverVars[listType][list[index]].ipSelected,
                            payload: payload,
                            port: serverVars[listType][list[index]].ports.http
                        });
                    }
                } while (index > 0);
            }
        }
    },

    // direct a data payload to a specific agent as determined by the service name and the agent details in the data payload
    route: function terminal_server_transmission_sender_route(payload:socketData, action:() => void):void {
        const service:requestType = payload.service,
            deviceDist = function terminal_server_transmission_sender_route_deviceDist(device:string):void {
                if (device === serverVars.hashDevice) {
                    action();
                } else {
                    sender.send(payload, device, serverVars.hashUser);
                }
            },
            agentDist = function terminal_sever_transmission_sender_route_agentDist(destination:fileAgent, thirdAgent:fileAgent):void {
                if (destination.user === serverVars.hashUser && (thirdAgent === null || thirdAgent.user === serverVars.hashUser)) {
                    // no external user
                    if (destination.device.length === 141) {
                        deviceMask.unmask(destination.device, function terminal_server_transmission_sender_route_agentDist_unmask(destinationDevice:string):void {
                            deviceDist(destinationDevice);
                        });
                    } else {
                        deviceDist(destination.device);
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
                            if (copy[key] === undefined || copy[key] === null || copy[key].user !== serverVars.hashUser || copy[key].device.length === 141) {
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
            };
        // the agent fed into agentDist is the destination agent
        if (service === "copy") {
            const data:service_copy = payload.data as service_copy;
                agentDist(data.agentSource, data.agentWrite);
        } else if (service === "error") {
            const data:service_error = payload.data as service_error;
            agentDist(data.agent, null);
        } else if (service === "file-system") {
            const data:service_fileSystem = payload.data as service_fileSystem;
            agentDist(data.agentSource, null);
        } else if (service === "file-system-details" || service === "file-system-status") {
            const data:service_fileSystem_status = payload.data as service_fileSystem_status;
            agentDist(data.agentRequest, null);
        }
    }
};

export default sender;