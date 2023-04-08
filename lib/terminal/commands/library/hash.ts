
/* lib/terminal/commands/library/hash - A utility to generate hash sequences on strings or file system artifacts. */

import { exec } from "child_process";
import { createHash, Hash } from "crypto";
import { createReadStream, ReadStream, stat, Stats } from "fs";

import common from "../../../common/common.js";
import directory from "./directory.js";
import error from "../../utilities/error.js";
import get from "./get.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

// hash utility for strings or files
const hash = function terminal_commands_library_hash(input:config_command_hash):hash_output {
    // input:
    // * callback    - function - callback function
    // * directInput - boolean - if false the source will be regarded as a file system artifact
    // * id          - string - A modal id value optionally passed through
    // * parent      - number - a property passed in from the 'directory' utility, but otherwise not used
    // * source      - string - file system artifact but treated as a string literal of property 'string' === true
    // * stat        - Stats - a property passed in from the 'directory' utility, but otherwise not used
    let limit:number = 0,
        shortLimit:number = 0,
        hashList:boolean = false;
    const title:string = `Hash ${input.algorithm}`,
        http:RegExp = (/^https?:\/\//),
        dirComplete = function terminal_commands_library_hash_dirComplete(list:directory_list):void {
            let a:number = 0,
                c:number = 0;
            const listLength:number = list.length,
                listObject:stringStore = {},
                hashes:string[] = [],
                hashOutput:hash_output = {
                    filePath: input.source as string,
                    hash: "",
                    id: input.id,
                    parent: input.parent,
                    stat: input.stat
                },
                hashComplete = function terminal_commands_library_hash_dirComplete_callback():void {
                    const hash:Hash = createHash(input.algorithm);
                    let hashString:string = "";
                    if (hashList === true) {
                        hashString = JSON.stringify(listObject);
                    } else if (hashes.length > 1) {
                        hash.update(hashes.join(""));
                        hashString = hash.digest(input.digest).replace(/\s+$/, "");
                    } else {
                        hashString = hashes[0];
                    }
                    hashOutput.hash = hashString;
                    input.callback(title, hashOutput);
                },
                hashFile = function terminal_commands_library_hash_dirComplete_hashFile(index:number):void {
                    const hash:Hash = createHash(input.algorithm),
                        hashStream:ReadStream = createReadStream(list[index][0]),
                        hashBack = function terminal_commands_library_hash_dirComplete_hashBack():void {
                            hashOutput.hash = hash.digest(input.digest).replace(/\s+/g, "");
                            hashOutput.filePath = list[index][0];
                            input.callback(title, hashOutput);
                        };
                    hashStream.pipe(hash);
                    hashStream.on("close", hashBack);
                },
                typeHash = function terminal_commands_library_hash_dirComplete_typeHash(index:number, end:number):void {
                    const terminate = function terminal_commands_library_hash_dirComplete_typeHash_terminate():void {
                        c = c + 1;
                        if (c === end) {
                            if (a === listLength) {
                                hashComplete();
                            } else {
                                if (vars.settings.verbose === true) {
                                    log([`${humanTime(false)}${vars.text.green + common.commas(a) + vars.text.none} files hashed so far...`]);
                                }
                                c = 0;
                                recursive();
                            }
                        }
                    };
                    if (list[index][1] === "directory" || list[index][1] === "link") {
                        const hash:Hash = createHash(input.algorithm);
                        hash.update(list[index][0]);
                        if (hashList === true) {
                            listObject[list[index][0]] = hash.digest(input.digest);
                        } else {
                            hashes[index] = hash.digest(input.digest);
                        }
                        terminate();
                    } else {
                        hashFile(index);
                    }
                },
                recursive = function terminal_commands_library_hash_dirComplete_recursive():void {
                    let b:number = 0,
                        end:number = (listLength - a < shortLimit)
                            ? listLength - a
                            : shortLimit;
                    do {
                        typeHash(a, end);
                        a = a + 1;
                        b = b + 1;
                    } while (b < shortLimit && a < listLength);
                },
                sortFunction = function terminal_commands_library_hash_dirComplete_sortFunction(a:directory_item, b:directory_item):-1|1 {
                    if (a[0] < b[0]) {
                        return -1;
                    }
                    return 1;
                };
            list.sort(sortFunction);
            if (vars.settings.verbose === true) {
                log([`${humanTime(false)}Completed analyzing the directory tree in the file system and found ${vars.text.green + common.commas(listLength) + vars.text.none} file system objects.`]);
            }
            if (limit < 1 || listLength < limit) {
                do {
                    if (list[a][1] === "directory" || list[a][1] === "link") {
                        const hash:Hash = createHash(input.algorithm);
                        hash.update(list[a][0]);
                        if (hashList === true) {
                            listObject[list[a][0]] = hash.digest(input.digest);
                        } else {
                            hashes[a] = hash.digest(input.digest);
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
                if (vars.settings.verbose === true) {
                    log([
                        `Due to a ulimit setting of ${vars.text.angry + common.commas(limit) + vars.text.none} ${vars.environment.name} will read only ${vars.text.cyan + common.commas(shortLimit) + vars.text.none} files at a time.`,
                        ""
                    ]);
                }
                recursive();
            }
        };
    if (input.directInput === true) {
        const hash:Hash = createHash(input.algorithm),
            hashOutput:hash_output = {
                filePath: "",
                hash: "",
                id: input.id,
                parent: input.parent,
                stat: input.stat
            };
        hash.update(input.source);
        hashOutput.hash = hash.digest(input.digest);
        input.callback(title, hashOutput);
        return;
    }
    if (http.test(input.source as string) === true) {
        get(input.source as string, function terminal_commands_library_hash_get(fileData:Buffer|string) {
            const hash:Hash = createHash(input.algorithm),
                output:hash_output = {
                    filePath: input.source as string,
                    hash: ""
                };
            hash.update(fileData);
            output.hash = hash.digest(input.digest);
            input.callback(title, output);
        });
    } else {
        exec("ulimit -n", function terminal_commands_library_hash_ulimit(ulimit_err:Error, ulimit_out:string) {
            if (ulimit_err === null && ulimit_out !== "unlimited" && isNaN(Number(ulimit_out)) === false) {
                limit = Number(ulimit_out);
                shortLimit = Math.ceil(limit / 5);
            }
            stat(input.source, function terminal_commands_library_hash_stat(ers:NodeJS.ErrnoException, stats:Stats):void {
                if (ers === null) {
                    if (stats.isDirectory() === true || input.parent === undefined || (input.parent !== undefined && typeof input.id === "string" && input.id.length > 0)) {
                        // not coming from the directory library.  The directory library will always pass a parent property and not an id property
                        const dirConfig:config_command_directory = {
                            callback: function terminal_commands_library_hash_stat_dirCallback(title:string, text:string[], list:directory_list|string[]) {
                                const dir:directory_list = list as directory_list;
                                dirComplete(dir);
                            },
                            depth: 0,
                            exclusions: vars.terminal.exclusions,
                            mode: "read",
                            path: input.source as string,
                            search: "",
                            symbolic: true
                        };
                        directory(dirConfig);
                    } else {
                        // coming from the directory library
                        dirComplete([[input.source as string, "file", "", input.parent, 0, input.stat, ""]]);
                    }
                } else {
                    if (ers.code === "ENOENT") {
                        error([
                            `File path ${vars.text.angry + input.source + vars.text.none} is not a file or directory.`,
                            `See ${vars.text.cyan + vars.terminal.command_instruction} commands hash${vars.text.none} for examples.`
                        ], null, true);
                    } else {
                        error([`Error retrieving stat from ${input.source}`], ers);
                    }
                }
            });
        });
    }
};

export default hash;