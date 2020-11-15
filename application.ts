

import commandName from "./lib/terminal/utilities/commandName.js";
import commandList from "./lib/terminal/utilities/commandList.js";
import commands_documentation from "./lib/terminal/utilities/commands_documentation.js";
import error from "./lib/terminal/utilities/error.js";
import vars from "./lib/terminal/utilities/vars.js";

(function terminal_init() {
    const execute = function terminal_init_execute():void {
            // command documentation
            vars.commands = commands_documentation;

            // supported command name
            vars.command = commandName();

            commandList[vars.command]();
        },
        version:string = `${vars.projectPath}version.json`;
    vars.node.fs.stat(version, function terminal_init_version(erStat:Error) {
        if (erStat === null) {
            vars.node.fs.readFile(version, "utf8", function terminal_init_version_read(er:Error, versionFile:string):void {
                if (er !== null) {
                    error([er.toString()]);
                    return;
                }
                if (versionFile !== "") {
                    vars.version = JSON.parse(versionFile);
                }
                execute();
            });
        } else {
            execute();
        }
    });
}());