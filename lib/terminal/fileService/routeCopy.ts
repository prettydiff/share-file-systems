
/* lib/terminal/fileService/routeCopy - A library to handle file system asset movement. */

import { ClientRequest, IncomingMessage, OutgoingHttpHeaders, request as httpRequest, RequestOptions, ServerResponse } from "http";
import { request as httpsRequest } from "https";

import deviceShare from "./deviceShare.js";
import error from "../utilities/error.js";
import response from "../server/response.js";
import route from "./route.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";
import user from "./user.js";

const routeCopy = function terminal_fileService_routeCopy(dataPackage:socketData, transmit:transmit):void {
    const data:systemDataCopy = dataPackage.data as systemDataCopy,
        dataString:string = JSON.stringify(data);
    if (dataPackage.service === "copy") {
        const routeCallback = function terminal_fileService_routeCopy_routeCallback(message:Buffer|string):void {
            const status:fileStatusMessage = JSON.parse(message.toString());
            serviceFile.respond(status, "fs", transmit);
            serviceFile.statusBroadcast({
                action: "fs-directory",
                agent: data.agentSource,
                depth: 2,
                location: data.location,
                name: ""
            }, status);
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
                                dataString: dataString,
                                dataType: "copy",
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
                    action: "copy",
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
                    dataString: dataString,
                    dataType: "copy",
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
                dataString: dataString,
                dataType: "copy",
                requestType: "copy",
                transmit: transmit
            });
        }
    } else if (dataPackage.service === "copy-file") {
        // copy-file just returns a file in a HTTP response
        const copyData:copyFileRequest = dataPackage.data as copyFileRequest,
            routeCopyFile = function terminal_fileService_routeCopy_routeCopyFile(agent:string, type:agentType):void {
                const net:[string, number] = (serverVars[type][agent] === undefined)
                        ? ["", 0]
                        : [
                            serverVars[type][agent].ipSelected,
                            serverVars[type][agent].ports.http
                        ],
                    scheme:"http"|"https" = (serverVars.secure === true)
                        ? "https"
                        : "http",
                    headers:OutgoingHttpHeaders = {
                        "content-type": "application/x-www-form-urlencoded",
                        "content-length": Buffer.byteLength(dataString),
                        "agent-hash": (type === "device")
                            ? serverVars.hashDevice
                            : serverVars.hashUser,
                        "agent-name": (type === "device")
                            ? serverVars.nameDevice
                            : serverVars.nameUser,
                        "agent-type": type,
                        "request-type": "copy-file"
                    },
                    httpConfig:RequestOptions = {
                        headers: headers,
                        host: net[0],
                        method: "POST",
                        path: "/",
                        port: net[1],
                        timeout: 5000
                    },
                    requestCallback = function terminal_fileService_routeCopy_routeCopyFile_response(fsResponse:IncomingMessage):void {
                        const serverResponse:ServerResponse = transmit.socket as ServerResponse;
                        serverResponse.setHeader("compression", fsResponse.headers.compression);
                        serverResponse.setHeader("cut_path", fsResponse.headers.cut_path);
                        serverResponse.setHeader("file_name", fsResponse.headers.file_name);
                        serverResponse.setHeader("file_size", fsResponse.headers.file_size);
                        serverResponse.setHeader("hash", fsResponse.headers.hash);
                        serverResponse.setHeader("response-type", "copy-file");
                        serverResponse.writeHead(200, {"content-type": "application/octet-stream; charset=binary"});
                        fsResponse.pipe(serverResponse);
                    },
                    fsRequest:ClientRequest = (scheme === "https")
                        ? httpsRequest(httpConfig, requestCallback)
                        : httpRequest(httpConfig, requestCallback);
                if (net[0] === "") {
                    return;
                }
                fsRequest.on("error", function terminal_fileService_serviceCopy_requestFiles_requestFile_requestError(errorMessage:NodeJS.ErrnoException):void {
                    if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                        error(["Error at client request in requestFile of serviceCopy", dataString, errorMessage.toString()]);
                    }
                });
                fsRequest.write(dataString);
                fsRequest.end();

            };
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
                        routeCopyFile(device, "device");
                    }
                },
                transmit: transmit
            });
        } else {
            routeCopyFile(copyData.agent.id, copyData.agent.type);
        }
    } else if (dataPackage.service === "copy-request-files") {
        const data:systemRequestFiles = JSON.parse(dataString),
            routeRequestFiles = function terminal_fileService_routeCopy_routeRequestFiles(agent:string, type:agentType):void {
                route({
                    agent: agent,
                    agentData: "data.agent",
                    agentType: type,
                    callback: function terminal_fileService_routeCopy_routeCopyRequest(message:Buffer|string):void {
                        response({
                            message: message.toString(),
                            mimeType: "application/json",
                            responseType: "copy-request-files",
                            serverResponse: transmit.socket as ServerResponse
                        });
                    },
                    data: data,
                    dataString: dataString,
                    dataType: "copy",
                    requestType: "copy-request-files",
                    transmit: transmit
                });
            };
        if (serverVars.testType === "service") {
            // a premature response is necessary for service tests since they are multiple services on the same device creating a feedback loop
            const status:fileStatusMessage = {
                address: data.data.agentSource.modalAddress,
                agent: data.data.agentSource.id,
                agentType: data.data.agentSource.type,
                fileList: [],
                message: "Copying 1 00% complete. 1 file written at size 10 (10 bytes) with 0 integrity failures."
            };
            response({
                message: JSON.stringify(status),
                mimeType: "application/json",
                responseType: "copy-request-files",
                serverResponse: transmit.socket as ServerResponse
            });
        } else if (data.data.agentWrite.id === serverVars.hashDevice) {
            serviceCopy.actions.requestFiles(data, transmit);
        } else if (data.data.agentWrite.id === serverVars.hashUser) {
            user({
                action: "copy",
                agent: data.data.agentWrite,
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
            routeRequestFiles(data.data.agentWrite.id, data.data.agentWrite.type);
        }
    }
};

export default routeCopy;