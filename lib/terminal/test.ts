
import build from "./build.js";
import log from "./log.js";
import vars from "./vars.js";

// run the test suite using the build application
const test = function terminal_test():void {
    log.title("Run All Test and Validation Scenarios");
    build(true, function terminal_test_callback():void {
        vars.verbose = true;
        log([`All ${vars.text.green + vars.text.bold} test ${vars.text.none} tasks complete... Exiting clean!\u0007`], true);
        process.exit(0);
        return;
    });
};

export default test;