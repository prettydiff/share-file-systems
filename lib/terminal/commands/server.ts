
/* lib/terminal/commands/server - A command driven HTTP server for running the terminal instance of the application. */
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
const server = function terminal_commands_server(serverCallback:serverCallback):void {
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
        insecure:boolean = (serverVars.secure === false)
            ? true
            : (function terminal_commands_server_insecure():boolean {
                const index:number = process.argv.indexOf("insecure");
                if (index < 0) {
                    return false;
                }
                serverVars.secure = false;
                process.argv.splice(index, 1);
                return true;
            }()),
        browserFlag:boolean = (function terminal_commands_server_browserTest():boolean {
            let index:number;
            const test:number = process.argv.indexOf("test");
            serverVars.storage = (vars.command === "test_browser" || vars.command === "test_browser_remote")
                ? `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`
                : (vars.command.indexOf("test") === 0 || test > -1)
                    ? `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageService${vars.sep}`
                    : `${vars.projectPath}lib${vars.sep}storage${vars.sep}`;
            if (test > -1) {
               process.argv.splice(test, 1);
            }
            index = process.argv.indexOf("browser");
            if (index > -1) {
                process.argv.splice(index, 1);
                return true;
            }
            return false;
        }()),
        scheme:string = (insecure === true)
            ? "http"
            : "https",
        browser = function terminal_commands_server_browser(httpServer:httpServer):void {
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
                vars.node.child(browserCommand, {cwd: vars.cwd}, function terminal_commands_server_browser(errs:nodeError, stdout:string, stdError:string|Buffer):void {
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
        service = function terminal_commands_server_service():void {
            if (https.flag.crt === true && https.flag.key === true) {
                if (https.certificate.cert === "" || https.certificate.key === "") {
                    certificate({
                        caDomain: "share-file-ca",
                        callback: function terminal_commands_server_service_callback(logs:string[]):void {
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
        httpsRead = function terminal_commands_server_httpsRead(certType:certKey):void {
            vars.node.fs.readFile(`${certLocation + certName}.${certType}`, "utf8", function terminal_commands_server_httpsFile_stat_read(fileError:nodeError, fileData:string):void {
                https.flag[certType] = true;
                if (fileError === null) {
                    if (certType === "crt") {
                        https.certificate.cert = fileData;
                    } else {
                        https.certificate[certType] = fileData;
                    }
                }
                service();
            });
        },
        httpsFile = function terminal_commands_server_httpsFile(certType:certKey):void {
            vars.node.fs.stat(`${certLocation + certName}.${certType}`, function terminal_commands_server_httpsFile_stat(statError:nodeError):void {
                if (statError === null) {
                    httpsRead(certType);
                } else {
                    https.flag[certType] = true;
                    service();
                }
            });
        },
        port:number = (vars.command === "test_service" || vars.command === "test")
            ? 0
            : (isNaN(Number(process.argv[0])) === true)
                ? (insecure === true && vars.version.port === 443)
                    ? 80
                    : vars.version.port
                : Number(process.argv[0]),
        serverError = function terminal_commands_server_serverError(errorMessage:nodeError):void {
            if (errorMessage.code === "EADDRINUSE") {
                if (errorMessage.port === port + 1) {
                    error([`Web socket channel port, ${vars.text.cyan + port + vars.text.none}, is in use!  The web socket channel is 1 higher than the port designated for the HTTP server.`]);
                } else {
                    error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`]);
                }
            } else if (errorMessage.code !== "ETIMEDOUT") {
                error([errorMessage.toString()]);
            }
        },
        start = function terminal_commands_server_start(httpServer:httpServer) {
            const logOutput = function terminal_commands_server_start_logger(storageData:storageItems):void {
                    const output:string[] = [],
                        localAddresses = function terminal_commands_server_start_logger_localAddresses():void {
                            let longest:number = 0;
                            const nameLength = function terminal_commands_server_start_logger_localAddresses_nameLength(scheme:"IPv6"|"IPv4"):void {
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
                                format = function terminal_commands_server_start_logger_localAddresses_format(scheme:"IPv6"|"IPv4"):void {
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

                    if (vars.command !== "test_service") {
                        serverVars.device = storageData.device;
                        serverVars.hashDevice = storageData.settings.hashDevice;
                        serverVars.user = storageData.user;
                        if (serverVars.device[serverVars.hashDevice] !== undefined) {
                            serverVars.device[serverVars.hashDevice].ip = serverVars.ipAddress;
                            serverVars.device[serverVars.hashDevice].port = serverVars.webPort;
                        }
                    }

                    // discover the web socket port in case its a random port
                    serverVars.wsPort = vars.ws.address().port;
                    if (vars.command === "test_browser_remote" || vars.command.indexOf("test") !== 0) {

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

                        output.push(`Address for web browser: ${vars.text.bold + vars.text.green + scheme}://localhost${portString + vars.text.none}`);
                        output.push(`Address for service    : ${vars.text.bold + vars.text.green + scheme}://${serverVars.ipAddress + portString + vars.text.none}`);
                        if (portString !== "") {
                            if (serverVars.ipFamily === "IPv6") {
                                output.push(`or                     : ${vars.text.bold + vars.text.green + scheme}://[${serverVars.addresses.IPv6[0][0]}]${portString + vars.text.none}`);
                            } else {
                                output.push(`or                     : ${vars.text.bold + vars.text.green + scheme}://${serverVars.addresses.IPv4[0][0]}:${portString + vars.text.none}`);
                            }
                        }
                        if (certLogs !== null) {
                            certLogs.forEach(function terminal_commands_server_start_logger_certLogs(value:string):void {
                                output.push(value);
                            });
                        }
                        output.push("");
                        if (vars.command === "test_browser_remote") {
                            output.push("");
                        } else {
                            log.title("Local Server");
                        }
                        log(output, true);
                    }
                    browser(httpServer);
                },
                readComplete = function terminal_commands_server_start_readComplete(storageData:storageItems) {
                    serverVars.brotli = storageData.settings.brotli;
                    serverVars.hashDevice = storageData.settings.hashDevice;
                    serverVars.hashType = storageData.settings.hashType;
                    serverVars.hashUser = storageData.settings.hashUser;
                    serverVars.nameDevice = storageData.settings.nameDevice;
                    serverVars.nameUser = storageData.settings.nameUser;
                    if (Object.keys(serverVars.device).length + Object.keys(serverVars.user).length < 2 || (serverVars.addresses.IPv6[0][1] === "disconnected" && serverVars.addresses.IPv4[0][1] === "disconnected")) {
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
                listen = function terminal_commands_server_start_listen():void {
                    const serverAddress:AddressInfo = <AddressInfo>httpServer.address(),
                        wsServer:httpServer = (insecure === true)
                            ? vars.node.http.createServer(function terminal_commands_server_start_listen_wsListenerInsecure():void {
                                return;
                            })
                            : vars.node.https.createServer(https.certificate, function terminal_commands_server_start_listen_wsListener():void {
                                return;
                            });
                    serverVars.webPort = serverAddress.port;
                    serverVars.wsPort = (port === 0)
                        ? 0
                        : serverVars.webPort + 1;

                    httpServer.port = serverAddress.port;
                    portWeb = serverAddress.port;
                    portString = ((portWeb === 443 && insecure === false) || (portWeb === 80 && insecure === true))
                        ? ""
                        : (serverVars.ipFamily === "IPv6")
                            ? `[${portWeb}]`
                            :`:${portWeb}`;
                    wsServer.listen({
                        host: (serverVars.ipFamily === "IPv6")
                            ? "::1"
                            : "127.0.0.1",
                        port: serverVars.wsPort
                    }, function terminal_commands_server_start_listen_wsListen():void {
                        vars.ws = new WebSocket.Server({
                            server: wsServer
                        });
                        vars.ws.broadcast = function terminal_commands_server_start_listen_socketBroadcast(data:string):void {
                            vars.ws.clients.forEach(function terminal_commands_server_start_listen_socketBroadcast_clients(client):void {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(data);
                                }
                            });
                        };
                        portWs = vars.ws._server.address().port;
                        serverVars.wsPort = portWs;
                        readStorage(readComplete);
                    });
                };

            if (process.cwd() !== vars.projectPath) {
                process.chdir(vars.projectPath);
            }

            // start the server
            serverVars.watches[vars.projectPath] = vars.node.fs.watch(vars.projectPath, {
                recursive: (process.platform === "win32" || process.platform === "darwin")
            }, serverWatch);
            httpServer.on("error", serverError);
            httpServer.listen({
                port: port
            }, listen);
        };
    if (vars.command.indexOf("test_") !== 0 && process.argv[0] !== undefined && isNaN(Number(process.argv[0])) === true) {
        error([`Specified port, ${vars.text.angry + process.argv[0] + vars.text.none}, is not a number.`]);
        return;
    }
    if (serverCallback === undefined) {
        serverCallback = {
            agent: "",
            agentType: "device",
            callback: function terminal_commands_server_falseCallback():void {}
        };
    }
    if (insecure === true) {
        start(vars.node.http.createServer(createServer));
    } else {
        httpsFile("crt");
        httpsFile("key");
    }
};

export default server;