
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
            const payload_device:heartbeatDevice = {
                    agentFrom: serverVars.hashDevice,
                    agentTo: "",
                    agentType: "device",
                    shareFrom: data.shareFrom,
                    shares: serverVars.device,
                    status: data.status
                },
                payload_user:heartbeatUser = {
                    agentFrom: serverVars.hashUser,
                    agentTo: "",
                    agentType: "user",
                    shareFrom: serverVars.hashUser,
                    shares: library.deviceShare(serverVars.device),
                    status: data.status
                },
                counts:agentCounts = {
                    count: 0,
                    total: 0
                },
                responder = function terminal_server_heartbeat_responder():void {
                    counts.count = counts.count + 1;
                    if (counts.count === counts.total && response !== null) {
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write("Heartbeat response received for each remote terminal.");
                        response.end();
                    }
                },
                httpConfig:httpConfiguration = {
                    agentType: "user",
                    callback: function terminal_server_heartbeat_callback(responseBody:Buffer|string):void {
                        vars.ws.broadcast(<string>responseBody);
                        responder();
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
                    responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                            library.log([errorMessage.toString()]);
                        }
                    }
                };
            let payload:heartbeatDevice|heartbeatUser;
            vars.testLogger("heartbeat", "broadcast", "Blast out a heartbeat to all shared agents.");
            if (data.agentFrom === "localhost-browser") {
                serverVars.status = data.status;
            }
            library.agents({
                complete: responder,
                countBy: "agent",
                perAgent: function terminal_server_heartbeat_perAgent(agentNames:agentNames, agentCounts:agentCounts):void {
                    httpConfig.errorMessage = `Error with heartbeat to ${agentNames.agentType} ${agentNames.agent}.`;
                    httpConfig.ip = serverVars[agentNames.agentType][agentNames.agent].ip;
                    httpConfig.port = serverVars[agentNames.agentType][agentNames.agent].port;
                    httpConfig.remoteName = agentNames.agent;
                    if (agentNames.agentType === "user" || (agentNames.agentType === "device" && serverVars.hashDevice !== agentNames.agent)) {
                        payload.agentTo = agentNames.agent
                        httpConfig.payload = JSON.stringify({
                            "heartbeat": payload
                        });
                        counts.total = agentCounts.total;
                        library.httpClient(httpConfig);
                    } else {
                        responder();
                    }
                },
                perAgentType: function terminal_server_heartbeat_perAgentType(agentNames:agentNames) {
                    httpConfig.agentType = agentNames.agentType;
                    payload = (agentNames.agentType === "device")
                        ? payload_device
                        : payload_user;
                },
                source: serverVars
            });
        },
        delete: function terminal_server_heartbeatDelete(deleted:[string, string][], response:ServerResponse):void {
            let a:number = 0,
                agent:device,
                agentType:agentType,
                device:boolean = false,
                payload:heartbeatDevice|heartbeatUser,
                user: boolean = false;
            const length:number = deleted.length,
                payload_device:heartbeatDevice = {
                    agentFrom: serverVars.hashDevice,
                    agentTo: "",
                    agentType: "device",
                    shares: {},
                    shareFrom: serverVars.hashDevice,
                    status: "deleted"
                },
                payload_user:heartbeatUser = {
                    agentFrom: serverVars.hashUser,
                    agentTo: "",
                    agentType: "user",
                    shares: {},
                    shareFrom: serverVars.hashUser,
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
                        payload = payload_device;
                        device = true;
                    } else if (agentType === "user") {
                        payload = payload_user;
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
                storage(JSON.stringify(device), "", "device");
            }
            if (user === true) {
                storage(JSON.stringify(user), "", "user");
            }
            response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            response.write("Instructions sent to delete this account from remote agents.");
            response.end();
        },
        response: function terminal_server_heartbeatResponse(data:heartbeatDevice|heartbeatUser, response:ServerResponse):void {
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
                        [`heartbeat-response-${data.agentType}`]: data
                    }));
                    if (response !== null) {
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write("Response to remote user deletion.");
                        response.end();
                    }
                } else {
                    if (data.shareFrom !== "") {
                        const sameAgent:boolean = (data.agentFrom === data.shareFrom),
                            shareString:string = (sameAgent === true)
                                ? JSON.stringify(serverVars[data.agentType][data.shareFrom].shares)
                                : JSON.stringify(serverVars.device[data.shareFrom].shares),
                            deviceStorage = function terminal_server_heartbeatResponse_deviceStorage(devices:devices):void {
                                const keys:string[] = Object.keys(devices),
                                    length:number = keys.length;
                                let a:number = 0;
                                do {
                                    if (serverVars.device[keys[a]] === undefined) {
                                        serverVars.device[keys[a]] = devices[keys[a]];
                                    } else {
                                        serverVars.device[keys[a]].shares = devices[keys[a]].shares;
                                    }
                                    a = a + 1;
                                } while (a < length);
                                vars.ws.broadcast(JSON.stringify({
                                    ["heartbeat-response-device"]: serverVars.device
                                }));
                                library.storage(JSON.stringify({
                                    [data.agentType]: serverVars[data.agentType]
                                }), "", "device");
                            };
                        vars.testLogger("heartbeat", "response share-update", "If the heartbeat contains share data from a remote agent then add the updated share data locally.");
                        if (shareString !== JSON.stringify(data.shares)) {
                            if (sameAgent === true) {
                                if (data.agentType === "user") {
                                    serverVars.user[data.agentFrom].shares = data.shares;
                                    vars.ws.broadcast(JSON.stringify({
                                        ["heartbeat-response-user"]: data
                                    }));
                                    library.storage(JSON.stringify({
                                        [data.agentType]: serverVars[data.agentType]
                                    }), "", "user");
                                } else if (data.agentType === "device") {
                                    deviceStorage(data.shares);
                                }
                            } else {
                                // device type, because user type does not identify devices
                                deviceStorage(<devices>data.shares);
                            }
                        }
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
                            [`heartbeat-response-${data.agentType}`]: data
                        }));
                        response.end();
                    }
                }
            }
        }
    };

export default heartbeat;