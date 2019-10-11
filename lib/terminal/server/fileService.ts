
import * as http from "http";

import base64 from "../base64.js";
import copy from "../copy.js";
import directory from "../directory.js";
import error from "../error.js";
import hash from "../hash.js";
import log from "../log.js";
import makeDir from "../makeDir.js";
import remove from "../remove.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const library = {
        base64: base64,
        copy: copy,
        directory: directory,
        error: error,
        hash: hash,
        log: log,
        makeDir: makeDir,
        remove: remove
    },
    fileService = function terminal_server_fileService(request:http.IncomingMessage, response:http.ServerResponse, data:fileService):void {
        if (data.action === "fs-read" || data.action === "fs-details") {
            const callback = function terminal_server_fileService_putCallback(result:directoryList):void {
                    count = count + 1;
                    output = output.concat(result);
                    if (count === pathLength) {
                        response.writeHead(200, {"Content-Type": "application/json"});
                        response.write(`{"id":"${data.id}","dirs":${JSON.stringify(output)}}`);
                        response.end();
                    }
                },
                windowsRoot = function terminal_server_fileService_windowsRoot():void {
                    //cspell:disable
                    vars.node.child("wmic logicaldisk get name", function terminal_server_fileService_windowsRoot(erw:Error, stdout:string, stderr:string):void {
                    //cspell:enable
                        if (erw !== null) {
                            library.error([erw.toString()]);
                        } else if (stderr !== "" && stderr.indexOf("The ESM module loader is experimental.") < 0) {
                            library.error([stderr]);
                        }
                        const drives:string[] = stdout.replace(/Name\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ").split(" "),
                            length:number = drives.length,
                            date:Date = new Date(),
                            driveList = function terminal_server_fileService_windowsRoot_driveList(result:directoryList):void {
                                let b:number = 1;
                                const resultLength:number = result.length,
                                    masterIndex:number = masterList.length;
                                do {
                                    result[b][2] = masterIndex; 
                                    b = b + 1;
                                } while (b < resultLength);
                                a = a + 1;
                                masterList = masterList.concat(result);
                                if (a === length) {
                                    callback(masterList);
                                }
                            };
                        let masterList:directoryList = [["\\", "directory", 0, length, {
                                dev: 0,
                                ino: 0,
                                mode: 0,
                                nlink: 0,
                                uid: 0,
                                gid: 0,
                                rdev: 0,
                                size: 0,
                                blksize: 0,
                                blocks: 0,
                                atimeMs: 0,
                                mtimeMs: 0,
                                ctimeMs: 0,
                                birthtimeMs: 0,
                                atime: date,
                                mtime: date,
                                ctime: date,
                                birthtime: date,
                                isBlockDevice: function terminal_server_create_windowsRoot_isBlockDevice() {},
                                isCharacterDevice: function terminal_server_create_windowsRoot_isCharacterDevice() {},
                                isDirectory: function terminal_server_create_windowsRoot_isDirectory() {},
                                isFIFO: function terminal_server_create_windowsRoot_isFIFO() {},
                                isFile: function terminal_server_create_windowsRoot_isFile() {},
                                isSocket: function terminal_server_create_windowsRoot_isSocket() {},
                                isSymbolicLink: function terminal_server_create_windowsRoot_isSymbolicLink() {}
                            }]],
                            a:number = 0;
                        drives.forEach(function terminal_server_fileService_windowsRoot_each(value:string) {
                            library.directory({
                                callback: driveList,
                                depth: 1,
                                exclusions: [],
                                path: `${value}\\`,
                                recursive: true,
                                symbolic: true
                            });
                        });
                    });
                },
                pathList:string[] = data.location,
                pathLength:number = pathList.length;
            let count:number = 0,
                output:directoryList = [];
            if (pathList[0] === "defaultLocation") {
                pathList[0] = vars.projectPath;
            }
            pathList.forEach(function terminal_server_fileService_pathEach(value:string):void {
                if (value === "\\" || value === "\\\\") {
                    windowsRoot();
                } else {
                    vars.node.fs.stat(value, function terminal_server_fileService_putStat(erp:nodeError):void {
                        if (erp !== null) {
                            if (erp.code === "ENOENT") {
                                response.writeHead(404, {"Content-Type": "application/json"});
                                response.write(`{"id":"${data.id},"dirs":"missing"}`);
                                response.end();
                            }
                            library.error([erp.toString()]);
                            count = count + 1;
                            return;
                        }

                        // please note
                        // watch must be "no" on all operations but fs-read
                        // fs-read must only contain a single path
                        if (data.watch !== "no" && data.watch !== vars.projectPath) {
                            if (data.watch !== "yes" && serverVars.watches[data.watch] !== undefined) {
                                serverVars.watches[data.watch].close();
                                delete serverVars.watches[data.watch];
                            }
                            if (serverVars.watches[value] === undefined) {
                                serverVars.watches[value] = vars.node.fs.watch(value, {
                                    recursive: false
                                }, function terminal_server_fileService_watch():void {
                                    if (value !== vars.projectPath && value + vars.sep !== vars.projectPath) {
                                        if (data.agent === "localhost") {
                                            vars.ws.broadcast(`fsUpdate:${value}`);
                                        } else {
                                             // create directoryList object and send to remote
                                             library.directory({
                                                 callback: function terminal_server_fileService_watch_remote(result:directoryList):void {
                                                    const remoteData:string[] = data.remoteWatch.split("_"),
                                                        remoteAddress:string = remoteData[0],
                                                        remotePort:number = Number(remoteData[1]),
                                                        payload:string = `fsUpdateRemote:{"agent":"${data.agent}","dirs":${JSON.stringify(result)},"location":"${value.replace(/\\/g, "\\\\")}"}`,
                                                        fsRequest:http.ClientRequest = http.request({
                                                            headers: {
                                                                "Content-Type": "application/x-www-form-urlencoded",
                                                                "Content-Length": Buffer.byteLength(payload)
                                                            },
                                                            host: remoteAddress,
                                                            method: "POST",
                                                            path: "/",
                                                            port: remotePort,
                                                            timeout: 4000
                                                        }, function terminal_server_create_end_fsResponse(fsResponse:http.IncomingMessage):void {
                                                            const chunks:string[] = [];
                                                            fsResponse.setEncoding('utf8');
                                                            fsResponse.on("data", function terminal_server_create_end_fsResponse_data(chunk:string):void {
                                                                chunks.push(chunk);
                                                            });
                                                            fsResponse.on("end", function terminal_server_create_end_fsResponse_end():void {
                                                                response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                                                                response.write(chunks.join(""));
                                                                response.end();
                                                            });
                                                            fsResponse.on("error", function terminal_server_create_end_fsResponse_error(errorMessage:nodeError):void {
                                                                if (errorMessage.code !== "ETIMEDOUT") {
                                                                    library.log([errorMessage.toString()]);
                                                                    vars.ws.broadcast(errorMessage.toString());
                                                                }
                                                            });
                                                        });
                                                    fsRequest.on("error", function terminal_server_create_end_fsRequest_error(errorMessage:nodeError):void {
                                                        if (errorMessage.code !== "ETIMEDOUT") {
                                                            library.log(["watch-remote", errorMessage.toString()]);
                                                            vars.ws.broadcast(errorMessage.toString());
                                                        }
                                                        response.writeHead(500, {"Content-Type": "application/json; charset=utf-8"});
                                                        response.write("Error sending directory watch to remote.");
                                                        response.end();
                                                    });
                                                    fsRequest.write(payload);
                                                    setTimeout(function () {
                                                        fsRequest.end();
                                                    }, 100);
                                                },
                                                depth: 2,
                                                exclusions: [],
                                                path: value,
                                                recursive: true,
                                                symbolic: true
                                             });
                                        }
                                    }
                                });
                            }
                        }
                        library.directory({
                            callback: callback,
                            depth: data.depth,
                            exclusions: [],
                            path: value,
                            recursive: true,
                            symbolic: true
                        });
                    });
                }
            });
        } else if (data.action === "fs-close") {
            if (serverVars.watches[data.location[0]] !== undefined) {
                serverVars.watches[data.location[0]].close();
                delete serverVars.watches[data.location[0]];
            }
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(`Watcher ${data.location[0]} closed.`);
            response.end();
        } else if (data.action === "fs-copy" || data.action === "fs-cut") {
            let count:number = 0,
                length:number = data.location.length;
            data.location.forEach(function terminal_server_fileService_copyEach(value:string):void {
                const callback = (data.action === "fs-copy")
                    ? function terminal_server_fileService_copyEach_copy():void {
                        count = count + 1;
                        if (count === length) {
                            response.writeHead(200, {"Content-Type": "text/plain"});
                            response.write(`Path(s) ${data.location.join(", ")} copied.`);
                            response.end();
                        }
                    }
                    : function terminal_server_fileService_copyEach_cut():void {
                        library.remove(value, function terminal_server_fileService_copyEach_cut_callback():void {
                            count = count + 1;
                            if (count === length) {
                                response.writeHead(200, {"Content-Type": "text/plain"});
                                response.write(`Path(s) ${data.location.join(", ")} cut and pasted.`);
                                response.end();
                            }
                        });
                    }
                library.copy({
                    callback: callback,
                    destination:data.name,
                    exclusions:[""],
                    target:value
                });
            });
        } else if (data.action === "fs-destroy") {
            let count:number = 0;
            data.location.forEach(function terminal_server_fileService_destroyEach(value:string):void {
                if (serverVars.watches[value] !== undefined) {
                    serverVars.watches[value].close();
                    delete serverVars.watches[value];
                }
                library.remove(value, function terminal_server_fileService_destroy():void {
                    count = count + 1;
                    if (count === data.location.length) {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.write(`Path(s) ${data.location.join(", ")} destroyed.`);
                        response.end();
                    }
                });
            });
        } else if (data.action === "fs-rename") {
            const newPath:string[] = data.location[0].split(vars.sep);
            newPath.pop();
            newPath.push(data.name);
            vars.node.fs.rename(data.location[0], newPath.join(vars.sep), function terminal_server_fileService_rename(erRename:Error):void {
                if (erRename === null) {
                    response.writeHead(200, {"Content-Type": "text/plain"});
                    response.write(`Path ${data.location[0]} renamed to ${newPath.join(vars.sep)}.`);
                    response.end();
                } else {
                    library.error([erRename.toString()]);
                    library.log([erRename.toString()]);
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(erRename.toString());
                    response.end();
                }
            });
        } else if (data.action === "fs-hash" || data.action === "fs-base64") {
            const task:string = data.action.replace("fs-", "");
            library[task](data.location[0], function terminal_server_fileService_dataString(dataString:string):void {
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.write(dataString);
                response.end();
            });
        } else if (data.action === "fs-new") {
            const slash:string = (data.location[0].indexOf("/") < 0 || (data.location[0].indexOf("\\") < data.location[0].indexOf("/") && data.location[0].indexOf("\\") > -1 && data.location[0].indexOf("/") > -1))
                    ? "\\"
                    : "/",
                dirs = data.location[0].split(slash);
            dirs.pop();
            if (data.name === "directory") {
                library.makeDir(data.location[0], function terminal_server_fileService_newDirectory():void {
                    response.writeHead(200, {"Content-Type": "text/plain"});
                    response.write(`${data.location[0]} created.`);
                    vars.ws.broadcast(`fsUpdate:${dirs.join(slash)}`);
                    response.end();
                });
            } else if (data.name === "file") {
                vars.node.fs.writeFile(data.location[0], "", "utf8", function terminal_server_fileService_newFile(erNewFile:Error):void {
                    if (erNewFile === null) {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.write(`${data.location[0]} created.`);
                        vars.ws.broadcast(`fsUpdate:${dirs.join(slash)}`);
                        response.end();
                    } else {
                        library.error([erNewFile.toString()]);
                        library.log([erNewFile.toString()]);
                        response.writeHead(500, {"Content-Type": "text/plain"});
                        response.write(erNewFile.toString());
                        response.end();
                    }
                });
            }
        }
    };

export default fileService;