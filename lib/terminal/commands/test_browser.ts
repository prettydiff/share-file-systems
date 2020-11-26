
/* lib/terminal/commands/test_browser - A command driven wrapper for tests to be sent to the browser to impose changes to the DOM and test the result. */

import browser from "../test/application/browser.js";
import log from "../utilities/log.js";
import serverVars from "../server/serverVars.js";

const testBrowser = function terminal_commands_testBrowser():void {
    // Arguments:
    // * demo: slows down the test iteration rate to half a second so that each step is clearly visible
    // * no_close: keeps services online and the browser open after completion of the tests
    // * mode: determines what to execute
    //    - self: (default) executes tests that run on only the local machine
    //    - agents: executes tests that require multiple computers, the other computers must be running "remote" mode
    //    - full: executes the "self" tests and then the "agent" tests as a single list
    //    - remote: puts the computer into test mode listening for test instructions, the receiving end of the "agent" tests
    const spliceBoolean = function terminal_commands_testBrowser_spliceBoolean(arg:string):boolean {
            const index:number = process.argv.indexOf(arg);
            if (index < 0) {
                return false;
            }
            process.argv.splice(index, 1);
            return true;
        },
        spliceString = function terminal_commands_testBrowser_spliceString(arg:string):string {
            let len:number = process.argv.length,
                value:string;
            if (len > 0) {
                do {
                    len = len - 1;
                    if (process.argv[len].indexOf(arg) === 0) {
                        value = process.argv[len].replace(arg, "");
                        if (arg === "mode:" && (value === "agents" || value === "full" || value === "remote" || value === "self")) {
                            return value;
                        }
                        return "self";
                    }
                } while (len > 0);
            }
            if (arg === "mode:") {
                return "self";
            }
        },
        args:testBrowserArgs = {
            callback: function terminal_commands_testBrowser_callback(message:string, exit:number):void {
                log([message], true);
                process.exit(exit);
            },
            demo: spliceBoolean("demo"),
            mode: <testBrowserMode>spliceString("mode:"),
            noClose: spliceBoolean("no_close")
        };
    serverVars.secure = false;
// one browser test sample
// * send to browser via vars.ws.broadcast = browser-test
// * still need to define a validation case from storage/settings
// * need to save data to a temporary location
// * need to define secondary devices/browsers that process different instructions
//     - the secondary systems must store data in a temporary location and transmit settings back to the primary
// * need to remove or reset temporary files before running test samples
    log.title("Browser Tests", true);
    browser.execute(args);
};

//todo
// 2 write support for args.mode:remote
// 3 define close for remote only to close the browser
// 4 'agents' delete test storage on remotes at start of test and launch browser

export default testBrowser;