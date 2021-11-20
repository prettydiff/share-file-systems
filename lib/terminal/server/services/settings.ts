
/* lib/terminal/server/services/settings - A library for writing data to settings. */

import { rename, unlink, writeFile } from "fs";
import { ServerResponse } from "http";

import agent_http from "../transmission/agent_http.js";
import error from "../../utilities/error.js";
import serverVars from "../serverVars.js";

const settings = function terminal_server_services_settings(dataPackage:socketData, transmit:transmit):void {
    const data:service_settings = dataPackage.data as service_settings,
        location:string = serverVars.settings + data.type,
        fileName:string = `${location}-${Math.random()}.json`,
        changeName = function terminal_server_services_settings_changeName():void {
            rename(fileName, `${location}.json`, function terminal_server_services_settings_rename_renameNode(erName:Error):void {
                if (erName !== null) {
                    unlink(fileName, function terminal_server_services_settings_rename_renameNode_unlink():void {
                        return;
                    });
                }
                if (serverVars.testType === "service" && dataPackage.service === "settings") {
                    agent_http.respond({
                        message: `${data.type} settings written`,
                        mimeType: "text/plain",
                        responseType: "settings",
                        serverResponse: serverVars.testSocket as ServerResponse
                    });
                } else if (transmit !== null && transmit.type === "http") {
                    agent_http.respondEmpty(transmit);
                }
            });
        },
        writeCallback = function terminal_server_services_settings_writeCallback(erSettings:Error):void {
            if (erSettings === null) {
                if (data.type === "configuration") {
                    const settings:ui_data = data.settings as ui_data;
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
                    const agents:agents = data.settings as agents;
                    serverVars[data.type] = agents;
                }
                changeName();
            } else {
                error([erSettings.toString()]);
            }
        };
    if (data.type === undefined) {
        error(["Submitted a 'type' value of undefined to the settings utility."]);
        return;
    }
    if (serverVars.testType === "service") {
        writeCallback(null);
    } else {
        writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
    }
};

export default settings;