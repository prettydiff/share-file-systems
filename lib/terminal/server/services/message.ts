
/* lib/terminal/server/services/message - Process and send text messages. */

import error from "../../utilities/error.js";
import network from "../transmission/network.js";
import node from "../../utilities/node.js";
import osNotification from "../osNotification.js";
import settings from "./settings.js";
import vars from "../../utilities/vars.js";

const message = function terminal_server_services_message(socketData:socketData):void {
    // broadcasts and offline messaging are exclusive
    // data length greater than 1 only applies to sending or receiving offline messages
    const data:service_message = socketData.data as service_message,
        count:number = 500,
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
    if ((data[0].agentType === "device" && data[0].agentTo === vars.identity.hashDevice) || (data[0].agentType === "user" && data[0].agentTo === vars.identity.hashUser)) {
        network.send({
            data: data,
            service: "message"
        }, "browser");
        osNotification();
        if (data[0].agentType === "user" && data[0].userDevice === false) {
            data[0].userDevice = true;
            network.send(socketData, "device");
        }
    } else if (data[0].agentTo === "device" || data[0].agentTo === "user") {
        network.send(socketData, data[0].agentTo);
    } else if (data[0].agentTo === "all") {
        network.send(socketData, "device");
        network.send(socketData, "user");
    } else {
        if (vars.agents[data[0].agentType][data[0].agentTo].status !== "offline") {
            const agency:transmit_agents = (data[0].agentType === "device")
                ? {
                    device: data[0].agentTo,
                    user: vars.identity.hashUser
                }
                : {
                    device: "",
                    user: data[0].agentTo
                };
            network.send({
                data: data,
                service: "message"
            }, agency);
        }
    }
    vars.settings.message = vars.settings.message.concat(data);
    write();
};

export default message;