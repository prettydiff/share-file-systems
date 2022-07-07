/* lib/terminal/server/services/fileSystem - Manages various file system services. */

import { readFile, rename, stat, writeFile } from "fs";

import base64 from "../../commands/library/base64.js";
import common from "../../../common/common.js";
import directory from "../../commands/directory.js";
import error from "../../utilities/error.js";
import fileCopy from "./fileCopy.js";
import fileExecution from "./fileExecution.js";
import hash from "../../commands/library/hash.js";
import mkdir from "../../commands/mkdir.js";
import remove from "../../commands/remove.js";
import sender from "../transmission/sender.js";
import vars from "../../utilities/vars.js";
import service from "../../test/application/service.js";

/**
 * Methods for managing file system actions other than copy/cut across a network and the security model.
 * ```typescript
 * interface module_fileSystem {
 *     actions: {
 *         destroy    : (data:service_fileSystem) => void; // Service handler to remove a file system artifact.
 *         directory  : (data:service_fileSystem) => void; // A service handler to read directory information, such as navigating a file system in the browser.
 *         error      : (error:NodeJS.ErrnoException, agentRequest:fileAgent, agentSource:fileAgent) => void; // packages error messaging for transport
 *         execute    : (data:service_fileSystem) => void; // Tells the operating system to execute the given file system artifact using the default application for the resolved file type.
 *         newArtifact: (data:service_fileSystem) => void; // Creates new empty directories or files.
 *         read       : (data:service_fileSystem) => void; // Opens a file and responds with the file contents as a UTF8 string.
 *         rename     : (data:service_fileSystem) => void; // Service handler to rename a file system artifact.
 *         write      : (data:service_fileSystem) => void; // Writes a string to a file.
 *     };
 *     menu: (data:service_fileSystem) => void; // Resolves actions from *service_fileSystem* to methods in this object's action property.
 *     route: (socketData:socketData) => void;  // Sends the data and destination to sender.route method.
 *     status: {
 *         generate : (data:service_fileSystem, dirs:directory_response) => void;              // Formulates a status message to display in the modal status bar of a File Navigate type modal for distribution using the *statusBroadcast* method.
 *         specified: (message:string, agentRequest:fileAgent, agentSource:fileAgent) => void; // Specifies an exact string to send to the File Navigate modal status bar.
 *     };
 * }
 * ``` */
const fileSystem:module_fileSystem = {
    actions: {
        destroy: function terminal_server_services_fileSystem_destroy(data:service_fileSystem):void {
            let count:number = data.location.length;
            const callback = function terminal_server_services_fileSystem_destroy_callback():void {
                count = count - 1;
                if (count > -1) {
                    remove(data.location[count], [], terminal_server_services_fileSystem_destroy_callback);
                } else {
                    fileSystem.status.generate(data, null);
                }
            };
            callback();
        },
        directory: function terminal_server_services_fileSystem_directory(data:service_fileSystem):void {
            let count:number = 0,
                output:directory_list = [],
                failures:string[] = [],
                store:directory_response;
            const rootIndex:number = data.location.indexOf("**root**"),
                pathList:string[] = (data.action === "fs-search")
                    ? [data.location[0]]
                    : data.location,
                pathLength:number = pathList.length,
                complete = function terminal_server_services_fileSystem_directory_complete(result:directory_response):void {
                    if (data.action === "fs-details") {
                        fileSystem.route({
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
                        fileSystem.status.generate(data, result);
                    }
                },
                callback = function terminal_server_services_fileSystem_directory_callback(dirs:directory_list|string[], searchType:searchType):void {
                    const result:directory_list = dirs as directory_list;
                    count = count + 1;
                    store = result;
                    if (result.length > 0) {
                        failures = failures.concat(result.failures);
                        output = output.concat(result);
                    }
                    if (vars.test.type === "service") {
                        result.forEach(function terminal_server_services_fileSystem_directory_callback_each(item:directory_item):void {
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
                            data.name = `search-${searchAction} "<em>${data.name}</em>" returned <strong>${common.commas(resultLength)}</strong> match${plural} from <em>${data.location[0]}</em>.`;
                        }
                        complete(result);
                    }
                },
                dirConfig:config_command_directory = {
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
                data.location[rootIndex] = vars.path.sep;
            }
            pathList.forEach(function terminal_server_services_fileSystem_directory_pathEach(value:string):void {
                const pathRead = function terminal_server_services_fileSystem_directory_pathEach_pathRead():void {
                    if ((/^\w:$/).test(value) === true) {
                        value = value + "\\";
                    }
                    dirConfig.path = value;
                    directory(dirConfig);
                };
                if (value === "\\" || value === "\\\\") {
                    pathRead();
                } else {
                    stat(value, function terminal_server_services_fileSystem_directory_pathEach_stat(erp:Error):void {
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
        error: function terminal_server_services_fileSystem_routeError(error:NodeJS.ErrnoException, agentRequest:fileAgent, agentSource:fileAgent):void {
            fileSystem.route({
                data: Object.assign({
                    agentRequest: agentRequest,
                    agentSource: agentSource
                }, error),
                service: "error"
            });
        },
        execute: function terminal_server_services_fileSystem_execute(data:service_fileSystem):void {
            if (data.agentRequest.user === vars.settings.hashUser && data.agentRequest.device === vars.settings.hashDevice) {
                // file on local device - execute without a file copy request
                let counter:number = 0;
                const dirList:fileTypeList = [],
                    directoryCallback = function terminal_server_services_fileSystem_execute_directoryCallback(dir:directory_list|string[]):void {
                        if (typeof dir[0][0] === "string") {
                            const dirs:directory_list = dir as directory_list;
                            dirList.push([dirs[0][0], dirs[0][1]]);
                        }
                        counter = counter + 1;
                        if (counter === data.location.length) {
                            fileExecution(dirList, data.agentRequest, data.agentSource);
                        }
                    };
                directory({
                    callback: directoryCallback,
                    depth: 1,
                    exclusions: [],
                    mode: "read",
                    path: "",
                    symbolic: false
                });
            } else {
                // file on different agent - request file copy before execution
                const copyPayload:service_copy = {
                        agentRequest: data.agentRequest,
                        agentSource: data.agentSource,
                        agentWrite: data.agentRequest,
                        cut: false,
                        execute: true,
                        location: data.location
                    };
                fileSystem.status.specified(`Generating integrity hash for file copy to execute ${data.location[0]}`, data.agentRequest, data.agentSource);
                fileCopy.route({
                    data: copyPayload,
                    service: "copy"
                });
            }
        },
        newArtifact: function terminal_server_services_fileSystem_newArtifact(data:service_fileSystem):void {
            if (data.name === "directory") {
                mkdir(data.location[0], function terminal_server_services_fileSystem_newArtifact_directory():void {
                    fileSystem.status.generate(data, null);
                });
            } else if (data.name === "file") {
                writeFile(data.location[0], "", "utf8", function terminal_server_services_fileSystem_newArtifact_file(erNewFile:NodeJS.ErrnoException):void {
                    if (erNewFile === null) {
                        fileSystem.status.generate(data, null);
                    } else {
                        error([erNewFile.toString()]);
                        fileSystem.actions.error(erNewFile, data.agentRequest, data.agentRequest);
                    }
                });
            } else {
                fileSystem.actions.error(new Error(`unsupported type ${data.name}`), data.agentRequest, data.agentRequest);
            }
        },
        read: function terminal_server_services_fileSystem_read(data:service_fileSystem):void {
            const length:number = data.location.length,
                type:string = (data.action === "fs-read")
                    ? "base64"
                    : data.action.replace("fs-", ""),
                stringData:service_fileSystem_string = {
                    agentRequest: data.agentRequest,
                    files: [],
                    type: data.action.replace("fs-", "") as fileSystemReadType
                },
                // this callback provides identical instructions for base64 and hash operations, but the output types differ in a single property
                callback = function terminal_server_services_fileSystem_read_callback(title:string, output:base64Output|hash_output):void {
                    const out:base64Output = output as base64Output,
                        file:fileRead = {
                            content: out[type as "base64"],
                            id: output.id,
                            path: output.filePath
                        };
                    b = b + 1;
                    stringData.files.push(file);
                    if (b === length) {
                        fileSystem.route({
                            data: stringData,
                            service: "file-system-string"
                        });
                    }
                },
                fileReader = function terminal_server_services_fileSystem_read_fileReader(fileInput:config_command_base64):void {
                    readFile(fileInput.source, "utf8", function terminal_server_services_fileSystem_read_fileReader_readFile(readError:NodeJS.ErrnoException, fileData:string) {
                        const inputConfig:base64Output = {
                            base64: fileData,
                            id: fileInput.id,
                            filePath: fileInput.source
                        };
                        if (readError !== null) {
                            error([readError.toString()]);
                            fileSystem.actions.error(readError, data.agentRequest, data.agentRequest);
                            return;
                        }
                        input.callback("", inputConfig);
                    });
                },
                input:config_command_base64 = {
                    callback: callback,
                    direction: "encode",
                    id: "",
                    source: ""
                },
                hashInput:config_command_hash = {
                    algorithm: vars.settings.hashType,
                    callback: callback,
                    digest: "hex",
                    directInput: false,
                    id: "",
                    list: false,
                    parent: null,
                    source: "",
                    stat: null
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
        rename: function terminal_server_services_fileSystem_rename(data:service_fileSystem):void {
            const newPath:string = (function terminal_server_services_fileSystem_rename_newPath():string {
                const tempPath:string[] = data.location[0].split(vars.path.sep);
                tempPath.pop();
                tempPath.push(data.name);
                return tempPath.join(vars.path.sep);
            }());
            stat(newPath, function terminal_server_services_fileSystem_rename_stat(statError:NodeJS.ErrnoException):void {
                if (statError === null) {
                    data.name = `File <em>${newPath}</em> already exists.`;
                    fileSystem.status.generate(data, null);
                } else if (statError.code === "ENOENT") {
                    rename(data.location[0], newPath, function terminal_server_services_fileSystem_rename_callback(erRename:NodeJS.ErrnoException):void {
                        if (erRename === null) {
                            data.name = `Renamed ${data.name} from ${data.location[0]}`;
                            fileSystem.status.generate(data, null);
                        } else {
                            error([erRename.toString()]);
                            fileSystem.actions.error(erRename, data.agentRequest, data.agentRequest);
                        }
                    });
                } else {
                    fileSystem.actions.error(statError, data.agentRequest, data.agentSource);
                }
            });
            
        },
        write: function terminal_server_services_fileSystem_write(data:service_fileSystem):void {
            writeFile(data.location[0], data.name, "utf8", function terminal_server_services_fileSystem_write_callback(erw:Error):void {
                const dirs:string[] = data.location[0].split(vars.path.sep);
                dirs.pop();
                data.agentSource.modalAddress = dirs.join(vars.path.sep);
                if (erw !== null) {
                    fileSystem.actions.error(erw, data.agentRequest, data.agentRequest);
                } else if (vars.test.type === "service") {
                    const stringData:service_fileSystem_string = {
                        agentRequest: data.agentRequest,
                        files: [{
                            content: "Saved to disk!",
                            id: data.name,
                            path: data.location[0]
                        }],
                        type: "read"
                    };
                    fileSystem.route({
                        data: stringData,
                        service: "file-system-string"
                    });
                }
            });
        }
    },
    menu: function terminal_server_services_fileSystem_menu(data:service_fileSystem):void {
        const status:service_fileSystem_status = {
            agentRequest: data.agentRequest,
            agentSource: data.agentSource,
            fileList: null,
            message: `Security violation from file system action <em>${data.action.replace("fs-", "")}</em>.`
        };
        let methodName:"destroy"|"directory"|"execute"|"newArtifact"|"read"|"rename"|"write" = null;
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
            methodName = "rename";
        } else if (data.action === "fs-write") {
            methodName = "write";
        }

        // security, same user
        if (data.agentRequest.user === vars.settings.hashUser) {
            if (vars.settings.device[data.agentRequest.device] !== undefined && methodName !== null) {
                fileSystem.actions[methodName](data);
                return;
            }
        // security, external user
        } else if (vars.settings.user[data.agentRequest.user] !== undefined && methodName !== null) {
            const self:agent = vars.settings.device[vars.settings.hashDevice],
                shares:string[] = Object.keys(self.shares),
                item:string = data.location[0];
            let index:number = shares.length,
                shareIndex:number = null,
                share:agentShare = null;

            // local device must have shares for the external user to access
            if (index > 0) {
                do {
                    index = index - 1;
                    share = self.shares[shares[index]];
                    // item is in most precise share if item begins with share of longest matching share name
                    if (item.indexOf(share.name) === 0 && (shareIndex === null || share.name.length > self.shares[shares[shareIndex]].name.length)) {
                        shareIndex = index;
                    }
                } while (index > 0);
                if (shareIndex !== null) {
                    // share allowing modifications
                    if (self.shares[shareIndex].readOnly === false) {
                        fileSystem.actions[methodName](data);
                        return;
                    }
                    // share restricted to read only operations
                    if (self.shares[shareIndex].readOnly === true && (methodName === "read" || methodName === "directory" || methodName === "execute")) {
                        fileSystem.actions[methodName](data);
                        return;
                    }
                }
            }
        }
        sender.route("agentRequest", {
            data: status,
            service: "file-system-status"
        }, function terminal_server_services_fileSystem_menu_securityStatus(socketData:socketData):void {
            sender.broadcast(socketData, "browser");
        });
    },
    route: function terminal_server_services_fileSystem_route(socketData:socketData):void {
        if (socketData.service === "file-system") {
            if (vars.test.type === "service") {
                fileSystem.menu(socketData.data as service_fileSystem);
            } else {
                sender.route("agentSource", socketData, function terminal_server_services_fileSystem_route_fileSystem(socketData:socketData):void {
                    fileSystem.menu(socketData.data as service_fileSystem);
                });
            }
        } else {
            sender.route("agentRequest", socketData, function terminal_server_services_fileSystem_route_fileOther(socketData:socketData):void {
                if (vars.test.type === "service") {
                    service.evaluation(socketData);
                } else {
                    sender.broadcast(socketData, "browser");
                }
            });
        }
    },
    status: {
        generate: function terminal_server_services_fileSystem_statusGenerate(data:service_fileSystem, dirs:directory_response):void {
            const callback = function terminal_server_services_fileSystem_statusGenerate_callback(list:directory_response):void {
                const count:[number, number, number, number] = (function terminal_server_services_fileSystem_statusGenerate_callback_count():[number, number, number, number] {
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
                        if (a > end) {
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
                    plural = function terminal_server_services_fileSystem_statusGenerate_callback_plural(input:string, quantity:number):string {
                        if (quantity === 1) {
                            return input;
                        }
                        if (input === "directory") {
                            return "directories";
                        }
                        return `${input}s`;
                    },
                    message:string = (function terminal_server_services_fileSystem_statusGenerate_callback_message():string {
                        if (data.action === "fs-rename" || data.action === "fs-search") {
                            return data.name;
                        }
                        if (dirs === "missing" || dirs === "noShare" || dirs === "readOnly") {
                            return "";
                        }
                        if (data.action === "fs-destroy") {
                            return `Destroyed ${data.location.length} file system ${plural("item", data.location.length)}`;
                        }
                        return (data.agentSource.modalAddress === "\\")
                            ? `${count[0]} ${plural("drive", list.length)}`
                            : `${count[0]} ${plural("directory", count[0])}, ${count[1]} ${plural("file", count[1])}, ${count[2]} ${plural("symbolic link", count[2])}, ${count[3]} ${plural("error", count[3])}`;
                    }()),
                    status:service_fileSystem_status = {
                        agentRequest: data.agentRequest,
                        agentSource: data.agentSource,
                        fileList: list,
                        message: (data.name === "expand")
                            ? `expand-${data.location[0]}`
                            : message
                    };
                fileSystem.route({
                    data: status,
                    service: "file-system-status"
                });
            };
            if (dirs === null) {
                const dirConfig:config_command_directory = {
                    callback: function terminal_server_services_fileSystem_statusGenerate_dirCallback(list:directory_list|string[]):void {
                        const dirs:directory_list = list as directory_list;
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
        },
        specified: function terminal_server_services_fileSystem_statusSpecified(message:string, agentRequest:fileAgent, agentSource:fileAgent):void {
            const status:service_fileSystem_status = {
                agentRequest: agentRequest,
                agentSource: agentSource,
                fileList: null,
                message: message
            };
            fileSystem.route({
                data: status,
                service: "file-system-status"
            });
        }
    }
};

export default fileSystem;