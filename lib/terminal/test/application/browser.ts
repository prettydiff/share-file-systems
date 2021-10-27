
/* lib/terminal/test/application/browser - The functions necessary to run browser test automation. */

import { exec } from "child_process";
import { readdir } from "fs";

import error from "../../utilities/error.js";
import httpAgent from "../../server/httpAgent.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import remove from "../../commands/remove.js";
import responder from "../../server/responder.js";
import service from "../../commands/service.js";
import serverVars from "../../server/serverVars.js";
import time from "../../utilities/time.js";
import vars from "../../utilities/vars.js";
import websocket from "../../server/websocket.js";

import filePathDecode from "./browserUtilities/file_path_decode.js";
import machines from "./browserUtilities/machines.js";
import test_device from "../samples/browser_device.js";
import test_self from "../samples/browser_self.js";
import test_user from "../samples/browser_user.js";

let finished:boolean = false,
    tests:testBrowserItem[];
const defaultCommand:commands = vars.command,
    defaultSecure:boolean = serverVars.secure,
    defaultStorage:string = serverVars.settings,
    browser:testBrowserApplication = {
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
                websocket.broadcast({
                    data: close,
                    service: "test-browser"
                }, "browser");
                log([data.exit]);
            },
            delay: function terminal_test_application_browser_delay(config:testBrowserDelay):void {
                const wait:number = (config.browser === true)
                        ? 0
                        : config.delay,
                    seconds:string = (config.delay / 1000).toString(),
                    plural:string = (config.delay === 1000)
                        ? ""
                        : "s";
                if (config.delay > 0 && config.message !== "demo") {
                    log([`${humanTime(false)}Delaying for ${vars.text.cyan + seconds + vars.text.none} second${plural}: ${vars.text.cyan + config.message + vars.text.none}`]);
                }
                setTimeout(config.action, wait);
            },
            execute: function terminal_test_application_browser_execute(args:testBrowserArgs):void {
                const agents = function terminal_test_application_browser_execute_agents():void {
                        const list:string[] = Object.keys(machines),
                            listLength:number = list.length;
                        let index:number = 0;
                        log(["Preparing remote machines"]);
                        do {
                            if (list[index] !== "self") {
                                httpAgent.request({
                                    agent: "",
                                    agentType: "device",
                                    callback: function terminal_test_application_browser_execute_agents_callback():void {
                                        return;
                                    },
                                    ip: machines[list[index]].ip,
                                    payload: JSON.stringify(serverVars.testBrowser),
                                    port: machines[list[index]].port,
                                    requestError: function terminal_test_application_browser_execute_agents_requestError(errorMessage:Error):void {
                                        log([errorMessage.toString()]);
                                    },
                                    requestType: "test-browser",
                                    responseError: function terminal_test_application_browser_execute_agents_responseError(errorMessage:Error):void {
                                        log([errorMessage.toString()]);
                                    }
                                });
                            }
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

                log.title(`Browser Tests - ${args.mode}`, true);
                browser.args = args;
                if (args.mode === "self") {
                    tests = test_self;
                } else if (args.mode === "device") {
                    tests = test_device;
                } else if (args.mode === "user") {
                    tests = test_user;
                }

                vars.command = "test_browser";
                serverVars.secure = false;
                serverVars.settings = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
                serverVars.testBrowser = {
                    action: (args.mode === "remote")
                        ? "nothing"
                        : "reset-request",
                    exit: "",
                    index: -1,
                    result: [],
                    test: null,
                    transfer: (args.mode === "remote")
                        ? null
                        : {
                            agent: "",
                            ip: serverVars.localAddresses.IPv4[0],
                            port: serverVars.ports.http
                        }
                };
                serverVars.testType = <testListType>`browser_${args.mode}`;
                service({
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
                        action: (browser.args.noClose === true)
                            ? "nothing"
                            : "close",
                        exit: browser.exitMessage,
                        index: index,
                        result: [],
                        test: null,
                        transfer: null
                    },
                    closing = (browser.args.noClose === true)
                        ? function terminal_test_application_browser_exit_noClose():void {
                            log([browser.exitMessage, "\u0007"]);
                        }
                        : function terminal_test_application_browser_exit_closing():void {
                            websocket.broadcast({
                                data: close,
                                service: "test-browser"
                            }, "browser");
                            browser.methods.delay({
                                action: function terminal_test_application_browser_exit_closing_delay():void {
                                    browser.index = -1;
                                    vars.command = defaultCommand;
                                    serverVars.secure = defaultSecure;
                                    serverVars.settings = defaultStorage;
                                    serverVars.testBrowser = null;
                                    browser.args.callback(browser.exitMessage, browser.exitType);
                                },
                                browser: false,
                                delay: 1000,
                                message: "Closing out the test environment."
                            });
                        };
                if (browser.args.mode === "device" || browser.args.mode === "user") {
                    let count:number = 0;
                    const agents:string[] = Object.keys(machines);
                    agents.forEach(function terminal_test_application_browser_exit_agents(name:string):void {
                        if (name !== "self") {
                            httpAgent.request({
                                agent: "",
                                agentType: "device",
                                callback: function terminal_test_application_browser_exit_callback():void {
                                    count = count + 1;
                                    if (count === agents.length - 1) {
                                        closing();
                                    }
                                },
                                ip: machines[name].ip,
                                port: machines[name].port,
                                payload: JSON.stringify(close),
                                requestError:  function terminal_test_application_browser_exit_requestError():void {
                                    return;
                                },
                                requestType: "test-browser",
                                responseError: function terminal_test_application_browser_exit_responseError():void {
                                    return;
                                }
                            });
                        }
                    });
                } else {
                    closing();
                }
            },
            iterate: function terminal_test_application_browser_iterate(index:number):void {
                // not writing to settings
                if (finished === true) {
                    return;
                }
                let delayMessage:string = "",
                    delayBrowser:boolean = false;
                const logs:string[] = [
                        `Test ${index + 1} malformed: ${vars.text.angry + tests[index].name + vars.text.none}`,
                        ""
                    ],
                    wait:number = (function terminal_test_application_browser_iterate_wait():number {
                        let a:number = tests[index].interaction.length,
                            value:number = 0,
                            count:number = 0;
                        do {
                            a = a - 1;
                            if (tests[index].interaction[a].event === "wait") {
                                value = Number(tests[index].interaction[a].value);
                                if (isNaN(value) === false) {
                                    count = count + value;
                                }
                            }
                        } while (a > 0);
                        value = 2000;
                        if (tests[index].interaction[0].event === "refresh" && tests[index + 1].machine !== "self" && count < value) {
                            delayMessage = "Providing remote machine browser time before a refresh.";
                            return value;
                        }
                        if (browser.args.demo === true && count < 501) {
                            return 500;
                        }
                        if (count > 0) {
                            delayBrowser = true;
                        }
                        return count;
                    }()),
                    waitText = function terminal_test_application_browser_iterate_waitText(machine:string):string {
                        return (delayMessage === "" && wait > 0)
                            ? `Pausing for 'wait' event in browser on machine ${machine}.`
                            : delayMessage;
                    },
            
                    // determine if non-interactive events have required matching data properties
                    validate = function terminal_test_application_browser_iterate_validate():boolean {
                        let a:number = 0;
                        const length:number = tests[index].interaction.length,
                            eventName = function terminal_test_application_browser_iterate_validate_eventName(property:string):string {
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
                    };
                // delay is necessary to prevent a race condition
                // * about 1 in 10 times this will fail following event "refresh"
                // * because serverVars.testBrowser is not updated to methodGET library fast enough
                if (validate() === true) {
                    serverVars.testBrowser = {
                        action: "result",
                        exit: "",
                        index: index,
                        result: [],
                        test: tests[index],
                        transfer: null
                    };
                    if (tests[index].machine === "self") {
                        tests[index] = filePathDecode(tests[index], "") as testBrowserItem;
                        if (index === 0 || (index > 0 && tests[index - 1].interaction[0].event !== "refresh")) {
                            browser.methods.delay({
                                action: function terminal_test_application_browser_iterate_selfDelay():void {
                                    websocket.broadcast({
                                        data: serverVars.testBrowser,
                                        service: "test-browser"
                                    }, "browser");
                                },
                                browser: delayBrowser,
                                delay: wait,
                                message: waitText(tests[index].machine)
                            });
                        } else if (delayBrowser === true) {
                            const second:number = (wait / 1000),
                                plural:string = (second === 1)
                                    ? ""
                                    : "s";
                            log([`${humanTime(false)}Delaying for ${vars.text.cyan + second + vars.text.none} second${plural}: ${vars.text.cyan + waitText(tests[index].machine) + vars.text.none}`]);
                        }
                    } else {
                        browser.methods.delay({
                            action: function terminal_test_application_browser_iterate_agentDelay():void {
                                const payload:testBrowserTransfer = {
                                        agent: serverVars.hashUser,
                                        ip: serverVars.localAddresses.IPv4[0],
                                        port: serverVars.ports.http
                                    };
                                serverVars.testBrowser.action = "request";
                                serverVars.testBrowser.transfer = payload;
                                httpAgent.request({
                                    agent: "",
                                    agentType: "device",
                                    callback: function terminal_test_application_browser_iterate_httpClient():void {
                                        if (finished === true) {
                                            browser.methods.exit(index);
                                        }
                                    },
                                    ip: machines[tests[index].machine].ip,
                                    payload: JSON.stringify(serverVars.testBrowser),
                                    port: machines[tests[index].machine].port,
                                    requestError: function terminal_test_application_browser_iterate_remoteRequest(errorMessage:Error):void {
                                        log([errorMessage.toString()]);
                                    },
                                    requestType: "test-browser",
                                    responseError: function terminal_test_application_browser_iterate_remoteResponse(errorMessage:Error):void {
                                        log([errorMessage.toString()]);
                                    },
                                });
                            },
                            browser: delayBrowser,
                            delay: wait,
                            message: waitText(tests[index].machine)
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
                item.test = filePathDecode(item.test, "") as testBrowserItem;
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
                websocket.broadcast({
                    data: route,
                    service: "test-browser"
                }, "browser");
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
                            ip: serverVars.localAddresses.IPv4[0],
                            port: serverVars.ports.http
                        }
                    };
                    httpAgent.request({
                        agent: "",
                        agentType: "device",
                        callback: function terminal_test_application_browser_resetBrowser_callback():void {
                            return;
                        },
                        ip: data.transfer.ip,
                        payload: JSON.stringify(payload),
                        port: data.transfer.port,
                        requestError: function terminal_test_application_browser_resetBrowser_requestError():void {},
                        requestType: "test-browser",
                        responseError: function terminal_test_application_browser_resetBrowser_responseError():void {}
                    });
                }
            },
            ["reset-complete"]: function terminal_test_application_browser_resetComplete():void {
                const list:string[] = Object.keys(machines),
                    listLength:number = list.length - 1,
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
                readdir(serverVars.settings.slice(0, serverVars.settings.length - 1), function terminal_test_application_browser_resetRequest_readdir(dErr:Error, files:string[]):void {
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
                            port:string = ((serverVars.secure === true && serverVars.ports.http === 443) || (serverVars.secure === false && serverVars.ports.http === 80))
                                ? ""
                                : `:${String(serverVars.ports.http)}`,
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
                                        return `${keyword} ${process.argv[0]} ${path} "${process.argv.slice(1).join(" ")}"`;
                                    }
                                    return `${keyword} ${process.argv[0]} ${path}`;
                                }())
                                : `${keyword} ${path}`,
                            child = function terminal_test_application_browser_resetRequest_readdir_browserLaunch_child(errs:Error, stdout:string, stderr:Buffer | string):void {
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
                        exec(browserCommand, {
                            cwd: vars.projectPath
                        }, child);
                    },
                    start = function terminal_test_application_browser_resetRequest_readdir_start():void {
                        let length:number = files.length,
                            flags:number = length,
                            timeStore:[string, number] = time("Resetting Test Environment", false, 0);
                        log(["", "", timeStore[0]]);
                        serverVars.device = {};
                        serverVars.user = {};
                        if (length === 1) {
                            browserLaunch();
                        } else {
                            do {
                                length = length - 1;
                                if (files[length] !== "settings.txt") {
                                    remove(serverVars.settings + files[length], function terminal_test_application_browser_resetRequest_readdir_remove():void {
                                        flags = flags - 1;
                                        if (flags === 1) {
                                            browserLaunch();
                                        }
                                    });
                                }
                            } while (length > 0);
                        }
                    };
                    if (browser.args.mode === "remote") {
                        const close:testBrowserRoute = {
                            action: "close",
                            exit: "",
                            index: -1,
                            result: [],
                            test: null,
                            transfer: null
                        };
                        websocket.broadcast({
                            data: close,
                            service: "test-browser"
                        }, "browser");
                        browser.methods.delay({
                            action: start,
                            browser: false,
                            delay: 2000,
                            message: "Delaying to close any open browsers."
                        });
                    } else {
                        start();
                    }
                });
            },
            respond: function terminal_test_application_browser_respond(item:testBrowserRoute): void {
                const errorCall = function terminal_test_application_browser_respond_errorCall(data:httpError):void {
                        if (data.agent === undefined && data.type === undefined) {
                            log([`Error on ${data.callType} returning test index ${item.index}`, data.error.toString()]);
                        } else if (data.agent === undefined) {
                            log([`Error on ${data.callType} returning test index ${item.index} result from type ${data.type}`, data.error.toString()]);
                        } else if (data.type === undefined) {
                            log([`Error on ${data.callType} returning test index ${item.index} result from ${data.agent}`, data.error.toString()]);
                        } else {
                            log([`Error on ${data.callType} returning test index ${item.index} result from ${data.agent} of type ${data.type}`, data.error.toString()]);
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
                serverVars.testBrowser.action = "nothing";
                httpAgent.request({
                    agent: "",
                    agentType: "device",
                    callback: function terminal_test_application_browser_respond_callback():void {
                        return;
                    },
                    ip: browser.ip,
                    port: browser.port,
                    payload: JSON.stringify(route),
                    requestError: function terminal_test_application_browser_respond_requestError(errorMessage:NodeJS.ErrnoException, agent:string, type:agentType):void {
                        errorCall({
                            callType: "request",
                            agent: agent,
                            error: errorMessage,
                            type: type
                        });
                    },
                    requestType: "test-browser",
                    responseError: function terminal_test_application_browser_respond_responseError(errorMessage:NodeJS.ErrnoException, agent:string, type:agentType):void {
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
                                    if (tests[aa].delay !== undefined) {
                                        bb = bb + 1;
                                    }
                                } while (aa > 0);
                                return bb;
                            }());
                        vars.verbose = true;
                        if (pass === true) {
                            const passPlural:string = (index === 1)
                                ? ""
                                : "s";
                            browser.exitMessage = `${humanTime(false) + vars.text.green + vars.text.bold}Passed${vars.text.none} all ${totalTests} evaluations from ${index + 1} test${passPlural}.`;
                            browser.methods.exit(index);
                            browser.exitType = 0;
                            return;
                        }
                        browser.exitMessage = `${humanTime(false) + vars.text.angry}Failed${vars.text.none} on test ${vars.text.angry + (index + 1) + vars.text.none}: "${vars.text.cyan + tests[index].name + vars.text.none}" out of ${tests.length} total test${plural} and ${totalTests} evaluations.`;
                        browser.methods.exit(index);
                        browser.exitType = 1;
                    },
                    summary = function terminal_test_application_browser_result_summary(pass:boolean):string {
                        const resultString:string = (pass === true)
                                ? `${vars.text.green}Passed`
                                : `${vars.text.angry}Failed`;
                        return `${humanTime(false) + resultString} ${browser.args.mode} ${index + 1}: ${vars.text.none + tests[index].name}`;
                    },
                    buildNode = function terminal_test_application_Browser_result_buildNode(config:testBrowserTest, elementOnly:boolean):string {
                        let b:number = 0;
                        const node:browserDOM[] = config.node,
                            property:string[] = config.target,
                            nodeLength:number = node.length,
                            propertyLength:number = property.length,
                            output:string[] = (config.target[0] === "window")
                                ? []
                                : ["document"];
                        if (nodeLength > 0) {
                            do {
                                output.push(".");
                                output.push(node[b][0]);
                                if (node[b][1] !== null) {
                                    output.push("(\"");
                                    output.push(node[b][1]);
                                    output.push("\")");
                                }
                                if (node[b][2] !== null) {
                                    output.push("[");
                                    output.push(node[b][2].toString());
                                    output.push("]");
                                }
                                b = b + 1;
                            } while (b < nodeLength);
                        }
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
                            nodeString = `${vars.text.none} ${buildNode(config, false)} ${qualifier}\n${value.replace(/^"/, "").replace(/"$/, "")}`;
                        return star + resultString + nodeString;
                    },
                    failureMessage = function terminal_test_application_browser_result_failureMessage():void {
                        if (result[a][2] === "error") {
                            const error:string = result[a][1]
                                .replace("{\"file\":"   , `{\n    "${vars.text.cyan}file${vars.text.none}"   :`)
                                .replace(",\"column\":" , `,\n    "${vars.text.cyan}column${vars.text.none}" :`)
                                .replace(",\"line\":"   , `,\n    "${vars.text.cyan}line${vars.text.none}"   :`)
                                .replace(",\"message\":", `,\n    "${vars.text.cyan}message${vars.text.none}":`)
                                .replace(",\"stack\":\"", `,\n    "${vars.text.cyan}stack${vars.text.none}"  :\n        `)
                                .replace(/\\n/g, "\n        ")
                                .replace(/@http/g, "  -  http")
                                .replace(/\s*"\s*\}$/, "\n}");
                            failure.push(`     ${vars.text.angry}JavaScript Error${vars.text.none}\n${error}`);
                        } else if (result[a][1].indexOf("Bad test. ") === 0) {
                            const segments:string[] = result[a][1].split(": [");
                            failure.push(`     ${segments[0].replace("Bad test.", `${vars.text.angry}Bad test.${vars.text.none}`)}.`);
                            if (segments.length > 1) {
                                failure.push(`     Provided: ${vars.text.angry}[${segments[1] + vars.text.none}`);
                            }
                            failure.push(`     ${vars.text.cyan + result[a][2] + vars.text.none}`);
                        } else if ((delay === false && result[a][2] === buildNode(tests[index].unit[a], true)) || (delay === true && result[a][2] === buildNode(tests[index].delay, true))) {
                            failure.push(`     ${vars.text.green}Actual value:${vars.text.none}\n${vars.text.cyan + result[a][1].replace(/^"/, "").replace(/"$/, "").replace(/\\"/g, "\"") + vars.text.none}`);
                        } else if ((delay === false && tests[index].unit[a].value === null) || (delay === true && tests[index].delay.value === null)) {
                            failure.push(`     DOM node is not null: ${vars.text.cyan + result[a][2] + vars.text.none}`);
                        } else if ((delay === false && tests[index].unit[a].value === undefined) || (delay === true && tests[index].delay.value === undefined)) {
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
                            failure.push(`     ${vars.text.green}Actual value:${vars.text.none}\n${vars.text.cyan + result[1][1].replace(/^"/, "").replace(/"$/, "").replace(/\\"/g, "\"") + vars.text.none}`);
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
            route: function terminal_test_application_browser_route(data:testBrowserRoute, transmit:transmit):void {
                responder({
                    data: data,
                    service: "test-browser"
                }, transmit);
                if (data.action !== "nothing" && data.action !== "reset-response") {
                    if (browser.methods[data.action] === undefined) {
                        error([`Unsupported action in browser test automation: ${data.action}`]);
                    } else {
                        browser.methods[data.action](data);
                    }
                } else if (data.exit !== "") {
                    log([data.exit]);
                }
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
    };

export default browser;