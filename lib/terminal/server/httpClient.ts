
/* lib/terminal/server/httpClient - A library for handling all child HTTP requests. */
import {ClientRequest, OutgoingHttpHeaders, RequestOptions} from "http";

import serverVars from "./serverVars.js";
import error from "../utilities/error.js";
import vars from "../utilities/vars.js";

const httpClient = function terminal_server_httpClient(config:httpConfiguration):void {
    if (config.response === undefined) {
        error([
            "config.response of httpClient is undefined.",
            JSON.stringify(config)
        ]);
        return;
    }
    const invite:string = (config.payload.indexOf("{\"invite\":{\"action\":\"invite-request\"") === 0)
            ? "invite-request"
            : (config.payload.indexOf("{\"invite\":{\"action\":\"invite-complete\"") === 0)
                ? "invite-complete"
                : "",
        headers:OutgoingHttpHeaders = {
            "content-type": "application/x-www-form-urlencoded",
            "content-length": Buffer.byteLength(config.payload),
            "agent-hash": serverVars.hashUser,
            "agent-name": serverVars.nameUser,
            "agent-type": config.agentType,
            "remote-user": config.remoteName,
            "request-type": config.requestType,
            "invite": invite
        },
        payload:RequestOptions = {
            headers: headers,
            host: config.ip,
            method: "POST",
            path: "/",
            port: config.port,
            timeout: 1000
        },
        scheme:string = (serverVars.secure === true)
            ? "https"
            : "http",
        fsRequest:ClientRequest = vars.node[scheme].request(payload, config.callback);
    vars.testLogger("httpClient", "", "An abstraction over node.https.request in support of this application's data requirements.");
    if (fsRequest.writableEnded === true) {
        error([
            "Attempt to write to HTTP request after end:",
            config.payload.toString()
        ]);
    } else {
        fsRequest.on("error", config.requestError);
        fsRequest.write(config.payload);
        fsRequest.end();
    }
};

export default httpClient;