
/* lib/terminal/fileService/user - Manages user security permissions. */

import deviceShare from "./deviceShare.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";

const user = function terminal_fileService_user(config:fileUser):void {
    const respond = function terminal_fileService_user_respond(message:string, type:"missing"|"noShare"|"readOnly"):void {
            const status:fileStatusMessage = {
                address: config.agent.modalAddress,
                agent: serverVars.hashUser,
                agentType: "user",
                fileList: type,
                message: message
            };
            response({
                message: JSON.stringify(status),
                mimeType: "application/json",
                responseType: (config.action.indexOf("fs") === 0)
                    ? "fs"
                    : "copy",
                serverResponse: config.serverResponse
            });
        };
    deviceShare(config.agent.share, "", function terminal_fileService_user_deviceShare(targetDevice:string):void {
        const device:agent = (targetDevice === "")
                ? null
                : serverVars.device[targetDevice],
            shares = (device === null)
                ? []
                : Object.keys(device.shares),
            shareSort = function terminal_fileService_user_deviceShare_shareSort(a:string, b:string):-1|1 {
                if (device.shares[a].name.length < device.shares[b].name.length) {
                    return 1;
                }
                return -1;
            },
            noShare:string = `User ${serverVars.nameUser} does not share this location.`;
        let shareLength = shares.length,
            shareItem:agentShare;

        if (targetDevice === "") {
            respond(noShare, "noShare");
            return;
        }

        shares.sort(shareSort);
        do {
            shareLength = shareLength - 1;
            shareItem = device.shares[shares[shareLength]];
            if (shareItem.readOnly === true) {
                if (config.agent.modalAddress.indexOf(shareItem.name) === 0) {
                    if (config.action === "copy" || config.action === "cut" || config.action === "fs-destroy" || config.action === "fs-new" || config.action === "fs-rename" || config.action === "fs-write") {
                        respond(`Action ${config.action.replace("fs-", "")} is not allowed as this location is in a read only share.`, "readOnly");
                        return;
                    }
                    config.callback(targetDevice);
                    return;
                }
            }
        } while (shareLength > 0);
        respond(noShare, "noShare");
    });
};

export default user;