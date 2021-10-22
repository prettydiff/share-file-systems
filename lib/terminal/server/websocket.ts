/* lib/terminal/server/websocket - A command utility for creating a websocket server or client. */

import { AddressInfo, connect as netConnect, createServer as netServer, Server, Socket } from "net";
import { connect as tlsConnect, createServer as tlsServer } from "tls";

import error from "../utilities/error.js";
import hash from "../commands/hash.js";
import serverVars from "./serverVars.js";

const websocket:websocket = {
    // send a given message to all client connections
    broadcast: function terminal_server_websocket_broadcast(payload:Buffer|socketData, listType:websocketClientType):void {
        const list:string[] = Object.keys(websocket.clientList[listType]);
        list.forEach(function terminal_server_websocket_broadcast_each(agent:string):void {
            websocket.send(payload, websocket.clientList[listType][agent]);
        });
    },
    // a list of connected clients
    clientList: {
        browser: {},
        device: {},
        user: {}
    },
    listener: function terminal_server_websocket_listener(socket:socketClient):void {
        const processor = function terminal_server_websocket_listener_processor(data:Buffer):void {
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
            const toBin = function terminal_server_websocket_listener_processor_convertBin(input:number):string {
                    return (input >>> 0).toString(2);
                },
                toDec = function terminal_server_websocket_listener_processor_convertDec(input:string):number {
                    return parseInt(input, 2);
                },
                frame:socketFrame = (function terminal_server_websocket_listener_processor_frame():socketFrame {
                    const bits0:string = toBin(data[0]), // bit string - convert byte number (0 - 255) to 8 bits
                        bits1:string = toBin(data[1]),
                        frameItem:socketFrame = {
                            fin: (bits0.charAt(0) === "1"),
                            rsv1: bits0.charAt(1),
                            rsv2: bits0.charAt(2),
                            rsv3: bits0.charAt(3),
                            opcode: toDec(bits0.slice(4)),
                            mask: (bits1.charAt(0) === "1"),
                            len: toDec(bits1.slice(1)),
                            extended: 0,
                            maskKey: null,
                            payload: null
                        },
                        startByte:number = (function terminal_server_websocket_listener_processor_frame_startByte():number {
                            const keyOffset:number = (frameItem.mask === true)
                                ? 4
                                : 0;
                            if (frameItem.len < 126) {
                                frameItem.extended = frameItem.len;
                                return 2 + keyOffset;
                            }
                            if (frameItem.len < 127) {
                                frameItem.extended = data.slice(2, 4).readUInt16BE(0);
                                return 4 + keyOffset;
                            }
                            frameItem.extended = data.slice(2, 10).readUInt32BE(0);
                            return 10 + keyOffset;
                        }());
                    if (frameItem.mask === true) {
                        frameItem.maskKey = data.slice(startByte - 4, startByte);
                    }
                    frameItem.payload = data.slice(startByte);
                    return frameItem;
                }());

            // unmask payload
            if (frame.mask === true) {
                /*
                    RFC 6455, 5.3.  Client-to-Server Masking
                    j                   = i MOD 4
                    transformed-octet-i = original-octet-i XOR masking-key-octet-j
                */
                frame.payload.forEach(function terminal_server_websocket_listener_processor_unmask(value:number, index:number):void {
                    frame.payload[index] = value ^ frame.maskKey[index % 4];
                });
            }

            // store payload or write response
            if (frame.fin === true) {
                // complete data frame
                const opcode:number = (frame.opcode === 0)
                        ? socket.opcode
                        : frame.opcode,
                    control = function terminal_server_websocket_listener_processor_control():void {
                        if (opcode === 8) {
                            // remove closed socket from client list
                            const types:string[] = ["browser", "device", "user"];
                            let a:number = types.length,
                                b:number = 0,
                                list:string[] = [];
                            do {
                                a = a - 1;
                                list = Object.keys(websocket.clientList[types[a] as websocketClientType]);
                                b = list.length;
                                if (b > 0) {
                                    do {
                                        b = b - 1;
                                        if (websocket.clientList[types[a] as websocketClientType][list[b]].sessionId === socket.sessionId) {
                                            websocket.clientList[types[a] as websocketClientType][list[b]] = null;
                                            return;
                                        }
                                    } while (b > 0);
                                }
                            } while (a > 0);
                            socket.closeFlag = true;
                        } else if (opcode === 9) {
                            // respond to "ping" as "pong"
                            data[0] = toDec(`1${frame.rsv1 + frame.rsv2 + frame.rsv3}1010`);
                        }
                        data[1] = toDec(`0${toBin(frame.payload.length)}`);
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
                    const result:string = Buffer.concat(socket.fragment).slice(0, frame.extended).toString();

                    // reset socket
                    socket.fragment = [];
                    socket.opcode = 0;
                } else {
                    control();
                }
            } else {
                // fragment, must be of type text (1) or binary (2)
                if (frame.opcode > 0) {
                    socket.opcode = frame.opcode;
                }
                socket.fragment.push(frame.payload);
            }
        };
        socket.on("data", processor);
    },
    // open a websocket tunnel
    open: function terminal_server_websocket_open(config:websocketOpen):void {
        const agent:agent = serverVars[config.agentType][config.agent],
            ip:string = agent.ipSelected,
            port:number = agent.ports.ws,
            socket:Socket = (serverVars.secure === true)
                ? tlsConnect(port, ip)
                : netConnect(port, ip),
            client:socketClient = socket as socketClient,
            header:string[] = [
                "GET /chat HTTP/1.1",
                `Host: ${ip}:${port}`,
                "Upgrade: websocket",
                "Connection: Upgrade",
                `Sec-Websocket-Key: ${Buffer.from(Math.random().toString(), "base64").toString()}`,
                "Sec-Websocket-Version: 13",
                `agent: ${config.agent}`,
                `agent-type: ${config.agentType}`,
                ""
            ];
        client.write(header.join("\r\n"));
        client.closeFlag = false;
        client.fragment = [];
        client.opcode = 0;
        client.sessionId = config.agent;
        client.setKeepAlive(true, 0);
        websocket.listener(client);
        websocket.clientList[config.agentType][config.agent] = client as socketClient;
    },
    // write output from this node application
    send: function terminal_server_websocket_send(payload:Buffer|socketData, socket:socketClient):void {
        // data is fragmented above 1 million bytes and sent unmasked
        if (socket === null || socket.closeFlag === true) {
            return;
        }
        let len:number = 0,
            dataPackage:Buffer = null;
        const isBuffer:boolean = (Buffer.isBuffer(payload) === true),
            fragmentSize:number = 1e6,
            opcode:1|2 = (isBuffer === true)
                ? 2
                : 1,
            writeFrame = function terminal_server_websocket_send_writeFrame(finish:boolean, firstFrame:boolean):void {
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
                            : Buffer.alloc(10),
                    method:"writeUInt16BE"|"writeUInt32BE" = (len < 65536)
                        ? "writeUInt16BE"  // 16 bit (2 bytes)
                        : "writeUInt32BE"; // 64 bit (8 bytes), but 64bit numbers are too big for JavaScript;
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
                    frame[method](len, 2);
                }
                socket.write(Buffer.concat([frame, dataPackage.slice(0, fragmentSize)]));
            },
            fragment = function terminal_server_websocket_send_fragment(first:boolean):void {
                if (len > fragmentSize) {
                    // fragmentation
                    if (first === true) {
                        // first frame of fragment
                        writeFrame(false, true);
                    } else if (len > fragmentSize) {
                        // continuation of fragment
                        writeFrame(false, false);
                    }
                    dataPackage = dataPackage.slice(fragmentSize);
                    len = len - fragmentSize;
                    terminal_server_websocket_send_fragment(false);
                } else {
                    // finished, not fragmented if first === true
                    writeFrame(true, first);
                }
            };
        dataPackage = (isBuffer === true)
            ? payload as Buffer
            : Buffer.from(JSON.stringify(payload));
        len = dataPackage.length;
        fragment(true);
    },
    // websocket server and data receiver
    server: function terminal_server_websocket(config:websocketServer):Server {
        const wsServer:Server = (config.cert === null)
            ? netServer()
            : tlsServer({
                cert: config.cert.cert,
                key: config.cert.key,
                requestCert: true
            }),
            handshake = function terminal_server_websocket_handshake(socket:socketClient, data:string, callback:(agent:string, agentType:websocketClientType) => void):void {
                const headers:string[] = data.split("\r\n"),
                    responseHeaders:string[] = [],
                    flags:flagList = {
                        agent: (data.indexOf("agent:") < 0),
                        key: false,
                        type: (data.indexOf("agent-type:") < 0)
                    };
                let agent:string = "",
                    agentType:agentType = null;
                headers.forEach(function terminal_server_websocket_connection_data_each(header:string):void {
                    if (header.indexOf("Sec-WebSocket-Key") === 0) {
                        const key:string = header.slice(header.indexOf("-Key:") + 5).replace(/\s/g, "") + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
                        hash({
                            algorithm: "sha1",
                            callback: function terminal_server_websocket_connection_data_each_hash(hashOutput:hashOutput):void {
                                responseHeaders.push("HTTP/1.1 101 Switching Protocols");
                                responseHeaders.push(`Sec-WebSocket-Accept: ${hashOutput.hash}`);
                                responseHeaders.push("Upgrade: websocket");
                                responseHeaders.push("Connection: Upgrade");
                                responseHeaders.push("");
                                responseHeaders.push("");
                                socket.write(responseHeaders.join("\r\n"));
                                flags.key === true;
                                
                                if (flags.agent === true && flags.type === true) {
                                    if (agent === "") {
                                        callback(key, "browser");
                                    } else {
                                        callback(agent, agentType);
                                    }
                                }
                            },
                            digest: "base64",
                            directInput: true,
                            source: key
                        });
                    } else if (header.indexOf("agent:") === 0) {
                        agent = header.replace(/agent:\s+/, "");
                        flags.agent = true;
                        if (flags.key === true && flags.type === true) {
                            callback(agent, agentType);
                        }
                    } else if (header.indexOf("agent-type:") === 0) {
                        agentType = header.replace(/agent:\s+/, "") as agentType;
                        flags.type = true;
                        if (flags.agent === true && flags.key === true) {
                            callback(agent, agentType);
                        }
                    }
                });
            };

        wsServer.listen({
            host: config.address,
            port: config.port
        }, function terminal_server_websocket_listen():void {
            const addressInfo:AddressInfo = wsServer.address() as AddressInfo;
            config.callback(addressInfo.port);
        });
        wsServer.on("connection", function terminal_server_websocket_connection(socket:socketClient):void {
            const handshakeHandler = function terminal_server_websocket_connection_handshakeHandler(data:Buffer):void {
                    // handshake
                    handshake(socket, data.toString(), function terminal_server_websocket_connection_handshakeHandler_callback(agent:string, agentType:agentType|"browser"):void {

                        // modify the socket for use in the application
                        socket.closeFlag = false;                        // closeFlag - whether the socket is (or about to be) closed, do not write
                        socket.fragment = [];                            // storehouse of data received for a fragmented data package
                        socket.opcode = 0;                               // stores opcode of fragmented data page (1 or 2), because additional fragmented frames have code 0 (continuity)
                        socket.sessionId = agent;                        // a unique identifier on which to identify and differential this socket from other client sockets
                        socket.setKeepAlive(true, 0);                    // standard method to retain socket against timeouts from inactivity until a close frame comes in
                        websocket.clientList[agentType][agent] = socket; // push this socket into the list of socket clients

                        // change the listener to process data
                        socket.removeListener("data", terminal_server_websocket_connection_handshakeHandler);
                        websocket.listener(socket);
                    });
                };
            socket.on("data", handshakeHandler);
            socket.on("error", function terminal_server_websocket_connection_error(errorItem:Error) {
                if (socket.closeFlag === false) {
                    error([errorItem.toString()]);
                }
            });
        });
        return wsServer;
    }
};

export default websocket;