
/* lib/terminal/commands/interface/version - A command utility for expressing the application's version. */
import log from "../../utilities/log.js";

// runs apps.log
const version = function terminal_commands_version():void {
    log.title("Version");
    log([""], true);
};

export default version;