
/* lib/terminal/server/message - Process and send text messages. */

import { ServerResponse } from "http";

import error from "../utilities/error.js";
import httpSender from "./httpSender.js";
import osNotification from "./osNotification.js";
import serverVars from "./serverVars.js";
import settings from "./settings.js";
import vars from "../utilities/vars.js";

const message = function terminal_server_message(data:messageItem[], serverResponse:ServerResponse, online:boolean):void {
    // broadcasts and offline messaging are exclusive
    // data length greater than 1 only applies to sending or receiving offline messages
    const count:number = 500,
        messageLength:number = serverVars.message.length,
        errorHandler = function terminal_server_heartbeat_broadcast_errorHandler(errorMessage:httpException, agent:string, agentType:agentType):void {
            const payload:heartbeat = {
                agentFrom: agent,
                agentTo: (agentType === "device")
                    ? serverVars.hashDevice
                    : serverVars.hashUser,
                agentType: agentType,
                shares: null,
                shareType: "device",
                status: "offline"
            };
            serverVars[agentType][agent].status = "offline";
            serverVars.broadcast("heartbeat-status", JSON.stringify(payload));
            if (online === true) {
                serverVars.message[messageLength].offline = true;
            }
        },
        config:httpConfiguration = {
            agent: data[0].agentTo,
            agentType: data[0].agentType,
            callback: null,
            ip: "",
            payload: JSON.stringify(data),
            port: 0,
            requestError: errorHandler,
            requestType: "message",
            responseError: errorHandler
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
                    httpSender(config);
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
            httpSender(config);
        }
    }
    if (online === true) {
        serverVars.message = serverVars.message.concat(data);
    }
    write();
};

export default message;