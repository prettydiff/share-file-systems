/* lib/terminal/utilities/getAddress - Extracts IP addresses from a provided socket. */

const getAddress = function terminal_utilities_getAddress(transmit:transmit_type):transmit_addresses_socket {
    const response:httpSocket_response = transmit.socket as httpSocket_response,
        socket:node_net_Socket = (transmit.type === "ws")
            ? transmit.socket as websocket_client
            : response.socket,
        parse = function terminal_utilities_getAddress_parse(input:string):string {
                if (input === undefined) {
                    return "undefined, possibly due to socket closing";
                }
                if (input.indexOf("::ffff:") === 0) {
                    return input.replace("::ffff:", "");
                }
                if (input.indexOf(":") > 0 && input.indexOf(".") > 0) {
                    return input.slice(0, input.lastIndexOf(":"));
                }
                return input;
            };
    return {
        local: {
            address: parse(socket.localAddress),
            port: socket.localPort
        },
        remote: {
            address: parse(socket.remoteAddress),
            port: socket.remotePort
        }
    };
};

export default getAddress;