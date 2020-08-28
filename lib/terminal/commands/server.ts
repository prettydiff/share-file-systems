
/* lib/terminal/commands/server - A command driven HTTP server for running the terminal instance of the application. */
import { AddressInfo } from "net";

import WebSocket from "../../../ws-es6/index.js";

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
const server = function terminal_server(serverCallback:serverCallback):void {
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
        certLogs:string[] = null;
    const certLocation:string = `${vars.projectPath}lib${vars.sep}certificate${vars.sep}`,
        certName:string = "share-file",
        browserFlag:boolean = (function terminal_server_browserTest():boolean {
            let index:number;
            const test:number = process.argv.indexOf("test");
            serverVars.storage = (vars.command === "test_browser")
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
        browser = function terminal_server_browser(httpServer:httpServer):void {
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
                    port:string = (portWeb === 443)
                        ? ""
                        : `:${portWeb}`,
                    browserCommand:string = `${keyword} https://localhost${port}/`;
                vars.node.child(browserCommand, {cwd: vars.cwd}, function terminal_server_browser(errs:nodeError, stdout:string, stdError:string|Buffer):void {
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
        service = function terminal_server_service():void {
            if (https.flag.crt === true && https.flag.key === true) {
                if (https.certificate.cert === "" || https.certificate.key === "") {
                    certificate({
                        caDomain: "share-file-ca",
                        callback: function terminal_server_service_callback(logs:string[]):void {
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
        httpsRead = function terminal_server_httpsRead(certType:certKey):void {
            vars.node.fs.readFile(`${certLocation + certName}.${certType}`, "utf8", function terminal_server_httpsFile_stat_read(fileError:nodeError, fileData:string):void {
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
        httpsFile = function terminal_server_httpsFile(certType:certKey):void {
            vars.node.fs.stat(`${certLocation + certName}.${certType}`, function terminal_server_httpsFile_stat(statError:nodeError):void {
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
                ? vars.version.port
                : Number(process.argv[0]),
        serverError = function terminal_server_serverError(errorMessage:nodeError):void {
            if (errorMessage.code === "EADDRINUSE") {
                if (errorMessage.port === port + 1) {
                    error([`Web socket channel port, ${vars.text.cyan + port + vars.text.none}, is in use!  The web socket channel is 1 higher than the port designated for the HTTP server.`]);
                } else {
                    error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`]);
                }
            } else if (errorMessage.code !== "ETIMEDOUT") {
                error([`${error}`]);
            }
            return;
        },
        start = function terminal_server_start(httpServer:httpServer) {
            const logOutput = function terminal_server_start_logger(storageData:storageItems):void {
                    const output:string[] = [],
                        webPort:string = (serverVars.webPort === 443)
                            ? ""
                            : `:${serverVars.webPort}`,
                        localAddresses = function terminal_server_start_logger_localAddresses(value:[string, string, string]):void {
                            a = value[0].length;
                            if (a < serverVars.addresses[1]) {
                                do {
                                    value[0] = value[0] + " ";
                                    a = a + 1;
                                } while (a < serverVars.addresses[1]);
                            }
                            if (value[0].charAt(0) === " ") {
                                output.push(`     ${value[0]}: ${value[1]}`);
                            } else {
                                output.push(`   ${vars.text.angry}*${vars.text.none} ${value[0]}: ${value[1]}`);
                            }
                        };
                    let a:number = 0;

                    serverVars.device = storageData.device;
                    serverVars.hashDevice = storageData.settings.hashDevice;
                    serverVars.user = storageData.user;
                    if (serverVars.device[serverVars.hashDevice] !== undefined) {
                        serverVars.device[serverVars.hashDevice].ip = serverVars.ipAddress;
                        serverVars.device[serverVars.hashDevice].port = serverVars.webPort;
                    }

                    // discover the web socket port in case its a random port
                    serverVars.wsPort = vars.ws.address().port;
                    if (vars.command.indexOf("test") !== 0) {

                        // log the port information to the terminal
                        output.push(`${vars.text.cyan}HTTP server${vars.text.none} on port: ${vars.text.bold + vars.text.green + portWeb + vars.text.none}`);
                        output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + portWs + vars.text.none}`);
                        if (serverVars.addresses[0].length === 1) {
                            output.push("Local IP address is:");
                        } else {
                            output.push("Local IP addresses are:");
                        }
    
                        serverVars.addresses[0].forEach(localAddresses);
                        output.push(`Address for web browser: ${vars.text.bold + vars.text.green}https://localhost${webPort + vars.text.none}`);
                        output.push("");
                        output.push(`Address for service: ${vars.text.bold + vars.text.green}https://${serverVars.ipAddress + webPort + vars.text.none}`);
                        if (serverVars.addresses[0][0][1] !== serverVars.ipAddress) {
                            if (serverVars.addresses[0][0][2] === "ipv4") {
                                output.push(`or                 : ${vars.text.bold + vars.text.green}https://${serverVars.addresses[0][0][1] + vars.text.none}`);
                            } else {
                                output.push(`or                 : ${vars.text.bold + vars.text.green}https://[${serverVars.addresses[0][0][1]}]${webPort + vars.text.none}`);
                            }
                        }
                        if (certLogs !== null) {
                            certLogs.forEach(function terminal_server_start_logger_certLogs(value:string):void {
                                output.push(value);
                            });
                        }
                        output.push("");
                        log.title("Local Server");
                        log(output, true);
                    }
                    browser(httpServer);
                },
                readComplete = function terminal_server_start_readComplete(storageData:storageItems) {
                    serverVars.brotli = storageData.settings.brotli;
                    serverVars.hashDevice = storageData.settings.hashDevice;
                    serverVars.hashType = storageData.settings.hashType;
                    serverVars.hashUser = storageData.settings.hashUser;
                    serverVars.nameDevice = storageData.settings.nameDevice;
                    serverVars.nameUser = storageData.settings.nameUser;
                    if (Object.keys(serverVars.device).length + Object.keys(serverVars.user).length < 2 || serverVars.addresses[0][0][0] === "disconnected") {
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
                        browser(httpServer);
                        heartbeat.update(hbConfig);
                    }
                },
                listen = function terminal_server_start_listen():void {
                    const serverAddress:AddressInfo = <AddressInfo>httpServer.address(),
                        wsServer:httpServer = vars.node.https.createServer(https.certificate, function terminal_server_start_listen_wsListener():void {
                            return;
                        });
                    serverVars.webPort = serverAddress.port;
                    serverVars.wsPort = (port === 0)
                        ? 0
                        : serverVars.webPort + 1;

                    httpServer.port = serverAddress.port;
                    portWeb = serverAddress.port;
                    wsServer.listen({
                        host: (serverVars.addresses[0].length > 1)
                            ? "::"
                            : "127.0.0.1",
                        port: serverVars.wsPort
                    }, function terminal_server_start_listen_wsListen():void {
                        vars.ws = new WebSocket.Server({
                            server: wsServer
                        });
                        vars.ws.broadcast = function terminal_server_start_listen_socketBroadcast(data:string):void {
                            vars.ws.clients.forEach(function terminal_server_start_listen_socketBroadcast_clients(client):void {
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
                port: port,
                host: (serverVars.addresses[0].length > 1)
                    ? "::"
                    : "127.0.0.1"
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
            callback: function terminal_server_falseCallback():void {}
        };
    }
    httpsFile("crt");
    httpsFile("key");
};

export default server;