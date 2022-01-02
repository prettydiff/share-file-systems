
/* lib/terminal/fileService/serviceCopy - A library that stores instructions for copy and cut of file system artifacts. */

import copy from "../commands/copy.js";
import directory from "../commands/directory.js";
import remove from "../commands/remove.js";
import sender from "../server/transmission/sender.js";
import serverVars from "../server/serverVars.js";

const serviceCopy:module_copy = {
    route: {
        "copy": function terminal_fileService_serviceCopy_routeCopy(socketData:socketData):void {
            const copy:service_copy = socketData.data as service_copy,
                callback = (copy.agentRequest.device === serverVars.hashDevice && copy.agentSource.device === serverVars.hashDevice && copy.agentWrite.device === serverVars.hashDevice)
                    ? function terminal_fileService_serviceCopy_routeCopy_sameDevice():void {
                        serviceCopy.sameAgent(socketData.data as service_fileSystem);
                    }
                    : function terminal_fileService_serviceCopy_routeCopy_remoteAgent():void {
                        serviceFile.menu(socketData.data as service_fileSystem);
                    };
            sender.route(socketData, callback);
        },
    },
    sameAgent: function terminal_fileService_serviceCopy_sameAgent(data:service_copy, transmit:transmit):void {
        let count:number = 0,
            dirCount:number = 0,
            directories:number = 0,
            removeCount:number = 0;
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
            removeCallback = function terminal_fileService_serviceCopy_sameAgent_removeCallback():void {
                removeCount = removeCount + 1;
                if (removeCount === length) {
                    serviceCopy.cutStatus(data, {
                        directories: directories,
                        fileCount: status.countFile,
                        fileSize: 0,
                        list: []
                    }, transmit);
                }
            },
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
    }
};

export default serviceCopy;