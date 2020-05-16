
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
                    agentType: "user",
                    shareFrom: "",
                    shares: {},
                    status: data.status
                },
                heartbeatError:heartbeat = {
                    agentFrom: "",
                    agentTo: "",
                    agentType: "user",
                    shareFrom: "",
                    shares: {},
                    status: "offline"
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
                    payload: JSON.stringify({
                        "heartbeat": payload
                    }),
                    port: 80,
                    remoteName: "",
                    requestError: function terminal_server_heartbeat_requestError(errorMessage:nodeError, agent:string, type:agentType):void {
                        heartbeatError.agentFrom = agent;
                        heartbeatError.agentType = type;
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                            library.log([errorMessage.toString()]);
                        }
                    },
                    responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                        heartbeatError.agentFrom = agent;
                        heartbeatError.agentType = type;
                        if (errorMessage.code !== "ETIMEDOUT") {
                            vars.ws.broadcast(`Error on ${type} ${agent}: ${errorMessage}`);
                            library.log([errorMessage.toString()]);
                        }
                    }
                };
            vars.testLogger("heartbeat", "broadcast", "Blast out a heartbeat to all shared agents.");
            if (data.agentFrom === "localhost-browser") {
                serverVars.status = data.status;
            }
            library.agents({
                complete: responder,
                countBy: "agent",
                perAgent: function terminal_server_heartbeat_perAgent(agentNames:agentNames, agentCounts:agentCounts):void {
                    if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== serverVars.hashDevice)) {
                        payload.agentTo = agentNames.agent;
                        heartbeatError.agentTo = agentNames.agent;
                        httpConfig.errorMessage = `Error with heartbeat to ${agentNames.agentType} ${agentNames.agent}.`;
                        httpConfig.ip = serverVars[agentNames.agentType][agentNames.agent].ip;
                        httpConfig.payload = JSON.stringify({
                            "heartbeat": payload
                        });
                        httpConfig.port = serverVars[agentNames.agentType][agentNames.agent].port;
                        httpConfig.remoteName = agentNames.agent;
                        counts.total = agentCounts.total;
                        library.httpClient(httpConfig);
                    } else {
                        responder();
                    }
                },
                perAgentType: function terminal_server_heartbeat_perAgentType(agentNames:agentNames) {
                    const type:agentType = agentNames.agentType,
                        shares:deviceShares = (data.shareFrom === "")
                            ? {}
                            : (type === "device")
                                ? data.shares
                                : library.deviceShare(serverVars.device);

                    // heartbeatError
                    heartbeatError.agentFrom = (type === "device")
                        ? serverVars.hashDevice
                        : serverVars.hashUser;
                    heartbeatError.agentType = type;
                    heartbeatError.shareFrom = (type === "device")
                        ? data.shareFrom
                        : serverVars.hashUser;
                    heartbeatError.shares = shares;

                    // httpConfig
                    httpConfig.agentType = type;

                    // payload
                    payload.agentFrom = (type === "device")
                        ? serverVars.hashDevice
                        : serverVars.hashUser;
                    payload.agentType = type;
                    payload.shareFrom = (type === "device")
                        ? data.shareFrom
                        : serverVars.hashUser;
                    payload.shares = shares;
                },
                source: serverVars
            });
        },
        delete: function terminal_server_heartbeatDelete(deleted:[string, string][], response:ServerResponse):void {
            let a:number = 0,
                agentType:agentType,
                self:string,
                device:boolean = false,
                user: boolean = false;
            const length:number = deleted.length,
                payload:heartbeat = {
                    agentFrom: "",
                    agentTo: "",
                    agentType: "device",
                    shareFrom: "",
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
                    remoteName: ""
                };
            do {
                agentType = <agentType>deleted[a][1];
                self = (agentType === "device")
                    ? serverVars.hashDevice
                    : serverVars.hashUser;
                payload.agentFrom = self;
                payload.agentTo = deleted[a][0];
                payload.agentType = agentType;
                payload.shareFrom = self;
                httpConfig.agentType = agentType;
                httpConfig.ip = serverVars[agentType][deleted[a][0]].ip;
                httpConfig.payload = JSON.stringify(payload);
                httpConfig.port = serverVars[agentType][deleted[a][0]].port;
                library.httpClient(httpConfig);
                delete serverVars[agentType][deleted[a][0]];
                if (agentType === "device") {
                    device = true;
                }
                if (agentType === "user") {
                    user = true;
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
                vars.ws.broadcast(JSON.stringify({
                    "heartbeat-response": data
                }));
                if (data.status === "deleted") {
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
                            : JSON.stringify(serverVars.device[data.shareFrom].shares);
                        vars.testLogger("heartbeat", "response share-update", "If the heartbeat contains share data from a remote agent then add the updated share data locally.");
                        if (shareString !== JSON.stringify(data.shares)) {
                            if (sameAgent === true) {
                                serverVars[data.agentType][data.shareFrom].shares = data.shares;
                                library.storage(JSON.stringify({
                                    [data.agentType]: serverVars[data.agentType]
                                }), "", data.agentType);
                            } else {
                                serverVars.device[data.shareFrom].shares = data.shares;
                                library.storage(JSON.stringify({
                                    device: serverVars.device
                                }), "", "device");
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
                            "heartbeat-response": data
                        }));
                        response.end();
                    }
                }
            }
        }
    };

export default heartbeat;