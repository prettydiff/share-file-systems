
/* lib/terminal/server/services/fileCopy - A library that stores instructions for copy and cut of file system artifacts. */

import common from "../../../common/common.js";
import copy from "../../commands/copy.js";
import deviceMask from "../services/deviceMask.js";
import directory from "../../commands/directory.js";
import error from "../../utilities/error.js";
import fileSystem from "./fileSystem.js";
import hash from "../../commands/hash.js";
import mkdir from "../../commands/mkdir.js";
import remove from "../../commands/remove.js";
import rename from "../../utilities/rename.js";
import sender from "../transmission/sender.js";
import service from "../../test/application/service.js";
import transmit_ws from "../transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * Stores file copy services.
 * ```typescript
 * interface module_fileCopy {
 *     actions: {
 *         list : (data:service_copy_list) => void; // Receives a list file system artifacts to be received from an remote agent's sendList operation, creates the directory structure, and then requests files by name
 *         sameAgent   : (data:service_copy) => void;      // An abstraction over commands/copy to move file system artifacts from one location to another on the same device
 *         sendList    : (data:service_copy) => void;      // Sends a list of file system artifacts to be copied on a remote agent.
 *     };
 *     route: (socketData:socketData) => void;             // Directs data to the proper agent by service name.
 *     status: (config:config_copy_status) => void;        // Sends status messages for copy operations.
 * }
 * ``` */
const fileCopy:module_fileCopy = {
    actions: {
        // service: copy - performs a streamed file copy operation without use of a network
        copy: function terminal_server_services_fileCopy_copy(data:service_copy):void {
            if (data.agentSource.user === data.agentWrite.user && data.agentSource.device === data.agentWrite.device) {
                // agentSource/agentWrite - same agent
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
                    callback = function terminal_server_services_fileCopy_sameAgent_callback(stats:copy_stats):void {
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
                                const removeCallback = function terminal_server_services_fileCopy_sameAgent_callback_removeCallback():void {
                                    removeCount = removeCount + 1;
                                    if (removeCount === length) {
                                        fileCopy.status(status);
                                    }
                                };
                                data.location.forEach(function terminal_server_services_fileCopy_sameAgent_callback_removeEach(value:string):void {
                                    remove(value, removeCallback);
                                });
                            }

                            // the delay prevents a race condition that results in a write after end error on the http response
                            setTimeout(function terminal_server_services_fileCopy_sameAgent_callback_delayStatus():void {
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
            } else {
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
                    dirCallback = function terminal_server_services_fileCopy_sendList_dirCallback(result:directory_list|string[]):void {
                        const dir:directory_list = result as directory_list,
                            dirComplete = function terminal_server_services_fileCopy_sendList_dirCallback_dirComplete():void {
                                locationIndex = locationIndex + 1;
                                if (locationIndex < data.location.length) {
                                    const recursiveConfig:config_command_directory = {
                                        callback: terminal_server_services_fileCopy_sendList_dirCallback,
                                        depth: 0,
                                        exclusions: [],
                                        mode: "read",
                                        path: data.location[locationIndex],
                                        symbolic: false
                                    };
                                    directory(recursiveConfig);
                                } else {
                                    const sendList = function terminal_server_services_fileCopy_sendList_dirCallback_dirComplete_sendList(hashValue:string):void {
                                        const copyList:service_copy_list = {
                                                agentRequest: data.agentRequest,
                                                agentSource: data.agentSource,
                                                agentWrite: data.agentWrite,
                                                hash: hashValue,
                                                ip: vars.environment.addresses.IPv6[0],
                                                cut: data.cut,
                                                list: lists,
                                                listData: listData,
                                                port: vars.environment.ports.ws
                                            },
                                            directoryPlural:string = (directories === 1)
                                                ? "y"
                                                : "ies",
                                            plural:string = (fileCount === 1)
                                                ? ""
                                                : "y",
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

                                    if (data.agentSource.user !== data.agentWrite.user) {
                                        // A hash sequence is required only if copying to a remote user because
                                        // * the remote user has to be allowed to bypass share limits of the file system
                                        // * this is because the remote user has to request the files from the local user
                                        // * and the local user's files can be outside of a designated share, which is off limits in all other cases
                                        const hashAgentCallback = function terminal_server_services_fileCopy_sendList_dirCallback_dirComplete_hashAgentCallback(hashOutput:hash_output):void {
                                                if (data.agentWrite.user !== data.agentRequest.user) {
                                                    data.agentRequest.share = now + hashOutput.hash;
                                                }
                                                sendList(hashOutput.hash);
                                            },
                                            now:number = Date.now();
                                        hash({
                                            algorithm: "sha3-512",
                                            callback: hashAgentCallback,
                                            directInput: true,
                                            source: vars.settings.hashUser + vars.settings.hashDevice + now
                                        });
                                    } else {
                                        sendList("");
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
                                    listData.size = listData.size + dir[index][5].size
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

                // send messaging back to agentRequest
                deviceMask.unmask(data.agentWrite.device, "agentWrite", function terminal_server_services_fileCopy_sendList_listStatus(device:string):void {
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
                            message: `Preparing file ${action} to ${messageType} ${vars.settings[messageType][agent].name}.`
                        };
                    if (vars.test.type !== "service") {
                        fileSystem.route({
                            data: status,
                            service: "file-system-status"
                        });
                    }
                });
                directory(dirConfig);
            }
        },

        // service: copy-file-request - respond to a file request by sending file contents
        fileRequest: function terminal_server_services_fileCopy_fileRequest(data:service_copy_file_request):void {

        },

        // service: copy-list - receives a file copy list at agent.write and makes the required directories
        list: function terminal_server_services_fileCopy_list(data:service_copy_list):void {
            // agentWrite
            const flags:flagList = {
                    dirs: false,
                    tunnel: false
                },
                renameCallback = function terminal_server_services_fileCopy_list_renameCallback(renameError:NodeJS.ErrnoException, list:directory_list[]):void {
                    if (renameError === null) {
                        let listIndex:number = 0,
                            directoryIndex:number = 0;
                        const // sort the file list so that directories are first and then are sorted by shortest length
                            directorySort = function terminal_server_services_fileCopy_list_renameCallback_directorySort(a:directory_item, b:directory_item):-1|1 {
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
                            mkdirCallback = function terminal_server_services_fileCopy_list_renameCallback_mkdirCallback(err:Error):void {
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
                                            flags.dirs = true;
                                            if (flags.tunnel === true) {

                                            }
                                            /*const listLength:number = data.list.length,
                                                copyStatus:config_copy_status = {
                                                    agentRequest: data.agentRequest,
                                                    agentSource: data.agentSource,
                                                    agentWrite: data.agentWrite,
                                                    countFile: 0,
                                                    cut: data.cut,
                                                    directory: false,
                                                    failures: data.listData.error,
                                                    location: [data.agentWrite.modalAddress],
                                                    message: "",
                                                    totalSize: data.listData.size,
                                                    writtenSize: 0
                                                },
                                                request = function terminal_server_services_fileCopy_requestFiles_request(list:number, file:number):void {
                                                    const fileLength:number = data.list[list].length;
                                                    if (data.list[list][file][1] !== "file") {
                                                        do {
                                                            file = file + 1;
                                                        } while (file < fileLength && data.list[list][file][1] !== "file");
                                                    }
                                                    if (file === fileLength) {
                                                        list = list + 1;
                                                        if (list < listLength) {
                                                            terminal_server_services_fileCopy_requestFiles_request(list, 0);
                                                        } else {
                                                            fileCopy.status(copyStatus);
                                                        }
                                                    } else {
                                                        const fileRequest:service_copy_file_request = {
                                                            agentRequest: data.agentRequest,
                                                            agentSource: data.agentSource,
                                                            agentWrite: data.agentWrite,
                                                            brotli: vars.settings.brotli,
                                                            path_source: data.list[list][file][0],
                                                            path_write: data.list[list][file][6],
                                                            size: data.list[list][file][5].size
                                                        };

                                                        // request file here  data.list[list][file][0] using service_copy_file
                                                        // stream from websocket, pipe to disk at data.list[list][file][6]
                                                        //
                                                        // callback:
                                                        // increment files, fileSize
                                                        // compare hashes
                                                        // update status
                                                        // file = file + 1, recurse
                                                    }
                                                };
                                            request(0, 0);*/
                                        } else {
                                            directoryIndex = 0;
                                            mkdir(list[listIndex][directoryIndex][6], terminal_server_services_fileCopy_list_renameCallback_mkdirCallback);
                                        }
                                    } else {
                                        mkdir(list[listIndex][directoryIndex][6], terminal_server_services_fileCopy_list_renameCallback_mkdirCallback);
                                    }
                                } else {
                                    error([errorString]);
                                }
                            };

                        // sort each directory list so that directories are first
                        list.forEach(function terminal_server_services_fileCopy_list_renameCallback_sortEach(item:directory_list) {
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
                };
            rename(data.list, data.agentWrite.modalAddress, renameCallback);
            transmit_ws.openService();
        }
    },
    route: function terminal_server_services_fileCopy_route(socketData:socketData):void {
        const data:service_copy_list = socketData.data as service_copy_list;
        if (socketData.service === "copy") {
            const copy = function terminal_server_services_fileCopy_route_copy(socketData:socketData):void {
                const data:service_copy = socketData.data as service_copy;
                if (vars.test.type === "service") {
                    service.evaluation(socketData);
                } else {
                    fileCopy.actions.copy(data);
                }
            };
            sender.route("agentSource", socketData, copy);
        } else if (socketData.service === "copy-list" || socketData.service === "copy-file-request") {
            const dest = function terminal_server_services_fileCopy_route_destList(target:copyAgent, self:copyAgent):copyAgent {
                    if (data.agentWrite.user !== data.agentSource.user && data.agentRequest.user !== data[self].user) {
                        return "agentRequest";
                    }
                    return target;
                },
                copyList = function terminal_server_services_fileCopy_route_copyList(socketData:socketData):void {
                    const data:service_copy_list = socketData.data as service_copy_list;
                    if (vars.test.type === "service") {
                        service.evaluation(socketData);
                    } else if (socketData.service === "copy-list") {
                        fileCopy.actions.list(data);
                    } else {
                        
                    }
                };
            sender.route(dest("agentWrite", "agentSource"), socketData, copyList);
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
                    sender.route("agentWrite", statusMessage, broadcast);
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