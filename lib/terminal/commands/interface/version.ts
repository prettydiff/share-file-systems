
/* lib/terminal/commands/interface/version - Shell interface for expressing the application's version. */
import log from "../../utilities/log.js";

// runs apps.log
const version = function terminal_commands_interface_version():void {
    log.title("Version");
    log([""], true);
};

export default version;