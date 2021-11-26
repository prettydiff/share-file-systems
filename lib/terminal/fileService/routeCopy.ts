
/* lib/terminal/fileService/routeCopy - A library to handle file system asset movement. */

import deviceShare from "./deviceShare.js";
import responder from "../server/transmission/responder.js";
import route from "./route.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";
import transmit_http from "../server/transmission/transmit_http.js";
import user from "./user.js";

const routeCopy = function terminal_fileService_routeCopy(dataPackage:socketData, transmit:transmit):void {
    const data:service_copy = dataPackage.data as service_copy;
    if (data.action === "copy-request") {
        const routeCallback = function terminal_fileService_routeCopy_routeCallback(message:socketData):void {
            message.service = "fs";
            responder(message, transmit);
            serviceFile.statusBroadcast({
                action: "fs-directory",
                agent: data.agentSource,
                depth: 2,
                location: data.location,
                name: ""
            }, message.data as service_fileStatus);
        };
        // service tests must be regarded as local device tests even they have a non-matching agent
        // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
        if ((data.agentSource.type === "device" && data.agentSource.id === serverVars.hashDevice) || serverVars.testType === "service") {
            // self device or service test
            if (data.agentSource.id === data.agentWrite.id) {
                serviceCopy.actions.sameAgent(data, transmit);
            } else {
                if (data.agentWrite.type === "user") {
                    deviceShare("", data.agentSource.id, function terminal_fileService_route_agentWrite(share:string):void {
                        data.agentSource.id = serverVars.hashUser;
                        data.agentSource.share = share;
                        data.agentSource.type = "user";
                        serviceCopy.actions.requestList(data, 0, transmit);
                    });
                } else {
                    serviceCopy.actions.requestList(data, 0, transmit);
                }
            }
        } else if (data.agentSource.id === serverVars.hashUser) {
            // self user
            const sourceUser = function terminal_fileService_routeCopy_sourceUser(writeDevice:string):void {
                user({
                    action: (data.cut === true)
                        ? "cut"
                        : "copy-request-files",
                    agent: data.agentSource,
                    callback: function terminal_fileService_routeCopy_sourceUser_callback(sourceDevice:string):void {
                        if (sourceDevice === serverVars.hashDevice) {
                            if (writeDevice === sourceDevice) {
                                serviceCopy.actions.sameAgent(data, transmit);
                            } else {
                                serviceCopy.actions.requestList(data, 0, transmit);
                            }
                        } else {
                            route({
                                agent: sourceDevice,
                                agentData: "agentSource",
                                agentType: "device",
                                callback: routeCallback,
                                data: data,
                                requestType: "copy",
                                transmit: transmit
                            });
                        }
                    },
                    transmit: transmit
                });
            };
            // first verify if the destination is this user and if the destination location is shared
            if (data.agentWrite.id === serverVars.hashUser) {
                user({
                    action: "copy-request",
                    agent: data.agentWrite,
                    callback: function terminal_fileService_routeCopy(writeDevice:string):void {
                        sourceUser(writeDevice);
                    },
                    transmit: transmit
                });
            } else {
                // destination is not this user, so ignore it and evaluate source location
                sourceUser("");
            }
        } else if (data.agentSource.type === "user" && data.agentWrite.type === "device") {
            deviceShare("", data.agentWrite.id, function terminal_fileService_routeCopy_agentWrite(share:string):void {
                data.agentWrite.share = share;
                route({
                    agent: data.agentSource.id,
                    agentData: "agentSource",
                    agentType: "user",
                    callback: routeCallback,
                    data: data,
                    requestType: "copy",
                    transmit: transmit
                });
            });
        } else {
            route({
                agent: data.agentSource.id,
                agentData: "agentSource",
                agentType: data.agentSource.type,
                callback: routeCallback,
                data: data,
                requestType: "copy",
                transmit: transmit
            });
        }
    } else if (data.action === "copy-file") {
        // copy-file just returns a file in a HTTP response
        const copyData:service_copyFile = dataPackage.data as service_copyFile;
        if (copyData.agent.id === serverVars.hashDevice) {
            serviceCopy.actions.sendFile(copyData, transmit);
        } else if (copyData.agent.id === serverVars.hashUser) {
            user({
                action: "copy-file",
                agent: copyData.agent,
                callback: function terminal_fileService_routeCopy_userCopyFile(device:string):void {
                    if (device === serverVars.hashDevice) {
                        serviceCopy.actions.sendFile(copyData, transmit);
                    } else {
                        transmit_http.requestCopy({
                            agent: device,
                            agentType: "device",
                            dataString: JSON.stringify(data),
                            transmit: transmit
                        });
                    }
                },
                transmit: transmit
            });
        } else {
            transmit_http.requestCopy({
                agent: copyData.agent.id,
                agentType: copyData.agent.type,
                dataString: JSON.stringify(data),
                transmit: transmit
            });
        }
    } else if (data.action === "copy-request-files") {
        const data:service_fileRequest = dataPackage.data as service_fileRequest,
            statusData:service_copy = data.copyData as service_copy,
            routeRequestFiles = function terminal_fileService_routeCopy_routeRequestFiles(agent:string, type:agentType):void {
                route({
                    agent: agent,
                    agentData: "data.agent",
                    agentType: type,
                    callback: function terminal_fileService_routeCopy_routeCopyRequest(message:socketData):void {
                        const copyData:service_copy = message.data as service_copy;
                        copyData.action = "copy-request-files";
                        responder(message, transmit);
                    },
                    data: data,
                    requestType: "copy",
                    transmit: transmit
                });
            };
        if (serverVars.testType === "service") {
            // a premature response is necessary for service tests since they are multiple services on the same device creating a feedback loop
            const status:service_fileStatus = {
                address: statusData.agentSource.modalAddress,
                agent: statusData.agentSource.id,
                agentType: statusData.agentSource.type,
                fileList: [],
                message: "Copying 1 00% complete. 1 file written at size 10 (10 bytes) with 0 integrity failures."
            };
            responder({
                data: status,
                service: "copy"
            }, transmit);
        } else if (statusData.agentWrite.id === serverVars.hashDevice) {
            serviceCopy.actions.requestFiles(data, transmit);
        } else if (statusData.agentWrite.id === serverVars.hashUser) {
            user({
                action: "copy-request",
                agent: statusData.agentWrite,
                callback: function terminal_fileService_routeCopy_userCopyRequest(device:string):void {
                    if (device === serverVars.hashDevice) {
                        serviceCopy.actions.requestFiles(data, transmit);
                    } else {
                        routeRequestFiles(device, "device");
                    }
                },
                transmit: transmit
            });
        } else {
            routeRequestFiles(statusData.agentWrite.id, statusData.agentWrite.type);
        }
    }
};

export default routeCopy;