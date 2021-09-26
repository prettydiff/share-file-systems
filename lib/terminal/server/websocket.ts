/* lib/terminal/commands/websocket - A command utility for creating a websocket server or client. */

import { AddressInfo, createServer as netServer, Server } from "net";
import { createServer as tlsServer } from "tls";

import error from "../utilities/error.js";
import hash from "../commands/hash.js";

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
            len:number = dataPackage.length;
        const opcode:1|2 = (typeof data === "string")
                ? 1
                : 2,
            // writes extended length bytes
            writeLen = function terminal_commands_websocket_send_writeLen(frameItem:Buffer, input:number):void {
                if (input < 65536) {
                    // 16 bit (2 bytes)
                    frameItem.writeInt16BE(input, 2);
                } else {
                    // 64 bit (8 bytes)
                    frameItem.writeDoubleBE(input, 2);
                }
            },
            writeFrame = function terminal_commands_websocket_send_writeFrame(finish:boolean, firstFrame:boolean):void {
                // first two frames are required header, simplified headers because its all unmasked
                // * payload size smaller than 126 bytes
                //   - 0 allocated bytes for extended length value
                //   - length value in byte index 1 is payload length
                // * payload size 126 - 65535 bytes
                //   - 2 bytes allocated for extended length value (indexes 2 and 3)
                //   - length value in byte index 1 is 126
                // * payload size larger than 65535 bytes
                //   - 8 bytes allocated for extended length value (indexes 2 - 9)
                //   - length value in byte index 1 is 127
                const frame:Buffer = (len < 126)
                    ? Buffer.alloc(2)
                    : (len < 65536)
                        ? Buffer.alloc(4)
                        : Buffer.alloc(10);
                // frame 0 is:
                // * 128 bits for fin, 0 for unfinished plus opcode
                // * opcode 0 - continuation of fragments
                // * opcode 1 - text (total payload must be UTF8 and probably not contain hidden control characters)
                // * opcode 2 - supposed to be binary, really anything that isn't 100& UTF8 text
                // ** for fragmented data only first data frame gets a data opcode, others receive 0 (continuity)
                frame[0] = (finish === true)
                    ? (firstFrame === true)
                        ? 128 + opcode
                        : 128
                    : (firstFrame === true)
                        ? opcode
                        : 0;
                // frame 1 is length flag
                frame[1] = (len < 126)
                    ? len
                    : (len < 65536)
                        ? 126
                        : 127;
                if (len > 125) {
                    writeLen(frame, len);
                }
                socket.write(Buffer.concat([frame, dataPackage]));
            },
            fragment = function terminal_commands_websocket_send_fragment(first:boolean):void {
                if (len > 1e6) {
                    // fragmentation
                    if (first === true) {
                        // first frame of fragment
                        writeFrame(false, true);
                    } else if (len > 1e6) {
                        // continuation of fragment
                        writeFrame(false, false);
                    }
                    dataPackage = dataPackage.slice(1e6);
                    len = len - 1e6;
                    terminal_commands_websocket_send_fragment(false);
                } else {
                    // finished, not fragmented if first === true
                    writeFrame(true, first);
                }
            };
        fragment(true);
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
                    const frame:socketFrame = (function terminal_commands_websocket_dataHandler_process_frame():socketFrame {
                        const bits0:string = websocket.convert.toBin(data[0]), // bit string - convert byte number (0 - 255) to 8 bits
                            bits1:string = websocket.convert.toBin(data[1]),
                            frameItem:socketFrame = {
                                fin: (bits0.charAt(0) === "1"),
                                rsv1: bits0.charAt(1),
                                rsv2: bits0.charAt(2),
                                rsv3: bits0.charAt(3),
                                opcode: websocket.convert.toDec(bits0.slice(4)),
                                mask: (bits1.charAt(0) === "1"),
                                len: websocket.convert.toDec(bits1.slice(1)),
                                maskKey: null,
                                payload: null
                            },
                            maskKey = function terminal_commands_websocket_dataHandler_process_frame_maskKey(startByte:number):void {
                                if (frame.mask === true) {
                                    frame.maskKey = data.slice(startByte, startByte + 4);
                                    frame.payload = data.slice(startByte + 4);
                                } else {
                                    frame.payload = data.slice(startByte);
                                }
                            };
                        if (frame.len < 126) {
                            maskKey(2);
                        } else if (frame.len === 126) {
                            maskKey(4);
                        } else {
                            maskKey(10);
                        }
                        return frameItem;
                    }());

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

                        // modify the socket for use in the application
                        socket.closeFlag = false;          // closeFlag - whether the socket is (or about to be) closed, do not write
                        socket.fragment = Buffer.alloc(0); // storehouse of data received for a fragmented data package
                        socket.opcode = 0;                 // stores opcode of fragmented data page (1 or 2), because additional fragmented frames have code 0 (continuity)
                        socket.sessionId = key;            // a unique identifier on which to identify and differential this socket from other client sockets
                        socket.setKeepAlive(true, 0);      // standard method to retain socket against timeouts from inactivity until a close frame comes in
                        websocket.clientList.push(socket); // push this socket into the list of socket clients

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