
/* lib/terminal/commands/commands - A command driven utility to list available commands and their respective documentation. */
import lists from "../utilities/lists.js";
import log from "../utilities/log.js";
import wrapIt from "../utilities/wrapIt.js";
import vars from "../utilities/vars.js";

// CLI commands documentation generator
const commands = function terminal_commands_commands():void {
        let index:number = 0;
        const keys:string[] = (process.argv[0] === "all")
                ? Object.keys(vars.terminal.commands)
                : [process.argv[0]],
            length:number = keys.length,
            named = function terminal_commands_commands_named():void {
                // specifically mentioned option
                const output:string[] = [],
                    comm:documentation_command_item = vars.terminal.commands[keys[index]],
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
                    log(output);
                    terminal_commands_commands_named();
                } else {
                    log(output, true);
                }
            };
        vars.settings.verbose = true;
        log.title("Commands");
        if (process.argv[0] !== "all" && vars.terminal.commands[process.argv[0]] === undefined) {
            // all commands in a list
            const listConfig:config_list = {
                empty_line: false,
                heading: "Commands",
                obj: vars.terminal.commands,
                property: "description",
                total: true
            };
            vars.settings.verbose = true;
            lists(listConfig);
        } else {
            named();
        }
    };

export default commands;