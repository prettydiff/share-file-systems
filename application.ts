

import commandName from "./lib/terminal/utilities/commandName.js";
import commandList from "./lib/terminal/utilities/commandList.js";
import commands_documentation from "./lib/terminal/utilities/commands_documentation.js";
import error from "./lib/terminal/utilities/error.js";
import vars from "./lib/terminal/utilities/vars.js";

(function init() {
    const execute = function node_execute():void {
        // command documentation
        vars.commands = commands_documentation;

        // supported command name
        vars.command = commandName();

        commandList[vars.command]();
    };
    vars.node.fs.stat(`${vars.projectPath}version.json`, function node_version(erStat:Error) {
        if (erStat === null) {
            vars.node.fs.readFile(`${vars.projectPath}version.json`, "utf8", function node_version_read(er:Error, versionFile:string):void {
                if (er !== null) {
                    error([er.toString()]);
                    return;
                }
                vars.version = JSON.parse(versionFile);
                execute();
            });
        } else {
            execute();
        }
    });
}());