
/* lib/terminal/fileService/routeCopy - A library to handle file system asset movement. */

import { ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import user from "./user.js";
import vars from "../utilities/vars.js";
import serviceFile from "./serviceFile.js";

const routeCopy = function terminal_fileService_routeCopy(serverResponse:ServerResponse, dataString:string):void {
    const data:systemDataCopy = JSON.parse(dataString),
        respond = function terminal_fileService_routeCopy_respond():void {
            response({
                message: "Copy request received.",
                mimeType: "text/plain",
                responseType: "response-no-action",
                serverResponse: serverResponse
            });
        },
        route = function terminal_fileService_routeCopy_route(serverResponse:ServerResponse, data:systemDataCopy):void {
            httpClient({
                agentType: data.agentType,
                callback: function terminal_fileService_routeCopy_route_callback():void {},
                errorMessage: "",
                ip: serverVars[data.agentType][data.agent].ip,
                payload: dataString,
                port: serverVars[data.agentType][data.agent].port,
                requestError: function terminal_fileService_routeCopy_route_requestError(errorMessage:nodeError):void {
                    if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                        error(["Error at client request in route of routeCopy", JSON.stringify(data), errorMessage.toString()]);
                    }
                },
                requestType: "copy",
                responseStream: httpClient.stream,
                responseError: function terminal_fileService_routeCopy_route_requestError(errorMessage:nodeError):void {
                    if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                        error(["Error at client response in route of routeCopy", JSON.stringify(data), errorMessage.toString()]);
                    }
                }
            });
            respond();
        },
        menu = function terminal_fileService_routeCopy_menu():void {
            if (data.action === "copy") {
                if (data.agent === data.copyAgent) {
                    serviceCopy.actions.sameAgent(data);
                    respond();
                } else {
                    serviceCopy.actions.requestList(serverResponse, data, 0);
                }
            } else {
                const status:fileStatusMessage = {
                    address: data.modalAddress,
                    agent: data.copyAgent,
                    agentType: data.agentType,
                    fileList: [],
                    message: `Requested action "${data.action.replace("copy-", "")}" is not supported.`
                };
                serviceFile.respond.status(serverResponse, status);
                serviceFile.statusBroadcast(data, status);
            }
        };
    if (data.agentType === "device") {
        // service tests must be regarded as local device tests even they have a non-matching agent
        // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
        if (data.agent === serverVars.hashDevice || serverVars.testType === "service") {
            menu();
        } else {
            route(serverResponse, data);
        }
    } else {
        user(serverResponse, data, route);
    }
};

export default routeCopy;