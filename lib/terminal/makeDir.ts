
import { Stats } from "fs";

import error from "./error.js";
import vars from "./vars.js";

// makes specified directory structures in the local file system
const makeDir = function terminal_makeDir(dirToMake:string, callback:Function):void {
    vars
        .node
        .fs
        .stat(dirToMake, function terminal_makeDir_stat(err:nodeError, stats:Stats):void {
            let dirs   = [],
                ind    = 0,
                len    = 0,
                ers    = "";
            const recursiveStat = function terminal_makeDir_stat_recursiveStat():void {
                    vars
                        .node
                        .fs
                        .stat(
                            dirs.slice(0, ind + 1).join(vars.sep),
                            function terminal_makeDir_stat_recursiveStat_callback(errA:nodeError, statA:Stats):void {
                                let errAs:string = "";
                                ind = ind + 1;
                                if (errA !== null) {
                                    errAs = errA.toString();
                                    if (errAs.indexOf("no such file or directory") > 0 || errA.code === "ENOENT") {
                                        vars
                                            .node
                                            .fs
                                            .mkdir(
                                                dirs.slice(0, ind).join(vars.sep),
                                                function terminal_makeDir_stat_recursiveStat_callback_mkdir(errB:Error):void {
                                                    if (errB !== null && errB.toString().indexOf("file already exists") < 0) {
                                                        error([errB.toString()]);
                                                        return;
                                                    }
                                                    if (ind < len) {
                                                        terminal_makeDir_stat_recursiveStat();
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
                                if (ind < len) {
                                    terminal_makeDir_stat_recursiveStat();
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
                    recursiveStat();
                    return;
                }
                if (ers.indexOf("file already exists") < 0) {
                    error([err.toString()]);
                    return;
                }
            }
            if (stats.isFile() === true) {
                error([`Destination directory, '${vars.text.cyan + dirToMake + vars.text.none}', is a file.`]);
                return;
            }
            callback();
        });
};

export default makeDir;