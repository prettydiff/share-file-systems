/* lib/terminal/fileService/serviceFile - Manages various file system services. */

import { exec } from "child_process";
import { readFile, rename, stat, writeFile } from "fs";

import base64 from "../commands/base64.js";
import common from "../../common/common.js";
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import hash from "../commands/hash.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import sender from "../server/transmission/sender.js";
import serverVars from "../server/serverVars.js";
import serviceCopy from "./serviceCopy.js";
import vars from "../utilities/vars.js";

/**
 * Methods for managing file system actions other than copy/cut across a network and the security model.
 * * **actions.changeName** - The service handler to rename a file system artifact.
 * * **actions.destroy** - Service handler to remove a file system artifact.
 * * **actions.directory** - A service handler to read directory information, such as navigating a file system in the browser.
 * * **actions.execute** - Tells the operating system to execute the given file system artifact using the default application for the resolved file type.
 * * **actions.newArtifact** - Creates new empty directories or files.
 * * **actions.read** - Opens a file and responds with the file contents as a UTF8 string.
 * * **actions.write** - Writes a string to a file.
 * * **menu** - Resolves actions from *service_fileSystem* to methods in this object's action property.
 * * **route[error]** - Provides a callback to sender.route so that error messaging is broadcast to browsers of the requesting device.
 * * **route[file-system]** - Directs access to the appropriate method of the actions object on the agentSource of a file system message.
 * * **route[file-system-status]** - Broadcasts file system data to the browsers of a requesting device.
 * * **statusMessage** - Formulates a status message to display in the modal status bar of a File Navigate type modal for distribution using the *statusBroadcast* method.
 *
 * ```typescript
 * interface module_fileSystem {
 *     actions: {
 *         changeName: (data:service_fileSystem) => void;
 *         destroy: (data:service_fileSystem) => void;
 *         directory: (data:service_fileSystem) => void;
 *         execute: (data:service_fileSystem) => void;
 *         newArtifact: (data:service_fileSystem) => void;
 *         read: (data:service_fileSystem) => void;
 *         write: (data:service_fileSystem) => void;
 *     };
 *     menu: (data:service_fileSystem) => void;
 *     route: {
 *         browser: (socketData:socketData) => void;
 *         menu: (socketData:socketData) => void;
 *         "file-system-status": (socketData:socketData) => void;
 *     };
 *     statusMessage: (data:service_fileSystem, dirs:directoryResponse) => void;
 * }
 * ``` */
const serviceFile:module_fileSystem = {
    actions: {
        changeName: function terminal_fileService_serviceFile_rename(data:service_fileSystem):void {
            const newPath:string[] = data.location[0].split(vars.sep);
            newPath.pop();
            newPath.push(data.name);
            rename(data.location[0], newPath.join(vars.sep), function terminal_fileService_serviceFile_rename_callback(erRename:NodeJS.ErrnoException):void {
                if (erRename === null) {
                    serviceFile.statusMessage(data, null);
                } else {
                    error([erRename.toString()]);
                    serviceFile.route.browser({
                        data: Object.assign({
                            agent: data.agentRequest
                        }, erRename),
                        service: "error"
                    });
                }
            });
        },
        destroy: function terminal_fileService_serviceFile_destroy(data:service_fileSystem):void {
            let count:number = 0;
            data.location.forEach(function terminal_fileService_serviceFile_destroy_each(value:string):void {
                remove(value, function terminal_fileService_serviceFile_destroy_each_remove():void {
                    count = count + 1;
                    if (count === data.location.length) {
                        serviceFile.statusMessage(data, null);
                    }
                });
            });
        },
        directory: function terminal_fileService_serviceFile_directory(data:service_fileSystem):void {
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
                        serviceFile.route.browser({
                            data: {
                                agentRequest: data.agentRequest,
                                dirs: result,
                                id: data.name
                            },
                            service: "file-system-details"
                        });
                    } else {
                        if (result === undefined) {
                            result = "missing";
                        }
                        serviceFile.statusMessage(data, result);
                    }
                },
                callback = function terminal_fileService_serviceFile_directory_callback(dirs:directoryList|string[], searchType:searchType):void {
                    const result:directoryList = dirs as directoryList;
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
                        if (data.action === "fs-search") {
                            const searchAction:string = (searchType === "fragment")
                                    ? "Search fragment"
                                    : (searchType === "negation")
                                        ? "Search negation"
                                        : "Regular expression",
                                resultLength:number = result.length,
                                plural:string = (result.length === 1)
                                    ? ""
                                    : "es";
                            data.name = `${searchAction} "<em>${data.name}</em>" returned <strong>${common.commas(resultLength)}</strong> match${plural} from <em>${data.location[0]}</em>.`;
                        }
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
                    stat(value, function terminal_fileService_serviceFile_directory_pathEach_stat(erp:Error):void {
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
        execute: function terminal_fileService_serviceFile_execute(data:service_fileSystem):void {
            const execution = function terminal_fileService_serviceFile_execute_execution(path:string):void {
                    exec(`${serverVars.executionKeyword} "${path}"`, {cwd: vars.cwd}, function terminal_fileService_serviceFile_execute_child(errs:Error, stdout:string, stdError:Buffer | string):void {
                        if (errs !== null && errs.message.indexOf("Access is denied.") < 0) {
                            error([errs.toString()]);
                            return;
                        }
                        if (stdError !== "" && stdError.indexOf("Access is denied.") < 0) {
                            error([stdError.toString()]);
                            return;
                        }
                    });
                },
                sendStatus = function terminal_fileService_serviceFile_execute_sendStatus(messageString:string):void {
                    const status:service_fileSystem_status = {
                        agentRequest: data.agentRequest,
                        agentTarget: data.agentRequest,
                        fileList: null,
                        message: messageString
                    };
                    serviceFile.route.browser({
                        data: status,
                        service: "file-system-status"
                    });
                };
            if (data.agentRequest.user === serverVars.hashUser && data.agentRequest.device === serverVars.hashDevice) {
                // file on local device - execute without a file copy request
                execution(data.location[0]);
                sendStatus(`Opened file location ${data.location[0]}`);
            } else {
                // file on different agent - request file copy before execution
                const copyPayload:service_copy = {
                        agentRequest: data.agentRequest,
                        agentSource: data.agentSource,
                        agentWrite: data.agentRequest,
                        cut: false,
                        execute: true,
                        location: [data.location[0]]
                    },
                    status:service_fileSystem_status = {
                        agentRequest: data.agentRequest,
                        agentTarget: data.agentRequest,
                        fileList: null,
                        message: `Generating integrity hash for file copy to execute ${data.location[0]}`
                    };
                serviceFile.route.browser({
                    data: status,
                    service: "file-system-status"
                });
                serviceCopy.route.copy({
                    data: copyPayload,
                    service: "copy"
                });
            }
        },
        newArtifact: function terminal_fileService_serviceFile_newArtifact(data:service_fileSystem):void {
            if (data.name === "directory") {
                mkdir(data.location[0], function terminal_fileService_serviceFile_newArtifact_directory():void {
                    serviceFile.statusMessage(data, null);
                });
            } else if (data.name === "file") {
                writeFile(data.location[0], "", "utf8", function terminal_fileService_serviceFile_newArtifact_file(erNewFile:NodeJS.ErrnoException):void {
                    if (erNewFile === null) {
                        serviceFile.statusMessage(data, null);
                    } else {
                        error([erNewFile.toString()]);
                        serviceFile.route.browser({
                            data: Object.assign({
                                agent: data.agentRequest
                            }, erNewFile),
                            service: "error"
                        });
                    }
                });
            } else {
                serviceFile.route.browser({
                    data: Object.assign({
                        agent: data.agentRequest
                    }, new Error(`unsupported type ${data.name}`)),
                    service: "error"
                });
            }
        },
        read: function terminal_fileService_serviceFile_read(data:service_fileSystem):void {
            const length:number = data.location.length,
                type:string = (data.action === "fs-read")
                    ? "base64"
                    : data.action.replace("fs-", ""),
                stringData:service_fileSystem_string = {
                    agentRequest: data.agentRequest,
                    files: [],
                    type: type as fileSystemReadType
                },
                // this callback provides identical instructions for base64 and hash operations, but the output types differ in a single property
                callback = function terminal_fileService_serviceFile_read_callback(output:base64Output|hashOutput):void {
                    const out:base64Output = output as base64Output,
                        file:fileRead = {
                            content: out[type as "base64"],
                            id: output.id,
                            path: output.filePath
                        };
                    b = b + 1;
                    stringData.files.push(file);
                    if (b === length) {
                        serviceFile.route.browser({
                            data: stringData,
                            service: "file-system-string"
                        });
                    }
                },
                fileReader = function terminal_fileService_serviceFile_read_fileReader(fileInput:base64Input):void {
                    readFile(fileInput.source, "utf8", function terminal_fileService_serviceFile_read_fileReader_readFile(readError:NodeJS.ErrnoException, fileData:string) {
                        const inputConfig:base64Output = {
                            base64: fileData,
                            id: fileInput.id,
                            filePath: fileInput.source
                        };
                        if (readError !== null) {
                            error([readError.toString()]);
                            serviceFile.route.browser({
                                data: Object.assign({
                                    agent: data.agentRequest
                                }, readError),
                                service: "error"
                            });
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
        write: function terminal_fileService_serviceFile_write(data:service_fileSystem):void {
            writeFile(data.location[0], data.name, "utf8", function terminal_fileService_serviceFile_write_callback(erw:Error):void {
                const dirs:string[] = data.location[0].split(vars.sep);
                dirs.pop();
                data.agentSource.modalAddress = dirs.join(vars.sep);
                if (erw !== null) {
                    serviceFile.route.browser({
                        data: Object.assign({
                            agent: data.agentRequest
                        }, erw),
                        service: "error"
                    });
                } else if (serverVars.testType === "service") {
                    const stringData:service_fileSystem_string = {
                        agentRequest: data.agentRequest,
                        files: [{
                            content: "Saved to disk!",
                            id: data.name,
                            path: data.location[0]
                        }],
                        type: "read"
                    };
                    serviceFile.route.browser({
                        data: [stringData],
                        service: "file-system-string"
                    });
                }
            });
        }
    },
    menu: function terminal_fileService_serviceFile_menu(data:service_fileSystem):void {
        let methodName:"changeName"|"destroy"|"directory"|"execute"|"newArtifact"|"read"|"write" = null;
        if (data.action === "fs-base64" || data.action === "fs-hash" || data.action === "fs-read") {
            methodName = "read";
        } else if (data.action === "fs-destroy") {
            methodName = "destroy";
        } else if (data.action === "fs-details" || data.action === "fs-directory" || data.action === "fs-search") {
            methodName = "directory";
        } else if (data.action === "fs-execute") {
            methodName = "execute";
        } else if (data.action === "fs-new") {
            methodName = "newArtifact";
        } else if (data.action === "fs-rename") {
            methodName = "changeName";
        } else if (data.action === "fs-write") {
            methodName = "write";
        }
        if (methodName !== null) {
            serviceFile.actions[methodName](data);
        }
    },
    route: {
        "browser": function terminal_fileService_serviceFile_routeError(socketData:socketData):void {
            sender.route(socketData, function terminal_fileService_serviceFile_routeFileSystemStatus_broadcast():void {
                sender.broadcast(socketData, "browser");
            });
        },
        "menu": function terminal_fileService_serviceFile_routeFileSystem(socketData:socketData):void {
            sender.route(socketData, function terminal_fileService_serviceFile_routeFileSystem_menu():void {
                serviceFile.menu(socketData.data as service_fileSystem);
            });
        }
    },
    statusMessage: function terminal_fileService_serviceFile_statusMessage(data:service_fileSystem, dirs:directoryResponse):void {
        const callback = function terminal_fileService_serviceFile_statusMessage_callback(list:directoryResponse):void {
            const count:[number, number, number, number] = (function terminal_fileService_serviceFile_statusMessage_callback_count():[number, number, number, number] {
                    let a:number = (typeof list === "string")
                            ? -1
                            : list.length;
                    const counts:[number, number, number, number] = [0, 0, 0, 0],
                        end:number = (data.action === "fs-search")
                            ? 0
                            : 1;
                    if (typeof list === "string") {
                        return counts;
                    }
                    if (a > 0 && (data.action !== "fs-search" || (data.action === "fs-search" && list.length > 0))) {
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
                        } while (a > end);
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
                    if (data.action === "fs-search") {
                        return data.name;
                    }
                    if (dirs === "missing" || dirs === "noShare" || dirs === "readOnly") {
                        return "";
                    }
                    if (data.action === "fs-destroy") {
                        return `Destroyed ${data.location.length} file system ${plural("item", data.location.length)}`;
                    }
                    if (data.action === "fs-rename") {
                        return `Renamed ${data.name} from ${data.location[0]}`;
                    }
                    return (data.agentSource.modalAddress === "\\")
                        ? `${count[0]} ${plural("drive", list.length)}`
                        : `${count[0]} ${plural("directory", count[0])}, ${count[1]} ${plural("file", count[1])}, ${count[2]} ${plural("symbolic link", count[2])}, ${count[3]} ${plural("error", count[3])}`;
                }()),
                status:service_fileSystem_status = {
                    agentRequest: data.agentRequest,
                    agentTarget: data.agentSource,
                    fileList: list,
                    message: (data.name === "expand")
                        ? `expand-${data.location[0]}`
                        : message
                };
            serviceFile.route.browser({
                data: status,
                service: "file-system-status"
            });
        };
        if (dirs === null) {
            const dirConfig:readDirectory = {
                callback: function terminal_fileService_serviceFile_statusMessage_dirCallback(list:directoryList|string[]):void {
                    const dirs:directoryList = list as directoryList;
                    callback(dirs);
                },
                depth: 2,
                exclusions: [],
                mode: "read",
                path: data.agentSource.modalAddress,
                symbolic: true
            };
            directory(dirConfig);
        } else {
            callback(dirs);
        }
    }
};

export default serviceFile;