
import { generateKeyPair } from "crypto";
import { hostname } from "os";

import serverVars from "./server/serverVars.js";

import error from "./error.js";
import hash from "./hash.js";
import humanTime from "./humanTime.js";
import lint from "./lint.js";
import log from "./log.js";
import simulation from "./simulation.js";
import vars from "./vars.js";

// build/test system
const library = {
        error: error,
        hash: hash,
        humanTime: humanTime,
        lint: lint,
        log: log,
        simulation: simulation
    },
    build = function terminal_build(test:boolean, callback:Function):void {
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
            heading = function terminal_build_heading(message:string):void {
                if (firstOrder === true) {
                    library.log([""]);
                    firstOrder = false;
                } else if (order[type].length < orderLength) {
                    library.log(["________________________________________________________________________", ""]);
                }
                library.log([vars.text.cyan + message + vars.text.none, ""]);
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
                    library.log([time + message]);
                    sectionTimer(time);
                }
                if (order[type].length < 1) {
                    if (vars.command === "build") {
                        vars.verbose = true;
                        heading(`${vars.text.none}All ${vars.text.green + vars.text.bold + type + vars.text.none} tasks complete... Exiting clean!\u0007`);
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
                // phase lint is merely a call to apps.lint
                lint     : function terminal_build_lint():void {
                    const callback = function terminal_build_lint_callback(message:string):void {
                        next(message);
                    };
                    heading("Linting");
                    library.lint(callback);
                },
                // phase simulation is merely a call to apps.simulation
                simulation: function terminal_build_simulation():void {
                    const callback = function terminal_build_simulation_callback(message:string):void {
                        next(message);
                    };
                    heading(`Simulations of Node.js commands from ${vars.version.command}`);
                    library.simulation(callback);
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
                                next(`${vars.text.green}TypeScript build completed without warnings.${vars.text.none}`);
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
                            flag = {
                                json: false,
                                html: false
                            },
                            html:string = `${vars.projectPath}index.html`;
                        vars.version.date = date.replace(/-/g, "");

                        // read package.json
                        vars.node.fs.readFile(pack, "utf8", function terminal_build_version_stat_read(err:Error, data:string) {
                            if (err !== null) {
                                library.error([err.toString()]);
                                return;
                            }
                            let a:number = 0,
                                hash0:string;
                            const writeVersion = function terminal_build_version_stat_read_writeVersion():void {
                                    vars.node.fs.writeFile(`${vars.projectPath}version.json`, JSON.stringify(vars.version), "utf8", function terminal_build_version_stat_read_writeVersion_write(erw:Error) {
                                        if (erw !== null) {
                                            library.error([erw.toString()]);
                                            return;
                                        }
                                        flag.json = true;
                                        if (flag.html === true) {
                                            next("Version data written");
                                        }
                                    });
                                },
                                keys = function terminal_build_version_stat_read_keys():void {
                                    const keys:versionKeys = vars.version.keys;
                                    if (
                                        keys === undefined ||
                                        keys.device === undefined ||
                                        keys.user === undefined ||
                                        keys.device.private === undefined ||
                                        keys.device.private.indexOf("PRIVATE KEY-----") < 0 ||
                                        keys.user.private === undefined ||
                                        keys.user.private.indexOf("PRIVATE KEY-----") < 0 ||
                                        keys.device.public === undefined ||
                                        keys.device.public.indexOf("PUBLIC KEY-----") < 0 ||
                                        keys.user.public === undefined ||
                                        keys.user.public.indexOf("PUBLIC KEY-----") < 0
                                    ) {
                                        const flag = {
                                                device: false,
                                                user: false
                                            },
                                            generate = function terminal_build_version_stat_read_keys_generate(type:"device"|"user"):void {
                                                generateKeyPair("ec", {
                                                    namedCurve: "secp521r1",
                                                    publicKeyEncoding:{
                                                        type: "spki",
                                                        format: "pem"
                                                    },
                                                    privateKeyEncoding:{
                                                        type: "pkcs8",
                                                        format: "pem",
                                                        cipher: "aes-256-cbc",
                                                        passphrase: ""
                                                    }
                                                }, function terminal_build_version_stat_read_keys_callback(keyError:nodeError, publicKey:string, privateKey:string):void {
                                                    if (keyError !== null) {
                                                        library.error([keyError.toString()]);
                                                        return;
                                                    }
                                                    vars.version.keys[type].public = publicKey;
                                                    vars.version.keys[type].private = privateKey;
                                                    flag[type] = true;
                                                    if (flag.device === true && flag.user === true) {
                                                        writeVersion();
                                                    }
                                                });
                                            };
                                        vars.version.keys = {
                                            device: {
                                                private: "",
                                                public: ""
                                            },
                                            user: {
                                                private: "",
                                                public: ""
                                            }
                                        };
                                        generate("device");
                                        generate("user");
                                    } else {
                                        writeVersion();
                                    }
                                },
                                length:number = serverVars.macList.length,
                                identity = function terminal_build_version_version_stat_read_hash():void {
                                    library.hash({
                                        callback: function terminal_build_version_stat_read_hashCallback(hashOut:hashOutput):void {
                                            if (a === 0) {
                                                hash0 = hashOut.hash;
                                            }
                                            if (vars.version.device === "" || vars.version.device === undefined || vars.version.device === hashOut.hash) {
                                                vars.version.device = hashOut.hash;
                                                keys();
                                            } else if (a < length) {
                                                a = a + 1;
                                                terminal_build_version_version_stat_read_hash();
                                            } else {
                                                vars.version.device = hash0;
                                                keys();
                                            }
                                        },
                                        directInput: true,
                                        source: hostname() + serverVars.macList[a]
                                    });
                                };
                            vars.version.number = JSON.parse(data).version;

                            // generate identity hashes and key pair
                            identity();

                            // modify HTML
                            vars.node.fs.readFile(html, "utf8", function terminal_build_version_stat_read_html(err:Error, fileData:string):void {
                                if (err !== null) {
                                    library.error([err.toString()]);
                                    return;
                                }
                                const regex:RegExp = new RegExp(`<h1>\\s*(\\w+\\s*)*\\s*<span\\s+class=("|')application-version("|')>(version\\s+\\d+(\\.\\d+)+)?\\s*<\\/span>\\s*<\\/h1>`, "g"),
                                    stringInsert = function terminal_build_version_stat_read_html_stringInsert(insert:modifyFile):string {
                                        const index:number = insert.source.indexOf(insert.start) + insert.start.length,
                                            startSegment:string = insert.source.slice(0, index),
                                            ending:string = insert.source.slice(index),
                                            endIndex:number = ending.indexOf(insert.end),
                                            endSegment:string = ending.slice(endIndex);
                                        if (index < 0 || endIndex < 0) {
                                            return insert.source;
                                        }
                                        return startSegment + insert.target + endSegment;
                                    };
                                fileData = stringInsert({
                                    end: "\"/>",
                                    source: fileData,
                                    start: "readonly=\"readonly\" value=\"",
                                    target: vars.projectPath.slice(0, vars.projectPath.length - 1)
                                });
                                fileData = stringInsert({
                                    end: "\" rel=\"noopener noreferrer\" target=\"_blank\">Generate New Identity</a>",
                                    source: fileData,
                                    start: "Create</strong> a new identity. <a href=\"",
                                    target: vars.version.identity_domain
                                });
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
                        });
                    });
                }
            };
        next("");
    };

export default build;