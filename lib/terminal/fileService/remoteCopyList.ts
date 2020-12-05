/* lib/terminal/fileService/remoteCopyList - Generates a file system list from a remote agent so that the source agent knows what artifacts to request by name. */

import directory from "../commands/directory.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

const remoteCopyList = function terminal_fileService_remoteCopyList(config:remoteCopyList):void {
    const list: [string, string, string, number][] = [],
        callback = function terminal_fileService_remoteCopyList_callback(dir:directoryList):void {
            const dirLength:number = dir.length,
                location:string = (function terminal_fileServices_remoteCopyList_callback_location():string {
                    let backSlash:number = config.data.location[config.index].indexOf("\\"),
                        forwardSlash:number = config.data.location[config.index].indexOf("/"),
                        remoteSep:string = ((backSlash < forwardSlash && backSlash > -1 && forwardSlash > -1) || forwardSlash < 0)
                            ? "\\"
                            : "/",
                        address:string[] = config.data.location[config.index].replace(/(\/|\\)$/, "").split(remoteSep);
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
            config.index = config.index + 1;
            if (config.index < config.length) {
                const recursiveConfig:readDirectory = {
                    callback: terminal_fileService_remoteCopyList_callback,
                    depth: 0,
                    exclusions: [],
                    logRecursion: config.logRecursion,
                    mode: "read",
                    path: config.data.location[config.index],
                    symbolic: false
                };
                directory(recursiveConfig);
                config.logRecursion = false;
            } else {
                // sort directories ahead of files and then sort shorter directories before longer directories
                // * This is necessary to ensure directories are written before the files and child directories that go in them.
                const details:remoteCopyListData = {
                    directories: directories,
                    fileCount: fileCount,
                    fileSize: fileSize,
                    list: list,
                    stream: (largest > 12884901888 || largeFile > 3 || (fileSize / fileCount) > 4294967296)
                };
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
                config.callback(details);
            }
        },
        dirConfig:readDirectory = {
            callback: callback,
            depth: 0,
            exclusions: [],
            logRecursion: config.logRecursion,
            mode: "read",
            path: config.data.location[config.index],
            symbolic: false
        };
    let directories:number =0,
        fileCount:number = 0,
        fileSize:number = 0;
    vars.testLogger("fileService", "remoteCopyList", "Gathers the directory data from the requested file system trees so that the local device may request each file from the remote.");
    directory(dirConfig);
    config.logRecursion = false;
};

export default remoteCopyList;