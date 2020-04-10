
/* lib/terminal/server/fileService - This library executes various file system related services and actions. */
import { Hash } from "crypto";
import * as fs from "fs";
import * as http from "http";
import { Stream, Writable } from "stream";
import * as zlib from "zlib";

import base64 from "../commands/base64.js";
import commas from "../../common/commas.js";
import copy from "../commands/copy.js";
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import hash from "../commands/hash.js";
import log from "../utilities/log.js";
import makeDir from "../utilities/makeDir.js";
import prettyBytes from "../../common/prettyBytes.js";
import readFile from "../utilities/readFile.js";
import remove from "../commands/remove.js";
import vars from "../utilities/vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";

const library = {
        base64: base64,
        commas: commas,
        copy: copy,
        directory: directory,
        error: error,
        hash: hash,
        httpClient: httpClient,
        log: log,
        makeDir: makeDir,
        prettyBytes: prettyBytes,
        readFile: readFile,
        remove: remove
    },
    fileService = function terminal_server_fileService(response:http.ServerResponse, data:fileService):void {
        const copyMessage = function (numbers:completeStatus):string {
                const filePlural:string = (numbers.countFile === 1)
                        ? ""
                        : "s",
                    failPlural:string = (numbers.failures === 1)
                        ? ""
                        : "s",
                    verb:string = (numbers.percent === 100)
                        ? "Copy"
                        : `Copying ${numbers.percent.toFixed(2)}%`;
                return `${verb} complete. ${library.commas(numbers.countFile)} file${filePlural} written at size ${library.prettyBytes(numbers.writtenSize)} (${library.commas(numbers.writtenSize)} bytes) with ${numbers.failures} integrity failure${failPlural}.`
            },
            fileCallback = function terminal_server_fileService_fileCallback(message:string):void {
                const copyStatus:copyStatus = {
                        failures: [],
                        message: message,
                        target: `remote-${data.id}`
                    },
                    payload:string = (message.indexOf("Copy complete.") === 0)
                        ? JSON.stringify({
                            "file-list-status": copyStatus
                        })
                    : message;
                if (data.agent === serverVars.deviceHash) {
                    response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                    response.write(payload);
                    response.end();
                } else {
                    const dirConfig:readDirectory = {
                        callback: function terminal_server_fileService_fileCallback_dir(directory:directoryList):void {
                            const location:string = (data.name.indexOf("\\") < 0 || data.name.charAt(data.name.indexOf("\\") + 1) === "\\")
                                    ? data.name
                                    : data.name.replace(/\\/g, "\\\\"),
                                update:fsUpdateRemote = {
                                    agent: data.agent,
                                    dirs: directory,
                                    fail: [],
                                    location: location,
                                    status: payload
                                };
                            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                            response.write(JSON.stringify({
                                "fs-update-remote": update
                            }));
                            response.end();
                        },
                        depth: 2,
                        exclusions: [],
                        mode: "read",
                        path: data.name,
                        symbolic: true
                    };
                    library.directory(dirConfig);
                }
            },
            httpRequest = function terminal_server_fileService_httpRequest(callback:Function, errorMessage:string, type:"body"|"object") {
                const payload:string = (function terminal_server_fileService_httpRequest_payload():string {
                        const keys:string[] = Object.keys(data),
                            length:number = keys.length,
                            store:Object = {};
                        let a:number = 0;
                        do {
                            store[keys[a]] = data[keys[a]];
                            a = a + 1;
                        } while (a < length);
                        if (data.action === "fs-base64" || data.action === "fs-destroy" || data.action === "fs-details" || data.action === "fs-hash" || data.action === "fs-new" || data.action === "fs-read" || data.action === "fs-rename" || data.action === "fs-search" || data.action === "fs-write") {
                            store["agent"] = serverVars.deviceHash;
                            store["agentType"] = "device";
                            store["copyAgent"] = data.agent;
                            store["copyType"] = data.agentType;
                        } else if (data.action === "fs-copy-request" || data.action === "fs-cut-request") {
                            store["agent"] = serverVars.name;
                        }
                        if (data.action === "fs-directory" && data.agent !== serverVars.deviceHash) {
                            store["remoteWatch"] = `${serverVars.addresses[0][1][1]}_${serverVars.webPort}`;
                        }
                        return JSON.stringify({
                            fs: store
                        });
                    }()),
                    httpConfig:httpConfiguration = {
                        agentType: data.agentType,
                        callback: callback,
                        callbackType: type,
                        errorMessage: errorMessage,
                        id: data.id,
                        ip: serverVars[data.agentType][data.agent].ip,
                        payload: payload,
                        port: serverVars[data.agentType][data.agent].port,
                        remoteName: data.agent,
                        response: response
                    };
                library.httpClient(httpConfig);
            },
            fsUpdateLocal = function terminal_server_fileService(readLocation:string):void {
                const fsUpdateCallback = function terminal_server_fileService_watchHandler_fsUpdateCallback(result:directoryList):void {
                        vars.ws.broadcast(JSON.stringify({
                            "fs-update-local": result
                        }));
                    },
                    dirConfig:readDirectory = {
                        callback: fsUpdateCallback,
                        depth: 2,
                        exclusions: [],
                        mode: "read",
                        path: readLocation,
                        symbolic: true
                    };
                library.directory(dirConfig);
            },
            watchHandler = function terminal_server_fileService_watchHandler(value:string):void {
                if (value.indexOf(vars.projectPath.replace(/(\\|\/)$/, "").replace(/\\/g, "\\\\")) !== 0) {
                    serverVars.watches[value].time = Date.now();
                    if (data.agent === serverVars.deviceHash) {
                        fsUpdateLocal(value);
                    } else {
                        const intervalHandler = function terminal_server_fileServices_watchHandler_intervalHandler():void {
                                if (serverVars.watches[value] === undefined) {
                                    delete serverVars.watches[value];
                                    clearInterval(interval);
                                } else if (Date.now() > serverVars.watches[value].time - 7200000) {
                                    serverVars.watches[value].close();
                                    delete serverVars.watches[value];
                                    clearInterval(interval);
                                }
                            },
                            dirConfig:readDirectory = {
                                callback: function terminal_server_fileService_watchHandler_remote(result:directoryList):void {
                                    const update:fsUpdateRemote = {
                                            agent: data.agent,
                                            dirs: result,
                                            fail: [],
                                            location: value
                                        },
                                        payload:string = JSON.stringify({
                                            "fs-update-remote": update
                                        }),
                                        httpConfig:httpConfiguration = {
                                            agentType: data.agentType,
                                            callback: function terminal_server_fileService_watchHandler_remote_directoryCallback(responseBody:Buffer|string):void {
                                                response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                                                response.write(responseBody);
                                                response.end();
                                            },
                                            callbackType: "body",
                                            errorMessage: `Error related to remote file system watch at ${data.agent}.`,
                                            id: "",
                                            ip: serverVars[data.agentType][data.agent].ip,
                                            payload: payload,
                                            port: serverVars[data.agentType][data.agent].port,
                                            remoteName: data.agent,
                                            response: response
                                        };
                                    library.httpClient(httpConfig);
                                },
                                depth: 2,
                                exclusions: [],
                                mode: "read",
                                path: value,
                                symbolic: true
                            },
                            interval = setInterval(intervalHandler, 60000);
                        // create directoryList object and send to remote
                        library.directory(dirConfig);
                    }
                }
            },
            remoteCopyList = function terminal_server_fileService_remoteCopyList(config:remoteCopyList):void {
                const list: [string, string, string, number][] = [],
                    callback = function terminal_server_fileService_remoteCopyList_callback(dir:directoryList):void {
                        const dirLength:number = dir.length,
                            location:string = (function terminal_server_fileServices_remoteCopyList_callback_location():string {
                                let backSlash:number = data.location[config.index].indexOf("\\"),
                                    forwardSlash:number = data.location[config.index].indexOf("/"),
                                    remoteSep:string = ((backSlash < forwardSlash && backSlash > -1 && forwardSlash > -1) || forwardSlash < 0)
                                        ? "\\"
                                        : "/",
                                    address:string[] = data.location[config.index].replace(/(\/|\\)$/, "").split(remoteSep);
                                address.pop();
                                return address.join(remoteSep) + remoteSep;
                            }());
                        let b:number = 0,
                            size:number,
                            largest:number = 0,
                            largeFile:number = 0,
                            stat:fs.Stats;
                        // list schema:
                        // 0. full item path
                        // 1. item type: directory, file
                        // 2. relative path from point of user selection
                        // 3. size in bytes from Stats object
                        do {
                            if (dir[b][1] === "file") {
                                stat = <fs.Stats>dir[b][5];
                                size = stat.size;
                                fileCount = fileCount + 1;
                                fileSize = fileSize + size;
                                if (size > largest) {
                                    largest = size;
                                }
                                if (size > 4294967296) {
                                    largeFile = largeFile + 1;
                                }
                            } else {
                                size = 0;
                                directories = directories + 1;
                            }
                            list.push([dir[b][0], dir[b][1], dir[b][0].replace(location, ""), size]);
                            b = b + 1;
                        } while (b < dirLength);
                        config.index = config.index + 1;
                        if (config.index < config.length) {
                            const recursiveConfig:readDirectory = {
                                callback: terminal_server_fileService_remoteCopyList_callback,
                                depth: 0,
                                exclusions: [],
                                mode: "read",
                                path: data.location[config.index],
                                symbolic: false
                            };
                            library.directory(recursiveConfig);
                        } else {
                            // sort directories ahead of files and then sort shorter directories before longer directories
                            // * This is necessary to ensure directories are written before the files and child directories that go in them.
                            const details:remoteCopyListData = {
                                directories: directories,
                                fileCount: fileCount,
                                fileSize: fileSize,
                                id: config.id,
                                list: list,
                                stream: (largest > 12884901888 || largeFile > 3 || (fileSize / fileCount) > 4294967296)
                            };
                            list.sort(function terminal_server_fileService_sortFiles(itemA:[string, string, string, number], itemB:[string, string, string, number]):number {
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
                            config.callback(details);
                        }
                    },
                    dirConfig:readDirectory = {
                        callback: callback,
                        depth: 0,
                        exclusions: [],
                        mode: "read",
                        path: data.location[config.index],
                        symbolic: false
                    };
                let directories:number =0,
                    fileCount:number = 0,
                    fileSize:number = 0;
                library.directory(dirConfig);
            },
            requestFiles = function terminal_server_fileService_requestFiles(fileData:remoteCopyListData):void {
                let writeActive:boolean = false,
                    writtenSize:number = 0,
                    writtenFiles:number = 0,
                    a:number = 0,
                    activeRequests:number = 0,
                    countDir:number = 0,
                    countFile:number = 0;
                const fileQueue:[string, number, string, Buffer][] = [],
                    hashFail:string[] = [],
                    listLength = fileData.list.length,
                    cutList:[string, string][] = [],
                    respond = function terminal_server_fileService_requestFiles_respond():void {
                        const status:completeStatus = {
                                countFile: countFile,
                                failures: hashFail.length,
                                percent: 100,
                                writtenSize: writtenSize
                            },
                            output:copyStatus = {
                                failures: hashFail,
                                message: copyMessage(status),
                                target: `local-${data.name.replace(/\\/g, "\\\\")}`
                            },
                            cut = function terminal_server_fileService_requestFiles_respond_cut():void {
                                if (data.action.indexOf("fs-cut") === 0) {
                                    const types:string[] = [];
                                    cutList.sort(function terminal_server_fileService_requestFiles_respond_cut_cutSort(itemA:[string, string], itemB:[string, string]):number {
                                        if (itemA[1] === "directory" && itemB[1] !== "directory") {
                                            return 1;
                                        }
                                        return -1;
                                    });
                                    data.location = [];
                                    cutList.forEach(function terminal_server_fileService_requestFiles_respond_cut_cutList(value:[string, string]):void {
                                        data.location.push(value[0]);
                                        types.push(value[1]);
                                    });
                                    data.action = "fs-cut-remove";
                                    data.name = JSON.stringify(types);
                                    data.watch = fileData.list[0][0].slice(0, fileData.list[0][0].lastIndexOf(fileData.list[0][2])).replace(/(\/|\\)+$/, "");
                                    httpRequest(function terminal_server_fileService_requestFiles_respond_cut_cutCall(responseBody:string|Buffer):void {
                                        library.log([<string>responseBody]);
                                    }, "Error requesting file removal for fs-cut.", "body");
                                }
                            };
                        library.log([``]);
                        cut();
                        response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                        vars.ws.broadcast(JSON.stringify({
                            "file-list-status": output
                        }));
                        output.target = `remote-${fileData.id}`;
                        response.write(JSON.stringify({
                            "file-list-status": output
                        }));
                        response.end();
                    },
                    writeFile = function terminal_server_fileService_requestFiles_writeFile(index:number):void {
                        const fileName:string = fileQueue[index][0];
                        vars.node.fs.writeFile(data.name + vars.sep + fileName, fileQueue[index][3], function terminal_server_fileServices_requestFiles_writeFile_write(wr:nodeError):void {
                            const hashFailLength:number = hashFail.length;
                            if (wr !== null) {
                                library.log([`Error writing file ${fileName} from remote agent ${data.agent}`, wr.toString()]);
                                vars.ws.broadcast(JSON.stringify({
                                    error: `Error writing file ${fileName} from remote agent ${data.agent}`
                                }));
                                hashFail.push(fileName);
                            } else {
                                const status:completeStatus = {
                                        countFile: countFile,
                                        failures: hashFailLength,
                                        percent: ((writtenSize / fileData.fileSize) * 100),
                                        writtenSize: writtenSize
                                    },
                                    output:copyStatus = {
                                        failures: [],
                                        message: copyMessage(status),
                                        target: `local-${data.name.replace(/\\/g, "\\\\")}`
                                    };
                                cutList.push([fileQueue[index][2], "file"]);
                                countFile = countFile + 1;
                                if (vars.command.indexOf("test") !== 0) {
                                    writtenFiles = writtenFiles + 1;
                                    writtenSize = writtenSize + fileQueue[index][1];
                                }
                                vars.ws.broadcast(JSON.stringify({
                                    "file-list-status": output
                                }));
                            }
                            if (index < fileQueue.length - 1) {
                                terminal_server_fileService_requestFiles_writeFile(index + 1);
                            } else {
                                if (countFile + countDir + hashFailLength === listLength) {
                                    respond();
                                } else {
                                    writeActive = false;
                                }
                            }
                        });
                    },
                    writeStream = function terminal_server_fileService_requestFiles_writeStream(fileResponse:http.IncomingMessage):void {
                        const fileName:string = <string>fileResponse.headers.file_name,
                            filePath:string = data.name + vars.sep + fileName,
                            decompress:zlib.BrotliDecompress = (fileResponse.headers.compression === "true")
                                ? vars.node.zlib.createBrotliDecompress()
                                : null,
                            writeStream:fs.WriteStream = vars.node.fs.createWriteStream(filePath),
                            hash:Hash = vars.node.crypto.createHash("sha512"),
                            fileError = function terminal_server_fileService_requestFiles_writeStream_fileError(message:string, fileAddress:string):void {
                                hashFail.push(fileAddress);
                                library.error([message]);
                                vars.node.fs.unlink(filePath, function terminal_server_fileService_requestFiles_writeStream_fileError_unlink(unlinkErr:nodeError):void {
                                    if (unlinkErr !== null) {
                                        library.error([unlinkErr.toString()]);
                                    }
                                });
                            };
                        if (fileResponse.headers.compression === "true") {
                            fileResponse.pipe(decompress).pipe(writeStream);
                        } else {
                            fileResponse.pipe(writeStream);
                        }
                        fileResponse.on("data", function terminal_server_fileService_requestFiles_writeStream_data():void {
                            const written:number = writeStream.bytesWritten + writtenSize,
                                status:completeStatus = {
                                    countFile: countFile,
                                    failures: hashFail.length,
                                    percent: (fileData.fileSize === 0 || fileData.fileSize === undefined || vars.command.indexOf("test") === 0)
                                        ? 100
                                        : ((written / fileData.fileSize) * 100),
                                    writtenSize: written
                                },
                                output:copyStatus = {
                                    failures: [],
                                    message: copyMessage(status),
                                    target: `local-${data.name.replace(/\\/g, "\\\\")}`
                                };
                            vars.ws.broadcast(JSON.stringify({
                                "file-list-status": output
                            }));
                        });
                        fileResponse.on("end", function terminal_server_fileService_requestFiles_writeStream_end():void {
                            const hashStream:fs.ReadStream = vars.node.fs.ReadStream(filePath);
                            decompress.end();
                            hashStream.pipe(hash);
                            hashStream.on("close", function terminal_server_fileServices_requestFiles_writeStream_end_hash():void {
                                const hashString:string = hash.digest("hex");
                                if (hashString === fileResponse.headers.hash) {
                                    cutList.push([<string>fileResponse.headers.cut_path, "file"]);
                                    countFile = countFile + 1;
                                    writtenFiles = writtenFiles + 1;
                                    writtenSize = writtenSize + fileData.list[a][3];
                                } else {
                                    library.log([`Hashes do not match for file ${fileName} from agent ${data.agent}`]);
                                    fileError(`Hashes do not match for file ${fileName} from agent ${data.agent}`, filePath);
                                }
                                a = a + 1;
                                if (a < listLength) {
                                    requestFile();
                                } else {
                                    respond();
                                }
                            });
                        });
                        fileResponse.on("error", function terminal_server_fileService_requestFiles_writeStream_error(error:nodeError):void {
                            fileError(error.toString(), filePath);
                        });
                    },
                    fileRequestCallback = function terminal_server_fileService_requestFiles_fileRequestCallback(fileResponse:http.IncomingMessage):void {
                        const fileChunks:Buffer[] = [],
                            writeable:Writable = new Stream.Writable(),
                            responseEnd = function terminal_server_fileService_requestFiles_fileRequestCallback_responseEnd(file:Buffer):void {
                                const fileName:string = <string>fileResponse.headers.file_name,
                                    hash:Hash = vars.node.crypto.createHash("sha512").update(file),
                                    hashString:string = hash.digest("hex");
                                if (hashString === fileResponse.headers.hash) {
                                    fileQueue.push([fileName, Number(fileResponse.headers.file_size), <string>fileResponse.headers.cut_path, file]);
                                    if (writeActive === false) {
                                        writeActive = true;
                                        writeFile(fileQueue.length - 1);
                                    }
                                } else {
                                    hashFail.push(fileName);
                                    library.log([`Hashes do not match for file ${fileName} from agent ${data.agent}`]);
                                    library.error([`Hashes do not match for file ${fileName} from agent ${data.agent}`]);
                                    if (countFile + countDir + hashFail.length === listLength) {
                                        respond();
                                    }
                                }
                                activeRequests = activeRequests - 1;
                                if (a < listLength) {
                                    requestFile();
                                }
                            };
                        writeable.write = function (writeableChunk:Buffer):boolean {
                            fileChunks.push(writeableChunk);
                            return false;
                        };
                        fileResponse.on("data", function terminal_server_fileServices_requestFiles_fileRequestCallback_data(fileChunk:Buffer):void {
                            fileChunks.push(fileChunk);
                        });
                        fileResponse.on("end", function terminal_server_fileServices_requestFiles_fileRequestCallback_end():void {
                            if (fileResponse.headers.compression === "true") {
                                vars.node.zlib.brotliDecompress(Buffer.concat(fileChunks), function terminal_server_fileServices_requestFiles_fileRequestCallback_data_decompress(errDecompress:nodeError, file:Buffer):void {
                                    if (errDecompress !== null) {
                                        library.error([errDecompress.toString()]);
                                        return;
                                    }
                                    responseEnd(file);
                                });
                            } else {
                                responseEnd(Buffer.concat(fileChunks));
                            }
                        });
                        fileResponse.on("error", function terminal_server_fileServices_requestFiles_fileRequestCallback_error(fileError:nodeError):void {
                            library.error([fileError.toString()]);
                        });
                    },
                    requestFile = function terminal_server_fileService_requestFiles_requestFile():void {
                        const writeCallback:Function = (fileData.stream === true)
                            ? writeStream
                            : fileRequestCallback;
                        data.depth = fileData.list[a][3];
                        if (data.copyAgent !== serverVars.deviceHash) {
                            const status:completeStatus = {
                                countFile: countFile,
                                failures: hashFail.length,
                                percent: (fileData.fileSize === 0 || fileData.fileSize === undefined || vars.command.indexOf("test") === 0)
                                    ? 100
                                    : ((writtenSize / fileData.fileSize) * 100),
                                writtenSize: writtenSize
                            };
                            data.id = `local-${data.name.replace(/\\/g, "\\\\")}|${copyMessage(status)}`;
                        }
                        data.location = [fileData.list[a][0]];
                        data.remoteWatch = fileData.list[a][2];
                        httpRequest(writeCallback, `Error on requesting file ${fileData.list[a][2]} from ${data.agent}`, "object");
                        if (fileData.stream === false) {
                            a = a + 1;
                            if (a < listLength) {
                                activeRequests = activeRequests + 1;
                                if (activeRequests < 8) {
                                    terminal_server_fileService_requestFiles_requestFile();
                                }
                            }
                        }
                    },
                    dirCallback = function terminal_server_fileService_requestFiles_dirCallback():void {
                        a = a + 1;
                        countDir = countDir + 1;
                        if (a < listLength) {
                            if (fileData.list[a][1] === "directory") {
                                makeDir();
                            } else {
                                data.action = <serviceFS>data.action.replace(/((list)|(request))/, "file");
                                requestFile();
                            }
                        }
                        if (countFile + countDir === listLength) {
                            respond();
                        }
                    },
                    makeDir = function terminal_server_fileService_requestFiles_makeLists():void {
                        library.makeDir(data.name + vars.sep + fileData.list[a][2], dirCallback);
                        cutList.push([fileData.list[a][0], "directory"]);
                    };
                if (fileData.stream === true) {
                    const filePlural:string = (fileData.fileCount === 1)
                            ? ""
                            : "s",
                        output:copyStatus = {
                            failures: [],
                            message: `Copy started for ${fileData.fileCount} file${filePlural} at ${library.prettyBytes(fileData.fileSize)} (${library.commas(fileData.fileSize)} bytes).`,
                            target: `local-${data.name.replace(/\\/g, "\\\\")}`
                        };
                    vars.ws.broadcast(JSON.stringify({
                        "file-list-status": output
                    }));
                }
                if (fileData.list[0][1] === "directory") {
                    makeDir();
                } else {
                    data.action = <serviceFS>data.action.replace(/((list)|(request))/, "file");
                    requestFile();
                }
            },
            copySameAgent = function terminal_server_fileService_copySameAgent():void {
                let count:number = 0,
                    countFile:number = 0,
                    writtenSize:number = 0;
                const length:number = data.location.length;
                data.location.forEach(function terminal_server_fileService_copySameAgent_each(value:string):void {
                    const callback = function terminal_server_fileService_copySameAgent_each_copy([fileCount, fileSize]):void {
                            count = count + 1;
                            countFile = countFile + fileCount;
                            writtenSize = (vars.command.indexOf("test") === 0)
                                ? 0
                                : writtenSize + fileSize;
                            if (count === length) {
                                const status:completeStatus = {
                                    countFile: countFile,
                                    failures: 0,
                                    percent: 100,
                                    writtenSize: writtenSize
                                };
                                fileCallback(copyMessage(status));
                            }
                        },
                        copyConfig:nodeCopyParams = {
                            callback: callback,
                            destination:data.name,
                            exclusions:[""],
                            target:value
                        };
                    library.copy(copyConfig);
                });
            };
        if (data.agent !== serverVars.deviceHash && (data.action === "fs-base64" || data.action === "fs-destroy" || data.action === "fs-details" || data.action === "fs-hash" || data.action === "fs-new" || data.action === "fs-read" || data.action === "fs-rename" || data.action === "fs-search" || data.action === "fs-write")) {
            httpRequest(function terminal_server_fileService_genericHTTP(responseBody:string|Buffer):void {
                response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                response.write(responseBody);
                response.end();
            }, `Error requesting ${data.action} from remote.`, "body");
        } else if (data.action === "fs-directory" || data.action === "fs-details") {
            if (data.agent === serverVars.deviceHash || (data.agent !== serverVars.deviceHash && typeof data.remoteWatch === "string" && data.remoteWatch.length > 0)) {
                const callback = function terminal_server_fileService_putCallback(result:directoryList):void {
                        count = count + 1;
                        if (result.length > 0) {
                            failures = failures.concat(result.failures);
                            output = output.concat(result);
                        }
                        if (count === pathLength) {
                            const responseData:fsRemote = {
                                dirs: "missing",
                                fail:[],
                                id: data.id
                            };
                            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                            if (output.length < 1) {
                                response.write(JSON.stringify(responseData));
                            } else {
                                responseData.dirs = output;
                                responseData.fail = failures;
                                response.write(JSON.stringify(responseData));
                            }
                            
                            // please note
                            // watch is ignored on all operations other than fs-directory
                            // fs-directory will only read from the first value in data.location
                            if (result.length > 0 && data.watch !== "no" && data.watch !== vars.projectPath) {
                                const watchPath:string = result[0][0].replace(/\\/g, "\\\\");
                                if (data.watch !== "yes" && serverVars.watches[data.watch] !== undefined) {
                                    serverVars.watches[data.watch].close();
                                    delete serverVars.watches[data.watch];
                                }
                                if (serverVars.watches[watchPath] === undefined) {
                                    serverVars.watches[watchPath] = vars.node.fs.watch(watchPath, {
                                        recursive: false
                                    }, function terminal_server_fileService_pathEach_putStat_watch():void {
                                        watchHandler(watchPath);
                                    });
                                } else {
                                    serverVars.watches[watchPath].time = Date.now();
                                }
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
                                    if (resultLength > 0) {
                                        do {
                                            result[b][3] = masterIndex; 
                                            b = b + 1;
                                        } while (b < resultLength);
                                        masterList = masterList.concat(result);
                                    }
                                    a = a + 1;
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
                                    isBlockDevice: function terminal_server_create_windowsRoot_isBlockDevice():boolean {
                                        return false;
                                    },
                                    isCharacterDevice: function terminal_server_create_windowsRoot_isCharacterDevice():boolean {
                                        return false;
                                    },
                                    isDirectory: function terminal_server_create_windowsRoot_isDirectory():boolean {
                                        return false;
                                    },
                                    isFIFO: function terminal_server_create_windowsRoot_isFIFO():boolean {
                                        return false;
                                    },
                                    isFile: function terminal_server_create_windowsRoot_isFile():boolean {
                                        return false;
                                    },
                                    isSocket: function terminal_server_create_windowsRoot_isSocket():boolean {
                                        return false;
                                    },
                                    isSymbolicLink: function terminal_server_create_windowsRoot_isSymbolicLink():boolean {
                                        return false;
                                    }
                                }]],
                                a:number = 0;
                            drives.forEach(function terminal_server_fileService_windowsRoot_each(value:string) {
                                const dirConfig:readDirectory = {
                                    callback: driveList,
                                    depth: 1,
                                    exclusions: [],
                                    mode: "read",
                                    path: `${value}\\`,
                                    symbolic: true
                                };
                                library.directory(dirConfig);
                            });
                        });
                    },
                    pathList:string[] = data.location,
                    pathLength:number = pathList.length;
                let count:number = 0,
                    output:directoryList = [],
                    failures:string[] = [];
                if (pathList[0] === "defaultLocation") {
                    pathList[0] = vars.projectPath;
                }
                pathList.forEach(function terminal_server_fileService_pathEach(value:string):void {
                    if (value === "\\" || value === "\\\\") {
                        windowsRoot();
                    } else {
                        vars.node.fs.stat(value, function terminal_server_fileService_pathEach_putStat(erp:nodeError):void {
                            const dirConfig:readDirectory = {
                                callback: callback,
                                depth: data.depth,
                                exclusions: [],
                                mode: "read",
                                path: value,
                                symbolic: true
                            };
                            if (erp !== null) {
                                library.error([erp.toString()]);
                                callback([]);
                                return;
                            }
                            if ((/^\w:$/).test(value) === true) {
                                value = value + "\\";
                            }
                            library.directory(dirConfig);
                        });
                    }
                });
            } else {
                // remote file server access
                httpRequest(function terminal_server_fileService_remoteFileAccess(responseBody:string|Buffer):void {
                    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                    if (responseBody.indexOf("{\"fs-update-remote\":") === 0) {
                        vars.ws.broadcast(responseBody);
                        response.write("Terminal received file system response from remote.");
                    } else {
                        response.write(responseBody);
                    }
                    response.end();
                }, `Error on reading from remote file system at agent ${data.agent}`, "body");
            }
        } else if (data.action === "fs-close") {
            if (serverVars.watches[data.location[0]] !== undefined) {
                serverVars.watches[data.location[0]].close();
                delete serverVars.watches[data.location[0]];
            }
            fileCallback(`Watcher ${data.location[0]} closed.`);
        } else if (data.action === "fs-copy" || data.action === "fs-cut") {
            if (data.agent === serverVars.deviceHash) {
                if (data.copyAgent === serverVars.deviceHash && data.copyType === "device") {
                    // * data.agent === local
                    // * data.copyAgent === local
                    copySameAgent();
                } else {
                    // copy from local to remote
                    // * data.agent === local
                    // * data.copyAgent === remote
                    // * response here is just for maintenance.  A list of files is pushed and the remote needs to request from that list, but otherwise a response isn't needed here.
                    const listData:remoteCopyList = {
                        callback: function terminal_server_fileService_remoteListCallback(listData:remoteCopyListData):void {
                            data.action = <serviceType>`${data.action}-request`;
                            data.agent = data.copyAgent;
                            data.agentType = data.copyType;
                            data.remoteWatch = JSON.stringify(listData);
                            httpRequest(function terminal_server_fileService_remoteListCallback_http(responseBody:string|Buffer):void {
                                response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                                response.write(responseBody);
                                response.end();
                            }, "Error sending list of files to remote for copy from local device.", "body");
                        },
                        files: [],
                        id: data.id,
                        index: 0,
                        length: data.location.length
                    };
                    remoteCopyList(listData);
                }
            } else if (data.copyAgent === serverVars.deviceHash && data.copyType === "device") {
                // data.agent === remote
                // data.copyAgent === local
                data.action = <serviceType>`${data.action}-list`;
                httpRequest(function terminal_server_fileService_toLocalhost(responseBody:string|Buffer):void {
                    requestFiles(JSON.parse(<string>responseBody));
                }, "Error copying from remote to local device", "body");
            } else if (data.agent === data.copyAgent && data.agentType === data.copyType) {
                // * data.agent === sameRemoteAgent
                // * data.agent === sameRemoteAgent
                data.action = <serviceType>`${data.action}-self`;
                httpRequest(function terminal_server_fileService_sameRemote(responseBody:string|Buffer):void {
                    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                    response.write(responseBody);
                    response.end();
                }, `Error copying files to and from agent ${data.agent}.`, "body");
            } else {
                // * data.agent === remoteAgent
                // * data.copyAgent === differentRemoteAgent
            }
        } else if (data.action === "fs-copy-file" || data.action === "fs-cut-file") {
            // request a single file
            // * generated internally from function requestFiles
            // * fs-copy-list and fs-cut-list (copy from remote to local device)
            // * fs-copy-request and fs-cut-request (copy from local device to remote)
            const hash:Hash = vars.node.crypto.createHash("sha512"),
                hashStream:fs.ReadStream = vars.node.fs.ReadStream(data.location[0]);
            hashStream.pipe(hash);
            hashStream.on("close", function terminal_server_fileService_fileRequest():void {
                const readStream:fs.ReadStream = vars.node.fs.ReadStream(data.location[0]),
                    compress:zlib.BrotliCompress = (serverVars.brotli > 0)
                        ? vars.node.zlib.createBrotliCompress({
                            params: {[vars.node.zlib.constants.BROTLI_PARAM_QUALITY]: serverVars.brotli}
                        })
                        : null;
                response.setHeader("hash", hash.digest("hex"));
                response.setHeader("file_name", data.remoteWatch);
                response.setHeader("file_size", data.depth);
                response.setHeader("cut_path", data.location[0]);
                if (serverVars.brotli > 0) {
                    response.setHeader("compression", "true");
                } else {
                    response.setHeader("compression", "false");
                }
                response.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
                if (serverVars.brotli > 0) {
                    readStream.pipe(compress).pipe(response);
                } else {
                    readStream.pipe(response);
                }
            });
            if (data.id.indexOf("|Copying ") > 0) {
                vars.ws.broadcast(JSON.stringify({
                    "file-list-status": {
                        failures: [],
                        message: data.id.slice(data.id.indexOf("|") + 1),
                        target: data.id.slice(0, data.id.indexOf("|"))
                    }
                }));
            }
        } else if (data.action === "fs-copy-list" || data.action === "fs-cut-list") {
            const listData:remoteCopyList = {
                callback: function terminal_server_fileService_remoteListCallback(listData:remoteCopyListData):void {
                    response.writeHead(200, {"Content-Type": "application/octet-stream; charset=utf-8"});
                    response.write(JSON.stringify(listData));
                    response.end();
                },
                files: [],
                id: data.id,
                index: 0,
                length: data.location.length
            };
            remoteCopyList(listData);
        } else if (data.action === "fs-copy-request" || data.action === "fs-cut-request") {
            requestFiles(JSON.parse(data.remoteWatch));
        } else if (data.action === "fs-copy-self" || data.action === "fs-cut-self") {
            copySameAgent();
        } else if (data.action === "fs-cut-remove") {
            let a:number = 0;
            const length:number = data.location.length,
                watchTest:boolean = (serverVars.watches[data.watch] !== undefined),
                types:string[] = JSON.parse(data.name),
                remove = function terminal_server_fileService_cutRemove():void {
                    if (a === length - 1 && watchTest === true) {
                        serverVars.watches[data.watch] = vars.node.fs.watch(data.watch, {
                            recursive: false
                        }, function terminal_server_fileService_cutRemote_watch():void {
                            watchHandler(data.watch);
                        });
                    }
                    if (a < length) {
                        if (types[a] === "file") {
                            library.remove(data.location[a], terminal_server_fileService_cutRemove);
                            a = a + 1;
                        } else {
                            vars.node.fs.readdir(data.location[a], function terminal_server_fileService_cutRemove_readdir(erd:nodeError, items:string[]):void {
                                if (erd === null && items.length < 1) {
                                    library.remove(data.location[a], terminal_server_fileService_cutRemove);
                                    a = a + 1;
                                }
                            });
                        }
                    } else {
                        response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write("File system items removed.");
                        response.end();
                    }
                };
                if (watchTest === true) {
                    serverVars.watches[data.watch].close();
                }
            remove();
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
                        const agent:string = (data.copyAgent === "")
                                ? serverVars.deviceHash
                                : data.copyAgent,
                            type:agentType = (data.copyAgent === "")
                                ? "device"
                                : data.copyType;
                        fileCallback(`Path(s) ${data.location.join(", ")} destroyed on ${type} ${agent}.`);
                    }
                });
            });
        } else if (data.action === "fs-rename") {
            const newPath:string[] = data.location[0].split(vars.sep);
            newPath.pop();
            newPath.push(data.name);
            vars.node.fs.rename(data.location[0], newPath.join(vars.sep), function terminal_server_fileService_rename(erRename:Error):void {
                if (erRename === null) {
                    const agent:string = (data.copyAgent === "")
                            ? serverVars.deviceHash
                            : data.copyAgent,
                        type:agentType = (data.copyAgent === "")
                            ? "device"
                            : data.copyType;
                    fileCallback(`Path ${data.location[0]} on ${type} ${agent} renamed to ${newPath.join(vars.sep)}.`);
                } else {
                    library.error([erRename.toString()]);
                    library.log([erRename.toString()]);
                    response.writeHead(500, {"Content-Type": "text/plain; charset=utf-8"});
                    response.write(erRename.toString());
                    response.end();
                }
            });
        } else if (data.action === "fs-base64" || data.action === "fs-hash" || data.action === "fs-read") {
            const length:number = data.location.length,
                storage:stringDataList = [],
                type:string = data.action.replace("fs-", ""),
                callback = function terminal_server_fileService_callback(output:base64Output):void {
                    const stringData:stringData = {
                        content: output[type],
                        id: output.id,
                        path: output.filePath
                    };
                    b = b + 1;
                    storage.push(stringData);
                    if (b === length) {
                        response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                        response.write(JSON.stringify(storage));
                        response.end();
                    }
                },
                fileReader = function terminal_server_fileService_fileReader(input:base64Input):void {
                    vars.node.fs.readFile(input.source, "utf8", function terminal_server_fileService_fileReader(readError:nodeError, fileData:string) {
                        const inputConfig:stringData = {
                            content: fileData,
                            id: input.id,
                            path: input.source
                        };
                        if (readError !== null) {
                            library.error([readError.toString()]);
                            vars.ws.broadcast(JSON.stringify({
                                error: readError
                            }));
                            return;
                        }
                        input.callback(inputConfig);
                    });
                },
                input:base64Input = {
                    callback: callback,
                    id: "",
                    source: ""
                },
                hashInput:hashInput = {
                    algorithm: serverVars.hash,
                    callback: callback,
                    directInput: false,
                    id: "",
                    source: ""
                };
            let a:number = 0,
                b:number = 0,
                index:number;
            do {
                if (data.action === "fs-base64") {
                    index = data.location[a].indexOf(":");
                    input.id = data.location[a].slice(0, index);
                    input.source = data.location[a].slice(index + 1);
                    library[type](input);
                } else if (data.action === "fs-hash") {
                    index = data.location[a].indexOf(":");
                    hashInput.id = data.location[a].slice(0, index);
                    hashInput.source = data.location[a].slice(index + 1);
                    library.hash(hashInput);
                } else if (data.action === "fs-read") {
                    input.id = data.id;
                    input.source = data.location[a];
                    fileReader(input);
                }
                a = a + 1;
            } while (a < length);
        } else if (data.action === "fs-new") {
            const slash:string = (data.location[0].indexOf("/") < 0 || (data.location[0].indexOf("\\") < data.location[0].indexOf("/") && data.location[0].indexOf("\\") > -1 && data.location[0].indexOf("/") > -1))
                    ? "\\"
                    : "/",
                dirs = data.location[0].split(slash);
            dirs.pop();
            if (data.name === "directory") {
                library.makeDir(data.location[0], function terminal_server_fileService_newDirectory():void {
                    fileCallback(`${data.location[0]} created.`);
                    fsUpdateLocal(dirs.join(slash));
                });
            } else if (data.name === "file") {
                vars.node.fs.writeFile(data.location[0], "", "utf8", function terminal_server_fileService_newFile(erNewFile:Error):void {
                    if (erNewFile === null) {
                        fileCallback(`${data.location[0]} created.`);
                        fsUpdateLocal(dirs.join(slash));
                    } else {
                        library.error([erNewFile.toString()]);
                        library.log([erNewFile.toString()]);
                        response.writeHead(500, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write(erNewFile.toString());
                        response.end();
                    }
                });
            }
        } else if (data.action === "fs-search") {
            const callback = function terminal_server_fileService_searchCallback(result:directoryList):void {
                    const output:fsRemote = {
                        dirs: result,
                        fail: [],
                        id: data.id
                    };
                    delete result.failures;
                    response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                    response.write(JSON.stringify(output));
                    response.end();
                },
                dirConfig:readDirectory = {
                    callback: callback,
                    depth: data.depth,
                    exclusions: [],
                    mode: "search",
                    path: data.location[0],
                    search: data.name,
                    symbolic: true
                };
            library.directory(dirConfig);
        } else if (data.action === "fs-write") {
            vars.node.fs.writeFile(data.location[0], data.name, "utf8", function terminal_server_fileService_write(erw:nodeError):void {
                const agent:string = (data.copyAgent === "")
                        ? serverVars.deviceHash
                        : data.copyAgent,
                    type:agentType = (data.copyAgent === "")
                        ? "device"
                        : data.copyType;
                let message:string = `File ${data.location[0]} saved to disk on ${type} ${agent}.`;
                if (erw !== null) {
                    library.error([erw.toString()]);
                    vars.ws.broadcast(JSON.stringify({
                        error: erw
                    }));
                    message = `Error writing file: ${erw.toString()}`;
                }
                response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                response.write(message);
                response.end();
            });
        }
    };

export default fileService;