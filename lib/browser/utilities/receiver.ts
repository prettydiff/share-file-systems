
/* lib/browser/utilities/receiver - Routes network messages to the respective browser library. */

import browser from "./browser.js";
import agent_management from "../content/agent_management.js";
import configuration from "../content/configuration.js";
import file_browser from "../content/file_browser.js";
import message from "../content/message.js";
import remote from "./remote.js";
import share from "../content/share.js";
import terminal from "../content/terminal.js";

const receiver = function browser_utilities_receiver(event:websocket_event):void {
    const dataString:string = (typeof event.data === "string")
            ? event.data
            : null,
        error = function browser_utilities_receiver_error():void {
            // eslint-disable-next-line no-console
            console.error("Error", socketData.data);
        },
        reload = function browser_utilities_receiver_reload():void {
            location.reload();
        },
        actions:network_actions = {
            "agent-hash": function browser_utilities_receiver_agentHash(socketData:socketData):void {
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
                        callback: function browser_utilities_receiver_agentHash_addAgent():void {
                            browser.pageBody.setAttribute("class", "default");
                        },
                        hash: hashes.device,
                        name: browser.identity.nameDevice,
                        type: "device"
                    });
                }
            },
            "agent-status": function browser_utilities_receiver_agentStatus(socketData:socketData):void {
                const data:service_agentStatus = socketData.data as service_agentStatus;
    
                // do not receive local agent status from a remote agent
                if (browser.agents[data.agentType][data.agent] !== undefined && (data.agentType !== "device" || (data.agentType === "device" && data.agent !== browser.identity.hashDevice))) {
                    const agent:HTMLElement = document.getElementById(data.agent);
                    agent.setAttribute("class", data.status);
                }
            },
            "agent-management": agent_management.tools.modifyReceive,
            "error": error,
            "hash-share": share.tools.hash,
            "file-system-details": file_browser.content.detailsResponse,
            "file-system-status": file_browser.content.status,
            "file-system-string": file_browser.content.dataString,
            "invite": agent_management.tools.inviteTransmissionReceipt,
            "message": message.tools.receive,
            "reload": reload,
            "socket-map": configuration.tools.socketMap,
            "terminal": terminal.events.receive,
            "test-browser": remote.receive
        },
        socketData:socketData = JSON.parse(dataString) as socketData,
        type:service_type = socketData.service;
    if (dataString !== null) {
        actions[type](socketData);
    }
};

export default receiver;