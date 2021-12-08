
/* lib/terminal/fileService/route - A library to move file system instructions between agents. */

import deviceShare from "./deviceShare.js";
import responder from "../server/transmission/responder.js";
import serverVars from "../server/serverVars.js";
import transmit_http from "../server/transmission/transmit_http.js";
import transmit_ws from "../server/transmission/transmit_ws.js";

const route = function terminal_fileService_route(config:fileRoute):void {
    if (serverVars[config.agentType] === undefined) {
        // resetting the environment during test automation may leave latent instructions on the wire
        return;
    }
    const agentActual:agent = serverVars[config.agentType][config.agent],
        // The following line is well structured but its complexity exceeds TypeScript's reasoning capacity.
        // This line takes a uniform data structure from a named key but that key name depends upon the structure passed in,
        // which creates a strict mapping problem between object at key with consideration for the parent object structure.
        // @ts-ignore - Mapping between object type and key space improperly implies an "any" type.
        agentProvided:fileAgent = config.data[config.agentData],
        net:[string, number] = (agentActual === undefined)
            ? ["", 0]
            : [
                agentActual.ipSelected,
                agentActual.ports.http
            ];
    if (net[0] === "") {
        const status:service_fileStatus = {
            address: agentProvided.modalAddress,
            agent: agentProvided.id,
            agentType: "user",
            fileList: "noShare",
            message: `Unknown agent of type ${agentProvided.type} and ID ${agentProvided.id}`
        };
        if (config.transmit.type === "http") {
            responder({
                data: status,
                service: config.requestType
            }, config.transmit);
        }
    } else {
        const copyData:service_copy = config.data as service_copy,
            send = function terminal_fileService_route_send():void {
                /*transmit_http.request({
                    agent: config.agent,
                    agentType: config.agentType,
                    callback: config.callback,
                    ip: net[0],
                    payload: {
                        data: config.data,
                        service: config.requestType
                    },
                    port: net[1]
                });*/
                transmit_ws.send({
                    data: config.data,
                    service: config.requestType
                }, transmit_ws.clientList[config.agentType][config.agent], 1);
            };
        if (copyData.agentSource !== undefined) {
            // create a one time password to allow a remote user temporary access to a device location that isn't shared
            if (copyData.agentSource.type === "user" && copyData.agentWrite.type === "device") {
                deviceShare("", copyData.agentWrite.id, function terminal_fileService_route_agentWrite(share:string):void {
                    copyData.agentWrite.id = serverVars.hashUser;
                    copyData.agentWrite.share = share;
                    copyData.agentWrite.type = "user";
                    send();
                });
            } else if (copyData.agentSource.type === "device" && copyData.agentWrite.type === "user") {
                deviceShare("", copyData.agentSource.id, function terminal_fileService_route_agentWrite(share:string):void {
                    copyData.agentSource.id = serverVars.hashUser;
                    copyData.agentSource.share = share;
                    copyData.agentSource.type = "user";
                    send();
                });
            } else {
                send();
            }
        } else {
            send();
        }
    }
};

export default route;