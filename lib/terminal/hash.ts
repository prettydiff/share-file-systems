
import { Hash } from "crypto";

import commas from "./commas.js";
import directory from "./directory.js";
import error from "./error.js";
import get from "./get.js";
import humanTime from "./humanTime.js";
import log from "./log.js";
import readFile from "./readFile.js";
import remove from "./remove.js";
import vars from "./vars.js";

// hash utility for strings or files
const library = {
        commas: commas,
        error: error,
        get:get, 
        humanTime: humanTime,
        log: log,
        readFile: readFile
    },
    hash = function terminal_hash(input:hashInput):hashOutput {
        let limit:number = 0,
            shortLimit:number = 0,
            hashList:boolean = false;
        const http:RegExp = (/^https?:\/\//),
            dirComplete = function terminal_hash_dirComplete(list:directoryList):void {
                let a:number = 0,
                    c:number = 0;
                const listLength:number = list.length,
                    listObject:any = {},
                    hashes:string[] = [],
                    hashComplete = function terminal_hash_dirComplete_callback():void {
                        const hash:Hash = vars.node.crypto.createHash("sha512");
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
                            filePath: input.filePath,
                            hash: hashString,
                            parent: input.parent,
                            stat: input.stat
                        });
                    },
                    hashBack = function terminal_hash_dirComplete_hashBack(data:readFile, item:string|Buffer, callback:Function):void {
                        const hash:Hash = vars.node.crypto.createHash("sha512");
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
                        if (http.test(input.filePath) === true) {
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
                            const hash:Hash = vars.node.crypto.createHash("sha512");
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
                                stat: list[index][5],
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
                            const hash:Hash = vars.node.crypto.createHash("sha512");
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
                                stat: list[a][5],
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
            const listIndex:number = process.argv.indexOf("list");
            if (process.argv[0] === undefined) {
                library.error([`Command ${vars.text.cyan}hash${vars.text.none} requires some form of address of something to analyze, ${vars.text.angry}but no address is provided${vars.text.none}.`]);
                return;
            }
            if (process.argv.indexOf("string") > -1) {
                const hash:Hash = vars.node.crypto.createHash("sha512");
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
                        library.log([`${vars.version.name} hashed ${vars.text.cyan + input.filePath + vars.text.none}`, output.hash], true);
                    } else {
                        library.log([output.hash]);
                    }
                },
                filePath: process.argv[0]
            };
            if (http.test(input.filePath) === false) {
                input.filePath = vars.node.path.resolve(process.argv[0]);
            }
        }
        if (http.test(input.filePath) === true) {
            library.get(input.filePath, function terminal_hash_get(fileData:string) {
                const hash:Hash = vars.node.crypto.createHash("sha512");
                hash.update(fileData);
                library.log([hash.digest("hex")], true);
            });
        } else {
            vars.node.child("ulimit -n", function terminal_hash_ulimit(ulimit_err:Error, ulimit_out:string) {
                if (ulimit_err === null && ulimit_out !== "unlimited" && isNaN(Number(ulimit_out)) === false) {
                    limit = Number(ulimit_out);
                    shortLimit = Math.ceil(limit / 5);
                }
                directory({
                    callback: function terminal_hash_localCallback(list:directoryList) {
                        dirComplete(list);
                    },
                    depth: 0,
                    exclusions: vars.exclusions,
                    hash: false,
                    path: input.filePath,
                    recursive: true,
                    symbolic: true
                });
            });
        }
    };

export default hash;