
/* lib/terminal/commands/hash - A command driven utility to generate hash sequences on strings or file system artifacts. */
import { Stats } from "fs";
import { Hash } from "crypto";

import commas from "../../common/commas.js";
import directory from "./directory.js";
import error from "../utilities/error.js";
import get from "./get.js";
import humanTime from "../utilities/humanTime.js";
import log from "../utilities/log.js";
import readFile from "../utilities/readFile.js";
import remove from "./remove.js";
import vars from "../utilities/vars.js";

// hash utility for strings or files
const library = {
        commas: commas,
        error: error,
        get:get, 
        humanTime: humanTime,
        log: log,
        readFile: readFile
    },
    // input:
    // * callback    - function - callback function
    // * directInput - boolean - if false the source will be regarded as a file system artifact
    // * id          - string - A modal id value optionally passed through
    // * parent      - number - a property passed in from the 'directory' utility, but otherwise not used
    // * source      - string - file system artifact but treated as a string literal of property 'string' === true
    // * stat        - Stats - a property passed in from the 'directory' utility, but otherwise not used
    hash = function terminal_hash(input:hashInput):hashOutput {
        let limit:number = 0,
            shortLimit:number = 0,
            algorithm:hash = (input === undefined || input.algorithm === undefined)
                ? "sha3-512"
                : input.algorithm,
            hashList:boolean = false;
        const http:RegExp = (/^https?:\/\//), //sha512, sha3-512, shake256
            dirComplete = function terminal_hash_dirComplete(list:directoryList):void {
                let a:number = 0,
                    c:number = 0,
                    testLog:boolean = true;
                const listLength:number = list.length,
                    listObject:any = {},
                    hashes:string[] = [],
                    hashComplete = function terminal_hash_dirComplete_callback():void {
                        const hash:Hash = vars.node.crypto.createHash(algorithm),
                            hashOutput:hashOutput = {
                                filePath: <string>input.source,
                                hash: "",
                                id: input.id,
                                parent: input.parent,
                                stat: input.stat
                            };
                        let hashString:string = "";
                        vars.testLogger("hash", "hashComplete", "completion function that formats the output.");
                        if (hashList === true) {
                            hashString = JSON.stringify(listObject);
                        } else if (hashes.length > 1) {
                            hash.update(hashes.join(""));
                            hashString = hash.digest("hex").replace(/\s+$/, "");
                        } else {
                            hashString = hashes[0];
                        }
                        hashOutput.hash = hashString;
                        if (vars.command === "hash") {
                            library.log([hashString], true);
                        } else {
                            input.callback(hashOutput);
                        }
                    },
                    hashBack = function terminal_hash_dirComplete_hashBack(data:readFile, item:string|Buffer, callback:Function):void {
                        const hash:Hash = vars.node.crypto.createHash(algorithm);
                        if (testLog === true) {
                            vars.testLogger("hash", "hashBack", "reading file as a stream.");
                            testLog = false;
                        }
                        hash.on("readable", function terminal_hash_dirComplete_hashBack_hash():void {
                            let hashString:string = "";
                            const hashData:Buffer = <Buffer>hash.read();
                            if (hashData !== null) {
                                hashString = hashData.toString("hex").replace(/\s+/g, "");
                                callback(hashString, data.index);
                            }
                        });
                        hash.write(item);
                        hash.end();
                        if (http.test(<string>input.source) === true) {
                            remove(data.path, function terminal_hash_dirComplete_hashBack_hash_remove():boolean {
                                return true;
                            });
                        }
                    },
                    typeHash = function terminal_hash_dirComplete_typeHash(index:number, end:number) {
                        const terminate = function terminal_hash_dirComplete_typeHash_terminate():void {
                            c = c + 1;
                            if (c === end) {
                                if (a === listLength) {
                                    hashComplete();
                                } else {
                                    if (vars.verbose === true) {
                                        library.log([`${library.humanTime(false)}${vars.text.green + library.commas(a) + vars.text.none} files hashed so far...`]);
                                    }
                                    c = 0;
                                    recursive();
                                }
                            }
                        };
                        if (list[index][1] === "directory" || list[index][1] === "link") {
                            const hash:Hash = vars.node.crypto.createHash(algorithm);
                            hash.update(list[index][0]);
                            if (hashList === true) {
                                listObject[list[index][0]] = hash.digest("hex");
                            } else {
                                hashes[index] = hash.digest("hex");
                            }
                            terminate();
                        } else {
                            const readConfig:readFile = {
                                path: list[index][0],
                                stat: <Stats>list[index][5],
                                index: index,
                                callback: function terminal_hash_dirComplete_typeHash_callback(data:readFile, item:string|Buffer):void {
                                    hashBack(data, item, function terminal_hash_dirComplete_typeHash_callback_hashBack(hashString:string, item:number) {
                                        hashes[item[0]] = hashString;
                                        if (hashList === true) {
                                            listObject[data.path] = hashString;
                                        } else {
                                            hashes[item[0]] = hashString;
                                        }
                                        terminate();
                                    });
                                }
                            };
                            library.readFile(readConfig);
                        }
                    },
                    recursive = function terminal_hash_dirComplete_recursive():void {
                        let b = 0,
                            end = (listLength - a < shortLimit)
                                ? listLength - a
                                : shortLimit;
                        vars.testLogger("hash", "recursive", "the recursive function is called to throttle parallel tasks in the case the ulimit is reached.");
                        do {
                            typeHash(a, end);
                            a = a + 1;
                            b = b + 1;
                        } while (b < shortLimit && a < listLength);
                    },
                    sortFunction = function terminal_hash_dirComplete_sortFunction(a:directoryItem, b:directoryItem) {
                        if (a[0] < b[0]) {
                            return -1;
                        }
                        return 1;
                    };
                vars.testLogger("hash", "dirComplete", `reading the directory tree is complete with ${listLength} items and a ulimit of ${limit}.`);
                list.sort(sortFunction);
                if (vars.verbose === true && vars.testLog === false) {
                    library.log([`${library.humanTime(false)}Completed analyzing the directory tree in the file system and found ${vars.text.green + library.commas(listLength) + vars.text.none} file system objects.`]);
                }
                if (limit < 1 || listLength < limit) {
                    do {
                        if (list[a][1] === "directory" || list[a][1] === "link") {
                            const hash:Hash = vars.node.crypto.createHash(algorithm);
                            hash.update(list[a][0]);
                            if (hashList === true) {
                                listObject[list[a][0]] = hash.digest("hex");
                            } else {
                                hashes[a] = hash.digest("hex");
                            }
                            c = c + 1;
                            if (c === listLength) {
                                hashComplete();
                            }
                        } else {
                            const readConfig:readFile = {
                                path: list[a][0],
                                stat: <Stats>list[a][5],
                                index: a,
                                callback: function terminal_hash_dirComplete_file(data:readFile, item:string|Buffer):void {
                                    hashBack(data, item, function terminal_hash_dirComplete_file_hashBack(hashString:string, index:number):void {
                                        if (hashList === true) {
                                            listObject[data.path] = hashString;
                                        } else {
                                            hashes[index] = hashString;
                                        }
                                        c = c + 1;
                                        if (c === listLength) {
                                            hashComplete();
                                        }
                                    });
                                }
                            };
                            library.readFile(readConfig);
                        }
                        a = a + 1;
                    } while (a < listLength);
                } else {
                    if (vars.verbose === true) {
                        library.log([
                            `Due to a ulimit setting of ${vars.text.angry + library.commas(limit) + vars.text.none} ${vars.version.name} will read only ${vars.text.cyan + library.commas(shortLimit) + vars.text.none} files at a time.`,
                            ""
                        ]);
                    }
                    recursive();
                }
            };
        if (vars.command === "hash") {
            vars.testLogger("hash", "hash command", "prepare arguments if executing from command 'hash'.");
            const listIndex:number = process.argv.indexOf("list"),
                length:number = process.argv.length;
            let a:number = 0;
            if (length > 0) {
                do {
                    if (process.argv[a].indexOf("algorithm:") === 0) {
                        algorithm = <hash>process.argv[a].slice(10);
                        process.argv.splice(a, 1);
                        break;
                    }
                    a = a + 1;
                } while (a < length);
            }
            if (listIndex > -1 && process.argv.length > 1) {
                hashList = true;
                process.argv.splice(listIndex, 1);
            }
            if (process.argv.indexOf("--verbose") > -1) {
                vars.verbose === true;
                process.argv.splice(process.argv.indexOf("--verbose"), 1);
            } else if (process.argv.indexOf("-verbose") > -1) {
                vars.verbose === true;
                process.argv.splice(process.argv.indexOf("-verbose"), 1);
            } else if (process.argv.indexOf("verbose") > -1) {
                vars.verbose === true;
                process.argv.splice(process.argv.indexOf("verbose"), 1);
            }
            if (process.argv[0] === undefined) {
                library.error([`Command ${vars.text.cyan}hash${vars.text.none} requires some form of address of something to analyze, ${vars.text.angry}but no address is provided${vars.text.none}.`]);
                return;
            }
            if (process.argv.indexOf("string") > -1) {
                const hash:Hash = vars.node.crypto.createHash(algorithm);
                process.argv.splice(process.argv.indexOf("string"), 1);
                hash.update(process.argv[0]);
                library.log([hash.digest("hex")], true);
                return;
            }
            input = {
                callback: function terminal_hash_callback(output:hashOutput):void {
                    if (vars.verbose === true) {
                        library.log([`${vars.version.name} hashed ${vars.text.cyan + input.source + vars.text.none}`, output.hash], true);
                    } else {
                        library.log([output.hash]);
                    }
                },
                directInput: false,
                source: process.argv[0]
            };
            if (http.test(<string>input.source) === false) {
                input.source = vars.node.path.resolve(process.argv[0]);
            }
        }
        if (input.directInput === true) {
            const hash:Hash = vars.node.crypto.createHash(algorithm),
                hashOutput:hashOutput = {
                    filePath: "",
                    hash: "",
                    id: input.id,
                    parent: input.parent,
                    stat: input.stat
                };
            vars.testLogger("hash", "direct input", "when the input is a string from the terminal simply hash the string and write to standard output.");
            hash.update(input.source);
            hashOutput.hash = hash.digest("hex");
            input.callback(hashOutput);
            return;
        }
        if (http.test(<string>input.source) === true) {
            vars.testLogger("hash", "http", "if the path is http(s) then request content from the internet.");
            library.get(<string>input.source, function terminal_hash_get(fileData:string) {
                const hash:Hash = vars.node.crypto.createHash(algorithm);
                hash.update(fileData);
                library.log([hash.digest("hex")], true);
            });
        } else {
            vars.testLogger("hash", "file path", "when the input is not the terminal's standard input or a http(s) scheme assume a file path, but first set ulimit on POSIX to prevent file system errors on large directory trees.");
            vars.node.child("ulimit -n", function terminal_hash_ulimit(ulimit_err:Error, ulimit_out:string) {
                if (ulimit_err === null && ulimit_out !== "unlimited" && isNaN(Number(ulimit_out)) === false) {
                    limit = Number(ulimit_out);
                    shortLimit = Math.ceil(limit / 5);
                }
                vars.node.fs.stat(input.source, function terminal_hash_stat(ers:nodeError) {
                    if (ers === null) {
                        if (input.parent === undefined || (input.parent !== undefined && typeof input.id === "string" && input.id.length > 0)) {
                            // not coming from the directory library.  The directory library will always pass a parent property and not an id property
                            const dirConfig:readDirectory = {
                                callback: function terminal_hash_stat_dirCallback(list:directoryList) {
                                    dirComplete(list);
                                },
                                depth: 0,
                                exclusions: vars.exclusions,
                                mode: "read",
                                path: <string>input.source,
                                symbolic: true
                            };
                            directory(dirConfig);
                        } else {
                            // coming from the directory library
                            dirComplete([[<string>input.source, "file", "", input.parent, 0, input.stat]]);
                        }
                    } else {
                        if (ers.code === "ENOENT") {
                            library.log([`File path ${vars.text.angry + input.source + vars.text.none} is not a file or directory.`]);
                        } else {
                            library.error([ers.toString()]);
                        }
                    }
                });
            });
        }
    };

export default hash;