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
        const hashes:service_agentHash = socketData.data as service_agentHash;
        browser.data.hashDevice = hashes.device;
        browser.data.hashUser = hashes.user;
        browser.device[hashes.device] = {
            deviceData: hashes.deviceData,
            ipAll: browser.network.addresses,
            ipSelected: "",
            name: browser.data.nameDevice,
            ports: browser.network.ports,
            queue: [],
            shares: {},
            status: "idle"
        };
        agent_management.tools.addAgent({
            callback: function browser_utilities_agentHash_receive_addAgent():void {
                browser.pageBody.setAttribute("class", "default");
                browser.loadComplete();
            },
            hash: hashes.device,
            name: browser.data.nameDevice,
            type: "device"
        });
    },
    send: function browser_utilities_agentHash_send(nameDevice:HTMLInputElement, nameUser:HTMLInputElement):void {
        if (nameUser.value.replace(/\s+/, "") === "") {
            nameUser.focus();
        } else if (nameDevice.value.replace(/\s+/, "") === "") {
            nameDevice.focus();
        } else {
            browser.data.nameUser = nameUser.value;
            browser.data.nameDevice = nameDevice.value;
            network.send({
                device: browser.data.nameDevice,
                deviceData: null,
                user: browser.data.nameUser
            }, "agent-hash");
        }
    }
};

export default agent_hash;

