
/* lib/terminal/utilities/entry - The entry point to the application. */

import { readFile, stat } from "fs";

import commandName from "./commandName.js";
import commandList from "./commandList.js";
import commands_documentation from "./commands_documentation.js";
import error from "./error.js";
import vars from "./vars.js";

import disallowed from "../../common/disallowed.js";

const entry = function terminal_entry(callback:(title:string, text:string[]) => void):void {
    // global
    vars.terminal.command_instruction = "node js/lib/terminal/utilities/terminal ";
    // end global, build updates path
    // supported command name
    vars.terminal.commands = commands_documentation(vars.terminal.command_instruction);
    vars.environment.command = commandName("") as commands;
    const execute = function terminal_init_execute():void {
            // command documentation
            commandList[vars.environment.command](callback);
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
};

export default entry;