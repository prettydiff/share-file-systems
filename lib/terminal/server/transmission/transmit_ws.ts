/* lib/terminal/server/transmission/transmit_ws - A command utility for creating a websocket server or client. */


import agent_management from "../services/agent_management.js";
import agent_status from "../services/agent_status.js";
import browser from "../../test/application/browser.js";
import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import getAddress from "../../utilities/getAddress.js";
import hash from "../../commands/library/hash.js";
import log from "../../utilities/log.js";
import mask from "../../utilities/mask.js";
import node from "../../utilities/node.js";
import receiver from "./receiver.js";
import sender from "./sender.js";
import settings from "../services/settings.js";
import transmitLogger from "./transmit_logger.js";
import vars from "../../utilities/vars.js";

/**
 * The websocket library
 * ```typescript
 * interface transmit_ws {
 *     agentClose      : (socket:websocket_client) => void;                                     // A uniform way to notify browsers when a remote agent goes offline
 *     clientReceiver  : websocket_messageHandler;                                              // Processes data from regular agent websocket tunnels into JSON for processing by receiver library.
 *     createSocket    : (config:config_websocket_create) => void;                              // Creates a new socket for use by openAgent and openService methods.
 *     ipAttempts      : {
 *         device: {
 *             [key:string]: string[];
 *         };
 *         user: {
 *             [key:string]: string[];
 *         };
 *     };                                                                                       // stores connection attempts as a list of ip addresses by agent hash
 *     list            : () => void;                                                            // Updates local device socket list for storage on transmit_ws.status.
 *     listener        : (socket:websocket_client) => void;                                     // A handler attached to each socket to listen for incoming messages.
 *     open: {
 *         agent:   (config:config_websocket_openAgent) => void;   // Opens a long-term socket tunnel between known agents.
 *         service: (config:config_websocket_openService) => void; // Opens a service specific tunnel that ends when the service completes.
 *     };                                                                                       // methods to open sockets according to different security contexts
 *     queue           : (body:Buffer|socketData, socket:socketClient, opcode:number) => void;  // Pushes outbound data into a managed queue to ensure data frames are not intermixed.
 *     queueSend       : (socket:websocket_client) => void;                                     // Pushes messages stored from the agent's offline queue into the transmission queue.
 *     server          : (config:config_websocket_server) => node_net_Server;                   // Creates a websocket server.
 *     socketExtensions: (config:config_websocket_extensions) => void;                          // applies application specific extensions to sockets
 *     socketList      : {
 *         [key:string]: websocket_list;
 *     };                                                                                       // A store of open sockets by agent type.
 *     status          : socketList;                                                            // Stores open socket status information for all devices.
 *     statusUpdate    : (socketData:socketData) => void;                                       // Receive socket status list updates from other devices.
 * }
 * ``` */
const transmit_ws:module_transmit_ws = {
    // handling an agent socket collapse
    agentClose: function terminal_server_transmission_transmitWs_agentClose(socket:websocket_client):void {
        const type:"device"|"user" = socket.type as "device"|"user",
            agent:agent = vars.agents[type][socket.hash];
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
        socket.status = "closed";
        socket.destroy();
        delete transmit_ws.socketList[type][socket.hash];
        if (type === "device") {
            delete transmit_ws.status[socket.hash];
        }
    },
    // composes fragments from browsers and agents into JSON for processing by receiver library
    clientReceiver: function terminal_server_transmission_transmitWs_clientReceiver(bufferData:Buffer):void {
        const decoder:node_stringDecoder_StringDecoder = new node.stringDecoder.StringDecoder("utf8"),
            result:string = decoder.end(bufferData);

        // prevent parsing errors in the case of malformed or empty payloads
        if (result.charAt(0) === "{" && result.charAt(result.length - 1) === "}" && result.indexOf("\"data\":") > 0 && result.indexOf("\"service\":") > 0) {
            receiver(JSON.parse(result) as socketData, {
                // eslint-disable-next-line
                socket: this,
                type: "ws"
            });
        }
    },
    // creates a new socket as a client to a remote server
    createSocket: function terminal_server_transmission_transmitWs_createSocket(config:config_websocket_create):void {
        if (config.ip === "") {
            // an empty string defaults to loopback, which creates an endless feedback loop
            return;
        }
        hash({
            algorithm: "sha1",
            callback: function terminal_server_transmission_transmitWs_createSocket_hash(title:string, hashOutput:hash_output):void {
                let a:number = 0;
                const len:number = config.headers.length,
                    client:websocket_client = (vars.settings.secure === true)
                        ? node.tls.connect({
                            host: config.ip,
                            port: config.port,
                            rejectUnauthorized: false
                        }) as websocket_client
                        : node.net.connect({
                            host: config.ip,
                            port: config.port
                        }) as websocket_client,
                    headerHash:string = (config.socketType === "device")
                        ? vars.identity.hashDevice
                        : (config.socketType === "user")
                            ? vars.identity.hashUser
                            : config.hash,
                    header:string[] = [
                        "GET / HTTP/1.1",
                        (config.ip.indexOf(":") > -1)
                            ? `Host: [${config.ip}]:${config.port}`
                            : `Host: ${config.ip}:${config.port}`,
                        "Upgrade: websocket",
                        "Connection: Upgrade",
                        "Sec-WebSocket-Version: 13",
                        `type: ${config.socketType}`,
                        `hash: ${headerHash}`,
                        `Sec-WebSocket-Key: ${hashOutput.hash}`
                    ],
                    callbackError = function terminal_server_transmission_transmitWs_createSocket_hash_error(errorMessage:node_error):void {
                        if (config.socketType === "device" || config.socketType === "user") {
                            transmit_ws.ipAttempts[config.socketType][config.hash].push(config.ip);
                            client.hash = config.hash;
                            client.type = config.socketType;
                            client.destroy();
                            transmit_ws.open.agent({
                                agent: client.hash,
                                agentType: client.type,
                                callback: config.callback
                            });
                        }
                        if (vars.settings.verbose === true || vars.test.type === "browser_device" || vars.test.type === "browser_user") {
                            error(["Error attempting websocket connect from client side."], errorMessage);
                        }
                    },
                    callbackReady = function terminal_server_transmission_transmitWs_createSocket_hash_ready():void {
                        header.push("");
                        header.push("");
                        client.write(header.join("\r\n"));
                        client.once("data", function terminal_server_transmission_transmitWs_createSocket_hash_ready_data():void {
                            if (config.socketType === "device" || config.socketType === "user") {
                                transmit_ws.ipAttempts[config.socketType][config.hash] = [];
                                vars.agents[config.socketType][config.hash].ipSelected = config.ip;
                                settings({
                                    data: {
                                        settings: vars.agents[config.socketType],
                                        type: config.socketType
                                    },
                                    service: "settings"
                                });
                            }
                            transmit_ws.socketExtensions({
                                callback: config.callback,
                                handler: config.handler,
                                identifier: config.hash,
                                role: "client",
                                socket: client,
                                type: config.socketType
                            });
                        });
                    };
                if (len > 0) {
                    do {
                        header.push(config.headers[a]);
                        a = a + 1;
                    } while (a < len);
                }
                client.once("error", callbackError);
                if (config.socketType === "device" || config.socketType === "user") {
                    mask.mask(vars.agents[config.socketType][config.hash].secret, function terminal_server_transmission_transmitWs_createSocket_hash_maskDevice(key:string):void {
                        header.push(`challenge: ${key}`);
                        client.once("ready", callbackReady);
                    });
                } else {
                    client.once("ready", callbackReady);
                }
            },
            digest: "base64",
            directInput: true,
            id: null,
            list: false,
            parent: null,
            source: Buffer.from(Math.random().toString(), "base64").toString(),
            stat: null
        });
    },
    ipAttempts: {
        device: {},
        user: {}
    },
    // generate a summary list of open sockets on this device
    list: function terminal_server_transmission_transmitWs_list():void {
        const list:socketListItem[] = [],
            keysPrimary:string[] = Object.keys(transmit_ws.socketList),

            // populate data from sockets that are children of a group
            child = function terminal_server_transmission_transmitWs_list_child():void {
                // @ts-ignore
                const socketList:websocket_list = transmit_ws.socketList[keysPrimary[indexPrimary]] as websocket_list,
                    keysChild:string[] = Object.keys(socketList);
                let indexChild:number = keysChild.length,
                    socketItem:websocket_client,
                    address:transmit_addresses_socket = null;
                if (indexChild < 1) {
                    return;
                }
                do {
                    indexChild = indexChild - 1;
                    socketItem = socketList[keysChild[indexChild]];
                    address = getAddress({socket: socketItem, type: "ws"});
                    list.push({
                        localAddress: address.local.address,
                        localPort: address.local.port,
                        name: keysChild[indexChild],
                        remoteAddress: address.remote.address,
                        remotePort: address.remote.port,
                        status: socketItem.status,
                        type: keysPrimary[indexPrimary]
                    });
                } while (indexChild > 0);
            };

        // loop through the socket groups
        let indexPrimary:number = keysPrimary.length;
        if (vars.identity.hashDevice === "") {
            return;
        }
        do {
            indexPrimary = indexPrimary - 1;
            child();
        } while (indexPrimary > 0);

        // sort the raw data by group name
        list.sort(function terminal_server_transmission_transmitWs_list_sort(a:socketListItem, b:socketListItem):-1|1 {
            if (a.type < b.type) {
                return -1;
            }
            return 1;
        });
        transmit_ws.status[vars.identity.hashDevice] = list;
        sender.broadcast({
            data: transmit_ws.status,
            service: "socket-list"
        }, "browser");
        sender.broadcast({
            data: {
                [vars.identity.hashDevice]: transmit_ws.status[vars.identity.hashDevice]
            },
            service: "socket-list"
        }, "device");
    },
    // processes incoming service data for agent sockets
    listener: function terminal_server_transmission_transmitWs_listener(socket:websocket_client):void {
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

            const data:Buffer = (function terminal_server_transmission_transmitWs_listener_processor_data():Buffer {
                    if (buf !== null && buf !== undefined) {
                        socket.frame = Buffer.concat([socket.frame, buf]);
                    }
                    if (socket.frame.length < 2) {
                        return null;
                    }
                    return socket.frame;
                }()),
                extended = function terminal_server_transmission_transmitWs_listener_processor_extended(input:Buffer):websocket_meta {
                    const mask:boolean = (input[1] > 127),
                        len:number = (mask === true)
                            ? input[1] - 128
                            : input[1],
                        keyOffset:number = (mask === true)
                            ? 4
                            : 0;
                    if (len < 126) {
                        return {
                            lengthExtended: len,
                            lengthShort: len,
                            mask: mask,
                            startByte: 2 + keyOffset
                        };
                    }
                    if (len < 127) {
                        return {
                            lengthExtended: input.subarray(2, 4).readUInt16BE(0),
                            lengthShort: len,
                            mask: mask,
                            startByte: 4 + keyOffset
                        };
                    }
                    return {
                        lengthExtended: input.subarray(4, 10).readUIntBE(0, 6),
                        lengthShort: len,
                        mask: mask,
                        startByte: 10 + keyOffset
                    };
                },
                frame:websocket_frame = (function terminal_server_transmission_transmitWs_listener_processor_frame():websocket_frame {
                    if (data === null) {
                        return null;
                    }
                    const bits0:string = data[0].toString(2).padStart(8, "0"), // bit string - convert byte number (0 - 255) to 8 bits
                        meta:websocket_meta = extended(data);
                    return {
                        fin: (data[0] > 127),
                        rsv1: (bits0.charAt(1) === "1"),
                        rsv2: (bits0.charAt(2) === "1"),
                        rsv3: (bits0.charAt(3) === "1"),
                        opcode: ((Number(bits0.charAt(4)) * 8) + (Number(bits0.charAt(5)) * 4) + (Number(bits0.charAt(6)) * 2) + Number(bits0.charAt(7))),
                        mask: meta.mask,
                        len: meta.lengthShort,
                        extended: meta.lengthExtended,
                        maskKey: (meta.mask === true)
                            ? data.subarray(meta.startByte - 4, meta.startByte)
                            : null,
                        startByte: meta.startByte
                    };
                }()),
                unmask = function terminal_server_transmission_transmitWs_listener_processor_unmask(input:Buffer):Buffer {
                    if (frame.mask === true) {
                        // RFC 6455, 5.3.  Client-to-Server Masking
                        // j                   = i MOD 4
                        // transformed-octet-i = original-octet-i XOR masking-key-octet-j
                        input.forEach(function terminal_server_transmission_transmitWs_listener_processor_unmask_each(value:number, index:number):void {
                            input[index] = value ^ frame.maskKey[index % 4];
                        });
                    }
                    return input;
                },
                payload:Buffer = (function terminal_server_transmission_transmitWs_listener_processor_payload():Buffer {
                    // Payload processing must contend with these 4 constraints:
                    // 1. Message Fragmentation - RFC6455 allows messages to be fragmented from a single transmission into multiple transmission frames independently sent and received.
                    // 2. Header Separation     - Firefox sends frame headers separated from frame bodies.
                    // 3. Node Concatenation    - If Node.js receives message frames too quickly the various binary buffers are concatenated into a single deliverable to the processing application.
                    // 4. TLS Max Packet Size   - TLS forces a maximum payload size of 65536 bytes.
                    if (frame === null) {
                        return null;
                    }
                    let complete:Buffer = null;
                    const size:number = frame.extended + frame.startByte,
                        len:number = socket.frame.length;
                    if (len < size) {
                        return null;
                    }
                    complete = unmask(socket.frame.subarray(frame.startByte, size));
                    socket.frame = socket.frame.subarray(size);
                    transmitLogger({
                        direction: "receive",
                        size: data.length,
                        socketData: {
                            data: complete,
                            service: "response-no-action"
                        },
                        transmit: {
                            socket: socket,
                            type: "ws"
                        }
                    });

                    return complete;
                }());

            if (payload === null) {
                return;
            }

            if (frame.opcode === 8) {
                // socket close
                data[0] = 136;
                data[1] = (data[1] > 127)
                    ? data[1] - 128
                    : data[1];
                const payload:Buffer = Buffer.concat([data.subarray(0, 2), unmask(data.subarray(2))]);
                socket.write(payload);
                socket.off("data", processor);
                if (socket.type === "browser") {
                    delete transmit_ws.socketList.browser[socket.hash];
                    socket.destroy();
                } else if (socket.type === "device" || socket.type === "user") {
                    transmit_ws.agentClose(socket);
                }
            } else if (frame.opcode === 9) {
                // respond to "ping" as "pong"
                transmit_ws.queue(data.subarray(frame.startByte), socket, 10);
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
                const segment:Buffer = Buffer.concat([socket.fragment, payload]);
                // this block may include frame.opcode === 0 - a continuation frame
                socket.frameExtended = frame.extended;
                if (frame.fin === true) {
                    socket.handler(segment.subarray(0, socket.frameExtended));
                    socket.fragment = segment.subarray(socket.frameExtended);
                } else {
                    socket.fragment = segment;
                }
            }
            if (socket.frame.length > 2) {
                terminal_server_transmission_transmitWs_listener_processor(null);
            }
        };
        socket.on("data", processor);
    },
    open: {
        // open a long-term websocket tunnel between known agents
        agent: function terminal_server_transmission_transmitWs_openAgent(config:config_websocket_openAgent):void {
            if (vars.settings.secure === true || vars.test.type.indexOf("browser_") === 0) {
                if (vars.agents[config.agentType][config.agent] === undefined) {
                    if (config.callback !== null) {
                        config.callback(null);
                    }
                    return;
                }
                if (transmit_ws.socketList[config.agentType][config.agent] !== undefined && transmit_ws.socketList[config.agentType][config.agent] !== null) {
                    if (config.callback !== null) {
                        config.callback(transmit_ws.socketList[config.agentType][config.agent]);
                    }
                    return;
                }
                if (transmit_ws.ipAttempts[config.agentType][config.agent] === undefined) {
                    transmit_ws.ipAttempts[config.agentType][config.agent] = [];
                }
                const agent:agent = vars.agents[config.agentType][config.agent],
                    attempts:string[] = transmit_ws.ipAttempts[config.agentType][config.agent],
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
                            IPv6:string = ipList("IPv6");
                        if (IPv6 === null) {
                            return ipList("IPv4");
                        }
                        if (attempts.length < 1) {
                            return agent.ipSelected;
                        }
                        return IPv6;
                    }());
                if (ip === null) {
                    const status:service_agentStatus = {
                        agent: config.agent,
                        agentType: config.agentType,
                        broadcast: false,
                        respond: false,
                        status: "offline"
                    };
                    agent.status = "offline";
                    transmit_ws.ipAttempts[config.agentType][config.agent] = [];
                    sender.broadcast({
                        data: status,
                        service: "agent-status"
                    }, "browser");
                } else {
                    transmit_ws.createSocket({
                        callback: config.callback,
                        headers: [],
                        hash: config.agent,
                        handler: transmit_ws.clientReceiver,
                        ip: ip,
                        port: agent.ports.ws,
                        socketType: config.agentType
                    });
                }
            }
        },
        // opens a service specific websocket tunnel between two points that closes when the service ends
        service: function terminal_server_transmission_transmitWs_openService(config:config_websocket_openService):void {
            transmit_ws.createSocket({
                callback: config.callback,
                handler: config.handler,
                headers: [],
                hash: config.hash,
                ip: config.ip,
                port: config.port,
                socketType: config.socketType
            });
        }
    },
    // manages queues, because websocket protocol limits one transmission per session in each direction
    queue: function terminal_server_transmission_transmitWs_queue(body:Buffer|socketData, socketItem:websocket_client, opcode:number):void {
        const writeSocket:boolean = (vars.environment.command === "perf" && opcode === 2)
                ? false
                : true,
            writeFrame = function terminal_server_transmission_transmitWs_queue_writeFrame():void {
                const writeCallback = function terminal_server_transmission_transmitWs_queue_writeFrame_writeCallback():void {
                    socketItem.queue.splice(0, 1);
                    if (socketItem.queue.length > 0) {
                        terminal_server_transmission_transmitWs_queue_writeFrame();
                    } else {
                        socketItem.status = "open";
                    }
                };
                if (socketItem.status === "open") {
                    socketItem.status = "pending";
                }
                if (writeSocket === true) {
                    if (socketItem.write(socketItem.queue[0]) === true) {
                        writeCallback();
                    } else {
                        socketItem.once("drain", writeCallback);
                    }
                } else {
                    writeCallback();
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
        // * This application supports both masked and unmasked transmission so long as the mask bit is set and a 32bit mask key is supplied.
        // * Mask bit is set as payload length (up to 127) + 128 assigned to frame header second byte.
        // * Mask key is first 4 bytes following payload length bytes (if any).
        if (opcode === 1 || opcode === 2 || opcode === 3 || opcode === 4 || opcode === 5 || opcode === 6 || opcode === 7) {
            const socketData:socketData = body as socketData,
                isBuffer:boolean = (socketData.service === undefined),
                // fragmentation is disabled by assigning a value of 0
                fragmentSize:number = (socketItem.type === "browser")
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
                            const fragment:Buffer = dataPackage.subarray(0, fragmentSize);
                            dataPackage = dataPackage.subarray(fragmentSize);
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
                frameBody:Buffer = bodyData.subarray(0, 125);
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
                `Error queueing message for socket transmission. Opcode ${vars.text.angry + String(opcode) + vars.text.none} is not supported.`
            ], null);
        }
    },
    // push an offline agent message queue into the transmission queue
    queueSend: function terminal_server_transmission_transmitWs_queueSend(socket:websocket_client):void {
        const type:agentType = socket.type as agentType,
            queue:socketData[] = vars.settings.queue[type][socket.hash];
        if (queue !== undefined && queue.length > 0 && vars.test.type === "") {
            do {
                transmit_ws.queue(queue[0], socket, 1);
                queue.splice(0, 1);
            } while (queue.length > 0);
            const settingsData:service_settings = {
                settings: vars.settings.queue,
                type: "queue"
            };
            settings({
                data: settingsData,
                service: "settings"
            });
        }
    },
    // websocket server and data receiver
    server: function terminal_server_transmission_transmitWs_server(config:config_websocket_server):node_net_Server {
        const connection = function terminal_server_transmission_transmitWs_server_connection(TLS_socket:node_tls_TLSSocket):void {
                const socket:websocket_client = TLS_socket as websocket_client,
                    handshake = function terminal_server_transmission_transmitWs_server_connection_handshake(data:Buffer):void {
                        let browserType:string = null,
                            hashKey:string = null,
                            hashName:string = null,
                            nonceHeader:string = null,
                            type:socketType = null,
                            userAgent:string = null;
                        const dataString:string = data.toString(),
                            testNonce:RegExp = (/^Sec-WebSocket-Protocol:\s*\w+-/),
                            headerList:string[] = dataString.split("\r\n"),
                            flags:flagList = {
                                hash: false,
                                key: false,
                                type: false,
                                userAgent: false
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
                                            headers.push(nonceHeader);
                                        } else if (type === "testRemote") {
                                            headers.push(`hash: ${hashName}`);
                                        } else if (socket.type === "device" || socket.type === "user") {
                                            const agent:agent = vars.agents[socket.type][hashName];
                                            if (agent === undefined || agent === null) {
                                                socket.destroy();
                                                return;
                                            }
                                            // provide all manners of notification
                                            if (vars.settings.verbose === true) {
                                                log([`Server-side socket ${vars.text.green + vars.text.bold}established${vars.text.none} for ${vars.text.underline + type + vars.text.none} ${vars.text.cyan + agent.name + vars.text.none}.`]);
                                            }
                                        }
                                        headers.push("");
                                        headers.push("");
                                        socket.write(headers.join("\r\n"));

                                        if (socket.type === "device" || socket.type === "user") {
                                            // process offline message queues
                                            transmit_ws.queueSend(socket);
                                        }
                                    },
                                    testReset = function terminal_serveR_transmission_transmitWs_server_connection_handshake_headers_testReset():void {
                                        socket.write(hashName);
                                        browser.methods.reset();
                                    };
                                // some complexity is present because browsers will not have a "hash" heading
                                if (flags.type === true && flags.key === true && ((type === "browser" && flags.userAgent === true) || flags.hash === true)) {
                                    const headerComplete = function terminal_serveR_transmission_transmitWs_server_connection_handshake_headers_headerComplete(test:boolean):void {
                                        if (test === false) {
                                            socket.destroy();
                                            return;
                                        }
                                        const identifier:string = (type === "browser")
                                            ? `${userAgent}-${browserType}-${hashKey}`
                                            : (type === "testRemote" && vars.test.type === "browser_remote")
                                                ? "self"
                                                : hashName;
                                        if ((type === "device" || type === "user") && transmit_ws.socketList[type][identifier] !== undefined) {
                                            transmit_ws.agentClose(transmit_ws.socketList[type][identifier]);
                                        }
                                        transmit_ws.socketExtensions({
                                            callback: (type === "testRemote")
                                                ? testReset
                                                : clientRespond,
                                            handler: transmit_ws.clientReceiver,
                                            identifier: identifier,
                                            role: "server",
                                            socket: socket,
                                            type: type
                                        });
                                    };
                                    if (type === "testRemote" && vars.test.type !== "browser_remote") {
                                        socket.destroy();
                                        return;
                                    }
                                    if (type === "device" || type === "user") {
                                        if (vars.agents[type][hashName] === undefined || typeof vars.identity.hashDevice !== "string" || vars.identity.hashDevice.length !== 128) {
                                            socket.destroy();
                                            return;
                                        }
                                        const token:string = (type === "device")
                                            ? vars.identity.secretDevice
                                            : vars.identity.secretUser;
                                        let challenge:string = dataString.slice(dataString.indexOf("\r\nchallenge:")).replace(/(\s+challenge:\s*)/, "");
                                        challenge = challenge.slice(0, challenge.indexOf("\r")).replace(/\s+/g, "");
                                        mask.unmaskToken(challenge, token, headerComplete);
                                    } else {
                                        headerComplete(true);
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
                                } else if (header.indexOf("User-Agent:") === 0) {
                                    const subDec:RegExp = (/\s\w+\/\d+\.\d+\.\d+/g),
                                        browserName = function terminal_server_transmission_transmitWs_server_connection_handshake_headerEach_browserName(input:string):string {
                                            userAgent = input.slice(0, input.indexOf(".")).replace(/^\s+/, "");
                                            return "";
                                        },
                                        ua:string = (function terminal_server_transmission_transmitWs_server_connection_handshake_headerEach_ua():string {
                                            let matches:string[] = null;
                                            header = header.replace(/User-Agent:\s+/, "");
                                            header = header.slice(header.lastIndexOf(")"));
                                            matches = header.match(subDec);
                                            if (matches === null) {
                                                return null;
                                            }
                                            return matches[matches.length - 1];
                                        }());
                                    if (ua === null) {
                                        header.replace(/\s\w+\/\d+\.\d+/, browserName);
                                    } else {
                                        ua.replace(ua, browserName);
                                    }
                                    flags.userAgent = true;
                                    headers();
                                } else if (header.indexOf("hash:") === 0) {
                                    hashName = header.replace(/hash:\s+/, "");
                                    flags.hash = true;
                                    headers();
                                } else if (header.indexOf("type:") === 0) {
                                    type = header.replace(/type:\s+/, "") as agentType;
                                    if (header.replace(/type:\s+/, "") === "perf" && (socket.remoteAddress === "::1" || socket.remoteAddress === "127.0.0.1")) {
                                        flags.hash = true;
                                    }
                                    flags.type = true;
                                    headers();
                                } else if (testNonce.test(header) === true) {
                                    const noSpace:string = header.replace(/\s+/g, "").replace(testNonce, "");
                                    if (noSpace === vars.identity.hashDevice || (noSpace === "test-browser" && vars.test.type.indexOf("browser_") === 0)) {
                                        flags.type = true;
                                        nonceHeader = header;
                                        type = "browser";
                                        header = header.slice(header.indexOf(":")).replace(/^:\s+/, "");
                                        browserType = header.slice(0, header.indexOf("-"));
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
            wsServer:node_net_Server = (vars.settings.secure === true && config.options !== null)
                // options are of type TlsOptions
                ? node.tls.createServer({
                    ca: config.options.options.ca,
                    cert: config.options.options.cert,
                    key: config.options.options.key
                }, connection)
                : node.net.createServer(),
            listenerCallback = function terminal_server_transmission_transmitWs_server_listenerCallback():void {
                config.callback(wsServer.address() as node_net_AddressInfo);
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
        if (
            (config.type === "testRemote" && vars.test.type.indexOf("browser_") === 0) ||
            (config.type === "perf" && (config.socket.remoteAddress === "::1" || config.socket.remoteAddress.replace("::ffff:", "") === "127.0.0.1")) ||
            transmit_ws.socketList[config.type as agentType | "browser"][config.identifier] === undefined
        ) {
            const ping = function terminal_server_transmission_transmitWs_socketExtension_ping(ttl:number, callback:(err:node_error, roundtrip:bigint) => void):void {
                    const errorObject = function terminal_server_transmission_transmitWs_socketExtension_ping_errorObject(code:string, message:string):node_error {
                            const err:node_error = new Error(),
                                agent:agent = (config.socket.type === "browser")
                                    ? null
                                    : vars.agents[config.socket.type as agentType][config.socket.hash],
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
                        // send ping
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
                },
                socketEnd = function terminal_server_transmission_transmitWs_socketExtension_socketEnd():void {
                    if (config.socket.type === "device" || config.socket.type === "user") {
                        transmit_ws.agentClose(config.socket);
                    }
                    config.socket.status = "end";
                    transmit_ws.list();
                };
            config.socket.fragment = Buffer.from([]); // storehouse of complete data frames, which will comprise a frame header and payload body that may be fragmented
            config.socket.frame = Buffer.from([]);    // stores pieces of frames, which can be divided due to TLS decoding or header separation from some browsers
            config.socket.frameExtended = 0;          // stores the payload size of a given message payload as derived from the extended size bytes of a frame header
            config.socket.hash = config.identifier;   // assigns a unique identifier to the socket based upon the socket's credentials
            config.socket.handler = config.handler;   //  assigns an event handler to process incoming messages
            config.socket.ping = ping;                // provides a means to insert a ping control frame and measure the round trip time of the returned pong frame
            config.socket.pong = {};                  // stores termination times and callbacks for pong handling
            config.socket.queue = [];                 // stores messages for transmit, because websocket protocol cannot intermix messages
            config.socket.role = config.role;         // assigns socket creation location
            config.socket.setKeepAlive(true, 0);      // standard method to retain socket against timeouts from inactivity until a close frame comes in
            config.socket.status = "open";            // sets the status flag for the socket
            config.socket.type = config.type;         // assigns the type name on the socket
            if (config.type === "browser" || config.type === "device" || config.type === "testRemote" || config.type === "user") {
                if (config.type !== "browser" || (config.type === "browser" && config.identifier.indexOf("-primary-") > 0)) {
                    transmit_ws.socketList[config.type][config.identifier] = config.socket;
                } else {
                    transmit_ws.socketList.browserOther[config.identifier] = config.socket;
                }
                if (config.type === "device" || config.type === "user") {
                    vars.agents[config.type][config.identifier].ipSelected = getAddress({
                        socket: config.socket,
                        type: "ws"
                    }).remote.address;
                    config.socket.on("close", function terminal_server_transmission_transmitWs_socketExtension_close():void {
                        const configData:config_websocket_openAgent = {
                                agent: config.socket.hash,
                                agentType: config.socket.type as agentType,
                                callback: null
                            },
                            delay = function terminal_server_transmission_transmitWs_socketExtension_close_delay():void {
                                transmit_ws.open.agent(configData);
                            };
                        setTimeout(delay, vars.settings.ui.statusTime);
                    });
                    if (config.type === "user") {
                        const management:service_agentManagement = {
                            action: "modify",
                            agents: {
                                device: {},
                                user: {[config.identifier]: vars.agents.user[config.identifier]}
                            },
                            agentFrom: config.identifier,
                            identity: null
                        };
                        agent_management({
                            data: management,
                            service: "agent-management"
                        });
                    }
                    if (config.role === "client") {
                        transmit_ws.queueSend(config.socket);
                    }
                }
            }
            config.socket.on("end", socketEnd);
            config.socket.on("close", socketEnd);
            config.socket.on("error", function terminal_server_transmission_transmitWs_socketExtension_socketError(errorMessage:node_error):void {
                if (vars.settings.verbose === true || vars.test.type === "browser_device" || vars.test.type === "browser_user") {
                    error([
                        `Error on socket of type ${config.socket.type} at location ${config.socket.role} with identifier ${config.socket.hash}.`,
                        JSON.stringify(errorMessage),
                        JSON.stringify(getAddress({
                            socket: config.socket,
                            type: "ws"
                        }))
                    ], null);
                }
                if (config.socket.type === "device" || config.socket.type === "user") {
                    transmit_ws.agentClose(config.socket);
                }
                transmit_ws.list();
            });
            transmit_ws.listener(config.socket);
            if (config.callback !== null && config.callback !== undefined) {
                config.callback(config.socket);
            }
            transmit_ws.list();
        }
    },
    // a list of local sockets
    socketList: {
        browser: {},
        browserOther: {},
        device: {},
        testRemote: {},
        user: {}
    },
    status: {},
    statusUpdate: function terminal_server_transmission_transmitWs_statusUpdate(socketData:socketData):void {
        const data:socketList = socketData.data as socketList,
            keys:string[] = Object.keys(data);
        transmit_ws.status[keys[0]] = data[keys[0]];
        sender.broadcast({
            data: transmit_ws.status,
            service: "socket-list"
        }, "browser");
    }
};

export default transmit_ws;