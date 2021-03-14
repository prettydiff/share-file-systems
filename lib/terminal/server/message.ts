
/* lib/terminal/server/message - Process and send text messages. */

import { ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "./httpClient.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const message = function terminal_server_message(messageText:string, serverResponse:ServerResponse):void {
    const data:messageItem = JSON.parse(messageText),
        requestError = function terminal_server_message_requestError(message:nodeError):void {
            error([errorMessage, message.toString()]);
        },
        responseError = function terminal_server_message_responseError(message:nodeError):void {
            if (message.code !== "ETIMEDOUT") {
                error([errorMessage, errorMessage.toString()]);
                vars.broadcast("error", JSON.stringify(errorMessage));
            }
        },
        errorMessage:string = `Failed to send text message to ${data.agentTo}`,
        config:httpConfiguration = {
            agentType: data.agentType,
            callback: function terminal_server_message_singleCallback():void {
                return;
            },
            errorMessage: errorMessage,
            ip: "",
            payload: messageText,
            port: 0,
            requestError: requestError,
            requestType: "message",
            responseStream: httpClient.stream,
            responseError: responseError
        },
        broadcast = function terminal_server_message_broadcast(agentType:agentType):void {
            const list:string[] = Object.keys(serverVars[agentType]);
            let agentLength:number = list.length;
            do {
                agentLength = agentLength - 1;
                if (agentType === "user" || (agentType === "device" && list[agentLength] !== serverVars.hashDevice)) {
                    config.errorMessage = `Failed to send text message to ${data.agentTo}`;
                    config.ip = serverVars[agentType][list[agentLength]].ipSelected;
                    config.port = serverVars[agentType][list[agentLength]].port;
                    httpClient(config);
                }
            } while (agentLength > 0);
        };
    response({
        message: "Responding to message.",
        mimeType: "text/plain",
        responseType: "message",
        serverResponse: serverResponse
    });
    if (data.agentTo === "device") {
        broadcast("device");
    } else if (data.agentTo === "user") {
        broadcast("user");
    } else if (data.agentTo === "all") {
        broadcast("device");
        broadcast("user");
    } else if (data.agentType === "device" && data.agentTo === serverVars.hashDevice) {
        vars.broadcast("message", messageText);
    } else if (data.agentType === "user" && data.agentTo === serverVars.hashUser) {
        vars.broadcast("message", messageText);
        broadcast("device");
    } else {
        config.ip = serverVars[data.agentType][data.agentTo].ipSelected;
        config.port = serverVars[data.agentType][data.agentTo].port;
        httpClient(config);
    }
};

export default message;