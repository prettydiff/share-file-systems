
/* lib/terminal/fileService/routeCopy - A library to handle file system asset movement. */

import { ServerResponse } from "http";

import httpClient from "../server/httpClient.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";
import user from "./user.js";
import vars from "../utilities/vars.js";

const routeCopy = function terminal_fileService_routeCopy(serverResponse:ServerResponse, dataString:string):void {
    const data:systemDataCopy = JSON.parse(dataString),
        route = function terminal_fileService_routeCopy_route(serverResponse:ServerResponse, data:systemDataCopy):void {
            httpClient({
                agentType: data.agentType,
                callback: function terminal_fileService_routeCopy_route_callback(message:string|Buffer):void {
                    vars.broadcast("file-list-status", message.toString());
                },
                errorMessage: "",
                ip: serverVars[data.agentType][data.agent].ip,
                payload: dataString,
                port: serverVars[data.agentType][data.agent].port,
                requestError: function terminal_fileService_routeCopy_route_requestError():void {
                    return;
                },
                requestType: "copy",
                responseStream: httpClient.stream,
                responseError: function terminal_fileService_routeCopy_route_requestError():void {
                    return;
                }
            });
        },
        menu = function terminal_fileService_routeCopy_menu():void {
            if (data.action === "copy") {
                if (data.agent === data.copyAgent) {
                    serviceCopy.actions.sameAgent(serverResponse, data);
                } else {
                    serviceCopy.actions.requestList(serverResponse, data, 0);
                }
            } else {
                serviceFile.respond.status(serverResponse, {
                    address: data.modalAddress,
                    agent: serverVars.hashUser,
                    agentType: "user",
                    fileList: [],
                    message: `Requested action "${data.action.replace("copy-", "")}" is not supported.`
                }, "file-list-status");
            }
        };
    if (data.agentType === "device") {
        // service tests must be regarded as local device tests even they have a non-matching agent
        // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
        if (data.agent === serverVars.hashDevice || serverVars.testType === "service") {
            menu();
            //serviceCopy(serverResponse, data);
        } else {
            route(serverResponse, data);
        }
    } else {
        user(serverResponse, data, route);
    }
};

export default routeCopy;