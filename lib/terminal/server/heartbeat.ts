
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
    broadcast = function terminal_server_heartbeatBroadcast(config:heartbeatBroadcast) {
        const payload:heartbeat = {
                agentFrom: "",
                agentTo: "",
                agentType: "device",
                shares: {},
                status: config.status
            },
            responder = function terminal_server_heartbeatUpdate_responder():void {
                return;
            },
            httpConfig:httpConfiguration = {
                agentType: "user",
                callback: function terminal_server_heartbeatUpdate_callback(responseBody:Buffer|string):void {
                    parse(JSON.parse(<string>responseBody)["heartbeat-response"]);
                },
                callbackType: "body",
                errorMessage: "",
                id: "heartbeat",
                ip: "",
                payload: "",
                port: 80,
                remoteName: "",
                requestError: function terminal_server_heartbeatUpdate_requestError(errorMessage:nodeError, agent:string, type:agentType):void {
                    if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                        vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                        library.log([errorMessage.toString()]);
                    }
                },
                requestType: (config.status === "deleted")
                    ? "heartbeat-delete-agents"
                    : "heartbeat",
                responseError: function terminal_server_heartbeatUpdate_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                    if (errorMessage.code !== "ETIMEDOUT") {
                        vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                        library.log([errorMessage.toString()]);
                    }
                }
            };
        library.agents({
            complete: responder,
            countBy: "agent",
            perAgent: function terminal_server_heartbeatUpdate_perAgent(agentNames:agentNames):void {
                httpConfig.errorMessage = `Error with heartbeat to ${agentNames.agentType} ${agentNames.agent}.`;
                httpConfig.ip = serverVars[agentNames.agentType][agentNames.agent].ip;
                httpConfig.port = serverVars[agentNames.agentType][agentNames.agent].port;
                httpConfig.remoteName = agentNames.agent;
                if (agentNames.agentType === "user" || (agentNames.agentType === "device" && serverVars.hashDevice !== agentNames.agent)) {
                    payload.agentTo = agentNames.agent
                    httpConfig.payload = JSON.stringify({
                        "heartbeat": payload
                    });
                    library.httpClient(httpConfig);
                }
            },
            perAgentType: function terminal_server_heartbeatUpdate_perAgentType(agentNames:agentNames) {
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
                                shares: deviceShare(serverVars.device)
                            }
                        }
                        : {};
                }
            },
            source: serverVars
        });
        // respond irrespective of broadcast status or completion to prevent hanging sockets
        config.response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
        config.response.write(config.httpBody);
        config.response.end();
    },
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
        delete: function terminal_server_heartbeatDelete(deleted:[string, string][], response:ServerResponse):void {
            const length:number = deleted.length;
            let a:number = 0,
                device:boolean = false,
                user: boolean = false;
            do {
                if (deleted[a][1] === "device") {
                    device = true;
                } else if (deleted[a][1] === "user") {
                    user = true;
                }
                delete serverVars[deleted[a][1]][deleted[a][0]];
                a = a + 1;
            } while (a < length);
            if (device === true) {
                storage(JSON.stringify({
                    device: serverVars.device
                }), "", "device");
            }
            if (user === true) {
                storage(JSON.stringify({
                    user: serverVars.user
                }), "", "user");
            }
            broadcast({
                httpBody: "Instructions sent to delete this account from remote agents.",
                response: response,
                sendShares: false,
                status: "deleted"
            });
        },
        parse: parse,
        response: function terminal_server_heartbeatResponse(data:heartbeat, response:ServerResponse):void {
            vars.testLogger("heartbeat", "response", "Respond to heartbeats from remote agents.");
            if (serverVars[data.agentType][data.agentFrom] === undefined) {
                vars.testLogger("heartbeat", "response unrecognized-agent", "When the agent is not recognized close out the HTTP response without sending a payload.");
                // trapping unexpected user
                if (response !== null) {
                    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                    response.write("Unexpected user.");
                    response.end();
                }
            } else {
                // heartbeat from remote
                if (data.status === "deleted") {
                    vars.ws.broadcast(JSON.stringify({
                        "heartbeat-response": data
                    }));
                    delete serverVars[data.agentType][data.agentFrom];
                    library.storage(JSON.stringify({
                        [data.agentType]: serverVars[data.agentType]
                    }), "", data.agentType);
                    if (response !== null) {
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write("Response to remote user deletion.");
                        response.end();
                    }
                } else {
                    parse(data);
                    vars.testLogger("heartbeat", "response write", "Update the browser of the heartbeat data and write the HTTP response.");
                    data.agentTo = data.agentFrom;
                    data.agentFrom = (data.agentType === "device")
                        ? serverVars.hashDevice
                        : serverVars.hashUser;
                    data.status = serverVars.status;
                    if (response !== null) {
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write(JSON.stringify({
                            "heartbeat-response": data
                        }));
                        response.end();
                    }
                }
            }
        },
        update: function terminal_server_heartbeatUpdate(data:heartbeatUpdate, response:ServerResponse):void {
            // heartbeat from local, forward to each remote terminal
            vars.testLogger("heartbeat", "broadcast", "Blast out a heartbeat to all shared agents.");
            const share:boolean = (JSON.stringify(data.shares) !== "{}");
            if (data.agentFrom === "localhost-browser") {
                serverVars.status = data.status;
            }
            if (share === true) {
                serverVars.device[serverVars.hashDevice].shares = data.shares;
                storage(JSON.stringify({
                    device: serverVars.device
                }), "", "device");
                broadcast({
                    httpBody: "Heartbeat broadcast sent.",
                    response: response,
                    sendShares: share,
                    status: data.status
                });
            }
        }
    };

export default heartbeat;