
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
    // This logic will push out heartbeat data
    heartbeat = {
        broadcast: function terminal_server_heartbeat(data:heartbeatBroadcast, response:ServerResponse):void {
            // heartbeat from local, forward to each remote terminal
            const payload:heartbeat = {
                    agentFrom: "",
                    agentTo: "",
                    agentType: "device",
                    shares: {},
                    status: data.status
                },
                responder = function terminal_server_heartbeat_responder():void {
                    return;
                },
                httpConfig:httpConfiguration = {
                    agentType: "user",
                    callback: function terminal_server_heartbeat_callback(responseBody:Buffer|string):void {
                        vars.ws.broadcast(<string>responseBody);
                    },
                    callbackType: "body",
                    errorMessage: "",
                    id: "heartbeat",
                    ip: "",
                    payload: "",
                    port: 80,
                    remoteName: "",
                    requestError: function terminal_server_heartbeat_requestError(errorMessage:nodeError, agent:string, type:agentType):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                            library.log([errorMessage.toString()]);
                        }
                    },
                    requestType: "heartbeat",
                    responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                            library.log([errorMessage.toString()]);
                        }
                    }
                };
            vars.testLogger("heartbeat", "broadcast", "Blast out a heartbeat to all shared agents.");
            if (data.agentFrom === "localhost-browser") {
                serverVars.status = data.status;
                serverVars.device = data.shares;
            }
            library.agents({
                complete: responder,
                countBy: "agent",
                perAgent: function terminal_server_heartbeat_perAgent(agentNames:agentNames):void {
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
                perAgentType: function terminal_server_heartbeat_perAgentType(agentNames:agentNames) {
                    httpConfig.agentType = agentNames.agentType;
                    if (agentNames.agentType === "device") {
                        payload.agentFrom = serverVars.hashDevice;
                        payload.agentType = "device";
                        payload.shares = serverVars.device;
                    } else if (agentNames.agentType === "user") {
                        payload.agentFrom = serverVars.hashUser;
                        payload.agentType = "user";
                        payload.shares = {
                            [serverVars.hashUser]: {
                                ip: serverVars.ipAddress,
                                name: serverVars.nameUser,
                                port: serverVars.webPort,
                                shares: deviceShare(serverVars.device)
                            }
                        }
                    }
                },
                source: serverVars
            });
            // respond irrespective of broadcast status or completion to prevent hanging sockets
            response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            response.write("Heartbeat broadcast sent.");
            response.end();
        },
        delete: function terminal_server_heartbeatDelete(deleted:[string, string][], response:ServerResponse):void {
            let a:number = 0,
                agent:device,
                agentType:agentType,
                device:boolean = false,
                user: boolean = false;
            const length:number = deleted.length,
                payload:heartbeat = {
                    agentFrom: "",
                    agentTo: "",
                    agentType: "device",
                    shares: {},
                    status: "deleted"
                },
                httpConfig:httpConfiguration = {
                    agentType: "device",
                    callback: function terminal_server_heartbeatDelete_callback():boolean {
                        return false;
                    },
                    callbackType: "body",
                    errorMessage: "",
                    id: "heartbeat",
                    ip: "",
                    payload: "",
                    port: 80,
                    remoteName: "",
                    requestError: function terminal_server_heartbeatDelete_requestError(errorMessage:nodeError, agent:string, type:agentType):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                            library.log([errorMessage.toString()]);
                        }
                    },
                    requestType: "heartbeat-delete-agents",
                    responseError: function terminal_server_heartbeatDelete_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                            library.log([errorMessage.toString()]);
                        }
                    }
                };
            do {
                agentType = <agentType>deleted[a][1];
                agent = serverVars[agentType][deleted[a][0]];
                if (agent !== undefined) {
                    if (agentType === "device") {
                        payload.agentFrom = serverVars.hashDevice;
                        payload.agentType = "device";
                        device = true;
                    } else if (agentType === "user") {
                        payload.agentFrom = serverVars.hashUser;
                        payload.agentType = "user";
                        user = true;
                    }
                    payload.agentTo = deleted[a][0];
                    httpConfig.agentType = agentType;
                    httpConfig.ip = agent.ip;
                    httpConfig.payload = JSON.stringify({
                        "heartbeat": payload
                    });
                    httpConfig.port = agent.port;
                    httpConfig.remoteName = payload.agentFrom;
                    library.httpClient(httpConfig);
                    delete serverVars[agentType][deleted[a][0]];
                }
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
            response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            response.write("Instructions sent to delete this account from remote agents.");
            response.end();
        },
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
                    const keys:string[] = Object.keys(data.shares),
                        length:number = keys.length;
                    let store:boolean = true;
                    vars.testLogger("heartbeat", "response share-update", "If the heartbeat contains share data from a remote agent then add the updated share data locally.");
                    vars.ws.broadcast(JSON.stringify({
                        "heartbeat-response": data
                    }));
                    if (data.agentType === "device") {
                        let a:number = 0;
                        if (JSON.stringify(data.shares) === JSON.stringify(serverVars.device)) {
                            data.shares = {};
                            store = false;
                        } else {
                            do {
                                if (serverVars.device[keys[a]] === undefined) {
                                    serverVars.device[keys[a]] = data.shares[keys[a]];
                                } else {
                                    serverVars.device[keys[a]].shares = data.shares[keys[a]].shares;
                                }
                                a = a + 1;
                            } while (a < length);
                            data.shares = serverVars.device;
                        }
                    } else if (data.agentType === "user") {
                        if (JSON.stringify(serverVars.user[data.agentFrom].shares) === JSON.stringify(data.shares[keys[0]].shares)) {
                            data.shares = {};
                            store = false;
                        } else {
                            serverVars.user[data.agentFrom].shares = data.shares[keys[0]].shares;
                        }
                    }
                    vars.ws.broadcast(JSON.stringify({
                        "heartbeat-response": data
                    }));
                    if (store === true) {
                        library.storage(JSON.stringify({
                            [data.agentType]: serverVars[data.agentType]
                        }), "", data.agentType);
                    }

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
        }
    };

export default heartbeat;