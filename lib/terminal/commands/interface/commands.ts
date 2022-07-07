/* lib/terminal/commands/interface/commands - Shell interface for generating dynamic command documentation. */

import commands from "../library/commands.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const interfaceCommands = function terminal_commands_interface_commands():void {
    const lower:string = (process.argv[0] === undefined)
            ? null
            : process.argv[0].toLowerCase(),
        name:string = (lower === "all")
            ? "all"
            : (vars.terminal.commands[lower] === undefined)
                ? null
                : lower;
    vars.settings.verbose = true;
    commands(name, function terminal_commands_interface_commands_callback(title:string, text:string[]):void {
        log.title(title);
        log(text, true);
    });
};

export default interfaceCommands;