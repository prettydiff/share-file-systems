
/* lib/terminal/test/testListRunner - A test runner. */
import * as http from "http";

import error from "../utilities/error.js";
import humanTime from "../utilities/humanTime.js";
import log from "../utilities/log.js";
import remove from "../commands/remove.js";
import vars from "../utilities/vars.js";

import service from "./service.js";
import simulation from "./simulation.js";
import services from "./service.js";

import serverVars from "../server/serverVars.js";

// runs various tests of different types
const library = {
        error: error,
        humanTime: humanTime,
        log: log,
        remove: remove
    },
    list = {
        service: service,
        simulation: simulation
    },
    testListRunner = function test_testListRunner(testListType:testListType, callback:Function):void {
        const tests:testItem[]|testServiceArray = list[testListType],
            capital:string = testListType.charAt(0).toUpperCase() + testListType.slice(1),
            evaluation = function test_testListRunner_evaluation(stdout:string, errs?:nodeError, stdError?:string|Buffer):void {
                const serviceItem:testItem|testServiceInstance = (testListType === "service")
                        ? <testServiceInstance>tests[a]
                        : null,
                    command:string = (testListType === "service")
                        ? JSON.stringify(serviceItem.command)
                        : <string>tests[a].command,
                    test:string = (typeof tests[a].test === "string")
                        ? <string>tests[a].test
                        : JSON.stringify(serviceItem.test),
                    name:string = (testListType === "service")
                        ? serviceItem.name
                        : command;
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
                        increment("no internet connection", "");
                        return;
                    }
                    if (errs.toString().indexOf("certificate has expired") > -1) {
                        increment("TLS certificate expired on HTTPS request", "");
                        return;
                    }
                    if (stdout === "") {
                        library.error([errs.toString()]);
                        return;
                    }
                }
                if (stdError !== undefined && stdError.toString() !== "" && stdError.toString().indexOf("The ESM module loader is experimental.") < 0) {
                    increment(`fail - ${stdError.toString()}`, "");
                    return;
                }
                if (typeof stdout === "string") {
                    stdout = stdout.replace(/\s+$/, "").replace(/^\s+/, "").replace(/\u0020-?\d+(\.\d+)*\s/g, " XXXX ").replace(/\\n-?\d+(\.\d+)*\s/g, "\\nXXXX ").replace(/\(\d+ /g, "(XXXX ").replace(/ \d+B/g, " XXXX").replace(/\[::1\]:\d+/g, "[::1]:XXXX");
                }
                if (tests[a].qualifier.indexOf("file") === 0) {
                    if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                        library.error([`Tests ${vars.text.cyan + name + vars.text.none} uses ${vars.text.angry + tests[a].qualifier + vars.text.none} as a qualifier but does not mention an artifact to remove.`]);
                        return;
                    }
                    if (tests[a].qualifier.indexOf("file ") === 0) {
                        tests[a].file = vars.node.path.resolve(tests[a].file);
                        vars.node.fs.readFile(tests[a].file, "utf8", function test_testListRun_evaluation_file(err:Error, dump:string) {
                            if (err !== null) {
                                increment(`fail - ${err}`, "");
                                return;
                            }
                            if (tests[a].qualifier === "file begins" && dump.indexOf(test) !== 0) {
                                increment(`fail - is not starting in file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file contains" && dump.indexOf(test) < 0) {
                                increment(`fail - is not anywhere in file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file ends" && dump.indexOf(test) === dump.length - test.length) {
                                increment(`fail - is not at end of file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file is" && dump !== test) {
                                increment(`fail - does not match the file: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file not" && dump === test) {
                                increment(`fail - matches this file, but shouldn't: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            if (tests[a].qualifier === "file not contains" && dump.indexOf(test) > -1) {
                                increment(`fail - is contained in this file, but shouldn't be: ${vars.text.green + tests[a].file + vars.text.none}`, dump);
                                return;
                            }
                            increment("", "");
                        });
                    } else if (tests[a].qualifier.indexOf("filesystem ") === 0) {
                        tests[a].test = vars.node.path.resolve(test);
                        vars.node.fs.stat(test, function test_testListRunner_evaluation_filesystem(ers:Error) {
                            if (ers !== null) {
                                if (tests[a].qualifier === "filesystem contains" && ers.toString().indexOf("ENOENT") > -1) {
                                    increment(`fail - ${capital} test ${vars.text.angry + name + vars.text.none} does not see this address in the local file system: ${vars.text.cyan + tests[a].test + vars.text.none}`, "");
                                    return;
                                }
                                increment(`fail - ${ers}`, "");
                                return;
                            }
                            if (tests[a].qualifier === "filesystem not contains") {
                                increment(`${capital} test ${vars.text.angry + name + vars.text.none} sees the following address in the local file system, but shouldn't: ${vars.text.cyan + tests[a].test + vars.text.none}`, "");
                                return;
                            }
                            increment("", "");
                        });
                    }
                } else {
                    if (tests[a].qualifier === "begins" && (typeof stdout !== "string" || stdout.indexOf(test) !== 0)) {
                        increment("fail - does not begin with the expected output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "contains" && (typeof stdout !== "string" || stdout.indexOf(test) < 0)) {
                        increment("fail - does not contain the expected output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "ends" && (typeof stdout !== "string" || stdout.indexOf(test) !== stdout.length - test.length)) {
                        increment("fail - does not end with the expected output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "is" && stdout !== test) {
                        increment("fail - does not match the expected output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "not" && stdout === test) {
                        increment("fail - must not be this output", stdout);
                        return;
                    }
                    if (tests[a].qualifier === "not contains" && (typeof stdout !== "string" || stdout.indexOf(test) > -1)) {
                        increment("fail - must not contain this output", stdout)
                        return;
                    }
                    increment("", "");
                }
            },
            execution:methodList = {
                service: function test_testListRunner_service():void {
                    const testItem:testServiceInstance = <testServiceInstance>tests[a],
                        keyword:string = (function test_testListRunner_service_keyword():string {
                            const words:string[] = Object.keys(testItem.command);
                            return words[0];
                        }()),
                        agent:string = testItem.command[keyword].agent,
                        command:string = (function test_testListRunner_service_command():string {
                            if (testItem.command[keyword].agent !== undefined) {
                                if (agent === serverVars.deviceHash) {
                                    testItem.command[keyword].agent = serverVars.deviceHash;
                                } else {
                                    testItem.command[keyword].agent = `${testItem.command[keyword].agent}@[::1]:${services.serverRemote.port}`;
                                }
                            }
                            if ((testItem.command[keyword].copyAgent !== undefined || testItem.command["fs-update-remote"] !== undefined) && testItem.command[keyword].copyAgent !== "" && testItem.command[keyword].copyAgent !== serverVars.deviceHash) {
                                testItem.command[keyword].copyAgent = `${testItem.command[keyword].copyAgent}@[::1]:${services.serverRemote.port}`;
                            }
                            if (keyword === "invite") {
                                if (testItem.command.invite.action === "invite" || testItem.command.invite.action === "invite-response") {
                                    testItem.command.invite.port = services.serverRemote.port;
                                } else {
                                    testItem.command.invite.port = services.serverLocal.port;
                                }
                            }
                            return JSON.stringify(testItem.command).replace(/remoteUser":/g, `remoteUser@[::1]:${services.serverRemote.port}":`);
                        }()),
                        name:string = (testItem.name === undefined)
                            ? command
                            : testItem.name,
                        header:http.OutgoingHttpHeaders = (agent === serverVars.deviceHash || agent === undefined)
                            ? {
                                "content-type": "application/x-www-form-urlencoded",
                                "content-length": Buffer.byteLength(command),
                                "agent-name": "localUser",
                                "agent-type": "device",
                                "remote-user": (testItem.command[keyword].copyAgent !== undefined && testItem.command[keyword].copyAgent !== "" && testItem.command[keyword].copyAgent !== serverVars.deviceHash)
                                    ? testItem.command[keyword].copyAgent
                                    : "localUser"
                            }
                            : {
                                "content-type": "application/x-www-form-urlencoded",
                                "content-length": Buffer.byteLength(command),
                                "agent-name": testItem.command[keyword].agent,
                                "agent-type": "user",
                                "remote-user": "localUser"
                            },
                        payload:http.RequestOptions = {
                            headers: header,
                            host: "::1",
                            method: "POST",
                            path: "/",
                            port: (testItem.command.agent === serverVars.deviceHash)
                                ? services.serverLocal.port
                                : services.serverRemote.port,
                            timeout: 1000
                        },
                        callback = function test_testListRunner_service_callback(response:http.IncomingMessage):void {
                            const chunks:string[] = [];
                            response.on("data", function test_testListRunner_service_callback_data(chunk:string):void {
                                chunks.push(chunk);
                            });
                            response.on("end", function test_testListRunner_service_callback_end():void {
                                evaluation(chunks.join(""));
                            });
                        },
                        request:http.ClientRequest = http.request(payload, callback);
                    request.on("error", function test_testListRunner_service_error(reqError:nodeError):void {
                        increment(`fail - Failed to execute on service test: ${name}`, reqError.toString());
                    });
                    request.write(command);
                    setTimeout(function test_testListRunner_service_callback_delay():void {
                        request.end();
                    }, 100);
                },
                simulation: function test_testListRunner_simulation():void {
                    vars.node.child(`${vars.version.command} ${tests[a].command}`, {cwd: vars.cwd, maxBuffer: 2048 * 500}, function test_testListRunner_simulation_child(errs:nodeError, stdout:string, stdError:string|Buffer) {
                        const test:string = (typeof tests[a].test === "string")
                            ? <string>tests[a].test
                            : JSON.stringify(tests[a].test);
                        tests[a].test = test.replace("version[command]", vars.version.command).replace("version[name]", vars.version.name);
                        evaluation(stdout, errs, stdError);
                    });
                }
            },
            len:number = tests.length,
            increment = function test_testListRunner_increment(irr:string, failOutput:string):void {
                const command:string = (typeof tests[a].command === "string")
                        ? <string>tests[a].command
                        : JSON.stringify(tests[a].command),
                    serviceItem:testServiceInstance = (testListType === "service")
                        ? <testServiceInstance>tests[a]
                        : null,
                    name = (testListType === "service")
                        ? serviceItem.name
                        : command,
                    interval = function test_testListRunner_increment_interval():void {
                        a = a + 1;
                        if (a < len) {
                            execution[testListType]();
                        } else {
                            if (testListType === "service") {
                                const services:testServiceArray = <testServiceArray>tests;
                                services.serverLocal.close();
                                services.serverRemote.close();
                            }
                            library.log(["", ""]);
                            if (fail > 0) {
                                const plural:string = (fail === 1)
                                    ? ""
                                    : "s";
                                callback(`${vars.text.angry}Failed ${fail} ${testListType + vars.text.none} test${plural} out of ${len} total tests.`, fail);
                            } else {
                                callback(`${vars.text.green}Successfully completed all ${vars.text.cyan + vars.text.bold + len + vars.text.none + vars.text.green} ${testListType} tests.${vars.text.none}`, 0);
                            }
                        }
                    };
                if (irr === "") {
                    library.log([`${library.humanTime(false) + vars.text.green}Passed ${testListType} ${a + 1}: ${vars.text.none + name}`]);
                } else if (irr.indexOf("fail - ") === 0) {
                    fail = fail + 1;
                    library.log([`${library.humanTime(false) + vars.text.angry}Fail ${testListType} ${a + 1}: ${vars.text.none + name} ${vars.text.angry + irr.replace("fail - ", "") + vars.text.none}`]);
                    if (failOutput !== "") {
                        const test:string = (typeof tests[a].test === "string")
                            ? <string>tests[a].test
                            : JSON.stringify(tests[a].test);
                        library.log([
                            `${vars.text.green}Expected output:${vars.text.none}`,
                            test,
                            "",
                            `${vars.text.angry}Actual output:${vars.text.none}`,
                            failOutput,
                            "",
                            ""
                        ]);
                    }
                } else {
                    library.log([`${library.humanTime(false) + vars.text.underline}Test ${a + 1} ignored (${vars.text.angry + irr + vars.text.none + vars.text.underline}):${vars.text.none} ${name}`]);
                }
                if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                    interval();
                } else {
                    library.remove(tests[a].artifact, function test_testListRunner_increment_remove():void {
                        interval();
                    });
                }
            };

        let a:number = 0,
            fail:number = 0;

        if (vars.command === testListType) {
            callback = function test_lint_callback(message:string):void {
                vars.verbose = true;
                library.log([message, "\u0007"], true); // bell sound
            };
            library.log([`${vars.text.underline + vars.text.bold + vars.version.name} - ${testListType} tests${vars.text.none}`, ""]);
        }

        vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}settings.json`, "utf8", function terminal_server_start_listen_readUsers_readSettings(ers:nodeError, settingString:string):void {
            if (ers !== null) {
                if (ers.code !== "ENOENT") {
                    library.log([ers.toString()]);
                }
            } else {
                const settings:ui_data = JSON.parse(settingString);
                serverVars.brotli = settings.brotli;
                serverVars.deviceHash = settings.deviceHash;
                serverVars.hash = settings.hash;
                serverVars.name = settings.nameUser;
            }
            if (serverVars.deviceHash === "") {
                vars.node.fs.readFile();
                callback([
                    `${vars.text.angry}This device does not yet have an identified device hash.${vars.text.none}`,
                    `${vars.text.underline}To create a device hash execute the application one time with these steps:${vars.text.none}`,
                    "1. On the terminal execute the command: `node js/application server`",
                    "2. Open a web browser to address `localhost`.",
                    "3. Fill out the initial form data for user name and device name."
                ].join(vars.node.os.EOL));
                return;
            }
    
            if (testListType === "service") {
                const service:testServiceArray = <testServiceArray>tests;
                service.addServers(function test_testListRunner_serviceCallback():void {
                    execution.service();
                });
            } else {
                execution[testListType]();
            }
        });
    };

export default testListRunner;