
/* lib/terminal/server/services/settings - A library for writing data to settings. */

import error from "../../utilities/error.js";
import node from "../../utilities/node.js";
import service from "../../test/application/service.js";
import vars from "../../utilities/vars.js";

const settings = function terminal_server_services_settings(dataPackage:socketData):void {
    const data:service_settings = dataPackage.data as service_settings,
        location:string = vars.path.settings + data.type,
        fileName:string = `${location}-${Math.random()}.json`,
        settingsData:ui_data = (data.type === "ui")
            ? data.settings as ui_data
            : null,
        changeName = function terminal_server_services_settings_changeName():void {
            node.fs.rename(fileName, `${location}.json`, function terminal_server_services_settings_rename_renameNode(erName:node_error):void {
                if (erName !== null) {
                    node.fs.unlink(fileName, function terminal_server_services_settings_rename_renameNode_unlink():void {
                        vars.terminal.tempCount = vars.terminal.tempCount - 1;
                        return;
                    });
                }
                if (vars.test.type === "service" && dataPackage.service === "settings") {
                    service.evaluation(dataPackage);
                }
            });
        },
        writeCallback = function terminal_server_services_settings_writeCallback(erSettings:node_error):void {
            if (erSettings === null) {
                if (data.type === "ui") {
                    vars.settings.ui = settingsData;
                } else if (vars.test.type === "" && (data.type === "device" || data.type === "user")) {
                    const agents:agents = data.settings as agents;
                    vars.agents[data.type] = agents;
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
    } else if (vars.terminal.tempCount < 10) {
        if (data.type !== "ui") {
            node.fs.writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
            vars.terminal.tempCount = vars.terminal.tempCount + 1;
        } else if (settingsData.storage === "" || settingsData.storage === undefined) {
            settingsData.storage = `${vars.path.project}lib${vars.path.sep}storage${vars.path.sep}`;
            vars.settings.ui.storage = settingsData.storage;
            node.fs.writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
            vars.terminal.tempCount = vars.terminal.tempCount + 1;
        } else {
            node.fs.stat(settingsData.storage, function terminal_server_services_settings_storageStat(storageError:node_error):void {
                if (storageError === null) {
                    if (settingsData.storage.charAt(settingsData.storage.length - 1) !== vars.path.sep) {
                        settingsData.storage = settingsData.storage + vars.path.sep;
                    }
                    vars.settings.ui.storage = settingsData.storage;
                } else {
                    settingsData.storage = vars.settings.ui.storage;
                }
                node.fs.writeFile(fileName, JSON.stringify(data.settings), "utf8", writeCallback);
                vars.terminal.tempCount = vars.terminal.tempCount + 1;
            });
        }
    }
};

export default settings;