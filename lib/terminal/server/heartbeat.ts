
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
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        library.log([errorMessage.toString()]);
                    },
                    responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                        heartbeatError.agentFrom = agent;
                        heartbeatError.agentType = type;
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        library.log([errorMessage.toString()]);
                    }
                };
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
        response: function terminal_server_heartbeatResponse(data:heartbeat, response:ServerResponse):void {
            if (serverVars[data.agentType][data.agentFrom] === undefined) {
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
                if (data.shareFrom !== "") {
                    const sameAgent:boolean = (data.agentFrom === data.shareFrom),
                        shareString:string = (sameAgent === true)
                        ? JSON.stringify(serverVars[data.agentType][data.shareFrom].shares)
                        : JSON.stringify(serverVars.device[data.shareFrom].shares);
                    if (shareString !== JSON.stringify(data.shares)) {
                        if (sameAgent === true) {
                            serverVars[data.agentType][data.shareFrom].shares = data.shares;
                            library.storage(JSON.stringify(serverVars[data.agentType]), "", data.agentType);
                        } else {
                            serverVars.device[data.shareFrom].shares = data.shares;
                            library.storage(JSON.stringify(serverVars.device), "", "device");
                        }
                    }
                }
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
    };

export default heartbeat;