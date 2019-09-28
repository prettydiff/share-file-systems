
import error from "./error.js";
import humanTime from "./humanTime.js";
import log from "./log.js";
import remove from "./remove.js";
import vars from "./vars.js";
import simulations from "../../test/simulations.js";

// simulates running the various commands of this services.ts file
const library = {
        error: error,
        humanTime: humanTime,
        log: log,
        remove: remove
    },
    simulation = function terminal_simulation(callback:Function):void {
        const tests:simulationItem[] = simulations,
            len:number = tests.length,
            increment = function terminal_simulation_increment(irr:string):void {
                const interval = function terminal_simulation_increment_interval():void {
                    a = a + 1;
                    if (a < len) {
                        wrapper();
                    } else {
                        library.log([""]);
                        if (callback === undefined) {
                            library.log([`${vars.text.green}Successfully completed all ${vars.text.cyan + vars.text.bold + len + vars.text.none + vars.text.green} simulation tests.${vars.text.none}`]);
                        } else {
                            callback(`${vars.text.green}Successfully completed all ${vars.text.cyan + vars.text.bold + len + vars.text.none + vars.text.green} simulation tests.${vars.text.none}`);
                        }
                    }
                };
                if (irr !== "") {
                    library.log([`${library.humanTime(false) + vars.text.underline}Test ${a + 1} ignored (${vars.text.angry + irr + vars.text.none + vars.text.underline}):${vars.text.none} ${tests[a].command}`]);
                } else {
                    library.log([`${library.humanTime(false) + vars.text.green}Passed simulation ${a + 1}: ${vars.text.none + tests[a].command}`]);
                }
                if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                    interval();
                } else {
                    library.remove(tests[a].artifact, function terminal_simulation_wrapper_remove():void {
                        interval();
                    });
                }
            },
            error = function terminal_simulation_error(message:string, stdout:string) {
                library.error([
                    `Simulation test string ${vars.text.angry + tests[a].command + vars.text.none} ${message}:`,
                    tests[a].test,
                    "",
                    "",
                    `${vars.text.green}Actual output:${vars.text.none}`,
                    stdout
                ]);
            },
            wrapper = function terminal_simulation_wrapper():void {
                vars.node.child(`${vars.version.command} ${tests[a].command}`, {cwd: vars.cwd, maxBuffer: 2048 * 500}, function terminal_simulation_wrapper_child(errs:nodeError, stdout:string, stdError:string|Buffer) {
                    tests[a].test = tests[a].test.replace("version[command]", vars.version.command).replace("version[name]", vars.version.name);
                    if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                        vars.flags.write = "";
                    } else {
                        tests[a].artifact = vars.node.path.resolve(tests[a].artifact);
                        vars.flags.write = tests[a].artifact;
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
                            library.error([errs.toString()]);
                            return;
                        }
                    }
                    if (stdError.toString() !== "" && stdError.toString().indexOf("The ESM module loader is experimental.") < 0) {
                        library.error([stdError.toString()]);
                        return;
                    }
                    if (typeof stdout === "string") {
                        stdout = stdout.replace(/\s+$/, "").replace(/^\s+/, "").replace(/\u0020-?\d+(\.\d+)*\s/g, " XXXX ").replace(/\\n-?\d+(\.\d+)*\s/g, "\\nXXXX ");
                    }
                    if (tests[a].qualifier.indexOf("file") === 0) {
                        if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                            library.error([`Tests ${vars.text.cyan + tests[a].command + vars.text.none} uses ${vars.text.angry + tests[a].qualifier + vars.text.none} as a qualifier but does not mention an artifact to remove.`]);
                            return;
                        }
                        if (tests[a].qualifier.indexOf("file ") === 0) {
                            tests[a].file = vars.node.path.resolve(tests[a].file);
                            vars.node.fs.readFile(tests[a].file, "utf8", function terminal_simulation_wrapper_file(err:Error, dump:string) {
                                if (err !== null) {
                                    library.error([err.toString()]);
                                    return;
                                }
                                if (tests[a].qualifier === "file begins" && dump.indexOf(tests[a].test) !== 0) {
                                    error(`is not starting in file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                    return;
                                }
                                if (tests[a].qualifier === "file contains" && dump.indexOf(tests[a].test) < 0) {
                                    error(`is not anywhere in file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                    return;
                                }
                                if (tests[a].qualifier === "file ends" && dump.indexOf(tests[a].test) === dump.length - tests[a].test.length) {
                                    error(`is not at end of file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                    return;
                                }
                                if (tests[a].qualifier === "file is" && dump !== tests[a].test) {
                                    error(`does not match the file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                    return;
                                }
                                if (tests[a].qualifier === "file not" && dump === tests[a].test) {
                                    error(`matches this file, but shouldn't: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                    return;
                                }
                                if (tests[a].qualifier === "file not contains" && dump.indexOf(tests[a].test) > -1) {
                                    error(`is contained in this file, but shouldn't be: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                    return;
                                }
                                increment("");
                            });
                        } else if (tests[a].qualifier.indexOf("filesystem ") === 0) {
                            tests[a].test = vars.node.path.resolve(tests[a].test);
                            vars.node.fs.stat(tests[a].test, function terminal_simulation_wrapper_filesystem(ers:Error) {
                                if (ers !== null) {
                                    if (tests[a].qualifier === "filesystem contains" && ers.toString().indexOf("ENOENT") > -1) {
                                        library.error([
                                            `Simulation test string ${vars.text.angry + tests[a].command + vars.text.none} does not see this address in the local file system:`,
                                            vars.text.cyan + tests[a].test + vars.text.none
                                        ]);
                                        return;
                                    }
                                    library.error([ers.toString()]);
                                    return;
                                }
                                if (tests[a].qualifier === "filesystem not contains") {
                                    library.error([
                                        `Simulation test string ${vars.text.angry + tests[a].command + vars.text.none} sees the following address in the local file system, but shouldn't:`,
                                        vars.text.cyan + tests[a].test + vars.text.none
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
        if (vars.command === "simulation") {
            callback = function terminal_lint_callback(message:string):void {
                vars.verbose = true;
                library.log([message, "\u0007"], true); // bell sound
            };
            library.log([`${vars.text.underline + vars.text.bold + vars.version.name} - simulation tests${vars.text.none}`, ""]);
        }
        wrapper();
    };

export default simulation;