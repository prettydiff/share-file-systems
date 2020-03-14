
/* lib/terminal/commands/test_service - A command driven wrapper for the service tests, which test the various services used by the application. */
import log from "../utilities/log.js";
import testListRunner from "../test/testListRunner.js";
import vars from "../utilities/vars.js";

// run the test suite using the build application
const test_service = function terminal_testService():void {
    log.title("Run Service Tests");
    testListRunner("service", function terminal_testService_callback(message:string, failCount:number):void {
        vars.verbose = true;
        log([message], true);
        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
};

export default test_service;