
/* lib/terminal/server/storage - A library for writing data to storage. */

import error from "../utilities/error.js";
import vars from "../utilities/vars.js";

import response from "./response.js";
import serverVars from "./serverVars.js";

const storage = function terminal_server_storage(data:storage):void {
    const location:string = serverVars.storage + data.type,
        fileName:string = `${location}-${Math.random()}.json`,
        respond = function terminal_server_storage_respond():void {
            response({
                message: `${data.type} storage written`,
                mimeType: "text/plain",
                responseType: "storage",
                serverResponse: data.response
            });
        },
        rename = function terminal_server_storage_rename():void {
            if (serverVars.testType !== "service") {
                vars.node.fs.rename(fileName, `${location}.json`, function terminal_server_storage_rename_renameNode(erName:Error) {
                    if (erName !== null) {
                        vars.node.fs.unlink(fileName, function terminal_server_storage_rename_renameNode_unlink(erUnlink:Error) {
                            if (erUnlink !== null) {
                                error([erUnlink.toString()]);
                            }
                        });
                    }
                });
            }
            respond();
        },
        writeCallback = function terminal_server_storage_writeCallback(erSettings:Error):void {
            if (erSettings === null) {
                if (data.type === "settings") {
                    const settings:ui_data = data.data as ui_data;
                    if (serverVars.testType === "") {
                        serverVars.brotli = settings.brotli;
                        serverVars.hashType = settings.hashType;
                        serverVars.hashUser = settings.hashUser;
                        serverVars.nameUser = settings.nameUser;
                        if (serverVars.hashDevice === "") {
                            serverVars.hashDevice = settings.hashDevice;
                            serverVars.nameDevice = settings.nameDevice;
                        }
                    }
                } else if (serverVars.testType === "" && (data.type === "device" || data.type === "user")) {
                    const agents:agents = data.data as agents;
                    serverVars[data.type] = agents;
                }
                rename();
            } else {
                respond();
                error([erSettings.toString()]);
            }
        };
    if (data.type === undefined) {
        error(["Submitted a 'type' value of undefined to the storage utility."]);
        respond();
        return;
    }
    if (serverVars.testType === "service") {
        writeCallback(null);
    } else {
        vars.node.fs.writeFile(fileName, JSON.stringify(data.data), "utf8", writeCallback);
    }
};

export default storage;