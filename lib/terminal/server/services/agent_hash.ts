

/* lib/terminal/server/services/agent_hash - A library for creating a new user/device identification. */

import { cpus, hostname, release, totalmem, type } from "os";

import hash from "../../commands/hash.js";
import sender from "../transmission/sender.js";
import settings from "./settings.js";
import vars from "../../utilities/vars.js";

const hashAgent = function terminal_server_services_hashAgent(socketData:socketData):void {
    const hashData:service_agentHash = socketData.data as service_agentHash,
        callbackUser = function terminal_server_services_hashUser(hashUser:hashOutput):void {
            const callbackDevice = function terminal_server_services_hashUser_hashAgent(hashAgent:hashOutput):void {
                const deviceData:deviceData = {
                        cpuCores: cpus().length,
                        cpuID: cpus()[0].model,
                        platform: process.platform,
                        memTotal: totalmem(),
                        osType: type(),
                        osVersion: release()
                    },
                    hashes:service_agentHash = {
                        device: hashAgent.hash,
                        deviceData: deviceData,
                        user: hashUser.hash
                    };
                vars.settings.hashDevice = hashAgent.hash;
                vars.settings.nameDevice = hashData.device;
                vars.settings.device[vars.settings.hashDevice] = {
                    deviceData: deviceData,
                    ipAll: vars.environment.addresses,
                    ipSelected: "",
                    name: hashData.device,
                    ports: vars.environment.ports,
                    shares: {},
                    status: "active"
                };
                settings({
                    data: {
                        settings: vars.settings.device,
                        type: "device"
                    },
                    service: "settings"
                });
                sender.broadcast({
                    data: hashes,
                    service: "agent-hash"
                }, "browser");
            };
            vars.settings.hashUser = hashUser.hash;
            vars.settings.nameUser = hashData.user;
            input.callback = callbackDevice;
            input.source = hashUser.hash + hashData.device;
            hash(input);
        },
        input:config_command_hash = {
            algorithm: "sha3-512",
            callback: callbackUser,
            directInput: true,
            source: hashData.user + hostname() + process.env.os + process.hrtime.bigint().toString()
        };
    hash(input);
};

export default hashAgent;