
import * as http from "http";

import error from "./error.js";
import log from "./log.js";
import vars from "./vars.js";

// http(s) get function
const library = {
        error: error,
        log: log
    },
    get = function terminal_get(address:string, callback:Function|null):void {
        if (vars.command === "get") {
            address = process.argv[0];
        }
        if (address === undefined) {
            library.error([
                "The get command requires an address in http/https scheme.",
                `Please execute ${vars.text.cyan + vars.version.command} commands get${vars.text.none} for examples.`
            ]);
            return;
        }
        let file:string = "";
        const scheme:string = (address.indexOf("https") === 0)
                ? "https"
                : "http";
        if ((/^(https?:\/\/)/).test(address) === false) {
            library.error([
                `Address: ${vars.text.angry + address + vars.text.none}`,
                "The get command requires an address in http/https scheme.",
                `Please execute ${vars.text.cyan + vars.version.command} commands get${vars.text.none} for examples.`
            ]);
            return;
        }
        // both http and https are used here as the scheme variable
        vars.node[scheme].get(address, function terminal_get_callback(res:http.IncomingMessage) {
            res.on("data", function terminal_get_callback_data(chunk:string):void {
                file = file + chunk;
            });
            res.on("end", function terminal_get_callback_end() {
                if (res.statusCode !== 200) {
                    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
                        if (vars.verbose === true) {
                            library.log([`${res.statusCode} ${vars.node.http.STATUS_CODES[res.statusCode]} - ${address}`]);
                        }
                        process.argv[0] = res.headers.location;
                        address = process.argv[0];
                        terminal_get(address, callback);
                        return;
                    }
                    library.error([`${scheme}.get failed with status code ${res.statusCode}`]);
                    return;
                }
                if (vars.command === "get") {
                    library.log([file.toString()]);
                } else if (callback !== null) {
                    callback(file);
                }
            });
        });
    };

export default get;