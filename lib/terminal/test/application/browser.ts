
/* lib/terminal/test/application/browser - The functions necessary to run browser test automation. */

import { ServerResponse } from "http";

import error from "../../utilities/error.js";
import httpClient from "../../server/httpClient.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import server from "../../commands/service.js";
import serverVars from "../../server/serverVars.js";
import vars from "../../utilities/vars.js";
import remove from "../../commands/remove.js";
import response from "../../server/response.js";

import machines from "./browser_machines.js";
import test_agents from "../samples/browser_agents.js";
import test_self from "../samples/browser_self.js";

let finished:boolean = false,
    tests:testBrowserItem[];
const browser:testBrowserApplication = {
        agent: "",
        args: {
            callback: function terminal_test_application_browser_callback():void {
                return;
            },
            demo: false,
            mode: "self",
            noClose: false
        },
        exitMessage: "",
        exitType: 0,
        index: -1,
        ip: "",
        methods: {
            close: function terminal_test_application_browser_close(data:testBrowserRoute):void {
                const close:testBrowserRoute = {
                    action: "close",
                    exit: data.exit,
                    index: -1,
                    result: [],
                    test: null,
                    transfer: null
                };
                vars.ws.broadcast(JSON.stringify({
                    "test-browser": close
                }));
                log([data.exit, ""], true);
            },
            execute: function terminal_test_application_browser_execute(args:testBrowserArgs):void {
                const agents = function terminal_test_application_browser_execute_agents():void {
                        const list:string[] = Object.keys(machines),
                            listLength:number = list.length;
                        let index:number = 0;
                        log(["Preparing remote machines"]);
                        do {
                            httpClient({
                                agentType: "device",
                                callback: function terminal_test_application_browser_execute_agents_callback():void {
                                    return;
                                },
                                errorMessage: `Failed to send reset instructions to remote machine ${list[index]}.`,
                                ip: machines[list[index]].ip,
                                payload: JSON.stringify({
                                    "test-browser": serverVars.testBrowser
                                }),
                                port: machines[list[index]].port,
                                remoteName: browser.agent,
                                requestError: function terminal_test_application_browser_execute_agents_requestError(errorMessage:nodeError):void {
                                    log([errorMessage.toString()]);
                                },
                                requestType: "testBrowser-reset",
                                responseError: function terminal_test_application_browser_execute_agents_responseError(errorMessage:nodeError):void {
                                    log([errorMessage.toString()]);
                                },
                                responseStream: httpClient.stream
                            });
                            index = index + 1;
                        } while (index < listLength);
                    },
                    reset = function terminal_test_application_browser_execute_reset():void {
                        browser.methods["reset-request"]({
                            action: "result",
                            exit: "",
                            index: 0,
                            result: [],
                            test: tests[0],
                            transfer: null
                        });
                    },
                    remote = function terminal_test_application_browser_execute_remoteServer():void {
                        log([`${vars.text.cyan}Environment ready. Listening for instructions...${vars.text.none}`]);
                    };
                browser.args = args;
                tests = (args.mode === "self")
                    ? test_self
                    : (args.mode === "full")
                        ? test_self.concat(test_agents.slice(3))
                        : test_agents;

                serverVars.secure = false;
                serverVars.storage = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
                serverVars.testBrowser = {
                    action: (args.mode === "remote")
                        ? "reset-browser"
                        : "reset-request",
                    exit: "",
                    index: -1,
                    result: [],
                    test: null,
                    transfer: (args.mode === "remote")
                        ? null
                        : {
                            agent: "",
                            ip: serverVars.ipAddress,
                            port: serverVars.webPort
                        }
                };
                server({
                    agent: "",
                    agentType: "device",
                    callback: (args.mode === "remote")
                        ? remote
                        : (args.mode === "self")
                            ? reset
                            : agents
                });
            },
            exit: function terminal_test_application_browser_exit(index:number):void {
                if (finished === true) {
                    return;
                }
                finished = true;
                const close:testBrowserRoute = {
                        action: "close",
                        exit: browser.exitMessage,
                        index: index,
                        result: [],
                        test: null,
                        transfer: null
                    },
                    exitTasks = function terminal_test_application_browser_exit_exitTasks():void {
                        browser.index = -1;
                        serverVars.secure = true;
                        serverVars.storage = `${vars.projectPath}lib${vars.sep}storage${vars.sep}`;
                        serverVars.testBrowser = null;
                        browser.args.callback(browser.exitMessage, browser.exitType);
                    },
                    closing = (browser.args.noClose === true)
                        ? exitTasks
                        : function terminal_test_application_browser_exit_closing():void {
                            vars.ws.broadcast(JSON.stringify({
                                "test-browser": close
                            }));
                            setTimeout(function terminal_test_application_browser_exit_closing_delay():void {
                                exitTasks();
                            }, 1000);
                        };
                if (browser.args.mode === "agents" || browser.args.mode === "full") {
                    let count:number = 0;
                    const agents:string[] = Object.keys(machines);
                    agents.forEach(function terminal_test_application_browser_exit_agents(name:string):void {
                        httpClient({
                            agentType: "device",
                            callback: function terminal_test_application_browser_exit_callback():void {
                                count = count + 1;
                                if (count === agents.length) {
                                    closing();
                                }
                            },
                            errorMessage: `Failed to return test ${index} result from remote agent ${serverVars.nameDevice}.`,
                            ip: machines[name].ip,
                            port: machines[name].port,
                            payload: JSON.stringify({
                                "test-browser": close
                            }),
                            remoteName: browser.agent,
                            requestError:  function terminal_test_application_browser_exit_requestError():void {
                                return;
                            },
                            requestType: "testBrowser-close",
                            responseStream: httpClient.stream,
                            responseError: function terminal_test_application_browser_exit_responseError():void {
                                return;
                            }
                        });
                    });
                } else {
                    closing();
                }
            },
            iterate: function terminal_test_application_browser_iterate(index:number):void {
                // not writing to storage
                if (finished === true) {
                    return;
                }
                const route:testBrowserRoute = {
                        action: "result",
                        exit: "",
                        index: index,
                        result: [],
                        test: tests[index],
                        transfer: null
                    },
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
                        assign(index);
                        setTimeout(function terminal_test_application_browser_iterate_setTimeout():void {
                            const refresh:number = index + 1;
                            vars.ws.broadcast(JSON.stringify({
                                "test-browser": route
                            }));
                            if (tests[index].interaction[0].event === "refresh") {
                                const payload: testBrowserRoute = {
                                    action: (browser.args.noClose === true)
                                        ? "result"
                                        : "reset-browser",
                                    exit: "",
                                    index: index,
                                    result: [],
                                    test: null,
                                    transfer: null
                                };
                                if (tests[index].delay !== undefined) {
                                    vars.verbose = true;
                                    logs.push(    `Test is a refresh test, but it must not contain a ${vars.text.angry}delay${vars.text.none} property.`);
                                    log(logs, true);
                                    if (browser.args.noClose === false) {
                                        process.exit(1);
                                    }
                                    return;
                                }
                                if (refresh < tests.length) {
                                    assign(refresh);
                                } else {
                                    serverVars.testBrowser = payload;
                                }
                            }
                        }, delay);
                    } else {
                        const payload:testBrowserTransfer = {
                                agent: serverVars.hashUser,
                                ip: serverVars.ipAddress,
                                port: serverVars.webPort
                            },
                            route:testBrowserRoute = {
                                action: "request",
                                exit: "",
                                index: index,
                                result: [],
                                test: tests[index],
                                transfer: payload
                            };
                        httpClient({
                            agentType: "device",
                            callback: function terminal_test_application_browser_iterate_httpClient():void {
                                if (finished === true) {
                                    browser.methods.exit(index);
                                }
                            },
                            errorMessage: `Browser test ${index} received a transmission error sending the test.`,
                            ip: machines[tests[index].machine].ip,
                            payload: JSON.stringify({
                                "test-browser": route
                            }),
                            port: machines[tests[index].machine].port,
                            requestError: function terminal_test_application_browser_iterate_remoteRequest(errorMessage:nodeError):void {
                                log([errorMessage.toString()]);
                            },
                            requestType: "testBrowser-request",
                            remoteName: "test-browser-request",
                            responseStream: httpClient.stream,
                            responseError: function terminal_test_application_browser_iterate_remoteResponse(errorMessage:nodeError):void {
                                log([errorMessage.toString()]);
                            },
                        });
                    }
                } else {
                    vars.verbose = true;
                    log(logs, true);
                    if (browser.args.noClose === false) {
                        process.exit(1);
                    }
                }
            },
            request: function terminal_test_application_browser_request(item:testBrowserRoute):void {
                const route:testBrowserRoute = {
                    action: "respond",
                    exit: "",
                    index: item.index,
                    result: [],
                    test: item.test,
                    transfer: null
                };
                item.action = "respond";
                serverVars.testBrowser = item;
                vars.ws.broadcast(JSON.stringify({
                    "test-browser": route
                }));
                browser.agent = item.transfer.agent;
                browser.ip = item.transfer.ip;
                browser.port = item.transfer.port;
            },
            ["reset-browser"]: function terminal_test_application_browser_resetBrowser(data:testBrowserRoute):void {
                if (browser.args.mode === "remote") {
                    const payload:testBrowserRoute = {
                        action: "reset-complete",
                        exit: "",
                        index: -1,
                        result: [],
                        test: null,
                        transfer: {
                            agent: "",
                            ip: serverVars.ipAddress,
                            port: serverVars.webPort
                        }
                    };
                    httpClient({
                        agentType: "device",
                        callback: function terminal_test_application_browser_resetBrowser_callback():void {
                            return;
                        },
                        errorMessage: "Error confirming reset of browser test remote.",
                        ip: data.transfer.ip,
                        payload: JSON.stringify({
                            "test-browser": payload
                        }),
                        port: data.transfer.port,
                        remoteName: "",
                        requestError: function terminal_test_application_browser_resetBrowser_requestError():void {},
                        requestType: "testBrowser-resetResponse",
                        responseError: function terminal_test_application_browser_resetBrowser_responseError():void {},
                        responseStream: httpClient.stream
                    });
                }
            },
            ["reset-complete"]: function terminal_test_application_browser_resetComplete():void {
                const list:string[] = Object.keys(machines),
                    listLength:number = list.length,
                    boldGreen:string = vars.text.green + vars.text.bold,
                    color:string = (browser.remoteAgents === listLength - 1)
                        ? boldGreen
                        : vars.text.angry;
                browser.remoteAgents = browser.remoteAgents + 1;
                log([`Received ready state from ${color + browser.remoteAgents + vars.text.none} of ${boldGreen + listLength + vars.text.none} total machines.`]);
                if (browser.remoteAgents === listLength) {
                    log(["", "Executing tests"]);
                    browser.methods["reset-request"]({
                        action: "result",
                        exit: "",
                        index: 0,
                        result: [],
                        test: tests[0],
                        transfer: null
                    });
                }
            },
            ["reset-request"]: function terminal_test_application_browser_resetRequest(data:testBrowserRoute):void {
                if (browser.args.mode !== "remote") {
                    data.action = "result";
                }
                serverVars.testBrowser = data;
                vars.node.fs.readdir(serverVars.storage.slice(0, serverVars.storage.length - 1), function terminal_test_application_browser_resetRequest_readdir(dErr:nodeError, files:string[]):void {
                    if (dErr !== null) {
                        error([dErr.toString()]);
                        return;
                    }
                    const browserLaunch = function terminal_test_application_browser_resetRequest_readdir_browserLaunch():void {
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
                                ? (function terminal_test_application_browser_resetRequest_readdir_browserLaunch_browserCommand():string {
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
                                : `${keyword} ${path}`,
                            child = function terminal_test_application_browser_resetRequest_readdir_browserLaunch_child(errs:nodeError, stdout:string, stderr:string|Buffer):void {
                                if (errs !== null) {
                                    error([errs.toString()]);
                                    return;
                                }
                                if (stdout !== "") {
                                    log([stdout]);
                                }
                                if (stderr !== "") {
                                    log([stderr.toString()]);
                                }
                            };
                        vars.node.child(browserCommand, child);
                    };
                    let length:number = files.length,
                        flags:number = length;
                    log([`${humanTime(false)}Resetting test environment.`]);
                    serverVars.device = {};
                    serverVars.user = {};
                    if (length === 1) {
                        browserLaunch();
                    } else {
                        do {
                            length = length - 1;
                            if (files[length] !== "storage.txt") {
                                remove(serverVars.storage + files[length], function terminal_test_application_browser_resetRequest_readdir_remove():void {
                                    flags = flags - 1;
                                    if (flags === 1) {
                                        browserLaunch();
                                    }
                                });
                            }
                        } while (length > 0);
                    }
                });
            },
            respond: function terminal_test_application_browser_respond(item:testBrowserRoute): void {
                const errorCall = function terminal_test_application_browser_respond_errorCall(data:httpError):void {
                        if (data.agent === undefined && data.type === undefined) {
                            error([`Error on ${data.callType} returning test index ${item.index}`, data.error.toString()]);
                        } else if (data.agent === undefined) {
                            error([`Error on ${data.callType} returning test index ${item.index} result from type ${data.type}`, data.error.toString()]);
                        } else if (data.type === undefined) {
                            error([`Error on ${data.callType} returning test index ${item.index} result from ${data.agent}`, data.error.toString()]);
                        } else {
                            error([`Error on ${data.callType} returning test index ${item.index} result from ${data.agent} of type ${data.type}`, data.error.toString()]);
                        }
                    },
                    route:testBrowserRoute = {
                        action: "result",
                        exit: "",
                        index: item.index,
                        result: item.result,
                        test: null,
                        transfer: null
                    };
                httpClient({
                    agentType: "device",
                    callback: function terminal_test_application_browser_respond_callback():void {
                        if (finished === true) {
                            browser.methods.exit(item.index);
                        }
                    },
                    errorMessage: `Failed to return test ${item.index} result from remote agent ${serverVars.nameDevice}.`,
                    ip: browser.ip,
                    port: browser.port,
                    payload: JSON.stringify({
                        "test-browser": route
                    }),
                    remoteName: browser.agent,
                    requestError: function terminal_test_application_browser_respond_requestError(errorMessage:nodeError, agent:string, type:agentType):void {
                        errorCall({
                            callType: "request",
                            agent: agent,
                            error: errorMessage,
                            type: type
                        });
                    },
                    requestType: "testBrowser-result",
                    responseStream: httpClient.stream,
                    responseError: function terminal_test_application_browser_respond_responseError(errorMessage:nodeError, agent:string, type:agentType):void {
                        errorCall({
                            callType: "response",
                            agent: agent,
                            error: errorMessage,
                            type: type
                        });
                    }
                });
            },
            result: function terminal_test_application_browser_result(item:testBrowserRoute):void {
                if (finished === true) {
                    return;
                }
                let a:number = 0,
                    falseFlag:boolean = false;
                const result: [boolean, string, string][] = item.result,
                    index:number = item.index,
                    length:number = result.length,
                    delay:boolean = (tests[index].unit.length === 0),
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
                            }());
                        vars.verbose = true;
                        if (pass === true) {
                            const passPlural:string = (index === 1)
                                ? ""
                                : "s";
                            browser.exitMessage = `${vars.text.green + vars.text.bold}Passed${vars.text.none} all ${totalTests} evaluations from ${index + 1} test${passPlural}.`;
                            browser.methods.exit(index);
                            browser.exitType = 0;
                            return;
                        }
                        browser.exitMessage = `${vars.text.angry}Failed${vars.text.none} on test ${vars.text.angry + (index + 1) + vars.text.none}: "${vars.text.cyan + tests[index].name + vars.text.none}" out of ${tests.length} total test${plural} and ${totalTests} evaluations.`;
                        browser.methods.exit(index);
                        browser.exitType = 1;
                    },
                    summary = function terminal_test_application_browser_result_summary(pass:boolean):string {
                        const text:string = ` browser ${index + 1}: ${vars.text.none + tests[index].name}`,
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
                                : (config === tests[index].delay)
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
                    failureMessage = function terminal_test_application_browser_result_failureMessage():void {
                        if (result[a][2] === "error") {
                            let error:string = result[a][1]
                                .replace("{\"file\":"   , `{\n    "${vars.text.cyan}file${vars.text.none}"   :`)
                                .replace(",\"column\":" , `,\n    "${vars.text.cyan}column${vars.text.none}" :`)
                                .replace(",\"line\":"   , `,\n    "${vars.text.cyan}line${vars.text.none}"   :`)
                                .replace(",\"message\":", `,\n    "${vars.text.cyan}message${vars.text.none}":`)
                                .replace(",\"stack\":"  , `,\n    "${vars.text.cyan}stack${vars.text.none}"  :`)
                                .replace(/\\n/g, "\n    ")
                                .replace(/\}$/, "\n}");
                            failure.push(`     ${vars.text.angry}JavaScript Error${vars.text.none}\n${error}`);
                        } else if ((delay === false && result[a][2] === buildNode(tests[index].unit[index], true)) || (delay === true && result[a][2] === buildNode(tests[index].delay, true))) {
                            failure.push(`     Actual value: ${vars.text.cyan + result[a][1] + vars.text.none}`);
                        } else if ((delay === false && tests[index].unit[index].value === null) || (delay === true && tests[index].delay.value === null)) {
                            failure.push(`     DOM node is not null: ${vars.text.cyan + result[a][2] + vars.text.none}`);
                        } else if ((delay === false && tests[index].unit[index].value === undefined) || (delay === true && tests[index].delay.value === undefined)) {
                            failure.push(`     DOM node is not undefined: ${vars.text.cyan + result[a][2] + vars.text.none}`);
                        } else {
                            failure.push(`     DOM node is ${result[a][1]}: ${vars.text.cyan + result[a][2] + vars.text.none}`);
                        }
                    },
                    failure:string[] = [];

                if (browser.index < index) {
                    browser.index = index;
                    if (result[0][0] === false && result[0][1] === "delay timeout") {
                        failure.push(testString(false, tests[index].delay));
                        if (tests[index].delay.type === "element") {
                            const qualifier:string = (tests[index].delay.qualifier === "not")
                                ? " not"
                                : "";
                            failure.push(`     DOM node is${qualifier} ${tests[index].delay.value}: ${vars.text.cyan + result[1][1] + vars.text.none}`);
                        } else {
                            failure.push(`     Actual value: ${vars.text.cyan + result[1][1] + vars.text.none}`);
                        }
                        falseFlag = true;
                    } else if (result[0][0] === false && result[0][1].indexOf("event error ") === 0) {
                        failure.push(`${vars.text.angry}Failed: event node is ${result[0][1].replace("event error ", "")}`);
                        failure.push(`     Specified event node is: ${vars.text.cyan + result[0][2] + vars.text.none}`);
                        falseFlag = true;
                    } else if (delay === true) {
                        failure.push(testString(result[a][0], tests[index].delay));
                        if (result[a][0] === false) {
                            failureMessage();
                            falseFlag = true;
                        }
                    } else {
                        do {
                            failure.push(testString(result[a][0], tests[index].unit[a]));
                            if (result[a][0] === false) {
                                failureMessage();
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
                    if (index + 1 < tests.length) {
                        browser.methods.iterate(index + 1);
                    } else {
                        completion(true);
                    }
                }
            },
            route: function terminal_test_application_browser_route(data:testBrowserRoute, serverResponse:ServerResponse):void {
                response(serverResponse, "text/plain", "Responding to browser test automation request.");
                browser.methods[data.action](data);
                // close
                // * tells the test browser to close
                // * from browser.exit on mode:agents sent to mode:remote
                // -
                // request
                // * sends a test from mode:agents to a specified mode:remote
                // * from browser.iterate
                // * sends an unused HTTP response
                // -
                // reset-browser
                // * indicates the environment is reset and the browser is ready on the local computer (mode:remote)
                // * from the browser
                // * send an HTTP request to data.transfer identifiers
                // -
                // reset-complete
                // * confirms that the remote computers are reset and their web browsers are ready to execute
                // * from resetResponse of mode:remote sent to mode:agents
                // * executes local reset-request thus beginning test iteration
                // -
                // reset-request
                // * resets the environment on mode:remote
                // * from mode:agent (remote) in browser.execute to this computer mode:remote
                // * generates an HTTP response
                // -
                // respond
                // * converts an action 'request' into a test for the browser of a specified mode:remote
                // * from browser.request of mode:agents (remote)
                // * sends an HTTP request to browser.ip with the test result
                // -
                // result
                // * response to test completion
                // * from browsers whether local or remote
                // * calls browser.iterate
            }
        },
        port: 0,
        remoteAgents: 0
    },
    assign = function terminal_test_application_browser_assign(index:number):void {
        serverVars.testBrowser = {
            action: "result",
            exit: "",
            index: index,
            result: [],
            test: tests[index],
            transfer: null
        };
    };

export default browser;