
import { IncomingMessage, ServerResponse } from "http";

import error from "../error.js";
import log from "../log.js";
import vars from "../vars.js";

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";

const library = {
        error: error,
        log: log
    },
    storage = function terminal_server_storage(dataString:string, response:ServerResponse | "noSend", task:storageType):void {
        const fileName:string = `${vars.projectPath}storage${vars.sep + task}-${Math.random()}.json`,
            rename = function terminal_server_storage_rename():void {
                vars.node.fs.rename(fileName, `${vars.projectPath}storage${vars.sep + task}.json`, function terminal_server_storage_renameNode(erName:Error) {
                    if (erName !== null) {
                        library.error([erName.toString()]);
                        vars.node.fs.unlink(fileName, function terminal_server_storage_rename_renameNode_unlink(erUnlink:Error) {
                            if (erUnlink !== null) {
                                library.error([erUnlink.toString()]);
                            }
                        });
                        if (response !== "noSend") {
                            response.writeHead(500, {"Content-Type": "text/plain"});
                            response.write(erName.toString());
                            response.end();
                        }
                        return;
                    }
                    if (response !== "noSend") {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.write(`${task} written.`);
                        response.end();
                    }
                });
            };
        vars.node.fs.writeFile(fileName, dataString, "utf8", function terminal_server_storage_writeStorage(erSettings:Error):void {
            if (erSettings !== null) {
                library.error([erSettings.toString()]);
                library.log([erSettings.toString()]);
                if (response !== "noSend") {
                    response.writeHead(200, {"Content-Type": "text/plain"});
                    response.write(erSettings.toString());
                    response.end();
                }
                return;
            }
            if (task === "users") {
                serverVars.users = JSON.parse(dataString);
                if (response !== "noSend") {
                    const keys:string[] = Object.keys(serverVars.users),
                        length:number = keys.length;
                    let a:number = 0;
                    do {
                        if (keys[a] !== "localhost") {
                            httpClient({
                                callback: function terminal_server_storage_callback():void {
                                    return;
                                },
                                callbackType: "body",
                                errorMessage: `Error on sending shares update from ${serverVars.name} to ${keys[a]}.`,
                                id: "",
                                payload:  `shareUpdate:{"user":"${serverVars.name}","shares":${JSON.stringify(serverVars.users.localhost.shares)}}`,
                                remoteName: keys[a],
                                response: response
                            });
                        }
                        a = a + 1;
                    } while (a < length);
                }
                rename();
            } else if (task === "settings") {
                const settings:ui_data = JSON.parse(dataString);
                serverVars.brotli = settings.brotli;
                rename();
            } else {
                rename();
            }
        });
    };

export default storage;