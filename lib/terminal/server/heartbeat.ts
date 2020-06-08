
/* lib/terminal/server/heartbeat - The code that manages sending and receiving user online status updates. */
import { ServerResponse } from "http";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";

import agents from "../../common/agents.js";
import deviceShare from "../../common/deviceShare.js";

const library = {
        agents: agents,
        deviceShare: deviceShare,
        error: error,
        httpClient: httpClient,
        log: log,
        storage: storage
    },
    forbidden:string = "Unexpected user.",
    removeByType = function terminal_server_heartbeatDelete_byType(list:string[], type:agentType):void {
        let a:number = list.length;
        if (a > 0) {
            do {
                if (type !== "device" || (type === "device" && list[a] !== serverVars.hashDevice)) {
                    delete serverVars[type][list[a]];
                }
                a = a - 1;
            } while (a > 0);
            storage(JSON.stringify({
                [type]: serverVars[type]
            }), "", type);
        }
    },
    broadcast = function terminal_server_heartbeatBroadcast(config:heartbeatBroadcast) {
        const payload:heartbeat = {
                agentFrom: "",
                agentTo: "",
                agentType: "device",
                shares: {},
                status: (config.status === "deleted")
                    ? config.deleted
                    : config.status
            },
            responder = function terminal_server_heartbeatBroadcast_responder():void {
                return;
            },
            httpConfig:httpConfiguration = {
                agentType: "user",
                callback: function terminal_server_heartbeatBroadcast_callback(responseBody:Buffer|string):void {
                    if (config.status === "deleted" && responseBody.indexOf("{\"heartbeat-response\":{") === 0) {
                        parse(JSON.parse(<string>responseBody)["heartbeat-response"]);
                    }
                },
                callbackType: "body",
                errorMessage: "",
                id: "heartbeat",
                ip: "",
                payload: "",
                port: 80,
                remoteName: "",
                requestError: function terminal_server_heartbeatBroadcast_requestError(errorMessage:nodeError, agent:string, type:agentType):void {
                    if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                        vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                        library.log([errorMessage.toString()]);
                    }
                },
                requestType: "heartbeat",
                responseError: function terminal_server_heartbeatBroadcast_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                    if (errorMessage.code !== "ETIMEDOUT") {
                        vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                        library.log([errorMessage.toString()]);
                    }
                }
            };
        if (config.list === null) {
            library.agents({
                complete: responder,
                countBy: "agent",
                perAgent: function terminal_server_heartbeatBroadcast_perAgent(agentNames:agentNames):void {
                    if (config.status === "deleted") {
                        if (agentNames.agentType === "user") {
                            if (config.deleted.user.indexOf(agentNames.agent) > -1) {
                                // deleting this user
                                payload.status = {
                                    device: [],
                                    user: [serverVars.hashUser]
                                };
                                httpConfig.requestType = "heartbeat-delete-agents";
                            } else if (config.sendShares === true) {
                                // deleting agents, but not this user, regular share update
                                payload.status = "active";
                                httpConfig.requestType = "heartbeat";
                            } else {
                                // do not send a delete message to user types unless this user is deleted or deletion of devices changes user shares
                                return;
                            }
                        } else {
                            httpConfig.requestType = "heartbeat-delete-agents";
                        }
                    } else {
                        httpConfig.requestType = "heartbeat";
                    }
                    httpConfig.errorMessage = `Error with heartbeat to ${agentNames.agentType} ${agentNames.agent}.`;
                    httpConfig.ip = serverVars[agentNames.agentType][agentNames.agent].ip;
                    httpConfig.port = serverVars[agentNames.agentType][agentNames.agent].port;
                    httpConfig.remoteName = agentNames.agent;
                    if (agentNames.agentType === "user" || (agentNames.agentType === "device" && serverVars.hashDevice !== agentNames.agent)) {
                        payload.agentTo = agentNames.agent;
                        httpConfig.payload = JSON.stringify({
                            [httpConfig.requestType]: payload
                        });
                        library.httpClient(httpConfig);
                    }
                },
                perAgentType: function terminal_server_heartbeatBroadcast_perAgentType(agentNames:agentNames) {
                    httpConfig.agentType = agentNames.agentType;
                    payload.agentType = agentNames.agentType;
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
                                    shares: library.deviceShare(serverVars.device, config.deleted)
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
            let a:number = config.list.length;
            httpConfig.agentType = "device";
            payload.agentType = "device";
            payload.agentFrom = serverVars.hashDevice;
            payload.shares = (config.sendShares === true)
                ? serverVars.device
                : {};
            httpConfig.requestType = "heartbeat";
            do {
                a = a - 1;
                httpConfig.errorMessage = `Error with heartbeat to device ${config.list[a]}.`;
                httpConfig.ip = serverVars.device[config.list[a]].ip;
                httpConfig.port = serverVars.device[config.list[a]].port;
                httpConfig.remoteName = config.list[a];
                if (serverVars.hashDevice !== config.list[a]) {
                    payload.agentTo = config.list[a];
                    httpConfig.payload = JSON.stringify({
                        [httpConfig.requestType]: payload
                    });
                    library.httpClient(httpConfig);
                }
            } while (a > 0);
        }
        if (config.response !== null) {
            // respond irrespective of broadcast status or completion to prevent hanging sockets
            config.response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            if (config.status === "deleted") {
                config.response.write("Deletion task sent.");
            } else {
                config.response.write("Heartbeat broadcast sent.");
            }
            config.response.end();
        }
    },
    // updates shares/storage only if necessary and then sends the payload to the browser
    parse = function terminal_server_heartbeatParse(data:heartbeat):void {
        const keys:string[] = Object.keys(data.shares),
            length:number = keys.length;
        let store:boolean = false;
        vars.testLogger("heartbeat", "response share-update", "If the heartbeat contains share data from a remote agent then add the updated share data locally.");
        if (data.agentType === "device" && length > 0) {
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
        } else if (data.agentType === "user" && JSON.stringify(serverVars.user[data.agentFrom].shares) !== JSON.stringify(data.shares[keys[0]].shares)) {
            serverVars.user[data.agentFrom].shares = data.shares[keys[0]].shares;
            store = true;
        }
        if (store === true) {
            library.storage(JSON.stringify({
                [data.agentType]: serverVars[data.agentType]
            }), "", data.agentType);
        } else {
            data.shares = {};
        }
        vars.ws.broadcast(JSON.stringify({
            "heartbeat-response": data
        }));
    },
    // This logic will push out heartbeat data
    heartbeat:heartbeatObject = {
        delete: function terminal_server_heartbeatDelete(deleted:agentDeletion, response:ServerResponse):void {
            broadcast({
                deleted: deleted,
                list: null,
                response: response,
                sendShares: true,
                status: "deleted"
            });
            removeByType(deleted.device, "device");
            removeByType(deleted.user, "user");
            if (response !== null) {
                response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                response.write("Requested remote agent deletions.");
                response.end();
            }
        },
        deleteResponse: function terminal_server_heartbeatDeleteResponse(data:heartbeat, response:ServerResponse):void {
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
                storage(JSON.stringify({
                    user: serverVars.user
                }), "", "user");
            }
            vars.ws.broadcast(JSON.stringify({
                "heartbeat-delete-agents": data
            }));
            if (response !== null) {
                response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                response.write("Response to remote user deletion.");
                response.end();
            }
        },
        parse: parse,
        response: function terminal_server_heartbeatResponse(data:heartbeat, response:ServerResponse):void {
            vars.testLogger("heartbeat", "response", "Respond to heartbeats from remote agents.");
            if (serverVars[data.agentType][data.agentFrom] === undefined) {
                vars.testLogger("heartbeat", "response unrecognized-agent", "When the agent is not recognized close out the HTTP response without sending a payload.");
                // trapping unexpected user
                if (response !== null) {
                    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                    response.write(forbidden);
                    response.end();
                }
            } else {
                // heartbeat from remote
                parse(data);
                vars.testLogger("heartbeat", "response write", "Update the browser of the heartbeat data and write the HTTP response.");
                data.agentTo = data.agentFrom;
                data.agentFrom = (data.agentType === "device")
                    ? serverVars.hashDevice
                    : serverVars.hashUser;
                data.shares = {};
                data.status = serverVars.status;
                if (response !== null) {
                    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                    response.write(JSON.stringify({
                        "heartbeat-response": data
                    }));
                    response.end();
                }
            }
        },
        update: function terminal_server_heartbeatUpdate(data:heartbeatUpdate, response:ServerResponse):void {
            // heartbeat from local, forward to each remote terminal
            const share:boolean = (JSON.stringify(data.shares) !== "{}");
            vars.testLogger("heartbeat", "broadcast", "Blast out a heartbeat to all shared agents.");
            if (data.agentFrom === "localhost-browser") {
                serverVars.status = data.status;
            }
            if (share === true) {
                serverVars.device = data.shares;
                storage(JSON.stringify({
                    device: serverVars.device
                }), "", "device");
            }
            broadcast({
                deleted: {
                    device: [],
                    user: []
                },
                list: data.devices,
                response: response,
                sendShares: share,
                status: data.status
            });
        }
    };

export default heartbeat;