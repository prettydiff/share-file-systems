/* lib/terminal/server/transmission/agent_websocket - A command utility for creating a websocket server or client. */

import { AddressInfo, connect as netConnect, createServer as netServer, NetConnectOpts, Server, Socket } from "net";
import { connect as tlsConnect, createServer as tlsServer } from "tls";

import agent_status from "../services/agent_status.js";
import error from "../../utilities/error.js";
import getAddress from "../../utilities/getAddress.js";
import hash from "../../commands/hash.js";
import receiver from "./receiver.js";
import serverVars from "../serverVars.js";

/**
 * The websocket library
 * * **broadcast** - Send a message to all agents of the given type.
 * * **clientList** - A store of open sockets by agent type.
 * * **listener** - A handler attached to each socket to listen for incoming messages.
 * * **open** - Opens a socket client to a remote socket server.
 * * **send** - Processes a message with appropriate frame headers and writes to the socket.
 * * **server** - Creates a websocket server.
 * * **status** - Gather the status of agent web sockets.
 *
 * ```typescript
 * interface transmit_ws {
 *     broadcast: (payload:Buffer|socketData, listType:websocketClientType) => void;
 *     clientList: {
 *         browser: socketList;
 *         device: socketList;
 *         user: socketList;
 *     };
 *     listener: (socket:socketClient) => void;
 *     open: (config:websocketOpen) => void;
 *     send: (payload:Buffer|socketData, socket:socketClient) => void;
 *     server: (config:websocketServer) => Server;
 *     status: () => websocketStatus;
 * }
 * ``` */
const transmit_ws:module_transmit_ws = {
    // send a given message to all client connections
    broadcast: function terminal_server_transmission_transmitWs_broadcast(payload:Buffer|socketData, listType:websocketClientType):void {
        const list:string[] = Object.keys(transmit_ws.clientList[listType]);
        list.forEach(function terminal_server_transmission_transmitWs_broadcast_each(agent:string):void {
            transmit_ws.send(payload, transmit_ws.clientList[listType][agent]);
        });
    },
    // a list of connected clients
    clientList: {
        browser: {},
        device: {},
        user: {}
    },
    listener: function terminal_server_transmission_transmitWs_listener(socket:socketClient):void {
        const processor = function terminal_server_transmission_transmitWs_listener_processor(data:Buffer):void {
            if (data.length < 3) {
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
            const toBin = function terminal_server_transmission_transmitWs_listener_processor_convertBin(input:number):string {
                    return input.toString(2);
                },
                toDec = function terminal_server_transmission_transmitWs_listener_processor_convertDec(input:string):number {
                    return parseInt(input, 2);
                },
                frame:socketFrame = (function terminal_server_transmission_transmitWs_listener_processor_frame():socketFrame {
                    const bits0:string = toBin(data[0]), // bit string - convert byte number (0 - 255) to 8 bits
                        mask:boolean = (data[1] > 127),
                        frameItem:socketFrame = {
                            fin: (data[0] > 127),
                            rsv1: bits0.charAt(1),
                            rsv2: bits0.charAt(2),
                            rsv3: bits0.charAt(3),
                            opcode: toDec(bits0.slice(4)),
                            mask: mask,
                            len: (mask === true)
                                ? data[1] - 128
                                : data[1],
                            extended: 0,
                            maskKey: null,
                            payload: null
                        },
                        startByte:number = (function terminal_server_transmission_transmitWs_listener_processor_frame_startByte():number {
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
                            frameItem.extended = data.slice(4, 10).readUIntBE(0, 6);
                            return 10 + keyOffset;
                        }());
                    if (frameItem.mask === true) {
                        frameItem.maskKey = data.slice(startByte - 4, startByte);
                    }
                    frameItem.payload = data.slice(startByte);
                    return frameItem;
                }()),
                opcode:number = (frame.opcode === 0)
                    ? socket.opcode
                    : frame.opcode;

            if (frame === null) {
                // frame will be null if less than 5 bytes, so don't process it yet
                return;
            }

            // unmask payload
            if (frame.mask === true) {
                /*
                    RFC 6455, 5.3.  Client-to-Server Masking
                    j                   = i MOD 4
                    transformed-octet-i = original-octet-i XOR masking-key-octet-j
                */
                frame.payload.forEach(function terminal_server_transmission_transmitWs_listener_processor_unmask(value:number, index:number):void {
                    frame.payload[index] = value ^ frame.maskKey[index % 4];
                });
            }

            if (opcode === 1 || opcode === 2) {
                socket.fragment.push(frame.payload);
                if (frame.fin === true) {
                    const result:string = Buffer.concat(socket.fragment).slice(0, frame.extended).toString();

                    // prevent parsing errors in the case of malformed or empty payloads
                    if (result.charAt(0) === "{" && result.charAt(result.length - 1) === "}") {
                        receiver(JSON.parse(result) as socketData, {
                            socket: socket,
                            type: "ws"
                        });
                    }

                    // reset socket
                    socket.fragment = [];
                    socket.opcode = 0;
                } else {
                    // fragment, must be of type text (1) or binary (2)
                    if (frame.opcode > 0) {
                        socket.opcode = frame.opcode;
                    }
                }
            } else {
                const write = function terminal_server_transmission_transmitWs_listener_processor_write():void {
                    data[1] = toDec(`0${toBin(frame.payload.length)}`);
                    socket.write(Buffer.concat([data.slice(0, 2), frame.payload]));
                };
                if (opcode === 8) {
                    // socket close
                    write();
                    socket.destroy();
                    delete transmit_ws.clientList[socket.type][socket.sessionId];
                } else if (opcode === 9) {
                    // respond to "ping" as "pong"
                    data[0] = toDec(`1${frame.rsv1 + frame.rsv2 + frame.rsv3}1010`);
                    write();
                }
            }
        };
        socket.on("data", processor);
    },
    // open a websocket tunnel
    open: function terminal_server_transmission_transmitWs_open(config:websocketOpen):void {
        if (transmit_ws.clientList[config.agentType][config.agent] !== undefined && transmit_ws.clientList[config.agentType][config.agent] !== null) {
            if (config.callback !== null) {
                config.callback(transmit_ws.clientList[config.agentType][config.agent]);
            }
            return;
        }
        const agent:agent = serverVars[config.agentType][config.agent],
            ip:string = agent.ipSelected,
            port:number = agent.ports.ws,
            socketOptions:NetConnectOpts = {
                host: ip,
                localPort: 0,
                port: port
            },
            socket:Socket = (serverVars.secure === true)
                ? tlsConnect(socketOptions)
                : netConnect(socketOptions),
            client:socketClient = socket as socketClient,
            header:string[] = [
                "GET / HTTP/1.1",
                `Host: ${ip}:${port}`,
                "Upgrade: websocket",
                "Connection: Upgrade",
                `Sec-WebSocket-Key: ${Buffer.from(Math.random().toString(), "base64").toString()}`,
                "Sec-WebSocket-Version: 13",
                `agent: ${config.agent}`,
                `agent-type: ${config.agentType}`,
                ""
            ];
        client.status = "pending";
        client.fragment = [];
        client.opcode = 0;
        client.sessionId = config.agent;
        client.setKeepAlive(true, 0);
        client.type = config.agentType;
        client.on("close", function terminal_server_transmission_transmitWs_open_close():void {
            client.status = "closed";
            agent_status({
                data: {
                    agent: config.agent,
                    agentType: config.agentType,
                    status: "offline"
                },
                service: "agent-status"
            }, null);
        });
        client.on("end", function terminal_server_transmission_transmitWs_open_end():void {
            client.status = "end";
        });
        // client.on("error", function terminal_server_transmission_transmitWs_open_error(errorMessage:NodeJS.ErrnoException):void {
        //     if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
        //         error([
        //             `Socket error for ${config.agentType} ${config.agent}`,
        //             JSON.stringify(errorMessage),
        //             JSON.stringify(getAddress({
        //                 socket: client,
        //                 type: "ws"
        //             }))
        //         ]);
        //     }
        // });
        client.on("ready", function terminal_server_transmission_transmitWs_open_ready():void {
            client.write(header.join("\r\n"));
            client.once("data", function terminal_server_transmission_transmitWs_open_ready_handshakeResponse():void {
                client.status = "open";
                transmit_ws.listener(client);
                transmit_ws.clientList[config.agentType][config.agent] = client as socketClient;
                if (config.callback !== null) {
                    config.callback(client);
                }
            });
        });
    },
    // write output from this node application
    send: function terminal_server_transmission_transmitWs_send(payload:Buffer|socketData, socket:socketClient, opcode?:1|2|8|9):void {
        // data is fragmented above 1 million bytes and sent unmasked
        if (socket === null || socket === undefined) {
            return;
        }
        let len:number = 0,
            dataPackage:Buffer = null,
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
            frame:Buffer = null;
        const socketData:socketData = payload as socketData,
            isBuffer:boolean = (socketData.service === undefined),
            fragmentSize:number = 1e6,
            op:1|2|8|9 = (opcode === undefined)
                ? (isBuffer === true)
                    ? 2
                    : 1
                : opcode,
            writeFrame = function terminal_server_transmission_transmitWs_send_writeFrame(finish:boolean, firstFrame:boolean):void {
                // frame 0 is:
                // * 128 bits for fin, 0 for unfinished plus opcode
                // * opcode 0 - continuation of fragments
                // * opcode 1 - text (total payload must be UTF8 and probably not contain hidden control characters)
                // * opcode 2 - supposed to be binary, really anything that isn't 100& UTF8 text
                // ** for fragmented data only first data frame gets a data opcode, others receive 0 (continuity)
                frame[0] = (finish === true)
                    ? (firstFrame === true)
                        ? 128 + op
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
                socket.write(Buffer.concat([frame, dataPackage.slice(0, fragmentSize)]));
            },
            fragment = function terminal_server_transmission_transmitWs_send_fragment(first:boolean):void {
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
                    terminal_server_transmission_transmitWs_send_fragment(false);
                } else {
                    // finished, not fragmented if first === true
                    writeFrame(true, first);
                }
            };
        dataPackage = (isBuffer === true)
            ? payload as Buffer
            : Buffer.from(JSON.stringify(payload));
        len = dataPackage.length;
        frame = (len < 126)
            ? Buffer.alloc(2)
            : (len < 65536)
                ? Buffer.alloc(4)
                : Buffer.alloc(10);
        if (len > 125) {
            if (len < 65536) {
                frame.writeUInt16BE(len, 2);
            } else {
                frame.writeUIntBE(len, 4, 6);
            }
        }
        fragment(true);
    },
    // websocket server and data receiver
    server: function terminal_server_transmission_transmitWs_server(config:websocketServer):Server {
        const wsServer:Server = (config.secure === false || config.cert === null)
            ? netServer()
            : tlsServer({
                cert: config.cert.cert,
                key: config.cert.key,
                requestCert: true
            }),
            handshake = function terminal_server_transmission_transmitWs_server_handshake(socket:socketClient, data:string, callback:(agent:string, agentType:websocketClientType) => void):void {
                const headers:string[] = data.split("\r\n"),
                    responseHeaders:string[] = [],
                    flags:flagList = {
                        agent: (data.indexOf("agent:") < 0),
                        key: false,
                        type: (data.indexOf("agent-type:") < 0)
                    };
                let agent:string = "",
                    agentType:agentType = null;
                headers.forEach(function terminal_server_transmission_transmitWs_server_handshake_headers(header:string):void {
                    if (header.indexOf("Sec-WebSocket-Key") === 0) {
                        const key:string = header.slice(header.indexOf("-Key:") + 5).replace(/\s/g, "") + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
                        hash({
                            algorithm: "sha1",
                            callback: function terminal_server_transmission_transmitWs_server_handshake_headers_callback(hashOutput:hashOutput):void {
                                responseHeaders.push("HTTP/1.1 101 Switching Protocols");
                                responseHeaders.push(`Sec-WebSocket-Accept: ${hashOutput.hash}`);
                                responseHeaders.push("Upgrade: websocket");
                                responseHeaders.push("Connection: Upgrade");
                                responseHeaders.push("");
                                responseHeaders.push("");
                                socket.write(responseHeaders.join("\r\n"));
                                flags.key = true;
                                if (flags.agent === true && flags.type === true) {
                                    if (agent === "") {
                                        callback(hashOutput.hash, "browser");
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
                        agentType = header.replace(/agent-type:\s+/, "") as agentType;
                        flags.type = true;
                        if (flags.agent === true && flags.key === true) {
                            callback(agent, agentType);
                        }
                    }
                });
            },
            listenerCallback = function terminal_server_transmission_transmitWs_server_listenerCallback():void {
                config.callback(wsServer.address() as AddressInfo);
            };

        if (typeof config.address === "string" && config.address.length > 0) {
            wsServer.listen({
                host: config.address,
                port: config.port
            }, listenerCallback);
        } else {
            wsServer.listen({
                port: config.port
            }, listenerCallback);
        }
        wsServer.on("connection", function terminal_server_transmission_transmitWs_server_connection(socket:socketClient):void {
            const handshakeHandler = function terminal_server_transmission_transmitWs_server_connection_handshakeHandler(data:Buffer):void {
                    // handshake
                    handshake(socket, data.toString(), function terminal_server_transmission_transmitWs_server_connection_handshakeHandler_callback(agent:string, agentType:agentType|"browser"):void {

                        // modify the socket for use in the application
                        socket.fragment = [];                           // storehouse of data received for a fragmented data package
                        socket.opcode = 0;                              // stores opcode of fragmented data page (1 or 2), because additional fragmented frames have code 0 (continuity)
                        socket.sessionId = agent;                       // a unique identifier on which to identify and differential this socket from other client sockets
                        socket.setKeepAlive(true, 0);                   // standard method to retain socket against timeouts from inactivity until a close frame comes in
                        socket.type = agentType;                        // the name of the client list this socket will populate
                        transmit_ws.clientList[agentType][agent] = socket; // push this socket into the list of socket clients

                        // change the listener to process data
                        transmit_ws.listener(socket);
                    });
                };
            socket.once("data", handshakeHandler);
            socket.on("error", function terminal_server_transmission_transmitWs_server_connection_error(errorItem:Error) {
                error([errorItem.toString()]);
            });
        });
        return wsServer;
    },
    // generate the status of agent sockets
    status: function terminal_server_transmission_transmitWs_status():websocketStatus {
        const output:websocketStatus = {
                device: {},
                user: {}
            },
            populate = function terminal_server_transmission_transmitWs_status_populate(agentType:agentType):void {
                const keys:string[] = Object.keys(transmit_ws.clientList[agentType]),
                    keyLength:number = keys.length;
                let a:number = 0,
                    socket:socketClient = null;
                if (keyLength > 0) {
                    do {
                        socket = transmit_ws.clientList[agentType][keys[a]];
                        output[agentType][keys[a]] = {
                            portLocal: socket.localPort,
                            portRemote: socket.remotePort,
                            status: socket.status
                        };
                        a = a + 1;
                    } while (a < keyLength);
                }
            };
        populate("device");
        populate("user");
        return output;
    }
};

export default transmit_ws;