
/* lib/terminal/commands/test_simulation - A command driven wrapper for running simulation tests of supported terminal commands. */

import log from "../utilities/log.js";
import simulation from "../test/application/simulation.js";
import testListRunner from "../test/application/runner.js";
import vars from "../utilities/vars.js";

// run the test suite using the build application
const testSimulation = function terminal_commands_testSimulation():void {
    const completeCallback =  function terminal_commands_testSimulation_callback(message:string, failCount:number):void {
        vars.verbose = true;
        log([message], true);
        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    };
    if (vars.testLogFlag !== "") {
        vars.testLogFlag = "simulation";
    }
    if (typeof process.argv[0] === "string") {
        const filter:number[] = [],
            length:number = simulation.tests.length;
        let a:number = 0,
            filterLength:number = 0;
        do {
            if (simulation.tests[a].command.indexOf(process.argv[0]) > -1) {
                filter.push(a);
            }
            a = a + 1;
        } while (a < length);
        filterLength = filter.length;
        if (filterLength < 1) {
            log([`Simulation test names containing ${vars.text.angry + process.argv[0] + vars.text.none} are not found.`]);
        } else {
            log.title("Run Selected Tests");
            simulation.execute({
                complete: completeCallback,
                fail: 0,
                index: 0,
                list: filter
            });
        }
    } else {
        log.title("Run All Simulation Tests");
        testListRunner("simulation", completeCallback);
    }
};

export default testSimulation;