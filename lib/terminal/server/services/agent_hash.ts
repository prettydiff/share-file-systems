

/* lib/terminal/server/services/agent_hash - A library for creating a new user/device identification. */

import hash from "../../commands/library/hash.js";
import node from "../../utilities/node.js";
import sender from "../transmission/sender.js";
import settings from "./settings.js";
import vars from "../../utilities/vars.js";

const hashAgent = function terminal_server_services_hashAgent(socketData:socketData):void {
    const hashData:service_agentHash = socketData.data as service_agentHash,
        callbackUser = function terminal_server_services_hashUser(title:string, hashUser:hash_output):void {
            const callbackDevice = function terminal_server_services_hashUser_hashAgent(title:string, hashAgent:hash_output):void {
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
                    ecdhUser:node_crypto_ECDH = node.crypto.createECDH("sect571k1"),
                    ecdhDevice:node_crypto_ECDH = node.crypto.createECDH("sect571k1");
                ecdhUser.generateKeys();
                ecdhDevice.generateKeys();
                vars.identity = {
                    hashDevice: hashAgent.hash,
                    hashUser: hashUser.hash,
                    keyDevicePrivate: ecdhDevice.getPrivateKey("hex"),
                    keyDevicePublic: ecdhDevice.getPublicKey("hex"),
                    keyUserPrivate: ecdhUser.getPrivateKey("hex"),
                    keyUserPublic: ecdhUser.getPublicKey("hex"),
                    nameDevice: hashData.device,
                    nameUser: hashData.user
                };
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