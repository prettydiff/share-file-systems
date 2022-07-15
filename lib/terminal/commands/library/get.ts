
/* lib/terminal/commands/library/get - A command driven utility to fetch resources from across the internet via HTTP method GET. */
import { get as httpGet, IncomingMessage, STATUS_CODES } from "http";
import { get as httpsGet } from "https";

import error from "../../utilities/error.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

// http(s) get function
const get = function terminal_commands_library_get(address:string, callback:(title:string, file:Buffer|string) => void):void {
        let file:string = "";
        const title:string = "Get",
            scheme:"http"|"https" = (address.indexOf("https") === 0)
                ? "https"
                : "http",
            handler = function terminal_commands_library_get_handler(res:IncomingMessage):void {
                res.on("data", function terminal_commands_library_get_handler_data(chunk:string):void {
                    file = file + chunk;
                });
                res.on("end", function terminal_commands_library_get_handler_end() {
                    if (res.statusCode !== 200) {
                        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
                            if (vars.settings.verbose === true) {
                                log([`${res.statusCode} ${STATUS_CODES[res.statusCode]} - ${address}`]);
                            }
                            process.argv[0] = res.headers.location;
                            address = process.argv[0];
                            terminal_commands_library_get(address, callback);
                            return;
                        }
                        error([`${scheme}.get failed with status code ${res.statusCode}`]);
                        return;
                    }
                    callback(title, file);
                });
            };
        // both http and https are used here as the scheme variable
        if (scheme === "https") {
            httpsGet(address, handler);
        } else {
            httpGet(address, handler);
        }
    };

export default get;