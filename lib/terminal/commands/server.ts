
/* lib/terminal/commands/server - A command driven HTTP server for running the terminal instance of the application. */
import { IncomingMessage, ServerResponse } from "http";
import { AddressInfo } from "net";
import { StringDecoder } from "string_decoder";
import WebSocket from "../../../ws-es6/index.js";

import error from "../utilities/error.js";
import hash from "./hash.js";
import log from "../utilities/log.js";

import vars from "../utilities/vars.js";
import readStorage from "../utilities/readStorage.js";

import forbiddenUser from "../server/forbiddenUser.js";
import heartbeat from "../server/heartbeat.js";
import httpClient from "../server/httpClient.js";
import invite from "../server/invite.js";
import methodGET from "../server/methodGET.js";
import readOnly from "../server/readOnly.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import serverWatch from "../server/serverWatch.js";
import storage from "../server/storage.js";


// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const server = function terminal_server(serverCallback:serverCallback):httpServer {
    // at this time the serverCallback argument is only used by test automation and so its availability
    // * locks the server to address ::1 (loopback)
    // * bypasses messaging users on server start up
    // * bypasses some security checks
    let portWeb:number,
        portWS:number;
    const browser:boolean = (function terminal_server_browserTest():boolean {
            let index:number;
            const test:number = process.argv.indexOf("test");
            if (test > -1) {
                serverVars.storage = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storage`;
                process.argv.splice(test, 1);
            } else if (vars.command.indexOf("test") === 0) {
                serverVars.storage = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storage`;
            }
            index = process.argv.indexOf("browser");
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
        post = function terminal_server_post(request:IncomingMessage, serverResponse:ServerResponse) {
            let body:string = "";
            const decoder:StringDecoder = new StringDecoder("utf8"),
                hashDevice = function terminal_server_post_hashDevice():void {
                    const nameData:hashUser = JSON.parse(body).hashDevice,
                        hashes:hashUser = {
                            device: "",
                            user: ""
                        },
                        callbackUser = function terminal_server_create_end_hashUser(hashUser:hashOutput) {
                            const callbackDevice = function terminal_server_create_end_hashUser_hashDevice(hashDevice:hashOutput) {
                                serverVars.hashDevice = hashDevice.hash;
                                serverVars.nameDevice = nameData.device;
                                serverVars.device[serverVars.hashDevice] = {
                                    ip: serverVars.ipAddress,
                                    name: nameData.device,
                                    port: serverVars.webPort,
                                    shares: {}
                                };
                                hashes.device = hashDevice.hash;
                                storage(JSON.stringify({
                                    "device": serverVars.device
                                }), null, "device");
                                response(serverResponse, "text/plain", JSON.stringify(hashes));
                            };
                            serverVars.hashUser = hashUser.hash;
                            serverVars.nameUser = nameData.user;
                            hashes.user = hashUser.hash;
                            input.callback = callbackDevice;
                            input.source = hashUser.hash + nameData.device;
                            hash(input);
                        },
                        input:hashInput = {
                            callback: callbackUser,
                            directInput: true,
                            source: nameData.user + vars.node.os.hostname() + process.env.os + process.hrtime().join("")
                        };
                    vars.testLogger("server", "hashDevice", "Create a hash to name a device.");
                    hash(input);
                },
                hashShare = function terminal_server_post_hashShare():void {
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
                                response(serverResponse, "application/json", JSON.stringify({shareHashResponse:hashResponse}));
                            },
                            directInput: true,
                            id: body,
                            source: serverVars.hashUser + serverVars.hashDevice + hashShare.type + hashShare.share
                        };
                    vars.testLogger("server", "hashShare", "Create a hash to name a new share.");
                    hash(input);
                },
                updateRemote = function terminal_server_post_updateRemote():void {
                    vars.testLogger("server", "fs-update-remote", "Sends updated file system data from a remote agent to the local browser.")
                    vars.ws.broadcast(body);
                    response(serverResponse, "text/plain", `Received directory watch for ${body} at ${serverVars.ipAddress}.`);
                };

            // request handling
            request.on('data', function terminal_server_post_data(data:Buffer) {
                body = body + decoder.write(data);
                if (body.length > 1e6) {
                    request.connection.destroy();
                }
            });
            request.on("error", function terminal_server_post_errorRequest(errorMessage:nodeError):void {
                if (errorMessage.code !== "ETIMEDOUT") {
                    log([body, "request", errorMessage.toString()]);
                    vars.ws.broadcast(JSON.stringify({
                        error: errorMessage
                    }));
                }
            });
            serverResponse.on("error", function terminal_server_post_errorResponse(errorMessage:nodeError):void {
                if (errorMessage.code !== "ETIMEDOUT") {
                    log([body, "response"]);
                    if (errorMessage.toString().indexOf("write after end") > -1) {
                        log([errorMessage.stack]);
                    }
                    vars.ws.broadcast(JSON.stringify({
                        error: errorMessage
                    }));
                }
            });

            // request callbacks
            request.on("end", function terminal_server_post_end():void {
                let task:serverTask = <serverTask>body.slice(0, body.indexOf(":")).replace("{", "").replace(/"/g, "");
                if (task === "heartbeat") {
                    // * process received heartbeat data from other agents
                    heartbeat.response(JSON.parse(body).heartbeat, serverResponse)
                } else if (task === "heartbeat-update") {
                    // * prepare heartbeat pulse for connected agents
                    heartbeat.update(JSON.parse(body)["heartbeat-update"], serverResponse);
                } else if (task === "heartbeat-response") {
                    // * response to a heartbeat pulse
                    heartbeat.parse(JSON.parse(body)["heartbeat-response"]);
                } else if (task === "fs") {
                    // * file system interaction for both local and remote
                    readOnly(request, serverResponse, body);
                } else if (task === "fs-update-remote") {
                    // * remote: Changes to the remote user's file system
                    // * local : Update local "File Navigator" modals for the respective remote user
                    updateRemote();
                } else if (task === "delete-agents") {
                    // * received a request from the browser to delete agents
                    heartbeat.delete(JSON.parse(body)["delete-agents"], serverResponse);
                } else if (task === "heartbeat-delete-agents") {
                    // * received instructions from remote to delete agents
                    heartbeat.deleteResponse(JSON.parse(body)["heartbeat-delete-agents"], serverResponse);
                } else if (task === "settings" || task === "messages" || task === "device" || task === "user") {
                    // * local: Writes changes to storage files
                    storage(body, serverResponse, task);
                } else if (task === "hashShare") {
                    // * generate a hash string to name a share
                    hashShare();
                } else if (task === "hashDevice") {
                    // * produce a hash that describes a new device
                    hashDevice();
                } else if (task === "invite") {
                    // * Handle all stages of invitation
                    invite(body, serverResponse);
                }
            });
        },
        httpServer:httpServer = vars.node.http.createServer(function terminal_server_create(request:IncomingMessage, serverResponse:ServerResponse):void {
            const host:string = (function terminal_server_create_postTest_host():string {
                    const addresses:[string, string, string][] = serverVars.addresses[0],
                        length:number = addresses.length;
                    let a:number = 0,
                        name:string = request.headers.host;
                    if (name === "localhost" || (/((localhost)|(\[::\])):\d{0,5}/).test(name) === true || name === "::1" || name === "[::1]" || name === "127.0.0.1") {
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
                }()),
                postTest = function terminal_server_create_postTest():boolean {
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
                },
                // eslint-disable-next-line
                requestType:string = (request.method === "GET") ? `GET ${request.url}` : <string>request.headers["request-type"];
            //console.log(requestType);
            if (request.method === "GET" && (request.headers["agent-type"] === "device" || request.headers["agent-type"] === "user") && serverVars[request.headers["agent-type"]][<string>request.headers["agent-hash"]] !== undefined) {
                if (request.headers["agent-type"] === "device") {
                    serverResponse.setHeader("agent-hash", serverVars.hashDevice);
                    serverResponse.setHeader("agent-type", "device");
                } else {
                    serverResponse.setHeader("agent-hash", serverVars.hashUser);
                    serverResponse.setHeader("agent-type", "user");
                }
                response(serverResponse, "text/plain", `response from ${serverVars.hashDevice}`);
            } else if (request.method === "GET" && host === "localhost") {
                methodGET(request, serverResponse);
            } else if (postTest() === true) {
                post(request, serverResponse);
            } else {
                // the delay is necessary to prevent a race condition between service execution and data storage writing
                setTimeout(function terminal_server_create_delay():void {
                    if (postTest() === true) {
                        post(request, serverResponse);
                    } else {
                        vars.node.fs.stat(`${vars.projectPath}storage${vars.sep}user.json`, function terminal_server_create_delay_userStat(err:nodeError):void {
                            if (err === null) {
                                forbiddenUser(<string>request.headers["agent-hash"], <agentType>request.headers["agent-type"], serverResponse);
                            }
                        });
                        response(serverResponse, "text/plain", `ForbiddenAccess:${request.headers["remote-user"]}`);
                    }
                }, 50);
            }
        }),
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
                if (serverVars.device[serverVars.hashDevice] !== undefined) {
                    serverVars.device[serverVars.hashDevice].ip = serverVars.ipAddress;
                    serverVars.device[serverVars.hashDevice].port = serverVars.webPort;
                }

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
                output.push(`Address for service: ${vars.text.bold + vars.text.green + serverVars.ipAddress + webPort + vars.text.none}`);
                if (serverVars.addresses[0][0][1] !== serverVars.ipAddress) {
                    if (serverVars.addresses[0][0][2] === "ipv4") {
                        output.push(`or                 : ${vars.text.bold + vars.text.green + serverVars.addresses[0][0][1] + vars.text.none}`);
                    } else {
                        output.push(`or                 : ${vars.text.bold + vars.text.green}[${serverVars.addresses[0][0][1]}]${webPort + vars.text.none}`);
                    }
                }
                output.push("");
                log.title("Local Server");
                log(output, true);
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
            }, function terminal_server_start_listen():void {
                const serverAddress:AddressInfo = <AddressInfo>httpServer.address();
                serverVars.webPort = serverAddress.port;
                serverVars.wsPort = (port === 0)
                    ? 0
                    : serverVars.webPort + 1;

                httpServer.port = serverAddress.port;
                portWeb = serverAddress.port;

                vars.ws = new WebSocket.Server({
                    host: (serverVars.addresses[0].length > 1)
                        ? "::"
                        : "127.0.0.1",
                    port: serverVars.wsPort
                }, function terminal_server_start_listen_socketCallback():void {
                    const readComplete = function terminal_server_start_listen_socketCallback_readComplete(storageData:storageItems) {
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
                                    shares: {},
                                    status: "idle"
                                };
                                logOutput(storageData);
                                heartbeat.update(hbConfig, null);
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
                    if (serverCallback === undefined) {
                        readStorage(readComplete);
                    } else {
                        serverCallback.callback({
                            agent: serverCallback.agent,
                            agentType: serverCallback.agentType,
                            webPort: portWeb,
                            wsPort: portWS
                        });
                    }
                });
            });
        };
    if (vars.command.indexOf("test_") !== 0 && process.argv[0] !== undefined && isNaN(Number(process.argv[0])) === true) {
        error([`Specified port, ${vars.text.angry + process.argv[0] + vars.text.none}, is not a number.`]);
        return;
    }

    start();

    // open a browser from the command line
    if (browser === true) {
        vars.node.child(`${keyword} http://localhost:${port}/`, {cwd: vars.cwd}, function terminal_server_browser(errs:nodeError, stdout:string, stdError:string|Buffer):void {
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
    return httpServer;
};

export default server;