/* lib/terminal/server/transmission/transmit_ws - A command utility for creating a websocket server or client. */

import { AddressInfo, createServer as createInsecureServer, Server, Socket } from "net";
import { StringDecoder } from "string_decoder";
import { connect, createServer as createSecureServer, TLSSocket } from "tls";

import agent_management from "../services/agent_management.js";
import agent_status from "../services/agent_status.js";
import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import getAddress from "../../utilities/getAddress.js";
import hash from "../../commands/library/hash.js";
import log from "../../utilities/log.js";
import receiver from "./receiver.js";
import sender from "./sender.js";
import transmitLogger from "./transmit_logger.js";
import vars from "../../utilities/vars.js";

/**
 * The websocket library
 * ```typescript
 * interface transmit_ws {
 *     agentClose      : (socket:websocket_client) => void;                                    // A uniform way to notify browsers when a remote agent goes offline
 *     agentUpdate     : (update:config_websocket_agentUpdate) => void;                        // Processes agent data received on socket establishment
 *     clientList: {
 *         browser: socketList;
 *         device : socketList;
 *         map: {
 *             [key:string]: {
 *                 [key:string]: string;
 *             };
 *         };
 *         user   : socketList;
 *     };                                                                                      // A store of open sockets by agent type.
 *     clientReceiver  : websocketReceiver;                                                    // Processes data from regular agent websocket tunnels into JSON for processing by receiver library.
 *     createSocket    : (config:config_websocket_create) => websocket_client;                 // Creates a new socket for use by openAgent and openService methods.
 *     ipAttempts: {
 *         device: {
 *             [key:string]: string[];
 *         };
 *         user: {
 *             [key:string]: string[];
 *         };
 *     };                                                                                      // stores connection attempts as a list of ip addresses by agent hash
 *     listener        : (buf:Buffer) => void;                                                 // A handler attached to each socket to listen for incoming messages.
 *     openAgent       : (config:config_websocket_openAgent) => void;                          // Opens a long-term socket tunnel between known agents.
 *     openService     : (config:config_websocket_openService) => void;                        // Opens a service specific tunnel that ends when the service completes.
 *     queue           : (body:Buffer|socketData, socket:socketClient, opcode:number) => void; // Pushes outbound data into a managed queue to ensure data frames are not intermixed.
 *     server          : (config:config_websocket_server) => Server;                           // Creates a websocket server.
 *     socketExtensions: (config:config_websocket_extensions) => void;                         // applies application specific extensions to sockets
 *     status          : () => websocket_status;                                               // Gather the status of agent web sockets.
 * }
 * ``` */
const transmit_ws:module_transmit_ws = {
    // handling an agent socket collapse
    agentClose: function terminal_server_transmission_transmitWs_agentClose(socket:websocket_client):void {
        const type:"device"|"user" = socket.type as "device"|"user";
        if (socket.type === "device" || socket.type === "user") {
            const agent:agent = vars.settings[type][socket.hash];
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
            if (vars.settings.verbose === true) {
                log([`${common.capitalize(socket.role)}-side socket ${vars.text.angry}closed${vars.text.none} for ${vars.text.underline + type + vars.text.none} ${vars.text.cyan + agent.name + vars.text.none}.`]);
            }
        }
        socket.status = "closed";
        socket.destroy();
        delete transmit_ws.clientList[type][socket.hash];
    },
    // updates a remote agent on socket connection using data provided by that remote agent
    agentUpdate: function terminal_server_transmission_transmitWs_agentUpdate(update:config_websocket_agentUpdate):void {
        if (update !== null && update !== undefined && update.ip !== null && update.ip !== undefined) {
            if ((update.type === "device" || update.type === "user") && vars.settings[update.type][update.hash] !== undefined && Array.isArray(update.ip.IPv4) === true && Array.isArray(update.ip.IPv6) === true) {
                const agent:agent = vars.settings[update.type][update.hash],
                    status:service_agentStatus = {
                        agent: update.hash,
                        agentType: update.type,
                        broadcast: true,
                        respond: false,
                        status: "idle"
                    };
                agent_status({
                    data: status,
                    service: "agent-status"
                });
                if (JSON.stringify(agent.ipAll) !== JSON.stringify(update.ip) || JSON.stringify(agent.shares) !== JSON.stringify(update.shares) || agent.ipSelected !== update.ipSelected) {
                    agent.ipAll = update.ip;
                    agent.ipSelected = update.ipSelected;
                    agent.shares = update.shares;
                    agent.status = update.status;

                    const management:service_agentManagement = {
                        action: "modify",
                        agents: {
                            device: (update.type === "device")
                                ? {[update.hash]: vars.settings.device[update.hash]}
                                : {},
                            user: (update.type === "user")
                                ? {[update.hash]: vars.settings.user[update.hash]}
                                : {}
                        },
                        agentFrom: (update.type === "user")
                            ? "user"
                            : update.hash,
                        deviceUser: null
                    };
                    agent_management({
                        data: management,
                        service: "agent-management"
                    });
                }
            }
        }
    },
    // a list of connected clients
    clientList: {
        browser: {},
        device: {},
        map: {},
        user: {}
    },
    // composes fragments from browsers and agents into JSON for processing by receiver library
    clientReceiver: function terminal_server_transmission_transmitWs_clientReceiver(socket:websocket_client):void {
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
    },
    // creates a new socket as a client to a remote server
    createSocket: function terminal_server_transmission_transmitWs_createSocket(config:config_websocket_create):websocket_client {
        if (config.ip === "") {
            // an empty string defaults to loopback, which creates an endless feedback loop
            return;
        }
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
                hostString:string = (config.ip.indexOf(":") > -1)
                    ? `Host: [${config.ip}]:${config.port}`
                    : `Host: ${config.ip}:${config.port}`,
                header:string[] = [
                    "GET / HTTP/1.1",
                    hostString,
                    "Upgrade: websocket",
                    "Connection: Upgrade",
                    "Sec-WebSocket-Version: 13",
                    `type: ${config.type}`,
                    `hash: ${headerHash}`
                ];
            hash({
                algorithm: "sha1",
                callback: function terminal_server_transmission_transmitWs_createSocket_hash(title:string, hashOutput:hash_output):void {
                    if (len > 0) {
                        do {
                            header.push(config.headers[a]);
                            a = a + 1;
                        } while (a < len);
                    }
                    header.push(`Sec-WebSocket-Key: ${hashOutput.hash}`);
                    client.once("error", function terminal_server_transmission_transmitWs_createSocket_hash_error(errorMessage:NodeJS.ErrnoException):void {
                        if (config.type === "device" || config.type === "user") {
                            transmit_ws.ipAttempts[config.type][config.hash].push(config.ip);
                            client.hash = config.hash;
                            client.type = config.type;
                            config.callbackCreate(client, false, config.callbackRequest);
                            client.destroy();
                        }
                        if (vars.settings.verbose === true) {
                            error([
                                "Error attempting websocket connect from client side.",
                                JSON.stringify(errorMessage)
                            ]);
                        }
                    });
                    client.on("end", function terminal_server_transmission_transmitWs_createSocket_hash_end():void {
                        client.status = "end";
                    });
                    client.once("ready", function terminal_server_transmission_transmitWs_createSocket_hash_ready():void {
                        // eslint-disable-next-line
                        const socket:websocket_client = this;
                        socket.type = config.type;
                        if (config.type === "device" || config.type === "user") {
                            const userData:userData = common.userData(vars.settings.device, config.type, config.hash),
                                update:config_websocket_agentUpdate = {
                                    hash: socket.hash,
                                    ip: userData[1],
                                    ipSelected: getAddress({socket: socket, type: "ws"}).local,
                                    shares: userData[0],
                                    status: "active",
                                    type: config.type
                                };
                            header.push(`agent: ${JSON.stringify(update)}`);
                        }
                        header.push("");
                        header.push("");
                        socket.write(header.join("\r\n"));
                        socket.once("data", function terminal_server_transmission_transmitWs_createSocket_hash_ready_data(data:Buffer):void {
                            // eslint-disable-next-line
                            const socketItem:websocket_client = this,
                                str:string = data.toString().replace(/^\s+/, "").replace(/\s+$/, ""),
                                update:config_websocket_agentUpdate = (str.charAt(0) === "{" && str.charAt(str.length - 1) === "}")
                                    ? JSON.parse(str)
                                    : null;
                            transmit_ws.socketExtensions({
                                handler: transmit_ws.clientReceiver,
                                identifier: config.hash,
                                role: "client",
                                socket: socket,
                                type: config.type,
                                update: update
                            });
                            config.callbackCreate(socketItem, true, config.callbackRequest);
                        });
                    });
                },
                digest: "base64",
                directInput: true,
                id: null,
                list: false,
                parent: null,
                source: Buffer.from(Math.random().toString(), "base64").toString(),
                stat: null
            });
            return client;
        }
    },
    ipAttempts: {
        device: {},
        user: {}
    },
    // processes incoming service data for agent sockets
    listener: function terminal_server_transmission_transmitWs_listener(buf:Buffer):void {
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

        if (buf !== null) {
            // eslint-disable-next-line
            this.frame.push(buf);
        }

        // eslint-disable-next-line
        let data:Buffer = Buffer.concat(this.frame),
            excess:Buffer = null;
        // eslint-disable-next-line
        const socket:websocket_client = this,
            frame:websocket_frame = (function terminal_server_transmission_transmitWs_listener_frame():websocket_frame {
                const bits0:string = data[0].toString(2).padStart(8, "0"), // bit string - convert byte number (0 - 255) to 8 bits
                    mask:boolean = (data[1] > 127),
                    len:number = (mask === true)
                        ? data[1] - 128
                        : data[1],
                    extended:number = (function terminal_server_transmission_transmitWs_listener_frame_extended():number {
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
                        startByte: (function terminal_server_transmission_transmitWs_listener_frame_startByte():number {
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
            unmask = function terminal_server_transmission_transmitWs_listener_unmask(input:Buffer):Buffer {
                if (frame.mask === true) {
                    // RFC 6455, 5.3.  Client-to-Server Masking
                    // j                   = i MOD 4
                    // transformed-octet-i = original-octet-i XOR masking-key-octet-j
                    input.forEach(function terminal_server_transmission_transmitWs_listener_unmask(value:number, index:number):void {
                        input[index] = value ^ frame.maskKey[index % 4];
                    });
                }
                return input;
            },
            len:number = data.length,
            packageSize:number = frame.extended + frame.startByte,
            payload:Buffer = unmask(data.slice(frame.startByte));

        if (len < packageSize) {
            return;
        }

        if (len > packageSize) {
            // necessary if two frames from unrelated messages are combined into a single packet
            excess = data.slice(packageSize);
            data = data.slice(0, packageSize);
        }

        transmitLogger({
            direction: "receive",
            size: data.length,
            socketData: {
                data: payload,
                service: "response-no-action"
            },
            transmit: {
                socket: socket,
                type: "ws"
            }
        });

        if (frame.opcode === 8) {
            // socket close
            data[0] = 136;
            data[1] = (data[1] > 127)
                ? data[1] - 128
                : data[1];
            const payload:Buffer = Buffer.concat([data.slice(0, 2), unmask(data.slice(2))]);
            socket.write(payload);
            socket.off("data", transmit_ws.listener);
            transmit_ws.agentClose(socket);
        } else if (frame.opcode === 9) {
            // respond to "ping" as "pong"
            transmit_ws.queue(data.slice(frame.startByte), socket, 10);
        } else if (frame.opcode === 10) {
            // pong
            const payloadString:string = payload.toString(),
                pong:websocket_pong = socket.pong[payloadString],
                time:bigint = process.hrtime.bigint();
            if (pong !== undefined) {
                if (time < pong.start + pong.ttl) {
                    clearTimeout(pong.timeOut);
                    pong.callback(null, time - pong.start);
                }
                delete socket.pong[payloadString];
            }
        } else {
            // this block may include frame.opcode === 0 - a continuation frame
            socket.frameExtended = frame.extended;
            socket.fragment.push(payload);
            if (frame.fin === true) {
                socket.handler(socket);

                // reset socket
                socket.fragment = [];
            }
        }
        if (excess === null) {
            socket.frame = [];
        } else {
            socket.frame = [excess];
            terminal_server_transmission_transmitWs_listener(null);
        }
    },
    // open a long-term websocket tunnel between known agents
    openAgent: function terminal_server_transmission_transmitWs_openAgent(config:config_websocket_openAgent):void {
        if (vars.settings.secure === true || vars.test.type.indexOf("browser_") === 0) {
            if (vars.settings[config.type][config.agent] === undefined || (transmit_ws.clientList[config.type][config.agent] !== undefined && transmit_ws.clientList[config.type][config.agent] !== null)) {
                if (config.callback !== null) {
                    config.callback(transmit_ws.clientList[config.type][config.agent]);
                }
                return;
            }
            if (transmit_ws.ipAttempts[config.type][config.agent] === undefined) {
                transmit_ws.ipAttempts[config.type][config.agent] = [];
            }
            const agent:agent = vars.settings[config.type][config.agent],
                attempts:string[] = transmit_ws.ipAttempts[config.type][config.agent],
                selfIP:transmit_addresses_IP = vars.network.addresses,
                ip:string = (function terminal_server_transmission_transmitWs_openAgent_ip():string {
                    const ipList = function terminal_server_transmission_transmitWs_openAgent_ip_ipList(type:"IPv4"|"IPv6"):string {
                            let a:number = agent.ipAll[type].length;
                            if (a > 0) {
                                do {
                                    a = a - 1;
                                    if (selfIP[type].indexOf(agent.ipAll[type][a]) > -1) {
                                        // don't bother attempting to send to an IP address present on the local device (ip collision)
                                        attempts.push(agent.ipAll[type][a]);
                                    } else if (attempts.indexOf(agent.ipAll[type][a]) < 0) {
                                        return agent.ipAll[type][a];
                                    }
                                } while (a > 0);
                            }
                            return null;
                        },
                        IPv6 = ipList("IPv6");
                    if (attempts.length < 1) {
                        return agent.ipSelected;
                    }
                    if (IPv6 === null) {
                        return ipList("IPv4");
                    }
                    return IPv6;
                }());
            if (ip === null) {
                const status:service_agentStatus = {
                    agent: config.agent,
                    agentType: config.type,
                    broadcast: false,
                    respond: false,
                    status: "offline"
                };
                agent.status = "offline";
                transmit_ws.ipAttempts[config.type][config.agent] = [];
                sender.broadcast({
                    data: status,
                    service: "agent-status"
                }, "browser");
            } else {
                transmit_ws.createSocket({
                    callbackCreate: function terminal_server_transmission_transmitWs_openAgent_callbackCreate(socket:websocket_client, healthy:boolean, callbackRequest:(socket:websocket_client) => void):void {
                        if (healthy === true) {
                            vars.settings[config.type][config.agent].ipSelected = getAddress({
                                socket: socket,
                                type: "ws"
                            }).remote;
                            transmit_ws.ipAttempts[config.type][config.agent] = [];
                            if (callbackRequest !== null) {
                                callbackRequest(socket);
                            }
                        } else {
                            terminal_server_transmission_transmitWs_openAgent({
                                agent: socket.hash,
                                callback: callbackRequest,
                                type: socket.type as agentType
                            });
                        }
                    },
                    callbackRequest: config.callback,
                    headers: [],
                    hash: config.agent,
                    ip: ip,
                    port: agent.ports.ws,
                    type: config.type
                });
            }
        }
    },
    // opens a service specific websocket tunnel between two points that closes when the service ends
    openService: function terminal_server_transmission_transmitWs_openService(config:config_websocket_openService):void {
        transmit_ws.createSocket({
            callbackCreate: config.callback,
            callbackRequest: null,
            headers: [],
            hash: config.hash,
            ip: config.ip,
            port: config.port,
            type: config.type
        });
    },
    // manages queues, because websocket protocol limits one transmission per session in each direction
    queue: function terminal_server_transmission_transmitWs_queue(body:Buffer|socketData, socketItem:websocket_client, opcode:number):void {
        const browser:boolean = (socketItem.type === "browser");
        if (browser === true || (browser === false && (vars.settings.secure === true || vars.test.type.indexOf("browser_") === 0))) {
            const writeFrame = function terminal_server_transmission_transmitWs_queue_writeFrame():void {
                    const writeCallback = function terminal_server_transmission_transmitWs_queue_writeFrame_writeCallback():void {
                        socketItem.queue.splice(0, 1);
                        if (socketItem.queue.length > 0) {
                            terminal_server_transmission_transmitWs_queue_writeFrame();
                        } else {
                            socketItem.status = "open";
                        }
                    };
                    socketItem.status = "pending";
                    if (socketItem.write(socketItem.queue[0]) === true) {
                        writeCallback();
                    } else {
                        socketItem.once("drain", writeCallback);
                    }
                };
            // OPCODES
            // ## Messages
            // 0 - continuation - fragments of a message payload following an initial fragment
            // 1 - text message
            // 2 - binary message
            // 3-7 - reserved for future use
            //
            // ## Control Frames
            // 8 - close, the remote is destroying the socket
            // 9 - ping, a connectivity health check
            // a - pong, a response to a ping
            // b-f - reserved for future use
            //
            // ## Notes
            // * Message frame fragments must be transmitted in order and not interleaved with other messages.
            // * Message types may be supplied as buffer or socketData types, but will always be transmitted as buffers.
            // * Control frames are always granted priority and may occur between fragments of a single message.
            // * Control frames will always be supplied as buffer data types.
            //
            // ## Masking
            // * All traffic coming from the browser will be websocket masked.
            // * I have not tested if the browsers will process masked data as they shouldn't according to RFC 6455.
            // * This application supports both masked and unmasked transmission so long as the mask bit is set and a 16bit mask key is supplied.
            // * Mask bit is set as payload length (up to 127) + 128 assigned to second frame header byte.
            // * Mask key is first 4 bytes following payload length bytes (if any).
            if (opcode === 1 || opcode === 2 || opcode === 3 || opcode === 4 || opcode === 5 || opcode === 6 || opcode === 7) {
                const socketData:socketData = body as socketData,
                    isBuffer:boolean = (socketData.service === undefined),
                    // fragmentation is disabled by assigning a value of 0
                    fragmentSize:number = (browser === true)
                        ? 0
                        : 1e6,
                    op:1|2 = (isBuffer === true)
                        ? 2
                        : 1,
                    fragmentation = function terminal_server_transmission_transmitWs_queue_fragmentation(first:boolean):void {
                        let finish:boolean = false;
                        const frameBody:Buffer = (function terminal_server_transmission_transmitWs_queue_fragmentation_frameBody():Buffer {
                                if (fragmentSize < 1 || len === fragmentSize) {
                                    finish = true;
                                    return dataPackage;
                                }
                                const fragment = dataPackage.slice(0, fragmentSize);
                                dataPackage = dataPackage.slice(fragmentSize);
                                len = dataPackage.length;
                                if (len < fragmentSize) {
                                    finish = true;
                                }
                                return fragment;
                            }()),
                            size:number = frameBody.length,
                            frameHeader:Buffer = (function terminal_server_transmission_transmitWs_queue_fragmentation_frameHeader():Buffer {
                                // frame 0 is:
                                // * 128 bits for fin, 0 for unfinished plus opcode
                                // * opcode 0 - continuation of fragments
                                // * opcode 1 - text (total payload must be UTF8 and probably not contain hidden control characters)
                                // * opcode 2 - supposed to be binary, really anything that isn't 100& UTF8 text
                                // ** for fragmented data only first data frame gets a data opcode, others receive 0 (continuity)
                                const frame:Buffer = (size < 126)
                                    ? Buffer.alloc(2)
                                    : (size < 65536)
                                        ? Buffer.alloc(4)
                                        : Buffer.alloc(10);
                                frame[0] = (finish === true)
                                    ? (first === true)
                                        ? 128 + op
                                        : 128
                                    : (first === true)
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
                                return frame;
                            }());
                        socketItem.queue.push(Buffer.concat([frameHeader, frameBody]));
                        if (finish === true) {
                            if (socketItem.status === "open") {
                                writeFrame();
                            }
                        } else {
                            terminal_server_transmission_transmitWs_queue_fragmentation(false);
                        }
                    };
                let dataPackage:Buffer = (isBuffer === true)
                        ? body as Buffer
                        : Buffer.from(JSON.stringify(body as socketData)),
                    len:number = dataPackage.length;
                transmitLogger({
                    direction: "send",
                    size: dataPackage.length,
                    socketData: {
                        data: dataPackage,
                        service: (isBuffer === true)
                            ? "response-no-action"
                            : socketData.service
                    },
                    transmit: {
                        socket: socketItem,
                        type: "ws"
                    }
                });
                fragmentation(true);
            } else if (opcode === 8 || opcode === 9 || opcode === 10 || opcode === 11 || opcode === 12 || opcode === 13 || opcode === 14 || opcode === 15) {
                const frameHeader:Buffer = Buffer.alloc(2),
                    bodyData:Buffer = body as Buffer,
                    frameBody:Buffer = bodyData.slice(0, 125);
                frameHeader[0] = 128 + opcode;
                frameHeader[1] = frameBody.length;
                socketItem.queue.unshift(Buffer.concat([frameHeader, frameBody]));
                transmitLogger({
                    direction: "send",
                    size: frameHeader[1] + 2,
                    socketData: {
                        data: bodyData,
                        service: "response-no-action"
                    },
                    transmit: {
                        socket: socketItem,
                        type: "ws"
                    }
                });
                if (socketItem.status === "open") {
                    writeFrame();
                }
            } else {
                error([
                    `Error queueing message for socket transmission. Opcode ${vars.text.angry + opcode + vars.text.none} is not supported.`
                ]);
            }
        }
    },
    // websocket server and data receiver
    server: function terminal_server_transmission_transmitWs_server(config:config_websocket_server):Server {
        const connection = function terminal_server_transmission_transmitWs_server_connection(TLS_socket:TLSSocket):void {
                const socket:websocket_client = TLS_socket as websocket_client,
                    handshake = function terminal_server_transmission_transmitWs_server_connection_handshake(data:Buffer):void {
                        let hashName:string = null,
                            type:socketType = null,
                            hashKey:string = null,
                            dataString:string = data.toString();
                        const browserNonce:string = `Sec-WebSocket-Protocol:browser-${vars.settings.hashDevice}`,
                            testNonce:string = "Sec-WebSocket-Protocol:browser-test-browser",
                            agentUpdate:config_websocket_agentUpdate = (function terminal_server_transmission_transmitWs_server_connection_handshake_agentStr():config_websocket_agentUpdate {
                                const index:number = dataString.indexOf("\r\nagent:");
                                if (index > 0) {
                                    const agentString:string = dataString.slice(index).replace(/^\r\nagent:\s+/, "").replace(/\s+$/, ""),
                                        agentItem:config_websocket_agentUpdate = (agentString.charAt(0) === "{" && agentString.charAt(agentString.length - 1) === "}")
                                            ? JSON.parse(agentString)
                                            : null;
                                    if (agentItem !== null && agentItem.ip !== null && agentItem.ip !== undefined && Array.isArray(agentItem.ip.IPv4) === true && Array.isArray(agentItem.ip.IPv6) === true) {
                                        dataString = dataString.slice(0, index);
                                        return agentItem;
                                    }
                                }
                                return null;
                            }()),
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
                                            const userData:userData = common.userData(vars.settings.device, agentType, vars.settings.hashDevice),
                                                status:activityStatus = (function terminal_server_transmission_transmitWs_server_connection_handshake_headers_agentTypes_status():activityStatus {
                                                    const keys:string[] = Object.keys(vars.settings.device);
                                                    let index:number = keys.length;
                                                    do {
                                                        index = index - 1;
                                                        if (vars.settings.device[keys[index]].status === "active") {
                                                            return "active";
                                                        }
                                                    } while (index > 0);
                                                    return "idle";
                                                }()),
                                                agent:agent = vars.settings[agentType][hashName],
                                                update:config_websocket_agentUpdate = {
                                                    hash: (type === "device")
                                                        ? vars.settings.hashDevice
                                                        : vars.settings.hashUser,
                                                    ip: userData[1],
                                                    ipSelected: getAddress({socket: socket, type: "ws"}).local,
                                                    shares: userData[0],
                                                    status: status,
                                                    type: type as agentType
                                                };
                                            socket.write(JSON.stringify(update));

                                            // provide all manners of notification
                                            if (vars.settings.verbose === true && agent !== null && agent !== undefined) {
                                                log([`Server-side socket ${vars.text.green + vars.text.bold}established${vars.text.none} for ${vars.text.underline + type + vars.text.none} ${vars.text.cyan + agent.name + vars.text.none}.`]);
                                            }
                                        }
                                    };
                                // some complexity is present because browsers will not have a "hash" heading
                                if (flags.type === true && flags.key === true && (type === "browser" || flags.hash === true)) {
                                    if ((type === "device" || type === "user") && vars.settings[type][hashName] === undefined) {
                                        return;
                                    }
                                    const identifier:string = (type === "browser")
                                        ? hashKey
                                        : hashName;
                                    transmit_ws.socketExtensions({
                                        handler: transmit_ws.clientReceiver,
                                        identifier: identifier,
                                        role: "server",
                                        socket: socket,
                                        type: type,
                                        update: agentUpdate
                                    });
                                    if (type === "browser") {
                                        clientRespond();
                                    } else if ((type === "device" || type === "user") && (transmit_ws.clientList[type][hashName] === null || transmit_ws.clientList[type][hashName] === undefined)) {
                                        agentTypes(type);
                                    }
                                }
                            },
                            headerEach = function terminal_server_transmission_transmitWs_server_connection_handshake_headerEach(header:string):void {
                                if (header.indexOf("Sec-WebSocket-Key") === 0) {
                                    const key:string = header.slice(header.indexOf("-Key:") + 5).replace(/\s/g, "") + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
                                    hash({
                                        algorithm: "sha1",
                                        callback: function terminal_server_transmission_transmitWs_server_connection_handshake_headerEach_callback(title:string, hashOutput:hash_output):void {
                                            flags.key = true;
                                            hashKey = hashOutput.hash;
                                            headers();
                                        },
                                        digest: "base64",
                                        directInput: true,
                                        id: null,
                                        list: false,
                                        parent: null,
                                        source: key,
                                        stat: null
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
                        headerList.forEach(headerEach);
                    };
                socket.once("data", handshake);
            },
            wsServer:Server = (vars.settings.secure === true)
                ? createSecureServer({
                    ca: config.options.options.ca,
                    cert: config.options.options.cert,
                    key: config.options.options.key,
                }, connection)
                : createInsecureServer(),
            listenerCallback = function terminal_server_transmission_transmitWs_server_listenerCallback():void {
                config.callback(wsServer.address() as AddressInfo);
            };
        if (vars.settings.secure === false) {
            wsServer.on("connection", connection);
        }
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
        return wsServer;
    },
    // adds custom properties necessary to this application to newly created sockets
    socketExtensions: function terminal_server_transmission_transmitWs_socketExtension(config:config_websocket_extensions):void {
        const ping = function terminal_server_transmission_transmitWs_socketExtension_ping(ttl:number, callback:(err:NodeJS.ErrnoException, roundtrip:bigint) => void):void {
            const errorObject = function terminal_server_transmission_transmitWs_socketExtension_ping_errorObject(code:string, message:string):NodeJS.ErrnoException {
                    const err:NodeJS.ErrnoException = new Error(),
                        agent:agent = (config.socket.type === "browser")
                            ? null
                            : vars.settings[config.socket.type as agentType][config.socket.hash],
                        name:string = (config.socket.type === "browser")
                            ? config.socket.hash
                            : (agent === null || agent === undefined)
                                ? "unknown socket"
                                : agent.name;
                    err.code = code;
                    err.message = `${message} Socket type ${config.socket.type} and name ${name}.`;
                    return err;
                };
            if (config.socket.status !== "open") {
                callback(errorObject("ECONNABORTED", "Ping error on websocket without 'open' status."), null);
            } else {
                const nameSlice:string = config.socket.hash.slice(0, 125);
                transmit_ws.queue(Buffer.from(nameSlice), config.socket, 9);
                config.socket.pong[nameSlice] = {
                    callback: callback,
                    start: process.hrtime.bigint(),
                    timeOut: setTimeout(function terminal_server_transmission_transmitWs_socketExtension_ping_delay():void {
                        callback(config.socket.pong[nameSlice].timeOutMessage, null);
                        delete config.socket.pong[nameSlice];
                    }, ttl),
                    timeOutMessage: errorObject("ETIMEDOUT", "Ping timeout on websocket."),
                    ttl: BigInt(ttl * 1e6)
                };
            }
        };
        config.socket.fragment = [];            // storehouse of complete data frames, which will comprise a frame header and payload body that may be fragmented
        config.socket.frame = [];               // stores pieces of frames, which can be divided due to TLS decoding or header separation from some browsers
        config.socket.frameExtended = 0;        // stores the payload size of a given message payload as derived from the extended size bytes of a frame header
        config.socket.hash = config.identifier; // assigns a unique identifier to the socket based upon the socket's credentials
        config.socket.handler = config.handler; // the function to processing incoming messages
        config.socket.ping = ping;              // provides a means to insert a ping control frame and measure the round trip time of the returned pong frame
        config.socket.pong = {};                // stores termination times and callbacks for pong handling
        config.socket.queue = [];               // stores messages for transmit, because websocket protocol cannot intermix messages
        config.socket.role = config.role;       // assigns socket creation location
        config.socket.setKeepAlive(true, 0);    // standard method to retain socket against timeouts from inactivity until a close frame comes in
        config.socket.status = "open";          // sets the status flag for the socket
        config.socket.type = config.type;       // assigns the type name on the socket

        // listen for incoming messages
        config.socket.on("data", transmit_ws.listener);

        // map device identifiers that connect to external agents
        if (config.type !== "device" && config.type !== "browser") {
            if (transmit_ws.clientList.map[config.type] === undefined) {
                transmit_ws.clientList.map[config.type] = {};
            }
            transmit_ws.clientList.map[config.type][config.identifier] = vars.settings.hashDevice;
        }

        // type specific configurations
        if (config.type === "browser" || config.type === "device" || config.type === "user") {
            transmit_ws.clientList[config.socket.type as agentType][config.socket.hash] = config.socket;
            if (config.type === "device" || config.type === "user") {
                // administratively prepare the socket and send the final response to the client
                transmit_ws.agentUpdate(config.update);

                config.socket.on("close", function terminal_server_transmission_transmitWs_socketExtension_close():void {
                    // eslint-disable-next-line
                    const socketData:websocket_client = this,
                        configData:config_websocket_openAgent = {
                            agent: socketData.hash,
                            callback: null,
                            type: socketData.type as agentType
                        },
                        delay = function terminal_server_transmission_transmitWs_socketExtension_close_delay():void {
                            transmit_ws.openAgent(configData); 
                        };
                    setTimeout(delay, 15000);
                });
            }
        }
        config.socket.on("error", function terminal_server_transmission_transmitWs_socketExtension_socketError(errorMessage:NodeJS.ErrnoException):void {
            // eslint-disable-next-line
            const socket:websocket_client = this;
            if (vars.settings.verbose === true) {
                error([
                    `Error on socket of type ${socket.type} at location ${socket.role} with identifier ${socket.hash}.`,
                    JSON.stringify(errorMessage),
                    JSON.stringify(getAddress({
                        socket: socket,
                        type: "ws"
                    }))
                ]);
            }
            transmit_ws.agentClose(socket);
        });
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