
/* lib/terminal/commands/server - A command driven HTTP server for running the terminal instance of the application. */
import { IncomingMessage, ServerResponse } from "http";
import { AddressInfo } from "net";
import { StringDecoder } from "string_decoder";
import WebSocket from "../../../ws-es6/index.js";

import copy from "./copy.js";
import directory from "./directory.js";
import error from "../utilities/error.js";
import hash from "./hash.js";
import log from "../utilities/log.js";
import makeDir from "../utilities/makeDir.js";
import remove from "./remove.js";

import vars from "../utilities/vars.js";
import readStorage from "../utilities/readStorage.js";

import forbiddenUser from "../server/forbiddenUser.js";
import heartbeat from "../server/heartbeat.js";
import httpClient from "../server/httpClient.js";
import invite from "../server/invite.js";
import methodGET from "../server/methodGET.js";
import readOnly from "../server/readOnly.js";
import serverVars from "../server/serverVars.js";
import serverWatch from "../server/serverWatch.js";
import storage from "../server/storage.js";


// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const library = {
        copy: copy,
        directory: directory,
        error: error,
        hash: hash,
        heartbeat: heartbeat,
        httpClient: httpClient,
        log: log,
        makeDir: makeDir,
        readStorage: readStorage,
        remove: remove
    },
    // at this time the serverCallback argument is only used by test automation and so its availability
    // * locks the server to address ::1 (loopback)
    // * bypasses messaging users on server start up
    // * bypasses some security checks
    server = function terminal_server(serverCallback:serverCallback):httpServer {
        const browser:boolean = (function terminal_server_browserTest():boolean {
                const index:number = process.argv.indexOf("browser");
                if (index > -1) {
                    process.argv.splice(index, 1);
                    return true;
                }
                return false;
            }()),
            port:number = (serverCallback === undefined)
                ? (isNaN(Number(process.argv[0])) === true)
                    ? vars.version.port
                    : Number(process.argv[0])
                : 0,
            keyword:string = (process.platform === "darwin")
                ? "open"
                : (process.platform === "win32")
                    ? "start"
                    : "xdg-open",
            post = function terminal_server_post(request:IncomingMessage, response:ServerResponse) {
                let body:string = "",
                        decoder:StringDecoder = new StringDecoder("utf8");
                    request.on('data', function terminal_server_create_data(data:Buffer) {
                        body = body + decoder.write(data);
                        if (body.length > 1e6) {
                            request.connection.destroy();
                        }
                    });
                    
                    request.on("error", function terminal_server_create_errorRequest(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            library.log([body, "request", errorMessage.toString()]);
                            vars.ws.broadcast(JSON.stringify({
                                error: errorMessage
                            }));
                        }
                    });
                    response.on("error", function terminal_server_create_errorResponse(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            library.log([body, "response"]);
                            if (errorMessage.toString().indexOf("write after end") > -1) {
                                library.log([errorMessage.stack]);
                            }
                            vars.ws.broadcast(JSON.stringify({
                                error: errorMessage
                            }));
                        }
                    });

                request.on("end", function terminal_server_create_end():void {
                    let task:serverTask = <serverTask>body.slice(0, body.indexOf(":")).replace("{", "").replace(/"/g, "");
                    if (task === "heartbeat") {
                        // * Send and receive heartbeat signals
                        const heartbeatData:heartbeat = JSON.parse(body).heartbeat;
                        library.heartbeat(heartbeatData, response);
                    } else if (task === "settings" || task === "messages" || task === "device" || task === "user") {
                        // * local: Writes changes to storage files
                        storage(body, response, task);
                    } else if (task === "fs") {
                        // * file system interaction for both local and remote
                        readOnly(request, response, body);
                    } else if (task === "fs-update-remote") {
                        // * remote: Changes to the remote user's file system
                        // * local : Update local "File Navigator" modals for the respective remote user
                        vars.ws.broadcast(body);
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        if (serverVars.addresses.length > 1) {
                            response.write(`Received directory watch for ${body} at ${serverVars.addresses[0][1][1]}.`);
                        } else {
                            response.write(`Received directory watch for ${body} at ${serverVars.addresses[0][0][1]}.`);
                        }
                        response.end();
                    } else if (task === "hashShare") {
                        // * generate a hash string to name a share
                        const hashShare:hashShare = JSON.parse(body).hashShare,
                            input:hashInput = {
                                callback: function terminal_server_create_end_shareHash(hashData:hashOutput) {
                                    const outputBody:hashShare = JSON.parse(hashData.id).hashShare,
                                        hashResponse:hashShareResponse = {
                                            device: outputBody.device,
                                            hash: hashData.hash,
                                            share: outputBody.share,
                                            type: outputBody.type
                                        };
                                    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                                    response.write(JSON.stringify({shareHashResponse:hashResponse}));
                                    response.end();
                                },
                                directInput: true,
                                id: body,
                                source: serverVars.hashUser + serverVars.hashDevice + hashShare.type + hashShare.share
                            };
                        library.hash(input);
                    } else if (task === "hashDevice") {
                        // * produce a hash that describes a new device
                        const nameData:hashUser = JSON.parse(body).hashDevice,
                            hashes:hashUser = {
                                device: "",
                                user: ""
                            },
                            callbackUser = function terminal_server_create_end_hashUser(hashUser:hashOutput) {
                                const callbackDevice = function terminal_server_create_end_hashUser_hashDevice(hashDevice:hashOutput) {
                                    serverVars.hashDevice = hashDevice.hash;
                                    serverVars.nameDevice = nameData.device;
                                    hashes.device = hashDevice.hash;
                                    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                                    response.write(JSON.stringify(hashes));
                                    response.end();
                                };
                                serverVars.hashUser = hashUser.hash;
                                serverVars.nameUser = nameData.user;
                                hashes.user = hashUser.hash;
                                input.callback = callbackDevice;
                                input.source = hashUser.hash + nameData.device;
                                library.hash(input);
                            },
                            input:hashInput = {
                                callback: callbackUser,
                                directInput: true,
                                source: nameData.user + vars.node.os.hostname() + process.env.os + process.hrtime().join("")
                            };
                        library.hash(input);
                    } else if (task === "invite") {
                        // * Handle all stages of invitation
                        invite(body, response);
                    }
                });
            },
            httpServer:httpServer = vars.node.http.createServer(function terminal_server_create(request:IncomingMessage, response:ServerResponse):void {
                const postTest = function terminal_server_create_postTest():boolean {
                    const host:string = (function terminal_server_create_postTest_host():string {
                        const addresses:[string, string, string][] = serverVars.addresses[0],
                            length:number = addresses.length;
                        let a:number = 0,
                            name:string = request.headers.host;
                        if (name === "localhost" || name === "::1" || name === "[::1]" || name === "127.0.0.1") {
                            return "localhost";
                        }
                        if (name.indexOf(":") > 0) {
                            name = name.slice(0, name.lastIndexOf(":"));
                        }
                        if (name.charAt(0) === "[") {
                            name = name.slice(1, name.length - 1);
                        }
                        if (name === "::1" || name === "127.0.0.1") {
                            return "localhost";
                        }
                        do {
                            if (addresses[a][1] === name) {
                                return "localhost";
                            }
                            a = a + 1;
                        } while (a < length);
                        return request.headers.host;
                    }());
                    if (
                        request.method === "POST" && (
                            host === "localhost" || (
                                host !== "localhost" && (
                                    serverVars.user[<string>request.headers["agent-name"]] !== undefined ||
                                    request.headers.invite === "invite-request" ||
                                    request.headers.invite === "invite-complete"
                                )
                            )
                        )
                    ) {
                        return true;
                    }
                    return false;
                };
                if (request.method === "GET" && request.headers.host === "localhost") {
                    methodGET(request, response);
                } else if (postTest() === true) {
                    post(request, response);
                } else {
                    // the delay is necessary to prevent a race condition against updating the serverVars.users object
                    setTimeout(function terminal_server_create_delay():void {
                        if (postTest() === true) {
                            post(request, response);
                        } else {
                            vars.node.fs.stat(`${vars.projectPath}storage${vars.sep}user.json`, function terminal_server_create_delay_userStat(err:nodeError):void {
                                if (err === null) {
                                    forbiddenUser(<string>request.headers["agent-hash"], <agentType>request.headers["agent-type"], response);
                                }
                            });
                            response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
                            response.write(`ForbiddenAccess:${request.headers["remote-user"]}`);
                            response.end();
                        }
                    }, 100);
                }
            }),
            serverError = function terminal_server_serverError(error:nodeError):void {
                if (error.code === "EADDRINUSE") {
                    if (error.port === port + 1) {
                        library.error([`Web socket channel port, ${vars.text.cyan + port + vars.text.none}, is in use!  The web socket channel is 1 higher than the port designated for the HTTP server.`]);
                    } else {
                        library.error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`]);
                    }
                } else if (error.code !== "ETIMEDOUT") {
                    library.error([`${error}`]);
                }
                return
            },
            start = function terminal_server_start() {
                const logOutput = function terminal_server_start_logger(storageData:storageItems):void {
                    const output:string[] = [],
                        webPort:string = (serverVars.webPort === 80)
                            ? ""
                            : `:${serverVars.webPort}`;
                    let a:number = 0;

                    serverVars.device = storageData.device;
                    serverVars.hashDevice = storageData.settings.hashDevice;
                    serverVars.user = storageData.user;

                    // discover the web socket port in case its a random port
                    serverVars.wsPort = vars.ws.address().port;

                    // log the port information to the terminal
                    output.push(`${vars.text.cyan}HTTP server${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverVars.webPort + vars.text.none}`);
                    output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverVars.wsPort + vars.text.none}`);
                    output.push("Local IP addresses are:");

                    serverVars.addresses[0].forEach(function terminal_server_start_logger_localAddresses(value:[string, string, string]):void {
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
                    });
                    output.push(`Address for web browser: ${vars.text.bold + vars.text.green}http://localhost${webPort + vars.text.none}`);
                    output.push("");
                    if (serverVars.addresses.length > 1) {
                        output.push(`Address for service: ${vars.text.bold + vars.text.green + serverVars.addresses[0][1][1] + webPort + vars.text.none}`);
                        if (webPort === "") {
                            output.push(`or                 : ${vars.text.bold + vars.text.green + serverVars.addresses[0][0][1] + vars.text.none}`);
                        } else {
                            output.push(`or                 : ${vars.text.bold + vars.text.green}[${serverVars.addresses[0][0][1]}]${webPort + vars.text.none}`);
                        }
                    } else {
                        if (webPort === "") {
                            output.push(`or                 : ${vars.text.bold + vars.text.green + serverVars.addresses[0][0][1] + vars.text.none}`);
                        } else {
                            output.push(`or                 : ${vars.text.bold + vars.text.green}[${serverVars.addresses[0][0][1]}]${webPort + vars.text.none}`);
                        }
                    }
                    output.push("");
                    library.log.title("Local Service");
                    library.log(output);
                };

                if (process.cwd() !== vars.projectPath) {
                    process.chdir(vars.projectPath);
                }

                // start the server
                serverVars.watches[vars.projectPath] = vars.node.fs.watch(vars.projectPath, {
                    recursive: true
                }, serverWatch);
                httpServer.on("error", serverError);
                httpServer.listen({
                    port: port,
                    host: "::"
                }, function terminal_server_start_listen():void {
                    const serverAddress:AddressInfo = <AddressInfo>httpServer.address();
                    serverVars.webPort = serverAddress.port;
                    serverVars.wsPort = (port === 0)
                        ? 0
                        : serverVars.webPort + 1;

                    httpServer.port = serverAddress.port;

                    vars.ws = new WebSocket.Server({
                        host: "[::1]",
                        port: serverVars.wsPort
                    }, function terminal_server_start_listen_socketCallback():void {
                        const readComplete = function terminal_server_start_listen_socketCallback_readComplete(storageData:storageItems) {
                                serverVars.brotli = storageData.settings.brotli;
                                serverVars.hashType = storageData.settings.hashType;
                                serverVars.nameUser = storageData.settings.nameUser;
                                if (serverCallback !== undefined) {
                                    // A callback can be passed in, so far only used for running service tests.
                                    serverCallback.callback({
                                        agent: serverCallback.agent,
                                        agentType: serverCallback.agentType,
                                        webPort: serverVars.webPort,
                                        wsPort: serverVars.wsPort
                                    });
                                } else if (Object.keys(serverVars.device).length + Object.keys(serverVars.user).length < 2 || serverVars.addresses[0][0][0] === "disconnected") {
                                    logOutput(storageData);
                                } else {
                                    const hbConfig:heartbeat = {
                                        agent: "localhost-terminal",
                                        agentType: "user",
                                        shares: "",
                                        status: "idle",
                                        user: ""
                                    };
                                    logOutput(storageData);
                                    library.heartbeat(hbConfig, null);
                                }
                            };

                        // creates a broadcast utility where all listening clients get a web socket message
                        vars.ws.broadcast = function terminal_server_start_listen_socketBroadcast(data:string):void {
                            vars.ws.clients.forEach(function terminal_server_start_listen_socketBroadcast_clients(client):void {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(data);
                                }
                            });
                        };
                        library.readStorage(readComplete);
                    });
                });
            };
        if (process.argv[0] !== undefined && isNaN(Number(process.argv[0])) === true) {
            library.error([`Specified port, ${vars.text.angry + process.argv[0] + vars.text.none}, is not a number.`]);
            return;
        }

        start();

        // open a browser from the command line
        if (browser === true) {
            vars.node.child(`${keyword} http://localhost:${port}/`, {cwd: vars.cwd}, function terminal_server_browser(errs:nodeError, stdout:string, stdError:string|Buffer):void {
                if (errs !== null) {
                    library.error([errs.toString()]);
                    return;
                }
                if (stdError !== "" && stdError.indexOf("The ESM module loader is experimental.") < 0) {
                    library.error([stdError.toString()]);
                    return;
                }
                library.log(["", "Launching default web browser..."]);
            });
        }
        return httpServer;
    };

export default server;