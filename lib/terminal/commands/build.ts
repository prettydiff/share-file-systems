/* lib/terminal/commands/build - The library that executes the build and test tasks. */

import { exec, ExecException } from "child_process";
import { readdir, readFile, stat, Stats, symlink, unlink, writeFile } from "fs";
import { EOL } from "os";
import { resolve } from "path";
import { clearScreenDown, cursorTo } from "readline";

import browser from "../test/application/browser.js";
import certificate from "./certificate.js";
import commands_documentation from "../utilities/commands_documentation.js";
import error from "../utilities/error.js";
import directory from "./directory.js";
import humanTime from "../utilities/humanTime.js";
import lint from "./lint.js";
import log from "../utilities/log.js";
import mkdir from "./mkdir.js";
import remove from "./remove.js";
import testListRunner from "../test/application/runner.js";
import vars from "../utilities/vars.js";

// cspell:words certutil, cygwin, eslintignore, gitignore, keychain, keychains, libcap, libnss3, npmignore, pacman, setcap

// build/test system
const build = function terminal_commands_build(test:boolean, callback:() => void):void {
        let firstOrder:boolean = true,
            certStatError:boolean = false,
            compileErrors:string = "",
            sectionTime:[number, number] = [0, 0],
            commandName:string;
        const order:buildOrder = {
                build: [
                    "configurations",
                    "certificate",
                    "os_specific",
                    "clearStorage",
                    "commands",
                    "libReadme",
                    "typescript",
                    "version",
                    "shellGlobal"
                ],
                test: [
                    "lint",
                    "simulation",
                    "service",
                    "browserSelf"
                ]
            },
            type:"build"|"test" = (test === true)
                ? "test"
                : "build",
            orderLength:number = order[type].length,
            certFlags:certFlags = {
                forced: (process.argv.indexOf("force_certificate") > -1),
                path: `${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}`,
                selfSign: false
            },
            testsCallback = function terminal_commands_build_testsCallback(message:string, failCount:number):void {
                if (failCount > 0) {
                    vars.settings.verbose = true;
                    log([message], true);
                    process.exit(1);
                } else {
                    next(message);
                }
            },
            // a short title for each build/test phase
            heading = function terminal_commands_build_heading(message:string):void {
                if (firstOrder === true) {
                    log([""]);
                    firstOrder = false;
                } else if (order[type].length < orderLength) {
                    log(["________________________________________________________________________", "", ""]);
                }
                log([vars.text.cyan + vars.text.bold + message + vars.text.none, ""]);
            },
            headingText:stringStore = {
                browserSelf: "Test Local Device in Browser",
                certificate: "Checking for Certificates",
                clearStorage: "Removing Unnecessary Temporary Files",
                commands: "Writing commands.md Documentation",
                configurations: "Write Configuration Files",
                libReadme: "Writing lib Directory readme.md Files",
                lint: "Linting",
                os_specific: "Executing Operating System Specific Tasks",
                service: "Tests of Supported Services",
                shellGlobal: `Producing Global Shell Command: ${vars.text.green}share${vars.text.none}`,
                simulation: `Simulations of Node.js Commands from ${vars.terminal.command_instruction}`,
                typescript: "TypeScript Compilation",
                version: "Writing Version Data"
            },
            // indicates how long each phase took
            sectionTimer = function terminal_commands_build_sectionTime(input:string):void {
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
            next = function terminal_commands_build_next(message:string):void {
                let phase:buildPhase = order[type][0] as buildPhase,
                    time:string = humanTime(false);
                if (message !== "") {
                    log([time + message]);
                    sectionTimer(time);
                }
                if (order[type].length < 1) {
                    if (vars.environment.command === "build") {
                        vars.settings.verbose = true;
                        if (compileErrors === "") {
                            heading(`${vars.text.none}All ${vars.text.green + vars.text.bold}build${vars.text.none} tasks complete... Exiting clean!\u0007`);
                        } else {
                            const plural:string = (compileErrors === "1")
                                ? ""
                                : "s";
                            heading(`${vars.text.none}Build tasks complete with ${vars.text.angry + compileErrors} compile error${plural + vars.text.none}.\u0007`);
                        }
                        log([""], true);
                        process.exit(0);
                        return;
                    }
                    callback();
                } else {
                    order[type].splice(0, 1);
                    heading(headingText[phase]);
                    phases[phase]();
                }
            },
            /**
             * A list of methods used for build tasks and tasks associated with the *test* command.
             * ```typescript
             * interface module_buildPhaseList {
             *     browserSelf:() => void;    // Launches test automation type *browser_self* against the local device.
             *     certificate:() => void;    // Tests for certificates and creates them if not present.
             *     clearStorage:() => void;   // Removes files created from prior test automation runs.
             *     commands:() => void;       // Builds the documentation/commands.md file.
             *     configurations:() => void; // Writes application specific configuration files from lib/configurations.json.
             *     libReadme:() => void;      // Extracts comments from the top of each file to build out automated documentation.
             *     lint:() => void;           // Executes ESLint as a test task.
             *     os_specific: () => void;   // Execute any Operating System specific tasks here.
             *     service:() => void;        // Executes the test automation of type *service*.
             *     shellGlobal:() => void;    // Writes and updates a file to provide this application with global availability against a keyword on the terminal.
             *     simulation:() => void;     // Executes the test automation of type *simulation*.
             *     typescript:() => void;     // Runs the TypeScript compiler.
             *     version:() => void;        // Updates version data as taken from the package.json and prior git commit for display and availability elsewhere in the application.
             * }
             * ``` */
            phases:module_buildPhaseList = {
                browserSelf: function terminal_commands_build_browserSelf():void {
                    const splice = function terminal_commands_build_browserSelf_splice(parameter:string):boolean {
                            const index:number = process.argv.indexOf(parameter);
                            if (index < 0) {
                                return false;
                            }
                            process.argv.splice(index, 1);
                            return true;
                        };
                    browser.methods.execute({
                        callback: testsCallback,
                        demo: splice("demo"),
                        mode: "self",
                        noClose: splice("no_close")
                    });
                },
                // tests for certificates and if not present generates them
                certificate: function terminal_commands_build_certificate():void {
                    let statCount:number = 0;
                    const selfSignCount:2|4 = (certFlags.selfSign === true)
                            ? 2
                            : 4,
                        statCallback = function terminal_commands_build_certificate_statCallback(statError:NodeJS.ErrnoException):void {
                            statCount = statCount + 1;
                            if (statError !== null) {
                                certStatError = true;
                            }
                            if (statCount === selfSignCount) {
                                const certCallback = function terminal_commands_build_certificate_statCallback_certCallback():void {
                                        next("Certificates created.");
                                    },
                                    makeCerts = function terminal_commands_build_certificate_statCallback_makeCerts():void {
                                        certificate({
                                            caDomain: "share-file-ca",
                                            callback: certCallback,
                                            caName: "share-file-ca",
                                            days: 16384,
                                            domain: "share-file",
                                            location: "",
                                            name: "share-file",
                                            organization: "share-file",
                                            selfSign: certFlags.selfSign
                                        });
                                    };
                                if (certFlags.forced === true || certStatError === true) {
                                    if (certFlags.forced === true) {
                                        log([`${humanTime(false)}Creating new certificates due to option 'force_certificate'.`]);
                                    } else {
                                        log([`${humanTime(false)}Error reading one or more certificate files. Creating certificates...`]);
                                    }
                                    makeCerts();
                                } else {
                                    next("Certificates already exist.");
                                }
                            }
                        };
                    log([`${humanTime(false)}Checking that certificate files are created for the project.`]);
                    stat(`${certFlags.path}share-file.crt`, statCallback);
                    stat(`${certFlags.path}share-file.key`, statCallback);
                    if (certFlags.selfSign === false) {
                        stat(`${certFlags.path}share-file-ca.crt`, statCallback);
                        stat(`${certFlags.path}share-file-ca.key`, statCallback);
                    }
                },
                // clearStorage removes temporary settings files that should have been removed, but weren't
                clearStorage: function terminal_commands_build_clearStorage():void {
                    readdir(`${vars.path.project}lib${vars.path.sep}settings`, function terminal_commands_build_clearStorage_dir(erd:Error, dirList:string[]) {
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
                                unlink(`${vars.path.project}lib${vars.path.sep}settings${vars.path.sep + dirList[a]}`, function terminal_commands_build_clearStorage_dir_unlink(eru:Error):void {
                                    if (eru !== null) {
                                        error([erd.toString()]);
                                        return;
                                    }
                                    end = end + 1;
                                    if (end === start) {
                                        const plural:string = (start === 1)
                                            ? ""
                                            : "s";
                                        next(`${start} temporary settings file${plural} removed.`);
                                    }
                                });
                            }
                            a = a + 1;
                        } while (a < length);
                        if (start === 0) {
                            next("There are no temporary settings files to remove.");
                        }
                    });
                },
                // Builds the documentation/commands.md file.
                commands: function terminal_commands_build_commands():void {
                    const docs:commandDocumentation = commands_documentation(vars.terminal.command_instruction),
                        keys:string[] = Object.keys(docs),
                        output:string[] = [],
                        eachExample = function terminal_commands_build_commands_eachExample(example:commandExample):void {
                            output.push(`1. \`${example.code}\``);
                            output.push(`   - ${example.defined}`);
                        },
                        filePath:string = `${vars.path.project}documentation${vars.path.sep}commands.md`;
                    output.push("");
                    output.push("<!-- documentation/commands - This documentation describes the various supported terminal commands and is automatically generated from `lib/terminal/utilities/commands_documentation.ts`. -->");
                    output.push("");
                    output.push(`# ${vars.environment.name} - Command Documentation`);
                    output.push(`This documentation is also available interactively at your finger tips using the command: \`${vars.terminal.command_instruction}commands\`.  **Please do not edit this file as it is written by the build process.**`);
                    output.push("");
                    keys.forEach(function terminal_commands_build_commands_each(command:string):void {
                        const examples:commandExample[] = docs[command as commands].example;
                        output.push(`## ${command}`);
                        output.push(docs[command as commands].description);
                        output.push("");
                        output.push("### Examples");
                        examples.forEach(eachExample);
                        output.push("");
                    });
                    writeFile(filePath, output.join("\n"), "utf8", function terminal_commands_build_commands_write(err:Error):void {
                        if (err === null) {
                            next(`File ${filePath} successfully written.`);
                            return;
                        }
                        error([err.toString()]);
                    });
                },
                // writes configuration data to files
                configurations: function terminal_commands_build_configurations():void {
                    readFile(`${vars.path.project}lib${vars.path.sep}configurations.json`, "utf8", function terminal_commands_build_configurations_readFile(err:Error, fileData:string) {
                        if (err === null) {
                            const config:configurationApplication = JSON.parse(fileData),
                                keys:string[] = Object.keys(config),
                                length:number = keys.length,
                                writeCallback = function terminal_commands_build_configurations_readFile_writeCallback(wErr:Error):void {
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

                                write = function terminal_commands_build_configurations_readFile_write():void {
                                    let stringItem:string = "";
                                    const list = function terminal_commands_build_configurations_readFile_write_list(item:string[]):string {
                                        if (item.length === 1) {
                                            return item[0];
                                        }
                                        return item.join(EOL);
                                    };

                                    // keys evaluated by explicit name to prevent a TypeScript implicit any on dynamic key inference
                                    if (keys[a] === ".eslintignore") {
                                        stringItem = list(config[".eslintignore"]);
                                    } else if (keys[a] === ".gitignore") {
                                        stringItem = list(config[".gitignore"]);
                                    } else if (keys[a] === ".npmignore") {
                                        stringItem = list(config[".npmignore"]);
                                    } else if (keys[a] === ".eslintrc.json") {
                                        stringItem = JSON.stringify(config[".eslintrc.json"]);
                                    } else if (keys[a] === "package-lock.json") {
                                        stringItem = JSON.stringify(config["package-lock.json"]);
                                    }
                                    if (stringItem !== "") {
                                        writeFile(vars.path.project + keys[a], stringItem, "utf8", writeCallback);
                                    }
                                },
                                removeCallback = function terminal_commands_build_configurations_readFile_removeCallback():void {
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
                                remove(vars.path.project + keys[a], removeCallback);
                            } while (a > 0);
                            return;
                        }
                        error([err.toString()]);
                    });
                },
                // libReadme builds out the readme file that indexes code files in the current directory
                libReadme: function terminal_commands_build_libReadme():void {
                    let dirList:directoryList = [];
                    const callback = function terminal_commands_build_dirCallback(dir:directoryList|string[]):void {
                            const list:directoryList = dir as directoryList;
                            if (dirList.length < 1) {
                                dirList = list;
                            } else {
                                dirList = dirList.concat(list);
                                dirs();
                            }
                        },
                        dirs = function terminal_commands_build_libReadme_dirs():void {
                            let writeStart:number = 0,
                                writeEnd:number = 0,
                                master:number = 0,
                                modules:stringStore = {
                                    browser: "",
                                    terminal: ""
                                },
                                a:number = 0,
                                codeLength:number = 0;
                            const length:number = dirList.length,

                                // write the documentation/library_list.md file
                                masterList = function terminal_commands_build_libReadme_masterList():void {
                                    let a:number = 0,
                                        b:number = 0,
                                        path:string,
                                        extension:"md"|"ts";
                                    const fileLength:number = files.length,
                                        fileContents:string[] = [],
                                        filePath:string = `${vars.path.project}documentation${vars.path.sep}library_list.md`;
                                    fileContents.push("<!-- documentation/library_list - Automated list of all code and documentation files with brief descriptions. -->");
                                    fileContents.push("");
                                    fileContents.push(`# ${vars.environment.name} - Code Library List`);
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
                                    writeFile(filePath, fileContents.join("\n"), "utf8", function terminal_commands_build_libReadme_masterList_write(erWrite:Error):void {
                                        if (erWrite !== null) {
                                            error([erWrite.toString()]);
                                            return;
                                        }
                                        log([`${humanTime(false)}Updated ${filePath}`]);
                                        next("Completed writing lib directory readme.md files.");
                                    });
                                },

                                // write the various readme.md files in each directory
                                write = function terminal_commands_build_libReadme_write(path:string, fileList:string):void {
                                    const filePath:string = `${vars.path.project + path.replace(/\//g, vars.path.sep) + vars.path.sep}readme.md`,
                                        writeComplete = function terminal_commands_build_libReadme_write_writeComplete():void {
                                            writeEnd = writeEnd + 1;
                                            if (writeEnd === writeStart) {
                                                // Finally, once all the readme.md files are written write one file master documentation for all library files
                                                masterList();
                                            }
                                        };
                                    writeStart = writeStart + 1;
                                    if (filePath === `${vars.path.project}lib${vars.path.sep}readme.md`) {
                                        // this one readme file is manually curated because it only references a JSON and HTML file.
                                        // JSON cannot receive comments and HTML cannot receive comments before the doctype.
                                        writeComplete();
                                        return;
                                    }
                                    readFile(filePath, "utf8", function terminal_commands_build_libReadme_write_readFile(erRead:Error, readme:string):void {
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
                                        // Ninth, write the documentation to each respective file
                                        writeFile(filePath, readme, "utf8", function terminal_commands_build_libReadme_write_readFile_writeFile(erWrite:Error):void {
                                            if (erWrite !== null) {
                                                error([
                                                    "Error writing file during documentation build task.",
                                                    `File: ${filePath}`
                                                ]);
                                                return;
                                            }
                                            log([`${humanTime(false)}Updated ${filePath}`]);
                                            writeComplete();
                                        });
                                    });
                                },

                                // read code files for the required supporting comment at the top each code file
                                fileRead = function terminal_commands_build_libReadme_fileRead(erRead:Error, file:string):void {
                                    if (erRead !== null) {
                                        error(["Error reading file during documentation build task."]);
                                        return;
                                    }
                                    if ((/^\s*((\/\*)|(<!--)) \w+(\/\w+)+(\.d)? - \w/).test(file) === false) {
                                        error([
                                            "Code file missing required descriptive comment at top of code.",
                                            `${vars.text.angry + codeFiles[a] + vars.text.none}`,
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
                                        return;
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
                                        },
                                        // writes comments to the module files from the definition files
                                        moduleComment = function terminal_commands_build_libReadme_fileRead_moduleComment():void {
                                            const type:"browser" | "terminal" = (codeFiles[a].indexOf(`browser${vars.path.sep}`) > 0)
                                                    ? "browser"
                                                    : "terminal",
                                                index:number = file.indexOf(":module_");
                                            let b:number = index,
                                                moduleComment:string = "",
                                                start:number = 0,
                                                space:number = 0,
                                                line:number = 0,
                                                variable:number = 0,
                                                name:string = "",
                                                indent:string = "";
                                            if (b > 0) {
                                                // find the definition name
                                                do {
                                                    b = b + 1;
                                                } while (file.charAt(b) !== " ");
                                                name = file.slice(index + 1, b);

                                                // find the variable declaration point and a prior existing comment start point, if any
                                                b = index;
                                                do {
                                                    b = b - 1;
                                                    if (line === 0 && file.charAt(b) === "\n") {
                                                        line = b;
                                                    } else if (space === 0 && (/\s/).test(file.charAt(b)) === true) {
                                                        space = b;
                                                    } else if (file.charAt(b) === "/" && file.charAt(b + 1) === "*" && file.charAt(b + 2) === "*") {
                                                        start = b;
                                                        if (variable > 0) {
                                                            break;
                                                        }
                                                    } else if (variable === 0) {
                                                        if (file.charAt(b) === "c" && file.charAt(b + 1) === "o" && file.charAt(b + 2) === "n" && file.charAt(b + 3) === "s" && file.charAt(b + 4) === "t") {
                                                            variable = b;
                                                            space = b - 1;
                                                        } else if (file.charAt(b) === ",") {
                                                            variable = space + 1;
                                                            if (start > 0) {
                                                                break;
                                                            }
                                                        }
                                                    }
                                                } while (b > 0);

                                                if (line < space) {
                                                    indent = file.slice(line + 1, space + 1);
                                                }

                                                // gather the desired comment
                                                {
                                                    const reg:RegExp = new RegExp(`\\n {4}interface ${name}`),
                                                        tsIndex:number = modules[type].replace(reg, `\ninterface ${name}`).indexOf(`\ninterface ${name}`);
                                                    let c:number = tsIndex,
                                                        commentEnd:number = 0;
                                                    if (tsIndex > 0) {
                                                        do {
                                                            c = c - 1;

                                                            // these two conditions are a safety check in case the desired comment is absent
                                                            if (modules[type].charAt(c) === "*" && modules[type].charAt(c + 1) === "/") {
                                                                commentEnd = c;
                                                            }
                                                            if (modules[type].charAt(c) === "}" && commentEnd === 0) {
                                                                break;
                                                            }

                                                            if (modules[type].charAt(c) === "/" && modules[type].charAt(c + 1) === "*" && modules[type].charAt(c + 2) === "*") {
                                                                moduleComment = `${modules[type].slice(c, tsIndex).replace(/\n +/g, `\n${indent} `)}\n${indent}`;
                                                                break;
                                                            }
                                                        } while (c > 0);
                                                    }
                                                }

                                                if (moduleComment !== "") {
                                                    if (start > 0) {
                                                        // remove the prior existing comment
                                                        file = file.slice(0, start) + moduleComment + file.slice(variable);
                                                    } else {
                                                        file = file.slice(0, variable) + moduleComment + file.slice(variable);
                                                    }

                                                    // write the updated file
                                                    writeFile(codeFiles[a], file, "utf8", function terminal_commands_build_libReadme_fileRead_moduleComment_writeFile(writeError:NodeJS.ErrnoException):void {
                                                        if (writeError !== null) {
                                                            error([JSON.stringify(writeError)]);
                                                        }
                                                    });
                                                }
                                            }
                                        };
                                    // Sixth, build the necessary data structure from reach the first comment of each file
                                    files.push(doc);

                                    // seventh, update module definition comments where appropriate
                                    moduleComment();

                                    a = a + 1;
                                    if (a < codeLength) {
                                        if (codeFiles[a].indexOf(`typescript${vars.path.sep}modules_browser.d.ts`) > 0) {
                                            terminal_commands_build_libReadme_fileRead(null, modules.browser);
                                        } else if (codeFiles[a].indexOf(`typescript${vars.path.sep}modules_terminal.d.ts`) > 0) {
                                            terminal_commands_build_libReadme_fileRead(null, modules.terminal);
                                        } else {
                                            readFile(codeFiles[a], "utf8", terminal_commands_build_libReadme_fileRead);
                                        }
                                    } else {
                                        // Eighth, once all code files are read the respective documentation content must be built
                                        let aa:number = 1,
                                            b:number = 0,
                                            c:number = 0,
                                            longest:number = files[aa].name.length,
                                            list:string[] = [];
                                        const fileLength:number = files.length,
                                            buildList = function terminal_commands_build_libReadme_readFile_buildList():void {
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
                                                } while (b < aa);
                                                write(files[b - 1].path, list.join("\n"));
                                            };
                                        files.sort(function terminal_commands_build_libReadme_readFile_sort(x:docItem, y:docItem):-1|1 {
                                            if (x.path < y.path) {
                                                return -1;
                                            }
                                            if (x.path === y.path && x.name < y.name) {
                                                return -1;
                                            }
                                            return 1;
                                        });
                                        master = files[aa].path.length + files[aa].name.length;
                                        do {
                                            if (files[aa].path === files[aa - 1].path) {
                                                if (files[aa].name.length > longest) {
                                                    longest = files[aa].name.length;
                                                }
                                                if (files[aa].path.length + files[aa].name.length > master) {
                                                    master = files[aa].path.length + files[aa].name.length;
                                                }
                                            } else {
                                                buildList();
                                                list = [];
                                                longest = 0;
                                            }
                                            aa = aa + 1;
                                        } while (aa < fileLength);
                                        buildList();
                                    }
                                },
                                nameTest = function terminal_commands_build_libReadme_nameTest(index:number, name:string):boolean {
                                    if (dirList[index][0].lastIndexOf(name) === dirList[index][0].length - name.length) {
                                        return true;
                                    }
                                    return false;
                                },
                                readModules = function terminal_commands_build_libReadme_readModules(type:"browser"|"terminal"):void {
                                    readFile(`${vars.path.project}lib${vars.path.sep}typescript${vars.path.sep}modules_${type}.d.ts`, "utf8", function terminal_commands_build_libReadme_readModules_readFile(moduleError:NodeJS.ErrnoException, fileData:string):void {
                                        const modulesComplete = function terminal_commands_build_libReadme_readModules_readFile_modulesComplete():void {
                                            // Fifth, read from the files, the callback is recursive
                                            a = 0;
                                            codeLength = codeFiles.length;
                                            readFile(codeFiles[0], "utf8", fileRead);
                                        };
                                        if (moduleError === null) {
                                            modules[type] = fileData;
                                            if (modules.browser !== "" && modules.terminal !== "") {
                                                modulesComplete();
                                            }
                                        } else {
                                            error([JSON.stringify(moduleError)]);
                                        }
                                    });
                                },
                                files:docItem[] = [],
                                codeFiles:string[] = [];
                            // Second, sort the directory data first by file types and then alphabetically
                            dirList.sort(function terminal_commands_build_libReadme_dirs_sort(x:directoryItem, y:directoryItem):number {
                                if (x[1] === "file" && y[1] !== "file") {
                                    return -1;
                                }
                                if (x[1] === "file" && y[1] === "file" && x[0] < y[0]) {
                                    return -1;
                                }
                                return 1;
                            });
                            // Third, gather the TypeScript and readme files
                            do {
                                if (
                                    dirList[a][1] === "file" &&
                                    dirList[a][0].indexOf("storageBrowser") < 0 &&
                                    (
                                        dirList[a][0].slice(dirList[a][0].length - 3) === ".ts" ||
                                        (dirList[a][0].slice(dirList[a][0].length - 3) === ".md" && nameTest(a, "readme.md") === false)
                                    )
                                ) {
                                    codeFiles.push(dirList[a][0]);
                                }
                                a = a + 1;
                            } while (a < length);

                            // Fourth, read the module definitions out of sequence because we will extract comments from them.
                            readModules("browser");
                            readModules("terminal");
                        },
                        dirConfig:config_command_directory = {
                            callback: callback,
                            depth: 0,
                            exclusions: [],
                            mode: "read",
                            path: `${vars.path.project}lib`,
                            symbolic: false
                        };
                    // First, get the file system data for the lib directory and then direct output to the dirs function
                    directory(dirConfig);
                    dirConfig.path = `${vars.path.project}documentation`;
                    directory(dirConfig);
                },
                // phase lint is merely a call to the lint library
                lint: function terminal_commands_build_lint():void {
                    lint(testsCallback);
                },
                os_specific: function terminal_commands_build_lint():void {
                    const windows = function terminal_commands_build_osSpecific_statCallback_windows():void {
                            const windowsStoreName:"CurrentUser"|"LocalMachine" = "CurrentUser",
                                windowsTrust:"My"|"Root" = "Root",
                                windowsStore:string = `Cert:\\${windowsStoreName}\\${windowsTrust}`,
                                importCerts = function terminal_commands_build_osSpecific_statCallback_windows_importCerts():void {
                                    const importCommand = function terminal_commands_build_osSpecific_statCallback_windows_importCerts_importCommand(ca:"-ca"|""):string {
                                            return `Import-Certificate -FilePath ${certFlags.path}share-file${ca}.crt -CertStoreLocation '${windowsStore}'`;
                                        },
                                        certComplete = function terminal_commands_build_osSpecific_statCallback_windows_importCerts_certComplete(err:ExecException):void {
                                            if (err === null) {
                                                log([`${humanTime(false)}Firefox users must set option ${vars.text.angry}security.enterprise_roots.enabled${vars.text.none} to true using page address 'about:config'.`]);
                                                next(`All certificate files added to Windows certificate store: '${vars.text.cyan + windowsStore + vars.text.none}'.`);
                                            } else {
                                                error([JSON.stringify(err)]);
                                            }
                                        },
                                        certAuthority = function terminal_commands_build_osSpecific_statCallback_windows_importCerts_certAuthority(err:ExecException):void {
                                            if (err === null) {
                                                // import root cert
                                                log([`${humanTime(false)}Installing root certificate to trust store: ${windowsStore}`]);
                                                exec(importCommand("-ca"), {
                                                    shell: "powershell"
                                                }, certComplete);
                                            } else {
                                                error([JSON.stringify(err)]);
                                            }
                                        },
                                        certServer = function terminal_commands_build_osSpecific_statCallback_windows_importCerts_certServer(err:ExecException):void {
                                            if (err === null) {
                                                // import signed user cert
                                                log([`${humanTime(false)}Installing server certificate to trust store: ${windowsStore}`]);
                                                exec(importCommand(""), {
                                                    shell: "powershell"
                                                }, (certFlags.selfSign === true)
                                                    ? certComplete
                                                    : certAuthority);
                                            } else {
                                                error([JSON.stringify(err)]);
                                            }
                                        },
                                        certStatus = function terminal_commands_build_osSpecific_statCallback_windows_importCerts_certStatus(err:ExecException, stdout:string):void {
                                            if (err === null) {
                                                if (stdout === "") {
                                                    certServer(null);
                                                } else {
                                                    certRemove();
                                                }
                                            } else {
                                                error([JSON.stringify(err)]);
                                            }
                                        },
                                        certInventory = function terminal_commands_build_osSpecific_statCallback_windows_importCerts_certInventory(err:ExecException, stdout:string, stderr:string):void {
                                            if (err === null) {
                                                exec(`get-childItem ${windowsStore} -DnsName *share-file*`, {
                                                    shell: "powershell"
                                                }, certStatus);
                                            } else {
                                                if (stderr.indexOf("Access is denied") > 0) {
                                                    error([
                                                        `${vars.text.angry}Permission error removing old certificates${vars.text.none}`,
                                                        "Add the current user to administrators group or run command in an administrative PowerShell:",
                                                        `${vars.text.cyan}get-childItem ${windowsStore} -DnsName *share-file* | Remove-Item -Force${vars.text.none}`
                                                    ]);
                                                } else {
                                                    if (stderr !== "") {
                                                        log([stderr]);
                                                    }
                                                    error([JSON.stringify(err)]);
                                                }
                                            }
                                        },
                                        certRemove = function terminal_commands_build_osSpecific_statCallback_windows_importCerts_certRemove():void {
                                            exec(`get-childItem ${windowsStore} -DnsName *share-file* | Remove-Item -Force`, {
                                                shell: "powershell"
                                            }, certInventory);
                                        };
                                    // remove existing certs whose name starts with "share-file"
                                    log([`${humanTime(false)}Removing old certs for this application.`]);
                                    certRemove();
                                };
                            if (certFlags.forced === true || certStatError === true) {
                                importCerts();
                            } else {
                                exec(`get-childItem ${windowsStore} -DnsName *share-file*`, {
                                    shell: "powershell"
                                }, function terminal_commands_build_osSpecific_statCallback_windowsStore(err:ExecException, stdout:string):void {
                                    if ((/CN=share-file(-ca)?\s/).test(stdout) === false) {
                                        log([`${humanTime(false)}Certificates files found, but not in certificate store. Adding certificate to store.`]);
                                        importCerts();
                                    } else {
                                        next(`All certificate files accounted for in Windows certificate store: '${vars.text.cyan + windowsStore + vars.text.none}'.`);
                                    }
                                });
                            }
                        },
                        posix = function terminal_commands_build_osSpecific_statCallback_posix():void {
                            // certificate store locations by distribution
                            const storeList:stringStore = {
                                    arch: "/etc/ca-certificates/trust-source/anchors",
                                    darwin: "/Library/Keychains/System.keychain",  // OSX
                                    fedora: "/etc/pki/ca-trust/source/anchors", // includes centos
                                    ubuntu: "/usr/local/share/ca-certificates" // includes alpine, debian, kali
                                },

                                // handle all posix certificate store concerns here
                                distributions = function terminal_commands_build_osSpecific_statCallback_distributions(dist:posix):void {
                                    let taskIndex:number = 0,
                                        taskLength:number = 0;
                                    const certCA:string = `${certFlags.path}share-file-ca.crt`,
                                        cert:string = `${certFlags.path}share-file.crt`,
                                        signed:string = (certFlags.selfSign === true)
                                            ? cert
                                            : certCA,
                                        trustCommand:stringStore = {
                                            arch: "update-ca-trust",
                                            darwin: `security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" "${signed}"`,
                                            fedora: "update-ca-trust",
                                            ubuntu: "update-ca-certificates --fresh"
                                        },
                                        toolCAP:stringStore = {
                                            arch: "libcap",
                                            darwin: null,
                                            fedora: "libcap",
                                            ubuntu: "libcap2-bin"
                                        },
                                        toolINS:stringStore = {
                                            arch: "add",
                                            darwin: null,
                                            fedora: "install",
                                            ubuntu: "install"
                                        },
                                        toolNSS:stringStore = {
                                            arch: "nss",
                                            darwin: null,
                                            fedora: "nss-tools",
                                            ubuntu: "libnss3-tools"
                                        },
                                        toolPAC:stringStore = {
                                            arch: "pacman",
                                            darwin: null,
                                            fedora: "yum",
                                            ubuntu: "apt-get"
                                        },
                                        tasks:string[] = (function terminal_commands_build_osSpecific_statCallback_distHandle_tasks():string[] {
                                            const output:string[] = [];
                                            if (dist === "ubuntu") {
                                                output.push(`rm -rf ${storeList.ubuntu}`);
                                                output.push(`mkdir ${storeList.ubuntu}`);
                                            }
                                            if (dist === "darwin") {
                                                output.push(trustCommand[dist]);
                                            } else {
                                                output.push(`sudo setcap 'cap_net_bind_service=+ep' \`readlink -f "${vars.path.node}"`);
                                                output.push(`cp ${cert} ${storeList[dist]}`);
                                                if (certFlags.selfSign === false) {
                                                    output.push(`cp ${certCA} ${storeList[dist]}`);
                                                }
                                                // check if required package is installed for certutil
                                                output.push(`dpkg -s ${toolNSS[dist]}`);
                                                // check if required package is installed for setcap
                                                output.push(`dpkg -s ${toolCAP[dist]}`);
                                            }
                                            taskLength = output.length;
                                            return output;
                                        }()),
                                        sudo = function terminal_commands_build_osSpecific_statCallback_distHandle_sudo():void {
                                            log([`${humanTime(false)}sudo ${tasks[taskIndex]}`]);
                                            exec(`sudo ${tasks[taskIndex]}`, sudoCallback);
                                        },
                                        sudoCallback = function terminal_commands_build_osSpecific_statCallback_distHandle_sudoCallback(sudoErr:ExecException, stdout:Buffer|string, stderr:Buffer|string):void {
                                            if (dist !== "darwin" && (certFlags.forced === true || (tasks[taskIndex] === `dpkg -s ${toolNSS[dist]}` && stderr.indexOf("is not installed") > 0))) {
                                                // install nss tool to run the certutil utility for injecting certificates into browser trust stores
                                                const linuxPath:string = `${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}linux.sh`;
                                                tasks.push(`${toolPAC[dist]} ${toolINS[dist]} ${toolNSS[dist]}`);
                                                tasks.push(trustCommand[dist]);
                                                tasks.push(`chmod +x ${linuxPath}`);
                                                tasks.push(linuxPath);
                                                taskLength = taskLength + 4;
                                                taskIndex = taskIndex + 1;
                                                sudo();
                                            } else if (dist !== "darwin" && tasks[taskIndex] === `dpkg -s ${toolCAP[dist]}` && stderr.indexOf("is not installed") > 0) {
                                                // install libcap to run the setcap utility to all node to execute on restricted ports without running as root
                                                tasks.push(`${toolPAC[dist]} ${toolINS[dist]} ${toolCAP[dist]}`);
                                                tasks.push(`sudo setcap 'cap_net_bind_service=+ep' \`readlink -f "${vars.path.node}"\``);
                                                taskLength = taskLength + 2;
                                                taskIndex = taskIndex + 1;
                                                sudo();
                                            } else if (sudoErr === null) {
                                                if (stdout.toString().replace(/\s+$/, "") !== "") {
                                                    log([stdout.toString()]);
                                                }
                                                if (stderr.toString().replace(/\s+$/, "") !== "") {
                                                    log([stderr.toString()]);
                                                }
                                                taskIndex = taskIndex + 1;
                                                if (taskIndex === taskLength) {
                                                    log([`${humanTime(false)}Certificates installed.`]);
                                                    next(`${vars.text.angry}First installation requires closing all browsers to ensure they read the new OS trusted certificate.${vars.text.none}`);
                                                } else {
                                                    sudo();
                                                }
                                            } else {
                                                if (stderr !== "") {
                                                    log([stderr.toString()]);
                                                }
                                                error([JSON.stringify(sudoErr)]);
                                                process.exit(1);
                                            }
                                        };
                                    sudo();
                                },
                                callbacks:posixDistribution = {
                                    arch: function terminal_commands_build_osSpecific_statCallback_callbackArch(statErr:NodeJS.ErrnoException):void {
                                        if (statErr === null) {
                                            distributions("arch");
                                        }
                                    },
                                    darwin: function terminal_commands_build_osSpecific_statCallback_callbackDarwin(statErr:NodeJS.ErrnoException):void {
                                        if (statErr === null) {
                                            distributions("darwin");
                                        }
                                    },
                                    fedora: function terminal_commands_build_osSpecific_statCallback_callbackFedora(statErr:NodeJS.ErrnoException):void {
                                        if (statErr === null) {
                                            distributions("fedora");
                                        }
                                    },
                                    ubuntu: function terminal_commands_build_osSpecific_statCallback_callbackUbuntu(statErr:NodeJS.ErrnoException):void {
                                        if (statErr === null) {
                                            storeList.ubuntu = `${storeList.ubuntu}/extra`;
                                            distributions("ubuntu");
                                        }
                                    }
                                },
                                keys:string[] = Object.keys(storeList);

                            // attempt all known store locations to determine distributions
                            keys.forEach(function terminal_commands_build_osSpecific_statCallback_keys(value:string):void {
                                const type:posix = value as posix;
                                stat(storeList[type], callbacks[type]);
                            });
                        };
                    if (process.platform === "win32") {
                        // 1. certRemove, certInventory, certStatus: Remove any prior existing certificates for this application until none are left
                        // 2. certServer:                            Install the server certificate to the trust store
                        // 3. certAuthority:                         Install the root certificate to the trust store
                        // 4. certComplete:                          Callback for certificate installation
                        windows();
                    } else {
                        posix();
                    }
                },
                // phase services wraps a call to services test library
                service: function terminal_commands_build_serviceTests():void {
                    testListRunner("service", testsCallback);
                },
                // same as NPM global install, but without NPM
                shellGlobal: function terminal_commands_build_shellGlobal():void {
                    exec("npm root -g", function terminal_commands_build_shellGlobal_npm(err:Error, npm:string):void {
                        if (err === null) {
                            // commandName is attained from package.json
                            const globalPath:string = npm.replace(/\s+$/, "") + vars.path.sep + commandName,
                                bin:string = `${globalPath + vars.path.sep}bin`,
                                windows:boolean = (process.platform === "win32" || process.platform === "cygwin"),
                                files = function terminal_commands_build_shellGlobal_npm_files():void {
                                    let fileCount:number = 0;
                                    const nextString:string = "Writing global commands complete!",
                                        globalWrite = function terminal_commands_build_shellGlobal_npm_files_globalWrite():void {
                                            fileCount = fileCount + 1;
                                            if (windows === false || (windows === true && fileCount === 4)) {
                                                next(nextString);
                                            }
                                        },
                                        binName:string = `${bin + vars.path.sep + commandName}.mjs`;
                                    remove(binName, function terminal_commands_build_shellGlobal_npm_files_remove():void {
                                        readFile(`${vars.path.js}application.js`, {
                                            encoding: "utf8"
                                        }, function terminal_commands_build_shellGlobal_npm_files_remove_read(readError:Error, fileData:string):void {
                                            if (readError === null) {
                                                const injection:string[] = [
                                                        `vars.terminal.command_instruction="${commandName} ";`,
                                                        `vars.path.project="${vars.path.project.replace(/\\/g, "\\\\")}";`,
                                                        `vars.path.js="${vars.path.js.replace(/\\/g, "\\\\")}";`
                                                    ],
                                                    globalStart:number = fileData.indexOf("vars.terminal.command_instruction"),
                                                    globalEnd:number = fileData.indexOf("// end global"),
                                                    segments:string[] = [
                                                        "#!/usr/bin/env node\n",
                                                        fileData.slice(0, globalStart),
                                                        injection.join(""),
                                                        fileData.slice(globalEnd)
                                                    ];
                                                fileData = segments.join("").replace(/\.\/lib/g, `${vars.path.js.replace(/^\w:/, "").replace(/\\/g, "/")}lib`).replace("commandName(\"\")", `commandName("${commandName}")`);
                                                writeFile(binName, fileData, {
                                                    encoding: "utf8",
                                                    mode: 509
                                                }, function terminal_commands_build_shellGlobal_npm_files_remove_read_write():void {
                                                    if (windows === true) {
                                                        globalWrite();
                                                    } else {
                                                        const link:string = resolve(`${npm + vars.path.sep}..${vars.path.sep}..${vars.path.sep}bin${vars.path.sep + commandName}`);
                                                        remove(link, function terminal_commands_build_shellGlobal_npm_files_remove_read_write_link():void {
                                                            symlink(binName, link, globalWrite);
                                                        });
                                                    }
                                                });
                                            } else {
                                                error([readError.toString()]);
                                            }
                                        });
                                    });
                                    if (windows === true) {
                                        // The three following strings follow conventions created by NPM.
                                        // * See /documentation/credits.md for license information
                                        // cspell:disable
                                        const cyg:string = `#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")\n\ncase \`uname\` in\n    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;\nesac\n\nif [ -x "$basedir/node" ]; then\n  exec "$basedir/node"  "$basedir/node_modules/${commandName}/bin/${commandName}.mjs" "$@"\nelse\n  exec node  "$basedir/node_modules/${commandName}/bin/${commandName}.mjs" "$@"\nfi\n`,
                                            cmd:string = `@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n\r\nIF EXIST "%dp0%\\node.exe" (\r\n  SET "_prog=%dp0%\\node.exe"\r\n) ELSE (\r\n  SET "_prog=node"\r\n  SET PATHEXT=%PATHEXT:;.JS;=;%\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\node_modules\\${commandName}\\bin\\${commandName}.mjs" %*\r\n`,
                                            ps1:string = `#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=""\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n  $exe=".exe"\n}\n$ret=0\nif (Test-Path "$basedir/node$exe") {\n  if ($MyInvocation.ExpectingInput) {\n    $input | & "$basedir/node$exe"  "$basedir/node_modules/${commandName}/bin/${commandName}.mjs" $args\n  } else {\n    & "$basedir/node$exe"  "$basedir/node_modules/${commandName}/bin/${commandName}.mjs" $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  if ($MyInvocation.ExpectingInput) {\n    $input | & "node$exe"  "$basedir/node_modules/${commandName}/bin/${commandName}.mjs" $args\n  } else {\n    & "node$exe"  "$basedir/node_modules/${commandName}/bin/${commandName}.mjs" $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n`,
                                            // cspell:enable
                                            dir:string = npm.replace(/node_modules\s*$/, "");
                                        writeFile(dir + commandName, cyg, {
                                            encoding: "utf8"
                                        }, globalWrite);
                                        writeFile(`${dir + commandName}.cmd`, cmd, {
                                            encoding: "utf8"
                                        }, globalWrite);
                                        writeFile(`${dir + commandName}.ps1`, ps1, {
                                            encoding: "utf8"
                                        }, globalWrite);
                                    }
                                };
                            stat(bin, function terminal_commands_build_shellGlobal_npm_stat(errs:NodeJS.ErrnoException):void {
                                if (errs === null) {
                                    files();
                                } else {
                                    if (errs.code === "ENOENT") {
                                        if (windows === true) {
                                            mkdir(bin, files);
                                        } else {
                                            mkdir(bin, function terminal_commands_build_shellGlobal_npm_stat_mkdir():void {
                                                exec(`chmod 775 ${bin}`, function terminal_commands_build_shellGlobal_npm_stat_mkdir_chmod():void {
                                                    files();
                                                });
                                            });
                                        }
                                    } else {
                                        error([errs.toString()]);
                                    }
                                }
                            });
                        } else {
                            error([`Error executing child process: ${vars.text.cyan}npm root -g${vars.text.none}`, err.toString()]);
                        }
                    });
                },
                // phase simulation is merely a call to simulation test library
                simulation: function terminal_commands_build_simulation():void {
                    testListRunner("simulation", testsCallback);
                },
                // phase typescript compiles the working code into JavaScript
                typescript: function terminal_commands_build_typescript():void {
                    const incremental:string = (process.argv.indexOf("incremental") > -1)
                            ? "--incremental"
                            : "--pretty",
                        command:string = (process.argv.indexOf("local") > -1)
                            ? `node_modules\\.bin\\tsc ${incremental}`
                            : `tsc ${incremental}`,
                        ts = function terminal_commands_build_typescript_ts():void {
                            exec(command, {
                                cwd: vars.path.project
                            }, function terminal_commands_build_typescript_callback(err:Error, stdout:string):void {
                                const control:string = "\u001b[91m";
                                if (stdout !== "" && stdout.indexOf(` ${control}error${vars.text.none} `) > -1) {
                                    error([`${vars.text.red}TypeScript reported warnings.${vars.text.none}`, stdout]);
                                    return;
                                }
                                if (stdout !== "") {
                                    log([stdout]);
                                    compileErrors = stdout.slice(stdout.indexOf("Found"));
                                    compileErrors = compileErrors.slice(0, compileErrors.indexOf("error") - 1).replace(/\D+/g, "");
                                }
                                next("TypeScript build completed without warnings.");
                            });
                        };
                    exec("tsc --version", function terminal_commands_build_typescript_tsc(err:Error, stdout:string, stderr:string) {
                        if (err !== null) {
                            const str:string = err.toString();
                            if (str.indexOf("command not found") > 0 || str.indexOf("is not recognized") > 0) {
                                log([`${vars.text.angry}TypeScript does not appear to be globally installed.${vars.text.none}`]);
                            } else {
                                error([err.toString(), stdout]);
                                return;
                            }
                        } else {
                            if (stderr !== "") {
                                error([stderr]);
                                return;
                            }
                            ts();
                        }
                    });
                },
                // write the current version, change date, and modify html
                version: function terminal_commands_build_version():void {
                    const pack:string = `${vars.path.project}package.json`,
                        html:string = `${vars.path.project}lib${vars.path.sep}index.html`,
                        configPath:string = `${vars.path.project}lib${vars.path.sep}configurations.json`,
                        packStat = function terminal_commands_build_version_packStat(ers:Error, stats:Stats):void {
                            if (ers !== null) {
                                error([ers.toString()]);
                                return;
                            }
                            const readPack = function terminal_commands_build_version_packStat_readPack(err:Error, data:string):void {
                                    if (err !== null) {
                                        error([err.toString()]);
                                        return;
                                    }
                                    const packageData:packageJSON = JSON.parse(data),
                                        commitHash = function terminal_commands_build_version_packStat_readPack_commitHash(hashErr:Error, stdout:string, stderr:string):void {
                                            const flag:flagList = {
                                                    config: false,
                                                    html: false,
                                                    package: false
                                                },
                                                version:version = {
                                                    date: vars.environment.date,
                                                    git_hash: (stdout === "")
                                                        ? "(git not used)"
                                                        : stdout.replace(/\s+/g, ""),
                                                    version: packageData.version
                                                },
                                                readHTML = function terminal_commands_build_version_packStat_readPack_commitHash_readHTML(err:Error, fileData:string):void {
                                                    if (err !== null) {
                                                        error([err.toString()]);
                                                        return;
                                                    }
                                                    const regex:RegExp = new RegExp("<h1>\\s*(\\w+\\s*)*\\s*<span\\s+class=(\"|')application-version(\"|')>(version\\s+\\d+(\\.\\d+)+)?\\s*<\\/span>\\s*<\\/h1>", "g"),
                                                        writeHTML = function terminal_commands_build_version_packStat_readPack_commitHash_readHTML_writeHTML(erh:Error):void {
                                                            if (erh !== null) {
                                                                error([erh.toString()]);
                                                                return;
                                                            }
                                                            flag.html = true;
                                                            if (flag.config === true && flag.package === true) {
                                                                next("Version data written");
                                                            }
                                                        };
                                                    fileData = fileData.replace(regex, `<h1>${vars.environment.name} <span class="application-version">version ${vars.environment.version}</span></h1>`);
                                                    writeFile(html, fileData, "utf8", writeHTML);
                                                },
                                                readConfig = function terminal_commands_build_version_packStat_readPack_commitHash_readConfig(err:Error, configFile:string):void {
                                                    if (err !== null) {
                                                        error([err.toString()]);
                                                        return;
                                                    }
                                                    const config:configurationApplication = JSON.parse(configFile),
                                                        writeConfig = function terminal_commands_build_version_packStat_readPack_commitHash_readConfig_writeConfig(erc:Error):void {
                                                            if (erc !== null) {
                                                                error([erc.toString()]);
                                                                return;
                                                            }
                                                            flag.config = true;
                                                            if (flag.html === true && flag.package === true) {
                                                                next("Version data written");
                                                            }
                                                        };
                                                    config["package-lock.json"].version = vars.environment.version;
                                                    writeFile(configPath, JSON.stringify(config), "utf8", writeConfig);
                                                },
                                                versionWrite = function terminal_commands_build_version_packStat_readPack_commitHash_packageWrite(err:Error):void {
                                                    if (err === null) {
                                                        flag.package = true;
                                                        if (flag.config === true && flag.html === true) {
                                                            next("Version data written");
                                                        }
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
                
                                            vars.environment.git_hash = version.git_hash;
                                            vars.environment.version = packageData.version;
                
                                            // modify index.html
                                            readFile(html, "utf8", readHTML);
                
                                            // modify configuration.json
                                            readFile(configPath, "utf8", readConfig);

                                            // write version data
                                            writeFile(`${vars.path.project}version.json`, JSON.stringify(version), versionWrite);
                                        };
                                    
                                    stat(`${vars.path.project}.git`, function terminal_commands_build_version_packStat_readPack_gitStat(gitError:Error):void {
                                        if (gitError === null) {
                                            exec("git rev-parse HEAD", {
                                                cwd: vars.path.project
                                            }, commitHash);
                                        } else {
                                            commitHash(null, "", "");
                                        }
                                    });
                                    commandName = packageData.command;
                                },
                                month:string = (function terminal_commands_build_version_packStat_month():string {
                                    let numb:number = stats.mtime.getMonth();
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
                                dayString:string = stats.mtime.getDate().toString(),
                                dayPadded:string = (dayString.length < 2)
                                    ? `0${dayString}`
                                    : dayString,
                                date:string = `${dayPadded} ${month} ${stats.mtime.getFullYear().toString()}`;
                            vars.environment.date = date.replace(/-/g, "");
    
                            // read package.json
                            readFile(pack, "utf8", readPack);
                        };
                    stat(pack, packStat);
                }
            };
        cursorTo(process.stdout, 0, 0);
        clearScreenDown(process.stdout);
        if (test === false || test === undefined) {
            log.title("Run All Build Tasks");
        }
        next("");
    };
export default build;