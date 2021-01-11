
/* lib/terminal/fileService/routeCopy - A library to handle file system asset movement. */

import { IncomingHttpHeaders, ServerResponse } from "http";

import httpClient from "../server/httpClient.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";

const routeCopy = function terminal_fileService_routeCopy(serverResponse:ServerResponse, dataString:string):void {
    const dataFiles:systemRequestFiles = (dataString.indexOf("\"action\":\"copy-request-files\"") > 0)
            ? JSON.parse(dataString)
            : null,
        data:systemDataCopy = (dataFiles !== null)
            ? dataFiles.data
            : JSON.parse(dataString),
        route = function terminal_fileService_routeCopy_route():void {
            httpClient({
                agentType: data.agentType,
                callback: function terminal_fileService_routeCopy_route_callback(message:string|Buffer):void {
                    const status:copyStatus = JSON.parse(message.toString());
                        serviceFile.respond.copy(serverResponse, status);
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
            }
        };
    if (data.agentType === "device") {
        // service tests must be regarded as local device tests even they have a non-matching agent
        // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
        if (data.agent === serverVars.hashDevice || serverVars.testType === "service") {
            menu();
            //serviceCopy(serverResponse, data);
        } else {
            route();
        }
    } else {
        response({
            message: `{"id":"${data.id}","dirs":"noShare"}`,
            mimeType: "application/json",
            responseType: "file-list-status",
            serverResponse: serverResponse
        });
    }
};

export default routeCopy;

    // x copy to and from local device works
    // 1 copy to vm1 from local
    // 2 copy to local from vm1
    // 3 copy to and from vm1
    // 4 cut to vm1 from local
    // 5 cut to local from vm1
    // 6 cut to and from vm1
    // 7 copy to vm1 from vm2
    // 8 cut to vm1 from vm2