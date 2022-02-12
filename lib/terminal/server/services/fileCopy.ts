
/* lib/terminal/server/services/fileCopy - A library that stores instructions for copy and cut of file system artifacts. */

import { stat } from "fs";

import common from "../../../common/common.js";
import copy from "../../commands/copy.js";
import deviceMask from "../services/deviceMask.js";
import directory from "../../commands/directory.js";
import fileSystem from "./fileSystem.js";
import hash from "../../commands/hash.js";
import remove from "../../commands/remove.js";
import sender from "../transmission/sender.js";
import service from "../../test/application/service.js";
import vars from "../../utilities/vars.js";

/**
 * Stores file copy services
 * 
 * 
 * ```typescript
 * 
 * ``` */
const fileCopy:module_copy = {
    actions: {
        // receives a file copy list
        receiveList: function terminal_server_services_fileCopy_receiveList(data:service_copy_list):void {
            const end:number = data.list.length;
            let index:number = 0;
            // list schema:
            // 0. absolute path (string)
            // 1. relative path (string)
            // 2. type (fileType)
            // 3. size (number)
            // 4. specified (boolean) - whether the item is directly specified by the user or a descendant item
            if (data.list[0][2] === "directory") {
                do {
                    if (data.list[index][4] === true) {
                    }
                    index = index + 1;
                } while (index < end && data.list[index][2] === "directory");
            }
            /*do {

                index = index + 1;
            } while (index < end);*/
            console.log(data.list);
        },

        // performs a streamed file copy operation without use of a network
        sameAgent: function terminal_server_services_fileCopy_sameAgent(data:service_copy):void {
            let count:number = 0,
                dirCount:number = 0,
                directories:number = 0;
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
                length:number = data.location.length;
            data.location.forEach(function terminal_server_services_fileCopy_sameAgent_directoryEach(location:string):void {
                const callback = function terminal_server_services_fileCopy_sameAgent_copyEach_copy(stats:copyStats):void {
                        status.countFile = status.countFile + stats.files;
                        status.failures = stats.error;
                        count = count + 1;
                        status.writtenSize = (vars.test.type === "service")
                            ? 0
                            : status.writtenSize + stats.size;
                        if (count === length) {
                            if (data.cut === true && stats.error === 0) {
                                let removeCount:number = 0;
                                const removeCallback = function terminal_server_services_fileCopy_sameAgent_removeCallback():void {
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
                                data.location.forEach(function terminal_server_services_fileCopy_sameAgent_copyEach_copy_removeEach(value:string):void {
                                    remove(value, removeCallback);
                                });
                            }

                            // the delay prevents a race condition that results in a write after end error on the http response
                            setTimeout(function terminal_server_services_fileCopy_sameAgent_copyEach_copy_removeEach_delay():void {
                                fileCopy.status.copy(status);
                            }, 100);
                        } else {
                            fileCopy.status.copy(status);
                        }
                    },
                    copyConfig:config_command_copy = {
                        callback: callback,
                        destination: data.agentWrite.modalAddress,
                        exclusions: [""],
                        replace: false,
                        target: location
                    };
                copy(copyConfig);
            });
        },

        // prepares a list of file system artifacts such that the destination knows what directories to create and what files to expect
        sendList: function terminal_server_services_fileCopy_sendList(data:service_copy):void {
            let locationIndex:number = 0,
                directories:number = 0,
                fileCount:number = 0,
                fileSize:number = 0;
            const list: copyListItem[] = [],
                action:"copy"|"cut" = (data.cut === true)
                    ? "cut"
                    : "copy",
                dirCallback = function terminal_server_services_fileCopy_sendList_dirCallback(result:directoryList|string[]):void {
                    const dir:directoryList = result as directoryList,
                        dirLength:number = dir.length,
                        hashList:[string, number][] = [],
                        location:string = (function terminal_server_services_fileCopy_sendList_dirCallback_location():string {
                            let backSlash:number = data.location[locationIndex].indexOf("\\"),
                                forwardSlash:number = data.location[locationIndex].indexOf("/"),
                                remoteSep:string = ((backSlash < forwardSlash && backSlash > -1 && forwardSlash > -1) || forwardSlash < 0)
                                    ? "\\"
                                    : "/",
                                address:string[] = data.location[locationIndex].replace(/(\/|\\)$/, "").split(remoteSep);
                            address.pop();
                            return address.join(remoteSep) + remoteSep;
                        }()),
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
                                            list: list
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
                                        fileSystem.route.browser({
                                            data: status,
                                            service: "file-system-status"
                                        });

                                        // send status to agentWrite in case they are watching
                                        status.agentRequest = data.agentWrite;
                                        fileSystem.route.browser({
                                            data: status,
                                            service: "file-system-status"
                                        });
                                    }

                                    fileCopy.route["copy-list"]({
                                        data: copyList,
                                        service: "copy-list"
                                    });
                                };

                                // sort directories ahead of files and then sort shorter directories before longer directories
                                // * This is necessary to ensure directories are written before the files and child directories that go in them.
                                list.sort(function terminal_server_services_fileCopy_sortFiles(itemA:copyListItem, itemB:copyListItem):number {
                                    if (itemA[2] === "directory" && itemB[2] !== "directory") {
                                        return -1;
                                    }
                                    if (itemA[2] !== "directory" && itemB[2] === "directory") {
                                        return 1;
                                    }
                                    if (itemA[2] === "directory" && itemB[2] === "directory") {
                                        if (itemA[1].length < itemB[1].length) {
                                            return -1;
                                        }
                                        return 1;
                                    }
                                    if (itemA[1] < itemB[1]) {
                                        return -1;
                                    }
                                    return 1;
                                });

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
                    let b:number = 0,
                        size:number = 0;
                    // list schema:
                    // 0. absolute path (string)
                    // 1. relative path (string)
                    // 2. type (fileType)
                    // 3. size (number)
                    // 4. specified (boolean) - whether the item is directly specified by the user or a descendant item
                    if (dir === undefined || dir[0] === undefined) {
                        // something went wrong with the directory command
                        return;
                    }
                    do {
                        if (dir[b][1] === "file") {
                            size = dir[b][5].size;
                            fileCount = fileCount + 1;
                            fileSize = fileSize + size;
                            hashList.push([dir[b][0], list.length]);
                        } else {
                            size = 0;
                            directories = directories + 1;
                        }
                        list.push([dir[b][0], dir[b][0].replace(location, ""), dir[b][1], size, b < 1]);
                        b = b + 1;
                    } while (b < dirLength);
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
                    fileSystem.route.browser({
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
                routeCallback = function terminal_server_services_fileCopy_routeCopy_route(payload:socketData, targetDevice:string, writeDevice:string):void {
                    if (data.agentSource.user === data.agentWrite.user && targetDevice === writeDevice) {
                        fileCopy.actions.sameAgent(data);
                    } else {
                        fileCopy.actions.sendList(data);
                    }
                };
            sender.route(socketData, data.agentSource, routeCallback);
        },
        "copy-list": function terminal_server_services_fileCopy_routeCopyList(socketData:socketData):void {
            const data:service_copy_list = socketData.data as service_copy_list,
                agent:fileAgent = (data.agentSource.user === data.agentWrite.user)
                    ? data.agentWrite
                    : data.agentRequest,
                routeCallback = function terminal_server_services_fileCopy_routeCopyList_route(payload:socketData, targetDevice:string, writeDevice:string):void {
                    if (data.agentWrite.user === vars.settings.hashUser && writeDevice === vars.settings.hashDevice) {
                        fileCopy.actions.receiveList(data);
                    } else {
                        sender.route(payload, data.agentWrite, null);
                    }
                };
            if (vars.test.type === "service") {
                vars.settings.hashDevice = agent.device;
                vars.settings.hashUser = agent.user;
            }
            sender.route(socketData, agent, routeCallback);
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
                            sender.route(statusMessage, config.agentRequest, broadcast);
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
                    fileSystem.route.browser({
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