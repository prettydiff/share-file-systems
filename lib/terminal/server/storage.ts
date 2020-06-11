
/* lib/terminal/server/storage - A library for writing data to storage. */
import { ServerResponse } from "http";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import response from "./response.js";
import serverVars from "./serverVars.js";

const storage = function terminal_server_storage(dataString:string, serverResponse:ServerResponse, task:storageType):void {
    const location:string = serverVars.storage + vars.sep + task,
        fileName:string = `${location}-${Math.random()}.json`,
        rename = function terminal_server_storage_rename():void {
            vars.testLogger("storage", "rename", "Storage file is renamed from random name to proper name to reduce the potential of write collisions.");
            if (vars.command.indexOf("test") === 0) {
                response(serverResponse, "text/plain", `${task} storage written with false response for testing.`);
            } else {
                vars.node.fs.rename(fileName, `${location}.json`, function terminal_server_storage_renameNode(erName:Error) {
                    if (erName !== null) {
                        error([erName.toString()]);
                        vars.node.fs.unlink(fileName, function terminal_server_storage_rename_renameNode_unlink(erUnlink:Error) {
                            if (erUnlink !== null) {
                                error([erUnlink.toString()]);
                            }
                        });
                        response(serverResponse, "text/plain", erName.toString());
                        return;
                    }
                    response(serverResponse, "text/plain", `${task} written`);
                });
            }
        },
        writeCallback = function terminal_server_storage_writeStorage(erSettings:Error):void {
            vars.testLogger("storage", "writeCallback", "Callback for writing a data storage file to disk with a random name.");
            if (erSettings !== null) {
                error([erSettings.toString()]);
                log([erSettings.toString()]);
                response(serverResponse, "text/plain", erSettings.toString());
                return;
            }
            if (task === "settings") {
                const settings:ui_data = parsed.settings;
                if (vars.command.indexOf("test") !== 0) {
                    serverVars.brotli = settings.brotli;
                    serverVars.hashType = settings.hashType;
                    if (serverVars.hashDevice === "") {
                        serverVars.hashDevice = settings.hashDevice;
                        serverVars.hashUser = settings.hashUser;
                        serverVars.nameDevice = settings.nameDevice;
                        serverVars.nameUser = settings.nameUser;
                    }
                }
                rename();
            } else {
                rename();
            }
        };
    let parsed:storage = JSON.parse(dataString);
    vars.testLogger("storage", "", `Write application data to disk for type ${task}`);
    if (parsed[task] === undefined) {
        error([`Attempted to write undefined to storage for task: ${task}`]);
    } else if (vars.command.indexOf("test") === 0) {
        writeCallback(null);
    } else {
        vars.node.fs.writeFile(fileName, JSON.stringify(parsed[task]), "utf8", writeCallback);
    }
};

export default storage;