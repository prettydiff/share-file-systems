/* lib/terminal/commands/interface/perf - Shell interface to utility perf that allows for performance testing. */

import perf from "../library/perf.js";
import vars from "../../utilities/vars.js";

const interfacePerf = function terminal_commands_interface_perf(callback:commandCallback):void {
    const config:config_perf_start = (function terminal_commands_interface_perf_config():config_perf_start {
        const output:config_perf_start = {
            frequency: 200000,
            secure: true,
            type: "socket"
        };
        let index:number = process.argv.length;
        if (index > 0) {
            do {
                index = index - 1;
                if (isNaN(Number(process.argv[index])) === false) {
                    output.frequency = Number(process.argv[index]);
                    process.argv.splice(index, 1);
                } else if (perf.preparation[process.argv[index]] !== undefined) {
                    output.type = process.argv[index];
                } else if (process.argv[index] === "insecure") {
                    output.secure = false;
                }
            } while (index > 0);
        }
        return output;
    }());
    perf.start(config, function terminal_commands_interface_perf_callback(title:string, text:string[], fail:boolean):void {
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