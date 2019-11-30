
import base64 from "./lib/terminal/base64.js";
import build from "./lib/terminal/build.js";
import command from "./lib/terminal/commandName.js";
import commands from "./lib/terminal/commands.js";
import commands_documentation from "./lib/terminal/commands_documentation.js";
import copy from "./lib/terminal/copy.js";
import directory from "./lib/terminal/directory.js";
import error from "./lib/terminal/error.js";
import get from "./lib/terminal/get.js";
import hash from "./lib/terminal/hash.js";
import help from "./lib/terminal/help.js";
import lint from "./lib/terminal/lint.js";
import remove from "./lib/terminal/remove.js";
import restart from "./lib/terminal/restart.js";
import server from "./lib/terminal/server.js";
import simulation from "./lib/terminal/simulation.js";
import test from "./lib/terminal/test.js";
import vars from "./lib/terminal/vars.js";
import version from "./lib/terminal/version.js";

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
        restart: restart,
        server: server,
        simulation: simulation,
        test: test,
        version: version
    };
    vars.node.fs.readFile(`${vars.projectPath}version.json`, "utf8", function node_version(er:Error, versionFile:string):void {
        if (er !== null) {
            library.error([er.toString()]);
            return;
        }
        
        vars.version = JSON.parse(versionFile);

        // command documentation
        vars.commands = commands_documentation;
        // supported command name
        vars.command = command();

        library[vars.command]();
    });
}());