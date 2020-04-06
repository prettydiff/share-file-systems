
/* lib/terminal/server/heartbeat - The code that manages sending and receiving user online status updates. */
import { ServerResponse } from "http";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";
import deviceShare from "../../common/deviceShare.js";

const library = {
        deviceShare: deviceShare,
        error: error,
        httpClient: httpClient,
        log: log,
        storage: storage
    },
    // This logic will push out heartbeat data
    heartbeat = function terminal_server_heartbeat(data:heartbeat, response:ServerResponse | ""):void {
        if (data.agent === "localhost-browser" || data.agent === "localhost-terminal") {
            // heartbeat from local, forward to each remote terminal
            let a:number = 0,
                b:number = 0,
                counter:number = 0,
                agentType:agentType =  "device",
                agentLength:number = 0;
            const agents:heartbeatAgents = {
                    device: Object.keys(serverVars.device),
                    user: Object.keys(serverVars.user)
                },
                agentsKeys = Object.keys(agents),
                agentsKeysLength:number = agentsKeys.length,
                total:number = agents.device.length + agents.user.length,
                payload:heartbeat = {
                    agent: data.agent,
                    shares: library.deviceShare(serverVars.device),
                    status: data.status,
                    type: "user",
                    user: serverVars.name
                },
                heartbeatError:heartbeat = {
                    agent: serverVars.name,
                    shares: "",
                    status: "offline",
                    type: "user",
                    user: ""
                },
                responder = function terminal_server_heartbeat_responder():void {
                    counter = counter + 1;
                    if (counter === total && response !== "") {
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write("Heartbeat response received for each remote terminal.");
                        response.end();
                    }
                },
                httpConfig:httpConfiguration = {
                    agentType: "device",
                    callback: function terminal_server_heartbeat_callback(responseBody:Buffer|string):void {
                        vars.ws.broadcast(<string>responseBody);
                        responder();
                    },
                    callbackType: "body",
                    errorMessage: `Error with heartbeat to ${agentType} ${agents[agentType][b]}.`,
                    id: "heartbeat",
                    ip: serverVars[agentType][agents[agentType][b]].ip,
                    payload: JSON.stringify({
                        "heartbeat": payload
                    }),
                    port: serverVars[agentType][agents[agentType][b]].port,
                    remoteName: agents[agentType][b],
                    requestError: function terminal_server_heartbeat_requestError(errorMessage:nodeError, agent:string):void {
                        heartbeatError.user = agent;
                        heartbeatError.type = agentType;
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        //library.log([errorMessage.toString()]);
                    },
                    responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string):void {
                        heartbeatError.user = agent;
                        heartbeatError.type = agentType;
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        //library.log([errorMessage.toString()]);
                    }
                };
            if (data.shares !== "") {
                if (data.type === "user") {
                    serverVars.user[data.agent].shares = <deviceShares>data.shares;
                    library.storage(JSON.stringify(serverVars.user), "", "user");
                } else if (data.type === "device") {
                    serverVars.device = <devices>data.shares;
                    library.storage(JSON.stringify(serverVars.device), "", "device");
                }
            }
            if (data.agent === "localhost-browser") {
                serverVars.status = data.status;
            }

            if (agentsKeysLength > 0) {
                // loop through each agent type
                do {
                    agentType = <agentType>agentsKeys[a];
                    agentLength = agents[agentsKeys[a]].length;
                    httpConfig.agentType = agentType;
                    if (agentLength > 0) {
                        b = 0;
                        // loop through each agent of the given agent type
                        do {
                            payload.agent = agents[agentType][b];
                            library.httpClient(httpConfig);
                            b = b + 1;
                        } while (b < agentLength);
                    }
                    a = a + 1;
                } while (a < agentsKeysLength);
                if (counter < 1) {
                    counter = -1;
                    responder();
                }
            } else {
                counter = -1;
                responder();
            }
        } else if (serverVars.user[data.user] === undefined) {
            // trapping unexpected user
            if (response !== "") {
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
                if (data.type === "user" && JSON.stringify(serverVars.user[data.user].shares) !== JSON.stringify(data.shares)) {
                    serverVars.user[data.user].shares = <deviceShares>data.shares;
                    library.storage(JSON.stringify(serverVars.user), "", "user");
                } else if (data.type === "device" && JSON.stringify(serverVars.device[data.agent].shares) !== JSON.stringify(data.shares)) {
                    serverVars.device[data.user].shares = <deviceShares>data.shares;
                    library.storage(JSON.stringify(serverVars.device), "", "user");
                }
            } else {
                data.shares = "";
            }
            data.user = data.agent;
            data.agent = serverVars.name;
            data.shares = (data.type === "user")
                ? library.deviceShare(serverVars.device)
                : serverVars.device;
            data.status = serverVars.status;
            if (response !== "") {
                response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                response.write(JSON.stringify({
                    "heartbeat-response": data
                }));
                response.end();
            }
        }
    };

export default heartbeat;