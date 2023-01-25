
/* lib/terminal/commands/library/remove - A command driven utility to recursively remove file system artifacts. */

import { rm, rmdir, unlink } from "fs";

import common from "../../../common/common.js";
import directory from "./directory.js";
import error from "../../utilities/error.js";
import vars from "../../utilities/vars.js";

// similar to posix "rm -rf" command
const remove = function terminal_commands_library_remove(filePath:string, exclusions:string[], callback:(title:string, text:string[]) => void):void {
        const numb:remove_count = {
                dirs: 0,
                file: 0,
                link: 0,
                size: 0
            },
            title:string = "Remove",
            summary = function terminal_commands_library_remove_summary():string[] {
                const out:string[] = [`${vars.environment.name} removed `];
                out.push(vars.text.angry);
                out.push(String(numb.dirs));
                out.push(vars.text.none);
                out.push(" director");
                if (numb.dirs === 1) {
                    out.push("y, ");
                } else {
                    out.push("ies, ");
                }
                out.push(vars.text.angry);
                out.push(String(numb.file));
                out.push(vars.text.none);
                out.push(" file");
                if (numb.dirs !== 1) {
                    out.push("s");
                }
                out.push(", ");
                out.push(vars.text.angry);
                out.push(String(numb.link));
                out.push(vars.text.none);
                out.push(" symbolic link");
                if (numb.link !== 1) {
                    out.push("s");
                }
                out.push(" at ");
                out.push(vars.text.angry);
                out.push(common.commas(numb.size));
                out.push(vars.text.none);
                out.push(" bytes.");
                return ["", out.join(""), `Removed ${vars.text.cyan + dirConfig.path + vars.text.none}`];
            },
            removeItems = function terminal_commands_library_remove_removeItems(dirTitle:string, text:string[], list:directory_list|string[]):void {
                // directory_list: [].failures
                // 0. absolute path (string)
                // 1. type (fileType)
                // 2. hash (string), empty string unless fileType is "file" and args.hash === true and be aware this is exceedingly slow on large directory trees
                // 3. parent index (number)
                // 4. child item count (number)
                // 5. selected properties from fs.Stat plus some link resolution data
                // 6. write path from the lib/utilities/rename library for file copy
                let a:number = 0;
                const fileList:directory_list = list as directory_list,
                    len:number = fileList.length,
                    destroy = function terminal_commands_library_remove_removeItems_destroy(item:directory_item):void {
                        let b:number = exclusions.length;
                        const destruction = function terminal_commands_library_remove_removeItems_destroy_destruction(er:NodeJS.ErrnoException):void {
                            // error handling
                            if (vars.settings.verbose === true && er !== null && er.toString().indexOf("no such file or directory") < 0) {
                                if (er.code === "ENOTEMPTY") {
                                    terminal_commands_library_remove_removeItems_destroy(item);
                                    return;
                                }
                                error(["Error removing file system artifact."], er);
                                return;
                            }

                            if (item[0] === fileList[0][0]) {
                                // done
                                if (callback !== null) {
                                    callback(title, summary());
                                }
                            } else {
                                // decrement the number of child items in a directory
                                fileList[item[3]][4] = fileList[item[3]][4] - 1;
                                // once a directory is empty, process the directory for removal
                                if (fileList[item[3]][4] < 1) {
                                    terminal_commands_library_remove_removeItems_destroy(fileList[item[3]]);
                                }
                            }
                        };
                        if (item[1] === "directory") {
                            // do not remove directories that contain exclusions
                            if (exclusions.length > 0) {
                                do {
                                    b = b - 1;
                                    if (exclusions[b].indexOf(item[0]) === 0) {
                                        destruction(null);
                                        return;
                                    }
                                } while (b < 0);
                                rmdir(item[0], destruction);
                            } else {
                                rmdir(item[0], destruction);
                            }
                        } else if (exclusions.indexOf(item[0]) < 0) {
                            if (item[1] === "link") {
                                rm(item[0], destruction);
                            } else {
                                unlink(item[0], destruction);
                            }
                        } else {
                            destruction(null);
                        }
                    };
                if (fileList.length < 1) {
                    if (callback !== null) {
                        callback(title, summary());
                    }
                    return;
                }
                do {
                    if (fileList[a][1] === "file") {
                        numb.file = numb.file + 1;
                        numb.size = numb.size + fileList[a][5].size;
                    } else if (fileList[a][1] === "directory") {
                        numb.dirs = numb.dirs + 1;
                    } else if (fileList[a][1] === "link") {
                        numb.link = numb.link + 1;
                    }
                    if ((fileList[a][1] === "directory" && fileList[a][4] === 0) || fileList[a][1] !== "directory") {
                        destroy(fileList[a]);
                    }
                    a = a + 1;
                } while (a < len);
            },
            dirConfig:config_command_directory = {
                callback: removeItems,
                depth: 0,
                exclusions: [],
                mode: "read",
                path: filePath,
                search: "",
                symbolic: true
            };
        directory(dirConfig);
    };

export default remove;