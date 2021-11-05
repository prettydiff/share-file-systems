/* lib/terminal/server/transmission/agent_websocket - A command utility for creating a websocket server or client. */

import { AddressInfo, connect as netConnect, createServer as netServer, Server, Socket } from "net";
import { connect as tlsConnect, createServer as tlsServer } from "tls";

import error from "../../utilities/error.js";
import hash from "../../commands/hash.js";
import receiver from "./receiver.js";
import serverVars from "../serverVars.js";

const agent_ws:websocket = {
    // send a given message to all client connections
    broadcast: function terminal_server_transmission_agentWs_broadcast(payload:Buffer|socketData, listType:websocketClientType):void {
        const list:string[] = Object.keys(agent_ws.clientList[listType]);
        list.forEach(function terminal_server_transmission_agentWs_broadcast_each(agent:string):void {
            agent_ws.send(payload, agent_ws.clientList[listType][agent]);
        });
    },
    // a list of connected clients
    clientList: {
        browser: {},
        device: {},
        user: {}
    },
    listener: function terminal_server_transmission_agentWs_listener(socket:socketClient):void {
        const processor = function terminal_server_transmission_agentWs_listener_processor(data:Buffer):void {
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
            */
            const toBin = function terminal_server_transmission_agentWs_listener_processor_convertBin(input:number):string {
                    return (input >>> 0).toString(2);
                },
                toDec = function terminal_server_transmission_agentWs_listener_processor_convertDec(input:string):number {
                    return parseInt(input, 2);
                },
                frame:socketFrame = (function terminal_server_transmission_agentWs_listener_processor_frame():socketFrame {
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
                        startByte:number = (function terminal_server_transmission_agentWs_listener_processor_frame_startByte():number {
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
                }());

            // unmask payload
            if (frame.mask === true) {
                /*
                    RFC 6455, 5.3.  Client-to-Server Masking
                    j                   = i MOD 4
                    transformed-octet-i = original-octet-i XOR masking-key-octet-j
                */
                frame.payload.forEach(function terminal_server_transmission_agentWs_listener_processor_unmask(value:number, index:number):void {
                    frame.payload[index] = value ^ frame.maskKey[index % 4];
                });
            }

            // store payload or write response
            if (frame.fin === true) {
                // complete data frame
                const opcode:number = (frame.opcode === 0)
                        ? socket.opcode
                        : frame.opcode,
                    write = function terminal_server_transmission_agentWs_listener_processor_write():void {
                        data[1] = toDec(`0${toBin(frame.payload.length)}`);
                        socket.write(Buffer.concat([data.slice(0, 2), frame.payload]));
                    },
                    control = function terminal_server_transmission_agentWs_listener_processor_control():void {
                        if (opcode === 8) {
                            // socket close
                            write();
                            socket.destroy();
                            delete agent_ws.clientList[socket.type][socket.sessionId];
                        } else if (opcode === 9) {
                            // respond to "ping" as "pong"
                            data[0] = toDec(`1${frame.rsv1 + frame.rsv2 + frame.rsv3}1010`);
                            write();
                            socket.pong = process.hrtime.bigint();
                        } else if (opcode === 10) {
                            // on pong update the socket time stamp
                            socket.pong = process.hrtime.bigint();
                        }
                    };

                // write frame header + payload
                if (opcode === 1 || opcode === 2) {
                    // text or binary
                    // !!! process data here !!!
                    const result:string = Buffer.concat(socket.fragment).slice(0, frame.extended).toString();
                    receiver(JSON.parse(result) as socketData, {
                        socket: socket,
                        type: "ws"
                    });

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
    open: function terminal_server_transmission_agentWs_open(config:websocketOpen):void {
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
        client.fragment = [];
        client.opcode = 0;
        client.sessionId = config.agent;
        client.setKeepAlive(true, 0);
        agent_ws.listener(client);
        agent_ws.clientList[config.agentType][config.agent] = client as socketClient;
        if (config.callback !== null) {
            config.callback(client);
        }
    },
    // write output from this node application
    send: function terminal_server_transmission_agentWs_send(payload:Buffer|socketData, socket:socketClient, opcode?:1|2|8|9):void {
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
            writeFrame = function terminal_server_transmission_agentWs_send_writeFrame(finish:boolean, firstFrame:boolean):void {
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
            fragment = function terminal_server_transmission_agentWs_send_fragment(first:boolean):void {
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
                    terminal_server_transmission_agentWs_send_fragment(false);
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
    server: function terminal_server_transmission_agentWs_server(config:websocketServer):Server {
        const wsServer:Server = (config.secure === false || config.cert === null)
            ? netServer()
            : tlsServer({
                cert: config.cert.cert,
                key: config.cert.key,
                requestCert: true
            }),
            handshake = function terminal_server_transmission_agentWs_server_handshake(socket:socketClient, data:string, callback:(agent:string, agentType:websocketClientType) => void):void {
                const headers:string[] = data.split("\r\n"),
                    responseHeaders:string[] = [],
                    flags:flagList = {
                        agent: (data.indexOf("agent:") < 0),
                        key: false,
                        type: (data.indexOf("agent-type:") < 0)
                    };
                let agent:string = "",
                    agentType:agentType = null;
                headers.forEach(function terminal_server_transmission_agentWs_server_handshake_headers(header:string):void {
                    if (header.indexOf("Sec-WebSocket-Key") === 0) {
                        const key:string = header.slice(header.indexOf("-Key:") + 5).replace(/\s/g, "") + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
                        hash({
                            algorithm: "sha1",
                            callback: function terminal_server_transmission_agentWs_server_handshake_headers_callback(hashOutput:hashOutput):void {
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
                        agentType = header.replace(/agent:\s+/, "") as agentType;
                        flags.type = true;
                        if (flags.agent === true && flags.key === true) {
                            callback(agent, agentType);
                        }
                    }
                });
            },
            listenerCallback = function terminal_server_transmission_agentWs_server_listenerCallback():void {
                config.callback(wsServer.address() as AddressInfo);
            },
            activateAgents = function terminal_server_transmission_agentWs_server_activateAgents():void {
                const deviceKeys:string[] = Object.keys(serverVars.device),
                    userKeys:string[] = Object.keys(serverVars.user),
                    agent = function terminal_server_transmission_agentWs_server_activateAgents_agent(type:agentType, agent:string):void {
                        agent_ws.clientList[type][agent] = null;
                        agent_ws.open({
                            agent: agent,
                            agentType: type,
                            callback: null
                        });
                    },
                    list = function terminal_server_transmission_agentWs_server_activateAgents_agent(type:agentType):void {
                        const keys:string[] = Object.keys(serverVars[type]);
                        let a:number = keys.length;
                        if (a > 0) {
                            do {
                                a = a - 1;
                                if (type !== "device" || (type === "device" && keys[a] !== serverVars.hashDevice)) {
                                    agent(type, keys[a]);
                                }
                            } while (a > 0);
                        }
                    };
                list("device");
                list("user");
            };
        activateAgents();

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
        wsServer.on("connection", function terminal_server_transmission_agentWs_connection(socket:socketClient):void {
            const handshakeHandler = function terminal_server_transmission_agentWs_connection_handshakeHandler(data:Buffer):void {
                    // handshake
                    handshake(socket, data.toString(), function terminal_server_transmission_agentWs_connection_handshakeHandler_callback(agent:string, agentType:agentType|"browser"):void {
                        const delay:number = 2000,
                            // sends out a websocket ping every 2 seconds and if the socket's timestamp is older than 4 seconds the socket is destroyed
                            pong = function terminal_server_transmission_agentWs_connection_handshakeHandler_callback_pong(socket:socketClient):void {
                                const now:bigint = process.hrtime.bigint();
                                if ((now - socket.pong) > 4000000000n) { // 4 seconds (4 billion nanoseconds)
                                    agent_ws.send(Buffer.alloc(0), socket, 8);
                                    socket.destroy();
                                    delete agent_ws.clientList[socket.type][socket.sessionId];
                                } else {
                                    agent_ws.send(Buffer.alloc(0), socket, 9);
                                    setTimeout(function terminal_server_transmission_agentWs_connection_handshakeHandler_callback_pong_timeout():void {
                                        pong(socket);
                                    }, delay);
                                }
                            };

                        // modify the socket for use in the application
                        socket.fragment = [];                           // storehouse of data received for a fragmented data package
                        socket.opcode = 0;                              // stores opcode of fragmented data page (1 or 2), because additional fragmented frames have code 0 (continuity)
                        socket.pong = process.hrtime.bigint();          // stores the current time
                        socket.sessionId = agent;                       // a unique identifier on which to identify and differential this socket from other client sockets
                        socket.setKeepAlive(true, 0);                   // standard method to retain socket against timeouts from inactivity until a close frame comes in
                        socket.type = agentType                         // the name of the client list this socket will populate
                        agent_ws.clientList[agentType][agent] = socket; // push this socket into the list of socket clients

                        // change the listener to process data
                        socket.removeListener("data", terminal_server_transmission_agentWs_connection_handshakeHandler);
                        agent_ws.listener(socket);
                        setTimeout(function terminal_server_transmission_agentWs_connection_handshakeHandler_callback_pongWrapper():void {
                            pong(socket);
                        }, delay);
                    });
                };
            socket.on("data", handshakeHandler);
            socket.on("error", function terminal_server_transmission_agentWs_connection_error(errorItem:Error) {
                error([errorItem.toString()]);
            });
        });
        return wsServer;
    }
};

export default agent_ws;