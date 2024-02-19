
/* lib/terminal/commands/library/service - Starts the application with a running server. */

import agent_management from "../../server/services/agent_management.js";
import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import hash from "./hash.js";
import ipList from "../../utilities/ipList.js";
import log from "../../utilities/log.js";
import node from "../../utilities/node.js";
import readCerts from "../../server/readCerts.js";
import readStorage from "../../utilities/readStorage.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

const service = function terminal_commands_library_service(serverOptions:config_service, serverCallback:service_callback):void {
    node.readline.cursorTo(process.stdout, 0, 0);
    node.readline.clearScreenDown(process.stdout);
    if (serverOptions.test === true) {
        vars.path.settings = `${vars.path.project}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}storageTest${vars.path.sep}temp${vars.path.sep}`;
    }
    readCerts(function terminal_commands_interface_service_startServer_readCerts(options:transmit_tlsOptions):void {
        const server:node_net_Server = transmit_ws.server({
            callback: function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback(addressInfo:node_net_AddressInfo):void {
                const logOutput = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_logOutput():void {
                        const output:string[] = [],
                            port:number = addressInfo.port,
                            portString:string = String(port),
                            scheme:string = (vars.settings.secure === true)
                                ? "https"
                                : "http",
                            section = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_logOutput_section(text:string[], color:string):void {
                                output.push(`${vars.text.angry}*${vars.text.none} ${vars.text.underline + text[0] + vars.text.none}`);
                                if (text.length < 3) {
                                    if (color === "white") {
                                        output.push(`  ${text[1]}`);
                                    } else {
                                        output.push(`  ${vars.text[color] + text[1] + vars.text.none}`);
                                    }
                                } else {
                                    const total:number = text.length;
                                    let index:number = 1;
                                    do {
                                        output.push(`   ${vars.text.angry}-${vars.text.none} ${text[index]}`);
                                        index = index + 1;
                                    } while (index < total);
                                }
                                output.push("");
                            },
                            browser = function terminal_server_transmission_transmitHttp_server_browser(startupLog:string[]):void {
                                // open a browser from the command line
                                if (serverCallback !== null) {
                                    serverCallback.callback({
                                        agent: serverCallback.agent,
                                        agentType: serverCallback.agentType,
                                        log: startupLog,
                                        port: port,
                                        server: server
                                    });
                                }
                                if (serverOptions.browser === true) {
                                    const browserCommand:string = `${vars.terminal.executionKeyword} ${scheme}://${vars.network.domain[0] + portString}/`;
                                    node.child_process.exec(browserCommand, {cwd: vars.terminal.cwd}, function terminal_server_transmission_transmitHttp_server_browser_child(errs:node_childProcess_ExecException, stdout:string, stdError:Buffer | string):void {
                                        if (errs !== null) {
                                            error([], errs);
                                            return;
                                        }
                                        if (stdError !== "") {
                                            error([
                                                "Unexpected data written to stderr when opening browser:",
                                                stdError.toString()
                                            ], null);
                                            return;
                                        }
                                        log(["", "Launching default web browser..."]);
                                    });
                                }
                            };

                        // exclude from tests except for browser tests
                        if (vars.test.type === "browser_remote" || vars.test.type === "") {
                            const networkList:string[] = ipList(vars.agents.device[vars.identity.hashDevice], false, ""),
                                domainList:string[] = [
                                    "Web Page Addresses"
                                ],
                                secureList:string[] = [
                                    "Security Posture"
                                ];
                            section([
                                "Project Location",
                                vars.path.project
                            ], "cyan");

                            networkList.splice(0, 0, "Network Addresses");
                            section(networkList, "white");

                            section([
                                "Ports",
                                `Server: ${vars.text.bold + vars.text.green + portString + vars.text.none}`,
                            ], "white");

                            if (vars.settings.secure === true) {
                                secureList.push(`${vars.text.bold + vars.text.green}Secure${vars.text.none} - Protocols: https, wss`);
                            } else {
                                secureList.push(`${vars.text.angry}Insecure${vars.text.none} - Protocols: http, ws`);
                                secureList.push("Insecure mode is for local testing only and prevents communication to remote agents.");
                            }
                            section(secureList, "white");

                            vars.network.domain.forEach(function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_logOutput_domainListEach(value:string):void {
                                domainList.push(`${scheme}://${value + portString}`);
                            });
                            section(domainList, "cyan");

                            section([
                                "Text Message Count",
                                common.commas(vars.settings.message.length)
                            ], "white");

                            section([
                                "Process ID",
                                process.pid.toString()
                            ], "cyan");

                            section([
                                "Node.js Version",
                                process.version
                            ], "cyan");

                            section([
                                "Verbose Messaging",
                                (vars.settings.verbose)
                                    ? `${vars.text.green + vars.text.bold}On${vars.text.none} - will display network messaging data`
                                    : `${vars.text.angry}Off${vars.text.none} (default)`,
                                "Activated with option 'verbose'.",
                                `Command example: ${vars.text.green + vars.terminal.command_instruction}verbose${vars.text.none}`
                            ], "white");

                            section([
                                "Interactive Documentation from Terminal",
                                `Command example: ${vars.text.green + vars.terminal.command_instruction}commands${vars.text.none}`
                            ], "white");
                        }
                        browser(output);
                    };
                vars.network.port = addressInfo.port;
                if (vars.test.type === "service" || vars.test.type.indexOf("browser_") === 0) {
                    logOutput();
                } else {
                    readStorage(true, function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete(storage:state_storage):void {
                        node.fs.stat(storage.ui.storage, function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_storageStat(storageError:node_error):void {
                            if (storageError === null) {
                                vars.settings.ui.storage = storage.ui.storage;
                            }

                            if (vars.identity.hashDevice === "") {
                                const input:config_command_hash = {
                                    algorithm: "sha3-512",
                                    callback: function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_storageStat_hash(title:string, output:hash_output):void {
                                        vars.identity.hashDevice = output.hash;
                                        logOutput();
                                    },
                                    digest: "hex",
                                    directInput: true,
                                    id: null,
                                    list: false,
                                    parent: null,
                                    source: process.release.libUrl + JSON.stringify(process.env) + process.hrtime.bigint().toString(),
                                    stat: null
                                };
                                hash(input);
                            } else {
                                logOutput();
                                const self:agent = vars.agents.device[vars.identity.hashDevice];
                                if (self !== undefined) {
                                    let count:number = 0;
                                    const keysDevice:string[] = Object.keys(vars.agents.device),
                                        keysUser:string[] = Object.keys(vars.agents.user),
                                        totalDevice:number = keysDevice.length,
                                        totalUser:number = keysUser.length,
                                        complete = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_storageStat_complete():void {
                                            count = count + 1;
                                            if (count === totalDevice + totalUser) {
                                                if (JSON.stringify(self.ipAll.IPv4.sort()) !== JSON.stringify(vars.network.addresses.IPv4.sort()) || JSON.stringify(self.ipAll.IPv6.sort()) !== JSON.stringify(vars.network.addresses.IPv6.sort())) {
                                                    self.ipAll.IPv4 = vars.network.addresses.IPv4;
                                                    self.ipAll.IPv6 = vars.network.addresses.IPv6;
                                                    const agentManagement:service_agentManagement = {
                                                        action: "modify",
                                                        agents: {
                                                            device: {
                                                                [vars.identity.hashDevice]: self
                                                            },
                                                            user: {}
                                                        },
                                                        agentFrom: vars.identity.hashDevice,
                                                        identity: null
                                                    };
                                                    agent_management({
                                                        data: agentManagement,
                                                        service: "agent-management"
                                                    });
                                                }
                                            }
                                        },
                                        list = function terminal_server_transmission_transmitHttp_server_start_listen_websocketCallback_readComplete_storageStat_list(type:agentType):void {
                                            let a:number = (type === "device")
                                                ? totalDevice
                                                : totalUser;
                                            const self:agent = vars.agents.device[vars.identity.hashDevice],
                                                keys:string[] = (type === "device")
                                                    ? keysDevice
                                                    : keysUser;
                                            if (a > 0) {
                                                do {
                                                    a = a - 1;
                                                    if (type === "device" && keys[a] === vars.identity.hashDevice) {
                                                        complete();
                                                    } else if (self.ipAll.IPv4.indexOf(vars.agents[type][keys[a]].ipSelected) > -1 || self.ipAll.IPv6.indexOf(vars.agents[type][keys[a]].ipSelected) > -1) {
                                                        error([`Selected IP ${vars.agents[type][keys[a]].ipSelected} of ${type} ${keys[a]} is an IP assigned to this local device.`], null);
                                                        complete();
                                                    } else {
                                                        vars.agents[type][keys[a]].status = "offline";
                                                        transmit_ws.open.agent({
                                                            agent: keys[a],
                                                            agentType: type,
                                                            callback: complete
                                                        });
                                                    }
                                                } while (a > 0);
                                            }
                                        };
                                    if (vars.settings.secure === true) {
                                        self.port = vars.network.port;
                                        list("device");
                                        list("user");
                                    }
                                }
                            }
                        });
                    });
                }
            },
            host: "",
            options: options,
            port: serverOptions.port
        });
    });
};

export default service;