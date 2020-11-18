/* lib/terminal/fileService/fileService - Manages various file system services. */

import { Hash } from "crypto";
import { ReadStream } from "fs";
import { IncomingHttpHeaders, ServerResponse } from "http";
import { BrotliCompress } from "zlib";

import base64 from "../commands/base64.js";
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import hash from "../commands/hash.js";
import log from "../utilities/log.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

import copySameAgent from "./copySameAgent.js";
import fileCallback from "./fileCallback.js";
import httpRequest from "./httpRequest.js";
import remoteCopyList from "./remoteCopyList.js";
import requestFiles from "./requestFiles.js";
import reverseAgents from "./reverseAgents.js";
import watchHandler from "./watchHandler.js";
import watchLocal from "./watchLocal.js";
import httpClient from "../server/httpClient.js";

const fileService = function terminal_fileService_fileService(serverResponse:ServerResponse, data:fileService):void {
    let logRecursion:boolean = true;
    const localDevice:boolean = (data.agent === serverVars.hashDevice && data.agentType === "device"),
        remoteUsers:[string, string] = ["", ""],
        rootIndex:number = data.location.indexOf("**root**"),
        close = function terminal_fileService_fileService_tasks_close():void {
            vars.testLogger("fileService", "fs-close", "Close a file system watch.");
            if (serverVars.watches[data.location[0]] !== undefined) {
                serverVars.watches[data.location[0]].close();
                delete serverVars.watches[data.location[0]];
            }
            fileCallback(serverResponse, data, `Watcher ${data.location[0]} closed.`);
        },
        copyService = function terminal_fileService_fileService_tasks_copyService():void {
            vars.testLogger("fileService", "fs-copy", "All branches of file system copy");
            if (localDevice === true) {
                if (data.copyAgent === serverVars.hashDevice && data.copyType === "device") {
                    // * data.agent === local
                    // * data.copyAgent === local
                    vars.testLogger("fileService", "fs-copy copySameAgent", "Call copySameAgent if data.agent and data.copyAgent are the same agents.");
                    copySameAgent(serverResponse, data);
                } else {
                    // copy from local to remote
                    // * data.agent === local
                    // * data.copyAgent === remote
                    // * response here is just for maintenance.  A list of files is pushed and the remote needs to request from that list, but otherwise a response isn't needed here.
                    copyLocalToRemote();
                }
            } else if (data.copyAgent === serverVars.hashDevice && data.copyType === "device") {
                // data.agent === remote
                // data.copyAgent === local
                copyRemoteToLocal();
            } else if (data.agent === data.copyAgent && data.agentType === data.copyType) {
                // * data.agent === sameRemoteAgent
                // * data.agent === sameRemoteAgent
                copyRemoteSameAgent();
            } else {
                // * data.agent === remoteAgent
                // * data.copyAgent === differentRemoteAgent
                copyRemoteToDifferentRemote();
            }
        },
        copyFile = function terminal_fileService_fileService_tasks_copyFile():void {
            const hash:Hash = vars.node.crypto.createHash("sha3-512"),
                hashStream:ReadStream = vars.node.fs.ReadStream(data.location[0]);
            vars.testLogger("fileService", "fs-copy-file", "Respond to a file request with the file and its hash value.");
            hashStream.pipe(hash);
            hashStream.on("close", function terminal_fileService_fileService_tasks_copyFile_close():void {
                const readStream:ReadStream = vars.node.fs.ReadStream(data.location[0]),
                    compress:BrotliCompress = (serverVars.brotli > 0)
                        ? vars.node.zlib.createBrotliCompress({
                            params: {[vars.node.zlib.constants.BROTLI_PARAM_QUALITY]: serverVars.brotli}
                        })
                        : null;
                serverResponse.setHeader("hash", hash.digest("hex"));
                serverResponse.setHeader("file_name", data.remoteWatch);
                serverResponse.setHeader("file_size", data.depth);
                serverResponse.setHeader("cut_path", data.location[0]);
                if (serverVars.brotli > 0) {
                    serverResponse.setHeader("compression", "true");
                } else {
                    serverResponse.setHeader("compression", "false");
                }
                serverResponse.writeHead(200, {"Content-Type": "application/octet-stream; charset=binary"});
                if (serverVars.brotli > 0) {
                    readStream.pipe(compress).pipe(serverResponse);
                } else {
                    readStream.pipe(serverResponse);
                }
            });
            if (data.id.indexOf("|Copying ") > 0) {
                vars.ws.broadcast(JSON.stringify({
                    "file-list-status": {
                        failures: [],
                        message: data.id.slice(data.id.indexOf("|") + 1),
                        target: data.id.slice(0, data.id.indexOf("|"))
                    }
                }));
            }
        },
        copyListLocal = function terminal_fileService_fileService_tasks_copyListLocal():void {
            const listData:remoteCopyList = {
                callback: function terminal_fileService_fileService_tasks_copyListLocal_callback(listData:remoteCopyListData):void {
                    response(serverResponse, "application/octet-stream", JSON.stringify(listData));
                },
                data: data,
                files: [],
                index: 0,
                length: data.location.length,
                logRecursion: logRecursion
            };
            vars.testLogger("fileService", "fs-copy-list", "Call the remoteCopyList function so that a remote agent knows what files to request.");
            remoteCopyList(listData);
        },
        copyListRemote = function terminal_fileService_fileService_tasks_copyListRemote():void {
            vars.testLogger("fileService", "fs-copy-list-remote", "Initiates the copy procedure from the destination agent when both the destination and origination are different and not the local device.");
            reverseAgents(data);
            data.action = <serviceType>`${data.action.replace("-remote", "")}`;
            httpRequest({
                callback: function terminal_fileService_fileService_tasks_copyListRemote_callback(message:Buffer|string):void {
                    requestFiles({
                        data: data,
                        fileData: JSON.parse(message.toString()),
                        logRecursion: logRecursion,
                        serverResponse: serverResponse
                    });
                },
                data: data,
                errorMessage: "Error copying from remote to local device",
                serverResponse: serverResponse,
                stream: httpClient.stream
            });
        },
        copyLocalToRemote = function terminal_fileService_fileService_tasks_copyLocalToRemote():void {
            const listData:remoteCopyList = {
                callback: function terminal_fileService_fileService_tasks_copyLocalToRemote_callback(listData:remoteCopyListData):void {
                    const httpCall = function terminal_fileService_fileService_tasks_copyLocalToRemote_callback_http():void {
                            httpRequest({
                                callback: function terminal_fileService_fileService_tasks_copyLocalToRemote_callback_http_request(message:Buffer|string):void {
                                    response(serverResponse, "application/json", message.toString());
                                },
                                data: data,
                                errorMessage: "Error sending list of files to remote for copy from local device.",
                                serverResponse: serverResponse,
                                stream: httpClient.stream
                            });
                        },
                        hashCallback = function terminal_fileService_fileService_tasks_copyLocalToRemote_callback_hash(hashOutput:hashOutput):void {
                            data.copyAgent = serverVars.hashUser;
                            data.copyShare = hashOutput.hash;
                            data.copyType = "user";
                            httpCall();
                        };
                    reverseAgents(data);
                    data.action = <serviceType>`${data.action}-request`;
                    data.remoteWatch = JSON.stringify(listData);
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
                },
                data: data,
                files: [],
                index: 0,
                length: data.location.length,
                logRecursion: logRecursion
            };
            vars.testLogger("fileService", "fs-copy destination-not-local", "When the destination is not the local device call the remoteCopyList function to get a list of artifacts to request.");
            remoteCopyList(listData);
        },
        copyRemoteSameAgent = function terminal_fileService_fileService_tasks_copyRemoteSameAgent():void {
            vars.testLogger("fileService", "fs-copy destination-origination-same", "When the destination and origination are the same agent that remote agent must be told to perform a same agent copy.");
            data.action = <serviceType>`${data.action}-self`;
            httpRequest({
                callback: function terminal_fileService_fileService_tasks_copyRemoteSameAgent(message:Buffer|string):void {
                    response(serverResponse, "application/json", message.toString());
                },
                data: data,
                errorMessage: `Error copying files to and ${data.agentType} ${serverVars[data.agentType][data.agent].name}.`,
                serverResponse: serverResponse,
                stream: httpClient.stream
            });
        },
        copyRemoteToDifferentRemote = function terminal_fileService_fileService_tasks_copyRemoteToDifferentRemote():void {
            vars.testLogger("fileService", "fs-copy destination-origination-different", "When the origination and destination are different and neither is the local device the destination device must be told to start the destination-not-local operation and then respond back with status.");
            reverseAgents(data);
            data.action = <serviceType>`${data.action}-list-remote`;
            data.remoteWatch = serverVars.hashDevice;
            data.watch = "third party action";
            httpRequest({
                callback: function terminal_fileService_fileService_tasks_copyRemoteToDifferentRemote_callback(message:Buffer|string):void {
                    //console.log("");
                    //console.log("responseBody");
                    //console.log(responseBody);
                    //requestFiles(JSON.parse(<string>responseBody));
                    log([message.toString()]);
                },
                data: data,
                errorMessage: "Error copying from remote to local device",
                serverResponse: serverResponse,
                stream: httpClient.stream
            });
        },
        copyRemoteToLocal = function terminal_fileService_fileService_tasks_copyRemoteToLocal():void {
            vars.testLogger("fileService", "fs-copy origination-not-local", "When the files exist on the local device but are requested remotely then the remote agent must request the list of files to know what to request.");
            data.action = <serviceType>`${data.action}-list`;
            if (data.agentType === "user") {
                data.copyAgent = serverVars.hashUser;
                data.copyType = "user";
            }
            httpRequest({
                callback: function terminal_fileService_fileService_tasks_copyRemoteToLocal_callback(message:Buffer|string):void {
                    requestFiles({
                        data: data,
                        fileData: JSON.parse(message.toString()),
                        logRecursion: logRecursion,
                        serverResponse: serverResponse
                    });
                },
                data: data,
                errorMessage: "Error copying from remote to local device",
                serverResponse: serverResponse,
                stream: httpClient.stream
            });
        },
        copyRequest = function terminal_fileService_fileService_tasks_copyRequest():void {
            vars.testLogger("fileService", "fs-copy-request", "Calls the requestFiles function from a remote agent.");
            reverseAgents(data);
            data.watch = "remote";
            requestFiles({
                data: data,
                fileData: JSON.parse(data.remoteWatch),
                logRecursion: logRecursion,
                serverResponse: serverResponse
            });
        },
        cutRemote = function terminal_fileService_fileService_tasks_cutRemove():void {
            let a:number = 0;
            const length:number = data.location.length,
                watchTest:boolean = (serverVars.watches[data.watch] !== undefined),
                types:string[] = JSON.parse(data.name),
                fsRemove = function terminal_fileService_fileService_tasks_cutRemove_fsRemove():void {
                    // recursive function to remove artifacts one by one so that there aren't collisions
                    if (a === length - 1 && watchTest === true) {
                        serverVars.watches[data.watch] = vars.node.fs.watch(data.watch, {
                            recursive: (process.platform === "win32" || process.platform === "darwin")
                        }, function terminal_fileService_fileService_tasks_cutRemote_fsRemove_watch():void {
                            watchHandler({
                                data: data,
                                logRecursion: logRecursion,
                                serverResponse: serverResponse,
                                value: data.watch
                            });
                        });
                    }
                    if (a < length) {
                        if (types[a] === "file") {
                            remove(data.location[a], terminal_fileService_fileService_tasks_cutRemove);
                            a = a + 1;
                        } else {
                            vars.node.fs.readdir(data.location[a], function terminal_fileService_fileService_tasks_cutRemove_fsRemove_readdir(erd:nodeError, items:string[]):void {
                                if (erd === null && items.length < 1) {
                                    remove(data.location[a], terminal_fileService_fileService_tasks_cutRemove);
                                    a = a + 1;
                                }
                            });
                        }
                    } else {
                        // update destination directory
                        directory({
                            callback: function terminal_fileService_fileService_tasks_cutRemove_fsRemove_directoryCallback(dirItems:directoryList):void {
                                const remote:fsUpdateRemote = {
                                    agent: data.agent,
                                    agentType: data.agentType,
                                    dirs: dirItems,
                                    fail: dirItems.failures,
                                    location: data.watch
                                };
                                vars.ws.broadcast(JSON.stringify({
                                    "fs-update-local": dirItems
                                }));
                                response(serverResponse, "application/json", JSON.stringify({
                                    "fs-update-remote": remote
                                }));
                            },
                            depth: 2,
                            exclusions: [],
                            logRecursion: logRecursion,
                            mode: "read",
                            path: data.watch,
                            symbolic: true
                        });
                    }
                };
            if (watchTest === true) {
                serverVars.watches[data.watch].close();
            }
            vars.testLogger("fileService", "fs-cut-remote", "Removes artifacts from the origination once all other operations are complete and integrity is verified.");
            fsRemove();
        },
        destroy = function terminal_fileService_fileService_tasks_destroy():void {
            let count:number = 0;
            vars.testLogger("fileService", "fs-destroy", `Destroying: ${data.location}`);
            data.location.forEach(function terminal_fileService_fileService_tasks_destroy_each(value:string):void {
                if (serverVars.watches[value] !== undefined) {
                    serverVars.watches[value].close();
                    delete serverVars.watches[value];
                }
                remove(value, function terminal_fileService_fileService_tasks_destroy_each_remove():void {
                    count = count + 1;
                    if (count === data.location.length) {
                        if (data.name === "") {
                            const agent:string = (data.copyAgent === "")
                                    ? serverVars.hashDevice
                                    : data.copyAgent,
                                type:agentType = (data.copyAgent === "")
                                    ? "device"
                                    : data.copyType;
                            fileCallback(serverResponse, data, `Path(s) ${data.location.join(", ")} destroyed on ${type} ${agent}.`);
                        } else {
                            directory({
                                callback: function terminal_fileService_fileService_tasks_destroy_each_remove_callback(directoryList:directoryList):void {
                                    const responseData:fsRemote = {
                                        dirs: directoryList,
                                        fail: directoryList.failures,
                                        id: data.id
                                    };
                                    response(serverResponse, "application/json", JSON.stringify(responseData));
                                },
                                depth: 2,
                                exclusions: [],
                                logRecursion: false,
                                mode: "read",
                                path: data.name,
                                symbolic: true
                            });
                        }
                    }
                });
            });
        },
        newArtifact = function terminal_fileService_fileService_tasks_newArtifact():void {
            const slash:string = (data.location[0].indexOf("/") < 0 || (data.location[0].indexOf("\\") < data.location[0].indexOf("/") && data.location[0].indexOf("\\") > -1 && data.location[0].indexOf("/") > -1))
                    ? "\\"
                    : "/",
                dirs = data.location[0].split(slash);
            vars.testLogger("fileService", "fs-new", `Create a new item of type ${data.name}`);
            dirs.pop();
            if (data.name === "directory") {
                mkdir(data.location[0], function terminal_fileService_fileService_tasks_newArtifact_directory():void {
                    fileCallback(serverResponse, data, `${data.location[0]} created.`);
                    watchLocal(dirs.join(slash), logRecursion);
                }, false);
            } else if (data.name === "file") {
                vars.node.fs.writeFile(data.location[0], "", "utf8", function terminal_fileService_fileService_tasks_newArtifact_file(erNewFile:Error):void {
                    if (erNewFile === null) {
                        fileCallback(serverResponse, data, `${data.location[0]} created.`);
                        watchLocal(dirs.join(slash), logRecursion);
                    } else {
                        error([erNewFile.toString()]);
                        response(serverResponse, "text/plain", erNewFile.toString());
                    }
                });
            }
        },
        read = function terminal_fileService_fileService_tasks_read():void {
            const length:number = data.location.length,
                storage:stringDataList = [],
                type:string = (data.action === "fs-read")
                    ? "base64"
                    : data.action.replace("fs-", ""),
                callback = function terminal_fileService_fileService_tasks_read_callback(output:base64Output):void {
                    const stringData:stringData = {
                        content: output[type],
                        id: output.id,
                        path: output.filePath
                    };
                    b = b + 1;
                    storage.push(stringData);
                    if (b === length) {
                        vars.testLogger("fileService", "dataString callback", `Callback to action ${data.action} that writes an HTTP response.`);
                        response(serverResponse, "application/json", JSON.stringify(storage));
                    }
                },
                fileReader = function terminal_fileService_fileService_tasks_read_fileReader(fileInput:base64Input):void {
                    vars.node.fs.readFile(fileInput.source, "utf8", function terminal_fileService_fileService_tasks_read_fileReader_readFile(readError:nodeError, fileData:string) {
                        const inputConfig:base64Output = {
                            base64: fileData,
                            id: fileInput.id,
                            filePath: fileInput.source
                        };
                        vars.testLogger("fileService", "fileReader", `Reading a file for action fs-read, ${input.source}`);
                        if (readError !== null) {
                            error([readError.toString()]);
                            vars.ws.broadcast(JSON.stringify({
                                error: readError
                            }));
                            return;
                        }
                        input.callback(inputConfig);
                    });
                },
                input:base64Input = {
                    callback: callback,
                    id: "",
                    source: ""
                },
                hashInput:hashInput = {
                    algorithm: serverVars.hashType,
                    callback: callback,
                    directInput: false,
                    id: "",
                    source: ""
                };
            let a:number = 0,
                b:number = 0,
                index:number;
            vars.testLogger("fileService", "dataString", `Action ${data.action}`);
            do {
                if (data.action === "fs-base64") {
                    index = data.location[a].indexOf(":");
                    input.id = data.location[a].slice(0, index);
                    input.source = data.location[a].slice(index + 1);
                    base64(input);
                } else if (data.action === "fs-hash") {
                    index = data.location[a].indexOf(":");
                    hashInput.id = data.location[a].slice(0, index);
                    hashInput.source = data.location[a].slice(index + 1);
                    hash(hashInput);
                } else if (data.action === "fs-read") {
                    index = data.location[a].indexOf(":");
                    input.id = data.location[a].slice(0, index);
                    input.source = data.location[a].slice(index + 1);
                    fileReader(input);
                }
                a = a + 1;
            } while (a < length);
        },
        readDirectory = function terminal_fileService_fileService_tasks_readDirectory():void {
            const callback = function terminal_fileService_fileService_tasks_readDirectory_callback(result:directoryList):void {
                    count = count + 1;
                    if (result.length > 0) {
                        failures = failures.concat(result.failures);
                        output = output.concat(result);
                    }
                    if (vars.command === "test" || vars.command === "test_service") {
                        result.forEach(function terminal_fileService_fileService_tasks_readDirectory_callback_each(item:directoryItem):void {
                            item[5] = null;
                        });
                    }
                    if (count === pathLength) {
                        const responseData:fsRemote = {
                            dirs: "missing",
                            fail:[],
                            id: data.id
                        };
                        if (output.length < 1) {
                            response(serverResponse, "application/json", JSON.stringify(responseData));
                        } else {
                            responseData.dirs = output;
                            responseData.fail = failures;
                            response(serverResponse, "application/json", JSON.stringify(responseData));
                        }
                        
                        // please note
                        // watch is ignored on all operations other than fs-directory
                        // fs-directory will only read from the first value in data.location
                        if (result.length > 0 && data.watch !== "no" && data.watch !== vars.projectPath) {
                            const watchPath:string = result[0][0].replace(/\\/g, "\\\\");
                            if (data.watch !== "yes" && serverVars.watches[data.watch] !== undefined) {
                                serverVars.watches[data.watch].close();
                                delete serverVars.watches[data.watch];
                            }
                            if (serverVars.watches[watchPath] === undefined) {
                                serverVars.watches[watchPath] = vars.node.fs.watch(watchPath, {
                                    recursive: (process.platform === "win32" || process.platform === "darwin")
                                }, function terminal_fileService_fileService_tasks_readDirectory_callback_watch(eventType:string, fileName:string):void {
                                    // throttling is necessary in the case of recursive watches in areas the OS frequently stores user settings
                                    if (fileName !== null && fileName.split(vars.sep).length < 2) {
                                        watchHandler({
                                            data: data,
                                            logRecursion: logRecursion,
                                            serverResponse: serverResponse,
                                            value: watchPath
                                        });
                                    }
                                });
                            } else {
                                serverVars.watches[watchPath].time = Date.now();
                            }
                        }
                    }
                },
                pathList:string[] = data.location,
                pathLength:number = pathList.length;
            let count:number = 0,
                output:directoryList = [],
                failures:string[] = [];
            vars.testLogger("fileService", "fs-directory and watch", "Access local directory data and set watch or set watch for remote agent directory.");
            pathList.forEach(function terminal_fileService_fileService_tasks_readDirectory_pathEach(value:string):void {
                const pathRead = function terminal_fileService_fileService_tasks_readDirectory_pathEach_pathRead():void {
                    const dirConfig:readDirectory = {
                        callback: callback,
                        depth: data.depth,
                        exclusions: [],
                        logRecursion: logRecursion,
                        mode: "read",
                        path: value,
                        symbolic: true
                    };
                    if ((/^\w:$/).test(value) === true) {
                        value = value + "\\";
                    }
                    directory(dirConfig);
                    logRecursion = false;
                };
                if (value === "\\" || value === "\\\\") {
                    pathRead();
                } else {
                    vars.node.fs.stat(value, function terminal_fileService_fileService_tasks_readDirectory_pathEach_stat(erp:nodeError):void {
                        if (erp !== null) {
                            error([erp.toString()]);
                            callback([]);
                            return;
                        }
                        pathRead();
                    });
                }
            });
        },
        remoteUserRead = function terminal_fileService_fileService_tasks_remoteUserRead():void {
            vars.testLogger("fileService", "not local agent", "Most of the primitive file system operations only need to occur on the target agent.");
            httpRequest({
                callback: function terminal_fileService_fileService_tasks_remoteUserRead_callback(message:Buffer|string):void {
                    response(serverResponse, "application/json", message.toString());
                },
                data: data,
                errorMessage: `Error requesting ${data.action} from remote.`,
                serverResponse: serverResponse,
                stream: httpClient.stream
            });
        },
        remoteUserRemoteDevice = function terminal_fileService_fileService_tasks_remoteUerRemoteDevice():void {
            vars.testLogger("fileService", "remote user and remote device", "Forwarding request to a remote user's other device on which the share resides");
            data.agent = remoteUsers[0];
            data.agentType = "device";
            httpRequest({
                callback: function terminal_fileService_fileService_tasks_removeUserRemoteDevice_callback(message:Buffer|string, headers:IncomingHttpHeaders):void {
                    if (headers.file_name !== undefined) {
                        serverResponse.setHeader("hash", headers.hash);
                        serverResponse.setHeader("file_name", headers.file_name);
                        serverResponse.setHeader("file_size", headers.file_size);
                        serverResponse.setHeader("cut_path", headers.cut_path);
                        serverResponse.setHeader("compression", headers.compression);
                    }
                    response(serverResponse, "application/json", message.toString());
                },
                data: data,
                errorMessage: `Error request ${data.action} from remote user device ${serverVars.device[remoteUsers[0]].name}`,
                serverResponse: serverResponse,
                stream: httpClient.stream
            });
        },
        remoteWatch = function terminal_fileService_fileService_tasks_remoteWatch():void {
            vars.testLogger("fileService", "fs-details remote", "Get directory data from a remote agent without setting a file system watch.");
            // remote file server access
            httpRequest({
                callback: function terminal_fileService_fileService_tasks_remoteWatch_callback(message:Buffer|string):void {
                    if (message.toString().indexOf("{\"fs-update-remote\":") === 0) {
                        vars.ws.broadcast(message.toString());
                        response(serverResponse, "text/plain", "Terminal received file system response from remote.");
                    } else {
                        response(serverResponse, "application/json", message.toString());
                    }
                },
                data: data,
                errorMessage: `Error on reading from remote file system at agent ${data.agent}`,
                serverResponse: serverResponse,
                stream: httpClient.stream
            });
        },
        rename = function terminal_fileService_fileService_tasks_rename():void {
            const newPath:string[] = data.location[0].split(vars.sep);
            vars.testLogger("fileService", "fs-rename", `Renames an existing file system artifact, ${data.name}`);
            newPath.pop();
            newPath.push(data.name);
            vars.node.fs.rename(data.location[0], newPath.join(vars.sep), function terminal_fileService_fileService_tasks_rename_callback(erRename:Error):void {
                if (erRename === null) {
                    const agent:string = (data.copyAgent === "")
                            ? serverVars.hashDevice
                            : data.copyAgent,
                        type:agentType = (data.copyAgent === "")
                            ? "device"
                            : data.copyType;
                    vars.testLogger("fileService", "rs-rename response", `An error upon renaming artifact: ${erRename}`);
                    fileCallback(serverResponse, data, `Path ${data.location[0]} on ${type} ${agent} renamed to ${newPath.join(vars.sep)}.`);
                } else {
                    error([erRename.toString()]);
                    vars.testLogger("fileService", "fs-rename response", "All went well with renaming then write the HTTP response.");
                    response(serverResponse, "text/plain", erRename.toString());
                }
            });
        },
        search = function terminal_fileService_fileService_tasks_search():void {
            const callback = function terminal_fileService_fileService_tasks_search_callback(result:directoryList):void {
                    const output:fsRemote = {
                        dirs: result,
                        fail: [],
                        id: data.id
                    };
                    delete result.failures;
                    response(serverResponse, "application/json", JSON.stringify(output));
                },
                dirConfig:readDirectory = {
                    callback: callback,
                    depth: data.depth,
                    exclusions: [],
                    logRecursion: logRecursion,
                    mode: "search",
                    path: data.location[0],
                    search: data.name,
                    symbolic: true
                };
            vars.testLogger("fileService", "fs-search", `Performs a directory search operation on ${data.location[0]} of agent ${data.agent}`);
            directory(dirConfig);
            logRecursion = false;
        },
        write = function terminal_fileService_fileService_tasks_write():void {
            vars.testLogger("fileService", "fs-write", "Writes or over-writes a file to disk.");
            vars.node.fs.writeFile(data.location[0], data.name, "utf8", function terminal_fileService_fileService_tasks_write_callback(erw:nodeError):void {
                const agent:string = (data.copyAgent === "")
                        ? serverVars.hashDevice
                        : data.copyAgent,
                    type:agentType = (data.copyAgent === "")
                        ? "device"
                        : data.copyType;
                let message:string = (type === "device" && agent === serverVars.hashDevice)
                    ? `File ${data.location[0]} saved to disk on local device.`
                    : `File ${data.location[0]} saved to disk on ${type} ${agent}.`;
                if (erw !== null) {
                    error([erw.toString()]);
                    vars.ws.broadcast(JSON.stringify({
                        error: erw
                    }));
                    message = `Error writing file: ${erw.toString()}`;
                }
                response(serverResponse, "text/plain", message);
            });
        };
    if (rootIndex > -1) {
        data.location[rootIndex] = vars.sep;
    }
    if (remoteUsers[0] !== "") {
        remoteUserRemoteDevice();
    } else if (localDevice === false && (data.action === "fs-base64" || data.action === "fs-destroy" || data.action === "fs-details" || data.action === "fs-hash" || data.action === "fs-new" || data.action === "fs-read" || data.action === "fs-rename" || data.action === "fs-search" || data.action === "fs-write")) {
        remoteUserRead();
    } else if (data.action === "fs-directory" || data.action === "fs-details") {
        if (localDevice === true || (localDevice === false && typeof data.remoteWatch === "string" && data.remoteWatch.length > 0)) {
            readDirectory();
        } else {
            remoteWatch();
        }
    } else if (data.action === "fs-close") {
        close();
    } else if (data.action === "fs-copy" || data.action === "fs-cut") {
        copyService();
    } else if (data.action === "fs-copy-list-remote" || data.action === "fs-cut-list-remote") {
        // issue a fs-copy-list on an agent from a different agent
        copyListRemote();
    } else if (data.action === "fs-copy-file" || data.action === "fs-cut-file") {
        // respond with a single file
        // * generated internally from function requestFiles
        // * fs-copy-list and fs-cut-list (copy from remote to local device)
        // * fs-copy-request and fs-cut-request (copy from local device to remote)
        copyFile();
    } else if (data.action === "fs-copy-list" || data.action === "fs-cut-list") {
        copyListLocal();
    } else if (data.action === "fs-copy-request" || data.action === "fs-cut-request") {
        copyRequest();
    } else if (data.action === "fs-copy-self" || data.action === "fs-cut-self") {
        vars.testLogger("fileService", "fs-copy-self", "Copies files from one location to another on the same local device as requested by a remote agent.");
        copySameAgent(serverResponse, data);
    } else if (data.action === "fs-cut-remove") {
        cutRemote();
    } else if (data.action === "fs-destroy") {
        destroy();
    } else if (data.action === "fs-rename") {
        rename();
    } else if (data.action === "fs-base64" || data.action === "fs-hash" || data.action === "fs-read") {
        read();
    } else if (data.action === "fs-new") {
        newArtifact();
    } else if (data.action === "fs-search") {
        search();
    } else if (data.action === "fs-write") {
        write();
    }
};

export default fileService;