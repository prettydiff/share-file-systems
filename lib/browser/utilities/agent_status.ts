
/* lib/browser/utilities/agent_status - Receive and process agent activity status notifications from the network. */

import browser from "../browser.js";
import network from "./network.js";

let idleDelay:NodeJS.Timeout = null;
const idleTime:number = 15000,
    selfStatus:service_agentStatus = {
        agent: "",
        agentType: "device",
        broadcast: true,
        respond: true,
        status: "active"
    },

    /**
     * Manages local agent activity status from the browser.
     * ```typescript
     * interface module_agentStatus {
     *     active : (event:KeyboardEvent|MouseEvent) => void; // Converts local agent status to "active".
     *     idle   : () => void;                               // Converts local agent status to "idle".
     *     receive: (socketData:socketData) => void;          // Receives status data from remote agents.
     *     start  : () => void;                               // Initiates local agent status timer on page load.
     * }
     * ``` */
    agent_status:module_agentStatus = {
        active: function browser_utilities_agentStatus_active(event:KeyboardEvent|MouseEvent):void {
            const localDevice:Element = document.getElementById(browser.data.hashDevice),
                currentStatus:activityStatus = localDevice.getAttribute("class") as activityStatus;
            if (event !== null) {
                event.stopPropagation();
            }
            clearTimeout(idleDelay);
            if (currentStatus !== "active") {
                localDevice.setAttribute("class", "active");
                selfStatus.status = "active";
                network.send(selfStatus, "agent-status");
            }
            idleDelay = setTimeout(agent_status.idle, idleTime);
        },
        idle: function browser_utilities_agentStatus_idle():void {
            const localDevice:Element = document.getElementById(browser.data.hashDevice),
                currentStatus:activityStatus = localDevice.getAttribute("class") as activityStatus;
            if (currentStatus === "active") {
                localDevice.setAttribute("class", "idle");
                selfStatus.status = "idle";
                network.send(selfStatus, "agent-status");
            }
        },
        receive: function browser_utilities_agentStatus_receive(socketData:socketData):void {
            const data:service_agentStatus = socketData.data as service_agentStatus;

            // do not receive local agent status from a remote agent
            if (browser[data.agentType][data.agent] !== undefined && (data.agentType !== "device" || (data.agentType === "device" && data.agent !== browser.data.hashDevice))) {
                const agent:Element = document.getElementById(data.agent);
                agent.setAttribute("class", data.status);
            }
        },
        start: function browser_utilities_agentStatus_start():void {

            // watch for local idleness
            document.documentElement.onclick = agent_status.active;
            document.documentElement.onkeydown = agent_status.active;
            selfStatus.agent = browser.data.hashDevice;

            agent_status.active(null);
            selfStatus.respond = false;
        }
    };

export default agent_status;