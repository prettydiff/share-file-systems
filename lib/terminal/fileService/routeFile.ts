
/* lib/terminal/fileService/routeFile - A library that manages all file system operations except copy/cut operations. */

import { IncomingHttpHeaders, ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";
import user from "./user.js";
import response from "../server/response.js";
import vars from "../utilities/vars.js";

const routeFile = function terminal_fileService_routeFile(serverResponse:ServerResponse, dataString:string):void {
    const data:systemDataFile = JSON.parse(dataString),
        route = function terminal_fileService_routeFile_route(serverResponse:ServerResponse, data:systemDataFile):void {
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
                        if (data.action === "fs-directory" && (data.name === "expand" || data.name === "navigate")) {
                            response({
                                message: message,
                                mimeType: "application/json",
                                responseType: "fs",
                                serverResponse: serverResponse
                            });
                        } else {
                            const messageString:string = message.toString(),
                                devices:string[] = Object.keys(serverVars.device),
                                sendStatus = function terminal_fileService_routeFile_route_callback_sendStatus(agent:string):void {
                                    httpClient({
                                        agentType: "device",
                                        callback: function terminal_fileService_routeFile_route_callback_sendStatus_callback():void {},
                                        errorMessage: "",
                                        ip: serverVars.device[agent].ip,
                                        payload: messageString,
                                        port: serverVars.device[agent].port,
                                        requestError: function terminal_fileService_routeFile_route_callback_sendStatus_requestError(errorMessage:nodeError):void {
                                            error(["Error at client request in sendStatus of routeFile", JSON.stringify(data), errorMessage.toString()]);
                                        },
                                        requestType: "file-list-status",
                                        responseError: function terminal_fileService_routeFile_route_callback_sendStatus_responseType(errorMessage:nodeError):void {
                                            error(["Error at client request in sendStatus of routeFile", JSON.stringify(data), errorMessage.toString()]);
                                        },
                                        responseStream: httpClient.stream
                                    });
                                };
                            let a:number = devices.length;
                            serviceFile.respond.text(serverResponse, data.action);
                            do {
                                a = a - 1;
                                if (devices[a] === serverVars.hashDevice) {
                                    vars.broadcast("file-list-status", messageString);
                                } else {
                                    sendStatus(devices[a]);
                                }
                            } while (a > 0);
                        }
                    }
                },
                errorMessage: "",
                ip: serverVars[data.agentType][data.agent].ip,
                payload: dataString,
                port: serverVars[data.agentType][data.agent].port,
                requestError: function terminal_fileService_routeFile_route_requestError(errorMessage:nodeError):void {
                    error(["Error at client request in route of routeFile", JSON.stringify(data), errorMessage.toString()]);
                },
                requestType: "fs",
                responseError: function terminal_fileService_routeFile_route_requestError(errorMessage:nodeError):void {
                    error(["Error at client response in route of routeFile", JSON.stringify(data), errorMessage.toString()]);
                },
                responseStream: httpClient.stream
            });
        };
    if (data.agentType === "device") {
        // service tests must be regarded as local device tests even they have a non-matching agent
        // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
        if (data.agent === serverVars.hashDevice || serverVars.testType === "service") {
            serviceFile.menu(serverResponse, data);
        } else {
            route(serverResponse, data);
        }
    } else {
        //user(serverResponse, data, route);
        response({
            message: "User message received at routeFile from client request",
            mimeType: "text/plain",
            responseType: "fs",
            serverResponse: serverResponse
        });
    }
};

export default routeFile;