
/* lib/terminal/test/application/runner - A test runner that loops through test items in serial, executes those test items, and passes the result message to the evaluation library. */

import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

import service from "../application/service.js";
import simulation from "../application/simulation.js";

// runs various tests of different types
const list:testTypeCollection = {
        service: service,
        simulation: simulation
    },
    testListRunner = function terminal_test_application_testListRunner(testListType:testListType, callback:Function):void {
        if (vars.testLogFlag !== "") {
            vars.testLogFlag = testListType;
        }
        if (vars.command === testListType) {
            callback = function terminal_test_application_testListRunner_callback(message:string):void {
                log([message, "\u0007"], true); // bell sound
            };
            log([`${vars.text.underline + vars.text.bold + vars.version.name} - ${testListType} tests${vars.text.none}`, ""]);
        }

        if (testListType === "service") {
            const addServers = function terminal_test_application_testListRunner_addServers():void {
                list.service.addServers(function terminal_test_application_testListRunner_addServers_callback():void {
                    list.service.execute({
                        complete: callback,
                        fail: 0,
                        index: 0,
                        list: []
                    });
                });
            };
            addServers();
        } else {
            list[testListType].execute({
                complete: callback,
                fail: 0,
                index: 0,
                list: []
            });
        }
    };

export default testListRunner;