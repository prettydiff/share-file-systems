
/* lib/terminal/fileService/route - A library to move file system instructions between agents. */

import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";

const route = function terminal_fileService_routeFile_route(config:fileRoute):void {
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
            responseType: "fs",
            serverResponse: config.serverResponse
        });
    } else {
        httpClient({
            agentType: config.agentType,
            callback: config.callback,
            errorMessage: `Error transmitting ${config.dataType} instructions: ${config.dataString}`,
            ip: net[0],
            payload: config.dataString,
            port: net[1],
            requestError: function terminal_fileService_routeFile_route_requestError(errorMessage:nodeError):void {
                if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                    error(["Error at client request in route of routeFile", config.dataString, errorMessage.toString()]);
                }
            },
            requestType: "fs",
            responseError: function terminal_fileService_routeFile_route_requestError(errorMessage:nodeError):void {
                if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                    error(["Error at client response in route of routeFile", config.dataString, errorMessage.toString()]);
                }
            },
            responseStream: httpClient.stream
        });
    }
};

export default route;