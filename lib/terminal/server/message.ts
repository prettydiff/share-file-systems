
/* lib/terminal/server/message - Process and send text messages. */

import { ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "./httpClient.js";
import osNotification from "./osNotification.js";
import serverVars from "./serverVars.js";
import settings from "./settings.js";
import vars from "../utilities/vars.js";

const message = function terminal_server_message(data:messageItem[], serverResponse:ServerResponse, offline:boolean):void {
    let offlineCount:number = data.length;
    const count:number = 500,
        requestError = function terminal_server_message_requestError(message:NodeJS.ErrnoException):void {
            if (message.code !== "ETIMEDOUT") {
                error([errorMessage, message.toString()]);
            }
        },
        responseError = function terminal_server_message_responseError(message:NodeJS.ErrnoException):void {
            if (message.code !== "ETIMEDOUT") {
                error([errorMessage, errorMessage.toString()]);
                serverVars.broadcast("error", JSON.stringify(errorMessage));
            }
        },
        errorMessage:string = `Failed to send text message to ${data[0].agentTo}`,
        config:httpConfiguration = {
            agentType: data[0].agentType,
            callback: null,
            ip: "",
            payload: JSON.stringify(data),
            port: 0,
            requestError: requestError,
            requestType: "message",
            responseError: responseError
        },
        broadcast = function terminal_server_message_broadcast(agentType:agentType):void {
            const list:string[] = Object.keys(serverVars[agentType]);
            let agentLength:number = list.length;
            do {
                agentLength = agentLength - 1;
                if (agentType === "user" || (agentType === "device" && list[agentLength] !== serverVars.hashDevice)) {
                    config.ip = serverVars[agentType][list[agentLength]].ipSelected;
                    config.port = serverVars[agentType][list[agentLength]].port;
                    data[0].message = `(broadcast) ${data[0].message}`;
                    httpClient(config);
                }
                if (agentType === "device") {
                    osNotification();
                }
            } while (agentLength > 0);
        },
        write = function terminal_server_message_write():void {
            const 
            save = function terminal_server_message_write_save():void {
                settings({
                    data: serverVars.message,
                    serverResponse: serverResponse,
                    type: "message"
                });
            };
            if (serverVars.message.length > count) {
                vars.node.fs.readdir(`${vars.projectPath}lib${vars.sep}settings${vars.sep}message_archive`, function terminal_server_message_readdir(erd:Error, files:string[]):void {
                    if (erd === null) {
                        const fileName:string = (function terminal_server_message_readdir_fileName():string {
                            const test:RegExp = (/message\d+\.json/),
                            numb = function terminal_server_message_readdir_fileName_numb(input:string):number {
                                    return Number(input.replace("message", "").replace(".json", ""));
                                },
                                sort = function terminal_server_message_readdir_fileName_sort(itemA:string, itemB:string):-1|1 {
                                    if (test.test(itemB) === true && test.test(itemA) === false) {
                                        return 1;
                                    }
                                    if (test.test(itemA) === true && test.test(itemB) === false) {
                                        return -1;
                                    }
                                    if (numb(itemA) > numb(itemB)) {
                                        return -1;
                                    }
                                    return 1;
                                };
                            files.sort(sort);
                            if (test.test(files[0]) === true) {
                                return `message${numb(files[0]) + 1}.json`;
                            }
                            return "message0.json";
                        }()),
                        readStream = vars.node.fs.createReadStream(JSON.stringify(serverVars.message.slice(0, count))),
                        writeStream = vars.node.fs.createWriteStream(`${vars.projectPath}lib${vars.sep}settings${vars.sep}message_archive${vars.sep + fileName}`);
                        readStream.pipe(writeStream);
                        writeStream.on("finish", function terminal_server_message_readdir_writeFinish():void {
                            serverVars.message = serverVars.message.slice(count);
                            save();
                        });
                        writeStream.on("error", function terminal_server_message_readdir_writeError(errMessage:Error):void {
                            error([errMessage.toString()]);
                        });
                    } else {
                        error(["Error performing readdir on message_archive", erd.toString()]);
                    }
                });
            } else {
                save();
            }
        };
    if (offlineCount > 0) {
        offlineCount = offlineCount - 1;
        config.payload = JSON.stringify(data[offlineCount]);
    }
    if (data[0].agentTo === "device") {
        broadcast("device");
    } else if (data[0].agentTo === "user") {
        broadcast("user");
    } else if (data[0].agentTo === "all") {
        broadcast("device");
        broadcast("user");
    } else if (data[0].agentType === "device" && data[0].agentTo === serverVars.hashDevice) {
        serverVars.broadcast("message", JSON.stringify(data));
        osNotification();
    } else if (data[0].agentType === "user" && data[0].agentTo === serverVars.hashUser) {
        serverVars.broadcast("message", JSON.stringify(data));
        broadcast("device");
    } else {
        if (serverVars[data[0].agentType][data[0].agentTo].status === "offline") {
            data.forEach(function terminal_server_message_offline(item:messageItem):void {
                item.offline = true;
            });
        } else {
            config.ip = serverVars[data[0].agentType][data[0].agentTo].ipSelected;
            config.port = serverVars[data[0].agentType][data[0].agentTo].port;
            httpClient(config);
        }
    }
    if (offline === false) {
        serverVars.message = serverVars.message.concat(data);
    }
    write();
};

export default message;