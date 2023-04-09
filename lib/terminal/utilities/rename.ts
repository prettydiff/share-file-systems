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
const rename = function terminal_utilities_rename(config:config_rename):void {
    let index:number = 0,
        baseName:string = "",
        noExtension:string = "",
        extension:string = "";
    const listLength:number = config.list.length,
        targetPath = function terminal_utilities_rename_newPath(listIndex:number):string {
            const name:string = config.list[listIndex][0][0].replace(/\/|\\/g, vars.path.sep).split(vars.path.sep).pop(),
                newPath:string = config.destination + vars.path.sep + name;
            config.list[listIndex][0][6] = newPath;
            return newPath;
        },
        statCallback = function terminal_utilities_rename_statCallback(statError:NodeJS.ErrnoException):void {
            const itemLength:number = config.list[index].length;

            // an error occurred, so stop and process that error only
            if (statError !== null && statError.code !== "ENOENT") {
                config.callback(statError, null);
                return;
            }

            // artifact with this name already exists, so must rename
            if (statError === null && config.replace === false) {
                // rename
                let count:number = 0,
                    dotIndex:number = -1;
                const countTest:RegExp = (/_\d+$/),
                    source:string = (config.list[index][0][6] === "")
                        ? config.list[index][0][0]
                        : config.list[index][0][6];

                // gather the file or directory name
                baseName = source.replace(/(\\|\/)$/, "").replace(/\\/g, "/").split("/").pop();
                dotIndex = (config.list[index][0][1] === "file" || config.list[index][0][1] === "link")
                    ? baseName.lastIndexOf(".")
                    : -1;
                extension = (dotIndex > -1)
                    ? baseName.slice(dotIndex)
                    : "";
                noExtension = (dotIndex > -1)
                    ? baseName.slice(0, dotIndex)
                    : baseName;
                count = (countTest.test(noExtension) === true)
                    ? Number(noExtension.slice(noExtension.lastIndexOf("_") + 1)) + 1
                    : 0;
                config.list[index][0][6] = `${config.destination + vars.path.sep + noExtension.replace(countTest, "")}_${String(count) + extension}`;
                stat(config.list[index][0][6], terminal_utilities_rename_statCallback);
                return;
            }

            // transform child file system artifacts to match the root artifact
            if (itemLength > 1) {
                if (config.list[index][0][0] === config.list[index][0][6]) {
                    // populate write path without rename
                    let a:number = 0;
                    do {
                        config.list[index][a][6] = config.list[index][a][0].replace(/\/|\\/g, vars.path.sep);
                        a = a + 1;
                    } while (a < itemLength);
                } else {
                    // provide an original write path not conflicting with existing artifacts
                    let a:number = 0;
                    const newName:string = config.list[index][0][6];
                    do {
                        config.list[index][a][6] = config.list[index][a][0].replace(config.list[index][0][0], newName).replace(/\/|\\/g, vars.path.sep);
                        a = a + 1;
                    } while (a < itemLength);
                }
            }

            index = index + 1;
            if (index < listLength) {
                baseName = "";
                extension = "";
                stat(targetPath(index), terminal_utilities_rename_statCallback);
            } else {
                config.callback(null, config.list);
            }
        };
    if (Array.isArray(config.list) === false) {
        config.callback(new Error(`Expected an array but instead received type ${typeof config.list} for argument 'list'.`), null);
        return;
    }

    config.destination = config.destination.replace(/(\\|\/)$/, "");

    // determine if artifact name already present, and if so then modify it
    stat(targetPath(index), statCallback);
};

export default rename;