
/* lib/terminal/test/application/service - A list of service test related utilities. */

import { readdir } from "fs";

import common from "../../../common/common.js";
import remove from "../../commands/remove.js";
import readStorage from "../../utilities/readStorage.js";
import receiver from "../../server/transmission/receiver.js";
import serverVars from "../../server/serverVars.js";
import transmit_http from "../../server/transmission/transmit_http.js";
import vars from "../../utilities/vars.js";

import filePathDecode from "./browserUtilities/file_path_decode.js";
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
    defaultSecure:boolean = serverVars.secure,
    defaultStorage:string = serverVars.settings,

    // start test list
    /**
     * The *service* test type application described as an object.
     * * **addServers** - Starts listeners on random ports simulating various connecting agents.
     * * **agents** - Stores simulated agent identities.
     * * **complete** - Stores an action to perform once all test cases are executed.
     * * **evaluation** - Modifies service message out to ease comparisons and then send the output for comparison.
     * * **execute** - Executes each test case.
     * * **fail** - Counts the number for test failures.
     * * **index** - Stores the current test index number.
     * * **killServers** - Removes the listeners at the conclusion of testing.
     * * **list** - Stores the list of tests to execute.  This could be a filtered list or all tests.
     * * **tests** - Stores the various test cases.
     * 
     * ```typescript
     * interface module_test_serviceApplication {
     *     addServers: (callback:() => void) => void;
     *     agents: {
     *         device: {
     *             [key:string]: Server;
     *         };
     *         user: {
     *             [key:string]: Server;
     *         };
     *     };
     *     evaluation: (input:socketData) => void;
     *     execute: (config:config_test_execute) => void;
     *     complete: testCallback;
     *     fail: number;
     *     index: number;
     *     killServers: (complete:testComplete) => void;
     *     list: number[];
     *     tests: testService[];
     * }
     * ``` */
    service:module_test_serviceApplication = {
        addServers: function terminal_test_application_services_addServers(callback:() => void):void {
            const projectPath:string = vars.projectPath,
                sep:string = vars.sep,
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
                                serverVars[output.agentType][output.agent].ports = output.ports;
                                serverVars[output.agentType][output.agent].ipSelected = loopback;
                                service.agents[agentNames.agentType][agentNames.agent] = output.server;
                                if (output.agentType === "device" && output.agent === serverVars.hashDevice) {
                                    serverVars.ports.ws = output.ports.ws;
                                }
                                complete(counts);
                            };
                            transmit_http.server({
                                browser: false,
                                host: "",
                                port: -1,
                                secure: false,
                                test: false
                            },
                            {
                                agent: agentNames.agent,
                                agentType: agentNames.agentType,
                                callback: serverCallback
                            });
                        },
                        source: serverVars
                    });
                },
                settingsComplete = function terminal_test_application_services_addServers_settingsComplete(settings:settingsItems):void {
                    serverVars.brotli = settings.configuration.brotli;
                    serverVars.hashDevice = settings.configuration.hashDevice;
                    serverVars.hashType = settings.configuration.hashType;
                    serverVars.hashUser = settings.configuration.hashUser;
                    serverVars.nameDevice = settings.configuration.nameDevice;
                    serverVars.nameUser = settings.configuration.nameUser;
                    serverVars.device = settings.device;
                    serverVars.message = settings.message;
                    serverVars.user = settings.user;
        
                    flags.settings = true;
                    if (flags.removal === true) {
                        servers();
                    }
                },
                // remove any trash left behind from a prior test
                removal = function terminal_test_application_services_addServices_removal(dirError:NodeJS.ErrnoException, files:string[]):void {
                    if (dirError === null) {
                        let count:number = 0,
                            a:number = 0;
                        const total:number = files.length,
                            removeCallback = function terminal_test_application_services_addServers_removal_removeCallback():void {
                                count = count + 1;
                                if (count === total) {
                                    flags.removal = true;
                                    if (flags.settings === true) {
                                        servers();
                                    }
                                }
                            };
                        if (total === 1) {
                            removeCallback();
                        } else {
                            do {
                                if (files[a] !== "test_storage.txt") {
                                    remove(`${serverVars.settings}test_storage${sep + files[a]}`, removeCallback);
                                } else {
                                    removeCallback();
                                }
                                a = a + 1;
                            } while (a < total);
                        }
                    }
                };
            serverVars.secure = false;
            serverVars.settings = `${projectPath}lib${sep}terminal${sep}test${sep}storageService${sep}`;
            readStorage(settingsComplete);
            readdir(`${serverVars.settings}test_storage`, removal);
        },
        agents: {
            device: {},
            user: {}
        },
        complete: null,
        evaluation: function terminal_test_application_services_evaluation(input:socketData):void {
            if (input.service === "file-system-status") {
                const result:service_fileSystem_status = input.data as service_fileSystem_status,
                    list:directoryList = result.fileList as directoryList;
                if (list !== null) {
                    list.forEach(function terminal_test_application_services_evaluation_fileListEach(item:directoryItem):void {
                        item[5] = null;
                    });
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
                values: [JSON.stringify(input), "", ""]
            });
        },
        execute: function terminal_test_application_services_execute(config:config_test_execute):void {
            const test:socketData = service.tests[config.index].command;
            test.data = JSON.parse(filePathDecode(null, JSON.stringify(test.data)) as string);
            service.index = config.index;
            receiver(test, {
                socket: transmit_ws.clientList.device[serverVars.hashDevice],
                type: "ws"
            });
        },
        fail: 0,
        index: 0,
        killServers: function terminal_test_application_services_killServers(complete:testComplete):void {
            const agentComplete = function terminal_test_application_services_killServers_agentComplete(counts:agentCounts):void {
                counts.count = counts.count + 1;
                if (counts.count === counts.total) {
                    serverVars.device = {};
                    serverVars.user = {};
                    testComplete(complete);
                }
            };
            serverVars.secure = defaultSecure;
            serverVars.settings = defaultStorage;
            common.agents({
                complete: agentComplete,
                countBy: "agent",
                perAgent: function terminal_test_application_services_killServers_perAgent(agentNames:agentNames, counts:agentCounts):void {
                    service.agents[agentNames.agentType][agentNames.agent].close(function terminal_test_application_services_killServers_perAgent_close():void {
                        agentComplete(counts);
                    });
                },
                source: serverVars
            });
        },
        list: [],
        // populated after listeners are online (addServers method)
        tests: []
    };

export default service;