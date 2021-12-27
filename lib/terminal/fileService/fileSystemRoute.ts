
/* lib/terminal/fileService/fileSystemRoute - A library that manages the direction of all file system messaging between agents. */

import hash from "../commands/hash.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";
import transmit_http from "../server/transmission/transmit_http.js";
import transmit_ws from "../server/transmission/transmit_ws.js";
import unmask from "./unmask.js";

const fileSystemRoute = function terminal_fileService_fileSystemRoute(dataPackage:socketData, transmit:transmit):void {
    const data:service_copy = dataPackage.data as service_copy,
        flags:flagList = {
            agentRequest: (data.agentRequest.user === serverVars.hashUser),
            agentSource: (data.agentSource.user === serverVars.hashUser),
            agentWrite: (data.agentWrite === null || data.agentWrite.user === serverVars.hashUser)
        },

        localAgent:boolean = (
            (data.agentAction === "agentRequest" && data.agentSource.device === serverVars.hashDevice) ||
            (data.agentAction === "agentRequest" && data.agentSource.user === serverVars.hashUser && serverVars.device[serverVars.hashDevice].shares[data.agentSource.share] !== undefined)
        ),

        send = function terminal_fileService_fileSystemRoute_send(agent:string, agentType:agentType):void {
            if (serverVars[agentType][agent] === undefined) {
                return;
            }
            if (transmit.type === "ws") {
                transmit_ws.send(dataPackage, transmit_ws.clientList[agentType][agent] as socketClient);
            } else {
                transmit_http.request({
                    agent: agent,
                    agentType: agentType,
                    callback: null,
                    ip: serverVars[agentType][agent].ipSelected,
                    payload: dataPackage,
                    port: serverVars[agentType][agent].ports.http
                });
            }
        },
        process = function terminal_fileService_fileSystemRoute_process():void {
            // process requests to the source file system
            const local = function terminal_fileService_fileSystemRoute_process_local():void {
                data.agentAction = "agentSource";
                if (data.agentWrite === null) {
                    serviceFile.menu(dataPackage.data as service_fileSystem, transmit);
                } else {
                    serviceCopy.actions.sameAgent(data, transmit);
                }
            };
            // service test or same local device - no transmit
            if (serverVars.testType === "service" || localAgent === true) {
                local();
            // send to agentSource
            } else if (data.agentSource.user !== serverVars.hashUser) {
                send(data.agentSource.user, "user");
            } else if (data.agentSource.user === serverVars.hashUser) {
                unmask(data.agentSource.device, function terminal_fileService_fileSystemRoute_process_unmask(device:string):void {
                    if (device === serverVars.hashDevice) {
                        local();
                    } else {
                        send(device, "device");
                    }
                });
            }
        },
        deviceMask = function terminal_fileService_fileSystemRoute_deviceMask(key:"agentRequest"|"agentSource"|"agentWrite"):void {
            const date:string = String(Date.now()),
                device:string = (data[key].device === "")

                    // if device identity is not provided then find it from the share indicated
                    ? (function terminal_fileService_fileSystemRoute_deviceMask_device():string {
                        const devices:string[] = Object.keys(serverVars.device);
                        let index:number = devices.length;
                        do {
                            index = index - 1;
                            if (serverVars.device[devices[index]].shares[data[key].share] !== undefined) {
                                return devices[index];
                            }
                        } while (index > 0);
                        return "";
                    }())
                    : data[key].device,
                
                // determine if device masking is complete for all agent groups
                flagCheck = function terminal_fileService_fileSystemRoute_hashDevice_flagCheck():void {
                    flags[key] = false;
                    if (flags.agentRoute === false && flags.agentSource === false && flags.agentWrite === false) {
                        process();
                    }
                },

                // mask the device
                hashInput:hashInput = {
                    callback: function terminal_fileService_fileSystemRoute_hashInput(hashOutput:hashOutput):void {
                        data[key].device = date + hashOutput.hash;
                        flagCheck();
                    },
                    directInput: true,
                    source: date + device
                };
            
            // check to see if the device is already masked
            if (data[key].device.length === 141) {
                flagCheck();
            } else {
                hash(hashInput);
            }
        };

    // all local user, no device translation required 
    if (flags.agentRequest === true && flags.agentSource === true && flags.agentWrite === true) {
        process();
    } else {
        if (data.agentWrite === null) {
            flags.agentWrite = false;
        }
        if (flags.agentRequest === true) {
            deviceMask("agentRequest");
        }
        if (flags.agentSource === true) {
            deviceMask("agentSource");
        }
        if (flags.agentWrite === true) {
            deviceMask("agentWrite");
        }
    }
};

export default fileSystemRoute;