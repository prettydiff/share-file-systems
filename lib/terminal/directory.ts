
import commas from "../common/commas.js";
import error from "./error.js";
import hash from "./hash.js";
import log from "./log.js";
import vars from "./vars.js";
import wrapIt from "./wrapIt.js";

// similar to node's fs.readdir, but recursive
const library = {
        commas: commas,
        error: error,
        hash: hash,
        log: log,
        wrapIt: wrapIt
    },
    directory = function terminal_directory(args:readDirectory):void {
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
            search:string;
        const dirCount:number[] = [],
            dirNames:string[] = [],
            type:boolean = (function terminal_directory_typeof():boolean {
                const typeIndex:number = process.argv.indexOf("typeof");
                if (vars.command === "directory" && typeIndex > -1) {
                    process.argv.splice(typeIndex, 1);
                    return true;
                }
                return false;
            }()),
            startPath:string = (function terminal_directory_startPath():string {
                if (vars.command === "directory") {
                    const len:number = process.argv.length;
                    let a:number = 0;
                    args = {
                        callback: function terminal_directory_startPath_callback(result:string[]|directoryList) {
                            const output:string[] = [];
                            if (vars.verbose === true) {
                                output.push(JSON.stringify(result));
                                output.push("");
                                library.wrapIt(output, `${vars.version.name} found ${vars.text.green + library.commas(result.length) + vars.text.none} matching items from address ${vars.text.cyan + startPath + vars.text.none} with a total file size of ${vars.text.green + library.commas(size) + vars.text.none} bytes.`);
                                library.log(output);
                            } else {
                                library.log([JSON.stringify(result)]);
                            }
                        },
                        depth: (function terminal_directory_startPath_depth():number {
                            let b:number = 0;
                            do {
                                if ((/^depth:\d+$/).test(process.argv[b]) === true) {
                                    return Number(process.argv[b].replace("depth:", ""));
                                }
                                b = b + 1;
                            } while (b < process.argv.length);
                            return 0;
                        }()),
                        exclusions: vars.exclusions,
                        mode: (function terminal_directory_startPath_mode():directoryMode {
                            let b:number = 0;
                            do {
                                if ((/^mode:/).test(process.argv[b]) === true) {
                                    if (process.argv[b].indexOf("hash") > 0) {
                                        return "hash";
                                    }
                                    if (process.argv[b].indexOf("list") > 0) {
                                        return "list";
                                    }
                                    if (process.argv[b].indexOf("read") > 0) {
                                        return "hash";
                                    }
                                }
                                if ((/^search:/).test(process.argv[b]) === true) {
                                    search = process.argv[b].replace("search:", "");
                                    if ((search.charAt(0) === "\"" && search.charAt(search.length - 1) === "\"") || (search.charAt(0) === "'" && search.charAt(search.length - 1) === "'")) {
                                        search = search.slice(1, search.length - 1);
                                    }
                                    return "search";
                                }
                                b = b + 1;
                            } while (b < process.argv.length);
                            return "read";
                        }()),
                        path: "",
                        symbolic: (process.argv.indexOf("symbolic") > -1)
                            ? (function terminal_directory_startPath_symbolic():boolean {
                                process.argv.splice(process.argv.indexOf("symbolic"), 1);
                                return true;
                            }())
                            : false
                    };
                    if (process.argv.length < 1) {
                        library.error([
                            "No path supplied for the directory command. For an example please see:",
                            `    ${vars.text.cyan + vars.version.command} commands directory${vars.text.none}`
                        ]);
                        return "";
                    }
                    do {
                        if (process.argv[a].indexOf("source:") === 0) {
                            return vars.node.path.resolve(process.argv[a].replace(/source:("|')?/, "").replace(/("|')$/, ""));
                        }
                        a = a + 1;
                    } while (a < len);
                    return vars.node.path.resolve(process.argv[0]);
                }
                return vars.node.path.resolve(args.path);
            }()),
            list:directoryList = [],
            fileList:string[] = [],
            method:string = (args.symbolic === true)
                ? "lstat"
                : "stat",
            dirCounter = function terminal_directory_dirCounter(item:string):void {
                let dirList:string[] = item.split(vars.sep),
                    dirPath:string = "",
                    index:number = 0;
                dirList.pop();
                dirPath = dirList.join(vars.sep);
                if (dirPath === "") {
                    dirPath = vars.sep;
                }
                index = dirNames.indexOf(dirPath);
                dirCount[index] = dirCount[index] - 1;
                if (dirNames.length === 0 && item === startPath) {
                    // empty directory, nothing to traverse
                    if (args.mode === "list") {
                        args.callback(fileList.sort());
                    } else {
                        args.callback(list);
                    }
                } else if (dirCount[index] < 1) {
                    // dirCount and dirNames are parallel arrays
                    dirCount.splice(index, 1);
                    dirNames.splice(index, 1);
                    dirs = dirs - 1;
                    if (dirs < 1) {
                        if (args.mode === "list") {
                            args.callback(fileList.sort());
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
                    const angryPath:string = `File path ${vars.text.angry + filePath + vars.text.none} is not a file or directory.`,
                        dir = function terminal_directory_wrapper_stat_dir(item:string):void {
                            vars.node.fs.readdir(item, {encoding: "utf8"}, function terminal_directory_wrapper_stat_dir_readDir(erd:Error, files:string[]):void {
                                if (erd !== null) {
                                    list.failures.push(item);
                                    if (vars.command === "server") {
                                        if (dirs > 0) {
                                            dirCounter(item);
                                        } else {
                                            args.callback(fileList.sort());
                                        }
                                    } else {
                                        library.error([erd.toString()]);
                                        return;
                                    }
                                } else {
                                    const index:number = list.length;
                                    if (args.mode === "list") {
                                        fileList.push(item);
                                    } else {
                                        if (args.mode === "search") {
                                            const names:string[] = filePath.split(vars.sep);
                                            if ((vars.sep === "/" && names[names.length - 1].indexOf(args.search) > -1) || (vars.sep === "\\" && names[names.length - 1].toLowerCase().indexOf(args.search.toLowerCase()) > -1)) {
                                                list.push([filePath, "directory", "", parent, files.length, stat]);
                                            }
                                        } else {
                                            list.push([item, "directory", "", parent, files.length, stat]);
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
                                        if (item  === vars.sep) {
                                            terminal_directory_wrapper(item + value, index);
                                        } else {
                                            terminal_directory_wrapper(item + vars.sep + value, index);
                                        }
                                    });
                                }
                            });
                        },
                        populate = function terminal_directory_wrapper_stat_populate(type:"error"|"link"|"file"|"directory"):void {
                            if (type === "error") {
                                list.failures.push(filePath);
                                if (dirs > 0) {
                                    dirCounter(filePath);
                                } else {
                                    args.callback(fileList.sort());
                                }
                            } else {
                                if (vars.exclusions.indexOf(filePath.replace(startPath + vars.sep, "")) > -1) {
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(fileList.sort());
                                    }
                                } else if (args.mode === "search") {
                                    const names:string[] = filePath.split(vars.sep);
                                    if ((vars.sep === "/" && names[names.length - 1].indexOf(args.search) > -1) || (vars.sep === "\\" && names[names.length - 1].toLowerCase().indexOf(args.search.toLowerCase()) > -1)) {
                                        list.push([filePath, type, "", parent, 0, stat]);
                                    }
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(list);
                                    }
                                } else if (args.mode === "list") {
                                    fileList.push(filePath);
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(fileList.sort());
                                    }
                                } else if (args.mode === "hash") {
                                    library.hash({
                                        callback: function terminal_directory_wrapper_stat_populate_hashCallback(output:hashOutput):void {
                                            list.push([output.filePath, "file", output.hash, output.parent, 0, output.stat]);
                                            if (dirs > 0) {
                                                dirCounter(filePath);
                                            } else {
                                                args.callback(list);
                                            }
                                        },
                                        directInput: false,
                                        source: filePath,
                                        parent: parent,
                                        stat: stat
                                    });
                                } else {
                                    list.push([filePath, type, "", parent, 0, stat]);
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(list);
                                    }
                                }
                            }
                        };
                    if (er !== null) {
                        if (er.toString().indexOf("no such file or directory") > 0) {
                            if (type === true) {
                                library.log([`Requested artifact, ${vars.text.cyan + startPath + vars.text.none}, ${vars.text.angry}is missing${vars.text.none}.`]);
                                populate("error");
                            } else {
                                library.log([angryPath]);
                                populate("error");
                            }
                        } else {
                            //library.log([er.toString()]);
                            populate("error");
                        }
                    } else if (stat === undefined) {
                        library.log([`Requested artifact, ${vars.text.cyan + startPath + vars.text.none}, ${vars.text.angry}is missing${vars.text.none}.`]);
                        populate("error");
                    } else if (stat.isDirectory() === true) {
                        if (type === true) {
                            library.log(["directory"]);
                            return;
                        }
                        if (((args.depth < 1 || filePath.replace(startPath + vars.sep, "").split(vars.sep).length < args.depth) || dirTest === false) && vars.exclusions.indexOf(filePath.replace(startPath + vars.sep, "")) < 0) {
                            dirTest = true;
                            dir(filePath);
                        } else {
                            populate("directory");
                        }
                    } else if (stat.isSymbolicLink() === true) {
                        if (type === true) {
                            library.log(["symbolicLink"]);
                            return;
                        }
                        populate("link");
                    } else if (stat.isFile() === true || stat.isBlockDevice() === true || stat.isCharacterDevice() === true) {
                        if (type === true) {
                            if (stat.isBlockDevice() === true) {
                                library.log(["blockDevice"]);
                            } else if (stat.isCharacterDevice() === true) {
                                library.log(["characterDevice"]);
                            } else {
                                library.log(["file"]);
                            }
                            return;
                        }
                        size = size + stat.size;
                        populate("file");
                    } else {
                        if (type === true) {
                            if (stat.isFIFO() === true) {
                                library.log(["FIFO"]);
                            } else if (stat.isSocket() === true) {
                                library.log(["socket"]);
                            } else {
                                library.log(["unknown"]);
                            }
                            return;
                        }
                        list[parent][3] = list[parent][3] - 1;
                    }
                });
            };
        if (vars.command === "directory" && args.mode === "search") {
            args.search = search;
        }
        list.failures = [];
        if (args.depth === undefined) {
            args.depth = 0;
        }
        statWrapper(startPath, 0);
    };

export default directory;