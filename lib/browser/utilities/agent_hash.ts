/* lib/browser/utilities/agent_hash - Generates a local user identity. */

import agent_management from "./agent_management.js";
import browser from "./browser.js";
import network from "./network.js";

const agent_hash:module_agentHash = {
    receive: function browser_utilities_agentHash_receive(socketData:socketData):void {
        const hashes:service_agentHash = socketData.data as service_agentHash;
        browser.data.hashDevice = hashes.device;
        browser.data.hashUser = hashes.user;
        browser.device[hashes.device] = {
            deviceData: hashes.deviceData,
            ipAll: browser.localNetwork.addresses,
            ipSelected: "",
            name: browser.data.nameDevice,
            ports: {
                http: browser.localNetwork.httpPort,
                ws: browser.localNetwork.wsPort
            },
            shares: {},
            status: "idle"
        };
        agent_management.addAgent({
            callback: function browser_init_applyLogin_action_callback_socketCallback_addAgentCallback():void {
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

