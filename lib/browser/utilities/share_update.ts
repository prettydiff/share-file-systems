
/* lib/browser/utilities/share_update - A utility to dynamically update the content of share modals. */

import agent_change from "./agent_change.js";
import browser from "./browser.js";
import modal_shareUpdate from "./modal_shareUpdate.js";

const share_update = function browser_utilities_shareUpdate(exclusion:string):void {
    const modals:string[] = Object.keys(browser.ui.modals),
        modalLength:number = modals.length,
        closer = function browser_content_share_update_closer(id:string):void {
            const button:HTMLButtonElement = document.getElementById(id).getElementsByClassName("close")[0] as HTMLButtonElement;
            button.click();
        };
    let a:number = 0,
        modal:HTMLElement,
        item:config_modal;
    do {
        if (exclusion !== modals[a]) {
            item = browser.ui.modals[modals[a]];
            if (item !== undefined && (item.agentType === "device" || item.agentType === "user") && item.agent !== "" && browser.agents[item.agentType][item.agent] === undefined && item.type !== "shares" && item.type !== "configuration" && item.type === "agent-management") {
                closer(modals[a]);
            } else if (item.type === "shares") {
                modal = document.getElementById(modals[a]);
                if (item.agent !== "" && browser.agents[item.agentType][item.agent] === undefined) {
                    closer(modals[a]);
                } else {
                    modal_shareUpdate(modal, item.agent, item.agentType);
                }
            } else if (item.type === "agent-management") {
                // redraw the edit and delete content of agent management modals
                modal = document.getElementById(modals[a]).getElementsByClassName("body")[0].getElementsByClassName("agent-management")[0] as HTMLElement;
                modal.removeChild(modal.getElementsByClassName("modify-agents")[0]);
                modal.removeChild(modal.getElementsByClassName("delete-agents")[0]);
                modal.appendChild(agent_change.modify());
                modal.appendChild(agent_change.delete());
            }
        }
        a = a + 1;
    } while (a < modalLength);
};

export default share_update;