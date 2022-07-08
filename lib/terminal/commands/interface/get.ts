/* lib/terminal/commands/interface/get - Shell interface for http get command. */

import error from "../../utilities/error.js";
import get from "../library/get.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const interfaceGet = function terminal_commands_interface_get():void {
    const address:string = process.argv[0];
    if (address === undefined) {
        error([
            "The get command requires an address and that address must be in http/https scheme.",
            `Please execute ${vars.text.cyan + vars.terminal.command_instruction}commands get${vars.text.none} for examples.`
        ]);
        return;
    }
    if ((/^(https?:\/\/)/).test(address) === false) {
        error([
            `Address: ${vars.text.angry + address + vars.text.none}`,
            "The get command requires an address in http/https scheme.",
            `Please execute ${vars.text.cyan + vars.terminal.command_instruction}commands get${vars.text.none} for examples.`
        ], true);
        return;
    }
    get(address, function terminal_commands_inteface_get_callback(title:string, file:[Buffer|string]):void {
        log.title(title);
        log([file[0].toString()]);
    });
};

export default interfaceGet;