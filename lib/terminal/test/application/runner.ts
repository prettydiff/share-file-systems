
/* lib/terminal/test/application/runner - A test runner that loops through test items in serial, executes those test items, and passes the result message to the evaluation library. */

import agents from "../../../common/agents.js";

import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import remove from "../../commands/remove.js";
import vars from "../../utilities/vars.js";

import service from "../samples/service.js";
import simulation from "../samples/simulation.js";
import testComplete from "./complete.js";
import testMessage from "./message.js";

// runs various tests of different types
const library = {
        agents: agents,
        error: error,
        humanTime: humanTime,
        log: log,
        remove: remove
    },
    list = {
        service: service(),
        simulation: simulation()
    },
    testListRunner = function test_testListRunner(testListType:testListType, callback:Function):void {
        const tests:testItem[]|testServiceArray = list[testListType],
            execution:methodList = {
                service: function test_testListRunner_service(index:number):void {
                    list.service.execute(index, increment);
                },
                simulation: function test_testListRunner_simulation(index:number):void {
                    list.simulation.execute(index, increment);
                }
            },
            len:number = tests.length,
            increment = function test_testListRunner_increment(messages:[string, string]):void {
                const command:string = (typeof tests[a].command === "string")
                        ? <string>tests[a].command
                        : JSON.stringify(tests[a].command),
                    serviceItem:testServiceInstance = (testListType === "service")
                        ? <testServiceInstance>tests[a]
                        : null,
                    name = (testListType === "service")
                        ? serviceItem.name
                        : command,
                    interval = function test_testListRunner_increment_interval():void {
                        a = a + 1;
                        if (a < len) {
                            execution[testListType](a);
                        } else {
                            const complete:testComplete = {
                                callback: callback,
                                fail: fail,
                                testType: testListType,
                                total: len
                            };
                            if (testListType === "service") {
                                list.service.killServers(complete);
                            } else {
                                testComplete(complete);
                            }
                        }
                    };
                fail = testMessage({
                    fail: fail,
                    index: a,
                    messages: messages,
                    name: name,
                    test: <testItem>tests[a],
                    testType: testListType
                });
                if (tests[a].artifact === "" || tests[a].artifact === undefined) {
                    interval();
                } else {
                    library.remove(tests[a].artifact, function test_testListRunner_increment_remove():void {
                        interval();
                    });
                }
            };

        let a:number = 0,
            fail:number = 0;

        if (vars.command === testListType) {
            callback = function test_lint_callback(message:string):void {
                library.log([message, "\u0007"], true); // bell sound
            };
            library.log([`${vars.text.underline + vars.text.bold + vars.version.name} - ${testListType} tests${vars.text.none}`, ""]);
        }

        if (testListType === "service") {
            list.service.addServers(function test_testListRunner_serviceCallback():void {
                execution.service(0);
            });
        } else {
            execution[testListType](0);
        }
    };

export default testListRunner;