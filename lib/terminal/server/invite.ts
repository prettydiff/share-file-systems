
import * as http from "http";

import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const invite = function terminal_server_invite(dataString:string, response:http.ServerResponse):void {
    const data:invite = JSON.parse(dataString),
        inviteRequest = function local_server_invite_request():void {
            const payload:string = (data.action === "invite-request" || data.action === "invite-complete")
                    ? (function local_server_invite_request_payload():string {
                        const ip:string = data.ip,
                            port:number = data.port;
                        let output:string = "";
                        data.ip = serverVars.addresses[0][1][1];
                        data.port = serverVars.webPort;
                        output = `${data.action}:${JSON.stringify(data)}`;
                        data.ip = ip;
                        data.port = port;
                        return output;
                    }())
                    : `${data.action}:${JSON.stringify(data)}`,
                request:http.ClientRequest = http.request({
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Content-Length": Buffer.byteLength(payload)
                    },
                    host: data.ip,
                    method: "POST",
                    path: "/",
                    port: data.port,
                    timeout: (data.action === "invite-request")
                        ? 300000
                        : 2000
                }, function terminal_server_invite_inviteResponse(inviteResponse:http.IncomingMessage):void {
                    const chunks:string[] = [];
                    inviteResponse.setEncoding('utf8');
                    inviteResponse.on("data", function terminal_server_invite_inviteResponse_data(chunk:string):void {
                        chunks.push(chunk);
                    });
                    inviteResponse.on("end", function terminal_server_invite_inviteResponse_end():void {
                        const responseData:string = chunks.join("");
                        log([responseData]);
                    });
                    inviteResponse.on("error", function terminal_server_invite_inviteResponse_error(errorMessage:nodeError):void {
                        log([data.action, errorMessage.toString()]);
                        vars.ws.broadcast(errorMessage.toString());
                    });
                });
                request.on("error", function terminal_server_invite_inviteRequest_error(errorMessage:nodeError):void {
                    if (errorMessage.code === "ETIMEDOUT") {
                        if (data.action === "invite-request") {
                            data.message = `Remote user, ip - ${serverVars.addresses[0][1][1]} and port - ${serverVars.webPort}, timed out. Invitation not sent.`;
                            vars.ws.broadcast(`invite-error:${JSON.stringify(data)}`);
                        } else if (data.action === "invite-complete") {
                            data.message = `Originator, ip - ${serverVars.addresses[0][1][1]} and port - ${serverVars.webPort}, timed out. Invitation incomplete.`;
                            vars.ws.broadcast(`invite-error:${JSON.stringify(data)}`);
                        }
                    }
                    log([data.action, errorMessage.toString()]);
                    vars.ws.broadcast(errorMessage.toString());
                });
                if (data.action === "invite-request") {
                    data.ip = serverVars.addresses[0][1][1];
                    data.port = serverVars.webPort;
                }
                request.write(payload);
                request.end();
            };
    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
    if (data.action === "invite") {
        data.action = "invite-request";
        response.write("Invitation received at local terminal.");
        inviteRequest();
    } else if (data.action === "invite-request") {
        vars.ws.broadcast(`invite-request:${dataString}`);
        response.write("Invitation sent to remote browser.");
    } else if (data.action === "invite-response") {
        data.action = "invite-complete";
        response.write("Invitation response processed at terminal.");
        inviteRequest();
    } else if (data.action === "invite-complete") {
        vars.ws.broadcast(`invite-request:${dataString}`);
        response.write("Invitation sent to originating browser.");
    }
    response.end();
};

export default invite;