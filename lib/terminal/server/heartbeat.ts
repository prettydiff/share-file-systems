
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
    heartbeat = function terminal_server_heartbeat(data:heartbeat, response:ServerResponse):void {
        if (data.agent === "localhost-browser" || data.agent === "localhost-terminal") {
            // heartbeat from local, forward to each remote terminal
            const payload:heartbeat = {
                    agent: "user",
                    agentType: data.agentType,
                    shares: library.deviceShare(serverVars.device),
                    status: data.status,
                    user: serverVars.hashUser
                },
                heartbeatError:heartbeat = {
                    agent: serverVars.hashUser,
                    agentType: "user",
                    shares: "",
                    status: "offline",
                    user: ""
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
                        heartbeatError.user = agent;
                        heartbeatError.agentType = type;
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        library.log([errorMessage.toString()]);
                    },
                    responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                        heartbeatError.user = agent;
                        heartbeatError.agentType = type;
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        library.log([errorMessage.toString()]);
                    }
                };
            if (data.agent === "localhost-browser") {
                serverVars.status = data.status;
            }
            library.agents({
                complete: responder,
                countBy: "agent",
                perAgent: function terminal_server_heartbeat_perAgent(agentNames:agentNames, agentCounts:agentCounts):void {
                    if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== serverVars.hashDevice)) {
                        payload.agent = agentNames.agent;
                        payload.agentType = agentNames.agentType;
                        httpConfig.agentType = agentNames.agentType;
                        httpConfig.errorMessage = `Error with heartbeat to ${agentNames.agentType} ${agentNames.agent}.`;
                        httpConfig.ip = serverVars[agentNames.agentType][agentNames.agent].ip;
                        httpConfig.payload = JSON.stringify({
                            "hearbeat-response": payload
                        });
                        httpConfig.port = serverVars[agentNames.agentType][agentNames.agent].port;
                        httpConfig.remoteName = agentNames.agent;
                        counts.total = agentCounts.total;
                        library.httpClient(httpConfig);
                    }
                },
                source: serverVars
            });
        } else if (serverVars.user[data.user] === undefined) {
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
            if (data.shares !== "") {
                const shareString:string = JSON.stringify(serverVars[data.agentType][data.agent].shares);
                if (shareString !== JSON.stringify(data.shares)) {
                    serverVars[data.agentType][data.agent].shares = <deviceShares>data.shares;
                    library.storage(JSON.stringify(serverVars[data.agentType]), "", data.agentType);
                }
            } else {
                data.shares = "";
            }
            data.user = data.agent;
            data.agent = serverVars.hashUser;
            data.shares = (data.agentType === "user")
                ? library.deviceShare(serverVars.device)
                : serverVars.device;
            data.status = serverVars.status;
            if (response !== null) {
                response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                response.write(JSON.stringify({
                    "heartbeat-response": data
                }));
                response.end();
            }
        }
    };

export default heartbeat;