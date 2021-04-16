
/* lib/terminal/commands/hash - A command driven utility to generate hash sequences on strings or file system artifacts. */
import { Hash } from "crypto";
import { ReadStream } from "fs";

import common from "../../common/common.js";
import directory from "./directory.js";
import error from "../utilities/error.js";
import get from "./get.js";
import humanTime from "../utilities/humanTime.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// hash utility for strings or files
const hash = function terminal_commands_hash(input:hashInput):hashOutput {
    // input:
    // * callback    - function - callback function
    // * directInput - boolean - if false the source will be regarded as a file system artifact
    // * id          - string - A modal id value optionally passed through
    // * parent      - number - a property passed in from the 'directory' utility, but otherwise not used
    // * source      - string - file system artifact but treated as a string literal of property 'string' === true
    // * stat        - Stats - a property passed in from the 'directory' utility, but otherwise not used
    let limit:number = 0,
        shortLimit:number = 0,
        algorithm:hash = (input === undefined || input.algorithm === undefined)
            ? "sha3-512"
            : input.algorithm,
        hashList:boolean = false;
    const http:RegExp = (/^https?:\/\//), //sha512, sha3-512, shake256
        dirComplete = function terminal_commands_hash_dirComplete(list:directoryList):void {
            let a:number = 0,
                c:number = 0;
            const listLength:number = list.length,
                listObject:hashList = {},
                hashes:string[] = [],
                hashComplete = function terminal_commands_hash_dirComplete_callback():void {
                    const hash:Hash = vars.node.crypto.createHash(algorithm),
                        hashOutput:hashOutput = {
                            filePath: input.source as string,
                            hash: "",
                            id: input.id,
                            parent: input.parent,
                            stat: input.stat
                        };
                    let hashString:string = "";
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
                        log([hashString], true);
                    } else {
                        input.callback(hashOutput);
                    }
                },
                hashFile = function terminal_commands_hash_dirComplete_hashFile(index:number):void {
                    const hash:Hash = vars.node.crypto.createHash(algorithm),
                        hashStream:ReadStream = vars.node.fs.ReadStream(list[index][0]),
                        hashBack = function terminal_commands_hash_dirComplete_hashBack():void {
                            const hashString:string = hash.digest("hex").replace(/\s+/g, "");
                            input.callback(hashString, index);
                        };
                    hashStream.pipe(hash);
                    hashStream.on("close", hashBack);
                },
                typeHash = function terminal_commands_hash_dirComplete_typeHash(index:number, end:number):void {
                    const terminate = function terminal_commands_hash_dirComplete_typeHash_terminate():void {
                        c = c + 1;
                        if (c === end) {
                            if (a === listLength) {
                                hashComplete();
                            } else {
                                if (vars.verbose === true) {
                                    log([`${humanTime(false)}${vars.text.green + common.commas(a) + vars.text.none} files hashed so far...`]);
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
                        hashFile(index);
                    }
                },
                recursive = function terminal_commands_hash_dirComplete_recursive():void {
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
                sortFunction = function terminal_commands_hash_dirComplete_sortFunction(a:directoryItem, b:directoryItem):-1|1 {
                    if (a[0] < b[0]) {
                        return -1;
                    }
                    return 1;
                };
            list.sort(sortFunction);
            if (vars.verbose === true) {
                log([`${humanTime(false)}Completed analyzing the directory tree in the file system and found ${vars.text.green + common.commas(listLength) + vars.text.none} file system objects.`]);
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
                        hashFile(a);
                    }
                    a = a + 1;
                } while (a < listLength);
            } else {
                if (vars.verbose === true) {
                    log([
                        `Due to a ulimit setting of ${vars.text.angry + common.commas(limit) + vars.text.none} ${vars.name} will read only ${vars.text.cyan + common.commas(shortLimit) + vars.text.none} files at a time.`,
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
                    algorithm = process.argv[a].slice(10) as hash;
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
        if (vars.verbose === true) {
            log.title("Hash");
        }
        if (process.argv[0] === undefined) {
            error([`Command ${vars.text.cyan}hash${vars.text.none} requires some form of address of something to analyze, ${vars.text.angry}but no address is provided${vars.text.none}.`]);
            return;
        }
        if (process.argv.indexOf("string") > -1) {
            const hash:Hash = vars.node.crypto.createHash(algorithm);
            process.argv.splice(process.argv.indexOf("string"), 1);
            hash.update(process.argv[0]);
            log([hash.digest("hex")], true);
            return;
        }
        input = {
            callback: function terminal_commands_hash_callback(output:hashOutput):void {
                if (vars.verbose === true) {
                    log([`${vars.name} hashed ${vars.text.cyan + input.source + vars.text.none}`, output.hash], true);
                } else {
                    log([output.hash]);
                }
            },
            directInput: false,
            source: process.argv[0]
        };
        if (http.test(input.source as string) === false) {
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
        hash.update(input.source);
        hashOutput.hash = hash.digest("hex");
        input.callback(hashOutput);
        return;
    }
    if (http.test(input.source as string) === true) {
        get(input.source as string, function terminal_commands_hash_get(fileData:Buffer|string) {
            const hash:Hash = vars.node.crypto.createHash(algorithm);
            hash.update(fileData);
            log([hash.digest("hex")], true);
        });
    } else {
        vars.node.child("ulimit -n", function terminal_commands_hash_ulimit(ulimit_err:Error, ulimit_out:string) {
            if (ulimit_err === null && ulimit_out !== "unlimited" && isNaN(Number(ulimit_out)) === false) {
                limit = Number(ulimit_out);
                shortLimit = Math.ceil(limit / 5);
            }
            vars.node.fs.stat(input.source, function terminal_commands_hash_stat(ers:NodeJS.ErrnoException) {
                if (ers === null) {
                    if (input.parent === undefined || (input.parent !== undefined && typeof input.id === "string" && input.id.length > 0)) {
                        // not coming from the directory library.  The directory library will always pass a parent property and not an id property
                        const dirConfig:readDirectory = {
                            callback: function terminal_commands_hash_stat_dirCallback(list:directoryList) {
                                dirComplete(list);
                            },
                            depth: 0,
                            exclusions: vars.exclusions,
                            mode: "read",
                            path: input.source as string,
                            symbolic: true
                        };
                        directory(dirConfig);
                    } else {
                        // coming from the directory library
                        dirComplete([[input.source as string, "file", "", input.parent, 0, input.stat]]);
                    }
                } else {
                    if (ers.code === "ENOENT") {
                        error([`File path ${vars.text.angry + input.source + vars.text.none} is not a file or directory.`]);
                    } else {
                        error([ers.toString()]);
                    }
                }
            });
        });
    }
};

export default hash;