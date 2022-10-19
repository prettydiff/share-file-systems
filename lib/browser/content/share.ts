
/* lib/browser/content/share - The utilities that manage and coordinate changes to user share data. */

import common from "../../common/common.js";

import agent_management from "./agent_management.js";
import browser from "../utilities/browser.js";
import context from "./context.js";
import global_events from "./global_events.js";
import message from "./message.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

/**
 * Populates the various agent modals, device details, and share data lists.
 * ```typescript
 * interface module_share {
 *     content: (agent:string, agentType:agentType|"") => Element; // Generates the content of the share modal.
 *     events: {
 *         context : (event:Event) => void;      // Handler for the File Navigate context menu item *Add a Share*.
 *         readOnly: (event:MouseEvent) => void; // Toggle a share between read only and full access.
 *     }
 *     tools: {
 *         hash    : (socketData) => void;       // Generates a hash identifier for a new share
 *         modal   : (agent:string, agentType:agentType|"", configuration:config_modal) => void; // Creates a share modal displaying device details, shares, and available features.
 *         update  : (exclusion:string) => void; // Updates the content of device shares in response to messaging from the network and local user interaction.
 *     }
 * }
 * ``` */
const share:module_share = {

    /* Generate the content of a share modal */
    content: function browser_content_share_content(agentName:string, agentType:agentType|""):Element {
        let shareListUL:Element = document.createElement("ul"),
            agent:Element,
            user:boolean = false;
        const sections = {
                device: document.createElement("div"),
                user: document.createElement("div")
            },
            all:Element = document.createElement("div"),
            // open a file navigate modal to a location
            fileNavigate = function browser_content_share_content_fileNavigate(event:MouseEvent):void {
                const element:Element = (function browser_content_share_content_fileNavigate_getElement():Element {
                        const item:Element = event.target as Element;
                        if (util.name(item) === "button") {
                            return item;
                        }
                        return item.getAncestor("button", "tag");
                    }()),
                    ancestor:Element = element.getAncestor("ul", "tag").getAncestor("div", "tag"),
                    agentType:agentType = ancestor.getAttribute("class").replace("-share", "") as agentType,
                    parent:Element = element.parentNode as Element,
                    agent:string = ancestor.getAttribute("data-hash"),
                    share:string = parent.getAttribute("data-hash"),
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
                global_events.modal.fileNavigate(event, {
                    agentName: agent,
                    agentType: agentType,
                    path: address,
                    readOnly: browser[agentType][agent].shares[share].readOnly,
                    share: (agentType === "user")
                        ? share
                        : ""
                });
            },
            // open a file navigate modal to root for devices
            deviceButton = function browser_content_share_content_deviceButton():HTMLElement {
                const button:HTMLElement = document.createElement("button");
                button.setAttribute("class", "file-system-root");
                button.innerHTML = "File System Root";
                button.setAttribute("type", "button");
                button.onclick = function browser_content_share_content_perAgent_fsRoot(event:MouseEvent):void {
                    const element:Element = event.target as Element,
                        ancestor:Element = element.getAncestor("div", "tag"),
                        agent:string = ancestor.getAttribute("data-hash");
                    global_events.modal.fileNavigate(event, {
                        agentName: agent,
                        agentType: "device",
                        path: "**root**",
                        readOnly: false,
                        share: ""
                    });
                };
                return button;
            },
            // hardware and OS details about a device
            agentDetails = function browser_content_share_content_agentDetails(type:agentType, agentString:string):Element {
                const agentDetails:Element = document.createElement("ul"),
                    agent:agent = browser[type][agentString],
                    ip:string[] = (type === "device" && agentString === browser.data.hashDevice)
                        ? ["127.0.0.1", "::1"]
                        : [agent.ipSelected],
                    createListItem = function browser_content_share_content_agentDetails_createListItem(message:string, dataList?:string[]):void {
                        const agentItem:Element = document.createElement("li"),
                            ul:HTMLElement = document.createElement("ul");
                        if (dataList === undefined) {
                            agentItem.innerHTML = message;
                        } else {
                            const len:number = dataList.length;
                            if (len === 0) {
                                message = message + "[]";
                                agentItem.innerHTML = message;
                            } else if (len === 1) {
                                message = message + dataList[0];
                                agentItem.innerHTML = message;
                            } else {
                                agentItem.innerHTML = message;
                                dataList.forEach(function browser_content_share_content_agentDetails_createListItem_each(value:string):void {
                                    const li:HTMLElement = document.createElement("li");
                                    li.innerHTML = value;
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
                    createListItem(`User ID: ${browser.data.hashUser}`);
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
                    const title:Element = document.createElement("h4"),
                        toolList:Element = document.createElement("ul"),
                        messageButton:HTMLElement = document.createElement("button"),
                        // videoButton:HTMLElement = document.createElement("button"),
                        subTitle = function browser_content_share_content_perAgent_subTitle(text:string):void {
                            const subTitleElement:Element = document.createElement("h5");
                            subTitleElement.innerHTML = `${browser[agentNames.agentType][agentNames.agent].name} ${text}`;
                            agent.appendChild(subTitleElement);
                        };
                    let li:Element;
                    shareListUL = document.createElement("ul");
                    shareListUL.setAttribute("class", "shares");
                    agent = document.createElement("div");

                    // title
                    title.innerHTML = browser[agentNames.agentType][agentNames.agent].name;
                    agent.appendChild(title);

                    // tool list
                    subTitle("tools");
                    toolList.setAttribute("class", "tools");
                    if (agentNames.agentType === "device") {
                        li = document.createElement("li");
                        li.appendChild(deviceButton());
                        toolList.appendChild(li);
                    }
                    if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== browser.data.hashDevice)) {
                        // text button
                        li = document.createElement("li");
                        messageButton.innerHTML = `<span>Text</span> ${browser[agentNames.agentType][agentNames.agent].name}`;
                        messageButton.setAttribute("class", "text-button-agent");
                        messageButton.setAttribute("type", "button");
                        messageButton.onclick = message.events.shareButton;
                        li.appendChild(messageButton);
                        toolList.appendChild(li);

                        // video button
                        // li = document.createElement("li");
                        // videoButton.innerHTML = `<span>Video Call</span> ${browser[agentNames.agentType][agentNames.agent].name}`;
                        // videoButton.setAttribute("class", "video-button-agent");
                        // videoButton.setAttribute("type", "button");
                        // videoButton.onclick = media.videoButton;
                        // li.appendChild(videoButton);
                        // toolList.appendChild(li);
                    }
                    agent.appendChild(toolList);

                    // share list
                    subTitle("shares");
                    if (Object.keys(browser[agentNames.agentType][agentNames.agent].shares).length > 0) {
                        agent.appendChild(shareListUL);
                    } else {
                        const p:Element = document.createElement("p");
                        p.innerHTML = `${common.capitalize(agentNames.agentType)} <em>${browser[agentNames.agentType][agentNames.agent].name}</em> has no shares.`;
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
                    const title:Element = document.createElement("h3"),
                        span:Element = document.createElement("span"),
                        list:string[] = Object.keys(browser[type]),
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
                    span.innerHTML = `There ${verb} ${listLength} <strong>${type + plural}</strong> ${adjective}.`;
                    title.appendChild(span);
                    title.setAttribute("class", "agent-list-heading");
                    messageButton.innerHTML = `Text all ${type}s`;
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
                const li:Element = document.createElement("li"),
                    button:HTMLElement = document.createElement("button"),
                    status:Element = document.createElement("strong"),
                    span:Element = document.createElement("span"),
                    shareItem:agentShare = browser[agentNames.agentType][agentNames.agent].shares[agentNames.share],
                    shareType:string = shareItem.type;
                button.setAttribute("class", `${agentNames.agentType}-share`);
                span.innerHTML = shareItem.name;
                button.appendChild(span);
                button.setAttribute("type", "button");
                status.setAttribute("class", "read-only-status");
                status.innerHTML = (shareItem.readOnly === true)
                    ? "(Read Only)"
                    : "(Full Access)";
                button.appendChild(status);
                if (shareType === "directory" || shareType === "file" || shareType === "link") {
                    button.onclick = fileNavigate;
                }
                li.setAttribute("data-hash", agentNames.share);
                if (agentNames.agentType === "device" && (agentNames.agent === agentName || agentName === "") && (agentType === "device" || agentType === "")) {
                    const del:HTMLElement = document.createElement("button"),
                        readOnly:HTMLButtonElement = document.createElement("button"),
                        span:Element = document.createElement("span");
                    if (shareItem.readOnly === true) {
                        li.setAttribute("class", "share");
                        readOnly.setAttribute("class", "grant-full-access");
                        readOnly.innerHTML = ("Grant Full Access");
                    } else {
                        li.setAttribute("class", "share full-access");
                        readOnly.setAttribute("class", "make-read-only");
                        readOnly.innerHTML = ("Make Read Only");
                    }
                    readOnly.setAttribute("type", "button");
                    readOnly.onclick = share.events.readOnly;
                    del.setAttribute("class", "delete");
                    del.setAttribute("title", "Delete this share");
                    del.innerHTML = "\u2718<span>Delete this share</span>";
                    del.setAttribute("type", "button");
                    del.onclick = agent_management.tools.deleteShare;
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
            const title:Element = document.createElement("h3");
            title.innerHTML = "There are <strong>0 users</strong> available.";
            sections.user.appendChild(title);
            sections.user.setAttribute("class", "agentList");
            all.appendChild(sections.user);
        }
        return all;
    },

    events: {

        /* Share utility for the "adding a share" context menu list */
        context: function browser_content_share_context():void {
            const element:Element = context.element,
                addresses:[string, fileType, string][] = util.selectedAddresses(element, "share"),
                deviceData:agentShares = browser.device[addresses[0][2]].shares,
                shares:string[] = Object.keys(deviceData),
                shareLength:number = shares.length,
                addressesLength:number = addresses.length,
                menu:Element = document.getElementById("contextMenu");
            let a:number = 0,
                b:number = 0;
            context.element = null;
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
            const element:Element = event.target as Element,
                box:Element = element.getAncestor("box", "class"),
                boxHash:string = box.getAttribute("data-agent"),
                parent:Element = element.parentNode as Element,
                hashDevice:string = (boxHash === "")
                    ? element.getAncestor("device", "class").getAttribute("data-hash")
                    : boxHash,
                hashShare:string = parent.getAttribute("data-hash"),
                manage:service_agentManagement = {
                    action: "modify",
                    agentFrom: browser.data.hashDevice,
                    agents: {
                        device: {},
                        user: {}
                    },
                    deviceUser: null
                };
            let item:agentShare;
            if (hashDevice === null) {
                return;
            }
            item = browser.device[hashDevice].shares[hashShare];
            if (item.readOnly === true) {
                item.readOnly = false;
            } else {
                item.readOnly = true;
            }
            manage.agents.device[hashDevice] = browser.device[hashDevice];
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
                    agentFrom: browser.data.hashDevice,
                    agents: {
                        device: {
                            [hash.device]: browser.device[hash.device]
                        },
                        user: {}
                    },
                    deviceUser: null
                };
            browser.device[hash.device].shares[hash.hash] = {
                execute: false,
                name: hash.share,
                readOnly: true,
                type: hash.type as fileType
            };
            // update any share modals
            share.tools.update("");
            // inform other agents of the share
            network.send(management, "agent-management");
        },

        /* Displays a list of shared items for each user */
        modal: function browser_content_shares_modal(agent:string, agentType:agentType|"", configuration:config_modal):void {
            if (configuration === null) {
                const icon:string = (agentType === "device")
                        ? "🖳"
                        : "👤",
                    identity:boolean = (agent !== "" && agentType !== ""),
                    title:string = (agent === "")
                        ? (agentType === "")
                            ? "⌘ All Shares"
                            : `${icon} All ${common.capitalize(agentType)} Shares`
                        : `${icon} Shares`;
                configuration = {
                    agent: agent,
                    agentIdentity: identity,
                    agentType: (identity === true)
                        ? agentType as agentType
                        : "device",
                    content: share.content(agent, agentType),
                    inputs: ["close", "maximize", "minimize"],
                    read_only: false,
                    text_value: title,
                    title: title,
                    type: "shares",
                    width: 800
                };
            } else {
                configuration.content = (configuration.title === "👤 All User Shares")
                    ? share.content("", "user")
                    : share.content(agent, agentType);
                configuration.type = "shares";
                configuration.text_value = configuration.title;
                configuration.inputs = ["close", "maximize", "minimize"];
            }
            modal.content(configuration);
        },

        /* Updates the contents of share modals */
        update: function browser_content_share_update(exclusion:string):void {
            const modals:string[] = Object.keys(browser.data.modals),
                modalLength = modals.length,
                closer = function browser_content_share_update_closer(id:string):void {
                    const button:HTMLButtonElement = document.getElementById(id).getElementsByClassName("close")[0] as HTMLButtonElement;
                    button.click();
                };
            let a:number = 0,
                modal:Element,
                body:Element,
                agent:string,
                item:config_modal,
                agentType:agentType | "";
            do {
                if (exclusion !== modals[a]) {
                    item = browser.data.modals[modals[a]];
                    if (browser[item.agentType][item.agent] === undefined && item.type !== "shares" && item.type !== "configuration" && item.type === "agent-management") {
                        closer(modals[a]);
                    } else if (item.type === "shares") {
                        modal = document.getElementById(modals[a]);
                        if (item.agent !== "" && browser[item.agentType][item.agent] === undefined) {
                            closer(modals[a]);
                        } else {
                            body = modal.getElementsByClassName("body")[0];
                            if (item.title.indexOf("All Shares") > -1) {
                                agentType = "";
                                agent = "";
                            } else if (item.title.indexOf("All User Shares") > -1) {
                                agentType = "user";
                                agent = "";
                            } else if (item.title.indexOf("All Device Shares") > -1) {
                                agentType = "device";
                                agent = "";
                            } else {
                                if (item.title.indexOf("Device,") > -1) {
                                    agentType = "device";
                                } else {
                                    agentType = "user";
                                }
                                agent = item.agent;
                            }
                            body.innerHTML = "";
                            body.appendChild(share.content(agent, agentType));
                        }
                    } else if (item.type === "agent-management") {
                        // redraw the edit and delete content of agent management modals
                        modal = document.getElementById(modals[a]).getElementsByClassName("agent-management")[0];
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