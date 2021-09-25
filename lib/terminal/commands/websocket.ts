/* lib/terminal/commands/websocket - A command utility for creating a websocket server or client. */

import { AddressInfo, createServer as netServer, Server } from "net";
import { createServer as tlsServer } from "tls";

import error from "../utilities/error.js";
import hash from "./hash.js";

const websocket:websocket = {
    // send a given message to all client connections
    broadcast: function terminal_commands_websocket_broadcast(type:string, data:Buffer|string):void {
        websocket.clientList.forEach(function terminal_commands_websocket_broadcast_each(socket:socketClient):void {
            if (type === "" || type === null) {
                websocket.send(socket, data);
            } else {
                websocket.send(socket, `${type},${data}`);
            }
        });
    },
    // a list of connected clients
    clientList: [],
    convert: {
        toBin: function terminal_commands_websocket_convertBin(input:number):string {
            return (input >>> 0).toString(2);
        },
        toByte: function terminal_commands_websocket_convertByte(input:number):Buffer {
            const byteList:Buffer = (input > 65535)
                    ? Buffer.alloc(8)
                    : Buffer.alloc(2);
            if (input > 65535) {
                byteList[0] = (input & 0xff00) >> 8;
                byteList[1] = (input & 0x00ff);
            } else {
                byteList[0] = (input & 0xff00000000000000) >> 56;
                byteList[1] = (input & 0x00ff000000000000) >> 48;
                byteList[2] = (input & 0x0000ff0000000000) >> 40;
                byteList[3] = (input & 0x000000ff00000000) >> 32;
                byteList[4] = (input & 0x00000000ff000000) >> 24;
                byteList[5] = (input & 0x0000000000ff0000) >> 16;
                byteList[6] = (input & 0x000000000000ff00) >> 8;
                byteList[7] = (input & 0x00000000000000ff);
            }
            return byteList;
        },
        toDec: function terminal_commands_websocket_convertDec(input:string):number {
            return parseInt(input, 2);
        }
    },
    // write output from this node application
    send: function terminal_commands_websocket_send(socket:socketClient, data:Buffer|string):void {
        // data is fragmented above 1 million bytes and sent unmasked
        if (socket.closeFlag === true) {
            return;
        }
        let dataPackage:Buffer = (typeof data === "string")
                ? Buffer.from(data)
                : data,
            len:number = dataPackage.length,
            lenFlag:number = 0,
            firstFrag:boolean = true;
        const frame:Buffer = Buffer.alloc(2),
            fragment = function terminal_commands_websocket_send_fragment():void {
                if (firstFrag === true) {
                    firstFrag = false;
                    frame[0] = (typeof data === "string")
                        ? 1
                        : 2;
                    frame[1] = 127;
                } else {
                    lenFlag = (len < 126)
                        ? len
                        : (len < 127)
                            ? 126
                            : 127;
                    frame[0] = (len > 1e6)
                        ? 0
                        : 128; // set fin bit
                    frame[1] = websocket.convert.toDec(`0${websocket.convert.toBin(lenFlag)}`);
                }
                if (len > 1e6) {
                    socket.write(Buffer.concat([frame, websocket.convert.toByte(1e6), dataPackage.slice(0, 1e6)]));
                    dataPackage = dataPackage.slice(1e6);
                    len = len - 1e6;
                    terminal_commands_websocket_send_fragment();
                } else {
                    if (len < 126) {
                        socket.write(Buffer.concat([frame, dataPackage]));
                    } else {
                        socket.write(Buffer.concat([frame, websocket.convert.toByte(len), dataPackage]));
                    }
                }
            };
        if (len > 1e6) {
            fragment();
        } else {
            lenFlag = (len < 126)
                ? len
                : (len < 127)
                    ? 126
                    : 127;
            frame[0] = (typeof data === "string")
                ? 129
                : 130;
            frame[1] = websocket.convert.toDec(`0${websocket.convert.toBin(lenFlag)}`);
            if (len < 126) {
                socket.write(Buffer.concat([frame, dataPackage]));
            } else {
                socket.write(Buffer.concat([frame, websocket.convert.toByte(len), dataPackage]));
            }
        }
    },
    // websocket server and data receiver
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
                                responseHeaders.push("Sec-WebSocket-Version: 13");
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
            dataHandler = function terminal_commands_websocket_dataHandler(socket:socketClient):void {
                const processor = function terminal_commands_websocket_dataHandler_processor(data:Buffer):void {
                    if (data.length < 2 || socket.closeFlag === true) {
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
                    */
                    const bits0:string = websocket.convert.toBin(data[0]), // bit string - convert byte number (0 - 255) to 8 bits
                        bits1:string = websocket.convert.toBin(data[1]),
                        frame:socketFrame = {
                            fin: (bits0.charAt(0) === "1"),
                            rsv1: bits0.charAt(1),
                            rsv2: bits0.charAt(2),
                            rsv3: bits0.charAt(3),
                            opcode: websocket.convert.toDec(bits0.slice(4)),
                            mask: (bits1.charAt(0) === "1"),
                            len: websocket.convert.toDec(bits1.slice(1)),
                            maskKey: null,
                            payload: null
                        };
                    if (frame.len < 126) {
                        if (frame.mask === true) {
                            frame.maskKey = data.slice(2, 6);
                            frame.payload = data.slice(6);
                        } else {
                            frame.payload = data.slice(2);
                        }
                    } else if (frame.len === 126) {
                        if (frame.mask === true) {
                            frame.maskKey = data.slice(4, 8);
                            frame.payload = data.slice(8);
                        } else {
                            frame.payload = data.slice(4);
                        }
                    } else {
                        if (frame.mask === true) {
                            frame.maskKey = data.slice(10, 14);
                            frame.payload = data.slice(14);
                        } else {
                            frame.payload = data.slice(10);
                        }
                    }

                    // unmask payload
                    if (frame.mask === true) {
                        /*
                            RFC 6455, 5.3.  Client-to-Server Masking
                            j                   = i MOD 4
                            transformed-octet-i = original-octet-i XOR masking-key-octet-j
                        */
                        frame.payload.forEach(function terminal_commands_websocket_dataHandler_unmask(value:number, index:number):void {
                            frame.payload[index] = value ^ frame.maskKey[index % 4];
                        });
                    }

                    // store payload or write response
                    if (frame.fin === true) {
                        // complete data frame
                        const opcode:number = (frame.opcode === 0)
                                ? socket.opcode
                                : frame.opcode,
                            control = function terminal_commands_websocket_dataHandler_control():void {
                                if (opcode === 8) {
                                    // remove closed socket from client list
                                    let a:number = websocket.clientList.length;
                                    do {
                                        a = a - 1;
                                        if (websocket.clientList[a].sessionId === socket.sessionId) {
                                            websocket.clientList.splice(a, 1);
                                            break;
                                        }
                                    } while (a > 0);
                                    socket.closeFlag = true;
                                } else if (opcode === 9) {
                                    // respond to "ping" as "pong"
                                    data[0] = websocket.convert.toDec(`1${frame.rsv1 + frame.rsv2 + frame.rsv3}1010`);
                                }
                                data[1] = websocket.convert.toDec(`0${websocket.convert.toBin(frame.payload.length)}`);
                                socket.write(Buffer.concat([data.slice(0, 2), frame.payload]));
                                if (opcode === 8) {
                                    // end the closed socket
                                    socket.end();
                                }
                            };

                        // write frame header + payload
                        if (opcode === 1 || opcode === 2) {
                            // text or binary
                            // !!! process data here !!!
                            console.log(Buffer.concat([socket.fragment, frame.payload]).toString());

                            // reset socket
                            socket.fragment = Buffer.alloc(0);
                            socket.opcode = 0;
                        } else {
                            control();
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
                        socket.closeFlag = false;
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
                if (socket.closeFlag === false) {
                    error([errorItem.toString()]);
                }
            });
        });
        return wsServer;
    }
};

export default websocket;