
/* lib/browser/utilities/deleteAgents - Removes agents. */

import browser from "./browser.js";
import configuration from "../content/configuration.js";

// cspell: words agentType

const deleteAgent = function browser_utilities_deleteAgent(agent:string, agentType:agentType):void {
    const userColors:HTMLCollectionOf<HTMLElement> = document.getElementById("configuration-modal").getElementsByClassName(`${agentType}-color-list`)[0].getElementsByTagName("li"),
        shareModals:HTMLElement[] = document.getModalsByModalType("shares"),
        colorLength:number = userColors.length,
        button:HTMLElement = document.getElementById(agent),
        parent:HTMLElement = (button === null)
            ? null
            : button.parentNode;
    let a:number = 0,
        shareLength:number = shareModals.length,
        closeButton:HTMLButtonElement = null;

    // loop through the color swatches in the settings modal to remove the agent's colors
    if (colorLength > 0) {
        do {
            if (userColors[a].dataset.agent === agent) {
                userColors[a].parentNode.removeChild(userColors[a]);
                configuration.tools.styleText({
                    agent: agent,
                    agentType: agentType,
                    colors: ["", ""],
                    replace: true
                });
                break;
            }
            a = a + 1;
        } while (a < colorLength);
    }

    // remove the agent from the data structures
    delete browser.agents[agentType][agent];
    delete browser.ui.colors[agentType][agent];

    // remove agent associated share modals
    if (shareLength > 0) {
        do {
            shareLength = shareLength - 1;
            if (shareModals[shareLength].dataset.agent === agent && shareModals[shareLength].dataset.agenttype === agentType) {
                closeButton = shareModals[shareLength].getElementsByClassName("close")[0] as HTMLButtonElement;
                closeButton.click();
            }
        } while (shareLength > 0);
    }

    // remove the named button for the agent
    if (parent !== null && button.dataset.agenttype === agentType) {
        parent.parentNode.removeChild(parent);
    }
};

export default deleteAgent;