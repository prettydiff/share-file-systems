
/* lib/terminal/fileService/serviceCopy - A library that stores instructions for copy and cut of file system artifacts. */

import common from "../../common/common.js";
import copy from "../commands/copy.js";
import deviceMask from "../server/services/deviceMask.js";
import directory from "../commands/directory.js";
import remove from "../commands/remove.js";
import sender from "../server/transmission/sender.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";

const serviceCopy:module_copy = {
    route: {
        "copy": function terminal_fileService_serviceCopy_routeCopy(socketData:socketData):void {
            const primaryAction = function terminal_fileService_serviceCopy_routeCopy_primaryAction():void {
                    //serviceCopy.sameAgent(socketData.data as service_fileSystem);
                },
                secondaryAction = function terminal_fileService_serviceCopy_routeCopy_secondaryAction():void {
                    serviceCopy.sameAgent(socketData.data as service_fileSystem);
                };
            sender.route(socketData, primaryAction, secondaryAction);
        },
    },
    sameAgent: function terminal_fileService_serviceCopy_sameAgent(data:service_copy, transmit:transmit):void {
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
                                        serviceCopy.cutStatus(data, {
                                            directories: directories,
                                            fileCount: status.countFile,
                                            fileSize: 0,
                                            list: []
                                        }, transmit);
                                    }
                                };
                                data.location.forEach(function terminal_fileService_serviceCopy_sameAgent_copyEach_copy_removeEach(value:string):void {
                                    remove(value, removeCallback);
                                });
                            }

                            // the delay prevents a race condition that results in a write after end error on the http response
                            setTimeout(function terminal_fileService_serviceCopy_sameAgent_copyEach_copy_removeEach_delay():void {
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
    },
    cutStatus: function terminal_fileService_serviceCopy_cutStatus(data:service_copy, fileList:remoteCopyListData):void {
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
    },
    status: function terminal_fileService_serviceCopy_status(config:copyStatusConfig):void {
        const callbackDirectory = function terminal_fileService_serviceCopy_status_callbackDirectory(list:directoryList|string[]):void {
                const dirs:directoryList = list as directoryList,
                    copyStatus:service_fileSystem_status = {
                        agentRequest: config.agentRequest,
                        agentTarget: config.agentWrite,
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
                                        : "s",
                                    verb:string = (config.cut === true)
                                        ? "Cutting"
                                        : "Copying";
                                return `${verb} ${percent} complete. ${common.commas(config.countFile)} file${filePlural} written at size ${common.prettyBytes(config.writtenSize)} (${common.commas(config.writtenSize)} bytes) with ${failures} integrity failure${failPlural}.`;
                            }())
                            : config.message
                    };
                deviceMask.unmask(config.agentRequest.device, function terminal_fileService_serviceCopy_status_callbackDirectory_sendStatus_unmask(agentRequest:string):void {
                    const statusMessage:socketData = {
                            data: copyStatus,
                            service: "file-system-status"
                        },
                        broadcast = function terminal_fileService_serviceCopy_status_callbackDirectory_sendStatus_unmask_broadcast():void {
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
    }
};

export default serviceCopy;