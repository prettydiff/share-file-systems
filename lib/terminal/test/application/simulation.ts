
/* lib/terminal/test/application/simulation - A list of command related tests for running shell simulations against the supported commands. */

import filePathDecode from "./browserUtilities/file_path_decode.js";
import node from "../../utilities/node.js";
import testEvaluation from "./evaluation.js";
import vars from "../../utilities/vars.js";
 
import tests from "../samples/simulation.js";

/**
 * Defines the *simulation* type test application as an object.
 * ```typescript
 * interface module_test_simulationApplication {
 *     execute: (config:config_test_execute) => void; // Executes each test case.
 *     tests  : test_item[];                          // Stores test cases.
 * }
 * ``` */
const simulation:module_test_simulationApplication = {
    execute: function terminal_test_application_simulations_execute(config:config_test_execute):void {
        const command:string = filePathDecode(null, simulation.tests[config.index].command) as string;
        simulation.tests[config.index].command = command;
        if (typeof simulation.tests[config.index].artifact === "string") {
            simulation.tests[config.index].artifact = filePathDecode(null, simulation.tests[config.index].artifact) as string;
        }
        if (typeof simulation.tests[config.index].file === "string") {
            simulation.tests[config.index].file = filePathDecode(null, simulation.tests[config.index].file) as string;
        }
        node.child_process.exec(vars.terminal.command_instruction + command, {cwd: vars.terminal.cwd, maxBuffer: 2048 * 500}, function terminal_test_application_simulations_execution_child(errs:Error, stdout:string, stdError:Buffer | string) {
            const test:string = (typeof simulation.tests[config.index].test === "string")
                    ? simulation.tests[config.index].test
                    : JSON.stringify(simulation.tests[config.index].test),
                error:string = (errs === null)
                    ? ""
                    : errs.toString();
            simulation.tests[config.index].test = filePathDecode(null, test.replace("version[command]", vars.terminal.command_instruction).replace("version[name]", vars.environment.name)) as string;
            testEvaluation({
                callback: config.complete,
                fail: config.fail,
                index: config.index,
                list: config.list,
                test: simulation.tests[config.index],
                testType: "simulation",
                values: [stdout, error, stdError.toString()]
            });
        });
    },
    tests: tests
};

export default simulation;