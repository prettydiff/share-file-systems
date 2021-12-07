
/* lib/browser/utilities/agent_management - Receive and process agent data modification from across the network. */

import browser from "../browser.js";
import common from "../../common/common.js";
import configuration from "../content/configuration.js";
import network from "./network.js";
import share from "../content/share.js";
import util from "./util.js";

/**
 * Manages agent data in the browser.
 * * **addAgent** - Adds an agent into the browser user interface whether the agent is new or the page is loading.
 * * **deleteAgent** - Removes an agent from the browser user interface.
 * * **deleteShare** - Removes a share from a device of the local user.
 * * **receive** - Receives agent data from the terminal for processing in the browser.
 * ```typescript
 * interface module_agentManagement {
 *     addAgent: (input:addAgent) => void;
 *     deleteAgent: (agent:string, agentType:agentType) => void;
 *     deleteShare: (event:MouseEvent) => void;
 *     receive: (socketData:socketData) => void;
 * }
 * ``` */
const agent_management:module_agentManagement = {
    addAgent: function browser_utilities_agentManagement_addAgent(input:addAgent):void {
        const li:HTMLLIElement = document.createElement("li"),
            button:HTMLElement = document.createElement("button"),
            addStyle = function browser_utilities_agentManagement_addUser_addStyle():void {
                let body:string,
                    heading:string;
                if (browser.data.colors[input.type][input.hash] === undefined) {
                    body = configuration.colorDefaults[browser.data.color][0];
                    heading = configuration.colorDefaults[browser.data.color][1];
                    browser.data.colors[input.type][input.hash] = [body, heading];
                    if (input.callback === undefined) {
                        network.configuration();
                    } else {
                        network.send({
                            settings: browser.data,
                            type: "configuration"
                        }, "settings", input.callback);
                    }
                } else {
                    body = browser.data.colors[input.type][input.hash][0];
                    heading = browser.data.colors[input.type][input.hash][1];
                }
                configuration.tools.styleText({
                    agent: input.hash,
                    colors: [body, heading],
                    replace: false,
                    type: input.type
                });
            },
            sharesModal = function browser_utilities_agentManagement_addUser_sharesModal(event:MouseEvent):void {
                let element:Element = event.target as Element,
                    agent:string = element.getAttribute("id"),
                    agentType:agentType = element.getAttribute("data-agent-type") as agentType;
                element = element.getAncestor("button", "tag");
                share.tools.modal(agent, agentType, null);
            };
        button.innerHTML = `<em class="status-active">●<span> Active</span></em><em class="status-idle">●<span> Idle</span></em><em class="status-offline">●<span> Offline</span></em> ${input.name}`;
        if (input.hash === browser.data.hashDevice) {
            button.setAttribute("class", "active");
        } else {
            button.setAttribute("class", "offline");
        }
        addStyle();
        button.setAttribute("id", input.hash);
        button.setAttribute("data-agent-type", input.type);
        button.onclick = sharesModal;
        li.appendChild(button);
        document.getElementById(input.type).getElementsByTagName("ul")[0].appendChild(li);
        if (browser.loading === false) {
            configuration.tools.addUserColor(input.hash, input.type, document.getElementById("configuration-modal").getElementsByClassName("configuration")[0] as Element);
            share.tools.update("");
        }
    },
    deleteAgent: function browser_utilities_agentManagement_deleteAgent(agent:string, agentType:agentType):void {
        const userColors:HTMLCollectionOf<Element> = document.getElementById("configuration-modal").getElementsByClassName(`${agentType}-color-list`)[0].getElementsByTagName("li"),
            shareModals = document.getModalsByModalType("shares"),
            colorLength:number = userColors.length,
            button:Element = document.getElementById(agent),
            parent:Element = (button === null)
                ? null
                : button.parentNode as Element;
        let a:number = 0,
            shareLength = shareModals.length,
            closeButton:HTMLButtonElement = null;

        // loop through the color swatches in the settings modal to remove the agent's colors
        if (colorLength > 0) {
            do {
                if (userColors[a].getAttribute("data-agent") === agent) {
                    userColors[a].parentNode.removeChild(userColors[a]);
                    configuration.tools.styleText({
                        agent: agent,
                        colors: ["", ""],
                        replace: true,
                        type: agentType
                    });
                    break;
                }
                a = a + 1;
            } while (a < colorLength);
        }

        // remove the agent from the data structures
        delete browser[agentType][agent];
        delete browser.data.colors[agentType][agent];

        // remove agent associated share modals
        if (shareLength > 0) {
            do {
                shareLength = shareLength - 1;
                if (shareModals[shareLength].getAttribute("data-agent") === agent && shareModals[shareLength].getAttribute("data-agentType") === agentType) {
                    closeButton = shareModals[shareLength].getElementsByClassName("close")[0] as HTMLButtonElement;
                    closeButton.click();
                }
            } while (shareLength > 0);
        }

        // remove the named button for the agent
        if (parent !== null && button.getAttribute("data-agent-type") === agentType) {
            parent.parentNode.removeChild(parent);
        }
    },
    deleteShare: function browser_utilities_agentManagement_deleteShare(event:MouseEvent):void {
        const element:Element = event.target as Element,
            parent:Element = element.parentNode as Element,
            box:Element = parent.getAncestor("box", "class"),
            agent:string = (function browser_utilities_agentManagement_deleteShare_agency():string {
                const boxAgent:agency = util.getAgent(box);
                if (boxAgent[0] === null || boxAgent[0] === "") {
                    return element.getAncestor("ul", "tag").getAncestor("li", "tag").getAttribute("data-hash");
                }
                return boxAgent[0];
            }()),
            address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
            shares:agentShares = browser.device[agent].shares,
            keys:string[] = Object.keys(shares),
            length:number = keys.length,
            manage:service_agentManagement = {
                action: "modify",
                agentFrom: browser.data.hashDevice,
                agents: {
                    device: {},
                    user: {}
                }
            };
        let a:number = 0;
        do {
            if (shares[keys[a]].name === address) {
                delete shares[keys[a]];
                break;
            }
            a = a + 1;
        } while (a < length);
        if (length === 1) {
            const p:Element = document.createElement("p"),
                granny:Element = parent.parentNode as Element;
            p.innerHTML = `Device <em>${browser.device[agent].name}</em> has no shares.`;
            granny.parentNode.insertBefore(p, granny);
            granny.parentNode.removeChild(granny);
        } else {
            parent.parentNode.removeChild(parent);
        }
        share.tools.update(box.getAttribute("id"));
        manage.agents.device[agent] = browser.device[agent];
        network.send(manage, "agent-management", null);
    },
    receive: function browser_utilities_agentManagement_receive(socketData:socketData):void {
        const data:service_agentManagement = socketData.data as service_agentManagement;
        if (data.action === "add") {
            const addAgents = function browser_utilities_agentManagement_receive_addAgents(agentType:agentType):void {
                const keys:string[] = Object.keys(data.agents[agentType]),
                    keyLength:number = keys.length;
                if (keyLength > 0) {
                    let a:number = 0;
                    do {
                        if (browser[agentType][keys[a]] === undefined) {
                            browser[agentType][keys[a]] = data.agents[agentType][keys[a]];
                            agent_management.addAgent({
                                hash: keys[a],
                                name: data.agents[agentType][keys[a]].name,
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
            const deleteAgents = function browser_utilities_agentManagement_receive_deleteAgents(agentType:agentType):void {
                const keys:string[] = Object.keys(data.agents[agentType]),
                    keyLength:number = keys.length,
                    property:"hashDevice"|"hashUser" = `hash${common.capitalize(agentType)}` as "hashDevice"|"hashUser";
                if (keyLength > 0) {
                    let a:number = 0;
                    do {
                        if (keys[a] === browser.data[property]) {
                            agent_management.deleteAgent(data.agentFrom, agentType);
                        } else {
                            agent_management.deleteAgent(keys[a], agentType);
                        }
                        a = a + 1;
                    } while (a < keyLength);
                }
            };
            deleteAgents("device");
            deleteAgents("user");
            network.configuration();
        } else if (data.action === "modify") {
            const shareContent = function browser_utilities_agentManagement_receive_shareContent(agentName:string, agentType:agentType|""):void {
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
                modifyAgents = function browser_utilities_agentManagement_receive_modifyAgents(agentType:agentType):void {
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
    }
};

export default agent_management;