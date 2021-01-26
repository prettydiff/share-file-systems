
/* lib/terminal/commands/service - A command driven HTTP service for running the terminal instance of the application. */
import { AddressInfo } from "net";

import WebSocket from "../../ws-es6/index.js";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import readStorage from "../utilities/readStorage.js";
import vars from "../utilities/vars.js";

import certificate from "./certificate.js";

import createServer from "../server/createServer.js";
import heartbeat from "../server/heartbeat.js";
import serverVars from "../server/serverVars.js";
import serverWatch from "../server/serverWatch.js";


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
    const ip:string = (function terminal_commands_service_ip():string {
            let a:number = process.argv.length,
                address:string;
            if (a > 0) {
                do {
                    a = a - 1;
                    if (process.argv[a].indexOf("ip:") === 0) {
                        address = process.argv[a].replace("ip:", "");
                        process.argv.splice(a, 1);
                        if ((/^(\d{1,3}\.){3}\d{1,3}$/).test(address) === true) {
                            serverVars.ipAddress = address;
                            serverVars.ipFamily = "IPv4";
                            return address;
                        }
                        if ((/[0-9a-f]{4}:/).test(address) === true || address.indexOf("::") > -1) {
                            serverVars.ipAddress = address;
                            serverVars.ipFamily = "IPv6";
                            return address;
                        }
                    }
                } while (a > 0);
            }
            return serverVars.ipAddress;
        }()),
        certLocation:string = `${vars.projectPath}lib${vars.sep}certificate${vars.sep}`,
        certName:string = "share-file",
        testBrowserRemote:boolean = (serverVars.testType === "browser_agents" && serverVars.testBrowser !== null && serverVars.testBrowser.index < 0),
        browserFlag:boolean = (function terminal_commands_service_browserTest():boolean {
            let index:number;
            const test:number = process.argv.indexOf("test");
            if (test > -1) {
               process.argv.splice(test, 1);
               serverVars.storage = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
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
                const keyword:string = (process.platform === "darwin")
                        ? "open"
                        : (process.platform === "win32")
                            ? "start"
                            : "xdg-open",
                    browserCommand:string = `${keyword} ${scheme}://localhost${portString}/`;
                vars.node.child(browserCommand, {cwd: vars.cwd}, function terminal_commands_service_browser_child(errs:nodeError, stdout:string, stdError:string|Buffer):void {
                    if (errs !== null) {
                        error([errs.toString()]);
                        return;
                    }
                    if (stdError !== "" && stdError.indexOf("The ESM module loader is experimental.") < 0) {
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
            vars.node.fs.readFile(`${certLocation + certName}.${certType}`, "utf8", function terminal_commands_service_httpsFile_stat_read(fileError:nodeError, fileData:string):void {
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
            vars.node.fs.stat(`${certLocation + certName}.${certType}`, function terminal_commands_service_httpsFile_stat(statError:nodeError):void {
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
                    : (vars.version.port === 443 && serverVars.secure === false)
                        ? 80
                        : vars.version.port;
        }()),
        serverError = function terminal_commands_service_serverError(errorMessage:nodeError):void {
            if (errorMessage.code === "EADDRINUSE") {
                if (errorMessage.port === port + 1) {
                    error([`Web socket channel port, ${vars.text.cyan + port + vars.text.none}, is in use!  The web socket channel is 1 higher than the port designated for the HTTP service.`]);
                } else {
                    error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`]);
                }
            } else if (errorMessage.code !== "ETIMEDOUT") {
                error([errorMessage.toString()]);
            }
        },
        start = function terminal_commands_service_start(httpServer:httpServer) {
            const logOutput = function terminal_commands_service_start_logger(storageData:storageItems):void {
                    const output:string[] = [],
                        localAddresses = function terminal_commands_service_start_logger_localAddresses():void {
                            let longest:number = 0;
                            const nameLength = function terminal_commands_service_start_logger_localAddresses_nameLength(scheme:"IPv6"|"IPv4"):void {
                                    let a:number = 0;
                                    const total:number = serverVars.addresses[scheme].length;
                                    if (total > 0) {
                                        do {
                                            if (serverVars.addresses[scheme][a][1].length > longest) {
                                                longest = serverVars.addresses[scheme][a][1].length;
                                            }
                                            a = a + 1;
                                        } while (a < total);
                                    }
                                },
                                format = function terminal_commands_service_start_logger_localAddresses_format(scheme:"IPv6"|"IPv4"):void {
                                    let a:number = 0,
                                        b:number,
                                        name:string;
                                    const total:number = serverVars.addresses[scheme].length;
                                    if (total > 0) {
                                        do {
                                            b = serverVars.addresses[scheme][a][1].length;
                                            name = serverVars.addresses[scheme][a][1];
                                            if (b < longest) {
                                                do {
                                                    name = `${name} `;
                                                    b = b + 1;
                                                } while (b < longest);
                                            }
                                            output.push(`   ${vars.text.angry}*${vars.text.none} ${name}: ${serverVars.addresses[scheme][a][0]}`);
                                            a = a + 1;
                                        } while (a < total);
                                    }
                                };
                            nameLength("IPv6");
                            nameLength("IPv4");
                            format("IPv6");
                            format("IPv4");
                        };

                    if (vars.command !== "test" && vars.command !== "test_service") {
                        serverVars.device = storageData.device;
                        serverVars.hashDevice = storageData.settings.hashDevice;
                        serverVars.user = storageData.user;
                        if (serverVars.device[serverVars.hashDevice] !== undefined) {
                            serverVars.device[serverVars.hashDevice].ip = ip;
                            serverVars.device[serverVars.hashDevice].port = serverVars.webPort;
                        }
                    }

                    // discover the web socket port in case its a random port
                    serverVars.wsPort = vars.ws.address().port;

                    // exclude from tests except for browser tests
                    if (testBrowserRemote === true || serverVars.testType === "") {

                        // log the port information to the terminal
                        output.push(`${vars.text.cyan}HTTP server${vars.text.none} on port: ${vars.text.bold + vars.text.green + portWeb + vars.text.none}`);
                        output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + portWs + vars.text.none}`);

                        output.push("");
                        if (serverVars.addresses.IPv6.length + serverVars.addresses.IPv4.length === 1) {
                            output.push("Local IP address is:");
                        } else {
                            output.push("Local IP addresses are:");
                        }
                        localAddresses();
                        output.push("");

                        output.push(`Address for web browser: ${vars.text.bold + vars.text.green + scheme}://localhost${portString.replace("[", ":").replace("]", "") + vars.text.none}`);
                        output.push(`Address for service    : ${vars.text.bold + vars.text.green + scheme}://${ip + portString + vars.text.none}`);
                        if (certLogs !== null) {
                            certLogs.forEach(function terminal_commands_service_start_logger_certLogs(value:string):void {
                                output.push(value);
                            });
                        }
                        output.push("");
                        if (testBrowserRemote === true) {
                            output.push("");
                        } else {
                            log.title("Local Server");
                        }
                        log(output, true);
                    }
                    browser(httpServer);
                },
                readComplete = function terminal_commands_service_start_readComplete(storageData:storageItems) {
                    serverVars.brotli = storageData.settings.brotli;
                    serverVars.hashDevice = storageData.settings.hashDevice;
                    serverVars.hashType = storageData.settings.hashType;
                    serverVars.hashUser = storageData.settings.hashUser;
                    serverVars.nameDevice = storageData.settings.nameDevice;
                    serverVars.nameUser = storageData.settings.nameUser;
                    if (Object.keys(serverVars.device).length + Object.keys(serverVars.user).length < 2 || ((serverVars.addresses.IPv6.length < 1 || serverVars.addresses.IPv6[0][1] === "disconnected") && serverVars.addresses.IPv4[0][1] === "disconnected")) {
                        logOutput(storageData);
                    } else {
                        const hbConfig:heartbeatUpdate = {
                            agentFrom: "localhost-terminal",
                            broadcastList: null,
                            response: null,
                            shares: {},
                            status: "idle",
                            type: "device"
                        };
                        logOutput(storageData);
                        heartbeat.update(hbConfig);
                    }
                },
                listen = function terminal_commands_service_start_listen():void {
                    const serverAddress:AddressInfo = <AddressInfo>httpServer.address(),
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
                        : (serverVars.ipFamily === "IPv6")
                            ? `[${portWeb}]`
                            :`:${portWeb}`;
                    wsServer.listen({
                        host: (serverVars.ipFamily === "IPv6")
                            ? "::1"
                            : "127.0.0.1",
                        port: serverVars.wsPort
                    }, function terminal_commands_service_start_listen_wsListen():void {
                        vars.ws = new WebSocket.Server({
                            server: wsServer
                        });
                        portWs = vars.ws._server.address().port;
                        serverVars.wsPort = portWs;
                        readStorage(readComplete);
                    });
                };

            if (process.cwd() !== vars.projectPath) {
                process.chdir(vars.projectPath);
            }

            // start the service
            serverVars.watches[vars.projectPath] = vars.node.fs.watch(vars.projectPath, {
                recursive: (serverVars.testType.indexOf("browser") < 0 && (process.platform === "win32" || process.platform === "darwin"))
            }, serverWatch);
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