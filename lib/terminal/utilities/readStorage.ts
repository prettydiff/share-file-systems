/* lib/terminal/utilities/readStorage - Reads all the settings files and returns a data structure to a callback */

import { readdir, readFile } from "fs";

import error from "./error.js";
import vars from "./vars.js";

// cspell: words brotli

const readStorage = function terminal_utilities_readStorage(fromFile:boolean, callback:(settings:settings_item) => void):void {
    readdir(vars.path.settings, function terminal_utilities_readStorage_readdir(erd:Error, fileList:string[]):void {
        if (erd === null) {
            let length:number = fileList.length;
            const flag:flagList = {},
                settings:settings_item = {
                    configuration: {
                        audio: false,
                        brotli: 0,
                        color: "default",
                        colors: {
                            device: {},
                            user: {}
                        },
                        fileSort: "file-system-type",
                        hashDevice: "",
                        hashType: "sha3-512",
                        hashUser: "",
                        modals: {},
                        modalTypes: [],
                        nameDevice: "",
                        nameUser: "",
                        statusTime: vars.settings.statusTime,
                        storage: vars.settings.storage,
                        tutorial: false,
                        zIndex: 0
                    },
                    device: {},
                    message: [],
                    queue: {
                        device: {},
                        user: {}
                    },
                    user: {}
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
                    settings.configuration.statusTime = vars.settings.statusTime;
                    configs = Object.keys(settings.configuration);
                    keyLength = configs.length;
                    do {
                        keyLength = keyLength - 1;
                        // @ts-ignore - The following line forces an implicit any, but in this dynamic assignment is lower risk than type analysis
                        vars.settings[configs[keyLength]] = settings.configuration[configs[keyLength]];
                    } while (keyLength > 0);
                    vars.settings.device = settings.device;
                    vars.settings.message = settings.message;
                    vars.settings.queue = settings.queue;
                    vars.settings.user = settings.user;
                    if (vars.settings.hashDevice !== undefined && vars.settings.hashDevice !== "") {
                        vars.settings.device[vars.settings.hashDevice].ipAll = vars.network.addresses;
                        vars.settings.device[vars.settings.hashDevice].ports = vars.network.ports;
                    }
                    callback(settings);
                },
                read = function terminal_utilities_readStorage_readdir_read(fileName:string):void {
                    readFile(vars.path.settings + fileName, "utf8", function terminal_utilities_readStorage_readdir_read_readFile(err:Error, fileData:string):void {
                        if (err === null) {
                            const item:settingsType = fileName.replace(".json", "") as settingsType;
                            settings[item] = JSON.parse(fileData);
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
                settings.configuration = {
                    audio: vars.settings.audio,
                    brotli: vars.settings.brotli,
                    color: vars.settings.color,
                    colors: vars.settings.colors,
                    fileSort: vars.settings.fileSort,
                    hashDevice: vars.settings.hashDevice,
                    hashType: vars.settings.hashType,
                    hashUser: vars.settings.hashUser,
                    modals: vars.settings.modals,
                    modalTypes: vars.settings.modalTypes,
                    nameDevice: vars.settings.nameDevice,
                    nameUser: vars.settings.nameUser,
                    statusTime: vars.settings.statusTime,
                    storage: vars.settings.storage,
                    tutorial: vars.settings.tutorial,
                    zIndex: vars.settings.zIndex
                };
                settings.device = vars.settings.device;
                settings.message = vars.settings.message;
                settings.queue = vars.settings.queue;
                settings.user = vars.settings.user;
                callback(settings);
            }
        } else {
            error(["Error reading files from configuration storage directory."], erd);
        }
    });
};

export default readStorage;