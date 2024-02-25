
/* lib/browser/utilities/agent_status - Receive and process agent activity status notifications from the network. */

import browser from "./browser.js";
import webSocket from "./webSocket.js";

    /**
 * Manages local agent activity status from the browser.
 * ```typescript
 * interface module_agentStatus {
 *     active    : (event:KeyboardEvent|MouseEvent|TouchEvent) => void; // Converts local agent status to "active".
 *     idle      : () => void;                                          // Converts local agent status to "idle".
 *     idleDelay : NodeJS.Timeout                                       // Stores the current delay timer.
 *     receive   : (socketData:socketData) => void;                     // Receives status data from remote agents.
 *     selfStatus: service_agentStatus;                                 // Stores the configuration for a network transmission.
 *     start     : () => void;                                          // Initiates local agent status timer on page load.
 * }
 * ``` */
const agent_status:module_agentStatus = {
        active: function browser_utilities_agentStatus_active(event:KeyboardEvent|MouseEvent|TouchEvent):void {
            const socket = function browser_utilities_agentStatus_active_socket():void {
                    agent_status.idleDelay = setTimeout(agent_status.idle, browser.ui.statusTime);
                    if (active === false) {
                        webSocket.send(agent_status.selfStatus, "agent-status");
                    }
                },
                active:boolean = (agent_status.selfStatus.status === "active"),
                localDevice:HTMLElement = (browser.identity.hashDevice === "")
                    ? null
                    : document.getElementById(browser.identity.hashDevice);
            if (active === false && localDevice !== null) {
                localDevice.setAttribute("class", "active");
                agent_status.selfStatus.status = "active";
            }
            if (event !== null) {
                event.stopPropagation();
            }
            clearTimeout(agent_status.idleDelay);
            if (browser.socket !== null) {
                socket();
            } else if (browser.loading === false) {
                webSocket.start(socket, browser.identity.hashDevice, "primary");
            }
            if (Notification.permission === "default") {
                void Notification.requestPermission();
            }
        },
        idle: function browser_utilities_agentStatus_idle():void {
            const localDevice:HTMLElement = document.getElementById(browser.identity.hashDevice),
                currentStatus:activityStatus = (localDevice === null)
                    ? null
                    : localDevice.getAttribute("class") as activityStatus;
            if (currentStatus === "active" && localDevice !== null) {
                localDevice.setAttribute("class", "idle");
                agent_status.selfStatus.status = "idle";
                webSocket.send(agent_status.selfStatus, "agent-status");
            }
        },
        idleDelay: null,
        selfStatus: {
            agent: "",
            agentType: "device",
            broadcast: true,
            respond: false,
            status: "offline"
        },
        start: function browser_utilities_agentStatus_start():void {

            // watch for local idleness
            document.documentElement.onclick = agent_status.active;
            document.documentElement.onkeydown = agent_status.active;
            document.documentElement.ontouchstart = agent_status.active;

            agent_status.selfStatus.agent = browser.identity.hashDevice;

            agent_status.active(null);
            agent_status.selfStatus.respond = false;
        }
    };

export default agent_status;