
import commas from "./commas.js";
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
        // * recursive - boolean - if child directories should be scanned
        // * symbolic - boolean - if symbolic links should be identified
        // -
        // output: []
        // 0. absolute path (string)
        // 1. type (string)
        // 2. hash (string), empty string unless type is "file" and args.hash === true and be aware this is exceedingly slow on large directory trees
        // 3. parent index (number)
        // 4. child item count (number)
        // 5. stat (fs.Stats)
        let dirTest:boolean = false,
            size:number = 0,
            dirs:number = 0;
        const dirCount:number[] = [],
            dirNames:string[] = [],
            listOnly:boolean = (vars.command === "directory" && process.argv.indexOf("list") > -1),
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
                        hash: (process.argv.indexOf("hash") > -1),
                        path: "",
                        recursive: (process.argv.indexOf("shallow") > -1)
                            ? (function terminal_directory_startPath_recursive():boolean {
                                process.argv.splice(process.argv.indexOf("shallow"), 1);
                                return false;
                            }())
                            : true,
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
                index = dirNames.indexOf(dirPath);
                dirCount[index] = dirCount[index] - 1;
                if (dirNames.length === 0 && item === startPath) {
                    // empty directory, nothing to traverse
                    if (listOnly === true) {
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
                        if (listOnly === true) {
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
                                    library.error([erd.toString()]);
                                    if (vars.command === "server") {
                                        dirCounter(item);
                                    } else {
                                        return;
                                    }
                                } else {
                                    const index:number = list.length;
                                    if (listOnly === true) {
                                        fileList.push(item);
                                    } else {
                                        list.push([item, "directory", "", parent, files.length, stat]);
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
                                        terminal_directory_wrapper(item + vars.sep + value, index);
                                    });
                                }
                            });
                        },
                        populate = function terminal_directory_wrapper_stat_populate(type:"error"|"link"|"file"|"directory"):void {
                            if (type !== "error" && vars.exclusions.indexOf(filePath.replace(startPath + vars.sep, "")) < 0) {
                                if (listOnly === true) {
                                    fileList.push(filePath);
                                    if (dirs > 0) {
                                        dirCounter(filePath);
                                    } else {
                                        args.callback(fileList.sort());
                                    }
                                } else if (args.hash === true) {
                                    library.hash({
                                        callback: function terminal_directory_wrapper_stat_populate_hashCallback(output:hashOutput):void {
                                            list.push([output.filePath, "file", output.hash, output.parent, 0, output.stat]);
                                            if (dirs > 0) {
                                                dirCounter(filePath);
                                            } else {
                                                args.callback(list);
                                            }
                                        },
                                        filePath: filePath,
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
                            if (vars.flags.error === true) {
                                args.callback([]);
                                return;
                            }
                            if (type === true) {
                                library.log([`Requested artifact, ${vars.text.cyan + startPath + vars.text.none}, ${vars.text.angry}is missing${vars.text.none}.`]);
                                if (vars.command === "server") {
                                    populate("error");
                                } else {
                                    return;
                                }
                            }
                            library.error([angryPath]);
                            if (vars.command === "server") {
                                populate("error");
                            } else {
                                return;
                            }
                        } else {
                            library.error([er.toString()]);
                            if (vars.command === "server") {
                                populate("error");
                            } else {
                                return;
                            }
                        }
                    } else if (stat === undefined) {
                        if (type === true) {
                            library.log([`Requested artifact, ${vars.text.cyan + startPath + vars.text.none}, ${vars.text.angry}is missing${vars.text.none}.`]);
                            if (vars.command === "server") {
                                populate("error");
                            } else {
                                return;
                            }
                        }
                        library.error([angryPath]);
                        if (vars.command === "server") {
                            populate("error");
                        } else {
                            return;
                        }
                    } else if (stat.isDirectory() === true) {
                        if (type === true) {
                            library.log(["directory"]);
                            return;
                        }
                        if (((args.recursive === true && (args.depth < 1 || filePath.replace(startPath + vars.sep, "").split(vars.sep).length < args.depth)) || dirTest === false) && vars.exclusions.indexOf(filePath.replace(startPath + vars.sep, "")) < 0) {
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
        
        if (args.depth === undefined) {
            args.depth = 0;
        }
        statWrapper(startPath, 0);
    };

export default directory;