
/* lib/terminal/test/samples/browser - A list of tests that execute in the web browser. */

import { ServerResponse } from "http";

import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import server from "../../commands/server.js";
import serverVars from "../../server/serverVars.js";
import vars from "../../utilities/vars.js";
import remove from "../../commands/remove.js";
import response from "../../server/response.js";

const browser:testBrowser = [];

// complete the login
browser.push({
    interaction: [
        {
            event: "click",
            node: [["getElementById", "login-user", null]]
        },
        {
            event: "setValue",
            node: [["getElementById", "login-user", null]],
            value: "Primary User"
        },
        {
            event: "click",
            node: [["getElementById", "login-device", null]]
        },
        {
            event: "setValue",
            node: [["getElementById", "login-device", null]],
            value: "Primary Device"
        },
        {
            event: "click",
            node: [
                ["getElementById", "login-device", null],
                ["parentNode", "", null],
                ["parentNode", "", null],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Login form",
    test: [
        // that a local user button is present and active
        {
            node: [
                ["getElementById", "device", null],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "active"
        },
        // that the login messaging is not visible
        {
            node: [
                ["getElementById", "login", null]
            ],
            qualifier: "is",
            target: ["clientHeight"],
            type: "property",
            value: 0
        },
        // that class is removed from body
        {
            node: [
                ["getElementsByTagName", "body", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: null
        }
    ]
});

// refresh the page and test that a user populates and there is no login
browser.push({
    interaction: [
        {
            event: "refresh",
            node: null
        }
    ],
    name: "Refresh following login form completion",
    // assert that login remains complete, login data is stored and written to page
    test: [
        // that a local user button is present and active
        {
            node: [
                ["getElementById", "device", null],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "active"
        },
        // that the login messaging is not visible
        {
            node: [
                ["getElementById", "login", null]
            ],
            qualifier: "is",
            target: ["clientHeight"],
            type: "property",
            value: 0
        },
        // that class is removed from body
        {
            node: [
                ["getElementsByTagName", "body", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: null
        }
    ]
});
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getElementById", "menuToggle", null]
            ]
        }
    ],
    name: "Display the primary menu",
    test: [
        {
            // primary menu is visible
            node: [
                ["getElementById", "menu", null]
            ],
            qualifier: "is",
            target: ["style", "display"],
            type: "property",
            value: "block"
        }
    ]
});
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getElementById", "fileNavigator", null]
            ]
        }
    ],
    name: "Launch 'File Navigator' modal from primary menu",
    test: [
        {
            // third modal in page is a file navigation modal
            node: [
                ["getElementsByClassName", "box", 2]
            ],
            qualifier: "begins",
            target: ["id"],
            type: "attribute",
            value: "fileNavigate-"
        },
        {
            // that file navigation modal contains an address bar
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByTagName", "input", 0]
            ],
            qualifier: "is",
            target: ["placeholder"],
            type: "attribute",
            value: "Optionally type a file system address here."
        },
        {
            // the file navigate modal contains a search field
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByTagName", "input", 1]
            ],
            qualifier: "is",
            target: ["placeholder"],
            type: "attribute",
            value: "⌕ Search"
        },
        {
            // the file navigate modal contains a status bar
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "status-bar", 0]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "<p>"
        },
        {
            // the file navigate modal displays file system results with a directory
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "directory"
        },
        {
            // that directory contains an expansion button
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "expansion"
        },
        {
            // that file navigator modal contains a back button
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "backDirectory"
        },
        {
            // that file navigator modal contains a reload button
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "reloadDirectory"
        },
        {
            // that file navigator modal contains a parent navigation button
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 2]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "parentDirectory"
        }
    ]
});
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getElementById", "menuToggle", null]
            ]
        }
    ],
    name: "Close menu",
    test: [
        {
            node: [
                ["getElementById", "menu", null]
            ],
            qualifier: "is",
            target: ["style", "display"],
            type: "property",
            value: "none"
        }
    ]
});
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Directory expansion",
    test: [
        {
            // the first child list item of the expanded directory thus contains its own expansion button
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "span", 0]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "Expand this folder"
        },
        // the first child list of the expanded directory is itself a directory
        {
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "span", 1]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "directory"
        }
    ]
});
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByTagName", "input", 0]
            ]
        },
        {
            event: "setValue",
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByTagName", "input", 0]
            ],
            value: vars.projectPath
        },
        {
            event: "blur",
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByTagName", "input", 0]
            ]
        }
    ],
    name: "Change file navigator file system location",
    test: [
        {
            // the first file system item is .git
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "label", 0]
            ],
            qualifier: "ends",
            target: ["innerHTML"],
            type: "property",
            value: ".git"
        },
        {
            // the last file system item is version.json
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", -1],
                ["getElementsByTagName", "label", 0]
            ],
            qualifier: "ends",
            target: ["innerHTML"],
            type: "property",
            value: "version.json"
        }
    ]
});
browser.push({
    interaction: [
        {
            event: "dblclick",
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
            ]
        }
    ],
    name: "Double click into a directory",
    test: [
        {
            // the file navigator modal address is now at .git
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByTagName", "input", 0]
            ],
            qualifier: "ends",
            target: ["value"],
            type: "property",
            value: ".git"
        }
    ]
});
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 2]
            ]
        }
    ],
    name: "Click the parent directory button",
    test: [
        {
            // the file navigator modal address is now at .git
            node: [
                ["getElementsByClassName", "box", 2],
                ["getElementsByTagName", "input", 0]
            ],
            qualifier: "ends",
            target: ["value"],
            type: "property",
            value: "share-file-systems"
        }
    ]
});

browser.execute = function test_browser_execute():void {
    serverVars.storage = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
    vars.node.fs.readdir(serverVars.storage.slice(0, serverVars.storage.length - 1), function test_browser_execute_readdir(dErr:nodeError, files:string[]):void {
        if (dErr !== null) {
            log([dErr.toString()]);
            error([dErr.toString()]);
            return;
        }
        const browserLaunch = function test_browser_execute_readdir_launch():void {
            const serviceCallback = function test_browser_execute_readdir_launch_serviceCallback():void {
                const keyword:string = (process.platform === "darwin")
                    ? "open"
                    : (process.platform === "win32")
                        ? "start"
                        : "xdg-open",
                    browserCommand:string = (process.argv[0] === "no_close")
                        ? `${keyword} http://localhost:${serverVars.webPort}/?test_browser_no_close`
                        : `${keyword} http://localhost:${serverVars.webPort}/?test_browser`;
                vars.node.child(browserCommand, {cwd: vars.cwd}, function test_browser_execute_readdir_launch_serviceCallback_browser(errs:nodeError):void {
                    if (errs !== null) {
                        log([errs.toString()]);
                        error([errs.toString()]);
                        return;
                    }
                    serverVars.testBrowserCallback = function test_browser_execute_readdir_launch_serviceCallback_browser_testBrowserCallback():void {
                        browser.iterate(0);
                    };
                });
            };
            browser.server = server({
                agent: "",
                agentType: "device",
                callback: serviceCallback
            });
        };
        let length:number = files.length,
            flags:number = length;
        if (length === 1) {
            browserLaunch();
        } else {
            do {
                length = length - 1;
                if (files[length].indexOf(".json") > 0) {
                    remove(serverVars.storage + files[length], function test_browser_execute_readdir_remove():void {
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

browser.iterate = function test_browser_iterate(index:number):void {
    // not writing to storage
    browser[index].index = index;
    serverVars.testBrowser = JSON.stringify(browser[index]);
    const message:string = JSON.stringify({
        "test-browser": browser[index]
    });
    // delay is necessary to prevent a race condition
    // * about 1 in 10 times this will fail following event "refresh"
    // * because serverVars.testBrowser is not updated to methodGET library fast enough
    setTimeout(function test_browser_iterate_delay():void {
        vars.ws.broadcast(message);
    }, 50);
};

browser.result = function test_browser_result(item:testBrowserResult, serverResponse:ServerResponse):void {
    let a:number = 0,
        falseFlag:boolean = false;
    const length:number = item.payload.length,
        completion = function test_browser_result_completion(pass:boolean):void {
            const plural:string = (browser.length === 1)
                    ? ""
                    : "s",
                totalTests:number = (function test_browser_result_completion_total():number {
                    let aa:number = browser.length,
                        bb:number = 0;
                    do {
                        aa = aa - 1;
                        bb = bb + browser[aa].test.length;
                    } while (aa > 0);
                    return bb;
                }()),
                exit = function test_browser_result_completion_exit(type:number, message:string):void {
                    vars.ws.broadcast(JSON.stringify({
                        "test-browser-close": {}
                    }));
                    log([message], true);
                    setTimeout(function test_browser_result_completion_exit_delay() {
                        process.exit(type);
                    }, 25);
                };
            vars.verbose = true;
            if (pass === true) {
                const passPlural:string = (item.index === 1)
                    ? ""
                    : "s";
                exit(0, `${vars.text.green + vars.text.bold}Passed${vars.text.none} all ${totalTests} tests from ${item.index} test campaign${passPlural}.`);
                return;
            }
            exit(1, `${vars.text.angry}Failed${vars.text.none} on test campaign ${vars.text.angry + item.index + vars.text.none}: "${vars.text.cyan + browser[item.index - 1].name + vars.text.none}" out of ${browser.length} total campaign${plural} and ${totalTests} tests.`);
        },
        summary = function test_browser_result_summary(pass:boolean):string {
            const text:string = ` browser test ${item.index}: ${vars.text.none + browser[item.index - 1].name}`,
                resultString:string = (pass === true)
                    ? `${vars.text.green}Passed`
                    : `${vars.text.angry}Failed`;
            return humanTime(false) + resultString + text;
        },
        testString = function test_browser_result_testString(pass:boolean, browserIndex:number, testIndex:number):string {
            const valueStore:primitive = browser[browserIndex].test[testIndex].value,
                valueType:string = typeof valueStore,
                value = (valueStore === null)
                    ? "null"
                    : (valueType === "string")
                        ? `"${valueStore}"`
                        : valueStore.toString(),
                buildNode = function test_Browser_result_buildNode():string {
                    let b:number = 0;
                    const node:browserDOM[] = browser[browserIndex].test[testIndex].node,
                        property:string[] = browser[browserIndex].test[testIndex].target,
                        nodeLength:number = node.length,
                        propertyLength:number = property.length,
                        output:string[] = ["document"];
                    do {
                        output.push(".");
                        output.push(node[b][0]);
                        output.push("(");
                        output.push(node[b][1]);
                        output.push(")");
                        if (node[b][2] !== null) {
                            output.push("[");
                            output.push(node[b][2].toString());
                            output.push("]");
                        }
                        b = b + 1;
                    } while (b < nodeLength);
                    if (browser[browserIndex].test[testIndex].type === "attribute") {
                        output.push(".");
                        output.push("getAttribute(\"");
                        output.push(browser[browserIndex].test[testIndex].target[0]);
                        output.push("\")");
                    } else if (browser[browserIndex].test[testIndex].type === "property") {
                        b = 0;
                        do {
                            output.push(".");
                            output.push(browser[browserIndex].test[testIndex].target[b]);
                            b = b + 1;
                        } while (b < propertyLength);
                    }
                    return output.join("");
                },
                star:string = `   ${vars.text.angry}*${vars.text.none} `,
                resultString:string = (pass === true)
                    ? `${vars.text.green}Passed:`
                    : `${vars.text.angry}Failed:`,
                qualifier:string = (browser[browserIndex].test[testIndex].qualifier === "begins")
                    ? (pass === true)
                        ? "begins with"
                        : `${vars.text.angry}does not begin with${vars.text.none}`
                    : (browser[browserIndex].test[testIndex].qualifier === "contains")
                        ? (pass === true)
                            ? "contains"
                            : `${vars.text.angry}does not contain${vars.text.none}`
                        : (browser[browserIndex].test[testIndex].qualifier === "ends")
                            ? (pass === true)
                                ? "ends with"
                                : `${vars.text.angry}does not end with${vars.text.none}`
                            : (browser[browserIndex].test[testIndex].qualifier === "is")
                                ? (pass === true)
                                    ? "is"
                                    : `${vars.text.angry}is not${vars.text.none}`
                                : (browser[browserIndex].test[testIndex].qualifier === "not")
                                    ? (pass === true)
                                        ? "is not"
                                        : `${vars.text.angry}is${vars.text.none}`
                                    : (pass === true)
                                        ? "does not contain"
                                        : `${vars.text.angry}contains${vars.text.none}`,
                nodeString = `${vars.text.none} ${buildNode()} ${qualifier} ${value}`;
            return star + resultString + nodeString;
        },
        failure:string[] = [];
    response(serverResponse, "text/plain", `Processing browser test ${item.index}: ${browser[item.index].name}`);
    item.index = item.index + 1;
    do {
        failure.push(testString((item.payload[a][0] === true), item.index - 1, a));
        if (item.payload[a][0] === false) {
            falseFlag = true;
            failure.push(`     Actual value: ${vars.text.cyan + item.payload[a][1] + vars.text.none}`);
        }
        a = a + 1;
    } while (a < length);
    if (falseFlag === true) {
        failure.splice(0, 0, summary(false));
        log(failure);
        completion(false);
        return;
    }
    log([summary(true)]);
    if (item.index < browser.length) {
        browser.iterate(item.index);
    } else {
        completion(true);
    }
};

export default browser;