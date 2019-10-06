
import * as http from "http";
import WebSocket from "../../ws-es6/index.js";

import copy from "./copy.js";
import directory from "./directory.js";
import error from "./error.js";
import log from "./log.js";
import makeDir from "./makeDir.js";
import readFile from "./readFile.js";
import remove from "./remove.js";
import vars from "./vars.js";

import fsServer from "./server/fsServer.js";
import serverVars from "./server/serverVars.js";
import serverWatch from "./server/serverWatch.js";
import socketServer from "./server/socketServer.js";
import socketServerListener from "./server/socketServerListener.js";
import methodGET from "./server/methodGET.js";
import settingsMessages from "./server/settingsMessage.js";
import inviteHeartbeat from "./server/inviteHeartbeat.js";


// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const library = {
        copy: copy,
        directory: directory,
        error: error,
        log: log,
        makeDir: makeDir,
        readFile: readFile,
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
            serverObject = vars.node.http.createServer(function terminal_server_create(request:http.IncomingMessage, response:http.ServerResponse):void {
                if (request.method === "GET") {
                    methodGET(request, response);
                } else {
                    let body:string = "";
                    request.on('data', function (data:string) {
                        body = body + data;
                        if (body.length > 1e6) {
                            request.connection.destroy();
                        }
                    });

                    request.on('end', function terminal_server_create_end():void {
                        let task:string = body.slice(0, body.indexOf(":")).replace("{", "").replace(/"/g, ""),
                            dataString:string = (body.charAt(0) === "{")
                                ? body.slice(body.indexOf(":") + 1, body.length - 1)
                                : body.slice(body.indexOf(":") + 1);
                        if (task === "fs") {
                            const data:localService = JSON.parse(dataString);
                            if (data.agent === "localhost") {
                                fsServer(request, response, data);
                            } else {
                                const ipAddress:string = (function terminal_server_create_end_fsIP():string {
                                        const address:string = data.agent.slice(data.agent.indexOf("@") + 1, data.agent.lastIndexOf(":"));
                                        data.agent = "localhost";
                                        if (address.charAt(0) === "[") {
                                            return address.slice(1, address.length - 1);
                                        }
                                        return address;
                                    }()),
                                    payload:string = `fs:${JSON.stringify(data)}`,
                                    fsRequest:http.ClientRequest = http.request({
                                        headers: {
                                            "Content-Type": "application/x-www-form-urlencoded",
                                            "Content-Length": Buffer.byteLength(payload)
                                        },
                                        host: ipAddress,
                                        method: "POST",
                                        path: "/",
                                        port: 80,
                                        //port: Number(data.agent.slice(data.agent.lastIndexOf(":") + 1)),
                                        timeout: 4000
                                    }, function terminal_server_create_end_fsResponse(fsResponse:http.IncomingMessage):void {
                                        const chunks:string[] = [];
                                        fsResponse.setEncoding('utf8');
                                        fsResponse.on("data", function terminal_server_create_end_fsResponse_data(chunk:string):void {
                                            chunks.push(chunk);
                                        });
                                        fsResponse.on("end", function terminal_server_create_end_fsResponse_end():void {
                                            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                                            response.write(`fs-remote:{"id":"${data.id}","dirs":${chunks.join("")}}`);
                                            response.end();
                                        });
                                        fsResponse.on("error", function terminal_server_create_end_fsResponse_error(errorMessage:nodeError):void {
                                            library.log([errorMessage.toString()]);
                                            vars.ws.broadcast(errorMessage.toString());
                                        });
                                    });
                                fsRequest.on("error", function terminal_server_create_end_fsRequest_error(errorMessage:nodeError):void {
                                    library.log([errorMessage.toString()]);
                                    vars.ws.broadcast(errorMessage.toString());
                                });
                                fsRequest.write(payload);
                                setTimeout(function () {
                                    fsRequest.end();
                                }, 100);
                            }
                        } else if (task === "settings" || task === "messages") {
                            settingsMessages(response, dataString, task);
                        } else if (task === "invite" || task === "heartbeat") {
                            inviteHeartbeat(dataString, task);
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
                } else {
                    library.error([`${error.Error}`]);
                }
                return
            },
            start = function terminal_server_start() {
                if (process.cwd() !== vars.projectPath) {
                    process.chdir(vars.projectPath);
                }
                serverVars.watches[vars.projectPath] = vars.node.fs.watch(vars.projectPath, {
                    recursive: true
                }, serverWatch);
                serverObject.on("error", serverError);
                serverObject.listen(port);
                serverVars.webPort = serverObject.address().port;
                serverVars.wsPort = (port === 0)
                    ? 0
                    : serverVars.webPort + 1;

                vars.ws = new WebSocket.Server({port: serverVars.wsPort});

                // creates a broadcast utility where all listening clients get a web socket message
                vars.ws.broadcast = function terminal_server_socketServerListener_broadcast(data:string):void {
                    vars.ws.clients.forEach(function terminal_server_socketServerListener_broadcast_clients(client):void {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(data);
                        }
                    });
                };

                serverVars.socketReceiver = vars.node.net.createServer(socketServer);
                serverVars.serverPort = (port === 0)
                    ? 0
                    : serverVars.wsPort + 1;
                serverVars.socketReceiver.listen(serverVars.serverPort, serverVars.addresses[0][1][1], function terminal_server_start_socketReceiverWrapper():void {
                    // the terminal server address information comes from this function
                    socketServerListener();
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