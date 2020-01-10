
import * as http from "http";
import * as string_decoder from "string_decoder";
import WebSocket from "ws";

import copy from "./copy.js";
import directory from "./directory.js";
import error from "./error.js";
import log from "./log.js";
import makeDir from "./makeDir.js";
import remove from "./remove.js";
import vars from "./vars.js";

import forbiddenUser from "./server/forbiddenUser.js";
import heartbeat from "./server/heartbeat.js";
import httpClient from "./server/httpClient.js";
import invite from "./server/invite.js";
import methodGET from "./server/methodGET.js";
import readOnly from "./server/readOnly.js";
import serverVars from "./server/serverVars.js";
import serverWatch from "./server/serverWatch.js";
import storage from "./server/storage.js";


// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const library = {
        copy: copy,
        directory: directory,
        error: error,
        httpClient: httpClient,
        log: log,
        makeDir: makeDir,
        remove: remove
    },
    server = function terminal_server():void {
        const browser:boolean = (function terminal_server_browserTest():boolean {
                const index:number = process.argv.indexOf("browser");
                if (index > -1) {
                    process.argv.splice(index, 1);
                    return true;
                }
                return false;
            }()),
            port:number = (isNaN(Number(process.argv[0])) === true)
                ? vars.version.port
                : Number(process.argv[0]),
            keyword:string = (process.platform === "darwin")
                ? "open"
                : (process.platform === "win32")
                    ? "start"
                    : "xdg-open",
            post = function terminal_server_post(request:http.IncomingMessage, response:http.ServerResponse) {
                let body:string = "",
                        decoder:string_decoder.StringDecoder = new string_decoder.StringDecoder("utf8");
                    request.on('data', function terminal_server_create_data(data:Buffer) {
                        body = body + decoder.write(data);
                        if (body.length > 1e6) {
                            request.connection.destroy();
                        }
                    });
                    
                    request.on("error", function terminal_server_create_errorRequest(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            library.log([body, "request", errorMessage.toString()]);
                            vars.ws.broadcast(errorMessage.toString());
                        }
                    });
                    response.on("error", function terminal_server_create_errorResponse(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            library.log([body, "response"]);
                            if (errorMessage.toString().indexOf("write after end") > -1) {
                                library.log([errorMessage.stack]);
                            }
                            vars.ws.broadcast(errorMessage.toString());
                        }
                    });

                request.on('end', function terminal_server_create_end():void {
                    let task:string = body.slice(0, body.indexOf(":")).replace("{", "").replace(/"/g, ""),
                        dataString:string = (body.charAt(0) === "{")
                            ? body.slice(body.indexOf(":") + 1, body.length - 1)
                            : body.slice(body.indexOf(":") + 1);
                    if (task === "fsUpdateRemote") {
                        // * remote: Changes to the remote user's file system
                        // * local : Update local "File Navigator" modals for the respective remote user
                        vars.ws.broadcast(body);
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write(`Received directory watch for ${dataString} at ${serverVars.addresses[0][1][1]}.`);
                        response.end();
                    } else if (task === "shareUpdate") {
                        // * remote: Changes to the remote user's shares
                        // * local : Updates local share modals and updates the storage/users.json file
                        const update:shareUpdate = JSON.parse(dataString);
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write(`Received share update from ${update.user}`);
                        response.end();
                        vars.ws.broadcast(body);
                        serverVars.users[update.user].shares = update.shares;
                        storage(JSON.stringify(serverVars.users), "noSend", "users");
                    } else if (task === "fs") {
                        // * file system interaction for both local and remote
                        readOnly(request, response, dataString);
                    } else if (task === "settings" || task === "messages" || task === "users") {
                        // * local: Writes changes to storage files
                        const length:number = dataString.length;
                        if (dataString.slice(length - 7) === ",noSend") {
                            storage(dataString.slice(0, length - 7), "noSend", task);
                        } else {
                            storage(dataString, response, task);
                        }
                    } else if (task === "heartbeat" && serverVars.addresses[0][0][0] !== "disconnected") {
                        // * Send and receive heartbeat signals
                        const heartbeatData:heartbeat = JSON.parse(dataString);
                        serverVars.status = heartbeatData.status;
                        heartbeat(heartbeatData);
                    } else if (task === "heartbeat-update") {
                        // * Respond to heartbeat changes as a result of a page load
                        const heartbeatData:heartbeat = JSON.parse(dataString);
                        vars.ws.broadcast(body);
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write(`heartbeat-update:{"agent":"${heartbeatData.agent}","refresh":false,"status":"${serverVars.status}","user":"${serverVars.name}"}`);
                        response.end();
                    } else if (task.indexOf("invite") === 0) {
                        // * Handle all stages of user invitation
                        invite(dataString, response);
                    }
                });
            },
            httpServer = vars.node.http.createServer(function terminal_server_create(request:http.IncomingMessage, response:http.ServerResponse):void {
                const postTest = function terminal_server_create_postTest():boolean {
                    if (request.method === "POST" && (request.headers.host === "localhost" || (request.headers.host !== "localhost" && (serverVars.users[<string>request.headers["user-name"]] !== undefined || request.headers.invite === "invite-request" || request.headers.invite === "invite-complete")))) {
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
                            vars.node.fs.stat(`${vars.projectPath}storage${vars.sep}users.json`, function terminal_server_create_usersStat(err:nodeError):void {
                                if (err === null) {
                                    forbiddenUser(<string>request.headers["user-name"]);
                                }
                            });
                            response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
                            response.write(`ForbiddenAccess:${request.headers["remote-user"]}`);
                            response.end();
                        }
                    }, 100);
                }
            }),
            serverError = function terminal_server_serverError(error:nodeError, port:number):void {
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
                const logOutput = function terminal_server_start_logger():void {
                    const output:string[] = [],
                        webPort:string = (serverVars.webPort === 80)
                            ? ""
                            : `:${serverVars.webPort}`;
                    let a:number = 0;
                
                    // discover the web socket port in case its a random port
                    serverVars.wsPort = vars.ws.address().port;
                
                    // log the port information to the terminal
                    output.push("");
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
                    output.push(`Address for service: ${vars.text.bold + vars.text.green + serverVars.addresses[0][1][1] + webPort + vars.text.none}`);
                    if (webPort === "") {
                        output.push(`or                 : ${vars.text.bold + vars.text.green + serverVars.addresses[0][0][1] + vars.text.none}`);
                    } else {
                        output.push(`or                 : ${vars.text.bold + vars.text.green}[${serverVars.addresses[0][0][1]}]${webPort + vars.text.none}`);
                    }
                    output.push("");
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
                httpServer.listen(port, serverVars.addresses[0][0], function terminal_server_start_listen():void {
                    serverVars.webPort = httpServer.address().port;
                    serverVars.wsPort = (port === 0)
                        ? 0
                        : serverVars.webPort + 1;
    
                    vars.ws = new WebSocket.Server({port: serverVars.wsPort});
    
                    // creates a broadcast utility where all listening clients get a web socket message
                    vars.ws.broadcast = function terminal_server_start_listen_socketBroadcast(data:string):void {
                        vars.ws.clients.forEach(function terminal_server_start_listen_socketBroadcast_clients(client):void {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(data);
                            }
                        });
                    };
    
                    // When coming online send a heartbeat to each user
                    vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}users.json`, "utf8", function terminal_server_start_listen_readUsers(eru:nodeError, userString:string):void {
                        if (eru !== null) {
                            logOutput();
                            if (eru.code !== "ENOENT") {
                                library.log([eru.toString()]);
                            }
                        } else {
                            serverVars.users = JSON.parse(userString);
                            vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}settings.json`, "utf8", function terminal_server_start_listen_readUsers_readSettings(ers:nodeError, settingString:string):void {
                                if (ers !== null) {
                                    logOutput();
                                    if (ers.code !== "ENOENT") {
                                        library.log([ers.toString()]);
                                    }
                                } else {
                                    const settings:ui_data = JSON.parse(settingString),
                                        users:string[] = Object.keys(serverVars.users),
                                        length:number = users.length,
                                        address:string = (serverVars.addresses[0][1][1].indexOf(":") > -1)
                                            ? `[${serverVars.addresses[0][1][1]}]:${serverVars.webPort}`
                                            : `${serverVars.addresses[0][1][1]}:${serverVars.webPort}`;
                                    serverVars.brotli = settings.brotli;
                                    serverVars.hash = settings.hash;
                                    serverVars.name = `${settings.name}@${address}`;
                                    if (length < 2 || serverVars.addresses[0][0][0] === "disconnected") {
                                        logOutput();
                                    } else {
                                        const callback = function terminal_server_start_listen_readUsers_readSettings_exchange(responseBody:Buffer|string):void {
                                            const userData:userExchange = JSON.parse(<string>responseBody);
                                                count = count + 1;
                                                if (count === length) {
                                                    allUsers();
                                                }
                                                serverVars.users[userData.user].shares = userData.shares;
                                                vars.ws.broadcast(`heartbeat-update:{"agent","${userData.agent}"."refresh":false,"status":"${userData.status}","user":"${userData.user}"}`);
                                                vars.ws.broadcast(`shareUpdate:{"user":"${userData.user}","shares":"${JSON.stringify(userData.shares)}"}`);
                                            },
                                            responseError = function terminal_server_start_listen_readSettings_responseError(errorMessage:nodeError):void {
                                                count = count + 1;
                                                if (count === length) {
                                                    allUsers();
                                                }
                                                vars.ws.broadcast([errorMessage.toString()]);
                                                library.log([errorMessage.toString()]);
                                            },
                                            requestError = function terminal_server_start_readUsers_readSettings_requestError(errorMessage:nodeError, agent:string):void {
                                                count = count + 1;
                                                if (count === length) {
                                                    allUsers();
                                                }
                                                if (errorMessage.code === "ETIMEDOUT" || errorMessage.code === "ECONNRESET") {
                                                    vars.ws.broadcast(`heartbeat-update:{"agent":"${agent}","refresh":false,"status":"offline","user":"${serverVars.name}"}`);
                                                } else {
                                                    vars.ws.broadcast(errorMessage.toString());
                                                    library.log([errorMessage.toString()]);
                                                }
                                            },
                                            allUsers = function terminal_server_start_listen_readUsers_readSettings_allUsers():void {
                                                const userString = JSON.stringify(serverVars.users);
                                                if (userString !== settingString) {
                                                    vars.node.fs.writeFile(`${vars.projectPath}storage${vars.sep}users.json`, userString, "utf8", function terminal_server_start_listen_readUsers_readSettings_allUsers_write(usersWriteError:nodeError):void {
                                                        if (usersWriteError !== null) {
                                                            vars.ws.broadcast(usersWriteError.toString());
                                                            library.log([usersWriteError.toString()]);
                                                        }
                                                    });
                                                }
                                            };
                                        let a:number = 1,
                                            count:number = 0;
                                        do {
                                            library.httpClient({
                                                callback: callback,
                                                callbackType: "body",
                                                errorMessage: `User ${users[a]} is offline or unreachable.`,
                                                id: "",
                                                payload: `share-exchange:{"user":"${serverVars.name}","shares":${JSON.stringify(serverVars.users.localhost.shares)}}`,
                                                remoteName: users[a],
                                                requestError: requestError,
                                                responseError: responseError
                                            });
                                            a = a + 1;
                                        } while (a < length);
                                        logOutput();
                                    }
                                }
                            });
                        }
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
    };

export default server;