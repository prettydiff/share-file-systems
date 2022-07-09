
/* lib/terminal/commands/service - A command driven HTTP service for running the terminal instance of the application. */

import { clearScreenDown, cursorTo } from "readline";

import transmit_http from "../../server/transmission/transmit_http.js";

// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const service = function terminal_commands_service():void {
    let a:number = process.argv.length;
    const serverOptions:config_http_server = {
        browser: false,
        host: "",
        port: -1,
        test: false
    };
    if (a > 0) {
        do {
            a = a - 1;
            if (process.argv[a] === "test") {
                serverOptions.test = true;
            } else if (process.argv[a] === "browser") {
                serverOptions.browser = true;
            } else if (process.argv[a].indexOf("ip:") === 0) {
                serverOptions.host = process.argv[a].replace("ip:", "");
            } else if ((/^\d+$/).test(process.argv[a]) === true) {
                serverOptions.port = Number(process.argv[a]);
            }
        } while (a > 0);
    }
    cursorTo(process.stdout, 0, 0);
    clearScreenDown(process.stdout);
    transmit_http.server(serverOptions, null);
};

export default service;