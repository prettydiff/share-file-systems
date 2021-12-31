
/* lib/terminal/fileService/userPermissions - Determines if the request from a different user complies with current share permissions. */

import deviceMask from "../server/services/deviceMask.js";
import serverVars from "../server/serverVars.js";

const userPermissions = function terminal_fileService_userPermissions(agent:fileAgent, action:actionFile|"copy"|"cut", callback:(device:string) => void):void {
    deviceMask.unmask(agent.device, function terminal_fileService_userPermissions_unmask(device:string):void {
        if (serverVars.device[device].shares[agent.share].readOnly === true && (action === "copy" || action === "cut" || action === "fs-destroy" || action === "fs-new" || action === "fs-rename" || action === "fs-write")) {
            // respond(`Action ${config.action.replace("fs-", "")} is not allowed as this location is in a read only share.`, "readOnly");
            // return to agentRequest
            return;
        }
        callback(device);
    });
};

export default userPermissions;