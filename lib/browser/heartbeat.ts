
/* lib/browser/heartbeat - A central location to process heartbeat information from the network. */

import browser from "./browser.js";
import network from "./network.js";
import share from "./share.js";

/**
 * Provides message handling for heartbeat instructions from the terminal.
 * * **complete** - Instructions resulting from a heartbeat *update* action on the terminal resulting in changes to agent data.
 * * **delete-agents** - Removes agents from the browser user interface in response to guidance from the terminal/network.
 * * **receive** - Receives messaging from the terminal for distribution to the other methods.
 * * **status** - Updates activity status indication on the agent buttons.
 * 
 * ```typescript
 * interface module_heartbeatBrowser {
 *     "complete": (heartbeatData:service_heartbeat) => void;
 *     "delete-agents": (heartbeatData:service_heartbeat) => void;
 *     "receive": (socketData:socketData) => void;
 *     "status": (heartbeatData:service_heartbeat) => void;
 * }
 * ``` */
const heartbeat:module_heartbeatBrowser = {
    "complete": function browser_heartbeat_complete(heartbeatData:service_heartbeat):void {
        if (heartbeatData.status === "deleted") {
            share.deleteAgent(heartbeatData.agentFrom, heartbeatData.agentType);
            share.update("");
            network.configuration();
        } else {
            const keys:string[] = Object.keys(heartbeatData.shares);
            heartbeat["status"](heartbeatData);
            if (keys.length > 0) {
                if (heartbeatData.shareType === "device") {
                    const length:number = keys.length;
                    let a:number = 0;
                    do {
                        if (browser.device[keys[a]] === undefined) {
                            browser.device[keys[a]] = heartbeatData.shares[keys[a]];
                            share.addAgent({
                                hash: keys[a],
                                name: heartbeatData.shares[keys[a]].name,
                                save: false,
                                type: "device"
                            });
                        }
                        a = a + 1;
                    } while (a < length);
                    browser.device[heartbeatData.agentFrom] = heartbeatData.shares[heartbeatData.agentFrom];
                } else if (heartbeatData.shareType === "user") {
                    if (browser.user[keys[0]] === undefined) {
                        browser.user[keys[0]] = heartbeatData.shares[keys[0]];
                        share.addAgent({
                            hash: keys[0],
                            name: heartbeatData.shares[keys[0]].name,
                            save: false,
                            type: "user"
                        });
                    } else {
                        browser.user[keys[0]].shares = heartbeatData.shares[keys[0]].shares;
                    }
                }
                share.update("");
            }
        }
    },
    "delete-agents": function browser_heartbeat_deleteAgents(heartbeatData:service_heartbeat):void {
        if (heartbeatData.agentType === "device") {
            const deletion:service_agentDeletion = heartbeatData.status as service_agentDeletion,
                removeSelf:boolean = (deletion.device.indexOf(browser.data.hashDevice) > -1),
                devices:string[] = Object.keys(browser.device),
                users:string[] = Object.keys(browser.user);
            devices.forEach(function browser_socketMessage_heartbeatDelete_deviceEach(value:string) {
                if (value !== browser.data.hashDevice && (removeSelf === true || deletion.device.indexOf(value) > -1)) {
                    share.deleteAgent(value, "device");
                }
            });
            users.forEach(function browser_socketMessage_heartbeatDelete_userEach(value:string) {
                if (removeSelf === true || deletion.user.indexOf(value) > -1) {
                    share.deleteAgent(value, "user");
                }
            });
            share.update("");
        } else if (heartbeatData.agentType === "user") {
            share.deleteAgent(heartbeatData.agentFrom, heartbeatData.agentType);
            share.update("");
        }
        network.configuration();
    },
    "receive": function browser_heartbeat_receive(socketData:socketData):void {
        const heartbeatData:service_heartbeat = socketData.data as service_heartbeat;
        if (heartbeatData.action === "complete") {
            heartbeat["complete"](heartbeatData);
        } else if (heartbeatData.action === "delete-agents") {
            heartbeat["delete-agents"](heartbeatData);
        } else if (heartbeatData.action === "status") {
            heartbeat["status"](heartbeatData);
        }
    },
    "status": function browser_heartbeat_status(heartbeatData:service_heartbeat):void {
        const button:Element = document.getElementById(heartbeatData.agentFrom);
        if (button !== null && button.getAttribute("data-agent-type") === heartbeatData.agentType) {
            button.setAttribute("class", heartbeatData.status as heartbeatStatus);
        }
    }
};

export default heartbeat;