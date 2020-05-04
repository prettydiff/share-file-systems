
/* lib/terminal/test/application/runner - A test runner that loops through test items in serial, executes those test items, and passes the result message to the evaluation library. */

import log from "../../utilities/log.js";
import remove from "../../commands/remove.js";
import vars from "../../utilities/vars.js";

import service from "../samples/service.js";
import simulation from "../samples/simulation.js";

// runs various tests of different types
const library = {
        log: log,
        remove: remove
    },
    list:testTypeCollection = {
        service: service,
        simulation: simulation
    },
    testListRunner = function test_testListRunner(testListType:testListType, callback:Function):void {
        if (vars.command === testListType) {
            callback = function test_lint_callback(message:string):void {
                library.log([message, "\u0007"], true); // bell sound
            };
            library.log([`${vars.text.underline + vars.text.bold + vars.version.name} - ${testListType} tests${vars.text.none}`, ""]);
        }

        if (testListType === "service") {
            const addServers = function test_testListRunner_addServers():void {
                list.service.addServers(function test_testListRunner_serviceCallback():void {
                    list.service.execute(0, list.service.length, callback);
                });
            };
            addServers();
        } else {
            list[testListType].execute(0, list[testListType].length, callback);
        }
    };

export default testListRunner;