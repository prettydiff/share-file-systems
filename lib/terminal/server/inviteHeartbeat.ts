
import * as http from "http";

import error from "../error.js";
import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const library = {
        error: error,
        log: log
    },
    // This logic will push out heartbeat data for existing connections only, so most of this logic is just for task:invite, because inviting a user must require a new socket
    inviteHeartbeat = function terminal_server_inviteHeartbeat(dataString:string, task:string, response:http.ServerResponse):void {
        const data:inviteHeartbeat = JSON.parse(dataString),
            payload:string = (task === "invite")
                ? `invite:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","message":"${data.message}","modal":"${data.modal}","name":"${data.name}","port":"${serverVars.webPort}","shares":${JSON.stringify(data.shares)},"status":"${data.status}"}`
                : `heartbeat:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","port":${serverVars.webPort},"refresh":${data.refresh},"status":"${data.status}","user":"${data.user}"}`,
            inviteRequest:http.ClientRequest = http.request({
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(payload)
                },
                host: data.ip,
                method: "POST",
                path: "/",
                port: data.port,
                timeout: (task === "invite")
                    ? 300000
                    : 15000
            }, function terminal_server_create_end_inviteResponse(inviteResponse:http.IncomingMessage):void {
                const chunks:string[] = [];
                inviteResponse.setEncoding('utf8');
                inviteResponse.on("data", function terminal_server_create_end_inviteResponse_data(chunk:string):void {
                    chunks.push(chunk);
                });
                inviteResponse.on("end", function terminal_server_create_end_inviteResponse_end():void {
                    const responseData:string = chunks.join("");
                    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                    if (task === "invite") {
                        response.write(responseData);
                    } else {
                        const self = (serverVars.addresses[0][1][2] === "ipv6")
                            ? `[${serverVars.addresses[0][1][1]}]:${serverVars.webPort}`
                            : `${serverVars.addresses[0][1][1]}:${serverVars.webPort}`;
                        response.write(`Heartbeat from ${self} received by ${data.user}`);
                    }
                    response.end();
                });
                inviteResponse.on("error", function terminal_server_create_end_inviteResponse_error(errorMessage:nodeError):void {
                    // http timeout then heartbeat for data.user is offline
                    library.log([errorMessage.toString()]);
                    vars.ws.broadcast(errorMessage.toString());
                });
            });
        inviteRequest.on("error", function terminal_server_create_end_inviteRequest_error(errorMessage:nodeError):void {
            library.log([errorMessage.toString()]);
            vars.ws.broadcast(errorMessage.toString());
        });
        inviteRequest.write(payload);
    };

export default inviteHeartbeat;