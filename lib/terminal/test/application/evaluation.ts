
/* lib/terminal/test/application/evaluation - Evaluate a given test item and report appropriate failure messaging. */

import { readFile, stat } from "fs";
import { resolve } from "path";

import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import remove from "../../commands/library/remove.js";
import vars from "../../utilities/vars.js";

import service from "./service.js";
import simulation from "./simulation.js";
import testComplete from "./testComplete.js";

const testEvaluation = function terminal_test_application_testEvaluation(output:config_test_evaluation):void {
    const serviceItem:test_service = (output.testType === "service")
            ? output.test as test_service
            : null,
        command:string = (output.testType === "service")
            ? JSON.stringify(serviceItem.command)
            : output.test.command as string,
        test:string = (typeof output.test.test === "string")
            ? output.test.test as string
            : JSON.stringify(serviceItem.test),
        name:string = (output.testType === "service")
            ? serviceItem.name
            : command,
        list:test_typeCollection = {
            service: service,
            simulation: simulation
        },
        increment = function terminal_test_application_testEvaluation_increment(messages:[string, string]):void {
            const command:string = (typeof output.test.command === "string")
                    ? output.test.command as string
                    : JSON.stringify(output.test.command),
                serviceItem:test_service = (output.testType === "service")
                    ? output.test as test_service
                    : null,
                name:string = (output.testType === "service")
                    ? serviceItem.name
                    : command,
                interval = function terminal_test_application_testEvaluation_increment_interval():void {
                    const total:number = (output.list.length < 1)
                        ? list[output.testType].tests.length
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
                        const complete:test_complete = {
                            callback: function terminal_test_application_testEvaluation_increment_interval_callback(title:string, text:string[], fail:boolean):void {
                                output.callback(title, text, fail);
                            },
                            failures: output.fail,
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
                testMessage = function terminal_test_application_testEvaluation_increment_testMessage():void {
                    if (messages[0] === "") {
                        log([`${humanTime(false) + vars.text.green}Passed ${output.testType} ${output.index + 1}: ${vars.text.none + name}`]);
                    } else if (messages[0].indexOf("fail - ") === 0) {
                        output.fail = output.fail + 1;
                        log([`${humanTime(false) + vars.text.angry}Failed ${output.testType} ${output.index + 1}: ${vars.text.none + name} ${vars.text.angry + messages[0].replace("fail - ", "") + vars.text.none}`]);
                        if (messages[1] !== "") {
                            const test:string = (typeof output.test.test === "string")
                                    ? output.test.test as string
                                    : JSON.stringify(output.test.test),
                                difference:[string, number] = (function terminal_test_application_testEvaluation_increment_testMessage_difference():[string, number] {
                                    const end:number = Math.min(test.length, messages[1].length),
                                        diffs:[string, string] = ["", ""];
                                    let a:number = 0,
                                        location:number = 0,
                                        common:string = "";
                                    do {
                                        if (test.charAt(a) !== messages[1].charAt(a)) {
                                            diffs[0] = test.slice(a, a + 70);
                                            diffs[1] = messages[1].slice(a, a + 70);
                                            location = a;
                                            break;
                                        }
                                        a = a + 1;
                                    } while (a < end);
                                    if (diffs[0] === "") {
                                        return [diffs[1], end];
                                    }
                                    if (diffs[1] === "") {
                                        return [diffs[0], end];
                                    }
                                    a = 1;
                                    do {
                                        if (diffs[1].indexOf(diffs[0].slice(a)) > -1) {
                                            common = diffs[1].slice(diffs[1].slice(0, diffs[1].indexOf(diffs[0].slice(a))).length);
                                            return [messages[1].slice(location - 10, location) + vars.text.green + vars.text.bold + diffs[0].replace(common, "") + vars.text.none + vars.text.angry + diffs[1].replace(common, "") + vars.text.none + common, location];
                                        }
                                        if (diffs[0].indexOf(diffs[1].slice(a)) > -1) {
                                            common = diffs[0].slice(diffs[0].slice(0, diffs[0].indexOf(diffs[1].slice(a))).length);
                                            return [test.slice(location - 10, location) + vars.text.green + vars.text.bold + diffs[1].replace(common, "") + vars.text.none + vars.text.angry + diffs[0].replace(common, "") + vars.text.none + common, location];
                                        }
                                        a = a + 1;
                                    } while (a < 60);
                                    return ["", end];
                                }());
                            log([
                                `${vars.text.green}Expected output:${vars.text.none}`,
                                test,
                                "",
                                `${vars.text.angry}Actual output:${vars.text.none}`,
                                messages[1],
                                "",
                                `${vars.text.cyan + vars.text.bold}First difference at character ${difference[1]}:${vars.text.none}`,
                                difference[0],
                                ""
                            ]);
                        }
                    } else {
                        log([`${humanTime(false) + vars.text.underline}Test ${output.index + 1} ignored (${vars.text.angry + messages[0] + vars.text.none + vars.text.underline}):${vars.text.none} ${name}`]);
                    }
                };
            testMessage();
            if (typeof output.test.artifact === "string" && output.test.artifact.length > 0) {
                remove(output.test.artifact, [`${vars.path.project}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}storageTest${vars.path.sep}temp${vars.path.sep}temp.txt`], function terminal_test_application_testListRunner_increment_remove():void {
                    interval();
                });
            } else {
                interval();
            }
        },
        capital:string = common.capitalize(output.testType);
    if (typeof output.test.artifact === "string" && output.test.artifact.length > 0) {
        output.test.artifact = resolve(output.test.artifact);
        vars.test.flags.write = output.test.artifact;
    } else {
        vars.test.flags.write = "";
    }
    if (output.values[1] !== "") {
        //cspell:disable-next-line
        if (output.values[1].toString().indexOf("getaddrinfo ENOTFOUND") > -1) {
            increment(["no internet connection", ""]);
            return;
        }
        if (output.values[1].toString().indexOf("certificate has expired") > -1) {
            increment(["TLS certificate expired on HTTPS request", ""]);
            return;
        }
        if (output.values[0] === "") {
            error([output.values[1].toString()], null);
            return;
        }
    }
    if (output.values[2].toString() !== "") {
        increment([`fail - ${output.values[2].toString()}`, ""]);
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
            // replace full IPv6 addresses
            output.values[0] = output.values[0].replace(/[0-9a-f]{1,4}:+[0-9a-f]{1,4}/g, "XXXX").replace(/(XXXX)?::[0-9a-f]{1,4}/g, "XXXX").replace(/XXXX:XXXX/g, "XXXX").replace(/XXXX:XXXX/g, "XXXX");
            // replace full IPv4 addresses
            output.values[0] = output.values[0].replace(/(\d{1,3}\.){3}\d{1,3}/g, "XXXX");
            // replace list of addresses
            output.values[0] = output.values[0].replace(/\["XXXX"(,"XXXX")*\]/g, "[]");
            // replace address collections
            output.values[0] = output.values[0].replace(/"ipAll":\{"IPv(4|6)":\[\],"IPv(4|6)":\[\]\}/g, "\"ipAll\":null");
            // replace ipSelected
            output.values[0] = output.values[0].replace(/"ipSelected":\s*"XXXX"/g, "\"ipSelected\":\"\"");
        }
        //["2600:1700:70e1:14b0:cdd2:46fd:3c2c:b594","2600:1700:70e1:14b0:bdfb:ea9c:e507:f419","2600:1700:70e1:14b0:98e5:45dd:2f71:1abd","2600:1700:70e1:14b0:71f0:88ad:6694:3e7","2600:1700:70e1:14b0:71ec:fc6b:9a34:726c","2600:1700:70e1:14b0:34b7:b86a:c371:25bc","2600:1700:70e1:14b0:d74:63f4:6658:4ab1","2600:1700:70e1:14b0:2c15:4479:d2d0:dc2b","2600:1700:70e1:14b0::41"]
    }
    if (output.test.qualifier.indexOf("file") === 0) {
        if (output.test.qualifier.indexOf("file ") === 0) {
            output.test.file = resolve(output.test.file);
            readFile(output.test.file, "utf8", function terminal_test_application_testEvaluation_file(err:Error, dump:string) {
                if (err !== null) {
                    increment([`fail - ${err}`, ""]);
                    return;
                }
                if (output.test.qualifier === "file begins" && dump.indexOf(test) !== 0) {
                    increment([`fail - is not starting in file: ${vars.text.green + output.test.file + vars.text.none}`, dump]);
                    return;
                }
                if (output.test.qualifier === "file contains" && dump.indexOf(test) < 0) {
                    increment([`fail - is not anywhere in file: ${vars.text.green + output.test.file + vars.text.none}`, dump]);
                    return;
                }
                if (output.test.qualifier === "file ends" && dump.indexOf(test) === dump.length - test.length) {
                    increment([`fail - is not at end of file: ${vars.text.green + output.test.file + vars.text.none}`, dump]);
                    return;
                }
                if (output.test.qualifier === "file is" && dump !== test) {
                    increment([`fail - does not match the file: ${vars.text.green + output.test.file + vars.text.none}`, dump]);
                    return;
                }
                if (output.test.qualifier === "file not" && dump === test) {
                    increment([`fail - matches this file, but shouldn't: ${vars.text.green + output.test.file + vars.text.none}`, dump]);
                    return;
                }
                if (output.test.qualifier === "file not contains" && dump.indexOf(test) > -1) {
                    increment([`fail - is contained in this file, but shouldn't be: ${vars.text.green + output.test.file + vars.text.none}`, dump]);
                    return;
                }
                increment(["", ""]);
            });
        } else if (output.test.qualifier.indexOf("filesystem ") === 0) {
            output.test.test = resolve(test);
            stat(test, function terminal_test_application_testEvaluation_stat(ers:Error) {
                if (ers === null) {
                    if (output.test.qualifier === "filesystem not contains") {
                        increment([`fail - ${capital} test ${vars.text.angry + name + vars.text.none} sees the following address in the local file system, but shouldn't: ${vars.text.cyan + output.test.test + vars.text.none}`, ""]);
                        return;
                    }
                    increment(["", ""]);
                    return;
                }
                if (ers.toString().indexOf("ENOENT") > -1) {
                    if (output.test.qualifier === "filesystem contains") {
                        increment([`fail - ${capital} test ${vars.text.angry + name + vars.text.none} does not see this address in the local file system: ${vars.text.cyan + output.test.test + vars.text.none}`, ""]);
                        return;
                    }
                    if (output.test.qualifier === "filesystem not contains") {
                        increment(["", ""]);
                        return;
                    }
                }
                increment([`fail - ${ers}`, ""]);
            });
        }
    } else {
        if (output.test.qualifier === "begins" && (typeof output.values[0] !== "string" || output.values[0].indexOf(test) !== 0)) {
            increment(["fail - does not begin with the expected output", output.values[0]]);
            return;
        }
        if (output.test.qualifier === "contains" && (typeof output.values[0] !== "string" || output.values[0].indexOf(test) < 0)) {
            increment(["fail - does not contain the expected output", output.values[0]]);
            return;
        }
        if (output.test.qualifier === "ends" && (typeof output.values[0] !== "string" || output.values[0].indexOf(test) !== output.values[0].length - test.length)) {
            increment(["fail - does not end with the expected output", output.values[0]]);
            return;
        }
        if (output.test.qualifier === "is" && output.values[0] !== test) {
            increment(["fail - does not match the expected output", output.values[0]]);
            return;
        }
        if (output.test.qualifier === "not" && output.values[0] === test) {
            increment(["fail - must not be this output", output.values[0]]);
            return;
        }
        if (output.test.qualifier === "not contains" && (typeof output.values[0] !== "string" || output.values[0].indexOf(test) > -1)) {
            increment(["fail - must not contain this output", output.values[0]]);
            return;
        }
        increment(["", ""]);
    }
};

export default testEvaluation;