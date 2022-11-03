/* lib/terminal/commands/interface/perf - Shell interface to utility perf that allows for performance testing. */

import perf from "../library/perf.js";
import vars from "../../utilities/vars.js";

const interfacePerf = function terminal_commands_interface_perf(callback:commandCallback):void {
    const perfType:perfType = (process.argv.length < 1)
        ? "socket"
        : process.argv[0] as perfType;
    perf(perfType, function terminal_commands_interface_perf_callback(title:string, text:string[], fail:boolean):void {
        if (fail === true) {
            if (vars.settings.verbose === true) {
                callback(title, text, true);
            } else {
                callback("", text, true);
            }
        } else if (vars.settings.verbose === true) {
            callback(title, text, false);
        }
    });
};

export default interfacePerf;