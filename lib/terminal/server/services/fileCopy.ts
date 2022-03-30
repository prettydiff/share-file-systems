
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
import vars from "../../utilities/vars.js";

/**
 * Stores file copy services.
 * ```typescript
 * interface module_copy {
 *     actions: {
 *         receiveList : (data:service_copy_list) => void; // Receives a list file system artifacts to be received from an remote agent's sendList operation, creates the directory structure, and then requests files by name
 *         requestFiles: (data:service_copy_list) => void; // Request files at agentWrite from agentSource
 *         sameAgent   : (data:service_copy) => void;      // An abstraction over commands/copy to move file system artifacts from one location to another on the same device
 *         sendList    : (data:service_copy) => void;      // Sends a list of file system artifacts to be copied on a remote agent.
 *     };
 *     route: {
 *         "copy"     : (socketData:socketData) => void; // Defines a callback for copy operations routed between agents.
 *         "copy-list": (socketData:socketData) => void; // Defines a callback for copy-list operations routed between agents.
 *     };
 *     status: {
 *         copy: (config:config_copy_status) => void;                      // Sends status messages for copy operations.
 *         cut : (data:service_copy, fileList:remoteCopyListData) => void; // Sends status messages for cut operations.
 *     };
 * }
 * ``` */
const fileCopy:module_copy = {
    actions: {
        // receives a file copy list at agent.write and makes the required directories
        receiveList: function terminal_server_services_fileCopy_receiveList(data:service_copy_list):void {
            const renameCallback = function terminal_server_services_fileCopy_receiveList_renameCallback(renameError:NodeJS.ErrnoException, list:directoryList[]):void {
                if (renameError === null) {
                    let listIndex:number = 0,
                        directoryIndex:number = 0;
                    const directorySort = function terminal_server_services_fileCopy_receiveList_renameCallback_directorySort(a:directoryItem, b:directoryItem):-1|1 {
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
                        mkdirCallback = function terminal_server_services_fileCopy_receiveList_renameCallback_mkdirCallback(err:Error):void {
                            const errorString:string = (err === null)
                                ? ""
                                : err.toString();
                            if (err !== null && errorString.indexOf("file already exists") < 0) {
                                directoryIndex = directoryIndex + 1;
                                if (directoryIndex === list[listIndex].length || list[listIndex][directoryIndex][1] !== "directory") {
                                    do {
                                        listIndex = listIndex + 1;
                                    } while(listIndex < list.length && list[listIndex][0][1] !== "directory");
                                    if (listIndex === list.length) {
                                        fileCopy.actions.requestFiles(data);
                                    } else {
                                        directoryIndex = 0;
                                        mkdir(list[listIndex][directoryIndex][6], terminal_server_services_fileCopy_receiveList_renameCallback_mkdirCallback);
                                    }
                                } else {
                                    mkdir(list[listIndex][directoryIndex][6], terminal_server_services_fileCopy_receiveList_renameCallback_mkdirCallback);
                                }
                            } else {
                                error([errorString]);
                            }
                        };

                    // sort each directory list so that directories are first
                    list.forEach(function terminal_server_services_fileCopy_receiveList_renameCallback_sortEach(item:directoryList) {
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
        },

        // request files at agentWrite from agentSource
        requestFiles: function terminal_server_services_fileCopy_requestFiles(data:service_copy_list):void {
            console.log(data);
        },

        // performs a streamed file copy operation without use of a network
        sameAgent: function terminal_server_services_fileCopy_sameAgent(data:service_copy):void {
            let directories:number = 0,
                index:number = 0;
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
                callback = function terminal_server_services_fileCopy_sameAgent_callback(stats:copyStats):void {
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
                                    fileCopy.status.cut(data, {
                                        directories: directories,
                                        fileCount: status.countFile,
                                        fileSize: 0,
                                        list: []
                                    });
                                }
                            };
                            data.location.forEach(function terminal_server_services_fileCopy_sameAgent_callback_removeEach(value:string):void {
                                remove(value, removeCallback);
                            });
                        }

                        // the delay prevents a race condition that results in a write after end error on the http response
                        setTimeout(function terminal_server_services_fileCopy_sameAgent_callback_delayStatus():void {
                            fileCopy.status.copy(status);
                        }, 100);
                    } else {
                        fileCopy.status.copy(status);
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

        // prepares a list of file system artifacts such that the destination knows what directories to create and what files to expect
        sendList: function terminal_server_services_fileCopy_sendList(data:service_copy):void {
            let locationIndex:number = 0,
                directories:number = 0,
                fileCount:number = 0,
                fileSize:number = 0;
            const action:"copy"|"cut" = (data.cut === true)
                    ? "cut"
                    : "copy",
                dirCallback = function terminal_server_services_fileCopy_sendList_dirCallback(result:directoryList|string[]):void {
                    const dir:directoryList = result as directoryList,
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
                                const sendList = function terminal_server_services_fileCopy_sendList_dirCallback_dirComplete_sendList():void {
                                    const copyList:service_copy_list = {
                                            agentRequest: data.agentRequest,
                                            agentSource: data.agentSource,
                                            agentWrite: data.agentWrite,
                                            list: [result as directoryList]
                                        },
                                        directoryPlural:string = (directories === 1)
                                            ? "y"
                                            : "ies",
                                        plural:string = (fileCount === 1)
                                            ? ""
                                            : "y",
                                        status:service_fileSystem_status = {
                                            agentRequest: data.agentRequest,
                                            agentTarget: data.agentWrite,
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

                                    fileCopy.route["copy-list"]({
                                        data: copyList,
                                        service: "copy-list"
                                    });
                                };

                                if (data.agentSource.user !== data.agentWrite.user) {
                                    // A hash sequence is required only if copying to a remote user because
                                    // * the remote user has to be allowed to bypass share limits of the file system
                                    // * this is because the remote user has to request the files from the local user
                                    // * and the local user's files can be outside of a designated share, which is off limits in all other cases
                                    const hashAgentCallback = function terminal_server_services_fileCopy_sendList_dirCallback_dirComplete_hashAgentCallback(hashOutput:hashOutput):void {
                                            if (data.agentWrite.user !== data.agentRequest.user) {
                                                data.agentRequest.share = now + hashOutput.hash;
                                            }
                                            sendList();
                                        },
                                        now:number = Date.now();
                                    hash({
                                        algorithm: "sha3-512",
                                        callback: hashAgentCallback,
                                        directInput: true,
                                        source: vars.settings.hashUser + vars.settings.hashDevice + now
                                    });
                                } else {
                                    sendList();
                                }
                            }
                        };
                    if (dir === undefined || dir[0] === undefined) {
                        // something went wrong with the directory command
                        return;
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
            deviceMask.unmask(data.agentWrite.device, function terminal_server_services_fileCopy_sendList_listStatus(device:string):void {
                const messageType:agentType = (data.agentRequest.user === data.agentWrite.user)
                        ? "device"
                        : "user",
                    agent:string = (messageType === "user")
                        ? data.agentWrite.user
                        : device,
                    status:service_fileSystem_status = {
                        agentRequest: data.agentRequest,
                        agentTarget: data.agentWrite,
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
    route: {
        "copy": function terminal_server_services_fileCopy_routeCopy(socketData:socketData):void {
            const data:service_copy = socketData.data as service_copy,
                routeCallback = function terminal_server_services_fileCopy_routeCopy_route(payload:socketData):void {
                    /*if (data.agentSource.user === data.agentWrite.user && targetDevice === writeDevice) {
                        fileCopy.actions.sameAgent(data);
                    } else {
                        fileCopy.actions.sendList(data);
                    }*/
                };
            sender.route("agentSource", socketData, routeCallback);
        },
        "copy-list": function terminal_server_services_fileCopy_routeCopyList(socketData:socketData):void {
            const data:service_copy_list = socketData.data as service_copy_list,
                agent:fileAgent = (data.agentSource.user === data.agentWrite.user)
                    ? data.agentWrite
                    : data.agentRequest,
                agentName:"agentRequest"|"agentWrite" = (data.agentSource.user === data.agentWrite.user)
                    ? "agentWrite"
                    : "agentRequest",
                routeCallback = function terminal_server_services_fileCopy_routeCopyList_route(payload:socketData):void {
                    /*if (data.agentWrite.user === vars.settings.hashUser && writeDevice === vars.settings.hashDevice) {
                        fileCopy.actions.receiveList(data);
                    } else {
                        sender.route("agentWrite", socketData, null);
                    }*/
                };
            if (vars.test.type === "service") {
                vars.settings.hashDevice = agent.device;
                vars.settings.hashUser = agent.user;
            }
            sender.route(agentName, socketData, routeCallback);
        }
    },
    status: {
        copy: function terminal_server_services_fileCopy_copyStatus(config:config_copy_status):void {
            const callbackDirectory = function terminal_server_services_fileCopy_copyStatus_callbackDirectory(list:directoryList|string[]):void {
                    const dirs:directoryList = list as directoryList,
                        copyStatus:service_fileSystem_status = {
                            agentRequest: config.agentRequest,
                            agentTarget: config.agentWrite,
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
                        };
                    deviceMask.unmask(config.agentRequest.device, function terminal_server_services_fileCopy_copyStatus_callbackDirectory_sendStatus_unmask(agentRequest:string):void {
                        const statusMessage:socketData = {
                                data: copyStatus,
                                service: "file-system-status"
                            },
                            broadcast = function terminal_server_services_fileCopy_copyStatus_callbackDirectory_sendStatus_unmask_broadcast():void {
                                if (vars.test.type === "service") {
                                    service.evaluation(statusMessage);
                                } else {
                                    sender.broadcast(statusMessage, "browser");
                                }
                            };
                        if (agentRequest === vars.settings.hashDevice) {
                            broadcast();
                        } else {
                            sender.route("agentRequest", statusMessage, broadcast);
                        }
                    });
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
        },
        cut: function terminal_server_services_fileCopy_cutStatus(data:service_copy, fileList:remoteCopyListData):void {
            const dirCallback = function terminal_server_services_fileCopy_cutStatus_dirCallback(list:directoryList|string[]):void {
                    const dirs:directoryList = list as directoryList,
                        cutStatus:service_fileSystem_status = {
                            agentRequest: data.agentRequest,
                            agentTarget: data.agentSource,
                            fileList: dirs,
                            message: (function terminal_server_services_fileCopy_cutStatus_dirCallback_message():string {
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
                    fileSystem.route({
                        data: cutStatus,
                        service: "file-system-status"
                    });
                },
                dirConfig:config_command_directory = {
                    callback: dirCallback,
                    depth: 2,
                    exclusions: [],
                    mode: "read",
                    path: data.agentSource.modalAddress,
                    symbolic: true
                };
            directory(dirConfig);
        }
    }
};

export default fileCopy;