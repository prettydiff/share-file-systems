
/* lib/terminal/server/service - Produces the application's service listeners. */

import { exec } from "child_process";
import { readFile, stat } from "fs";
import { createServer as httpServer} from "http";
import { createServer as httpsServer} from "https";
import { AddressInfo, Server } from "net";

import certificate from "../commands/certificate.js";
import common from "../../common/common.js";
import error from "../utilities/error.js";
import heartbeat from "../server/services/heartbeat.js";
import httpAgent from "../server/transmission/httpAgent.js";
import log from "../utilities/log.js";
import readStorage from "../utilities/readStorage.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";
import websocket from "../server/transmission/websocket.js";

const service = function terminal_server_service(serverOptions:serverOptions, serverCallback:serverCallback):void {
    // at this time the serverCallback argument is only used by test automation and so its availability
    // * locks the server to address ::1 (loopback)
    // * bypasses messaging users on server start up
    // * bypasses some security checks
    let portWeb:number,
        portWs:number,
        https:certificate = {
            certificate: {
                cert: "",
                key: ""
            },
            flag: {
                crt: false,
                key: false
            }
        },
        portString:string = "",
        certLogs:string[] = null;
    const certLocation:string = `${vars.projectPath}lib${vars.sep}certificate${vars.sep}`,
        certName:string = "share-file",
        scheme:string = (serverVars.secure === true)
            ? "https"
            : "http",
        browser = function terminal_commands_service_browser(server:Server):void {
            // open a browser from the command line
            if (serverCallback !== null) {
                serverCallback.callback({
                    agent: serverCallback.agent,
                    agentType: serverCallback.agentType,
                    ports: {
                        http: portWeb,
                        ws: portWs
                    },
                    server: server
                });
            }
            if (serverOptions.browser === true) {
                const browserCommand:string = `${serverVars.executionKeyword} ${scheme}://localhost${portString}/`;
                exec(browserCommand, {cwd: vars.cwd}, function terminal_commands_service_browser_child(errs:Error, stdout:string, stdError:Buffer | string):void {
                    if (errs !== null) {
                        error([errs.toString()]);
                        return;
                    }
                    if (stdError !== "") {
                        error([stdError.toString()]);
                        return;
                    }
                    log(["", "Launching default web browser..."]);
                });
            }
        },
        certCheck = function terminal_commands_service_certCheck():void {
            if (https.flag.crt === true && https.flag.key === true) {
                if (https.certificate.cert === "" || https.certificate.key === "") {
                    certificate({
                        caDomain: "share-file-ca",
                        callback: function terminal_commands_service_certCheck_callback(logs:string[]):void {
                            https.flag.crt = false;
                            https.flag.key = false;
                            httpsRead("crt");
                            httpsRead("key");
                            certLogs = logs;
                        },
                        caName: "share-file-ca",
                        days: 16384,
                        domain: "share-file",
                        location: certLocation,
                        mode: "create",
                        name: certName,
                        organization: "share-file",
                        selfSign: false
                    });
                } else {
                    // this is where the server is invoked
                    start(httpsServer(https.certificate, httpAgent.receive));
                }
            }
        },
        httpsRead = function terminal_commands_service_httpsRead(certType:certKey):void {
            readFile(`${certLocation + certName}.${certType}`, "utf8", function terminal_commands_service_httpsFile_stat_read(fileError:Error, fileData:string):void {
                https.flag[certType] = true;
                if (fileError === null) {
                    if (certType === "crt") {
                        https.certificate.cert = fileData;
                    } else {
                        https.certificate[certType] = fileData;
                    }
                }
                certCheck();
            });
        },
        httpsFile = function terminal_commands_service_httpsFile(certType:certKey):void {
            stat(`${certLocation + certName}.${certType}`, function terminal_commands_service_httpsFile_stat(statError:Error):void {
                if (statError === null) {
                    httpsRead(certType);
                } else {
                    https.flag[certType] = true;
                    certCheck();
                }
            });
        },
        port:number = (function terminal_commands_service_port():number {
            if (serverOptions.port > -1) {
                return serverOptions.port;
            }
            return (serverVars.testType === "service" || serverVars.testType === "browser_self" )
                ? 0
                : (serverVars.secure === true)
                    ? 443
                    : 80;
        }()),
        serverError = function terminal_commands_service_serverError(errorMessage:NodeJS.ErrnoException):void {
            if (errorMessage.code === "EADDRINUSE") {
                error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`], true);
            } else if (errorMessage.code !== "ETIMEDOUT") {
                error([errorMessage.toString()]);
            }
        },
        start = function terminal_commands_service_start(server:Server):void {
            const ipList = function terminal_commands_service_start_ipList(callback:(ip:string) => void):void {
                    const addresses = function terminal_commands_service_start_ipList_addresses(scheme:"IPv4"|"IPv6"):void {
                        let a:number = serverVars.localAddresses[scheme].length;
                        if (a > 0) {
                            do {
                                a = a - 1;
                                callback(serverVars.localAddresses[scheme][a]);
                            } while (a > 0);
                        }
                    };
                    addresses("IPv6");
                    addresses("IPv4");
                },
                logOutput = function terminal_commands_service_start_logger(settings:settingsItems):void {
                    const output:string[] = [];

                    if (vars.command !== "test" && vars.command !== "test_service") {
                        serverVars.device = settings.device;
                        serverVars.hashDevice = settings.configuration.hashDevice;
                        serverVars.user = settings.user;
                        if (serverVars.device[serverVars.hashDevice] !== undefined) {
                            // let everybody know this agent was offline but is now active
                            const update:heartbeatUpdate = {
                                action: "update",
                                agentFrom: "localhost-browser",
                                broadcastList: null,
                                shares: null,
                                status: "active",
                                type: "device"
                            };
                            if (vars.command !== "test_browser" || (vars.command === "test_browser" && serverVars.testType !== "browser_remote")) {
                                heartbeat({
                                    data: update,
                                    service: "heartbeat"
                                }, null);
                            }

                            serverVars.device[serverVars.hashDevice].ports = serverVars.ports;
                        }
                    }

                    // exclude from tests except for browser tests
                    if (serverVars.testType === "browser_remote" || serverVars.testType === "") {

                        // log the port information to the terminal
                        output.push(`${vars.text.cyan}HTTP server${vars.text.none} on port: ${vars.text.bold + vars.text.green + portWeb + vars.text.none}`);
                        output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + portWs + vars.text.none}`);

                        output.push("");
                        if (serverVars.localAddresses.IPv6.length + serverVars.localAddresses.IPv4.length === 1) {
                            output.push("Local IP address is:");
                        } else {
                            output.push("Local IP addresses are:");
                        }
                        output.push("");

                        output.push(`Address for web browser: ${vars.text.bold + vars.text.green + scheme}://localhost${portString + vars.text.none}`);
                        output.push("Listening on addresses:");
                        ipList(function terminal_commands_service_start_logOutput_ipList(ip:string):void {
                            output.push(`   ${vars.text.angry}*${vars.text.none} ${ip}`);
                        });
                        if (certLogs !== null) {
                            certLogs.forEach(function terminal_commands_service_start_logOutput_certLogs(value:string):void {
                                output.push(value);
                            });
                        }
                        output.push("");
                        if (serverVars.testType === "browser_remote") {
                            output.push("");
                        } else {
                            log.title("Local Server");
                            output.push(`Total messages sent/received: ${common.commas(serverVars.message.length)}`);
                            output.push(`For command documentation execute: ${vars.text.cyan + vars.command_instruction}commands${vars.text.none}`);
                        }
                        log(output, true);
                    }
                    browser(server);
                },
                listen = function terminal_commands_service_start_listen():void {
                    const serverAddress:AddressInfo = server.address() as AddressInfo;
                    websocket.server({
                        address: "::1",
                        callback: function terminal_commands_service_start_listen_websocketCallback(port:number):void {
                            portWs = port;
                            serverVars.ports.ws = port;
                            readStorage(function terminal_commands_service_start_listen_websocketCallback_readComplete(settings:settingsItems):void {
                                serverVars.brotli = settings.configuration.brotli;
                                serverVars.hashDevice = settings.configuration.hashDevice;
                                serverVars.hashType = settings.configuration.hashType;
                                serverVars.hashUser = settings.configuration.hashUser;
                                serverVars.message = settings.message;
                                serverVars.nameDevice = settings.configuration.nameDevice;
                                serverVars.nameUser = settings.configuration.nameUser;
                                logOutput(settings);
                            });
                        },
                        cert: (serverVars.secure === true)
                            ? {
                                cert: https.certificate.cert,
                                key: https.certificate.key
                            }
                            : null,
                        port: (port === 0)
                            ? 0
                            : serverAddress.port + 1
                    });
                    serverVars.ports.http = serverAddress.port;
                    portWeb = serverAddress.port;
                    portString = ((portWeb === 443 && serverVars.secure === true) || (portWeb === 80 && serverVars.secure === false))
                        ? ""
                        : `:${portWeb}`;
                };

            if (process.cwd() !== vars.projectPath) {
                process.chdir(vars.projectPath);
            }

            // start the service
            server.on("error", serverError);
            if (serverOptions.host === "") {
                server.listen({
                    port: port
                }, listen);
            } else {
                server.listen({
                    host: serverOptions.host,
                    port: port
                }, listen);
            }
        };

    if (serverOptions.test === true) {
        serverVars.settings = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
    }
    serverVars.secure = serverOptions.secure;
    if (isNaN(serverOptions.port) === true || serverOptions.port < 0 || serverOptions.port > 65535) {
        serverOptions.port = -1;
    } else {
        serverOptions.port = Math.floor(serverOptions.port);
    }
    if (serverCallback === undefined) {
        serverCallback = null;
    }

    if (serverVars.secure === true) {
        httpsFile("crt");
        httpsFile("key");
    } else {
        start(httpServer(httpAgent.receive));
    }
};

export default service;