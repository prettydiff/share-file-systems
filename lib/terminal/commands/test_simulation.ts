
/* lib/terminal/commands/test_simulation - A command driven wrapper for running simulation tests of supported terminal commands. */

import log from "../utilities/log.js";
import simulation from "../test/simulation.js";
import test_complete from "../test/test_complete.js";
import testListRunner from "../test/test_runner.js";
import testMessage from "../test/test_message.js";
import vars from "../utilities/vars.js";

// run the test suite using the build application
const test_simulation = function terminal_testSimulation():void {
    const completeCallback =  function terminal_testSimulation_callback(message:string, failCount:number):void {
        vars.verbose = true;
        log([message], true);
        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    };
    if (typeof process.argv[0] === "string") {
        const sim:testSimulationArray = simulation(),
            filter:number[] = [],
            length:number = sim.length;
        let a:number = 0,
            filterLength:number = 0;
        do {
            if (sim[a].command.indexOf(process.argv[0]) > -1) {
                filter.push(a);
            }
            a = a + 1;
        } while (a < length);
        filterLength = filter.length;
        if (filterLength < 1) {
            log([`Simulation test names containing ${vars.text.angry + process.argv[0] + vars.text.none} are not found.`]);
        } else {
            let b:number = 0,
                fail:number = 0;
            const logger = function terminal_testServices_addCallback_logger(messages:[string, string]) {
                const item:testItem = sim[b];
                testMessage({
                    fail: fail,
                    index: b,
                    messages: messages,
                    name: item.command,
                    test: item,
                    testType: "selected"
                });
                b = b + 1;
                if (b === filterLength) {
                    test_complete({
                        callback: completeCallback,
                        fail: fail,
                        testType: "selected",
                        total: filterLength
                    });
                } else {
                    sim.execute(filter[b], logger);
                }
            };
            log.title("Run Selected Tests");
            sim.execute(filter[0], logger);
        }
    } else {
        log.title("Run All Simulation Tests");
        testListRunner("simulation", completeCallback);
    }
};

export default test_simulation;