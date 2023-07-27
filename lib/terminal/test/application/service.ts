
/* lib/terminal/test/application/service - A list of service test related utilities. */

import common from "../../../common/common.js";
import readStorage from "../../utilities/readStorage.js";
import receiver from "../../server/transmission/receiver.js";
import transmit_http from "../../server/transmission/transmit_http.js";
import vars from "../../utilities/vars.js";

import filePathDecode from "./browserUtilities/file_path_decode.js";
import remove from "../../commands/library/remove.js";
import testComplete from "./testComplete.js";
import testEvaluation from "./evaluation.js";
import tests from "../samples/service.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";

// cspell:words brotli

// tests structure
// * artifact - the address of anything written to disk, so that it can be removed
// * command - the command to execute minus the `node js/services` part
// * file - a file system address to open
// * name - a short label to describe the test
// * qualifier - how to test, see simulationItem in index.d.ts for appropriate values
// * share - optional object containing share data to test against
// * test - the value to compare against

const loopback:string = "127.0.0.1",
    defaultStorage:string = vars.path.settings,

    // start test list
    /**
     * The *service* test type application described as an object.
     * ```typescript
     * interface module_test_serviceApplication {
     *     addServers: (callback:() => void) => void;     // Starts listeners on random ports simulating various connecting agents.
     *     agents: {
     *         device: {
     *             [key:string]: node_http_Server;
     *         };
     *         user: {
     *             [key:string]: node_http_Server;
     *         };
     *     };                                             // Stores simulated agent identities.
     *     complete: commandCallback;                     // Stores an action to perform once all test cases are executed.
     *     evaluation: (input:socketData) => void;        // Modifies service message out to ease comparisons and then send the output for comparison.
     *     execute: (config:config_test_execute) => void; // Executes each test case.
     *     fail: number;                                  // Counts the number of test failures.
     *     index: number;                                 // Stores the current test index number.
     *     killServers: (complete:test_complete) => void; // Removes the listeners at the conclusion of testing.
     *     list: number[];                                // Stores the list of tests to execute. This could be a filtered list or all tests.
     *     tests: test_service[];                         // Stores the various test cases.
     * }
     * ``` */
    service:module_test_serviceApplication = {
        addServers: function terminal_test_application_services_addServers(callback:() => void):void {
            const projectPath:string = vars.path.project,
                removePath:string = `${vars.path.project}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}storageTest${vars.path.sep}temp`,
                sep:string = vars.path.sep,
                flags:flagList = {
                    removal: false,
                    settings: false
                },
                servers = function terminal_test_application_services_addServers_servers():void {
                    const complete = function terminal_test_application_services_addServers_servers_complete(counts:agentCounts):void {
                        counts.count = counts.count + 1;
                        if (counts.count === counts.total) {
                            service.tests = tests();
                            callback();
                        }
                    };
                    common.agents({
                        complete: complete,
                        countBy: "agent",
                        perAgent: function terminal_test_application_services_addServers_servers_perAgent(agentNames:agentNames, counts:agentCounts):void {
                            const serverCallback = function terminal_test_application_services_addServers_servers_perAgent_serverCallback(output:http_server_output):void {
                                vars.agents[output.agentType][output.agent].ports = output.ports;
                                vars.agents[output.agentType][output.agent].ipSelected = loopback;
                                service.agents[agentNames.agentType][agentNames.agent] = output.server;
                                if (output.agentType === "device" && output.agent === vars.identity.hashDevice) {
                                    vars.network.ports.ws = output.ports.ws;
                                }
                                complete(counts);
                            };
                            transmit_http.server({
                                browser: false,
                                host: "",
                                port: -1,
                                test: false
                            },
                            {
                                agent: agentNames.agent,
                                agentType: agentNames.agentType,
                                callback: serverCallback
                            });
                        },
                        source: vars
                    });
                },
                settingsComplete = function terminal_test_application_services_addServers_settingsComplete():void {
                    flags.settings = true;
                    if (flags.removal === true) {
                        servers();
                    }
                };
            vars.path.settings = `${projectPath}lib${sep}terminal${sep}test${sep}storageTest${sep}`;
            readStorage(true, settingsComplete);
            remove(removePath, [`${removePath + vars.path.sep}temp.txt`], function terminal_test_application_services_addServers_storageRemoval():void {
                flags.removal = true;
                if (flags.settings === true) {
                    servers();
                }
            });
        },
        agents: {
            device: {},
            user: {}
        },
        complete: null,
        evaluation: function terminal_test_application_services_evaluation(input:socketData):void {
            const replaceFix = function terminal_test_application_services_evaluation_replaceFix(input:string):string {
                return input
                    .replace(/,"ports":\{"http":\d+,"ws":\d+\}/g, ",\"ports\":{\"http\":9999,\"ws\":9999}")
                    .replace(/"IPv4":\["\d+\.\d+\.\d+\.\d+"\]/g, "\"IPv4\":[\"127.0.0.1\"]")
                    .replace(/"IPv6":\[(("[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+")|())\]/g, "\"IPv6\":[\"::1\"]");
            };
            if (input.service === "file-system-status") {
                const result:service_fileSystem_status = input.data as service_fileSystem_status,
                    list:directory_list = result.fileList as directory_list;
                if (list !== null) {
                    const sort = function terminal_test_application_services_evaluation_sort(a:directory_item, b:directory_item):-1|1 {
                            if (a[1] === b[1]) {
                                if (a[0] < b[0]) {
                                    return -1;
                                }
                                return 1;
                            }
                            if (a[1] < b[1]) {
                                return -1;
                            }
                            return 1;
                        },
                        each = function terminal_test_application_services_evaluation_fileListEach(item:directory_item):void {
                            item[5] = null;
                        };
                    list.forEach(each);
                    list.sort(sort);
                }
                input.data = result;
            }
            // eslint-disable-next-line
            service.tests[service.index].test = JSON.parse(filePathDecode(null, JSON.stringify(service.tests[service.index].test)) as string);
            testEvaluation({
                callback: service.complete,
                fail: service.fail,
                index: service.index,
                list: service.list,
                test: service.tests[service.index],
                testType: "service",
                values: [replaceFix(JSON.stringify(input)), "", ""]
            });
        },
        execute: function terminal_test_application_services_execute(config:config_test_execute):void {
            const test:socketData = service.tests[config.index].command;
            // eslint-disable-next-line
            test.data = JSON.parse(filePathDecode(null, JSON.stringify(test.data)) as string);
            service.index = config.index;
            service.fail = config.fail;
            receiver(test, {
                socket: transmit_ws.socketList.device[vars.identity.hashDevice],
                type: "ws"
            });
        },
        fail: 0,
        index: 0,
        killServers: function terminal_test_application_services_killServers(complete:test_complete):void {
            const agentComplete = function terminal_test_application_services_killServers_agentComplete(counts:agentCounts):void {
                counts.count = counts.count + 1;
                if (counts.count === counts.total) {
                    vars.agents.device = {};
                    vars.agents.user = {};
                    testComplete(complete);
                }
            };
            vars.path.settings = defaultStorage;
            common.agents({
                complete: agentComplete,
                countBy: "agent",
                perAgent: function terminal_test_application_services_killServers_perAgent(agentNames:agentNames, counts:agentCounts):void {
                    service.agents[agentNames.agentType][agentNames.agent].close(function terminal_test_application_services_killServers_perAgent_close():void {
                        agentComplete(counts);
                    });
                },
                source: vars
            });
        },
        list: [],
        // populated after listeners are online (addServers method)
        tests: []
    };

export default service;