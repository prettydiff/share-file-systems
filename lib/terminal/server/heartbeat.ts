
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
            heartbeatRequest:http.ClientRequest = vars.node.http.request({
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    "content-length": Buffer.byteLength(payload),
                    "user-name": serverVars.name,
                    "remote-name": data.user
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
                    const message:string = chunks.join("");
                    vars.ws.broadcast(message);
                });
                heartbeatResponse.on("error", function terminal_server_create_end_heartbeatResponse_error(errorMessage:nodeError):void {
                    vars.ws.broadcast([errorMessage.toString()]);
                    library.log([errorMessage.toString()]);
                });
            });
        heartbeatRequest.on("error", function terminal_server_create_end_heartbeatRequest_error(errorMessage:nodeError):void {
            if (errorMessage.code === "ETIMEDOUT" || errorMessage.code === "ECONNRESET") {
                vars.ws.broadcast(`heartbeat-update:{"ip":"${data.ip}","port":${data.port},"refresh":${data.refresh},"status":"offline","user":"${serverVars.name}"}`);
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