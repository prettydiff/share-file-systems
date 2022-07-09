/* lib/terminal/commands/interface/mkdir - Shell interface to utility mkdir for creating directory structures recursively. */

import { resolve } from "path";

import error from "../../utilities/error.js";
import log from "../../utilities/log.js";
import mkdir from "../library/mkdir.js";
import vars from "../../utilities/vars.js";

const interfaceMkdir = function terminal_commands_interface_mkdir():void {
    const dir:string = resolve(process.argv[0]);
    if (dir === undefined) {
        error([
            "No directory name specified.",
            `See ${vars.text.cyan + vars.terminal.command_instruction} commands mkdir${vars.text.none} for examples.`
        ], true);
        process.exit(1);
        return;
    }
    mkdir(dir, function terminal_commands_interface_mkdir_callback(title:string, text:string[], fail:boolean):void {
        if (fail === true) {
            if (vars.settings.verbose === true) {
                log.title(title);
            }
            log(text, true);
        }
        if (vars.settings.verbose === true) {
            log.title(title);
            log([`Directory created at ${vars.text.cyan + dir + vars.text.none}`], true);
        }
    });
};

export default interfaceMkdir;