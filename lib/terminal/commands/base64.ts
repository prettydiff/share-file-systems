
/* lib/terminal/commands/base64 - A command driven utility for performing base64 encoding/decoding. */
import { Stats } from "fs";

import error from "../utilities/error.js";
import get from "./get.js";
import log from "../utilities/log.js";
import remove from "./remove.js";
import vars from "../utilities/vars.js";

// simple base64 encode/decode
const base64 = function terminal_commands_base64(input:base64Input):void {
        let direction:"encode"|"decode" = (function terminal_commands_base64_direction():"encode"|"decode" {
                const decode:number = process.argv.indexOf("decode"),
                    encode:number = process.argv.indexOf("encode");
                if (vars.command === "base64") {
                    if (vars.verbose === true) {
                        log.title("Base64");
                    }
                    input = {
                        callback: function terminal_commands_base64_direction_callback(output:string[]):void {
                            log(output);
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
        const screen = function terminal_commands_base64_screen(string:string) {
                const output = (direction === "decode")
                    ? Buffer.from(string, "base64").toString("utf8")
                    : Buffer.from(string).toString("base64");
                vars.testLogger("base64", "screen", "writing output to terminal.");
                log([output]);
            },
            fileWrapper = function terminal_commands_base64_fileWrapper(filePath):void {
                vars.testLogger("base64", "fileWrapper", "stat the file path to ensure it exists.");
                vars.node.fs.stat(filePath, function terminal_commands_base64_fileWrapper_stat(er:Error, stat:Stats):void {
                    const angryPath:string = `File path ${vars.text.angry + filePath + vars.text.none} is not a file or directory.`,
                        file = function terminal_commands_base64_fileWrapper_stat_file():void {
                            vars.testLogger("base64", "file", "file path points to a file, so now to open it as a byte stream.");
                            vars.node.fs.open(filePath, "r", function terminal_commands_base64_fileWrapper_stat_file_open(ero:Error, fd:number):void {
                                let buff  = Buffer.alloc(stat.size);
                                if (ero !== null) {
                                    if (http === true) {
                                        remove(filePath, function terminal_commands_base64_fileWrapper_stat_file_open_removeCallback():void {
                                            return;
                                        });
                                    }
                                    error([ero.toString()]);
                                    if (vars.command !== "service") {
                                        return;
                                    }
                                }
                                vars.testLogger("base64", "open", "reading the file from the opened stream.");
                                vars.node.fs.read(
                                        fd,
                                        buff,
                                        0,
                                        stat.size,
                                        0,
                                        function terminal_commands_base64_fileWrapper_stat_file_open_read(err:Error, bytes:number, buffer:Buffer):number {
                                            if (http === true) {
                                                remove(filePath, function terminal_commands_base64_fileWrapper_stat_file_open_read_callback():void {
                                                    return;
                                                });
                                            }
                                            if (err !== null) {
                                                error([err.toString()]);
                                                if (vars.command !== "service") {
                                                    return;
                                                }
                                            }
                                            vars.testLogger("base64", "read", "file is read from stream.  Now to determine if operation is 'decode' or 'encode' and then output the result.");
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
                                                const outputConfiguration:base64Output = {
                                                    base64: output,
                                                    filePath: input.source,
                                                    id: input.id
                                                };
                                                input.callback(outputConfiguration);
                                            }
                                        }
                                    );
                            });
                        };
                    if (er !== null) {
                        if (http === true) {
                            remove(filePath, function terminal_commands_base64_fileWrapper_stat_removeHttp1():void {
                                return;
                            });
                        }
                        if (er.toString().indexOf("no such file or directory") > 0) {
                            error([angryPath]);
                            if (vars.command !== "service") {
                                return;
                            }
                        }
                        error([er.toString()]);
                        if (vars.command !== "service") {
                            return;
                        }
                    }
                    if (stat === undefined) {
                        if (http === true) {
                            remove(filePath, function terminal_commands_base64_fileWrapper_stat_removeHttp2():void {
                                return;
                            });
                        }
                        error([angryPath]);
                        if (vars.command !== "service") {
                            return;
                        }
                    }
                    if (stat.isFile() === true) {
                        file();
                    }
                });
            };
        if (path === undefined) {
            vars.testLogger("base64", "no path", `no path to encode.  Please see ${vars.text.cyan + vars.version.command} commands base64${vars.text.none} for examples.`);
            error([`No path to encode.  Please see ${vars.text.cyan + vars.version.command} commands base64${vars.text.none} for examples.`]);
            return;
        }
        if (path.indexOf("string:") === 0) {
            vars.testLogger("base64", "direct input", "detected argument beginning with 'string:' which means to read from standard input and write to standard output.");
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
            vars.testLogger("base64", "http", "fetching source material from HTTP(S).");
            http = true;
            get(path, screen);
        } else {
            vars.testLogger("base64", "file path", "source material is not standard input or from HTTP(S) so presuming a file path.");
            fileWrapper(path);
        }
    };

export default base64;