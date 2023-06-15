
/* lib/terminal/server/services/fileExecute - A common file execution library used by both fileCopy and fileSystem. */

import error from "../../utilities/error.js";
import fileSystem from "./fileSystem.js";
import node from "../../utilities/node.js";
import vars from "../../utilities/vars.js";

const fileExecution = function terminal_server_services_fileExecute(pathList:fileTypeList, agentRequest:fileAgent, agentSource:fileAgent):void {
    let index:number = 0,
        counter:number = 0;
    const len:number = pathList.length,
        status:service_fileSystem_status = {
            agentRequest: agentRequest,
            agentSource: agentSource,
            fileList: null,
            message: "",
        },
        execute = function terminal_server_services_fileExecute_execute(path:string):void {
            const command:string = (vars.terminal.executionKeyword === "")
                ? `"${path}"`
                : `${vars.terminal.executionKeyword} "${path}"`;
            node.child_process.exec(command, {cwd: vars.terminal.cwd}, function terminal_server_services_fileExecution_execute(errs:node_childProcess_ExecException, stdout:string, stdError:Buffer | string):void {
                if (errs !== null && errs.message.indexOf("Access is denied.") < 0) {
                    error([`Access is denied to command: ${command}`], errs);
                    return;
                }
                if (stdError !== "" && stdError.indexOf("Access is denied.") < 0) {
                    error([
                        `Unexpected output to stderr from command: ${command}`,
                        stdError.toString()
                    ], null);
                    return;
                }
                if (counter < 10) {
                    status.message = `Opened file location ${path}`;
                    fileSystem.route({
                        data: status,
                        service: "file-system-status"
                    });
                }
            });
        };
    // to protect against execution flood only a maximum of 10 files will execute
    do {
        if (pathList[index][1] === "file") {
            execute(pathList[index][0]);
            counter = counter + 1;
            if (counter === 10) {
                break;
            }
        }
        index = index + 1;
    } while (index < len);
};

export default fileExecution;