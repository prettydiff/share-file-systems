
/* lib/terminal/commands/test_browser - A command driven wrapper for tests to be sent to the browser to impose changes to the DOM and test the result. */

import browser from "../test/samples/browser.js";
import log from "../utilities/log.js";

const test_browser = function terminal_testBrowser():void {
    const demo:boolean = (process.argv.indexOf("demo") > -1);
// one browser test sample
// * send to browser via vars.ws.broadcast = browser-test
// * still need to define a validation case from storage/settings
// * need to save data to a temporary location
// * need to define secondary devices/browsers that process different instructions
//     - the secondary systems must store data in a temporary location and transmit settings back to the primary
// * need to remove or reset temporary files before running test samples
    log.title("Browser Tests");
    browser.execute(demo);
};

export default test_browser;