
/* lib/terminal/fileService/deviceMask - A library to mask/unmask masked device identities communicated between different users. */

import hash from "../../commands/hash.js";
import serverVars from "../serverVars.js";

/**
 * Methods to mask or unmask a device identity between users.
 * * **mask** - converts a device identity into a new hash of 141 character length
 * * **unmask** - compares a temporary 141 character device identity against owned devices to determine validity of share permissions
 * 
 * ```typescript
 * interface module_deviceMask {
 *     mask: (agent:fileAgent, key:string, callback:(key:string) => void) => void;
 *     unmask: (mask:string, callback:(device:string) => void) => void;
 * }
 * ``` */
const deviceMask:module_deviceMask = {
    mask: function terminal_fileService_deviceMask_mask(agent:fileAgent, key:string, callback:(key:string) => void):void {
        const date:string = Date.now().toString(),
            device:string = (agent.device === "")
                // if device identity is not provided then find it from the share indicated
                ? (function terminal_fileService_routeFileSystem_deviceMask_device():string {
                    const devices:string[] = Object.keys(serverVars.device);
                    let index:number = devices.length;
                    do {
                        index = index - 1;
                        if (serverVars.device[devices[index]].shares[agent.share] !== undefined) {
                            return devices[index];
                        }
                    } while (index > 0);
                    return "";
                }())
                : agent.device,
            hashInput:hashInput = {
                callback: function terminal_fileService_routeFileSystem_hashInput(hashOutput:hashOutput):void {
                    agent.device = date + hashOutput.hash;
                    callback(key);
                },
                directInput: true,
                source: date + device
            };
        if (agent.device.length === 141 || agent.user !== serverVars.hashUser) {
            callback(key);
        } else {
            hash(hashInput);
        }
    },
    unmask: function terminal_fileService_deviceMask_unmask(mask:string, callback:(device:string) => void):void {
        if (mask.length === 141) {
            const date:string = mask.slice(0, 13),
                devices:string[] = Object.keys(serverVars.device),
                hashInput:hashInput = {
                    callback: function terminal_fileService_deviceMask_unmask_hashCallback(hashOutput:hashOutput):void {
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
    }
};

export default deviceMask;