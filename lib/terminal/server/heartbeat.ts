
import * as http from "http";

import error from "../error.js";
import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const library = {
        error: error,
        log: log
    },
    // This logic will push out heartbeat data
    heartbeat = function terminal_server_heartbeat(dataString:string, response?:http.ServerResponse):void {
        const data:heartbeat = JSON.parse(dataString),
            payload:string = `heartbeat-update:{"ip":"${serverVars.addresses[0][1][1]}","port":${serverVars.webPort},"refresh":${data.refresh},"status":"${data.status}","user":"${data.user}"}`,
            heartbeatRequest:http.ClientRequest = vars.node.https.request({
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(payload)
                },
                host: data.ip,
                method: "POST",
                path: "/",
                port: data.port,
                timeout: 1000
            }, function terminal_server_create_end_heartbeatResponse(heartbeatResponse:http.IncomingMessage):void {
                const chunks:string[] = [];
                heartbeatResponse.setEncoding('utf8');
                heartbeatResponse.on("data", function terminal_server_create_end_heartbeatResponse_data(chunk:string):void {
                    chunks.push(chunk);
                });
                heartbeatResponse.on("end", function terminal_server_create_end_heartbeatResponse_end():void {
                    //library.log([chunks.join("")]);
                });
                heartbeatResponse.on("error", function terminal_server_create_end_heartbeatResponse_error(errorMessage:nodeError):void {
                    vars.ws.broadcast([errorMessage.toString()]);
                    library.log([errorMessage.toString()]);
                });
            });
        heartbeatRequest.on("error", function terminal_server_create_end_heartbeatRequest_error(errorMessage:nodeError):void {
            if (errorMessage.code === "ETIMEDOUT" || errorMessage.code === "ECONNRESET") {
                const self:string = (data.ip.indexOf(":") > 0)
                    ? `@[${data.ip}]:${data.port}`
                    : `@${data.ip}:${data.port}`
                vars.ws.broadcast(`heartbeat-update:{"ip":"${data.ip}","port":${serverVars.webPort},"refresh":${data.refresh},"status":"offline","user":"${self}"}`);
            } else {
                vars.ws.broadcast(errorMessage.toString());
                library.log([errorMessage.toString()]);
            }
        });
        heartbeatRequest.write(payload);
        heartbeatRequest.end();
        if (response !== undefined) {
            response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
            response.write(`Heartbeat received at local terminal and sent to ${data.ip}`);
            response.end();
        }
    };

export default heartbeat;