
/* lib/terminal/commands/library/base64 - A utility for performing base64 encoding/decoding. */

import error from "../../utilities/error.js";
import get from "./get.js";
import node from "../../utilities/node.js";
import remove from "./remove.js";
import vars from "../../utilities/vars.js";

// simple base64 encode/decode
const base64 = function terminal_commands_library_base64(input:config_command_base64):void {
        let http:boolean = false,
            path:string = input.source;
        const title:string = `Base64 ${input.direction.charAt(0).toUpperCase() + input.direction.slice(1)}`,
            fromString = function terminal_commands_library_base64_fromString(getTitle:string, message:Buffer|string):void {
                const outputString:string = (input.direction === "decode")
                    ? Buffer.from(message.toString(), "base64").toString("utf8")
                    : Buffer.from(message.toString()).toString("base64");
                input.callback(title, {
                    base64: outputString,
                    filePath: input.source,
                    id: input.id
                });
            },
            fileWrapper = function terminal_commands_library_base64_fileWrapper(filePath:string):void {
                node.fs.stat(filePath, function terminal_commands_library_base64_fileWrapper_stat(er:Error, stat:node_fs_Stats):void {
                    const angryPath:string = `File path ${vars.text.angry + filePath + vars.text.none} is not a file or directory.`,
                        file = function terminal_commands_library_base64_fileWrapper_stat_file():void {
                            node.fs.open(filePath, "r", function terminal_commands_library_base64_fileWrapper_stat_file_open(ero:Error, fd:number):void {
                                const buff:Buffer = Buffer.alloc(Number(stat.size));
                                if (ero !== null) {
                                    if (http === true) {
                                        remove(filePath, [], function terminal_commands_library_base64_fileWrapper_stat_file_open_removeCallback():void {
                                            return;
                                        });
                                    }
                                    error([`Error opening ${filePath}`], ero);
                                    if (vars.environment.command !== "service") {
                                        return;
                                    }
                                }
                                node.fs.read(fd, buff, 0, stat.size, 0, function terminal_commands_library_base64_fileWrapper_stat_file_open_read(err:Error, bytes:number, buffer:Buffer):number {
                                    if (http === true) {
                                        remove(filePath, [], function terminal_commands_library_base64_fileWrapper_stat_file_open_read_callback():void {
                                            return;
                                        });
                                    }
                                    if (err !== null) {
                                        error([`Error reading file stream on ${filePath}`], err);
                                        if (vars.environment.command !== "service") {
                                            return;
                                        }
                                    }
                                    const outputString:string = (input.direction === "decode")
                                        ? Buffer.from(buffer.toString("utf8"), "base64").toString("utf8")
                                        : buffer.toString("base64");
                                    input.callback(title, {
                                        base64: outputString,
                                        filePath: input.source,
                                        id: input.id
                                    });
                                });
                            });
                        };
                    if (er !== null) {
                        if (http === true) {
                            remove(filePath, [], function terminal_commands_library_base64_fileWrapper_stat_removeHttp1():void {
                                return;
                            });
                        }
                        if (er.toString().indexOf("no such file or directory") > 0) {
                            error([angryPath], er);
                            if (vars.environment.command !== "service") {
                                return;
                            }
                        }
                        error([`Error executing stat on ${filePath}`], er);
                        if (vars.environment.command !== "service") {
                            return;
                        }
                    }
                    if (stat === undefined) {
                        if (http === true) {
                            remove(filePath, [], function terminal_commands_library_base64_fileWrapper_stat_removeHttp2():void {
                                return;
                            });
                        }
                        error([angryPath], null);
                        if (vars.environment.command !== "service") {
                            return;
                        }
                    }
                    if (stat.isFile() === true) {
                        file();
                    }
                });
            };
        if (path === undefined) {
            error([`No path to encode.  Please see ${vars.text.cyan + vars.terminal.command_instruction}commands base64${vars.text.none} for examples.`], null);
            return;
        }
        if (path.indexOf("string:") === 0) {
            path = path.replace("string:", "");
            if (path.charAt(0) === "\"" && path.charAt(path.length - 1) === "\"") {
                path.slice(1, path.length - 1);
            } else if (path.charAt(0) === "'" && path.charAt(path.length - 1) === "'") {
                path.slice(1, path.length - 1);
            }
            fromString("", path);
            return;
        }
        if ((/https?:\/\//).test(path) === true) {
            http = true;
            get(path, fromString);
        } else {
            fileWrapper(path);
        }
    };

export default base64;