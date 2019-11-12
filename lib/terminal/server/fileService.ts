
import * as http from "http";
import * as fs from "fs";
import { Hash } from "crypto";

import base64 from "../base64.js";
import commas from "../../common/commas.js";
import copy from "../copy.js";
import directory from "../directory.js";
import error from "../error.js";
import hash from "../hash.js";
import log from "../log.js";
import makeDir from "../makeDir.js";
import prettyBytes from "../../common/prettyBytes.js";
import readFile from "../readFile.js";
import remove from "../remove.js";
import vars from "../vars.js";

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
                            response.write(`fsUpdateRemote:{"agent":"${data.agent}", "dirs":${JSON.stringify(directory)},"location":"${location}","status":"${message}"}`);
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
            },
            watchHandler = function terminal_server_fileService_watchHandler(value:string):void {
                if (value !== vars.projectPath && value + vars.sep !== vars.projectPath) {
                    if (data.agent === "localhost") {
                        vars.ws.broadcast(`fsUpdate:${value}`);
                    } else {
                        // create directoryList object and send to remote
                        library.directory({
                            callback: function terminal_server_fileService_watchHandler_remote(result:directoryList):void {
                                const remoteData:string[] = data.remoteWatch.split("_"),
                                    remoteAddress:string = remoteData[0],
                                    remotePort:number = Number(remoteData[1]),
                                    location:string = (value.indexOf("\\") < 0 || value.charAt(value.indexOf("\\") + 1) === "\\")
                                        ? value
                                        : value.replace(/\\/g, "\\\\"),
                                    payload:string = `fsUpdateRemote:{"agent":"${data.agent}","dirs":${JSON.stringify(result)},"location":"${location}"}`,
                                    fsRequest:http.ClientRequest = vars.node.http.request({
                                        headers: {
                                            "Content-Type": "application/x-www-form-urlencoded",
                                            "Content-Length": Buffer.byteLength(payload)
                                        },
                                        host: remoteAddress,
                                        method: "POST",
                                        path: "/",
                                        port: remotePort,
                                        timeout: 4000
                                    }, function terminal_server_fileService_watchHandler_remote_callback(fsResponse:http.IncomingMessage):void {
                                        const chunks:string[] = [];
                                        fsResponse.setEncoding("utf8");
                                        fsResponse.on("data", function terminal_server_fileService_watchHandler_remote_callback_data(chunk:string):void {
                                            chunks.push(chunk);
                                        });
                                        fsResponse.on("end", function terminal_server_fileService_watchHandler_remote_callback_end():void {
                                            if (response.finished === false) {
                                                response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                                                response.write(chunks.join(""));
                                                response.end();
                                            }
                                        });
                                        fsResponse.on("error", function terminal_server_fileService_watchHandler_remote_callback_error(errorMessage:nodeError):void {
                                            if (errorMessage.code !== "ETIMEDOUT") {
                                                library.log([errorMessage.toString()]);
                                                vars.ws.broadcast(errorMessage.toString());
                                            }
                                        });
                                    });
                                fsRequest.on("error", function terminal_server_fileService_watchHandler_remote_requestError(errorMessage:nodeError):void {
                                    if (errorMessage.code !== "ETIMEDOUT") {
                                        library.log(["watch-remote", errorMessage.stack]);
                                        vars.ws.broadcast(errorMessage.toString());
                                    }
                                    if (response.finished === false) {
                                        response.writeHead(500, {"Content-Type": "application/json; charset=utf-8"});
                                        response.write("Error sending directory watch to remote.");
                                        response.end();
                                    }
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
                            largeFile:number = 0;
                        // list schema:
                        // 0. full item path
                        // 1. item type: directory, file
                        // 2. relative path from point of user selection
                        // 3. size in bytes from Stats object
                        do {
                            if (dir[b][1] === "file") {
                                size = dir[b][5].size;
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
                            library.directory({
                                callback: terminal_server_fileService_remoteCopyList_callback,
                                depth: 0,
                                exclusions: [],
                                hash: false,
                                path: data.location[config.index],
                                recursive: true,
                                symbolic: false
                            });
                        } else {
                            // sort directories ahead of files and then sort shorter directories before longer directories
                            // * This is necessary to ensure directories are written before the files and child directories that go in them.
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
                            config.callback({
                                directories: directories,
                                fileCount: fileCount,
                                fileSize: fileSize,
                                id: config.id,
                                list: list,
                                stream: (largest > 12884901888 || largeFile > 3 || (fileSize / fileCount) > 4294967296)
                            });
                        }
                    };
                let directories:number =0,
                    fileCount:number = 0,
                    fileSize:number = 0;
                library.directory({
                    callback: callback,
                    depth: 0,
                    exclusions: [],
                    hash: false,
                    path: data.location[config.index],
                    recursive: true,
                    symbolic: false
                });
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
                        const filePlural:string = (countFile === 1)
                                ? ""
                                : "s",
                            hashFailLength:number = hashFail.length,
                            hashFailPlural:string = (hashFailLength === 1)
                                ? ""
                                : "s";
                        library.log([``]);
                        if (data.action.indexOf("fs-cut") === 0) {
                            const types:string[] = [];
                            cutList.sort(function terminal_server_fileService_requestFiles_respond_cutSort(itemA:[string, string], itemB:[string, string]):number {
                                if (itemA[1] === "directory" && itemB[1] !== "directory") {
                                    return 1;
                                }
                                return -1;
                            });
                            data.location = [];
                            cutList.forEach(function terminal_server_fileService_requestFiles_respond_cutList(value:[string, string]):void {
                                data.location.push(value[0]);
                                types.push(value[1]);
                            });
                            data.action = "fs-cut-remove";
                            data.name = JSON.stringify(types);
                            data.watch = fileData[0][0].slice(0, fileData[0][0].lastIndexOf(fileData[0][2]));
                            library.httpClient({
                                callback: function terminal_server_fileService_requestFiles_respond_cutCall(fsResponse:http.IncomingMessage):void {
                                    const chunks:string[] = [];
                                    fsResponse.setEncoding("utf8");
                                    fsResponse.on("data", function terminal_server_fileService_remoteString_data(chunk:string):void {
                                        chunks.push(chunk);
                                    });
                                    fsResponse.on("end", function terminal_server_fileService_remoteString_end():void {
                                        const body:string = chunks.join("");
                                        library.log([body]);
                                    });
                                    fsResponse.on("error", function terminal_server_fileService_remoteString_error(errorMessage:nodeError):void {
                                        if (errorMessage.code !== "ETIMEDOUT") {
                                            library.log([errorMessage.toString()]);
                                            vars.ws.broadcast(errorMessage.toString());
                                        }
                                    });
                                },
                                data:data,
                                errorMessage: "Error requesting file removal for fs-cut.",
                                response: response
                            });
                        }
                        response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                        vars.ws.broadcast(`fileListStatus:{"failures":${JSON.stringify(hashFail)},"id":"${fileData.id}","message":"Copy complete. ${library.commas(countFile)} file${filePlural} written at size ${library.prettyBytes(writtenSize)} (${library.commas(writtenSize)} bytes) with ${hashFailLength} failure${hashFailPlural}."}`);
                        response.write(`fileListStatus:{"failures":${JSON.stringify(hashFail)},"id":"${fileData.id}","message":"Copy complete. ${library.commas(countFile)} file${filePlural} written at size ${library.prettyBytes(writtenSize)} (${library.commas(writtenSize)} bytes) with ${hashFailLength} failure${hashFailPlural}."}`);
                        response.end();
                    },
                    writeFile = function terminal_server_fileService_requestFiles_writeFile(index:number):void {
                        const fileName:string = fileQueue[index][0];
                        vars.node.fs.writeFile(data.name + vars.sep + fileName, fileQueue[index][3], function terminal_server_fileServices_requestFiles_fileCallback_end_writeFile(wr:nodeError):void {
                            const filePlural:string = (countFile === 1)
                                    ? ""
                                    : "s",
                                hashFailLength:number = hashFail.length,
                                hashFailPlural:string = (hashFailLength === 1)
                                    ? ""
                                    : "s";
                            if (wr !== null) {
                                library.log([`Error writing file ${fileName} from remote agent ${data.agent}`, wr.toString()]);
                                vars.ws.broadcast(`Error writing file ${fileName} from remote agent ${data.agent}`);
                                hashFail.push(fileName);
                            } else {
                                cutList.push([fileQueue[index][2], "file"]);
                                countFile = countFile + 1;
                                writtenFiles = writtenFiles + 1;
                                writtenSize = writtenSize + fileQueue[index][1];
                                vars.ws.broadcast(`fileListStatus:{"failures":[],"id":"${fileData.id}","message":"Copying ${((writtenSize / fileData.fileSize) * 100).toFixed(2)}% complete. ${countFile} file${filePlural} written at size ${library.prettyBytes(writtenSize)} (${library.commas(writtenSize)} bytes) and ${library.commas(hashFailLength)} integrity failure${hashFailPlural}."}`);
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
                            writeStream:fs.WriteStream = vars.node.fs.createWriteStream(filePath),
                            hash:Hash = vars.node.crypto.createHash("sha512"),
                            fileError = function terminal_server_fileService_requestFiles_writeStream_fileError(message:string, fileAddress:string):void {
                                hashFail.push(fileAddress);
                                library.error([message]);
                                vars.node.fs.unlink(filePath);
                            };
                        fileResponse.on("data", function terminal_server_fileService_requestFiles_writeStream_data(fileChunk:string):void {
                            writeStream.write(fileChunk);
                            const filePlural:string = (countFile === 1)
                                    ? ""
                                    : "s",
                                hashFailLength:number = hashFail.length,
                                hashFailPlural:string = (hashFailLength === 1)
                                    ? ""
                                    : "s",
                                written:number = writeStream.bytesWritten + writtenSize;
                            vars.ws.broadcast(`fileListStatus:{"failures":[],"id":"${fileData.id}","message":"Copying ${((written / fileData.fileSize) * 100).toFixed(2)}% complete for ${fileData.fileCount} files. ${countFile} file${filePlural} written at size ${library.prettyBytes(written)} (${library.commas(written)} bytes) and ${library.commas(hashFailLength)} integrity failure${hashFailPlural}."}`);
                        });
                        fileResponse.on("end", function terminal_server_fileService_requestFiles_writeStream_end():void {
                            const hashStream:fs.ReadStream = vars.node.fs.ReadStream(filePath);
                            writeStream.end();
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
                        const fileChunks:Buffer[] = [];
                        fileResponse.on("data", function terminal_server_fileServices_requestFiles_fileRequestCallback_data(fileChunk:string):void {
                            fileChunks.push(Buffer.from(fileChunk, "binary"));
                        });
                        fileResponse.on("end", function terminal_server_fileServices_requestFiles_fileRequestCallback_end():void {
                            const file:Buffer = Buffer.concat(fileChunks),
                                fileName:string = <string>fileResponse.headers.file_name,
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
                        });
                        fileResponse.on("error", function terminal_server_fileServices_requestFiles_fileRequestCallback_error(fileError:nodeError):void {
                            library.error([fileError.toString()]);
                        });
                    },
                    requestFile = function terminal_server_fileService_requestFiles_requestFile():void {
                        data.depth = fileData.list[a][3];
                        if (data.copyAgent !== "localhost") {
                            const filePlural:string = (countFile === 1)
                                    ? ""
                                    : "s",
                                hashFailLength:number = hashFail.length,
                                hashFailPlural:string = (hashFailLength === 1)
                                    ? ""
                                    : "s";
                            data.id = `fileListStatus:{"failures":[],"id":"${fileData.id}","message":"Copying ${((writtenSize / fileData.fileSize) * 100).toFixed(2)}% complete. ${countFile} file${filePlural} written at size ${library.prettyBytes(writtenSize)} (${library.commas(writtenSize)} bytes) and ${library.commas(hashFailLength)} integrity failure${hashFailPlural}."}`;
                        }
                        data.location = [fileData.list[a][0]];
                        data.remoteWatch = fileData.list[a][2];
                        library.httpClient({
                            callback: (fileData.stream === true)
                                ? writeStream
                                : fileRequestCallback,
                            data: data,
                            errorMessage: `Error on requesting file ${fileData.list[a][2]} from ${data.agent}`,
                            response: response
                        });
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
                        : "s";
                    vars.ws.broadcast(`fileListStatus:{"failures":[],"id":"${fileData.id}","message":"Copy started for ${fileData.fileCount} file${filePlural} at ${library.prettyBytes(fileData.fileSize)} (${library.commas(fileData.fileSize)} bytes)."}`);
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
                        writtenSize = writtenSize + fileSize;
                        if (count === length) {
                            const filePlural:string = (countFile === 1)
                                ? ""
                                : "s";
                            fileCallback(`fileListStatus:{"failures":[],"id":"${data.id}","message":"Copy complete. ${library.commas(countFile)} file${filePlural} written at size ${library.prettyBytes(writtenSize)} (${library.commas(writtenSize)} bytes) with 0 failures."}`);
                        }
                    };
                    library.copy({
                        callback: callback,
                        destination:data.name,
                        exclusions:[""],
                        target:value
                    });
                });
            };
        if (data.agent !== "localhost" && (data.action === "fs-base64" || data.action === "fs-destroy" || data.action === "fs-details" || data.action === "fs-hash" || data.action === "fs-new" || data.action === "fs-read" || data.action === "fs-rename" || data.action === "fs-write")) {
            library.httpClient({
                callback: function terminal_server_fileService_remoteString(fsResponse:http.IncomingMessage):void {
                    const chunks:string[] = [];
                    fsResponse.setEncoding("utf8");
                    fsResponse.on("data", function terminal_server_fileService_remoteString_data(chunk:string):void {
                        chunks.push(chunk);
                    });
                    fsResponse.on("end", function terminal_server_fileService_remoteString_end():void {
                        const body:string = chunks.join("");
                        response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                        response.write(body);
                        response.end();
                    });
                    fsResponse.on("error", function terminal_server_fileService_remoteString_error(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT") {
                            library.log([errorMessage.toString()]);
                            vars.ws.broadcast(errorMessage.toString());
                        }
                    });
                },
                data: data,
                errorMessage: `Error requesting ${data.action} from remote.`,
                response: response
            });
        } else if (data.action === "fs-directory" || data.action === "fs-details") {
            if (data.agent === "localhost" || (data.agent !== "localhost" && typeof data.remoteWatch === "string" && data.remoteWatch.length > 0)) {
                const callback = function terminal_server_fileService_putCallback(result:directoryList):void {
                        count = count + 1;
                        if (result.length > 0) {
                            failures = failures.concat(result.failures);
                            output = output.concat(result);
                        }
                        if (count === pathLength) {
                            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                            if (output.length < 1) {
                                response.write(`{"id":"${data.id}","dirs":"missing","fail":[]}`);
                            } else {
                                response.write(`{"id":"${data.id}","dirs":${JSON.stringify(output)},"fail":${JSON.stringify(failures)}}`);
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
                            if (erp !== null) {
                                library.error([erp.toString()]);
                                callback([]);
                                return;
                            }

                            // please note
                            // watch is ignored on all operations other than fs-directory
                            // fs-directory will only read from the first value in data.location
                            if (data.watch !== "no" && data.watch !== vars.projectPath) {
                                if (data.watch !== "yes" && serverVars.watches[data.watch] !== undefined) {
                                    serverVars.watches[data.watch].close();
                                    delete serverVars.watches[data.watch];
                                }
                                if (serverVars.watches[value] === undefined) {
                                    serverVars.watches[value] = vars.node.fs.watch(value, {
                                        recursive: false
                                    }, function terminal_server_fileService_pathEach_putStat_watch():void {
                                        watchHandler(value);
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
                // remote file server access
                library.httpClient({
                    callback: function terminal_server_fileService_remoteCopy(fsResponse:http.IncomingMessage):void {
                        const chunks:string[] = [];
                        fsResponse.setEncoding("utf8");
                        fsResponse.on("data", function terminal_server_fileService_remoteCopy_data(chunk:string):void {
                            chunks.push(chunk);
                        });
                        fsResponse.on("end", function terminal_server_fileService_remoteCopy_end():void {
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
                        fsResponse.on("error", function terminal_server_fileService_remoteCopy_error(errorMessage:nodeError):void {
                            if (errorMessage.code !== "ETIMEDOUT") {
                                library.log([errorMessage.toString()]);
                                vars.ws.broadcast(errorMessage.toString());
                            }
                        });
                    },
                    data: data,
                    errorMessage: `Error on reading from remote file system at agent ${data.agent}`,
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
            if (data.agent === "localhost") {
                if (data.copyAgent === "localhost") {
                    // * data.agent === "localhost"
                    // * data.copyAgent === "localhost"
                    copySameAgent();
                } else {
                    // copy from local to remote
                    // * data.agent === "localhost"
                    // * data.copyAgent === remoteAgent
                    // * response here is just for maintenance.  A list of files is pushed and the remote needs to request from that list, but otherwise a response isn't needed here.
                    remoteCopyList({
                        callback: function terminal_server_fileService_remoteListCallback(listData:remoteCopyListData):void {
                            data.action = <serviceType>`${data.action}-request`;
                            data.agent = data.copyAgent;
                            data.remoteWatch = JSON.stringify(listData);
                            library.httpClient({
                                callback: function terminal_server_fileServices_remoteListCallback_http(fsResponse:http.IncomingMessage):void {
                                    const chunks:string[] = [];
                                    fsResponse.on("data", function terminal_server_fileService_remoteListCallback_http_data(chunk:string):void {
                                        chunks.push(chunk);
                                    });
                                    fsResponse.on("end", function terminal_server_fileService_remoteListCallback_end():void {
                                        response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                                        response.write(chunks.join(""));
                                        response.end();
                                    });
                                    fsResponse.on("error", function terminal_server_fileService_remoteListCallback_http_error(errorMessage:nodeError):void {
                                        if (errorMessage.code !== "ETIMEDOUT") {
                                            library.log([errorMessage.toString()]);
                                            vars.ws.broadcast(errorMessage.toString());
                                        }
                                    });
                                },
                                data: data,
                                errorMessage: "Error sending list of files to remote for copy from localhost.",
                                response: response
                            });
                        },
                        files: [],
                        id: data.id,
                        index: 0,
                        length: data.location.length
                    });
                }
            } else if (data.copyAgent === "localhost") {
                // data.agent === remoteAgent
                // data.copyAgent === "localhost"
                const action:serviceType = <serviceType>`${data.action}-list`,
                    callback = function terminal_server_fileService_response(fsResponse:http.IncomingMessage):void {
                        const chunks:string[] = [];
                        fsResponse.on("data", function terminal_server_fileService_response_data(chunk:string):void {
                            chunks.push(chunk);
                        });
                        fsResponse.on("end", function terminal_server_fileService_response_end():void {
                            requestFiles(JSON.parse(chunks.join("")));
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
            } else if (data.agent === data.copyAgent) {
                // * data.agent === sameRemoteAgent
                // * data.agent === sameRemoteAgent
                const action:serviceType = <serviceType>`${data.action}-self`;
                data.action = action;
                library.httpClient({
                    callback: function terminal_server_fileService_selfResponse(fsResponse:http.IncomingMessage):void {
                        const chunks:string[] = [];
                        fsResponse.setEncoding("utf8");
                        fsResponse.on("data", function terminal_server_fileService_remoteString_data(chunk:string):void {
                            chunks.push(chunk);
                        });
                        fsResponse.on("end", function terminal_server_fileService_remoteString_end():void {
                            const body:string = chunks.join("");
                            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                            response.write(body);
                            response.end();
                        });
                        fsResponse.on("error", function terminal_server_fileService_remoteString_error(errorMessage:nodeError):void {
                            if (errorMessage.code !== "ETIMEDOUT") {
                                library.log([errorMessage.toString()]);
                                vars.ws.broadcast(errorMessage.toString());
                            }
                        });
                    },
                    data: data,
                    errorMessage: `Error copying files to and from agent ${data.agent}.`,
                    response: response
                });
            } else {
                // * data.agent === remoteAgent
                // * data.copyAgent === differentRemoteAgent
            }
        } else if (data.action === "fs-copy-file" || data.action === "fs-cut-file") {
            // request a single file
            // * generated internally from function requestFiles
            // * fs-copy-list and fs-cut-list (copy from remote to localhost)
            // * fs-copy-request and fs-cut-request (copy from localhost to remote)
            const hash:Hash = vars.node.crypto.createHash("sha512"),
                hashStream:fs.ReadStream = vars.node.fs.ReadStream(data.location[0]);
            hashStream.pipe(hash);
            hashStream.on("close", function terminal_server_fileService_fileRequest():void {
                const readStream:fs.ReadStream = vars.node.fs.ReadStream(data.location[0]);
                response.setHeader("hash", hash.digest("hex"));
                response.setHeader("file_name", data.remoteWatch);
                response.setHeader("file_size", data.depth);
                response.setHeader("cut_path", data.location[0]);
                response.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
                readStream.pipe(response);
            });
            if (data.id.indexOf("fileListStatus:") === 0) {
                vars.ws.broadcast(data.id);
            }
        } else if (data.action === "fs-copy-list" || data.action === "fs-cut-list") {
            remoteCopyList({
                callback: function terminal_server_fileService_remoteListCallback(listData:remoteCopyListData):void {
                    response.writeHead(200, {"Content-Type": "application/octet-stream; charset=utf-8"});
                    response.write(JSON.stringify(listData));
                    response.end();
                },
                files: [],
                id: data.id,
                index: 0,
                length: data.location.length
            });
        } else if (data.action === "fs-copy-request" || data.action === "fs-cut-request") {
            requestFiles(JSON.parse(data.remoteWatch));
        } else if (data.action === "fs-copy-self" || data.action === "fs-cut-self") {
            copySameAgent();
        } else if (data.action === "fs-cut-remove") {
            let a:number = 0;
            const length:number = data.location.length,
                types:string[] = JSON.parse(data.name),
                remove = function terminal_server_fileService_cutRemove():void {
                    if (a === length - 1) {
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
                serverVars.watches[data.watch].close();
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
        } else if (data.action === "fs-base64" || data.action === "fs-hash" || data.action === "fs-read") {
            const length:number = data.location.length,
                storage:stringDataList = [],
                type:string = data.action.replace("fs-", ""),
                callback = function terminal_server_fileService_callback(output:base64Output):void {
                    b = b + 1;
                    storage.push({
                        content: output[type],
                        id: output.id,
                        path: output.filePath
                    });
                    if (b === length) {
                        response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
                        response.write(JSON.stringify(storage));
                        response.end();
                    }
                },
                fileReader = function terminal_server_fileService_fileReader(input:base64Input):void {
                    vars.node.fs.readFile(input.source, "utf8", function terminal_server_fileService_fileReader(readError:nodeError, fileData:string) {
                        if (readError !== null) {
                            library.error([readError.toString()]);
                            vars.ws.broadcast(`error:${readError.toString()}`);
                            return;
                        }
                        input.callback({
                            id: input.id,
                            filePath: input.source,
                            read: fileData
                        });
                    });
                };
            let a:number = 0,
                b:number = 0,
                id:string,
                index:number,
                location:string;
            do {
                index = data.location[a].indexOf(":");
                id = data.location[a].slice(0, index);
                location = data.location[a].slice(index + 1);
                if (data.action === "fs-base64") {
                    library[type]({
                        callback: callback,
                        id: id,
                        source: location
                    });
                } else if (data.action === "fs-hash") {
                    library.hash({
                        callback: callback,
                        directInput: false,
                        id: id,
                        source: location
                    });
                } else if (data.action === "fs-read") {
                    fileReader({
                        callback: callback,
                        id: id,
                        source: location
                    });
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
        } else if (data.action === "fs-write") {
            vars.node.fs.writeFile(data.location[0], data.name, "utf8", function terminal_server_fileService_write(erw:nodeError):void {
                let message:string = `File ${data.location[0]} saved to disk on ${data.copyAgent}.`;
                if (erw !== null) {
                    library.error([erw.toString()]);
                    vars.ws.broadcast(`error:${erw.toString()}`);
                    message = `Error writing file: ${erw.toString()}`;
                }
                response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
                response.write(message);
                response.end();
            });
        }
    };

export default fileService;