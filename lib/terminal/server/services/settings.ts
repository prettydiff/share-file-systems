
/* lib/terminal/server/services/settings - A library for writing data to settings. */

import { rename, stat, unlink, writeFile } from "fs";

import error from "../../utilities/error.js";
import service from "../../test/application/service.js";
import vars from "../../utilities/vars.js";

const settings = function terminal_server_services_settings(dataPackage:socketData):void {
    const data:service_settings = dataPackage.data as service_settings,
        location:string = vars.path.settings + data.type,
        fileName:string = `${location}-${Math.random()}.json`,
        settings:ui_data = (data.type === "configuration")
            ? data.settings as ui_data
            : null,
        changeName = function terminal_server_services_settings_changeName():void {
            rename(fileName, `${location}.json`, function terminal_server_services_settings_rename_renameNode(erName:Error):void {
                if (erName !== null) {
                    unlink(fileName, function terminal_server_services_settings_rename_renameNode_unlink():void {
                        return;
                    });
                }
                if (vars.test.type === "service" && dataPackage.service === "settings") {
                    service.evaluation(dataPackage);
                }
            });
        },
        writeCallback = function terminal_server_services_settings_writeCallback(erSettings:Error):void {
            if (erSettings === null) {
                if (data.type === "configuration") {
                    if (vars.test.type === "") {
                        vars.settings.brotli = settings.brotli;
                        vars.settings.hashType = settings.hashType;
                        vars.settings.hashUser = settings.hashUser;
                        vars.settings.nameUser = settings.nameUser;
                        if (vars.settings.hashDevice === "") {
                            vars.settings.hashDevice = settings.hashDevice;
                            vars.settings.nameDevice = settings.nameDevice;
                        }
                    }
                } else if (vars.test.type === "" && (data.type === "device" || data.type === "user")) {
                    const agents:agents = data.settings as agents;
                    vars.settings[data.type] = agents;
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
    if (vars.test.type === "service") {
        writeCallback(null);
    } else {
        if (data.type !== "configuration") {
            writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
        } else if (settings.storage === "") {
            settings.storage = `${vars.path.project}lib${vars.path.sep}storage${vars.path.sep}`;
            vars.settings.storage = settings.storage;
            writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
        } else {
            stat(settings.storage, function terminal_server_services_settings_storageStat(storageError:NodeJS.ErrnoException):void {
                if (storageError === null) {
                    if (settings.storage.charAt(settings.storage.length - 1) !== vars.path.sep) {
                        settings.storage = settings.storage + vars.path.sep;
                    }
                    vars.settings.storage = settings.storage;
                } else {
                    settings.storage = vars.settings.storage;
                }
                writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
            });
        }
    }
};

export default settings;