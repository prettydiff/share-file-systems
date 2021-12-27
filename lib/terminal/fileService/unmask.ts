
/* lib/terminal/fileService/unmask - A library to unmask masked device identities communicated between different users. */

import hash from "../commands/hash.js";
import serverVars from "../server/serverVars.js";

const unmask = function terminal_fileService_unmask(mask:string, callback:(device:string) => void):void {
    if (mask.length === 141) {
        const date:string = mask.slice(0, 13),
            devices:string[] = Object.keys(serverVars.device),
            hashInput:hashInput = {
                callback: function terminal_fileService_unmask_hashCallback(hashOutput:hashOutput):void {
                    if (hashOutput.hash === mask) {
                        callback(devices[index]);
                    } else {
                        index = index - 1;
                        if (index > -1) {
                            hashInput.source = date + devices[index];
                            hash(hashInput);
                        } else {
                            callback("");
                        }
                    }
                },
                directInput: true,
                source: ""
            };
        let index = devices.length - 1;
        hashInput.source = date + devices[index];
        hash(hashInput);
    } else {
        callback(mask);
    }
};

export default unmask;