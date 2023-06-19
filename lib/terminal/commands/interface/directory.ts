/* lib/terminal/commands/interface/directory - Shell interface to the directory library that walks the file system and returns a data structure. */

import common from "../../../common/common.js";
import directory from "../library/directory.js";
import log from "../../utilities/log.js";
import node from "../../utilities/node.js";
import vars from "../../utilities/vars.js";

const interfaceDirectory = function terminal_commands_interface_directory(callback:commandCallback):void {
    let search:string = "";
    const config:config_command_directory = {
        callback: function terminal_commands_directory_callback(title:string, text:[string, number], result:directory_list|string[]):void {
            const count:number = (result === null)
                    ? 0
                    : result.length,
                summary:string = text[0],
                output:string[] = (config.mode === "list")
                    ? result as string[]
                    : [];
            if (config.mode ==="type") {
                if (vars.settings.verbose === true) {
                    log.title(title);
                    log([text[0]], true);
                    return;
                }
                log([text[0]]);
                return;
            }
            if (config.mode === "list") {
                let a:number = count,
                    item:string;
                const size = function terminal_commands_directory_callback_size(comma:string):string {
                    let difference:number = Number(text[1]) - comma.length;
                    if (difference > 0) {
                        do {
                            difference = difference - 1;
                            comma = ` ${comma}`;
                        } while (difference > 0);
                    }
                    return comma;
                };
                if (a > 0) {
                    do {
                        a = a - 1;
                        item = result[a] as string;
                        result[a] = item.replace(/\d+(,\d+)*/, size);
                    } while (a > 0);
                }
            }
            if (vars.settings.verbose === true) {
                if (config.mode !== "list") {
                    output.push(JSON.stringify(common.sortFileList(result as directory_list, config.path, sortName)));
                }
                output.push("");
                output.push(`${vars.environment.name} found ${vars.text.green + common.commas(count) + vars.text.none} matching items from address:`);
                output.push(vars.text.cyan + config.path + vars.text.none);
                output.push(summary);
                callback(title, output, null);
            } else if (config.mode === "list") {
                callback("", result as string[], null);
            } else {
                callback("", [JSON.stringify(common.sortFileList(result as directory_list, config.path, sortName))], null);
            }
        },
        depth: (function terminal_commands_directory_depth():number {
            let b:number = 0;
            do {
                if ((/^depth:\d+$/).test(process.argv[b]) === true) {
                    const depth:number = Number(process.argv[b].replace("depth:", ""));
                    process.argv.splice(b, 1);
                    return depth;
                }
                b = b + 1;
            } while (b < process.argv.length);
            return 0;
        }()),
        exclusions: vars.terminal.exclusions,
        mode: (function terminal_commands_directory_mode():directory_mode {
            let b:number = 0;
            do {
                if ((/^mode:/).test(process.argv[b]) === true) {
                    if (process.argv[b].indexOf("array") > 0) {
                        process.argv.splice(b, 1);
                        return "array";
                    }
                    if (process.argv[b].indexOf("hash") > 0) {
                        process.argv.splice(b, 1);
                        return "hash";
                    }
                    if (process.argv[b].indexOf("list") > 0) {
                        process.argv.splice(b, 1);
                        return "list";
                    }
                    if (process.argv[b].indexOf("read") > 0) {
                        process.argv.splice(b, 1);
                        return "read";
                    }
                    if (process.argv[b].indexOf("type") > 0) {
                        process.argv.splice(b, 1);
                        return "type";
                    }
                }
                if ((/^search:/).test(process.argv[b]) === true) {
                    search = process.argv[b].replace("search:", "");
                    if ((search.charAt(0) === "\"" && search.charAt(search.length - 1) === "\"") || (search.charAt(0) === "'" && search.charAt(search.length - 1) === "'")) {
                        search = search.slice(1, search.length - 1);
                    }
                    process.argv.splice(b, 1);
                    return "search";
                }
                if (process.argv[b] === "array") {
                    process.argv.splice(b, 1);
                    return "array";
                }
                if (process.argv[b] === "hash") {
                    process.argv.splice(b, 1);
                    return "hash";
                }
                if (process.argv[b] === "list") {
                    process.argv.splice(b, 1);
                    return "list";
                }
                if (process.argv[b] === "read") {
                    process.argv.splice(b, 1);
                    return "read";
                }
                if (process.argv[b] === "type" || process.argv[b] === "typeof") {
                    process.argv.splice(b, 1);
                    return "type";
                }
                b = b + 1;
            } while (b < process.argv.length);
            return "read";
        }()),
        path: (function terminal_commands_interface_directory_path():string {
            const resolved = function terminal_commands_interface_directory_path_resolved(input:string):string {
                    if ((/^\w:$/).test(input) === true) {
                        return `${input}\\`;
                    }
                    if (input === "\\" || input === "\\\\") {
                        return "\\";
                    }
                    return node.path.resolve(input);
                },
                len:number = process.argv.length;
            let a:number = 0;
            if (process.argv.length < 1) {
                return resolved(vars.terminal.cwd);
            }
            do {
                if (process.argv[a].indexOf("source:") === 0) {
                    return resolved(process.argv[a].replace(/source:("|')?/, "").replace(/("|')$/, ""));
                }
                a = a + 1;
            } while (a < len);
            return resolved(process.argv[0]);
            //return resolved(args.path);
        }()),
        search: search,
        symbolic: (function terminal_commands_directory_symbolic():boolean {
            const symbol:number = process.argv.indexOf("symbolic");
            if (symbol < 0) {
                return false;
            }
            process.argv.splice(symbol, 1);
            return true;
        }())
    },
    sortName:fileSort = (function terminal_commands_directory_symbolic():fileSort {
        const sortList:fileSort[] = [
                "alphabetically-ascending",
                "alphabetically-descending",
                "file-extension",
                "file-modified-ascending",
                "file-modified-descending",
                "file-system-type",
                "size-ascending",
                "size-descending"
            ],
            defaultValue:fileSort = "alphabetically-ascending";
        let a:number = process.argv.length,
            sortValue:fileSort;
        if (a > 0) {
            do {
                a = a - 1;
                if (process.argv[a].indexOf("sort:") === 0) {
                    sortValue = process.argv[a].replace(/^sort:\s*/, "").replace(/\s+/g, "-").toLowerCase() as fileSort;
                    if (sortList.indexOf(sortValue) > -1) {
                        return sortValue;
                    }
                    return defaultValue;
                }
            } while (a > 0);
        }
        return defaultValue;
    }());
    directory(config);
};

export default interfaceDirectory;