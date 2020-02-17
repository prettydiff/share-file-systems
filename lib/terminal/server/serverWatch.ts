
import directory from "../directory.js";
import error from "../error.js";
import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const serverWatch = function terminal_server_watch(type:"rename"|"change", filename:string|null):void {
        const extension:string = (function terminal_server_watch_extension():string {
                if (filename === null) {
                    return "";
                }
                const list = filename.split(".");
                return list[list.length - 1];
            }()),
            time = function terminal_server_watch_time(message:string):number {
                const date:Date = new Date(),
                    dateArray:string[] = [];
                let hours:string = String(date.getHours()),
                    minutes:string = String(date.getMinutes()),
                    seconds:string = String(date.getSeconds()),
                    milliSeconds:string = String(date.getMilliseconds());
                if (hours.length === 1) {
                    hours = `0${hours}`;
                }
                if (minutes.length === 1) {
                    minutes = `0${minutes}`;
                }
                if (seconds.length === 1) {
                    seconds = `0${seconds}`;
                }
                if (milliSeconds.length < 3) {
                    do {
                        milliSeconds = `0${milliSeconds}`;
                    } while (milliSeconds.length < 3);
                }
                dateArray.push(hours);
                dateArray.push(minutes);
                dateArray.push(seconds);
                dateArray.push(milliSeconds);
                log([`[${vars.text.cyan + dateArray.join(":") + vars.text.none}] ${message}`]);
                serverVars.timeStore = date.valueOf();
                return serverVars.timeStore;
            },
            ignore   = function terminal_server_watch_ignore(input:string|null):boolean {
                if (input.indexOf(".git") === 0) {
                    return true;
                }
                if (input.indexOf("node_modules") === 0) {
                    return true;
                }
                if (input.indexOf("js") === 0) {
                    return true;
                }
                return false;
            };
        if (filename === null || ignore(filename) === true || filename.indexOf("storage") === 0 || filename.indexOf(".git") === 0) {
            return;
        }console.log(filename);
        if (extension === "ts" && serverVars.timeStore < Date.now() - 1000) {
            let start:number,
                compile:number,
                duration = function terminal_server_watch_duration(length:number):void {
                    let hours:number = 0,
                        minutes:number = 0,
                        seconds:number = 0,
                        list:string[] = [];
                    if (length > 3600000) {
                        hours = Math.floor(length / 3600000);
                        length = length - (hours * 3600000);
                    }
                    list.push(hours.toString());
                    if (list[0].length < 2) {
                        list[0] = `0${list[0]}`;
                    }
                    if (length > 60000) {
                        minutes = Math.floor(length / 60000);
                        length = length - (minutes * 60000);
                    }
                    list.push(minutes.toString());
                    if (list[1].length < 2) {
                        list[1] = `0${list[1]}`;
                    }
                    if (length > 1000) {
                        seconds = Math.floor(length / 1000);
                        length = length - (seconds * 1000);
                    }
                    list.push(seconds.toString());
                    if (list[2].length < 2) {
                        list[2] = `0${list[2]}`;
                    }
                    list.push(length.toString());
                    if (list[3].length < 3) {
                        do {
                            list[3] = `0${list[3]}`;
                        } while (list[3].length < 3);
                    }
                    log([`[${vars.text.bold + vars.text.purple + list.join(":") + vars.text.none}] Total compile time.\u0007`]);
                };
            log([""]);
            start = time(`Compiling for ${vars.text.green + filename + vars.text.none}`);
            vars.node.child(`${vars.version.command} build incremental`, {
                cwd: vars.projectPath
            }, function terminal_server_watch_child(err:Error, stdout:string, stderr:string):void {
                if (err !== null) {
                    log([err.toString()]);
                    error([err.toString()]);
                    return;
                }
                if (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0) {
                    log([stderr]);
                    error([stderr]);
                    return;
                }
                log([stdout]);
                compile = time("TypeScript Compiled") - start;
                duration(compile);
                vars.ws.broadcast("reload");
                return;
            });
        } else if (extension === "css" || extension === "xhtml") {
            vars.ws.broadcast("reload");
        } else {
            const fsUpdateCallback = function terminal_server_watch_projectPath(result:directoryList):void {
                vars.ws.broadcast(JSON.stringify({
                    "fs-update-local": result
                }));
            };
            directory({
                callback: fsUpdateCallback,
                depth: 2,
                exclusions: [],
                mode: "read",
                path: vars.projectPath,
                symbolic: true
            });
        }
    };

export default serverWatch;