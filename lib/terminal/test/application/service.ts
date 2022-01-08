
/* lib/terminal/test/application/service - A list of service test related utilities. */

import common from "../../../common/common.js";
import remove from "../../commands/remove.js";
import readStorage from "../../utilities/readStorage.js";
import sender from "../../server/transmission/sender.js";
import serverVars from "../../server/serverVars.js";
import transmit_http from "../../server/transmission/transmit_http.js";
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

service.addServers = function terminal_test_application_services_addServers(callback:() => void):void {
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
                        service.serverRemote[agentNames.agentType][agentNames.agent] = output.server;
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
    serverVars.settings = `${projectPath}lib${sep}terminal${sep}test${sep}storageService${sep}`;
    readStorage(settingsComplete);
    removal();
};

service.execute = function terminal_test_application_services_execute(config:testExecute):void {
    const index:number = (config.list.length < 1)
            ? config.index
            : config.list[config.index],
        testItem:testService = service.tests[index],
        fs:service_fileSystem = (function terminal_test_application_services_execute_fs():service_fileSystem {
            const file:service_fileSystem = testItem.command.data as service_fileSystem;
            if (testItem.command.service === "file-system") {
                let a:number = file.location.length;
                if (a > 0) {
                    do {
                        a = a - 1;
                        file.location[a] = filePathDecode(null, file.location[a]) as string;
                    } while (a > 0);
                }
            }
            return file;
        }()),
        port:number = (function terminal_test_application_services_execute_port():number {
            if (testItem.command.service === "invite") {
                const invite:service_invite = testItem.command.data as service_invite;
                return invite.agentRequest.ports.http;
            }
            return serverVars.device[serverVars.hashDevice].ports.http;
        }()),
        /*agent:string = (fs.agentSource === undefined || fs.agentSource.device === undefined)
            ? serverVars.hashDevice
            : fs.agentSource.device,*/
        command:string = (function terminal_test_application_services_execute_command():string {
            if (testItem.command.service === "invite") {
                const invite:service_invite = testItem.command.data as service_invite;
                invite.agentRequest.ports = serverVars.device[serverVars.hashDevice].ports;
                invite.agentResponse.ports = serverVars.device[serverVars.hashDevice].ports;
            }
            return filePathDecode(null, JSON.stringify(testItem.command)) as string;
        }()),
        fileSystem:service_fileSystem = service.tests[index].command.data as service_fileSystem,
        name:string = (testItem.name === undefined)
            ? command
            : testItem.name,
        /*header:OutgoingHttpHeaders = (agent === "")
            ? {
                "content-type": "application/json",
                "content-length": Buffer.byteLength(command),
                "agent-hash": serverVars.hashDevice,
                "agent-type": "device",
                "request-type": testItem.command.service
            }
            : {
                "content-type": "application/json",
                "content-length": Buffer.byteLength(command),
                "agent-hash": agent,
                "agent-type": "user",
                "request-type": testItem.command.service
            },*/
        invite:service_invite = testItem.command.data as service_invite,
        /*payload:RequestOptions = {
            headers: header,
            host: loopback,
            method: "POST",
            path: "/",
            port: (testItem.command.service === "invite" && invite.action === "invite-start")
                ? port
                : (agent === "" || fs === null || fs.agentRequest === undefined || fs.agentRequest.device === undefined)
                    ? serverVars.device[serverVars.hashDevice].ports.http
                    : serverVars.device[agent].ports.http,
            timeout: 1000
        },*/
        evaluator = function terminal_test_application_service_execute_evaluator(message:string):void {
            // eslint-disable-next-line
            const testResult:socketData = service.tests[index].test as socketData,
                stringDataTest:service_fileSystem_string = testResult.data as service_fileSystem_string,
                details:service_fileSystem_details = testResult.data as service_fileSystem_details,
                testMessage:service_fileSystem_status = testResult.data as service_fileSystem_status;
            if (typeof testResult === "string") {
                service.tests[index].test = filePathDecode(null, testResult as string) as string;
            } else if (Array.isArray(stringDataTest) === true && typeof stringDataTest.files[0].path === "string") {
                let a:number = stringDataTest.files.length;
                if (a > 0) {
                    do {
                        a = a - 1;
                        stringDataTest.files[a].path = filePathDecode(null, stringDataTest.files[a].path) as string;
                    } while (a > 0);
                }
            } else if (details !== undefined && details.dirs !== undefined && details.dirs !== null) {
                let a:number = details.dirs.length,
                    dir:directoryList = details.dirs as directoryList;
                if (a > 0) {
                    do {
                        a = a -1;
                        dir[a][0] = filePathDecode(null, dir[a][0]) as string;
                    } while (a > 0);
                }
            } else if (testMessage !== undefined && testMessage.message !== undefined) {
                testMessage.message = filePathDecode(null, testMessage.message) as string;
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
        };/*,
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
                    requestItem.end();
                    evaluator(chunks.join(""));
                }, 25);
            });
        },
        requestItem:ClientRequest = (serverVars.secure === true)
            ? httpsRequest(payload, requestCallback)
            : httpRequest(payload, requestCallback);*/
    if (typeof service.tests[index].artifact === "string") {
        service.tests[index].artifact = filePathDecode(null, service.tests[index].artifact) as string;
    }
    if (typeof service.tests[index].file === "string") {
        service.tests[index].file = filePathDecode(null, service.tests[index].file) as string;
    }
    sender.send(service.tests[index].command, fileSystem.agentRequest.device, fileSystem.agentRequest.user);
    /*requestItem.on("error", function terminal_test_application_service_execute_error(reqError:Error):void {
        evaluator(`fail - Failed to execute on service test: ${name}: ${reqError.toString()}`);
    });

    requestItem.write(command);
    requestItem.end();*/
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