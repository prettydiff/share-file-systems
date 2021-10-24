
/* lib/terminal/server/methodPOST - The library for handling all traffic related to HTTP requests with method POST. */

import { IncomingMessage, ServerResponse } from "http";
import { cpus, hostname, release, totalmem, type } from "os";
import { StringDecoder } from "string_decoder";

import browser from "../test/application/browser.js";
import error from "../utilities/error.js";
import hash from "../commands/hash.js";
import heartbeat from "./heartbeat.js";
import httpSender from "./httpSender.js";
import invite from "./invite.js";
import ipResolve from "./ipResolve.js";
import log from "../utilities/log.js";
import message from "./message.js";
import response from "./response.js";
import routeCopy from "../fileService/routeCopy.js";
import routeFile from "../fileService/routeFile.js";
import serverVars from "./serverVars.js";
import settings from "./settings.js";
import vars from "../utilities/vars.js";
import websocket from "./websocket.js";

const methodPOST = function terminal_server_methodPOST(request:IncomingMessage, serverResponse:ServerResponse):void {
    let body:string = "",
        ended:boolean = false;
    const decoder:StringDecoder = new StringDecoder("utf8"),
        contentLength:number = Number(request.headers["content-length"]),
        requestEnd = function terminal_server_methodPOST_requestEnd():void {
            const requestType:requestType = request.headers["request-type"] as requestType,
                task:requestType|"heartbeat" = (requestType.indexOf("heartbeat") === 0)
                    ? "heartbeat"
                    : (requestType.indexOf("invite") === 0)
                        ? "invite"
                        : (requestType.indexOf("copy") === 0)
                            ? "copy"
                            : requestType as requestType,
                ip:string = ipResolve.parse(request.socket.remoteAddress),
                agentOnline = function terminal_server_methodPOST_requestEnd_agentOnline():void {
                    // * processes the response for the agent-online terminal command utility
                    const data:agentOnline = JSON.parse(body);
                    serverVars[data.agentType][data.agent].ipAll = data.ipAll;
                    serverVars[data.agentType][data.agent].ipSelected = ipResolve.parse(request.socket.remoteAddress);
                    data.ipAll = (data.agentType === "device")
                        ? serverVars.localAddresses
                        : ipResolve.userAddresses();
                    data.ipSelected = ipResolve.parse(request.socket.localAddress);
                    response({
                        message: JSON.stringify(data),
                        mimeType: "application/json",
                        responseType: "agent-online",
                        serverResponse: serverResponse
                    });
                },
                browserLog = function terminal_server_methodPOST_requestEnd_browserLog():void {
                    // eslint-disable-next-line
                    const data:any[] = JSON.parse(body),
                        browserIndex:number = serverVars.testType.indexOf("browser");
                    if (browserIndex < 0 || (browserIndex === 0 && data[0] !== null && data[0].toString().indexOf("Executing delay on test number") !== 0)) {
                        log(data);
                    }
                    response({
                        message: "browser log received",
                        mimeType: "text/plain",
                        responseType: "browser-log",
                        serverResponse: serverResponse
                    });
                },
                fileListStatusUser = function terminal_server_methodPOST_requestEnd_fileListStatusUser():void {
                    // * remote: Changes to the remote user's file system
                    // * local : Update local "File Navigator" modals for the respective remote user
                    const status:fileStatusMessage = JSON.parse(body);
                    if (status.agentType === "user") {
                        const devices:string[] = Object.keys(serverVars.device),
                            sendStatus = function terminal_server_methodPOST_requestEnd_fileListStatus_sendStatus(agent:string):void {
                                httpSender({
                                    agent: agent,
                                    agentType: "device",
                                    callback: function terminal_server_methodPOST_requestEnd_fileListStatus_sendStatus_callback():void {},
                                    ip: serverVars.device[agent].ipSelected,
                                    payload: body,
                                    port: serverVars.device[agent].ports.http,
                                    requestError: function terminal_server_methodPOST_requestEnd_fileListStatus_sendStatus_requestError(errorMessage:NodeJS.ErrnoException):void {
                                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                            error(["Error at client request in sendStatus of methodPOST", body, errorMessage.toString()]);
                                        }
                                    },
                                    requestType: "file-list-status-device",
                                    responseError: function terminal_server_methodPOST_requestEnd_fileListStatus_sendStatus_responseError(errorMessage:NodeJS.ErrnoException):void {
                                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                            error(["Error at client response in sendStatus of methodPOST", body, errorMessage.toString()]);
                                        }
                                    }
                                });
                            };
                        let a:number = devices.length;
                        do {
                            a = a - 1;
                            if (devices[a] !== serverVars.hashDevice) {
                                sendStatus(devices[a]);
                            }
                        } while (a > 0);
                    }
                    websocket.broadcast({
                        data: status,
                        service: "file-list-status-device"
                    }, "browser");
                    response({
                        message: "File list status response.",
                        mimeType: "text/plain",
                        responseType: "response-no-action",
                        serverResponse: serverResponse
                    });
                },
                hashDevice = function terminal_server_methodPOST_requestEnd_hashDevice():void {
                    // * produce a hash that describes a new device
                    const data:hashAgent = JSON.parse(body),
                        callbackUser = function terminal_server_methodPOST_requestEnd_hashUser(hashUser:hashOutput):void {
                            const callbackDevice = function terminal_server_methodPOST_requestEnd_hashUser_hashDevice(hashDevice:hashOutput):void {
                                const deviceData:deviceData = {
                                        cpuCores: cpus().length,
                                        cpuID: cpus()[0].model,
                                        platform: process.platform,
                                        memTotal: totalmem(),
                                        osType: type(),
                                        osVersion: release()
                                    },
                                    hashes:hashAgent = {
                                        device: hashDevice.hash,
                                        deviceData: deviceData,
                                        user: hashUser.hash
                                    };
                                serverVars.hashDevice = hashDevice.hash;
                                serverVars.nameDevice = data.device;
                                serverVars.device[serverVars.hashDevice] = {
                                    deviceData: deviceData,
                                    ipAll: serverVars.localAddresses,
                                    ipSelected: "",
                                    name: data.device,
                                    ports: serverVars.ports,
                                    shares: {},
                                    status: "active"
                                };
                                settings({
                                    data: {
                                        data: serverVars.device,
                                        type: "device"
                                    },
                                    service: "hash-device"
                                });
                                response({
                                    message: JSON.stringify(hashes),
                                    mimeType: "application/json",
                                    responseType: "hash-user",
                                    serverResponse: serverResponse
                                });
                            };
                            serverVars.hashUser = hashUser.hash;
                            serverVars.nameUser = data.user;
                            input.callback = callbackDevice;
                            input.source = hashUser.hash + data.device;
                            hash(input);
                        },
                        input:hashInput = {
                            algorithm: "sha3-512",
                            callback: callbackUser,
                            directInput: true,
                            source: data.user + hostname() + process.env.os + process.hrtime.bigint().toString()
                        };
                    hash(input);
                },
                hashShare = function terminal_server_methodPOST_requestEnd_hashShare():void {
                    // * generate a hash string to name a share
                    const data:hashShare = JSON.parse(body),
                        input:hashInput = {
                            algorithm: "sha3-512",
                            callback: function terminal_server_methodPOST_requestEnd_shareHash(hashData:hashOutput):void {
                                const outputBody:hashShare = JSON.parse(hashData.id),
                                    hashResponse:hashShareResponse = {
                                        device: outputBody.device,
                                        hash: hashData.hash,
                                        share: outputBody.share,
                                        type: outputBody.type
                                    };
                                response({
                                    message: JSON.stringify(hashResponse),
                                    mimeType: "application/json",
                                    responseType: "hash-share",
                                    serverResponse: serverResponse
                                });
                            },
                            directInput: true,
                            id: body,
                            source: serverVars.hashUser + serverVars.hashDevice + data.type + data.share
                        };
                    hash(input);
                },
                responder = function terminal_server_methodPOST_requestEnd_responder():void {
                    websocket.broadcast({
                        data: JSON.parse(body),
                        service: requestType
                    }, "browser");
                    response({
                        message: requestType,
                        mimeType: "text/plain",
                        responseType: (requestType === "file-list-status-device")
                            ? "response-no-action"
                            : requestType,
                        serverResponse: serverResponse
                    });
                },
                actions:postActions = {
                    "agent-online": agentOnline,
                    "browser-log": browserLog,
                    "copy": function terminal_server_methodPOST_requestEnd_copy():void {
                        // * file system asset movement for both local and remote
                        routeCopy({
                            data: JSON.parse(body),
                            service: request.headers["request-type"] as copyTypes
                        }, {
                            socket: serverResponse,
                            type: "http"
                        });
                    },
                    "fs": function terminal_server_methodPOST_requestEnd_fs():void {
                        // * file system interaction for both local and remote
                        routeFile({
                            data: JSON.parse(body),
                            service: request.headers["request-type"] as requestType
                        }, {
                            socket: serverResponse,
                            type: "http"
                        });
                    },
                    "file-list-status-device": responder,
                    "file-list-status-user": fileListStatusUser,
                    "hash-device": hashDevice,
                    "hash-share": hashShare,
                    "heartbeat": function terminal_server_receiver_heartbeat():void {
                        const data:socketData = JSON.parse(body);
                        if (data.service === "heartbeat-complete") {
                            // * updates shares/status due to changes in the application/network and then informs the browser
                            heartbeat.complete(data, serverResponse.socket.localAddress);
                        } else if (data.service === "heartbeat-delete-agents") {
                            // * delete one or more agents from manual user selection in the browser
                            heartbeat.deleteAgents(data);
                        } else if (data.service === "heartbeat-status") {
                            // * send agent status changes to all local browsers
                            websocket.broadcast({
                                data: data.data,
                                service: "heartbeat-status"
                            }, "browser");
                        } else if (data.service === "heartbeat-update") {
                            // * update agent data, such as shares, and broadcast the change
                            heartbeat.update(data);
                        }
                    },
                    "invite": function terminal_server_methodPOST_requestEnd_invite():void {
                        // * Handle all stages of invitation
                        const data:invite = JSON.parse(body);
                        invite(data, ip, {
                            socket: serverResponse,
                            type: "http"
                        });
                    },
                    "message": function terminal_server_methodPOST_requestEnd_message():void {
                        // * process text messages
                        message(JSON.parse(body), true);
                    },
                    "settings": function terminal_server_methodPOST_requestEnd_settings():void {
                        // * local: Writes changes to settings files
                        settings(JSON.parse(body));
                    },
                    "test-browser": function terminal_server_methodPOST_requestEnd_testBrowser():void {
                        // * validate a browser test iteration
                        browser.methods.route(JSON.parse(body), {
                            socket: serverResponse,
                            type: "http"
                        });
                    }
                };
            ended = true;
            if (serverVars.testType === "service") {
                if (task === "invite") {
                    serverVars.testSocket = null;
                } else {
                    serverVars.testSocket = serverResponse;
                }
            }
            if (actions[task] === undefined) {
                response({
                    message: `ForbiddenAccess: task ${task} not supported`,
                    mimeType: "text/plain",
                    responseType: "forbidden",
                    serverResponse: serverResponse
                });
            } else {
                actions[task]();
            }
        };

    // request handling
    request.on("data", function terminal_server_methodPOST_data(data:Buffer):void {
        body = body + decoder.write(data);
        if (body.length > contentLength) {
            request.destroy({
                name: "TOO_LARGE",
                message: "Request destroyed for size in excess of its content-length header."
            });
        }
    });
    request.on("error", function terminal_server_methodPOST_errorRequest(errorMessage:NodeJS.ErrnoException):void {
        const errorString:string = errorMessage.toString();
        if (errorMessage.code !== "ETIMEDOUT" && (ended === false || (ended === true && errorString !== "Error: aborted"))) {
            log([
                `${vars.text.cyan}POST request, ${request.headers["request-type"]}, methodPOST.ts${vars.text.none}`,
                body.slice(0, 1024),
                "",
                `body length: ${body.length}`,
                vars.text.angry + errorString + vars.text.none,
                "",
                ""
            ]);
        }
    });
    serverResponse.on("error", function terminal_server_methodPOST_errorResponse(errorMessage:NodeJS.ErrnoException):void {
        if (errorMessage.code !== "ETIMEDOUT") {
            log([
                `${vars.text.cyan}POST response, ${request.headers["request-type"]}, methodPOST.ts${vars.text.none}`,
                (body.length > 1024)
                    ? `${body.slice(0, 512)}  ...  ${body.slice(body.length - 512)}`
                    : body,
                "",
                `body length: ${body.length}`,
                vars.text.angry + errorMessage.toString() + vars.text.none,
                "",
                ""
            ]);
        }
    });

    // request callbacks
    request.on("end", requestEnd);
};

export default methodPOST;