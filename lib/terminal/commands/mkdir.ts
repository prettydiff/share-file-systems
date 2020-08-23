
/* lib/terminal/commands/mkdir - A utility for recursively creating directories in the file system. */
import { Stats } from "fs";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// makes specified directory structures in the local file system
const mkdir = function terminal_mkdir(dirToMake:string, callback:Function, logRecursion:boolean):void {
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
        };
    if (vars.command === "mkdir") {
        if (vars.verbose === true) {
            log.title("Make directories");
        }
        vars.testLogger("mkdir", "command", "preparing the directory utility for standard input/output");
        if (process.argv[0] === undefined) {
            log(["No directory name specified."]);
            process.exit(1);
            return;
        }
        dirToMake = process.argv[0];
        callback = function terminal_mkdir_callback() {
            if (vars.verbose === true) {
                log([`Directory created at ${vars.text.cyan + vars.node.path.resolve(dirToMake) + vars.text.none}`], true);
            }
        };
        logRecursion = false;
    }
    if (testLog.stat === true) {
        testLog.stat = false;
        vars.testLogger("mkdir", "stat", "determine if the specified path already exists");
    }
    vars.node.fs.stat(dirToMake, function terminal_mkdir_stat(err:nodeError, stats:Stats):void {
        let dirs   = [],
            ind    = 0,
            len    = 0,
            ers    = "";
        const recursiveStat = function terminal_mkdir_stat_recursiveStat():void {
            vars.node.fs.stat(
                dirs.slice(0, ind + 1).join(vars.sep),
                function terminal_mkdir_stat_recursiveStat_callback(errA:nodeError, statA:Stats):void {
                    let errAs:string = "";
                    ind = ind + 1;
                    if (errA !== null) {
                        errAs = errA.toString();
                        if (errAs.indexOf("no such file or directory") > 0 || errA.code === "ENOENT") {
                            vars.node.fs.mkdir(
                                dirs.slice(0, ind).join(vars.sep),
                                function terminal_mkdir_stat_recursiveStat_callback_mkdir(errB:Error):void {
                                    if (errB !== null && errB.toString().indexOf("file already exists") < 0) {
                                        error([errB.toString()]);
                                        return;
                                    }
                                    if (testLog.callback_mkdir === true) {
                                        testLog.callback_mkdir = false;
                                        vars.testLogger("mkdir", "callback_mkdir", "directory created and so perform the next recursive operation or execute callback");
                                    }
                                    if (ind < len) {
                                        terminal_mkdir_stat_recursiveStat();
                                    } else {
                                        callback();
                                    }
                                }
                            );
                            return;
                        }
                        if (errAs.indexOf("file already exists") < 0) {
                            error([errA.toString()]);
                            return;
                        }
                    }
                    if (statA.isFile() === true) {
                        error([`Destination directory, '${vars.text.cyan + dirToMake + vars.text.none}', is a file.`]);
                        return;
                    }
                    if (testLog.callback === true) {
                        testLog.callback = false;
                        vars.testLogger("mkdir", "recursiveStat_callback", "each recursive directory gets a new stat. When something already exists at the destination it will not be overwritten, so complete");
                    }
                    if (ind < len) {
                        terminal_mkdir_stat_recursiveStat();
                    } else {
                        callback();
                    }
                }
            );
        };
        if (err !== null) {
            ers = err.toString();
            if (ers.indexOf("no such file or directory") > 0 || err.code === "ENOENT") {
                dirs = dirToMake.split(vars.sep);
                if (dirs[0] === "") {
                    ind = ind + 1;
                }
                len = dirs.length;
                if (testLog.stat_ok === true) {
                    vars.testLogger("mkdir", "stat ok", "there is no problem with the stat so begin recursive operations");
                }
                recursiveStat();
                return;
            }
            if (ers.indexOf("file already exists") < 0) {
                error([err.toString()]);
                return;
            }
        }
        if (stats.isFile() === true) {
            vars.testLogger("mkdir", "stat file", "the specified path is a file so no directory will be written");
            error([`Destination directory, '${vars.text.cyan + dirToMake + vars.text.none}', is a file.`]);
            return;
        }
        callback();
    });
};

export default mkdir;