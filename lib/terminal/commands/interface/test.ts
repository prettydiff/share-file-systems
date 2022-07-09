
/* lib/terminal/commands/interface/test - Shell interface wrapping all test automation utilities. */
import build from "../library/build.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

// run the test suite using the build application
const test = function terminal_commands_interface_test():void {
    log.title("Run All Test and Validation Scenarios", true);
    build(true, function terminal_commands_interface_test_callback():void {
        vars.settings.verbose = true;
        log([`All ${vars.text.green + vars.text.bold}test${vars.text.none} tasks complete... Exiting clean!\u0007`], true);
        process.exit(0);
        return;
    });
};

export default test;