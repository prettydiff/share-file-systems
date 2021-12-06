
/* lib/terminal/commands/service - A command driven HTTP service for running the terminal instance of the application. */

import serverVars from "../server/serverVars.js";
import transmit_http from "../server/transmission/transmit_http.js";

// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const service = function terminal_commands_service(serverOptions:serverOptions):void {
    let a:number = process.argv.length,
        secure:boolean = false;
    serverOptions = {
        browser: false,
        host: "",
        port: -1,
        secure: serverVars.secure,
        test: false
    };
    if (a > 0) {
        do {
            a = a - 1;
            if (process.argv[a] === "test") {
                serverOptions.test = true;
            } else if (process.argv[a] === "browser") {
                serverOptions.browser = true;
            } else if (process.argv[a] === "secure") {
                serverOptions.secure = true;
                secure = true;
            } else if (process.argv[a] === "insecure" && secure === false) {
                serverOptions.secure = false;
            } else if (process.argv[a].indexOf("ip:") === 0) {
                serverOptions.host = process.argv[a].replace("ip:", "");
            } else if ((/^\d+$/).test(process.argv[a]) === true) {
                serverOptions.port = Number(process.argv[a]);
            }
        } while (a > 0);
    }
    transmit_http.server(serverOptions, null);
};

export default service;