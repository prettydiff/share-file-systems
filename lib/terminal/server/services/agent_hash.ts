

/* lib/terminal/server/services/agent_hash - A library for creating a new user/device identification. */

import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import hash from "../../commands/library/hash.js";
import node from "../../utilities/node.js";
import sender from "../transmission/sender.js";
import settings from "./settings.js";
import vars from "../../utilities/vars.js";

const hashAgent = function terminal_server_services_hashAgent(socketData:socketData):void {
    const hashData:service_agentHash = socketData.data as service_agentHash,
        callbackUser = function terminal_server_services_hashAgent_user(title:string, hashUser:hash_output):void {
            const callbackDevice = function terminal_server_services_hashAgent_user_device(title:string, hashAgent:hash_output):void {
                const deviceData:deviceData = {
                        cpuCores: node.os.cpus().length,
                        cpuID: node.os.cpus()[0].model,
                        platform: process.platform,
                        memTotal: node.os.totalmem(),
                        osType: node.os.type(),
                        osVersion: node.os.release()
                    },
                    hashes:service_agentHash = {
                        device: hashAgent.hash,
                        deviceData: deviceData,
                        user: hashUser.hash
                    },
                    flags:flagList = {
                        device: false,
                        user: false
                    },
                    keyCallback = function terminal_server_services_hashAgent_user_device_keyCallback(type:agentType, keyPrivate:Buffer, keyPublic:Buffer):void {
                        const namePrivate:"keyDevicePrivate" = `key${common.capitalize(type)}Private` as "keyDevicePrivate",
                            namePublic:"keyDevicePublic" = `key${common.capitalize(type)}Public` as "keyDevicePublic";
                        vars.identity[namePrivate] = keyPrivate.toString();
                        vars.identity[namePublic] = keyPublic.toString();
                        flags[type] = true;
                        if (flags.device === true && flags.user === true) {
                            vars.agents.device[hashAgent.hash] = {
                                deviceData: deviceData,
                                ipAll: vars.network.addresses,
                                ipSelected: "",
                                name: hashData.device,
                                ports: vars.network.ports,
                                publicKey: vars.identity.keyDevicePublic,
                                shares: {},
                                status: "idle"
                            };
                            settings({
                                data: {
                                    settings: vars.agents.device,
                                    type: "device"
                                },
                                service: "settings"
                            });
                            settings({
                                data: {
                                    settings: vars.identity,
                                    type: "identity"
                                },
                                service: "settings"
                            });
                            sender.broadcast({
                                data: hashes,
                                service: "agent-hash"
                            }, "browser");
                        }
                    },
                    keyDevice = function terminal_server_services_hashAgent_user_device_keyDevice(keyError:node_error, keyPublic:Buffer, keyPrivate:Buffer):void {
                        if (keyError === null) {
                            keyCallback("device", keyPrivate, keyPublic);
                        } else {
                            error(["Error creating device key pair in hashAgent library."], keyError);
                        }
                    },
                    keyUser = function terminal_server_services_hashAgent_user_device_keyUser(keyError:node_error, keyPublic:Buffer, keyPrivate:Buffer):void {
                        if (keyError === null) {
                            keyCallback("user", keyPrivate, keyPublic);
                        } else {
                            error(["Error creating user key pair in hashAgent library."], keyError);
                        }
                    },
                    options:node_crypto_RSAKeyPairOptions = {
                        modulusLength: 4096,
                        privateKeyEncoding: {
                            cipher: "aes-256-cbc",
                            format: "pem",
                            passphrase: hashAgent.hash,
                            type: "pkcs8"
                        },
                        publicExponent: 0x10111,
                        publicKeyEncoding: {
                            format: "pem",
                            type: "spki"
                        }
                    };
                vars.identity = {
                    hashDevice: hashAgent.hash,
                    hashUser: hashUser.hash,
                    keyDevicePrivate: null,
                    keyDevicePublic: null,
                    keyUserPrivate: null,
                    keyUserPublic: null,
                    nameDevice: hashData.device,
                    nameUser: hashData.user
                };
                // @ts-ignore - Bad TypeScript definition: @types/node, crypto.d.ts - The TypeScript definitions for generateKeyPair are too overloaded for this method to compile correctly.
                node.crypto.generateKeyPair("rsa", options, keyDevice);
                // @ts-ignore - Bad TypeScript definition: @types/node, crypto.d.ts - The TypeScript definitions for generateKeyPair are too overloaded for this method to compile correctly.
                node.crypto.generateKeyPair("rsa", options, keyUser);
            };
            input.callback = callbackDevice;
            input.source = hashUser.hash + hashData.device;
            hash(input);
        },
        input:config_command_hash = {
            algorithm: "sha3-512",
            callback: callbackUser,
            digest: "hex",
            directInput: true,
            id: null,
            list: false,
            parent: null,
            source: hashData.user + node.os.hostname() + process.env.os + process.hrtime.bigint().toString(),
            stat: null
        };
    hash(input);
};

export default hashAgent;