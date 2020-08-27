
/* lib/terminal/commands/test_browser - A command driven wrapper for tests to be sent to the browser to impose changes to the DOM and test the result. */

import browser from "../test/application/browser.js";
import log from "../utilities/log.js";

const test_browser = function terminal_testBrowser():void {
    const splice = function terminal_testBrowser_splice(arg:string):boolean {
            const index:number = process.argv.indexOf(arg);
            if (index < 0) {
                return false;
            }
            process.argv.splice(index, 1);
            return true;
        },
        args:testBrowserArgs = {
            demo: splice("demo"),
            noClose: splice("no_close")
        };
// one browser test sample
// * send to browser via vars.ws.broadcast = browser-test
// * still need to define a validation case from storage/settings
// * need to save data to a temporary location
// * need to define secondary devices/browsers that process different instructions
//     - the secondary systems must store data in a temporary location and transmit settings back to the primary
// * need to remove or reset temporary files before running test samples
    log.title("Browser Tests");
    browser.execute(args);
};

export default test_browser;