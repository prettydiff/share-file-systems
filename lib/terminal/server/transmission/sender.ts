/* lib/terminal/server/transmission/sender - Abstracts away the communication channel from the message. */

import serverVars from "../serverVars.js";
import transmit_http from "./transmit_http.js";
import transmit_ws from "./transmit_ws.js";
import unmask from "../../fileService/unmask.js";

const sender = function terminal_server_transmission_sender(data:socketData, device:string, user:string):void {
    const protocols = function terminal_server_transmission_sender_protocols(agent:string, agentType:agentType):void {
        const socket:socketClient = transmit_ws.clientList[agentType][agent];
        if (socket.status === "open") {
            transmit_ws.send(data, socket);
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
            unmask(device, function terminal_server_transmission_sender_unmask(actualDevice:string):void {
                protocols(actualDevice, "device");
            });
        } else {
            protocols(device, "device");
        }
    } else {
        protocols(user, "user");
    }
};

sender.broadcast = function terminal_server_transmission_sender_broadcast(payload:socketData, listType:websocketClientType):void {
    if (listType === "browser") {
        const list:string[] = Object.keys(transmit_ws.clientList[listType]);
        list.forEach(function terminal_server_transmission_transmitWs_broadcast_each(agent:string):void {
            transmit_ws.send(payload, transmit_ws.clientList[listType][agent]);
        });
    } else {
        const list:string[] = Object.keys(serverVars[listType]);
        let index:number = list.length;
        
        if (index > 0) {
            do {
                index = index - 1;
                if (transmit_ws.clientList[listType][list[index]].status === "open") {
                    transmit_ws.send(payload, transmit_ws.clientList[listType][list[index]]);
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
};

export default sender;