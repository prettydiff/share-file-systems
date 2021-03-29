
/* lib/terminal/server/heartbeat - The code that manages sending and receiving user online status updates. */

import common from "../../common/common.js";
import error from "../utilities/error.js";
import httpClient from "./httpClient.js";
import ipResolve from "./ipResolve.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";
import vars from "../utilities/vars.js";


const heartbeat = function terminal_server_heartbeat(input:heartbeatObject):void {
    const removeByType = function terminal_server_heartbeat_removeByType(list:string[], type:agentType):void {
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
                serverResponse: null,
                type: type
            });
        }
        },
        broadcast = function terminal_server_heartbeat_broadcast(config:heartbeatBroadcast) {
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
                responder = function terminal_server_heartbeat_broadcast_responder():void {
                    return;
                },
                errorHandler = function terminal_server_heartbeat_broadcast_errorHandler(errorMessage:nodeError):void {
                    common.agents({
                        countBy: "agent",
                        perAgent: function terminal_server_httpClient_requestErrorHeartbeat(agentNames:agentNames):void {
                            if (errorMessage.address === serverVars[agentNames.agentType][agentNames.agent].ipSelected) {
                                const data:heartbeat = {
                                    agentFrom: agentNames.agent,
                                    agentTo: (agentNames.agentType === "device")
                                        ? serverVars.hashDevice
                                        : serverVars.hashUser,
                                    agentType: agentNames.agentType,
                                    shares: {},
                                    shareType: agentNames.agentType,
                                    status: "offline"
                                };
                                vars.broadcast("heartbeat-complete", JSON.stringify(data));
                                if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED" && errorMessage.code !== "EADDRINUSE") {
                                    error([
                                        `Error sending or receiving heartbeat to ${agentNames.agentType} ${agentNames.agent}`,
                                        errorMessage.toString()
                                    ]);
                                }
                            }
                        },
                        source: serverVars
                    });
                },
                httpConfig:httpConfiguration = {
                    agentType: "user",
                    callback: function terminal_server_heartbeat_broadcast_callback(message:Buffer|string):void {
                        vars.broadcast(config.requestType, message.toString());
                    },
                    ip: "",
                    payload: "",
                    port: 443,
                    requestError: errorHandler,
                    requestType: config.requestType,
                    responseError: errorHandler
                };
            if (config.list === null) {
                common.agents({
                    complete: responder,
                    countBy: "agent",
                    perAgent: function terminal_server_heartbeat_broadcast_perAgent(agentNames:agentNames):void {
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
                            httpConfig.ip = serverVars[agentNames.agentType][agentNames.agent].ipSelected;
                            httpConfig.port = serverVars[agentNames.agentType][agentNames.agent].port;
                            httpConfig.payload = JSON.stringify(payload);
                            httpClient(httpConfig);
                        }
                    },
                    perAgentType: function terminal_server_heartbeat_broadcast_perAgentType(agentNames:agentNames) {
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
                                        ipAll: ipResolve.userAddresses(),
                                        ipSelected: "",
                                        name: serverVars.nameUser,
                                        port: serverVars.webPort,
                                        shares: common.selfShares(serverVars.device, config.deleted)
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
                            httpConfig.ip = serverVars.device[agent].ipSelected;
                            httpConfig.port = serverVars.device[agent].port;
                            payload.agentTo = agent;
                            httpConfig.payload = JSON.stringify(payload);
                            httpClient(httpConfig);
                        }
                    } while (a > 0);
                }
            }
        },
        // handler for request task: "delete"
        agentDelete = function terminal_server_heartbeat_agentDelete(deleted:agentList):void {
            broadcast({
                deleted: deleted,
                list: null,
                requestType: "heartbeat-delete-agents",
                sendShares: true,
                status: "deleted"
            });
            removeByType(deleted.device, "device");
            removeByType(deleted.user, "user");
            response({
                message: "response from heartbeat agentDelete",
                mimeType: "text/plain",
                responseType: "heartbeat-delete-agents",
                serverResponse: input.serverResponse
            });
        },
        // handler for request task: "heartbeat-delete-agents"
        deleteResponse = function terminal_server_heartbeat_deleteResponse(data:heartbeat):void {
            if (data.agentType === "device") {
                const deleted:agentList = data.status as agentList;
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
                    serverResponse: null,
                    type: "user"
                });
            }
            vars.broadcast("heartbeat-delete-agents", JSON.stringify(data));
            response({
                message: "response from heartbeat deleteResponse",
                mimeType: "text/plain",
                responseType: "heartbeat-delete-agents",
                serverResponse: input.serverResponse
            });
        },
        // handler for request task: "heartbeat-complete", updates shares/storage only if necessary and then sends the payload to the browser
        parse = function terminal_server_heartbeat_parse(data:heartbeat, ipRemote:string):void {
            const keys:string[] = Object.keys(data.shares),
                length:number = keys.length;
            let store:boolean = false;
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

                        // this check is necessary such that a remote user secondary device does not
                        // assign an ip from the same user primary device and create echos
                        if (serverVars.user[keys[0]].ipSelected === "") {
                            serverVars.user[keys[0]].ipSelected = ipRemote;
                        }
                        store = true;
                    } else if (JSON.stringify(serverVars.user[keys[0]].shares) !== JSON.stringify(data.shares[keys[0]].shares)) {
                        serverVars.user[keys[0]].shares = data.shares[keys[0]].shares;
                        store = true;
                    }
                }
                if (store === true) {
                    storage({
                        data: serverVars[data.shareType],
                        serverResponse: null,
                        type: data.shareType
                    });
                } else {
                    data.shares = {};
                }
            } else {
                data.shares = {};
            }
            vars.broadcast("heartbeat-complete", JSON.stringify(data));
            if (data.agentType === "user") {
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
                    sendShares: true,
                    status: data.status as heartbeatStatus
                });
            }
            data.shares = {};
            data.status = serverVars.status;
            data.agentTo = data.agentFrom;
            data.agentFrom = (data.agentType === "device")
                ? serverVars.hashDevice
                : serverVars.hashUser;
            response({
                message: JSON.stringify(data),
                mimeType: "application/json",
                responseType: "heartbeat-status",
                serverResponse: input.serverResponse
            });
        },
        status = function terminal_server_heartbeat_status():void {
            vars.broadcast("heartbeat-status", input.dataString);
            response({
                message: "heartbeat-status",
                mimeType: "text/plain",
                responseType: "heartbeat-status",
                serverResponse: input.serverResponse
            });
        },
        // handler for request task: "heartbeat-update", 
        update = function terminal_server_heartbeat_update(data:heartbeatUpdate):void {
            // heartbeat from local, forward to each remote terminal
            const share:boolean = (data.shares !== null);
            if (data.agentFrom === "localhost-browser") {
                serverVars.status = data.status;
            }
            if (share === true && data.type === "device") {
                serverVars.device = data.shares;
                storage({
                    data: serverVars.device,
                    serverResponse: null,
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
                sendShares: share,
                status: data.status
            });
            response({
                message: "response from heartbeat.update",
                mimeType: "text/plain",
                responseType: "heartbeat-update",
                serverResponse: input.serverResponse
            });
        };
    if (input.task === "heartbeat-complete") {
        parse(JSON.parse(input.dataString), input.ip);
    } else if (input.task === "heartbeat-delete") {
        agentDelete(JSON.parse(input.dataString));
    } else if (input.task === "heartbeat-delete-agents") {
        deleteResponse(JSON.parse(input.dataString));
    } else if (input.task === "heartbeat-status") {
        status();
    } else if (input.task === "heartbeat-update") {
        update(JSON.parse(input.dataString));
    }
};

export default heartbeat;