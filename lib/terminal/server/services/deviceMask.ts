
/* lib/terminal/server/services/deviceMask - A library to mask/unmask masked device identities communicated between different users. */

import hash from "../../commands/library/hash.js";
import vars from "../../utilities/vars.js";

/**
 * Methods to mask or unmask a device identity between users.
 * ```typescript
 * interface module_deviceMask {
 *     mask: (agent:fileAgent, callback:(hashMask:string) => void) => void; // Converts a device identity into a new hash of 141 character length.
 *     resolve: (agent:fileAgent) => string;                                // Resolves a device identifier from a share for the current local user.
 *     token: (date:string, device:string) => string;                       // Provides a uniform sample to hash for creating or comparing device masks.
 *     unmask: (mask:string, callback:(device:string) => void) => void;     // Compares a temporary 141 character device identity against owned devices to determine validity of share permissions.
 * }
 * ``` */
const deviceMask:module_deviceMask = {
    mask: function terminal_server_services_deviceMask_mask(agent:fileAgent, callback:(hashMask:string) => void):void {
        const date:string = Date.now().toString(),
            hashInput:config_command_hash = {
                algorithm: "sha3-512",
                callback: function terminal_server_services_routeFileSystem_hashInput(title:string, hashOutput:hash_output):void {
                    agent.device = date + hashOutput.hash;
                    callback(agent.device);
                },
                digest: "hex",
                directInput: true,
                id: null,
                list: false,
                parent: null,
                source: deviceMask.token(date, deviceMask.resolve(agent)),
                stat: null
            };
        if (agent.device.length === 141 || agent.device === "" || agent.user !== vars.identity.hashUser) {
            callback(agent.device);
        } else {
            hash(hashInput);
        }
    },
    resolve: function terminal_server_services_deviceMask_resolve(agent:fileAgent):string {
        if (agent === null || agent.user !== vars.identity.hashUser) {
            return null;
        }
        if (agent.device === "") {
            const devices:string[] = Object.keys(vars.agents.device);
            let index:number = devices.length;
            do {
                index = index - 1;
                if (vars.agents.device[devices[index]].shares[agent.share] !== undefined) {
                    return devices[index];
                }
            } while (index > 0);
            return null;
        }
        return agent.device;
    },
    token: function terminal_server_services_deviceMask_token(date:string, device:string):string {
        return date + vars.identity.hashUser + device;
    },
    unmask: function terminal_server_services_deviceMask_unmask(mask:string, callback:(device:string) => void):void {
        if (mask.length === 141) {
            const date:string = mask.slice(0, 13),
                devices:string[] = Object.keys(vars.agents.device),
                hashInput:config_command_hash = {
                    algorithm: "sha3-512",
                    callback: function terminal_server_services_deviceMask_unmask_hashCallback(title:string, hashOutput:hash_output):void {
                        if (date + hashOutput.hash === mask) {
                            callback(devices[index]);
                        } else {
                            index = index - 1;
                            if (index > -1) {
                                hashInput.source = deviceMask.token(date, devices[index]);
                                hash(hashInput);
                            } else {
                                callback("");
                            }
                        }
                    },
                    digest: "hex",
                    directInput: true,
                    id: "string",
                    list: false,
                    parent: null,
                    source: "",
                    stat: null
                };
            let index:number = devices.length - 1;
            hashInput.source = deviceMask.token(date, devices[index]);
            hash(hashInput);
        } else {
            callback(mask);
        }
    }
};

export default deviceMask;