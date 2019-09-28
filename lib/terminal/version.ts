
import log from "./log.js";
import vars from "./vars.js";

// runs apps.log
const version = function terminal_version():void {
    vars.verbose = true;
    log([""], true);
};

export default version;