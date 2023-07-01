
/* lib/terminal/commands/interface/test_browser - Shell interface for tests to be sent to the browser to impose changes to the DOM and test the result. */

import browser from "../../test/application/browser.js";

const testBrowser = function terminal_commands_interface_testBrowser(callback:commandCallback):void {
    // Arguments:
    // * demo: slows down the test iteration rate to half a second so that each step is clearly visible
    // * no_close: keeps services online and the browser open after completion of the tests
    // * mode: determines what to execute
    //    - self: (default) executes tests that run on only the local machine
    //    - agents: executes tests that require multiple computers, the other computers must be running "remote" mode
    //    - full: executes the "self" tests and then the "agent" tests as a single list
    //    - remote: puts the computer into test mode listening for test instructions, the receiving end of the "agent" tests
    const spliceBoolean = function terminal_commands_interface_testBrowser_spliceBoolean(arg:string):boolean {
            const index:number = process.argv.indexOf(arg);
            if (index < 0) {
                return false;
            }
            process.argv.splice(index, 1);
            return true;
        },
        mode = function terminal_commands_interface_testBrowser_mode():test_browserMode {
            if (process.argv.indexOf("remote") > -1) {
                return "remote";
            }
            if (process.argv.indexOf("delete") > -1) {
                return "delete";
            }
            if (process.argv.indexOf("device") > -1) {
                return "device";
            }
            if (process.argv.indexOf("user") > -1) {
                return "user";
            }
            return "self";
        },
        args:config_test_browserExecute = {
            callback: function terminal_commands_interface_testBrowser_callback(title:string, text:string[], fail:boolean):void {
                const exit:0|1 = (fail === true)
                    ? 1
                    : 0;
                callback(title, text, fail);
                process.exit(exit);
            },
            demo: spliceBoolean("demo"),
            mode: mode(),
            noClose: spliceBoolean("no_close")
        };
    browser.methods.execute(args);
};

export default testBrowser;