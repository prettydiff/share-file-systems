/* lib/terminal/utilities/getAddress - Extracts IP addresses from a provided socket. */

import { Socket } from "net";

import ipResolve from "../server/transmission/ipResolve.js";

const getAddress = function terminal_utilities_getAddress(transmit:transmit_type):transmit_addresses_socket {
    const response:httpSocket_response = transmit.socket as httpSocket_response,
        socket:Socket = (transmit.type === "ws")
            ? transmit.socket as websocket_client
            : response.socket;
    return {
        local: {
            address: ipResolve.parse(socket.localAddress),
            port: socket.localPort
        },
        remote: {
            address: ipResolve.parse(socket.remoteAddress),
            port: socket.remotePort
        }
    };
};

export default getAddress;