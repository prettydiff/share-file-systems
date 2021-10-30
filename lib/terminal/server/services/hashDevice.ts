

/* lib/terminal/server/services/hashDevice - A library for creating a new user/device identification. */

import { cpus, hostname, release, totalmem, type } from "os";

import hash from "../../commands/hash.js";
import responder from "../responder.js";
import serverVars from "../serverVars.js";
import settings from "./settings.js";

const hashDevice = function terminal_server_services_hashDevice(socketData:socketData, transmit:transmit):void {
    const hashData:hashAgent = socketData.data as hashAgent,
        callbackUser = function terminal_server_services_hashUser(hashUser:hashOutput):void {
            const callbackDevice = function terminal_server_services_hashUser_hashDevice(hashDevice:hashOutput):void {
                const deviceData:deviceData = {
                        cpuCores: cpus().length,
                        cpuID: cpus()[0].model,
                        platform: process.platform,
                        memTotal: totalmem(),
                        osType: type(),
                        osVersion: release()
                    },
                    hashes:hashAgent = {
                        device: hashDevice.hash,
                        deviceData: deviceData,
                        user: hashUser.hash
                    };
                serverVars.hashDevice = hashDevice.hash;
                serverVars.nameDevice = hashData.device;
                serverVars.device[serverVars.hashDevice] = {
                    deviceData: deviceData,
                    ipAll: serverVars.localAddresses,
                    ipSelected: "",
                    name: hashData.device,
                    ports: serverVars.ports,
                    shares: {},
                    status: "active"
                };
                settings({
                    data: {
                        settings: serverVars.device,
                        type: "device"
                    },
                    service: "hash-device"
                });
                responder({
                    data: hashes,
                    service: "hash-user"
                }, transmit);
            };
            serverVars.hashUser = hashUser.hash;
            serverVars.nameUser = hashData.user;
            input.callback = callbackDevice;
            input.source = hashUser.hash + hashData.device;
            hash(input);
        },
        input:hashInput = {
            algorithm: "sha3-512",
            callback: callbackUser,
            directInput: true,
            source: hashData.user + hostname() + process.env.os + process.hrtime.bigint().toString()
        };
    hash(input);
};

export default hashDevice;