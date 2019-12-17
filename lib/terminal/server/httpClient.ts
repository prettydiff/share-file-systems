
import * as http from "http";

import serverVars from "./serverVars.js";
import storage from "./storage.js";

import log from "../log.js";
import vars from "../vars.js";

const httpClient = function terminal_server_httpClient(config:httpConfiguration):void {
    const ip:string = (function terminal_server_httpClient_ip():string {
            let address:string = config.remoteName.slice(config.remoteName.lastIndexOf("@") + 1, config.remoteName.lastIndexOf(":"));
            if (address.charAt(0) === "[") {
                address = address.slice(1, address.length - 1);
            }
            return address;
        }()),
        port:number = (function terminal_server_httpClient_port():number {
            let address:string = config.remoteName.slice(config.remoteName.lastIndexOf(":") + 1);
            if (isNaN(Number(address)) === true) {
                return 80;
            }
            return Number(address);
        }()),
        requestError = (config.requestError === undefined)
            ? function terminal_server_httpClient_requestError(errorMessage:nodeError):void {
                if (errorMessage.code !== "ETIMEDOUT") {
                    log([config.errorMessage, errorMessage.toString()]);
                    vars.ws.broadcast(errorMessage.toString());
                }
                config.response.writeHead(500, {"Content-Type": "application/json; charset=utf-8"});
                config.response.write(`{"id":"${config.id}","dirs":"missing"}`);
                config.response.end();
            }
            : config.requestError,
        responseError = (config.responseError === undefined)
            ? function terminal_server_httpClient_responseError(errorMessage:nodeError):void {
                if (errorMessage.code !== "ETIMEDOUT") {
                    log([config.errorMessage, errorMessage.toString()]);
                    vars.ws.broadcast(errorMessage.toString());
                }
            }
            : config.responseError,
        fsRequest:http.ClientRequest = vars.node.http.request({
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": Buffer.byteLength(config.payload),
                "user-name": serverVars.name,
                "remote-user": config.remoteName
            },
            host: ip,
            method: "POST",
            path: "/",
            port: port,
            timeout: 1000
        }, function terminal_server_httpClient_callback(fsResponse:http.IncomingMessage):void {
            const chunks:Buffer[] = [];
            fsResponse.setEncoding("utf8");
            fsResponse.on("data", function terminal_server_httpClient_data(chunk:Buffer):void {
                chunks.push(chunk);
            });
            fsResponse.on("end", function terminal_server_httpClient_end():void {
                const body:Buffer|string = (Buffer.isBuffer(chunks[0]) === true)
                    ? Buffer.concat(chunks)
                    : chunks.join("");
                if (chunks[0].toString().indexOf("Forbidden:") === 0) {
                    const userName:string = body.toString().replace("Forbidden:", "");
                    delete serverVars.users[userName];
                    storage(JSON.stringify(serverVars.users), config.response, "users");
                    vars.ws.broadcast(`deleteUser:${userName}`);
                } else {
                    config.callback(body);
                }
            });
            fsResponse.on("error", responseError);
        });
    fsRequest.on("error", requestError);
    fsRequest.write(config.payload);
    setTimeout(function terminal_server_httpClient_delay():void {
        fsRequest.end();
    }, 100);
};

export default httpClient;