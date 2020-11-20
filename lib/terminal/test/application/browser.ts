
/* lib/terminal/test/application/browser - The functions necessary to run browser test automation. */

import { ServerResponse } from "http";

import error from "../../utilities/error.js";
import httpClient from "../../server/httpClient.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import server from "../../commands/server.js";
import serverVars from "../../server/serverVars.js";
import vars from "../../utilities/vars.js";
import remove from "../../commands/remove.js";
import response from "../../server/response.js";

import tests from "../samples/browser.js";

let finished:boolean = false;
const task:testBrowserType = (vars.command === "test_browser_remote")
        ? "test-browser-remote"
        : "test-browser",
    browser:testBrowserApplication = {
        agent: "",
        args: {
            demo: false,
            noClose: false
        },
        index: -1,
        ip: "",
        port: 0
    },
    machines:testBrowserMachines = {
        VM1: {
            ip: "192.168.56.125",
            port: 80,
            secure: false
        }
    },
    assign = function terminal_test_application_browser_assign(index:number):void {
        tests[index].index = index;
        tests[index].task = task;
        serverVars.testBrowser = tests[index];
    };

browser.execute = function terminal_test_application_browser_execute(args:testBrowserArgs):void {
    browser.args.demo = args.demo;
    browser.args.noClose = args.noClose;
    serverVars.storage = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
    vars.node.fs.readdir(serverVars.storage.slice(0, serverVars.storage.length - 1), function terminal_test_application_browser_execute_readdir(dErr:nodeError, files:string[]):void {
        if (dErr !== null) {
            error([dErr.toString()]);
            return;
        }
        const browserLaunch = function terminal_test_application_browser_execute_readdir_browserLaunch():void {
            const serviceCallback = function terminal_test_application_browser_execute_readdir_browserLaunch_serviceCallback(output:serverOutput):void {
                const keyword:string = (process.platform === "darwin")
                        ? "open"
                        : (process.platform === "win32")
                            ? "start"
                            : "xdg-open",
                    port:string = ((serverVars.secure === true && serverVars.webPort === 443) || (serverVars.secure === false && serverVars.webPort === 80))
                        ? ""
                        : `:${String(serverVars.webPort)}`,
                    scheme:string = (serverVars.secure === true)
                        ? "https"
                        : "http",
                    path:string = `${scheme}://localhost${port}/?test_browser`,
                    // execute a browser by file path to the browser binary
                    browserCommand:string = (process.argv.length > 0 && (process.argv[0].indexOf("\\") > -1 || process.argv[0].indexOf("/") > -1))
                        ? (function terminal_test_application_browser_execute_readdir_launch_serviceCallback_browserCommand():string {
                            if (process.platform === "win32") {
                                // yes, this is ugly.  Windows old cmd shell doesn't play well with file paths
                                process.argv[0] = `${process.argv[0].replace(/\\/g, "\"\\\"").replace("\"\\", "\\") + "\""}`;
                            } else {
                                process.argv[0] = `"${process.argv[0]}"`;
                            }
                            if (process.argv.length > 1) {
                                return `${keyword} ${process.argv[0]} ${path} "${process.argv.slice(1).join(" ")}"`
                            }
                            return `${keyword} ${process.argv[0]} ${path}`;
                        }())
                        : `${keyword} ${path}`;
                browser.server = output.server;
                vars.node.child(browserCommand, {cwd: vars.cwd}, function terminal_test_application_browser_execute_readdir_launch_serviceCallback_child(errs:nodeError):void {
                    if (errs !== null) {
                        error([errs.toString()]);
                        return;
                    }
                });
            };
            server({
                agent: "",
                agentType: "device",
                callback: serviceCallback
            });
        };
        let length:number = files.length,
            flags:number = length;
        assign(0);
        if (length === 1) {
            browserLaunch();
        } else {
            do {
                length = length - 1;
                if (files[length] !== "storage.txt") {
                    remove(serverVars.storage + files[length], function terminal_test_application_browser_execute_readdir_remove():void {
                        flags = flags - 1;
                        if (flags === 1) {
                            browserLaunch();
                        }
                    });
                }
            } while (length > 0);
        }
    });
};

browser.iterate = function terminal_test_application_browser_iterate(index:number):void {
    // not writing to storage
    if (finished === true) {
        return;
    }
    assign(index);
    const message:string = JSON.stringify({
            "test-browser": tests[index]
        }),
        logs:string[] = [
            `Test ${index + 1} malformed: ${vars.text.angry + tests[index].name + vars.text.none}`,
            ""
        ],

        // determine if non-interactive events have required matching data properties
        validate = function terminal_test_application_browser_iterate_validate():boolean {
            let a:number = 0;
            const length:number = tests[index].interaction.length,
                eventName = function terminal_test_application_browser_iterate_validate_eventName(property):string {
                    return `   ${vars.text.angry}*${vars.text.none} Interaction ${a + 1} has event ${vars.text.cyan}setValue${vars.text.none} but no ${vars.text.angry + property + vars.text.none} property.`;
                };
            if (tests[index].delay === undefined && tests[index].unit.length < 1) {
                logs.push("Test does not contain a delay test or test instances in its test array.");
                return false;
            }
            do {
                if ((tests[index].interaction[a].event === "setValue" || tests[index].interaction[a].event === "keydown" || tests[index].interaction[a].event === "keyup") && tests[index].interaction[a].value === undefined) {
                    logs.push(eventName("value"));
                } else if (tests[index].interaction[a].event === "move" && tests[index].interaction[a].coords === undefined) {
                    logs.push(eventName("coords"));
                }
                a = a + 1;
            } while (a < length);
            if (logs.length < 3) {
                return true;
            }
            return false;
        },
        delay:number = (browser.args.demo === true || tests[index].interaction[0].event === "refresh")
            ? 500
            : 25;
    // delay is necessary to prevent a race condition
    // * about 1 in 10 times this will fail following event "refresh"
    // * because serverVars.testBrowser is not updated to methodGET library fast enough
    if (validate() === true) {
        if (tests[index].machine === "self") {
            setTimeout(function terminal_test_application_browser_iterate_setTimeout():void {
                const refresh:number = index + 1;
                vars.ws.broadcast(message);
                if (tests[index].interaction[0].event === "refresh") {
                    if (tests[index].delay !== undefined) {
                        vars.verbose = true;
                        logs.push(    `Test is a refresh test, but it must not contain a ${vars.text.angry}delay${vars.text.none} property.`);
                        log(logs, true);
                        process.exit(1);
                        return;
                    }
                    if (refresh < tests.length) {
                        assign(refresh);
                    } else if (browser.args.noClose === true) {
                        serverVars.testBrowser = {
                            index: index,
                            interaction: null,
                            machine: tests[index].machine,
                            name: "refresh-complete",
                            task: task,
                            unit: null
                        };
                    } else {
                        serverVars.testBrowser = {
                            index: index,
                            interaction: null,
                            machine: tests[index].machine,
                            name: "refresh-complete-close",
                            task: task,
                            unit: null
                        };
                    }
                }
            }, delay);
        } else {
            const payload:testBrowserTransfer = {
                agent: serverVars.hashUser,
                ip: serverVars.ipAddress,
                port: serverVars.webPort,
                test: tests[index]
            };
            httpClient({
                agentType: "device",
                callback: function terminal_test_application_browser_iterate_httpClient(message:Buffer|string):void {
                    browser.result(JSON.parse(message.toString())["test-browser-remote"], null);
                },
                errorMessage: `Browser test ${index} received a transmission error sending the test.`,
                ip: machines[tests[index].machine].ip,
                payload: JSON.stringify({
                    "test-browser-remote": payload
                }),
                port: machines[tests[index].machine].port,
                requestError: function terminal_test_application_browser_iterate_remoteRequest():void {
                    log([`Error requesting test ${index} to remote machine ${tests[index].machine}.`]);
                },
                requestType: "test-browser-remote",
                remoteName: "test-browser-remote",
                responseObject: null,
                responseStream: httpClient.stream,
                responseError: function terminal_test_application_browser_iterate_remoteResponse():void {
                    log([`Error on response to test ${index} to remote machine ${tests[index].machine}.`]);
                },
            });
        }
    } else {
        vars.verbose = true;
        log(logs, true);
        process.exit(1);
    }
};

browser.remote = function terminal_test_application_browser_remote(item:testBrowserTransfer, serverResponse:ServerResponse):void {
    vars.ws.broadcast(JSON.stringify({
        ["test-browser-remote"]: item.test
    }));
    browser.agent = item.agent;
    browser.ip = item.ip;
    browser.port = item.port;
    response(serverResponse, "text/plain", "Test received at remote");
};

browser.remoteReturn = function terminal_test_application_browser_remoteReturn(item:testBrowserResult, serverResponse:ServerResponse): void {
    httpClient({
        agentType: "device",
        callback: function terminal_test_application_browser_remoteReturn_callback():void {},
        errorMessage: `Failed to return test ${item.index} result from remote agent ${serverVars.nameDevice}.`,
        ip: browser.ip,
        port: browser.port,
        payload: JSON.stringify({
            "test-browser": item
        }),
        remoteName: browser.agent,
        requestError: function terminal_test_application_browser_remoteReturn_requestError(errorMessage:nodeError, agent:string, type:agentType):void {
            error([`Error on request returning test ${item.index} result from ${agent} of type ${type}`, errorMessage.toString()]);
        },
        requestType: "test-browser (from remote agent)",
        responseObject: serverResponse,
        responseStream: httpClient.stream,
        responseError: function terminal_test_application_browser_remoteReturn_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
            error([`Error on response returning test ${item.index} result from ${agent} of type ${type}`, errorMessage.toString()]);
        }
    });
};

browser.result = function terminal_test_application_browser_result(item:testBrowserResult, serverResponse:ServerResponse):void {
    if (finished === true) {
        return;
    }
    let a:number = 0,
        falseFlag:boolean = false;
    const length:number = item.payload.length,
        delay:boolean = (tests[item.index].unit.length === 0),
        completion = function terminal_test_application_browser_result_completion(pass:boolean):void {
            const plural:string = (tests.length === 1)
                    ? ""
                    : "s",
                totalTests:number = (function terminal_test_application_browser_result_completion_total():number {
                    // gathers a total count of tests
                    let aa:number = tests.length,
                        bb:number = 0;
                    do {
                        aa = aa - 1;
                        bb = bb + tests[aa].unit.length;
                    } while (aa > 0);
                    if (tests[aa].delay === undefined) {
                        return bb;
                    }
                    return bb + 1;
                }()),
                exit = function terminal_test_application_browser_result_completion_exit(type:number, message:string):void {
                    if (finished === true) {
                        return;
                    }
                    const close:boolean = (browser.args.demo === false && browser.args.noClose === false),
                        // delay is extended for end of test if last event is refresh, so that the server has time to respond before exist
                        delay:number = (close === false && type === 0 && tests[browser.index].interaction[0].event === "refresh")
                            ? 1000
                            : 50;
                    finished = true;
                    if (close === true) {
                        vars.ws.broadcast(JSON.stringify({
                            "test-browser-close": {}
                        }));
                        setTimeout(function terminal_test_application_browser_result_completion_exit_setTimeout():void {
                            log([message], true);
                            process.exit(type);
                        }, delay);
                    } else {
                        log([message], true);
                        browser.index = -1;
                        serverVars.testBrowser = null;
                    }
                };
            vars.verbose = true;
            if (pass === true) {
                const passPlural:string = (item.index === 1)
                    ? ""
                    : "s";
                exit(0, `${vars.text.green + vars.text.bold}Passed${vars.text.none} all ${totalTests} evaluations from ${item.index + 1} test${passPlural}.`);
                return;
            }
            exit(1, `${vars.text.angry}Failed${vars.text.none} on test ${vars.text.angry + (item.index + 1) + vars.text.none}: "${vars.text.cyan + tests[item.index].name + vars.text.none}" out of ${tests.length} total test${plural} and ${totalTests} evaluations.`);
        },
        summary = function terminal_test_application_browser_result_summary(pass:boolean):string {
            const text:string = ` browser test ${item.index + 1}: ${vars.text.none + tests[item.index].name}`,
                resultString:string = (pass === true)
                    ? `${vars.text.green}Passed`
                    : `${vars.text.angry}Failed`;
            return humanTime(false) + resultString + text;
        },
        buildNode = function terminal_test_application_Browser_result_buildNode(config:testBrowserTest, elementOnly:boolean):string {
            let b:number = 0;
            const node:browserDOM[] = config.node,
                property:string[] = config.target,
                nodeLength:number = node.length,
                propertyLength:number = property.length,
                output:string[] = ["document"];
            do {
                output.push(".");
                output.push(node[b][0]);
                output.push("(\"");
                output.push(node[b][1]);
                output.push("\")");
                if (node[b][2] !== null) {
                    output.push("[");
                    output.push(node[b][2].toString());
                    output.push("]");
                }
                b = b + 1;
            } while (b < nodeLength);
            if (config.type === "element" || elementOnly === true) {
                return output.join("");
            }
            if (config.type === "attribute") {
                output.push(".");
                output.push("getAttribute(\"");
                output.push(config.target[0]);
                output.push("\")");
            } else if (config.type === "property") {
                b = 0;
                do {
                    output.push(".");
                    output.push(config.target[b]);
                    b = b + 1;
                } while (b < propertyLength);
            }
            return output.join("");
        },
        testString = function terminal_test_application_browser_result_testString(pass:boolean, config:testBrowserTest):string {
            const valueStore:primitive = config.value,
                valueType:string = typeof valueStore,
                value = (valueStore === null)
                    ? "null"
                    : (valueType === "string")
                        ? `"${valueStore}"`
                        : String(valueStore),
                star:string = `   ${vars.text.angry}*${vars.text.none} `,
                resultString:string = (pass === true)
                    ? `${vars.text.green}Passed:`
                    : (config === tests[item.index].delay)
                        ? `${vars.text.angry}Failed (delay timeout):`
                        : `${vars.text.angry}Failed:`,
                qualifier:string = (config.qualifier === "begins")
                    ? (pass === true)
                        ? "begins with"
                        : `${vars.text.angry}does not begin with${vars.text.none}`
                    : (config.qualifier === "contains")
                        ? (pass === true)
                            ? "contains"
                            : `${vars.text.angry}does not contain${vars.text.none}`
                        : (config.qualifier === "ends")
                            ? (pass === true)
                                ? "ends with"
                                : `${vars.text.angry}does not end with${vars.text.none}`
                            : (config.qualifier === "greater")
                                ? (pass === true)
                                    ? "is greater than"
                                    : `${vars.text.angry}is not greater than${vars.text.none}`
                                : (config.qualifier === "is")
                                    ? (pass === true)
                                        ? "is"
                                        : `${vars.text.angry}is not${vars.text.none}`
                                    : (config.qualifier === "lesser")
                                        ? (pass === true)
                                            ? "is less than"
                                            : `${vars.text.angry}is not less than${vars.text.none}`
                                        : (config.qualifier === "not")
                                            ? (pass === true)
                                                ? "is not"
                                                : `${vars.text.angry}is${vars.text.none}`
                                            : (pass === true)
                                                ? "does not contain"
                                                : `${vars.text.angry}contains${vars.text.none}`,
                nodeString = `${vars.text.none} ${buildNode(config, false)} ${qualifier} ${value}`;
            return star + resultString + nodeString;
        },
        failureMessage = function terminal_test_application_browser_result_failureMessage(index:number):void {
            if (item.payload[index][2] === "error") {
                let error:string = item.payload[index][1]
                    .replace("{\"file\":"   , `{\n    "${vars.text.cyan}file${vars.text.none}"   :`)
                    .replace(",\"column\":" , `,\n    "${vars.text.cyan}column${vars.text.none}" :`)
                    .replace(",\"line\":"   , `,\n    "${vars.text.cyan}line${vars.text.none}"   :`)
                    .replace(",\"message\":", `,\n    "${vars.text.cyan}message${vars.text.none}":`)
                    .replace(",\"stack\":"  , `,\n    "${vars.text.cyan}stack${vars.text.none}"  :`)
                    .replace(/\\n/g, "\n    ")
                    .replace(/\}$/, "\n}");
                failure.push(`     ${vars.text.angry}JavaScript Error${vars.text.none}\n${error}`);
            } else if ((delay === false && item.payload[index][2] === buildNode(tests[item.index].unit[index], true)) || (delay === true && item.payload[index][2] === buildNode(tests[item.index].delay, true))) {
                failure.push(`     Actual value: ${vars.text.cyan + item.payload[index][1] + vars.text.none}`);
            } else if ((delay === false && tests[item.index].unit[index].value === null) || (delay === true && tests[item.index].delay.value === null)) {
                failure.push(`     DOM node is not null: ${vars.text.cyan + item.payload[index][2] + vars.text.none}`);
            } else if ((delay === false && tests[item.index].unit[index].value === undefined) || (delay === true && tests[item.index].delay.value === undefined)) {
                failure.push(`     DOM node is not undefined: ${vars.text.cyan + item.payload[index][2] + vars.text.none}`);
            } else {
                failure.push(`     DOM node is ${item.payload[index][1]}: ${vars.text.cyan + item.payload[index][2] + vars.text.none}`);
            }
        },
        failure:string[] = [];

    if (tests[item.index].machine === "self") {
        response(serverResponse, "text/plain", `Processing browser test ${item.index + 1}: ${tests[item.index].name}`);
    }
    if (browser.index < item.index) {
        browser.index = item.index;
        if (item.payload[0][0] === false && item.payload[0][1] === "delay timeout") {
            failure.push(testString(false, tests[item.index].delay));
            if (tests[item.index].delay.type === "element") {
                const qualifier:string = (tests[item.index].delay.qualifier === "not")
                    ? " not"
                    : "";
                failure.push(`     DOM node is${qualifier} ${tests[item.index].delay.value}: ${vars.text.cyan + item.payload[1][1] + vars.text.none}`);
            } else {
                failure.push(`     Actual value: ${vars.text.cyan + item.payload[1][1] + vars.text.none}`);
            }
            falseFlag = true;
        } else if (item.payload[0][0] === false && item.payload[0][1].indexOf("event error ") === 0) {
            failure.push(`${vars.text.angry}Failed: event node is ${item.payload[0][1].replace("event error ", "")}`);
            failure.push(`     Specified event node is: ${vars.text.cyan + item.payload[0][2] + vars.text.none}`);
            falseFlag = true;
        } else if (delay === true) {
            failure.push(testString(item.payload[a][0], tests[item.index].delay));
            if (item.payload[a][0] === false) {
                failureMessage(a);
                falseFlag = true;
            }
        } else {
            do {
                failure.push(testString(item.payload[a][0], tests[item.index].unit[a]));
                if (item.payload[a][0] === false) {
                    failureMessage(a);
                    falseFlag = true;
                }
                a = a + 1;
            } while (a < length);
        }

        if (falseFlag === true) {
            failure.splice(0, 0, summary(false));
            log(failure);
            completion(false);
            return;
        }
        log([summary(true)]);
        if (item.index + 1 < tests.length) {
            if (tests[browser.index].interaction[0].event !== "refresh") {
                browser.iterate(item.index + 1);
            }
        } else {
            completion(true);
        }
    }
};

export default browser;