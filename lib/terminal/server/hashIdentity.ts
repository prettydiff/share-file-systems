
/* lib/terminal/server/hashIdentity - Compares a security token to a generated hash to bypass typical file service security restrictions */

import { Hash } from "crypto";
import { ReadStream } from "fs";

import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const hashIdentity = function terminal_server_hashIdentity(token:string, callback:(result:string) => void):void {
    const devices:string[] = Object.keys(serverVars.device),
        hashFunction = function terminal_server_hashIdentity_hashFunction() {
            const hash:Hash = vars.node.crypto.createHash("sha3-512");
            hash.update(serverVars.hashUser + devices[length]);
            if (hash.digest("hex") === token) {
                callback(devices[length]);
            } else if (length > 0) {
                length = length - 1;
                terminal_server_hashIdentity_hashFunction();
            } else {
                callback("");
            }
        };
    let length:number = devices.length - 1;
    hashFunction();
};

export default hashIdentity;