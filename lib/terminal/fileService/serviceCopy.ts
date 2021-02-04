
/* lib/terminal/fileService/serviceCopy - A library that stores instructions for copy and cut of file system artifacts. */

import { Hash } from "crypto";
import { ReadStream, WriteStream } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { Stream, Writable } from "stream";
import { BrotliCompress, BrotliDecompress } from "zlib";

import common from "../../common/common.js";
import copy from "../commands/copy.js";
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import fileServices from "./serviceFile.js";
import hash from "../commands/hash.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";
import httpClient from "../server/httpClient.js";
import serviceFile from "./serviceFile.js";

const serviceCopy:systemServiceCopy = {
    actions: {
        requestFiles: function terminal_fileService_serviceCopy_requestFiles(serverResponse:ServerResponse, config:systemRequestFiles):void {
            let writeActive:boolean = false,
                writtenFiles:number = 0,
                a:number = 0,
                activeRequests:number = 0,
                countDir:number = 0;
            const statusConfig:copyStatusConfig = {
                    agent: config.data.copyAgent,
                    agentType: config.data.copyType,
                    countFile: 0,
                    cut: config.data.cut,
                    failures: 0,
                    location: config.data.location,
                    message: "",
                    modalAddress: config.data.modalAddress,
                    responseAgent: config.data.agent,
                    responseType: config.data.agentType,
                    serverResponse: null,
                    totalSize: Number(config.fileData.fileSize),
                    writtenSize: 0
                },
                fileQueue:[string, number, string, Buffer][] = [],
                hashFail:string[] = [],
                listLength = config.fileData.list.length,
                cutList:[string, string][] = [],
                localize = function terminal_fileService_serviceCopy_requestFiles_localize(input:string):string {
                    return input.replace(/(\\|\/)/g, vars.sep);
                },
                // the callback for each file request
                callbackRequest = function terminal_fileService_serviceCopy_requestFiles_callbackRequest(fileResponse:IncomingMessage):void {
                    const fileChunks:Buffer[] = [],
                        fileName:string = localize(<string>fileResponse.headers.file_name),
                        writeable:Writable = new Stream.Writable(),
                        responseEnd = function terminal_fileService_serviceCopy_requestFiles_callbackRequest_responseEnd(file:Buffer):void {
                            const hash:Hash = vars.node.crypto.createHash("sha3-512").update(file),
                                hashString:string = hash.digest("hex");
                            if (hashString === fileResponse.headers.hash) {
                                fileQueue.push([fileName, Number(fileResponse.headers.file_size), <string>fileResponse.headers.cut_path, file]);
                                if (writeActive === false) {
                                    const callbackWrite = function terminal_fileService_serviceCopy_requestFiles_callbackRequest_callbackWrite(index:number):void {
                                        const fileNameQueue:string = fileQueue[index][0];
                                        vars.node.fs.writeFile(config.data.destination + vars.sep + fileNameQueue, fileQueue[index][3], function terminal_fileServices_requestFiles_callbackRequest_callbackWrite_write(wr:nodeError):void {
                                            const hashFailLength:number = hashFail.length;
                                            statusConfig.countFile = statusConfig.countFile + 1;
                                            statusConfig.writtenSize = statusConfig.writtenSize + fileQueue[index][1];
                                            if (wr !== null) {
                                                error([`Error writing file ${fileNameQueue} from remote agent ${config.data.agent}`, wr.toString()]);
                                                hashFail.push(fileNameQueue);
                                            }
                                            if (index < fileQueue.length - 1) {
                                                terminal_fileService_serviceCopy_requestFiles_callbackRequest_callbackWrite(index + 1);
                                            } else {
                                                if (statusConfig.countFile + countDir + hashFailLength === listLength) {
                                                    statusConfig.serverResponse = serverResponse;
                                                } else {
                                                    writeActive = false;
                                                }
                                                serviceCopy.status(statusConfig);
                                            }
                                        });
                                    };
                                    writeActive = true;
                                    callbackWrite(fileQueue.length - 1);
                                }
                            } else {
                                hashFail.push(fileName);
                                statusConfig.failures = statusConfig.failures + 1;
                                error([`Hashes do not match for file ${fileName} ${config.data.agentType} ${serverVars[config.data.agentType][config.data.agent].name}`]);
                                if (statusConfig.countFile + countDir + hashFail.length === listLength) {
                                    statusConfig.serverResponse = serverResponse;
                                    serviceCopy.status(statusConfig);
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
                    fileResponse.on("data", function terminal_fileServices_requestFiles_callbackRequest_data(fileChunk:Buffer):void {
                        fileChunks.push(fileChunk);
                    });
                    fileResponse.on("end", function terminal_fileServices_requestFiles_callbackRequest_end():void {
                        if (fileResponse.headers.compression === "true") {
                            vars.node.zlib.brotliDecompress(Buffer.concat(fileChunks), function terminal_fileServices_requestFiles_callbackRequest_data_decompress(errDecompress:nodeError, file:Buffer):void {
                                if (errDecompress !== null) {
                                    error([
                                        `Decompression error on file ${vars.text.angry + fileName + vars.text.none}.`,
                                        errDecompress.toString()
                                    ]);
                                    return;
                                }
                                responseEnd(file);
                            });
                        } else {
                            responseEnd(Buffer.concat(fileChunks));
                        }
                    });
                    fileResponse.on("error", function terminal_fileServices_requestFiles_callbackRequest_error(fileError:nodeError):void {
                        error([fileError.toString()]);
                    });
                },
                // files requested as a stream are written as a stream, otherwise files are requested/written in a single shot using callbackRequest
                callbackStream = function terminal_fileService_serviceCopy_requestFiles_callbackStream(fileResponse:IncomingMessage):void {
                    const fileName:string = localize(<string>fileResponse.headers.file_name),
                        filePath:string = config.data.destination + vars.sep + fileName,
                        decompress:BrotliDecompress = (fileResponse.headers.compression === "true")
                            ? vars.node.zlib.createBrotliDecompress()
                            : null,
                        writtenSize: number = statusConfig.writtenSize,
                        writeStream:WriteStream = vars.node.fs.createWriteStream(filePath),
                        hash:Hash = vars.node.crypto.createHash("sha3-512"),
                        fileError = function terminal_fileService_serviceCopy_requestFiles_callbackStream_fileError(message:string, fileAddress:string):void {
                            hashFail.push(fileAddress);
                            statusConfig.failures = hashFail.length;
                            error([message]);
                            vars.node.fs.unlink(filePath, function terminal_fileService_serviceCopy_requestFiles_callbackStream_fileError_unlink(unlinkErr:nodeError):void {
                                if (unlinkErr !== null) {
                                    error([unlinkErr.toString()]);
                                }
                            });
                        };
                    if (fileResponse.headers.compression === "true") {
                        fileResponse.pipe(decompress).pipe(writeStream);
                    } else {
                        fileResponse.pipe(writeStream);
                    }
                    fileResponse.on("data", function terminal_fileService_serviceCopy_requestFiles_callbackStream_data():void {
                        statusConfig.writtenSize = writtenSize + writeStream.bytesWritten;
                        serviceCopy.status(statusConfig);
                    });
                    fileResponse.on("end", function terminal_fileService_serviceCopy_requestFiles_callbackStream_end():void {
                        const hashStream:ReadStream = vars.node.fs.ReadStream(filePath);
                        decompress.end();
                        hashStream.pipe(hash);
                        hashStream.on("close", function terminal_fileServices_requestFiles_callbackStream_end_hash():void {
                            const hashString:string = hash.digest("hex");
                            if (hashString === fileResponse.headers.hash) {
                                cutList.push([<string>fileResponse.headers.cut_path, "file"]);
                                statusConfig.countFile = statusConfig.countFile + 1;
                                writtenFiles = writtenFiles + 1;
                                statusConfig.writtenSize = writtenSize + config.fileData.list[a][3];
                            } else {
                                statusConfig.failures = statusConfig.failures + 1;
                                fileError(`Hashes do not match for file ${fileName} from ${config.data.agentType} ${serverVars[config.data.agentType][config.data.agent].name}`, filePath);
                            }
                            a = a + 1;
                            if (a < listLength) {
                                requestFile();
                            } else {
                                statusConfig.serverResponse = serverResponse;
                                serviceCopy.status(statusConfig);
                            }
                        });
                    });
                    fileResponse.on("error", function terminal_fileService_serviceCopy_requestFiles_callbackStream_error(error:nodeError):void {
                        fileError(error.toString(), filePath);
                    });
                },
                // after directories are created, if necessary, request the each file from the file list
                requestFile = function terminal_fileService_serviceCopy_requestFiles_requestFile():void {
                    const listLength:number = config.fileData.list.length,
                        writeCallback:(message:IncomingMessage) => void = (config.fileData.stream === true)
                            ? callbackStream
                            : callbackRequest,
                        payload:copyFileRequest = {
                            brotli: serverVars.brotli,
                            file_name: config.fileData.list[a][2],
                            file_location: config.fileData.list[a][0],
                            size: config.fileData.list[a][3]
                        };
                    config.data.location = [config.fileData.list[a][0]];
                    httpClient({
                        agentType: config.data.agentType,
                        callback: null,
                        errorMessage: `Error on requesting file ${config.fileData.list[a][2]} from ${serverVars[config.data.agentType][config.data.agent].name}`,
                        ip: serverVars[config.data.agentType][config.data.agent].ip,
                        payload: JSON.stringify(payload),
                        port: serverVars[config.data.agentType][config.data.agent].port,
                        requestError: function terminal_fileService_serviceCopy_requestFiles_requestFile_requestError():void {},
                        requestType: "copy-file",
                        responseError: function terminal_fileService_serviceCopy_requestFiles_requestFile_responseError():void {},
                        responseStream: writeCallback
                    });
                    if (config.fileData.stream === false) {
                        a = a + 1;
                        if (a < listLength) {
                            activeRequests = activeRequests + 1;
                            if (activeRequests < 8) {
                                terminal_fileService_serviceCopy_requestFiles_requestFile();
                            }
                        }
                    }
                },
                // callback to mkdir
                dirCallback = function terminal_fileService_serviceCopy_requestFiles_dirCallback():void {
                    a = a + 1;
                    countDir = countDir + 1;
                    if (a < listLength) {
                        if (config.fileData.list[a][1] === "directory") {
                            newDir();
                        } else {
                            requestFile();
                        }
                    }
                    if (statusConfig.countFile + countDir === listLength) {
                        statusConfig.serverResponse = serverResponse;
                        serviceCopy.status(statusConfig);
                    }
                },
                // recursively create new directories as necessary
                newDir = function terminal_fileService_serviceCopy_requestFiles_makeLists():void {
                    mkdir(config.data.destination + vars.sep + localize(config.fileData.list[a][2]), dirCallback);
                    cutList.push([config.fileData.list[a][0], "directory"]);
                };
            if (config.fileData.stream === true) {
                const filePlural:string = (config.fileData.fileCount === 1)
                    ? ""
                    : "s"
                statusConfig.message = `Copy started for ${config.fileData.fileCount} file${filePlural} at ${common.prettyBytes(config.fileData.fileSize)} (${common.commas(config.fileData.fileSize)} bytes).`;
                serviceCopy.status(statusConfig);
                statusConfig.message = "";
            }
            if (config.fileData.list[0][1] === "directory") {
                newDir();
            } else {
                requestFile();
            }
        },
        requestList: function terminal_fileService_serviceCopy_remoteCopyList(serverResponse:ServerResponse, data:systemDataCopy, index:number):void {
            const list: [string, string, string, number][] = [],
                dirCallback = function terminal_fileService_serviceCopy_remoteCopyList_dirCallback(dir:directoryList):void {
                    const dirLength:number = dir.length,
                        location:string = (function terminal_fileServices_remoteCopyList_dirCallback_location():string {
                            let backSlash:number = data.location[index].indexOf("\\"),
                                forwardSlash:number = data.location[index].indexOf("/"),
                                remoteSep:string = ((backSlash < forwardSlash && backSlash > -1 && forwardSlash > -1) || forwardSlash < 0)
                                    ? "\\"
                                    : "/",
                                address:string[] = data.location[index].replace(/(\/|\\)$/, "").split(remoteSep);
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
                    if (dir === undefined || dir[0] === undefined) {
                        // something went wrong, probably the remote fell offline
                        return;
                    }
                    do {
                        if (dir[b][1] === "file") {
                            size = dir[b][5].size;
                            fileCount = fileCount + 1;
                            fileSize = fileSize + size;
                            if (size > largest) {
                                largest = size;
                            }
                            if (size > 4294967296n) {
                                largeFile = largeFile + 1;
                            }
                        } else {
                            size = 0;
                            directories = directories + 1;
                        }
                        list.push([dir[b][0], dir[b][1], dir[b][0].replace(location, ""), size]);
                        b = b + 1;
                    } while (b < dirLength);
                    index = index + 1;
                    if (index < data.location.length) {
                        const recursiveConfig:readDirectory = {
                            callback: terminal_fileService_serviceCopy_remoteCopyList_dirCallback,
                            depth: 0,
                            exclusions: [],
                            mode: "read",
                            path: data.location[index],
                            symbolic: false
                        };
                        directory(recursiveConfig);
                    } else {
                        // sort directories ahead of files and then sort shorter directories before longer directories
                        // * This is necessary to ensure directories are written before the files and child directories that go in them.
                        const details:remoteCopyListData = {
                                directories: directories,
                                fileCount: fileCount,
                                fileSize: fileSize,
                                list: list,
                                stream: (largest > 12884901888n || largeFile > 3 || (fileSize / fileCount) > 4294967296n)
                            },
                            sendList = function terminal_fileService_serviceCopy_remoteCopyList_sendList():void {
                                const copyType:string = (data.cut === true)
                                        ? "cut"
                                        : "copy",
                                    payload:systemRequestFiles = {
                                        data: data,
                                        fileData: details
                                    },
                                    copyAgent:agent = serverVars[data.copyType][data.copyAgent];
                                if (copyAgent !== undefined) {
                                    httpClient({
                                        agentType: data.copyType,
                                        callback: function terminal_fileService_serviceCopy_remoteCopyList_sendList_callback(message:string|Buffer):void {
                                            const status:fsStatusMessage = JSON.parse(message.toString());
                                            if (data.cut === true && typeof status.fileList !== "string" && status.fileList.failures.length === 0) {
                                                let a:number = 0;
                                                const removeCallback = function terminal_fileService_serviceCopy_remoteCopyList_sendList_removeCallback():void {
                                                    a = a + 1;
                                                    if (a === fileCount) {
                                                        serviceFile.respond.status(serverResponse, status, "file-list-status");
                                                    }
                                                };
                                                list.forEach(function terminal_fileService_serviceCopy_remoteCopyList_sendList_callback_cut(fileItem:[string, string, string, number]):void {
                                                    remove(fileItem[0], removeCallback);
                                                });
                                            } else {
                                                serviceFile.respond.status(serverResponse, status, "file-list-status");
                                            }
                                        },
                                        errorMessage: `Failed to request files during file ${copyType}.`,
                                        ip: serverVars[data.copyType][data.copyAgent].ip,
                                        payload: JSON.stringify(payload),
                                        port: serverVars[data.copyType][data.copyAgent].port,
                                        requestError: function terminal_fileService_serviceCopy_remoteCopyList_sendList_requestError():void {},
                                        requestType: "copy-request-files",
                                        responseError: function terminal_fileService_serviceCopy_remoteCopyList_sendList_responseError():void {},
                                        responseStream: httpClient.stream
                                    });
                                }
                            },
                            hashCallback = function terminal_fileService_serviceCopy_fileService_copyLocalToRemote_callback_hash(hashOutput:hashOutput):void {
                                data.copyAgent = serverVars.hashUser;
                                data.copyShare = hashOutput.hash;
                                data.copyType = "user";
                                sendList();
                            };
                        list.sort(function terminal_fileService_serviceCopy_sortFiles(itemA:[string, string, string, number], itemB:[string, string, string, number]):number {
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
                        data.action = "copy-request";
                        if (data.agentType === "user") {
                            // A hash sequence is required only if copying to a remote user because
                            // * the remote user has to be allowed to bypass share limits of the file system
                            // * this is because the remote user has to request the files from the local user
                            // * and the local user's files can be outside of a designated share, which is off limits in all other cases
                            hash({
                                algorithm: "sha3-512",
                                callback: hashCallback,
                                directInput: true,
                                source: serverVars.hashUser + serverVars.hashDevice
                            });
                        } else {
                            sendList();
                        }
                    }
                },
                dirConfig:readDirectory = {
                    callback: dirCallback,
                    depth: 0,
                    exclusions: [],
                    mode: "read",
                    path: data.location[index],
                    symbolic: false
                };
            let directories:number =0,
                fileCount:number = 0,
                fileSize:number = 0;
            directory(dirConfig);
        },
        sameAgent: function terminal_fileService_serviceCopy_sameAgent(serverResponse:ServerResponse, data:systemDataCopy):void {
            let count:number = 0,
                countFile:number = 0,
                writtenSize:number = 0;
            const length:number = data.location.length;
            data.location.forEach(function terminal_fileService_serviceCopy_copySameAgent_each(value:string):void {
                const callback = function terminal_fileService_serviceCopy_copySameAgent_each_copy([fileCount, fileSize]):void {
                        count = count + 1;
                        countFile = countFile + fileCount;
                        writtenSize = (serverVars.testType === "service")
                            ? 0n
                            : writtenSize + fileSize;
                        if (count === length) {
                            const status:copyStatusConfig = {
                                agent: data.copyAgent,
                                agentType: data.copyType,
                                countFile: countFile,
                                cut: data.cut,
                                failures: 0,
                                location: data.location,
                                message: "",
                                modalAddress: data.modalAddress,
                                responseAgent: data.agent,
                                responseType: data.agentType,
                                serverResponse: serverResponse,
                                totalSize: Number(writtenSize),
                                writtenSize: Number(writtenSize)
                            };
                            serviceCopy.status(status);
                        }
                    },
                    copyConfig:nodeCopyParams = {
                        callback: callback,
                        destination: data.destination,
                        exclusions: [""],
                        target: value
                    };
                copy(copyConfig);
            });
        },
        sendFile: function terminal_fileService_serviceCopy_sendFile(serverResponse:ServerResponse, data:copyFileRequest):void {
            const hash:Hash = vars.node.crypto.createHash("sha3-512"),
                hashStream:ReadStream = vars.node.fs.ReadStream(data.file_location);
            hashStream.pipe(hash);
            hashStream.on("close", function terminal_fileService_serviceCopy_sendFile_close():void {
                const readStream:ReadStream = vars.node.fs.ReadStream(data.file_location),
                    compress:BrotliCompress = (data.brotli > 0)
                        ? vars.node.zlib.createBrotliCompress({
                            params: {[vars.node.zlib.constants.BROTLI_PARAM_QUALITY]: data.brotli}
                        })
                        : null;
                serverResponse.setHeader("hash", hash.digest("hex"));
                serverResponse.setHeader("file_name", data.file_name);
                serverResponse.setHeader("file_size", data.size.toString());
                serverResponse.setHeader("cut_path", data.file_location);
                if (data.brotli > 0) {
                    serverResponse.setHeader("compression", "true");
                } else {
                    serverResponse.setHeader("compression", "false");
                }
                serverResponse.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
                if (data.brotli > 0) {
                    readStream.pipe(compress).pipe(serverResponse);
                } else {
                    readStream.pipe(serverResponse);
                }
            });
        }
    },
    percent: function terminal_fileService_serviceCopy_percent(numerator:number, denominator:number):string {
        const num:number = Number(numerator),
            dom:number = Number(denominator);
        if (num === 0 || dom === 0) {
            return "0.00%";
        }
        return `${((num / dom) * 100).toFixed(2)}%`;
    },
    status: function terminal_fileService_serviceCopy_status(config:copyStatusConfig):void {
        const callbackDirectory = function terminal_fileService_serviceCopy_status_callbackDirectory(dirs:directoryList):void {
                const copyStatus:fsStatusMessage = {
                        address: config.modalAddress,
                        agent: config.agent,
                        agentType: config.agentType,
                        fileList: dirs,
                        message: (config.message === "")
                            ? (function terminal_fileService_serviceCopy_copyMessage():string {
                                const failures:number = (dirs.failures === undefined)
                                        ? config.failures
                                        : dirs.failures.length + config.failures,
                                    percent:string = serviceCopy.percent(Number(config.writtenSize), config.totalSize),
                                    filePlural:string = (config.countFile === 1)
                                        ? ""
                                        : "s",
                                    failPlural:string = (failures === 1)
                                        ? ""
                                        : "s",
                                    verb:string = (config.cut === true)
                                        ? "Cutting"
                                        : "Copying";
                                return `${verb} ${percent} complete. ${common.commas(config.countFile)} file${filePlural} written at size ${common.prettyBytes(config.writtenSize)} (${common.commas(config.writtenSize)} bytes) with ${failures} integrity failure${failPlural}.`
                            }())
                            : config.message
                    };
                if (config.cut === true && config.writtenSize === config.totalSize && config.failures === 0) {
                    let cutCount:number = 0;
                    const removeCallback = function terminal_fileService_serviceCopy_copySameAgent_each_copy_remove():void {
                        cutCount = cutCount + 1;
                        if (cutCount === config.location.length) {
                            vars.broadcast("file-list-status", JSON.stringify(copyStatus));
                            fileServices.respond.status(config.serverResponse, copyStatus, "file-list-status");
                        }
                    };
                    config.location.forEach(function terminal_fileService_serviceCopy_copySameAgent_each_copy_cut(filePath:string):void {
                        remove(filePath, removeCallback);
                    });
                } else {
                    vars.broadcast("file-list-status", JSON.stringify(copyStatus));
                    if (config.serverResponse === null) {
                        httpClient({
                            agentType: "device",
                            callback: function terminal_fileService_serviceCopy_status_callbackDirectory_callback():void {},
                            errorMessage: "Failure sending copy status information",
                            ip: serverVars[config.responseType][config.responseAgent].ip,
                            port: serverVars[config.responseType][config.responseAgent].port,
                            payload: JSON.stringify(copyStatus),
                            requestError: function terminal_fileService_serviceCopy_status_callbackDirectory_requestError():void {},
                            requestType: "file-list-status",
                            responseError: function terminal_fileService_serviceCopy_status_callbackDirectory_responseError():void {},
                            responseStream: httpClient.stream
                        });
                    } else if (config.serverResponse.writableEnded === false) {
                        fileServices.respond.status(config.serverResponse, copyStatus, "file-list-status");
                    }
                }
            },
            dirConfig:readDirectory = {
                callback: callbackDirectory,
                depth: 2,
                exclusions: [],
                mode: "read",
                path: config.modalAddress,
                symbolic: true
            };
        directory(dirConfig);
    }
};

export default serviceCopy;