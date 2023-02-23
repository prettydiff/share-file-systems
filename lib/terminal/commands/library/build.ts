/* lib/terminal/commands/library/build - The library that executes the build and test tasks. */

import { exec, ExecException } from "child_process";
import { readdir, readFile, stat, Stats, symlink, unlink, writeFile } from "fs";
import { EOL } from "os";
import { resolve } from "path";
import { clearScreenDown, cursorTo } from "readline";

import browser from "../../test/application/browser.js";
import certificate from "./certificate.js";
import commands_documentation from "../../utilities/commands_documentation.js";
import error from "../../utilities/error.js";
import directory from "./directory.js";
import firewall from "./firewall.js";
import humanTime from "../../utilities/humanTime.js";
import lint from "./lint.js";
import log from "../../utilities/log.js";
import mkdir from "./mkdir.js";
import readStorage from "../../utilities/readStorage.js";
import remove from "./remove.js";
import testListRunner from "../../test/application/runner.js";
import typescript from "./typescript.js";
import vars from "../../utilities/vars.js";

// cspell:words centos, certfile, certname, certutil, cygwin, eslintignore, gitignore, keychain, keychains, libcap, libnss, libnss3, noconfirm, npmignore, pacman, setcap

// build/test system
const build = function terminal_commands_library_build(config:config_command_build, callback:commandCallback):void {
    let firstOrder:boolean = true,
        certStatError:boolean = false,
        compileErrors:string = "",
        sectionTime:[number, number] = [0, 0],
        commandName:string;
    const order:build_order = {
            build: [
                "configurations",
                "certificate",
                "os_specific",
                "clearStorage",
                "commands",
                "libReadme",
                "typescript_compile",
                "bundleJS",
                "bundleCSS",
                "version",
                "shellGlobal"
            ],
            test: [
                "lint",
                "typescript_validate",
                "simulation",
                "service",
                "browserSelf"
            ]
        },
        type:"build"|"test" = (config.test === true)
            ? "test"
            : "build",
        orderLength:number = order[type].length,
        certFlags:certificate_flags = {
            forced: config.force_certificate,
            path: `${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}`,
            selfSign: false
        },
        testsCallback = function terminal_commands_library_build_testsCallback(title:string, text:string[], fail:boolean):void {
            if (fail === true) {
                vars.settings.verbose = true;
                log(text, true);
                process.exit(1);
            } else {
                if (title === "TypeScript") {
                    compileErrors = (text[0] === "TypeScript type validation completed without warnings.")
                        ? "0"
                        : text[0];
                }
                next(text[0]);
            }
        },
        // a short title for each build/test phase
        heading = function terminal_commands_library_build_heading(message:string):void {
            if (firstOrder === true) {
                log([""]);
                firstOrder = false;
            } else if (order[type].length < orderLength) {
                log(["________________________________________________________________________", "", ""]);
            }
            log([vars.text.cyan + vars.text.bold + message + vars.text.none, ""]);
        },
        headingText:stringStore = {
            browserSelf: "Test local device in browser",
            bundleCSS: "Bundling CSS files into a single file",
            bundleJS: "Bundling JS Libraries into a single file",
            certificate: "Checking for certificates",
            clearStorage: "Removing unnecessary temporary files",
            commands: "Writing commands.md documentation",
            configurations: "Write configuration files",
            libReadme: "Writing lib directory readme.md files",
            lint: "Linting",
            os_specific: "Executing operating system specific tasks",
            service: "Tests of supported services",
            shellGlobal: `Producing global shell command: ${vars.text.green}share${vars.text.none}`,
            simulation: `Simulations of Node.js commands from ${vars.terminal.command_instruction}`,
            typescript_compile: "Code compilation",
            typescript_validate: "Validating TypeScript data types",
            version: "Writing version data"
        },
        // indicates how long each phase took
        sectionTimer = function terminal_commands_library_build_sectionTime(input:string):void {
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
        next = function terminal_commands_library_build_next(message:string):void {
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
                        const moduleName:string = (vars.environment.module_type === "module")
                            ? "ES2020"
                            : "commonjs";
                        heading(`${vars.text.none}All ${vars.text.green + vars.text.bold + vars.environment.command + vars.text.none} tasks complete... Exiting clean!\u0007`);
                        log([
                            `Built as module type: ${vars.text.cyan + moduleName + vars.text.none}`,
                            `To use as a ${vars.text.cyan}browser${vars.text.none} application execute the application with command: ${vars.text.bold + vars.text.green + vars.terminal.command_instruction + vars.text.none}`,
                            `To use as a ${vars.text.cyan}desktop${vars.text.none} application execute the application with command: ${vars.text.bold + vars.text.green}npm start${vars.text.none}`
                        ]);
                    } else {
                        const plural:string = (compileErrors === "1")
                                ? ""
                                : "s",
                            color:string = (compileErrors === "0")
                                ? vars.text.green + vars.text.bold
                                : vars.text.angry;
                        heading(`${vars.text.none}Build tasks complete with ${color + compileErrors} compile error${plural + vars.text.none}.\u0007`);
                    }
                    log([""], true);
                    process.exit(0);
                    return;
                }
                callback("", [""], null);
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
         *     browserSelf:() => void;         // Launches test automation type *browser_self* against the local device.
         *     bundleCSS:() => void;           // Bundle CSS files into a single file.
         *     bundleJS:() => void;            // Bundle browser-side JS libraries into a single file.
         *     certificate:() => void;         // Tests for certificates and creates them if not present.
         *     clearStorage:() => void;        // Removes files created from prior test automation runs.
         *     commands:() => void;            // Builds the documentation/commands.md file.
         *     configurations:() => void;      // Writes application specific configuration files from lib/configurations.json.
         *     libReadme:() => void;           // Extracts comments from the top of each file to build out automated documentation.
         *     lint:() => void;                // Executes ESLint as a test task.
         *     os_specific: () => void;        // Execute any Operating System specific tasks here.
         *     service:() => void;             // Executes the test automation of type *service*.
         *     shellGlobal:() => void;         // Writes and updates a file to provide this application with global availability against a keyword on the terminal.
         *     simulation:() => void;          // Executes the test automation of type *simulation*.
         *     typescript_compile:() => void;  // Runs the TypeScript compiler.
         *     typescript_validate:() => void; // Compiles the TypeScript code to JavaScript with SWC
         *     version:() => void;             // Updates version data as taken from the package.json and prior git commit for display and availability elsewhere in the application.
         * }
         * ``` */
        phases:module_buildPhaseList = {
            // Launches test automation type *browser_self* against the local device.
            browserSelf: function terminal_commands_library_build_browserSelf():void {
                const splice = function terminal_commands_library_build_browserSelf_splice(parameter:string):boolean {
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
            // Bundle CSS files into a single file.
            bundleCSS: function terminal_commands_library_build_bundleCSS():void {
                let fileCount:number = 0,
                    fileLength:number = 0;
                const files:string[] = [],
                    filePath:string = `${vars.path.project}lib${vars.path.sep}css${vars.path.sep}`,
                    dirCallback = function terminal_commands_library_build_bundleCSS_dirCallback(dirError:NodeJS.ErrnoException, fileList:string[]):void {
                        if (dirError === null) {
                            const readComplete = function terminal_commands_library_build_bundleCSS_readComplete():void {
                                fileCount = fileCount + 1;
                                if (fileCount === fileLength) {
                                    writeFile(`${filePath}bundle.css`, files.join(EOL), function terminal_commands_library_build_bundleCSS_readComplete_writeFile(writeError:NodeJS.ErrnoException):void {
                                        if (writeError === null) {
                                            next("CSS bundle written.");
                                        } else {
                                            error(["Error writing bundled CSS file in bundleCSS step of build."], writeError);
                                        }
                                    });
                                }
                            };
                            fileLength = fileList.length;
                            fileList.forEach(function terminal_commands_library_build_bundleCSS_dirCallback_each(value:string):void {
                                if (value === "bundle.css") {
                                    readComplete();
                                } else {
                                    readFile(filePath + value, function terminal_commands_library_build_build_buildCSS_dirCallback_each_readFile(readError:NodeJS.ErrnoException, fileData:Buffer):void {
                                        if (readError === null) {
                                            files.push(fileData.toString().replace(/\r?\n/g, "").replace(/\/\*(\s|\w|-|,|:|\/|\\)+\*\//g, "").replace(/ +/g, " ").replace(/@font-face/g, `${EOL}@font-face`));
                                            readComplete();
                                        } else {
                                            error(["Error reading file in bundleCSS step of build."], dirError);
                                        }
                                    });
                                }
                            });
                        } else {
                            error(["Error reading directory in bundleCSS step of build."], dirError);
                        }
                    };
                readdir(filePath, dirCallback);
            },
            // Bundle browser-side JS libraries into a single file.
            bundleJS: function terminal_commands_library_build_bundleJS():void {
                let fileCount:number = 0,
                    fileLength:number = 0,
                    dirIndex:number = 0;
                const files:[string, string][] = [],
                    filePath:string = `${vars.path.js}browser${vars.path.sep}`,
                    dirs:string[] = [
                        `${filePath}content`,
                        `${filePath}utilities`,
                        `${vars.path.js}common`
                    ],
                    dirLen:number = dirs.length,
                    index = function terminal_commands_library_build_bundleJS_index():void {
                        readFile(`${filePath}index.js`, function terminal_commands_library_build_bundleJS_index_read(readError:NodeJS.ErrnoException, fileData:Buffer):void {
                            if (readError === null) {
                                const storageCallback = function terminal_commands_library_build_bundleJS_index_read_storageCallback(settingsData:settings_item):void {
                                    let file:string = fileData.toString(),
                                        index:number = 0;
                                    const testBrowser:string = (vars.test.browser !== null)
                                            ? JSON.stringify(vars.test.browser)
                                            : "{}",
                                        fileListString:string = (function terminal_commands_library_build_bundleJS_index_read_storageCallback_join():string {
                                            const output:string[] = [];
                                            files.sort();
                                            files.forEach(function terminal_commands_library_build_bundleJS_index_read_storageCallback_join_each(value:[string, string]):void {
                                                output.push(value[1]);
                                            });
                                            return output.join(EOL).replace(/,$/, "");
                                        }());
                                    if (settingsData !== null && settingsData.configuration !== null && settingsData.configuration.hashDevice === "") {
                                        settingsData.configuration.hashDevice = vars.settings.hashDevice;
                                    }
                                    // remove import/require statements from top of file
                                    file = file.slice(file.indexOf("(function"));
                                    // start of function body
                                    index = file.indexOf("{") + 1;
                                    // injection of modules
                                    file = file.slice(0, index) + EOL + `const ${fileListString};` + file.slice(index);
                                    if (settingsData !== null) {
                                        // remove some compile time reference renaming insanity that occurs when compiling to commonjs
                                        file = file.replace(/_js_\d+/g, "").replace(/\.default/g, "").replace(/const\s*const/g, "const").replace(/;\s*;/g, ";");
                                        // set state for Electron
                                        file = file.replace(/state = \{\s*addresses: null,\s*settings: null,\s*test: null\s*\}/, `state = {addresses:{"addresses":${JSON.stringify(vars.network.addresses)},"ports":${JSON.stringify(vars.network.ports)}},settings:${JSON.stringify(settingsData).replace(/'/g, "&#39;")},test:${testBrowser}}`);
                                    }
                                    writeFile(`${filePath}bundle.js`, file, function terminal_commands_library_build_bundleJS_index_read_writeFile(writeError:NodeJS.ErrnoException):void {
                                        if (writeError === null) {
                                            next("Browser JavaScript bundle written.");
                                        } else {
                                            error(["Error writing bundled JavaScript file in bundleJS step of build."], writeError);
                                        }
                                    });
                                };
                                if (vars.environment.module_type === "module") {
                                    storageCallback(null);
                                } else {
                                    readStorage(true, storageCallback);
                                }
                            } else {
                                error(["Error reading file in bundleJS step of build."], readError);
                            }
                        });
                    },
                    dirCallback = function terminal_commands_library_build_bundleJS_dirCallback(err:NodeJS.ErrnoException, fileList:string[]):void {
                        if (err === null) {
                            fileLength = fileLength + fileList.length;
                            fileList.forEach(function terminal_commands_library_build_bundleJS_dirCallback_each(fileName:string):void {
                                readFile(dirs[dirIndex] + vars.path.sep + fileName, function terminal_commands_library_build_bundleJS_dirCallback_each_fileContents(readError:NodeJS.ErrnoException, fileData:Buffer):void {
                                    if (readError === null) {
                                        let file:string = fileData.toString();
                                        const commentPath:string = file.slice(0, file.indexOf(" -")).replace(/\/\*\s*/, "");
                                        if (vars.environment.module_type === "module") {
                                            // ESM
                                            file = file.slice(file.indexOf("const") + 6, file.lastIndexOf("}") + 1).replace(/^\s+/, "");
                                            file = `${file},`;
                                        } else {
                                            // commonjs
                                            const indexBrace:number = file.indexOf("= {"),
                                                indexFun:number = file.indexOf("= function"),
                                                startIndex:number = (indexBrace > -1 && indexFun > -1 && indexBrace < indexFun)
                                                    ? indexBrace
                                                    : (indexBrace > -1 && indexFun > -1 && indexBrace > indexFun)
                                                        ? indexFun
                                                        : (indexBrace < 0)
                                                            ? indexFun
                                                            : indexBrace;
                                            let a:number = startIndex;
                                            do {
                                                a = a - 1;
                                            } while (file.slice(a, a + 6) !== "const ");
                                            file = file.slice(a, file.indexOf("exports.default"));
                                        }
                                        files.push([commentPath, file]);
                                        fileCount = fileCount + 1;
                                        if (fileCount === fileLength) {
                                            index();
                                        }
                                    } else {
                                        error(["Error reading file in bundleJS step of build."], readError);
                                    }
                                });
                            });
                            dirIndex = dirIndex + 1;
                            if (dirIndex < dirLen) {
                                readdir(dirs[dirIndex], terminal_commands_library_build_bundleJS_dirCallback);
                            }
                        } else {
                            error(["Error reading directory in bundleJS step of build."], err);
                        }
                    };
                readdir(dirs[0], dirCallback);
            },
            // tests for certificates and if not present generates them
            certificate: function terminal_commands_library_build_certificate():void {
                let statCount:number = 0;
                const selfSignCount:2|6 = (certFlags.selfSign === true)
                        ? 2
                        : 6,
                    statCallback = function terminal_commands_library_build_certificate_statCallback(statError:NodeJS.ErrnoException):void {
                        statCount = statCount + 1;
                        if (statError !== null) {
                            certStatError = true;
                        }
                        if (statCount === selfSignCount) {
                            const makeCerts = function terminal_commands_library_build_certificate_statCallback_makeCerts():void {
                                const cnfFlags:flagList = {
                                        ca: false,
                                        selfSign: false
                                    },
                                    configComplete = function terminal_commands_library_build_certificate_statCallback_makeCerts_configComplete(name:"ca"|"selfSign"):void {
                                        cnfFlags[name] = true;
                                        if (cnfFlags.ca === true && cnfFlags.selfSign === true) {
                                            const certCallback = function terminal_commands_library_build_certificate_statCallback_certCallback():void {
                                                next("Certificates created.");
                                            };
                                            certificate({
                                                callback: certCallback,
                                                days: 16384,
                                                location: certFlags.path,
                                                names: {
                                                    intermediate: {
                                                        domain: "share-file-ca",
                                                        fileName: "share-file-ca"
                                                    },
                                                    organization: "share-file",
                                                    root: {
                                                        domain: "share-file-root",
                                                        fileName: "share-file-root"
                                                    },
                                                    server: {
                                                        domain: "share-file",
                                                        fileName: "share-file"
                                                    }
                                                },
                                                selfSign: certFlags.selfSign
                                            });
                                        }
                                    },
                                    cnfRead = function terminal_commands_library_build_certificate_statCallback_makeCerts_cnfRead(name:"ca"|"selfSign"):void {
                                        const cnfPath:string = `${certFlags.path + name}.cnf`;
                                        readFile(cnfPath, function terminal_commands_library_build_certificate_statCallback_makeCerts_cnfRead_readCallback(readError:NodeJS.ErrnoException, fileData:Buffer):void {
                                            if (readError === null) {
                                                let index:number = 0,
                                                    fileStr:string = fileData.toString();
                                                const fragment:string = "[alt_names]",
                                                    input:string[] = [""],
                                                    len:number = vars.network.domain.length;
                                                do {
                                                    input.push(`DNS.${index + 1} = ${vars.network.domain[index]}`);
                                                    index = index + 1;
                                                } while (index < len);
                                                fileStr = fileStr.slice(0, fileStr.indexOf(fragment) + fragment.length).replace(/\s+$/, "");
                                                fileStr = fileStr + input.join("\n");
                                                writeFile(cnfPath, fileStr, function terminal_commands_library_build_certificate_statCallback_makeCerts_cnfRead_readCallback_writeFile(writeError:NodeJS.ErrnoException):void {
                                                    if (writeError === null) {
                                                        configComplete(name);
                                                    } else {
                                                        error([`Error writing file ${cnfPath}`], writeError);
                                                    }
                                                });
                                            } else {
                                                error([`Error reading file ${cnfPath}`], readError);
                                            }
                                        });
                                    };
                                // write supported domains to config files
                                cnfRead("ca");
                                cnfRead("selfSign");
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
                    stat(`${certFlags.path}share-file-root.crt`, statCallback);
                    stat(`${certFlags.path}share-file-root.key`, statCallback);
                }
            },
            // clearStorage removes temporary settings files that should have been removed, but weren't
            clearStorage: function terminal_commands_library_build_clearStorage():void {
                readdir(`${vars.path.project}lib${vars.path.sep}settings`, function terminal_commands_library_build_clearStorage_dir(erd:Error, dirList:string[]) {
                    if (erd !== null) {
                        error(["Error reading from settings directory."], erd);
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
                            unlink(`${vars.path.project}lib${vars.path.sep}settings${vars.path.sep + dirList[a]}`, function terminal_commands_library_build_clearStorage_dir_unlink(eru:Error):void {
                                if (eru !== null) {
                                    error(["Error removing files from settings directory."], eru);
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
            commands: function terminal_commands_library_build_commands():void {
                const docs:documentation_command = commands_documentation(vars.terminal.command_instruction),
                    keys:string[] = Object.keys(docs),
                    output:string[] = [],
                    eachExample = function terminal_commands_library_build_commands_eachExample(example:documentation_command_example):void {
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
                keys.forEach(function terminal_commands_library_build_commands_each(command:string):void {
                    const examples:documentation_command_example[] = docs[command as commands].example;
                    output.push(`## ${command}`);
                    output.push(docs[command as commands].description);
                    output.push("");
                    output.push("### Examples");
                    examples.forEach(eachExample);
                    output.push("");
                });
                writeFile(filePath, output.join("\n"), "utf8", function terminal_commands_library_build_commands_write(err:Error):void {
                    if (err === null) {
                        next(`File ${filePath} successfully written.`);
                        return;
                    }
                    error(["Error writing updated commands documentation file."], err);
                });
            },
            // writes configuration data to files
            configurations: function terminal_commands_library_build_configurations():void {
                readFile(`${vars.path.project}lib${vars.path.sep}configurations.json`, "utf8", function terminal_commands_library_build_configurations_readFile(err:Error, fileData:string) {
                    if (err === null) {
                        const config:configuration_application = JSON.parse(fileData),
                            keys:string[] = Object.keys(config),
                            length:number = keys.length,
                            writeCallback = function terminal_commands_library_build_configurations_readFile_writeCallback(wErr:Error):void {
                                if (wErr === null) {
                                    a = a + 1;
                                    if (a === length) {
                                        next("Configuration files written!");
                                    } else {
                                        write();
                                    }
                                    return;
                                }
                                error(["Error writing configuration files."], wErr);
                            },

                            write = function terminal_commands_library_build_configurations_readFile_write():void {
                                let stringItem:string = "";
                                const list = function terminal_commands_library_build_configurations_readFile_write_list(item:string[]):string {
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
                                } else {
                                    writeCallback(null);
                                }
                            },
                            removeCallback = function terminal_commands_library_build_configurations_readFile_removeCallback():void {
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
                            remove(vars.path.project + keys[a], [], removeCallback);
                        } while (a > 0);
                        return;
                    }
                    error(["Error reading from configurations.json file."], err);
                });
            },
            // libReadme builds out the readme file that indexes code files in the current directory
            libReadme: function terminal_commands_library_build_libReadme():void {
                let dirList:directory_list = [];
                const callback = function terminal_commands_library_build_dirCallback(title:string, text:string[], dir:directory_list|string[]):void {
                        const list:directory_list = dir as directory_list;
                        if (dirList.length < 1) {
                            dirList = list;
                        } else {
                            dirList = dirList.concat(list);
                            dirs();
                        }
                    },
                    dirs = function terminal_commands_library_build_libReadme_dirs():void {
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
                            masterList = function terminal_commands_library_build_libReadme_masterList():void {
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
                                writeFile(filePath, fileContents.join("\n"), "utf8", function terminal_commands_library_build_libReadme_masterList_write(erWrite:Error):void {
                                    if (erWrite !== null) {
                                        error(["Error writing library_list.md documentation file."], erWrite);
                                        return;
                                    }
                                    log([`${humanTime(false)}Updated ${filePath}`]);
                                    next("Completed writing lib directory readme.md files.");
                                });
                            },

                            // write the various readme.md files in each directory
                            write = function terminal_commands_library_build_libReadme_write(path:string, fileList:string):void {
                                const filePath:string = `${vars.path.project + path.replace(/\//g, vars.path.sep) + vars.path.sep}readme.md`,
                                    writeComplete = function terminal_commands_library_build_libReadme_write_writeComplete():void {
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
                                readFile(filePath, "utf8", function terminal_commands_library_build_libReadme_write_readFile(erRead:Error, readme:string):void {
                                    if (erRead !== null) {
                                        error([
                                            "Error reading file during documentation build task.",
                                            `File: ${filePath}`
                                        ], erRead);
                                        return;
                                    }
                                    const sample:string = "Contents dynamically populated. -->",
                                        index:number = readme.indexOf(sample) + sample.length;
                                    readme = readme.slice(0, index) + `\n\n${fileList}`;
                                    // Ninth, write the documentation to each respective file
                                    writeFile(filePath, readme, "utf8", function terminal_commands_library_build_libReadme_write_readFile_writeFile(erWrite:Error):void {
                                        if (erWrite !== null) {
                                            error([
                                                "Error writing file during documentation build task.",
                                                `File: ${filePath}`
                                            ], erWrite);
                                            return;
                                        }
                                        log([`${humanTime(false)}Updated ${filePath}`]);
                                        writeComplete();
                                    });
                                });
                            },

                            // read code files for the required supporting comment at the top each code file
                            fileRead = function terminal_commands_library_build_libReadme_fileRead(erRead:Error, file:string):void {
                                if (erRead !== null) {
                                    error(["Error reading file during documentation build task."], erRead);
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
                                    ], null);
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
                                    doc:documentation_file_item = {
                                        description: comment.slice(dashIndex + 3),
                                        name: name,
                                        namePadded: `* **[${name}.${extension}](${name}.${extension})**`,
                                        path: path.join("/")
                                    },
                                    // writes comments to the module files from the definition files
                                    moduleComment = function terminal_commands_library_build_libReadme_fileRead_moduleComment():void {
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
                                                writeFile(codeFiles[a], file, "utf8", function terminal_commands_library_build_libReadme_fileRead_moduleComment_writeFile(writeError:NodeJS.ErrnoException):void {
                                                    if (writeError !== null) {
                                                        error(["Error writing TypeScript module comment to code file."], writeError);
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
                                        terminal_commands_library_build_libReadme_fileRead(null, modules.browser);
                                    } else if (codeFiles[a].indexOf(`typescript${vars.path.sep}modules_terminal.d.ts`) > 0) {
                                        terminal_commands_library_build_libReadme_fileRead(null, modules.terminal);
                                    } else {
                                        readFile(codeFiles[a], "utf8", terminal_commands_library_build_libReadme_fileRead);
                                    }
                                } else {
                                    // Eighth, once all code files are read the respective documentation content must be built
                                    let aa:number = 1,
                                        b:number = 0,
                                        c:number = 0,
                                        longest:number = files[aa].name.length,
                                        list:string[] = [];
                                    const fileLength:number = files.length,
                                        buildList = function terminal_commands_library_build_libReadme_readFile_buildList():void {
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
                                    files.sort(function terminal_commands_library_build_libReadme_readFile_sort(x:documentation_file_item, y:documentation_file_item):-1|1 {
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
                            nameTest = function terminal_commands_library_build_libReadme_nameTest(index:number, name:string):boolean {
                                if (dirList[index][0].lastIndexOf(name) === dirList[index][0].length - name.length) {
                                    return true;
                                }
                                return false;
                            },
                            readModules = function terminal_commands_library_build_libReadme_readModules(type:"browser"|"terminal"):void {
                                readFile(`${vars.path.project}lib${vars.path.sep}typescript${vars.path.sep}modules_${type}.d.ts`, "utf8", function terminal_commands_library_build_libReadme_readModules_readFile(moduleError:NodeJS.ErrnoException, fileData:string):void {
                                    const modulesComplete = function terminal_commands_library_build_libReadme_readModules_readFile_modulesComplete():void {
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
                                        error(["Error reading TypeScript module definition file."], moduleError);
                                    }
                                });
                            },
                            files:documentation_file_item[] = [],
                            codeFiles:string[] = [];
                        // Second, sort the directory data first by file types and then alphabetically
                        dirList.sort(function terminal_commands_library_build_libReadme_dirs_sort(x:directory_item, y:directory_item):number {
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
                                dirList[a][0].indexOf("storageTest") < 0 &&
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
                        search: "",
                        symbolic: false
                    };
                // First, get the file system data for the lib directory and then direct output to the dirs function
                directory(dirConfig);
                dirConfig.path = `${vars.path.project}documentation`;
                directory(dirConfig);
            },
            // phase lint is merely a call to the lint library
            lint: function terminal_commands_library_build_lint():void {
                lint(vars.path.project, testsCallback);
            },
            // performs tasks specific to the given operating system
            os_specific: function terminal_commands_library_build_osSpecific():void {
                const windows = function terminal_commands_library_build_osSpecific_windows():void {
                        let completeMessage:string = "";
                        const flags:flagList = {
                                certs: false,
                                firewall: false
                            },
                            outputLog:string[] = [],
                            complete = function terminal_commands_library_build_osSpecific_windows_complete():void {
                                log(outputLog);
                                next(completeMessage);
                            },
                            certs = function terminal_commands_library_build_osSpecific_windows_certs():void {
                                const windowsStoreName:"CurrentUser"|"LocalMachine" = "CurrentUser",
                                    windowsTrust:"My"|"Root" = "Root",
                                    windowsStore:string = `Cert:\\${windowsStoreName}\\${windowsTrust}`,
                                    importCerts = function terminal_commands_library_build_osSpecific_windows_certs_importCerts():void {
                                        readFile(`${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}windows.ps1`, function terminal_commands_library_build_osSpecific_windows_certs_importCerts_readFile(readError:NodeJS.ErrnoException, fileData:Buffer):void {
                                            if (readError === null) {
                                                const str:string = fileData.toString().replace(/Get-Content "lib\\certificate\\/g, `Get-Content "${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}`);
                                                exec(str, {
                                                    shell: "powershell"
                                                }, function terminal_commands_library_build_osSpecific_windows_certs_importCerts_readFile_exec(execError:ExecException):void {
                                                    if (execError === null) {
                                                        flags.certs = true;
                                                        outputLog.push(`${humanTime(false)}Firefox users must set option ${vars.text.angry}security.enterprise_roots.enabled${vars.text.none} to true using page address 'about:config'.`);
                                                        if (flags.certs === true && flags.firewall === true) {
                                                            completeMessage = `All certificate files added to Windows certificate store: '${vars.text.cyan + windowsStore + vars.text.none}'.`;
                                                            complete();
                                                        }
                                                    } else {
                                                        error(["Error installing certificates using a powershell script."], readError);
                                                    }
                                                });
                                            } else {
                                                error(["Error reading project file windows.ps1"], readError);
                                            }
                                        });
                                    };
                                if (certFlags.forced === true || certStatError === true) {
                                    importCerts();
                                } else {
                                    exec(`get-childItem ${windowsStore} -DnsName *share-file*`, {
                                        shell: "powershell"
                                    }, function terminal_commands_library_build_osSpecific_windows_certs_check(err:ExecException, stdout:string):void {
                                        if ((/CN=share-file(-ca)?\s/).test(stdout) === false) {
                                            outputLog.push(`${humanTime(false)}Certificates files found, but not in certificate store. Adding certificate to store.`);
                                            importCerts();
                                        } else {
                                            flags.certs = true;
                                            completeMessage = `All certificate files accounted for in Windows certificate store: '${vars.text.cyan + windowsStore + vars.text.none}'.`;
                                            if (flags.certs === true && flags.firewall === true) {
                                                complete();
                                            }
                                        }
                                    });
                                }
                            },
                            firewallWrapper = function terminal_commands_library_build_osSpecific_windows_firewallWrapper():void {
                                if (process.argv.indexOf("firewall") > -1) {
                                    firewall(function terminal_commands_library_build_osSpecific_windows_firewallWrapper_callback(title:string, message:string[], fail:boolean):void {
                                        if (fail === true) {
                                            error(message, null);
                                        } else {
                                            flags.firewall = true;
                                            outputLog.push(`${humanTime(false)}Windows firewall updated.`);
                                            if (flags.certs === true && flags.firewall === true) {
                                                complete();
                                            }
                                        }
                                    });
                                } else {
                                    flags.firewall = true;
                                    outputLog.push(`${humanTime(false)}Firewall modification ignored without firewall argument, example: ${vars.text.cyan + vars.environment.command} firewall${vars.text.none}`);
                                    if (flags.certs === true && flags.firewall === true) {
                                        complete();
                                    }
                                }
                            };
                        certs();
                        firewallWrapper();
                    },
                    posix = function terminal_commands_library_build_osSpecific_posix():void {
                        // certificate store locations by distribution
                        const storeList:stringStore = {
                                arch: "/etc/ca-certificates/trust-source/anchors",
                                darwin: "/Library/Keychains/System.keychain",  // OSX
                                fedora: "/etc/pki/ca-trust/source/anchors", // includes centos
                                ubuntu: "/usr/local/share/ca-certificates" // includes alpine, debian, kali
                            },

                            // handle all posix certificate store concerns here
                            distributions = function terminal_commands_library_build_osSpecific_distributions(dist:posix):void {
                                let taskIndex:number = 0,
                                    taskLength:number = 0,
                                    statCount:number = 0,
                                    flags:flagList = {
                                        certInstall: false,
                                        statError: false,
                                        toolCAP: false,
                                        toolNSS: false
                                    };
                                const certCA:string = `${certFlags.path}share-file-ca.crt`,
                                    certRoot:string = `${certFlags.path}share-file-root.crt`,
                                    cert:string = `${certFlags.path}share-file.crt`,
                                    signed:string = (certFlags.selfSign === true)
                                        ? cert
                                        : certRoot,
                                    linuxPath:string = `${certFlags.path}linux.sh`,
                                    tools:build_posix_tools = {
                                        install: {
                                            arch: "-S --noconfirm",
                                            darwin: null,
                                            fedora: "install",
                                            ubuntu: "install"
                                        },
                                        package: {
                                            arch: "pacman",
                                            darwin: null,
                                            fedora: "yum",
                                            ubuntu: "apt-get"
                                        },
                                        toolCAP: {
                                            arch: "libcap",
                                            darwin: null,
                                            fedora: "libcap",
                                            ubuntu: "libcap2-bin"
                                        },
                                        toolNSS: {
                                            arch: "nss",
                                            darwin: null,
                                            fedora: "nss-tools",
                                            ubuntu: "libnss3-tools"
                                        },
                                        trust: {
                                            arch: "update-ca-trust",
                                            darwin: `security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" "${signed}"`,
                                            fedora: "update-ca-trust",
                                            ubuntu: "update-ca-certificates --fresh"
                                        }
                                    },
                                    tasks:string[] = [],
                                    sudo = function terminal_commands_library_build_osSpecific_distributions_sudo():void {
                                        const sudo:string = (tasks[taskIndex] === linuxPath && tasks[taskIndex - 1] === linuxPath)
                                                ? ""
                                                : "sudo ",
                                            sudoCWD:string = (tasks[taskIndex] === linuxPath)
                                                ? certFlags.path.slice(0, certFlags.path.length - 1)
                                                : vars.path.project;
                                        if (sudo === "sudo " || tasks[taskIndex].indexOf("linux.sh") > 0) {
                                            log([humanTime(false) + sudo + tasks[taskIndex]]);
                                        }
                                        exec(sudo + tasks[taskIndex], {
                                            cwd: sudoCWD
                                        }, sudoCallback);
                                    },
                                    linuxCallback = function terminal_commands_library_build_osSpecific_distributions_linuxCallback():void {
                                        stat(`${storeList[dist] + vars.path.sep}share-file.crt`, statCallback);
                                        if (certFlags.selfSign === false) {
                                            stat(`${storeList[dist] + vars.path.sep}share-file-ca.crt`, statCallback);
                                        }
                                    },
                                    // forces an absolute path into the linux.sh file for ease of troubleshooting
                                    modifyLinux = function terminal_commands_library_build_osSpecific_distributions_modifyLinux():void {
                                        readFile(linuxPath, function terminal_commands_library_build_osSpecific_distributions_modifyLinux_readLinux(err:NodeJS.ErrnoException, fileData:Buffer):void {
                                            if (err === null) {
                                                const linuxFile:string = fileData.toString(),
                                                    start:number = fileData.indexOf("certfile=\""),
                                                    end:number = fileData.indexOf("certname=\""),
                                                    segments:string[] = [];
                                                segments.push(linuxFile.slice(0, start));
                                                segments.push(`certfile="${certFlags.path}share-file-root.crt"\n`);
                                                segments.push(linuxFile.slice(end));
                                                writeFile(linuxPath, segments.join(""), function terminal_commands_library_build_osSpecific_distributions_modifyLinux_readLinux_writeLinux(errWrite:NodeJS.ErrnoException):void {
                                                    if (errWrite === null) {
                                                        linuxCallback();
                                                    } else {
                                                        error(["Error writing the linux.sh file from the certificate directory"], err);
                                                    }
                                                });
                                            } else {
                                                error(["Error reading the linux.sh file from the certificate directory"], err);
                                            }
                                        });
                                    },
                                    toolInstall = function terminal_commands_library_build_osSpecific_distributions_toolInstall(toolName:"toolCAP"|"toolNSS"):void {
                                        if (flags[toolName] === true) {
                                            error([`Error: Not able to download tool ${vars.text.angry + tools[toolName][dist] + vars.text.none}`], null);
                                        } else {
                                            // install nss tool to run the certutil utility for injecting certificates into browser trust stores
                                            taskIndex = (taskIndex > 0)
                                                ? taskIndex - 1
                                                : 0;
                                            tasks.splice(taskIndex, 0, `${tools.package[dist]} ${tools.install[dist]} ${tools[toolName][dist]}`);
                                            taskLength = taskLength + 1;
                                            flags[toolName] = true;
                                            sudo();
                                        }
                                    },
                                    sudoCallback = function terminal_commands_library_build_osSpecific_distributions_sudoCallback(sudoErr:ExecException, stdout:Buffer|string, stderr:Buffer|string):void {
                                        if (stderr.indexOf("certutil: command not found") > 0) {
                                            toolInstall("toolNSS");
                                        } else if (stderr.indexOf("setcap: command not found") > 0) {
                                            toolInstall("toolCAP");
                                        } else if (sudoErr === null) {
                                            if (tasks[taskIndex].indexOf(tools.package[dist]) !== 0) {
                                                if (stdout.toString().replace(/\s+$/, "") !== "") {
                                                    log([stdout.toString()]);
                                                }
                                                if (stderr.toString().replace(/\s+$/, "") !== "") {
                                                    log([stderr.toString()]);
                                                }
                                            }
                                            taskIndex = taskIndex + 1;
                                            if (taskIndex === taskLength) {
                                                if (flags.certInstall === true) {
                                                    log([`${humanTime(false)}Certificates installed.`]);
                                                    next(`${vars.text.angry}First installation requires closing all browsers to ensure they read the new OS trusted certificate.${vars.text.none}`);
                                                } else {
                                                    next("All operating system specific tasks complete.");
                                                }
                                            } else {
                                                sudo();
                                            }
                                        } else {
                                            if (stderr !== "") {
                                                log([stderr.toString()]);
                                            }
                                            error(["Error executing a command with sudo."], sudoErr);
                                        }
                                    },
                                    statCallback = function terminal_commands_library_build_osSpecific_distributions_statCallback(certError:NodeJS.ErrnoException):void {
                                        statCount = statCount + 1;
                                        if (certError !== null) {
                                            flags.statError = true;
                                        }
                                        if (statCount === ((certFlags.selfSign === true) ? 1 : 2)) {
                                            if (certFlags.forced === true || flags.statError === true) {
                                                flags.certInstall = true;
                                                if (dist === "ubuntu") {
                                                    tasks.push(`rm -rf ${storeList.ubuntu}`);
                                                    tasks.push(`mkdir ${storeList.ubuntu}`);
                                                }
                                                if (dist === "darwin") {
                                                    tasks.push(tools.trust[dist]);
                                                } else {
                                                    // copy certificates to cert store
                                                    tasks.push(`cp ${cert} ${storeList[dist]}`);
                                                    if (certFlags.selfSign === false) {
                                                        tasks.push(`cp ${certCA} ${storeList[dist]}`);
                                                        tasks.push(`cp ${certRoot} ${storeList[dist]}`);
                                                    }
                                                }
                                            }
                                            if (dist !== "darwin" && certFlags.forced === true) {
                                                // install nss tool to run the certutil utility for injecting certificates into browser trust stores
                                                tasks.push(tools.trust[dist]);
                                                tasks.push(`chmod +x ${linuxPath}`);
                                                tasks.push(linuxPath);
                                                tasks.push(linuxPath);
                                            }
                                            if (dist !== "darwin" && config.force_port === true) {
                                                tasks.push(`setcap 'cap_net_bind_service=+ep' \`readlink -f "${vars.path.node}"\``);
                                            }
                                            taskLength = tasks.length;
                                            if (taskLength > 0) {
                                                sudo();
                                            } else {
                                                next("No operating system specific tasks to perform.");
                                            }
                                        }
                                    };
                                modifyLinux();
                            },
                            callbacks:build_posix_distribution = {
                                arch: function terminal_commands_library_build_osSpecific_callbackArch(statErr:NodeJS.ErrnoException):void {
                                    if (statErr === null) {
                                        distributions("arch");
                                    }
                                },
                                darwin: function terminal_commands_library_build_osSpecific_callbackDarwin(statErr:NodeJS.ErrnoException):void {
                                    if (statErr === null) {
                                        distributions("darwin");
                                    }
                                },
                                fedora: function terminal_commands_library_build_osSpecific_callbackFedora(statErr:NodeJS.ErrnoException):void {
                                    if (statErr === null) {
                                        distributions("fedora");
                                    }
                                },
                                ubuntu: function terminal_commands_library_build_osSpecific_callbackUbuntu(statErr:NodeJS.ErrnoException):void {
                                    if (statErr === null) {
                                        storeList.ubuntu = `${storeList.ubuntu}/extra`;
                                        distributions("ubuntu");
                                    }
                                }
                            },
                            keys:string[] = Object.keys(storeList);

                        // attempt all known store locations to determine distributions
                        keys.forEach(function terminal_commands_library_build_osSpecific_keys(value:string):void {
                            const type:posix = value as posix;
                            stat(storeList[type], callbacks[type]);
                        });
                    };
                if (process.platform === "win32") {
                    windows();
                } else {
                    posix();
                }
            },
            // phase services wraps a call to services test library
            service: function terminal_commands_library_build_serviceTests():void {
                testListRunner("service", testsCallback);
            },
            // same as NPM global install, but without NPM
            shellGlobal: function terminal_commands_library_build_shellGlobal():void {
                exec("npm root -g", function terminal_commands_library_build_shellGlobal_npm(err:Error, npm:string):void {
                    if (err === null) {
                        // commandName is attained from package.json
                        const globalPath:string = npm.replace(/\s+$/, "") + vars.path.sep + commandName,
                            bin:string = `${globalPath + vars.path.sep}bin`,
                            windows:boolean = (process.platform === "win32" || process.platform === "cygwin"),
                            files = function terminal_commands_library_build_shellGlobal_npm_files():void {
                                let fileCount:number = 0,
                                    removeCount:number = 0;
                                const nextString:string = "Writing global commands complete!",
                                    readEntry = function terminal_commands_library_build_shellGlobal_npm_files_readEntry():void {
                                        readFile(`${vars.path.js}terminal${vars.path.sep}utilities${vars.path.sep}entry.js`, {
                                            encoding: "utf8"
                                        }, function terminal_commands_library_build_shellGlobal_npm_files_remove_read(readError:Error, fileData:string):void {
                                            if (readError === null) {
                                                const varsName:string = (vars.environment.module_type === "module")
                                                        ? "vars"
                                                        : (function terminal_commands_library_build_shellGlobal_npm_files_readEntry_read_varsName():string {
                                                            let a:number = fileData.indexOf("vars");
                                                            const len:number = fileData.length,
                                                                x:number = a;
                                                            do {
                                                                if (fileData.charAt(a) === " ") {
                                                                    return `${fileData.slice(x, a)}.default`;
                                                                }
                                                                a = a + 1;
                                                            } while (a < len);
                                                        }()),
                                                    globalWrite = function terminal_commands_library_build_shellGlobal_npm_files_readEntry_read_globalWrite():void {
                                                        fileCount = fileCount + 1;
                                                        if (windows === false || (windows === true && fileCount === 4)) {
                                                            next(nextString);
                                                        }
                                                    },
                                                    injection:string[] = [
                                                        "// global\r\n",
                                                        `${varsName}.terminal.command_instruction="${commandName} ";`,
                                                        `${varsName}.path.project="${vars.path.project.replace(/\\/g, "\\\\")}";`,
                                                        `${varsName}.path.js="${vars.path.js.replace(/\\/g, "\\\\")}";`,
                                                        `${varsName}.settings.storage="${vars.settings.storage.replace(/\\/g, "\\\\")}"`
                                                    ],
                                                    globalStart:number = fileData.indexOf("// global"),
                                                    globalEnd:number = fileData.indexOf("// end global"),
                                                    segments:string[] = [
                                                        "#!/usr/bin/env node\n",
                                                        fileData.slice(0, globalStart),
                                                        injection.join(""),
                                                        fileData.slice(globalEnd)
                                                    ],
                                                    superSep:string = (vars.path.sep === "\\")
                                                        ? "\\\\"
                                                        : vars.path.sep,
                                                    moduleType:build_moduleType = (vars.environment.module_type === "module")
                                                        ? {
                                                            importPath: `from "${vars.path.js.replace(/^\w:/, function terminal_commands_library_build_shellGlobal_npm_files_readEntry_read_modulePath(value:string):string {
                                                                return `file:///${value}`;
                                                            }).replace(/\\/g, "/")}terminal/utilities/`,
                                                            exportString: "export default entry;",
                                                            extension: "mjs"
                                                        }
                                                        : {
                                                            importPath: `require("${vars.path.js.replace(/\\/g, superSep)}terminal${superSep}utilities${superSep}`,
                                                            exportString: /((exports\.)|(const\s+_))default = entry;/,
                                                            extension: "js"
                                                        },
                                                    terminalCallback:string = "entry(function entry_callback(title,text){if(title===\"\"){log.default(text);}else if(vars.settings.verbose===true){log.default.title(title);log.default(text,true);}else{log.default.title(title);log.default(text,true);}});",
                                                    writeName:string = binName.replace(/\.\w+$/, `.${moduleType.extension}`);

                                                // string conversion
                                                // 1. updates relative paths to absolute paths
                                                // 2. replaces module export with a function call and a callback with a logger
                                                fileData = (vars.environment.module_type === "module")
                                                    ? segments.join("")
                                                        .replace(/from "\.\//g, moduleType.importPath)
                                                        .replace(/from "(\.\.\/)+/g, moduleType.importPath
                                                        .replace("/terminal/utilities", ""))
                                                        .replace("commandName(\"\")", `commandName("${commandName}")`)
                                                        .replace(moduleType.exportString, terminalCallback.replace(/\.default/g, ""))
                                                    : segments.join("")
                                                        .replace(/require\("\.\//g, moduleType.importPath)
                                                        .replace(/require\("(\.\.\/)+/g, moduleType.importPath
                                                        .replace(`${superSep}terminal${superSep}utilities`, ""))
                                                        .replace("common/disallowed", `common${superSep}disallowed`)
                                                        .replace(/_?commandName(Js)?(\.default)?\)?\(""\)/g, function terminal_commands_library_build_shellGlobal_npm_files_readEntry_read_commandName(input:string):string {
                                                            return input.replace("\"\"", `"${commandName}"`);
                                                        })
                                                        .replace(/_varsJs/g, "varsJs")
                                                        .replace(moduleType.exportString, terminalCallback);

                                                // inject library "log"
                                                {
                                                    let errorIndex:number = fileData.indexOf("error"),
                                                        a:number = errorIndex;
                                                    do {
                                                        a = a + 1;
                                                    } while (fileData.charAt(a) !== ";");
                                                    a = a + 1;
                                                    do {
                                                        errorIndex = errorIndex - 1;
                                                    } while (fileData.charAt(errorIndex) !== ";");
                                                    fileData = fileData.slice(0, a) + fileData.slice(errorIndex, a).replace(/error(\w)*/g, "log") + fileData.slice(a);
                                                    if ((/const\s+_log\s*=/).test(fileData) === true) {
                                                        fileData = fileData.replace(/const _log /, "const log ");
                                                    }
                                                }

                                                // adds the command to the path for windows
                                                if (windows === true) {
                                                    // The three following strings follow conventions created by NPM.
                                                    // * See /documentation/credits.md for license information
                                                    // cspell:disable
                                                    const cyg:string = `#!/bin/sh\nbasedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")\n\ncase \`uname\` in\n    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;\nesac\n\nif [ -x "$basedir/node" ]; then\n  exec "$basedir/node"  "$basedir/node_modules/${commandName}/bin/${commandName}.${moduleType.extension}" "$@"\nelse\n  exec node  "$basedir/node_modules/${commandName}/bin/${commandName}.${moduleType.extension}" "$@"\nfi\n`,
                                                        cmd:string = `@ECHO off\r\nGOTO start\r\n:find_dp0\r\nSET dp0=%~dp0\r\nEXIT /b\r\n:start\r\nSETLOCAL\r\nCALL :find_dp0\r\n\r\nIF EXIST "%dp0%\\node.exe" (\r\n  SET "_prog=%dp0%\\node.exe"\r\n) ELSE (\r\n  SET "_prog=node"\r\n  SET PATHEXT=%PATHEXT:;.JS;=;%\r\n)\r\n\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\node_modules\\${commandName}\\bin\\${commandName}.${moduleType.extension}" %*\r\n`,
                                                        ps1:string = `#!/usr/bin/env pwsh\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n\n$exe=""\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n  $exe=".exe"\n}\n$ret=0\nif (Test-Path "$basedir/node$exe") {\n  if ($MyInvocation.ExpectingInput) {\n    $input | & "$basedir/node$exe"  "$basedir/node_modules/${commandName}/bin/${commandName}.${moduleType.extension}" $args\n  } else {\n    & "$basedir/node$exe"  "$basedir/node_modules/${commandName}/bin/${commandName}.${moduleType.extension}" $args\n  }\n  $ret=$LASTEXITCODE\n} else {\n  if ($MyInvocation.ExpectingInput) {\n    $input | & "node$exe"  "$basedir/node_modules/${commandName}/bin/${commandName}.${moduleType.extension}" $args\n  } else {\n    & "node$exe"  "$basedir/node_modules/${commandName}/bin/${commandName}.${moduleType.extension}" $args\n  }\n  $ret=$LASTEXITCODE\n}\nexit $ret\n`,
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

                                                // writes the global script plus the 3 windows specific files for windows users
                                                writeFile(writeName, fileData, {
                                                    encoding: "utf8",
                                                    mode: 509
                                                }, function terminal_commands_library_build_shellGlobal_npm_files_readEntry_read_write():void {
                                                    if (windows === true) {
                                                        globalWrite();
                                                    } else {
                                                        const link:string = resolve(`${npm + vars.path.sep}..${vars.path.sep}..${vars.path.sep}bin${vars.path.sep + commandName}`);
                                                        remove(link, [], function terminal_commands_library_build_shellGlobal_npm_files_readEntry_read_write_link():void {
                                                            symlink(writeName, link, globalWrite);
                                                        });
                                                    }
                                                });
                                            } else {
                                                error([`Error reading ${vars.path.js}terminal${vars.path.sep}utilities${vars.path.sep}entry.js file.`], readError);
                                            }
                                        });
                                    },
                                    removeCallback = function terminal_commands_library_build_shellGlobal_npm_files_removeCallback():void {
                                        removeCount = removeCount + 1;
                                        if (removeCount === 2) {
                                            stat(vars.settings.storage, function terminal_commands_library_build_shellGlobal_npm_files_removeCallback_storageStat(storageError:NodeJS.ErrnoException):void {
                                                if (storageError === null) {
                                                    readEntry();
                                                } else {
                                                    vars.settings.storage = `${vars.path.project}lib${vars.path.sep}storage${vars.path.sep}`;
                                                    readEntry();
                                                }
                                            });
                                        }
                                    },
                                    binName:string = `${bin + vars.path.sep + commandName}.mjs`;
                                remove(binName.replace(".mjs", ".js"), [], removeCallback);
                                remove(binName, [], removeCallback);
                            };
                        stat(bin, function terminal_commands_library_build_shellGlobal_npm_stat(errs:NodeJS.ErrnoException):void {
                            if (errs === null) {
                                files();
                            } else {
                                if (errs.code === "ENOENT") {
                                    if (windows === true) {
                                        mkdir(bin, files);
                                    } else {
                                        mkdir(bin, function terminal_commands_library_build_shellGlobal_npm_stat_mkdir():void {
                                            exec(`chmod 775 ${bin}`, function terminal_commands_library_build_shellGlobal_npm_stat_mkdir_chmod():void {
                                                files();
                                            });
                                        });
                                    }
                                } else {
                                    error(["Error executing stat on global path location."], errs);
                                }
                            }
                        });
                    } else {
                        error(["Error executing child process: npm root -g"], err);
                    }
                });
            },
            // phase simulation is merely a call to simulation test library
            simulation: function terminal_commands_library_build_simulation():void {
                testListRunner("simulation", testsCallback);
            },
            // phase typescript compiles the working code into JavaScript
            typescript_compile: function terminal_commands_library_build_typescriptCompile():void {
                remove(vars.path.js, [], function terminal_commands_library_build_typescriptCompile_remove():void {
                    const command:string = "npx swc ./lib -d ./js/lib",
                        complete:string = "TypeScript files compiled to JavaScript.";
                    exec(command, {
                        cwd: vars.path.project
                    }, function terminal_commands_library_build_typescriptCompile_callback():void {
                        next(complete);
                    });
                });
            },
            // phase typescript compiles the working code into JavaScript
            typescript_validate: function terminal_commands_library_build_typescriptValidate():void {
                typescript(vars.path.project, testsCallback);
            },
            // write the current version, change date, and modify html
            version: function terminal_commands_library_build_version():void {
                const pack:string = `${vars.path.project}package.json`,
                    configPath:string = `${vars.path.project}lib${vars.path.sep}configurations.json`,
                    packStat = function terminal_commands_library_build_version_packStat(ers:Error, stats:Stats):void {
                        if (ers !== null) {
                            error(["Error executing stat on package.json file for version task of build."], ers);
                            return;
                        }
                        const readPack = function terminal_commands_library_build_version_packStat_readPack(err:Error, data:string):void {
                                if (err === null) {
                                    const packageData:configuration_packageJSON = JSON.parse(data),
                                        commitHash = function terminal_commands_library_build_version_packStat_readPack_commitHash(hashErr:Error, stdout:string, stderr:string):void {
                                            const flag:flagList = {
                                                    config: false,
                                                    package: false
                                                },
                                                readConfig = function terminal_commands_library_build_version_packStat_readPack_commitHash_readConfig(err:Error, configFile:string):void {
                                                    if (err !== null) {
                                                        error(["Error reading configuration.json file."], err);
                                                        return;
                                                    }
                                                    const config:configuration_application = JSON.parse(configFile),
                                                        writeConfig = function terminal_commands_library_build_version_packStat_readPack_commitHash_readConfig_writeConfig(erc:Error):void {
                                                            if (erc !== null) {
                                                                error(["Error writing configuration.json file."], erc);
                                                                return;
                                                            }
                                                            flag.config = true;
                                                            if (flag.package === true) {
                                                                next("Version data written");
                                                            }
                                                        },
                                                        versionWrite = function terminal_commands_library_build_version_packStat_readPack_commitHash_packageWrite(err:Error):void {
                                                            if (err === null) {
                                                                flag.package = true;
                                                                if (flag.config === true) {
                                                                    next("Version data written");
                                                                }
                                                            }
                                                        },
                                                        versionCheck = (function terminal_commands_library_build_version_packStat_versionCheck():boolean {
                                                            if (vars.environment.version === "") {
                                                                return true;
                                                            }
                                                            const packVersions:string[] = packageData.version.split("."),
                                                                packNumbs:number[] = [Number(packVersions[0]), Number(packVersions[1]), Number(packVersions[2])],
                                                                varVersions:string[] = vars.environment.version.split("."),
                                                                varNumbs:number[] = [Number(varVersions[0]), Number(varVersions[1]), Number(varVersions[2])];
                                                            if (packNumbs[0] > varNumbs[0]) {
                                                                return true;
                                                            }
                                                            if (packNumbs[0] === varNumbs[0] && packNumbs[1] > varNumbs[1]) {
                                                                return true;
                                                            }
                                                            if (packNumbs[0] === varNumbs[0] && packNumbs[1] === varNumbs[1] && packNumbs[2] > varNumbs[2]) {
                                                                return true;
                                                            }
                                                            return false;
                                                        }()),
                                                        dateRaw:number = (versionCheck === true)
                                                            ? Date.parse(stats.mtime.toDateString())
                                                            : config.versionDate,
                                                        dateObj:Date = new Date(dateRaw),
                                                        month:string = (function terminal_commands_library_build_version_packStat_month():string {
                                                            let numb:number = dateObj.getMonth();
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
                                                        date:string = (versionCheck === true)
                                                            ? (function terminal_commands_library_build_version_packStat_date():string {
                                                                const dayString:string = dateObj.getDate().toString(),
                                                                    dayPadded:string = (dayString.length < 2)
                                                                        ? `0${dayString}`
                                                                        : dayString;
                                                                return `${dayPadded} ${month} ${dateObj.getFullYear().toString()}`;
                                                            }())
                                                            : vars.environment.date,
                                                        version:version = {
                                                            date: vars.environment.date,
                                                            git_hash: (stdout === "")
                                                                ? "(git not used)"
                                                                : stdout.replace(/\s+/g, ""),
                                                            mtime: dateRaw,
                                                            version: packageData.version
                                                        };
                                                    config["package-lock.json"].version = vars.environment.version;
                                                    config.versionDate = dateRaw;
                                                    vars.environment.git_hash = version.git_hash;
                                                    vars.environment.version = packageData.version;
                                                    vars.environment.date = date;
                                                    vars.environment.dateRaw = dateRaw;
                                                    writeFile(configPath, JSON.stringify(config), "utf8", writeConfig);

                                                    // write version data
                                                    writeFile(`${vars.path.project}version.json`, JSON.stringify(version), versionWrite);
                                                };

                                            if (hashErr !== null) {
                                                error(["Error gathering latest git commit hash."], hashErr);
                                                return;
                                            }
                                            if (stderr !== "") {
                                                error([
                                                    "Received unexpected output attempting to retrieve git commit hash:",
                                                    stderr
                                                ], null);
                                                return;
                                            }

                                            // modify configuration.json
                                            readFile(configPath, "utf8", readConfig);
                                        };
                                    
                                    stat(`${vars.path.project}.git`, function terminal_commands_library_build_version_packStat_readPack_gitStat(gitError:Error):void {
                                        if (gitError === null) {
                                            exec("git rev-parse HEAD", {
                                                cwd: vars.path.project
                                            }, commitHash);
                                        } else {
                                            commitHash(null, "", "");
                                        }
                                    });
                                    commandName = packageData.command;
                                } else {
                                    error(["Error reading package.json file."], err);
                                }
                            };

                        // read package.json
                        readFile(pack, "utf8", readPack);
                    };
                stat(pack, packStat);
            }
        };
    if (config.test === false && config.type_validate === true) {
        order.build.splice(order.build.indexOf("typescript_compile") - 1, 0, "typescript_validate");
    }
    cursorTo(process.stdout, 0, 0);
    clearScreenDown(process.stdout);
    if (config.test === false) {
        log.title("Run All Build Tasks");
    }
    next("");
};
export default build;