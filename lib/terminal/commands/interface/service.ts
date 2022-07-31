
/* lib/terminal/commands/interface/service - Shell interface for running the application's network services, the applications default command. */

import { clearScreenDown, cursorTo } from "readline";

import error from "../../utilities/error.js";
import firewall from "../library/firewall.js";
import transmit_http from "../../server/transmission/transmit_http.js";

// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const service = function terminal_commands_interface_service(callback:commandCallback):void {
    let a:number = process.argv.length;
    const serverOptions:config_http_server = {
            browser: false,
            host: "",
            port: -1,
            test: false
        },
        serverCallback:server_callback = {
            agent: "",
            agentType: "device",
            callback: function terminal_commands_interface_service_callback(output:server_output):void {
                callback("Service", output.log, null);
            }
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
    if (process.argv.indexOf("firewall") > 0) {
        firewall(function terminal_commands_interface_service_firewall(title:string, message:string[], fail:boolean):void {
            if (fail === true) {
                error(message);
            } else {
                cursorTo(process.stdout, 0, 0);
                clearScreenDown(process.stdout);
                transmit_http.server(serverOptions, serverCallback);
            }
        });
    } else {
        cursorTo(process.stdout, 0, 0);
        clearScreenDown(process.stdout);
        transmit_http.server(serverOptions, serverCallback);
    }
};

export default service;