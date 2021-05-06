

import commandName from "./lib/terminal/utilities/commandName.js";
import commandList from "./lib/terminal/utilities/commandList.js";
import commands_documentation from "./lib/terminal/utilities/commands_documentation.js";
import error from "./lib/terminal/utilities/error.js";
import vars from "./lib/terminal/utilities/vars.js";

import disallowed from "./lib/common/disallowed.js";

(function terminal_init():void {
    // global
    vars.command_instruction = "node js/application ";
    // end global
    // supported command name
    vars.commands = commands_documentation(vars.command_instruction);
    vars.command = commandName("") as commands;
    const execute = function terminal_init_execute():void {
            // command documentation
            commandList[vars.command]();
        },
        version:string = `${vars.projectPath}version.json`;
    disallowed(false);
    vars.node.fs.stat(version, function terminal_init_version(erStat:Error):void {
        if (erStat === null) {
            vars.node.fs.readFile(version, "utf8", function terminal_init_version_read(er:Error, versionFile:string):void {
                if (er === null) {
                    const data = JSON.parse(versionFile);
                    vars.date = data.date;
                    vars.git_hash = data.git_hash;
                    vars.version = data.version;
                    execute();
                    return;
                }
                error([er.toString()]);
                return;
            });
        } else {
            execute();
        }
    });
}());