
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
        command:string = <string>filePathDecode(null, simulation.tests[index].command);
    simulation.tests[index].command = command;
    if (typeof simulation.tests[index].artifact === "string") {
        simulation.tests[index].artifact = <string>filePathDecode(null, simulation.tests[index].artifact);
    }
    if (typeof simulation.tests[index].file === "string") {
        simulation.tests[index].file = <string>filePathDecode(null, simulation.tests[index].file);
    }
    vars.node.child(`${vars.version.command} ${command}`, {cwd: vars.cwd, maxBuffer: 2048 * 500}, function terminal_test_application_simulations_execution_child(errs:nodeError, stdout:string, stdError:string|Buffer) {
        const test:string = (typeof simulation.tests[index].test === "string")
                ? <string>simulation.tests[index].test
                : JSON.stringify(simulation.tests[index].test),
            error:string = (errs === null)
                ? ""
                : errs.toString();
        simulation.tests[index].test = <string>filePathDecode(null, test.replace("version[command]", vars.version.command).replace("version[name]", vars.version.name));
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