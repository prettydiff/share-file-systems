/* lib/terminal/server/response - A uniform means of handling HTTP responses. */

import { ServerResponse } from "http";

import log from "../utilities/log.js";

const response = function terminal_server_response(response:ServerResponse, type:string, message:string|Buffer):void {
    if (response !== null) {
        if (response.writableEnded === true) {
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
            ];
            type = (textTypes.indexOf(type) > -1)
                ? `${type}; charset=utf-8`
                : `${type}; charset=binary`;
            response.writeHead(200, {"Content-Type": type});
            response.write(message);
            response.end();
        }
    }
};

export default response;