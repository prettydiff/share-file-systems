
/* lib/terminal/server/services/fileCopy - A library that stores instructions for copy and cut of file system artifacts. */

import { createHash, Hash } from "crypto";
import { createReadStream, createWriteStream, ReadStream, unlink, WriteStream } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { BrotliCompress, BrotliDecompress, constants, createBrotliCompress, createBrotliDecompress } from "zlib";

import common from "../../../common/common.js";
import copy from "../../commands/copy.js";
import deviceMask from "../services/deviceMask.js";
import directory from "../../commands/directory.js";
import error from "../../utilities/error.js";
import fileSystem from "./fileSystem.js";
import mkdir from "../../commands/mkdir.js";
import remove from "../../commands/remove.js";
import rename from "../../utilities/rename.js";
import sender from "../transmission/sender.js";
import service from "../../test/application/service.js";
import transmit_http from "../transmission/transmit_http.js";
import vars from "../../utilities/vars.js";

// cspell:words brotli

/**
 * Stores file copy services.
 * ```typescript
 * interface module_fileCopy {
 *     actions: {
 *         copyList   : (data:service_copy) => void         // If agentSource and agentWrite are the same device executes file copy as a local stream
 *         copySelf   : (data:service_copy) => void;        // Prepares a list of artifacts to send from agentSource to agentWrite
 *         fileRespond: receive;                            // A server-side listener for the file copy socket
 *         write      : (data:service_copy_write) => void;  // Receives a list file system artifacts to be received from an remote agent's sendList operation, creates the directory structure, and then requests files by name
 *     };
 *     route : (socketData:socketData) => void;             // Directs data to the proper agent by service name.
 *     security: (config:config_copy_security) => void;     // validates if external users have permissions to access the requested actions
 *     status: (config:config_copy_status) => void;         // Sends status messages for copy operations.
 * }
 * ``` */
const fileCopy:module_fileCopy = {
    actions: {
        // service: copy - prepares a list of artifacts for request at the file source by the remote end (the writing end)
        copyList: function terminal_server_services_fileCopy_copyList(data:service_copy):void {
            // agentSource - send list
            let locationIndex:number = 0,
                directories:number = 0,
                fileCount:number = 0,
                fileSize:number = 0;
            const action:"copy"|"cut" = (data.cut === true)
                    ? "cut"
                    : "copy",
                lists:directory_list[] = [],
                listData:copy_stats = {
                    dirs: 0,
                    error: 0,
                    files: 0,
                    link: 0,
                    size: 0
                },
                dirCallback = function terminal_server_services_fileCopy_copyList_dirCallback(result:directory_list|string[]):void {
                    const dir:directory_list = result as directory_list,
                        dirComplete = function terminal_server_services_fileCopy_copyList_dirCallback_dirComplete():void {
                            locationIndex = locationIndex + 1;
                            if (locationIndex < data.location.length) {
                                const recursiveConfig:config_command_directory = {
                                    callback: terminal_server_services_fileCopy_copyList_dirCallback,
                                    depth: 0,
                                    exclusions: [],
                                    mode: "read",
                                    path: data.location[locationIndex],
                                    symbolic: false
                                };
                                directory(recursiveConfig);
                            } else {
                                const listBuild = function terminal_server_services_fileCopy_copyList_dirCallback_dirComplete_listBuild(hashValue:string):void {
                                        const copyList:service_copy_write = {
                                                agentRequest: data.agentRequest,
                                                agentSource: data.agentSource,
                                                agentWrite: data.agentWrite,
                                                cut: data.cut,
                                                execute: data.execute,
                                                hash: hashValue,
                                                ip: (vars.environment.addresses.IPv6.length > 0)
                                                    ? vars.environment.addresses.IPv6[0]
                                                    : vars.environment.addresses.IPv4[0],
                                                list: lists,
                                                listData: listData,
                                                port: vars.environment.ports.http
                                            },
                                            directoryPlural:string = (directories === 1)
                                                ? "y"
                                                : "ies",
                                            plural:string = (fileCount === 1)
                                                ? ""
                                                : "s",
                                            status:service_fileSystem_status = {
                                                agentRequest: data.agentRequest,
                                                agentSource: data.agentWrite,
                                                fileList: null,
                                                message: `Preparing to transfer ${directories} director${directoryPlural} and ${fileCount} file${plural} at size ${common.prettyBytes(fileSize)}.`
                                            };

                                        if (vars.test.type !== "service") {
                                            // send status to agentRequest
                                            fileSystem.route({
                                                data: status,
                                                service: "file-system-status"
                                            });

                                            // send status to agentWrite in case they are watching
                                            status.agentRequest = data.agentWrite;
                                            fileSystem.route({
                                                data: status,
                                                service: "file-system-status"
                                            });
                                        }

                                        fileCopy.route({
                                            data: copyList,
                                            service: "copy-list"
                                        });
                                    };
                                if (data.agentWrite.user === data.agentSource.user) {
                                    listBuild(data.agentSource.device);
                                } else {
                                    deviceMask.mask(data.agentSource, "", listBuild);
                                }
                            }
                        };
                    if (dir === undefined || dir[0] === undefined) {
                        // something went wrong with the directory command
                        listData.error = listData.error + 1;
                    } else {
                        let index:number = 0;
                        const len:number = dir.length;
                        do {
                            if (dir[index][1] === "directory") {
                                listData.dirs = listData.dirs + 1;
                            } else if (dir[index][1] === "error") {
                                listData.error = listData.error + 1;
                            } else if (dir[index][1] === "link") {
                                listData.link = listData.link + 1;
                            } else {
                                listData.files = listData.files + 1;
                                listData.size = listData.size + dir[index][5].size;
                            }
                            index = index + 1;
                        } while (index < len);
                        lists.push(dir);
                    }
                    dirComplete();
                },
                dirConfig:config_command_directory = {
                    callback: dirCallback,
                    depth: 0,
                    exclusions: [],
                    mode: "read",
                    path: data.location[locationIndex],
                    symbolic: false
                };
            fileCopy.security({
                agentRequest: data.agentRequest,
                agentTarget: data.agentSource,
                callback: function terminal_server_services_fileCopy_copyList_security():void {
                    // send messaging back to agentRequest to populate status text on agentWrite modals
                    deviceMask.unmask(data.agentWrite.device, function terminal_server_services_fileCopy_copyList_security_listStatus(device:string):void {
                        const messageType:agentType = (data.agentRequest.user === data.agentWrite.user)
                                ? "device"
                                : "user",
                            agent:string = (messageType === "user")
                                ? data.agentWrite.user
                                : device,
                            status:service_fileSystem_status = {
                                agentRequest: data.agentRequest,
                                agentSource: data.agentWrite,
                                fileList: null,
                                message: `Preparing file ${action} to ${messageType} <em>${vars.settings[messageType][agent].name}</em>.`
                            };
                        if (vars.test.type !== "service") {
                            fileSystem.route({
                                data: status,
                                service: "file-system-status"
                            });
                        }
                    });
                    directory(dirConfig);
                },
                cut: data.cut,
                location: data.location[0]
            });
        },
        // service: copy - performs a streamed file copy operation without use of a network
        copySelf: function terminal_server_services_fileCopy_copySelf(data:service_copy):void {
            let index:number = 0;
            const status:config_copy_status = {
                    agentRequest: data.agentRequest,
                    agentSource: data.agentSource,
                    agentWrite: data.agentWrite,
                    countFile: 0,
                    cut: data.cut,
                    directory: true,
                    failures: 0,
                    location: data.location,
                    message: "",
                    totalSize: 0,
                    writtenSize: 0
                },
                length:number = data.location.length,
                callback = function terminal_server_services_fileCopy_copySelf_callback(stats:copy_stats):void {
                    status.countFile = status.countFile + stats.files;
                    status.failures = stats.error;
                    index = index + 1;
                    status.writtenSize = (vars.test.type === "service")
                        ? 0
                        : status.writtenSize + stats.size;
                    status.totalSize = (vars.test.type === "service")
                        ? 0
                        : status.totalSize + stats.size;
                    if (index === length) {
                        if (data.cut === true && stats.error === 0) {
                            let removeCount:number = 0;
                            const removeCallback = function terminal_server_services_fileCopy_copySelf_callback_removeCallback():void {
                                removeCount = removeCount + 1;
                                if (removeCount === length) {
                                    fileCopy.status(status);
                                }
                            };
                            data.location.forEach(function terminal_server_services_fileCopy_copySelf_callback_removeEach(value:string):void {
                                remove(value, removeCallback);
                            });
                        }

                        // the delay prevents a race condition that results in a write after end error on the http response
                        setTimeout(function terminal_server_services_fileCopy_copySelf_callback_delayStatus():void {
                            fileCopy.status(status);
                        }, 100);
                    } else {
                        fileCopy.status(status);
                        copyConfig.target = data.location[index];
                        copy(copyConfig);
                    }
                },
                copyConfig:config_command_copy = {
                    callback: callback,
                    destination: data.agentWrite.modalAddress,
                    exclusions: [""],
                    replace: false,
                    target: data.location[index]
                };
            copy(copyConfig);
        },
        // a handler for an http request for a specific named file
        fileRespond: function terminal_server_services_fileCopy_fileRespond(socketData:socketData, transmit:transmit_type):void {
            const hash:Hash = createHash("sha3-512"),
                data:service_copy_send_file = socketData.data as service_copy_send_file,
                hashStream:ReadStream = createReadStream(data.path_source);
            hashStream.pipe(hash);
            hashStream.on("close", function terminal_fileService_serviceCopy_sendFile_close():void {
                const readStream:ReadStream = createReadStream(data.path_source),
                    serverResponse:ServerResponse = transmit.socket as ServerResponse;
                serverResponse.setHeader("brotli", data.brotli);
                serverResponse.setHeader("file_hash", hash.digest("hex"));
                serverResponse.setHeader("file_name", data.file_name);
                serverResponse.setHeader("file_size", data.file_size.toString());
                serverResponse.setHeader("path_source", data.path_source);
                serverResponse.setHeader("path_write", data.path_write);
                serverResponse.setHeader("response-type", "copy-file");
                if (data.brotli > 0) {
                    const compress:BrotliCompress = createBrotliCompress({
                            params: {[constants.BROTLI_PARAM_QUALITY]: data.brotli}
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
        },
        // service: copy-list - receives a file copy list at agent.write and makes the required directories
        write: function terminal_server_services_fileCopy_write(data:service_copy_write):void {
            // agentWrite
            let listIndex:number = 0,
                fileIndex:number = 0,
                statusThrottle:number = Date.now(),
                totalWritten:number = 0,
                fileLen:number = (data.list.length > 0 )
                    ? data.list[listIndex].length
                    : 0;
            const cutList:[string, fileType][] = [],
                listLen:number = data.list.length,
                status:config_copy_status = {
                    agentRequest: data.agentRequest,
                    agentSource: data.agentSource,
                    agentWrite: data.agentWrite,
                    countFile: 0,
                    cut: false,
                    directory: true,
                    failures: data.listData.error,
                    message: "",
                    location: [],
                    totalSize: data.listData.size,
                    writtenSize: 0
                },
                renameCallback = function terminal_server_services_fileCopy_write_renameCallback(renameError:NodeJS.ErrnoException, list:directory_list[]):void {
                    if (renameError === null) {
                        let listIndex:number = 0,
                            directoryIndex:number = 0;
                        const // sort the file list so that directories are first and then are sorted by shortest length
                            directorySort = function terminal_server_services_fileCopy_write_renameCallback_directorySort(a:directory_item, b:directory_item):-1|1 {
                                if (a[1] === "directory" && b[1] !== "directory") {
                                    return -1;
                                }
                                if (a[1] !== "directory" && b[1] === "directory") {
                                    return 1;
                                }
                                if (a[1] === "directory" && b[1] === "directory") {
                                    if (a[6].length < b[6].length) {
                                        return -1;
                                    }
                                }
                                return 1;
                            },

                            // make all the directories before requesting files
                            mkdirCallback = function terminal_server_services_fileCopy_write_renameCallback_mkdirCallback(err:Error):void {
                                const errorString:string = (err === null)
                                    ? ""
                                    : err.toString();
                                if (err === null || errorString.indexOf("file already exists") > 0) {
                                    directoryIndex = directoryIndex + 1;
                                    if (directoryIndex === list[listIndex].length || list[listIndex][directoryIndex][1] !== "directory") {
                                        do {
                                            listIndex = listIndex + 1;
                                        } while(listIndex < list.length && list[listIndex][0][1] !== "directory");
                                        if (listIndex === list.length) {
                                            fileRequest();
                                        } else {
                                            directoryIndex = 0;
                                            mkdir(list[listIndex][directoryIndex][6], terminal_server_services_fileCopy_write_renameCallback_mkdirCallback);
                                        }
                                    } else {
                                        mkdir(list[listIndex][directoryIndex][6], terminal_server_services_fileCopy_write_renameCallback_mkdirCallback);
                                    }
                                } else {
                                    error([errorString]);
                                }
                            };

                        // sort each directory list so that directories are first
                        list.forEach(function terminal_server_services_fileCopy_write_renameCallback_sortEach(item:directory_list) {
                            item.sort(directorySort);
                        });

                        if (list[0][0][1] === "directory") {
                            // make directories
                            mkdir(list[0][0][6], mkdirCallback);
                        } else {
                            mkdirCallback(null);
                        }
                    } else {
                        error([
                            "Error executing utility rename.",
                            JSON.stringify(renameError)
                        ]);
                    }
                },
                nextFile = function terminal_server_services_fileCopy_write_nextFile():[number, number] {
                    if (fileIndex === fileLen) {
                        fileIndex = 0;
                        listIndex = listIndex + 1;
                        fileLen = (listIndex < listLen)
                            ? data.list[listIndex].length
                            : 0;
                    }
                    if (listIndex === listLen) {
                        return null;
                    }
                    if (data.list[listIndex][fileIndex][1] === "file") {
                        return [listIndex, fileIndex];
                    }
                    do {
                        fileIndex = fileIndex + 1;
                        if (fileIndex === fileLen) {
                            listIndex = listIndex + 1;
                            if (listIndex === listLen) {
                                return null;
                            }
                            fileIndex = 0;
                            fileLen = data.list[listIndex].length;
                        } else if (data.list[listIndex][fileIndex][1] === "file") {
                            return [listIndex, fileIndex];
                        }
                    } while (fileIndex < fileLen);
                    listIndex = listIndex + 1;
                    terminal_server_services_fileCopy_write_nextFile();
                },
                fileReceive = function terminal_server_services_fileCopy_write_fileReceive(socketData:socketData, fileResponse:IncomingMessage):void {
                    const fileError = function terminal_server_services_fileCopy_write_fileReceive_fileError(message:string):void {
                            status.failures = status.failures + 1;
                            error([message]);
                            unlink(path_write, function terminal_server_services_fileCopy_write_fileReceive_fileError_unlink(unlinkErr:Error):void {
                                if (unlinkErr !== null) {
                                    error([unlinkErr.toString()]);
                                }
                            });
                        },
                        brotli:brotli = Number(fileResponse.headers.brotli) as brotli,
                        file_hash:string = fileResponse.headers.file_hash as string,
                        file_name:string = fileResponse.headers.file_name as string,
                        file_size:number = Number(fileResponse.headers.file_size),
                        path_source:string = fileResponse.headers.path_source as string,
                        path_write:string = fileResponse.headers.path_write as string,
                        writeStream:WriteStream = createWriteStream(path_write),
                        decompress:BrotliDecompress = createBrotliDecompress();
                    let responseEnd:boolean = false;
                    if (brotli > 0) {
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
                            status.directory = false;
                            status.writtenSize = totalWritten + writeStream.bytesWritten;
                            fileCopy.status(status);
                        }
                    });
                    writeStream.on("close", function terminal_fileService_serviceCopy_requestFiles_callbackStream_streamer_writeClose():void {
                        if (responseEnd === true) {
                            const hash:Hash = createHash("sha3-512"),
                                hashStream:ReadStream = createReadStream(path_write);
                            decompress.end();
                            hashStream.pipe(hash);
                            totalWritten = totalWritten + file_size;
                            status.writtenSize = totalWritten;
                            hashStream.on("close", function terminal_fileServices_serviceCopy_requestFiles_callbackStream_streamer_writeClose_hash():void {
                                if (hash.digest("hex") === file_hash) {
                                    cutList.push([path_source, "file"]);
                                    status.countFile = status.countFile + 1;
                                } else {
                                    fileError(`Hashes do not match for file ${file_name}.`);
                                }
                                fileRequest();
                                status.directory = true;
                                fileCopy.status(status);
                            });
                        } else {
                            fileError(`Write stream terminated before response end for file ${file_name}.`);
                        }
                    });
                    fileResponse.on("error", function terminal_fileService_serviceCopy_requestFiles_callbackStream_streamer_error(error:Error):void {
                        fileError(error.toString());
                    });
                },
                fileRequest = function terminal_server_services_fileCopy_write_fileRequest():void {
                    const nextFileName:[number, number] = nextFile();
                    if (nextFileName === null) {
                        fileCopy.status(status);
                        if (data.cut === true) {
                            status.cut = true;
                            transmit_http.request({
                                agent: data.hash,
                                agentType: (data.hash.length === 141)
                                    ? "user"
                                    : "device",
                                callback: fileReceive,
                                ip: data.ip,
                                payload: {
                                    data: cutList,
                                    service: "cut-list"
                                },
                                port: data.port,
                                stream: true
                            });
                        } else if (data.execute === true) {
                            /*fileSystem.actions.execute({
                                action: "fs-execute",
                                agentRequest: data.agentRequest,
                                agentSource: data.agentSource,
                                agentWrite: null,
                                depth: 1,
                                location: [path_write],
                                name: ""
                            });*/
                        }
                    } else {
                        const payload:service_copy_send_file = {
                            brotli: vars.settings.brotli,
                            file_name: data.list[nextFileName[0]][nextFileName[1]][0].replace(data.agentSource.modalAddress, "").replace(/^(\/|\\)/, ""),
                            file_size: data.list[nextFileName[0]][nextFileName[1]][5].size,
                            path_source: data.list[nextFileName[0]][nextFileName[1]][0],
                            path_write: data.list[nextFileName[0]][nextFileName[1]][6]
                        };
                        fileIndex = fileIndex + 1;
                        transmit_http.request({
                            agent: data.hash,
                            agentType: (data.hash.length === 141)
                                ? "user"
                                : "device",
                            callback: fileReceive,
                            ip: data.ip,
                            payload: {
                                data: payload,
                                service: "copy-send-file"
                            },
                            port: data.port,
                            stream: true
                        });
                    }
                };
            if (data.list.length > 0) {
                fileCopy.security({
                    agentRequest: data.agentRequest,
                    agentTarget: data.agentWrite,
                    callback: function terminal_server_services_fileCopy_write_security():void {
                        rename(data.list, data.agentWrite.modalAddress, renameCallback);
                    },
                    cut: false,
                    location: data.list[0][0][0]
                });
            }
        }
    },
    route: function terminal_server_services_fileCopy_route(socketData:socketData):void {
        const data:service_copy_write = socketData.data as service_copy_write;
        if (socketData.service === "copy") {
            const copy = function terminal_server_services_fileCopy_route_copy(socketData:socketData):void {
                const data:service_copy = socketData.data as service_copy;
                if (vars.test.type === "service") {
                    service.evaluation(socketData);
                } else {
                    if (data.agentSource.user === data.agentWrite.user && data.agentSource.device === data.agentWrite.device) {
                        fileCopy.actions.copySelf(data);
                    } else {
                        fileCopy.actions.copyList(data);
                    }
                }
            };
            sender.route("agentSource", socketData, copy);
        } else if (socketData.service === "copy-list" || socketData.service === "copy-send-file") {
            const dest = function terminal_server_services_fileCopy_route_destList(target:copyAgent, self:copyAgent):copyAgent {
                    if (data.agentWrite.user !== data.agentSource.user && data.agentRequest.user !== data[self].user) {
                        return "agentRequest";
                    }
                    return target;
                },
                copyList = function terminal_server_services_fileCopy_route_copyList(socketData:socketData):void {
                    if (vars.test.type === "service") {
                        service.evaluation(socketData);
                    } else if (socketData.service === "copy-list") {
                        const copyData:service_copy_write = socketData.data as service_copy_write;
                        fileCopy.actions.write(copyData);
                    }
                };
            sender.route(dest("agentWrite", "agentSource"), socketData, copyList);
        }
    },
    security: function terminal_serveR_services_fileCopy_security(config:config_copy_security):void {
        if (config.agentRequest.user === config.agentTarget.user) {
            config.callback();
        } else {
            const shares:string[] = Object.keys(vars.settings.device.hashDevice.shares),
                item:string = config.location;
            let index:number = shares.length,
                share:agentShare = null;
            do {
                index = index - 1;
                share = vars.settings.device.hashDevice.shares[shares[index]];
                if (item.indexOf(share.name) === 0) {
                    if (config.cut === false || (config.cut === true && share.readOnly === false)) {
                        config.callback();
                    }
                    break;
                }
            } while (index > 0);
        }
    },
    status: function terminal_server_services_fileCopy_copyStatus(config:config_copy_status):void {
        const callbackDirectory = function terminal_server_services_fileCopy_copyStatus_callbackDirectory(list:directory_list|string[]):void {
                const dirs:directory_list = list as directory_list,
                    copyStatus:service_fileSystem_status = {
                        agentRequest: config.agentRequest,
                        agentSource: config.agentWrite,
                        fileList: dirs,
                        message: (config.message === "")
                            ? (function terminal_server_services_fileCopy_copyStatus_callbackDirectory_copyMessage():string {
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
                                        : "s",
                                    verb:string = (config.cut === true)
                                        ? "Cutting"
                                        : "Copying";
                                return `${verb} ${percent} complete. ${common.commas(config.countFile)} file${filePlural} written at size ${common.prettyBytes(config.writtenSize)} (${common.commas(config.writtenSize)} bytes) with ${failures} integrity failure${failPlural}.`;
                            }())
                            : config.message
                    },
                    statusMessage:socketData = {
                        data: copyStatus,
                        service: "file-system-status"
                    },
                    broadcast = function terminal_server_services_fileCopy_copyStatus_callbackDirectory_sendStatus_unmask_broadcast():void {
                        sender.broadcast(statusMessage, "browser");
                    };
                if (vars.test.type === "service") {
                    service.evaluation(statusMessage);
                } else {
                    sender.route("agentRequest", statusMessage, broadcast);
                    if (config.cut === true) {
                        copyStatus.agentSource = config.agentSource;
                    }
                    sender.route("agentSource", statusMessage, broadcast);
                }
            },
            dirConfig:config_command_directory = {
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

export default fileCopy;