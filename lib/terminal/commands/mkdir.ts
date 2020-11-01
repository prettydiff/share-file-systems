
/* lib/terminal/commands/mkdir - A utility for recursively creating directories in the file system. */
import { Stats } from "fs";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// makes specified directory structures in the local file system
const mkdir = function terminal_commands_mkdir(dirToMake:string, callback:Function, logRecursion:boolean):void {
    let ind:number = 0;
    const testLog = (logRecursion === true)
            ? {
                callback: true,
                callback_mkdir: true,
                stat: true,
                stat_ok: true
            }
            : {
                callback: false,
                callback_mkdir: false,
                stat: false,
                stat_ok: false
            },
        dir:string = (vars.command === "mkdir")
            ? vars.node.path.resolve(process.argv[0])
            : vars.node.path.resolve(dirToMake),
        dirs:string[] = dir.split(vars.sep),
        len:number = dirs.length,
        errorHandler = function terminal_commands_mkdir_errorHandler(errorInstance:nodeError, statInstance:Stats, errorCallback:() => void):void {
            if (errorInstance !== null) {
                if (errorInstance.toString().indexOf("no such file or directory") > 0 || errorInstance.code === "ENOENT") {
                    errorCallback();
                    return;
                }
                error([errorInstance.toString()]);
                return;
            }

            if (statInstance.isDirectory() === true) {
                recursiveStat();
                return;
            }

            const type:string = (statInstance.isFile() === true)
                ? "file"
                : (statInstance.isSymbolicLink() === true)
                    ? "symbolic link"
                    : (statInstance.isCharacterDevice() === true)
                        ? "character device"
                        : (statInstance.isFIFO() === true)
                            ? "FIFO"
                            : (statInstance.isSocket() === true)
                                ? "socket"
                                : "unknown file system object";
            vars.testLogger("mkdir", "stat file", `the specified path is a ${type} so no directory will be written`);
            error([`Destination directory, '${vars.text.cyan + dir + vars.text.none}', is a ${type}.`]);
            return;
        },
        recursiveStat = function terminal_commands_mkdir_recursiveStat():void {
            ind = ind + 1;
            const target:string = dirs.slice(0, ind).join(vars.sep);
            vars.node.fs.stat(
                target,
                function terminal_commands_mkdir_recursiveStat_callback(errA:nodeError, statA:Stats):void {
                    errorHandler(errA, statA, function terminal_commands_mkdir_recursiveStat_callback_errorHandler():void {
                        if (testLog.callback === true) {
                            testLog.callback = false;
                            vars.testLogger("mkdir", "recursiveStat_callback", "each recursive directory gets a new stat. When something already exists at the destination it will not be overwritten, so complete");
                        }
                        vars.node.fs.mkdir(
                            target,
                            function terminal_mkdir_recursiveStat_callback_errorHandler_mkdir(errB:Error):void {
                                if (errB !== null && errB.toString().indexOf("file already exists") < 0) {
                                    error([errB.toString()]);
                                    return;
                                }
                                if (testLog.callback_mkdir === true) {
                                    testLog.callback_mkdir = false;
                                    vars.testLogger("mkdir", "callback_mkdir", "directory created and so perform the next recursive operation or execute callback");
                                }
                                if (ind === len) {
                                    callback();
                                } else {
                                    terminal_commands_mkdir_recursiveStat();
                                }
                            }
                        );
                    });
                }
            );
        };
    if (vars.command === "mkdir") {
        if (vars.verbose === true) {
            log.title("Make directories");
        }
        vars.testLogger("mkdir", "command", "preparing the directory utility for standard input/output");
        if (process.argv[0] === undefined) {
            error(["No directory name specified."]);
            process.exit(1);
            return;
        }
        callback = function terminal_commands_mkdir_callback() {
            if (vars.verbose === true) {
                log([`Directory created at ${vars.text.cyan + dir + vars.text.none}`], true);
            }
        };
        logRecursion = false;
    }
    if (testLog.stat === true) {
        testLog.stat = false;
        vars.testLogger("mkdir", "stat", "determine if the specified path already exists");
    }
    if (dirs[0] === "") {
        ind = ind + 1;
    }
    recursiveStat();
};

export default mkdir;