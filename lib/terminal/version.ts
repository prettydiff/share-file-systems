
import log from "./log.js";
import vars from "./vars.js";

// runs apps.log
const version = function ():void {
    vars.verbose = true;
    log([""]);
};

export default version;