
import * as http from "http";
import * as fs from "fs";

import base64 from "../base64.js";
import copy from "../copy.js";
import directory from "../directory.js";
import error from "../error.js";
import hash from "../hash.js";
import log from "../log.js";
import makeDir from "../makeDir.js";
import remove from "../remove.js";
import vars from "../vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";

const library = {
        base64: base64,
        copy: copy,
        directory: directory,
        error: error,
        hash: hash,
        httpClient: httpClient,
        log: log,
        makeDir: makeDir,
        remove: remove
    },
    fileService = function terminal_server_fileService(request:http.IncomingMessage, response:http.ServerResponse, data:fileService):void {
        const fileCallback = function terminal_server_fileService_fileCallback(message:string):void {
            if (data.agent === "localhost") {
                response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                response.write(message);
                response.end();
            } else {
                library.directory({
                    callback: function terminal_server_fileService_fileCallback_dir(directory:directoryList):void {
                        const location:string = (data.name.indexOf("\\") < 0 || data.name.charAt(data.name.indexOf("\\") + 1) === "\\")
                            ? data.name
                            : data.name.replace(/\\/g, "\\\\");
                        response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                        response.write(`fsUpdateRemote:{"agent":"${data.agent}", "dirs":${JSON.stringify(directory)},"location":"${location}"}`);
                        response.end();
                    },
                    depth: 2,
                    exclusions: [],
                    hash: false,
                    path: data.name,
                    recursive: true,
                    symbolic: true
                });
            }
        };
        if (data.action === "fs-read" || data.action === "fs-details") {
            if (data.agent === "localhost" || (data.agent !== "localhost" && typeof data.remoteWatch === "string" && data.remoteWatch.length > 0)) {
                const callback = function terminal_server_fileService_putCallback(result:directoryList):void {
                        count = count + 1;
                        if (result.length > 0) {
                            output = output.concat(result);
                        }
                        if (count === pathLength) {
                            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                            if (output.length < 1) {
                                response.write(`{"id":"${data.id}","dirs":"missing"}`);
                            } else {
                                response.write(`{"id":"${data.id}","dirs":${JSON.stringify(output)}}`);
                            }
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
                                        result[b][3] = masterIndex; 
                                        b = b + 1;
                                    } while (b < resultLength);
                                    a = a + 1;
                                    masterList = masterList.concat(result);
                                    if (a === length) {
                                        callback(masterList);
                                    }
                                };
                            let masterList:directoryList = [["\\", "directory", "", 0, length, {
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
                                    hash: false,
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
                                library.error([erp.toString()]);
                                callback([]);
                                return;
                            }

                            // please note
                            // watch is ignored on all operations other than fs-read
                            // fs-read will only read from the first value in data.location
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
                                                            location:string = (value.indexOf("\\") < 0 || value.charAt(value.indexOf("\\") + 1) === "\\")
                                                                ? value
                                                                : value.replace(/\\/g, "\\\\"),
                                                            payload:string = `fsUpdateRemote:{"agent":"${data.agent}","dirs":${JSON.stringify(result)},"location":"${location}"}`,
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
                                                                    if (response.finished === false) {
                                                                        response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                                                                        response.write(chunks.join(""));
                                                                        response.end();
                                                                    }
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
                                                    hash: false,
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
                                hash: false,
                                path: value,
                                recursive: true,
                                symbolic: true
                            });
                        });
                    }
                });
            } else {
                library.httpClient({
                    callback: function terminal_server_create_end_fsResponse(fsResponse:http.IncomingMessage):void {
                        const chunks:string[] = [];
                        fsResponse.setEncoding('utf8');
                        fsResponse.on("data", function terminal_server_create_end_fsResponse_data(chunk:string):void {
                            chunks.push(chunk);
                        });
                        fsResponse.on("end", function terminal_server_create_end_fsResponse_end():void {
                            const body:string = chunks.join("");
                            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                            if (body.indexOf("fsUpdateRemote:") === 0) {
                                vars.ws.broadcast(body);
                                response.write("Terminal received file system response from remote.");
                            } else {
                                response.write(body);
                            }
                            response.end();
                        });
                        fsResponse.on("error", function terminal_server_create_end_fsResponse_error(errorMessage:nodeError):void {
                            if (errorMessage.code !== "ETIMEDOUT") {
                                library.log([errorMessage.toString()]);
                                vars.ws.broadcast(errorMessage.toString());
                            }
                        });
                    },
                    data: data,
                    errorMessage: "Error reading remote file list (fs-read).",
                    response: response
                });
            }
        } else if (data.action === "fs-close") {
            if (serverVars.watches[data.location[0]] !== undefined) {
                serverVars.watches[data.location[0]].close();
                delete serverVars.watches[data.location[0]];
            }
            fileCallback(`Watcher ${data.location[0]} closed.`);
        } else if (data.action === "fs-copy" || data.action === "fs-cut") {
            // * data.agent     | data.copyAgent     | status | task
            // * --------------------------------------------------------
            // * localhost      | localhost          | good   | copy to/from localhost
            // * localhost      | agent              | fail   | copy from localhost to remote
            // * error: socket hang up on localhost  | fail   | copy from remote to localhost, data.agent and data.copyAgent display on remote
            // * remote user id | remote user id     | good   | copy to/from same remote
            let count:number = 0,
                length:number = data.location.length;
            if (data.agent === "localhost") {
                if (data.copyAgent === "localhost") {
                    // copy to/from localhost
                    data.location.forEach(function terminal_server_fileService_copyEach(value:string):void {
                        const callback = (data.action === "fs-copy")
                            ? function terminal_server_fileService_copyEach_copy():void {
                                count = count + 1;
                                if (count === length) {
                                    fileCallback(`Path(s) ${data.location.join(", ")} copied.`);
                                }
                            }
                            : function terminal_server_fileService_copyEach_cut():void {
                                library.remove(value, function terminal_server_fileService_copyEach_cut_callback():void {
                                    count = count + 1;
                                    if (count === length) {
                                        fileCallback(`Path(s) ${data.location.join(", ")} cut and pasted.`);
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
                } else {
                    // copy from localhost to remote
                    // 1. create a clientRequest and tell remote which files to request
                    // 2. remote will respond and create its own clientRequest
                    // 3. will respond to remote's request by creating a read stream of the files and piping them to the http response
                }
            } else {
                // copy from remote to localhost
                const action:serviceType = <serviceType>`${data.action}-list`,
                    callback = function terminal_server_fileService_response(fsResponse:http.IncomingMessage):void {
                        const chunks:string[] = [];
                        fsResponse.on("data", function terminal_server_fileService_response_data(chunk:string):void {
                            chunks.push(chunk);
                            /*chunk = fragment + chunk;
                            fragment = "";
                            const items:string[] = chunk.split(stringEnd),
                                write = function terminal_server_fileService_response_data_write(item:string, index:number, length:number):void {
                                    const fileName:string = data.name + vars.sep + item.slice(stringPath.length, item.indexOf(stringHash)).replace(/\/|\\/g, vars.sep),
                                        hash:string = item.slice(item.indexOf(stringHash) + stringHash.length, item.indexOf(stringStart)),
                                        file:string = item.slice(item.indexOf(stringStart + stringStart.length));
                                    library.hash({
                                        callback: function terminal_server_fileService_response_data_write_hashCallback(output:hashOutput):void {
                                            if (output.hash === hash) {
                                                fs.writeFile(fileName, file, function terminal_server_fileService_response_data_write_hashCallback_writeCallback():void {
                                                    index = index + 1;
                                                    if (index < length) {
                                                        terminal_server_fileService_response_data_write(items[index], index, length);
                                                    } else {
                                                        library.log([`${vars.text.green + length + vars.text.none} items written from remote to localhost at ${data.name}`]);
                                                    }
                                                });
                                            } else {
                                                vars.ws.broadcast(`error: Hashes don't match for ${fileName} from remote.\nHash from remote: ${output.hash}\nHash at localhost: ${hash}`);
                                                library.log([`error: ${vars.text.angry}Hashes don't match for ${fileName} from remote.${vars.text.none}`, `Hash from remote: ${output.hash}`, `Hash at localhost: ${hash}`]);
                                                library.error([`error: Hashes don't match for ${fileName} from remote.`, `Hash from remote: ${output.hash}`, `Hash at localhost: ${hash}`]);
                                            }
                                        },
                                        source: file,
                                        string: true
                                    });
                                },
                                directory = function terminal_server_fileService_response_data_directory(dirName:string, index:number, length:number):void {
                                    library.makeDir(data.name + vars.sep + dirName.replace(stringDirectory, "").replace(/\/|\\/g, vars.sep), function terminal_server_fileService_response_data_directory_callback():void {
                                        index = index + 1;
                                        if (index < length) {
                                            if (items[index].indexOf(stringDirectory) === 0) {
                                                terminal_server_fileService_response_data_directory(items[index], index, length);
                                            } else {
                                                write(items[index], index, length);
                                            }
                                        }
                                    });
                                };
                            let length:number = items.length;
                            if (items[length - 1] !== "") {
                                fragment = items.pop();
                                length = length - 1;
                            }
                            if (length > 0) {
                                if (items[0].indexOf(stringDirectory) === 0) {
                                    directory(items[0], 0, length);
                                }
                            }*/
                        });
                        fsResponse.on("end", function terminal_server_fileService_response_end():void {
                            console.log("end");
                            console.log("");
                            console.log(chunks.join(""));

                            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                            response.write(`${data.location.join(", ")} copied from ${data.agent} to localhost.`);
                            response.end();
                        });
                        fsResponse.on("error", function terminal_server_fileService_response_error(errorMessage:nodeError):void {
                            if (errorMessage.code !== "ETIMEDOUT") {
                                library.log([errorMessage.toString()]);
                                vars.ws.broadcast(errorMessage.toString());
                            }
                        });
                    };
                data.action = action;
                library.httpClient({
                    callback: callback,
                    data: data,
                    errorMessage: "copy from remote to localhost",
                    response: response
                });
            }
        } else if (data.action === "fs-copy-list" || data.action === "fs-cut-list") {
            // create read stream
            const files:[string, string, string][] = [],
                locationLength:number = data.location.length,
                readItem = function terminal_server_fileService_readItem():void {
                    library.directory({
                        callback: function terminal_server_fileService_readItem_callback(dir:directoryList):void {
                            const dirLength:number = dir.length,
                                location:string = (function terminal_server_fileServices_readItem_callback_location():string {
                                    let backSlash:number = data.location[a].indexOf("\\"),
                                        forwardSlash:number = data.location[a].indexOf("/"),
                                        remoteSep:string = ((backSlash < forwardSlash && backSlash > -1 && forwardSlash > -1) || forwardSlash < 0)
                                            ? "\\"
                                            : "/",
                                        address:string[] = data.location[a].replace(/(\/|\\)$/, "").split(remoteSep);
                                    address.pop();
                                    return address.join(remoteSep) + remoteSep;
                                }());
                            let b:number = 0;
                            do {
                                files.push([dir[b][0], dir[b][1], dir[b][0].replace(location, "")]);
                                b = b + 1;
                            } while (b < dirLength);
                            a = a + 1;
                            if (a < locationLength) {
                                terminal_server_fileService_readItem();
                            } else {
                                // sort directories ahead of files and then sort shorter directories before longer directories
                                // * This is necessary to ensure directories are written before the files and child directories that go in them.
                                files.sort(function terminal_server_fileService_sortFiles(itemA:[string, string, string], itemB:[string, string, string]):number {
                                    if (itemA[1] === "directory" && itemB[1] !== "directory") {
                                        return -1;
                                    }
                                    if (itemA[1] !== "directory" && itemB[1] === "directory") {
                                        return 1;
                                    }
                                    if (itemA[1] === "directory" && itemB[1] === "directory") {
                                        if (itemA[2].length < itemB[2].length) {
                                            return -1;
                                        }
                                        return 1;
                                    }
                                    if (itemA[2] < itemB[2]) {
                                        return -1;
                                    }
                                    return 1;
                                });
                                response.write(JSON.stringify(files));
                                response.end();
                            }
                        },
                        depth: 0,
                        exclusions: [],
                        hash: false,
                        path: data.location[a],
                        recursive: true,
                        symbolic: false
                    });
                };
            let a:number = 0;
            response.writeHead(200, {"Content-Type": "application/octet-stream; charset=utf-8"});
            readItem();
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
                        fileCallback(`Path(s) ${data.location.join(", ")} destroyed.`);
                    }
                });
            });
        } else if (data.action === "fs-rename") {
            const newPath:string[] = data.location[0].split(vars.sep);
            newPath.pop();
            newPath.push(data.name);
            vars.node.fs.rename(data.location[0], newPath.join(vars.sep), function terminal_server_fileService_rename(erRename:Error):void {
                if (erRename === null) {
                    fileCallback(`Path ${data.location[0]} renamed to ${newPath.join(vars.sep)}.`);
                } else {
                    library.error([erRename.toString()]);
                    library.log([erRename.toString()]);
                    response.writeHead(500, {"Content-Type": "text/plain; charset=utf-8"});
                    response.write(erRename.toString());
                    response.end();
                }
            });
        } else if (data.action === "fs-hash" || data.action === "fs-base64") {
            const task:string = data.action.replace("fs-", "");
            library[task](data.location[0], function terminal_server_fileService_dataString(dataString:string):void {
                response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
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
                    fileCallback(`${data.location[0]} created.`);
                    vars.ws.broadcast(`fsUpdate:${dirs.join(slash)}`);
                });
            } else if (data.name === "file") {
                vars.node.fs.writeFile(data.location[0], "", "utf8", function terminal_server_fileService_newFile(erNewFile:Error):void {
                    if (erNewFile === null) {
                        fileCallback(`${data.location[0]} created.`);
                        vars.ws.broadcast(`fsUpdate:${dirs.join(slash)}`);
                    } else {
                        library.error([erNewFile.toString()]);
                        library.log([erNewFile.toString()]);
                        response.writeHead(500, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write(erNewFile.toString());
                        response.end();
                    }
                });
            }
        }
    };

export default fileService;