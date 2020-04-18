
/* lib/terminal/test/test_evaluation - Evaluate tests. */

import error from "../utilities/error.js";
import vars from "../utilities/vars.js";

const testEvaluation = function test_testEvaluation(output:testEvaluation, increment:Function):void {
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
        capital:string = output.testType.charAt(0).toUpperCase() + output.testType.slice(1);
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
            increment(["no internet connection", ""]);
            return;
        }
        if (output.values[1].toString().indexOf("certificate has expired") > -1) {
            increment(["TLS certificate expired on HTTPS request", ""]);
            return;
        }
        if (output.values[0] === "") {
            error([output.values[1].toString()]);
            return;
        }
    }
    if (output.values[2].toString() !== "" && output.values[2].toString().indexOf("The ESM module loader is experimental.") < 0) {
        increment([`fail - ${output.values[2].toString()}`, ""]);
        return;
    }
    if (typeof output.values[0] === "string") {
        output.values[0] = output.values[0].replace(/\s+$/, "").replace(/^\s+/, "").replace(/\u0020-?\d+(\.\d+)*\s/g, " XXXX ").replace(/\\n-?\d+(\.\d+)*\s/g, "\\nXXXX ").replace(/\(\d+ /g, "(XXXX ").replace(/ \d+B/g, " XXXX").replace(/\[::1\]:\d+/g, "[::1]:XXXX");
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
            output.test.test = vars.node.path.resolve(test);
            vars.node.fs.stat(test, function test_testEvaluation_filesystem(ers:Error) {
                if (ers !== null) {
                    if (output.test.qualifier === "filesystem contains" && ers.toString().indexOf("ENOENT") > -1) {
                        increment([`fail - ${capital} test ${vars.text.angry + name + vars.text.none} does not see this address in the local file system: ${vars.text.cyan + output.test.test + vars.text.none}`, ""]);
                        return;
                    }
                    increment([`fail - ${ers}`, ""]);
                    return;
                }
                if (output.test.qualifier === "filesystem not contains") {
                    increment([`${capital} test ${vars.text.angry + name + vars.text.none} sees the following address in the local file system, but shouldn't: ${vars.text.cyan + output.test.test + vars.text.none}`, ""]);
                    return;
                }
                increment(["", ""]);
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
            increment(["fail - must not contain this output", output.values[0]])
            return;
        }
        increment(["", ""]);
    }
};

export default testEvaluation;