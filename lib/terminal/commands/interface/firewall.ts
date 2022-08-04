
/* lib/terminal/commands/interface/firewall - Shell interface to the firewall library, which opens the firewall for this application. */

import error from "../../utilities/error.js";
import firewall from "../library/firewall.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const interfaceFirewall = function terminal_commands_interface_firewall():void {
    vars.settings.verbose = true;
    firewall(function terminal_commands_interface_firewall_callback(title:string, message:string[], fail:boolean):void {
        log.title(title);
        if (fail === true) {
            error(message);
            process.exit(1);
        } else {
            log(message, true);
        }
    });
};

export default interfaceFirewall;