
/* lib/browser/agent_status - Receive and process agent activity status notifications from the network. */

import browser from "./browser.js";

const agent_status = function browser_agentStatus(socketData:socketData):void {
    const data:service_agentStatus = socketData.data as service_agentStatus;
    if (browser[data.agentType][data.agent] !== undefined) {
        const agent:Element = document.getElementById(data.agent);
        agent.setAttribute("class", data.status);
    }
};

export default agent_status;