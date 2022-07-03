/* lib/terminal/server/transmission/transmit_ws - A command utility for creating a websocket server or client. */

import { AddressInfo, Server, Socket } from "net";
import { StringDecoder } from "string_decoder";
import { connect, createServer, TLSSocket } from "tls";

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
 *     agentClose: (socket:websocket_client) => void;                                               // A uniform way to notify browsers when a remote agent goes offline
 *     clientList: {
 *         browser: socketList;
 *         device : socketList;
 *         user   : socketList;
 *     }; // A store of open sockets by agent type.
 *     clientReceiver  : websocketReceiver;                                                         // Processes data from regular agent websocket tunnels into JSON for processing by receiver library.
 *     createSocket    : (config:config_websocket_create) => websocket_client;                      // Creates a new socket for use by openAgent and openService methods.
 *     listener        : (socket:websocket_client, handler:websocketReceiver) => void;              // A handler attached to each socket to listen for incoming messages.
 *     openAgent       : (config:config_websocket_openAgent) => void;                               // Opens a long-term socket tunnel between known agents.
 *     openService     : (config:config_websocket_openService) => void;                             // Opens a service specific tunnel that ends when the service completes.
 *     queue           : (payload:Buffer|socketData, socket:socketClient, browser:boolean) => void; // Pushes outbound data into a managed queue to ensure data frames are not intermixed.
 *     server          : (config:config_websocket_server) => Server;                                // Creates a websocket server.
 *     socketExtensions: (socket:websocket_client, identifier:string, type:socketType) => void;     // applies application specific extensions to sockets
 *     status          : () => websocket_status;                                                    // Gather the status of agent web sockets.
 * }
 * ``` */
const transmit_ws:module_transmit_ws = {
    // handling an agent socket collapse
    agentClose: function terminal_server_transmission_transmitWs_agentClose(socket:websocket_client):void {
        const type:"device"|"user" = socket.type as "device"|"user";
        // ensures restarting the application does not process close signals from a prior execution instance
        agent_status({
            data: {
                agent: socket.hash,
                agentType: type,
                broadcast: false,
                respond: false,
                status: "offline"
            },
            service: "agent-status"
        });
        socket.status = "closed";
        socket.destroy();
        delete transmit_ws.clientList[type][socket.hash];
    },
    // a list of connected clients
    clientList: {
        browser: {},
        device: {},
        user: {}
    },
    // composes fragments from browsers and agents into JSON for processing by receiver library
    clientReceiver: function terminal_server_transmission_transmitWs_clientReceiver(resultBuffer:Buffer, complete:boolean, socket:websocket_client):void {
        socket.fragment.push(resultBuffer);
        if (complete === true) {
            const decoder:StringDecoder = new StringDecoder("utf8"),
                bufferData:Buffer = Buffer.concat(socket.fragment).slice(0, socket.frameExtended),
                result:string = decoder.end(bufferData);

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
        }
    },
    // creates a new socket
    createSocket: function terminal_server_transmission_transmitWs_createSocket(config:config_websocket_create):websocket_client {
        if (vars.settings.secure === true || vars.test.type.indexOf("browser_") === 0) {
            let a:number = 0,
                len:number = config.headers.length;
            const socket:Socket = connect({
                    host: config.ip,
                    port: config.port,
                    rejectUnauthorized: false
                }),
                client:websocket_client = socket as websocket_client,
                headerHash:string = (config.type === "device")
                    ? vars.settings.hashDevice
                    : (config.type === "user")
                        ? vars.settings.hashUser
                        : config.hash,
                header:string[] = [
                    "GET / HTTP/1.1",
                    `Host: ${config.ip}:${config.port}`,
                    "Upgrade: websocket",
                    "Connection: Upgrade",
                    "Sec-WebSocket-Version: 13",
                    `type: ${config.type}`,
                    `hash: ${headerHash}`
                ];
            hash({
                algorithm: "sha1",
                callback: function terminal_server_transmission_transmitWs_createSocket_hash(hashOutput:hash_output):void {
                    if (len > 0) {
                        do {
                            header.push(config.headers[a]);
                            a = a + 1;
                        } while (a < len);
                    }
                    header.push(`Sec-WebSocket-Key: ${hashOutput.hash}`);
                    header.push("");
                    header.push("");
                    transmit_ws.socketExtensions(client, config.hash, config.type);
                    client.role = "client";
                    if (config.type === "device" || config.type === "user") {
                        setTimeout(function terminal_server_transmission_transmitWs_createSocket_hash_delayClose() {
                            client.on("close", function terminal_server_transmission_transmitWs_createSocket_hash_delayClose_close():void {
                                transmit_ws.agentClose(client);
                            });
                        }, 2000);
                    }
                    client.on("end", function terminal_server_transmission_transmitWs_createSocket_hash_end():void {
                        client.status = "end";
                    });
                    client.on("error", function terminal_server_transmission_transmitWs_createSocket_hash_error(errorMessage:NodeJS.ErrnoException):void {
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
                        config.callback(errorMessage.code);
                    });
                    client.on("ready", function terminal_server_transmission_transmitWs_createSocket_hash_ready():void {
                        client.write(header.join("\r\n"));
                        client.status = "open";
                        client.once("data", function terminal_server_transmission_transmitWs_createSocket_hash_ready_data():void {
                            config.callback(client);
                        });
                    });
                },
                digest: "base64",
                directInput: true,
                source: Buffer.from(Math.random().toString(), "base64").toString()
            });
            return client;
        }
    },
    // processes incoming service data for agent sockets
    listener: function terminal_server_transmission_transmitWs_listener(socket:websocket_client, handler:websocketReceiver):void {
        const processor = function terminal_server_transmission_transmitWs_listener_processor(buf:Buffer):void {
            //    RFC 6455, 5.2.  Base Framing Protocol
            //     0                   1                   2                   3
            //     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
            //    +-+-+-+-+-------+-+-------------+-------------------------------+
            //    |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
            //    |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
            //    |N|V|V|V|       |S|             |   (if payload len==126/127)   |
            //    | |1|2|3|       |K|             |                               |
            //    +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
            //    |     Extended payload length continued, if payload len == 127  |
            //    + - - - - - - - - - - - - - - - +-------------------------------+
            //    |                               |Masking-key, if MASK set to 1  |
            //    +-------------------------------+-------------------------------+
            //    | Masking-key (continued)       |          Payload Data         |
            //    +-------------------------------- - - - - - - - - - - - - - - - +
            //    :                     Payload Data continued ...                :
            //    + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
            //    |                     Payload Data continued ...                |
            //    +---------------------------------------------------------------+

            // 
            socket.frame.push(buf);

            let data:Buffer = Buffer.concat(socket.frame);
            const excess:Buffer[] = [],
                frame:websocket_frame = (function terminal_server_transmission_transmitWs_listener_processor_frame():websocket_frame {
                    const bits0:string = data[0].toString(2).padStart(8, "0"), // bit string - convert byte number (0 - 255) to 8 bits
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
                            rsv1: (bits0.charAt(1) === "1"),
                            rsv2: (bits0.charAt(2) === "1"),
                            rsv3: (bits0.charAt(3) === "1"),
                            opcode: ((Number(bits0.charAt(4)) * 8) + (Number(bits0.charAt(5)) * 4) + (Number(bits0.charAt(6)) * 2) + Number(bits0.charAt(7))),
                            mask: mask,
                            len: len,
                            extended: extended,
                            maskKey: null,
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

                    return frameItem;
                }()),
                unmask = function terminal_server_transmission_transmitWs_listener_processor_unmask(input:Buffer):Buffer {
                    if (frame.mask === true) {
                        // RFC 6455, 5.3.  Client-to-Server Masking
                        // j                   = i MOD 4
                        // transformed-octet-i = original-octet-i XOR masking-key-octet-j
                        input.forEach(function terminal_server_transmission_transmitWs_listener_processor_unmask(value:number, index:number):void {
                            input[index] = value ^ frame.maskKey[index % 4];
                        });
                    }
                    return input;
                },
                packageSize:number = frame.extended + frame.startByte;
            if (data.length < packageSize) {
                return;
            }

            if (data.length > packageSize) {
                // necessary if two frames from unrelated messages are combined into a single packet
                excess.push(data.slice(packageSize));
                data = data.slice(0, packageSize);
            }
            if (frame.opcode === 8) {
                // socket close
                data[0] = 136;
                data[1] = (data[1] > 127)
                    ? data[1] - 128
                    : data[1];
                const payload:Buffer = Buffer.concat([data.slice(0, 2), unmask(data.slice(2))]);
                socket.write(payload);
                socket.off("data", processor);
                if (socket.type === "browser") {
                    delete transmit_ws.clientList[socket.type][socket.hash];
                    socket.destroy();
                } else if (socket.type === "device" || socket.type === "user") {
                    transmit_ws.agentClose(socket);
                }
            } else if (frame.opcode === 9) {
                // respond to "ping" as "pong"
                const buffer:Buffer = Buffer.alloc(6);
                socket.ping = Date.now();
                buffer[0] = 138;
                buffer[1] = 4;
                buffer[2] = 112;
                buffer[3] = 111;
                buffer[4] = 110;
                buffer[5] = 103;
                socket.write(buffer);
            } else if (frame.opcode === 10) {
                // receive pong
                socket.ping = Date.now();
            } else {
                if (frame.opcode === 1 || frame.opcode === 2) {
                    // 1 = text
                    // 2 = binary
                    socket.opcode = frame.opcode;
                }
                if (socket.opcode === 1 || socket.opcode === 2) {
                    // this block may include frame.opcode === 0 - a continuation frame
                    const payload:Buffer = unmask(data.slice(frame.startByte));
                    socket.frameExtended = frame.extended;
                    handler(payload, frame.fin, socket);
                }
            }
            socket.frame = excess;
        };
        socket.on("data", processor);
    },
    // open a long-term websocket tunnel between known agents
    openAgent: function terminal_server_transmission_transmitWs_openAgent(config:config_websocket_openAgent):void {
        if (vars.settings.secure === true || vars.test.type.indexOf("browser_") === 0) {
            if (transmit_ws.clientList[config.type][config.agent] !== undefined && transmit_ws.clientList[config.type][config.agent] !== null) {
                if (config.callback !== null) {
                    config.callback(transmit_ws.clientList[config.type][config.agent]);
                }
                return;
            }
            const agent:agent = vars.settings[config.type][config.agent];
            transmit_ws.createSocket({
                callback: function terminal_server_transmission_transmitWs_openAgent_callback(newSocket:websocket_client|string):void {
                    if (typeof newSocket !== "string") {
                        const status:service_agentStatus = {
                            agent: config.agent,
                            agentType: config.type,
                            broadcast: false,
                            respond: false,
                            status: "idle"
                        };
                        transmit_ws.clientList[config.type][config.agent] = newSocket as websocket_client;
                        transmit_ws.listener(newSocket, transmit_ws.clientReceiver);
                        sender.broadcast({
                            data: status,
                            service: "agent-status"
                        }, "browser");
                    }
                    if (config.callback !== null) {
                        config.callback(newSocket);
                    }
                },
                errorMessage: `Socket error for ${config.type} ${config.agent}`,
                headers: [],
                hash: config.agent,
                ip: agent.ipSelected,
                port: agent.ports.ws,
                type: config.type
            });
        }
    },
    // opens a service specific websocket tunnel between two points that closes when the service ends
    openService: function terminal_server_transmission_transmitWs_openService(config:config_websocket_openService):void {
        transmit_ws.createSocket({
            callback: config.callback,
            errorMessage: `Failed to create socket of type ${config.type}.`,
            headers: [],
            hash: config.hash,
            ip: config.ip,
            port: config.port,
            type: config.type
        });
    },
    // manages queues, because websocket protocol limits one transmission per session in each direction
    queue: function terminal_server_transmission_transmitWs_queue(payload:Buffer|socketData, socket:websocket_client, browser:boolean):void {
        if (browser === true || (browser === false && (vars.settings.secure === true || vars.test.type.indexOf("browser_") === 0))) {
            const len:number = socket.queue.length,
                status:socketStatus = socket.status,
                pop = function terminal_server_transmission_transmitWs_queue_pop():void {
                    if (len > 0) {
                        const payloadItem:Buffer|socketData = socket.queue.pop();
                        send(payloadItem, socket);
                    }
                },
                send = function terminal_server_transmission_transmitWs_queue_send(payload:Buffer|socketData, socket:websocket_client):void {
                    socket.status = "pending";
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
                    send(payload, socket);
                } else {
                    socket.queue.unshift(payload);
                    pop();
                }
            }
        }
    },
    // websocket server and data receiver
    server: function terminal_server_transmission_transmitWs_server(config:config_websocket_server):Server {
        const connection = function terminal_server_transmission_transmitWs_server_connection(TLS_socket:TLSSocket):void {
                const socket:websocket_client = TLS_socket as websocket_client,
                    handshake = function terminal_server_transmission_transmitWs_server_connection_handshake(data:Buffer):void {
                        const browserNonce:string = `Sec-WebSocket-Protocol:browser-${vars.settings.hashDevice}`,
                            testNonce:string = "Sec-WebSocket-Protocol:browser-test-browser",
                            dataString:string = data.toString(),
                            headerList:string[] = dataString.split("\r\n"),
                            flags:flagList = {
                                hash: false,
                                key: false,
                                type: false
                            },
                            headers = function terminal_server_transmission_transmitWs_server_connection_handshake_headers():void {
                                const clientRespond = function terminal_server_transmission_transmitWs_server_connection_handshake_headers_clientRespond():void {
                                        const headers:string[] = [
                                                "HTTP/1.1 101 Switching Protocols",
                                                "Upgrade: websocket",
                                                "Connection: Upgrade",
                                                `Sec-WebSocket-Accept: ${hashKey}`
                                            ];
                                        if (type === "browser") {
                                            if (vars.test.type.indexOf("browser_") === 0) {
                                                headers.push(testNonce);
                                            } else {
                                                headers.push(browserNonce);
                                            }
                                        }
                                        headers.push("");
                                        headers.push("");
                                        socket.write(headers.join("\r\n"));
                                    },
                                    agentTypes = function terminal_server_transmission_transmitWs_server_connection_handshake_headers_agentTypes(agentType:agentType):void {
                                        if (vars.settings[agentType][hashName] === undefined) {
                                            socket.destroy();
                                        } else {
                                            const status:service_agentStatus = {
                                                    agent: hashName,
                                                    agentType: agentType,
                                                    broadcast: true,
                                                    respond: false,
                                                    status: "idle"
                                                },
                                                delay = function terminal_server_transmission_transmitWs_server_connection_handshake_headers_agentTypes_delay():void {
                                                    const buf:Buffer = Buffer.alloc(6);
                                                    buf[0] = 137;
                                                    buf[1] = 4;
                                                    buf[2] = 112;
                                                    buf[3] = 105;
                                                    buf[4] = 110;
                                                    buf[5] = 103;
                                                    socket.write(buf);
                                                    setTimeout(function terminal_server_transmission_transmitWs_server_connection_handshake_headers_agentTypes_delay_setTimeout():void {
                                                        if (Date.now() > socket.ping + 14999) {
                                                            transmit_ws.agentClose(socket);
                                                        } else {
                                                            terminal_server_transmission_transmitWs_server_connection_handshake_headers_agentTypes_delay();
                                                        }
                                                    }, vars.settings.statusTime);
                                                };
                                            transmit_ws.clientList[agentType][hashName] = socket;
                                            transmit_ws.listener(socket, transmit_ws.clientReceiver);
                                            clientRespond();
                                            sender.broadcast({
                                                data: status,
                                                service: "agent-status"
                                            }, "browser");
                                            setTimeout(function terminal_server_transmission_transmitWs_server_handshake_headers_agentTypes_delayClose() {
                                                socket.on("close", function terminal_server_transmission_transmitWs_server_handshake_headers_agentTypes_delayClose_close():void {
                                                    const client:websocket_client = socket as websocket_client;
                                                    transmit_ws.agentClose(client);
                                                });
                                                delay();
                                            }, 2000);
                                        }
                                    };
                                // some complexity is present because browsers will not have a "hash" heading
                                if (flags.type === true && flags.key === true && (type === "browser" || flags.hash === true)) {
                                    const identifier:string = (type === "browser")
                                        ? hashKey
                                        : hashName;
                                    transmit_ws.socketExtensions(socket, identifier, type);
                                    socket.role = "server";
                                    socket.status = "open";
                                    if (type === "browser") {
                                        transmit_ws.clientList.browser[identifier] = socket;
                                        transmit_ws.listener(socket, transmit_ws.clientReceiver);
                                        clientRespond();
                                    } else if (type === "device" || type === "user") {
                                        agentTypes(type);
                                    }
                                }
                            },
                            headerEach = function terminal_server_transmission_transmitWs_server_connection_handshake_headerEach(header:string):void {
                                if (header.indexOf("Sec-WebSocket-Key") === 0) {
                                    const key:string = header.slice(header.indexOf("-Key:") + 5).replace(/\s/g, "") + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
                                    hash({
                                        algorithm: "sha1",
                                        callback: function terminal_server_transmission_transmitWs_server_connection_handshake_headerEach_callback(hashOutput:hash_output):void {
                                            flags.key = true;
                                            hashKey = hashOutput.hash;
                                            headers();
                                        },
                                        digest: "base64",
                                        directInput: true,
                                        source: key
                                    });
                                } else if (header.indexOf("hash:") === 0) {
                                    hashName = header.replace(/hash:\s+/, "");
                                    flags.hash = true;
                                    headers();
                                } else if (header.indexOf("type:") === 0) {
                                    type = header.replace(/type:\s+/, "") as agentType;
                                    flags.type = true;
                                    headers();
                                } else if ((/^Sec-WebSocket-Protocol:\s*browser-/).test(header) === true) {
                                    const noSpace:string = header.replace(/\s+/g, "");
                                    if (noSpace === browserNonce || (noSpace === testNonce && vars.test.type.indexOf("browser_") === 0)) {
                                        type = "browser";
                                        flags.type = true;
                                        headers();
                                    } else {
                                        socket.destroy();
                                    }
                                }
                            };
                        let hashName:string = null,
                            type:socketType = null,
                            hashKey:string = null;
                        headerList.forEach(headerEach);
                    };
                socket.once("data", handshake);
                socket.on("error", function terminal_server_transmission_transmitWs_server_connection_error(errorMessage:NodeJS.ErrnoException):void {
                    if (vars.settings.verbose === true) {
                        const socketClient:websocket_client = socket as websocket_client;
                        error([
                            `Socket error on listener of type ${socketClient.type} for ${socketClient.hash}`,
                            JSON.stringify(errorMessage),
                            JSON.stringify(getAddress({
                                socket: socket,
                                type: "ws"
                            }))
                        ]);
                    }
                });
            },
            wsServer:Server = createServer({
                ca: config.options.options.ca,
                cert: config.options.options.cert,
                key: config.options.options.key,
            }, connection),
            listenerCallback = function terminal_server_transmission_transmitWs_server_listenerCallback():void {
                config.callback(wsServer.address() as AddressInfo);
            };

        if (config.host === "") {
            wsServer.listen({
                port: config.port
            }, listenerCallback);
        } else {
            wsServer.listen({
                host: config.host,
                port: config.port
            }, listenerCallback);
        }
        wsServer.on("connection", connection);
        return wsServer;
    },
    socketExtensions: function terminal_server_transmission_transmitWs_socketExtension(socket:websocket_client, identifier:string, type:socketType):void {
        socket.fragment = [];         // storehouse of complete data frames, which will comprise a frame header and payload body that may be fragmented
        socket.frame = [];            // stores pieces of frames, which can be divided due to TLS decoding or header separation from some browsers
        socket.hash = identifier;     // assigns a unique identifier to the socket based upon the socket's credentials
        socket.opcode = 0;            // stores opcode of fragmented data page (1 or 2), because additional fragmented frames have code 0 (continuity)
        socket.ping = Date.now();     // stores a date number for poll a ttl against
        socket.queue = [];            // stores messages for transmit, because websocket protocol cannot intermix messages
        socket.setKeepAlive(true, 0); // standard method to retain socket against timeouts from inactivity until a close frame comes in
        socket.status = "pending";    // sets the status flag for the socket
        socket.type = type;           // assigns the type name on the socket
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