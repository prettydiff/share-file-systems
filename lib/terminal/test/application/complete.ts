/* lib/terminal/test/application/complete - Final messaging for a completed test type. */

import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const testComplete = function terminal_test_application_testComplete(complete:testComplete):void {
    log(["", ""]);
    if (complete.fail > 0) {
        const plural:string = (complete.fail === 1)
            ? ""
            : "s";
        complete.callback(`${vars.text.angry}Failed ${complete.fail} ${complete.testType + vars.text.none} test${plural} out of ${complete.total} total tests.`, complete.fail);
    } else {
        complete.callback(`${vars.text.green}Successfully completed all ${vars.text.cyan + vars.text.bold + complete.total + vars.text.none + vars.text.green} ${complete.testType} tests.${vars.text.none}`, 0);
    }
}

export default testComplete;