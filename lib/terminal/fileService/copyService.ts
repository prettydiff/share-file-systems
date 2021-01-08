
/* lib/terminal/fileService/copyService - A library that stores instructions for copy and cut of file system artifacts. */

import { ServerResponse } from "http";

import common from "../../common/common.js";
import copy from "../commands/copy.js";
import fileServices from "./fileServices.js";
import remove from "../commands/remove.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

const copyService = function terminal_fileService_copyService(serverResponse:ServerResponse, data:fileService):void {
    const actions:copyActions = {
            sameAgent: function terminal_fileService_copyService_sameAgent():void {
                let count:number = 0,
                    countFile:number = 0,
                    writtenSize:number = 0;
                const length:number = data.location.length;
                vars.testLogger("fileService", "copySameAgent", "Copying artifacts from one location to another on the same agent.");
                data.location.forEach(function terminal_fileService_copyService_copySameAgent_each(value:string):void {
                    const callback = function terminal_fileService_copyService_copySameAgent_each_copy([fileCount, fileSize]):void {
                            count = count + 1;
                            countFile = countFile + fileCount;
                            writtenSize = (serverVars.testType === "service")
                                ? 0
                                : writtenSize + fileSize;
                            if (count === length) {
                                const complete:completeStatus = {
                                    countFile: countFile,
                                    failures: 0,
                                    percent: 100,
                                    writtenSize: writtenSize
                                },
                                status:copyStatus = {
                                    failures: [],
                                    id: data.id,
                                    message: copyMessage(complete)
                                };
                                if (data.cut === true) {
                                    if (data.agent === data.originAgent) {
                                        let cutCount:number = 0;
                                        const removeCallback = function terminal_fileService_copyService_copySameAgent_each_copy_remove():void {
                                            cutCount = cutCount + 1;
                                            if (cutCount === data.location.length) {
                                                fileServices.respond.copy(serverResponse, status);
                                            }
                                        };
                                        data.location.forEach(function terminal_fileService_copyService_copySameAgent_each_copy_cut(filePath:string):void {
                                            remove(filePath, removeCallback);
                                        });
                                    }
                                } else {
                                    fileServices.respond.copy(serverResponse, status);
                                }
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
            }
        },
        copyMessage = function terminal_fileService_copyService_copyMessage(numbers:completeStatus):string {
            const filePlural:string = (numbers.countFile === 1)
                    ? ""
                    : "s",
                failPlural:string = (numbers.failures === 1)
                    ? ""
                    : "s",
                verb:string = (data.cut === true)
                    ? "Cut"
                    : "Copy",
                action:string = (numbers.percent === 100)
                    ? verb
                    : `${verb}ing ${numbers.percent.toFixed(2)}%`;
            vars.testLogger("fileService", "copyMessage", "Status information about multiple file copy.");
            return `${action} complete. ${common.commas(numbers.countFile)} file${filePlural} written at size ${common.prettyBytes(numbers.writtenSize)} (${common.commas(numbers.writtenSize)} bytes) with ${numbers.failures} integrity failure${failPlural}.`
        },
        menu = function terminal_fileService_copyService_menu():void {
            if (data.action === "fs-copy") {
                if (data.agent === data.copyAgent) {
                    actions.sameAgent();
                } else {
                    
                }
            }
        };
    menu();
};

export default copyService;