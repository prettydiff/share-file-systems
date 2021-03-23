
/* lib/terminal/fileService/serviceCopy - A library that stores instructions for copy and cut of file system artifacts. */

import { Hash } from "crypto";
import { ReadStream, WriteStream } from "fs";
import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
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
import route from "./route.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";
import vars from "../utilities/vars.js";

const serviceCopy:systemServiceCopy = {
    actions: {
        requestFiles: function terminal_fileService_serviceCopy_requestFiles(serverResponse:ServerResponse, config:systemRequestFiles):void {
            let fileIndex:number = 0,
                activeRequests:number = 0,
                countDir:number = 0;
            const statusConfig:copyStatusConfig = {
                    agentSource: config.data.agentSource,
                    agentWrite: config.data.agentWrite,
                    countFile: 0,
                    failures: 0,
                    location: config.data.location,
                    message: "",
                    serverResponse: null,
                    totalSize: config.fileData.fileSize,
                    writtenSize: 0
                },
                hashFail:string[] = [],
                listLength = config.fileData.list.length,
                cutList:[string, string][] = [],
                localize = function terminal_fileService_serviceCopy_requestFiles_localize(input:string):string {
                    if (typeof input !== "string") {
                        return "";
                    }
                    return input.replace(/(\\|\/)/g, vars.sep);
                },
                listComplete = function terminal_fileService_serviceCopy_requestFiles_listComplete():boolean {
                    return (statusConfig.countFile + statusConfig.failures + countDir >= listLength);
                },
                // files requested as a stream are written as a stream, otherwise files are requested/written in a single shot using callbackRequest
                callbackStream = function terminal_fileService_serviceCopy_requestFiles_callbackStream(fileResponse:IncomingMessage):void {
                    const fileName:string = localize(fileResponse.headers.file_name as string),
                        filePath:string = config.data.agentWrite.modalAddress + vars.sep + fileName,
                        decompress:BrotliDecompress = (fileResponse.headers.compression === "true")
                            ? vars.node.zlib.createBrotliDecompress()
                            : null,
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
                    fileResponse.on("end", function terminal_fileService_serviceCopy_requestFiles_callbackStream_end():void {
                        const hashStream:ReadStream = vars.node.fs.ReadStream(filePath);
                        decompress.end();
                        hashStream.pipe(hash);
                        hashStream.on("close", function terminal_fileServices_serviceCopy_requestFiles_callbackStream_end_hash():void {
                            const hashString:string = hash.digest("hex");
                            if (hashString === fileResponse.headers.hash) {
                                cutList.push([fileResponse.headers.cut_path as string, "file"]);
                                statusConfig.countFile = statusConfig.countFile + 1;
                                statusConfig.writtenSize = statusConfig.writtenSize + writeStream.bytesWritten;
                            } else {
                                statusConfig.failures = statusConfig.failures + 1;
                                fileError(`Hashes do not match for file ${fileName} from ${config.data.agentSource.type} ${serverVars[config.data.agentSource.type][config.data.agentSource.id].name}`, filePath);
                            }
                            if (listComplete() === true) {
                                statusConfig.serverResponse = serverResponse;
                                serviceCopy.status(statusConfig);
                                return;
                            }
                            activeRequests = activeRequests - 1;
                            fileIndex = fileIndex + 1;
                            if (fileIndex < listLength) {
                                requestFile();
                            }
                        });
                    });
                    fileResponse.on("error", function terminal_fileService_serviceCopy_requestFiles_callbackStream_error(error:nodeError):void {
                        fileError(error.toString(), filePath);
                    });
                },
                // after directories are created, if necessary, request the each file from the file list
                requestFile = function terminal_fileService_serviceCopy_requestFiles_requestFile():void {
                    const payload:copyFileRequest = {
                            agent: config.data.agentSource,
                            brotli: serverVars.brotli,
                            file_name: config.fileData.list[fileIndex][2],
                            file_location: config.fileData.list[fileIndex][0],
                            size: config.fileData.list[fileIndex][3]
                        },
                        net:[string, number] = (serverVars[config.data.agentSource.type][config.data.agentSource.id] === undefined)
                            ? ["", 0]
                            : [
                                serverVars[config.data.agentSource.type][config.data.agentSource.id].ipSelected,
                                serverVars[config.data.agentSource.type][config.data.agentSource.id].port
                            ];
                    if (net[0] === "") {
                        return;
                    }
                    config.data.location = [config.fileData.list[fileIndex][0]];
                    httpClient({
                        agentType: config.data.agentSource.type,
                        callback: null,
                        errorMessage: `Error on requesting file ${config.fileData.list[fileIndex][2]} from ${serverVars[config.data.agentSource.type][config.data.agentSource.id].name}`,
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
                        responseStream: callbackStream
                    });
                    activeRequests = activeRequests + 1;
                    if (activeRequests < 8 && config.fileData.throttle === false) {
                        fileIndex = fileIndex + 1;
                        if (fileIndex < listLength) {
                            terminal_fileService_serviceCopy_requestFiles_requestFile();
                        }
                    }
                },
                // callback to mkdir
                dirCallback = function terminal_fileService_serviceCopy_requestFiles_dirCallback():void {
                    countDir = countDir + 1;
                    if (listComplete() === true) {
                        statusConfig.serverResponse = serverResponse;
                        serviceCopy.status(statusConfig);
                        return;
                    }
                    fileIndex = fileIndex + 1;
                    if (fileIndex < listLength) {
                        if (config.fileData.list[fileIndex][1] === "directory") {
                            newDir();
                        } else {
                            requestFile();
                        }
                    }
                },
                // recursively create new directories as necessary
                newDir = function terminal_fileService_serviceCopy_requestFiles_makeLists():void {
                    cutList.push([config.fileData.list[fileIndex][0], "directory"]);
                    mkdir(config.data.agentWrite.modalAddress + vars.sep + localize(config.fileData.list[fileIndex][2]), dirCallback);
                },
                filePlural:string = (config.fileData.fileCount === 1)
                    ? ""
                    : "s";
            statusConfig.message = `Copy started for ${config.fileData.fileCount} file${filePlural} at ${common.prettyBytes(config.fileData.fileSize)} (${common.commas(config.fileData.fileSize)} bytes).`;
            serviceCopy.status(statusConfig);
            statusConfig.message = "";
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
                                throttle: (largest > 12884901888 || largeFile > 3 || (fileSize / fileCount) > 4294967296)
                            },
                            sendList = function terminal_fileService_serviceCopy_requestList_sendList():void {
                                const payload:systemRequestFiles = {
                                    data: data,
                                    fileData: details
                                };
                                route({
                                    agent: data.agentWrite.id,
                                    agentData: "agentWrite",
                                    agentType: data.agentWrite.type,
                                    callback: function terminal_fileService_serviceCopy_requestList_sendList_callback(message:string|Buffer, headers:IncomingHttpHeaders):void {
                                        const status:fileStatusMessage = JSON.parse(message.toString()),
                                            failures:number = (typeof status.fileList === "string" || status.fileList.failures === undefined)
                                                ? 0
                                                : status.fileList.failures.length;
                                        if (headers["response-type"] === "copy") {
                                            const status:fileStatusMessage = JSON.parse(message.toString());
                                            serviceFile.respond.status(serverResponse, status);
                                        } else if (data.cut === true && typeof status.fileList !== "string" && failures === 0) {
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
                                    data: payload,
                                    dataString: JSON.stringify(payload),
                                    dataType: "copy",
                                    requestType: "copy-request-files",
                                    serverResponse: serverResponse
                                });
                            },
                            hashCallback = function terminal_fileService_serviceCopy_fileService_copyLocalToRemote_callback_hash(hashOutput:hashOutput):void {
                                if (data.agentSource.type === "device" && data.agentWrite.type === "user") {
                                    data.agentSource = {
                                        id: serverVars.hashUser,
                                        modalAddress: data.agentSource.modalAddress,
                                        share: now + hashOutput.hash,
                                        type: "user"
                                    };
                                }
                                sendList();
                            },
                            now:number = Date.now();
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
                        if ((data.agentSource.type === "user" || data.agentWrite.type === "user") && data.agentSource.id !== data.agentWrite.id) {
                            // A hash sequence is required only if copying to a remote user because
                            // * the remote user has to be allowed to bypass share limits of the file system
                            // * this is because the remote user has to request the files from the local user
                            // * and the local user's files can be outside of a designated share, which is off limits in all other cases
                            hash({
                                algorithm: "sha3-512",
                                callback: hashCallback,
                                directInput: true,
                                source: serverVars.hashUser + serverVars.hashDevice + now
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
                    agentSource: data.agentSource,
                    agentWrite: data.agentWrite,
                    countFile: 0,
                    failures: 0,
                    location: data.location,
                    message: "",
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
                            throttle: false
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

                                // the delay prevents a race condition that results in a write after end error on the http response
                                setTimeout(function terminal_fileService_serviceCopy_sameAgent_copyEach_copy_removeEach_delay():void {
                                    status.serverResponse = serverResponse;
                                    serviceCopy.status(status);
                                }, 100);
                            } else {
                                serviceCopy.status(status);
                            }
                        },
                        copyConfig:copyParams = {
                            callback: callback,
                            destination: data.agentWrite.modalAddress,
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
                if (data.brotli > 0) {
                    serverResponse.setHeader("compression", "true");
                } else {
                    serverResponse.setHeader("compression", "false");
                }
                serverResponse.setHeader("cut_path", data.file_location);
                serverResponse.setHeader("file_name", data.file_name);
                serverResponse.setHeader("file_size", data.size.toString());
                serverResponse.setHeader("hash", hash.digest("hex"));
                serverResponse.setHeader("response-type", "copy-file");
                serverResponse.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
                if (data.brotli > 0) {
                    readStream.pipe(compress).pipe(serverResponse);
                } else {
                    readStream.pipe(serverResponse);
                }
            });
        }
    },
    cutStatus: function terminal_fileService_serviceCopy_cutStatus(data:systemDataCopy, fileList:remoteCopyListData):void {
        const dirCallback = function terminal_fileService_serviceCopy_cutStatus_dirCallback(dirs:directoryList):void {
                const cutStatus:fileStatusMessage = {
                    address: data.agentSource.modalAddress,
                    agent: data.agentSource.id,
                    agentType: data.agentSource.type,
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
                    agent: data.agentSource,
                    depth: 2,
                    location: data.location,
                    name: ""
                }, cutStatus);
            },
            dirConfig:readDirectory = {
                callback: dirCallback,
                depth: 2,
                exclusions: [],
                mode: "read",
                path: data.agentSource.modalAddress,
                symbolic: true
            };
        directory(dirConfig);
    },
    status: function terminal_fileService_serviceCopy_status(config:copyStatusConfig):void {
        const callbackDirectory = function terminal_fileService_serviceCopy_status_callbackDirectory(dirs:directoryList):void {
                const devices:string[] = Object.keys(serverVars.device),
                    copyStatus:fileStatusMessage = {
                        address: config.agentWrite.modalAddress,
                        agent: config.agentWrite.id,
                        agentType: config.agentWrite.type,
                        fileList: dirs,
                        message: (config.message === "")
                            ? (function terminal_fileService_serviceCopy_status_callbackDirectory_copyMessage():string {
                                const failures:number = (dirs.failures === undefined)
                                        ? config.failures
                                        : dirs.failures.length + config.failures,
                                    percent:string = (config.writtenSize === 0 || config.totalSize === 0)
                                        ? "0.00%"
                                        : `${((config.writtenSize / config.totalSize) * 100).toFixed(2)}%`,
                                    filePlural:string = (config.countFile === 1)
                                        ? ""
                                        : "s",
                                    failPlural:string = (failures === 1)
                                        ? ""
                                        : "s";
                                return `Copying ${percent} complete. ${common.commas(config.countFile)} file${filePlural} written at size ${common.prettyBytes(config.writtenSize)} (${common.commas(config.writtenSize)} bytes) with ${failures} integrity failure${failPlural}.`
                            }())
                            : config.message
                    },
                    sendStatus = function terminal_fileService_serviceCopy_status_callbackDirectory_sendStatus(agent:string, type:agentType):void {
                        const net:[string, number] = (serverVars[type][agent] === undefined)
                            ? ["", 0]
                            : [
                                serverVars[type][agent].ipSelected,
                                serverVars[type][agent].port
                            ];
                        if (net[0] === "") {
                            return;
                        }
                        httpClient({
                            agentType: type,
                            callback: function terminal_fileService_serviceCopy_status_callbackDirectory_sendStatus_callback():void {},
                            errorMessage: "Failed to send file status broadcast.",
                            ip: net[0],
                            payload: statusString,
                            port: net[1],
                            requestError: function terminal_fileService_serviceCopy_status_callbackDirectory_sendStatus_requestError(errorMessage:nodeError):void {
                                if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                    error(["Error at client request in sendStatus of serviceCopy", JSON.stringify(config), errorMessage.toString()]);
                                }
                            },
                            requestType: <requestType>`file-list-status-${type}`,
                            responseError: function terminal_fileService_serviceCopy_status_callbackDirectory_sendStatus_responseError(errorMessage:nodeError):void {
                                if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                    error(["Error at client response in sendStatus of serviceCopy", JSON.stringify(config), errorMessage.toString()]);
                                }
                            },
                            responseStream: httpClient.stream
                        });
                    };
                let a:number = devices.length,
                    statusString:string = JSON.stringify(copyStatus);
                if (config.serverResponse !== null) {
                    serviceFile.respond.status(config.serverResponse, copyStatus);
                }
                if (config.agentSource.type === "user") {
                    sendStatus(config.agentSource.id, "user");
                }

                copyStatus.agentType = "device";
                copyStatus.agent = serverVars.hashDevice;
                statusString = JSON.stringify(copyStatus);

                do {
                    a = a - 1;
                    if (devices[a] === serverVars.hashDevice) {
                        vars.broadcast("file-list-status-device", statusString);
                    } else {
                        sendStatus(devices[a], "device");
                    }
                } while (a > 0);
            },
            dirConfig:readDirectory = {
                callback: callbackDirectory,
                depth: 2,
                exclusions: [],
                mode: "read",
                path: config.agentWrite.modalAddress,
                symbolic: true
            };
        directory(dirConfig);
    }
};

export default serviceCopy;