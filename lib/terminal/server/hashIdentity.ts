
/* lib/terminal/server/hashIdentity - Compares a security token to a generated hash to bypass typical file service security restrictions */

import { Hash } from "crypto";

import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const hashIdentity = function terminal_server_hashIdentity(token:string, callback:(result:string) => void):void {
    const devices:string[] = Object.keys(serverVars.device);
    let length:number = devices.length,
        hash:Hash;
    do {
        length = length - 1;
        hash = vars.node.crypto.createHash(serverVars.hashUser + devices[length]);
        if (hash.digest("hex") === token) {
            callback(devices[length]);
            return;
        }
    } while (length > 0);
    callback("");
};

export default hashIdentity;