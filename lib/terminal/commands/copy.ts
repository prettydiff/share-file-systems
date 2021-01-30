
/* lib/terminal/commands/copy - A command driven utility to perform bit by bit file artifact copy. */
import { Stats } from "fs";
import { Stream, Writable } from "stream";

import common from "../../common/common.js";
import directory from "./directory.js";
import error from "../utilities/error.js";
import log from "../utilities/log.js";
import mkdir from "./mkdir.js";
import vars from "../utilities/vars.js";
import remove from "./remove.js";

// bit-by-bit copy stream for the file system
const copy = function terminal_commands_copy(params:nodeCopyParams):void {
    // parameters
    // * callback:Function - the instructions to execute when copy is complete
    // * destination:string - the file system location where to put the copied items
    // * exclusions:string[] - file system objects to exclude from copy
    // * target:string - the file system path of the source item
    if (vars.command === "copy" && (process.argv[0] === undefined || process.argv[1] === undefined)) {
        error([
            "The copy command requires a source path and a destination path.",
            `Please execute ${vars.text.cyan + vars.version.command} commands copy${vars.text.none} for examples.`
        ]);
        return;
    }
    const numb:copyStats  = {
            dirs : 0,
            error: 0,
            files: 0,
            link : 0,
            size : 0
        },
        testLog:copyLog = {
            file: true,
            link: true,
            mkdir: true
        },
        target:string = (vars.command === "copy")
            ? vars.node.path.resolve(process.argv[0])
            : vars.node.path.resolve(params.target),
        destination:string = (function terminal_commands_copy_destination():string {
            const source:string = (vars.command === "copy")
                ? vars.node.path.resolve(process.argv[1])
                : vars.node.path.resolve(params.destination);
            if (source === "/") {
                return "/";
            }
            return source + vars.sep;
        }()),
        dirCallback = function terminal_commands_copy_dirCallback(list:directoryList):void {
            let a:number = 0;
            const len:number = list.length,
                // identifies the absolution path apart from the item to copy
                prefix:string = (function terminal_commands_copy_dirCallback_prefix():string {
                    const dirs:string[] = list[0][0].split(vars.sep);
                    dirs.pop();
                    return dirs.join(vars.sep);
                }()),
                file = function terminal_commands_copy_dirCallback_file(source:directoryItem, path:string):void {
                    const readStream:Stream  = vars.node
                            .fs
                            .createReadStream(source[0]),
                        writeStream:Writable = vars.node
                            .fs
                            .createWriteStream(path, {mode: source[5].mode});
                    let errorFlag:boolean = false;
                    readStream.on("error", function terminal_commands_copy_dirCallback_file_readError(error:nodeError):void {
                        types(error.toString());
                        errorFlag = true;
                    });
                    if (errorFlag === false) {
                        writeStream.on("error", function terminal_commands_copy_dirCallback_file_writeError(error:nodeError):void {
                            types(error.toString());
                            errorFlag = true;
                        });
                        if (errorFlag === false) {
                            writeStream.on("open", function terminal_commands_copy_dirCallback_file_writeOpen():void {
                                readStream.pipe(writeStream);
                            });
                            writeStream.once("finish", function terminal_commands_copy_dirCallback_file_writeStream():void {
                                vars.node.fs.utimes(
                                    path,
                                    source[5].atime,
                                    source[5].mtime,
                                    function terminal_commands_copy_dirCallback_file_writeStream_callback():void {
                                        types(null);
                                    }
                                );
                            });
                        }
                    }
                },
                link = function terminal_commands_copy_dirCallback_link(source:string, path:string):void {
                    vars.node.fs.readLink(source, function terminal_commands_copy_dirCallback_link_readLink(linkError:nodeError, resolvedLink:string):void {
                        if (linkError === null) {
                            numb.link = numb.link + 1;
                            vars.node.fs.stat(resolvedLink, function terminal_commands_copy_dirCallback_link_readLink_stat(statError:nodeError, stat:Stats):void {
                                if (statError === null) {
                                    vars.node.fs.symlink(
                                        resolvedLink,
                                        path,
                                        stat.isDirectory() === true
                                            ? "junction"
                                            : "file",
                                        types
                                    );
                                    types(null);
                                } else {
                                    types(statError.toString());
                                }
                            });
                        } else {
                            types(linkError.toString());
                        }
                    });
                },
                pathStat = function terminal_commands_copy_dirCallback_pathStat(item:directoryItem):void {
                    // establish destination path
                    const path:string = destination + item[0].replace(prefix, "").replace(/^(\\|\/)/, "");
                    vars.node.fs.stat(path, function terminal_commands_copy_dirCallback_pathStat_stat(statError:nodeError):void {
                        const copyAction = function terminal_commands_copy_dirCallback_pathStat_stat_copyAction():void {
                            if (item[1] === "directory") {
                                numb.dirs = numb.dirs + 1;
                                if (testLog.mkdir === true) {
                                    testLog.mkdir = false;
                                    vars.testLogger("copy", "mkdir", `create first directory of copy: ${path}`);
                                }
                                mkdir(path, types, false);
                            } else if (item[1] === "file") {
                                numb.files = numb.files + 1;
                                numb.size = numb.size + item[5].size;
                                if (testLog.file === true) {
                                    testLog.file = false;
                                    vars.testLogger("copy", "file", `write first file of copy: ${path}`);
                                }
                                file(item, path);
                            } else if (item[1] === "link") {
                                if (testLog.link === true) {
                                    testLog.link = false;
                                    vars.testLogger("copy", "link", `write first symbolic link: ${path}`);
                                }
                                link(item[0], path);
                            } else if (item[1] === "error") {
                                types(`error on address ${item[0]} from library directory`);
                            }
                        };
                        if (item[0] === path) {
                            types(`file ${path} cannot be copied onto itself`);
                        } else if (statError === null) {
                            remove(path, copyAction);
                        } else {
                            if (statError.toString().indexOf("no such file or directory") > 0 || statError.code === "ENOENT") {
                                copyAction();
                            } else {
                                types(error.toString());
                            }
                        }
                    });
                },
                types = function terminal_commands_copy_dirCallback_types(typeError:string):void {
                    if (typeError !== null && typeError !== undefined) {
                        numb.error = numb.error + 1;
                        error([typeError]);
                    }
                    if (a === len) {
                        vars.testLogger("copy", "complete", `completion test for ${target}`);
                        params.callback([numb.files, numb.size]);
                    } else {
                        pathStat(list[a]);
                    }
                    a = a + 1;
                };
            
            list.sort(function terminal_commands_copy_dirCallback_sort(x:directoryItem, y:directoryItem):-1|1 {
                if (x[1] === "directory" && y[1] !== 'directory') {
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
        };
    if (vars.command === "copy") {
        vars.testLogger("copy", "command", "format output when the command is 'copy'.");
        if (vars.verbose === true) {
            log.title("Copy");
        }
        params = {
            callback: function terminal_commands_copy_callback():void {
                const out:string[] = [`${vars.version.name} copied `];
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
                vars.verbose = true;
                log([out.join(""), `Copied ${vars.text.cyan + target + vars.text.none} to ${vars.text.green + destination + vars.text.none}`]);
            },
            exclusions: vars.exclusions,
            destination: destination,
            target: target
        };
    }
    vars.node.fs.stat(params.destination, function terminal_commands_copy_stat(erStat:Error):void {
        if (erStat === null) {
            directory({
                callback: dirCallback,
                depth: 0,
                exclusions: params.exclusions,
                logRecursion: false,
                mode: "read",
                path: target,
                symbolic: true
            });
        } else {
            error([erStat.toString()]);
        }
    });
};

export default copy;