
/* lib/terminal/server/serverWatch - A library that establishes a file system watch respective to the application itself. */
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import log from "../utilities/log.js";
import time from "../utilities/time.js";
import vars from "../utilities/vars.js";

import serverVars from "./serverVars.js";

const serverWatch = function terminal_server_serverWatch(type:"rename"|"change", filename:string|null):void {
    const extension:string = (function terminal_server_serverWatch_extension():string {
            if (filename === null) {
                return "";
            }
            const list = filename.split(".");
            return list[list.length - 1];
        }()),
        ignore   = function terminal_server_serverWatch_ignore(input:string|null):boolean {
            if (input.indexOf(".git") === 0) {
                return true;
            }
            if (input.indexOf("node_modules") === 0) {
                return true;
            }
            if (input.indexOf("js") === 0) {
                return true;
            }
            return false;
        };
    if (filename === null || ignore(filename) === true || filename.indexOf(`lib${vars.sep}storage`) === 0 || filename.indexOf(".git") === 0) {
        return;
    }
    vars.testLogger("serverWatch", "", "Establishing watch for application components to refresh the page or compile updated code.");
    if (extension === "ts" && serverVars.timeStore < Date.now() - 1000) {
        const timeStart:[string, number] = time(`Compiling for ${vars.text.green + filename + vars.text.none}`, false, serverVars.timeStore);
        
        log(["", timeStart[0]]);
        serverVars.timeStore = timeStart[1];
        vars.node.child(`${vars.version.command} build incremental`, {
            cwd: vars.projectPath
        }, function terminal_server_watch_child(err:Error, stdout:string, stderr:string):void {
            if (err !== null) {
                error([err.toString()]);
                return;
            }
            if (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0) {
                error([stderr]);
                return;
            }
            const output:string[] = [];
            output.push(time("TypeScript Compiled", false, serverVars.timeStore)[0]);
            output.push(time("Total Compile Time", true, serverVars.timeStore)[0]);
            log([stdout]);
            log(output);
            vars.broadcast("reload", "");
            return;
        });
    } else if (extension === "css" || extension === "xhtml") {
        vars.broadcast("reload", "");
    } else {
        const fsUpdateCallback = function terminal_server_serverWatch_fsUpdateCallback(result:directoryList):void {
                if (serverVars.testBrowser === null) {
                    vars.broadcast("fs-update-local", JSON.stringify(result));
                }
            },
            dirConfig:readDirectory = {
                callback: fsUpdateCallback,
                depth: 2,
                exclusions: [],
                logRecursion: false,
                mode: "read",
                path: vars.projectPath,
                symbolic: true
            };
        directory(dirConfig);
    }
};

export default serverWatch;