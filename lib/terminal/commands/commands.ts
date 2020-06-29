
/* lib/terminal/commands/commands - A command driven utility to list available commands and their respective documentation. */
import lists from "../utilities/lists.js";
import log from "../utilities/log.js";
import wrapIt from "../utilities/wrapIt.js";
import vars from "../utilities/vars.js";

// CLI commands documentation generator
const commands = function terminal_commands():void {
        let index:number = 0;
        const keys:string[] = (process.argv[0] === "all")
                ? Object.keys(vars.commands)
                : [process.argv[0]],
            length:number = keys.length,
            named = function terminal_commands_named():void {
                // specifically mentioned option
                const output:string[] = [],
                    comm:any = vars.commands[keys[index]],
                    len:number = comm.example.length,
                    plural:string = (len > 1)
                        ? "s"
                        : "";
                let a:number = 0;
                output.push(comm.description);
                output.push("");
                output.push(`${vars.text.underline}Example${plural + vars.text.none}`);
                do {
                    wrapIt(output, comm.example[a].defined);
                    output.push(`   ${vars.text.cyan + comm.example[a].code + vars.text.none}`);
                    output.push("");
                    a = a + 1;
                } while (a < len);
                vars.testLogger("commands", "named", "a specific command with code examples.");
                index = index + 1;
                if (index < length) {
                    if (length > 1) {
                        output.push("");
                        output.push("---");
                        output.push("");
                    }
                    log(output);
                    terminal_commands_named();
                } else {
                    log(output, true);
                }
            };
        vars.verbose = true;
        log.title("Commands");
        if (process.argv[0] !== "all" && vars.commands[process.argv[0]] === undefined) {
            // all commands in a list
            const listConfig:nodeLists = {
                empty_line: false,
                heading: "Commands",
                obj: vars.commands,
                property: "description",
                total: true
            };
            vars.verbose = true;
            vars.testLogger("commands", "all", "all commands in a list.");
            lists(listConfig);
        } else {
            named();
        }
    };

export default commands;