
import base64 from "./lib/terminal/commands/base64.js";
import build from "./lib/terminal/commands/build.js";
import commandName from "./lib/terminal/utilities/commandName.js";
import commands from "./lib/terminal/commands/commands.js";
import commands_documentation from "./lib/terminal/utilities/commands_documentation.js";
import copy from "./lib/terminal/commands/copy.js";
import directory from "./lib/terminal/commands/directory.js";
import error from "./lib/terminal/utilities/error.js";
import get from "./lib/terminal/commands/get.js";
import hash from "./lib/terminal/commands/hash.js";
import help from "./lib/terminal/commands/help.js";
import lint from "./lib/terminal/commands/lint.js";
import remove from "./lib/terminal/commands/remove.js";
import server from "./lib/terminal/commands/server.js";
import test from "./lib/terminal/commands/test.js";
import test_service from "./lib/terminal/commands/test_service.js";
import test_simulation from "./lib/terminal/commands/test_simulation.js";
import vars from "./lib/terminal/utilities/vars.js";
import version from "./lib/terminal/commands/version.js";

(function init() {
    const library = {
        base64: base64,
        build: build,
        commands: commands,
        copy: copy,
        directory: directory,
        error: error,
        get: get,
        hash: hash,
        help: help,
        lint: lint,
        remove: remove,
        server: server,
        test: test,
        test_service: test_service,
        test_simulation: test_simulation,
        version: version
    },
    execute = function node_execute():void {
        // command documentation
        vars.commands = commands_documentation;

        // supported command name
        vars.command = commandName();

        library[vars.command]();
    };
    vars.node.fs.stat(`${vars.projectPath}version.json`, function node_version(erStat:Error) {
        if (erStat === null) {
            vars.node.fs.readFile(`${vars.projectPath}version.json`, "utf8", function node_version_read(er:Error, versionFile:string):void {
                if (er !== null) {
                    library.error([er.toString()]);
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