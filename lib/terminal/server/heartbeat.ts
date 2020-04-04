
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
            const users:string[] = Object.keys(serverVars.user),
                userLength:number = users.length,
                devices:string[] = Object.keys(serverVars.device),
                deviceLength:number = devices.length,
                total:number = userLength + deviceLength,
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
                };
            let a:number = 0,
                counter:number = 0;
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

            // loop through users
            do {
                payload.agent = users[a];
                library.httpClient({
                    agentType: "user",
                    callback: function terminal_server_heartbeat_callback(responseBody:Buffer|string):void {
                        vars.ws.broadcast(<string>responseBody);
                        responder();
                    },
                    callbackType: "body",
                    errorMessage: `Error with heartbeat to user ${users[a]}.`,
                    id: "heartbeat",
                    payload: JSON.stringify({
                        "heartbeat": payload
                    }),
                    remoteName: users[a],
                    requestError: function terminal_server_heartbeat_requestError(errorMessage:nodeError, agent:string):void {
                        heartbeatError.user = agent;
                        heartbeatError.type = "user";
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        //library.log([errorMessage.toString()]);
                    },
                    responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string):void {
                        heartbeatError.user = agent;
                        heartbeatError.type = "user";
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        //library.log([errorMessage.toString()]);
                    }
                });
                a = a + 1;
            } while (a < userLength);

            // loop through devices
            a = 0;
            payload.shares = serverVars.device;
            do {
                payload.agent = devices[a];
                library.httpClient({
                    agentType: "device",
                    callback: function terminal_server_heartbeat_callback(responseBody:Buffer|string):void {
                        vars.ws.broadcast(<string>responseBody);
                        responder();
                    },
                    callbackType: "body",
                    errorMessage: `Error with heartbeat to device ${devices[a]}.`,
                    id: "heartbeat",
                    payload: JSON.stringify({
                        "heartbeat": payload
                    }),
                    remoteName: users[a],
                    requestError: function terminal_server_heartbeat_requestError(errorMessage:nodeError, agent:string):void {
                        heartbeatError.user = agent;
                        heartbeatError.type = "device";
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        //library.log([errorMessage.toString()]);
                    },
                    responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string):void {
                        heartbeatError.user = agent;
                        heartbeatError.type = "device";
                        vars.ws.broadcast(JSON.stringify({
                            "heartbeat-response": heartbeatError
                        }));
                        //library.log([errorMessage.toString()]);
                    }
                });
                a = a + 1;
            } while (a < deviceLength);

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