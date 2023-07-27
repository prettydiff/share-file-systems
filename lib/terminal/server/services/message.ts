
/* lib/terminal/server/services/message - Process and send text messages. */

import error from "../../utilities/error.js";
import osNotification from "../osNotification.js";
import node from "../../utilities/node.js";
import sender from "../transmission/sender.js";
import settings from "./settings.js";
import vars from "../../utilities/vars.js";

const message = function terminal_server_services_message(socketData:socketData):void {
    // broadcasts and offline messaging are exclusive
    // data length greater than 1 only applies to sending or receiving offline messages
    const data:service_message = socketData.data as service_message,
        count:number = 500,
        broadcast = function terminal_server_services_message_broadcast(agentType:agentType):void {
            const list:string[] = Object.keys(vars.agents[agentType]);
            let agentLength:number = list.length;
            do {
                agentLength = agentLength - 1;
                if (agentType === "user" || (agentType === "device" && list[agentLength] !== vars.identity.hashDevice)) {
                    data[0].message = `(broadcast) ${data[0].message}`;
                    sender.send({
                        data: data,
                        service: "message"
                    }, {
                        device: (data[0].agentType === "device")
                            ? data[0].agentTo
                            : "",
                        user: (data[0].agentType === "device")
                            ? vars.identity.hashUser
                            : data[0].agentTo
                    });
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
                        settings: vars.settings.message,
                        type: "message"
                    },
                    service: "message"
                });
            };
            if (vars.settings.message.length > count) {
                node.fs.readdir(`${vars.path.project}lib${vars.path.sep}settings${vars.path.sep}message_archive`, function terminal_server_services_message_readdir(erd:node_error, files:string[]):void {
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
                        readStream:node_fs_ReadStream = node.fs.createReadStream(JSON.stringify(vars.settings.message.slice(0, count))),
                        writeStream:node_fs_WriteStream = node.fs.createWriteStream(`${vars.path.project}lib${vars.path.sep}settings${vars.path.sep}message_archive${vars.path.sep + fileName}`);
                        readStream.pipe(writeStream);
                        writeStream.on("finish", function terminal_server_services_message_readdir_writeFinish():void {
                            vars.settings.message = vars.settings.message.slice(count);
                            save();
                        });
                        writeStream.on("error", function terminal_server_services_message_readdir_writeError(errMessage:node_error):void {
                            error(["Error on write stream to message archive"], errMessage);
                        });
                    } else {
                        error(["Error performing readdir on message_archive"], erd);
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
    } else if (data[0].agentType === "device" && data[0].agentTo === vars.identity.hashDevice) {
        sender.broadcast({
            data: data,
            service: "message"
        }, "browser");
        osNotification();
    } else if (data[0].agentType === "user" && data[0].agentTo === vars.identity.hashUser) {
        sender.broadcast({
            data: data,
            service: "message"
        }, "browser");
        broadcast("device");
    } else {
        if (vars.agents[data[0].agentType][data[0].agentTo].status === "offline") {
            data.forEach(function terminal_server_services_message_offline(item:message_item):void {
                item.offline = true;
            });
        } else {
            sender.send({
                data: data,
                service: "message"
            }, {
                device: (data[0].agentType === "device")
                    ? data[0].agentTo
                    : "",
                user: (data[0].agentType === "device")
                    ? vars.identity.hashUser
                    : data[0].agentTo
            });
        }
    }
    vars.settings.message = vars.settings.message.concat(data);
    write();
};

export default message;