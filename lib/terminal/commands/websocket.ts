/* lib/terminal/commands/websocket - A command utility for creating websocket a server or client. */

import { AddressInfo, createServer as netServer, Server } from "net";
import { createServer as tlsServer } from "tls";

import error from "../utilities/error.js";
import hash from "./hash.js";

const websocket:websocket = {
    clientList: [],
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
            unmask = function terminal_commands_websocket_unmask(data:Buffer):socketPacket {
                // reference - https://github.com/tholian-network/stealth/blob/X0/stealth/source/packet/WS.mjs

                if (Buffer.isBuffer(data) === false || data.length < 2) {
                    return null;
                }

                const packet:socketPacket = {
                        headers: {
                            operator: null,
                            status: null,
                            transfer: {
                                length: Infinity,
                                range: [0, Infinity]
                            },
                            type: null
                        },
                        overflow: null,
                        payload: null
                    },
                    opcode:number = (data[0] & 15),
                    finFlag:boolean = ((data[0] & 128) === 128),
                    maskFlag:boolean = ((data[1] & 128) === 128),
                    frames:socketFrame = {
                        binary: function terminal_commands_websocket_unmask_binary():void {
                            // 0x01: Text Frame (possibly fragmented)
                            // 0x02: Binary Frame (possibly fragmented)
                            packet.headers.type = (maskFlag === true)
                                ? "request"
                                : "response";
                            packet.payload = payload as Buffer;
                            if (finFlag === true) {
                                packet.headers.transfer.length = payload.length;
                                packet.headers.transfer.range = [0, payload.length - 1];
                            }
                        },
                        close: function terminal_commands_websocket_unmask_close(code:null|1002):void {
                            // 0x08: Connection Close Frame
                            packet.headers.status = (code === null)
                                ? (payload[0] << 8) + payload[1]
                                : code;
                            packet.headers.type = (maskFlag === true)
                                ? "request"
                                : "response";
                        },
                        continuation: function terminal_commands_websocket_unmask_continuation():void {
                            // 0x00: Continuation Frame
                            packet.headers.type = (maskFlag === true)
                                ? "request"
                                : "response";
                            packet.payload = payload as Buffer;
                            if (finFlag === true) {
                                packet.headers.transfer.length = payload.length;
                                packet.headers.transfer.range = [0, payload.length - 1];
                            }
                        },
                        ping: function terminal_commands_websocket_unmask_ping():void {
                            // 0x09: Ping Frame
                            packet.headers.type = "request";
                        },
                        pong: function terminal_commands_websocket_unmask_pong():void {
                            // 0x0a: Pong Frame
                            packet.headers.type = "response";
                        },
                    },
                    payloadSlice = function terminal_commands_websocket_unmask_payloadSlice(offset:number):Uint8Array {
                        return data.slice(offset, offset + dataLength).map(function terminal_commands_websocket_unmask_payloadSlice_map(value:number, index:number):number {
                            return value ^ mask[index % 4];
                        });
                    };
                let dataLength:number = data[1] & 127,
                    mask:Buffer = Buffer.alloc(4),
                    payload:Uint8Array = null,
                    overflow:Buffer = null;
                if (dataLength < 126) {
                    // 7 bit payload
                    if (maskFlag === true && data.length > dataLength + 5) {
                        mask     = data.slice(2, 6);
                        payload  = payloadSlice(6);
                        overflow = data.slice(6 + dataLength);
                    } else if (data.length > dataLength + 1) {
                        payload  = data.slice(2, 2 + dataLength);
                        overflow = data.slice(2 + dataLength);
                    }
                } else if (dataLength === 126) {
                    // 16 bit payload
                    dataLength = (data[2] << 8) + data[3];
                    if (maskFlag === true && data.length > dataLength + 7) {
                        mask     = data.slice(4, 8);
                        payload  = payloadSlice(8);
                        overflow = data.slice(8 + dataLength);
                    } else if (data.length > dataLength + 3) {
                        payload  = data.slice(4, 4 + dataLength);
                        overflow = data.slice(4 + dataLength);
                    }
                } else {
                    // 64 bit payload
                    const hi = (data[2] * 0x1000000) + ((data[3] << 16) | (data[4] << 8) | data[5]),
                        lo   = (data[6] * 0x1000000) + ((data[7] << 16) | (data[8] << 8) | data[9]);
                    dataLength = (hi * 4294967296) + lo;
                    if (maskFlag === true && data.length > dataLength + 13) {
                        mask     = data.slice(10, 14);
                        payload  = data.slice(14, 14 + dataLength);
                        overflow = data.slice(14 + dataLength);
                    } else {
                        payload  = data.slice(10, 10 + dataLength);
                        overflow = data.slice(10 + dataLength);
                    }
                }

                if (overflow !== null && overflow.length > 0) {
                    packet.overflow = overflow;
                }

                packet.headers.operator = opcode;
                if (opcode === 0x00) {
                    frames.continuation();
                } else if (opcode === 0x01 || opcode === 0x02) {
                    frames.binary();
                } else if (opcode === 0x08) {
                    frames.close(null);
                } else if (opcode === 0x09) {
                    frames.ping();
                } else if (opcode === 0x0a) {
                    frames.pong();
                } else {
                    frames.close(1002);
                }
                return packet;
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
                        const maskHandler = function terminal_commands_websocket_connection_handshakeHandler_callback_maskHandler(data:Buffer):void {
                            socket.fragment = Buffer.concat([socket.fragment, data]);

                            const payload:socketPacket = unmask(socket.fragment),
                                opcode:number = payload.headers.operator;
                            if (payload !== null) {
                                socket.fragment = (payload.overflow === null)
                                    ? Buffer.alloc(0)
                                    : payload.overflow;
                                if (payload.headers.transfer.length === Infinity && (opcode === 0x00 || opcode === 0x01 || opcode === 0x02)) {
                                    if (opcode === 0x00) {
                                        socket.frameStack.push(payload);
                                    } else {
                                        socket.frameStack = [payload];
                                    }
                                } else if (payload.headers.transfer.length !== Infinity && opcode === 0x00) {
                                    const first:socketPacket = socket.frameStack[0] || null;
                                    if (first !== null && first.headers.operator === 0x00 && Buffer.isBuffer(first.payload) === true) {
                                        let packetBody:Buffer = first.payload;
                                        socket.frameStack.push(payload);
                                        socket.frameStack.slice(1).forEach(function terminal_commands_websocket_connection_handshakeHandler_callback_maskHandler_frameEach(frame:socketPacket):void {
                                            if (Buffer.isBuffer(frame.payload) === true) {
                                                packetBody = Buffer.concat([packetBody, frame.payload]);
                                            }
                                        });
                                        first.headers.transfer.length = packetBody.length;
                                        first.headers.transfer.range = [0, packetBody.length];
                                        socket.frameStack = [];
                                        
                                    }
                                }
                            }
                        };

                        // modify the socket
                        socket.fragment = Buffer.alloc(0);
                        socket.frameStack = [];
                        socket.sessionId = key;
                        socket.setKeepAlive(true, 0);
                        websocket.clientList.push(socket);
    
                        // change the listener to process data
                        socket.removeListener("data", terminal_commands_websocket_connection_handshakeHandler);
                        socket.on("data", maskHandler);
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