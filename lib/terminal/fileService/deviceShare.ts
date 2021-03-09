/* lib/terminal/fileService/deviceShare - Creates a one time password as a hash to serve as a share identifier for a user's device that is otherwise not exposed. */

import hash from "../commands/hash.js";
import serverVars from "../server/serverVars.js";

const deviceShare = function terminal_fileService_deviceShare(share:string, device:string, callback:(share:string) => void):void {
    if (share === "") {
        // create a temporary share
        // * returns a new share hash of 141 characters

        const date:string = String(Date.now()),
            hashSource:string = date + device,
            hashInput:hashInput = {
                callback: function terminal_fileService_deviceShare_hashInput(hashOutput:hashOutput):void {
                    callback(date + hashOutput.hash);
                },
                directInput: true,
                source: hashSource
            };
        hash(hashInput);
    } else if (share.length === 141) {
        // find a device from a temporary share (141 characters)
        // * returns a matching device hash (128 characters)

        const dateString:string = share.slice(0, 13),
            date:number = Number(dateString);
        // date is greater than 7 January 2021 and within an hour of temporary share
        if (dateString.length === 13 && date > 161e10 && Date.now() < date + 3600000) {
            const devices:string[] = Object.keys(serverVars.device),
                hashInput:hashInput = {
                    callback: function terminal_fileService_deviceShare_hashCompare(hashOutput:hashOutput):void {
                        if (share === dateString + hashOutput.hash) {
                            callback(devices[deviceLength]);
                        } else {
                            deviceLength = deviceLength - 1;
                            if (deviceLength < 0) {
                                callback("");
                            } else {
                                hashInput.source = dateString + devices[deviceLength];
                                hash(hashInput);
                            }
                        }
                    },
                    directInput: true,
                    source: ""
                };
            let deviceLength:number = devices.length - 1;
            hashInput.source = dateString + devices[deviceLength];
            hash(hashInput);
        } else {
            callback("");
        }
    } else if (share.length === 128) {
        // find a device from a standard share (128 characters)
        // * returns a matching device hash (128 characters)

        const devices:string[] = Object.keys(serverVars.device);
        let deviceLength:number = devices.length;
        do {
            deviceLength = deviceLength - 1;
            // test that share hash is a name of the device's shares
            if (Object.keys(serverVars.device[devices[deviceLength]].shares).indexOf(share) > -1) {
                callback(devices[deviceLength]);
                return;
            }
        } while (deviceLength > 0);
        callback("");
    } else {
        // unsupported area

        callback("");
    }
};

export default deviceShare;