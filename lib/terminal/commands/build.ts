
/* lib/terminal/commands/build - The library that executes the build and test tasks. */
import { Stats, write } from "fs";

import commands_documentation from "../utilities/commands_documentation.js";
import error from "../utilities/error.js";
import directory from "./directory.js";
import hash from "./hash.js";
import humanTime from "../utilities/humanTime.js";
import lint from "./lint.js";
import log from "../utilities/log.js";
import testListRunner from "../test/application/runner.js";
import vars from "../utilities/vars.js";
import remove from "./remove.js";

// build/test system
const build = function terminal_build(test:boolean, callback:Function):void {
        let firstOrder:boolean = true,
            sectionTime:[number, number] = [0, 0];
        const order = {
                build: [
                    "configurations",
                    "clearStorage",
                    "commands",
                    "libReadme",
                    "typescript",
                    "version"
                ],
                test: [
                    "lint",
                    "simulation",
                    "service"
                ]
            },
            type:string = (test === true)
                ? "test"
                : "build",
            orderLength:number = order[type].length,
            testsCallback = function terminal_build_testsCallback(message:string, failCount:number):void {
                if (failCount > 0) {
                    vars.verbose = true;
                    log([message], true);
                    process.exit(1);
                } else {
                    next(message);
                }
            },
            // a short title for each build/test phase
            heading = function terminal_build_heading(message:string):void {
                if (firstOrder === true) {
                    log([""]);
                    firstOrder = false;
                } else if (order[type].length < orderLength) {
                    log(["________________________________________________________________________", "", ""]);
                }
                log([vars.text.cyan + vars.text.bold + message + vars.text.none, ""]);
            },
            // indicates how long each phase took
            sectionTimer = function terminal_build_sectionTime(input:string):void {
                let now:string[] = input.replace(`${vars.text.cyan}[`, "").replace(`]${vars.text.none} `, "").split(":"),
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
                log([`${vars.text.cyan + vars.text.bold}[${times.join(":")}]${vars.text.none} ${vars.text.green}Total section time.${vars.text.none}`]);
            },
            // the transition to the next phase or completion
            next = function terminal_build_next(message:string):void {
                let phase = order[type][0],
                    time:string = humanTime(false);
                if (message !== "") {
                    log([time + message]);
                    sectionTimer(time);
                }
                if (order[type].length < 1) {
                    if (vars.command === "build") {
                        vars.verbose = true;
                        heading(`${vars.text.none}All ${vars.text.green + vars.text.bold}build${vars.text.none} tasks complete... Exiting clean!\u0007`);
                        log([""], true);
                        process.exit(0);
                        return;
                    }
                    callback();
                } else {
                    order[type].splice(0, 1);
                    phases[phase]();
                }
            },
            // These are all the parts of the execution cycle, but their order is dictated by the 'order' object.
            phases = {
                // clearStorage removes temporary storage files that should have been removed, but weren't
                clearStorage: function terminal_build_clearStorage():void {
                    heading("Removing unnecessary temporary files");
                    vars.node.fs.readdir(`${vars.projectPath}lib${vars.sep}storage`, function terminal_build_clearStorage_dir(erd:nodeError, dirList:string[]) {
                        if (erd !== null) {
                            error([erd.toString()]);
                            return;
                        }
                        const length:number = dirList.length,
                            tempTest:RegExp = (/((^\w+-0\.\d+)|(undefined)).json$/);
                        let a:number = 0,
                            start:number = 0,
                            end:number = 0;
                        do {
                            if (tempTest.test(dirList[a]) === true) {
                                start = start + 1;
                                vars.node.fs.unlink(`${vars.projectPath}lib${vars.sep}storage${vars.sep + dirList[a]}`, function terminal_build_clearStorage_dir_unlink(eru:nodeError):void {
                                    if (eru !== null) {
                                        error([erd.toString()]);
                                        return;
                                    }
                                    end = end + 1;
                                    if (end === start) {
                                        const plural:string = (start === 1)
                                            ? ""
                                            : "s";
                                        next(`${start} temporary storage file${plural} removed.`);
                                    }
                                });
                            }
                            a = a + 1;
                        } while (a < length);
                        if (start === 0) {
                            next("There are no temporary storage files to remove.");
                        }
                    });
                },
                // builds the documentation/commands.md file
                commands: function terminal_build_commands():void {
                    heading("Writing commands.md documentation");

                    const keys:string[] = Object.keys(commands_documentation),
                        output:string[] = [],
                        eachExample = function terminal_build_commands_eachExample(example:commandExample):void {
                            output.push(`1. \`${example.code}\``);
                            output.push(`   - ${example.defined}`);
                        },
                        filePath:string = `${vars.projectPath}documentation${vars.sep}commands.md`;
                    output.push("");
                    output.push("<!-- documentation/commands - This documentation describes the various supported terminal commands and is automatically generated from `lib/terminal/utilities/commands_documentation.ts`. -->");
                    output.push("");
                    output.push("# Share File Systems - Command Documentation");
                    output.push(`This documentation is also available interactively at your finger tips using the command: \`${vars.version.command} commands\`.  **Please do not edit this file as it is written by the build process.**`);
                    output.push("");
                    keys.forEach(function terminal_build_commands_each(command:string):void {
                        const examples:commandExample[] = commands_documentation[command].example;
                        output.push(`## ${command}`);
                        output.push(commands_documentation[command].description);
                        output.push("");
                        output.push("### Examples");
                        examples.forEach(eachExample);
                        output.push("");
                    });
                    vars.node.fs.writeFile(filePath, output.join("\n"), "utf8", function terminal_build_commands_write(err:nodeError):void {
                        if (err === null) {
                            next(`File ${filePath} successfully written.`);
                            return;
                        }
                        error([err.toString()]);
                    });
                },
                // writes configuration data to files
                configurations: function terminal_build_configurations():void {
                    heading("Write Configuration Files");
                    vars.node.fs.readFile(`${vars.projectPath}lib${vars.sep}configurations.json`, "utf8", function terminal_build_configurations_read(err:nodeError, fileData:string) {
                        if (err === null) {
                            const config:any = JSON.parse(fileData),
                                keys:string[] = Object.keys(config),
                                length:number = keys.length,
                                writeCallback = function terminal_build_configurations_read_remove(wErr:nodeError):void {
                                    if (wErr === null) {
                                        a = a + 1;
                                        if (a === length) {
                                            next("Configuration files written!");
                                        } else {
                                            write();
                                        }
                                        return;
                                    }
                                    error([wErr.toString()]);
                                },
                                write = function terminal_build_configurations_read_remove():void {
                                    if (Array.isArray(config[keys[a]]) === true) {
                                        if (config[keys[a]].length === 1) {
                                            config[keys[a]] = config[keys[a]][0];
                                        } else {
                                            config[keys[a]] = config[keys[a]].join(vars.node.os.EOL);
                                        }
                                    } else {
                                        config[keys[a]] = JSON.stringify(config[keys[a]]);
                                    }
                                    vars.node.fs.writeFile(vars.projectPath + keys[a], config[keys[a]], "utf8", writeCallback);
                                },
                                removeCallback = function terminal_build_configurations_read_remove():void {
                                    count = count + 1;
                                    if (count === length) {
                                        a = 0;
                                        write();
                                    }
                                };
                            let a:number = length,
                                count:number = 0;
                            do {
                                a = a - 1;
                                remove(vars.projectPath + keys[a], removeCallback);
                            } while (a > 0);
                            return;
                        }
                        error([err.toString()]);
                    });
                },
                // libReadme builds out the readme file that indexes code files in the current directory
                libReadme: function terminal_build_libReadme():void {
                    heading("Writing lib directory readme.md files.");

                    let dirList:directoryList = [];
                    const callback = function terminal_build_dirCallback(list:directoryList):void {
                            if (dirList.length < 1) {
                                dirList = list;
                            } else {
                                dirList = dirList.concat(list);
                                dirs();
                            }
                        },
                        dirs = function terminal_build_libReadme_dirs():void {
                            let writeStart:number = 0,
                                writeEnd:number = 0,
                                master:number = 0,
                                a:number = 0,
                                fileStart:number = 0,
                                fileEnd:number = 0;
                            const length:number = dirList.length,
                                masterList = function terminal_build_libReadme_masterList():void {
                                    let a:number = 0,
                                        b:number = 0,
                                        path:string,
                                        extension:"md"|"ts";
                                    const fileLength:number = files.length,
                                        fileContents:string[] = [],
                                        filePath:string = `${vars.projectPath}documentation${vars.sep}library_list.md`;
                                    fileContents.push("<!-- documentation/library_list - Automated list of all code and documentation files with brief descriptions. -->");
                                    fileContents.push("");
                                    fileContents.push(`# Share File Systems - Code Library List`);
                                    fileContents.push("This is a dynamically compiled list of supporting code files that comprise this application with a brief description of each file.");
                                    fileContents.push("");
                                    do {
                                        if (a < 1 || files[a].path !== files[a - 1].path) {
                                            path = `* Directory *[../${files[a].path}](../${files[a].path})*`;
                                            fileContents.push(path);
                                        }
                                        b = files[a].path.length + files[a].name.length;
                                        if (files[a].path === "documentation") {
                                            extension = "md";
                                            path = `   - **[${files[a].name}.${extension}](${files[a].name}.${extension})**`;
                                            b = b - 17;
                                        } else {
                                            extension = "ts";
                                            path = `   - **[../${files[a].path}/${files[a].name}.${extension}](../${files[a].path}/${files[a].name}.${extension})**`;
                                        }
                                        if (b < master) {
                                            do {
                                                path = `${path}  `;
                                                b = b + 1;
                                            } while (b < master);
                                        }
                                        fileContents.push(`${path} - ${files[a].description}`);
                                        a = a + 1;
                                    } while (a < fileLength);
                                    vars.node.fs.writeFile(filePath, fileContents.join("\n"), "utf8", function terminal_build_libReadme_masterList_write(erWrite:nodeError):void {
                                        if (erWrite !== null) {
                                            error([erWrite.toString()]);
                                            return;
                                        }
                                        log([`${humanTime(false)}Updated ${filePath}`]);
                                        next("Completed writing lib directory readme.md files.");
                                    });
                                },
                                write = function terminal_build_libReadme_write(path:string, fileList:string):void {
                                    const filePath:string = `${vars.projectPath + path.replace(/\//g, vars.sep) + vars.sep}readme.md`;
                                    writeStart = writeStart + 1;
                                    vars.node.fs.readFile(filePath, "utf8", function terminal_build_libReadme_write_readFile(erRead:nodeError, readme:String):void {
                                        if (erRead !== null) {
                                            error([
                                                "Error reading file during documentation build task.",
                                                `File: ${filePath}`
                                            ]);
                                            return;
                                        }
                                        const sample:string = "Contents dynamically populated. -->",
                                            index:number = readme.indexOf(sample) + sample.length;
                                        readme = readme.slice(0, index) + `\n\n${fileList}`;
                                        // Sixth, write the documentation to each respective file
                                        vars.node.fs.writeFile(filePath, readme, "utf8", function terminal_build_libReadme_write_readFile_writeFile(erWrite:nodeError):void {
                                            if (erWrite !== null) {
                                                error([
                                                    "Error writing file during documentation build task.",
                                                    `File: ${filePath}`
                                                ]);
                                                return;
                                            }
                                            log([`${humanTime(false)}Updated ${filePath}`]);
                                            writeEnd = writeEnd + 1;
                                            if (writeEnd === writeStart) {
                                                // Finally, once all the readme.md files are written write one file master documentation for all library files
                                                masterList();
                                            }
                                        });
                                    });
                                },
                                readFile = function terminal_build_libReadme_readFile(erRead:nodeError, file:string):void {
                                    if (erRead !== null) {
                                        error(["Error reading file during documentation build task."]);
                                        return;
                                    }
                                    if ((/^\s*((\/\*)|(<!--)) \w+(\/\w+)+ - \w/).test(file) === false) {
                                        error([
                                            "Code file missing required descriptive comment at top of code.",
                                            `${vars.text.angry + file.slice(0, 300) + vars.text.none}`,
                                            "--------------------------------------------------------------",
                                            "",
                                            "Include a comment prior to all other code.  Here is an example:",
                                            `${vars.text.cyan + vars.text.bold}/* lib/terminal/commands/remove - A command driven utility to recursively remove file system artifacts. */${vars.text.none}`,
                                            "",
                                            `${vars.text.underline}Requirements:${vars.text.none}`,
                                            `${vars.text.angry}*${vars.text.none} The comment occurs before all other code.  White space characters may reside prior to the comment, but nothing else.`,
                                            `${vars.text.angry}*${vars.text.none} For TypeScript files the comment must be of block comment type comprising a slash and asterisk: ${vars.text.green + vars.text.bold}/*${vars.text.none}`,
                                            `${vars.text.angry}*${vars.text.none} For Markdown files the comment must be a standard HTML comment: ${vars.text.green + vars.text.bold}<!--${vars.text.none}`,
                                            `${vars.text.angry}*${vars.text.none} The comment comprises three parts in this order:`,
                                            `   ${vars.text.angry}1${vars.text.none} A path to the file relative to the project root, without file extension, and using forward slash as the directory separator.`,
                                            `   ${vars.text.angry}2${vars.text.none} A separator comprising of a space, a hyphen, and a second space.`,
                                            `   ${vars.text.angry}3${vars.text.none} An English statement describing the code file.`
                                        ]);
                                        return
                                    }
                                    const md:boolean = (file.replace(/^\s+/, "").indexOf("<!--") === 0),
                                        comment:string = (md === true)
                                            ? file.slice(file.indexOf("<!-- ") + 5, file.indexOf(" -->"))
                                            : file.slice(file.indexOf("/* ") + 3, file.indexOf(" */")),
                                        dashIndex:number = comment.indexOf(" - "),
                                        path:string[] = comment.slice(0, dashIndex).split("/"),
                                        name:string = path.pop(),
                                        extension:string = (md === true)
                                            ? "md"
                                            : "ts",
                                        doc:docItem = {
                                            description: comment.slice(dashIndex + 3),
                                            name: name,
                                            namePadded: `* **[${name}.${extension}](${name}.${extension})**`,
                                            path: path.join("/")
                                        };
                                    fileEnd = fileEnd + 1;
                                    // Fourth, build the necessary data structure from reach the first comment of each file
                                    files.push(doc);
                                    // Fifth, once all TypeScript files are read the respective documentation content must be built
                                    if (fileEnd === fileStart) {
                                        files.sort(function terminal_build_libReadme_readFile_sort(x:docItem, y:docItem):number {
                                            if (x.path < y.path) {
                                                return -1;
                                            }
                                            if (x.path === y.path && x.name < y.name) {
                                                return -1;
                                            }
                                            return 1;
                                        });
                                        let a:number = 1,
                                            b:number = 0,
                                            c:number = 0,
                                            longest:number = files[a].name.length,
                                            list:string[] = [];
                                        const fileLength:number = files.length,
                                            buildList = function terminal_build_libReadme_readFile_buildList():void {
                                                do {
                                                    c = files[b].name.length;
                                                    if (c < longest) {
                                                        do {
                                                            files[b].namePadded = `${files[b].namePadded}  `;
                                                            c = c + 1;
                                                        } while (c < longest);
                                                    }
                                                    list.push(`${files[b].namePadded} - ${files[b].description}`);
                                                    b = b + 1;
                                                } while (b < a);
                                                write(files[b - 1].path, list.join("\n"));
                                            };
                                        master = files[a].path.length + files[a].name.length
                                        do {
                                            if (files[a].path === files[a - 1].path) {
                                                if (files[a].name.length > longest) {
                                                    longest = files[a].name.length;
                                                }
                                                if (files[a].path.length + files[a].name.length > master) {
                                                    master = files[a].path.length + files[a].name.length;
                                                }
                                            } else {
                                                buildList();
                                                list = [];
                                                longest = 0;
                                            }
                                            a = a + 1;
                                        } while (a < fileLength);
                                        buildList();
                                    }
                                },
                                nameTest = function terminal_build_libReadme_nameTest(index:number, name:string):boolean {
                                    if (dirList[index][0].lastIndexOf(name) === dirList[index][0].length - name.length) {
                                        return true;
                                    }
                                    return false;
                                },
                                files:docItem[] = [];
                            // Second, sort the directory data first by file types and then alphabetically
                            dirList.sort(function terminal_build_libReadme_dirs_sort(x:directoryItem, y:directoryItem):number {
                                if (x[1] === "file" && y[1] !== "file") {
                                    return -1;
                                }
                                if (x[1] === "file" && y[1] === "file" && x[0] < y[0]) {
                                    return -1;
                                }
                                return 1;
                            });
                            // Third, read from each of the TypeScript files and direct output to readFile function
                            do {
                                if (dirList[a][1] === "file" && (dirList[a][0].slice(dirList[a][0].length - 3) === ".ts" || (dirList[a][0].slice(dirList[a][0].length - 3) === ".md" && nameTest(a, "readme.md") === false))) {
                                    fileStart = fileStart + 1;
                                    vars.node.fs.readFile(dirList[a][0], "utf8", readFile);
                                }
                                a = a + 1;
                            } while (a < length);
                        },
                        dirConfig:readDirectory = {
                            callback: callback,
                            depth: 0,
                            exclusions: [],
                            logRecursion: true,
                            mode: "read",
                            path: `${vars.projectPath}lib`,
                            symbolic: false
                        };
                    // First, get the file system data for the lib directory and then direct output to the dirs function
                    directory(dirConfig);
                    dirConfig.path = `${vars.projectPath}documentation`;
                    directory(dirConfig);
                },
                // phase lint is merely a call to the lint library
                lint: function terminal_build_lint():void {
                    heading("Linting");
                    lint(testsCallback);
                },
                // phase services wraps a call to services test library
                service: function terminal_build_serviceTests():void {
                    heading("Tests of supported services");
                    testListRunner("service", testsCallback);
                },
                // phase simulation is merely a call to simulation test library
                simulation: function terminal_build_simulation():void {
                    heading(`Simulations of Node.js commands from ${vars.version.command}`);
                    testListRunner("simulation", testsCallback);
                },
                // phase typescript compiles the working code into JavaScript
                typescript: function terminal_build_typescript():void {
                    const incremental:string = (process.argv.indexOf("incremental") > -1)
                            ? "--incremental"
                            : "--pretty",
                        command:string = (process.argv.indexOf("local") > -1)
                            ? `node_modules\\.bin\\tsc ${incremental}`
                            : `tsc ${incremental}`,
                        ts = function terminal_build_typescript_ts() {
                            vars.node.child(command, {
                                cwd: vars.projectPath
                            }, function terminal_build_typescript_callback(err:Error, stdout:string, stderr:string):void {
                                const control:string = "\u001b[91m";
                                log([stdout]);
                                if (stdout !== "" && stdout.indexOf(` ${control}error${vars.text.none} `) > -1) {
                                    error([`${vars.text.red}TypeScript reported warnings.${vars.text.none}`, stdout]);
                                    return;
                                }
                                if (err !== null) {
                                    error([err.toString()]);
                                    return;
                                }
                                if (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0) {
                                    error([stderr]);
                                    return;
                                }
                                next("TypeScript build completed without warnings.");
                            });
                        };
                    heading("TypeScript Compilation");
                    vars.node.child("tsc --version", function terminal_build_typescript_tsc(err:Error, stdout:string, stderr:string) {
                        if (err !== null) {
                            const str = err.toString();
                            if (str.indexOf("command not found") > 0 || str.indexOf("is not recognized") > 0) {
                                log([`${vars.text.angry}TypeScript does not appear to be globally installed.${vars.text.none}`]);
                            } else {
                                error([err.toString(), stdout]);
                                return;
                            }
                        } else {
                            if (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0) {
                                error([stderr]);
                                return;
                            }
                            ts();
                        }
                    });
                },
                // write the current version, change date, and modify html
                version: function terminal_build_version():void {
                    const pack:string = `${vars.projectPath}package.json`,
                        html:string = `${vars.projectPath}index.html`,
                        flag = {
                            html: false,
                            json: false
                        },
                        packStat = function terminal_build_version_stat(ers:Error, stat:Stats) {
                            if (ers !== null) {
                                error([ers.toString()]);
                                return;
                            }
                            const readPack = function terminal_build_version_stat_read(err:Error, data:string) {
                                    if (err !== null) {
                                        error([err.toString()]);
                                        return;
                                    }
                                    const commitHash = function terminal_build_version_stat_read_commitHash(hashErr:nodeError, stdout:string, stderr:string):void {
                                        const readHTML = function terminal_build_version_stat_read_commitHash_readHTML(err:Error, fileData:string):void {
                                                if (err !== null) {
                                                    error([err.toString()]);
                                                    return;
                                                }
                                                const regex:RegExp = new RegExp(`<h1>\\s*(\\w+\\s*)*\\s*<span\\s+class=("|')application-version("|')>(version\\s+\\d+(\\.\\d+)+)?\\s*<\\/span>\\s*<\\/h1>`, "g"),
                                                    writeHTML = function terminal_build_version_stat_read_commitHash_readHTML_writeHTML(erh:Error):void {
                                                        if (erh !== null) {
                                                            error([erh.toString()]);
                                                            return;
                                                        }
                                                        flag.html = true;
                                                        if (flag.json === true) {
                                                            next("Version data written");
                                                        }
                                                    };
                                                fileData = fileData.replace(regex, `<h1>${vars.version.name} <span class="application-version">version ${vars.version.number}</span></h1>`);
                                                vars.node.fs.writeFile(html, fileData, "utf8", writeHTML);
                                            },
                                            writeVersion =  function terminal_build_version_stat_read_commitHash_writeVersion(erj:Error):void {
                                                if (erj !== null) {
                                                    error([erj.toString()]);
                                                    return;
                                                }
                                                flag.json = true;
                                                if (flag.html === true) {
                                                    next("Version data written");
                                                }
                                            };
            
                                        if (hashErr !== null) {
                                            error([hashErr.toString()]);
                                            return;
                                        }
                                        if (stderr !== "") {
                                            error([stderr]);
                                            return;
                                        }
            
                                        vars.version.hash = stdout.replace(/\s+/g, "");
            
                                        // modify index.html
                                        vars.node.fs.readFile(html, "utf8", readHTML);
            
                                        // modify version.json
                                        vars.node.fs.writeFile(`${vars.projectPath}version.json`, JSON.stringify(vars.version), "utf8", writeVersion);
                                    };
    
                                    vars.version.number = JSON.parse(data).version;
        
                                    vars.node.child("git rev-parse HEAD", {
                                        cwd: vars.projectPath
                                    }, commitHash);
                                },
                                month:string = (function terminal_build_version_stat_month():string {
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
                                dayString:string = stat.mtime.getDate().toString(),
                                dayPadded:string = (dayString.length < 2)
                                    ? `0${dayString}`
                                    : dayString,
                                date:string = `${dayPadded} ${month} ${stat.mtime.getFullYear().toString()}`;
                            vars.version.date = date.replace(/-/g, "");
    
                            // read package.json
                            vars.node.fs.readFile(pack, "utf8", readPack);
                        };
                    heading("Writing version data");
                    vars.node.fs.stat(pack, packStat);
                }
            };
        if (test === false || test === undefined) {
            log.title("Run All Build Tasks");
        }
        next("");
    };

export default build;