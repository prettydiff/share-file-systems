
/* lib/terminal/server/services/fileCopy - A library that stores instructions for copy and cut of file system artifacts. */

import common from "../../../common/common.js";
import copy from "../../commands/library/copy.js";
import deviceMask from "../services/deviceMask.js";
import directory from "../../commands/library/directory.js";
import error from "../../utilities/error.js";
import fileExecution from "./fileExecution.js";
import fileSystem from "./fileSystem.js";
import mkdir from "../../commands/library/mkdir.js";
import node from "../../utilities/node.js";
import remove from "../../commands/library/remove.js";
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
 *         cut        : (data:service_cut) => void;         // Performs file deletion at the source agent according to a list of a successfully written artifacts at the write agent
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
            const security = function terminal_server_services_fileCopy_copyList_security():void {
                // send messaging back to agentRequest to populate status text on agentWrite modals
                let locationIndex:number = 0;
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
                    dirCallback = function terminal_server_services_fileCopy_copyList_dirCallback(title:string, text:[string, number], result:directory_list|string[]):void {
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
                                        search: "",
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
                                                    ip: (vars.network.addresses.IPv6.length > 0)
                                                        ? vars.network.addresses.IPv6[0]
                                                        : vars.network.addresses.IPv4[0],
                                                    list: lists,
                                                    listData: listData,
                                                    port: vars.network.ports.http
                                                },
                                                directoryPlural:string = (listData.dirs === 1)
                                                    ? "y"
                                                    : "ies",
                                                plural:string = (listData.files === 1)
                                                    ? ""
                                                    : "s",
                                                status:service_fileSystem_status = {
                                                    agentRequest: data.agentRequest,
                                                    agentSource: data.agentWrite,
                                                    agentWrite: null,
                                                    fileList: null,
                                                    message: `Preparing to transfer ${listData.dirs} director${directoryPlural} and ${listData.files} file${plural} at size ${common.prettyBytes(listData.size)}.`
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
                                        deviceMask.mask(data.agentSource, listBuild);
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
                        search: "",
                        symbolic: false
                    };
                    deviceMask.unmask(data.agentWrite.device, function terminal_server_services_fileCopy_copyList_security_listStatus(device:string):void {
                        const messageType:agentType = (data.agentSource.user === data.agentWrite.user)
                                ? "device"
                                : "user",
                            agent:string = (messageType === "user" || device === "")
                                ? data.agentWrite.user
                                : device,
                            status:service_fileSystem_status = {
                                agentRequest: data.agentRequest,
                                agentSource: data.agentWrite,
                                agentWrite: null,
                                fileList: null,
                                message: `Preparing file ${action} to ${messageType} <em>${vars.settings[messageType][agent].name}</em>.`
                            };
                        if (vars.test.type !== "service") {
                            fileSystem.route({
                                data: status,
                                service: "file-system-status"
                            });
                        }
                        directory(dirConfig);
                    });
                };
            fileCopy.security({
                agentRequest: data.agentRequest,
                agentSource: data.agentSource,
                agentWrite: data.agentWrite,
                callback: security,
                change: false,
                location: data.location[0],
                self: "agentSource"
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
                    directory: true,
                    failures: 0,
                    location: data.location,
                    message: "",
                    totalSize: 0,
                    writtenSize: 0
                },
                length:number = data.location.length,
                callback = function terminal_server_services_fileCopy_copySelf_callback(title:string, text:string[], stats:copy_stats):void {
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
                                remove(value, [], removeCallback);
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
        // service: cut - performs file deletion on artifacts successfully written to a remote agent
        cut: function terminal_server_services_fileCopy_cut(data:service_cut):void {
            const cutFiles = function terminal_server_services_fileCopy_cut_cutFiles():void {
                let count:number = 0;
                const len:number = data.fileList.length,
                    removeCallback = function terminal_server_services_fileCopy_cut_cutFiles_removeCallback():void {
                        count = count + 1;
                        if (count < len) {
                            removeItem();
                        } else {
                            const failLen:number = data.failList.length,
                                plural:string = (failLen === 1)
                                    ? ""
                                    : "s";
                            fileSystem.status.generate({
                                action: "fs-rename",
                                agentRequest: data.agentRequest,
                                agentSource: data.agentSource,
                                agentWrite: null,
                                depth: 2,
                                location: [data.agentSource.modalAddress],
                                name: (failLen === 0)
                                    ? "Requested file system artifacts removed."
                                    : `Removed file system artifacts except for ${failLen} item${plural} that generated errors.`
                            }, null);
                        }
                    },
                    removeItem = function terminal_server_services_fileCopy_cut_cutFiles_removeItem():void {
                        remove(data.fileList[count][0], data.failList, removeCallback);
                    };
                removeItem();
            };
            fileCopy.security({
                agentRequest: data.agentRequest,
                agentSource: data.agentSource,
                agentWrite: data.agentWrite,
                callback: cutFiles,
                change: true,
                location: data.fileList[0][0],
                self: "agentSource"
            });
        },
        // a handler for an http request for a specific named file
        fileRespond: function terminal_server_services_fileCopy_fileRespond(socketData:socketData, transmit:transmit_type):void {
            const data:service_copy_send_file = socketData.data as service_copy_send_file,
                response = function terminal_server_services_fileCopy_fileRespond_respond():void {
                    let failFlag:boolean = false;
                    const hash:node_crypto_Hash = node.crypto.createHash("sha3-512"),
                        hashStream:node_fs_ReadStream = node.fs.createReadStream(data.path_source);
                    hashStream.on("close", function terminal_fileService_serviceCopy_sendFile_close():void {
                        const readStream:node_fs_ReadStream = node.fs.createReadStream(data.path_source),
                            serverResponse:httpSocket_response = transmit.socket as httpSocket_response;
                        serverResponse.setHeader("path_source", data.path_source);
                        serverResponse.setHeader("path_write", data.path_write);
                        serverResponse.setHeader("response-type", "copy-file");
                        if (failFlag === true) {
                            serverResponse.setHeader("file-fail", "true");
                            serverResponse.write("file fail");
                            serverResponse.end();
                        } else {
                            serverResponse.setHeader("brotli", data.brotli);
                            serverResponse.setHeader("file_hash", hash.digest("hex"));
                            serverResponse.setHeader("file_name", data.file_name);
                            serverResponse.setHeader("file_size", data.file_size.toString());
                            if (data.brotli > 0) {
                                const compress:node_zlib_BrotliCompress = node.zlib.createBrotliCompress({
                                        params: {[node.zlib.constants.BROTLI_PARAM_QUALITY]: data.brotli}
                                    });
                                serverResponse.setHeader("compression", "true");
                                serverResponse.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
                                readStream.pipe(compress).pipe(serverResponse);
                            } else {
                                serverResponse.setHeader("compression", "false");
                                serverResponse.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
                                readStream.pipe(serverResponse);
                            }
                        }
                    });
                    hashStream.on("error", function terminal_fileService_serviceCopy_sendFile_error():void {
                        failFlag = true;
                    });
                    hashStream.pipe(hash);
                };
            fileCopy.security({
                agentRequest: data.agentRequest,
                agentSource: data.agentSource,
                agentWrite: data.agentWrite,
                callback: response,
                change: false,
                location: data.path_source,
                self: "agentSource"
            });
        },
        // service: copy-list - receives a file copy list at agent.write and makes the required directories
        write: function terminal_server_services_fileCopy_write(data:service_copy_write):void {
            if (data.list.length > 0) {
                // agentWrite
                let listIndex:number = 0,
                    fileIndex:number = 0,
                    statusThrottle:number = Date.now(),
                    totalWritten:number = 0,
                    fileLen:number = (data.list.length > 0 )
                        ? data.list[listIndex].length
                        : 0;
                const failList:string[] = [],
                    listLen:number = data.list.length,
                    status:config_copy_status = {
                        agentRequest: data.agentRequest,
                        agentSource: data.agentSource,
                        agentWrite: data.agentWrite,
                        countFile: 0,
                        directory: true,
                        failures: data.listData.error,
                        message: "",
                        location: [],
                        totalSize: data.listData.size,
                        writtenSize: 0
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
                    fileReceive = function terminal_server_services_fileCopy_write_fileReceive(socketData:socketData, fileResponse:node_http_IncomingMessage):void {
                        const fileError = function terminal_server_services_fileCopy_write_fileReceive_fileError(message:string):void {
                                status.failures = status.failures + 1;
                                failList.push(path_source);
                                error([message], null);
                                node.fs.unlink(path_write, function terminal_server_services_fileCopy_write_fileReceive_fileError_unlink(unlinkErr:NodeJS.ErrnoException):void {
                                    if (unlinkErr !== null) {
                                        error([`Error removing file system artifact ${path_write}`], unlinkErr);
                                    }
                                });
                                fileRequest();
                            },
                            brotli:brotli = Number(fileResponse.headers.brotli) as brotli,
                            file_hash:string = fileResponse.headers.file_hash as string,
                            file_name:string = fileResponse.headers.file_name as string,
                            file_size:number = Number(fileResponse.headers.file_size),
                            path_source:string = fileResponse.headers.path_source as string,
                            path_write:string = fileResponse.headers.path_write as string,
                            writeStream:node_fs_WriteStream = node.fs.createWriteStream(path_write),
                            decompress:node_zlib_BrotliDecompress = node.zlib.createBrotliDecompress();
                        let responseEnd:boolean = false;
                        if (fileResponse.headers["file-fail"] === "true") {
                            status.failures = status.failures + 1;
                            failList.push(path_source);
                            fileRequest();
                        } else {
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
                                    const hash:node_crypto_Hash = node.crypto.createHash("sha3-512"),
                                        hashStream:node_fs_ReadStream = node.fs.createReadStream(path_write);
                                    decompress.end();
                                    hashStream.pipe(hash);
                                    totalWritten = totalWritten + file_size;
                                    status.writtenSize = totalWritten;
                                    hashStream.on("close", function terminal_fileServices_serviceCopy_requestFiles_callbackStream_streamer_writeClose_hash():void {
                                        if (hash.digest("hex") === file_hash) {
                                            status.countFile = status.countFile + 1;
                                            fileRequest();
                                        } else {
                                            fileError(`Hashes do not match for file ${file_name}.`);
                                        }
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
                        }
                    },
                    fileRequest = function terminal_server_services_fileCopy_write_fileRequest():void {
                        const nextFileName:[number, number] = nextFile();
                        if (nextFileName === null) {
                            const fileTypeList:fileTypeList = (function terminal_server_services_fileCopy_write_fileRequest_fileTypeList():fileTypeList {
                                let index:number = 0;
                                const output:fileTypeList = [],
                                    len:number = data.list.length,
                                    cut:0|6 = (data.cut === true)
                                        ? 0
                                        : 6;
                                do {
                                    output.push([data.list[index][0][cut], data.list[index][0][1]]);
                                    index = index + 1;
                                } while (index < len);
                                return output;
                            }());
                            fileCopy.status(status);
                            if (data.cut === true) {
                                const cutService:service_cut = {
                                    agentRequest: data.agentRequest,
                                    agentSource: data.agentSource,
                                    agentWrite: data.agentWrite,
                                    failList: failList,
                                    fileList: fileTypeList
                                };
                                fileCopy.route({
                                    data: cutService,
                                    service: "cut"
                                });
                            } else if (data.execute === true) {
                                fileExecution(fileTypeList, data.agentRequest, data.agentSource);
                            }
                        } else {
                            const payload:service_copy_send_file = {
                                    agentRequest: data.agentRequest,
                                    agentSource: data.agentSource,
                                    agentWrite: data.agentWrite,
                                    brotli: vars.settings.brotli,
                                    file_name: data.list[nextFileName[0]][nextFileName[1]][0].replace(data.agentSource.modalAddress, "").replace(/^(\/|\\)/, ""),
                                    file_size: data.list[nextFileName[0]][nextFileName[1]][5].size,
                                    path_source: data.list[nextFileName[0]][nextFileName[1]][0],
                                    path_write: data.list[nextFileName[0]][nextFileName[1]][6]
                                },
                                request:config_http_request = {
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
                                };
                            fileIndex = fileIndex + 1;
                            transmit_http.request(request);
                        }
                    },
                    renameCallback = function terminal_server_services_fileCopy_write_renameCallback(renameError:NodeJS.ErrnoException, list:directory_list[]):void {
                        if (renameError === null) {
                            const securityCallback = function terminal_server_services_fileCopy_write_renameCallback_securityCallback():void {
                                let listIndex:number = 0,
                                    directoryIndex:number = 0;
                                const // sort the file list so that directories are first and then are sorted by shortest length
                                    directorySort = function terminal_server_services_fileCopy_write_renameCallback_securityCallback_directorySort(a:directory_item, b:directory_item):-1|1 {
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
                                    mkdirCallback = function terminal_server_services_fileCopy_write_renameCallback_securityCallback_mkdirCallback(title:string, text:string[], fail:boolean):void {
                                        const errorString:string = (fail === true)
                                            ? text[0]
                                            : null;
                                        if (errorString === null || errorString.indexOf("file already exists") > 0) {
                                            directoryIndex = directoryIndex + 1;
                                            if (directoryIndex === list[listIndex].length || list[listIndex][directoryIndex][1] !== "directory") {
                                                do {
                                                    listIndex = listIndex + 1;
                                                } while(listIndex < list.length && list[listIndex][0][1] !== "directory");
                                                if (listIndex === list.length) {
                                                    fileRequest();
                                                } else {
                                                    directoryIndex = 0;
                                                    mkdir(list[listIndex][directoryIndex][6], terminal_server_services_fileCopy_write_renameCallback_securityCallback_mkdirCallback);
                                                }
                                            } else {
                                                mkdir(list[listIndex][directoryIndex][6], terminal_server_services_fileCopy_write_renameCallback_securityCallback_mkdirCallback);
                                            }
                                        } else {
                                            failList.push(list[listIndex][directoryIndex][0]);
                                            error([errorString], null);
                                        }
                                    };

                                // sort each directory list so that directories are first
                                list.forEach(function terminal_server_services_fileCopy_write_renameCallback_securityCallback_sortEach(item:directory_list) {
                                    item.sort(directorySort);
                                });

                                if (list[0][0][1] === "directory") {
                                    // make directories
                                    mkdir(list[0][0][6], mkdirCallback);
                                } else {
                                    mkdirCallback("", [""], null);
                                }
                            };
                            fileCopy.security({
                                agentRequest: data.agentRequest,
                                agentSource: data.agentSource,
                                agentWrite: data.agentWrite,
                                callback: securityCallback,
                                change: true,
                                location: data.list[0][0][6],
                                self: "agentWrite"
                            });
                        } else {
                            error([
                                "Error executing utility rename."
                            ], renameError);
                        }
                    },
                    renameConfig:config_rename = {
                        callback: renameCallback,
                        destination: (data.execute === true)
                            ? vars.settings.storage
                            : data.agentWrite.modalAddress,
                        list: data.list,
                        replace: false
                    };
                rename(renameConfig);
            }
        }
    },
    route: function terminal_server_services_fileCopy_route(socketData:socketData):void {
        if (socketData.service === "copy" || socketData.service === "cut") {
            const agentSource = function terminal_server_services_fileCopy_route_agentSource(socketData:socketData):void {
                const data:service_copy = socketData.data as service_copy;
                if (data.agentSource.user === data.agentWrite.user && data.agentSource.device === data.agentWrite.device) {
                    fileCopy.actions.copySelf(data);
                } else if (socketData.service === "cut") {
                    const cut:service_cut = socketData.data as service_cut;
                    fileCopy.actions.cut(cut);
                } else {
                    fileCopy.actions.copyList(data);
                }
            };
            if (vars.test.type === "service") {
                const data:service_copy = socketData.data as service_copy;
                fileCopy.actions.copySelf(data);
            } else {
                sender.route({
                    callback: agentSource,
                    destination: "agentSource",
                    origination: "agentRequest",
                    socketData: socketData
                });
            }
        } else if (socketData.service === "copy-list" || socketData.service === "copy-send-file") {
            const copyList = function terminal_server_services_fileCopy_route_copyList(socketData:socketData):void {
                if (vars.test.type === "service") {
                    service.evaluation(socketData);
                } else if (socketData.service === "copy-list") {
                    const copyData:service_copy_write = socketData.data as service_copy_write;
                    fileCopy.actions.write(copyData);
                }
            };
            sender.route({
                callback: copyList,
                destination: "agentWrite",
                origination: "agentSource",
                socketData: socketData
            });
        }
    },
    security: function terminal_server_services_fileCopy_security(config:config_copy_security):void {
        let resolveIndex:number = 0;
        const status:service_fileSystem_status = {
                agentRequest: config.agentRequest,
                agentSource: config[config.self],
                agentWrite: null,
                fileList: null,
                message: "Security violation from attempted copy/cut."
            },
            self:fileAgent = config[config.self],
            others:agentCopy[] = (function terminal_server_services_fileCopy_security_others():agentCopy[] {
                const agents:agentCopy[] = ["agentRequest", "agentSource", "agentWrite"];
                agents.splice(agents.indexOf(config.self), 1);
                return agents;
            }()),
            other0:fileAgent = config[others[0]],
            other1:fileAgent = config[others[1]],
            allResolved = function terminal_server_services_fileCopy_security_allResolved():void {
                // same user, copy between devices
                if (self.user === vars.settings.hashUser && self.user === other0.user && self.user === other1.user) {
                    // must be distributed and known devices to satisfy security
                    if (vars.settings.device[self.device] !== undefined && vars.settings.device[other0.device] !== undefined && vars.settings.device[other1.device] !== undefined && (self.device !== other0.device || self.device !== other1.device || other0.device !== other1.device)) {
                        config.callback();
                        return;
                    }
                // different users - the agentRequest user must be known user, but agentSource and agentWrite do not need to know each other
                } else if (vars.settings.user[config.agentRequest.user] !== undefined || vars.settings.hashUser === config.agentRequest.user) {
                    const selfAgent:agent = vars.settings.device[vars.settings.hashDevice],
                        shares:string[] = Object.keys(selfAgent.shares),
                        item:string = config.location;
                    let index:number = shares.length,
                        shareIndex:number = null,
                        share:agentShare = null;

                    // if the requesting user is the same as the writing user then security is satisfied
                    if ((config.self === "agentRequest" || config.self === "agentWrite") && config.agentRequest.user === config.agentWrite.user && vars.settings.hashUser === config.agentRequest.user && vars.settings.device[config.agentRequest.device] !== undefined && vars.settings.device[config.agentWrite.device] !== undefined) {
                        config.callback();
                        return;
                    }

                    // if the requesting user is trying to copy from itself to another user
                    if (config.self === "agentSource" && config.agentSource.user === config.agentRequest.user && vars.settings.device[config.agentRequest.device] !== undefined) {
                        config.callback();
                        return;
                    }

                    if (index > 0) {
                        do {
                            index = index - 1;
                            share = selfAgent.shares[shares[index]];
                            // item is in most precise share if item begins with share of longest matching share name
                            if (item.indexOf(share.name) === 0 && (shareIndex === null || share.name.length > selfAgent.shares[shares[shareIndex]].name.length)) {
                                shareIndex = index;
                            }
                        } while (index > 0);

                        // if not changing the file system (read) then security is satisfied
                        if (config.change === false && shareIndex !== null) {
                            config.callback();
                            return;
                        }

                        // if the file system will be changed then the share must have read only set to false
                        if (config.change === true && shareIndex !== null && selfAgent.shares[shares[shareIndex]].readOnly === false) {
                            config.callback();
                            return;
                        }
                    }
                }
                sender.route({
                    callback: function terminal_server_services_fileCopy_security_securityStatus(socketData:socketData):void {
                        sender.broadcast(socketData, "browser");
                    },
                    destination: "agentRequest",
                    origination: config.self,
                    socketData: {
                        data: status,
                        service: "file-system-status"
                    }
                });
            },
            complete = function terminal_server_services_fileCopy_security_complete():void {
                resolveIndex = resolveIndex + 1;
                if (resolveIndex === 3) {
                    allResolved();
                }
            },
            resolve = function terminal_server_services_fileCopy_security_resolve(type:agentCopy):void {
                if (config[type].user === vars.settings.hashUser) {
                    if (config[type].share !== "" && config[type].device === "") {
                        config[type].device = deviceMask.resolve(config[type]);
                        complete();
                    } else {
                        const unmasked = function terminal_server_services_fileCopy_security_resolve_unmasked(device:string):void {
                            if (device !== "") {
                                config[type].device = device;
                            }
                            complete();
                        };
                        deviceMask.unmask(config[type].device, unmasked);
                    }
                } else {
                    complete();
                }
            };
        resolve("agentRequest");
        resolve("agentSource");
        resolve("agentWrite");
    },
    status: function terminal_server_services_fileCopy_copyStatus(config:config_copy_status):void {
        const callbackDirectory = function terminal_server_services_fileCopy_copyStatus_callbackDirectory(title:string, text:[string, number], list:directory_list|string[]):void {
                const dirs:directory_list = list as directory_list,
                    copyStatus:service_fileSystem_status = {
                        agentRequest: config.agentRequest,
                        agentSource: config.agentWrite,
                        agentWrite: null,
                        fileList: dirs,
                        message: (config.message === "")
                            ? (function terminal_server_services_fileCopy_copyStatus_callbackDirectory_copyMessage():string {
                                const failures:number = (dirs === null || dirs.failures === undefined)
                                        ? config.failures
                                        : dirs.failures.length + config.failures,
                                    percentSize:number = (config.writtenSize / config.totalSize) * 100,
                                    percent:string = (config.totalSize === 0 || percentSize > 99.99)
                                        ? "100.00%"
                                        : (config.writtenSize === 0)
                                            ? "0.00%"
                                            : `${percentSize.toFixed(2)}%`,
                                    filePlural:string = (config.countFile === 1)
                                        ? ""
                                        : "s",
                                    failPlural:string = (failures === 1)
                                        ? ""
                                        : "s";
                                return `Writing ${percent} complete. ${common.commas(config.countFile)} file${filePlural} written at size ${common.prettyBytes(config.writtenSize)} (${common.commas(config.writtenSize)} bytes) with ${failures} integrity failure${failPlural}.`;
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
                    sender.route({
                        callback: broadcast,
                        destination: "agentSource",
                        origination: "agentWrite",
                        socketData: statusMessage
                    });
                    sender.route({
                        callback: broadcast,
                        destination: "agentRequest",
                        origination: "agentWrite",
                        socketData: statusMessage
                    });
                }
            },
            dirConfig:config_command_directory = {
                callback: callbackDirectory,
                depth: 2,
                exclusions: [],
                mode: "read",
                path: config.agentWrite.modalAddress,
                search: "",
                symbolic: true
            };
        if (config.directory === true) {
            directory(dirConfig);
        } else {
            callbackDirectory("", ["", 0], null);
        }
    }
};

export default fileCopy;