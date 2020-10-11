
/* lib/terminal/commands/directory - A command driven utility to walk the file system and return a data structure. */
import { Stats } from "fs";

import commas from "../../common/commas.js";
import error from "../utilities/error.js";
import hash from "./hash.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";
import wrapIt from "../utilities/wrapIt.js";

// similar to node's fs.readdir, but recursive
const directory = function terminal_directory(parameters:readDirectory):void {
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
        // 5. stat (fs.Stats)
        // * property "failures" is a list of file paths that could not be read or opened
        let dirTest:boolean = false,
            size:number = 0,
            dirs:number = 0,
            longest:number = 0,
            search:string,
            startItem:string;
        const args:readDirectory = (vars.command === "directory")
                ? {
                    callback: function terminal_directory_callback(result:string[]|directoryList) {
                        const count:number = result.length,
                            output:string[] = (args.mode === "list")
                            ? <string[]>result
                            : [];
                        if (args.mode === "list") {
                            let a:number = count,
                                item:string;
                            const size = function terminal_directory_callback_size(comma:string):string {
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
                                item = <string>result[a];
                                result[a] = item.replace(/\d+(,\d+)*/, size);
                            } while (a > 0);
                        }
                        if (vars.verbose === true) {
                            if (args.mode !== "list") {
                                output.push(JSON.stringify(result));
                            }
                            output.push("");
                            output.push(`${vars.version.name} found ${vars.text.green + commas(count) + vars.text.none} matching items from address:`);
                            output.push(vars.text.cyan + args.path + vars.text.none);
                            output.push(`Total file size of ${vars.text.green + commas(size) + vars.text.none} bytes and ${vars.text.angry + commas(list.failures.length) + vars.text.none} errors.`);
                            log(output, true);
                        } else if (args.mode === "list") {
                            log(<string[]>result);
                        } else {
                            log([JSON.stringify(result)]);
                        }
                    },
                    depth: (function terminal_directory_path_depth():number {
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
                    logRecursion: false,
                    mode: (function terminal_directory_path_mode():directoryMode {
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
                    symbolic: (function terminal_directory_path_symbolic():boolean {
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
            logTest = (args !== undefined && args.logRecursion === true)
                ? {
                    dir: true,
                    populate: true
                }
                : {
                    dir: false,
                    populate: false
                },
            relative:boolean = (function terminal_directory_relative():boolean {
                const relIndex:number = process.argv.indexOf("relative");
                if (relIndex < 0) {
                    return false;
                }
                process.argv.splice(relIndex, 1);
                return true;
            }()),
            type:boolean = (function terminal_directory_typeof():boolean {
                const typeIndex:number = process.argv.indexOf("typeof");
                if (args !== undefined && args.logRecursion === true) {
                    vars.testLogger("directory", "type", "set type flag.");
                }
                if (vars.command === "directory" && typeIndex > -1) {
                    process.argv.splice(typeIndex, 1);
                    return true;
                }
                return false;
            }()),
            list:directoryList = [],
            fileList:string[] = [],
            test:boolean = (vars.command.indexOf("test") === 0 && vars.command !== "test_browser"),
            method:string = (args.symbolic === true)
                ? "lstat"
                : "stat",
            sort = function terminal_directory_sort():string[] {
                if (vars.sep === "\\") {
                    fileList.sort(function terminal_directory_sort_sortFunction(a:string, b:string):-1|1 {
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
            dirCounter = function terminal_directory_dirCounter(item:string):void {
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
                        args.callback(fileList);
                    } else {
                        args.callback(list);
                    }
                } else if (dirCount[index] < 1) {
                    // dirCount and dirNames are parallel arrays
                    dirCount.splice(index, 1);
                    dirNames.splice(index, 1);
                    dirs = dirs - 1;
                    if (dirs < 1) {
                        if (args.logRecursion === true) {
                            vars.testLogger("directory", "dirCounter", "complete so call the callback or output to terminal.");
                        }
                        if (args.mode === "array") {
                            args.callback(sort());
                        } else if (args.mode === "list") {
                            args.callback(fileList);
                        } else {
                            args.callback(list);
                        }
                    } else {
                        terminal_directory_dirCounter(dirPath);
                    }
                }
            },
            statWrapper = function terminal_directory_wrapper(filePath:string, parent:number):void {
                vars.node.fs[method](filePath, function terminal_directory_wrapper_stat(er:Error, stat:Stats):void {
                    const driveLetter = function terminal_directory_wrapper_stat_driveLetter(input:string):string {
                            return `${input}\\`;
                        },
                        relPath:string = (relative === true)
                            ? filePath.replace(args.path + vars.sep, "")
                            : filePath,
                        angryPath:string = `File path ${vars.text.angry + filePath + vars.text.none} is not a file or directory.`,
                        dir = function terminal_directory_wrapper_stat_dir(item:string):void {
                            const dirBody = function terminal_directory_wrapper_stat_dir_dirBody(files:string[]):void {
                                const index:number = (args.mode === "array" || args.mode === "list")
                                        ? fileList.length
                                        : list.length,
                                    status:"stat"|Stats = (test === true)
                                        ? "stat"
                                        : stat,
                                    relItem:string = (relative === true)
                                        ? item.replace(args.path + vars.sep, "")
                                        : item;
                                if (args.mode === "array") {
                                    fileList.push(relItem);
                                } else if (args.mode === "list") {
                                    fileList.push(`directory  0  ${relPath}`);
                                } else {
                                    if (args.mode === "search") {
                                        const names:string[] = item.split(vars.sep);
                                        if ((vars.sep === "/" && names[names.length - 1].indexOf(args.search) > -1) || (vars.sep === "\\" && names[names.length - 1].toLowerCase().indexOf(args.search.toLowerCase()) > -1)) {
                                            list.push([relPath, "directory", "", parent, files.length, status]);
                                        }
                                    } else {
                                        list.push([relItem, "directory", "", parent, files.length, status]);
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
                                files.forEach(function terminal_directory_wrapper_stat_dir_readDir_each(value:string):void {
                                    if (item === "\\") {
                                        terminal_directory_wrapper(value, index);
                                    } else if ((/^\w:\\$/).test(item) === true) {
                                        terminal_directory_wrapper(item + value, index);
                                    } else if (item === "/") {
                                        terminal_directory_wrapper(`/${value}`, index);
                                    } else {
                                        terminal_directory_wrapper(item + vars.sep + value, index);
                                    }
                                });
                            };
                            if (logTest.dir === true) {
                                logTest.dir = false;
                                vars.testLogger("directory", "dir", `reading directory ${item} for recursive operations.`);
                            }
                            if (item === "\\") {
                                //cspell:disable
                                vars.node.child("wmic logicaldisk get name", function terminal_server_fileService_tasks_windowsRoot(erw:Error, stdout:string, stderr:string):void {
                                    //cspell:enable
                                    if (erw !== null || (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0)) {
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
                                vars.node.fs.readdir(item, {encoding: "utf8"}, function terminal_directory_wrapper_stat_dir_readDir(erd:Error, files:string[]):void {
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
                        populate = function terminal_directory_wrapper_stat_populate(type:"error"|"link"|"file"|"directory"):void {
                            if (logTest.populate === true) {
                                logTest.populate = false;
                                vars.testLogger("directory", "populate", `populate item ${filePath} according to type:${type} and mode:${args.mode}.`);
                            }
                            if (type === "error") {
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
                                const status:"stat"|Stats = (test === true)
                                    ? "stat"
                                    : stat;
                                if (vars.exclusions.indexOf(filePath.replace(args.path + vars.sep, "")) > -1) {
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(sort());
                                    }
                                } else if (args.mode === "search") {
                                    const names:string[] = filePath.split(vars.sep);
                                    if ((vars.sep === "/" && names[names.length - 1].indexOf(args.search) > -1) || (vars.sep === "\\" && names[names.length - 1].toLowerCase().indexOf(args.search.toLowerCase()) > -1)) {
                                        list.push([relPath, type, "", parent, 0, status]);
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
                                            comma:string = commas(stat.size),
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
                                        callback: function terminal_directory_wrapper_stat_populate_hashCallback(output:hashOutput):void {
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
                                        stat: status
                                    };
                                    hash(hashInput);
                                } else {
                                    list.push([relPath, type, "", parent, 0, status]);
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(list);
                                    }
                                }
                            }
                        };
                    if (filePath === "\\") {
                        const date:Date = new Date();
                        er = null;
                        stat = {
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
                            isBlockDevice: function terminal_server_fileService_tasks_windowsRoot_isBlockDevice():boolean {
                                return false;
                            },
                            isCharacterDevice: function terminal_server_fileService_tasks_windowsRoot_isCharacterDevice():boolean {
                                return false;
                            },
                            isDirectory: function terminal_server_fileService_tasks_windowsRoot_isDirectory():boolean {
                                return true;
                            },
                            isFIFO: function terminal_server_fileService_tasks_windowsRoot_isFIFO():boolean {
                                return false;
                            },
                            isFile: function terminal_server_fileService_tasks_windowsRoot_isFile():boolean {
                                return false;
                            },
                            isSocket: function terminal_server_fileService_tasks_windowsRoot_isSocket():boolean {
                                return false;
                            },
                            isSymbolicLink: function terminal_server_fileService_tasks_windowsRoot_isSymbolicLink():boolean {
                                return false;
                            }
                        };
                    }
                    if (er !== null) {
                        if (er.toString().indexOf("no such file or directory") > 0) {
                            vars.testLogger("directory", "missing", `item ${filePath} is missing.`);
                            if (type === true) {
                                log([`Requested artifact, ${vars.text.cyan + args.path + vars.text.none}, ${vars.text.angry}is missing${vars.text.none}.`]);
                                populate("error");
                            } else {
                                if (args.callback.name.indexOf("remove_") < 0 && args.callback.name.indexOf("_remove") < 0) {
                                    log([angryPath]);
                                }
                                populate("error");
                            }
                        } else {
                            vars.testLogger("directory", "stat error", `stat of item ${filePath} caused an error.`);
                            populate("error");
                        }
                    } else if (stat === undefined) {
                        vars.testLogger("directory", "stat undefined", `item ${filePath} is missing.`);
                        log([`Requested artifact, ${vars.text.cyan + args.path + vars.text.none}, ${vars.text.angry}is missing${vars.text.none}.`]);
                        populate("error");
                    } else if (stat.isDirectory() === true) {
                        if (type === true) {
                            log(["directory"]);
                            return;
                        }
                        if (((args.depth < 1 || filePath.replace(startItem, "").split(vars.sep).length < args.depth) || dirTest === false) && vars.exclusions.indexOf(filePath.replace(startItem, "")) < 0) {
                            dirTest = true;
                            dir(filePath.replace(/^\w:$/, driveLetter));
                        } else {
                            populate("directory");
                        }
                    } else if (stat.isSymbolicLink() === true) {
                        if (type === true) {
                            log(["symbolicLink"]);
                            return;
                        }
                        populate("link");
                    } else {
                        if (type === true) {
                            if (stat.isBlockDevice() === true) {
                                log(["blockDevice"]);
                            } else if (stat.isCharacterDevice() === true) {
                                log(["characterDevice"]);
                            } else if (stat.isFIFO() === true) {
                                log(["FIFO"]);
                            } else if (stat.isSocket() === true) {
                                log(["socket"]);
                            } else {
                                log(["file"]);
                            }
                            return;
                        }
                        size = size + stat.size;
                        populate("file");
                    }
                });
            };
        args.path = (function terminal_directory_path():string {
            const resolved = function terminal_directory_path_resolved(input:string):string {
                if ((/^\w:$/).test(input) === true) {
                    return `${input}\\`;
                }
                if (input === "\\" || input === "\\\\") {
                    return "\\";
                }
                return vars.node.path.resolve(input);
            };
            if (vars.command === "directory") {
                let len:number = process.argv.length,
                    a:number = 0;
                vars.testLogger("directory", "startPath", `determine the start point and set default configuration if executing using the 'directory' command from the terminal. Mode: ${args.mode}`);
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