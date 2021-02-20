
/* lib/terminal/fileService/routeFile - A library that manages all file system operations except copy/cut operations. */

import { IncomingHttpHeaders, ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";

const routeFile = function terminal_fileService_routeFile(serverResponse:ServerResponse, dataString:string):void {
    const data:systemDataFile = JSON.parse(dataString),
        route = function terminal_fileService_routeFile_route(serverResponse:ServerResponse, data:systemDataFile):void {
            const net:[string, number] = (serverVars[data.agentType][data.agent] === undefined)
                ? ["", 0]
                : [serverVars[data.agentType][data.agent].ip, serverVars[data.agentType][data.agent].port];
            if (net[0] !== "") {
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
                    requestType: (data.agentType === "user")
                        ? "user-fs"
                        : "fs",
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
    if (data.agent === serverVars.hashDevice || serverVars.testType === "service") {
        serviceFile.menu(serverResponse, data);
    } else {
        route(serverResponse, data);
    }
};

export default routeFile;