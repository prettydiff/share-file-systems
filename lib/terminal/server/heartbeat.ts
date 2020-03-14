
/* lib/terminal/server/heartbeat - The code that manages sending and receiving user online status updates. */
import { ServerResponse } from "http";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";
import server from "../commands/server.js";

const library = {
        error: error,
        httpClient: httpClient,
        log: log,
        storage: storage
    },
    // This logic will push out heartbeat data
    heartbeat = function terminal_server_heartbeat(data:heartbeat, response:ServerResponse | ""):void {
        if (data.agent === "localhost-browser" || data.agent === "localhost-terminal") {
            // heartbeat from local, forward to each remote terminal
            const users:string[] = Object.keys(serverVars.users),
                length:number = users.length,
                payload:heartbeat = {
                    agent: data.agent,
                    shares: data.shares,
                    status: data.status,
                    user: serverVars.name
                };
            let a:number = 0,
                counter:number = 0,
                responder = function terminal_server_heartbeat_responder():void {
                    counter = counter + 1;
                    if (counter === length && response !== "") {
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write("Heartbeat response received for each remote terminal.");
                        response.end();
                    }
                };
            if (data.shares !== "") {
                serverVars.users.localhost.shares = data.shares;
                library.storage(JSON.stringify({users: serverVars.users}), "", "users");
            }
            if (data.agent === "localhost-browser") {
                serverVars.status = data.status;
            }
            do {
                payload.agent = users[a];
                if (users[a] === "localhost") {
                    responder();
                } else {
                    const heartbeatError:heartbeat = {
                        agent: serverVars.name,
                        shares: "",
                        status: "offline",
                        user: ""
                    };
                    library.httpClient({
                        callback: function terminal_server_heartbeat_callback(responseBody:Buffer|string):void {
                            vars.ws.broadcast(<string>responseBody);
                            responder();
                        },
                        callbackType: "body",
                        errorMessage: `Error with heartbeat to user ${users[a]}.`,
                        id: "",
                        payload: JSON.stringify({
                            "heartbeat": payload
                        }),
                        remoteName: users[a],
                        requestError: function terminal_server_heartbeat_requestError(errorMessage:nodeError, agent:string):void {
                            heartbeatError.user = agent;
                            vars.ws.broadcast(JSON.stringify({
                                "heartbeat-response": heartbeatError
                            }));
                            //library.log([errorMessage.toString()]);
                        },
                        responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError, agent:string):void {
                            heartbeatError.user = agent;
                            vars.ws.broadcast(JSON.stringify({
                                "heartbeat-response": heartbeatError
                            }));
                            //library.log([errorMessage.toString()]);
                        }
                    });
                }
                a = a + 1;
            } while (a < length);
        } else if (serverVars.users[data.user] === undefined) {
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
            if (data.shares !== "" && (serverVars.users[data.user].shares.length !== data.shares.length || JSON.stringify(serverVars.users[data.user].shares) !== JSON.stringify(data.shares))) {
                serverVars.users[data.user].shares = data.shares;
                library.storage(JSON.stringify({users: serverVars.users}), "", "users");
            } else {
                data.shares = "";
            }
            data.user = data.agent;
            data.agent = serverVars.name;
            data.shares = serverVars.users.localhost.shares;
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