
/* lib/terminal/commands/service - A command driven HTTP service for running the terminal instance of the application. */
import { AddressInfo } from "net";

import certificate from "./certificate.js";
import common from "../../common/common.js";
import createServer from "../server/createServer.js";
import error from "../utilities/error.js";
import heartbeat from "../server/heartbeat.js";
import log from "../utilities/log.js";
import readStorage from "../utilities/readStorage.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

// @ts-ignore - the WS library is not written with TypeScript or type identity in mind
import WebSocket from "../../ws-es6/index.js";


// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const service = function terminal_commands_service(serverCallback:serverCallback):void {
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
    (function terminal_commands_service_insecure():void {
        const insecure:number = process.argv.indexOf("insecure"),
            secure:number = process.argv.indexOf("secure");
        if (insecure > -1) {
            serverVars.secure = false;
            process.argv.splice(insecure, 1);
        }
        if (secure > -1) {
            serverVars.secure = true;
            process.argv.splice(secure, 1);
        }
    }());
    const certLocation:string = `${vars.projectPath}lib${vars.sep}certificate${vars.sep}`,
        certName:string = "share-file",
        browserFlag:boolean = (function terminal_commands_service_browserTest():boolean {
            let index:number;
            const test:number = process.argv.indexOf("test");
            if (test > -1) {
               process.argv.splice(test, 1);
               serverVars.settings = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
            }
            index = process.argv.indexOf("browser");
            if (index > -1) {
                process.argv.splice(index, 1);
                return true;
            }
            return false;
        }()),
        scheme:string = (serverVars.secure === true)
            ? "https"
            : "http",
        browser = function terminal_commands_service_browser(httpServer:httpServer):void {
            // open a browser from the command line
            serverCallback.callback({
                agent: serverCallback.agent,
                agentType: serverCallback.agentType,
                server: httpServer,
                webPort: portWeb,
                wsPort: portWs
            });
            if (browserFlag === true) {
                const browserCommand:string = `${serverVars.executionKeyword} ${scheme}://localhost${portString}/`;
                vars.node.child(browserCommand, {cwd: vars.cwd}, function terminal_commands_service_browser_child(errs:Error, stdout:string, stdError:Buffer | string):void {
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
                    start(vars.node.https.createServer(https.certificate, createServer));
                }
            }
        },
        httpsRead = function terminal_commands_service_httpsRead(certType:certKey):void {
            vars.node.fs.readFile(`${certLocation + certName}.${certType}`, "utf8", function terminal_commands_service_httpsFile_stat_read(fileError:Error, fileData:string):void {
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
            vars.node.fs.stat(`${certLocation + certName}.${certType}`, function terminal_commands_service_httpsFile_stat(statError:Error):void {
                if (statError === null) {
                    httpsRead(certType);
                } else {
                    https.flag[certType] = true;
                    certCheck();
                }
            });
        },
        port:number = (function terminal_commands_service_port():number {
            const len:number = process.argv.length;
            let index:number = 0,
                item:number = -1;
            do {
                item = Number(process.argv[index]);
                if (isNaN(item) === false) {
                    break;
                }
                index = index + 1;
            } while (index < len);
            if (index === len) {
                item = -1;
            }
            return (serverVars.testType === "service" || serverVars.testType === "browser_self" )
                ? 0
                : (item > -1)
                    ? item
                    : (serverVars.secure === true)
                        ? 443
                        : 80;
        }()),
        serverError = function terminal_commands_service_serverError(errorMessage:NodeJS.ErrnoException):void {
            if (errorMessage.code === "EADDRINUSE") {
                error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`]);
            } else if (errorMessage.code !== "ETIMEDOUT") {
                error([errorMessage.toString()]);
            }
        },
        start = function terminal_commands_service_start(httpServer:httpServer):void {
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
                                agentFrom: "localhost-browser",
                                broadcastList: null,
                                shares: null,
                                status: "active",
                                type: "device"
                            };
                            heartbeat({
                                dataString: JSON.stringify(update),
                                ip: "",
                                serverResponse: null,
                                task: "heartbeat-update"
                            });

                            serverVars.device[serverVars.hashDevice].port = serverVars.webPort;
                        }
                    }

                    // discover the web socket port in case its a random port
                    serverVars.wsPort = serverVars.ws.address().port;

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
                    browser(httpServer);
                },
                readComplete = function terminal_commands_service_start_readComplete(settings:settingsItems):void {
                    serverVars.brotli = settings.configuration.brotli;
                    serverVars.hashDevice = settings.configuration.hashDevice;
                    serverVars.hashType = settings.configuration.hashType;
                    serverVars.hashUser = settings.configuration.hashUser;
                    serverVars.message = settings.message;
                    serverVars.nameDevice = settings.configuration.nameDevice;
                    serverVars.nameUser = settings.configuration.nameUser;
                    logOutput(settings);
                },
                listen = function terminal_commands_service_start_listen():void {
                    const serverAddress:AddressInfo = httpServer.address() as AddressInfo,
                        wsServer:httpServer = (serverVars.secure === true)
                            ? vars.node.https.createServer(https.certificate, function terminal_commands_service_start_listen_wsListenerSecure():void {
                                return;
                            })
                            : vars.node.http.createServer(function terminal_commands_service_start_listen_wsListener():void {
                                return;
                            });
                    serverVars.webPort = serverAddress.port;
                    serverVars.wsPort = (port === 0)
                        ? 0
                        : serverVars.webPort + 1;

                    httpServer.port = serverAddress.port;
                    portWeb = serverAddress.port;
                    portString = ((portWeb === 443 && serverVars.secure === true) || (portWeb === 80 && serverVars.secure === false))
                        ? ""
                        : `:${portWeb}`;
                    wsServer.listen({
                        host: "127.0.0.1",
                        port: serverVars.wsPort
                    }, function terminal_commands_service_start_listen_wsListen():void {
                        serverVars.ws = new WebSocket.Server({
                            server: wsServer
                        });
                        portWs = serverVars.ws._server.address().port;
                        serverVars.wsPort = portWs;
                        readStorage(readComplete);
                    });
                };

            if (process.cwd() !== vars.projectPath) {
                process.chdir(vars.projectPath);
            }

            // start the service
            httpServer.on("error", serverError);
            httpServer.listen({
                port: port
            }, listen);
        };
    if (serverVars.testType === "" && process.argv[0] !== undefined && isNaN(Number(process.argv[0])) === true) {
        error([`Specified port, ${vars.text.angry + process.argv[0] + vars.text.none}, is not a number.`]);
        return;
    }
    if (serverCallback === undefined) {
        serverCallback = {
            agent: "",
            agentType: "device",
            callback: function terminal_commands_service_falseCallback():void {}
        };
    }
    if (serverVars.secure === true) {
        httpsFile("crt");
        httpsFile("key");
    } else {
        start(vars.node.http.createServer(createServer));
    }
};

export default service;