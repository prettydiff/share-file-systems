
/* lib/terminal/fileService/user - Manages user security permissions. */

import response from "../server/response.js";
import serverVars from "../server/serverVars.js";

const user = function terminal_fileService_user(config:fileUser):void {
    let shares:string[],
        share:agentShare,
        shareLength:number;
    const respond = function terminal_fileService_user_respond(message:string, type:"missing"|"noShare"|"readOnly"):void {
            const status:fileStatusMessage = {
                address: config.location,
                agent: serverVars.hashUser,
                agentType: "user",
                fileList: type,
                message: message
            };
            response({
                message: JSON.stringify(status),
                mimeType: "application/json",
                responseType: "fs",
                serverResponse: config.serverResponse
            });
        },
        shareSort = function terminal_fileService_user_shareSort(a:string, b:string):-1|1 {
            if (serverVars.device[targetDevice].shares[a].name.length < serverVars.device[targetDevice].shares[b].name.length) {
                return 1;
            }
            return -1;
        },
        targetDevice:string = (function terminal_fileService_user_findDevice():string {
            const devices:string[] = Object.keys(serverVars.device);
            let deviceLength:number = devices.length;
            do {
                deviceLength = deviceLength - 1;
                shares = Object.keys(serverVars.device[devices[deviceLength]].shares);
                shareLength = shares.length;
                do {
                    shareLength = shareLength - 1;
                    if (shares[shareLength] === config.share) {
                        return devices[deviceLength];
                    }
                } while (shareLength > 0);
            } while (deviceLength > 0);
            return "";
        }());

    if (targetDevice === "") {
        respond(`User ${serverVars.nameUser} does not have share ${config.share}.`, "noShare");
        config.callback(null);
        return;
    }

    shares = Object.keys(serverVars.device[targetDevice].shares);
    shares.sort(shareSort);
    shareLength = shares.length;
    do {
        shareLength = shareLength - 1;
        share = serverVars.device[targetDevice].shares[shares[shareLength]];
        if (config.location.indexOf(share.name) === 0) {
            if (share.readOnly === true && (config.action === "copy" || config.action === "cut" || config.action === "fs-destroy" || config.action === "fs-new" || config.action === "fs-rename" || config.action === "fs-write")) {
                respond(`Action ${config.action.replace("fs-", "")} is not allowed as location ${config.location} is in read only share ${shares[shareLength]}.`, "readOnly");
                config.callback(null);
                return;
            }
            config.callback(targetDevice);
            return;
        }
    } while (shareLength > 0);
    respond(`Location ${config.location} of user ${serverVars.nameUser} is not in a share on the target device.`, "noShare");
    config.callback(null);
};

export default user;