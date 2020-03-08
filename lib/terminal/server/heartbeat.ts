
/* lib/terminal/server/heartbeat - The code that manages sending and receiving user online status updates. */
import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";

const library = {
        error: error,
        httpClient: httpClient,
        log: log
    },
    // This logic will push out heartbeat data
    heartbeat = function terminal_server_heartbeat(data:heartbeat):void {
        const payload:heartbeat = {
                agent: data.agent,
                refresh: data.refresh,
                status: data.status,
                user:serverVars.name
            };
        library.httpClient({
            callback: function terminal_server_heartbeat_callback(responseBody:Buffer|string):void {
                vars.ws.broadcast(<string>responseBody);
            },
            callbackType: "body",
            errorMessage: `Error with heartbeat to user ${data.agent}.`,
            id: "",
            payload: JSON.stringify({
                "heartbeat-update": payload
            }),
            remoteName: data.agent,
            requestError: function terminal_server_heartbeat_requestError(errorMessage:nodeError):void {
                if (errorMessage.code === "ETIMEDOUT" || errorMessage.code === "ECONNRESET") {
                    vars.ws.broadcast(JSON.stringify({
                        "heartbeat-update": {
                            agent: data.agent,
                            refresh: data.refresh,
                            status: "offline",
                            user: serverVars.name
                        }
                    }));
                } else {
                    vars.ws.broadcast(JSON.stringify({
                        error: errorMessage
                    }));
                    library.log([errorMessage.toString()]);
                }
            },
            responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError):void {
                vars.ws.broadcast(JSON.stringify({
                    error: errorMessage
                }));
                library.log([errorMessage.toString()]);
            }
        });
    };

export default heartbeat;