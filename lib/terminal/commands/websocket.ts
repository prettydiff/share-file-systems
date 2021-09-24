/* lib/terminal/commands/websocket - A command utility for creating websocket a server or client. */

import { AddressInfo, createServer as netServer, Server } from "net";
import { createServer as tlsServer } from "tls";

import error from "../utilities/error.js";
import hash from "./hash.js";

const websocket:websocket = {
    // convert part, or all, of a bit sequence into an integer
    bitDecimal: function terminal_commands_websocket_bitDecimal(bits:byte):number {
        let output:number = 0,
            index:number = 8,
            a:number = 0;
        do {
            index = index - 1;
            output = output + (bits[a] * (2 ** index));
            a = a + 1;
        } while (a < 8);
        return output;
    },
    broadcast: function terminal_commands_websocket_broadcast(type:string, data:Buffer|string):void {
        websocket.clientList.forEach(function terminal_commands_websocket_broadcast_each(socket:socketClient):void {
            if (type === "" || type === null) {
                websocket.send(socket, data);
            } else {
                websocket.send(socket, `${type},${data}`);
            }
        });
    },
    clientList: [],

    // write output from this node application
    send: function terminal_commands_websocket_send(socket:socketClient, data:Buffer|string):void {
        // data is fragmented above 1 million bytes and sent unmasked
        let len:number = data.length,
            dataPackage:Buffer = (typeof data === "string")
                ? Buffer.from(data)
                : data,
            firstFrag:boolean = true;
        const frame:Buffer = Buffer.alloc(2),
            extendedLen = function terminal_commands_websocket_send_toBinary(input:number, segment:Buffer):void {
                const bin:string = `0${input.toString(2)}`,
                    binLength:number = bin.length,
                    bits:(0|1)[] = (len === 126)
                        ? Array(16).fill(0)
                        : Array(64).fill(0),
                    output:Buffer = (len > 65535)
                        ? Buffer.alloc(8)
                        : Buffer.alloc(2);
                let a:number = 0;

                // 1. converts a number into a bit string
                // 2. loop through the string to populate a bit array
                do {
                    if (bin[a] === "1") {
                        if (len > 65535) {
                            output[a + 1] = 1; // a 63 bit value occupies a 64 bit block with a 0 in the first slot
                        } else {
                            output[a] = 1;
                        }
                    }
                    a = a + 1;
                } while (a < binLength);

                // 3. populate a Buffer (byte array) from the bit array
                output[0] = (websocket.bitDecimal(bits.slice(0, 6) as byte));
                output[1] = (websocket.bitDecimal(bits.slice(8, 16) as byte));
                if (len > 65535) {
                    output[2] = (websocket.bitDecimal(bits.slice(16, 24) as byte));
                    output[3] = (websocket.bitDecimal(bits.slice(24, 32) as byte));
                    output[4] = (websocket.bitDecimal(bits.slice(32, 40) as byte));
                    output[5] = (websocket.bitDecimal(bits.slice(40, 48) as byte));
                    output[6] = (websocket.bitDecimal(bits.slice(48, 56) as byte));
                    output[7] = (websocket.bitDecimal(bits.slice(56) as byte));
                }
                socket.write(Buffer.concat([frame, output, segment]));
            },
            fragment = function terminal_commands_websocket_send_fragment():void {
                if (firstFrag === true) {
                    firstFrag = false;
                    frame[0] = (typeof data === "string")
                        ? 16  // 00001000, fin bit unset and 1 for opcode (last 4 bits)
                        : 32; // 00000100, fin bit unset and 2 for opcode (last 4 bits)
                    frame[1] = 254; // 127 bit shifted to left once, first bit is 0 for no mask
                } else {
                    frame[0] = (len > 1e6)
                        ? 0
                        : 1; // opcode is now 0 for continuation
                    frame[1] = (len < 126)
                        ? (len << 1)
                        : (len > 65535)
                            ? 254  // 127 bit shifted to left once, first bit is 0 for no mask
                            : 252; // 126 bit shifted to left once, first bit is 0 for no mask
                }
                extendedLen(1e6, dataPackage.slice(0, 1e6));
                if (len > 1e6) {
                    dataPackage = dataPackage.slice(1e6);
                    len = len - 1e6;
                    terminal_commands_websocket_send_fragment();
                }
            };
        if (len > 1e6) {
            fragment();
        } else {
            frame[0] = (typeof data === "string")
                ? 17  // 10001000, fin bit set and 1 for opcode (last 4 bits)
                : 33; // 10000100, fin bit set and 2 for opcode (last 4 bits)
            frame[1] = (len < 126)
                ? (len << 1)
                : (len > 65535)
                    ? 254  // 127 bit shifted to left once, first bit is 0 for no mask
                    : 252; // 126 bit shifted to left once, first bit is 0 for no mask
            if (len < 126) {
                socket.write(Buffer.concat([frame, dataPackage]));
            } else {
                extendedLen(len, dataPackage);
            }
        }
    },
    server: function terminal_commands_websocket(config:websocketServer):Server {
        const wsServer:Server = (config.cert === null)
            ? netServer()
            : tlsServer({
                cert: config.cert.cert,
                key: config.cert.key,
                requestCert: true
            }),
            handshake = function terminal_commands_websocket_handshake(socket:socketClient, data:string, callback:(key:string) => void):void {
                const headers:string[] = data.split("\r\n"),
                    responseHeaders:string[] = [];
                headers.forEach(function terminal_commands_websocket_connection_data_each(header:string):void {
                    if (header.indexOf("HTTP/") > -1) {
                        responseHeaders.push(`${header.slice(header.indexOf("HTTP/"))} 101 Switching Protocols`);
                    } else if (header.indexOf("Sec-WebSocket-Key") === 0) {
                        const key:string = header.slice(header.indexOf("-Key:") + 5).replace(/\s/g, "") + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
                        hash({
                            algorithm: "sha1",
                            callback: function terminal_commands_websocket_connection_data_each_hash(hashOutput:hashOutput):void {
                                responseHeaders.push(`Sec-WebSocket-Accept: ${hashOutput.hash}`);
                                responseHeaders.push("");
                                responseHeaders.push("");
                                socket.write(responseHeaders.join("\r\n"));
                                
                                callback(key);
                            },
                            digest: "base64",
                            directInput: true,
                            source: key
                        });
                    } else if (header.indexOf("Upgrade") === 0 || header.indexOf("Connection") === 0) {
                        responseHeaders.push(header);
                    }
                });
            },
            // convert an 8 bit integer (0 - 255) into a sequence of 8 bits
            bitArray = function terminal_commands_websocket_bitArray(input:number):byte {
                const output:byte = [0, 0, 0, 0, 0, 0, 0, 0];
                let a:number = 0,
                    index:number = 8,
                    pow:number = 0;
                do {
                    index = index - 1;
                    pow = 2 ** index;
                    if (input > pow - 1) {
                        output[a] = 1;
                        input = input - pow;
                    }
                    a = a + 1;
                } while (a < 8);
                if (input > 0) {
                    output[0] = 1;
                }
                return output;
            },
            dataHandler = function terminal_commands_websocket_dataHandler(socket:socketClient):void {
                const processor = function terminal_commands_websocket_dataHandler_processor(data:Buffer):void {
                    if (data.length < 2) {
                        return null;
                    }
                    /*
                        RFC 6455, 5.2.  Base Framing Protocol
                        0                   1                   2                   3
                         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
                        +-+-+-+-+-------+-+-------------+-------------------------------+
                        |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
                        |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
                        |N|V|V|V|       |S|             |   (if payload len==126/127)   |
                        | |1|2|3|       |K|             |                               |
                        +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
                        |     Extended payload length continued, if payload len == 127  |
                        + - - - - - - - - - - - - - - - +-------------------------------+
                        |                               |Masking-key, if MASK set to 1  |
                        +-------------------------------+-------------------------------+
                        | Masking-key (continued)       |          Payload Data         |
                        +-------------------------------- - - - - - - - - - - - - - - - +
                        :                     Payload Data continued ...                :
                        + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
                        |                     Payload Data continued ...                |
                        +---------------------------------------------------------------+

                        RFC 6455, 5.3.  Client-to-Server Masking
                        j                   = i MOD 4
                        transformed-octet-i = original-octet-i XOR masking-key-octet-j
                    */
                    const bits0:byte = bitArray(data[0]), // bitArray - convert byte number (0 - 255) to array of 8 bits (0|1){8}
                        bits1:byte = bitArray(data[1]),
                        frame:socketFrame = {
                            fin: (bits0[0] === 1),
                            rsv1: bits0[1],
                            rsv2: bits0[2],
                            rsv3: bits0[3],
                            opcode: data[0] & 15,
                            mask: (bits1[0] === 1),
                            len: data[1] & 127,
                            maskKey: null,
                            payload: null
                        };
                    if (frame.len < 126) {
                        frame.len = data.length;
                        if (frame.mask === true) {
                            frame.maskKey = data.slice(2, 6);
                            frame.payload = data.slice(6);
                        } else {
                            frame.payload = data.slice(2);
                        }
                    } else if (frame.len === 126) {
                        frame.len = 126 + data.readInt16BE(2);
                        if (frame.mask === true) {
                            frame.maskKey = data.slice(4, 8);
                            frame.payload = data.slice(8);
                        } else {
                            frame.payload = data.slice(4);
                        }
                    } else {
                        frame.len = 127 + data.readUInt32BE(2);
                        if (frame.mask === true) {
                            frame.maskKey = data.slice(10, 14);
                            frame.payload = data.slice(14);
                        } else {
                            frame.payload = data.slice(10);
                        }
                    }

                    // unmask payload
                    if (frame.mask === true) {
                        frame.payload.forEach(function terminal_commands_websocket_dataHandler_unmask(value:number, index:number):void {
                            // unmask
                            // reassign the value as:  value XOR one byte of mask key from index MOD 4
                            frame.payload[index] = value ^ frame.maskKey[index % 4];
                        });
                    }

                    // store payload or write response
                    if (frame.fin === true) {
                        // complete data frame
                        const opc:number = (frame.opcode === 0)
                                ? socket.opcode
                                : frame.opcode,
                            opcode:number = (opc === 9) // convert ping to pong
                                ? 10
                                : opc,
                            output:number[] = [];

                        // write frame header + payload
                        if (opcode === 1 || opcode === 2 || opcode === 8) {
                            const payload:Buffer = (frame.opcode === 0)
                                ? Buffer.concat([socket.fragment, frame.payload])
                                : frame.payload;
                            output.push(websocket.bitDecimal([
                                1,
                                frame.rsv1,
                                frame.rsv2,
                                frame.rsv3,

                                // opcode
                                // 8 = 1000
                                // 2 = 0010
                                // 1 = 0001
                                (opcode === 8)
                                    ? 1
                                    : 0,
                                0,
                                (opcode === 2)
                                    ? 1
                                    : 0,
                                (opcode === 1)
                                    ? 1
                                    : 0
                            ]));
                            output.push(frame.len << 1);
                            if (frame.len > 125) {
                                output.push(data[2]);
                                output.push(data[3]);
                                if (frame.len > 126) {
                                    output.push(data[4]);
                                    output.push(data[5]);
                                    output.push(data[6]);
                                    output.push(data[7]);
                                    output.push(data[8]);
                                    output.push(data[9]);
                                }
                            }

                            if (opcode === 8) {
                                // close
                                let a:number = websocket.clientList.length;

                                // RFC 6455, 7.4.  Status Codes
                                // * 1000 - normal closure
                                // * 1001 - end point move away
                                // * 1002 - protocol error at end point
                                // * 1003 - end point received data it cannot accept
                                // * 1004 - reserved
                                // * 1005 - no status given, default for 0
                                // * 1006 - reserved, closed abnormally
                                // * 1007 - frame payload outside type specified by opcode
                                // * 1008 - policy violation
                                // * 1009 - payload too large to process
                                // * 1010 - extension support not supported or responded
                                // * 1011 - end point unexpected condition
                                // * 1015 - reserved, failure to perform TLS handshake

                                // push in the error code (default 1005)
                                if (payload[0] < 10) {
                                    output.push(10);
                                    output.push(5);
                                } else {
                                    output.push(payload[0]);
                                    output.push(payload[1]);
                                }

                                socket.write(Buffer.concat([Buffer.from(output), payload.slice(2)]));
                                socket.end();
    
                                // remove socket from clientList
                                do {
                                    a = a - 1;
                                    if (websocket.clientList[a].sessionId === socket.sessionId) {
                                        websocket.clientList.splice(a, 1);
                                        break;
                                    }
                                } while (a > 0);

                            } else {
                                // text or binary
                                // !!! process data here !!!
    
                                // reset socket
                                socket.fragment = Buffer.alloc(0);
                                socket.opcode = 0;
                            }
                        } else if (opcode === 9) {
                            // ping, not supported here yet
                            // must be arbitrarily created as received pings are converted to pongs
                            null;
                        } else if (opcode === 10) {
                            // pong
                            // flips bits due to opcode change, 9 to 10, and then resend the entire data
                            data[0] = websocket.bitDecimal([
                                1,
                                frame.rsv1,
                                frame.rsv2,
                                frame.rsv3,

                                // opcode 10 (last 4 bits, 1010)
                                1,
                                0,
                                1,
                                0
                            ]);
                            socket.write(data);
                        }
                    } else {
                        // fragment, must be of type text (1) or binary (2)
                        if (frame.opcode > 0) {
                            socket.opcode = frame.opcode;
                        }
                        socket.fragment = Buffer.concat([socket.fragment, frame.payload]);
                    }
                };
                socket.on("data", processor);
            };

        wsServer.listen({
            host: config.address,
            port: config.port
        }, function terminal_commands_websocket_listen():void {
            const addressInfo:AddressInfo = wsServer.address() as AddressInfo;
            config.callback(addressInfo.port);
        });
        wsServer.on("connection", function terminal_commands_websocket_connection(socket:socketClient):void {
            const handshakeHandler = function terminal_commands_websocket_connection_handshakeHandler(data:Buffer):void {
                    // handshake
                    handshake(socket, data.toString(), function terminal_commands_websocket_connection_handshakeHandler_callback(key:string):void {

                        // modify the socket
                        socket.fragment = Buffer.alloc(0);
                        socket.opcode = 0;
                        socket.sessionId = key;
                        socket.setKeepAlive(true, 0);
                        websocket.clientList.push(socket);
    
                        // change the listener to process data
                        socket.removeListener("data", terminal_commands_websocket_connection_handshakeHandler);
                        dataHandler(socket);
                    });
                };
            socket.on("data", handshakeHandler);
            socket.on("error", function terminal_commands_websocket_connection_error(errorItem:Error) {
                error([errorItem.toString()]);
            });
        });
        return wsServer;
    }
};

export default websocket;