
/* lib/browser/agent_management - Receive and process agent data modification from across the network. */

import browser from "./browser.js";
import network from "./network.js";
import share from "./share.js";

const agent_management = function browser_agentManagement(socketData:socketData):void {
    const data:service_agentManagement = socketData.data as service_agentManagement;
    if (data.action === "add") {
        const addAgents = function browser_agentManagement_addAgents(agentType:agentType):void {
            const keys:string[] = Object.keys(data.agents[agentType]),
                keyLength:number = keys.length;
            if (keyLength > 0) {
                let a:number = 0;
                do {
                    if (browser[agentType][keys[a]] === undefined) {
                        browser[agentType][keys[a]] = data.agents[agentType][keys[a]];
                        share.addAgent({
                            hash: keys[a],
                            name: data.agents[agentType][keys[a]].name,
                            save: false,
                            type: agentType
                        });
                    }
                    a = a + 1;
                } while (a < keyLength);
            }
        };
        addAgents("device");
        addAgents("user");
    } else if (data.action === "delete") {
        const deleteAgents = function browser_agentManagement_deleteAgents(agentType:agentType):void {
            const keys:string[] = Object.keys(data.agents[agentType]),
                keyLength:number = keys.length;
            if (keyLength > 0) {
                let a:number = 0,
                    button:Element,
                    shareModals:Element[] = null,
                    shareLength:number = 0,
                    closeButton:HTMLButtonElement = null;
                do {
                    delete browser[agentType][keys[a]];
                    button = document.getElementById(keys[a]);
                    if (button !== null) {
                        button.parentNode.removeChild(button);
                    }
                    shareModals = document.getModalsByModalType("shares");
                    shareLength = shareModals.length;
                    if (shareLength > 0) {
                        do {
                            shareLength = shareLength - 1;
                            if (shareModals[shareLength].getAttribute("data-agent") === keys[a] && shareModals[shareLength].getAttribute("data-agentType") === agentType) {
                                closeButton = shareModals[shareLength].getElementsByClassName("close")[0] as HTMLButtonElement;
                                closeButton.click();
                            }
                        } while (shareLength > 0);
                    }
                    a = a + 1;
                } while (a < keyLength);
            }
        };
        deleteAgents("device");
        deleteAgents("user");
        network.configuration();
    } else if (data.action === "modify") {
        const shareContent = function browser_agentManagement_shareContent(agentName:string, agentType:agentType|""):void {
                const shareModals:Element[] = document.getModalsByModalType("shares");
                let shareLength:number = shareModals.length,
                    body:Element = null;
                if (shareLength > 0) {
                    do {
                        shareLength = shareLength - 1;
                        if ((shareModals[shareLength].getAttribute("data-agent") === agentName && shareModals[shareLength].getAttribute("data-agentType") === agentType) || (agentType === "" && shareModals[shareLength].getElementsByTagName("button")[0].innerHTML === "⌘ All Shares")) {
                            body = shareModals[shareLength].getElementsByClassName("body")[0];
                            body.innerHTML = "";
                            body.appendChild(share.content(agentName, agentType));
                        }
                    } while (shareLength > 0);
                }
            },
            modifyAgents = function browser_agentManagement_modifyAgents(agentType:agentType):void {
                const keys:string[] = Object.keys(data.agents[agentType]),
                    keyLength:number = keys.length;
                if (keyLength > 0) {
                    let a:number = 0;
                    do {
                        if (browser[agentType][keys[a]] !== undefined) {
                            browser[agentType][keys[a]] = data.agents[agentType][keys[a]];
                            shareContent(keys[a], agentType);
                        }
                        a = a + 1;
                    } while (a < keyLength);
                    shareContent("", agentType);
                }
            };
        modifyAgents("device");
        modifyAgents("user");
        shareContent("", "");
    }
};

export default agent_management;