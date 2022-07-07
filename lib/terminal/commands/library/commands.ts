
/* lib/terminal/commands/library/commands - Utility to list available commands and their respective documentation. */
import lists from "../../utilities/lists.js";
import wrapIt from "../../utilities/wrapIt.js";
import vars from "../../utilities/vars.js";

// CLI commands documentation generator
const commands = function terminal_commands_library_commands(name:string, callback:(title:string, text:string[]) => void):void {
    let index:number = 0;
    const keys:string[] = (name === "all")
            ? Object.keys(vars.terminal.commands)
            : [name],
        length:number = keys.length,
        title:string = "Commands",
        output:string[] = [],
        named = function terminal_commands_library_commands_named():void {
            // specifically mentioned option
            const comm:documentation_command_item = vars.terminal.commands[keys[index]],
                len:number = comm.example.length;
            let a:number = 0;
            output.push(vars.text.green + vars.text.bold + keys[index] + vars.text.none);
            wrapIt(output, comm.description);
            output.push("");
            do {
                wrapIt(output, `${vars.text.angry}*${vars.text.none} ${comm.example[a].defined}`);
                output.push(`   ${vars.text.cyan + comm.example[a].code + vars.text.none}`);
                output.push("");
                a = a + 1;
            } while (a < len);
            index = index + 1;
            if (index < length) {
                if (length > 1) {
                    output.push("");
                    output.push("---");
                    output.push("");
                }
                terminal_commands_library_commands_named();
            } else {
                callback(title, output);
            }
        };
    if (name === null) {
        // all commands in a list
        const listConfig:config_list = {
            empty_line: false,
            heading: "Commands",
            obj: vars.terminal.commands,
            property: "description",
            total: true
        };
        lists(listConfig);
    } else {
        // command documentation by command name
        named();
    }
};

export default commands;