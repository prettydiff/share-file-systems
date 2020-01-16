
import { Stats } from "fs";

import error from "./error.js";
import get from "./get.js";
import log from "./log.js";
import remove from "./remove.js";
import vars from "./vars.js";

// simple base64 encode/decode
const library = {
        error: error,
        get: get,
        log: log,
        remove: remove
    },
    base64 = function terminal_base64(input:base64Input):void {
        let direction:"encode"|"decode" = (function terminal_base64_direction():"encode"|"decode" {
                const decode:number = process.argv.indexOf("decode"),
                    encode:number = process.argv.indexOf("encode");
                if (vars.command === "base64") {
                    input = {
                        callback: function terminal_base64_callback(output:string[]):void {
                            library.log(output);
                        },
                        id: "",
                        source: (decode === 0 || encode === 0)
                            ? process.argv[1]
                            : process.argv[0]
                    };
                }
                if (decode > -1) {
                    process.argv.splice(decode, 1);
                    if (encode > -1) {
                        process.argv.splice(encode, 1);
                    }
                    return "decode";
                }
                if (encode > -1) {
                    process.argv.splice(encode, 1);
                }
                return "encode";
            }()),
            http:boolean = false,
            path:string = input.source;
        const screen = function terminal_base64_screen(string:string) {
                const output = (direction === "decode")
                    ? Buffer.from(string, "base64").toString("utf8")
                    : Buffer.from(string).toString("base64");
                library.log([output]);
            },
            fileWrapper = function terminal_base64_fileWrapper(filePath):void {
                vars
                .node
                .fs
                .stat(filePath, function terminal_base64_fileWrapper_stat(er:Error, stat:Stats):void {
                    const angryPath:string = `file path ${vars.text.angry + filePath + vars.text.none} is not a file or directory.`,
                        file = function terminal_base64_fileWrapper_stat_file():void {
                            vars
                            .node
                            .fs
                            .open(filePath, "r", function terminal_base64_fileWrapper_stat_file_open(ero:Error, fd:number):void {
                                let buff  = Buffer.alloc(stat.size);
                                if (ero !== null) {
                                    if (http === true) {
                                        library.remove(filePath, function terminal_base64_fileWrapper_stat_file_open_removeCallback():void {
                                            return;
                                        });
                                    }
                                    library.error([ero.toString()]);
                                    if (vars.command !== "server") {
                                        return;
                                    }
                                }
                                vars
                                    .node
                                    .fs
                                    .read(
                                        fd,
                                        buff,
                                        0,
                                        stat.size,
                                        0,
                                        function terminal_base64_fileWrapper_stat_file_open_read(err:Error, bytes:number, buffer:Buffer):number {
                                            if (http === true) {
                                                library.remove(filePath, function terminal_base64_fileWrapper_stat_file_open_read_callback():void {
                                                    return;
                                                });
                                            }
                                            if (err !== null) {
                                                library.error([err.toString()]);
                                                if (vars.command !== "server") {
                                                    return;
                                                }
                                            }
                                            const output = (direction === "decode")
                                                ? Buffer.from(buffer.toString("utf8"), "base64").toString("utf8")
                                                : buffer.toString("base64");
                                            if (vars.command === "base64") {
                                                    if (vars.verbose === true) {
                                                        const list:string[] = [output];
                                                        list.push("");
                                                        list.push(`from ${vars.text.angry + filePath + vars.text.none}`);
                                                        input.callback(list);
                                                    } else {
                                                        input.callback([output]);
                                                    }
                                            } else {
                                                input.callback({
                                                    base64: output,
                                                    filePath: input.source,
                                                    id: input.id
                                                });
                                            }
                                        }
                                    );
                            });
                        };
                    if (er !== null) {
                        if (http === true) {
                            library.remove(filePath, function terminal_base64_fileWrapper_stat_callback1():void {
                                return;
                            });
                        }
                        if (er.toString().indexOf("no such file or directory") > 0) {
                            library.error([angryPath]);
                            if (vars.command !== "server") {
                                return;
                            }
                        }
                        library.error([er.toString()]);
                        if (vars.command !== "server") {
                            return;
                        }
                    }
                    if (stat === undefined) {
                        if (http === true) {
                            library.remove(filePath, function terminal_base64_fileWrapper_stat_callback2():void {
                                return;
                            });
                        }
                        library.error([angryPath]);
                        if (vars.command !== "server") {
                            return;
                        }
                    }
                    if (stat.isFile() === true) {
                        file();
                    }
                });
            };
        if (path === undefined) {
            library.error([`No path to encode.  Please see ${vars.text.cyan + vars.version.command} commands base64${vars.text.none} for examples.`]);
            return;
        }
        if (path.indexOf("string:") === 0) {
            path = path.replace("string:", "");
            if (path.charAt(0) === "\"" && path.charAt(path.length - 1) === "\"") {
                path.slice(1, path.length - 1);
            } else if (path.charAt(0) === "'" && path.charAt(path.length - 1) === "'") {
                path.slice(1, path.length - 1);
            }
            screen(path);
            return;
        }
        if ((/https?:\/\//).test(path) === true) {
            http = true;
            library.get(path, screen);
        } else {
            fileWrapper(path);
        }
    };

export default base64;