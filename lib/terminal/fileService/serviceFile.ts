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
import responder from "../server/transmission/responder.js";
import sender from "../server/transmission/sender.js";
import serverVars from "../server/serverVars.js";
import transmit_ws from "../server/transmission/transmit_ws.js";
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
 * * **statusBroadcast** - Packages a status message from all file system operations, including file copy, for broadcast to listening browsers on the local device.
 * * **statusMessage** - Formulates a status message to display in the modal status bar of a File Navigate type modal for distribution using the *statusBroadcast* method.
 *
 * ```typescript
 * interface module_systemServiceFile {
 *     actions: {
 *         changeName: (data:service_fileSystem, transmit:transmit) => void;
 *         destroy: (data:service_fileSystem, transmit:transmit) => void;
 *         directory: (data:service_fileSystem, transmit:transmit) => void;
 *         execute: (data:service_fileSystem, transmit:transmit) => void;
 *         newArtifact: (data:service_fileSystem, transmit:transmit) => void;
 *         read: (data:service_fileSystem, transmit:transmit) => void;
 *         write: (data:service_fileSystem, transmit:transmit) => void;
 *     };
 *     menu: (data:service_fileSystem, transmit:transmit) => void;
 *     statusBroadcast: (data:service_fileSystem, status:service_fileStatus) => void;
 *     statusMessage: (data:service_fileSystem, transmit:transmit, dirs:directoryResponse) => void;
 * }
 * ``` */
const serviceFile:module_systemServiceFile = {
    actions: {
        changeName: function terminal_fileService_serviceFile_rename(data:service_fileSystem, transmit:transmit):void {
            const newPath:string[] = data.location[0].split(vars.sep);
            newPath.pop();
            newPath.push(data.name);
            rename(data.location[0], newPath.join(vars.sep), function terminal_fileService_serviceFile_rename_callback(erRename:NodeJS.ErrnoException):void {
                if (erRename === null) {
                    serviceFile.statusMessage(data, transmit, null);
                } else {
                    error([erRename.toString()]);
                    responder({
                        data: erRename,
                        service: "error"
                    }, transmit);
                }
            });
        },
        destroy: function terminal_fileService_serviceFile_destroy(data:service_fileSystem, transmit:transmit):void {
            let count:number = 0;
            data.location.forEach(function terminal_fileService_serviceFile_destroy_each(value:string):void {
                remove(value, function terminal_fileService_serviceFile_destroy_each_remove():void {
                    count = count + 1;
                    if (count === data.location.length) {
                        serviceFile.statusMessage(data, transmit, null);
                    }
                });
            });
        },
        directory: function terminal_fileService_serviceFile_directory(data:service_fileSystem, transmit:transmit):void {
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
                        responder({
                            data: {
                                dirs: result,
                                id: data.name
                            },
                            service: "file-system-details"
                        }, transmit);
                    } else {
                        if (result === undefined) {
                            result = "missing";
                        }
                        serviceFile.statusMessage(data, transmit, result);
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
        execute: function terminal_fileService_serviceFile_execute(data:service_fileSystem, transmit:transmit):void {
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
                    const device:boolean = (data.agentRequest.user === serverVars.hashUser),
                        status:service_fileStatus = {
                            address: data.agentRequest.modalAddress,
                            agent: (device === true)
                                ? data.agentRequest.device
                                : data.agentRequest.user,
                            agentType: (device === true)
                                ? "device"
                                : "user",
                            fileList: null,
                            message: messageString
                        };
                    responder({
                        data: status,
                        service: "file-status-device"
                    }, transmit);
                };
            if (data.agentRequest.user === serverVars.hashUser && data.agentRequest.device === serverVars.hashDevice) {
                // file on local device - execute without a file copy request
                execution(data.location[0]);
                sendStatus(`Opened file location ${data.location[0]}`);
            } else {
                // file on different agent - request file copy before execution
                const copyPayload:service_copy = {
                        agentAction: "agentRequest",
                        agentRequest: data.agentRequest,
                        agentSource: data.agentSource,
                        agentWrite: data.agentRequest,
                        cut: false,
                        execute: true,
                        location: [data.location[0]]
                    },
                    agentType:agentType = (data.agentRequest.user === serverVars.hashUser)
                        ? "device"
                        : "user",
                    agent:string = (agentType === "device")
                        ? data.agentRequest.device
                        : data.agentRequest.user,
                    status:service_fileStatus = {
                        address: data.agentRequest.modalAddress,
                        agent: agent,
                        agentType: agentType,
                        fileList: null,
                        message: `Generating integrity hash for file copy to execute ${data.location[0]}`
                    };
                sender.broadcast({
                    data: status,
                    service: "file-status-device"
                }, "browser");
                transmit_ws.send({
                    data: copyPayload,
                    service: "copy"
                }, transmit_ws.clientList[agentType][agent], 1);
            }
        },
        newArtifact: function terminal_fileService_serviceFile_newArtifact(data:service_fileSystem, transmit:transmit):void {
            if (data.name === "directory") {
                mkdir(data.location[0], function terminal_fileService_serviceFile_newArtifact_directory():void {
                    serviceFile.statusMessage(data, transmit, null);
                });
            } else if (data.name === "file") {
                writeFile(data.location[0], "", "utf8", function terminal_fileService_serviceFile_newArtifact_file(erNewFile:NodeJS.ErrnoException):void {
                    if (erNewFile === null) {
                        serviceFile.statusMessage(data, transmit, null);
                    } else {
                        error([erNewFile.toString()]);
                        responder({
                            data: erNewFile,
                            service: "error"
                        }, transmit);
                    }
                });
            } else {
                responder({
                    data: new Error(`unsupported type ${data.name}`),
                    service: "error"
                },
                transmit);
            }
        },
        read: function terminal_fileService_serviceFile_read(data:service_fileSystem, transmit:transmit):void {
            const length:number = data.location.length,
                storage:service_stringGenerate[] = [],
                type:string = (data.action === "fs-read")
                    ? "base64"
                    : data.action.replace("fs-", ""),
                // this callback provides identical instructions for base64 and hash operations, but the output types differ in a single property
                callback = function terminal_fileService_serviceFile_read_callback(output:base64Output|hashOutput):void {
                    const out:base64Output = output as base64Output,
                        stringData:service_stringGenerate = {
                        content: out[type as "base64"],
                        id: output.id,
                        path: output.filePath
                    };
                    b = b + 1;
                    storage.push(stringData);
                    if (b === length) {
                        responder({
                            data: storage,
                            service: "string-generate"
                        }, transmit);
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
                            sender.broadcast({
                                data: readError,
                                service: "error"
                            }, "browser");
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
                const dirs:string[] = data.location[0].split(vars.sep),
                    agentType:agentType = (data.agentRequest.user === data.agentSource.user)
                        ? "device"
                        : "user";
                dirs.pop();
                data.agentSource.modalAddress = dirs.join(vars.sep);
                if (erw !== null) {
                    transmit_ws.send({
                        data: erw,
                        service: "error"
                    }, transmit_ws.clientList[agentType][data.agentRequest[agentType]], 1);
                } else if (serverVars.testType === "service") {
                    transmit_ws.send({
                        data: [{
                            content: "Saved to disk!",
                            id: data.name,
                            path: data.location[0]
                        }],
                        service: "string-generate"
                    }, transmit_ws.clientList[agentType][data.agentRequest[agentType]], 1);
                }
            });
        }
    },
    menu: function terminal_fileService_serviceFile_menu(data:service_fileSystem, transmit:transmit):void {
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
            serviceFile.actions[methodName](data, transmit);
        }
    },
    statusBroadcast: function terminal_fileService_serviceFile_statusBroadcast(data:service_fileSystem, status:service_fileStatus):void {
        const devices:string[] = Object.keys(serverVars.device),
            sendStatus = function terminal_fileService_serviceFile_statusBroadcast_sendStatus(agent:string, type:agentType):void {
                const net:[string, number] = (serverVars[type][agent] === undefined)
                    ? ["", 0]
                    : [
                        serverVars[type][agent].ipSelected,
                        serverVars[type][agent].ports.http
                    ];
                if (net[0] === "") {
                    return;
                }
                transmit_ws.send({
                    data: status,
                    service: "file-status-device"
                }, transmit_ws.clientList[type][agent]);
            };
        let a:number = devices.length;
        do {
            a = a - 1;
            if (devices[a] === serverVars.hashDevice) {
                sender.broadcast({
                    data: status,
                    service: "file-status-device"
                }, "browser");
            } else {
                sendStatus(devices[a], "device");
            }
        } while (a > 0);
        if (data.agentRequest.user !== data.agentSource.user) {
            sendStatus(data.agentRequest.user, "user");
        }
    },
    statusMessage: function terminal_fileService_serviceFile_statusMessage(data:service_fileSystem, transmit:transmit, dirs:directoryResponse):void {
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
                agentType:agentType = (data.agentRequest.user === data.agentSource.user)
                    ? "device"
                    : "user",
                status:service_fileStatus = {
                    address: data.agentSource.modalAddress,
                    agent: data.agentSource[agentType],
                    agentType: agentType,
                    fileList: list,
                    message: message
                };
            if (data.action === "fs-directory" && data.name.indexOf("loadPage:") === 0) {
                status.address = data.name.replace("loadPage:", "");
            }
            responder({
                data: status,
                service: "file-status-device"
            }, transmit);
            if (data.action === "fs-directory" && (data.name === "expand" || data.name === "navigate" || data.name.indexOf("loadPage:") === 0)) {
                return;
            }
            if (data.action === "fs-search") {
                return;
            }
            serviceFile.statusBroadcast(data, status);
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