/* lib/terminal/utilities/readStorage - Reads all the settings files and returns a data structure to a callback */

import error from "./error.js";
import node from "./node.js";
import vars from "./vars.js";

// cspell: words brotli

const readStorage = function terminal_utilities_readStorage(fromFile:boolean, callback:(settings:state_storage) => void):void {
    node.fs.readdir(vars.path.settings, function terminal_utilities_readStorage_readdir(erd:node_error, fileList:string[]):void {
        if (erd === null) {
            let length:number = fileList.length;
            const flag:flagList = {},
                settings:state_storage = {
                    agents: {
                        device: {},
                        user: {}
                    },
                    identity: {
                        hashDevice: "",
                        hashUser: "",
                        nameDevice: "",
                        nameUser: "",
                        secretDevice: "",
                        secretUser: ""
                    },
                    message: [],
                    queue: {
                        device: {},
                        user: {}
                    },
                    ui: {
                        audio: false,
                        brotli: 0,
                        color: "default",
                        colorBackgrounds: {
                            "blush":   ["rgba(255,255,255,0.5)", "rgba(224,200,200,0.75)", "blur(2em)"],
                            "dark":    ["rgba(32,32,32,0.75)",   "rgba(16,16,16,0.75)",    "blur(2em)"],
                            "default": ["rgba(255,255,255,0.5)", "rgba(216,216,216,0.75)", "blur(2em)"]
                        },
                        colors: {
                            device: {},
                            user: {}
                        },
                        fileSort: "file-system-type",
                        hashType: "sha3-512",
                        minimizeAll: false,
                        modals: {},
                        modalTypes: [],
                        statusTime: vars.settings.ui.statusTime,
                        storage: vars.settings.ui.storage,
                        tutorial: false,
                        zIndex: 0
                    },
                },
                complete = function terminal_utilities_readStorage_readdir_complete():void {
                    const keys:string[] = Object.keys(flag);
                    let keyLength:number = keys.length,
                        configs:string[] = [];
                    if (keyLength > 0) {
                        do {
                            keyLength = keyLength - 1;
                            if (flag[keys[keyLength]] === false) {
                                return;
                            }
                        } while (keyLength > 0);
                    }
                    settings.ui.statusTime = vars.settings.ui.statusTime;
                    configs = Object.keys(settings.ui);
                    keyLength = configs.length;
                    do {
                        keyLength = keyLength - 1;
                        // @ts-ignore - The following line forces an implicit any, but in this dynamic assignment is lower risk than type analysis
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        vars.settings[configs[keyLength]] = settings.ui[configs[keyLength]];
                    } while (keyLength > 0);
                    vars.agents = settings.agents;
                    vars.identity = settings.identity;
                    vars.settings.message = settings.message;
                    vars.settings.queue = settings.queue;
                    vars.settings.ui = settings.ui;
                    if (vars.identity.hashDevice !== undefined && vars.identity.hashDevice !== "") {
                        vars.agents.device[vars.identity.hashDevice].ipAll = vars.network.addresses;
                        vars.agents.device[vars.identity.hashDevice].port = vars.network.port;
                    }
                    callback(settings);
                },
                read = function terminal_utilities_readStorage_readdir_read(fileName:string):void {
                    node.fs.readFile(vars.path.settings + fileName, "utf8", function terminal_utilities_readStorage_readdir_read_readFile(err:node_error, fileData:string):void {
                        if (err === null) {
                            const item:settingsType = fileName.replace(".json", "") as settingsType;
                            if (item === "device" || item === "user") {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                settings.agents[item] = JSON.parse(fileData);
                            } else {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                settings[item] = JSON.parse(fileData);
                            }
                            flag[item] = true;
                            complete();
                        }
                    });
                };
            if (fromFile === true) {
                if (length > 1) {
                    do {
                        length = length - 1;
                        if (fileList[length].length > 5 && fileList[length].indexOf(".json") === fileList[length].length - 5 && fileList[length].indexOf("-0.") < 0) {
                            flag[fileList[length].replace(".json", "")] = false;
                            read(fileList[length]);
                        }
                    } while (length > 0);
                }
                complete();
            } else {
                settings.agents = vars.agents;
                settings.identity = vars.identity;
                settings.message = vars.settings.message;
                settings.queue = vars.settings.queue;
                settings.ui = vars.settings.ui;
                callback(settings);
            }
        } else {
            error(["Error reading files from configuration storage directory."], erd);
        }
    });
};

export default readStorage;