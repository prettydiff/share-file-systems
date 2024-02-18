
/* lib/applications/install/index - Defines the application for installing other components. */

import copy from "../../terminal/commands/library/copy.js";
import error from "../../terminal/utilities/error.js";
import lint from "../../terminal/commands/library/lint.js";
import node from "../../terminal/utilities/node.js";
import remove_files from "../remove_files/index.js";
import typescript from "../../terminal/commands/library/typescript.js";
import vars from "../../terminal/utilities/vars.js";

const install:application<string, null> = {
    browser: null,
    service: null,
    terminal: {
        documentation: {
            description: "Installs a new component into the application.",
            example: [
                {
                    code: `${vars.terminal.command_instruction}install path/to/resource`,
                    defined: "Installs an component into the application using files at the specified path."
                }
            ]
        },
        io: function application_install_io(callback:commandCallback):void {
            if (process.argv.length < 1) {
                error([
                    "No component path specified."
                ], null);
                return;
            }
            install.terminal.library(callback, process.argv[0]);
        },
        library: function application_install_library(callback:commandCallback, location:string):void {
            // step 1 - determine if the application is a directory with the required files
            const name:string = (function application_install_library_copyDirectory():string {
                    const dirs:string[] = location.replace(/\\/g, vars.path.sep).replace(/\//g, vars.path.sep).split(vars.path.sep);
                    return dirs[dirs.length - 1];
                }()),
                appPath:string = `${vars.path.project}applications${vars.path.sep + name}`,
                fileCheck = function application_install_library_fileCheck():void {
                    let index:number = 0;
                    const list:[string, string][] = [
                            [location, "directory"],
                            [`${location + vars.path.sep}index.ts`, "file"],
                            [`${location + vars.path.sep}readme.md`, "file"]
                        ],
                        statCallback = function application_install_library_fileCheck_statCallback(err:node_error, stat:node_fs_Stats):void {
                            if (err === null) {
                                if ((list[index][1] === "directory" && stat.isDirectory() === false) || stat.isFile() === false) {
                                    error([
                                        "Specified path is not a directory."
                                    ], null);
                                    return;
                                }
                            }
                            index = index + 1;
                            if (index < list.length) {
                                node.fs.stat(list[index][0], application_install_library_fileCheck_statCallback);
                            } else {
                                copyDirectory();
                            }
                        };
                    node.fs.stat(list[index][0], statCallback);
                },
                // step 2 - copy the application into the project's application directory if not already there
                copyDirectory = function application_install_library_copyDirectory():void {
                    const copyApp = function application_install_library_copyDirectory_copyApp():void {
                            copy({
                                callback: function application_install_library_copyDirectory_copyApp_callback():void {
                                    lintStep();
                                },
                                destination: appPath,
                                exclusions: null,
                                replace: true,
                                target: location
                            });
                        };
                    if (location === appPath) {
                        lintStep();
                    } else {
                        remove_files.terminal.library(copyApp, appPath, null);
                    }
                },
                // step 3 - execute a lint check
                lintStep = function application_install_library_lintStep():void {
                    lint(appPath, function application_install_library_lintStep_callback(title:string, text:string[], fail:boolean):void {
                        if (fail === false) {
                            typeCheck();
                        }
                    });
                },
                // step 4 - TypeScript type check
                typeCheck = function application_install_library_typeCheck():void {
                    typescript(appPath, function application_install_library_typeCheck_callback(title:string, text:string[], fail:boolean):void {
                        if (fail === false) {
                            appList();
                        }
                    });
                },
                // step 5 - populate app list
                appList = function application_install_library_appList():void {
                    // where to keep the applist
                    // how to keep it beautified AND dynamic
                    //
                    // actually JSON is sufficient:
                    // applications = {}
                };
            if (name.toLowerCase() !== name || (/\W/).test(name) === true) {
                error([
                    "Application name is taken from the directory name.",
                    "Application name must be composed only off lower case alpha characters, numbers, or underscore characters."
                ], null);
            }
            fileCheck();
        }
    }
};

export default install;