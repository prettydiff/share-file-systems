
/* lib/terminal/test/application/evaluation - Evaluate a given test item and report appropriate failure messaging. */

import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import remove from "../../commands/remove.js";
import vars from "../../utilities/vars.js";

import service from "../samples/service.js";
import simulation from "../samples/simulation.js";

import testComplete from "./complete.js";

const testEvaluation = function test_testEvaluation(output:testEvaluation):void {
    const serviceItem:testItem|testServiceInstance = (output.testType === "service")
            ? <testServiceInstance>output.test
            : null,
        command:string = (output.testType === "service")
            ? JSON.stringify(serviceItem.command)
            : <string>output.test.command,
        test:string = (typeof output.test.test === "string")
            ? <string>output.test.test
            : JSON.stringify(serviceItem.test),
        name:string = (output.testType === "service")
            ? serviceItem.name
            : command,
        list:testTypeCollection = {
            service: service,
            simulation: simulation
        },
        increment = function test_testEvaluation_increment(messages:[string, string, string[]]):void {
            const command:string = (typeof output.test.command === "string")
                    ? <string>output.test.command
                    : JSON.stringify(output.test.command),
                serviceItem:testServiceInstance = (output.testType === "service")
                    ? <testServiceInstance>output.test
                    : null,
                name = (output.testType === "service")
                    ? serviceItem.name
                    : command,
                interval = function test_testEvaluation_increment_interval():void {
                    const total:number = (output.list.length < 1)
                        ? list[output.testType].length
                        : output.list.length;
                    output.index = output.index + 1;
                    if (output.index < total) {
                        list[output.testType].execute({
                            complete: output.callback,
                            fail: output.fail,
                            index: output.index,
                            list: output.list
                        });
                    } else {
                        const complete:testComplete = {
                            callback: function test_testEvaluation_increment_interval_callback(message:string, failCount:number):void {
                                output.callback(message, failCount);
                            },
                            fail: output.fail,
                            testType: output.testType,
                            total: total
                        };
                        if (output.testType === "service") {
                            list.service.killServers(complete);
                        } else {
                            testComplete(complete);
                        }
                    }
                },
                testMessage = function test_testEvaluation_increment_message():void {
                    if (messages[0] === "") {
                        log([`${humanTime(false) + vars.text.green}Passed ${output.testType} ${output.index + 1}: ${vars.text.none + name}`]);
                    } else if (messages[0].indexOf("fail - ") === 0) {
                        output.fail = output.fail + 1;
                        log([`${humanTime(false) + vars.text.angry}Failed ${output.testType} ${output.index + 1}: ${vars.text.none + name} ${vars.text.angry + messages[0].replace("fail - ", "") + vars.text.none}`]);
                        if (messages[1] !== "") {
                            const test:string = (typeof output.test.test === "string")
                                ? <string>output.test.test
                                : JSON.stringify(output.test.test);
                            log([
                                `${vars.text.green}Expected output:${vars.text.none}`,
                                test,
                                "",
                                `${vars.text.angry}Actual output:${vars.text.none}`,
                                messages[1],
                                "",
                                ""
                            ]);
                        }
                    } else {
                        log([`${humanTime(false) + vars.text.underline}Test ${output.index + 1} ignored (${vars.text.angry + messages[0] + vars.text.none + vars.text.underline}):${vars.text.none} ${name}`]);
                    }
                    if (messages[2].length > 0) {
                        log(messages[2]);
                    }
                };
            testMessage();
            if (output.test.artifact === "" || output.test.artifact === undefined) {
                interval();
            } else {
                remove(output.test.artifact, function test_testListRunner_increment_remove():void {
                    interval();
                });
            }
        },
        capital:string = output.testType.charAt(0).toUpperCase() + output.testType.slice(1),
        logString:string = `${vars.text.cyan}Log - ${vars.text.none}`,
        testLog:string[] = (vars.testLogFlag === "service")
            ? (function test_testEvaluation_logService():string[] {
                const store:string[] = vars.testLogStore;
                vars.testLogStore = [];
                return store;
            }())
            : (vars.testLogFlag === "simulation" && output.values[0].indexOf(logString) > -1)
                ? (function test_testEvaluation_logSimulation():string[] {
                    const endIndex:number = output.values[0].lastIndexOf(logString),
                        str:string = output.values[0].slice(endIndex),
                        strIndex:number = str.indexOf("\n"),
                        total:number = endIndex + strIndex,
                        log:string = output.values[0].slice(0, total).replace(logString, ""),
                        logs:string[] = log.split(`\n${logString}`);
                    output.values[0] = output.values[0].slice(total + 1);
                    return logs;
                }())
                : [];
    if (output.test.artifact === "" || output.test.artifact === undefined) {
        vars.flags.write = "";
    } else {
        output.test.artifact = vars.node.path.resolve(output.test.artifact);
        vars.flags.write = output.test.artifact;
    }
    if (output.values[1] !== "") {
        //cspell:disable
        if (output.values[1].toString().indexOf("getaddrinfo ENOTFOUND") > -1) {
        //cspell:enable
            increment(["no internet connection", "", []]);
            return;
        }
        if (output.values[1].toString().indexOf("certificate has expired") > -1) {
            increment(["TLS certificate expired on HTTPS request", "", []]);
            return;
        }
        if (output.values[0] === "") {
            error([output.values[1].toString()]);
            return;
        }
    }
    if (output.values[2].toString() !== "" && output.values[2].toString().indexOf("The ESM module loader is experimental.") < 0) {
        increment([`fail - ${output.values[2].toString()}`, "", testLog]);
        return;
    }
    if (typeof output.values[0] === "string") {
        // clip trailing space
        output.values[0] = output.values[0].replace(/\s+$/, "");
        // clip starting space
        output.values[0] = output.values[0].replace(/^\s+/, "");
        // replace numbers preceding a capital B
        output.values[0] = output.values[0].replace(/ \d+B/g, " XXXX");
        // replace numbers following a space
        output.values[0] = output.values[0].replace(/\u0020-?\d+(\.\d+)*(\s|\.)/g, " XXXX ");
        // replace numbers following a newline character
        output.values[0] = output.values[0].replace(/\\n-?\d+(\.\d+)*\s/g, "\\nXXXX ");
        // replace numbers following a parenthesis
        output.values[0] = output.values[0].replace(/\(\d+ /g, "(XXXX ");
        if (output.testType === "service") {
            // replace port numbers in the stored test
            output.values[0] = output.values[0].replace(/"port":\d+,/g, "\"port\":0,");
            // replace port numbers in the standard output
            output.values[0] = output.values[0].replace(/\\"port\\":\d+,/g, "\\\"port\\\":0,");
            // replace wildcard IPv6 address
            output.values[0] = output.values[0].replace(/\s::(\s|\.)/g, " XXXX ");
            // replace IPv6 addresses framed in square braces
            output.values[0] = output.values[0].replace(/\[::1\](:\d+)?(\.|\s)/g, "XXXX ");
        }
    }
    if (output.test.qualifier.indexOf("file") === 0) {
        if (output.test.artifact === "" || output.test.artifact === undefined) {
            error([`Tests ${vars.text.cyan + name + vars.text.none} uses ${vars.text.angry + output.test.qualifier + vars.text.none} as a qualifier but does not mention an artifact to remove.`]);
            return;
        }
        if (output.test.qualifier.indexOf("file ") === 0) {
            output.test.file = vars.node.path.resolve(output.test.file);
            vars.node.fs.readFile(output.test.file, "utf8", function test_testEvaluation_file(err:Error, dump:string) {
                if (err !== null) {
                    increment([`fail - ${err}`, "", testLog]);
                    return;
                }
                if (output.test.qualifier === "file begins" && dump.indexOf(test) !== 0) {
                    increment([`fail - is not starting in file: ${vars.text.green + output.test.file + vars.text.none}`, dump, testLog]);
                    return;
                }
                if (output.test.qualifier === "file contains" && dump.indexOf(test) < 0) {
                    increment([`fail - is not anywhere in file: ${vars.text.green + output.test.file + vars.text.none}`, dump, testLog]);
                    return;
                }
                if (output.test.qualifier === "file ends" && dump.indexOf(test) === dump.length - test.length) {
                    increment([`fail - is not at end of file: ${vars.text.green + output.test.file + vars.text.none}`, dump, testLog]);
                    return;
                }
                if (output.test.qualifier === "file is" && dump !== test) {
                    increment([`fail - does not match the file: ${vars.text.green + output.test.file + vars.text.none}`, dump, testLog]);
                    return;
                }
                if (output.test.qualifier === "file not" && dump === test) {
                    increment([`fail - matches this file, but shouldn't: ${vars.text.green + output.test.file + vars.text.none}`, dump, testLog]);
                    return;
                }
                if (output.test.qualifier === "file not contains" && dump.indexOf(test) > -1) {
                    increment([`fail - is contained in this file, but shouldn't be: ${vars.text.green + output.test.file + vars.text.none}`, dump, testLog]);
                    return;
                }
                increment(["", "", testLog]);
            });
        } else if (output.test.qualifier.indexOf("filesystem ") === 0) {
            output.test.test = vars.node.path.resolve(test);
            vars.node.fs.stat(test, function test_testEvaluation_filesystem(ers:Error) {
                if (ers !== null) {
                    if (output.test.qualifier === "filesystem contains" && ers.toString().indexOf("ENOENT") > -1) {
                        increment([`fail - ${capital} test ${vars.text.angry + name + vars.text.none} does not see this address in the local file system: ${vars.text.cyan + output.test.test + vars.text.none}`, "", testLog]);
                        return;
                    }
                    increment([`fail - ${ers}`, "", testLog]);
                    return;
                }
                if (output.test.qualifier === "filesystem not contains") {
                    increment([`${capital} test ${vars.text.angry + name + vars.text.none} sees the following address in the local file system, but shouldn't: ${vars.text.cyan + output.test.test + vars.text.none}`, "", testLog]);
                    return;
                }
                increment(["", "", testLog]);
            });
        }
    } else {
        if (output.test.qualifier === "begins" && (typeof output.values[0] !== "string" || output.values[0].indexOf(test) !== 0)) {
            increment(["fail - does not begin with the expected output", output.values[0], testLog]);
            return;
        }
        if (output.test.qualifier === "contains" && (typeof output.values[0] !== "string" || output.values[0].indexOf(test) < 0)) {
            increment(["fail - does not contain the expected output", output.values[0], testLog]);
            return;
        }
        if (output.test.qualifier === "ends" && (typeof output.values[0] !== "string" || output.values[0].indexOf(test) !== output.values[0].length - test.length)) {
            increment(["fail - does not end with the expected output", output.values[0], testLog]);
            return;
        }
        if (output.test.qualifier === "is" && output.values[0] !== test) {
            increment(["fail - does not match the expected output", output.values[0], testLog]);
            return;
        }
        if (output.test.qualifier === "not" && output.values[0] === test) {
            increment(["fail - must not be this output", output.values[0], testLog]);
            return;
        }
        if (output.test.qualifier === "not contains" && (typeof output.values[0] !== "string" || output.values[0].indexOf(test) > -1)) {
            increment(["fail - must not contain this output", output.values[0], testLog]);
            return;
        }
        increment(["", "", testLog]);
    }
};

export default testEvaluation;