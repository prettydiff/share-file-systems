
/* lib/terminal/fileService/routeCopy - A library to handle file system asset movement. */

import deviceShare from "./deviceShare.js";
import responder from "../server/transmission/responder.js";
import route from "./route.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";
import user from "./user.js";

const routeCopy = function terminal_fileService_routeCopy(dataPackage:socketData, transmit:transmit):void {
    const data:service_copy = dataPackage.data as service_copy,
        routeCallback = function terminal_fileService_routeCopy_routeCallback(message:socketData):void {
            message.service = "file-system";
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
                    : "copy-request",
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
};

export default routeCopy;