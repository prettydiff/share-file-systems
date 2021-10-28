
/* lib/terminal/server/receiver - The library for handling all traffic related to HTTP requests with method POST. */

import { ServerResponse } from "http";
import { Socket } from "net";
import { cpus, hostname, release, totalmem, type } from "os";

import browser from "../test/application/browser.js";
import hash from "../commands/hash.js";
import heartbeat from "./heartbeat.js";
import httpAgent from "./httpAgent.js";
import invite from "./invite.js";
import ipResolve from "./ipResolve.js";
import log from "../utilities/log.js";
import message from "./message.js";
import responder from "./responder.js";
import routeCopy from "../fileService/routeCopy.js";
import routeFile from "../fileService/routeFile.js";
import serverVars from "./serverVars.js";
import settings from "./settings.js";
import websocket from "./websocket.js";

const receiver = function terminal_server_receiver(data:socketData, transmit:transmit):void {
    const task:requestType|"heartbeat" = (data.service.indexOf("heartbeat") === 0)
            ? "heartbeat"
            : (data.service.indexOf("invite") === 0)
                ? "invite"
                : (data.service.indexOf("copy") === 0)
                    ? "copy"
                    : data.service as requestType,
        getAddress = function terminal_server_receiver_getAddress():addresses {
            const response:ServerResponse = transmit.socket as ServerResponse,
                socket:Socket = (transmit.type === "ws")
                    ? transmit.socket as socketClient
                    : response.socket;
            return {
                local: ipResolve.parse(socket.localAddress),
                remote: ipResolve.parse(socket.remoteAddress)
            };
        },
        agentOnline = function terminal_server_receiver_agentOnline():void {
            // * processes the response for the agent-online terminal command utility
            const agentData:agentOnline = data.data as agentOnline,
                addresses:addresses = getAddress();
            serverVars[agentData.agentType][agentData.agent].ipAll = agentData.ipAll;
            serverVars[agentData.agentType][agentData.agent].ipSelected = ipResolve.parse(addresses.remote);
            agentData.ipAll = (agentData.agentType === "device")
                ? serverVars.localAddresses
                : ipResolve.userAddresses();
            agentData.ipSelected = ipResolve.parse(addresses.local);
            responder({
                data: agentData,
                service: "agent-online"
            }, transmit);
        },
        browserLog = function terminal_server_receiver_browserLog():void {
            const logData:logData = data.data as logData,
                browserIndex:number = serverVars.testType.indexOf("browser");
            if (browserIndex < 0 || (browserIndex === 0 && logData[0] !== null && logData[0].toString().indexOf("Executing delay on test number") !== 0)) {
                log(logData);
            }
            responder(data, transmit);
        },
        fileListStatusUser = function terminal_server_receiver_fileListStatusUser():void {
            // * remote: Changes to the remote user's file system
            // * local : Update local "File Navigator" modals for the respective remote user
            const status:fileStatusMessage = data.data as fileStatusMessage;
            if (status.agentType === "user") {
                const devices:string[] = Object.keys(serverVars.device),
                    sendStatus = function terminal_server_receiver_fileListStatus_sendStatus(agent:string):void {
                        const body:string = JSON.stringify(data.data);
                        httpAgent.request({
                            agent: agent,
                            agentType: "device",
                            callback: null,
                            ip: serverVars.device[agent].ipSelected,
                            payload: {
                                data: data.data,
                                service: "file-list-status-device"
                            },
                            port: serverVars.device[agent].ports.http
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
            responder(data, transmit);
        },
        hashDevice = function terminal_server_receiver_hashDevice():void {
            // * produce a hash that describes a new device
            const hashData:hashAgent = data.data as hashAgent,
                callbackUser = function terminal_server_receiver_hashUser(hashUser:hashOutput):void {
                    const callbackDevice = function terminal_server_receiver_hashUser_hashDevice(hashDevice:hashOutput):void {
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
                        serverVars.nameDevice = hashData.device;
                        serverVars.device[serverVars.hashDevice] = {
                            deviceData: deviceData,
                            ipAll: serverVars.localAddresses,
                            ipSelected: "",
                            name: hashData.device,
                            ports: serverVars.ports,
                            shares: {},
                            status: "active"
                        };
                        settings({
                            data: {
                                settings: serverVars.device,
                                type: "device"
                            },
                            service: "hash-device"
                        });
                        responder({
                            data: hashes,
                            service: "hash-user"
                        }, transmit);
                    };
                    serverVars.hashUser = hashUser.hash;
                    serverVars.nameUser = hashData.user;
                    input.callback = callbackDevice;
                    input.source = hashUser.hash + hashData.device;
                    hash(input);
                },
                input:hashInput = {
                    algorithm: "sha3-512",
                    callback: callbackUser,
                    directInput: true,
                    source: hashData.user + hostname() + process.env.os + process.hrtime.bigint().toString()
                };
            hash(input);
        },
        hashShare = function terminal_server_receiver_hashShare():void {
            // * generate a hash string to name a share
            const hashData:hashShare = data.data as hashShare,
                input:hashInput = {
                    algorithm: "sha3-512",
                    callback: function terminal_server_receiver_shareHash(hashOutput:hashOutput):void {
                        const outputBody:hashShare = JSON.parse(hashOutput.id),
                            hashResponse:hashShareResponse = {
                                device: outputBody.device,
                                hash: hashOutput.hash,
                                share: outputBody.share,
                                type: outputBody.type
                            };
                        responder({
                            data: hashResponse,
                            service: "hash-share"
                        }, transmit);
                    },
                    directInput: true,
                    id: JSON.stringify(hashData),
                    source: serverVars.hashUser + serverVars.hashDevice + hashData.type + hashData.share
                };
            hash(input);
        },
        statusDevice = function terminal_server_receiver_statusDevice():void {
            websocket.broadcast(data, "browser");
            responder({
                data: null,
                service: "response-no-action"
            }, transmit);
        },
        actions:postActions = {
            "agent-online": agentOnline,
            "browser-log": browserLog,
            "copy": function terminal_server_receiver_copy():void {
                // * file system asset movement for both local and remote
                routeCopy(data, transmit);
            },
            "fs": function terminal_server_receiver_fs():void {
                // * file system interaction for both local and remote
                routeFile(data, transmit);
            },
            "file-list-status-device": statusDevice,
            "file-list-status-user": fileListStatusUser,
            "hash-device": hashDevice,
            "hash-share": hashShare,
            "heartbeat": function terminal_server_receiver_heartbeat():void {
                if (data.service === "heartbeat-complete") {
                    // * updates shares/status due to changes in the application/network and then informs the browser
                    heartbeat.complete(data, transmit, getAddress().local);
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
            "invite": function terminal_server_receiver_invite():void {
                // * Handle all stages of invitation
                invite(data.data as invite, getAddress().remote, transmit);
            },
            "message": function terminal_server_receiver_message():void {
                // * process text messages
                message(data.data as messageItem[], true);
            },
            "settings": function terminal_server_receiver_settings():void {
                // * local: Writes changes to settings files
                settings(data);
            },
            "test-browser": function terminal_server_receiver_testBrowser():void {
                // * validate a browser test iteration
                browser.methods.route(data.data as testBrowserRoute, transmit);
            }
        };
    if (serverVars.testType === "service") {
        if (task === "invite") {
            serverVars.testSocket = null;
        } else {
            serverVars.testSocket = transmit.socket;
        }
    }
    if (actions[task] === undefined) {
        responder({
            data: null,
            service: "forbidden"
        }, transmit);
    } else {
        actions[task]();
    }

    
};

export default receiver;