
/* lib/terminal/server/storage - A library for writing data to storage. */
import { ServerResponse } from "http";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import serverVars from "./serverVars.js";

const library = {
        error: error,
        log: log
    },
    storage = function terminal_server_storage(dataString:string, response:ServerResponse | "", task:storageType):void {
        const fileName:string = `${vars.projectPath}storage${vars.sep + task}-${Math.random()}.json`,
            rename = function terminal_server_storage_rename():void {
                const respond = function terminal_server_storage_rename_respond(message:string):void {
                    if (response !== "") {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.write(message);
                        response.end();
                    }
                };
                if (vars.command.indexOf("test") === 0) {
                    respond(`${task} written with false response for testing.`);
                } else {
                    vars.node.fs.rename(fileName, `${vars.projectPath}storage${vars.sep + task}.json`, function terminal_server_storage_renameNode(erName:Error) {
                        if (erName !== null) {
                            library.error([erName.toString()]);
                            vars.node.fs.unlink(fileName, function terminal_server_storage_rename_renameNode_unlink(erUnlink:Error) {
                                if (erUnlink !== null) {
                                    library.error([erUnlink.toString()]);
                                }
                            });
                            respond(erName.toString());
                            return;
                        }
                        respond(`${task} written.`);
                    });
                }
            },
            writeCallback = function terminal_server_storage_writeStorage(erSettings:Error):void {
                if (erSettings !== null) {
                    library.error([erSettings.toString()]);
                    library.log([erSettings.toString()]);
                    if (response !== "") {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.write(erSettings.toString());
                        response.end();
                    }
                    return;
                }
                if (task === "settings") {
                    const settings:ui_data = parsed.settings;
                    if (vars.command.indexOf("test") !== 0) {
                        serverVars.brotli = settings.brotli;
                        serverVars.hash = settings.hash;
                    }
                    rename();
                } else {
                    rename();
                }
            };
        let parsed:storage = JSON.parse(dataString);
        if (vars.command.indexOf("test") === 0) {
            writeCallback(null);
        } else {
            vars.node.fs.writeFile(fileName, JSON.stringify(parsed[task]), "utf8", writeCallback);
        }
    };

export default storage;