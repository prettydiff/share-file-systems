/* lib/terminal/server/transmission/responder - Send network output, whether an http response or websocket. */

import { ServerResponse } from "http";

import transmit_http from "./transmit_http.js";
import transmit_ws from "./transmit_ws.js";

const responder = function terminal_server_transmission_responder(data:socketData, transmit:transmit):void {
    if (transmit === null || transmit.socket === null) {
        return;
    }
    if (transmit.type === "http") {
        const serverResponse:ServerResponse = transmit.socket as ServerResponse;
        transmit_http.respond({
            message: JSON.stringify(data),
            mimeType: "application/json",
            responseType: data.service,
            serverResponse: serverResponse
        });
        // account for security of http requests
    } else {
        const socket:socketClient = transmit.socket as socketClient;
        transmit_ws.send(data, socket);
    }
};

export default responder;