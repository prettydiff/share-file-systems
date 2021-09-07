
/* lib/terminal/commands/directory - A command driven utility to walk the file system and return a data structure. */

import { exec } from "child_process";
import { lstat, readdir, realpath, stat, Stats } from "fs";
import { resolve } from "path";

import common from "../../common/common.js";
import hash from "./hash.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// similar to node's fs.readdir, but recursive
const directory = function terminal_commands_directory(parameters:readDirectory):void {
        // arguments:
        // * callback - function - the output is passed into the callback as an argument
        // * depth - number - how many directories deep a recursive scan should read, 0 = full recursion
        // * hash - boolean - whether file types should be hashed
        // * exclusions - string array - a list of items to exclude
        // * path - string - where to start in the local file system
        // * symbolic - boolean - if symbolic links should be identified
        // -
        // output: [].failures
        // 0. absolute path (string)
        // 1. type (string)
        // 2. hash (string), empty string unless type is "file" and args.hash === true and be aware this is exceedingly slow on large directory trees
        // 3. parent index (number)
        // 4. child item count (number)
        // 5. selected properties from fs.Stat plus some link resolution data
        // * property "failures" is a list of file paths that could not be read or opened
        let dirTest:boolean = false,
            size:number = 0,
            dirs:number = 0,
            longest:number = 0,
            searchType:searchType,
            search:string,
            startItem:string;
        const args:readDirectory = (vars.command === "directory")
                ? {
                    callback: function terminal_commands_directory_callback(result:directoryList|string[]):void {
                        const count:number = result.length,
                            output:string[] = (args.mode === "list")
                            ? <string[]>result
                            : [];
                        if (args.mode === "list") {
                            let a:number = count,
                                item:string;
                            const size = function terminal_commands_directory_callback_size(comma:string):string {
                                let difference:number = longest - comma.length;
                                if (difference > 0) {
                                    do {
                                        difference = difference - 1;
                                        comma = ` ${comma}`;
                                    } while (difference > 0);
                                }
                                return comma;
                            };
                            do {
                                a = a - 1;
                                item = result[a] as string;
                                result[a] = item.replace(/\d+(,\d+)*/, size);
                            } while (a > 0);
                        }
                        if (vars.verbose === true) {
                            if (args.mode !== "list") {
                                output.push(JSON.stringify(result));
                            }
                            output.push("");
                            output.push(`${vars.name} found ${vars.text.green + common.commas(count) + vars.text.none} matching items from address:`);
                            output.push(vars.text.cyan + args.path + vars.text.none);
                            output.push(`Total file size of ${vars.text.green + common.commas(size) + vars.text.none} bytes and ${vars.text.angry + common.commas(list.failures.length) + vars.text.none} errors.`);
                            log(output, true);
                        } else if (args.mode === "list") {
                            log(<string[]>result);
                        } else {
                            log([JSON.stringify(result)]);
                        }
                    },
                    depth: (function terminal_commands_directory_depth():number {
                        let b:number = 0;
                        do {
                            if ((/^depth:\d+$/).test(process.argv[b]) === true) {
                                const depth:number = Number(process.argv[b].replace("depth:", ""));
                                process.argv.splice(b, 1);
                                return depth;
                            }
                            b = b + 1;
                        } while (b < process.argv.length);
                        return 0;
                    }()),
                    exclusions: vars.exclusions,
                    mode: (function terminal_commands_directory_mode():directoryMode {
                        let b:number = 0;
                        do {
                            if ((/^mode:/).test(process.argv[b]) === true) {
                                if (process.argv[b].indexOf("array") > 0) {
                                    process.argv.splice(b, 1);
                                    return "array";
                                }
                                if (process.argv[b].indexOf("hash") > 0) {
                                    process.argv.splice(b, 1);
                                    return "hash";
                                }
                                if (process.argv[b].indexOf("list") > 0) {
                                    process.argv.splice(b, 1);
                                    return "list";
                                }
                                if (process.argv[b].indexOf("read") > 0) {
                                    process.argv.splice(b, 1);
                                    return "read";
                                }
                            }
                            if ((/^search:/).test(process.argv[b]) === true) {
                                search = process.argv[b].replace("search:", "");
                                if ((search.charAt(0) === "\"" && search.charAt(search.length - 1) === "\"") || (search.charAt(0) === "'" && search.charAt(search.length - 1) === "'")) {
                                    search = search.slice(1, search.length - 1);
                                }
                                process.argv.splice(b, 1);
                                return "search";
                            }
                            if (process.argv[b] === "array") {
                                process.argv.splice(b, 1);
                                return "array";
                            }
                            if (process.argv[b] === "hash") {
                                process.argv.splice(b, 1);
                                return "hash";
                            }
                            if (process.argv[b] === "list") {
                                process.argv.splice(b, 1);
                                return "list";
                            }
                            if (process.argv[b] === "read") {
                                process.argv.splice(b, 1);
                                return "read";
                            }
                            b = b + 1;
                        } while (b < process.argv.length);
                        return "read";
                    }()),
                    path: "",
                    symbolic: (function terminal_commands_directory_symbolic():boolean {
                        const symbol:number = process.argv.indexOf("symbolic");
                        if (symbol < 0) {
                            return false;
                        }
                        process.argv.splice(symbol, 1);
                        return true;
                    }())
                }
                : parameters,
            dirCount:number[] = [],
            dirNames:string[] = [],
            relative:boolean = (function terminal_commands_directory_relative():boolean {
                const relIndex:number = process.argv.indexOf("relative");
                if (relIndex < 0) {
                    return false;
                }
                process.argv.splice(relIndex, 1);
                return true;
            }()),
            type:boolean = (function terminal_commands_directory_type():boolean {
                const typeIndex:number = process.argv.indexOf("typeof");
                if (vars.command === "directory" && typeIndex > -1) {
                    process.argv.splice(typeIndex, 1);
                    return true;
                }
                return false;
            }()),
            list:directoryList = [],
            fileList:string[] = [],
            method:(filePath:string, callback:(er:Error, stat:Stats) => void) => void = (args.symbolic === true)
                ? lstat
                : stat,
            sort = function terminal_commands_directory_sort():string[] {
                if (vars.sep === "\\") {
                    fileList.sort(function terminal_commands_directory_sort_sortFunction(a:string, b:string):-1|1 {
                        if (a.toLowerCase() < b.toLowerCase()) {
                            return -1;
                        }
                        return 1;
                    });
                } else {
                    fileList.sort();
                }
                if (args.path === vars.sep) {
                    const index:number = fileList.indexOf(vars.sep);
                    fileList.splice(index, 1);
                    fileList.splice(0, 0, vars.sep);
                }
                return fileList;
            },
            dirCounter = function terminal_commands_directory_dirCounter(item:string):void {
                let dirList:string[] = item.split(vars.sep),
                    dirPath:string = "",
                    index:number = 0;
                dirList.pop();
                dirPath = dirList.join(vars.sep);
                if ((/^\w:$/).test(dirPath) === true) {
                    dirPath = `${dirPath}\\`;
                } else if (dirPath === "") {
                    dirPath = vars.sep;
                }
                index = dirNames.indexOf(dirPath);
                if (index < 0 && args.path === "\\" && (/^\w:\\$/).test(dirPath) === true) {
                    index = 0;
                }
                dirCount[index] = dirCount[index] - 1;
                if (dirNames.length === 0 && item === args.path) {
                    // empty directory, nothing to traverse
                    if (args.mode === "array") {
                        args.callback(sort());
                    } else if (args.mode === "list") {
                        args.callback(fileList, searchType);
                    } else {
                        args.callback(list, searchType);
                    }
                } else if (dirCount[index] < 1) {
                    // dirCount and dirNames are parallel arrays
                    dirCount.splice(index, 1);
                    dirNames.splice(index, 1);
                    dirs = dirs - 1;
                    if (dirs < 1) {
                        if (args.mode === "array") {
                            args.callback(sort());
                        } else if (args.mode === "list") {
                            args.callback(fileList, searchType);
                        } else {
                            args.callback(list, searchType);
                        }
                    } else {
                        terminal_commands_directory_dirCounter(dirPath);
                    }
                }
            },
            statWrapper = function terminal_commands_directory_statWrapper(filePath:string, parent:number):void {
                method(filePath, function terminal_commands_directory_statWrapper_stat(er:Error, stats:Stats):void {
                    const statData:directoryData = (stats === undefined)
                        ? null
                        : {
                            atimeMs: stats.atimeMs,
                            ctimeMs: stats.ctimeMs,
                            linkPath: "",
                            linkType: "",
                            mode: stats.mode,
                            mtimeMs: stats.mtimeMs,
                            size: stats.size
                        },
                        driveLetter = function terminal_commands_directory_statWrapper_stat_driveLetter(input:string):string {
                            return `${input}\\`;
                        },
                        relPath:string = (relative === true)
                            ? filePath.replace(args.path + vars.sep, "")
                            : filePath,
                        angryPath:string = `File path ${vars.text.angry + filePath + vars.text.none} is not a file or directory.`,
                        search = function terminal_commands_directory_statWrapper_stat_search(searchItem:string):boolean {
                            const names:string = searchItem.split(vars.sep).pop(),
                                searchLast:number = args.search.length - 1,
                                searched:string = (vars.sep === "\\")
                                    ? args.search.toLowerCase()
                                    : args.search,
                                named:string = (vars.sep === "\\")
                                    ? names.toLowerCase()
                                    : names,
                                regString:string = searched.slice(1, searchLast);
                            if (searched !== "//" && searched !== "/" && searched.charAt(0) === "/" && searched.charAt(searchLast) === "/" && (/^(?:(?:[^?+*{}()[\]\\|]+|\\.|\[(?:\^?\\.|\^[^\\]|[^\\^])(?:[^\]\\]+|\\.)*\]|\((?:\?[:=!]|\?<[=!]|\?>|\?<[^\W\d]\w*>|\?'[^\W\d]\w*')?|\))(?:(?:[?+*]|\{\d+(?:,\d*)?\})[?+]?)?|\|)*$/).test(regString) === true) {
                                // search by regular expression
                                // * the large regex above is an incomplete sanity check because an invalid regular expression string will throw if converted to a RegExp object
                                // * regex modified from the example at https://stackoverflow.com/questions/172303/is-there-a-regular-expression-to-detect-a-valid-regular-expression
                                const reg:RegExp = new RegExp(regString);
                                searchType = "regex";
                                if (reg.test(named) === true) {
                                    return true;
                                }
                            }
                            if (searched.charAt(0) === "!" && named.indexOf(searched.slice(1)) < 0) {
                                // search by negation
                                searchType = "negation";
                                return true;
                            }
                            if (searched.charAt(0) !== "!" && named.indexOf(searched) > -1) {
                                // search by string fragment
                                searchType = "fragment";
                                return true;
                            }
                            return false;
                        },
                        dir = function terminal_commands_directory_statWrapper_stat_dir(item:string):void {
                            const dirBody = function terminal_commands_directory_statWrapper_stat_dir_dirBody(files:string[]):void {
                                const index:number = (args.mode === "array" || args.mode === "list")
                                        ? fileList.length
                                        : list.length,
                                    relItem:string = (relative === true)
                                        ? item.replace(args.path + vars.sep, "")
                                        : item;
                                if (args.mode === "array") {
                                    fileList.push(relItem);
                                } else if (args.mode === "list") {
                                    fileList.push(`directory  0  ${relPath}`);
                                } else {
                                    if (args.mode === "search") {
                                        if (search(item) === true) {
                                            list.push([relPath, "directory", "", parent, files.length, statData]);
                                        }
                                    } else {
                                        list.push([relItem, "directory", "", parent, files.length, statData]);
                                    }
                                }
                                if (files.length < 1) {
                                    dirCounter(item);
                                } else {
                                    // dirCount and dirNames are parallel arrays
                                    dirCount.push(files.length);
                                    dirNames.push(item);
                                    dirs = dirs + 1;
                                }
                                files.forEach(function terminal_commands_directory_statWrapper_stat_dir_readDir_each(value:string):void {
                                    if (item === "\\") {
                                        terminal_commands_directory_statWrapper(value, index);
                                    } else if ((/^\w:\\$/).test(item) === true) {
                                        terminal_commands_directory_statWrapper(item + value, index);
                                    } else if (item === "/") {
                                        terminal_commands_directory_statWrapper(`/${value}`, index);
                                    } else {
                                        terminal_commands_directory_statWrapper(item + vars.sep + value, index);
                                    }
                                });
                            };
                            if (item === "\\") {
                                //cspell:disable
                                exec("wmic logicaldisk get name", function terminal_commands_directory_statWrapper_stat_dir_windowsRoot(erw:Error, stdout:string, stderr:string):void {
                                    //cspell:enable
                                    if (erw !== null || stderr !== "") {
                                        list.failures.push(item);
                                        if (dirs > 0) {
                                            dirCounter(item);
                                        } else {
                                            args.callback(sort());
                                        }
                                    } else {
                                        const drives:string[] = stdout.replace(/Name\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ").split(" ");
                                        dirBody(drives);
                                    }
                                });
                            } else {
                                readdir(item, {encoding: "utf8"}, function terminal_commands_directory_statWrapper_stat_dir_readDir(erd:Error, files:string[]):void {
                                    if (erd !== null) {
                                        list.failures.push(item);
                                        if (dirs > 0) {
                                            dirCounter(item);
                                        } else {
                                            args.callback(sort());
                                        }
                                    } else {
                                        dirBody(files);
                                    }
                                });
                            }
                        },
                        populate = function terminal_commands_directory_statWrapper_stat_populate(type:"directory"|"error"|"file"|"link"):void {
                            if (type === "error") {
                                if (list[parent] !== undefined) {
                                    list[parent][4] = list[parent][4] - 1;
                                }
                                if (args.mode === "list") {
                                    log([`error     0  ${relPath}`]);
                                }
                                list.failures.push(filePath);
                                if (dirs > 0) {
                                    dirCounter(filePath);
                                } else {
                                    args.callback(sort());
                                }
                            } else {
                                if (vars.exclusions.indexOf(filePath.replace(args.path + vars.sep, "")) > -1) {
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(sort());
                                    }
                                } else if (args.mode === "search") {
                                    if (search(filePath) === true) {
                                        list.push([relPath, type, "", parent, 0, statData]);
                                    }
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(list);
                                    }
                                } else if (args.mode === "array" || args.mode === "list") {
                                    if (args.mode === "array") {
                                        fileList.push(relPath);
                                    } else {
                                        const typePadding:string = (type === "link")
                                                ? "link     "
                                                : (type === "file")
                                                    ? "file     "
                                                    : "directory",
                                            comma:string = common.commas(stats.size),
                                            size:number = comma.length;
                                        if (size > longest) {
                                            longest = size;
                                        }
                                        fileList.push(`${typePadding}  ${comma}  ${relPath}`);
                                    }
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(sort());
                                    }
                                } else if (args.mode === "hash") {
                                    const hashInput:hashInput = {
                                        callback: function terminal_commands_directory_statWrapper_stat_populate_hashCallback(output:hashOutput):void {
                                            const hashRel:string = (relative === true)
                                                ? output.filePath.replace(args.path, "")
                                                : output.filePath;
                                            list.push([hashRel, "file", output.hash, output.parent, 0, output.stat]);
                                            if (dirs > 0) {
                                                dirCounter(filePath);
                                            } else {
                                                args.callback(list);
                                            }
                                        },
                                        directInput: false,
                                        source: filePath,
                                        parent: parent,
                                        stat: statData
                                    };
                                    hash(hashInput);
                                } else {
                                    list.push([relPath, type, "", parent, 0, statData]);
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(list);
                                    }
                                }
                            }
                        },
                        linkAction = function terminal_commands_directory_statWrapper_stat_linkAction():void {
                            if (type === true) {
                                log(["symbolicLink"]);
                                return;
                            }
                            populate("link");
                        },
                        linkCallback = function terminal_commands_directory_statWrapper_stat_linkCallback(linkErr:Error, linkStat:Stats):void {
                            if (linkErr === null) {
                                statData.linkType = (linkStat.isDirectory() === true)
                                    ? "directory"
                                    : "file";
                                realpath(filePath, function terminal_Commands_directory_statWrapper_stat_linkCallback_realPath(realErr:Error, realPath:string):void {
                                    if (realErr === null) {
                                        statData.linkPath = realPath;
                                        linkAction();
                                    } else {
                                        populate("error");
                                    }
                                });
                            } else {
                                populate("error");
                            }
                        };
                    if (filePath === "\\") {
                        const date:Date = new Date(),
                            empty = function terminal_commands_directory_statWrapper_empty():boolean {
                                return false;
                            };
                        er = null;
                        stats = {
                            dev: 0,
                            ino: 0,
                            mode: 0,
                            nlink: 0,
                            uid: 0,
                            gid: 0,
                            rdev: 0,
                            size: 0,
                            blksize: 0,
                            blocks: 0,
                            atimeMs: 0,
                            mtimeMs: 0,
                            ctimeMs: 0,
                            birthtimeMs: 0,
                            atime: date,
                            mtime: date,
                            ctime: date,
                            birthtime: date,
                            isBlockDevice: empty,
                            isCharacterDevice: empty,
                            isDirectory: function terminal_commands_directory_statWrapper_isDirectory():boolean {
                                return true;
                            },
                            isFIFO: empty,
                            isFile: empty,
                            isSocket: empty,
                            isSymbolicLink: empty
                        };
                    }
                    if (er !== null) {
                        if (er.toString().indexOf("no such file or directory") > 0) {
                            if (type === true) {
                                log([`Requested artifact, ${vars.text.cyan + args.path + vars.text.none}, ${vars.text.angry}is missing${vars.text.none}.`]);
                                populate("error");
                            } else {
                                if ((vars.command !== "service" || (vars.command === "service" && vars.verbose === true)) && args.callback.name.indexOf("remove_") < 0 && args.callback.name.indexOf("_remove") < 0) {
                                    log([angryPath]);
                                }
                                populate("error");
                            }
                        } else {
                            populate("error");
                        }
                    } else if (stat === undefined) {
                        log([`Requested artifact, ${vars.text.cyan + args.path + vars.text.none}, ${vars.text.angry}is missing${vars.text.none}.`]);
                        populate("error");
                    } else if (stats.isDirectory() === true) {
                        if (type === true) {
                            log(["directory"]);
                            return;
                        }
                        const dirs:number = (args.path === "\\" && (/\w:$/).test(filePath) === false)
                            ? `\\${filePath.replace(startItem, "")}`.split(vars.sep).length
                            : filePath.replace(startItem, "").split(vars.sep).length;
                        if (((args.depth < 1 || dirs < args.depth) || dirTest === false) && vars.exclusions.indexOf(filePath.replace(startItem, "")) < 0) {
                            dirTest = true;
                            dir(filePath.replace(/^\w:$/, driveLetter));
                        } else {
                            populate("directory");
                        }
                    } else if (stats.isSymbolicLink() === true) {
                        if (args.symbolic === true) {
                            linkAction();
                        } else {
                            stat(filePath, linkCallback);
                        }
                    } else {
                        if (type === true) {
                            if (stats.isBlockDevice() === true) {
                                log(["blockDevice"]);
                            } else if (stats.isCharacterDevice() === true) {
                                log(["characterDevice"]);
                            } else if (stats.isFIFO() === true) {
                                log(["FIFO"]);
                            } else if (stats.isSocket() === true) {
                                log(["socket"]);
                            } else {
                                log(["file"]);
                            }
                            return;
                        }
                        size = size + stats.size;
                        populate("file");
                    }
                });
            };
        args.path = (function terminal_commands_directory_path():string {
            const resolved = function terminal_commands_directory_path_resolved(input:string):string {
                if ((/^\w:$/).test(input) === true) {
                    return `${input}\\`;
                }
                if (input === "\\" || input === "\\\\") {
                    return "\\";
                }
                return resolve(input);
            };
            if (vars.command === "directory") {
                let len:number = process.argv.length,
                    a:number = 0;
                if (process.argv.length < 1) {
                    return resolved(vars.cwd);
                }
                do {
                    if (process.argv[a].indexOf("source:") === 0) {
                        return resolved(process.argv[a].replace(/source:("|')?/, "").replace(/("|')$/, ""));
                    }
                    a = a + 1;
                } while (a < len);
                return resolved(process.argv[0]);
            }
            return resolved(args.path);
        }());
        startItem = (args.path.charAt(args.path.length - 1) === vars.sep)
            ? args.path
            : args.path + vars.sep;
        if (vars.command === "directory") {
            if (vars.verbose === true) {
                log.title("Directory");
            }
            if (args.mode === "search") {
                args.search = search;
            }
        }
        list.failures = [];
        if (args.depth === undefined) {
            args.depth = 0;
        }
        statWrapper(args.path, 0);
    };

export default directory;