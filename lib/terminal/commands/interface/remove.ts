/* lib/terminal/commands/interface/remove - Shell interface for removing file system artifacts. */

import { resolve } from "path";

import error from "../../utilities/error.js";
import log from "../../utilities/log.js";
import remove from "../library/remove.js";
import vars from "../../utilities/vars.js";

const interfaceRemove = function terminal_commands_interface_remove():void {
    const pathItem:string = resolve(process.argv[0]);
    if (process.argv.length < 1) {
        error([
            "Command remove requires a file path",
            `${vars.text.cyan + vars.terminal.command_instruction}remove ../jsFiles${vars.text.none}`
        ]);
        return;
    }
    remove(pathItem, vars.terminal.exclusions, function terminal_commands_interface_remove_callback(title:string, text:string[]):void {
        if (vars.settings.verbose === true) {
            log.title(title);
            log(text, true);
        }
    });
};

export default interfaceRemove;