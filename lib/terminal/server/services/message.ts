
/* lib/terminal/server/services/message - Process and send text messages. */

import { createReadStream, createWriteStream, readdir } from "fs";

import agent_http from "../transmission/agent_http.js";
import agent_ws from "../transmission/agent_ws.js";
import error from "../../utilities/error.js";
import osNotification from "../osNotification.js";
import serverVars from "../serverVars.js";
import settings from "./settings.js";
import vars from "../../utilities/vars.js";

const message = function terminal_server_services_message(data:service_message, online:boolean):void {
    // broadcasts and offline messaging are exclusive
    // data length greater than 1 only applies to sending or receiving offline messages
    const count:number = 500,
        config:httpRequest = {
            agent: data[0].agentTo,
            agentType: data[0].agentType,
            callback: null,
            ip: "",
            payload: {
                data: data,
                service: "message"
            },
            port: 0
        },
        broadcast = function terminal_server_services_message_broadcast(agentType:agentType):void {
            const list:string[] = Object.keys(serverVars[agentType]);
            let agentLength:number = list.length;
            do {
                agentLength = agentLength - 1;
                if (agentType === "user" || (agentType === "device" && list[agentLength] !== serverVars.hashDevice)) {
                    config.ip = serverVars[agentType][list[agentLength]].ipSelected;
                    config.port = serverVars[agentType][list[agentLength]].ports.http;
                    data[0].message = `(broadcast) ${data[0].message}`;
                    agent_http.request(config);
                }
                if (agentType === "device") {
                    osNotification();
                }
            } while (agentLength > 0);
        },
        write = function terminal_server_services_message_write():void {
            const 
            save = function terminal_server_services_message_write_save():void {
                settings({
                    data: {
                        settings: serverVars.message,
                        type: "message"
                    },
                    service: "message"
                });
            };
            if (serverVars.message.length > count) {
                readdir(`${vars.projectPath}lib${vars.sep}settings${vars.sep}message_archive`, function terminal_server_services_message_readdir(erd:Error, files:string[]):void {
                    if (erd === null) {
                        const fileName:string = (function terminal_server_services_message_readdir_fileName():string {
                            const test:RegExp = (/message\d+\.json/),
                            numb = function terminal_server_services_message_readdir_fileName_numb(input:string):number {
                                    return Number(input.replace("message", "").replace(".json", ""));
                                },
                                sort = function terminal_server_services_message_readdir_fileName_sort(itemA:string, itemB:string):-1|1 {
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
                        readStream = createReadStream(JSON.stringify(serverVars.message.slice(0, count))),
                        writeStream = createWriteStream(`${vars.projectPath}lib${vars.sep}settings${vars.sep}message_archive${vars.sep + fileName}`);
                        readStream.pipe(writeStream);
                        writeStream.on("finish", function terminal_server_services_message_readdir_writeFinish():void {
                            serverVars.message = serverVars.message.slice(count);
                            save();
                        });
                        writeStream.on("error", function terminal_server_services_message_readdir_writeError(errMessage:Error):void {
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
        agent_ws.broadcast({
            data: data,
            service: "message"
        }, "browser");
        osNotification();
    } else if (data[0].agentType === "user" && data[0].agentTo === serverVars.hashUser) {
        agent_ws.broadcast({
            data: data,
            service: "message"
        }, "browser");
        broadcast("device");
    } else {
        if (serverVars[data[0].agentType][data[0].agentTo].status === "offline") {
            data.forEach(function terminal_server_services_message_offline(item:messageItem):void {
                item.offline = true;
            });
        } else {
            config.ip = serverVars[data[0].agentType][data[0].agentTo].ipSelected;
            config.port = serverVars[data[0].agentType][data[0].agentTo].ports.http;
            agent_http.request(config);
        }
    }
    if (online === true) {
        serverVars.message = serverVars.message.concat(data);
    }
    write();
};

export default message;