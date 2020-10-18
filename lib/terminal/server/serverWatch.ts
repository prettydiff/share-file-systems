
/* lib/terminal/server/serverWatch - A library that establishes a file system watch respective to the application itself. */
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import serverVars from "./serverVars.js";

const serverWatch = function terminal_server_watch(type:"rename"|"change", filename:string|null):void {
    const extension:string = (function terminal_server_watch_extension():string {
            if (filename === null) {
                return "";
            }
            const list = filename.split(".");
            return list[list.length - 1];
        }()),
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
    if (filename === null || ignore(filename) === true || filename.indexOf(`lib${vars.sep}storage`) === 0 || filename.indexOf(".git") === 0) {
        return;
    }
    vars.testLogger("serverWatch", "", "Establishing watch for application components to refresh the page or compile updated code.");
    if (extension === "ts" && serverVars.timeStore < Date.now() - 1000) {
        const time = function terminal_server_watch_time(message:string, build:boolean):void {
            const date:Date = new Date(),
                dateArray:string[] = [],
                output:string[] = [],
                duration = function terminal_server_watch_duration():void {
                    let hours:number = 0,
                        minutes:number = 0,
                        seconds:number = 0,
                        span:number = date.valueOf() - serverVars.timeStore,
                        list:string[] = [];
                    if (span > 3600000) {
                        hours = Math.floor(span / 3600000);
                        span = span - (hours * 3600000);
                    }
                    list.push(hours.toString());
                    if (list[0].length < 2) {
                        list[0] = `0${list[0]}`;
                    }
                    if (span > 60000) {
                        minutes = Math.floor(span / 60000);
                        span = span - (minutes * 60000);
                    }
                    list.push(minutes.toString());
                    if (list[1].length < 2) {
                        list[1] = `0${list[1]}`;
                    }
                    if (span > 1000) {
                        seconds = Math.floor(span / 1000);
                        span = span - (seconds * 1000);
                    }
                    list.push(seconds.toString());
                    if (list[2].length < 2) {
                        list[2] = `0${list[2]}`;
                    }
                    list.push(span.toString());
                    if (list[3].length < 3) {
                        do {
                            list[3] = `0${list[3]}`;
                        } while (list[3].length < 3);
                    }
                    output.push(`[${vars.text.bold + vars.text.purple + list.join(":") + vars.text.none}] Total compile time.\u0007`);
                };
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
            output.push(`[${vars.text.cyan + dateArray.join(":") + vars.text.none}] ${message}`);
            if (build === true) {
                duration();
            }
            log(output);
            serverVars.timeStore = date.valueOf();
        };
        log([""]);
        time(`Compiling for ${vars.text.green + filename + vars.text.none}`, false);
        vars.node.child(`${vars.version.command} build incremental`, {
            cwd: vars.projectPath
        }, function terminal_server_watch_child(err:Error, stdout:string, stderr:string):void {
            if (err !== null) {
                error([err.toString()]);
                return;
            }
            if (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0) {
                error([stderr]);
                return;
            }
            log([stdout]);
            time("TypeScript Compiled", true);
            vars.ws.broadcast("reload");
            return;
        });
    } else if (extension === "css" || extension === "xhtml") {
        vars.ws.broadcast("reload");
    } else {
        const fsUpdateCallback = function terminal_server_watch_projectPath(result:directoryList):void {
                if (vars.command !== "test_browser") {
                    vars.ws.broadcast(JSON.stringify({
                        "fs-update-local": result
                    }));
                }
            },
            dirConfig:readDirectory = {
                callback: fsUpdateCallback,
                depth: 2,
                exclusions: [],
                logRecursion: false,
                mode: "read",
                path: vars.projectPath,
                symbolic: true
            };
        directory(dirConfig);
    }
};

export default serverWatch;