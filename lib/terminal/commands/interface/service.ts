
/* lib/terminal/commands/interface/service - Shell interface for running the application's network services, the applications default command. */

import error from "../../utilities/error.js";
import firewall_windows from "../../../applications/firewall_windows/index.js";
import service from "../library/service.js";
import vars from "../../utilities/vars.js";

// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const interfaceService = function terminal_commands_interface_service(callback:commandCallback):void {
    let a:number = process.argv.length;
    const serverOptions:config_service = {
            browser: false,
            host: "",
            port: (vars.settings.secure === true)
                ? 443
                : 80,
            test: false
        },
        serverCallback:service_callback = {
            agent: "",
            agentType: "device",
            callback: function terminal_commands_interface_service_callback(output:service_output):void {
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
        firewall_windows.terminal.library(function terminal_commands_interface_service_firewall(title:string, message:string[], fail:boolean):void {
            if (fail === true) {
                error(message, null);
            } else {
                service(serverOptions, serverCallback);
            }
        });
    } else {
        service(serverOptions, serverCallback);
    }
};

export default interfaceService;