
/* lib/terminal/utilities/vars - Globally available variables for the terminal utility. */
import { exec, spawn } from "child_process";

import * as crypto from "crypto";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as http2 from "http2";
import * as net from "net";
import * as os from "os";
import * as path from "path";
import * as zlib from "zlib";
import * as stream from "stream";

// top scoped variables used in the terminal libraries
const vars:terminalVariables = {
        binary_check: (
            // eslint-disable-next-line
            /\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u000b|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001c|\u001d|\u001e|\u001f|\u007f|\u0080|\u0081|\u0082|\u0083|\u0084|\u0085|\u0086|\u0087|\u0088|\u0089|\u008a|\u008b|\u008c|\u008d|\u008e|\u008f|\u0090|\u0091|\u0092|\u0093|\u0094|\u0095|\u0096|\u0097|\u0098|\u0099|\u009a|\u009b|\u009c|\u009d|\u009e|\u009f/g
        ),                                            
        cli: process.argv.join(" "),                  // cli                 - a list of all terminal arguments before this list is modified, only used in error reporting
        command: "service",                           // command             - the given command name executing in the current application instance
        command_instruction: "node js/application ",  // command_instruction - the command to execution this application from a terminal
        commands: {
            exampleName: {
                description: "Provide a clear purpose.  What problem does this solve?",
                example: [
                    {
                        code: "Provide an example command directive typed into the terminal.",
                        defined: "Describe the code example and differentiate it from other examples"
                    }
                ]
            }
        },                                            // commands            - command documentation populated by library lib/utilities/commands_documentation.ts
        cwd: process.cwd().replace(/(\/|\\)js$/, ""), // cwd                 - current working directory from the perspective of the TypeScript libraries (`${vars.projectPath}lib`)
        date: "",                                     // date                - dynamically populated static value of date of prior version change
        exclusions: (function terminal_utilities_vars_exclusions():string[] {
            const args:string = process.argv.join(" ");
            if ((/\signore\s*\[/).test(args) === true) {
                const list:string[] = [],
                    listBuilder = function terminal_utilities_vars_exclusions_listBuilder():void {
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
                    if (a < len && process.argv[a] !== "ignore[") {
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
        }()),                                         // exclusions          - a file system exclusion list such that certain artifacts are ignored from file system operations
        flags: {
            error: false,
            write: ""
        },                                            // flags               - properties used by service and simulation tests so that error message is identified independent of other test execution
        git_hash: "",                                 // git_hash            - dynamically populated static value of hash from prior git commit at latest build
        js: "",                                       // js                  - file system path of the compiled JavaScript (`${vars.projectPath}lib${vars.sep}js`)
        name: "Share File Systems",                   // name                - a static name of the application
        node: {
            child : exec,
            crypto: crypto,
            fs    : fs,
            http  : http,
            https : https,
            http2 : http2,
            net   : net,
            os    : os,
            path  : path,
            spawn : spawn,
            stream: stream,
            zlib  : zlib
        },                                            // node                - Node.js libraries
        port_default: {
            insecure: 80,
            secure: 443
        },                                            // port_default        - a default network port
        projectPath: (function terminal_utilities_vars_projectPath():string {
            // this block normalizes node execution across operating systems and directory locations in the case that node could be executed as a component of a shell utility
            const length:number = process.argv.length,
                regNode:RegExp = new RegExp("((\\\\)|/)node(\\.exe)?$"),
                regApp:RegExp = new RegExp("((\\\\)|/)js((\\\\)|/)application(\\.js)?$");
            let a:number = 0,
                projectPath:string = "",
                nodeIndex:number = 0;
            do {
                if (regNode.test(process.argv[a]) === true) {
                    nodeIndex = a;
                } else if (regApp.test(process.argv[a]) === true) {
                    projectPath = process.argv[a].replace(regApp, "");
                }
                a = a + 1;
            } while (a < length);
            process.argv = process.argv.slice(nodeIndex);
            return projectPath;
        }()),                                         // projectPath         - the absolute file system path of this application
        sep: "/",                                     // sep                 - the file system separator used by the OS
        startTime: process.hrtime.bigint(),           // startTime           - nanosecond precision time the application starts for measuring execution performance
        text: {
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
        },                                            // text                - ANSI text formatting for terminal output
        verbose: false,                               // verbose             - whether verbose message should be applied to the terminal
        version: ""                                   // version             - dynamically populated static value of application version number string
    };

vars.sep = vars.node.path.sep;
vars.projectPath = vars.projectPath + vars.sep;
vars.js = `${vars.projectPath}js${vars.sep}`;

export default vars;