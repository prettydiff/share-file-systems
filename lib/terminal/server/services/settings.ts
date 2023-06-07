
/* lib/terminal/server/services/settings - A library for writing data to settings. */

import error from "../../utilities/error.js";
import node from "../../utilities/node.js";
import service from "../../test/application/service.js";
import vars from "../../utilities/vars.js";

const settings = function terminal_server_services_settings(dataPackage:socketData):void {
    const data:service_settings = dataPackage.data as service_settings,
        location:string = vars.path.settings + data.type,
        fileName:string = `${location}-${Math.random()}.json`,
        settingsData:ui_data = (data.type === "configuration")
            ? data.settings as ui_data
            : null,
        changeName = function terminal_server_services_settings_changeName():void {
            node.fs.rename(fileName, `${location}.json`, function terminal_server_services_settings_rename_renameNode(erName:Error):void {
                if (erName !== null) {
                    node.fs.unlink(fileName, function terminal_server_services_settings_rename_renameNode_unlink():void {
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
                    const configs:string[] = Object.keys(settingsData);
                    let keyLength:number = configs.length;
                    do {
                        keyLength = keyLength - 1;
                        if (configs[keyLength] !== "hashUser" && configs[keyLength] !== "nameUser" && configs[keyLength] !== "hashDevice" && configs[keyLength] !== "nameDevice") {
                            // @ts-ignore - The following line forces an implicit any, but in this dynamic assignment is lower risk than type analysis
                            // eslint-disable-next-line
                            vars.settings[configs[keyLength]] = settingsData[configs[keyLength]];
                        }
                    } while (keyLength > 0);
                    if (vars.settings.hashDevice === "") {
                        vars.settings.hashUser = settingsData.hashUser;
                        vars.settings.nameUser = settingsData.nameUser;
                        vars.settings.hashDevice = settingsData.hashDevice;
                        vars.settings.nameDevice = settingsData.nameDevice;
                    }
                } else if (vars.test.type === "" && (data.type === "device" || data.type === "user")) {
                    const agents:agents = data.settings as agents;
                    vars.settings[data.type] = agents;
                }
                changeName();
            } else {
                error([`Error writing settings type ${data.type}`], erSettings);
            }
        };
    if (data.type === undefined) {
        error(["Submitted a 'type' value of undefined to the settings utility."], null);
        return;
    }
    if (vars.test.type === "service") {
        writeCallback(null);
    } else {
        if (data.type !== "configuration") {
            node.fs.writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
        } else if (settingsData.storage === "" || settingsData.storage === undefined) {
            settingsData.storage = `${vars.path.project}lib${vars.path.sep}storage${vars.path.sep}`;
            vars.settings.storage = settingsData.storage;
            node.fs.writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
        } else {
            node.fs.stat(settingsData.storage, function terminal_server_services_settings_storageStat(storageError:NodeJS.ErrnoException):void {
                if (storageError === null) {
                    if (settingsData.storage.charAt(settingsData.storage.length - 1) !== vars.path.sep) {
                        settingsData.storage = settingsData.storage + vars.path.sep;
                    }
                    vars.settings.storage = settingsData.storage;
                } else {
                    settingsData.storage = vars.settings.storage;
                }
                node.fs.writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
            });
        }
    }
};

export default settings;