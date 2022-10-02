/* lib/terminal/server/transmission/sender - Abstracts away the communication channel from the message. */

import deviceMask from "../services/deviceMask.js";
import transmit_http from "./transmit_http.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * An abstraction to manage traffic output abstracted away from specific network protocols.
 * ```typescript
 * interface module_sender {
 *     broadcast: (payload:socketData, listType:websocketClientType) => void; // Send a specified ata package to all agents of a given agent type.
 *     route    : (destination:copyAgent, socketData:socketData, callback:(socketData:socketData) => void) => void; // Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
 *     send     : (data:socketData, agents:transmit_agents) => void;          // Send a specified data package to a specified agent
 * }
 * ``` */
const sender:module_sender = {
    // send to all agents of a given type
    broadcast: function terminal_server_transmission_sender_broadcast(payload:socketData, listType:websocketClientType):void {
        if (listType === "browser") {
            const list:string[] = Object.keys(transmit_ws.clientList.browser);
            list.forEach(function terminal_server_transmission_transmitWs_broadcast_each(agent:string):void {
                transmit_ws.queue(payload, transmit_ws.clientList.browser[agent], 1);
            });
        } else {
            const list:string[] = Object.keys(vars.settings[listType]),
                selfIndex:number = (listType === "device")
                    ? list.indexOf(vars.settings.hashDevice)
                    : -1;
            let index:number = list.length,
                socket:websocket_client = null;
            if (selfIndex > -1) {
                list.splice(selfIndex, 1);
                index = index - 1;
            }

            if (index > 0) {
                do {
                    index = index - 1;
                    socket = transmit_ws.clientList[listType][list[index]];
                    if (socket !== undefined && socket !== null && socket.status === "open") {
                        transmit_ws.queue(payload, socket, 1);
                    }/* else {
                        transmit_http.request({
                            agent: list[index],
                            agentType: listType,
                            callback: null,
                            ip: vars.settings[listType][list[index]].ipSelected,
                            payload: payload,
                            port: vars.settings[listType][list[index]].ports.http
                        });
                    }*/
                } while (index > 0);
            }
        }
    },

    // direct a data payload to a specific agent as determined by the service name and the agent details in the data payload
    route: function terminal_server_transmission_sender_route(destination:copyAgent, socketData:socketData, callback:(socketData:socketData) => void):void {
        const payload:service_copy = socketData.data as service_copy,
            agent:fileAgent = payload[destination];
        if (agent.user === vars.settings.hashUser) {
            const deviceCallback = function terminal_server_transmission_sender_route_deviceCallback(device:string):void {
                if (vars.settings.device[device] !== undefined) {
                    agent.device = device;
                }
                if (device === vars.settings.hashDevice) {
                    // same device
                    callback(socketData);
                } else {
                    sender.send(socketData, {
                        device: agent.device,
                        user: agent.user
                    });
                }
            };
            if (agent.device.length === 141) {
                deviceMask.unmask(agent.device, deviceCallback);
            } else {
                deviceCallback(deviceMask.resolve(agent));
            }
        } else {
            let count:number = 0;
            const maskCallback = function terminal_server_transmission_sender_route_maskCallback():void {
                    count = count + 1;
                    if (count === 2) {
                        sender.send(socketData, {
                            device: agent.device,
                            user: agent.user
                        });
                    }
                },
                agentSelf = function terminal_server_transmission_sender_route_agentSelf(type:copyAgent):void {
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
                },
                copyAgents:copyAgent[] = ["agentRequest", "agentSource", "agentWrite"];
            copyAgents.splice(copyAgents.indexOf(destination), 1);
            agentSelf(copyAgents[0]);
            agentSelf(copyAgents[1]);
        }
    },

    // send a specified data package to a specified agent
    send: function terminal_server_transmission_sender_send(data:socketData, agents:transmit_agents):void {
        if (agents !== null && agents.user === "browser") {
            transmit_ws.queue(data, transmit_ws.clientList.browser[agents.device], 1);
        } else {
            const protocols = function terminal_server_transmission_sender_send_protocols(agent:string, agentType:agentType):void {
                if (agent !== "" && vars.settings[agentType][agent] !== undefined) {
                    const socket:websocket_client = transmit_ws.clientList[agentType][agent];
                    if (socket !== undefined && socket !== null && (socket.status === "open" || socket.status === "pending")) {
                        transmit_ws.queue(data, socket, 1);
                    } else {
                        transmit_http.request({
                            agent: agent,
                            agentType: agentType,
                            callback: null,
                            ip: vars.settings[agentType][agent].ipSelected,
                            payload: data,
                            port: vars.settings[agentType][agent].ports.http,
                            stream: false
                        });
                    }
                }
            };
            if (agents === null) {
                protocols(null, "user");
            } else if (agents.user === vars.settings.hashUser) {
                if (agents.device.length === 141) {
                    deviceMask.unmask(agents.device, function terminal_server_transmission_sender_send_unmask(actualDevice:string):void {
                        protocols(actualDevice, "device");
                    });
                } else {
                    protocols(agents.device, "device");
                }
            } else {
                protocols(agents.user, "user");
            }
        }
    }
};

export default sender;