
import * as http from "http";

import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

/*  
This library is the means by which the local terminal instance talks with remote terminal instances.
For consistency and security this library must be the only means by which the applications talk to each other.
*/
const httpClient = function terminal_server_httpClient(config:httpClient):void {
    const ipAddress:string = (function terminal_server_httpClient_ip():string {
        const address:string = config.data.agent.slice(config.data.agent.indexOf("@") + 1, config.data.agent.lastIndexOf(":"));
        if (config.data.action === "fs-read" && config.data.agent !== "localhost") {
            config.data.remoteWatch = `${serverVars.addresses[0][1][1]}_${serverVars.webPort}`;
        } else {
            config.data.action = config.action;
        }
        if (address.charAt(0) === "[") {
            return address.slice(1, address.length - 1);
        }
        return address;
    }()),
    port:number = (function terminal_server_httpClient_port():number {
        const portString:string = config.data.agent.slice(config.data.agent.lastIndexOf(":") + 1);
        if (isNaN(Number(portString)) === true) {
            return 80;
        }
        return Number(portString);
    }()),
    payload:string = `fs:${JSON.stringify(config.data)}`,
    fsRequest:http.ClientRequest = http.request({
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(payload)
        },
        host: ipAddress,
        method: "POST",
        path: "/",
        port: port,
        timeout: 1000
    }, function terminal_server_httpClient_callback(fsResponse:http.IncomingMessage):void {
        config.callback(fsResponse);
    });
    fsRequest.on("error", function terminal_server_create_end_fsRequest_error(errorMessage:nodeError):void {
        if (errorMessage.code !== "ETIMEDOUT") {
            log([config.errorMessage, errorMessage.toString()]);
            vars.ws.broadcast(errorMessage.toString());
        }
        config.response.writeHead(500, {"Content-Type": "application/json; charset=utf-8"});
        config.response.write(`{"id":"${config.data.id}","dirs":"missing"}`);
        config.response.end();
    });
    fsRequest.write(payload);
    setTimeout(function () {
        fsRequest.end();
    }, 100);
};

export default httpClient;