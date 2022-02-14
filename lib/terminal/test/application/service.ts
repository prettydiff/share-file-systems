
/* lib/terminal/test/application/service - A list of service test related utilities. */

import common from "../../../common/common.js";
import readStorage from "../../utilities/readStorage.js";
import receiver from "../../server/transmission/receiver.js";
import transmit_http from "../../server/transmission/transmit_http.js";
import vars from "../../utilities/vars.js";

import filePathDecode from "./browserUtilities/file_path_decode.js";
import storage_removal from "./browserUtilities/storage_removal.js";
import testComplete from "./complete.js";
import testEvaluation from "./evaluation.js";
import tests from "../samples/service.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";

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
     *             [key:string]: Server;
     *         };
     *         user: {
     *             [key:string]: Server;
     *         };
     *     };                                             // Stores simulated agent identities.
     *     complete: testCallback;                        // Stores an action to perform once all test cases are executed.
     *     evaluation: (input:socketData) => void;        // Modifies service message out to ease comparisons and then send the output for comparison.
     *     execute: (config:config_test_execute) => void; // Executes each test case.
     *     fail: number;                                  // Counts the number for test failures.
     *     index: number;                                 // Stores the current test index number.
     *     killServers: (complete:testComplete) => void;  // Removes the listeners at the conclusion of testing.
     *     list: number[];                                // Stores the list of tests to execute. This could be a filtered list or all tests.
     *     tests: testService[];                          // Stores the various test cases.
     * }
     * ``` */
    service:module_test_serviceApplication = {
        addServers: function terminal_test_application_services_addServers(callback:() => void):void {
            const projectPath:string = vars.path.project,
                sep:string = vars.path.sep,
                flags = {
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
                            const serverCallback = function terminal_test_application_services_addServers_servers_perAgent_serverCallback(output:serverOutput):void {
                                vars.settings[output.agentType][output.agent].ports = output.ports;
                                vars.settings[output.agentType][output.agent].ipSelected = loopback;
                                service.agents[agentNames.agentType][agentNames.agent] = output.server;
                                if (output.agentType === "device" && output.agent === vars.settings.hashDevice) {
                                    vars.environment.ports.ws = output.ports.ws;
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
                        source: vars.settings
                    });
                },
                settingsComplete = function terminal_test_application_services_addServers_settingsComplete(settings:settingsItems):void {
                    vars.settings.brotli = settings.configuration.brotli;
                    vars.settings.hashDevice = settings.configuration.hashDevice;
                    vars.settings.hashType = settings.configuration.hashType;
                    vars.settings.hashUser = settings.configuration.hashUser;
                    vars.settings.nameDevice = settings.configuration.nameDevice;
                    vars.settings.nameUser = settings.configuration.nameUser;
                    vars.settings.device = settings.device;
                    vars.settings.message = settings.message;
                    vars.settings.user = settings.user;
        
                    flags.settings = true;
                    if (flags.removal === true) {
                        servers();
                    }
                };
            vars.path.settings = `${projectPath}lib${sep}terminal${sep}test${sep}storageService${sep}`;
            readStorage(settingsComplete);
            storage_removal(function terminal_test_application_services_addServers_storageRemoval():void {
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
                    list:directoryList = result.fileList as directoryList;
                if (list !== null) {
                    const sort = function terminal_test_application_services_evaluation_sort(a:directoryItem, b:directoryItem):-1|1 {
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
                        each = function terminal_test_application_services_evaluation_fileListEach(item:directoryItem):void {
                            item[5] = null;
                        };
                    list.forEach(each);
                    list.sort(sort);
                }
                input.data = result;
            }
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
            test.data = JSON.parse(filePathDecode(null, JSON.stringify(test.data)) as string);
            service.index = config.index;
            service.fail = config.fail;
            receiver(test, {
                socket: transmit_ws.clientList.device[vars.settings.hashDevice],
                type: "ws"
            });
        },
        fail: 0,
        index: 0,
        killServers: function terminal_test_application_services_killServers(complete:testComplete):void {
            const agentComplete = function terminal_test_application_services_killServers_agentComplete(counts:agentCounts):void {
                counts.count = counts.count + 1;
                if (counts.count === counts.total) {
                    vars.settings.device = {};
                    vars.settings.user = {};
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
                source: vars.settings
            });
        },
        list: [],
        // populated after listeners are online (addServers method)
        tests: []
    };

export default service;