
import * as http from "http";

import error from "../error.js";
import log from "../log.js";
import vars from "../vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";

const library = {
        error: error,
        httpClient: httpClient,
        log: log
    },
    // This logic will push out heartbeat data
    heartbeat = function terminal_server_heartbeat(data:heartbeat):void {
        const payload:string = `heartbeat-update:{"agent":"${data.agent}","refresh":${data.refresh},"status":"${data.status}","user":"${serverVars.name}"}`;
        library.httpClient({
            callback: function terminal_server_heartbeat_callback(responseBody:Buffer|string):void {
                vars.ws.broadcast(<string>responseBody);
            },
            errorMessage: `Error with heartbeat to user ${data.agent}.`,
            id: "",
            payload: payload,
            remoteName: data.user,
            requestError: function terminal_server_heartbeat_requestError(errorMessage:nodeError):void {
                if (errorMessage.code === "ETIMEDOUT" || errorMessage.code === "ECONNRESET") {
                    vars.ws.broadcast(`heartbeat-update:{"agent":"${data.agent}","refresh":${data.refresh},"status":"offline","user":"${serverVars.name}"}`);
                } else {
                    vars.ws.broadcast(errorMessage.toString());
                    library.log([errorMessage.toString()]);
                }
            },
            responseError: function terminal_server_heartbeat_responseError(errorMessage:nodeError):void {
                vars.ws.broadcast([errorMessage.toString()]);
                library.log([errorMessage.toString()]);
            }
        });
    };

export default heartbeat;