/* lib/terminal/server/transmission/responder - Send network output, whether an http response or websocket. */

import transmit_http from "./transmit_http.js";
import transmit_ws from "./transmit_ws.js";

const responder = function terminal_server_transmission_responder(data:socketData, transmit:transmit_type):void {
    if (transmit === null || transmit.socket === null) {
        return;
    }
    if (transmit.type === "http") {
        const serverResponse:httpSocket_response = transmit.socket as httpSocket_response;
        transmit_http.respond({
            message: JSON.stringify(data),
            mimeType: "application/json",
            responseType: data.service,
            serverResponse: serverResponse
        }, false, "");
        // account for security of http requests
    } else {
        const socket:websocket_client = transmit.socket as websocket_client;
        transmit_ws.queue(data, socket, 1);
    }
};

export default responder;