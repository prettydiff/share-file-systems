
/* lib/terminal/fileService/routeCopy - A library to handle file system asset movement. */

import { ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";

const routeCopy = function terminal_fileService_routeCopy(serverResponse:ServerResponse, dataString:string):void {
    const data:systemDataCopy = JSON.parse(dataString),
        route = function terminal_fileService_routeCopy_route(serverResponse:ServerResponse, data:systemDataCopy):void {
            const net:[string, number] = (serverVars[data.sourceAgent.type][data.sourceAgent.id] === undefined)
                ? ["", 0]
                : [
                    serverVars[data.sourceAgent.type][data.sourceAgent.id].ip,
                    serverVars[data.sourceAgent.type][data.sourceAgent.id].port
                ];
            if (net[0] !== "") {
                httpClient({
                    agentType: data.sourceAgent.type,
                    callback: function terminal_fileService_routeCopy_route_callback(message:string|Buffer):void {
                        const status:fileStatusMessage = JSON.parse(message.toString());
                        serviceFile.respond.status(serverResponse, status);
                        serviceFile.statusBroadcast(data, status);
                    },
                    errorMessage: "",
                    ip: net[0],
                    payload: dataString,
                    port: net[1],
                    requestError: function terminal_fileService_routeCopy_route_requestError(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            error(["Error at client request in route of routeCopy", JSON.stringify(data), errorMessage.toString()]);
                        }
                    },
                    requestType: (data.sourceAgent.type === "user")
                        ? "user-fs"
                        : "copy",
                    responseStream: httpClient.stream,
                    responseError: function terminal_fileService_routeCopy_route_requestError(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            error(["Error at client response in route of routeCopy", JSON.stringify(data), errorMessage.toString()]);
                        }
                    }
                });
            }
        },
        menu = function terminal_fileService_routeCopy_menu():void {
            if (data.action === "copy") {
                if (data.sourceAgent.id === data.writeAgent.id) {
                    serviceCopy.actions.sameAgent(serverResponse, data);
                } else {
                    serviceCopy.actions.requestList(serverResponse, data, 0);
                }
            } else {
                const status:fileStatusMessage = {
                    address: data.writeAgent.modalAddress,
                    agent: data.writeAgent.id,
                    agentType: data.writeAgent.type,
                    fileList: "missing",
                    message: `Requested action "${data.action.replace("copy-", "")}" is not supported.`
                };
                serviceFile.respond.status(serverResponse, status);
                serviceFile.statusBroadcast(data, status);
            }
        };
    // service tests must be regarded as local device tests even they have a non-matching agent
    // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
    if (data.sourceAgent.id === serverVars.hashDevice || serverVars.testType === "service") {
        menu();
    } else {
        route(serverResponse, data);
    }
};

export default routeCopy;