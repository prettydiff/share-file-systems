/* lib/terminal/fileService/serviceFile - Manages various file system services. */

import { ServerResponse } from "http";

import base64 from "../commands/base64.js";
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import fileResponseType from "./fileResponseType.js";
import hash from "../commands/hash.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

const serviceFile:systemServiceFile = {
    actions: {
        close: function terminal_fileService_serviceFile_close(serverResponse:ServerResponse, data:systemDataFile):void {
            if (serverVars.watches[data.location[0]] !== undefined) {
                serverVars.watches[data.location[0]].close();
                delete serverVars.watches[data.location[0]];
            }
            serviceFile.statusMessage(serverResponse, data, null);
        },
        destroy: function terminal_fileService_serviceFile_destroy(serverResponse:ServerResponse, data:systemDataFile):void {
            let count:number = 0;
            data.location.forEach(function terminal_fileService_serviceFile_destroy_each(value:string):void {
                if (serverVars.watches[value] !== undefined) {
                    serverVars.watches[value].close();
                    delete serverVars.watches[value];
                }
                remove(value, function terminal_fileService_serviceFile_destroy_each_remove():void {
                    count = count + 1;
                    if (count === data.location.length) {
                        serviceFile.statusMessage(serverResponse, data, null);
                    }
                });
            });
        },
        directory: function terminal_fileService_serviceFile_directory(serverResponse:ServerResponse, data:systemDataFile):void {
            let count:number = 0,
                output:directoryList = [],
                failures:string[] = [],
                store:directoryResponse;
            const rootIndex:number = data.location.indexOf("**root**"),
                pathList:string[] = (data.action === "fs-search")
                    ? [data.location[0]]
                    : data.location,
                pathLength:number = pathList.length,
                complete = function terminal_fileService_serviceFile_directory_complete(result:directoryResponse):void {
                    if (data.action === "fs-details") {
                        serviceFile.respond.details(serverResponse, {
                            dirs: result,
                            id: data.name
                        });
                    } else {
                        if (result === undefined) {
                            result = "missing";
                        }
                        serviceFile.statusMessage(serverResponse, data, result);
                    }
                },
                callback = function terminal_fileService_serviceFile_directory_callback(result:directoryList):void {
                    count = count + 1;
                    store = result;
                    if (result.length > 0) {
                        failures = failures.concat(result.failures);
                        output = output.concat(result);
                    }
                    if (serverVars.testType === "service") {
                        result.forEach(function terminal_fileService_serviceFile_directory_callback_each(item:directoryItem):void {
                            item[5] = null;
                        });
                    }
                    if (count === pathLength) {
                        complete(result);
                    }
                },
                dirConfig:readDirectory = {
                    callback: callback,
                    depth: data.depth,
                    exclusions: [],
                    mode: (data.action === "fs-search")
                        ? "search"
                        : "read",
                    path: "",
                    search: data.name,
                    symbolic: true
                };
            if (rootIndex > -1) {
                data.location[rootIndex] = vars.sep;
            }
            pathList.forEach(function terminal_fileService_serviceFile_directory_pathEach(value:string):void {
                const pathRead = function terminal_fileService_serviceFile_directory_pathEach_pathRead():void {
                    if ((/^\w:$/).test(value) === true) {
                        value = value + "\\";
                    }
                    dirConfig.path = value;
                    directory(dirConfig);
                };
                if (value === "\\" || value === "\\\\") {
                    pathRead();
                } else {
                    vars.node.fs.stat(value, function terminal_fileService_serviceFile_directory_pathEach_stat(erp:nodeError):void {
                        if (erp === null) {
                            pathRead();
                        } else {
                            failures.push(value);
                            if (failures.length === data.location.length) {
                                complete(store);
                            }
                        }
                    });
                }
            });
        },
        newArtifact: function terminal_fileService_serviceFile_newArtifact(serverResponse:ServerResponse, data:systemDataFile):void {
            if (data.name === "directory") {
                mkdir(data.location[0], function terminal_fileService_serviceFile_newArtifact_directory():void {
                    serviceFile.statusMessage(serverResponse, data, null);
                });
            } else if (data.name === "file") {
                vars.node.fs.writeFile(data.location[0], "", "utf8", function terminal_fileService_serviceFile_newArtifact_file(erNewFile:Error):void {
                    if (erNewFile === null) {
                        serviceFile.statusMessage(serverResponse, data, null);
                    } else {
                        error([erNewFile.toString()]);
                        serviceFile.respond.error(serverResponse, erNewFile.toString());
                    }
                });
            } else {
                serviceFile.respond.error(serverResponse, `unsupported type ${data.name}`);
            }
        },
        read: function terminal_fileService_serviceFile_read(serverResponse:ServerResponse, data:systemDataFile):void {
            const length:number = data.location.length,
                storage:stringDataList = [],
                type:string = (data.action === "fs-read")
                    ? "base64"
                    : data.action.replace("fs-", ""),
                callback = function terminal_fileService_serviceFile_read_callback(output:base64Output):void {
                    const stringData:stringData = {
                        content: output[type],
                        id: output.id,
                        path: output.filePath
                    };
                    b = b + 1;
                    storage.push(stringData);
                    if (b === length) {
                        serviceFile.respond.read(serverResponse, storage);
                    }
                },
                fileReader = function terminal_fileService_serviceFile_read_fileReader(fileInput:base64Input):void {
                    vars.node.fs.readFile(fileInput.source, "utf8", function terminal_fileService_serviceFile_read_fileReader_readFile(readError:nodeError, fileData:string) {
                        const inputConfig:base64Output = {
                            base64: fileData,
                            id: fileInput.id,
                            filePath: fileInput.source
                        };
                        if (readError !== null) {
                            error([readError.toString()]);
                            vars.broadcast("error", readError.toString());
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
        rename: function terminal_fileService_serviceFile_rename(serverResponse:ServerResponse, data:systemDataFile):void {
            const newPath:string[] = data.location[0].split(vars.sep);
            newPath.pop();
            newPath.push(data.name);
            vars.node.fs.rename(data.location[0], newPath.join(vars.sep), function terminal_fileService_serviceFile_rename_callback(erRename:Error):void {
                if (erRename === null) {
                    serviceFile.statusMessage(serverResponse, data, null);
                } else {
                    error([erRename.toString()]);
                    serviceFile.respond.error(serverResponse, erRename.toString());
                }
            });
        },
        write: function terminal_fileService_serviceFile_write(serverResponse:ServerResponse, data:systemDataFile):void {
            vars.node.fs.writeFile(data.location[0], data.name, "utf8", function terminal_fileService_serviceFile_write_callback(erw:nodeError):void {
               if (erw === null) {
                    serviceFile.respond.write(serverResponse);
                } else {
                    serviceFile.respond.error(serverResponse, erw.toString());
                }
            });
        }
    },
    menu: function terminal_fileService_serviceFile_menu(serverResponse:ServerResponse, data:systemDataFile):void {
        if (data.action === "fs-base64" || data.action === "fs-hash" || data.action === "fs-read") {
            serviceFile.actions.read(serverResponse, data);
        } else if (data.action === "fs-close") {
            serviceFile.actions.close(serverResponse, data);
        } else if (data.action === "fs-destroy") {
            serviceFile.actions.destroy(serverResponse, data);
        } else if (data.action === "fs-details" || data.action === "fs-directory" || data.action === "fs-search") {
            serviceFile.actions.directory(serverResponse, data);
        } else if (data.action === "fs-new") {
            serviceFile.actions.newArtifact(serverResponse, data);
        } else if (data.action === "fs-rename") {
            serviceFile.actions.rename(serverResponse, data);
        } else if (data.action === "fs-write") {
            serviceFile.actions.write(serverResponse, data);
        }
    },
    respond: {
        details: function terminal_fileService_serviceFile_respondDetails(serverResponse:ServerResponse, details:fsDetails):void {
            response({
                message: JSON.stringify(details),
                mimeType: "application/json",
                responseType: "fs",
                serverResponse: serverResponse
            });
        },
        error: function terminal_fileService_serviceFile_respondError(serverResponse:ServerResponse, message:string):void {
            response({
                message: message,
                mimeType: "text/plain",
                responseType: "error",
                serverResponse: serverResponse
            });
        },
        read: function terminal_fileService_serviceFile_respondRead(serverResponse:ServerResponse, list:stringDataList):void {
            response({
                message: JSON.stringify(list),
                mimeType: "application/json",
                responseType: "fs",
                serverResponse: serverResponse
            });
        },
        status: function terminal_fileService_serviceFile_respondStatus(serverResponse:ServerResponse, status:fileStatusMessage, type:requestType):void {
            response({
                message: JSON.stringify(status),
                mimeType: "application/json",
                responseType: type,
                serverResponse: serverResponse
            });
        },
        write: function terminal_fileService_serviceFile_respondWrite(serverResponse:ServerResponse):void {
            response({
                message: "Saved to disk!",
                mimeType: "text/plain",
                responseType: "fs",
                serverResponse: serverResponse
            });
        }
    },
    statusMessage: function terminal_fileService_serviceFile_statusMessage(serverResponse:ServerResponse, data:systemDataFile, dirs:directoryResponse):void {
        const callback = function terminal_fileService_serviceFile_statusMessage_callback(list:directoryResponse) {
            const count:[number, number, number, number] = (function terminal_fileService_serviceFile_statusMessage_callback_count():[number, number, number, number] {
                    let a:number = (typeof list === "string")
                        ? 0
                        : list.length;
                    const counts:[number, number, number, number] = [0, 0, 0, 0];
                    if (a > 1) {
                        do {
                            a = a - 1;
                            if (list[a][3] === 0) {
                                if (list[a][1] === "directory") {
                                    counts[0] = counts[0] + 1;
                                } else if (list[a][1] === "file") {
                                    counts[1] = counts[1] + 1;
                                } else if (list[a][1] === "link") {
                                    counts[2] = counts[2] + 1;
                                } else {
                                    counts[3] = counts[3] + 1;
                                }
                            }
                        } while (a > 1);
                    }
                    return counts;
                }()),
                plural = function terminal_fileService_serviceFile_statusMessage_callback_plural(input:string, quantity:number):string {
                    if (quantity === 1) {
                        return input;
                    }
                    if (input === "directory") {
                        return "directories";
                    }
                    return `${input}s`;
                },
                message:string = (function terminal_fileService_serviceFile_statusMessage_callback_message():string {
                    if (data.action === "fs-destroy") {
                        return `Destroyed ${data.location.length} file system ${plural("item", data.location.length)}`;
                    }
                    if (data.action === "fs-rename") {
                        return `Renamed ${data.name} from ${data.location[0]}`;
                    }
                    return (data.modalAddress === "\\")
                        ? `${count[0]} ${plural("drive", list.length)}`
                        : `${count[0]} ${plural("directory", count[0])}, ${count[1]} ${plural("file", count[1])}, ${count[2]} ${plural("symbolic link", count[2])}, ${count[3]} ${plural("error", count[3])}`;
                }()),
                status:fileStatusMessage = {
                    address: data.modalAddress,
                    agent: data.agent,
                    agentType: data.agentType,
                    fileList: list,
                    message: message
                };
            if (serverResponse === null) {
                vars.broadcast("file-list-status", JSON.stringify(status));
            } else {
                fileResponseType(serverResponse, data, status);
            }
        };
        if (dirs === null) {
            const dirConfig:readDirectory = {
                callback: function terminal_fileService_serviceFile_statusMessage_dirCallback(list:directoryList):void {
                    callback(list);
                },
                depth: 2,
                exclusions: [],
                mode: "read",
                path: data.modalAddress,
                symbolic: true
            };
            directory(dirConfig);
        } else {
            callback(dirs);
        }
    }
};

export default serviceFile;