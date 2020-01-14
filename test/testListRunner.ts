
import * as net from "net";
import * as http from "http";

import error from "../lib/terminal/error.js";
import humanTime from "../lib/terminal/humanTime.js";
import log from "../lib/terminal/log.js";
import remove from "../lib/terminal/remove.js";
import server from "../lib/terminal/server.js";
import vars from "../lib/terminal/vars.js";
import service from "./service.js";
import simulation from "./simulation.js";

// runs various tests of different types
const library = {
        error: error,
        humanTime: humanTime,
        log: log,
        remove: remove,
        server: server
    },
    list = {
        service: service,
        simulation: simulation
    },
    testListRunner = function terminal_testListRunner(testListType:testListType, callback:Function):void {
        const tests:testItem[] = list[testListType],
            capital:string = testListType.charAt(0).toUpperCase() + testListType.slice(1),
            server:net.Server = (testListType === "service")
                ? library.server({
                    ip: "::1",
                    port: 80,
                    silent: true
                })
                : null,
            evaluation = function terminal_testListRunner_evaluation(stdout:string, errs?:nodeError, stdError?:string|Buffer):void {
                const command:string = (typeof tests[a].command === "string")
                        ? <string>tests[a].command
                        : JSON.stringify(tests[a].command),
                    test:string = (typeof tests[a].test === "string")
                        ? <string>tests[a].test
                        : JSON.stringify(tests[a].test),
                    name:string = (tests[a].name === undefined)
                        ? command
                        : tests[a].name;
                if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                    vars.flags.write = "";
                } else {
                    tests[a].artifact = vars.node.path.resolve(tests[a].artifact);
                    vars.flags.write = tests[a].artifact;
                }
                if (errs !== null && errs !== undefined) {
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
                if (stdError !== undefined && stdError.toString() !== "" && stdError.toString().indexOf("The ESM module loader is experimental.") < 0) {
                    library.error([stdError.toString()]);
                    return;
                }
                if (typeof stdout === "string") {
                    stdout = stdout.replace(/\s+$/, "").replace(/^\s+/, "").replace(/\u0020-?\d+(\.\d+)*\s/g, " XXXX ").replace(/\\n-?\d+(\.\d+)*\s/g, "\\nXXXX ");
                }
                if (tests[a].qualifier.indexOf("file") === 0) {
                    if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                        library.error([`Tests ${vars.text.cyan + name + vars.text.none} uses ${vars.text.angry + tests[a].qualifier + vars.text.none} as a qualifier but does not mention an artifact to remove.`]);
                        return;
                    }
                    if (tests[a].qualifier.indexOf("file ") === 0) {
                        tests[a].file = vars.node.path.resolve(tests[a].file);
                        vars.node.fs.readFile(tests[a].file, "utf8", function terminal_testListRun_simulation_file(err:Error, dump:string) {
                            if (err !== null) {
                                library.error([err.toString()]);
                                return;
                            }
                            if (tests[a].qualifier === "file begins" && dump.indexOf(test) !== 0) {
                                error(`is not starting in file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file contains" && dump.indexOf(test) < 0) {
                                error(`is not anywhere in file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file ends" && dump.indexOf(test) === dump.length - test.length) {
                                error(`is not at end of file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file is" && dump !== test) {
                                error(`does not match the file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file not" && dump === test) {
                                error(`matches this file, but shouldn't: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file not contains" && dump.indexOf(test) > -1) {
                                error(`is contained in this file, but shouldn't be: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            increment("");
                        });
                    } else if (tests[a].qualifier.indexOf("filesystem ") === 0) {
                        tests[a].test = vars.node.path.resolve(test);
                        vars.node.fs.stat(test, function terminal_testListRunner_simulation_filesystem(ers:Error) {
                            if (ers !== null) {
                                if (tests[a].qualifier === "filesystem contains" && ers.toString().indexOf("ENOENT") > -1) {
                                    library.error([
                                        `${capital} test ${vars.text.angry + name + vars.text.none} does not see this address in the local file system:`,
                                        vars.text.cyan + tests[a].test + vars.text.none
                                    ]);
                                    return;
                                }
                                library.error([ers.toString()]);
                                return;
                            }
                            if (tests[a].qualifier === "filesystem not contains") {
                                library.error([
                                    `${capital} test ${vars.text.angry + name + vars.text.none} sees the following address in the local file system, but shouldn't:`,
                                    vars.text.cyan + tests[a].test + vars.text.none
                                ]);
                                return;
                            }
                            increment("");
                        });
                    }
                } else {
                    if (tests[a].qualifier === "begins" && (typeof stdout !== "string" || stdout.indexOf(test) !== 0)) {
                        error("does not begin with the expected output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "contains" && (typeof stdout !== "string" || stdout.indexOf(test) < 0)) {
                        error("does not contain the expected output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "ends" && (typeof stdout !== "string" || stdout.indexOf(test) !== stdout.length - test.length)) {
                        error("does not end with the expected output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "is" && stdout !== test) {
                        error("does not match the expected output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "not" && stdout === test) {
                        error("must not be this output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "not contains" && (typeof stdout !== "string" || stdout.indexOf(test) > -1)) {
                        error("must not contain this output", stdout)
                        return;
                    }
                    increment("");
                }
            },
            execution:methodList = {
                service: function terminal_testListRunner_service():void {
                    const command:string = (typeof tests[a].command === "string")
                            ? <string>tests[a].command
                            : JSON.stringify(tests[a].command),
                        name:string = (tests[a].name === undefined)
                            ? command
                            : tests[a].name,
                        request:http.ClientRequest = http.request({
                            headers: {
                                "content-type": "application/x-www-form-urlencoded",
                                "content-length": Buffer.byteLength(command),
                                "user-name": "localhost",
                                "remote-user": "remoteUser"
                            },
                            host: "::1",
                            method: "POST",
                            path: "/",
                            port: 80,
                            timeout: 1000
                        }, function terminal_testListRunner_service_callback(response:http.IncomingMessage):void {
                            const chunks:string[] = [];
                            response.on("data", function terminal_testListRunner_service_callback_data(chunk:string):void {
                                chunks.push(chunk);
                            });
                            response.on("end", function terminal_testListRunner_service_callback_end():void {
                                evaluation(chunks.join(""));
                            });
                        });
                    request.on("error", function terminal_testListRunner_service_error(reqError:nodeError):void {
                        error(`Failed to execute on service test: ${name}`, reqError.toString());
                    });
                    request.write(command);
                    setTimeout(function terminal_testListRunner_service_callback_delay():void {
                        request.end();
                    }, 100);
                },
                simulation: function terminal_testListRunner_simulation():void {
                    vars.node.child(`${vars.version.command} ${tests[a].command}`, {cwd: vars.cwd, maxBuffer: 2048 * 500}, function terminal_testListRunner_simulation_child(errs:nodeError, stdout:string, stdError:string|Buffer) {
                        const test:string = (typeof tests[a].test === "string")
                            ? <string>tests[a].test
                            : JSON.stringify(tests[a].test);
                        tests[a].test = test.replace("version[command]", vars.version.command).replace("version[name]", vars.version.name);
                        evaluation(stdout, errs, stdError);
                    });
                }
            },
            len:number = tests.length,
            increment = function terminal_testListRunner_increment(irr:string):void {
                const command:string = (typeof tests[a].command === "string")
                        ? <string>tests[a].command
                        : JSON.stringify(tests[a].command),
                    name = (tests[a].name === undefined)
                        ? command
                        : tests[a].name,
                    interval = function terminal_testListRunner_increment_interval():void {
                        a = a + 1;
                        if (a < len) {
                            execution[testListType]();
                        } else {
                            if (testListType === "service") {
                                server.close();
                            }
                            library.log([""]);
                            callback(`${vars.text.green}Successfully completed all ${vars.text.cyan + vars.text.bold + len + vars.text.none + vars.text.green} ${testListType} tests.${vars.text.none}`);
                        }
                    };
                if (irr === "") {
                    library.log([`${library.humanTime(false) + vars.text.green}Passed ${testListType} ${a + 1}: ${vars.text.none + name}`]);
                } else {
                    library.log([`${library.humanTime(false) + vars.text.underline}Test ${a + 1} ignored (${vars.text.angry + irr + vars.text.none + vars.text.underline}):${vars.text.none} ${name}`]);
                }
                if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                    interval();
                } else {
                    library.remove(tests[a].artifact, function terminal_testListRunner_increment_remove():void {
                        interval();
                    });
                }
            },
            error = function terminal_testListRunner_error(message:string, stdout:string) {
                const command:string = (typeof tests[a].command === "string")
                        ? <string>tests[a].command
                        : JSON.stringify(tests[a].command),
                    name = (tests[a].name === undefined)
                        ? command
                        : tests[a].name,
                    test:string = (typeof tests[a].test === "string")
                        ? <string>tests[a].test
                        : JSON.stringify(tests[a].test);
                library.error([
                    `${capital} test ${vars.text.angry + name + vars.text.none} ${message}:`,
                    test,
                    "",
                    "",
                    `${vars.text.green}Actual output:${vars.text.none}`,
                    stdout
                ]);
            };

        let a:number = 0;
        if (vars.command === testListType) {
            callback = function terminal_lint_callback(message:string):void {
                vars.verbose = true;
                library.log([message, "\u0007"], true); // bell sound
            };
            library.log([`${vars.text.underline + vars.text.bold + vars.version.name} - ${testListType} tests${vars.text.none}`, ""]);
        }

        execution[testListType]();
    };

export default testListRunner;