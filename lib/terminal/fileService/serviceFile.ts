/* lib/terminal/fileService/serviceFile - Manages various file system services. */

import { exec } from "child_process";
import { readFile, rename, stat, writeFile } from "fs";

import agent_ws from "../server/transmission/agent_ws.js";
import base64 from "../commands/base64.js";
import common from "../../common/common.js";
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import hash from "../commands/hash.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import responder from "../server/transmission/responder.js";
import routeCopy from "./routeCopy.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

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
                            service: "fs"
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
                    const status:service_fileStatus = {
                        address: data.agent.modalAddress,
                        agent: data.agent.id,
                        agentType: data.agent.type,
                        fileList: null,
                        message: messageString
                    };
                    responder({
                        data: status,
                        service: "fs"
                    }, transmit);
                };
            if (data.agent.type === "device" && data.agent.id === serverVars.hashDevice) {
                // file on local device - execute without a file copy request
                execution(data.location[0]);
                sendStatus(`Opened file location ${data.location[0]}`);
            } else {
                // file on different agent - request file copy before execution
                const agent:agent = serverVars[data.agent.type][data.agent.id];
                if (agent === undefined) {
                    sendStatus("Requested agent is no longer available");
                } else {
                    const copyPayload:service_copy = {
                            action: "copy-request",
                            agentSource: data.agent,
                            agentWrite: {
                                id: serverVars.hashDevice,
                                modalAddress: serverVars.storage,
                                share: "",
                                type: "device"
                            },
                            cut: false,
                            execute: true,
                            location: [data.location[0]]
                        },
                        status:service_fileStatus = {
                            address: data.agent.modalAddress,
                            agent: data.agent.id,
                            agentType: data.agent.type,
                            fileList: null,
                            message: `Generating integrity hash for file copy to execute ${data.location[0]}`
                        };
                    responder({
                        data: status,
                        service: `file-list-status-${data.agent.type}` as requestType
                    }, transmit);
                    routeCopy({
                        data: copyPayload,
                        service: "copy"
                    }, transmit);
                }
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
                            service: "fs"
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
                            agent_ws.broadcast({
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
        write: function terminal_fileService_serviceFile_write(data:service_fileSystem, transmit:transmit):void {
            writeFile(data.location[0], data.name, "utf8", function terminal_fileService_serviceFile_write_callback(erw:Error):void {
                const dirs:string[] = data.location[0].split(vars.sep);
                dirs.pop();
                data.agent.modalAddress = dirs.join(vars.sep);
                if (erw !== null) {
                    responder({
                        data: erw,
                        service: "error"
                    }, transmit);
                } else if (serverVars.testType === "service") {
                    responder({
                        data: [{
                            content: "Saved to disk!",
                            id: data.name,
                            path: data.location[0]
                        }],
                        service: "fs"
                    }, transmit);
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
                agent_ws.send({
                    data: status,
                    service: "fs"
                }, agent_ws.clientList[type][agent]);
            };
        let a:number = devices.length;
        do {
            a = a - 1;
            if (devices[a] === serverVars.hashDevice) {
                agent_ws.broadcast({
                    data: status,
                    service: "file-list-status-device"
                }, "browser");
            } else {
                sendStatus(devices[a], "device");
            }
        } while (a > 0);
        if (data.agent.type === "user") {
            sendStatus(data.agent.id, "user");
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
                    return (data.agent.modalAddress === "\\")
                        ? `${count[0]} ${plural("drive", list.length)}`
                        : `${count[0]} ${plural("directory", count[0])}, ${count[1]} ${plural("file", count[1])}, ${count[2]} ${plural("symbolic link", count[2])}, ${count[3]} ${plural("error", count[3])}`;
                }()),
                status:service_fileStatus = {
                    address: data.agent.modalAddress,
                    agent: data.agent.id,
                    agentType: data.agent.type,
                    fileList: list,
                    message: message
                };
            if (data.action === "fs-directory" && data.name.indexOf("loadPage:") === 0) {
                status.address = data.name.replace("loadPage:", "");
            }
            responder({
                data: status,
                service: "fs"
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
                path: data.agent.modalAddress,
                symbolic: true
            };
            directory(dirConfig);
        } else {
            callback(dirs);
        }
    }
};

export default serviceFile;