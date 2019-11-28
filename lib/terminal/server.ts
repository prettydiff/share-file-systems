
import * as http from "http";
import * as string_decoder from "string_decoder";
import WebSocket from "../../ws-es6/index.js";

import copy from "./copy.js";
import directory from "./directory.js";
import error from "./error.js";
import log from "./log.js";
import makeDir from "./makeDir.js";
import remove from "./remove.js";
import vars from "./vars.js";

import fileService from "./server/fileService.js";
import heartbeat from "./server/heartbeat.js";
import httpClient from "./server/httpClient.js";
import invite from "./server/invite.js";
import methodGET from "./server/methodGET.js";
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
            httpServer = vars.node.http.createServer(function terminal_server_create(request:http.IncomingMessage, response:http.ServerResponse):void {
                if (request.method === "GET" && request.headers.host === "localhost") {
                    methodGET(request, response);
                } else if (request.method === "POST" && (request.headers.host === "localhost" || serverVars.users[<string>request.headers.userName] !== undefined || request.headers.invite === "invite-request" || request.headers.invite === "invite-complete")) {
                    let body:string = "",
                        decoder:string_decoder.StringDecoder = new string_decoder.StringDecoder("utf8");
                    request.on('data', function (data:Buffer) {
                        body = body + decoder.write(data);
                        if (body.length > 1e6) {
                            request.connection.destroy();
                        }
                    });
                    
                    request.on("error", function terminal_server_create_end_errorRequest(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            library.log([body, "request", errorMessage.toString()]);
                            vars.ws.broadcast(errorMessage.toString());
                        }
                    });
                    response.on("error", function terminal_server_create_end_errorResponse(errorMessage:nodeError):void {
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
                            response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                            response.write(`Received directory watch for ${dataString} at ${serverVars.addresses[0][1][1]}.`);
                            response.end();
                            vars.ws.broadcast(body);
                        } else if (task === "shareUpdate") {
                            const update:shareUpdate = JSON.parse(dataString);
                            response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                            response.write(`Received share update from ${update.user}`);
                            response.end();
                            vars.ws.broadcast(body);
                        } else if (task === "fs") {
                            const data:fileService = JSON.parse(dataString);
                            if (data.agent !== "localhost") {
                                const shares:userShares = (serverVars.users[data.agent] === undefined)
                                        ? serverVars.users.localhost.shares
                                        : serverVars.users[data.agent].shares,
                                    windows:boolean = (data.location[0].charAt(0) === "\\" || (/^\w:\\/).test(data.location[0]) === true),
                                    readOnly:string[] = ["fs-base64", "fs-close", "fs-copy", "fs-copy-file", "fs-copy-list", "fs-copy-request", "fs-copy-self", "fs-details", "fs-directory", "fs-hash", "fs-read"];
                                let dIndex:number = data.location.length,
                                    sIndex:number = shares.length,
                                    bestMatch:number = -1;
                                if (sIndex > 0) {
                                    do {
                                        dIndex = dIndex - 1;
                                        sIndex = shares.length;
                                        do {
                                            sIndex = sIndex - 1;
                                            if (data.location[dIndex].indexOf(shares[sIndex].name) === 0 || (windows === true && data.location[dIndex].toLowerCase().indexOf(shares[sIndex].name.toLowerCase()) === 0)) {
                                                if (bestMatch < 0 || shares[sIndex].name.length > shares[bestMatch].name.length) {
                                                    bestMatch = sIndex;
                                                }
                                            }
                                        } while (sIndex > 0);
                                        if (bestMatch < 0) {
                                            data.location.splice(dIndex, 1);
                                        } else {
                                            if (shares[bestMatch].readOnly === true && readOnly.indexOf(data.action) < 0) {
                                                response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
                                                response.write(`{"id":"${data.id}","dirs":"readOnly"}`);
                                                response.end();
                                                return;
                                            }
                                        }
                                    } while (dIndex > 0);
                                }
                            }
                            if (data.location.length > 0) {
                                fileService(request, response, data);
                            } else {
                                response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
                                response.write(`{"id":"${data.id}","dirs":"noShare"}`);
                                response.end();
                            }
                        } else if (task === "settings" || task === "messages" || task === "users") {
                            storage(dataString, response, task);
                        } else if (task === "heartbeat" && serverVars.addresses[0][0][0] !== "disconnected") {
                            heartbeat(dataString, response);
                        } else if (task === "heartbeat-update") {
                            vars.ws.broadcast(body);
                            response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                            response.write(`Heartbeat received at ${serverVars.addresses[0][1][1]}`);
                            response.end();
                        } else if (task.indexOf("invite") === 0) {
                            invite(dataString, response);
                        }
                    });
                } else {
                    response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
                    response.write(`Forbidden`);
                    response.end();
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
                    log(output);
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
                                log([eru.toString()]);
                            }
                        } else {
                            serverVars.users = JSON.parse(userString);
                            vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}settings.json`, "utf8", function terminal_server_start_listen_readUsers_readSettings(ers:nodeError, settingString:string):void {
                                if (ers !== null) {
                                    logOutput();
                                    if (ers.code !== "ENOENT") {
                                        log([ers.toString()]);
                                    }
                                } else {
                                    const settings:ui_data = JSON.parse(settingString),
                                        users:string[] = Object.keys(serverVars.users),
                                        length:number = users.length,
                                        address:string = (serverVars.addresses[0][1][1].indexOf(":") > -1)
                                            ? `[${serverVars.addresses[0][1][1]}]:${serverVars.webPort}`
                                            : `${serverVars.addresses[0][1][1]}:${serverVars.webPort}`;
                                    serverVars.name = `${settings.name}@${address}`;
                                    if (length < 2 || serverVars.addresses[0][0][0] === "disconnected") {
                                        logOutput();
                                    } else {
                                        const callback = function terminal_server_start_listen_readUsers_readSettings_exchange(userResponse:http.IncomingMessage):void {
                                                const chunks:string[] = [];
                                                userResponse.setEncoding('utf8');
                                                userResponse.on("data", function terminal_server_start_listen__readSettings_exchange_data(chunk:string):void {
                                                    chunks.push(chunk);
                                                });
                                                userResponse.on("end", function terminal_server_start_listen__readSettings_exchange_end():void {
                                                    const userString:string = chunks.join(""),
                                                        userData:userExchange = JSON.parse(userString);
                                                    count = count + 1;
                                                    if (count === length) {
                                                        allUsers();
                                                    }
                                                    serverVars.users[userData.user].shares = userData.shares;
                                                    vars.ws.broadcast(`heartbeat-update:{"ip":"${userData.ip}","port":${userData.port},"refresh":false,"status":"${userData.status}","user":"${userData.user}"}`);
                                                    vars.ws.broadcast(`shareUpdate:{"user":"${userData.user}","shares":"${JSON.stringify(userData.shares)}"}`);
                                                });
                                                userResponse.on("error", function terminal_server_start_listen__readSettings_exchange_error(errorMessage:nodeError):void {
                                                    count = count + 1;
                                                    if (count === length) {
                                                        allUsers();
                                                    }
                                                    vars.ws.broadcast([errorMessage.toString()]);
                                                    library.log([errorMessage.toString()]);
                                                });
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
                                            ip:string,
                                            port:string,
                                            lastColon:number,
                                            payload:string,
                                            http:http.ClientRequest,
                                            count:number = 0;
                                        do {
                                            lastColon = users[a].lastIndexOf(":");
                                            ip = users[a].slice(users[a].indexOf("@") + 1, lastColon);
                                            port = users[a].slice(lastColon + 1);
                                            if (ip.charAt(0) === "[") {
                                                ip = ip.slice(1, ip.length - 1);
                                            }
                                            payload = `share-exchange:{"user":"${serverVars.name}","ip":"${ip}","port":${port},"shares":${JSON.stringify(serverVars.users.localhost.shares)}}`;
                                            http = vars.node.http.request({
                                                headers: {
                                                    "Content-Type": "application/x-www-form-urlencoded",
                                                    "Content-Length": Buffer.byteLength(payload),
                                                    "userName": serverVars.name
                                                },
                                                host: ip,
                                                method: "POST",
                                                path: "/",
                                                port: port,
                                                timeout: 1000
                                            }, callback);
                                            http.write(payload);
                                            http.end();
                                            http.on("error", function terminal_server_start_readUsers_readSettings_httpError(errorMessage:nodeError):void {
                                                count = count + 1;
                                                if (count === length) {
                                                    allUsers();
                                                }
                                                if (errorMessage.code === "ETIMEDOUT" || errorMessage.code === "ECONNRESET") {
                                                    vars.ws.broadcast(`heartbeat-update:{"ip":"${ip}","port":${port},"refresh":false,"status":"offline","user":"${users[a]}"}`);
                                                } else {
                                                    vars.ws.broadcast(errorMessage.toString());
                                                    library.log([errorMessage.toString()]);
                                                }
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