
/* lib/terminal/commands/interface/version - Shell interface for expressing the application's version. */

import vars from "../../utilities/vars.js";

// runs apps.log
const version = function terminal_commands_interface_version(callback:commandCallback):void {
    vars.settings.verbose = true;
    callback("Version", [""], false);
};

export default version;