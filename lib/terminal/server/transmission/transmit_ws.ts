/* lib/terminal/server/transmission/transmit_ws - A command utility for creating a websocket server or client. */

import { AddressInfo, Server, Socket } from "net";
import { StringDecoder } from "string_decoder";
import { connect as tlsConnect, createServer as tlsServer } from "tls";

import agent_status from "../services/agent_status.js";
import error from "../../utilities/error.js";
import getAddress from "../../utilities/getAddress.js";
import hash from "../../commands/hash.js";
import receiver from "./receiver.js";
import sender from "./sender.js";
import vars from "../../utilities/vars.js";

/**
 * The websocket library
 * ```typescript
 * interface transmit_ws {
 *     clientList: {
 *         browser: socketList;
 *         device : socketList;
 *         user   : socketList;
 *     }; // A store of open sockets by agent type.
 *     createSocket: (config:config_websocket_create) => websocket_client;                      // Creates a new socket for use by openAgent and openService methods.
 *     listener    : (socket:websocket_client, handler:(result:socketData|Buffer, transmit:transmit_type, complete:boolean) => void) => void; // A handler attached to each socket to listen for incoming messages.
 *     openAgent   : (config:config_websocket_openAgent) => void;                               // Opens a long-term socket tunnel between known agents.
 *     openService : (config:config_websocket_openService) => void;                             // Opens a service specific tunnel that ends when the service completes.
 *     queue       : (payload:Buffer|socketData, socket:socketClient, browser:boolean) => void; // Pushes outbound data into a managed queue to ensure data frames are not intermixed.
 *     server      : (config:config_websocket_server) => Server;                                // Creates a websocket server.
 *     status      : () => websocket_status;                                                    // Gather the status of agent web sockets.
 * }
 * ``` */
const transmit_ws:module_transmit_ws = {
    // a list of connected clients
    clientList: {
        browser: {},
        device: {},
        user: {}
    },
    // creates a new socket
    createSocket: function terminal_server_transmission_transmitWs_createSocket(config:config_websocket_create):websocket_client {
        if (vars.settings.secure === false) {
            return null;
        }
        let a:number = 0,
            len:number = config.headers.length;
        const socket:Socket = tlsConnect({
                host: config.ip,
                port: config.port,
                rejectUnauthorized: false
            }),
            client:websocket_client = socket as websocket_client,
            header:string[] = [
                "GET / HTTP/1.1",
                `Host: ${config.ip}:${config.port}`,
                "Upgrade: websocket",
                "Connection: Upgrade",
                `Sec-WebSocket-Key: ${Buffer.from(Math.random().toString(), "base64").toString()}`,
                "Sec-WebSocket-Version: 13"
            ];
        if (len > 0) {
            do {
                header.push(config.headers[a]);
                a = a + 1;
            } while (a < len);
        }
        header.push("");
        header.push("");
        client.fragment = [];
        client.opcode = 0;
        client.queue = [];
        client.setKeepAlive(true, 0);
        client.status = "pending";
        client.on("close", function terminal_server_transmission_transmitWs_createSocket_close():void {
            client.status = "closed";
            if (config.handler.close !== null) {
                config.handler.close();
            }
        });
        client.on("end", function terminal_server_transmission_transmitWs_createSocket_end():void {
            client.status = "end";
        });
        client.on("error", function terminal_server_transmission_transmitWs_createSocket_error(errorMessage:NodeJS.ErrnoException):void {
            if (vars.settings.verbose === true && errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                error([
                    config.errorMessage,
                    JSON.stringify(errorMessage),
                    JSON.stringify(getAddress({
                        socket: client,
                        type: "ws"
                    }))
                ]);
            }
        });
        client.on("ready", function terminal_server_transmission_transmitWs_createSocket_ready():void {
            client.write(header.join("\r\n"));
            client.status = "open";
            client.once("data", function terminal_server_transmission_transmitWs_createSocket_ready_data():void {
                config.handler.data(client);
            });
        });
        return client;
    },
    // processes incoming service data for agent sockets
    listener: function terminal_server_transmission_transmitWs_listener(socket:websocket_client, handler:(result:socketData|Buffer, transmit:transmit_type, complete:boolean) => void):void {
        let buf:Buffer[] = [];
        const processor = function terminal_server_transmission_transmitWs_listener_processor(data:Buffer):void {
            buf.push(data);
            if (data.length < 3) {
                return;
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
            const chunk:boolean = (data.length === 16384),
                toBin = function terminal_server_transmission_transmitWs_listener_processor_convertBin(input:number):string {
                    return input.toString(2);
                },
                toDec = function terminal_server_transmission_transmitWs_listener_processor_convertDec(input:string):number {
                    return parseInt(input, 2);
                },
                frame:websocket_frame = (function terminal_server_transmission_transmitWs_listener_processor_frame():websocket_frame {
                    data = Buffer.concat(buf);
                    const bits0:string = toBin(data[0]), // bit string - convert byte number (0 - 255) to 8 bits
                        mask:boolean = (data[1] > 127),
                        len:number = (mask === true)
                            ? data[1] - 128
                            : data[1],
                        extended:number = (function terminal_server_transmission_transmitWs_listener_processor_frame_extended():number {
                            if (len < 126) {
                                return len;
                            }
                            if (len < 127) {
                                return data.slice(2, 4).readUInt16BE(0);
                            }
                            return data.slice(4, 10).readUIntBE(0, 6);
                        }()),
                        frameItem:websocket_frame = {
                            fin: (data[0] > 127),
                            rsv1: bits0.charAt(1),
                            rsv2: bits0.charAt(2),
                            rsv3: bits0.charAt(3),
                            opcode: toDec(bits0.slice(4)),
                            mask: mask,
                            len: len,
                            extended: extended,
                            maskKey: null,
                            payload: null,
                            startByte: (function terminal_server_transmission_transmitWs_listener_processor_frame_startByte():number {
                                const keyOffset:number = (mask === true)
                                    ? 4
                                    : 0;
                                if (len < 126) {
                                    return 2 + keyOffset;
                                }
                                if (len < 127) {
                                    return 4 + keyOffset;
                                }
                                return 10 + keyOffset;
                            }())
                        };
                    if (frameItem.mask === true) {
                        frameItem.maskKey = data.slice(frameItem.startByte - 4, frameItem.startByte);
                    }
                    frameItem.payload = data.slice(frameItem.startByte);

                    return frameItem;
                }()),
                opcode:number = (frame.opcode === 0)
                    ? socket.opcode
                    : frame.opcode;
            if (
                // this is a firefox scenario where the frame header is sent separately ahead of the frame payload
                (frame.fin === true && data.length === frame.startByte) ||
                // this accounts for chunked encoding because TLS will only decode data in 16384 (2**14) max segments
                (chunk === true && frame.extended > 16374)
            ) {
                return;
            }
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

            if (frame.opcode === 0 && handler !== receiver) {
                handler(frame.payload, null, false);
            } else if (opcode === 1 || opcode === 2) {
                if (handler === receiver) {
                    socket.fragment.push(frame.payload);
                    if (frame.fin === true) {
                        const decoder:StringDecoder = new StringDecoder("utf8"),
                            bufferData:Buffer = Buffer.concat(socket.fragment).slice(0, frame.extended),
                            result:string = decoder.end(bufferData);

                        // prevent parsing errors in the case of malformed or empty payloads
                        if (result.charAt(0) === "{" && result.charAt(result.length - 1) === "}") {
                            handler(JSON.parse(result) as socketData, {
                                socket: socket,
                                type: "ws"
                            }, true);
                        }

                        // reset socket
                        buf = [];
                        socket.fragment = [];
                        socket.opcode = 0;
                    } else {
                        // fragment, must be of type text (1) or binary (2)
                        if (frame.opcode > 0) {
                            socket.opcode = frame.opcode;
                        }
                    }
                } else {
                    handler(frame.payload, null, true);
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
                    if (socket.type !== undefined) {
                        delete transmit_ws.clientList[socket.type][socket.sessionId];
                    }
                } else if (opcode === 9) {
                    // respond to "ping" as "pong"
                    data[0] = toDec(`1${frame.rsv1 + frame.rsv2 + frame.rsv3}1010`);
                    write();
                }
            }
        };
        socket.on("data", processor);
    },
    // open a long-term websocket tunnel between known agents
    openAgent: function terminal_server_transmission_transmitWs_openAgent(config:config_websocket_openAgent):void {
        if (vars.settings.secure === false) {
            return;
        }
        if (transmit_ws.clientList[config.agentType][config.agent] !== undefined && transmit_ws.clientList[config.agentType][config.agent] !== null) {
            if (config.callback !== null) {
                config.callback(transmit_ws.clientList[config.agentType][config.agent]);
            }
            return;
        }
        const agent:agent = vars.settings[config.agentType][config.agent];
        transmit_ws.createSocket({
            errorMessage: `Socket error for ${config.agentType} ${config.agent}`,
            handler: {
                close: function terminal_server_transmission_transmitWs_openAgent_close():void {
                    agent_status({
                        data: {
                            agent: config.agent,
                            agentType: config.agentType,
                            broadcast: true,
                            respond: false,
                            status: "offline"
                        },
                        service: "agent-status"
                    });
                },
                data: function terminal_server_transmission_transmitWs_openAgent_data(socket:websocket_client):void {
                    const status:service_agentStatus = {
                        agent: config.agent,
                        agentType: config.agentType,
                        broadcast: true,
                        respond: false,
                        status: "idle"
                    };
                    socket.sessionId = config.agent;
                    socket.type = config.agentType;
                    sender.broadcast({
                        data: status,
                        service: "agent-status"
                    }, "browser");
                    transmit_ws.clientList[config.agentType][config.agent] = socket as websocket_client;
                    transmit_ws.listener(socket, receiver);
                    if (config.callback !== null) {
                        config.callback(socket);
                    }
                }
            },
            headers: [
                `agent: ${config.agent}`,
                `agent-type: ${config.agentType}`
            ],
            ip: agent.ipSelected,
            port: agent.ports.ws
        });
    },
    // opens a service specific websocket tunnel between two points that closes when the service ends
    openService: function terminal_server_transmission_transmitWs_openService(config:config_websocket_openService):void {
        transmit_ws.createSocket({
            errorMessage: "Failed to create file transfer socket.",
            handler: {
                close: null,
                data: function terminal_server_transmission_transmitWs_openService_data(socket:websocket_client):void {
                    // attach listener for agentWrite
                    socket.sessionId = config.service;
                    if (config.callback !== null) {
                        config.callback(socket);
                    }
                }
            },
            headers: [
                `hash: ${config.hash}`,
                `service: ${config.service}`
            ],
            ip: config.ip,
            port: config.port
        });
    },
    // manages queues, because websocket protocol limits one transmission per session in each direction
    queue: function terminal_server_transmission_transmitWs_queue(payload:Buffer|socketData, socket:websocket_client, browser:boolean):void {
        const len:number = socket.queue.length,
            status:socketStatus = socket.status,
            pop = function terminal_server_transmission_transmitWs_queue_pop():void {
                if (len > 0) {
                    const payloadItem:Buffer|socketData = socket.queue.pop();
                    send(payloadItem, socket, browser);
                }
            },
            send = function terminal_server_transmission_transmitWs_queue_send(payload:Buffer|socketData, socket:websocket_client, browser:boolean):void {
                socket.status = "pending";
                // data is fragmented above 1 million bytes and sent unmasked
                if (socket === null || socket === undefined || (vars.settings.secure === false && browser === false)) {
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
                    stringData:string = null,
                    fragment:Buffer = null,
                    frame:Buffer = null;
                const socketData:socketData = payload as socketData,
                    isBuffer:boolean = (socketData.service === undefined),
                    // fragmentation is disabled by assigning a value of 0
                    fragmentSize:number = (browser === true)
                        ? 0
                        : 1e6,
                    op:1|2 = (isBuffer === true)
                        ? 2
                        : 1,
                    writeFrame = function terminal_server_transmission_transmitWs_queue_send_writeFrame(finish:boolean, firstFrame:boolean):void {
                        const size:number = fragment.length;
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
                                ? op
                                : 0;
                        // frame 1 is length flag
                        frame[1] = (size < 126)
                            ? size
                            : (size < 65536)
                                ? 126
                                : 127;
                        if (size > 125) {
                            if (size < 65536) {
                                frame.writeUInt16BE(size, 2);
                            } else {
                                frame.writeUIntBE(size, 4, 6);
                            }
                        }
                        socket.write(Buffer.concat([frame, fragment]));
                        if (finish === true) {
                            socket.status = "open";
                            terminal_server_transmission_transmitWs_queue(null, socket, browser);
                        }
                    },
                    fragmentation = function terminal_server_transmission_transmitWs_queue_send_fragmentation(first:boolean):void {
                        if (len > fragmentSize && fragmentSize > 0) {
                            fragment = (isBuffer === true)
                                ? dataPackage.slice(0, fragmentSize)
                                : Buffer.from(stringData.slice(0, fragmentSize), "utf8");
                            // fragmentation
                            if (first === true) {
                                // first frame of fragment
                                writeFrame(false, true);
                            } else if (len > fragmentSize) {
                                // continuation of fragment
                                writeFrame(false, false);
                            }
                            if (isBuffer === true) {
                                dataPackage = dataPackage.slice(fragmentSize);
                                len = dataPackage.length;
                            } else {
                                stringData = stringData.slice(fragmentSize);
                                len = Buffer.byteLength(stringData, "utf8");
                            }
                            terminal_server_transmission_transmitWs_queue_send_fragmentation(false);
                        } else {
                            // finished, not fragmented if first === true
                            fragment = (isBuffer === true)
                                ? dataPackage
                                : Buffer.from(stringData, "utf8");
                            writeFrame(true, first);
                        }
                    };
                if (isBuffer === false) {
                    stringData = JSON.stringify(payload);
                }
                dataPackage = (isBuffer === true)
                    ? payload as Buffer
                    : Buffer.from(stringData, "utf8");
                len = dataPackage.length;
                frame = (len < 126)
                    ? Buffer.alloc(2)
                    : (len < 65536)
                        ? Buffer.alloc(4)
                        : Buffer.alloc(10);
                fragmentation(true);
            };
        if (status !== "open") {
            socket.queue.unshift(payload);
        } else if (payload !== null) {
            if (status === "open" && len === 0) {
                // bypass using queue if the socket is ready for transmit and queue is empty
                send(payload, socket, browser);
            } else {
                socket.queue.unshift(payload);
                pop();
            }
        }
    },
    // websocket server and data receiver
    server: function terminal_server_transmission_transmitWs_server(config:config_websocket_server):Server {
        const connection = function terminal_server_transmission_transmitWs_server_connection(socket:Socket):void {
                const handshakeHandler = function terminal_server_transmission_transmitWs_server_connection_handshakeHandler(data:Buffer):void {
                    const dataString:string = data.toString(),
                        headers:string[] = dataString.split("\r\n"),
                        responseHeaders:string[] = [],
                        flags:flagList = {
                            agent: (data.indexOf("agent:") < 0),
                            browser: ((/Sec-WebSocket-Protocol:\s*browser-/).test(dataString) === false),
                            key: false,
                            type: (data.indexOf("agent-type:") < 0)
                        },
                        headersComplete = function terminal_server_transmission_transmitWs_server_handshake_headersComplete():void {
                            const socketClientExtension = function terminal_server_transmission_transmitWs_server_handshake_headersComplete_socketClientExtension(item:Socket):websocket_client {
                                const client:websocket_client = item as websocket_client;
                                client.fragment = [];         // storehouse of data received for a fragmented data package
                                client.opcode = 0;            // stores opcode of fragmented data page (1 or 2), because additional fragmented frames have code 0 (continuity)
                                client.queue = [];            // stores messages for transmit, because websocket protocol cannot intermix messages
                                client.setKeepAlive(true, 0); // standard method to retain socket against timeouts from inactivity until a close frame comes in
                                client.status = "open";       // sets the status flag for the socket
                                return client;
                            };
                            if (serviceHash !== null && serviceName !== null) {
                                // service specific sockets processed here
                                const now:string = serviceHash.slice(0, 13);
                                hash({
                                    callback: function terminal_server_transmission_transmitWs_server_handshake_headersComplete_serviceHash(hashOutput:hash_output):void {
                                        if (now + hashOutput.hash === serviceHash) {
                                            const socketClient:websocket_client = socketClientExtension(socket);
                                            socketClient.sessionId = serviceName;
                                            transmit_ws.listener(socketClient, receiver);
                                        } else {
                                            socket.destroy();
                                        }
                                    },
                                    directInput: true,
                                    source: vars.settings.hashUser + vars.settings.hashDevice + now
                                });
                            } else if (flags.agent === true && flags.browser === true && flags.key === true && flags.type === true) {
                                // agent and browser sockets processed here
                                const agents:agents = vars.settings[agentType as agentType],
                                    agency:boolean = (agent === vars.settings.hashDevice || (agents !== undefined && [agent] !== undefined));
                                if (browser !== "test-browser" && (agentType === null || agent === null || agency === false)) {
                                    socket.destroy();
                                } else {
                                    const socketClient:websocket_client = socketClientExtension(socket);
                                    socketClient.sessionId = agent;
                                    socketClient.type = agentType;
                                    responseHeaders.push("HTTP/1.1 101 Switching Protocols");
                                    responseHeaders.push(`Sec-WebSocket-Accept: ${hashString}`);
                                    responseHeaders.push("Upgrade: websocket");
                                    responseHeaders.push("Connection: Upgrade");
                                    if (browser !== null) {
                                        responseHeaders.push(`Sec-WebSocket-Protocol: browser-${browser}`);
                                        agent = hashString;
                                        agentType = "browser";
                                    }
                                    responseHeaders.push("");
                                    responseHeaders.push("");
                                    socket.write(responseHeaders.join("\r\n"));

                                    // modify the socket for use in the application
                                    transmit_ws.clientList[agentType][agent] = socketClient; // push this socket into the list of socket clients

                                    // change the listener to process data
                                    transmit_ws.listener(socketClient, receiver);

                                    if (agentType !== "browser") {
                                        const status:service_agentStatus = {
                                            agent: agent,
                                            agentType: agentType,
                                            broadcast: true,
                                            respond: false,
                                            status: "idle"
                                        };
                                        sender.broadcast({
                                            data: status,
                                            service: "agent-status"
                                        }, "browser");
                                    }
                                }
                            }
                        };
                    let agent:string = null,
                        agentType:agentType|"browser" = null,
                        browser:string = null,
                        hashString:string = null,
                        serviceHash:string = null,
                        serviceName:string = null;
                    headers.forEach(function terminal_server_transmission_transmitWs_server_handshake_headers(header:string):void {
                        if (header.indexOf("Sec-WebSocket-Key") === 0) {
                            const key:string = header.slice(header.indexOf("-Key:") + 5).replace(/\s/g, "") + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
                            hash({
                                algorithm: "sha1",
                                callback: function terminal_server_transmission_transmitWs_server_handshake_headers_callback(hashOutput:hash_output):void {
                                    flags.key = true;
                                    hashString = hashOutput.hash;
                                    headersComplete();
                                },
                                digest: "base64",
                                directInput: true,
                                source: key
                            });
                        } else if (header.indexOf("service:") === 0) {
                            serviceName = header.replace(/service:\s+/, "");
                            headersComplete();
                        } else if (header.indexOf("hash:") === 0) {
                            serviceHash = header.replace(/hash:\s+/, "");
                            headersComplete();
                        } else if (header.indexOf("agent:") === 0) {
                            agent = header.replace(/agent:\s+/, "");
                            flags.agent = true;
                            headersComplete();
                        } else if (header.indexOf("agent-type:") === 0) {
                            agentType = header.replace(/agent-type:\s+/, "") as agentType;
                            flags.type = true;
                            headersComplete();
                        } else if ((/^Sec-WebSocket-Protocol:\s*browser-/).test(header) === true) {
                            const noSpace:string = header.replace(/\s+/g, "");
                            if (noSpace === `Sec-WebSocket-Protocol:browser-${vars.settings.hashDevice}` || (noSpace === "Sec-WebSocket-Protocol:browser-test-browser" && vars.test.type.indexOf("browser_") === 0)) {
                                agent = vars.settings.hashDevice;
                                agentType = "device";
                                browser = noSpace.replace("Sec-WebSocket-Protocol:browser-", "");
                                flags.browser = true;
                                headersComplete();
                            } else {
                                socket.destroy();
                            }
                        }
                    });
                };
                socket.once("data", handshakeHandler);
                socket.on("error", function terminal_server_transmission_transmitWs_server_connection_error(errorMessage:NodeJS.ErrnoException):void {
                    if (vars.settings.verbose === true) {
                        const socketClient:websocket_client = socket as websocket_client;
                        error([
                            `Socket error on listener for ${socketClient.sessionId}`,
                            JSON.stringify(errorMessage),
                            JSON.stringify(getAddress({
                                socket: socket,
                                type: "ws"
                            }))
                        ]);
                    }
                });
            },
            wsServer:Server = tlsServer({
                ca: config.options.options.ca,
                cert: config.options.options.cert,
                key: config.options.options.key,
            }, connection),
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
        wsServer.on("connection", connection);
        return wsServer;
    },
    // generate the status of agent sockets
    status: function terminal_server_transmission_transmitWs_status():websocket_status {
        const output:websocket_status = {
                device: {},
                user: {}
            },
            populate = function terminal_server_transmission_transmitWs_status_populate(agentType:agentType):void {
                const keys:string[] = Object.keys(transmit_ws.clientList[agentType]),
                    keyLength:number = keys.length;
                let a:number = 0,
                    socket:websocket_client = null;
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