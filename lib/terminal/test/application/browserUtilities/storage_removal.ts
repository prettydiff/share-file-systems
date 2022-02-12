
/* lib/terminal/test/application/browserUtilities/storage_removal - Removes artifacts written from the service test automation. */

import { readdir } from "fs";

import error from "../../../utilities/error.js";
import remove from "../../../commands/remove.js";
import vars from "../../../utilities/vars.js";

const storage_removal = function terminal_test_application_browserUtilities_storageRemoval(callback:() => void):void {
    let types:number = 0;
    const sep:string = vars.path.sep,
        path:stringStore = {
            "0": `${vars.path.project}lib${sep}terminal${sep}test${sep}storageService${sep}test_storage`,
            "1": `${vars.path.project}lib${sep}terminal${sep}test${sep}storageBrowser`
        },
        exclusions:stringStore = {
            "0": "test_storage.txt",
            "1": "storageBrowser.txt"
        },
        typeTotal:number = Object.keys(path).length,
        removal = function terminal_test_application_browserUtilities_storageRemoval_readdir(dirError:NodeJS.ErrnoException, files:string[]):void {
            if (dirError === null) {
                let count:number = 0;
                const total:number = files.length,
                    removeCallback = function terminal_test_application_browserUtilities_storageRemoval_readdir_removeCallback():void {
                        count = count + 1;
                        if (count === total) {
                            types = types + 1;
                            if (types === typeTotal) {
                                callback();
                            } else {
                                readdir(path[types], terminal_test_application_browserUtilities_storageRemoval_readdir);
                            }
                            return;
                        }
                        if (files[count] === exclusions[types]) {
                            terminal_test_application_browserUtilities_storageRemoval_readdir_removeCallback();
                        } else {
                            remove(path[types] + sep + files[count], terminal_test_application_browserUtilities_storageRemoval_readdir_removeCallback);
                        }
                    };
                if (total === 1 || files[0] === exclusions[types]) {
                    removeCallback();
                } else {
                    remove(path[types] + sep + files[count], removeCallback);
                }
            } else {
                error([JSON.stringify(dirError)]);
            }
        };
    readdir(path[0], removal);
};

export default storage_removal;