
import error from "./error.js";
import humanTime from "./humanTime.js";
import lint from "./lint.js";
import log from "./log.js";
import simulation from "./simulation.js";
import vars from "./vars.js";

// build/test system
const library = {
        error: error,
        humanTime: humanTime,
        lint: lint,
        log: log,
        simulation: simulation
    },
    build = function terminal_build(test:boolean):void {
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
                    vars.verbose = true;
                    heading(`${vars.text.none}All ${vars.text.green + vars.text.bold + type + vars.text.none} tasks complete... Exiting clean!\u0007`);
                    library.log([""], true);
                    process.exit(0);
                    return;
                }
                order[type].splice(0, 1);
                phases[phase]();
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
                // write the current version and change date
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
                            date = `${stat.mtime.getDate().toString()} ${month} ${stat.mtime.getFullYear().toString()}`;
                        vars.version.date = date.replace(/-/g, "");
                        vars.node.fs.readFile(pack, "utf8", function terminal_build_version_stat_read(err:Error, data:string) {
                            if (err !== null) {
                                library.error([err.toString()]);
                                return;
                            }
                            vars.version.number = JSON.parse(data).version;
                            vars.node.fs.writeFile(`${vars.projectPath}version.json`, `{"command":"${vars.version.command}","date":"${vars.version.date}","name":"${vars.version.name}","number":"${vars.version.number}","port":${vars.version.port}}`, "utf8", function terminal_build_version_stat_read_write(erw:Error) {
                                if (erw !== null) {
                                    library.error([erw.toString()]);
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

export default build;