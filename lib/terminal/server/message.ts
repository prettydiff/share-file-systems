
/* lib/terminal/server/message - Process and send text messages. */

import { ServerResponse } from "http";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const message = function terminal_message(messageText:string, serverResponse:ServerResponse):void {
    const data:messageItem = JSON.parse(messageText).message,
        list:agents = serverVars[data.agentType],
        agents:string[] = Object.keys(list),
        config:httpConfiguration = {
            agentType: data.agentType,
            callback: function terminal_message_singleCallback():void {
                return;
            },
            callbackType: "object",
            errorMessage: `Failed to send text message to ${data.agentTo}`,
            id: "",
            ip: list[data.agentTo].ip,
            payload: messageText,
            port: list[data.agentTo].port,
            remoteName: data.agentTo,
            requestType: "message",
            response: serverResponse
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