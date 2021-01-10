
/* lib/terminal/fileService/copyService - A library that stores instructions for copy and cut of file system artifacts. */

import { ServerResponse } from "http";

import common from "../../common/common.js";
import copy from "../commands/copy.js";
import directory from "../commands/directory.js";
import fileServices from "./fileServices.js";
import hash from "../commands/hash.js";
import remove from "../commands/remove.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

let logRecursion:boolean = true;
const copyService = function terminal_fileService_copyService(serverResponse:ServerResponse, data:copyService):void {
    const actions:copyActions = {
            requestList: function terminal_fileService_remoteCopyList(index:number):void {
                const list: [string, string, string, number][] = [],
                    dirCallback = function terminal_fileService_remoteCopyList_dirCallback(dir:directoryList):void {
                        const dirLength:number = dir.length,
                            location:string = (function terminal_fileServices_remoteCopyList_dirCallback_location():string {
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
                            largeFile:number = 0;
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
                                callback: terminal_fileService_remoteCopyList_dirCallback,
                                depth: 0,
                                exclusions: [],
                                logRecursion: logRecursion,
                                mode: "read",
                                path: data.location[index],
                                symbolic: false
                            };
                            directory(recursiveConfig);
                            logRecursion = false;
                        } else {
                            // sort directories ahead of files and then sort shorter directories before longer directories
                            // * This is necessary to ensure directories are written before the files and child directories that go in them.
                            const details:remoteCopyListData = {
                                    directories: directories,
                                    fileCount: fileCount,
                                    fileSize: fileSize,
                                    list: list,
                                    stream: (largest > 12884901888 || largeFile > 3 || (fileSize / fileCount) > 4294967296)
                                },
                                httpCall = function terminal_fileService_fileService_copyLocalToRemote_callback_http():void {
                                    /*httpRequest({
                                        callback: function terminal_fileService_fileService_copyLocalToRemote_callback_http_request(message:Buffer|string):void {
                                            response({
                                                message: message.toString(),
                                                mimeType: "application/json",
                                                responseType: "fs",
                                                serverResponse: serverResponse
                                            });
                                        },
                                        data: data,
                                        errorMessage: "Error sending list of files to remote for copy from local device.",
                                        serverResponse: serverResponse,
                                        stream: httpClient.stream
                                    });*/
                                },
                                hashCallback = function terminal_fileService_fileService_copyLocalToRemote_callback_hash(hashOutput:hashOutput):void {
                                    data.copyAgent = serverVars.hashUser;
                                    data.copyShare = hashOutput.hash;
                                    data.copyType = "user";
                                    httpCall();
                                };console.log(details);
                            list.sort(function terminal_fileService_sortFiles(itemA:[string, string, string, number], itemB:[string, string, string, number]):number {
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
                            data.action = "copy-request";
                            //remoteWatch - config.listData: data.remoteWatch = JSON.stringify(details);
                            if (data.agentType === "user") {
                                // A hash sequence is required only if copying to a remote user because
                                // * the remote user has to be allowed to bypass share limits of the file system
                                // * this is because the remote user has to request the files from the local user
                                // * and the local user's files can be outside of a designated share, which is off limits in all other cases
                                hash({
                                    algorithm: "sha3-512",
                                    callback: hashCallback,
                                    directInput: true,
                                    source: serverVars.hashUser + serverVars.hashDevice
                                });
                            } else {
                                httpCall();
                            }
                        }
                    },
                    dirConfig:readDirectory = {
                        callback: dirCallback,
                        depth: 0,
                        exclusions: [],
                        logRecursion: logRecursion,
                        mode: "read",
                        path: data.location[index],
                        symbolic: false
                    };
                let directories:number =0,
                    fileCount:number = 0,
                    fileSize:number = 0;
                vars.testLogger("fileService", "remoteCopyList", "Gathers the directory data from the requested file system trees so that the local device may request each file from the remote.");
                directory(dirConfig);
                logRecursion = false;
            },
            sameAgent: function terminal_fileService_copyService_sameAgent():void {
                let count:number = 0,
                    countFile:number = 0,
                    writtenSize:number = 0;
                const length:number = data.location.length;
                vars.testLogger("fileService", "copySameAgent", "Copying artifacts from one location to another on the same agent.");
                data.location.forEach(function terminal_fileService_copyService_copySameAgent_each(value:string):void {
                    const callback = function terminal_fileService_copyService_copySameAgent_each_copy([fileCount, fileSize]):void {
                            count = count + 1;
                            countFile = countFile + fileCount;
                            writtenSize = (serverVars.testType === "service")
                                ? 0
                                : writtenSize + fileSize;
                            if (count === length) {
                                const complete:completeStatus = {
                                    countFile: countFile,
                                    failures: 0,
                                    percent: 100,
                                    writtenSize: writtenSize
                                },
                                status:copyStatus = {
                                    failures: [],
                                    id: data.id,
                                    message: copyMessage(complete)
                                };
                                if (data.cut === true) {
                                    if (data.agent === data.originAgent) {
                                        let cutCount:number = 0;
                                        const removeCallback = function terminal_fileService_copyService_copySameAgent_each_copy_remove():void {
                                            cutCount = cutCount + 1;
                                            if (cutCount === data.location.length) {
                                                fileServices.respond.copy(serverResponse, status);
                                            }
                                        };
                                        data.location.forEach(function terminal_fileService_copyService_copySameAgent_each_copy_cut(filePath:string):void {
                                            remove(filePath, removeCallback);
                                        });
                                    }
                                } else {
                                    fileServices.respond.copy(serverResponse, status);
                                }
                            }
                        },
                        copyConfig:nodeCopyParams = {
                            callback: callback,
                            destination: data.destination,
                            exclusions: [""],
                            target: value
                        };
                    copy(copyConfig);
                });
            }
        },
        copyMessage = function terminal_fileService_copyService_copyMessage(numbers:completeStatus):string {
            const filePlural:string = (numbers.countFile === 1)
                    ? ""
                    : "s",
                failPlural:string = (numbers.failures === 1)
                    ? ""
                    : "s",
                verb:string = (data.cut === true)
                    ? "Cut"
                    : "Copy",
                action:string = (numbers.percent === 100)
                    ? verb
                    : `${verb}ing ${numbers.percent.toFixed(2)}%`;
            vars.testLogger("fileService", "copyMessage", "Status information about multiple file copy.");
            return `${action} complete. ${common.commas(numbers.countFile)} file${filePlural} written at size ${common.prettyBytes(numbers.writtenSize)} (${common.commas(numbers.writtenSize)} bytes) with ${numbers.failures} integrity failure${failPlural}.`
        },
        menu = function terminal_fileService_copyService_menu():void {
            if (data.action === "copy") {
                if (data.agent === data.copyAgent) {
                    actions.sameAgent();
                } else {
                    actions.requestList(0);
                }
            }
        };
    menu();
};

export default copyService;