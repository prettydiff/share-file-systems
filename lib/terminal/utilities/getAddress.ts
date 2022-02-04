/* lib/terminal/utilities/getAddress - Extracts IP addresses from a provided socket. */

import { ServerHttp2Stream } from "http2";
import { Socket } from "net";

import ipResolve from "../server/transmission/ipResolve.js";

const getAddress = function terminal_utilities_getAddress(transmit:transmit):addresses {
    const response:ServerHttp2Stream = transmit.socket as ServerHttp2Stream,
        socket:Socket = (transmit.type === "ws")
            ? transmit.socket as socketClient
            : response.session.socket;
    return {
        local: ipResolve.parse(socket.localAddress),
        remote: ipResolve.parse(socket.remoteAddress)
    };
};

export default getAddress;