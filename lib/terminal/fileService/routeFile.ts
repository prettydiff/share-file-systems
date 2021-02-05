
/* lib/terminal/fileService/routeFile - A library that manages all file system operations except copy/cut operations. */

import { IncomingHttpHeaders, ServerResponse } from "http";

import httpClient from "../server/httpClient.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";

const routeFile = function terminal_fileService_routeFile(serverResponse:ServerResponse, dataString:string):void {
    const data:systemDataFile = JSON.parse(dataString),
        route = function terminal_fileService_routeFile_route():void {
            httpClient({
                agentType: data.agentType,
                callback: function terminal_fileService_routeFile_route_callback(message:string|Buffer, headers:IncomingHttpHeaders):void {
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
                        const status:fsStatusMessage = JSON.parse(message.toString()),
                            type:requestType = (function terminal_fileService_statusMessage_callback_type():requestType {
                                if (data.action === "fs-directory") {
                                    if (data.name === "expand" || data.name === "navigate") {
                                        return "fs";
                                    }
                                    if (data.name.indexOf("loadPage:") === 0) {
                                        status.address = data.name.replace("loadPage:", "");
                                        return "fs";
                                    }
                                }
                                if (data.action === "fs-search") {
                                    return "fs";
                                }
                                return "file-list-status";
                            }());
                        serviceFile.respond.status(serverResponse, status, type);
                    }
                },
                errorMessage: "",
                ip: serverVars[data.agentType][data.agent].ip,
                payload: dataString,
                port: serverVars[data.agentType][data.agent].port,
                requestError: function terminal_fileService_routeFile_route_requestError():void {
                    return;
                },
                requestType: "fs",
                responseStream: httpClient.stream,
                responseError: function terminal_fileService_routeFile_route_requestError():void {
                    return;
                }
            });
        };
    if (data.agentType === "device") {
        // service tests must be regarded as local device tests even they have a non-matching agent
        // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
        if (data.agent === serverVars.hashDevice || serverVars.testType === "service") {
            serviceFile.menu(serverResponse, data);
        } else {
            route();
        }
    } else {
        if (data.agent === serverVars.hashUser) {
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
                locationLength:number = data.location.length;
            let a:number = 0,
                b:number = 0;
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
                        if ((shares[a].name.charAt(0) === "/" && data.location[b].indexOf(shares[a].name) === 0) || data.location[b].toLowerCase().indexOf(shares[a].name.toLowerCase()) === 0) {
                            if (shares[a].readOnly === true && (data.action === "fs-destroy" || data.action === "fs-new" || data.action === "fs-rename" || data.action === "fs-write")) {
                                serviceFile.respond.status(serverResponse, {
                                    address: data.modalAddress,
                                    agent: serverVars.hashUser,
                                    agentType: "user",
                                    fileList: [],
                                    message: `Attempted action ${data.action.replace("fs-", "")} to location ${data.location[b]} which is in a read only share of: ${serverVars.nameUser}.`
                                }, "file-list-status");
                                return;
                            }
                            if (serverVars.device[serverVars.hashDevice].shares[data.share] === undefined) {
                                a = devices.length;
                                do {
                                    a = a - 1;
                                    if (serverVars.device[devices[a]].shares[data.share] !== undefined) {
                                        data.agent = devices[a];
                                        data.agentType = "device";
                                        route();
                                        return;
                                    }
                                } while (a > 0);
                                serviceFile.respond.status(serverResponse, {
                                    address: data.modalAddress,
                                    agent: serverVars.hashUser,
                                    agentType: "user",
                                    fileList: [],
                                    message: `User ${serverVars.nameUser} does not have share: ${data.share}.`
                                }, "file-list-status");
                                return;
                            }
                            serviceFile.menu(serverResponse, data);
                            return;
                        }
                    } while (b > 0);
                    a = a + 1;
                } while (a < shareLength);
                serviceFile.respond.status(serverResponse, {
                    address: data.modalAddress,
                    agent: serverVars.hashUser,
                    agentType: "user",
                    fileList: [],
                    message: `Requested location ${data.location[b]} is not in a location shared by user ${serverVars.nameUser}.`
                }, "file-list-status");
            } else {
                serviceFile.respond.status(serverResponse, {
                    address: data.modalAddress,
                    agent: serverVars.hashUser,
                    agentType: "user",
                    fileList: [],
                    message: `User ${serverVars.nameUser} currently has no shares.`
                }, "file-list-status");
            }
        } else {
            route();
        }
    }
};

export default routeFile;