/* lib/terminal/fileService/copySameAgent - Copy items from one location to another on the same agent. */

import { ServerResponse } from "http";

import copy from "../commands/copy.js";
import vars from "../utilities/vars.js";

import copyMessage from "./old-copyMessage.js";
import fileCallback from "./old-fileCallback.js";

const copySameAgent = function terminal_fileService_copySameAgent(serverResponse:ServerResponse, data:systemDataFile):void {
    let count:number = 0,
        countFile:number = 0,
        writtenSize:bigint = 0n;
    const length:number = data.location.length;
    vars.testLogger("fileService", "copySameAgent", "Copying artifacts from one location to another on the same agent.");
    data.location.forEach(function terminal_fileService_copySameAgent_each(value:string):void {
        const callback = function terminal_fileService_copySameAgent_each_copy([fileCount, fileSize]):void {
                count = count + 1;
                countFile = countFile + fileCount;
                writtenSize = writtenSize + fileSize;
                if (count === length) {
                    const status:completeStatus = {
                        countFile: countFile,
                        failures: 0,
                        percent: "100",
                        writtenSize: writtenSize
                    };
                    fileCallback(serverResponse, data, copyMessage(status));
                }
            },
            copyConfig:nodeCopyParams = {
                callback: callback,
                destination: data.name,
                exclusions: [""],
                target: value
            };
        copy(copyConfig);
    });
};

export default copySameAgent;