
import log from "./log.js";
import testListRunner from "../../test/testListRunner.js";
import vars from "./vars.js";

// run the test suite using the build application
const test_simulation = function terminal_testSimulation():void {
    log.title("Run Simulation Tests");
    testListRunner("simulation", function terminal_testSimulation_callback():void {
        vars.verbose = true;
        log([`All ${vars.text.green + vars.text.bold} simulation ${vars.text.none} tests complete... Exiting clean!\u0007`], true);
        process.exit(0);
        return;
    });
};

export default test_simulation;