
/* lib/terminal/commands/copy - A command driven utility to perform bit by bit file artifact copy. */

import { createReadStream, createWriteStream, readlink, stat, Stats, symlink, utimes } from "fs";
import { resolve } from "path";
import { Stream, Writable } from "stream";

import common from "../../common/common.js";
import directory from "./directory.js";
import error from "../utilities/error.js";
import log from "../utilities/log.js";
import mkdir from "./mkdir.js";
import remove from "./remove.js";
import rename from "../utilities/rename.js";
import vars from "../utilities/vars.js";

// bit-by-bit copy stream for the file system
const copy = function terminal_commands_copy(params:config_command_copy):void {
    // parameters
    // * callback:Function - the instructions to execute when copy is complete
    // * destination:string - the file system location where to put the copied items
    // * exclusions:string[] - file system objects to exclude from copy
    // * target:string - the file system path of the source item
    if (vars.environment.command === "copy" && (process.argv[0] === undefined || process.argv[1] === undefined)) {
        error([
            "The copy command requires a source path and a destination path.",
            `Please execute ${vars.text.cyan + vars.terminal.command_instruction}commands copy${vars.text.none} for examples.`
        ]);
        return;
    }
    let destination:string = (function terminal_commands_copy_destination():string {
            const source:string = (vars.environment.command === "copy")
                ? resolve(process.argv[1])
                : resolve(params.destination);
            if (source === "/") {
                return "/";
            }
            return source + vars.path.sep;
        }());
    const numb:copyStats  = {
            dirs : 0,
            error: 0,
            files: 0,
            link : 0,
            size : 0
        },
        // location where to read
        target:string = (vars.environment.command === "copy")
            ? resolve(process.argv[0])
            : resolve(params.target),
        // location where to write
        dirCallback = function terminal_commands_copy_dirCallback(dirList:directoryList|string[]):void {
            rename([dirList as directoryList], destination, function terminal_commands_copy_dirCallback_rename(renameError:NodeJS.ErrnoException, renameList:directoryList[]):void {
                if (renameError === null) {
                    const list:directoryList = renameList[0],
                        len:number = list.length,
                        prefix:string = (function terminal_commands_copy_dirCallback_prefix():string {
                            const dirs:string[] = list[0][0].split(vars.path.sep);
                            dirs.pop();
                            return dirs.join(vars.path.sep);
                        }()),
                        firstName:string = list[0][0].replace(prefix, "").replace(/^(\\|\/)/, ""),
                        // identifies the absolution path apart from the item to copy
                        file = function terminal_commands_copy_dirCallback_file(source:directoryItem, target:string):void {
                            const readStream:Stream  = createReadStream(source[0]),
                                writeStream:Writable = createWriteStream(target, {mode: source[5].mode});
                            let errorFlag:boolean = false;
                            readStream.on("error", function terminal_commands_copy_dirCallback_file_readError(error:Error):void {
                                types(error);
                                errorFlag = true;
                            });
                            if (errorFlag === false) {
                                writeStream.on("error", function terminal_commands_copy_dirCallback_file_writeError(error:Error):void {
                                    types(error);
                                    errorFlag = true;
                                });
                                if (errorFlag === false) {
                                    writeStream.on("open", function terminal_commands_copy_dirCallback_file_writeOpen():void {
                                        readStream.pipe(writeStream);
                                    });
                                    writeStream.once("finish", function terminal_commands_copy_dirCallback_file_writeStream():void {
                                        utimes(
                                            target,
                                            new Date(source[5].atimeMs),
                                            new Date(source[5].mtimeMs),
                                            function terminal_commands_copy_dirCallback_file_writeStream_callback():void {
                                                types(null);
                                            }
                                        );
                                    });
                                }
                            }
                        },
                        link = function terminal_commands_copy_dirCallback_link(source:string, path:string):void {
                            readlink(source, function terminal_commands_copy_dirCallback_link_readLink(linkError:Error, resolvedLink:string):void {
                                if (linkError === null) {
                                    numb.link = numb.link + 1;
                                    stat(resolvedLink, function terminal_commands_copy_dirCallback_link_readLink_stat(statError:Error, stat:Stats):void {
                                        if (statError === null) {
                                            symlink(
                                                resolvedLink,
                                                path,
                                                stat.isDirectory() === true
                                                    ? "junction"
                                                    : "file",
                                                types
                                            );
                                            types(null);
                                        } else {
                                            types(statError);
                                        }
                                    });
                                } else {
                                    types(linkError);
                                }
                            });
                        },
                        types = function terminal_commands_copy_dirCallback_types(typeError:Error):void {
                            if (typeError !== null && typeError !== undefined) {
                                numb.error = numb.error + 1;
                                error([typeError.toString()]);
                            }
                            if (a === len) {
                                params.callback(numb);
                            } else {
                                const path:string = (params.replace === true)
                                        ? list[a][0]
                                        : list[a][6],
                                    copyAction = function terminal_commands_copy_dirCallback_action_copyAction():void {
                                        if (list[a][1] === "directory") {
                                            numb.dirs = numb.dirs + 1;
                                            mkdir(path, types);
                                        } else if (list[a][1] === "file") {
                                            numb.files = numb.files + 1;
                                            numb.size = numb.size + list[a][5].size;
                                            file(list[a], path);
                                        } else if (list[a][1] === "link") {
                                            link(list[a][0], path);
                                        } else if (list[a][1] === "error") {
                                            numb.error = numb.error + 1;
                                            error([`error on address ${list[a][0]} from library directory`]);
                                        }
                                    };
                                // this logic where is overwrite avoidance occurs
                                if (params.replace === true) {
                                    remove(path, copyAction);
                                } else {
                                    copyAction();
                                }
                            }
                            a = a + 1;
                        };
                    let a:number = 0,
                        // newName is used to replace the root copy directory name when avoiding overwrite
                        newName:string = "";
                    
                    newName = firstName;
                    
                    list.sort(function terminal_commands_copy_dirCallback_sort(x:directoryItem, y:directoryItem):-1|1 {
                        if (x[1] === "directory" && y[1] !== "directory") {
                            return -1;
                        }
                        if (x[1] < y[1]) {
                            return -1;
                        }
                        if (x[1] === y[1] && x[0] < y[0]) {
                            return -1;
                        }
                        return 1;
                    });
                    types(null);
                } else {
                    error([JSON.stringify(renameError)]);
                }
            });
        };
    if (vars.environment.command === "copy") {
        if (vars.settings.verbose === true) {
            log.title("Copy");
        }
        params = {
            callback: function terminal_commands_copy_callback():void {
                const out:string[] = [`${vars.environment.name} copied `];
                out.push("");
                out.push(vars.text.green);
                out.push(vars.text.bold);
                out.push(String(numb.dirs));
                out.push(vars.text.none);
                out.push(" director");
                if (numb.dirs === 1) {
                    out.push("y, ");
                } else {
                    out.push("ies, ");
                }
                out.push(vars.text.green);
                out.push(vars.text.bold);
                out.push(String(numb.files));
                out.push(vars.text.none);
                out.push(" file");
                if (numb.files !== 1) {
                    out.push("s");
                }
                out.push(", ");
                out.push(vars.text.green);
                out.push(vars.text.bold);
                out.push(String(numb.link));
                out.push(vars.text.none);
                out.push(" symbolic link");
                if (numb.link !== 1) {
                    out.push("s");
                }
                out.push(", and ");
                out.push(vars.text.green);
                out.push(vars.text.bold);
                out.push(String(numb.error));
                out.push(vars.text.none);
                out.push(" error");
                if (numb.link !== 1) {
                    out.push("s");
                }
                out.push(" at ");
                out.push(vars.text.green);
                out.push(vars.text.bold);
                out.push(common.commas(numb.size));
                out.push(vars.text.none);
                out.push(" bytes.");
                vars.settings.verbose = true;
                log([out.join(""), `Copied ${vars.text.cyan + target + vars.text.none} to ${vars.text.green + destination + vars.text.none}`]);
            },
            destination: destination,
            exclusions: vars.terminal.exclusions,
            replace: true,
            target: target
        };
    }
    stat(params.destination, function terminal_commands_copy_stat(erStat:Error):void {
        const dirConfig:config_command_directory = {
            callback: dirCallback,
            depth: 0,
            exclusions: params.exclusions,
            mode: "read",
            path: target,
            symbolic: true
        };
        if (erStat === null) {
            directory(dirConfig);
        } else {
            mkdir(params.destination, function terminal_commands_copy_stat_mkdir():void {
                directory(dirConfig);
            });
        }
    });
};

export default copy;