
/* lib/terminal/commands/test_browser_remote - Launches the server and puts the application on standby awaiting instructions from a remote agent. */

import browser from "../test/application/browser.js";
import log from "../utilities/log.js";
import serverVars from "../server/serverVars.js";

const testBrowserRemote = function terminal_commands_testBrowserRemote():void {
    const splice = function terminal_commands_testBrowserRemote_splice(arg:string):boolean {
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
    serverVars.secure = false;
// one browser test sample
// * send to browser via vars.ws.broadcast = browser-test
// * still need to define a validation case from storage/settings
// * need to save data to a temporary location
// * need to define secondary devices/browsers that process different instructions
//     - the secondary systems must store data in a temporary location and transmit settings back to the primary
// * need to remove or reset temporary files before running test samples
    log.title("Browser Tests, Remote Agent", true);
    browser.execute(args);
};

export default testBrowserRemote;