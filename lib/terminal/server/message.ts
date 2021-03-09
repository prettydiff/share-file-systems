
/* lib/terminal/server/message - Process and send text messages. */

import { ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "./httpClient.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const message = function terminal_server_message(messageText:string, serverResponse:ServerResponse):void {
    const data:messageItem = JSON.parse(messageText),
        list:agents = serverVars[data.agentType],
        agents:string[] = Object.keys(list),
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
            ip: list[data.agentTo].ipSelected,
            payload: messageText,
            port: list[data.agentTo].port,
            requestError: requestError,
            requestType: "message",
            responseStream: httpClient.stream,
            responseError: responseError
        };
    response({
        message: "Responding to message.",
        mimeType: "text/plain",
        responseType: "message",
        serverResponse: serverResponse
    });
    if (data.agentFrom === data.agentTo) {
        // broadcast
        let agentLength:number = agents.length;
        do {
            agentLength = agentLength - 1;
            config.errorMessage = `Failed to send text message to ${data.agentTo}`;
            config.ip = list[agents[agentLength]].ipSelected;
            config.port = list[agents[agentLength]].port;
            httpClient(config);
        } while (agentLength > 0);
    } else if ((data.agentType === "device" && data.agentTo === serverVars.hashDevice) || (data.agentType === "user" && data.agentTo === serverVars.hashUser)) {
        // message receipt
        vars.broadcast("message", messageText);
    } else {
        // message send
        httpClient(config);
    }
};

export default message;