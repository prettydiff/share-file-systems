
/* lib/terminal/fileService/routeCopy - A library to handle file system asset movement. */

import { IncomingHttpHeaders, ServerResponse } from "http";

import copyService from "./copyService.js";
import fileServices from "./fileServices.js";
import httpClient from "../server/httpClient.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";

const routeCopy = function terminal_fileService_routeCopy(serverResponse:ServerResponse, dataString:string):void {
    const data:copyService = JSON.parse(dataString),
        route = function terminal_fileService_routeCopy_route():void {
            httpClient({
                agentType: data.agentType,
                callback: function terminal_fileService_routeCopy_route_callback(message:string|Buffer, headers:IncomingHttpHeaders):void {
                    const responseType:requestType = <requestType>headers["response-type"],
                        status:copyStatus = JSON.parse(message.toString());
                        fileServices.respond.copy(serverResponse, status);
                },
                errorMessage: "",
                ip: serverVars[data.agentType][data.agent].ip,
                payload: dataString,
                port: serverVars[data.agentType][data.agent].port,
                requestError: function terminal_fileService_routeCopy_route_requestError():void {
                    return;
                },
                requestType: "fs",
                responseStream: httpClient.stream,
                responseError: function terminal_fileService_routeCopy_route_requestError():void {
                    return;
                }
            });
        };
    if (data.agentType === "device") {
        // service tests must be regarded as local device tests even they have a non-matching agent
        // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
        if (data.agent === serverVars.hashDevice || serverVars.testType === "service") {
            copyService(serverResponse, data);
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