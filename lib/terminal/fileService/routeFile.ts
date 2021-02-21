
/* lib/terminal/fileService/routeFile - A library that manages all file system operations except copy/cut operations. */

import { IncomingHttpHeaders, ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";
import user from "./user.js";

const routeFile = function terminal_fileService_routeFile(serverResponse:ServerResponse, dataString:string):void {
    let tempDevice:agent = null;
    const data:systemDataFile = JSON.parse(dataString),
        route = function terminal_fileService_routeFile_route(serverResponse:ServerResponse, data:systemDataFile):void {
            const net:[string, number] = (tempDevice !== null)
                ? [tempDevice.ip, tempDevice.port]
                : (serverVars[data.agent.type][data.agent.id] === undefined)
                    ? ["", 0]
                    : [serverVars[data.agent.type][data.agent.id].ip, serverVars[data.agent.type][data.agent.id].port];
            if (net[0] === "") {
                const status:fileStatusMessage = {
                    address: data.agent.modalAddress,
                    agent: serverVars.hashUser,
                    agentType: "user",
                    fileList: "noShare",
                    message: `Unknown agent of type ${data.agent.type} and ID ${data.agent.id}`
                };
                response({
                    message: JSON.stringify(status),
                    mimeType: "application/json",
                    responseType: "fs",
                    serverResponse: serverResponse
                });
            } else {
                httpClient({
                    agentType: data.agent.type,
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
                            const status:fileStatusMessage = JSON.parse(message.toString());
                            serviceFile.respond.status(serverResponse, status);
                            serviceFile.statusBroadcast(data, status);
                        }
                    },
                    errorMessage: "",
                    ip: net[0],
                    payload: dataString,
                    port: net[1],
                    requestError: function terminal_fileService_routeFile_route_requestError(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            error(["Error at client request in route of routeFile", JSON.stringify(data), errorMessage.toString()]);
                        }
                    },
                    requestType: "fs",
                    responseError: function terminal_fileService_routeFile_route_requestError(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            error(["Error at client response in route of routeFile", JSON.stringify(data), errorMessage.toString()]);
                        }
                    },
                    responseStream: httpClient.stream
                });
            }
        };
    // service tests must be regarded as local device tests even they have a non-matching agent
    // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
    if (data.agent.id === serverVars.hashDevice || serverVars.testType === "service") {
        serviceFile.menu(serverResponse, data);
    } else if (data.agent.id === serverVars.hashUser) {
        user({
            action: data.action,
            callback: function terminal_fileService_routeFile_user(device:string):void {
                if (device !== null) {
                    if (device === serverVars.hashDevice) {
                        serviceFile.menu(serverResponse, data);
                    } else {
                        tempDevice = serverVars.device[device];
                        route(serverResponse, data);
                    }
                }
            },
            location: data.agent.modalAddress,
            serverResponse: serverResponse,
            share: data.agent.share
        });
    } else {
        route(serverResponse, data);
    }
};

export default routeFile;