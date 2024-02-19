/* lib/browser/utilities/agent_hash - Generates a local user identity. */

import agent_management from "../content/agent_management.js";
import browser from "./browser.js";
import network from "./network.js";

/**
 * Manages population of agent hash from the login form
 * ```typescript
 * interface module_agentHash {
 *     receive: (socketData:socketData) => void;
 *     send: (nameDevice:HTMLInputElement, nameUser:HTMLInputElement) => void;
 * }
 * ``` */
const agent_hash:module_agentHash = {
    receive: function browser_utilities_agentHash_receive(socketData:socketData):void {
        if (browser.identity.hashDevice === "") {
            const hashes:service_agentHash = socketData.data as service_agentHash;
            browser.identity.hashDevice = hashes.device;
            browser.identity.hashUser = hashes.user;
            browser.agents.device[hashes.device] = {
                deviceData: hashes.deviceData,
                ipAll: browser.network.addresses,
                ipSelected: "",
                name: browser.identity.nameDevice,
                port: browser.network.port,
                secret: browser.identity.secretDevice,
                shares: {},
                status: "idle"
            };
            agent_management.tools.addAgent({
                callback: function browser_utilities_agentHash_receive_addAgent():void {
                    browser.pageBody.setAttribute("class", "default");
                },
                hash: hashes.device,
                name: browser.identity.nameDevice,
                type: "device"
            });
        }
    },
    send: function browser_utilities_agentHash_send(nameDevice:HTMLInputElement, nameUser:HTMLInputElement):void {
        if (nameUser.value.replace(/\s+/, "") === "") {
            nameUser.focus();
        } else if (nameDevice.value.replace(/\s+/, "") === "") {
            nameDevice.focus();
        } else {
            browser.identity.nameUser = nameUser.value;
            browser.identity.nameDevice = nameDevice.value;
            network.send({
                device: browser.identity.nameDevice,
                deviceData: null,
                user: browser.identity.nameUser
            }, "agent-hash");
        }
    }
};

export default agent_hash;

