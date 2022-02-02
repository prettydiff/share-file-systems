/* lib/terminal/utilities/rename - Before creating new file system artifacts this library determines if the artifact is already present and if so changes the name of the new artifacts to prevent overwrite. */

import { stat } from "fs";

import vars from "./vars.js";

// directoryList: [].failures
// 0. absolute path (string)
// 1. type (fileType)
// 2. hash (string), empty string unless type is "file" and args.hash === true and be aware this is exceedingly slow on large directory trees
// 3. parent index (number)
// 4. child item count (number)
// 5. selected properties from fs.Stat plus some link resolution data
// 6. write path from the lib/utilities/rename library for file copy
// * property "failures" is a list of file paths that could not be read or opened
const rename = function terminal_utilities_rename(list:directoryList[], targetLocation:string, callback:(error:NodeJS.ErrnoException, newList:directoryList[]) => void):void {
    let index:number = 0,
        baseName:string = "",
        noExtension:string = "",
        extension:string = "";
    const listLength:number = list.length,
        statCallback = function terminal_utilities_rename_statCallback(statError:NodeJS.ErrnoException):void {
            const countTest:RegExp = (/_\d+$/),
                itemLength:number = list[index].length,
                source:string = (list[index][0][6] === "")
                    ? list[index][0][0]
                    : list[index][0][6];
            let count:number = 0,
                dotIndex:number = -1;

            baseName = source.replace(/(\\|\/)$/, "").replace(/\\/g, "/").split("/").pop();
            dotIndex = baseName.lastIndexOf(".");
            extension = (dotIndex > 0)
                ? baseName.slice(dotIndex)
                : "";
            noExtension = (dotIndex > 0)
                ? baseName.slice(0, dotIndex)
                : baseName;

            // artifact with this name already exists, so must rename
            if (statError === null) {
                // rename
                count = (countTest.test(noExtension) === true)
                    ? Number(noExtension.slice(noExtension.lastIndexOf("_") + 1)) + 1
                    : 0;
                list[index][0][6] = `${targetLocation + vars.sep + noExtension.replace(countTest, "")}_${count + extension}`;
                stat(list[index][0][6], terminal_utilities_rename_statCallback);
                return;
            }

            // an error occurred, so stop and process that error only
            if (statError !== null && statError.code !== "ENOENT") {
                callback(statError, null);
                return;
            }

            // transform child file system artifacts to match the root artifact
            if (list[index][0][6] === "") {
                list[index][0][6] = targetLocation + vars.sep + baseName;
            }
            if (itemLength > 1) {
                let a:number = 1;
                const newName:string = list[index][0][6];
                do {
                    list[index][a][6] = list[index][a][0].replace(list[index][0][0], newName);
                    a = a + 1;
                } while (a < itemLength);
            }

            index = index + 1;
            if (index < listLength) {
                baseName = "";
                extension = "";
                stat(list[index][0][0], terminal_utilities_rename_statCallback);
            } else {
                callback(null, list);
            }
        };
    if (Array.isArray(list) === false) {
        callback(new Error(`Expected an array but instead received type ${typeof list} for argument 'list'.`), null);
        return;
    }

    targetLocation = targetLocation.replace(/(\\|\/)$/, "");

    // determine if artifact name already present, and if so then modify it
    stat(list[0][0][0], statCallback);
};

export default rename;