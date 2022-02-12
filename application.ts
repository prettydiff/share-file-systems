
/* lib/application - The entry point to the application. */

import { readFile, stat } from "fs";

import commandName from "./lib/terminal/utilities/commandName.js";
import commandList from "./lib/terminal/utilities/commandList.js";
import commands_documentation from "./lib/terminal/utilities/commands_documentation.js";
import error from "./lib/terminal/utilities/error.js";
import vars from "./lib/terminal/utilities/vars.js";

import disallowed from "./lib/common/disallowed.js";

(function terminal_init():void {
    // global
    vars.terminal.command_instruction = "node js/application ";
    // end global
    // supported command name
    vars.terminal.commands = commands_documentation(vars.terminal.command_instruction);
    vars.environment.command = commandName("") as commands;
    const execute = function terminal_init_execute():void {
            // command documentation
            commandList[vars.environment.command]();
        },
        version:string = `${vars.path.project}version.json`;
    disallowed(false);
    stat(version, function terminal_init_version(erStat:Error):void {
        if (erStat === null) {
            readFile(version, "utf8", function terminal_init_version_read(er:Error, versionFile:string):void {
                if (er === null) {
                    const data:version = JSON.parse(versionFile);
                    vars.environment.date = data.date;
                    vars.environment.git_hash = data.git_hash;
                    vars.environment.version = data.version;
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