
/* lib/terminal/commands/test_simulation - A command driven wrapper for running simulation tests of supported terminal commands. */
import log from "../utilities/log.js";
import testListRunner from "../test/test_runner.js";
import vars from "../utilities/vars.js";

// run the test suite using the build application
const test_simulation = function terminal_testSimulation():void {
    log.title("Run Simulation Tests");
    testListRunner("simulation", function terminal_testSimulation_callback(message:string, failCount:number):void {
        vars.verbose = true;
        log([message], true);
        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    });
};

export default test_simulation;