/*jslint node:true */
/*eslint-env node*/
/*eslint no-console: 0*/

import * as http from "http";
import { Stream, Writable } from "stream";
import { Hash } from "crypto";
import { Socket } from "net";
import { NetworkInterfaceInfo } from "os";
interface socketList {
    [key:string]: Socket;
}

(function init() {
    // eslint-disable-next-line
    "use strict";
    let verbose:boolean = false,
        ws:any;
    const startTime:[number, number]      = process.hrtime(),
        node:any = {
            child : require("child_process").exec,
            crypto: require("crypto"),
            fs    : require("fs"),
            http  : require("http"),
            https : require("https"),
            net   : require("net"),
            os    : require("os"),
            path  : require("path")
        },
        sep:string = node.path.sep,
        projectPath:string = (function node_project() {
            const dirs:string[] = __dirname.split(sep);
            return dirs.slice(0, dirs.length - 1).join(sep) + sep;
        }());
        
    node.fs.readFile(`${projectPath}version.json`, "utf8", function node_version(er:Error, versionFile:string):void {
        const version:version = JSON.parse(versionFile),
            text:any     = {
                angry    : "\u001b[1m\u001b[31m",
                blue     : "\u001b[34m",
                bold     : "\u001b[1m",
                boldLine : "\u001b[1m\u001b[4m",
                clear    : "\u001b[24m\u001b[22m",
                cyan     : "\u001b[36m",
                green    : "\u001b[32m",
                noColor  : "\u001b[39m",
                none     : "\u001b[0m",
                purple   : "\u001b[35m",
                red      : "\u001b[31m",
                underline: "\u001b[4m",
                yellow   : "\u001b[33m"
            },
            cli:string = process.argv.join(" "),
            cwd:string = __dirname.replace(/(\/|\\)js$/, ""),
            js:string = `${projectPath}js${sep}`,
            commands:commandList = {
                base64: {
                    description: "Convert a file or string into a base64 encoding.",
                    example: [
                        {
                            code: `${version.command} base64 encode string:"my string to encode"`,
                            defined: "Converts the provided string into a base64 encoding."
                        },
                        {
                            code: `${version.command} base64 encode path/to/file`,
                            defined: "Converts the provided file into a base64 encoding."
                        },
                        {
                            code: `${version.command} base64 encode http://file.from.internet.com`,
                            defined: "Reads a file from a URI and outputs a base64 encoding."
                        },
                        {
                            code: `${version.command} base64 decode string:"a big base64 string"`,
                            defined: "Decodes base64 strings into decoded output."
                        }
                    ]
                },
                build: {
                    description: "Rebuilds the application.",
                    example: [
                        {
                            code: `${version.command} build`,
                            defined: "Compiles from TypeScript into JavaScript and puts libraries together."
                        },
                        {
                            code: `${version.command} build incremental`,
                            defined: "Use the TypeScript incremental build, which takes about half the time."
                        },
                        {
                            code: `${version.command} build local`,
                            defined: "The default behavior assumes TypeScript is installed globally. Use the 'local' argument if TypeScript is locally installed in node_modules."
                        }
                    ]
                },
                commands: {
                    description: "List all supported commands to the console or examples of a specific command.",
                    example: [
                        {
                            code: `${version.command} commands`,
                            defined: "Lists all commands and their definitions to the shell."
                        },
                        {
                            code: `${version.command} commands directory`,
                            defined: "Details the mentioned command with examples."
                        }
                    ]
                },
                copy: {
                    description: "Copy files or directories from one location to another on the local file system.",
                    example: [
                        {
                            code: `${version.command} copy source/file/or/directory destination/path`,
                            defined: "Copies the file system artifact at the first address to the second address."
                        },
                        {
                            code: `${version.command} copy "C:\\Program Files" destination\\path`,
                            defined: "Quote values that contain non-alphanumeric characters."
                        },
                        {
                            code: `${version.command} copy source destination ignore [build, .git, node_modules]`,
                            defined: "Exclusions are permitted as a comma separated list in square brackets following the ignore keyword."
                        },
                        {
                            code: `${version.command} copy source destination ignore[build, .git, node_modules]`,
                            defined: "A space between the 'ignore' keyword and the opening square brace is optional."
                        },
                        {
                            code: `${version.command} copy ../sparser ../sparserXX ignore [build, .git, node_modules]`,
                            defined: "Exclusions are relative to the source directory."
                        }
                    ]
                },
                directory: {
                    description: "Traverses a directory in the local file system and generates a list.",
                    example: [
                        {
                            code: `${version.command} directory source:"my/directory/path"`,
                            defined: "Returns an array where each index is an array of [absolute path, type, parent index, file count, stat]. Type can refer to 'file', 'directory', or 'link' for symbolic links.  The parent index identify which index in the array is the objects containing directory and the file count is the number of objects a directory type object contains."
                        },
                        {
                            code: `${version.command} directory source:"my/directory/path" shallow`,
                            defined: "Does not traverse child directories."
                        },
                        {
                            code: `${version.command} directory source:"my/directory/path" depth:9`,
                            defined: "The depth of child directories to traverse. The default value of 0 ignores any limit."
                        },
                        {
                            code: `${version.command} directory source:"my/directory/path" list`,
                            defined: "Returns an array of strings where each index is an absolute path"
                        },
                        {
                            code: `${version.command} directory source:"my/directory/path" symbolic`,
                            defined: "Identifies symbolic links instead of the object the links point to"
                        },
                        {
                            code: `${version.command} directory source:"my/directory/path" ignore [.git, node_modules, "program files"]`,
                            defined: "Sets an exclusion list of things to ignore"
                        },
                        {
                            code: `${version.command} directory source:"my/path" typeof`,
                            defined: "returns a string describing the artifact type"
                        }
                    ]
                },
                get: {
                    description: "Retrieve a resource via an absolute URI.",
                    example: [
                        {
                            code: `${version.command} get http://example.com/file.txt`,
                            defined: "Gets a resource from the web and prints the output to the shell."
                        },
                        {
                            code: `${version.command} get http://example.com/file.txt path/to/file`,
                            defined: "Get a resource from the web and writes the resource as UTF8 to a file at the specified path."
                        }
                    ]
                },
                hash: {
                    description: "Generate a SHA512 hash of a file or a string.",
                    example: [
                        {
                            code: `${version.command} hash path/to/file`,
                            defined: "Prints a SHA512 hash to the shell for the specified file's contents in the local file system."
                        },
                        {
                            code: `${version.command} hash verbose path/to/file`,
                            defined: "Prints the hash with file path and version data."
                        },
                        {
                            code: `${version.command} hash string "I love kittens."`,
                            defined: "Hash an arbitrary string directly from shell input."
                        },
                        {
                            code: `${version.command} hash https://prettydiff.com/`,
                            defined: "Hash a resource from the web."
                        },
                        {
                            code: `${version.command} hash path/to/directory`,
                            defined: "Directory hash recursively gathers all descendant artifacts and hashes the contents of each of those items that are files, hashes the paths of directories, sorts this list, and then hashes the list of hashes."
                        },
                        {
                            code: `${version.command} hash path/to/directory list`,
                            defined: "Returns a JSON string listing all scanned file system objects and each respective hash."
                        }
                    ]
                },
                help: {
                    description: `Introductory information to ${version.name} on the command line.`,
                    example: [{
                        code: `${version.command} help`,
                        defined: "Writes help text to shell."
                    }]
                },
                lint: {
                    description: "Use ESLint against all JavaScript files in a specified directory tree.",
                    example: [
                        {
                            code: `${version.command} lint ../tools`,
                            defined: "Lints all the JavaScript files in that location and in its subdirectories."
                        },
                        {
                            code: `${version.command} lint`,
                            defined: `Specifying no location defaults to the ${version.name} application directory.`
                        },
                        {
                            code: `${version.command} lint ../tools ignore [node_modules, .git, test, units]`,
                            defined: "An ignore list is also accepted if there is a list wrapped in square braces following the word 'ignore'."
                        }
                    ]
                },
                remove: {
                    description: "Remove a file or directory tree from the local file system.",
                    example: [
                        {
                            code: `${version.command} remove path/to/resource`,
                            defined: "Removes the specified resource."
                        },
                        {
                            code: `${version.command} remove "C:\\Program Files"`,
                            defined: "Quote the path if it contains non-alphanumeric characters."
                        }
                    ]
                },
                server: {
                    description: "Launches a HTTP service and web sockets so that the web tool is automatically refreshed once code changes in the local file system.",
                    example: [
                        {
                            code: `${version.command} server`,
                            defined: `Launches the server on default port ${version.port} and web sockets on port ${version.port + 1}.`
                        },
                        {
                            code: `${version.command} server 8080`,
                            defined: "If a numeric argument is supplied the web server starts on the port specified and web sockets on the following port."
                        },
                        {
                            code: `${version.command} server 0`,
                            defined: "To receive a random available port specify port number 0."
                        },
                        {
                            code: `${version.command} server browser`,
                            defined: "Launches the default location in the user's default web browser."
                        }
                    ]
                },
                simulation: {
                    description: "Launches a test runner to execute the various commands of the services file.",
                    example: [{
                        code: `${version.command} simulation`,
                        defined: "Runs tests against the commands offered by the services file."
                    }]
                },
                test: {
                    description: "Builds the application and then runs all the test commands",
                    example: [{
                        code: `${version.command} test`,
                        defined: "Runs all the tests in the test suite."
                    }]
                },
                version: {
                    description: "Prints the current version number and date of prior modification to the console.",
                    example: [{
                        code: `${version.command} version`,
                        defined: "Prints the current version number and date to the shell."
                    }]
                }
            },
            command:string = (function node_command():string {
                let comKeys:string[] = Object.keys(commands),
                    filtered:string[] = [],
                    a:number = 0,
                    b:number = 0;
                if (process.argv[2] === undefined) {
                    console.log("");
                    console.log("Shared spaces requires a command. Try:");
                    console.log(`${text.cyan + version.command} help${text.none}`);
                    console.log("");
                    console.log("To see a list of commands try:");
                    console.log(`${text.cyan + version.command} commands${text.none}`);
                    console.log("");
                    process.exit(1);
                    return;
                }
                const arg:string = process.argv[2],
                    boldArg:string = text.angry + arg + text.none,
                    len:number = arg.length + 1,
                    commandFilter = function node_command_commandFilter(item:string):boolean {
                        if (item.indexOf(arg.slice(0, a)) === 0) {
                            return true;
                        }
                        return false;
                    };
                
                if (process.argv[2] === "debug") {
                    process.argv = process.argv.slice(3);
                    return "debug";
                }
                process.argv = process.argv.slice(3);

                // trim empty values
                b = process.argv.length;
                if (b > 0) {
                    do {
                        process.argv[a] = process.argv[a].replace(/^-+/, "");
                        if (process.argv[a] === "verbose") {
                            verbose = true;
                            process.argv.splice(a, 1);
                            b = b - 1;
                            a = a - 1;
                        } else if (process.argv[a] === "") {
                            process.argv.splice(a, 1);
                            b = b - 1;
                            a = a - 1;
                        }
                        a = a + 1;
                    } while (a < b);
                }

                // filter available commands against incomplete input
                a = 1;
                do {
                    filtered = comKeys.filter(commandFilter);
                    a = a + 1;
                } while (filtered.length > 1 && a < len);

                if (filtered.length < 1 || (filtered[0] === "debug" && filtered.length < 2)) {
                    console.log(`Command ${boldArg} is not a supported command.`);
                    console.log("");
                    console.log("Please try:");
                    console.log(`${text.cyan + version.command} commands${text.none}`);
                    console.log("");
                    process.exit(1);
                    return "";
                }
                if (filtered.length > 1 && comKeys.indexOf(arg) < 0) {
                    console.log(`Command '${boldArg}' is ambiguous as it could refer to any of: [${text.cyan + filtered.join(", ") + text.none}]`);
                    process.exit(1);
                    return "";
                }
                if (arg !== filtered[0]) {
                    console.log("");
                    console.log(`${boldArg} is not a supported command. ${version.name} is assuming command ${text.bold + text.cyan + filtered[0] + text.none}.`);
                    console.log("");
                }
                return filtered[0];
            }()),
            exclusions = (function node_exclusions():string[] {
                const args = process.argv.join(" "),
                    match = args.match(/\signore\s*\[/);
                if (match !== null) {
                    const list:string[] = [],
                        listBuilder = function node_exclusions_listBuilder():void {
                            do {
                                if (process.argv[a] === "]" || process.argv[a].charAt(process.argv[a].length - 1) === "]") {
                                    if (process.argv[a] !== "]") {
                                        list.push(process.argv[a].replace(/,$/, "").slice(0, process.argv[a].length - 1));
                                    }
                                    process.argv.splice(ignoreIndex, (a + 1) - ignoreIndex);
                                    break;
                                }
                                list.push(process.argv[a].replace(/,$/, ""));
                                a = a + 1;
                            } while (a < len);
                        };
                    let a:number = 0,
                        len:number = process.argv.length,
                        ignoreIndex:number = process.argv.indexOf("ignore");
                    if (ignoreIndex > -1 && ignoreIndex < len - 1 && process.argv[ignoreIndex + 1].charAt(0) === "[") {
                        a = ignoreIndex + 1;
                        if (process.argv[a] !== "[") {
                            process.argv[a] = process.argv[a].slice(1).replace(/,$/, "");
                        }
                        listBuilder();
                    } else {
                        do {
                            if (process.argv[a].indexOf("ignore[") === 0) {
                                ignoreIndex = a;
                                break;
                            }
                            a = a + 1;
                        } while (a < len);
                        if (process.argv[a] !== "ignore[") {
                            process.argv[a] = process.argv[a].slice(7);
                            if (process.argv[a].charAt(process.argv[a].length - 1) === "]") {
                                list.push(process.argv[a].replace(/,$/, "").slice(0, process.argv[a].length - 1));
                            } else {
                                listBuilder();
                            }
                        }
                    }
                    return list;
                }
                return [];
            }()),
            flag:flags = {
                error: false,
                write: ""
            },
            binary_check:RegExp = (
                // eslint-disable-next-line
                /\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u000b|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001c|\u001d|\u001e|\u001f|\u007f|\u0080|\u0081|\u0082|\u0083|\u0084|\u0085|\u0086|\u0087|\u0088|\u0089|\u008a|\u008b|\u008c|\u008d|\u008e|\u008f|\u0090|\u0091|\u0092|\u0093|\u0094|\u0095|\u0096|\u0097|\u0098|\u0099|\u009a|\u009b|\u009c|\u009d|\u009e|\u009f/g
            ),
            apps:applications = {};
        if (er !== null) {
            apps.error([er.toString()]);
            return;
        }
        // simple base64 encode/decode
        apps.base64 = function node_apps_base64(filePath:string, callback:Function):void {
            let direction:string = (process.argv[0] === "encode" || process.argv[0] === "decode")
                    ? process.argv[0]
                    : "encode",
                http:boolean = false,
                path:string = (typeof filePath === "string")
                    ? filePath
                    : (process.argv[0] === "encode" || process.argv[0] === "decode")
                        ? process.argv[1]
                        : process.argv[0];
            const screen = function node_apps_base64_screen(string:string) {
                    const output = (direction === "decode")
                        ? Buffer.from(string, "base64").toString("utf8")
                        : Buffer.from(string).toString("base64");
                    apps.log([output]);
                },
                fileWrapper = function node_apps_base64_fileWrapper(filePath):void {
                    node
                    .fs
                    .stat(filePath, function node_apps_base64_fileWrapper_stat(er:Error, stat:Stats):void {
                        const angryPath:string = `file path ${text.angry + filePath + text.none} is not a file or directory.`,
                            file = function node_apps_base64_fileWrapper_stat_file():void {
                                node
                                .fs
                                .open(filePath, "r", function node_apps_base64_fileWrapper_stat_file_open(ero:Error, fd:number):void {
                                    let buff  = Buffer.alloc(stat.size);
                                    if (ero !== null) {
                                        if (http === true) {
                                            apps.remove(filePath);
                                        }
                                        apps.error([ero.toString()]);
                                        if (command !== "server") {
                                            return;
                                        }
                                    }
                                    node
                                        .fs
                                        .read(
                                            fd,
                                            buff,
                                            0,
                                            stat.size,
                                            0,
                                            function node_apps_base64_fileWrapper_stat_file_open_read(err:Error, bytes:number, buffer:Buffer):number {
                                                if (http === true) {
                                                    apps.remove(filePath);
                                                }
                                                if (err !== null) {
                                                    apps.error([err.toString()]);
                                                    if (command !== "server") {
                                                        return;
                                                    }
                                                }
                                                const output = (direction === "decode")
                                                    ? Buffer.from(buffer.toString("utf8"), "base64").toString("utf8")
                                                    : buffer.toString("base64");
                                                if (typeof callback === "function") {
                                                    callback(output);
                                                } else {
                                                    if (verbose === true) {
                                                        const list:string[] = [output];
                                                        list.push("");
                                                        list.push(`from ${text.angry + filePath + text.none}`);
                                                        apps.log(list);
                                                    } else {
                                                        apps.log([output]);
                                                    }
                                                }
                                            }
                                        );
                                });
                            };
                        if (er !== null) {
                            if (http === true) {
                                apps.remove(filePath);
                            }
                            if (er.toString().indexOf("no such file or directory") > 0) {
                                apps.error([angryPath]);
                                if (command !== "server") {
                                    return;
                                }
                            }
                            apps.error([er.toString()]);
                            if (command !== "server") {
                                return;
                            }
                        }
                        if (stat === undefined) {
                            if (http === true) {
                                apps.remove(filePath);
                            }
                            apps.error([angryPath]);
                            if (command !== "server") {
                                return;
                            }
                        }
                        if (stat.isFile() === true) {
                            file();
                        }
                    });
                };
            if (path === undefined) {
                apps.error([`No path to encode.  Please see ${text.cyan + version.command} commands base64${text.none} for examples.`]);
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
                apps.get(path, screen);
            } else {
                fileWrapper(path);
            }
        };
        // build/test system
        apps.build = function node_apps_build(test:boolean):void {
            let firstOrder:boolean = true,
                sectionTime:[number, number] = [0, 0];
            const order = {
                    build: [
                        "typescript",
                        "version"
                    ],
                    test: [
                        "lint",
                        "simulation"
                    ]
                },
                type:string = (test === true)
                    ? "test"
                    : "build",
                orderLength:number = order[type].length,
                // a short title for each build/test phase
                heading = function node_apps_build_heading(message:string):void {
                    if (firstOrder === true) {
                        console.log("");
                        firstOrder = false;
                    } else if (order[type].length < orderLength) {
                        console.log("________________________________________________________________________");
                        console.log("");
                    }
                    console.log(text.cyan + message + text.none);
                    console.log("");
                },
                // indicates how long each phase took
                sectionTimer = function node_apps_build_sectionTime(input:string):void {
                    let now:string[] = input.replace(`${text.cyan}[`, "").replace(`]${text.none} `, "").split(":"),
                        numb:[number, number] = [(Number(now[0]) * 3600) + (Number(now[1]) * 60) + Number(now[2].split(".")[0]), Number(now[2].split(".")[1])],
                        difference:[number, number],
                        times:string[] = [],
                        time:number = 0,
                        str:string = "";
                    difference = [numb[0] - sectionTime[0], (numb[1] + 1000000000) - (sectionTime[1] + 1000000000)];
                    sectionTime = numb;
                    if (difference[1] < 0) {
                        difference[0] = difference[0] - 1;
                        difference[1] = difference[1] + 1000000000;
                    }
                    if (difference[0] < 3600) {
                        times.push("00");
                    } else {
                        time = Math.floor(difference[0] / 3600);
                        difference[0] = difference[0] - (time * 3600);
                        if (time < 10) {
                            times.push(`0${time}`);
                        } else {
                            times.push(String(time));
                        }
                    }
                    if (difference[0] < 60) {
                        times.push("00");
                    } else {
                        time = Math.floor(difference[0] / 60);
                        difference[0] = difference[0] - (time * 60);
                        if (time < 10) {
                            times.push(`0${time}`);
                        } else {
                            times.push(String(time));
                        }
                    }
                    if (difference[0] < 1) {
                        times.push("00");
                    } else if (difference[0] < 10) {
                        times.push(`0${difference[0]}`);
                    } else {
                        times.push(String(difference[0]));
                    }
                    str = String(difference[1]);
                    if (str.length < 9) {
                        do {
                            str = `0${str}`;
                        } while (str.length < 9);
                    }
                    times[2] = `${times[2]}.${str}`;
                    console.log(`${text.cyan + text.bold}[${times.join(":")}]${text.none} ${text.green}Total section time.${text.none}`);
                },
                // the transition to the next phase or completion
                next = function node_apps_build_next(message:string):void {
                    let phase = order[type][0],
                        time:string = apps.humanTime(false);
                    if (message !== "") {
                        console.log(time + message);
                        sectionTimer(time);
                    }
                    if (order[type].length < 1) {
                        verbose = true;
                        heading(`${text.none}All ${text.green + text.bold + type + text.none} tasks complete... Exiting clean!\u0007`);
                        apps.log([""]);
                        process.exit(0);
                        return;
                    }
                    order[type].splice(0, 1);
                    phases[phase]();
                },
                // These are all the parts of the execution cycle, but their order is dictated by the 'order' object.
                phases = {
                    // phase lint is merely a call to apps.lint
                    lint     : function node_apps_build_lint():void {
                        const callback = function node_apps_build_lint_callback(message:string):void {
                            next(message);
                        };
                        heading("Linting");
                        apps.lint(callback);
                    },
                    // phase simulation is merely a call to apps.simulation
                    simulation: function node_apps_build_simulation():void {
                        const callback = function node_apps_build_simulation_callback(message:string):void {
                            next(message);
                        };
                        heading(`Simulations of Node.js commands from ${version.command}.js`);
                        apps.simulation(callback);
                    },
                    // phase typescript compiles the working code into JavaScript
                    typescript: function node_apps_build_typescript():void {
                        const flag = {
                                services: false,
                                typescript: false
                            },
                            incremental:string = (process.argv.indexOf("incremental") > -1)
                                ? "--incremental"
                                : "--pretty",
                            command:string = (process.argv.indexOf("local") > -1)
                                ? `node_modules\\.bin\\tsc ${incremental}`
                                : `tsc ${incremental}`,
                            ts = function node_apps_build_typescript_ts() {
                                node.child(command, {
                                    cwd: projectPath
                                }, function node_apps_build_typescript_callback(err:Error, stdout:string, stderr:string):void {
                                    const control:string = "\u001b[91m";
                                    if (stdout !== "" && stdout.indexOf(` ${control}error${text.none} `) > -1) {
                                        console.log(`${text.red}TypeScript reported warnings.${text.none}`);
                                        apps.error([stdout]);
                                        return;
                                    }
                                    if (err !== null) {
                                        apps.error([err.toString()]);
                                        return;
                                    }
                                    if (stderr !== "") {
                                        apps.error([stderr]);
                                        return;
                                    }
                                    next(`${text.green}TypeScript build completed without warnings.${text.none}`);
                                });
                            };
                        heading("TypeScript Compilation");
                        node.child("tsc --version", function node_apps_build_typescript_tsc(err:Error, stdout:string, stderr:string) {
                            if (err !== null) {
                                const str = err.toString();
                                if (str.indexOf("command not found") > 0 || str.indexOf("is not recognized") > 0) {
                                    console.log(`${text.angry}TypeScript does not appear to be installed.${text.none}`);
                                    flag.typescript = true;
                                    if (flag.services === true) {
                                        next(`${text.angry}Install TypeScript with this command: ${text.green}npm install typescript -g${text.none}`);
                                    }
                                } else {
                                    apps.error([err.toString(), stdout]);
                                    return;
                                }
                            } else {
                                if (stderr !== "") {
                                    apps.error([stderr]);
                                    return;
                                }
                                ts();
                            }
                        });
                    },
                    // write the current version and change date
                    version: function node_apps_build_version():void {
                        const pack:string = `${projectPath}package.json`;
                        heading("Writing version data");
                        node.fs.stat(pack, function node_apps_build_version_stat(ers:Error, stat:Stats) {
                            if (ers !== null) {
                                apps.error([ers.toString()]);
                                return;
                            }
                            const month:string = (function node_apps_build_version_stat_month():string {
                                    let numb:number = stat.mtime.getMonth();
                                    if (numb === 0) {
                                        return "JAN";
                                    }
                                    if (numb === 1) {
                                        return "FEB";
                                    }
                                    if (numb === 2) {
                                        return "MAR";
                                    }
                                    if (numb === 3) {
                                        return "APR";
                                    }
                                    if (numb === 4) {
                                        return "MAY";
                                    }
                                    if (numb === 5) {
                                        return "JUN";
                                    }
                                    if (numb === 6) {
                                        return "JUL";
                                    }
                                    if (numb === 7) {
                                        return "AUG";
                                    }
                                    if (numb === 8) {
                                        return "SEP";
                                    }
                                    if (numb === 9) {
                                        return "OCT";
                                    }
                                    if (numb === 10) {
                                        return "NOV";
                                    }
                                    if (numb === 11) {
                                        return "DEC";
                                    }
                                }()),
                                date = `${stat.mtime.getDate().toString()} ${month} ${stat.mtime.getFullYear().toString()}`;
                            version.date = date.replace(/-/g, "");
                            node.fs.readFile(pack, "utf8", function node_apps_build_version_stat_read(err:Error, data:string) {
                                if (err !== null) {
                                    apps.error([err.toString()]);
                                    return;
                                }
                                version.number = JSON.parse(data).version;
                                node.fs.writeFile(`${projectPath}version.json`, `{"command":"${version.command}","date":"${version.date}","name":"${version.name}","number":"${version.number}","port":${version.port}}`, "utf8", function node_apps_build_version_stat_read_write(erw:Error) {
                                    if (erw !== null) {
                                        apps.error([erw.toString()]);
                                        return;
                                    }
                                    next("Version data written");
                                });
                            });
                        });
                    }
                };
            next("");
        };
        // CLI commands documentation generator
        apps.commands = function node_apps_commands():void {
            const output:string[] = [];
            verbose = true;
            if (commands[process.argv[0]] === undefined) {
                // all commands in a list
                apps.lists({
                    empty_line: false,
                    heading: "Commands",
                    obj: commands,
                    property: "description",
                    total: true
                });
            } else {
                // specifically mentioned option
                const comm:any = commands[process.argv[0]],
                    len:number = comm.example.length,
                    plural:string = (len > 1)
                        ? "s"
                        : "";
                let a:number = 0;
                output.push(`${text.bold + text.underline + version.name} - Command: ${text.green + process.argv[0] + text.none}`);
                output.push("");
                output.push(comm.description);
                output.push("");
                output.push(`${text.underline}Example${plural + text.none}`);
                do {
                    apps.wrapIt(output, comm.example[a].defined);
                    output.push(`   ${text.cyan + comm.example[a].code + text.none}`);
                    output.push("");
                    a = a + 1;
                } while (a < len);
                apps.log(output);
            }
        };
        // converts numbers into a string of comma separated triplets
        apps.commas = function node_apps_commas(number:number):string {
            const str:string = String(number);
            let arr:string[] = [],
                a:number   = str.length;
            if (a < 4) {
                return str;
            }
            arr = String(number).split("");
            a   = arr.length;
            do {
                a      = a - 3;
                arr[a] = "," + arr[a];
            } while (a > 3);
            return arr.join("");
        };
        // bit-by-bit copy stream for the file system
        apps.copy = function node_apps_copy(params:nodeCopyParams):void {
            const numb:any  = {
                    dirs : 0,
                    files: 0,
                    link : 0,
                    size : 0
                },
                util:any  = {};
            let start:string = "",
                dest:string  = "",
                dirs:any  = {},
                target:string        = "",
                destination:string   = "",
                excludeLength:number = 0;
            util.complete = function node_apps_copy_complete(item:string):void {
                delete dirs[item];
                if (Object.keys(dirs).length < 1) {
                    params.callback();
                }
            };
            util.errorOut     = function node_apps_copy_errorOut(er:Error):void {
                const filename:string[] = target.split(sep);
                apps.remove(
                    destination + sep + filename[filename.length - 1],
                    function node_apps_copy_errorOut_remove() {
                        apps.error([er.toString()]);
                    }
                );
            };
            util.dir      = function node_apps_copy_dir(item:string):void {
                node
                    .fs
                    .readdir(item, function node_apps_copy_dir_readdir(er:Error, files:string[]):void {
                        const place:string = dest + item.replace(start, "");
                        if (er !== null) {
                            util.errorOut(er);
                            return;
                        }
                        apps.makeDir(place, function node_apps_copy_dir_readdir_makeDir():void {
                            const a = files.length;
                            let b = 0;
                            if (a > 0) {
                                delete dirs[item];
                                do {
                                    dirs[item + sep + files[b]] = true;
                                    b                           = b + 1;
                                } while (b < a);
                                b = 0;
                                do {
                                    util.stat(item + sep + files[b], item);
                                    b = b + 1;
                                } while (b < a);
                            } else {
                                util.complete(item);
                            }
                        });
                    });
            };
            util.file     = function node_apps_copy_file(item:string, dir:string, prop:nodeFileProps):void {
                const place:string       = dest + item.replace(start, ""),
                    readStream:Stream  = node
                        .fs
                        .createReadStream(item),
                    writeStream:Writable = node
                        .fs
                        .createWriteStream(place, {mode: prop.mode});
                let errorFlag:boolean   = false;
                readStream.on("error", function node_apps_copy_file_readError(error:Error):void {
                    errorFlag = true;
                    util.errorOut(error);
                    return;
                });
                writeStream.on("error", function node_apps_copy_file_writeError(error:Error):void {
                    errorFlag = true;
                    util.errorOut(error);
                    return;
                });
                if (errorFlag === false) {
                    writeStream.on("open", function node_apps_copy_file_write():void {
                        readStream.pipe(writeStream);
                    });
                    writeStream.once("finish", function node_apps_copy_file_finish():void {
                        const filename:string[] = item.split(sep);
                        node
                            .fs
                            .utimes(
                                dest + sep + filename[filename.length - 1],
                                prop.atime,
                                prop.mtime,
                                function node_apps_copy_file_finish_utimes():void {
                                    util.complete(item);
                                }
                            );
                    });
                }
            };
            util.link     = function node_apps_copy_link(item:string, dir:string):void {
                node
                    .fs
                    .readlink(item, function node_apps_copy_link_readlink(err:Error, resolvedLink:string):void {
                        if (err !== null) {
                            util.errorOut(err);
                            return;
                        }
                        resolvedLink = node.path.resolve(resolvedLink);
                        node
                            .fs
                            .stat(resolvedLink, function node_apps_copy_link_readlink_stat(ers:Error, stats:Stats):void {
                                let type  = "file",
                                    place = dest + item.replace(start, "");
                                if (ers !== null) {
                                    util.errorOut(ers);
                                    return;
                                }
                                if (stats === undefined || stats.isFile === undefined) {
                                    util.errorOut(`Error in performing stat against ${item}`);
                                    return;
                                }
                                if (item === dir) {
                                    place = dest + item
                                        .split(sep)
                                        .pop();
                                }
                                if (stats.isDirectory() === true) {
                                    type = "junction";
                                }
                                node
                                    .fs
                                    .symlink(
                                        resolvedLink,
                                        place,
                                        type,
                                        function node_apps_copy_link_readlink_stat_makeLink(erl:Error):void {
                                            if (erl !== null) {
                                                util.errorOut(erl);
                                                return;
                                            }
                                            util.complete(item);
                                        }
                                    );
                            });
                    });
            };
            util.stat     = function node_apps_copy_stat(item:string, dir:string):void {
                let a    = 0;
                if (excludeLength > 0) {
                    do {
                        if (item.replace(start + sep, "") === params.exclusions[a]) {
                            params.exclusions.splice(a, 1);
                            excludeLength = excludeLength - 1;
                            util.complete(item);
                            return;
                        }
                        a = a + 1;
                    } while (a < excludeLength);
                }
                node.fs.lstat(item, function node_apps_copy_stat_callback(er:Error, stats:Stats):void {
                    if (er !== null) {
                        util.errorOut(er);
                        return;
                    }
                    if (stats === undefined || stats.isFile === undefined) {
                        util.errorOut("stats object is undefined");
                        return;
                    }
                    if (stats.isFile() === true) {
                        numb.files = numb.files + 1;
                        numb.size  = numb.size + stats.size;
                        if (item === dir) {
                            apps.makeDir(dest, function node_apps_copy_stat_callback_file():void {
                                util.file(item, dir, {
                                    atime: (Date.parse(stats.atime.toString()) / 1000),
                                    mode : stats.mode,
                                    mtime: (Date.parse(stats.mtime.toString()) / 1000)
                                });
                            });
                        } else {
                            util.file(item, dir, {
                                atime: (Date.parse(stats.atime.toString()) / 1000),
                                mode : stats.mode,
                                mtime: (Date.parse(stats.mtime.toString()) / 1000)
                            });
                        }
                    } else if (stats.isDirectory() === true) {
                        numb.dirs = numb.dirs + 1;
                        util.dir(item);
                    } else if (stats.isSymbolicLink() === true) {
                        numb.link = numb.link + 1;
                        if (item === dir) {
                            apps.makeDir(dest, function node_apps_copy_stat_callback_symbolic() {
                                util.link(item, dir);
                            });
                        } else {
                            util.link(item, dir);
                        }
                    } else {
                        util.complete(item);
                    }
                });
            };
            if (command === "copy") {
                if (process.argv[0] === undefined || process.argv[1] === undefined) {
                    apps.error([
                        "The copy command requires a source path and a destination path.",
                        `Please execute ${text.cyan + version.command} commands copy${text.none} for examples.`
                    ]);
                    return;
                }
                params = {
                    callback: function node_apps_copy_callback() {
                        const out:string[] = [`${version.name} copied `];
                        out.push("");
                        out.push(text.green);
                        out.push(text.bold);
                        out.push(numb.dirs);
                        out.push(text.none);
                        out.push(" director");
                        if (numb.dirs === 1) {
                            out.push("y, ");
                        } else {
                            out.push("ies, ");
                        }
                        out.push(text.green);
                        out.push(text.bold);
                        out.push(numb.files);
                        out.push(text.none);
                        out.push(" file");
                        if (numb.files !== 1) {
                            out.push("s");
                        }
                        out.push(", and ");
                        out.push(text.green);
                        out.push(text.bold);
                        out.push(numb.link);
                        out.push(text.none);
                        out.push(" symbolic link");
                        if (numb.link !== 1) {
                            out.push("s");
                        }
                        out.push(" at ");
                        out.push(text.green);
                        out.push(text.bold);
                        out.push(apps.commas(numb.size));
                        out.push(text.none);
                        out.push(" bytes.");
                        verbose = true;
                        apps.log([out.join(""), `Copied ${text.cyan + target + text.none} to ${text.green + destination + text.none}`]);
                    },
                    exclusions: exclusions,
                    destination: process.argv[1].replace(/(\\|\/)/g, sep),
                    target: process.argv[0].replace(/(\\|\/)/g, sep)
                };
            }
            flag.write = target;
            target =  node.path.resolve(params.target.replace(/(\\|\/)/g, sep));
            destination = params.destination.replace(/(\\|\/)/g, sep);
            excludeLength = params.exclusions.length;
            dest          = node.path.resolve(destination) + sep;
            start         = target.slice(0, target.lastIndexOf(sep) + 1);
            util.stat(target, start);
        };
        // similar to node's fs.readdir, but recursive
        apps.directory = function node_apps_directory(args:readDirectory):void {
            // arguments:
            // * callback - function - the output is passed into the callback as an argument
            // * depth - number - how many directories deep a recursive scan should read, 0 = full recursion
            // * exclusions - string array - a list of items to exclude
            // * path - string - where to start in the local file system
            // * recursive - boolean - if child directories should be scanned
            // * symbolic - boolean - if symbolic links should be identified
            // -
            // output: []
            // 0. absolute path (string)
            // 1. type (string)
            // 2. parent index (number)
            // 3. child item count (number)
            // 4. stat (fs.Stats)
            let dirTest:boolean = false,
                size:number = 0,
                dirs:number = 0;
            const dirCount:number[] = [],
                dirNames:string[] = [],
                listOnly:boolean = (command === "directory" && process.argv.indexOf("list") > -1),
                type:boolean = (function node_apps_directory_typeof():boolean {
                    const typeIndex:number = process.argv.indexOf("typeof");
                    if (command === "directory" && typeIndex > -1) {
                        process.argv.splice(typeIndex, 1);
                        return true;
                    }
                    return false;
                }()),
                startPath:string = (function node_apps_directory_startPath():string {
                    if (command === "directory") {
                        const len:number = process.argv.length;
                        let a:number = 0;
                        args = {
                            callback: function node_apps_directory_startPath_callback(result:string[]|directoryList) {
                                const output:string[] = [];
                                if (verbose === true) {
                                    output.push(JSON.stringify(result));
                                    output.push("");
                                    apps.wrapIt(output, `${version.name} found ${text.green + apps.commas(result.length) + text.none} matching items from address ${text.cyan + startPath + text.none} with a total file size of ${text.green + apps.commas(size) + text.none} bytes.`);
                                    apps.log(output);
                                } else {
                                    apps.log([JSON.stringify(result)]);
                                }
                            },
                            depth: (function node_apps_directory_startPath_depth():number {
                                let b:number = 0;
                                do {
                                    if ((/^depth:\d+$/).test(process.argv[b]) === true) {
                                        return Number(process.argv[b].replace("depth:", ""));
                                    }
                                    b = b + 1;
                                } while (b < process.argv.length);
                                return 0;
                            }()),
                            exclusions: exclusions,
                            path: "",
                            recursive: (process.argv.indexOf("shallow") > -1)
                                ? (function node_apps_directory_startPath_recursive():boolean {
                                    process.argv.splice(process.argv.indexOf("shallow"), 1);
                                    return false;
                                }())
                                : true,
                            symbolic: (process.argv.indexOf("symbolic") > -1)
                                ? (function node_apps_directory_startPath_symbolic():boolean {
                                    process.argv.splice(process.argv.indexOf("symbolic"), 1);
                                    return true;
                                }())
                                : false
                        };
                        if (process.argv.length < 1) {
                            apps.error([
                                "No path supplied for the directory command. For an example please see:",
                                `    ${text.cyan + version.command} commands directory${text.none}`
                            ]);
                            return "";
                        }
                        do {
                            if (process.argv[a].indexOf("source:") === 0) {
                                return node.path.resolve(process.argv[a].replace(/source:("|')?/, "").replace(/("|')$/, ""));
                            }
                            a = a + 1;
                        } while (a < len);
                        return node.path.resolve(process.argv[0]);
                    }
                    return node.path.resolve(args.path);
                }()),
                list:directoryList = [],
                fileList:string[] = [],
                method:string = (args.symbolic === true)
                    ? "lstat"
                    : "stat",
                dirCounter = function node_apps_directory_dirCounter(item:string):void {
                    let dirList:string[] = item.split(sep),
                        dirPath:string = "",
                        index:number = 0;
                    dirList.pop();
                    dirPath = dirList.join(sep);
                    index = dirNames.indexOf(dirPath);
                    dirCount[index] = dirCount[index] - 1;
                    if (dirNames.length === 0 && item === startPath) {
                        // empty directory, nothing to traverse
                        if (listOnly === true) {
                            args.callback(fileList.sort());
                        } else {
                            args.callback(list);
                        }
                    } else if (dirCount[index] < 1) {
                        // dirCount and dirNames are parallel arrays
                        dirCount.splice(index, 1);
                        dirNames.splice(index, 1);
                        dirs = dirs - 1;
                        if (dirs < 1) {
                            if (listOnly === true) {
                                args.callback(fileList.sort());
                            } else {
                                args.callback(list);
                            }
                        } else {
                            node_apps_directory_dirCounter(dirPath);
                        }
                    }
                },
                statWrapper = function node_apps_directory_wrapper(filePath:string, parent:number):void {
                    node.fs[method](filePath, function node_apps_directory_wrapper_stat(er:Error, stat:Stats):void {
                        const angryPath:string = `File path ${text.angry + filePath + text.none} is not a file or directory.`,
                            dir = function node_apps_directory_wrapper_stat_dir(item:string):void {
                                node.fs.readdir(item, {encoding: "utf8"}, function node_apps_directory_wrapper_stat_dir_readDir(erd:Error, files:string[]):void {
                                    if (erd !== null) {
                                        apps.error([erd.toString()]);
                                        if (command === "server") {
                                            dirCounter(item);
                                        } else {
                                            return;
                                        }
                                    } else {
                                        const index:number = list.length;
                                        if (listOnly === true) {
                                            fileList.push(item);
                                        } else {
                                            list.push([item, "directory", parent, files.length, stat]);
                                        }
                                        if (files.length < 1) {
                                            dirCounter(item);
                                        } else {
                                            // dirCount and dirNames are parallel arrays
                                            dirCount.push(files.length);
                                            dirNames.push(item);
                                            dirs = dirs + 1;
                                        }
                                        files.forEach(function node_apps_directory_wrapper_stat_dir_readDir_each(value:string):void {
                                            node_apps_directory_wrapper(item + sep + value, index);
                                        });
                                    }
                                });
                            },
                            populate = function node_apps_directory_wrapper_stat_populate(type:"error"|"link"|"file"|"directory"):void {
                                if (type !== "error" && exclusions.indexOf(filePath.replace(startPath + sep, "")) < 0) {
                                    if (listOnly === true) {
                                        fileList.push(filePath);
                                    } else {
                                        list.push([filePath, type, parent, 0, stat]);
                                    }
                                }
                                if (dirs > 0) {
                                    dirCounter(filePath);
                                } else {
                                    if (listOnly === true) {
                                        args.callback(fileList.sort());
                                    } else {
                                        args.callback(list);
                                    }
                                }
                            };
                        if (er !== null) {
                            if (er.toString().indexOf("no such file or directory") > 0) {
                                if (flag.error === true) {
                                    args.callback([]);
                                    return;
                                }
                                if (type === true) {
                                    apps.log([`Requested artifact, ${text.cyan + startPath + text.none}, ${text.angry}is missing${text.none}.`]);
                                    if (command === "server") {
                                        populate("error");
                                    } else {
                                        return;
                                    }
                                }
                                apps.error([angryPath]);
                                if (command === "server") {
                                    populate("error");
                                } else {
                                    return;
                                }
                            } else {
                                apps.error([er.toString()]);
                                if (command === "server") {
                                    populate("error");
                                } else {
                                    return;
                                }
                            }
                        } else if (stat === undefined) {
                            if (type === true) {
                                apps.log([`Requested artifact, ${text.cyan + startPath + text.none}, ${text.angry}is missing${text.none}.`]);
                                if (command === "server") {
                                    populate("error");
                                } else {
                                    return;
                                }
                            }
                            apps.error([angryPath]);
                            if (command === "server") {
                                populate("error");
                            } else {
                                return;
                            }
                        } else if (stat.isDirectory() === true) {
                            if (type === true) {
                                apps.log(["directory"]);
                                return;
                            }
                            if (((args.recursive === true && (args.depth < 1 || filePath.replace(startPath + sep, "").split(sep).length < args.depth)) || dirTest === false) && exclusions.indexOf(filePath.replace(startPath + sep, "")) < 0) {
                                dirTest = true;
                                dir(filePath);
                            } else {
                                populate("directory");
                            }
                        } else if (stat.isSymbolicLink() === true) {
                            if (type === true) {
                                apps.log(["symbolicLink"]);
                                return;
                            }
                            populate("link");
                        } else if (stat.isFile() === true || stat.isBlockDevice() === true || stat.isCharacterDevice() === true) {
                            if (type === true) {
                                if (stat.isBlockDevice() === true) {
                                    apps.log(["blockDevice"]);
                                } else if (stat.isCharacterDevice() === true) {
                                    apps.log(["characterDevice"]);
                                } else {
                                    apps.log(["file"]);
                                }
                                return;
                            }
                            size = size + stat.size;
                            populate("file");
                        } else {
                            if (type === true) {
                                if (stat.isFIFO() === true) {
                                    apps.log(["FIFO"]);
                                } else if (stat.isSocket() === true) {
                                    apps.log(["socket"]);
                                } else {
                                    apps.log(["unknown"]);
                                }
                                return;
                            }
                            list[parent][3] = list[parent][3] - 1;
                        }
                    });
                };
            
            if (args.depth === undefined) {
                args.depth = 0;
            }
            statWrapper(startPath, 0);
        };
        // uniform error formatting
        apps.error = function node_apps_error(errText:string[]):void {
            const bell = function node_apps_error_bell():void {
                    apps.humanTime(true);
                    if (command === "build" || command === "simulation" || command === "validation") {
                        console.log("\u0007"); // bell sound
                    } else {
                        console.log("");
                    }
                    if (command !== "debug") {
                        process.exit(1);
                    }
                },
                errorOut = function node_apps_error_errorOut():void {
                    if (command === "server") {
                        const stackTrace:string[] = new Error().stack.replace(/^Error/, "").replace(/\s+at\s/g, ")splitMe").split("splitMe"),
                            server:serverError = {
                                stack: stackTrace.slice(1),
                                error: errText.join(" ")
                            };
                        ws.broadcast(`error:${JSON.stringify(server)}`);
                    } else {
                        const stack:string = new Error().stack.replace("Error", `${text.cyan}Stack trace${text.none + node.os.EOL}-----------`);
                        flag.error = true;
                        console.log("");
                        console.log(stack);
                        console.log("");
                        console.log(`${text.angry}Error Message${text.none}`);
                        console.log("------------");
                        if (errText[0] === "" && errText.length < 2) {
                            console.log(`${text.yellow}No error message supplied${text.none}`);
                        } else {
                            errText.forEach(function node_apps_error_errorOut_each(value:string):void {
                                console.log(value);
                            });
                        }
                        console.log("");
                        bell();
                    }
                },
                debug = function node_apps_error_debug():void {
                    const stack:string = new Error().stack,
                        totalmem:number = node.os.totalmem(),
                        freemem:number = node.os.freemem();
                    flag.error = true;
                    console.log("");
                    console.log("---");
                    console.log("");
                    console.log("");
                    console.log(`# ${version.name} - Debug Report`);
                    console.log("");
                    console.log(`${text.green}## Error Message${text.none}`);
                    if (errText[0] === "" && errText.length < 2) {
                        console.log(`${text.yellow}No error message supplied${text.none}`);
                    } else {
                        console.log("```");
                        errText.forEach(function node_apps_error_each(value:string):void {
                            // eslint-disable-next-line
                            console.log(value.replace(/\u001b/g, "\\u001b"));
                        });
                        console.log("```");
                    }
                    console.log("");
                    console.log(`${text.green}## Stack Trace${text.none}`);
                    console.log("```");
                    console.log(stack.replace(/\s*Error\s+/, "    "));
                    console.log("```");
                    console.log("");
                    console.log(`${text.green}## Environment${text.none}`);
                    console.log(`* OS - **${node.os.platform()} ${node.os.release()}**`);
                    console.log(`* Mem - ${apps.commas(totalmem)} - ${apps.commas(freemem)} = **${apps.commas(totalmem - freemem)}**`);
                    console.log(`* CPU - ${node.os.arch()} ${node.os.cpus().length} cores`);
                    console.log("");
                    console.log(`${text.green}## Command Line Instruction${text.none}`);
                    console.log("```");
                    console.log(cli);
                    console.log("```");
                    console.log("");
                    console.log(`${text.green}## Time${text.none}`);
                    console.log("```");
                    console.log(apps.humanTime(false));
                    console.log("```");
                    console.log("");
                    bell();
                };
            if (process.argv.indexOf("spaces_debug") > -1) {
                debug();
            } else {
                errorOut();
            }
        };
        // http(s) get function
        apps.get = function node_apps_get(address:string, callback:Function|null):void {
            if (command === "get") {
                address = process.argv[0];
            }
            if (address === undefined) {
                apps.error([
                    "The get command requires an address in http/https scheme.",
                    `Please execute ${text.cyan + version.command} commands get${text.none} for examples.`
                ]);
                return;
            }
            let file:string = "";
            const scheme:string = (address.indexOf("https") === 0)
                    ? "https"
                    : "http";
            if ((/^(https?:\/\/)/).test(address) === false) {
                apps.error([
                    `Address: ${text.angry + address + text.none}`,
                    "The get command requires an address in http/https scheme.",
                    `Please execute ${text.cyan + version.command} commands get${text.none} for examples.`
                ]);
                return;
            }
            node[scheme].get(address, function node_apps_get_callback(res:http.IncomingMessage) {
                res.on("data", function node_apps_get_callback_data(chunk:string):void {
                    file = file + chunk;
                });
                res.on("end", function node_apps_get_callback_end() {
                    if (res.statusCode !== 200) {
                        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
                            if (verbose === true) {
                                console.log(`${res.statusCode} ${node.http.STATUS_CODES[res.statusCode]} - ${address}`);
                            }
                            process.argv[0] = res.headers.location;
                            address = process.argv[0];
                            apps.get(address, callback);
                            return;
                        }
                        apps.error([`${scheme}.get failed with status code ${res.statusCode}`]);
                        return;
                    }
                    if (command === "get") {
                        apps.log([file.toString()]);
                    } else if (callback !== null) {
                        callback(file);
                    }
                });
            });
        };
        // hash utility for strings or files
        apps.hash = function node_apps_hash(filePath:string, callback:Function):void {
            let limit:number = 0,
                shortLimit:number = 0,
                hashList:boolean = false;
            const http:RegExp = (/^https?:\/\//),
                dirComplete = function node_apps_hash_dirComplete(list:directoryList):void {
                    let a:number = 0,
                        c:number = 0;
                    const listLength:number = list.length,
                        listObject:any = {},
                        hashes:string[] = [],
                        hashComplete = (typeof callback === "function")
                            ? function node_apps_hash_dirComplete_callback():void {
                                const hash:Hash = node.crypto.createHash("sha512");
                                let hashString:string = "";
                                if (hashList === true) {
                                    hashString = JSON.stringify(listObject);
                                } else if (hashes.length > 1) {
                                    hash.update(hashes.join(""));
                                    hash.digest("hex").replace(/\s+$/, "");
                                } else {
                                    hashString = hashes[0];
                                }
                                callback(hashString);
                            }
                            : function node_apps_hash_dirComplete_hashComplete():void {
                                const hash:Hash = node.crypto.createHash("sha512");
                                let hashString:string = "";
                                if (verbose === true) {
                                    console.log(`${apps.humanTime(false)}File hashing complete. Working on a final hash to represent the directory structure.`);
                                }
                                if (hashList === true) {
                                    hashString = JSON.stringify(listObject);
                                } else if (hashes.length > 1) {
                                    hash.update(hashes.join(""));
                                    hash.digest("hex").replace(/\s+$/, "");
                                } else {
                                    hashString = hashes[0];
                                }
                                if (verbose === true) {
                                    apps.log([`${version.name} hashed ${text.cyan + filePath + text.none}`, hashString]);
                                } else {
                                    apps.log([hashString]);
                                }
                            },
                        hashBack = function node_apps_hash_dirComplete_hashBack(data:readFile, item:string|Buffer, callback:Function):void {
                            const hash:Hash = node.crypto.createHash("sha512");
                            hash.on("readable", function node_apps_hash_dirComplete_hashBack_hash():void {
                                let hashString:string = "";
                                const hashData:Buffer = <Buffer>hash.read();
                                if (hashData !== null) {
                                    hashString = hashData.toString("hex").replace(/\s+/g, "");
                                    callback(hashString, data.index);
                                }
                            });
                            hash.write(item);
                            hash.end();
                            if (http.test(filePath) === true) {
                                apps.remove(data.path, function node_apps_hash_dirComplete_hashBack_hash_remove():boolean {
                                    return true;
                                });
                            }
                        },
                        typeHash = function node_apps_hash_dirComplete_typeHash(index:number, end:number) {
                            const terminate = function node_apps_hash_dirComplete_typeHash_terminate():void {
                                c = c + 1;
                                if (c === end) {
                                    if (a === listLength) {
                                        hashComplete();
                                    } else {
                                        if (verbose === true) {
                                            console.log(`${apps.humanTime(false)}${text.green + apps.commas(a) + text.none} files hashed so far...`);
                                        }
                                        c = 0;
                                        recursive();
                                    }
                                }
                            };
                            if (list[index][1] === "directory" || list[index][1] === "link") {
                                const hash:Hash = node.crypto.createHash("sha512");
                                hash.update(list[index][0]);
                                if (hashList === true) {
                                    listObject[list[index][0]] = hash.digest("hex");
                                } else {
                                    hashes[index] = hash.digest("hex");
                                }
                                terminate();
                            } else {
                                apps.readFile({
                                    path: list[index][0],
                                    stat: list[index][4],
                                    index: index,
                                    callback: function node_apps_hash_dirComplete_typeHash_callback(data:readFile, item:string|Buffer):void {
                                        hashBack(data, item, function node_apps_hash_dirComplete_typeHash_callback_hashBack(hashString:string, item:number) {
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
                        recursive = function node_apps_hash_dirComplete_recursive():void {
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
                        sortFunction = function node_apps_hash_dirComplete_sortFunction(a:directoryItem, b:directoryItem) {
                            if (a[0] < b[0]) {
                                return -1;
                            }
                            return 1;
                        };
                    list.sort(sortFunction);
                    if (verbose === true) {
                        console.log(`${apps.humanTime(false)}Completed analyzing the directory tree in the file system and found ${text.green + apps.commas(listLength) + text.none} file system objects.`);
                    }
                    if (limit < 1 || listLength < limit) {
                        do {
                            if (list[a][1] === "directory" || list[a][1] === "link") {
                                const hash:Hash = node.crypto.createHash("sha512");
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
                                apps.readFile({
                                    path: list[a][0],
                                    stat: list[a][4],
                                    index: a,
                                    callback: function node_apps_hash_dirComplete_file(data:readFile, item:string|Buffer):void {
                                        hashBack(data, item, function node_apps_hash_dirComplete_file_hashBack(hashString:string, index:number):void {
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
                        if (verbose === true) {
                            console.log(`Due to a ulimit setting of ${text.angry + apps.commas(limit) + text.none} ${version.name} will read only ${text.cyan + apps.commas(shortLimit) + text.none} files at a time.`);
                            console.log("");
                        }
                        recursive();
                    }
                };
            if (command === "hash") {
                const listIndex:number = process.argv.indexOf("list");
                if (process.argv[0] === undefined) {
                    apps.error([`Command ${text.cyan}hash${text.none} requires some form of address of something to analyze, ${text.angry}but no address is provided${text.none}.`]);
                    return;
                }
                if (process.argv.indexOf("string") > -1) {
                    const hash:Hash = node.crypto.createHash("sha512");
                    process.argv.splice(process.argv.indexOf("string"), 1);
                    hash.update(process.argv[0]);
                    apps.log([hash.digest("hex")]);
                    return;
                }
                if (listIndex > -1 && process.argv.length > 1) {
                    hashList = true;
                    process.argv.splice(listIndex, 1);
                }
                filePath = process.argv[0];
                if (http.test(filePath) === false) {
                    filePath = node.path.resolve(process.argv[0]);
                }
            }
            if (http.test(filePath) === true) {
                apps.get(filePath, function node_apps_hash_get(fileData:string) {
                    const hash:Hash = node.crypto.createHash("sha512");
                    hash.update(fileData);
                    apps.log([hash.digest("hex")]);
                });
            } else {
                node.child("ulimit -n", function node_apps_hash_ulimit(ulimit_err:Error, ulimit_out:string) {
                    if (ulimit_err === null && ulimit_out !== "unlimited" && isNaN(Number(ulimit_out)) === false) {
                        limit = Number(ulimit_out);
                        shortLimit = Math.ceil(limit / 5);
                    }
                    apps.directory({
                        callback: function node_apps_hash_localCallback(list:directoryList) {
                            dirComplete(list);
                        },
                        depth: 0,
                        exclusions: exclusions,
                        path: filePath,
                        recursive: true,
                        symbolic: true
                    });
                });
            }
        };
        // help text
        apps.help = function node_apps_help():void {
            verbose = true;
            apps.log([
                "",
                `Welcome to ${version.name}.`,
                "",
                "To see all the supported features try:",
                `${text.cyan + version.command} commands${text.none}`,
                "",
                "To see more detailed documentation for specific command supply the command name:",
                `${text.cyan + version.command} commands build${text.none}`,
                "",
                "* Read the documentation             - cat readme.md",
            ]);
        };
        // converting time durations into something people read
        apps.humanTime = function node_apps_humanTime(finished:boolean):string {
            let minuteString:string = "",
                hourString:string   = "",
                secondString:string = "",
                finalTime:string    = "",
                finalMem:string     = "",
                minutes:number      = 0,
                hours:number        = 0,
                memory,
                elapsed:number      = (function node_apps_humanTime_elapsed():number {
                    const big:number = 1e9,
                        differenceTime:[number, number] = process.hrtime(startTime);
                    if (differenceTime[1] === 0) {
                        return differenceTime[0];
                    }
                    return differenceTime[0] + (differenceTime[1] / big);
                }());
            const numberString = function node_apps_humanTime_numberString(numb:number):string {
                    const strSplit:string[] = String(numb).split(".");
                    if (strSplit.length > 1) {
                        if (strSplit[1].length < 9) {
                            do {
                                strSplit[1]  = strSplit[1] + 0;
                            } while (strSplit[1].length < 9);
                            return `${strSplit[0]}.${strSplit[1]}`;
                        }
                        if (strSplit[1].length > 9) {
                            return `${strSplit[0]}.${strSplit[1].slice(0, 9)}`;
                        }
                        return `${strSplit[0]}.${strSplit[1]}`;
                    }
                    return `${strSplit[0]}`;
                },
                prettyBytes  = function node_apps_humanTime_prettyBytes(an_integer:number):string {
                    //find the string length of input and divide into triplets
                    let output:string = "",
                        length:number  = an_integer
                            .toString()
                            .length;
                    const triples:number = (function node_apps_humanTime_prettyBytes_triples():number {
                            if (length < 22) {
                                return Math.floor((length - 1) / 3);
                            }
                            //it seems the maximum supported length of integer is 22
                            return 8;
                        }()),
                        //each triplet is worth an exponent of 1024 (2 ^ 10)
                        power:number   = (function node_apps_humanTime_prettyBytes_power():number {
                            let a = triples - 1,
                                b = 1024;
                            if (triples === 0) {
                                return 0;
                            }
                            if (triples === 1) {
                                return 1024;
                            }
                            do {
                                b = b * 1024;
                                a = a - 1;
                            } while (a > 0);
                            return b;
                        }()),
                        //kilobytes, megabytes, and so forth...
                        unit    = [
                            "",
                            "KB",
                            "MB",
                            "GB",
                            "TB",
                            "PB",
                            "EB",
                            "ZB",
                            "YB"
                        ];

                    if (typeof an_integer !== "number" || Number.isNaN(an_integer) === true || an_integer < 0 || an_integer % 1 > 0) {
                        //input not a positive integer
                        output = "0.00B";
                    } else if (triples === 0) {
                        //input less than 1000
                        output = `${an_integer}B`;
                    } else {
                        //for input greater than 999
                        length = Math.floor((an_integer / power) * 100) / 100;
                        output = length.toFixed(2) + unit[triples];
                    }
                    return output;
                },
                plural       = function node_apps_humanTime_plural(x:number, y:string):string {
                    if (x !== 1) {
                        return `${numberString(x) + y}s `;
                    }
                    return `${numberString(x) + y} `;
                },
                minute       = function node_apps_humanTime_minute():void {
                    minutes      = parseInt((elapsed / 60).toString(), 10);
                    minuteString = (finished === true)
                        ? plural(minutes, " minute")
                        : (minutes < 10)
                            ? `0${minutes}`
                            : String(minutes);
                    minutes      = elapsed - (minutes * 60);
                    secondString = (finished === true)
                        ? (minutes === 1)
                            ? " 1 second "
                            : `${numberString(minutes)} seconds `
                        : numberString(minutes);
                };
            memory       = process.memoryUsage();
            finalMem     = prettyBytes(memory.rss);

            //last line for additional instructions without bias to the timer
            secondString = numberString(elapsed);
            if (elapsed >= 60 && elapsed < 3600) {
                minute();
            } else if (elapsed >= 3600) {
                hours      = parseInt((elapsed / 3600).toString(), 10);
                elapsed    = elapsed - (hours * 3600);
                hourString = (finished === true)
                    ? plural(hours, " hour")
                    : (hours < 10)
                        ? `0${hours}`
                        : String(hours);
                minute();
            } else {
                secondString = (finished === true)
                    ? plural(elapsed, " second")
                    : secondString;
            }
            if (finished === true) {
                finalTime = hourString + minuteString + secondString;
                console.log("");
                console.log(`${finalMem} of memory consumed`);
                console.log(`${finalTime}total time`);
                console.log("");
            } else {
                if (hourString === "") {
                    hourString = "00";
                }
                if (minuteString === "") {
                    minuteString = "00";
                }
                // pad single digit seconds with a 0
                if ((/^([0-9]\.)/).test(secondString) === true) {
                    secondString = `0${secondString}`;
                }
            }
            return `${text.cyan}[${hourString}:${minuteString}:${secondString}]${text.none} `;
        };
        // wrapper for ESLint usage
        apps.lint = function node_apps_lint(callback:Function):void {
            node.child("eslint", function node_apps_lint_eslintCheck(lint_err:Error) {
                const lintPath:string = (command === "lint" && process.argv[0] !== undefined)
                    ? node.path.resolve(process.argv[0])
                    : js;
                if (lint_err !== null) {
                    console.log("ESLint is not globally installed or is corrupt.");
                    console.log(`Install ESLint using the command: ${text.green}npm install eslint -g${text.none}`);
                    console.log("");
                    if (callback !== undefined) {
                        callback("Skipping code validation...");
                    } else {
                        console.log("Skipping code validation...");
                    }
                    return;
                }
                if (command === "lint") {
                    verbose = true;
                    callback = function node_apps_lint_callback():void {
                        apps.log([`Lint complete for ${lintPath}`]);
                    };
                }
                (function node_apps_lint_getFiles():void {
                    const lintRun         = function node_apps_lint_lintRun(list:directoryList) {
                        let filesRead:number = 0,
                            filesLinted:number = 0,
                            a:number = 0,
                            first:boolean = false;
                        const len = list.length,
                            lintItem = function node_apps_lint_lintRun_lintItem(val:string):void {
                                console.log(`${apps.humanTime(false)}Starting lint: ${val}`);
                                filesRead = filesRead + 1;
                                node.child(`eslint ${val}`, {
                                    cwd: projectPath
                                }, function node_apps_lint_lintRun_lintItem_eslint(err:Error, stdout:string, stderr:string) {
                                    if (stdout === "" || stdout.indexOf("0:0  warning  File ignored because of a matching ignore pattern.") > -1) {
                                        if (err !== null) {
                                            apps.error([err.toString()]);
                                            return;
                                        }
                                        if (stderr !== null && stderr !== "") {
                                            apps.error([stderr]);
                                            return;
                                        }
                                        filesLinted = filesLinted + 1;
                                        if (first === false) {
                                            first = true;
                                            console.log("");
                                        }
                                        console.log(`${apps.humanTime(false) + text.green}Lint ${filesLinted} passed:${text.none} ${val}`);
                                        if (filesRead === filesLinted) {
                                            console.log("");
                                            if (callback === undefined) {
                                                console.log(`${text.green}Lint complete for ${text.cyan + text.bold + filesLinted + text.none + text.green} files!${text.none}`);
                                            } else {
                                                callback(`${text.green}Lint complete for ${text.cyan + text.bold + filesLinted + text.none + text.green} files!${text.none}`);
                                            }
                                            return;
                                        }
                                    } else {
                                        console.log(stdout);
                                        apps.error(["Lint failure."]);
                                        return;
                                    }
                                })
                            };
                        console.log(`${apps.humanTime(false)}Linting files...`);
                        console.log("");
                        do {
                            if (list[a][1] === "file" && (/\.js$/).test(list[a][0]) === true) {
                                lintItem(list[a][0]);
                            }
                            a = a + 1;
                        } while (a < len);
                    };
                    console.log(`${apps.humanTime(false)}Gathering JavaScript files from directory: ${text.green + lintPath + text.none}`);
                    apps.directory({
                        callback: lintRun,
                        depth: 0,
                        exclusions: (command === "lint" && process.argv[0] !== undefined)
                            ? exclusions
                            : [],
                        path      : lintPath,
                        recursive: true,
                        symbolic: false
                    });
                }());
            });
        };
        // CLI string output formatting for lists of items
        apps.lists = function node_apps_lists(lists:nodeLists):void {
            // * lists.empty_line - boolean - if each key should be separated by an empty line
            // * lists.heading    - string  - a text heading to precede the list
            // * lists.obj        - object  - an object to traverse
            // * lists.property   - string  - The child property to read from or "each"
            // * lists.total      - number  - To display a count
            // access a directly assigned primitive
            const keys:string[] = Object.keys(lists.obj).sort(),
                output:string[] = [],
                keyLength:number = keys.length,
                plural = (keyLength === 1)
                    ? ""
                    : "s",
                displayKeys = function node_apps_lists_displayKeys(item:string, keyList:string[]):void {
                    const len:number = keyList.length;
                    let a:number = 0,
                        b:number = 0,
                        c:number = 0,
                        lens:number = 0,
                        comm:string = "";
                    if (len < 1) {
                        apps.error([`Please run the build: ${text.cyan + version.command} build${text.none}`]);
                        return;
                    }
                    do {
                        if (keyList[a].length > lens) {
                            lens = keyList[a].length;
                        }
                        a = a + 1;
                    } while (a < len);
                    do {
                        comm = keyList[b];
                        c    = comm.length;
                        if (c < lens) {
                            do {
                                comm = comm + " ";
                                c    = c + 1;
                            } while (c < lens);
                        }
                        if (item !== "") {
                            // each of the "values" keys
                            apps.wrapIt(output, `   ${text.angry}- ${text.none + text.cyan + comm + text.none}: ${lists.obj.values[keyList[b]]}`);
                        } else {
                            // list all items
                            if (lists.property === "each") {
                                if (command === "options" && keyList[b] === "values") {
                                    // "values" key name of options
                                    output.push(`${text.angry}* ${text.none + text.cyan + comm + text.none}:`);
                                    node_apps_lists_displayKeys(command, Object.keys(lists.obj.values).sort());
                                } else {
                                    // all items keys and their primitive value
                                    apps.wrapIt(output, `${text.angry}* ${text.none + text.cyan + comm + text.none}: ${lists.obj[keyList[b]]}`);
                                }
                            } else {
                                // a list by key and specified property
                                apps.wrapIt(output, `${text.angry}* ${text.none + text.cyan + comm + text.none}: ${lists.obj[keyList[b]][lists.property]}`);
                            }
                            if (lists.empty_line === true) {
                                output.push("");
                            }
                        }
                        b = b + 1;
                    } while (b < len);
                };
            output.push("");
            output.push(`${text.underline + text.bold + version.name} - ${lists.heading + text.none}`);
            output.push("");
            displayKeys("", keys);
            if (command === "commands") {
                output.push("");
                output.push("For examples and usage instructions specify a command name, for example:");
                output.push(`${text.green + version.command} commands hash${text.none}`);
                output.push("");
                output.push(`Commands are tested using the ${text.green}simulation${text.none} command.`);
            } else if (command === "options" && lists.total === true) {
                output.push(`${text.green + keyLength + text.none} matching option${plural}.`);
            }
            apps.log(output);
        };
        // verbose metadata printed to the shell about the application
        apps.log = function node_apps_log(output:string[]):void {
            if (verbose === true && (output.length > 1 || output[0] !== "")) {
                console.log("");
            }
            if (output[output.length - 1] === "") {
                output.pop();
            }
            output.forEach(function node_apps_log_each(value:string) {
                console.log(value);
            });
            if (verbose === true) {
                console.log("");
                console.log(`${version.name} version ${text.angry + version.number + text.none}`);
                console.log(`Dated ${text.cyan + version.date + text.none}`);
                apps.humanTime(true);
            }
        };
        // makes specified directory structures in the local file system
        apps.makeDir = function node_apps_makeDir(dirToMake:string, callback:Function):void {
            node
                .fs
                .stat(dirToMake, function node_apps_makeDir_stat(err:nodeError, stats:Stats):void {
                    let dirs   = [],
                        ind    = 0,
                        len    = 0,
                        ers    = "";
                    const recursiveStat = function node_apps_makeDir_stat_recursiveStat():void {
                            node
                                .fs
                                .stat(
                                    dirs.slice(0, ind + 1).join(sep),
                                    function node_apps_makeDir_stat_recursiveStat_callback(errA:nodeError, statA:Stats):void {
                                        let errAs:string = "";
                                        ind = ind + 1;
                                        if (errA !== null) {
                                            errAs = errA.toString();
                                            if (errAs.indexOf("no such file or directory") > 0 || errA.code === "ENOENT") {
                                                node
                                                    .fs
                                                    .mkdir(
                                                        dirs.slice(0, ind).join(sep),
                                                        function node_apps_makeDir_stat_recursiveStat_callback_mkdir(errB:Error):void {
                                                            if (errB !== null && errB.toString().indexOf("file already exists") < 0) {
                                                                apps.error([errB.toString()]);
                                                                return;
                                                            }
                                                            if (ind < len) {
                                                                node_apps_makeDir_stat_recursiveStat();
                                                            } else {
                                                                callback();
                                                            }
                                                        }
                                                    );
                                                return;
                                            }
                                            if (errAs.indexOf("file already exists") < 0) {
                                                apps.error([errA.toString()]);
                                                return;
                                            }
                                        }
                                        if (statA.isFile() === true) {
                                            apps.error([`Destination directory, '${text.cyan + dirToMake + text.none}', is a file.`]);
                                            return;
                                        }
                                        if (ind < len) {
                                            node_apps_makeDir_stat_recursiveStat();
                                        } else {
                                            callback();
                                        }
                                    }
                                );
                        };
                    if (err !== null) {
                        ers = err.toString();
                        if (ers.indexOf("no such file or directory") > 0 || err.code === "ENOENT") {
                            dirs = dirToMake.split(sep);
                            if (dirs[0] === "") {
                                ind = ind + 1;
                            }
                            len = dirs.length;
                            recursiveStat();
                            return;
                        }
                        if (ers.indexOf("file already exists") < 0) {
                            apps.error([err.toString()]);
                            return;
                        }
                    }
                    if (stats.isFile() === true) {
                        apps.error([`Destination directory, '${text.cyan + dirToMake + text.none}', is a file.`]);
                        return;
                    }
                    callback();
                });
        };
        // similar to node's fs.readFile, but determines if the file is binary or text so that it can create either a buffer or text dump
        apps.readFile = function node_apps_readFile(args:readFile):void {
            // arguments
            // * callback - function - What to do next. Args
            // *    args - the arguments passed in
            // *    dump - the file data
            // * index - number - if the file is opened as a part of a directory operation then the index represents the index out of the entire directory list
            // * path - string - the file to open
            // * stat - Stats - the Stats object for the given file
            node
                .fs
                .open(args.path, "r", function node_apps_readFile_file_open(ero:Error, fd:number):void {
                    const failure = function node_apps_readFile_file_open_failure(message:string) {
                            if (args.index > 0) {
                                apps.error([
                                    `Failed after ${args.index} files.`,
                                    message
                                ]);
                            } else {
                                apps.error([message]);
                            }
                        },
                        messageSize = (args.stat.size < 100)
                            ? args.stat.size
                            : 100;
                    let buff  = Buffer.alloc(messageSize);
                    if (ero !== null) {
                        failure(ero.toString());
                        return;
                    }
                    node
                        .fs
                        .read(
                            fd,
                            buff,
                            0,
                            messageSize,
                            1,
                            function node_apps_readFile_file_open_read(errA:Error, bytesA:number, bufferA:Buffer):number {
                                let bufferString:string = "";
                                if (errA !== null) {
                                    failure(errA.toString());
                                    return;
                                }
                                bufferString = bufferA.toString("utf8", 0, bufferA.length);
                                bufferString = bufferString.slice(2, bufferString.length - 2);
                                if (binary_check.test(bufferString) === true) {
                                    buff = Buffer.alloc(args.stat.size);
                                    node
                                        .fs
                                        .read(
                                            fd,
                                            buff,
                                            0,
                                            args.stat.size,
                                            0,
                                            function node_apps_readFile_file_open_read_readBinary(errB:Error, bytesB:number, bufferB:Buffer):void {
                                                if (errB !== null) {
                                                    failure(errB.toString());
                                                    return;
                                                }
                                                if (bytesB > 0) {
                                                    node.fs.close(fd, function node_apps_readFile_file_open_read_readBinary_close():void {
                                                        args.callback(args, bufferB);
                                                    });
                                                }
                                            }
                                        );
                                } else {
                                    node
                                        .fs
                                        .readFile(args.path, {
                                            encoding: "utf8"
                                        }, function node_apps_readFile_file_open_read_readFile(errC:Error, dump:string):void {
                                            if (errC !== null && errC !== undefined) {
                                                failure(errC.toString());
                                                return;
                                            }
                                            node.fs.close(fd, function node_apps_readFile_file_open_read_readFile_close() {
                                                args.callback(args, dump);
                                            });
                                        });
                                }
                                return bytesA;
                            }
                        );
                });
        };
        // similar to posix "rm -rf" command
        apps.remove = function node_apps_remove(filePath:string, callback:Function):void {
            const numb:any = {
                    dirs: 0,
                    file: 0,
                    link: 0,
                    size: 0
                },
                removeItems = function node_apps_remove_removeItems(fileList:directoryList):void {
                    let a:number = 0;
                    const len:number = fileList.length,
                        destroy = function node_apps_remove_removeItems_destroy(item:directoryItem) {
                            const type:"rmdir"|"unlink" = (item[1] === "directory")
                                ? "rmdir"
                                : "unlink";
                            node.fs[type](item[0], function node_apps_remove_removeItems_destroy_callback(er:nodeError):void {
                                if (verbose === true && er !== null && er.toString().indexOf("no such file or directory") < 0) {
                                    if (er.code === "ENOTEMPTY") {
                                        node_apps_remove_removeItems_destroy(item);
                                        return;
                                    }
                                    apps.error([er.toString()]);
                                    return;
                                }
                                if (item[0] === fileList[0][0]) {
                                    callback();
                                } else {
                                    fileList[item[2]][3] = fileList[item[2]][3] - 1;
                                    if (fileList[item[2]][3] < 1) {
                                        node_apps_remove_removeItems_destroy(fileList[item[2]]);
                                    }
                                }
                            });
                        };
                    if (fileList.length < 1) {
                        callback();
                        return;
                    }
                    do {
                        if (command === "remove") {
                            if (fileList[a][1] === "file") {
                                numb.file = numb.file + 1;
                                numb.size = numb.size + fileList[a][4].size;
                            } else if (fileList[a][1] === "directory") {
                                numb.dirs = numb.dirs + 1;
                            } else if (fileList[a][1] === "link") {
                                numb.link = numb.link + 1;
                            }
                        }
                        if ((fileList[a][1] === "directory" && fileList[a][3] === 0) || fileList[a][1] !== "directory") {
                            destroy(fileList[a]);
                        }
                        a = a + 1;
                    } while (a < len);
                };
            if (command === "remove") {
                if (process.argv.length < 1) {
                    apps.error([
                        "Command remove requires a file path",
                        `${text.cyan + version.command} remove ../jsFiles${text.none}`
                    ]);
                    return;
                }
                filePath = node.path.resolve(process.argv[0]);
                callback = function node_apps_remove_callback() {
                    const out = [`${version.name} removed `];
                    console.log("");
                    verbose = true;
                    out.push(text.angry);
                    out.push(String(numb.dirs));
                    out.push(text.none);
                    out.push(" director");
                    if (numb.dirs === 1) {
                        out.push("y, ");
                    } else {
                        out.push("ies, ");
                    }
                    out.push(text.angry);
                    out.push(String(numb.file));
                    out.push(text.none);
                    out.push(" file");
                    if (numb.dirs !== 1) {
                        out.push("s");
                    }
                    out.push(", ");
                    out.push(text.angry);
                    out.push(String(numb.link));
                    out.push(text.none);
                    out.push(" symbolic link");
                    if (numb.link !== 1) {
                        out.push("s");
                    }
                    out.push(" at ");
                    out.push(text.angry);
                    out.push(apps.commas(numb.size));
                    out.push(text.none);
                    out.push(" bytes.");
                    apps.log([out.join(""), `Removed ${text.cyan + filePath + text.none}`]);
                };
            }
            apps.directory({
                callback: removeItems,
                depth: 0,
                exclusions: [],
                path: filePath,
                recursive: true,
                symbolic: true
            });
        };
        // runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
        apps.server = function node_apps_server():void {
            let timeStore:number = 0,
                serverPort:number = 0, // serverPort - for TCP sockets across the network
                webPort:number = 0, // webPort - http port for requests from browser
                wsPort:number = 0, // wsPort - web socket port for requests from node
                interfaceLongest:number = 0,
                responder:any,
                socketList:socketList = {};
            const browser:boolean = (function node_apps_server_browser():boolean {
                    const index:number = process.argv.indexOf("browser");
                    if (index > -1) {
                        process.argv.splice(index, 1);
                        return true;
                    }
                    return false;
                }()),
                addresses:[string, string, string][] = (function node_apps_server_addresses():[string, string, string][] {
                    const interfaces:NetworkInterfaceInfo = node.os.networkInterfaces(),
                        store:[string, string, string][] = [],
                        keys:string[] = Object.keys(interfaces),
                        length:number = keys.length;
                    let a:number = 0,
                        b:number = 0,
                        ipv6:number,
                        ipv4:number;
                    do {
                        ipv4 = -1;
                        ipv6 = -1;
                        b = 0;
                        do {
                            if (interfaces[keys[a]][b].internal === false) {
                                if (interfaces[keys[a]][b].family === "IPv6") {
                                    ipv6 = b;
                                    if (ipv4 > -1) {
                                        break;
                                    }
                                }
                                if (interfaces[keys[a]][b].family === "IPv4") {
                                    ipv4 = b;
                                    if (ipv6 > -1) {
                                        break;
                                    }
                                }
                            }
                            b = b + 1;
                        } while (b < interfaces[keys[a]].length);
                        if (ipv6 > -1) {
                            store.push([keys[a], interfaces[keys[a]][ipv6].address, "ipv6"]);
                            if (ipv4 > -1) {
                                store.push(["", interfaces[keys[a]][ipv4].address, "ipv4"]);
                            }
                        } else if (ipv4 > -1) {
                            store.push([keys[a], interfaces[keys[a]][ipv4].address, "ipv4"]);
                        }
                        if (keys[a].length > interfaceLongest && interfaces[keys[a]][0].internal === false) {
                            interfaceLongest = keys[a].length;
                        }
                        a = a + 1;
                    } while (a < length);
                    return store;
                }()),
                port:number = (isNaN(Number(process.argv[0])) === true)
                    ? version.port
                    : Number(process.argv[0]),
                keyword:string = (process.platform === "darwin")
                    ? "open"
                    : (process.platform === "win32")
                        ? "start"
                        : "xdg-open",
                watches = {},
                server = node.http.createServer(function node_apps_server_create(request, response):void {
                    if (request.method === "GET") {
                        let quest:number = request.url.indexOf("?"),
                            uri:string = (quest > 0)
                                ? request.url.slice(0, quest)
                                : request.url;
                        const localPath:string = (uri === "/")
                            ? `${projectPath}index.xhtml`
                            : projectPath + uri.slice(1).replace(/\/$/, "").replace(/\//g, sep);
                        node.fs.stat(localPath, function node_apps_server_create_stat(ers:nodeError, stat:Stats):void {
                            const random:number = Math.random(),
                                // navigating a file structure in the browser by direct address, like apache HTTP
                                page:string = [
                                    //cspell:disable
                                    `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xml:lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><title>${version.name}</title><meta content="width=device-width, initial-scale=1" name="viewport"/><meta content="index, follow" name="robots"/><meta content="#fff" name="theme-color"/><meta content="en" http-equiv="Content-Language"/><meta content="application/xhtml+xml;charset=UTF-8" http-equiv="Content-Type"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Enter"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Exit"/><meta content="text/css" http-equiv="content-style-type"/><meta content="application/javascript" http-equiv="content-script-type"/><meta content="#bbbbff" name="msapplication-TileColor"/></head><body>`,
                                    //cspell:enable
                                    `<h1>${version.name}</h1><div class="section">insertMe</div></body></html>`
                                ].join("");
                            if (request.url.indexOf("favicon.ico") < 0 && request.url.indexOf("images/apple") < 0) {
                                if (ers !== null) {
                                    if (ers.code === "ENOENT") {
                                        console.log(`${text.angry}404${text.none} for ${uri}`);
                                        response.writeHead(200, {"Content-Type": "text/html"});
                                        response.write(page.replace("insertMe", `<p>HTTP 404: ${uri}</p>`));
                                        response.end();
                                    } else {
                                        apps.error([ers.toString()]);
                                    }
                                    return;
                                }
                                if (stat.isDirectory() === true) {
                                    node.fs.readdir(localPath, function node_apps_server_create_stat_dir(erd:Error, list:string[]) {
                                        const dirList:string[] = [`<p>directory of ${localPath}</p> <ul>`];
                                        if (erd !== null) {
                                            apps.error([erd.toString()]);
                                            return;
                                        }
                                        list.forEach(function node_apps_server_create_stat_dir_list(value:string) {
                                            if ((/\.x?html?$/).test(value.toLowerCase()) === true) {
                                                dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}">${value}</a></li>`);
                                            } else {
                                                dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}?${random}">${value}</a></li>`);
                                            }
                                        });
                                        dirList.push("</ul>");
                                        response.writeHead(200, {"Content-Type": "text/html"});
                                        response.write(page.replace("insertMe", dirList.join("")));
                                        response.end();
                                    });
                                    return;
                                }
                                if (stat.isFile() === true) {
                                    const readCallback = function node_apps_server_create_readCallback(args:readFile, data:string|Buffer):void {
                                        let tool:boolean = false;
                                        if (localPath.indexOf(".js") === localPath.length - 3) {
                                            response.writeHead(200, {"Content-Type": "application/javascript"});
                                        } else if (localPath.indexOf(".css") === localPath.length - 4) {
                                            response.writeHead(200, {"Content-Type": "text/css"});
                                        } else if (localPath.indexOf(".jpg") === localPath.length - 4) {
                                            response.writeHead(200, {"Content-Type": "image/jpeg"});
                                        } else if (localPath.indexOf(".png") === localPath.length - 4) {
                                            response.writeHead(200, {"Content-Type": "image/png"});
                                        } else if (localPath.indexOf(".xhtml") === localPath.length - 6) {
                                            response.writeHead(200, {"Content-Type": "application/xhtml+xml"});
                                            if (localPath === `${projectPath}index.xhtml` && typeof data === "string") {
                                                const flag:any = {
                                                    settings: false,
                                                    messages: false
                                                };
                                                let list:string[] = [],
                                                    appliedData = function node_apps_server_create_readFile_appliedData():string {
                                                        const start:string = "<!--storage:-->",
                                                            startLength:number = data.indexOf(start) + start.length - 3,
                                                            dataString:string = data.replace("<!--network:-->", `<!--network:{"family":"${addresses[1][2]}","ip":"${addresses[1][1]}","port":${webPort},"wsPort":${wsPort},"serverPort":${serverPort}}-->`);
                                                        return `${dataString.slice(0, startLength)}{${list.join(",")}}${dataString.slice(startLength)}`;
                                                    };
                                                tool = true;
                                                node.fs.stat(`${projectPath}storage${sep}settings.json`, function node_apps_server_create_readFile_statSettings(erSettings:nodeError):void {
                                                    if (erSettings !== null) {
                                                        if (erSettings.code === "ENOENT") {
                                                            flag.settings = true;
                                                            list.push(`"settings":{}`);
                                                            if (flag.messages === true) {
                                                                response.write(appliedData());
                                                                response.end();
                                                            }
                                                        } else {
                                                            apps.error([erSettings.toString()]);
                                                            response.write(data);
                                                            response.end();
                                                        }
                                                    } else {
                                                        node.fs.readFile(`${projectPath}storage${sep}settings.json`, "utf8", function node_apps_server_create_readFile_statSettings(errSettings:Error, settings:string):void {
                                                            if (errSettings !== null) {
                                                                apps.error([errSettings.toString()]);
                                                                response.write(data);
                                                                response.end();
                                                            } else {
                                                                list.push(`"settings":${settings}`);
                                                                flag.settings = true;
                                                                if (flag.messages === true) {
                                                                    response.write(appliedData());
                                                                    response.end();
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                                node.fs.stat(`${projectPath}storage${sep}messages.json`, function node_apps_server_create_readFile_statMessages(erMessages:nodeError):void {
                                                    if (erMessages !== null) {
                                                        if (erMessages.code === "ENOENT") {
                                                            flag.messages = true;
                                                            list.push(`"messages":{}`);
                                                            if (flag.settings === true) {
                                                                response.write(appliedData());
                                                                response.end();
                                                            }
                                                        } else {
                                                            apps.error([erMessages.toString()]);
                                                            response.write(data);
                                                            response.end();
                                                        }
                                                    } else {
                                                        node.fs.readFile(`${projectPath}storage${sep}messages.json`, "utf8", function node_apps_server_create_readFile_statMessages(errMessages:Error, messages:string):void {
                                                            if (errMessages !== null) {
                                                                apps.error([errMessages.toString()]);
                                                                response.write(data);
                                                                response.end();
                                                            } else {
                                                                list.push(`"messages":${messages}`);
                                                                flag.messages = true;
                                                                if (flag.settings === true) {
                                                                    response.write(appliedData());
                                                                    response.end();
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        } else if (localPath.indexOf(".html") === localPath.length - 5 || localPath.indexOf(".htm") === localPath.length - 4) {
                                            response.writeHead(200, {"Content-Type": "text/html"});
                                        } else {
                                            response.writeHead(200, {"Content-Type": "text/plain"});
                                        }
                                        if (tool === false) {
                                            response.write(data);
                                            response.end();
                                        }
                                    };
                                    apps.readFile({
                                        callback: readCallback,
                                        index: 0,
                                        path: localPath,
                                        stat: stat
                                    });
                                } else {
                                    response.end();
                                }
                                return;
                            }
                        });
                    } else {
                        let body:string = "";
                        request.on('data', function (data:string) {
                            body = body + data;
                            if (body.length > 1e6) {
                                request.connection.destroy();
                            }
                        });

                        request.on('end', function node_apps_server_create_end():void {
                            let task:string = body.slice(0, body.indexOf(":")).replace("{", "").replace(/"/g, ""),
                                dataString:string = (body.charAt(0) === "{")
                                    ? body.slice(body.indexOf(":") + 1, body.length - 1)
                                    : body.slice(body.indexOf(":") + 1);
                            if (task === "fs") {
                                const data:localService = JSON.parse(dataString);
                                if (data.agent === "self") {
                                    if (data.action === "fs-read" || data.action === "fs-details") {
                                        const callback = function node_apps_server_create_end_putCallback(result:directoryList):void {
                                                count = count + 1;
                                                output.push(result);
                                                if (count === pathLength) {
                                                    response.writeHead(200, {"Content-Type": "application/json"});
                                                    response.write(JSON.stringify(output));
                                                    response.end();
                                                }
                                            },
                                            windowsRoot = function node_apps_server_create_end_windowsRoot():void {
                                                //cspell:disable
                                                node.child("wmic logicaldisk get name", function node_apps_server_create_windowsRoot(erw:Error, stdout:string, stderr:string):void {
                                                //cspell:enable
                                                    if (erw !== null) {
                                                        apps.error([erw.toString()]);
                                                    } else if (stderr !== "") {
                                                        apps.error([stderr]);
                                                    }
                                                    const drives:string[] = stdout.replace(/Name\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ").split(" "),
                                                        length:number = drives.length,
                                                        date:Date = new Date(),
                                                        driveList = function node_apps_server_create_windowsRoot_driveList(result:directoryList):void {
                                                            let b:number = 1;
                                                            const resultLength:number = result.length,
                                                                masterIndex:number = masterList.length;
                                                            do {
                                                                result[b][2] = masterIndex; 
                                                                b = b + 1;
                                                            } while (b < resultLength);
                                                            a = a + 1;
                                                            masterList = masterList.concat(result);
                                                            if (a === length) {
                                                                callback(masterList);
                                                            }
                                                        };
                                                    let masterList:directoryList = [["\\", "directory", 0, length, {
                                                            dev: 0,
                                                            ino: 0,
                                                            mode: 0,
                                                            nlink: 0,
                                                            uid: 0,
                                                            gid: 0,
                                                            rdev: 0,
                                                            size: 0,
                                                            blksize: 0,
                                                            blocks: 0,
                                                            atimeMs: 0,
                                                            mtimeMs: 0,
                                                            ctimeMs: 0,
                                                            birthtimeMs: 0,
                                                            atime: date,
                                                            mtime: date,
                                                            ctime: date,
                                                            birthtime: date,
                                                            isBlockDevice: function node_apps_server_create_windowsRoot_isBlockDevice() {},
                                                            isCharacterDevice: function node_apps_server_create_windowsRoot_isCharacterDevice() {},
                                                            isDirectory: function node_apps_server_create_windowsRoot_isDirectory() {},
                                                            isFIFO: function node_apps_server_create_windowsRoot_isFIFO() {},
                                                            isFile: function node_apps_server_create_windowsRoot_isFile() {},
                                                            isSocket: function node_apps_server_create_windowsRoot_isSocket() {},
                                                            isSymbolicLink: function node_apps_server_create_windowsRoot_isSymbolicLink() {}
                                                        }]],
                                                        a:number = 0;
                                                    drives.forEach(function node_apps_server_create_windowsRoot_each(value:string) {
                                                        apps.directory({
                                                            callback: driveList,
                                                            depth: 1,
                                                            path: `${value}\\`,
                                                            recursive: true,
                                                            symbolic: true
                                                        });
                                                    });
                                                });
                                            },
                                            pathList:string[] = data.location,
                                            pathLength:number = pathList.length,
                                            output:directoryList[] = [];
                                        let count:number = 0;
                                        if (pathList[0] === "defaultLocation") {
                                            pathList[0] = projectPath;
                                        }
                                        pathList.forEach(function node_apps_server_create_end_pathEach(value:string):void {
                                            if (value === "\\" || value === "\\\\") {
                                                windowsRoot();
                                            } else {
                                                node.fs.stat(value, function node_apps_server_create_end_putStat(erp:nodeError):void {
                                                    if (erp !== null) {
                                                        if (erp.code === "ENOENT") {
                                                            response.writeHead(404, {"Content-Type": "application/json"});
                                                            response.write("missing");
                                                            response.end();
                                                        }
                                                        apps.error([erp.toString()]);
                                                        count = count + 1;
                                                        return;
                                                    }

                                                    // please note
                                                    // watch must be "no" on all operations but fs-read
                                                    // fs-read must only contain a single path
                                                    if (data.watch !== "no" && data.watch !== projectPath) {
                                                        if (data.watch !== "yes" && watches[data.watch] !== undefined) {
                                                            watches[data.watch].close();
                                                            delete watches[data.watch];
                                                        }
                                                        if (watches[value] === undefined) {
                                                            watches[value] = node.fs.watch(value, {
                                                                recursive: false
                                                            }, function node_apps_server_watch():void {
                                                                if (value !== projectPath && value + sep !== projectPath) {
                                                                    ws.broadcast(`fsUpdate:${value}`);
                                                                }
                                                            });
                                                        }
                                                    }
                                                    apps.directory({
                                                        callback: callback,
                                                        depth: data.depth,
                                                        path: value,
                                                        recursive: true,
                                                        symbolic: true
                                                    });
                                                });
                                            }
                                        });
                                    } else if (data.action === "fs-close") {
                                        if (watches[data.location[0]] !== undefined) {
                                            watches[data.location[0]].close();
                                            delete watches[data.location[0]];
                                        }
                                        response.writeHead(200, {"Content-Type": "text/plain"});
                                        response.write(`Watcher ${data.location[0]} closed.`);
                                        response.end();
                                    } else if (data.action === "fs-copy" || data.action === "fs-cut") {
                                        let count:number = 0,
                                            length:number = data.location.length;
                                        data.location.forEach(function node_apps_server_create_end_copyEach(value:string):void {
                                            const callback = (data.action === "fs-copy")
                                                ? function node_apps_server_create_end_copyEach_copy():void {
                                                    count = count + 1;
                                                    if (count === length) {
                                                        response.writeHead(200, {"Content-Type": "text/plain"});
                                                        response.write(`Path(s) ${data.location.join(", ")} copied.`);
                                                        response.end();
                                                    }
                                                }
                                                : function node_apps_server_create_end_copyEach_cut():void {
                                                    apps.remove(value, function node_apps_server_create_end_copyEach_cut_callback():void {
                                                        count = count + 1;
                                                        if (count === length) {
                                                            response.writeHead(200, {"Content-Type": "text/plain"});
                                                            response.write(`Path(s) ${data.location.join(", ")} cut and pasted.`);
                                                            response.end();
                                                        }
                                                    });
                                                }
                                            apps.copy({
                                                callback: callback,
                                                destination:data.name,
                                                exclusions:[""],
                                                target:value
                                            });
                                        });
                                    } else if (data.action === "fs-destroy") {
                                        let count:number = 0;
                                        data.location.forEach(function node_apps_server_create_end_destroyEach(value:string):void {
                                            if (watches[value] !== undefined) {
                                                watches[value].close();
                                                delete watches[value];
                                            }
                                            apps.remove(value, function node_apps_server_create_end_destroy():void {
                                                count = count + 1;
                                                if (count === data.location.length) {
                                                    response.writeHead(200, {"Content-Type": "text/plain"});
                                                    response.write(`Path(s) ${data.location.join(", ")} destroyed.`);
                                                    response.end();
                                                }
                                            });
                                        });
                                    } else if (data.action === "fs-rename") {
                                        const newPath:string[] = data.location[0].split(sep);
                                        newPath.pop();
                                        newPath.push(data.name);
                                        node.fs.rename(data.location[0], newPath.join(sep), function node_apps_server_create_end_rename(erRename:Error):void {
                                            if (erRename === null) {
                                                response.writeHead(200, {"Content-Type": "text/plain"});
                                                response.write(`Path ${data.location[0]} renamed to ${newPath.join(sep)}.`);
                                                response.end();
                                            } else {
                                                apps.error([erRename.toString()]);
                                                console.log(erRename);
                                                response.writeHead(500, {"Content-Type": "text/plain"});
                                                response.write(erRename.toString());
                                                response.end();
                                            }
                                        });
                                    } else if (data.action === "fs-hash" || data.action === "fs-base64") {
                                        const task:string = data.action.replace("fs-", "");
                                        apps[task](data.location[0], function node_apps_server_create_end_dataString(dataString:string):void {
                                            response.writeHead(200, {"Content-Type": "text/plain"});
                                            response.write(dataString);
                                            response.end();
                                        });
                                    } else if (data.action === "fs-new") {
                                        const slash:string = (data.location[0].indexOf("/") < 0 || (data.location[0].indexOf("\\") < data.location[0].indexOf("/") && data.location[0].indexOf("\\") > -1 && data.location[0].indexOf("/") > -1))
                                                ? "\\"
                                                : "/",
                                            dirs = data.location[0].split(slash);
                                        dirs.pop();
                                        if (data.name === "directory") {
                                            apps.makeDir(data.location[0], function node_apps_server_create_end_newDirectory():void {
                                                response.writeHead(200, {"Content-Type": "text/plain"});
                                                response.write(`${data.location[0]} created.`);
                                                ws.broadcast(`fsUpdate:${dirs.join(slash)}`);
                                                response.end();
                                            });
                                        } else if (data.name === "file") {
                                            node.fs.writeFile(data.location[0], "", "utf8", function node_apps_Server_create_end_newFile(erNewFile:Error):void {
                                                if (erNewFile === null) {
                                                    response.writeHead(200, {"Content-Type": "text/plain"});
                                                    response.write(`${data.location[0]} created.`);
                                                    ws.broadcast(`fsUpdate:${dirs.join(slash)}`);
                                                    response.end();
                                                } else {
                                                    apps.error([erNewFile.toString()]);
                                                    console.log(erNewFile);
                                                    response.writeHead(500, {"Content-Type": "text/plain"});
                                                    response.write(erNewFile.toString());
                                                    response.end();
                                                }
                                            });
                                        }
                                    }
                                }
                            } else if (task === "settings" || task === "messages") {
                                const fileName:string = `${projectPath}storage${sep + task}-${Math.random()}.json`;
                                node.fs.writeFile(fileName, dataString, "utf8", function node_apps_server_create_writeStorage(erSettings:Error):void {
                                    if (erSettings !== null) {
                                        apps.error([erSettings.toString()]);
                                        console.log(erSettings);
                                        response.writeHead(200, {"Content-Type": "text/plain"});
                                        response.write(erSettings.toString());
                                        response.end();
                                        return;
                                    }
                                    node.fs.rename(fileName, `${projectPath}storage${sep + task}.json`, function node_apps_server_create_writeStorage_rename(erName:Error) {
                                        if (erName !== null) {
                                            apps.error([erName.toString()]);
                                            console.log(erName);
                                            node.fs.unlink(fileName, function node_apps_server_create_writeStorage_rename_unlink(erUnlink:Error) {
                                                if (erUnlink !== null) {
                                                    apps.error([erUnlink.toString()]);
                                                }
                                            });
                                            response.writeHead(500, {"Content-Type": "text/plain"});
                                            response.write(erName.toString());
                                            response.end();
                                            return;
                                        }
                                        response.writeHead(200, {"Content-Type": "text/plain"});
                                        response.write(`${task} written.`);
                                        response.end();
                                    });
                                });
                            } else if (task === "invite") {
                                const data:invite = JSON.parse(dataString);
                                if (socketList[data.ip] === undefined) {
                                    socketList[data.ip] = new node.net.Socket();
                                    socketList[data.ip].connect(data.port, data.ip, function node_apps_server_create_end_inviteConnect():void {
                                        socketList[data.ip].write(`invite:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","message":"${data.message}","modal":"${data.modal}","name":"${data.name}","port":"${serverPort}","shares":${JSON.stringify(data.shares)},"status":"${data.status}"}`);
                                    });
                                    socketList[data.ip].on("data", function node_apps_server_create_end_inviteData(socketData:string):void {
                                        console.log(socketData);
                                    });
                                    socketList[data.ip].on("error", function node_app_server_create_end_inviteError(errorMessage:nodeError):void {
                                        console.log(errorMessage);
                                        apps.error([errorMessage]);
                                        ws.broadcast(`invite-error:{"error":"${errorMessage.toString()}","modal":"${data.modal}"}`);
                                        if (socketList[data.ip] !== undefined) {
                                            socketList[data.ip].destroy();
                                        }
                                    });
                                } else {
                                    if (socketList[data.ip].connecting === true) {
                                        if (socketList[data.ip].localAddress === "0.0.0.0") {
                                            console.log(`Socket to ${text.cyan + text.bold + data.ip + text.none} appears to be ${text.angry}broken${text.none}.`);
                                        } else {
                                            console.log("Write to a socket not connected.");
                                        }
                                        console.log(`  ${text.angry}*${text.none} Specified Address: ${data.ip}`);
                                        console.log(`  ${text.angry}*${text.none} Specified Port   : ${data.port}`);
                                        if (socketList[data.ip].localAddress === "0.0.0.0") {
                                            console.log(`  ${text.angry}*${text.none} Local Address    : ${text.angry}0.0.0.0${text.none}`);
                                        } else {
                                            console.log(`  ${text.angry}*${text.none} Local Address    : ${socketList[data.ip].localAddress}`);
                                        }
                                        console.log(`  ${text.angry}*${text.none} Local Port       : ${socketList[data.ip].localPort}`);
                                        console.log(`  ${text.angry}*${text.none} Remote Address   : ${socketList[data.ip].remoteAddress}`);
                                        console.log(`  ${text.angry}*${text.none} Remote Port      : ${socketList[data.ip].remotePort}`);
                                        console.log("");
                                    }
                                    socketList[data.ip].write(`invite:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","message":"${data.message}","modal":"${data.modal}","name":"${data.name}","port":"${serverPort}","shares":${JSON.stringify(data.shares)},"status":"${data.status}"}`);
                                }
                            } else if (task === "heartbeat") {
                                const data = JSON.parse(dataString);
                                if (socketList[data.ip] === undefined) {
                                    socketList[data.ip] = new node.net.Socket();
                                    socketList[data.ip].connect(data.port, data.ip, function node_apps_server_create_end_heartbeatConnect():void {console.log(socketList[data.ip].connecting+" new");
                                        socketList[data.ip].write(`heartbeat:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","port":${serverPort},"status":"${data.status}","user":"${data.user}"}`);
                                    });
                                    socketList[data.ip].on("data", function node_apps_server_create_end_heartbeatData(socketData:string):void {
                                        console.log(socketData);
                                    });
                                    socketList[data.ip].on("error", function node_app_server_create_end_heartbeatError(errorMessage:Error):void {
                                        console.log(errorMessage);
                                        if (socketList[data.ip] !== undefined && socketList[data.ip].destroyed === true) {
                                            delete socketList[data.ip];
                                        }
                                        ws.broadcast(`heartbeat:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","port":${serverPort},"status":"offline","user":"${data.user}"}`);
                                    });
                                } else {
                                    if (socketList[data.ip].connecting === true) {
                                        if (socketList[data.ip].localAddress === "0.0.0.0") {
                                            console.log(`Socket to ${text.cyan + text.bold + data.ip + text.none} appears to be ${text.angry}broken${text.none}.`);
                                        } else {
                                            console.log("Write to a socket not connected.");
                                        }
                                        console.log(`  ${text.angry}*${text.none} Specified Address: ${data.ip}`);
                                        console.log(`  ${text.angry}*${text.none} Specified Port   : ${data.port}`);
                                        if (socketList[data.ip].localAddress === "0.0.0.0") {
                                            console.log(`  ${text.angry}*${text.none} Local Address    : ${text.angry}0.0.0.0${text.none}`);
                                        } else {
                                            console.log(`  ${text.angry}*${text.none} Local Address    : ${socketList[data.ip].localAddress}`);
                                        }
                                        console.log(`  ${text.angry}*${text.none} Local Port       : ${socketList[data.ip].localPort}`);
                                        console.log(`  ${text.angry}*${text.none} Remote Address   : ${socketList[data.ip].remoteAddress}`);
                                        console.log(`  ${text.angry}*${text.none} Remote Port      : ${socketList[data.ip].remotePort}`);
                                        console.log("");
                                    }
                                    socketList[data.ip].write(`heartbeat:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","port":${serverPort},"status":"${data.status}","user":"${data.user}"}`);
                                }
                            }
                        });
                    }
                }),
                serverError = function node_apps_server_serverError(error:nodeError, port:number):void {
                    if (error.code === "EADDRINUSE") {
                        if (error.port === port + 1) {
                            apps.error([`Web socket channel port, ${text.cyan + port + text.none}, is in use!  The web socket channel is 1 higher than the port designated for the HTTP server.`]);
                        } else {
                            apps.error([`Specified port, ${text.cyan + port + text.none}, is in use!`]);
                        }
                    } else {
                        apps.error([`${error.Error}`]);
                    }
                    return
                },
                ignore   = function node_apps_server_ignore(input:string|null):boolean {
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
                },
                start = function node_apps_server_start() {
                    if (process.cwd() !== projectPath) {
                        process.chdir(projectPath);
                    }
                    watches[projectPath] = node.fs.watch(projectPath, {
                        recursive: true
                    }, function node_apps_server_watch(type:"rename"|"change", filename:string|null):void {
                        if (filename === null || ignore(filename) === true || filename.indexOf("storage") === 0) {
                            return;
                        }
                        const extension:string = (function node_apps_server_watch_extension():string {
                                const list = filename.split(".");
                                return list[list.length - 1];
                            }()),
                            time = function node_apps_server_watch_time(message:string):number {
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
                                console.log(`[${text.cyan + dateArray.join(":") + text.none}] ${message}`);
                                timeStore = date.valueOf();
                                return timeStore;
                            };
                        if (extension === "ts" && timeStore < Date.now() - 1000) {
                            let start:number,
                                compile:number,
                                duration = function node_apps_server_watch_duration(length:number):void {
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
                                    console.log(`[${text.bold + text.purple + list.join(":") + text.none}] Total compile time.\u0007`);
                                };
                            console.log("");
                            start = time(`Compiling for ${text.green + filename + text.none}`);
                            node.child(`${version.command} build incremental`, {
                                cwd: projectPath
                            }, function node_apps_server_watch_child(err:Error, stdout:string, stderr:string):void {
                                if (err !== null) {
                                    apps.error([err.toString()]);
                                    return;
                                }
                                if (stderr !== "") {
                                    apps.error([stderr]);
                                    return;
                                }
                                compile = time("TypeScript Compiled") - start;
                                duration(compile);
                                ws.broadcast("reload");
                                return;
                            });
                        } else if (extension === "css" || extension === "xhtml") {
                            ws.broadcast("reload");
                        } else {
                            ws.broadcast(`fsUpdate:${projectPath}`);
                        }
                    });
                    server.on("error", serverError);
                    server.listen(port);
                    webPort = server.address().port;
                    wsPort = (port === 0)
                        ? 0
                        : webPort + 1;

                    ws = new webSocket.Server({port: wsPort});

                    responder = node.net.createServer(function node_apps_server_start_listener(response:Socket):void {
                        response.on("data", function node_apps_server_start_listener_data(data:Buffer):void {
                            const message:string = data.toString();
                            if (message.indexOf("invite:") === 0 && message !== "invite:") {
                                ws.broadcast(message);
                            } else if (message.indexOf("heartbeat:") === 0 && message !== "heartbeat:") {
                                ws.broadcast(message);
                            }
                        });
                        response.on("end", function node_apps_server_start_listener_end():void {
                            console.log("Socket server disconnected.");
                        });
                        response.on("error", function node_apps_server_start_listener_error(data:Buffer):void {
                            console.log("Socket server error");
                            console.log(data.toString());
                        });
                    });
                    serverPort = (port === 0)
                        ? 0
                        : wsPort + 1;
                    responder.listen(serverPort, addresses[1][1], function node_apps_server_start_listen():void {
                        serverPort = responder.address().port;

                        ws.broadcast = function node_apps_server_start_broadcast(data:string):void {
                            ws.clients.forEach(function node_apps_server_start_broadcast_clients(client):void {
                                if (client.readyState === webSocket.OPEN) {
                                    client.send(data);
                                }
                            });
                        };
                        wsPort = ws.address().port;

                        console.log("");
                        console.log(`${text.cyan}HTTP server${text.none} on port: ${text.bold + text.green + webPort + text.none}`);
                        console.log(`${text.cyan}Web Sockets${text.none} on port: ${text.bold + text.green + wsPort + text.none}`);
                        console.log(`${text.cyan}TCP Service${text.none} on port: ${text.bold + text.green + serverPort + text.none}`);
                        console.log("Local IP addresses are:");
                        {
                            let a:number = 0;
                            addresses.forEach(function node_apps_server_localAddresses(value:[string, string, string]):void {
                                a = value[0].length;
                                if (a < interfaceLongest) {
                                    do {
                                        value[0] = value[0] + " ";
                                        a = a + 1;
                                    } while (a < interfaceLongest);
                                }
                                if (value[0].charAt(0) === " ") {
                                    console.log(`     ${value[0]}: ${value[1]}`);
                                } else {
                                    console.log(`   ${text.angry}*${text.none} ${value[0]}: ${value[1]}`);
                                }
                            });
                            console.log("");
                            console.log(`Address for web browser: ${text.bold + text.green}http://localhost:${webPort + text.none}`);
                            console.log(`or                     : ${text.bold + text.green}http://[${addresses[0][1]}]:${webPort + text.none}`);
                            if (addresses[1][0].charAt(0) === " ") {
                                console.log(`or                     : ${text.bold + text.green}http://${addresses[1][1]}:${webPort + text.none}`);
                                console.log("");
                                console.log(`Address for net service: ${text.bold + text.green + addresses[1][1]}:${serverPort + text.none}`);
                            } else {
                                console.log("");
                                console.log(`Address for net service: ${text.bold + text.green}[${addresses[0][1]}]:${serverPort + text.none}`);
                            }
                            console.log("");
                        }
                    });
                },
                webSocket = require("ws");
            if (process.argv[0] !== undefined && isNaN(Number(process.argv[0])) === true) {
                apps.error([`Specified port, ${text.angry + process.argv[0] + text.none}, is not a number.`]);
                return;
            }

            start();

            // open a browser from the command line
            if (browser === true) {
                node.child(`${keyword} http://localhost:${port}/`, {cwd: cwd}, function node_apps_server_create_stat_browser(errs:nodeError, stdout:string, stdError:string|Buffer):void {
                    if (errs !== null) {
                        apps.error([errs.toString()]);
                        return;
                    }
                    if (stdError !== "") {
                        apps.error([stdError]);
                        return;
                    }
                    console.log("");
                    console.log("Launching default web browser...");
                });
            }
        };
        // simulates running the various commands of this services.ts file
        apps.simulation = function node_apps_simulation(callback:Function):void {
            const tests:simulationItem[] = require(`${js}test${sep}simulations.js`),
                len:number = tests.length,
                increment = function node_apps_simulation_increment(irr:string):void {
                    const interval = function node_apps_simulation_increment_interval():void {
                        a = a + 1;
                        if (a < len) {
                            wrapper();
                        } else {
                            console.log("");
                            if (callback === undefined) {
                                console.log(`${text.green}Successfully completed all ${text.cyan + text.bold + len + text.none + text.green} simulation tests.${text.none}`);
                            } else {
                                callback(`${text.green}Successfully completed all ${text.cyan + text.bold + len + text.none + text.green} simulation tests.${text.none}`);
                            }
                        }
                    };
                    if (irr !== "") {
                        console.log(`${apps.humanTime(false) + text.underline}Test ${a + 1} ignored (${text.angry + irr + text.none + text.underline}):${text.none} ${tests[a].command}`);
                    } else {
                        console.log(`${apps.humanTime(false) + text.green}Passed simulation ${a + 1}: ${text.none + tests[a].command}`);
                    }
                    if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                        interval();
                    } else {
                        apps.remove(tests[a].artifact, function node_apps_simulation_wrapper_remove():void {
                            interval();
                        });
                    }
                },
                error = function node_apps_simulation_error(message:string, stdout:string) {
                    apps.error([
                        `Simulation test string ${text.angry + tests[a].command + text.none} ${message}:`,
                        tests[a].test,
                        "",
                        "",
                        `${text.green}Actual output:${text.none}`,
                        stdout
                    ]);
                },
                wrapper = function node_apps_simulation_wrapper():void {
                    node.child(`${version.command} ${tests[a].command}`, {cwd: cwd, maxBuffer: 2048 * 500}, function node_apps_simulation_wrapper_child(errs:nodeError, stdout:string, stdError:string|Buffer) {
                        tests[a].test = tests[a].test.replace("version[command]", version.command).replace("version[name]", version.name);
                        if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                            flag.write = "";
                        } else {
                            tests[a].artifact = node.path.resolve(tests[a].artifact);
                            flag.write = tests[a].artifact;
                        }
                        if (errs !== null) {
                            //cspell:disable
                            if (errs.toString().indexOf("getaddrinfo ENOTFOUND") > -1) {
                            //cspell:enable
                                increment("no internet connection");
                                return;
                            }
                            if (errs.toString().indexOf("certificate has expired") > -1) {
                                increment("TLS certificate expired on HTTPS request");
                                return;
                            }
                            if (stdout === "") {
                                apps.error([errs.toString()]);
                                return;
                            }
                        }
                        if (stdError !== "") {
                            apps.error([stdError]);
                            return;
                        }
                        if (typeof stdout === "string") {
                            stdout = stdout.replace(/\s+$/, "").replace(/^\s+/, "").replace(/\u0020-?\d+(\.\d+)*\s/g, " XXXX ").replace(/\\n-?\d+(\.\d+)*\s/g, "\\nXXXX ");
                        }
                        if (tests[a].qualifier.indexOf("file") === 0) {
                            if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                                apps.error([`Tests ${text.cyan + tests[a].command + text.none} uses ${text.angry + tests[a].qualifier + text.none} as a qualifier but does not mention an artifact to remove.`]);
                                return;
                            }
                            if (tests[a].qualifier.indexOf("file ") === 0) {
                                tests[a].file = node.path.resolve(tests[a].file);
                                node.fs.readFile(tests[a].file, "utf8", function node_apps_simulation_wrapper_file(err:Error, dump:string) {
                                    if (err !== null) {
                                        apps.error([err.toString()]);
                                        return;
                                    }
                                    if (tests[a].qualifier === "file begins" && dump.indexOf(tests[a].test) !== 0) {
                                        error(`is not starting in file: ${text.green + tests[a].file + text.none}`, dump);
                                        return;
                                    }
                                    if (tests[a].qualifier === "file contains" && dump.indexOf(tests[a].test) < 0) {
                                        error(`is not anywhere in file: ${text.green + tests[a].file + text.none}`, dump);
                                        return;
                                    }
                                    if (tests[a].qualifier === "file ends" && dump.indexOf(tests[a].test) === dump.length - tests[a].test.length) {
                                        error(`is not at end of file: ${text.green + tests[a].file + text.none}`, dump);
                                        return;
                                    }
                                    if (tests[a].qualifier === "file is" && dump !== tests[a].test) {
                                        error(`does not match the file: ${text.green + tests[a].file + text.none}`, dump);
                                        return;
                                    }
                                    if (tests[a].qualifier === "file not" && dump === tests[a].test) {
                                        error(`matches this file, but shouldn't: ${text.green + tests[a].file + text.none}`, dump);
                                        return;
                                    }
                                    if (tests[a].qualifier === "file not contains" && dump.indexOf(tests[a].test) > -1) {
                                        error(`is contained in this file, but shouldn't be: ${text.green + tests[a].file + text.none}`, dump);
                                        return;
                                    }
                                    increment("");
                                });
                            } else if (tests[a].qualifier.indexOf("filesystem ") === 0) {
                                tests[a].test = node.path.resolve(tests[a].test);
                                node.fs.stat(tests[a].test, function node_apps_simulation_wrapper_filesystem(ers:Error) {
                                    if (ers !== null) {
                                        if (tests[a].qualifier === "filesystem contains" && ers.toString().indexOf("ENOENT") > -1) {
                                            apps.error([
                                                `Simulation test string ${text.angry + tests[a].command + text.none} does not see this address in the local file system:`,
                                                text.cyan + tests[a].test + text.none
                                            ]);
                                            return;
                                        }
                                        apps.error([ers.toString()]);
                                        return;
                                    }
                                    if (tests[a].qualifier === "filesystem not contains") {
                                        apps.error([
                                            `Simulation test string ${text.angry + tests[a].command + text.none} sees the following address in the local file system, but shouldn't:`,
                                            text.cyan + tests[a].test + text.none
                                        ]);
                                        return;
                                    }
                                    increment("");
                                });
                            }
                        } else {
                            if (tests[a].qualifier === "begins" && (typeof stdout !== "string" || stdout.indexOf(tests[a].test) !== 0)) {
                                error("does not begin with the expected output", stdout);
                                return;
                            }
                            if (tests[a].qualifier === "contains" && (typeof stdout !== "string" || stdout.indexOf(tests[a].test) < 0)) {
                                error("does not contain the expected output", stdout);
                                return;
                            }
                            if (tests[a].qualifier === "ends" && (typeof stdout !== "string" || stdout.indexOf(tests[a].test) !== stdout.length - tests[a].test.length)) {
                                error("does not end with the expected output", stdout);
                                return;
                            }
                            if (tests[a].qualifier === "is" && stdout !== tests[a].test) {
                                error("does not match the expected output", stdout);
                                return;
                            }
                            if (tests[a].qualifier === "not" && stdout === tests[a].test) {
                                error("must not be this output", stdout);
                                return;
                            }
                            if (tests[a].qualifier === "not contains" && (typeof stdout !== "string" || stdout.indexOf(tests[a].test) > -1)) {
                                error("must not contain this output", stdout)
                                return;
                            }
                            increment("");
                        }
                    });
                };

            let a:number = 0;
            if (command === "simulation") {
                callback = function node_apps_lint_callback(message:string):void {
                    apps.log([message, "\u0007"]); // bell sound
                };
                verbose = true;
                console.log("");
                console.log(`${text.underline + text.bold + version.name} - services.ts simulation tests${text.none}`);
                console.log("");
            }
            wrapper();
        };
        // run the test suite using the build application
        apps.test = function node_apps_test():void {
            apps.build(true);
        };
        // runs apps.log
        apps.version = function ():void {
            verbose = true;
            apps.log([""]);
        };
        // performs word wrap when printing text to the shell
        apps.wrapIt = function node_apps_wrapIt(outputArray:string[], string:string):void {
            const wrap:number = 100;
            if (string.length > wrap) {
                const indent:string = (function node_apps_wrapIt_indent():string {
                        const len:number = string.length;
                        let inc:number = 0,
                            num:number = 2,
                            str:string = "";
                        if ((/^(\s*((\u002a|-)\s*)?\w+\s*:)/).test(string.replace(/\u001b\[\d+m/g, "")) === false) {
                            return "";
                        }
                        do {
                            if (string.charAt(inc) === ":") {
                                break;
                            }
                            if (string.charAt(inc) === "\u001b") {
                                if (string.charAt(inc + 4) === "m") {
                                    inc = inc + 4;
                                } else {
                                    inc = inc + 3;
                                }
                            } else {
                                num = num + 1;
                            }
                            inc = inc + 1;
                        } while (inc < len);
                        inc = 0;
                        do {
                            str = str + " ";
                            inc = inc + 1;
                        } while (inc < num);
                        return str;
                    }()),
                    formLine = function node_apps_wrapIt_formLine():void {
                        let inc:number = 0,
                            wrapper:number = wrap;
                        do {
                            if (string.charAt(inc) === "\u001b") {
                                if (string.charAt(inc + 4) === "m") {
                                    wrapper = wrapper + 4;
                                } else {
                                    wrapper = wrapper + 3;
                                }
                            }
                            inc = inc + 1;
                        } while (inc < wrapper);
                        inc = wrapper;
                        if (string.charAt(wrapper) !== " " && string.length > wrapper) {
                            do {
                                wrapper = wrapper - 1;
                            } while (wrapper > 0 && string.charAt(wrapper) !== " ");
                            if (wrapper === 0 || wrapper === indent.length - 1) {
                                wrapper = inc;
                                do {
                                    wrapper = wrapper + 1;
                                } while (wrapper < string.length && string.charAt(wrapper) !== " ");
                            }
                        }
                        outputArray.push(string.slice(0, wrapper).replace(/\s+$/, ""));
                        string = string.slice(wrapper + 1).replace(/^\s+/, "");
                        if (string.length + indent.length > wrap) {
                            string = indent + string;
                            node_apps_wrapIt_formLine();
                        } else if (string !== "") {
                            outputArray.push(indent + string);
                        }
                    };
                formLine();
            } else {
                outputArray.push(string);
            }
        };
        apps[command]();
    });
}());