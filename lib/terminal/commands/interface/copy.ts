/* lib/terminal/commands/interface/copy - Shell interface for the file copy command. */

import { resolve } from "path";

import copy from "../library/copy.js";
import error from "../../utilities/error.js";
import vars from "../../utilities/vars.js";

const interfaceCopy = function terminal_commands_interface_copy(callback:commandCallback):void {
    if (process.argv[0] === undefined || process.argv[1] === undefined) {
        error([
            "The copy command requires a source path and a destination path.",
            `Please execute ${vars.text.cyan + vars.terminal.command_instruction}commands copy${vars.text.none} for examples.`
        ], null);
        return;
    }
    const config:config_command_copy = {
        callback: function terminal_commands_interface_copy_callback(title:string, text:string[]):void {
            callback(title, text, null);
        },
        destination: resolve(process.argv[1]),
        exclusions: vars.terminal.exclusions,
        replace: process.argv.indexOf("replace") > -1,
        target: resolve(process.argv[0])
    };
    if (config.destination === "/") {
        config.destination = "/";
    } else {
        config.destination = config.destination + vars.path.sep;
    }
    copy(config);
};

export default interfaceCopy;