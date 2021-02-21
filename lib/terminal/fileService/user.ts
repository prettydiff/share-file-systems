
/* lib/terminal/fileService/user - Manages user security permissions. */

import { IncomingHttpHeaders, ServerResponse } from "http";
import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import response from "../server/response.js";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";
import serverVars from "../server/serverVars.js";

const user = function terminal_fileService_user(serverResponse:ServerResponse, data:systemDataFile|systemDataCopy):void {
    const copyData:systemDataCopy = <systemDataCopy>data,
        fileData:systemDataFile = <systemDataFile>data,
        dataType:"fs"|"copy" = (copyData.sourceAgent === undefined)
            ? "fs"
            : "copy",
        agent:string = (dataType === "copy")
            ? fileData.agent.id
            : copyData.sourceAgent.id,
        statusMessage = function terminal_fileService_user_statusMessage(message:string, type:"missing"|"noShare"|"readOnly"):void {
        const status:fileStatusMessage = {
            address: (dataType === "copy")
                ? copyData.writeAgent.modalAddress
                : fileData.agent.modalAddress,
            agent: serverVars.hashUser,
            agentType: "user",
            fileList: type,
            message: message
        };
        response({
            message: JSON.stringify(status),
            mimeType: "application/json",
            responseType: "fs",
            serverResponse: serverResponse
        });
    };
    if (agent === serverVars.hashUser) {
        const devices:string[] = Object.keys(serverVars.device),
            shares:agentShare[] = (function terminal_fileService_routeFile_shares():agentShare[] {
                const list:agentShare[] = [];
                let a:number = devices.length,
                    b:number = 0,
                    shareList:string[];
                do {
                    a = a - 1;
                    shareList = Object.keys(serverVars.device[devices[a]].shares);
                    b = shareList.length;
                    if (b > 0) {
                        do {
                            b = b - 1;
                            list.push(serverVars.device[devices[a]].shares[shareList[b]]);
                        } while (b > 0);
                    }
                } while (a > 0);
                return list;
            }()),
            shareLength:number = shares.length,
            locationLength:number = data.location.length,
            route = function terminal_fileService_user_route(agent:string):void {
                const fs:boolean = (data.action.indexOf("fs-") === 0);
                if (agent === serverVars.hashDevice) {
                    if (fs === true) {
                        serviceFile.menu(serverResponse, <systemDataFile>data);
                    } else {
                        const copyData:systemDataCopy = <systemDataCopy>data;
                        if (agent === copyData.writeAgent.id) {
                            serviceCopy.actions.sameAgent(serverResponse, copyData);
                        } else {
                            serviceCopy.actions.requestList(serverResponse, copyData, 0);
                        }
                    }
                } else {
                    httpClient({
                        agentType: "device",
                        callback: function terminal_fileService_user_route_callback(message:string|Buffer, headers:IncomingHttpHeaders):void {
                            const responseType:requestType = <requestType>headers["response-type"];
                            if (responseType === "error") {
                                serviceFile.respond.error(serverResponse, message.toString());
                            } else if (data.action === "fs-base64" || data.action === "fs-hash" || data.action === "fs-read") {
                                const list:stringDataList = JSON.parse(message.toString());
                                serviceFile.respond.read(serverResponse, list);
                            } else if (data.action === "fs-details") {
                                const details:fsDetails = JSON.parse(message.toString());
                                serviceFile.respond.details(serverResponse, details);
                            } else if (data.action === "fs-write") {
                                serviceFile.respond.write(serverResponse);
                            } else {
                                const status:fileStatusMessage = JSON.parse(message.toString());
                                serviceFile.statusBroadcast(data, status);
                                status.agent = serverVars.hashUser;
                                status.agentType = "user";
                                serviceFile.respond.status(serverResponse, status);
                            }
                        },
                        errorMessage: `Error sending ${data.action} to user device ${agent}`,
                        ip: serverVars.device[agent].ip,
                        payload: JSON.stringify(data),
                        port: serverVars.device[agent].port,
                        requestError: function terminal_fileService_user_callback_requestError(errorMessage:nodeError):void {
                            if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                error([`Error at request to user device for action ${data.action}`, JSON.stringify(data), errorMessage.toString()]);
                            }
                        },
                        requestType: (fs === true)
                            ? "fs"
                            : <requestType>data.action,
                        responseError: function terminal_fileService_user_callback_responseError(errorMessage:nodeError):void {
                            if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                error([`Error at response to user device for action ${data.action}`, JSON.stringify(data), errorMessage.toString()]);
                            }
                        },
                        responseStream: httpClient.stream
                    });
                }
            },
            readOnlyCheck = function terminal_fileService_user_readOnlyCheck(shareIndex:number, locationIndex:number):boolean {
                if ((shares[shareIndex].name.charAt(0) === "/" && data.location[locationIndex].indexOf(shares[shareIndex].name) === 0) || data.location[locationIndex].toLowerCase().indexOf(shares[shareIndex].name.toLowerCase()) === 0) {
                    if (shares[shareIndex].readOnly === true && (copyData.cut === true || data.action === "fs-destroy" || data.action === "fs-new" || data.action === "fs-rename" || data.action === "fs-write")) {
                        const action:string = (copyData.cut === true)
                            ? "cut"
                            : data.action.replace("fs-", "").replace("copy-", "");
                        statusMessage(`Attempted action "${action}" to location ${data.location[locationIndex]} which is in a read only share of: ${serverVars.nameUser}.`, "readOnly");
                        return true;
                    }
                    shareString = (dataType === "fs")
                        ? fileData.agent.share
                        : copyData.writeAgent.share;
                    if (serverVars.device[serverVars.hashDevice].shares[shareString] === undefined) {
                        let deviceIndex:number = devices.length;
                        do {
                            deviceIndex = deviceIndex - 1;
                            if (serverVars.device[devices[deviceIndex]].shares[shareString] !== undefined) {
                                if (dataType === "fs") {
                                    fileData.agent.id = devices[deviceIndex];
                                    fileData.agent.type = "device";
                                } else {
                                    copyData.sourceAgent.id = devices[deviceIndex];
                                    copyData.sourceAgent.type = "device";
                                }
                                route(devices[deviceIndex]);
                                return true;
                            }
                        } while (deviceIndex > 0);
                        statusMessage(`User ${serverVars.nameUser} does not have share: ${shareString}.`, "noShare");
                        return true;
                    }
                    if (data.action.indexOf("copy") === 0) {
                        if (data.action === "copy") {
                            if (copyData.sourceAgent.id === copyData.writeAgent.id) {
                                serviceCopy.actions.sameAgent(serverResponse, data);
                            } else {
                                serviceCopy.actions.requestList(serverResponse, data, 0);
                            }
                        } else {
                            statusMessage(`Requested action "${data.action.replace("copy-", "")}" is not supported.`, "missing");
                        }
                    } else {
                        serviceFile.menu(serverResponse, <systemDataFile>data);
                    }
                    return true;
                }
                return false;
            },
            copyData:systemDataCopy = <systemDataCopy>data,
            fileData:systemDataFile = <systemDataFile>data;
        let a:number = 0,
            b:number = 0,
            exit:boolean = false,
            shareString:string;
        shares.sort(function terminal_fileService_routeFile_sort(a:agentShare, b:agentShare):-1|1 {
            if (a.name.length > b.name.length) {
                return -1;
            }
            return 1;
        });
        if (shareLength > 0) {
            do {
                b = locationLength;
                do {
                    b = b - 1;
                    exit = readOnlyCheck(a, b);
                    if (exit === true) {
                        return;
                    }
                } while (b > 0);
                a = a + 1;
            } while (a < shareLength);
            statusMessage(`Requested location "${data.location[b]}" is not in a location shared by user ${serverVars.nameUser}.`, "noShare");
        } else {
            statusMessage(`User ${serverVars.nameUser} currently has no shares.`, "noShare");
        }
    } else {
        statusMessage(`This message is intended for user ${agent} but this is user ${serverVars.hashUser}`, "noShare");
    }
};

export default user;