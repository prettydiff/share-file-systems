
/* lib/terminal/test/samples/browser - A list of tests that execute in the web browser. */

import error from "../../utilities/error.js";
import log from "../../utilities/log.js";
import server from "../../commands/server.js";
import serverVars from "../../server/serverVars.js";
import vars from "../../utilities/vars.js";
import remove from "../../commands/remove.js";

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
    test: [
        {
            node: ["getElementById", "", null],
            property: ["style", "display"],
            value: "block"
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
    test: [
        {
            node: ["getElementById", "", null],
            property: ["style", "display"],
            value: "block"
        }
    ]
});
    /*{
        event: "click",
        node: [["getElementById", "menuToggle", null]]
    },
    {
        event: "click",
        node: [["getElementById", "fileNavigator", null]]
    }*/

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
                browserCommand:string = `${keyword} http://localhost:${serverVars.webPort}/?test_browser`;
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
    const message:string = JSON.stringify({
        "test-browser": browser[index]
    });
    vars.ws.broadcast(message);
};

export default browser;