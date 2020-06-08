/* lib/terminal/server/response - A uniform means of handling HTTP responses. */

import { ServerResponse } from "http";

import log from "../utilities/log.js";

const response = function terminal_server_response(serverResponse:ServerResponse, type:string, message:string|Buffer):void {
    if (serverResponse !== null) {
        if (serverResponse.writableEnded === true) {
            log([
                "Write after end of HTTP response.",
                "",
                new Error().stack
            ]);
        } else {
            const textTypes:string[] = [
                    "application/json",
                    "text/plain",
                    "text/html",
                    "application/javascript",
                    "text/css",
                    "image/jpeg",
                    "image/png",
                    "image/svg+xml",
                    "application/xhtml+xml"
                ],
                contains = function terminal_server_response(input:string):boolean {
                    const stringMessage:string = (Buffer.isBuffer(message) === true)
                            ? ""
                            : <string>message,
                        lower:string = stringMessage.toLowerCase();
                    if (lower.indexOf(input) > -1 && lower.indexOf(input) < 10) {
                        return true;
                    }
                    return false;
                };
            let status:number;
            if (Buffer.isBuffer(message) === true) {
                status = 200;
            } else if (contains("ENOENT") === true || contains("not found") === true) {
                status = 404;
            } else if (contains("forbidden") === true || message === "Unexpected user.") {
                status = 403;
            } else {
                status = 200;
            }
            type = (textTypes.indexOf(type) > -1)
                ? `${type}; charset=utf-8`
                : `${type}; charset=binary`;
            serverResponse.writeHead(status, {"Content-Type": type});
            serverResponse.write(message);
            serverResponse.end();
        }
    }
};

export default response;