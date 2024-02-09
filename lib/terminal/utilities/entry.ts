
/* lib/terminal/utilities/entry - The entry point to the application. */

import commandName from "./commandName.js";
import commandList from "./commandList.js";
import commands_documentation from "./commands_documentation.js";
import error from "./error.js";
import node from "./node.js";
import vars from "./vars.js";

import disallowed from "../../common/disallowed.js";

const entry = function terminal_utilities_entry(callback:commandCallback):void {
    // supported command name
    // global
    vars.terminal.command_instruction = "node ./js/lib/terminal/utilities/terminal ";
    // end global, build updates path
    vars.terminal.commands = commands_documentation(vars.terminal.command_instruction);
    vars.environment.command = commandName("") as commands;

    const execute = function terminal_utilities_entry_execute():void {
            // command documentation
            commandList[vars.environment.command](callback);
        },
        version:string = `${vars.path.project}version.json`;
    disallowed(false);
    node.fs.stat(version, function terminal_utilities_entry_version(erStat:node_error):void {
        if (erStat === null) {
            node.fs.readFile(version, "utf8", function terminal_utilities_entry_version_read(er:node_error, versionFile:string):void {
                if (er === null) {
                    const data:version = JSON.parse(versionFile) as version;
                    vars.environment.date = data.date;
                    vars.environment.dateRaw = data.mtime;
                    vars.environment.git_hash = data.git_hash;
                    vars.environment.version = data.version;
                    execute();
                    return;
                }
                error(["Error reading version.json file."], er);
                return;
            });
        } else {
            execute();
        }
    });
};

export default entry;