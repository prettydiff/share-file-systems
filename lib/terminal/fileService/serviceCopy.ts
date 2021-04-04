
/* lib/terminal/fileService/serviceCopy - A library that stores instructions for copy and cut of file system artifacts. */

import { Hash } from "crypto";
import { ReadStream, WriteStream } from "fs";
import { ClientRequest, IncomingHttpHeaders, IncomingMessage, OutgoingHttpHeaders, RequestOptions, ServerResponse } from "http";
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
        // requestFiles - action: copy-request-files
        requestFiles: function terminal_fileService_serviceCopy_requestFiles(serverResponse:ServerResponse, config:systemRequestFiles):void {
            let fileIndex:number = 0,
                totalWritten:number = 0,
                countDir:number = 0,
                statusThrottle:number = Date.now(),
                newName:string = "";
            const statusConfig:copyStatusConfig = {
                    agentSource: config.data.agentSource,
                    agentWrite: config.data.agentWrite,
                    countFile: 0,
                    directory: false,
                    failures: 0,
                    location: config.data.location,
                    message: "",
                    serverResponse: null,
                    totalSize: config.fileData.fileSize,
                    writtenSize: 0
                },
                firstName:string = config.data.agentWrite.modalAddress + vars.sep + config.fileData.list[0][0].replace(/^(\\|\/)/, "").replace(/(\\|\/)/g, vars.sep).split(vars.sep).pop(),
                listLength:number = config.fileData.list.length,
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
                fileError = function terminal_fileService_serviceCopy_requestFiles_fileError(message:string, fileAddress:string):void {
                    statusConfig.failures = statusConfig.failures + 1;
                    error([message]);
                    vars.node.fs.unlink(fileAddress, function terminal_fileService_serviceCopy_requestFiles_fileError_unlink(unlinkErr:nodeError):void {
                        if (unlinkErr !== null) {
                            error([unlinkErr.toString()]);
                        }
                    });
                },
                // if an existing artifact exists with the same path then create a new name to avoid overwrites
                rename = function terminal_fileService_serviceCopy_requestFiles_rename(directory:boolean, path:string, callback:(filePath:string) => void):void {
                    let filePath:string = path;
                    vars.node.fs.stat(filePath, function terminal_fileService_serviceCoy_requestFiles_rename_stat(statError:nodeError):void {
                        if (statError === null) {
                            if (filePath.replace(config.data.agentWrite.modalAddress + vars.sep, "").indexOf(vars.sep) < 0) {
                                let fileIndex:number = 0;
                                const index:number = filePath.lastIndexOf("."),
                                    fileExtension:string = (directory === false && index > 0)
                                        ? filePath.slice(index)
                                        : "",
                                    reStat = function terminal_fileService_serviceCopy_requestFiles_rename_stat_reStat():void {
                                        vars.node.fs.stat(filePath, function terminal_fileService_serviceCopy_requestFiles_rename_stat_reStat_callback(reStatError:nodeError):void {
                                            if (reStatError !== null) {
                                                if (reStatError.toString().indexOf("no such file or directory") > 0 || reStatError.code === "ENOENT") {
                                                    newName = config.data.agentWrite.modalAddress + vars.sep + filePath.split(vars.sep).pop();
                                                    callback(filePath);
                                                } else {
                                                    fileError(`Error evaluating existing file ${path}`, path);
                                                }
                                                return;
                                            }
                                            fileIndex = fileIndex + 1;
                                            filePath = (fileExtension === "")
                                                ? filePath.replace(/_\d+$/, `_${fileIndex}`)
                                                : filePath.replace(`_${(fileIndex - 1) + fileExtension}`, `_${fileIndex + fileExtension}`);
                                            terminal_fileService_serviceCopy_requestFiles_rename_stat_reStat();
                                        });
                                    };
                                if (fileExtension === "") {
                                    filePath = `${filePath}_${fileIndex}`;
                                } else {
                                    filePath = filePath.replace(fileExtension, `_${fileIndex + fileExtension}`);
                                }
                                reStat();
                            } else {
                                callback(filePath.replace(firstName, newName));
                            }
                        } else if (statError.toString().indexOf("no such file or directory") > 0 || statError.code === "ENOENT") {
                            callback(filePath.replace(firstName, newName));
                        } else {
                            fileError(`Error evaluating existing file ${path}`, path);
                        }
                    });
                },
                // files requested as a stream are written as a stream, otherwise files are requested/written in a single shot using callbackRequest
                callbackStream = function terminal_fileService_serviceCopy_requestFiles_callbackStream(fileResponse:IncomingMessage):void {
                    const fileName:string = localize(fileResponse.headers.file_name as string),
                        streamer = function terminal_fileService_serviceCopy_requestFiles_callbackStream_streamer(filePath:string):void {
                            const writeStream:WriteStream = vars.node.fs.createWriteStream(filePath),
                                fileSize:number = Number(fileResponse.headers.file_size),
                                compression:boolean = (fileResponse.headers.compression === "true"),
                                decompress:BrotliDecompress = vars.node.zlib.createBrotliDecompress();
                            let responseEnd:boolean = false;
                            if (compression === true) {
                                fileResponse.pipe(decompress).pipe(writeStream);
                            } else {
                                fileResponse.pipe(writeStream);
                            }
                            fileResponse.on("end", function terminal_fileService_serviceCopy_requestFiles_callbackStream_streamer_end():void {
                                responseEnd = true;
                            });
                            fileResponse.on("data", function terminal_fileService_serviceCopy_requestFiles_callbackStream_streamer_data():void {
                                const now:number = Date.now();
                                if (now > statusThrottle + 150) {
                                    statusThrottle = now;
                                    statusConfig.directory = false;
                                    statusConfig.writtenSize = totalWritten + writeStream.bytesWritten;
                                    serviceCopy.status(statusConfig);
                                }
                            });
                            writeStream.on("close", function terminal_fileService_serviceCopy_requestFiles_callbackStream_streamer_writeClose():void {
                                if (responseEnd === true) {
                                    const hash:Hash = vars.node.crypto.createHash("sha3-512"),
                                        hashStream:ReadStream = vars.node.fs.ReadStream(filePath);
                                    decompress.end();
                                    hashStream.pipe(hash);
                                    totalWritten = totalWritten + fileSize;
                                    statusConfig.writtenSize = totalWritten;
                                    hashStream.on("close", function terminal_fileServices_serviceCopy_requestFiles_callbackStream_streamer_writeClose_hash():void {
                                        const hashString:string = hash.digest("hex");
                                        if (hashString === fileResponse.headers.hash) {
                                            cutList.push([fileResponse.headers.cut_path as string, "file"]);
                                            statusConfig.countFile = statusConfig.countFile + 1;
                                        } else {
                                            fileError(`Hashes do not match for file ${fileName} from ${config.data.agentSource.type} ${serverVars[config.data.agentSource.type][config.data.agentSource.id].name}`, filePath);
                                        }
                                        if (listComplete() === true) {
                                            if (config.data.execute === true) {
                                                serviceFile.actions.execute(null, {
                                                    action: "fs-execute",
                                                    agent: {
                                                        id: serverVars.hashDevice,
                                                        modalAddress: config.data.agentWrite.modalAddress,
                                                        share: "",
                                                        type: "device"
                                                    },
                                                    depth: 1,
                                                    location: [filePath],
                                                    name: ""
                                                });
                                            } else {
                                                statusConfig.serverResponse = serverResponse;
                                            }
                                        } else {
                                            fileIndex = fileIndex + 1;
                                            if (fileIndex < listLength) {
                                                requestFile();
                                            }
                                        }
                                        statusConfig.directory = true;
                                        serviceCopy.status(statusConfig);
                                    });
                                } else {
                                    fileError(`Write stream terminated before response end for file ${fileName} from ${config.data.agentSource.type} ${serverVars[config.data.agentSource.type][config.data.agentSource.id].name}`, filePath);
                                }
                            });
                            fileResponse.on("error", function terminal_fileService_serviceCopy_requestFiles_callbackStream_streamer_error(error:nodeError):void {
                                fileError(error.toString(), filePath);
                            });
                        };
                    rename(false, config.data.agentWrite.modalAddress + vars.sep + fileName, streamer);
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
                        payloadString:string = JSON.stringify(payload),
                        net:[string, number] = (serverVars[config.data.agentSource.type][config.data.agentSource.id] === undefined)
                            ? ["", 0]
                            : [
                                serverVars[config.data.agentSource.type][config.data.agentSource.id].ipSelected,
                                serverVars[config.data.agentSource.type][config.data.agentSource.id].port
                            ],
                        scheme:string = (serverVars.secure === true)
                            ? "https"
                            : "http",
                        headers:OutgoingHttpHeaders = {
                            "content-type": "application/x-www-form-urlencoded",
                            "content-length": Buffer.byteLength(payloadString),
                            "agent-hash": (config.data.agentSource.type === "device")
                                ? serverVars.hashDevice
                                : serverVars.hashUser,
                            "agent-name": (config.data.agentSource.type === "device")
                                ? serverVars.nameDevice
                                : serverVars.nameUser,
                            "agent-type": config.data.agentSource.type,
                            "request-type": "copy-file"
                        },
                        httpConfig:RequestOptions = {
                            headers: headers,
                            host: net[0],
                            method: "POST",
                            path: "/",
                            port: net[1],
                            timeout: 5000
                        },
                        fsRequest:ClientRequest = vars.node[scheme].request(httpConfig, callbackStream);
                    if (net[0] === "") {
                        return;
                    }
                    config.data.location = [config.fileData.list[fileIndex][0]];
                    fsRequest.on("error", function terminal_fileService_serviceCopy_requestFiles_requestFile_requestError(errorMessage:nodeError):void {
                        if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                            error(["Error at client request in requestFile of serviceCopy", JSON.stringify(config.data), errorMessage.toString()]);
                        }
                    });
                    fsRequest.write(payloadString);
                    fsRequest.end();
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
                    const originalPath:string = config.data.agentWrite.modalAddress + vars.sep + localize(config.fileData.list[fileIndex][2]);
                    rename(true, originalPath, function terminal_fileService_serviceCopy_requestFiles_makeLists_rename(filePath:string):void {
                        cutList.push([config.fileData.list[fileIndex][0], "directory"]);
                        mkdir(filePath, dirCallback);
                    });
                },
                filePlural:string = (config.fileData.fileCount === 1)
                    ? ""
                    : "s";
            newName = firstName;
            statusConfig.message = `Copy started for ${config.fileData.fileCount} file${filePlural} at ${common.prettyBytes(config.fileData.fileSize)} (${common.commas(config.fileData.fileSize)} bytes).`;
            serviceCopy.status(statusConfig);
            statusConfig.message = "";
            if (config.fileData.list[0][1] === "directory") {
                newDir();
            } else {
                requestFile();
            }
        },

        // requestList - action: copy
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
                                list: list
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
                                    callback: function terminal_fileService_serviceCopy_requestList_sendList_callback(message:Buffer | string, headers:IncomingHttpHeaders):void {
                                        const status:fileStatusMessage = JSON.parse(message.toString()),
                                            failures:number = (typeof status.fileList === "string" || status.fileList === null || status.fileList.failures === undefined)
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
                },
                action:string = (data.cut === true)
                    ? "cut"
                    : "copy",
                statusAgent:agent = serverVars[data.agentWrite.type][data.agentWrite.id];
            let directories:number =0,
                fileCount:number = 0,
                fileSize:number = 0;
            serviceFile.statusBroadcast({
                action: "fs-directory",
                agent: data.agentWrite,
                depth: 2,
                location: [data.agentWrite.modalAddress],
                name: ""
            }, {
                address: data.agentWrite.modalAddress,
                agent: data.agentWrite.id,
                agentType: data.agentWrite.type,
                fileList: null,
                message: `Preparing file ${action} to ${data.agentSource.type} ${statusAgent.name}.`,
            });
            directory(dirConfig);
        },

        // sameAgent - action: copy, only for matching agent IDs of the same agent type
        sameAgent: function terminal_fileService_serviceCopy_sameAgent(serverResponse:ServerResponse, data:systemDataCopy):void {
            let count:number = 0,
                dirCount:number = 0,
                directories:number = 0,
                removeCount:number = 0;
            const status:copyStatusConfig = {
                    agentSource: data.agentSource,
                    agentWrite: data.agentWrite,
                    countFile: 0,
                    directory: true,
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
                            list: []
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
                            replace: false,
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

        // sendFile - action: copy-file
        sendFile: function terminal_fileService_serviceCopy_sendFile(serverResponse:ServerResponse, data:copyFileRequest):void {
            const hash:Hash = vars.node.crypto.createHash("sha3-512"),
                hashStream:ReadStream = vars.node.fs.ReadStream(data.file_location);
            hashStream.pipe(hash);
            hashStream.on("close", function terminal_fileService_serviceCopy_sendFile_close():void {
                const readStream:ReadStream = vars.node.fs.ReadStream(data.file_location);
                serverResponse.setHeader("cut_path", data.file_location);
                serverResponse.setHeader("file_name", data.file_name);
                serverResponse.setHeader("file_size", data.size.toString());
                serverResponse.setHeader("hash", hash.digest("hex"));
                serverResponse.setHeader("response-type", "copy-file");
                if (data.brotli > 0) {
                    const compress:BrotliCompress = vars.node.zlib.createBrotliCompress({
                            params: {[vars.node.zlib.constants.BROTLI_PARAM_QUALITY]: data.brotli}
                        });
                    serverResponse.setHeader("compression", "true");
                    serverResponse.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
                    readStream.pipe(compress).pipe(serverResponse);
                } else {
                    serverResponse.setHeader("compression", "false");
                    serverResponse.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
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
                        const output:string[] = ["Cutting 100.00% complete."];
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
                                const failures:number = (dirs === null || dirs.failures === undefined)
                                        ? config.failures
                                        : dirs.failures.length + config.failures,
                                    percentSize:number = (config.writtenSize / config.totalSize) * 100,
                                    percent:string = (config.writtenSize === 0 || config.totalSize === 0)
                                        ? "0.00%"
                                        : (percentSize > 99.99)
                                            ? "100.00%"
                                            : `${percentSize.toFixed(2)}%`,
                                    filePlural:string = (config.countFile === 1)
                                        ? ""
                                        : "s",
                                    failPlural:string = (failures === 1)
                                        ? ""
                                        : "s";
                                return `Copying ${percent} complete. ${common.commas(config.countFile)} file${filePlural} written at size ${common.prettyBytes(config.writtenSize)} (${common.commas(config.writtenSize)} bytes) with ${failures} integrity failure${failPlural}.`;
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
                            ip: net[0],
                            payload: statusString,
                            port: net[1],
                            requestError: function terminal_fileService_serviceCopy_status_callbackDirectory_sendStatus_requestError(errorMessage:nodeError):void {
                                if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED" && errorMessage.code !== "EADDRINUSE") {
                                    error([
                                        "Error at client request in sendStatus of serviceCopy",
                                        JSON.stringify(config),
                                        errorMessage.toString()
                                    ]);
                                }
                            },
                            requestType: <requestType>`file-list-status-${type}`,
                            responseError: function terminal_fileService_serviceCopy_status_callbackDirectory_sendStatus_responseError(errorMessage:nodeError):void {
                                if (errorMessage.code !== "ETIMEDOUT" && errorMessage.code !== "ECONNREFUSED") {
                                    error([
                                        "Error at client response in sendStatus of serviceCopy",
                                        JSON.stringify(config),
                                        errorMessage.toString()
                                    ]);
                                }
                            }
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
        if (config.directory === true) {
            directory(dirConfig);
        } else {
            callbackDirectory(null);
        }
    }
};

export default serviceCopy;