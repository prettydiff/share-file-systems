
/* lib/terminal/server/services/deviceMask - A library to mask/unmask masked device identities communicated between different users. */

import hash from "../../commands/hash.js";
import vars from "../../utilities/vars.js";

/**
 * Methods to mask or unmask a device identity between users.
 * ```typescript
 * interface module_deviceMask {
 *     mask: (agent:fileAgent, key:string, callback:(key:string) => void) => void; // Converts a device identity into a new hash of 141 character length.
 *     resolve: (agent:fileAgent) => string; // Resolves a device identifier from a share for the current local user.
 *     unmask: (mask:string, copyAgent:copyAgent, callback:(device:string, copyAgent:copyAgent) => void) => void; // Compares a temporary 141 character device identity against owned devices to determine validity of share permissions.
 * }
 * ``` */
const deviceMask:module_deviceMask = {
    mask: function terminal_server_services_deviceMask_mask(agent:fileAgent, key:string, callback:(key:string) => void):void {
        const date:string = Date.now().toString(),
            device:string = deviceMask.resolve(agent),
            hashInput:config_command_hash = {
                callback: function terminal_server_services_routeFileSystem_hashInput(hashOutput:hash_output):void {
                    agent.device = date + hashOutput.hash;
                    callback(key);
                },
                directInput: true,
                source: date + device
            };
        if (agent.device.length === 141 || agent.user !== vars.settings.hashUser) {
            callback(key);
        } else {
            hash(hashInput);
        }
    },
    resolve: function terminal_server_services_deviceMask_resolve(agent:fileAgent):string {
        if (agent === null || agent.user !== vars.settings.hashUser) {
            return null;
        }
        if (agent.device === "") {
            const devices:string[] = Object.keys(vars.settings.device);
            let index:number = devices.length;
            do {
                index = index - 1;
                if (vars.settings.device[devices[index]].shares[agent.share] !== undefined) {
                    return devices[index];
                }
            } while (index > 0);
            return null;
        }
        return agent.device;
    },
    unmask: function terminal_server_services_deviceMask_unmask(mask:string, copyAgent:copyAgent, callback:(device:string, copyAgent:copyAgent) => void):void {
        if (mask.length === 141) {
            const date:string = mask.slice(0, 13),
                devices:string[] = Object.keys(vars.settings.device),
                hashInput:config_command_hash = {
                    callback: function terminal_server_services_deviceMask_unmask_hashCallback(hashOutput:hash_output):void {
                        if (hashOutput.hash === mask) {
                            callback(devices[index], copyAgent);
                        } else {
                            index = index - 1;
                            if (index > -1) {
                                hashInput.source = date + devices[index];
                                hash(hashInput);
                            } else {
                                callback("", copyAgent);
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
            callback(mask, copyAgent);
        }
    }
};

export default deviceMask;