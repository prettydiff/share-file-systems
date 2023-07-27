
/* lib/terminal/utilities/mask - A library to mask/unmask masked device identities communicated between different users. */

import hash from "../commands/library/hash.js";
import vars from "./vars.js";

/**
 * Methods to mask or unmask a device identity between users.
 * ```typescript
 * interface module_mask {
 *     fileAgent: (agent:fileAgent, callback:(key:string) => void) => void;                   // An abstraction layer specific for fileAgent data.
 *     mask: (input:string, callback:(key:string) => void) => void;                           // Converts a device identity into a new hash of 141 character length.
 *     resolve: (agent:fileAgent) => string;                                                  // Resolves a device identifier from a share for the current local user.
 *     unmaskDevice: (maskItem:string, callback:(device:string) => void) => void;             // Compares a temporary 141 character device identity against owned devices to determine validity of share permissions.
 *     unmaskToken: (maskItem:string, token:string, callback:(test:boolean) => void) => void; // Compares a 141 character masked hash against a string hashed from a date and submitted token.
 * }
 * ``` */
const mask:module_mask = {
    fileAgent: function terminal_utilities_mask_fileAgent(agent:fileAgent, callback:(key:string) => void):void {
        if (agent.device.length === 141 || agent.device === "" || agent.user !== vars.identity.hashUser) {
            callback(agent.device);
        } else {
            mask.mask(mask.resolve(agent), function terminal_utilities_mask_fileAgent_mask(key:string):void {
                agent.device = key;
                callback(agent.device);
            });
        }
    },
    mask: function terminal_utilities_mask_mask(input:string, callback:(hashMask:string) => void):void {
        const date:string = Date.now().toString(),
            hashInput:config_command_hash = {
                algorithm: "sha3-512",
                callback: function terminal_utilities_mask_mask_hash(title:string, output:hash_output):void {
                    callback(date + output.hash);
                },
                digest: "hex",
                directInput: true,
                id: null,
                list: false,
                parent: null,
                source: date + input,
                stat: null
            };
        hash(hashInput);
    },
    resolve: function terminal_utilities_mask_resolve(agent:fileAgent):string {
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
    unmaskDevice: function terminal_utilities_mask_unmaskDevice(maskItem:string, callback:(device:string) => void):void {
        if (maskItem.length === 141) {
            const date:string = maskItem.slice(0, 13),
                devices:string[] = Object.keys(vars.agents.device),
                hashInput:config_command_hash = {
                    algorithm: "sha3-512",
                    callback: function terminal_utilities_mask_unmask_hashCallback(title:string, hashOutput:hash_output):void {
                        if (date + hashOutput.hash === maskItem) {
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
                    digest: "hex",
                    directInput: true,
                    id: "string",
                    list: false,
                    parent: null,
                    source: "",
                    stat: null
                };
            let index:number = devices.length - 1;
            hashInput.source = date + devices[index];
            hash(hashInput);
        } else {
            callback(maskItem);
        }
    },
    unmaskToken: function terminal_utilities_mask_unmaskToken(maskItem:string, token:string, callback:(test:boolean) => void):void {
        const date:string = maskItem.slice(0, 13),
            dateNumber:number = Number(date),
            now:number = (Date.now() - dateNumber) / 1e6,
            hashInput:config_command_hash = {
                algorithm: "sha3-512",
                callback: function terminal_mask_unmaskToken_callback(title:string, output:hash_output):void {
                    if (date + output.hash === maskItem && ((now > 0 && now < 172.8) || (now < 0 && now > -172.8))) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                },
                digest: "hex",
                directInput: true,
                id: "string",
                list: false,
                parent: null,
                source: date + token,
                stat: null
            };
        hash(hashInput);
    }
};

export default mask;