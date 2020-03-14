
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
                    c:number = 0;
                const listLength:number = list.length,
                    listObject:any = {},
                    hashes:string[] = [],
                    hashComplete = function terminal_hash_dirComplete_callback():void {
                        const hash:Hash = vars.node.crypto.createHash(algorithm);
                        let hashString:string = "";
                        if (hashList === true) {
                            hashString = JSON.stringify(listObject);
                        } else if (hashes.length > 1) {
                            hash.update(hashes.join(""));
                            hash.digest("hex").replace(/\s+$/, "");
                        } else {
                            hashString = hashes[0];
                        }
                        input.callback({
                            filePath: input.source,
                            hash: hashString,
                            id: input.id,
                            parent: input.parent,
                            stat: input.stat
                        });
                    },
                    hashBack = function terminal_hash_dirComplete_hashBack(data:readFile, item:string|Buffer, callback:Function):void {
                        const hash:Hash = vars.node.crypto.createHash(algorithm);
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
                            library.readFile({
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
                            });
                        }
                    },
                    recursive = function terminal_hash_dirComplete_recursive():void {
                        let b = 0,
                            end = (listLength - a < shortLimit)
                                ? listLength - a
                                : shortLimit;
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
                list.sort(sortFunction);
                if (vars.verbose === true) {
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
                            library.readFile({
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
                            });
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
            const listIndex:number = process.argv.indexOf("list"),
                length:number = process.argv.length;
            let a:number = 0;
            if (length > 0) {
                do {
                    if (process.argv[a].indexOf("algorithm:") === 0) {
                        algorithm = <hash>process.argv[a].slice(10);
                    }
                    a = a + 1;
                } while (a < length);
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
            if (listIndex > -1 && process.argv.length > 1) {
                hashList = true;
                process.argv.splice(listIndex, 1);
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
            const hash:Hash = vars.node.crypto.createHash(algorithm);
            hash.update(input.source);
            input.callback({
                filePath: "",
                hash: hash.digest("hex"),
                id: input.id,
                parent: input.parent,
                stat: input.stat
            });
            return;
        }
        if (http.test(<string>input.source) === true) {
            library.get(<string>input.source, function terminal_hash_get(fileData:string) {
                const hash:Hash = vars.node.crypto.createHash(algorithm);
                hash.update(fileData);
                library.log([hash.digest("hex")], true);
            });
        } else {
            vars.node.child("ulimit -n", function terminal_hash_ulimit(ulimit_err:Error, ulimit_out:string) {
                if (ulimit_err === null && ulimit_out !== "unlimited" && isNaN(Number(ulimit_out)) === false) {
                    limit = Number(ulimit_out);
                    shortLimit = Math.ceil(limit / 5);
                }
                if (input.parent === undefined || (input.parent !== undefined && typeof input.id === "string" && input.id.length > 0)) {
                    // the library is not called from the directory library, which will always passing a parent property and not an id property
                    directory({
                        callback: function terminal_hash_localCallback(list:directoryList) {
                            dirComplete(list);
                        },
                        depth: 0,
                        exclusions: vars.exclusions,
                        mode: "read",
                        path: <string>input.source,
                        symbolic: true
                    });
                } else {
                    // coming from the directory library
                    dirComplete([[<string>input.source, "file", "", input.parent, 0, input.stat]]);
                }
            });
        }
    };

export default hash;