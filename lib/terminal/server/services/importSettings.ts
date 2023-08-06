/* lib/terminal/server/services/importSettings - Allows importing of settings data in base64 format. */

import base64 from "../../commands/library/base64.js";
import filePathDecode from "../../test/application/browserUtilities/file_path_decode.js";
import sender from "../transmission/sender.js";
import settings from "./settings.js";
import vars from "../../utilities/vars.js";

const importSettings = function terminal_server_services_importSettings(socketData:socketData):void {
    const data:string = socketData.data as string,
        base64Callback = function terminal_server_services_importSettings_base64Callback(title:string, output:base64Output):void {
            const settingsString:string = output.base64;
            if (settingsString.charAt(0) === "{" && settingsString.charAt(settingsString.length - 1) === "}" && settingsString.indexOf("\"agents\"") > 0 && settingsString.indexOf("\"queue\"") > 0) {
                if (vars.test.type.indexOf("browser") < 0) {
                    const importData:exportData = JSON.parse(settingsString),
                        keys:string[] = Object.keys(importData.settings);
                    let index:number = keys.length;
                    vars.agents = importData.agents;
                    vars.identity = importData.identity;
                    do {
                        index = index - 1;
                        // @ts-ignore string type keys[index] cannot map to the specified key names of the settings object
                        if (importData.settings[keys[index]] !== null) {
                            // @ts-ignore string type keys[index] cannot map to the specified key names of the settings object
                            vars.settings[keys[index]] = importData.settings[keys[index]];
                        }
                    } while (index > 0);
                    settings({
                        data: {
                            settings: vars.agents.device,
                            type: "device"
                        },
                        service: "settings"
                    });
                    settings({
                        data: {
                            settings: vars.identity,
                            type: "identity"
                        },
                        service: "settings"
                    });
                    settings({
                        data: {
                            settings: vars.settings.ui,
                            type: "message"
                        },
                        service: "settings"
                    });
                    settings({
                        data: {
                            settings: vars.settings.queue,
                            type: "queue"
                        },
                        service: "settings"
                    });
                    settings({
                        data: {
                            settings: vars.agents.user,
                            type: "user"
                        },
                        service: "settings"
                    });
                } else {
                    const importData:exportData = (JSON.parse(
                            filePathDecode(null, settingsString
                                .replace(/string-replace-hash-hashDevice/g, vars.identity.hashDevice)
                                .replace(/string-replace-hash-hashUser/g, vars.identity.hashUser)
                            ) as string)
                        );
                    importData.settings.ui = importData.settings.ui;
                    vars.settings.ui = importData.settings.ui;
                }
                settings({
                    data: {
                        settings: vars.settings.ui,
                        type: "ui"
                    },
                    service: "settings"
                });
                sender.broadcast({
                    data: "",
                    service: "reload"
                }, "browser");
            }
        },
        base64Config:config_command_base64 = {
            callback: base64Callback,
            direction: "decode",
            id: "",
            source: `string:${data}`
        };
    base64(base64Config);
};

export default importSettings;