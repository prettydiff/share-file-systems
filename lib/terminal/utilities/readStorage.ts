/* lib/terminal/utilities/readStorage - Reads all the settings files and returns a data structure to a callback */

import { readdir, readFile } from "fs";

import vars from "./vars.js";

const readStorage = function terminal_utilities_readStorage(callback:(settings:settings_item) => void):void {
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
                        hashDevice: "",
                        hashType: "sha3-512",
                        hashUser: "",
                        modals: {},
                        modalTypes: [],
                        nameDevice: "",
                        nameUser: "",
                        statusTime: vars.settings.statusTime,
                        storage: vars.path.storage,
                        tutorial: false,
                        zIndex: 0
                    },
                    device: {},
                    message: [],
                    user: {}
                },
                complete = function terminal_utilities_readStorage_readdir_complete():void {
                    const keys:string[] = Object.keys(flag);
                    let keyLength:number = keys.length;
                    if (keyLength > 0) {
                        do {
                            keyLength = keyLength - 1;
                            if (flag[keys[keyLength]] === false) {
                                return;
                            }
                        } while (keyLength > 0);
                    }
                    settings.configuration.statusTime = vars.settings.statusTime;
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
        }
    });
};

export default readStorage;