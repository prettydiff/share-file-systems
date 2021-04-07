
/* lib/terminal/server/settings - A library for writing data to settings. */

import error from "../utilities/error.js";
import vars from "../utilities/vars.js";

import response from "./response.js";
import serverVars from "./serverVars.js";

const settings = function terminal_server_settings(data:settings):void {
    const location:string = serverVars.settings + data.type,
        fileName:string = `${location}-${Math.random()}.json`,
        respond = function terminal_server_settings_respond():void {
            response({
                message: `${data.type} settings written`,
                mimeType: "text/plain",
                responseType: "settings",
                serverResponse: data.serverResponse
            });
        },
        rename = function terminal_server_settings_rename():void {
            if (serverVars.testType !== "service") {
                vars.node.fs.rename(fileName, `${location}.json`, function terminal_server_settings_rename_renameNode(erName:Error) {
                    if (erName !== null) {
                        vars.node.fs.unlink(fileName, function terminal_server_settings_rename_renameNode_unlink(erUnlink:Error) {
                            if (erUnlink !== null) {
                                error([erUnlink.toString()]);
                            }
                        });
                    }
                });
            }
            respond();
        },
        writeCallback = function terminal_server_settings_writeCallback(erSettings:Error):void {
            if (erSettings === null) {
                if (data.type === "configuration") {
                    const settings:ui_data = data.data as ui_data;
                    if (serverVars.testType === "") {
                        serverVars.brotli = settings.brotli;
                        serverVars.hashType = settings.hashType;
                        serverVars.hashUser = settings.hashUser;
                        serverVars.nameUser = settings.nameUser;
                        serverVars.storage = settings.storage;
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
        error(["Submitted a 'type' value of undefined to the settings utility."]);
        respond();
        return;
    }
    if (serverVars.testType === "service") {
        writeCallback(null);
    } else {
        vars.node.fs.writeFile(fileName, JSON.stringify(data.data), "utf8", writeCallback);
    }
};

export default settings;