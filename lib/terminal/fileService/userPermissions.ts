
/* lib/terminal/fileService/userPermissions - Determines if the request from a different user complies with current share permissions. */

import serverVars from "../server/serverVars.js";
import unmask from "./unmask.js";

const userPermissions = function terminal_fileService_userPermissions(agent:fileAgent, action:fileAction|"copy"|"cut", callback:(device:string) => void):void {
    unmask(agent.device, function terminal_fileService_userPermissions_unmask(device:string):void {
        if (serverVars.device[device].shares[agent.share].readOnly === true && (action === "copy" || action === "cut" || action === "fs-destroy" || action === "fs-new" || action === "fs-rename" || action === "fs-write")) {
            // respond(`Action ${config.action.replace("fs-", "")} is not allowed as this location is in a read only share.`, "readOnly");
            // return to agentRequest
            return;
        }
        callback(device);
    });
};

export default userPermissions;