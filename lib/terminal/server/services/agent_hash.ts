

/* lib/terminal/server/services/agent_hash - A library for creating a new user/device identification. */

import error from "../../utilities/error.js";
import hash from "../../commands/library/hash.js";
import node from "../../utilities/node.js";
import sender from "../transmission/sender.js";
import settings from "./settings.js";
import vars from "../../utilities/vars.js";

const hashAgent = function terminal_server_services_hashAgent(socketData:socketData):void {
    let certificate:string = "";
    const hashData:service_agentHash = socketData.data as service_agentHash,
        flags:flagList = {
            device: false,
            file: false,
            hash: false,
            user: false
        },
        callbackFile = function terminal_server_services_hashAgent(fileError:node_error, fileData:Buffer):void {
            if (fileError === null) {
                certificate = fileData.toString();
                flags.file = true;
                if (flags.file === true && flags.hash === true) {
                    secrets();
                }
            } else {
                error(["Failed to read certificate file."], fileError);
            }
        },
        callbackUser = function terminal_server_services_hashAgent_user(title:string, hashUser:hash_output):void {
            const callbackDevice = function terminal_server_services_hashAgent_user_device(title:string, hashAgent:hash_output):void {
                vars.identity = {
                    hashDevice: hashAgent.hash,
                    hashUser: hashUser.hash,
                    nameDevice: hashData.device,
                    nameUser: hashData.user,
                    secretDevice: null,
                    secretUser: null
                };
                flags.hash = true;
                if (flags.file === true && flags.hash === true) {
                    secrets();
                }
            };
            input.callback = callbackDevice;
            input.source = hashUser.hash + hashData.device;
            hash(input);
        },
        secrets = function terminal_server_services_hashAgent_secrets():void {
            const callbackSecret = function terminal_server_services_hashAgent_secrets_callbackSecret(title:string, secret:hash_output):void {
                if (secret.id === "device") {
                    vars.identity.secretDevice = secret.hash;
                } else {
                    vars.identity.secretUser = secret.hash;
                }
                if (vars.identity.secretDevice !== null && vars.identity.secretUser !== null) {
                    const deviceData:deviceData = {
                            cpuCores: node.os.cpus().length,
                            cpuID: node.os.cpus()[0].model,
                            platform: process.platform,
                            memTotal: node.os.totalmem(),
                            osType: node.os.type(),
                            osVersion: node.os.release()
                        },
                        hashes:service_agentHash = {
                            device: vars.identity.hashDevice,
                            deviceData: deviceData,
                            user: vars.identity.hashUser
                        };
                    vars.agents.device[vars.identity.hashDevice] = {
                        deviceData: deviceData,
                        ipAll: vars.network.addresses,
                        ipSelected: "",
                        name: hashData.device,
                        ports: vars.network.ports,
                        secret: vars.identity.secretDevice,
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
            };
            input.callback = callbackSecret;
            input.source = certificate + vars.identity.hashDevice;
            input.id = "device";
            hash(input);
            input.source = certificate + vars.identity.hashUser;
            input.id = "user";
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
    node.fs.readFile(`${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}share-file.crt`, callbackFile);
};

export default hashAgent;