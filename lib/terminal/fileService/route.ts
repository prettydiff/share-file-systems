
/* lib/terminal/fileService/route - A library to move file system instructions between agents. */

import deviceShare from "./deviceShare.js";
import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";

const route = function terminal_fileService_route(config:fileRoute):void {
    const agentActual:agent = serverVars[config.agentType][config.agent],
        agentProvided:fileAgent = config.data[config.agentData],
        net:[string, number] = (agentActual === undefined)
            ? ["", 0]
            : [
                agentActual.ipSelected,
                agentActual.port
            ];
    if (net[0] === "") {
        const status:fileStatusMessage = {
            address: agentProvided.modalAddress,
            agent: agentProvided.id,
            agentType: "user",
            fileList: "noShare",
            message: `Unknown agent of type ${agentProvided.type} and ID ${agentProvided.id}`
        };
        response({
            message: JSON.stringify(status),
            mimeType: "application/json",
            responseType: config.requestType,
            serverResponse: config.serverResponse
        });
    } else {
        const copyData:systemDataCopy = config.data as systemDataCopy,
            send = function terminal_fileService_route_send():void {
                httpClient({
                    agentType: config.agentType,
                    callback: config.callback,
                    ip: net[0],
                    payload: config.dataString,
                    port: net[1],
                    requestError: function terminal_fileService_route_send_requestError(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            error(["Error at client request in route of routeFile", config.dataString, errorMessage.toString()]);
                        }
                    },
                    requestType: config.requestType,
                    responseError: function terminal_fileService_route_send_responseError(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            error(["Error at client response in route of routeFile", config.dataString, errorMessage.toString()]);
                        }
                    }
                });
            };
        if (copyData.agentSource !== undefined) {
            // create a one time password to allow a remote user temporary access to a device location that isn't shared
            if (copyData.agentSource.type === "user" && copyData.agentWrite.type === "device") {
                deviceShare("", copyData.agentWrite.id, function terminal_fileService_route_agentWrite(share:string):void {
                    copyData.agentWrite.id = serverVars.hashUser;
                    copyData.agentWrite.share = share;
                    copyData.agentWrite.type = "user";
                    config.dataString = JSON.stringify(copyData);
                    send();
                });
            } else if (copyData.agentSource.type === "device" && copyData.agentWrite.type === "user") {
                deviceShare("", copyData.agentSource.id, function terminal_fileService_route_agentWrite(share:string):void {
                    copyData.agentSource.id = serverVars.hashUser;
                    copyData.agentSource.share = share;
                    copyData.agentSource.type = "user";
                    config.dataString = JSON.stringify(copyData);
                    send();
                });
            } else {
                send();
            }
        } else {
            send();
        }
    }
};

export default route;