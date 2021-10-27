/* lib/terminal/server/responder - Send network output, whether an http response or websocket. */

import { ServerResponse } from "http";

import httpAgent from "./httpAgent.js";
import websocket from "./websocket.js";

const responder = function terminal_server_responder(data:socketData, transmit:transmit):void {
    if (transmit === null || transmit.socket === null) {
        return;
    }
    if (transmit.type === "http") {
        const serverResponse:ServerResponse = transmit.socket as ServerResponse;
        httpAgent.respond({
            message: JSON.stringify(data),
            mimeType: "application/json",
            responseType: data.service,
            serverResponse: serverResponse
        });
        // account for security of http requests
    } else {
        const socket:socketClient = transmit.socket as socketClient;
        websocket.send(data, socket);
    }
};

export default responder;