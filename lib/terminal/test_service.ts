
import log from "./log.js";
import testListRunner from "../../test/testListRunner.js";
import vars from "./vars.js";

// run the test suite using the build application
const test_service = function terminal_testService():void {
    log.title("Run Service Tests");
    testListRunner("service", function terminal_testService_callback():void {
        vars.verbose = true;
        log([`All ${vars.text.green + vars.text.bold} service ${vars.text.none} tests complete... Exiting clean!\u0007`], true);
        process.exit(0);
        return;
    });
};

export default test_service;