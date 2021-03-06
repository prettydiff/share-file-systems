
/* lib/terminal/test/application/service - A list of service test related utilities. */

import { ClientRequest, IncomingMessage, OutgoingHttpHeaders, RequestOptions } from "http";

import common from "../../../common/common.js";
import remove from "../../commands/remove.js";
import readStorage from "../../utilities/readStorage.js";
import server from "../../commands/service.js";
import serverVars from "../../server/serverVars.js";
import vars from "../../utilities/vars.js";

import filePathDecode from "./browserUtilities/file_path_decode.js";
import testComplete from "./complete.js";
import testEvaluation from "./evaluation.js";
import tests from "../samples/service.js";

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
    service:testServiceApplication = {
        serverRemote: {
            device: {},
            user: {}
        }
    };

service.addServers = function terminal_test_application_services_addServers(callback:Function):void {
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
                        serverVars[output.agentType][output.agent].port = output.webPort;
                        serverVars[output.agentType][output.agent].ipSelected = loopback;
                        service.serverRemote[agentNames.agentType][agentNames.agent] = output.server;
                        if (output.agentType === "device" && output.agent === serverVars.hashDevice) {
                            serverVars.wsPort = output.wsPort;
                        }
                        complete(counts);
                    };
                    server({
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
        removal = function terminal_test_application_services_addServers_removal():void {
            let count:number = 0;
            const list:string[] = [
                    `${projectPath}serviceTestLocal`,
                    `${projectPath}serviceLocal`,
                    `${projectPath}serviceTestLocal.json`,
                    `${projectPath}serviceLocal.json`,
                    `${projectPath}serviceTestRemote`,
                    `${projectPath}serviceRemote`,
                    `${projectPath}serviceTestRemote.json`,
                    `${projectPath}serviceRemote.json`,
                    `${projectPath}lib${sep}settings${sep}version.json`
                ],
                removeCallback = function terminal_test_application_services_addServers_removal_removeCallback():void {
                    count = count + 1;
                    if (count === list.length) {
                        flags.removal = true;
                        if (flags.settings === true) {
                            servers();
                        }
                    }
                };
            list.forEach(function terminal_test_application_services_addServers_removal_each(value:string):void {
                remove(value, removeCallback);
            });
        };
    serverVars.secure = false;
    serverVars.settings = `${projectPath}lib${sep}terminal${sep}test${sep}settingsService${sep}`;
    readStorage(settingsComplete);
    removal();
};

service.execute = function terminal_test_application_services_execute(config:testExecute):void {
    const index:number = (config.list.length < 1)
            ? config.index
            : config.list[config.index],
        testItem:testService = service.tests[index],
        fs:systemDataFile = (function terminal_test_application_services_execute_fs():systemDataFile {
            const file:systemDataFile = testItem.command as systemDataFile;
            if (testItem.requestType === "fs") {
                let a:number = file.location.length;
                if (a > 0) {
                    do {
                        a = a - 1;
                        file.location[a] = filePathDecode(null, file.location[a]) as string;
                    } while (a > 0);
                }
            }
            if (testItem.requestType.indexOf("heartbeat") === 0) {
                return null;
            }
            return file;
        }()),
        port:number = (function terminal_test_application_services_execute_port():number {
            if (testItem.requestType.indexOf("invite") === 0) {
                const invite:invite = testItem.command as invite;
                return invite.port;
            }
            return null;
        }()),
        agent:string = (testItem.requestType.indexOf("heartbeat") === 0 || fs.agent === undefined || fs.agent.id === undefined)
            ? serverVars.hashDevice
            : fs.agent.id,
        command:string = (function terminal_test_application_services_execute_command():string {
            if (testItem.requestType.indexOf("invite") === 0) {
                const invite:invite = testItem.command as invite;
                if (invite.action === "invite" || invite.action === "invite-response") {
                    if (invite.type === "device") {
                        invite.port = service.serverRemote.device["a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e"].port;
                    } else {
                        // add user hash here once created
                        invite.port = service.serverRemote.user[""].port;
                    }
                } else {
                    invite.port = serverVars.device[serverVars.hashDevice].port;
                }
            }
            return filePathDecode(null, JSON.stringify(testItem.command)) as string;
        }()),
        name:string = (testItem.name === undefined)
            ? command
            : testItem.name,
        header:OutgoingHttpHeaders = (agent === "")
            ? {
                "content-type": "application/json",
                "content-length": Buffer.byteLength(command),
                "agent-hash": serverVars.hashDevice,
                "agent-type": "device",
                "request-type": testItem.requestType
            }
            : {
                "content-type": "application/json",
                "content-length": Buffer.byteLength(command),
                "agent-hash": agent,
                "agent-type": "user",
                "request-type": testItem.requestType
            },
        payload:RequestOptions = {
            headers: header,
            host: loopback,
            method: "POST",
            path: "/",
            port: (testItem.requestType === "invite")
                ? port
                : (agent === "" || fs === null || fs.agent === undefined || fs.agent.type === undefined)
                    ? serverVars.device[serverVars.hashDevice].port
                    : serverVars[fs.agent.type][agent].port,
            timeout: 1000
        },
        evaluator = function terminal_test_application_service_execute_evaluator(message:string):void {
            // eslint-disable-next-line
            const test:any = service.tests[index].test;
            if (typeof test === "string") {
                service.tests[index].test = filePathDecode(null, test as string) as string;
            } else if (Array.isArray(test) === true && typeof test[0].path === "string") {
                const arr:stringData[] = test as stringData[];
                let a:number = arr.length;
                if (a > 0) {
                    do {
                        a = a - 1;
                        test[a].path = filePathDecode(null, test[a].path);
                    } while (a > 0);
                }
            } else if (test["dirs"] !== undefined && test["dirs"] !== null) {
                let a:number = test["dirs"].length;
                if (a > 0) {
                    do {
                        a = a -1;
                        test["dirs"][a][0] = filePathDecode(null, test["dirs"][a][0]);
                    } while (a > 0);
                }
            } else if (test["message"] !== undefined) {
                test["message"] = filePathDecode(null, test["message"]);
            }
            testEvaluation({
                callback: config.complete,
                fail: config.fail,
                index: config.index,
                list: config.list,
                test: service.tests[index] as testService,
                testType: "service",
                values: [message, "", ""]
            });
        },
        requestCallback = function terminal_test_application_service_execute_callback(response:IncomingMessage):void {
            const chunks:string[] = [];
            response.on("data", function terminal_test_application_service_execute_callback_data(chunk:string):void {
                chunks.push(chunk);
            });
            response.on("end", function terminal_test_application_service_execute_callback_end():void {
                // A delay is built into the server to eliminate a race condition between service execution and data writing.
                // * That service delay requires a delay between service test intervals to prevent tests from bleeding into each other.
                // * The delay here is the HTTP round trip plus 25ms.
                setTimeout(function terminal_test_application_service_execute_callback_end_delay():void {
                    httpRequest.end();
                    evaluator(chunks.join(""));
                }, 25);
            });
        },
        scheme:"http"|"https" = (serverVars.secure === true)
            ? "https"
            : "http",
        httpRequest:ClientRequest = vars.node[scheme].request(payload, requestCallback);
    if (typeof service.tests[index].artifact === "string") {
        service.tests[index].artifact = filePathDecode(null, service.tests[index].artifact) as string;
    }
    if (typeof service.tests[index].file === "string") {
        service.tests[index].file = filePathDecode(null, service.tests[index].file) as string;
    }
    httpRequest.on("error", function terminal_test_application_service_execute_error(reqError:Error):void {
        evaluator(`fail - Failed to execute on service test: ${name}: ${reqError.toString()}`);
    });
    httpRequest.write(command);
};

service.killServers = function terminal_test_application_services_killServers(complete:testComplete):void {
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
            service.serverRemote[agentNames.agentType][agentNames.agent].close(function terminal_test_application_services_killServers_perAgent_close():void {
                agentComplete(counts);
            });
        },
        source: serverVars
    });
};

export default service;