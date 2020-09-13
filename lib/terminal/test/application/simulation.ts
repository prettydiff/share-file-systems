
/* lib/terminal/test/samples/simulation - A list of command related tests for running shell simulations against the supported commands. */

import testEvaluation from "../application/evaluation.js";
import vars from "../../utilities/vars.js";

import tests from "../samples/simulation.js";

const simulation:testSimulationApplication = {
    tests: tests
};

simulation.execute = function test_simulations_execute(config:testExecute):void {
    const testArg:string = (vars.testLogFlag === "simulation")
            ? " application_test_log_argument"
            : "",
        index:number = (config.list.length < 1)
            ? config.index
            : config.list[config.index];
    vars.node.child(`${vars.version.command} ${simulation.tests[index].command + testArg}`, {cwd: vars.cwd, maxBuffer: 2048 * 500}, function test_simulations_execution_child(errs:nodeError, stdout:string, stdError:string|Buffer) {
        const test:string = (typeof simulation.tests[index].test === "string")
                ? <string>simulation.tests[index].test
                : JSON.stringify(simulation.tests[index].test),
            error:string = (errs === null)
                ? ""
                : errs.toString();
        simulation.tests[index].test = test.replace("version[command]", vars.version.command).replace("version[name]", vars.version.name);
        testEvaluation({
            callback: config.complete,
            fail: config.fail,
            index: config.index,
            list: config.list,
            test: simulation.tests[index],
            testType: "simulation",
            values: [stdout, error, stdError.toString()]
        });
    });
}

export default simulation;