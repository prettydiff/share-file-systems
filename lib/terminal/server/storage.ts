
import { ServerResponse } from "http";

import error from "../error.js";
import log from "../log.js";
import vars from "../vars.js";
import serverVars from "./serverVars.js";

const library = {
        error: error,
        log: log
    },
    storage = function terminal_server_storage(dataString:string, response:ServerResponse, task:string):void {
        const fileName:string = `${vars.projectPath}storage${vars.sep + task}-${Math.random()}.json`;
        vars.node.fs.writeFile(fileName, dataString, "utf8", function terminal_server_storage_writeStorage(erSettings:Error):void {
            if (erSettings !== null) {
                library.error([erSettings.toString()]);
                library.log([erSettings.toString()]);
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.write(erSettings.toString());
                response.end();
                return;
            }
            if (task === "users") {
                serverVars.users = JSON.parse(dataString);
            }
            vars.node.fs.rename(fileName, `${vars.projectPath}storage${vars.sep + task}.json`, function terminal_server_storage_writeStorage_rename(erName:Error) {
                if (erName !== null) {
                    library.error([erName.toString()]);
                    library.log([erName.toString()]);
                    vars.node.fs.unlink(fileName, function terminal_server_storage_writeStorage_rename_unlink(erUnlink:Error) {
                        if (erUnlink !== null) {
                            library.error([erUnlink.toString()]);
                        }
                    });
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(erName.toString());
                    response.end();
                    return;
                }
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.write(`${task} written.`);
                response.end();
            });
        });
    };

export default storage;