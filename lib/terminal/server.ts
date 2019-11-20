
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
                if (request.method === "GET") {
                    methodGET(request, response);
                } else {
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
                            const data:fileService = JSON.parse(dataString),
                                shares:userShares = serverVars.users.localhost.shares,
                                endPop = function terminal_server_create_end_endPop(address:string):string {
                                    const forward:number = address.indexOf("/"),
                                        slash:"\\" | "/" = (forward > -1 && (address.indexOf("//") < 0 || forward < address.indexOf("//")))
                                            ? "/"
                                            : "\\";
                                    return address.slice(0, address.lastIndexOf(slash)); 
                                };
                            let pathPop:string,
                                dIndex:number = data.location.length,
                                sIndex:number = shares.length,
                                dLength:number,
                                sLength:number;
                            do {
                                dIndex = dIndex - 1;
                                sIndex = shares.length;
                                do {
                                    sIndex = sIndex - 1;
                                    if (sIndex < 0) {
                                        data.location.splice(dIndex, 1);
                                        break;
                                    }
                                    dLength = data.location[dIndex].length;
                                    sLength = shares[sIndex].name.length;
                                    if (shares[sIndex].name.indexOf(data.location[dIndex]) === sLength - dLength) {
                                        break;
                                    }
                                    pathPop = endPop(data.location[dIndex]);
                                    dLength = pathPop.length;
                                    if (shares[sIndex].name.indexOf(pathPop) === sLength - dLength) {
                                        break;
                                    }
                                } while (sIndex > -1);
                            } while (dIndex > 0);
                            if (data.location.length > 0) {
                                fileService(request, response, data);
                            } else {
                                response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
                                response.write("Requesting unshared locations.");
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
                    library.error([`${error.Error}`]);
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
                    output.push(`or                     : ${vars.text.bold + vars.text.green}http://[${serverVars.addresses[0][0][1]}]${webPort + vars.text.none}`);
                    if (serverVars.addresses[0][1][0].charAt(0) === " ") {
                        output.push(`or                     : ${vars.text.bold + vars.text.green}http://${serverVars.addresses[0][1][1] + webPort + vars.text.none}`);
                        output.push("");
                        output.push(`Address for service: ${vars.text.bold + vars.text.green + serverVars.addresses[0][1][1] + webPort + vars.text.none}`);
                    } else {
                        output.push("");
                        output.push(`Address for service: ${vars.text.bold + vars.text.green}[${serverVars.addresses[0][0][1]}]${webPort + vars.text.none}`);
                    }
                    output.push("");
                    log(output);
                };

                if (process.cwd() !== vars.projectPath) {
                    process.chdir(vars.projectPath);
                }
                serverVars.watches[vars.projectPath] = vars.node.fs.watch(vars.projectPath, {
                    recursive: true
                }, serverWatch);
                httpServer.on("error", serverError);
                httpServer.listen(port);
                serverVars.webPort = httpServer.address().port;
                serverVars.wsPort = (port === 0)
                    ? 0
                    : serverVars.webPort + 1;

                vars.ws = new WebSocket.Server({port: serverVars.wsPort});

                // creates a broadcast utility where all listening clients get a web socket message
                vars.ws.broadcast = function terminal_server_start_socketBroadcast(data:string):void {
                    vars.ws.clients.forEach(function terminal_server_start_socketBroadcast_clients(client):void {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(data);
                        }
                    });
                };

                // When coming online send a heartbeat to each user
                vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}users.json`, "utf8", function terminal_server_start_readSettings(eru:nodeError, userString:string):void {
                    if (eru !== null) {
                        logOutput();
                        if (eru.code !== "ENOENT") {
                            log([eru.toString()]);
                        }
                    } else {
                        serverVars.users = JSON.parse(userString);
                        vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}settings.json`, "utf8", function terminal_server_start_readSettings(ers:nodeError, settingString:string):void {
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
                                    let a:number = 1,
                                        ip:string,
                                        port:string,
                                        lastColon:number;
                                    do {
                                        lastColon = users[a].lastIndexOf(":");
                                        ip = users[a].slice(users[a].indexOf("@") + 1, lastColon);
                                        port = users[a].slice(lastColon + 1);
                                        if (ip.charAt(0) === "[") {
                                            ip = ip.slice(1, ip.length - 1);
                                        }
                                        heartbeat(`{"ip":"${ip}","port":${port},"refresh":false,"status":"active","user":"${settings.name}"}`);
                                        a = a + 1;
                                    } while (a < length);
                                    logOutput();
                                }
                            }
                        });
                    }
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