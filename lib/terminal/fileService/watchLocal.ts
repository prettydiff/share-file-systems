/* lib/terminal/fileService/watchLocal - Broadcasts local file system changes to the browser. */

import directory from "../commands/directory.js";
import vars from "../utilities/vars.js";

const watchLocal = function terminal_fileService_watchLocal(readLocation:string, logRecursion:boolean):void {
    const fsUpdateCallback = function terminal_fileService_watchLocal_fsUpdateCallback(result:directoryList):void {
            vars.ws.broadcast(JSON.stringify({
                "fs-update-local": result
            }));
        },
        dirConfig:readDirectory = {
            callback: fsUpdateCallback,
            depth: 2,
            exclusions: [],
            logRecursion: logRecursion,
            mode: "read",
            path: readLocation,
            symbolic: true
        };
    vars.testLogger("fileService", "fsUpdateLocal", "Read from a directory and send the data to the local browser via websocket broadcast.");
    directory(dirConfig);
    logRecursion = false;
};

export default watchLocal;