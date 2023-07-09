
/* lib/browser/content/share - The utilities that manage and coordinate changes to user share data. */

import common from "../../common/common.js";

import agent_management from "./agent_management.js";
import browser from "../utilities/browser.js";
import context from "./context.js";
import message from "./message.js";
import modal_configuration from "../utilities/modal_configurations.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

/**
 * Populates the various agent modals, device details, and share data lists.
 * ```typescript
 * interface module_share {
 *     content: (agent:string, agentType:agentType|"") => HTMLElement; // Generates the content of the share modal.
 *     events: {
 *         context : (event:Event) => void;      // Handler for the File Navigate context menu item *Add a Share*.
 *         readOnly: (event:MouseEvent) => void; // Toggle a share between read only and full access.
 *     }
 *     tools: {
 *         hash    : (socketData) => void;       // Generates a hash identifier for a new share
 *         update  : (exclusion:string) => void; // Updates the content of device shares in response to messaging from the network and local user interaction.
 *     }
 * }
 * ``` */
const share:module_share = {

    /* Generate the content of a share modal */
    content: function browser_content_share_content(agentName:string, agentType:agentType|""):HTMLElement {
        let shareListUL:HTMLElement = document.createElement("ul"),
            agent:HTMLElement,
            user:boolean = false;
        const sections:share_content_sections = {
                device: document.createElement("div"),
                user: document.createElement("div")
            },
            all:HTMLElement = document.createElement("div"),
            // open a file navigate modal to a location
            fileNavigate = function browser_content_share_content_fileNavigate(event:MouseEvent):void {
                const element:HTMLElement = (function browser_content_share_content_fileNavigate_getElement():HTMLElement {
                        const item:HTMLElement = event.target;
                        if (item.lowName() === "button") {
                            return item;
                        }
                        return item.getAncestor("button", "tag");
                    }()),
                    ancestor:HTMLElement = element.getAncestor("ul", "tag").getAncestor("div", "tag"),
                    agentType:agentType = ancestor.getAttribute("class").replace("-share", "") as agentType,
                    parent:HTMLElement = element.parentNode,
                    agent:string = ancestor.dataset.hash,
                    share:string = parent.dataset.hash,
                    path:string = element.firstChild.textContent,
                    type:string = element.getAttribute("class"),
                    slash:string = (path.indexOf("/") > -1 && (path.indexOf("\\") < 0 || path.indexOf("\\") > path.indexOf("/")))
                        ? "/"
                        : "\\";
                let address:string;
                if (type === "file" || type === "link") {
                    const dirs:string[] = path.replace(/\\/g, "/").split("/");
                    dirs.pop();
                    address = dirs.join(slash);
                } else {
                    address = path;
                }
                modal_configuration.modals["file-navigate"](event, {
                    agent: agent,
                    agentIdentity: true,
                    agentType: agentType,
                    content: null,
                    read_only: browser.agents[agentType][agent].shares[share].readOnly,
                    share: (agentType === "user")
                        ? share
                        : "",
                    text_value: address,
                    type: "file-navigate"
                });
            },
            toolButton = function browser_content_share_content_toolButton(config:config_share_tool):void {
                const li:HTMLElement = document.createElement("li"),
                    button:HTMLElement = document.createElement("button");
                button.setAttribute("class", `share-tool-${config.className}`);
                if (config.identity === null) {
                    button.appendText(config.text);
                } else {
                    const span:HTMLElement = document.createElement("span");
                    span.appendText(config.text);
                    button.appendChild(span);
                    button.appendText(config.identity);
                }
                button.setAttribute("type", "button");
                button.onclick = config.handler;
                li.appendChild(button);
                config.list.appendChild(li);
            },
            // hardware and OS details about a device
            agentDetails = function browser_content_share_content_agentDetails(type:agentType, agentString:string):HTMLElement {
                const agentDetails:HTMLElement = document.createElement("ul"),
                    agent:agent = browser.agents[type][agentString],
                    ip:string[] = (type === "device" && agentString === browser.identity.hashDevice)
                        ? ["127.0.0.1", "::1"]
                        : [agent.ipSelected],
                    createListItem = function browser_content_share_content_agentDetails_createListItem(message:string, dataList?:string[]):void {
                        const agentItem:HTMLElement = document.createElement("li"),
                            ul:HTMLElement = document.createElement("ul");
                        if (dataList === undefined) {
                            agentItem.appendText(message);
                        } else {
                            const len:number = dataList.length;
                            if (len === 0) {
                                message = message + "[]";
                                agentItem.appendText(message);
                            } else if (len === 1) {
                                message = message + dataList[0];
                                agentItem.appendText(message);
                            } else {
                                agentItem.appendText(message);
                                dataList.forEach(function browser_content_share_content_agentDetails_createListItem_each(value:string):void {
                                    const li:HTMLElement = document.createElement("li");
                                    li.appendText(value);
                                    ul.appendChild(li);
                                });
                                agentItem.appendChild(ul);
                            }
                        }
                        agentItem.setAttribute("class", "share-agent-details");
                        agentDetails.appendChild(agentItem);
                    };
                createListItem(`${common.capitalize(type)} ID: ${agentString}`);
                if (type === "device") {
                    createListItem(`User ID: ${browser.identity.hashUser}`);
                }
                createListItem("Selected IP Address: ", ip);
                createListItem("IPv4 Addresses: ", agent.ipAll.IPv4);
                createListItem("IPv6 Addresses: ", agent.ipAll.IPv6);
                createListItem("Port: ", [`HTTP ${agent.ports.http}`, `WS ${agent.ports.ws}`]);

                if (type === "device") {
                    createListItem(`CPU Cores: ${agent.deviceData.cpuCores}`);
                    createListItem(`CPU Label: ${agent.deviceData.cpuID}`);
                    createListItem(`Total Memory: ${common.prettyBytes(agent.deviceData.memTotal)}`);
                    createListItem(`OS Version: ${agent.deviceData.osVersion}`);
                    createListItem(`OS Type: ${agent.deviceData.osType}`);
                    createListItem(`Platform: ${agent.deviceData.platform}`);
                }
                return agentDetails;
            },
            perAgent = function browser_content_share_content_perAgent(agentNames:agentNames):void {
                if ((agentName === "" || agentName === agentNames.agent) && (agentType === "" || agentType === agentNames.agentType)) {
                    const title:HTMLElement = document.createElement("h4"),
                        toolList:HTMLElement = document.createElement("ul"),
                        subTitle = function browser_content_share_content_perAgent_subTitle(text:string):void {
                            const subTitleElement:HTMLElement = document.createElement("h5");
                            subTitleElement.appendText(`${browser.agents[agentNames.agentType][agentNames.agent].name} ${text}`);
                            agent.appendChild(subTitleElement);
                        };
                    shareListUL = document.createElement("ul");
                    shareListUL.setAttribute("class", "shares");
                    agent = document.createElement("div");

                    // title
                    title.appendText(browser.agents[agentNames.agentType][agentNames.agent].name);
                    agent.appendChild(title);

                    // tool list
                    subTitle("tools");
                    toolList.setAttribute("class", "tools");
                    if (agentNames.agentType === "device") {
                        // file navigate button
                        toolButton({
                            className: "file-navigate",
                            handler: modal_configuration.modals["file-navigate"],
                            identity: null,
                            list: toolList,
                            text: "File System Root"
                        });

                        // command terminal button
                        toolButton({
                            className: "terminal",
                            handler: modal_configuration.modals.terminal,
                            identity: null,
                            list: toolList,
                            text: "Command Terminal"
                        });
                    }
                    if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== browser.identity.hashDevice)) {
                        // text button
                        toolButton({
                            className: "message",
                            handler: message.events.shareButton,
                            identity: ` ${browser.agents[agentNames.agentType][agentNames.agent].name}`,
                            list: toolList,
                            text: "Text"
                        });

                        // video button
                        // toolButton({
                        //     className: "video",
                        //     handler: modal_configuration.modals.media,
                        //     identity: ` ${browser[agentNames.agentType][agentNames.agent].name}`,
                        //     list: toolList,
                        //     text: "Video Call"
                        // });
                    }
                    agent.appendChild(toolList);

                    // share list
                    subTitle("shares");
                    if (Object.keys(browser.agents[agentNames.agentType][agentNames.agent].shares).length > 0) {
                        agent.appendChild(shareListUL);
                    } else {
                        const p:HTMLElement = document.createElement("p"),
                            em:HTMLElement = document.createElement("em");
                        em.appendText(browser.agents[agentNames.agentType][agentNames.agent].name);
                        p.appendText(`${common.capitalize(agentNames.agentType)} `);
                        p.appendChild(em);
                        p.appendText(" has no shares.");
                        agent.appendChild(p);
                    }

                    // agent details
                    subTitle("details");
                    agent.appendChild(agentDetails(agentNames.agentType, agentNames.agent));

                    agent.setAttribute("data-hash", agentNames.agent);
                    agent.setAttribute("class", agentNames.agentType);
                    sections[agentNames.agentType].appendChild(agent);
                }
            },
            perAgentType = function browser_content_share_content_perAgentType(agentNames:agentNames):void {
                const type:agentType = agentNames.agentType;
                if (agentName === "" && (agentType === "" || agentType === type)) {
                    const title:HTMLElement = document.createElement("h3"),
                        span:HTMLElement = document.createElement("span"),
                        strong:HTMLElement = document.createElement("strong"),
                        list:string[] = Object.keys(browser.agents[type]),
                        listLength:number = list.length,
                        plural:string = (listLength === 1)
                            ? ""
                            : "s",
                        verb:string = (listLength === 1)
                            ? "is"
                            : "are",
                        adjective:string = (type === "device")
                            ? "available"
                            : "shared",
                        messageButton:HTMLElement = document.createElement("button");
                    strong.appendText(type + plural);
                    span.appendText(`There ${verb} ${listLength} `);
                    span.appendChild(strong);
                    span.appendText(` ${adjective}.`);
                    title.appendChild(span);
                    title.setAttribute("class", "agent-list-heading");
                    messageButton.appendText(`Text all ${type}s`);
                    messageButton.setAttribute("class", `text-button-${type}`);
                    messageButton.setAttribute("type", "button");
                    messageButton.onclick = message.events.shareButton;
                    title.appendChild(messageButton);
                    sections[agentNames.agentType].appendChild(title);
                }
                sections[type].setAttribute("class", "agentList");
                all.appendChild(sections[agentNames.agentType]);
                if (type === "user") {
                    user = true;
                }
            },
            perShare = function browser_content_share_content_perShare(agentNames:agentNames):void {
                const li:HTMLElement = document.createElement("li"),
                    button:HTMLElement = document.createElement("button"),
                    status:HTMLElement = document.createElement("strong"),
                    span:HTMLElement = document.createElement("span"),
                    shareItem:agentShare = browser.agents[agentNames.agentType][agentNames.agent].shares[agentNames.share],
                    shareType:string = shareItem.type;
                button.setAttribute("class", `${agentNames.agentType}-share`);
                span.appendText(shareItem.name);
                button.appendChild(span);
                button.setAttribute("type", "button");
                status.setAttribute("class", "read-only-status");
                status.appendText((shareItem.readOnly === true)
                    ? "(Read Only)"
                    : "(Full Access)");
                button.appendChild(status);
                if (shareType === "directory" || shareType === "file" || shareType === "link") {
                    button.onclick = fileNavigate;
                }
                li.setAttribute("data-hash", agentNames.share);
                if (agentNames.agentType === "device" && (agentNames.agent === agentName || agentName === "") && (agentType === "device" || agentType === "")) {
                    const del:HTMLElement = document.createElement("button"),
                        readOnly:HTMLButtonElement = document.createElement("button"),
                        span:HTMLElement = document.createElement("span"),
                        span1:HTMLElement = document.createElement("span");
                    if (shareItem.readOnly === true) {
                        li.setAttribute("class", "share");
                        readOnly.setAttribute("class", "grant-full-access");
                        readOnly.appendText("Grant Full Access");
                    } else {
                        li.setAttribute("class", "share full-access");
                        readOnly.setAttribute("class", "make-read-only");
                        readOnly.appendText("Make Read Only");
                    }
                    readOnly.setAttribute("type", "button");
                    readOnly.onclick = share.events.readOnly;
                    del.setAttribute("class", "delete");
                    del.setAttribute("title", "Delete this share");
                    span1.appendText("Delete this share");
                    del.appendText("\u2718");
                    del.appendChild(span1);
                    del.setAttribute("type", "button");
                    del.onclick = agent_management.events.deleteShare;
                    span.setAttribute("class", "clear");
                    li.appendChild(del);
                    li.appendChild(button);
                    li.appendChild(readOnly);
                    li.appendChild(span);
                    shareListUL.appendChild(li);
                }
                if (agentNames.agentType === "user" && (agentNames.agent === agentName || agentName === "") && (agentType === "user" || agentType === "")) {
                    if (shareItem.readOnly === false) {
                        li.setAttribute("class", "full-access");
                    }
                    li.appendChild(button);
                    shareListUL.appendChild(li);
                }
            };

        common.agents({
            countBy: "share",
            perAgent: perAgent,
            perAgentType: perAgentType,
            perShare: perShare,
            source: browser
        });
        if (user === false) {
            const title:HTMLElement = document.createElement("h3"),
                strong:HTMLElement = document.createElement("strong");
            strong.appendText("0 users");
            title.appendText("There are ");
            title.appendChild(strong);
            title.appendText(" available.");
            sections.user.appendChild(title);
            sections.user.setAttribute("class", "agentList");
            all.appendChild(sections.user);
        }
        return all;
    },

    events: {

        /* Share utility for the "adding a share" context menu list */
        context: function browser_content_share_context():void {
            const element:HTMLElement = context.element,
                addresses:[string, fileType, string][] = util.selectedAddresses(element, "share"),
                deviceData:agentShares = browser.agents.device[addresses[0][2]].shares,
                shares:string[] = Object.keys(deviceData),
                shareLength:number = shares.length,
                addressesLength:number = addresses.length,
                menu:HTMLElement = document.getElementById("contextMenu");
            let a:number = 0,
                b:number = 0;
            context.element = null;
            // check to see if this share already exists
            if (shareLength > 0) {
                do {
                    b = 0;
                    do {
                        if (addresses[a][0] === deviceData[shares[b]].name && addresses[a][1] === deviceData[shares[b]].type) {
                            break;
                        }
                        b = b + 1;
                    } while (b < shareLength);
                    if (b === shareLength) {
                        network.send({
                            device: addresses[a][2],
                            hash: "",
                            share: addresses[a][0],
                            type: addresses[a][1]
                        }, "hash-share");
                    }
                    a = a + 1;
                } while (a < addressesLength);
            } else {
                do {
                    network.send({
                        device: addresses[a][2],
                        hash: "",
                        share: addresses[a][0],
                        type: addresses[a][1]
                    }, "hash-share");
                    a = a + 1;
                } while (a < addressesLength);
            }
            util.selectNone(element);
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },

        /* Toggle a share between read only and full access. */
        readOnly: function browser_content_share_readOnly(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                box:modal = element.getAncestor("box", "class") ,
                boxHash:string = box.dataset.agent,
                parent:HTMLElement = element.parentNode,
                hashDevice:string = (boxHash === "")
                    ? element.getAncestor("device", "class").dataset.hash
                    : boxHash,
                hashShare:string = parent.dataset.hash,
                manage:service_agentManagement = {
                    action: "modify",
                    agentFrom: browser.identity.hashDevice,
                    agents: {
                        device: {},
                        user: {}
                    },
                    userHash: null,
                    userName: null
                };
            let item:agentShare = null;
            if (hashDevice === null) {
                return;
            }
            item = browser.agents.device[hashDevice].shares[hashShare];
            if (item.readOnly === true) {
                item.readOnly = false;
            } else {
                item.readOnly = true;
            }
            manage.agents.device[hashDevice] = browser.agents.device[hashDevice];
            network.send(manage, "agent-management");
            share.tools.update("");
        }
    },

    tools: {

        /* Receives a hash identifier for a new share. */
        hash: function browser_content_shares_hash(socketData:socketData):void {
            const hash:service_hashShare = socketData.data as service_hashShare,
                management:service_agentManagement = {
                    action: "modify",
                    agentFrom: browser.identity.hashDevice,
                    agents: {
                        device: {
                            [hash.device]: browser.agents.device[hash.device]
                        },
                        user: {}
                    },
                    userHash: null,
                    userName: null
                };
            browser.agents.device[hash.device].shares[hash.hash] = {
                execute: false,
                name: hash.share,
                readOnly: true,
                type: hash.type
            };
            // update any share modals
            share.tools.update("");
            // inform other agents of the share
            network.send(management, "agent-management");
        },

        /* Updates the contents of share modals */
        update: function browser_content_share_update(exclusion:string):void {
            const modals:string[] = Object.keys(browser.ui.modals),
                modalLength:number = modals.length,
                closer = function browser_content_share_update_closer(id:string):void {
                    const button:HTMLButtonElement = document.getElementById(id).getElementsByClassName("close")[0] as HTMLButtonElement;
                    button.click();
                };
            let a:number = 0,
                modal:HTMLElement,
                body:HTMLElement,
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
                            body = modal.getElementsByClassName("body")[0] as HTMLElement;
                            body.appendText("", true);
                            body.appendChild(share.content(item.agent, item.agentType));
                        }
                    } else if (item.type === "agent-management") {
                        // redraw the edit and delete content of agent management modals
                        modal = document.getElementById(modals[a]).getElementsByClassName("body")[0].getElementsByClassName("agent-management")[0] as HTMLElement;
                        modal.removeChild(modal.getElementsByClassName("modify-agents")[0]);
                        modal.removeChild(modal.getElementsByClassName("delete-agents")[0]);
                        modal.appendChild(agent_management.content.modifyAgents());
                        modal.appendChild(agent_management.content.deleteAgents());
                    }
                }
                a = a + 1;
            } while (a < modalLength);
        }
    }

};

export default share;