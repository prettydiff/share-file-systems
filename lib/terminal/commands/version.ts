
/* lib/terminal/commands/version - A command utility for expressing the application's version. */
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// runs apps.log
const version = function terminal_version():void {
    vars.testLogger("version", "", "sets verbose and complete flags on the log utility");
    vars.verbose = true;
    log([""], true);
};

export default version;