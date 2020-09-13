
/* lib/terminal/commands/get - A command driven utility to fetch resources from across the internet via HTTP method GET. */
import { IncomingMessage } from "http";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// http(s) get function
const get = function terminal_get(address:string, callback:Function|null):void {
        if (vars.command === "get") {
            address = process.argv[0];
            if (vars.verbose === true) {
                log.title("Get");
            }
        }
        if (address === undefined) {
            vars.testLogger("get", "no address", "command requires an address.");
            error([
                "The get command requires an address and that address must be in http/https scheme.",
                `Please execute ${vars.text.cyan + vars.version.command} commands get${vars.text.none} for examples.`
            ]);
            return;
        }
        let file:string = "";
        const scheme:string = (address.indexOf("https") === 0)
                ? "https"
                : "http";
        if ((/^(https?:\/\/)/).test(address) === false) {
            vars.testLogger("get", "not http", "command requires the address begin with http or https.");
            error([
                `Address: ${vars.text.angry + address + vars.text.none}`,
                "The get command requires an address in http/https scheme.",
                `Please execute ${vars.text.cyan + vars.version.command} commands get${vars.text.none} for examples.`
            ]);
            return;
        }
        // both http and https are used here as the scheme variable
        vars.node[scheme].get(address, function terminal_get_callback(res:IncomingMessage) {
            vars.testLogger("get", "callback", `requesting address ${address}`);
            res.on("data", function terminal_get_callback_data(chunk:string):void {
                file = file + chunk;
            });
            res.on("end", function terminal_get_callback_end() {
                if (res.statusCode !== 200) {
                    vars.testLogger("get", "response complete", `status code: ${res.statusCode}`);
                    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
                        if (vars.verbose === true) {
                            log([`${res.statusCode} ${vars.node.http.STATUS_CODES[res.statusCode]} - ${address}`]);
                        }
                        process.argv[0] = res.headers.location;
                        address = process.argv[0];
                        terminal_get(address, callback);
                        return;
                    }
                    error([`${scheme}.get failed with status code ${res.statusCode}`]);
                    return;
                }
                vars.testLogger("get", "response end", "response complete with status code 200 so now to write completion to terminal for command 'get' or call the callback.");
                if (vars.command === "get") {
                    log([file.toString()]);
                } else if (callback !== null) {
                    callback(file);
                }
            });
        });
    };

export default get;