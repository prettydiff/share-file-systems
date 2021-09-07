/* lib/terminal/server/response - A uniform means of handling HTTP responses. */

import { Readable } from "stream";

import error from "../utilities/error.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const response = function terminal_server_response(config:responseConfig):void {
    if (config.serverResponse !== null) {
        if (config.serverResponse.writableEnded === true) {
            const message:string[] = ["Write after end of HTTP response."];
            if (typeof config.message === "string") {
                message.push("");
                message.push(`${vars.text.cyan}Response message body:${vars.text.none}`);
                message.push(config.message);
            }
            error(message);
        } else {
            const textTypes:string[] = [
                    "application/json",
                    "text/plain",
                    "text/html",
                    "application/javascript",
                    "text/css",
                    "image/svg+xml",
                    "application/xhtml+xml"
                ],
                readStream:Readable = Readable.from(config.message),
                contains = function terminal_server_response_contains(input:string):boolean {
                    const stringMessage:string = (Buffer.isBuffer(config.message) === true)
                            ? ""
                            : config.message as string,
                        lower:string = stringMessage.toLowerCase();
                    if (lower.indexOf(input) > -1 && lower.indexOf(input) < 10) {
                        return true;
                    }
                    return false;
                },
                type:string = (textTypes.indexOf(config.mimeType) > -1)
                    ? `${config.mimeType}; charset=utf-8`
                    : config.mimeType;
            let status:number;
            if (Buffer.isBuffer(config.message) === true) {
                status = 200;
            } else if (contains("ENOENT") === true || contains("not found") === true) {
                status = 404;
            } else if (contains("forbidden") === true || config.message === "Unexpected user.") {
                status = 403;
            } else {
                status = 200;
            }
            config.serverResponse.setHeader("cache-control", "no-store");
            if (serverVars.secure === true) {
                config.serverResponse.setHeader("strict-transport-security", "max-age=63072000");
            }
            config.serverResponse.setHeader("alt-svc", "clear");
            config.serverResponse.setHeader("connection", "keep-alive");
            config.serverResponse.setHeader("content-length", Buffer.byteLength(config.message));
            config.serverResponse.setHeader("referrer-policy", "no-referrer");
            config.serverResponse.setHeader("response-type", config.responseType);
            // cspell:disable
            config.serverResponse.setHeader("x-content-type-options", "nosniff");
            // cspell:enable
            config.serverResponse.writeHead(status, {"content-type": type});
            readStream.pipe(config.serverResponse);
        }
    }
};

export default response;