/* lib/terminal/utilities/readStorage - Reads all the storage files and returns a data structure to a callback */

import error from "./error.js";
import serverVars from "../server/serverVars.js";
import vars from "./vars.js";

const readStorage = function terminal_utilities_readStorage(callback:(storage:storageItems) => void):void {
    vars.node.fs.readdir(serverVars.storage, function terminal_utilities_readStorage_readdir(erd:nodeError, fileList:string[]):void {
        if (erd !== null) {
            error([erd.toString()]);
            return;
        }
        let length:number = fileList.length;
        const flag:storageFlag = {},
            storage:storageItems = {
                device: {},
                settings: {
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
                    zIndex: 0
                },
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
                callback(storage);
            },
            read = function terminal_utilities_readStorage_readdir_read(fileName:string):void {
                vars.node.fs.readFile(serverVars.storage + fileName, "utf8", function terminal_utilities_readStorage_readdir_read_readFile(err:nodeError, fileData:string):void {
                    if (err !== null) {
                        error([err.toString()]);
                        return;
                    }
                    const item:string = fileName.replace(".json", "");
                    storage[item] = JSON.parse(fileData);
                    flag[item] = true;
                    complete();
                });
            };
        if (length > 1) {
            do {
                length = length - 1;
                if (fileList[length].length > 5 && fileList[length].indexOf(".json") === fileList[length].length - 5) {
                    flag[fileList[length].replace(".json", "")] = false;
                    read(fileList[length]);
                }
            } while (length > 0);
        }
        complete();
    });
};

export default readStorage;