/* lib/terminal/utilities/getAddress - Extracts IP addresses from a provided socket. */

import { ServerResponse } from "http";
import { Socket } from "net";

import ipResolve from "../server/transmission/ipResolve.js";

const getAddress = function terminal_utilities_getAddress(transmit:transmit_type):transmit_addresses_socket {
    const response:ServerResponse = transmit.socket as ServerResponse,
        socket:Socket = (transmit.type === "ws")
            ? transmit.socket as websocket_client
            : response.socket;
    return {
        local: ipResolve.parse(socket.localAddress),
        remote: ipResolve.parse(socket.remoteAddress)
    };
};

export default getAddress;