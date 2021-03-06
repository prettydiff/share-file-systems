
/* lib/terminal/fileService/routeFile - A library that manages all file system operations except copy/cut operations. */

import { IncomingHttpHeaders, ServerResponse } from "http";

import route from "./route.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";
import user from "./user.js";

const routeFile = function terminal_fileService_routeFile(serverResponse:ServerResponse, dataString:string):void {
    const data:systemDataFile = JSON.parse(dataString),
        routeCallback = function terminal_fileService_routeFile_route_callback(message:string|Buffer, headers:IncomingHttpHeaders):void {
            const responseType:requestType = headers["response-type"] as requestType;
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
        };
    // service tests must be regarded as local device tests even they have a non-matching agent
    // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
    if (data.agent.id === serverVars.hashDevice || serverVars.testType === "service") {
        serviceFile.menu(serverResponse, data);
    } else if (data.agent.id === serverVars.hashUser) {
        user({
            agent: data.agent,
            action: data.action,
            callback: function terminal_fileService_routeFile_user(device:string):void {
                if (device === serverVars.hashDevice) {
                    serviceFile.menu(serverResponse, data);
                } else {
                    route({
                        agent: device,
                        agentData: "agent",
                        agentType: "device",
                        callback: routeCallback,
                        data: data,
                        dataString: dataString,
                        dataType: "file",
                        serverResponse: serverResponse
                    });
                }
            },
            serverResponse: serverResponse
        });
    } else {
        route({
            agent: data.agent.id,
            agentData: "agent",
            agentType: data.agent.type,
            callback: routeCallback,
            data: data,
            dataString: dataString,
            dataType: "file",
            serverResponse: serverResponse
        });
    }
};

export default routeFile;