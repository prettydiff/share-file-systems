
/* lib/terminal/commands/build - The library that executes the build and test tasks. */
import { generateKeyPair } from "crypto";
import { Stats, writeFileSync, write } from "fs";
import { hostname } from "os";

import serverVars from "../server/serverVars.js";

import error from "../utilities/error.js";
import directory from "./directory.js";
import hash from "./hash.js";
import humanTime from "../utilities/humanTime.js";
import lint from "./lint.js";
import log from "../utilities/log.js";
import testListRunner from "../test/testListRunner.js";
import vars from "../utilities/vars.js";

// build/test system
const library = {
        directory: directory,
        error: error,
        hash: hash,
        humanTime: humanTime,
        lint: lint,
        log: log,
        testListRunner: testListRunner
    },
    build = function terminal_build(test:boolean, callback:Function):void {
        let firstOrder:boolean = true,
            sectionTime:[number, number] = [0, 0];
        const order = {
                build: [
                    "clearStorage",
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
                    library.log([message], true);
                    process.exit(1);
                } else {
                    next(message);
                }
            },
            // a short title for each build/test phase
            heading = function terminal_build_heading(message:string):void {
                if (firstOrder === true) {
                    library.log([""]);
                    firstOrder = false;
                } else if (order[type].length < orderLength) {
                    library.log(["________________________________________________________________________", "", ""]);
                }
                library.log([vars.text.cyan + vars.text.bold + message + vars.text.none, ""]);
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
                library.log([`${vars.text.cyan + vars.text.bold}[${times.join(":")}]${vars.text.none} ${vars.text.green}Total section time.${vars.text.none}`]);
            },
            // the transition to the next phase or completion
            next = function terminal_build_next(message:string):void {
                let phase = order[type][0],
                    time:string = library.humanTime(false);
                if (message !== "") {
                    sectionTimer(time);
                    library.log([time + message]);
                }
                if (order[type].length < 1) {
                    if (vars.command === "build") {
                        vars.verbose = true;
                        heading(`${vars.text.none}All ${vars.text.green + vars.text.bold}build${vars.text.none} tasks complete... Exiting clean!\u0007`);
                        library.log([""], true);
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
                    vars.node.fs.readdir(`${vars.projectPath}storage`, function terminal_build_clearStorage_dir(erd:nodeError, dirList:string[]) {
                        if (erd !== null) {
                            library.error([erd.toString()]);
                            return;
                        }
                        const length:number = dirList.length,
                            tempTest:RegExp = (/^\w+-0\.\d+.json$/);
                        let a:number = 0,
                            start:number = 0,
                            end:number = 0;
                        do {
                            if (tempTest.test(dirList[a]) === true) {
                                start = start + 1;
                                vars.node.fs.unlink(`${vars.projectPath}storage${vars.sep + dirList[a]}`, function terminal_build_clearStorage_dir_unlink(eru:nodeError):void {
                                    if (eru !== null) {
                                        library.error([erd.toString()]);
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
                // libReadme builds out the readme file that indexes code files in the current directory
                libReadme: function terminal_build_libReadme():void {
                    heading("Writing lib directory readme.md files.");

                    const dirs = function terminal_build_libReadme_dirs(dirList:directoryList) {
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
                                    path:string;
                                const fileLength:number = files.length,
                                    fileContents:string[] = [],
                                    filePath:string = `${vars.projectPath}documentation${vars.sep}library_list.md`;
                                fileContents.push(`# Share File Systems - Code Library List`);
                                fileContents.push("This is a dynamically compiled list of supporting code files that comprise this application with a brief description of each file.");
                                fileContents.push("");
                                do {
                                    path = `* **[../${files[a].path}/${files[a].name}.ts](../${files[a].path}/${files[a].name}.ts)**`;
                                    b = files[a].path.length + files[a].name.length;
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
                                        library.error([erWrite.toString()]);
                                        return;
                                    }
                                    library.log([`${library.humanTime(false)}Updated ${filePath}`]);
                                    next("Completed writing lib directory readme.md files.");
                                });
                            },
                            write = function terminal_build_libReadme_write(path:string, fileList:string):void {
                                const filePath:string = `${vars.projectPath + path.replace(/\//g, vars.sep) + vars.sep}readme.md`;
                                writeStart = writeStart + 1;
                                vars.node.fs.readFile(filePath, "utf8", function terminal_build_libReadme_write_readFile(erRead:nodeError, readme:String):void {
                                    if (erRead !== null) {
                                        library.error([
                                            "Error reading file during documentation build task.",
                                            `File: ${filePath}`
                                        ]);
                                        return;
                                    }
                                    const index:number = readme.indexOf("Contents dynamically populated.") + "Contents dynamically populated.".length;
                                    readme = readme.slice(0, index) + `\n\n${fileList}`;
                                    // Sixth, write the documentation to each respective file
                                    vars.node.fs.writeFile(filePath, readme, "utf8", function terminal_build_libReadme_write_readFile_writeFile(erWrite:nodeError):void {
                                        if (erWrite !== null) {
                                            library.error([
                                                "Error writing file during documentation build task.",
                                                `File: ${filePath}`
                                            ]);
                                            return;
                                        }
                                        library.log([`${library.humanTime(false)}Updated ${filePath}`]);
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
                                    library.error(["Error reading file during documentation build task."]);
                                    return;
                                }
                                if ((/^\s*\/\* \w+(\/\w+)+ - \w/).test(file) === false) {
                                    library.error([
                                        "Code file missing required descriptive comment at top of code.",
                                        "--------------------------------------------------------------",
                                        "",
                                        file
                                    ]);
                                    return
                                }
                                const comment:string = file.slice(file.indexOf("/* ") + 3, file.indexOf(" */")),
                                    dashIndex:number = comment.indexOf(" - "),
                                    path:string[] = comment.slice(0, dashIndex).split("/"),
                                    name:string = path.pop(),
                                    doc:docItem = {
                                        description: comment.slice(dashIndex + 3),
                                        name: name,
                                        namePadded: `* **[${name}.ts](${name}.ts)**`,
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
                            if (dirList[a][1] === "file" && dirList[a][0].slice(dirList[a][0].length - 3) === ".ts") {
                                fileStart = fileStart + 1;
                                vars.node.fs.readFile(dirList[a][0], "utf8", readFile);
                            }
                            a = a + 1;
                        } while (a < length);
                    },
                    dirConfig:readDirectory = {
                        callback: dirs,
                        depth: 0,
                        exclusions: [],
                        mode: "read",
                        path: `${vars.projectPath}lib`,
                        symbolic: false
                    };
                    // First, get the file system data for the lib directory and then direct output to the dirs function
                    library.directory(dirConfig);
                },
                // phase lint is merely a call to the lint library
                lint     : function terminal_build_lint():void {
                    heading("Linting");
                    library.lint(testsCallback);
                },
                // phase services wraps a call to services test library
                service: function terminal_build_serviceTests():void {
                    heading("Tests of calls to the local service");
                    library.testListRunner("service", testsCallback);
                },
                // phase simulation is merely a call to simulation test library
                simulation: function terminal_build_simulation():void {
                    heading(`Simulations of Node.js commands from ${vars.version.command}`);
                    library.testListRunner("simulation", testsCallback);
                },
                // phase typescript compiles the working code into JavaScript
                typescript: function terminal_build_typescript():void {
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
                        ts = function terminal_build_typescript_ts() {
                            vars.node.child(command, {
                                cwd: vars.projectPath
                            }, function terminal_build_typescript_callback(err:Error, stdout:string, stderr:string):void {
                                const control:string = "\u001b[91m";
                                if (stdout !== "" && stdout.indexOf(` ${control}error${vars.text.none} `) > -1) {
                                    library.error([`${vars.text.red}TypeScript reported warnings.${vars.text.none}`, stdout]);
                                    return;
                                }
                                if (err !== null) {
                                    library.error([err.toString()]);
                                    return;
                                }
                                if (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0) {
                                    library.error([stderr]);
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
                                library.log([`${vars.text.angry}TypeScript does not appear to be installed.${vars.text.none}`]);
                                flag.typescript = true;
                                if (flag.services === true) {
                                    next(`${vars.text.angry}Install TypeScript with this command: ${vars.text.green}npm install typescript -g${vars.text.none}`);
                                }
                            } else {
                                library.error([err.toString(), stdout]);
                                return;
                            }
                        } else {
                            if (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0) {
                                library.error([stderr]);
                                return;
                            }
                            ts();
                        }
                    });
                },
                // write the current version, change date, and modify html
                version: function terminal_build_version():void {
                    const pack:string = `${vars.projectPath}package.json`;
                    heading("Writing version data");
                    vars.node.fs.stat(pack, function terminal_build_version_stat(ers:Error, stat:Stats) {
                        if (ers !== null) {
                            library.error([ers.toString()]);
                            return;
                        }
                        const month:string = (function terminal_build_version_stat_month():string {
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
                            date:string = `${dayPadded} ${month} ${stat.mtime.getFullYear().toString()}`,
                            html:string = `${vars.projectPath}index.html`,
                            flag = {
                                html: false,
                                json: false
                            };
                        vars.version.date = date.replace(/-/g, "");

                        // read package.json
                        vars.node.fs.readFile(pack, "utf8", function terminal_build_version_stat_read(err:Error, data:string) {
                            if (err !== null) {
                                library.error([err.toString()]);
                                return;
                            }
                            vars.version.number = JSON.parse(data).version;

                            // modify index.html
                            vars.node.fs.readFile(html, "utf8", function terminal_build_version_stat_read_html(err:Error, fileData:string):void {
                                if (err !== null) {
                                    library.error([err.toString()]);
                                    return;
                                }
                                const regex:RegExp = new RegExp(`<h1>\\s*(\\w+\\s*)*\\s*<span\\s+class=("|')application-version("|')>(version\\s+\\d+(\\.\\d+)+)?\\s*<\\/span>\\s*<\\/h1>`, "g");
                                fileData = fileData.replace(regex, `<h1>${vars.version.name} <span class="application-version">version ${vars.version.number}</span></h1>`);
                                vars.node.fs.writeFile(html, fileData, "utf8", function terminal_build_version_stat_read_html_write(erh:Error):void {
                                    if (erh !== null) {
                                        library.error([erh.toString()]);
                                        return;
                                    }
                                    flag.html = true;
                                    if (flag.json === true) {
                                        next("Version data written");
                                    }
                                });
                            });

                            // modify version.json
                            vars.node.fs.writeFile(`${vars.projectPath}version.json`, JSON.stringify(vars.version), "utf8", function terminal_build_version_stat_read_html_write(erj:Error):void {
                                if (erj !== null) {
                                    library.error([erj.toString()]);
                                    return;
                                }
                                flag.json = true;
                                if (flag.html === true) {
                                    next("Version data written");
                                }
                            });
                        });
                    });
                }
            };
        if (test === false || test === undefined) {
            library.log.title("Run All Build Tasks");
        }
        next("");
    };

export default build;