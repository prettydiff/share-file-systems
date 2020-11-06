
/* lib/terminal/server/message - Process and send text messages. */

import { ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const message = function terminal_server_message(messageText:string, serverResponse:ServerResponse):void {
    const data:messageItem = JSON.parse(messageText).message,
        list:agents = serverVars[data.agentType],
        agents:string[] = Object.keys(list),
        requestError = function terminal_server_message_requestError(message:nodeError):void {
            error([errorMessage, message.toString()]);
        },
        responseError = function terminal_server_message_responseError(message:nodeError):void {
            if (message.code !== "ETIMEDOUT" && ((vars.command.indexOf("test") === 0 && message.code !== "ECONNREFUSED") || vars.command.indexOf("test") !== 0)) {
                error([errorMessage, errorMessage.toString()]);
                vars.ws.broadcast(JSON.stringify({
                    error: errorMessage
                }));
            }
        },
        errorMessage:string = `Failed to send text message to ${data.agentTo}`,
        config:httpConfiguration = {
            agentType: data.agentType,
            callback: function terminal_server_message_singleCallback():void {
                return;
            },
            errorMessage: errorMessage,
            id: "",
            ip: list[data.agentTo].ip,
            payload: messageText,
            port: list[data.agentTo].port,
            remoteName: data.agentTo,
            requestError: requestError,
            requestType: "message",
            response: serverResponse,
            responseError: responseError
        };
    if (data.agentFrom === data.agentTo) {
        // broadcast
        let agentLength:number = agents.length;
        do {
            agentLength = agentLength - 1;
            config.errorMessage = `Failed to send text message to ${data.agentTo}`;
            config.ip = list[agents[agentLength]].ip;
            config.port = list[agents[agentLength]].port;
            config.remoteName = agents[agentLength];
            httpClient(config);
        } while (agentLength > 0);
    } else if ((data.agentType === "device" && data.agentTo === serverVars.hashDevice) || (data.agentType === "user" && data.agentTo === serverVars.hashUser)) {
        // message receipt
        vars.ws.broadcast(messageText);
    } else {
        // message send
        httpClient(config);
    }
};

export default message;