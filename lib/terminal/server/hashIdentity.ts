
/* lib/terminal/server/hashIdentity - Compares a security token to a generated hash to bypass typical file service security restrictions */

import hash from "../commands/hash.js";
import serverVars from "./serverVars.js";

const hashIdentity = function terminal_server_hashIdentity(token:string, callback:(result:string) => void):void {
    const devices:string[] = Object.keys(serverVars.device),
        hashCallback = function terminal_server_fileService_remoteUsers_hash(hashOutput:hashOutput):void {
            if (hashOutput.hash === token) {
                callback(devices[length]);
            } else if (length > 0) {
                length = length - 1;
                hash({
                    callback: terminal_server_fileService_remoteUsers_hash,
                    directInput: true,
                    source: serverVars.hashUser + devices[length]
                });
            } else {
                callback("");
            }
        };
    let length:number = devices.length - 1;
    hash({
        callback: hashCallback,
        directInput: true,
        source: serverVars.hashUser + devices[length]
    });
};

export default hashIdentity;