
/* lib/terminal/commands/interface/firewall - Shell interface to the firewall library, which opens the firewall for this application. */

import firewall from "../library/firewall.js";
import vars from "../../utilities/vars.js";

const interfaceFirewall = function terminal_commands_interface_firewall(callback:commandCallback):void {
    vars.settings.verbose = true;
    firewall(callback);
};

export default interfaceFirewall;