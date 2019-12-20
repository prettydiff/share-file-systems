
import * as http from "http";

import forbiddenUser from "./forbiddenUser.js";
import serverVars from "./serverVars.js";

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
        callback: Function = (config.callbackType === "object")
            ? config.callback
            : function terminal_server_httpClient_callback(fsResponse:http.IncomingMessage):void {
                const chunks:Buffer[] = [];
                fsResponse.setEncoding("utf8");
                fsResponse.on("data", function terminal_server_httpClient_data(chunk:Buffer):void {
                    chunks.push(chunk);
                });
                fsResponse.on("end", function terminal_server_httpClient_end():void {
                    const body:Buffer|string = (Buffer.isBuffer(chunks[0]) === true)
                        ? Buffer.concat(chunks)
                        : chunks.join("");
                    if (chunks.length > 0 && chunks[0].toString().indexOf("ForbiddenAccess:") === 0) {
                        forbiddenUser(body.toString().replace("ForbiddenAccess:", ""));
                    } else {
                        config.callback(body);
                    }
                });
                fsResponse.on("error", responseError);
            },
        requestError = (config.payload.indexOf("share-exchange:") === 0)
            ? function terminal_server_httpClient_shareRequestError(errorMessage:nodeError):void {
                config.requestError(errorMessage, config.remoteName);
            }
            : (config.requestError === undefined)
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
        invite:string = (config.payload.indexOf("invite-request") === 0)
            ? "invite-request"
            : (config.payload.indexOf("invite-complete") === 0)
                ? "invite-complete"
                : "",
        headers:Object = (invite === "")
            ? {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": Buffer.byteLength(config.payload),
                "user-name": serverVars.name,
                "remote-user": config.remoteName
            }
            : {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": Buffer.byteLength(config.payload),
                "user-name": serverVars.name,
                "remote-user": config.remoteName,
                "invite": invite
            },
        fsRequest:http.ClientRequest = vars.node.http.request({
            headers: headers,
            host: ip,
            method: "POST",
            path: "/",
            port: port,
            timeout: 1000
        }, callback);
    fsRequest.on("error", requestError);
    fsRequest.write(config.payload);
    setTimeout(function terminal_server_httpClient_delay():void {
        fsRequest.end();
    }, 100);
};

export default httpClient;