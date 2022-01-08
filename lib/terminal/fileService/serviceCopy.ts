
/* lib/terminal/fileService/serviceCopy - A library that stores instructions for copy and cut of file system artifacts. */

import common from "../../common/common.js";
import copy from "../commands/copy.js";
import deviceMask from "../server/services/deviceMask.js";
import directory from "../commands/directory.js";
import hash from "../commands/hash.js";
import remove from "../commands/remove.js";
import sender from "../server/transmission/sender.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";

const serviceCopy:module_copy = {
    actions: {
        copyList: function terminal_fileService_serviceCopy_copyList(data:service_copy):void {
            let locationIndex:number = 0,
                directories:number = 0,
                fileCount:number = 0,
                fileSize:number = 0;
            const list: copyListItem[] = [],
                action:"copy"|"cut" = (data.cut === true)
                    ? "cut"
                    : "copy",
                dirCallback = function terminal_fileService_serviceCopy_copyList_dirCallback(result:directoryList|string[]):void {
                    const dir:directoryList = result as directoryList,
                        dirLength:number = dir.length,
                        hashList:[string, number][] = [],
                        location:string = (function terminal_fileServices_copyList_dirCallback_location():string {
                            let backSlash:number = data.location[locationIndex].indexOf("\\"),
                                forwardSlash:number = data.location[locationIndex].indexOf("/"),
                                remoteSep:string = ((backSlash < forwardSlash && backSlash > -1 && forwardSlash > -1) || forwardSlash < 0)
                                    ? "\\"
                                    : "/",
                                address:string[] = data.location[locationIndex].replace(/(\/|\\)$/, "").split(remoteSep);
                            address.pop();
                            return address.join(remoteSep) + remoteSep;
                        }()),
                        dirComplete = function terminal_fileServices_copyList_dirCallback_dirComplete():void {
                            locationIndex = locationIndex + 1;
                            if (locationIndex < data.location.length) {
                                const recursiveConfig:readDirectory = {
                                    callback: terminal_fileService_serviceCopy_copyList_dirCallback,
                                    depth: 0,
                                    exclusions: [],
                                    mode: "read",
                                    path: data.location[locationIndex],
                                    symbolic: false
                                };
                                directory(recursiveConfig);
                            } else {
                                const sendList = function terminal_fileService_copyList_dirCallback_dirComplete_sendList():void {
                                    const payload:service_copy_list = {};
                                    
                                };

                                // sort directories ahead of files and then sort shorter directories before longer directories
                                // * This is necessary to ensure directories are written before the files and child directories that go in them.
                                list.sort(function terminal_fileService_serviceCopy_sortFiles(itemA:copyListItem, itemB:copyListItem):number {
                                    if (itemA.type === "directory" && itemB.type !== "directory") {
                                        return -1;
                                    }
                                    if (itemA.type !== "directory" && itemB.type === "directory") {
                                        return 1;
                                    }
                                    if (itemA.type === "directory" && itemB.type === "directory") {
                                        if (itemA.relative.length < itemB.relative.length) {
                                            return -1;
                                        }
                                        return 1;
                                    }
                                    if (itemA.relative < itemB.relative) {
                                        return -1;
                                    }
                                    return 1;
                                });

                                if (data.agentSource.user !== data.agentWrite.user) {
                                    // A hash sequence is required only if copying to a remote user because
                                    // * the remote user has to be allowed to bypass share limits of the file system
                                    // * this is because the remote user has to request the files from the local user
                                    // * and the local user's files can be outside of a designated share, which is off limits in all other cases
                                    const hashAgentCallback = function terminal_fileService_serviceCopy_copyList_dirCallback_dirComplete_hashAgentCallback(hashOutput:hashOutput):void {
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
                                        source: serverVars.hashUser + serverVars.hashDevice + now
                                    });
                                } else {
                                    sendList();
                                }
                                /*
                        const details:remoteCopyListData = {
                                directories: directories,
                                fileCount: fileCount,
                                fileSize: fileSize,
                                list: list
                            },
                            sendList = function terminal_fileService_serviceCopy_copyList_dirCallback_sendList():void {
                                /*const payload:service_copyFileRequest = {
                                    copyData: data,
                                    fileData: details
                                };
                                route({
                                    agent: data.agentWrite.id,
                                    agentData: "agentWrite",
                                    agentType: data.agentWrite.type,
                                    callback: function terminal_fileService_serviceCopy_copyList_dirCallback_sendList_callback(message:socketData):void {
                                        const status:service_fileStatus = message.data as service_fileStatus,
                                            failures:number = (typeof status.fileList === "string" || status.fileList === null || status.fileList.failures === undefined)
                                                ? 0
                                                : status.fileList.failures.length;
                                        if (message.service === "copy") {
                                            message.service = "file-system";
                                            responder(message, transmit);
                                        } else if (data.cut === true && typeof status.fileList !== "string" && failures === 0) {
                                            let a:number = 0;
                                            const listLength:number = list.length,
                                                removeCallback = function terminal_fileService_serviceCopy_copyList_dirCallback_sendList_callback_removeCallback():void {
                                                    a = a + 1;
                                                    if (a === listLength) {
                                                        message.service = "file-system";
                                                        responder(message, transmit);
                                                        serviceCopy.cutStatus(data, details, transmit);
                                                    }
                                                };
                                            list.forEach(function terminal_fileService_serviceCopy_copyList_dirCallback_sendList_callback_cut(fileItem:[string, string, string, number]):void {
                                                remove(fileItem[0], removeCallback);
                                            });
                                        } else {
                                            message.service = "file-system";
                                            responder(message, transmit);
                                        }
                                    },
                                    data: payload,
                                    requestType: "copy-file-request",
                                    transmit: transmit
                                });
                            },
                            hashCallback = function terminal_fileService_serviceCopy_copyList_dirCallback_sendList_hashCallback(hashOutput:hashOutput):void {
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
                                */
                            }
                        },
                        hashCallback = function terminal_fileService_copyList_dirCallback_hashCallback(hashOutput:hashOutput):void {
                            list[hashOutput.parent].hash = hashOutput.hash;
                            hashCount = hashCount + 1;
                            if (hashCount < hashTotal) {
                                hash({
                                    callback: terminal_fileService_copyList_dirCallback_hashCallback,
                                    directInput: false,
                                    parent: hashList[hashCount][1],
                                    source: hashList[hashCount][0]
                                });
                            } else {
                                dirComplete();
                            }
                        };
                    let b:number = 0,
                        size:number = 0,
                        hashCount:number = 0,
                        hashTotal:number = 0;
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
                            hashList.push([dir[b][0], list.length]);
                        } else {
                            size = 0;
                            directories = directories + 1;
                        }
                        list.push({
                            absolute: dir[b][0],
                            hash: "",
                            relative: dir[b][0].replace(location, ""),
                            size: size,
                            type: dir[b][1]
                        });
                        b = b + 1;
                    } while (b < dirLength);
                    hashTotal = hashList.length;
                    if (hashTotal > 0) {
                        hash({
                            callback: hashCallback,
                            directInput: false,
                            parent: hashList[0][1],
                            source: hashList[0][0]
                        });
                    } else {
                        dirComplete();
                    }
                },
                dirConfig:readDirectory = {
                    callback: dirCallback,
                    depth: 0,
                    exclusions: [],
                    mode: "read",
                    path: data.location[locationIndex],
                    symbolic: false
                };

            // send messaging back to agentRequest
            deviceMask.unmask(data.agentWrite.device, function terminal_fileService_serviceCopy_copyList_listStatus(device:string):void {
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
                        message: `Preparing file ${action} to ${messageType} ${serverVars[messageType][agent].name}.`
                    };
                serviceFile.route.browser({
                    data: status,
                    service: "file-system-status"
                });
            });
            directory(dirConfig);
        },
        sameAgent: function terminal_fileService_serviceCopy_sameAgent(data:service_copy):void {
            let count:number = 0,
                dirCount:number = 0,
                directories:number = 0;
            const status:copyStatusConfig = {
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
                copyEach = function terminal_fileService_serviceCopy_sameAgent_copyEach(value:string):void {
                    const callback = function terminal_fileService_serviceCopy_sameAgent_copyEach_copy([fileCount, fileSize, errors]:[number, number, number]):void {
                            status.countFile = status.countFile + fileCount;
                            status.failures = errors;
                            count = count + 1;
                            status.writtenSize = (serverVars.testType === "service")
                                ? 0
                                : status.writtenSize + fileSize;
                            if (count === length) {
                                if (data.cut === true && errors === 0) {
                                    let removeCount:number = 0;
                                    const removeCallback = function terminal_fileService_serviceCopy_sameAgent_removeCallback():void {
                                        removeCount = removeCount + 1;
                                        if (removeCount === length) {
                                            serviceCopy.status.cut(data, {
                                                directories: directories,
                                                fileCount: status.countFile,
                                                fileSize: 0,
                                                list: []
                                            });
                                        }
                                    };
                                    data.location.forEach(function terminal_fileService_serviceCopy_sameAgent_copyEach_copy_removeEach(value:string):void {
                                        remove(value, removeCallback);
                                    });
                                }
    
                                // the delay prevents a race condition that results in a write after end error on the http response
                                setTimeout(function terminal_fileService_serviceCopy_sameAgent_copyEach_copy_removeEach_delay():void {
                                    serviceCopy.status.copy(status);
                                }, 100);
                            } else {
                                serviceCopy.status.copy(status);
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
                dirCallback = function terminal_fileService_serviceCopy_sameAgent_dirCallback(list:directoryList|string[]):void {
                    const directoryList:directoryList = list as directoryList;
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
        }
    },
    route: {
        "copy": function terminal_fileService_serviceCopy_routeCopy(socketData:socketData):void {
            const primaryAction = function terminal_fileService_serviceCopy_routeCopy_primaryAction():void {
                    // when agentWrite.device !== agentSource.device
                    // transmit file list from agentSource to agentWrite
                },
                secondaryAction = function terminal_fileService_serviceCopy_routeCopy_secondaryAction():void {
                    // when agentWrite.device === agentSource.device
                    // execute as local, only transmit status messaging to agentRequest
                    serviceCopy.actions.sameAgent(socketData.data as service_copy);
                };
            sender.route(socketData, primaryAction, secondaryAction);
        },
    },
    status: {
        copy: function terminal_fileService_serviceCopy_copyStatus(config:copyStatusConfig):void {
            const callbackDirectory = function terminal_fileService_serviceCopy_copyStatus_callbackDirectory(list:directoryList|string[]):void {
                    const dirs:directoryList = list as directoryList,
                        copyStatus:service_fileSystem_status = {
                            agentRequest: config.agentRequest,
                            agentTarget: config.agentWrite,
                            fileList: dirs,
                            message: (config.message === "")
                                ? (function terminal_fileService_serviceCopy_copyStatus_callbackDirectory_copyMessage():string {
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
                    deviceMask.unmask(config.agentRequest.device, function terminal_fileService_serviceCopy_copyStatus_callbackDirectory_sendStatus_unmask(agentRequest:string):void {
                        const statusMessage:socketData = {
                                data: copyStatus,
                                service: "file-system-status"
                            },
                            broadcast = function terminal_fileService_serviceCopy_copyStatus_callbackDirectory_sendStatus_unmask_broadcast():void {
                                sender.broadcast(statusMessage, "browser");
                            };
                        if (agentRequest === serverVars.hashDevice) {
                            broadcast();
                        } else {
                            sender.route(statusMessage, broadcast);
                        }
                    });
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
        },
        cut: function terminal_fileService_serviceCopy_cutStatus(data:service_copy, fileList:remoteCopyListData):void {
            const dirCallback = function terminal_fileService_serviceCopy_cutStatus_dirCallback(list:directoryList|string[]):void {
                    const dirs:directoryList = list as directoryList,
                        cutStatus:service_fileSystem_status = {
                            agentRequest: data.agentRequest,
                            agentTarget: data.agentSource,
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
                    serviceFile.route.browser({
                        data: cutStatus,
                        service: "file-system-status"
                    });
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
        }
    }
};

export default serviceCopy;