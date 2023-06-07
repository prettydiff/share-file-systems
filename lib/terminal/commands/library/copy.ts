
/* lib/terminal/commands/library/copy - A command driven utility to perform bit by bit file artifact copy. */

import common from "../../../common/common.js";
import directory from "./directory.js";
import error from "../../utilities/error.js";
import mkdir from "./mkdir.js";
import node from "../../utilities/node.js";
import rename from "../../utilities/rename.js";
import vars from "../../utilities/vars.js";
import writeStream from "../../utilities/writeStream.js";

// bit-by-bit copy stream for the file system
const copy = function terminal_commands_library_copy(params:config_command_copy):void {
    // parameters
    // * callback:Function - the instructions to execute when copy is complete
    // * destination:string - the file system location where to put the copied items
    // * exclusions:string[] - file system objects to exclude from copy
    // * target:string - the file system path of the source item
    const numb:copy_stats  = {
            dirs : 0,
            error: 0,
            files: 0,
            link : 0,
            size : 0
        },
        // location where to write
        dirCallback = function terminal_commands_library_copy_dirCallback(title:string, text:[string, number], dirList:directory_list|string[]):void {
            const renameConfig:config_rename = {
                    callback: function terminal_commands_library_copy_dirCallback_renameCallback(renameError:NodeJS.ErrnoException, renameList:directory_list[]):void {
                        if (renameError === null) {
                            const list:directory_list = renameList[0],
                                len:number = list.length,
                                // identifies the absolution path apart from the item to copy
                                link = function terminal_commands_library_copy_dirCallback_renameCallback_link(source:string, path:string):void {
                                    node.fs.readlink(source, function terminal_commands_library_copy_dirCallback_renameCallback_link_readLink(linkError:Error, resolvedLink:string):void {
                                        if (linkError === null) {
                                            numb.link = numb.link + 1;
                                            node.fs.stat(resolvedLink, function terminal_commands_library_copy_dirCallback_renameCallback_link_readLink_stat(statError:Error, stat:node_fs_Stats):void {
                                                if (statError === null) {
                                                    node.fs.symlink(
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
                                mkdirCallback = function terminal_commands_library_copy_dirCallback_renameCallback_mkdirCallback(title:string, text:string[], fail:boolean):void {
                                    const errorText:Error = (fail === true)
                                        ? JSON.parse(text[0]) as Error
                                        : null;
                                    types(errorText);
                                },
                                types = function terminal_commands_library_copy_dirCallback_renameCallback_types(typeError:NodeJS.ErrnoException):void {
                                    if (typeError === null) {
                                        if (a === len) {
                                            const text:string[] = [`${vars.environment.name} copied `],
                                                title:string = "Copy";
                                            text.push("");
                                            text.push(vars.text.green);
                                            text.push(vars.text.bold);
                                            text.push(String(numb.dirs));
                                            text.push(vars.text.none);
                                            text.push(" director");
                                            if (numb.dirs === 1) {
                                                text.push("y, ");
                                            } else {
                                                text.push("ies, ");
                                            }
                                            text.push(vars.text.green);
                                            text.push(vars.text.bold);
                                            text.push(String(numb.files));
                                            text.push(vars.text.none);
                                            text.push(" file");
                                            if (numb.files !== 1) {
                                                text.push("s");
                                            }
                                            text.push(", ");
                                            text.push(vars.text.green);
                                            text.push(vars.text.bold);
                                            text.push(String(numb.link));
                                            text.push(vars.text.none);
                                            text.push(" symbolic link");
                                            if (numb.link !== 1) {
                                                text.push("s");
                                            }
                                            text.push(", and ");
                                            text.push(vars.text.green);
                                            text.push(vars.text.bold);
                                            text.push(String(numb.error));
                                            text.push(vars.text.none);
                                            text.push(" error");
                                            if (numb.link !== 1) {
                                                text.push("s");
                                            }
                                            text.push(" at ");
                                            text.push(vars.text.green);
                                            text.push(vars.text.bold);
                                            text.push(common.commas(numb.size));
                                            text.push(vars.text.none);
                                            text.push(" bytes.");
                                            params.callback(title, [text.join(""), `Copied ${vars.text.cyan + params.target + vars.text.none} to ${vars.text.green + params.destination + vars.text.none}`], numb);
                                        } else {
                                            const copyAction = function terminal_commands_library_copy_dirCallback_renameCallback_action_copyAction():void {
                                                if (list[a][1] === "directory") {
                                                    numb.dirs = numb.dirs + 1;
                                                    mkdir(list[a][6], mkdirCallback);
                                                } else if (list[a][1] === "file") {
                                                    numb.files = numb.files + 1;
                                                    numb.size = numb.size + list[a][5].size;
                                                    writeStream({
                                                        callback: terminal_commands_library_copy_dirCallback_renameCallback_types,
                                                        destination: list[a][6],
                                                        source: list[a][0],
                                                        stat: list[a][5]
                                                    });
                                                } else if (list[a][1] === "link") {
                                                    link(list[a][0], list[a][6]);
                                                } else if (list[a][1] === "error") {
                                                    numb.error = numb.error + 1;
                                                    error([`Error on address ${list[a][0]} from library directory`], null);
                                                }
                                            };

                                            copyAction();
                                        }
                                    } else if (vars.test.type.indexOf("browser") < 0) {
                                        numb.error = numb.error + 1;
                                        error([`Error copying artifact ${list[a][0]}`], typeError);
                                    }
                                    a = a + 1;
                                };
                            let a:number = 0;
                            
                            list.sort(function terminal_commands_library_copy_dirCallback_renameCallback_sort(x:directory_item, y:directory_item):-1|1 {
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
                            error([], renameError);
                        }
                    },
                    destination: params.destination,
                    list: [dirList as directory_list],
                    replace: params.replace
                };
                rename(renameConfig);
            };
    node.fs.stat(params.destination, function terminal_commands_library_copy_stat(erStat:Error):void {
        const dirConfig:config_command_directory = {
            callback: dirCallback,
            depth: 0,
            exclusions: params.exclusions,
            mode: "read",
            path: params.target,
            search: "",
            symbolic: true
        };
        if (erStat === null) {
            directory(dirConfig);
        } else {
            mkdir(params.destination, function terminal_commands_library_copy_stat_mkdir():void {
                directory(dirConfig);
            });
        }
    });
};

export default copy;