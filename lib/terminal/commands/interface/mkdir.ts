/* lib/terminal/commands/interface/mkdir - Shell interface to utility mkdir for creating directory structures recursively. */

import error from "../../utilities/error.js";
import mkdir from "../library/mkdir.js";
import node from "../../utilities/node.js";
import vars from "../../utilities/vars.js";

const interfaceMkdir = function terminal_commands_interface_mkdir(callback:commandCallback):void {
    const dir:string = node.path.resolve(process.argv[0]);
    if (dir === undefined) {
        error([
            "No directory name specified.",
            `See ${vars.text.cyan + vars.terminal.command_instruction} commands mkdir${vars.text.none} for examples.`
        ], null, true);
        process.exit(1);
        return;
    }
    mkdir(dir, function terminal_commands_interface_mkdir_callback(title:string, text:string[], fail:boolean):void {
        if (fail === true) {
            if (vars.settings.verbose === true) {
                callback(title, text, true);
            } else {
                callback("", text, true);
            }
        } else if (vars.settings.verbose === true) {
            callback(title, [`Directory created at ${vars.text.cyan + dir + vars.text.none}`], false);
        }
    });
};

export default interfaceMkdir;