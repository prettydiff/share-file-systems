
/* lib/terminal/test/application/simulation - A list of command related tests for running shell simulations against the supported commands. */

import filePathDecode from "./browserUtilities/file_path_decode.js";
import testEvaluation from "./evaluation.js";
import vars from "../../utilities/vars.js";
 
import tests from "../samples/simulation.js";

const simulation:testSimulationApplication = {
    tests: tests
};

simulation.execute = function terminal_test_application_simulations_execute(config:testExecute):void {
    const index:number = (config.list.length < 1)
            ? config.index
            : config.list[config.index],
        command:string = filePathDecode(null, simulation.tests[index].command) as string;
    simulation.tests[index].command = command;
    if (typeof simulation.tests[index].artifact === "string") {
        simulation.tests[index].artifact = filePathDecode(null, simulation.tests[index].artifact) as string;
    }
    if (typeof simulation.tests[index].file === "string") {
        simulation.tests[index].file = filePathDecode(null, simulation.tests[index].file) as string;
    }
    vars.node.child(vars.command_instruction + command, {cwd: vars.cwd, maxBuffer: 2048 * 500}, function terminal_test_application_simulations_execution_child(errs:Error, stdout:string, stdError:Buffer | string) {
        const test:string = (typeof simulation.tests[index].test === "string")
                ? simulation.tests[index].test as string
                : JSON.stringify(simulation.tests[index].test),
            error:string = (errs === null)
                ? ""
                : errs.toString();
        simulation.tests[index].test = filePathDecode(null, test.replace("version[command]", vars.command_instruction).replace("version[name]", vars.name)) as string;
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
};

export default simulation;