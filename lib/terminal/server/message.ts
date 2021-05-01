
/* lib/terminal/server/message - Process and send text messages. */

import { ServerResponse } from "http";

import error from "../utilities/error.js";
import httpClient from "./httpClient.js";
import osNotification from "./osNotification.js";
import serverVars from "./serverVars.js";
import settings from "./settings.js";
import vars from "../utilities/vars.js";

const message = function terminal_server_message(messageText:string, serverResponse:ServerResponse):void {
    const data:messageItem = JSON.parse(messageText),
        count:number = 500,
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
        errorMessage:string = `Failed to send text message to ${data.agentTo}`,
        config:httpConfiguration = {
            agentType: data.agentType,
            callback: function terminal_server_message_singleCallback():void {
                return;
            },
            ip: "",
            payload: messageText,
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
                    httpClient(config);
                }
                if (agentType === "device") {
                    osNotification();
                }
            } while (agentLength > 0);
        },
        save = function terminal_server_message_save():void {
            settings({
                data: serverVars.message,
                serverResponse: serverResponse,
                type: "message"
            });
        };
    if (data.agentTo === "device") {
        broadcast("device");
    } else if (data.agentTo === "user") {
        broadcast("user");
    } else if (data.agentTo === "all") {
        broadcast("device");
        broadcast("user");
    } else if (data.agentType === "device" && data.agentTo === serverVars.hashDevice) {
        serverVars.broadcast("message", messageText);
        osNotification();
    } else if (data.agentType === "user" && data.agentTo === serverVars.hashUser) {
        serverVars.broadcast("message", messageText);
        broadcast("device");
    } else {
        config.ip = serverVars[data.agentType][data.agentTo].ipSelected;
        config.port = serverVars[data.agentType][data.agentTo].port;
        httpClient(config);
    }
    serverVars.message.push(data);
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

export default message;