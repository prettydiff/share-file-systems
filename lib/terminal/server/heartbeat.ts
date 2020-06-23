
/* lib/terminal/server/heartbeat - The code that manages sending and receiving user online status updates. */
import { ServerResponse } from "http";

import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import httpClient from "./httpClient.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";

import agents from "../../common/agents.js";
import deviceShare from "../../common/deviceShare.js";
import error from "../utilities/error.js";

const removeByType = function terminal_server_heartbeatDelete_byType(list:string[], type:agentType):void {
        let a:number = list.length;
        if (a > 0) {
            do {
                a = a - 1;
                if (type !== "device" || (type === "device" && list[a] !== serverVars.hashDevice)) {
                    delete serverVars[type][list[a]];
                }
            } while (a > 0);
            storage({
                data: serverVars[type],
                response: null,
                type: type
            });
        }
    },
    broadcast = function terminal_server_heartbeatBroadcast(config:heartbeatBroadcast) {
        const payload:heartbeat = {
                agentFrom: "",
                agentTo: "",
                agentType: "device",
                shares: {},
                shareType: "device",
                status: (config.status === "deleted")
                    ? config.deleted
                    : config.status
            },
            responder = function terminal_server_heartbeatBroadcast_responder():void {
                return;
            },
            errorHandler = function terminal_server_heartbeatBroadcast_errorHandler(errorMessage:nodeError, agent:string, type:agentType):void {
                const data:heartbeat = {
                    agentFrom: agent,
                    agentTo: (type === "device")
                        ? serverVars.hashDevice
                        : serverVars.hashUser,
                    agentType: type,
                    shares: {},
                    shareType: type,
                    status: "offline"
                };
                vars.ws.broadcast(JSON.stringify({
                    "heartbeat-complete": data
                }));
                if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                    error([
                        `Error sending or receiving heartbeat to ${type} ${agent}`,
                        errorMessage.toString()
                    ]);
                }
            },
            httpConfig:httpConfiguration = {
                agentType: "user",
                callback: function terminal_server_heartbeatBroadcast_callback(responseBody:Buffer|string):void {
                    vars.ws.broadcast(responseBody);
                },
                callbackType: "body",
                errorMessage: "",
                id: "heartbeat",
                ip: "",
                payload: "",
                port: 80,
                remoteName: "",
                requestError: errorHandler,
                requestType: config.requestType,
                response: null,
                responseError: errorHandler
            };
        if (config.list === null) {
            agents({
                complete: responder,
                countBy: "agent",
                perAgent: function terminal_server_heartbeatBroadcast_perAgent(agentNames:agentNames):void {
                    if (agentNames.agentType === "user" || (agentNames.agentType === "device" && serverVars.hashDevice !== agentNames.agent)) {
                        payload.agentTo = agentNames.agent;
                        if (config.status === "deleted" && agentNames.agentType === "user") {
                            if (config.deleted.user.indexOf(agentNames.agent) > -1) {
                                // deleting this user
                                payload.status = {
                                    device: [],
                                    user: [serverVars.hashUser]
                                };
                            } else if (config.sendShares === true) {
                                // deleting agents, but not this user, regular share update
                                payload.status = "active";
                            } else {
                                // do not send a delete message to user types unless this user is deleted or deletion of devices changes user shares
                                return;
                            }
                        }
                        httpConfig.errorMessage = `Error with heartbeat to ${agentNames.agentType} ${agentNames.agent}.`;
                        httpConfig.ip = serverVars[agentNames.agentType][agentNames.agent].ip;
                        httpConfig.port = serverVars[agentNames.agentType][agentNames.agent].port;
                        httpConfig.remoteName = agentNames.agent;
                        httpConfig.payload = JSON.stringify({
                            [config.requestType]: payload
                        });
                        httpClient(httpConfig);
                    }
                },
                perAgentType: function terminal_server_heartbeatBroadcast_perAgentType(agentNames:agentNames) {
                    httpConfig.agentType = agentNames.agentType;
                    payload.agentType = agentNames.agentType;
                    payload.shareType = agentNames.agentType;
                    if (agentNames.agentType === "device") {
                        payload.agentFrom = serverVars.hashDevice;
                        payload.shares = (config.sendShares === true)
                            ? serverVars.device
                            : {};
                    } else if (agentNames.agentType === "user") {
                        payload.agentFrom = serverVars.hashUser;
                        payload.shares = (config.sendShares === true)
                            ? {
                                [serverVars.hashUser]: {
                                    ip: serverVars.ipAddress,
                                    name: serverVars.nameUser,
                                    port: serverVars.webPort,
                                    shares: deviceShare(serverVars.device, config.deleted)
                                }
                            }
                            : {};
                        if (config.sendShares === true && JSON.stringify(payload.shares[serverVars.hashUser].shares) === "{}") {
                            config.sendShares = false;
                        }
                    }
                },
                source: serverVars
            });
        } else {
            let a:number = config.list.distribution.length,
                agent:string;
            if (a > 0) {
                httpConfig.agentType = "device";
                payload.agentType = "device";
                payload.agentFrom = serverVars.hashDevice;
                payload.shares = (config.sendShares === true)
                    ? config.list.payload
                    : {};
                payload.shareType = config.list.type;
                httpConfig.requestType = config.requestType;
                do {
                    a = a - 1;
                    agent = config.list.distribution[a];
                    if (serverVars.hashDevice !== agent) {
                        httpConfig.errorMessage = `Error with heartbeat to device ${serverVars.device[agent].name} (${agent}).`;
                        httpConfig.ip = serverVars.device[agent].ip;
                        httpConfig.port = serverVars.device[agent].port;
                        httpConfig.remoteName = agent;
                        payload.agentTo = agent;
                        httpConfig.payload = JSON.stringify({
                            "heartbeat-complete": payload
                        });
                        httpClient(httpConfig);
                    }
                } while (a > 0);
            }
        }
        // respond irrespective of broadcast status or completion to prevent hanging sockets
        if (config.response !== null) {
            if (config.status === "deleted") {
                response(config.response, "text/plain", "Deletion task sent.");
            } else {
                response(config.response, "text/plain", "Heartbeat broadcast sent.");
            }
        }
    },
    // updates shares/storage only if necessary and then sends the payload to the browser
    parse = function terminal_server_heartbeatParse(data:heartbeat, serverResponse:ServerResponse):void {
        const keys:string[] = Object.keys(data.shares),
            length:number = keys.length;
        let store:boolean = false;
        vars.testLogger("heartbeat", "response share-update", "If the heartbeat contains share data from a remote agent then add the updated share data locally.");
        if (length > 0) {
            if (data.shareType === "device") {
                let a:number = 0;
                do {
                    if (serverVars.device[keys[a]] === undefined) {
                        serverVars.device[keys[a]] = data.shares[keys[a]];
                        store = true;
                    } else if (JSON.stringify(serverVars.device[keys[a]].shares) !== JSON.stringify(data.shares[keys[a]].shares)) {
                        serverVars.device[keys[a]].shares = data.shares[keys[a]].shares;
                        store = true;
                    }
                    a = a + 1;
                } while (a < length);
                data.shares = serverVars.device;
            } else if (data.shareType === "user") {
                if (serverVars.user[keys[0]] === undefined) {
                    serverVars.user[keys[0]] = data.shares[keys[0]];
                    store = true;
                } else if (JSON.stringify(serverVars.user[keys[0]].shares) !== JSON.stringify(data.shares[keys[0]].shares)) {
                    serverVars.user[keys[0]].shares = data.shares[keys[0]].shares;
                    store = true;
                }
            }
            if (store === true) {
                storage({
                    data: serverVars[data.shareType],
                    response: null,
                    type: data.shareType
                });
            } else {
                data.shares = {};
            }
        } else {
            data.shares = {};
        }
        vars.ws.broadcast(JSON.stringify({
            "heartbeat-complete": data
        }));
        if (data.agentType === "user") {console.log(data);
            const list:string[] = Object.keys(serverVars.device).slice(1);
            broadcast({
                deleted: {
                    device: [],
                    user: []
                },
                list: {
                    distribution: list,
                    payload: {
                        [keys[0]]: serverVars.user[keys[0]]
                    },
                    type: "user"
                },
                requestType: "heartbeat-complete",
                response: null,
                sendShares: true,
                status: <heartbeatStatus>data.status
            });
        }
        data.shares = {};
        data.status = serverVars.status;
        data.agentTo = data.agentFrom;
        data.agentFrom = (data.agentType === "device")
            ? serverVars.hashDevice
            : serverVars.hashUser;
        response(serverResponse, "application/json", JSON.stringify({
            "heartbeat-status": data
        }));
    },
    // This logic will push out heartbeat data
    heartbeat:heartbeatObject = {
        delete: function terminal_server_heartbeatDelete(deleted:agentDeletion, serverResponse:ServerResponse):void {
            broadcast({
                deleted: deleted,
                list: null,
                requestType: "heartbeat-delete-agents",
                response: serverResponse,
                sendShares: true,
                status: "deleted"
            });
            removeByType(deleted.device, "device");
            removeByType(deleted.user, "user");
        },
        deleteResponse: function terminal_server_heartbeatDeleteResponse(data:heartbeat, serverResponse:ServerResponse):void {
            if (data.agentType === "device") {
                const deleted:agentDeletion = <agentDeletion>data.status;
                if (deleted.device.indexOf(serverVars.hashDevice) > -1) {
                    // local device is in the deletion list, so all agents are deleted
                    removeByType(Object.keys(serverVars.device), "device");
                    removeByType(Object.keys(serverVars.user), "user");
                } else {
                    // otherwise only delete the agents specified
                    removeByType(deleted.device, "device");
                    removeByType(deleted.user, "user");
                }
            } else if (data.agentType === "user") {
                delete serverVars.user[data.agentFrom];
                storage({
                    data: serverVars.user,
                    response: null,
                    type: "user"
                });
            }
            vars.ws.broadcast(JSON.stringify({
                "heartbeat-delete-agents": data
            }));
            response(serverResponse, "text/plain", "Response to remote user deletion.");
        },
        parse: parse,
        update: function terminal_server_heartbeatUpdate(data:heartbeatUpdate):void {
            // heartbeat from local, forward to each remote terminal
            const share:boolean = (JSON.stringify(data.shares) !== "{}");
            vars.testLogger("heartbeat", "broadcast", "Blast out a heartbeat to all shared agents.");
            if (data.agentFrom === "localhost-browser") {
                serverVars.status = data.status;
            }
            if (share === true && data.type === "device") {
                serverVars.device = data.shares;
                storage({
                    data: serverVars.device,
                    response: null,
                    type: "device"
                });
            }
            broadcast({
                deleted: {
                    device: [],
                    user: []
                },
                list: data.broadcastList,
                requestType: "heartbeat-complete",
                response: data.response,
                sendShares: share,
                status: data.status
            });
        }
    };

export default heartbeat;