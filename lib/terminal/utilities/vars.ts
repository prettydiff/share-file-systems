
/* lib/terminal/utilities/vars - Globally available variables for the terminal utility. */
import { exec } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as net from "net";
import * as os from "os";
import * as path from "path";
import * as zlib from "zlib";

// top scoped variables used in the terminal libraries
const vars:terminalVariables = {
        binary_check: (
            // eslint-disable-next-line
            /\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u000b|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001c|\u001d|\u001e|\u001f|\u007f|\u0080|\u0081|\u0082|\u0083|\u0084|\u0085|\u0086|\u0087|\u0088|\u0089|\u008a|\u008b|\u008c|\u008d|\u008e|\u008f|\u0090|\u0091|\u0092|\u0093|\u0094|\u0095|\u0096|\u0097|\u0098|\u0099|\u009a|\u009b|\u009c|\u009d|\u009e|\u009f/g
        ),
        cli: process.argv.join(" "),
        command: "",
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
        },
        cwd: process.cwd().replace(/(\/|\\)js$/, ""),
        exclusions: (function node_exclusions():string[] {
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
        flags: {
            error: false,
            write: ""
        },
        js: "",
        node: {
            child : exec,
            crypto: crypto,
            fs    : fs,
            http  : http,
            https : https,
            net   : net,
            os    : os,
            path  : path,
            zlib  : zlib
        },
        projectPath: "",
        sep: "/",
        startTime: process.hrtime(),
        testLogFlag: "",
        testLogger: function node_testLogger(library:string, container:string, message:string):void {
            if (vars.testLogFlag !== "") {
                const contain:string = (container === "")
                        ? ""
                        : `(${vars.text.bold + container + vars.text.none}) `,
                    lib:string = vars.text.green + library + vars.text.none,
                    item:string = `   ${vars.text.angry}*${vars.text.none} ${lib}, ${contain + message.replace(/\s+$/, "")}`;
                if (vars.testLogFlag === "simulation") {
                    // eslint-disable-next-line
                    console.log(`${vars.text.cyan}Log - ${vars.text.none + item}`);
                } else if (vars.testLogFlag === "service") {
                    vars.testLogStore.push(item);
                }
            }
        },
        testLogStore: [],
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
        },
        verbose: false,
        version: {
            command: "node js/application",
            date: "",
            name: "Share File Systems",
            number: "",
            port: 80
        },
        ws: ""
    };

vars.sep = vars.node.path.sep;
vars.projectPath = process.cwd() + vars.sep;
vars.js = `${vars.projectPath}js${vars.sep}`;

export default vars;