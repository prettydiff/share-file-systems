
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
import hash from "../commands/hash.js";
import httpClient from "../server/httpClient.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";
import vars from "../utilities/vars.js";

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
                    agentType: config.data.agentType,
                    countFile: 0,
                    failures: 0,
                    location: config.data.location,
                    message: "",
                    modalAddress: config.data.modalAddress,
                    serverResponse: null,
                    totalSize: config.fileData.fileSize,
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
                                        vars.node.fs.writeFile(config.data.modalAddress + vars.sep + fileNameQueue, fileQueue[index][3], function terminal_fileServices_requestFiles_callbackRequest_callbackWrite_write(wr:nodeError):void {
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
                                }
                                serviceCopy.status(statusConfig);
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
                        filePath:string = config.data.modalAddress + vars.sep + fileName,
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
                        },
                        net:[string, number] = (serverVars[config.data.agentType][config.data.agent] === undefined)
                            ? ["", 0]
                            : [serverVars[config.data.agentType][config.data.agent].ip, serverVars[config.data.agentType][config.data.agent].port];
                    if (net[0] === "") {
                        return;
                    }
                    config.data.location = [config.fileData.list[a][0]];
                    httpClient({
                        agentType: config.data.agentType,
                        callback: null,
                        errorMessage: `Error on requesting file ${config.fileData.list[a][2]} from ${serverVars[config.data.agentType][config.data.agent].name}`,
                        ip: net[0],
                        payload: JSON.stringify(payload),
                        port: net[1],
                        requestError: function terminal_fileService_serviceCopy_requestFiles_requestFile_requestError(errorMessage:nodeError):void {
                            if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                error(["Error at client request in requestFile of serviceCopy", JSON.stringify(config.data), errorMessage.toString()]);
                            }
                        },
                        requestType: "copy-file",
                        responseError: function terminal_fileService_serviceCopy_requestFiles_requestFile_responseError(errorMessage:nodeError):void {
                            if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                error(["Error at client response in requestFile of serviceCopy", JSON.stringify(config.data), errorMessage.toString()]);
                            }
                        },
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
                    mkdir(config.data.modalAddress + vars.sep + localize(config.fileData.list[a][2]), dirCallback);
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
        requestList: function terminal_fileService_serviceCopy_requestList(serverResponse:ServerResponse, data:systemDataCopy, index:number):void {
            const list: [string, string, string, number][] = [],
                dirCallback = function terminal_fileService_serviceCopy_requestList_dirCallback(dir:directoryList):void {
                    const dirLength:number = dir.length,
                        location:string = (function terminal_fileServices_requestList_dirCallback_location():string {
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
                        largeFile:number = 0,
                        countFiles:number = 0,
                        totalSize:number = 0;
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
                            countFiles = countFiles + 1;
                            totalSize = totalSize + size;
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
                    index = index + 1;
                    if (index < data.location.length) {
                        const recursiveConfig:readDirectory = {
                            callback: terminal_fileService_serviceCopy_requestList_dirCallback,
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
                                stream: (largest > 12884901888 || largeFile > 3 || (fileSize / fileCount) > 4294967296)
                            },
                            sendList = function terminal_fileService_serviceCopy_requestList_sendList():void {
                                const copyType:string = (data.cut === true)
                                        ? "cut"
                                        : "copy",
                                    payload:systemRequestFiles = {
                                        data: data,
                                        fileData: details
                                    },
                                    copyAgent:agent = serverVars[data.agentType][data.copyAgent],
                                    net:[string, number] = (serverVars[data.agentType][data.agent] === undefined)
                                        ? ["", 0]
                                        : [serverVars[data.agentType][data.agent].ip, serverVars[data.agentType][data.agent].port];
                                if (copyAgent !== undefined && net[0] !== "") {
                                    httpClient({
                                        agentType: data.agentType,
                                        callback: function terminal_fileService_serviceCopy_requestList_sendList_callback(message:string|Buffer):void {
                                            const status:fileStatusMessage = JSON.parse(message.toString()),
                                                failures:number = (typeof status.fileList === "string" || status.fileList.failures === undefined)
                                                    ? 0
                                                    : status.fileList.failures.length;
                                            if (data.cut === true && typeof status.fileList !== "string" && failures === 0) {
                                                let a:number = 0;
                                                const listLength:number = list.length,
                                                    removeCallback = function terminal_fileService_serviceCopy_requestList_sendList_removeCallback():void {
                                                        a = a + 1;
                                                        if (a === listLength) {
                                                            serviceFile.respond.status(serverResponse, status);
                                                            serviceCopy.cutStatus(data, details);
                                                        }
                                                    };
                                                list.forEach(function terminal_fileService_serviceCopy_requestList_sendList_callback_cut(fileItem:[string, string, string, number]):void {
                                                    remove(fileItem[0], removeCallback);
                                                });
                                            } else {
                                                serviceFile.respond.status(serverResponse, status);
                                            }
                                        },
                                        errorMessage: `Failed to request files during file ${copyType}.`,
                                        ip: net[0],
                                        payload: JSON.stringify(payload),
                                        port: net[1],
                                        requestError: function terminal_fileService_serviceCopy_requestList_sendList_requestError(errorMessage:nodeError):void {
                                            if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                                error(["Error at client request in sendList of serviceCopy", JSON.stringify(data), errorMessage.toString()]);
                                            }
                                        },
                                        requestType: "copy-request-files",
                                        responseError: function terminal_fileService_serviceCopy_requestList_sendList_responseError(errorMessage:nodeError):void {
                                            if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                                error(["Error at client response in sendList of serviceCopy", JSON.stringify(data), errorMessage.toString()]);
                                            }
                                        },
                                        responseStream: httpClient.stream
                                    });
                                }
                            },
                            hashCallback = function terminal_fileService_serviceCopy_fileService_copyLocalToRemote_callback_hash(hashOutput:hashOutput):void {
                                data.copyAgent = serverVars.hashUser;
                                data.copyShare = hashOutput.hash;
                                data.agentType = "user";
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
                        data.action = "copy-request-files";
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
                dirCount:number = 0,
                directories:number = 0,
                removeCount:number = 0;
            const status:copyStatusConfig = {
                    agent: data.agent,
                    agentType: data.agentType,
                    countFile: 0,
                    failures: 0,
                    location: data.location,
                    message: "",
                    modalAddress: data.modalAddress,
                    serverResponse: null,
                    totalSize: 0,
                    writtenSize: 0
                },
                length:number = data.location.length,
                removeCallback = function terminal_fileService_serviceCopy_sameAgent_removeCallback():void {
                    removeCount = removeCount + 1;
                    if (removeCount === length) {
                        serviceCopy.cutStatus(data, {
                            directories: directories,
                            fileCount: status.countFile,
                            fileSize: 0,
                            list: [],
                            stream: false
                        });
                    }
                },
                copyEach = function terminal_fileService_serviceCopy_sameAgent_copyEach(value:string):void {
                    const callback = function terminal_fileService_serviceCopy_sameAgent_copyEach_copy([fileCount, fileSize, errors]):void {
                            status.countFile = status.countFile + fileCount;
                            status.failures = errors;
                            count = count + 1;
                            status.writtenSize = (serverVars.testType === "service")
                                ? 0
                                : status.writtenSize + fileSize;
                            if (count === length) {
                                if (data.cut === true && errors === 0) {
                                    data.location.forEach(function terminal_fileService_serviceCopy_sameAgent_copyEach_copy_removeEach(value:string):void {
                                        remove(value, removeCallback);
                                    });
                                }
                                status.serverResponse = serverResponse;
                            }
                            serviceCopy.status(status);
                        },
                        copyConfig:copyParams = {
                            callback: callback,
                            destination: data.modalAddress,
                            exclusions: [""],
                            target: value
                        };
                    copy(copyConfig);
                },
                dirCallback = function terminal_fileService_serviceCopy_sameAgent_dirCallback(directoryList:directoryList):void {
                    let a:number = directoryList.length;
                    dirCount = dirCount + 1;
                    do {
                        a = a - 1;
                        if (directoryList[a][1] === "file") {
                            status.totalSize = status.totalSize + directoryList[a][5].size;
                        }
                        if (directoryList[a][1] === "directory") {
                            directories = directories + 1;
                        }
                    } while (a > 0);
                    if (dirCount === length) {
                        data.location.forEach(copyEach);
                    }
                },
                dirConfig:readDirectory = {
                    callback: dirCallback,
                    depth: 0,
                    exclusions: [],
                    mode: "read",
                    path: "",
                    symbolic: true
                };
            data.location.forEach(function terminal_fileService_serviceCopy_sameAgent_directoryEach(location:string):void {
                dirConfig.path = location;
                directory(dirConfig);
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
    cutStatus: function terminal_fileService_serviceCopy_cutStatus(data:systemDataCopy, fileList:remoteCopyListData):void {
        const dirCallback = function terminal_fileService_serviceCopy_cutStatus_dirCallback(dirs:directoryList):void {
                const cutStatus:fileStatusMessage = {
                    address: data.modalCut,
                    agent: data.agent,
                    agentType: data.agentType,
                    fileList: dirs,
                    message: (function terminal_fileService_serviceCopy_cutStatus_dirCallback_message():string {
                        const output:string[] = ["Cutting 100.00% complete."]
                        if (fileList.directories > 0) {
                            if (fileList.directories === 1) {
                                output.push("1 directory");
                            } else {
                                output.push(`${fileList.directories} directories`);
                            }
                            if (fileList.fileCount > 0) {
                                output.push("and");
                            }
                        }
                        if (fileList.fileCount > 0) {
                            if (fileList.fileCount === 1) {
                                output.push("1 file");
                            }
                            output.push(`${fileList.fileCount} files`);
                        }
                        output.push("destroyed.");
                        return output.join(" ");
                    }())
                };
                serviceFile.statusBroadcast({
                    action: "fs-directory",
                    agent: data.agent,
                    agentType: data.agentType,
                    depth: 2,
                    modalAddress: data.modalCut,
                    location: data.location,
                    name: "",
                    share: data.shareSource,
                    watch: "no"
                }, cutStatus);
            },
            dirConfig:readDirectory = {
                callback: dirCallback,
                depth: 2,
                exclusions: [],
                mode: "read",
                path: data.modalCut,
                symbolic: true
            };
        directory(dirConfig);
    },
    status: function terminal_fileService_serviceCopy_status(config:copyStatusConfig):void {
        const callbackDirectory = function terminal_fileService_serviceCopy_status_callbackDirectory(dirs:directoryList):void {
                const copyStatus:fileStatusMessage = {
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
                                        : "s";
                                return `Copying ${percent} complete. ${common.commas(config.countFile)} file${filePlural} written at size ${common.prettyBytes(config.writtenSize)} (${common.commas(config.writtenSize)} bytes) with ${failures} integrity failure${failPlural}.`
                            }())
                            : config.message
                    };
                if (config.serverResponse !== null) {
                    serviceFile.respond.status(config.serverResponse, copyStatus);
                }
                serviceFile.statusBroadcast({
                    action: "fs-directory",
                    agent: config.agent,
                    agentType: config.agentType,
                    depth: 2,
                    modalAddress: config.modalAddress,
                    location: config.location,
                    name: "",
                    share: "",
                    watch: "no"
                }, copyStatus);
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