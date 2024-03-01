
/* lib/browser/utilities/share_content - The content of share modals. */

import browser from "./browser.js";
import common from "../../common/common.js";
import message from "../content/message.js";
import modal_fileNavigate from "./modal_fileNavigate.js";
import modal_message from "./modal_message.js";
import modal_terminal from "./modal_terminal.js";

// cspell: words agenttype

const share_content = function browser_utilities_shareContent(agentName:string, agentType:agentType|""):HTMLElement {
    let shareListUL:HTMLElement = document.createElement("ul"),
        agent:HTMLElement,
        user:boolean = false;
    const sections:share_content_sections = {
            device: document.createElement("div"),
            user: document.createElement("div")
        },
        all:HTMLElement = document.createElement("div"),
        shareButton = function browser_utilities_shareContent_shareButton(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                source:HTMLElement = (element.lowName() === "button")
                    ? element
                    : element.parentNode,
                className:string = source.getAttribute("class"),
                box:modal = element.getAncestor("box", "class"),
                grandParent:HTMLElement = source.parentNode.parentNode,
                agentAttribute:string = box.dataset.agent,
                agentHash:string = (agentAttribute === "")
                    ? (className === "share-tool-message")
                        ? grandParent.dataset.hash
                        : browser.identity.hashDevice
                    : agentAttribute,
                agentType:agentType = (agentAttribute === "")
                    ? (className === "share-tool-message")
                        ? grandParent.getAttribute("class") as agentType
                        : source.getAttribute("class").replace("text-button-", "") as agentType
                    : box.dataset.agenttype as agentType,
                modals:HTMLElement[] = document.getModalsByModalType("message");
            let a:number = modals.length,
                messageModal:HTMLElement = null;
            if (a > 0) {
                do {
                    a = a - 1;
                    if (modals[a].dataset.agenttype === agentType && modals[a].dataset.agent === agentHash) {
                        modals[a].click();
                        return;
                    }
                } while (a > 0);
            }
            messageModal = modal_message(event, null);
            message.tools.populate(messageModal.getAttribute("id"));
        },
        // open a file navigate modal to a location
        fileNavigate = function browser_utilities_shareContent_fileNavigate(event:MouseEvent):void {
            const element:HTMLElement = (function browser_utilities_shareContent_fileNavigate_getElement():HTMLElement {
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
            modal_fileNavigate(event, {
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
        toolButton = function browser_utilities_shareContent_toolButton(config:config_share_tool):void {
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
        agentDetails = function browser_utilities_shareContent_agentDetails(type:agentType, agentString:string):HTMLElement {
            const agentDetails:HTMLElement = document.createElement("ul"),
                agent:agent = browser.agents[type][agentString],
                ip:string[] = (type === "device" && agentString === browser.identity.hashDevice)
                    ? ["127.0.0.1", "::1"]
                    : [agent.ipSelected],
                createListItem = function browser_utilities_shareContent_agentDetails_createListItem(message:string, dataList?:string[]):void {
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
                            dataList.forEach(function browser_utilities_shareContent_agentDetails_createListItem_each(value:string):void {
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
            createListItem("Port: ", [String(agent.port)]);

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
        perAgent = function browser_utilities_shareContent_perAgent(agentNames:agentNames):void {
            if ((agentName === "" || agentName === agentNames.agent) && (agentType === "" || agentType === agentNames.agentType)) {
                const title:HTMLElement = document.createElement("h4"),
                    toolList:HTMLElement = document.createElement("ul"),
                    subTitle = function browser_utilities_shareContent_perAgent_subTitle(text:string):void {
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
                        handler: modal_fileNavigate,
                        identity: null,
                        list: toolList,
                        text: "File System Root"
                    });

                    // command terminal button
                    toolButton({
                        className: "terminal",
                        handler: modal_terminal,
                        identity: null,
                        list: toolList,
                        text: "Command Terminal"
                    });
                }
                if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== browser.identity.hashDevice)) {
                    // text button
                    toolButton({
                        className: "message",
                        handler: shareButton,
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
        perAgentType = function browser_utilities_shareContent_perAgentType(agentNames:agentNames):void {
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
                messageButton.onclick = shareButton;
                title.appendChild(messageButton);
                sections[agentNames.agentType].appendChild(title);
            }
            sections[type].setAttribute("class", "agentList");
            all.appendChild(sections[agentNames.agentType]);
            if (type === "user") {
                user = true;
            }
        },
        perShare = function browser_utilities_shareContent_perShare(agentNames:agentNames):void {
            const li:HTMLElement = document.createElement("li"),
                button:HTMLElement = document.createElement("button"),
                status:HTMLElement = document.createElement("strong"),
                span:HTMLElement = document.createElement("span"),
                shareItem:agentShare = browser.agents[agentNames.agentType][agentNames.agent].shares[agentNames.share],
                shareType:string = shareItem.type,
                deleteToggle = function browser_utilities_shareContent_perShare_deleteToggle(event:MouseEvent):void {
                    const element:HTMLElement = event.target,
                        parent:HTMLElement = element.parentNode,
                        box:modal = parent.getAncestor("box", "class"),
                        agent:string = (function browser_utilities_shareContent_perShare_deleteToggle_agency():string {
                            let agentNode:HTMLElement = parent;
                            do {
                                agentNode = agentNode.parentNode;
                            } while (agentNode.getAttribute("class") !== "device" && agentNode.getAttribute("class") !== "user");
                            return agentNode.dataset.hash;
                        }()),
                        address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
                        shares:agentShares = (agent === null)
                            ? null
                            : browser.agents.device[agent].shares,
                        keys:string[] = (agent === null)
                            ? null
                            : Object.keys(shares),
                        length:number = (agent === null)
                            ? 0
                            : keys.length,
                        manage:service_agentManagement = {
                            action: "modify",
                            agentFrom: browser.identity.hashDevice,
                            agents: {
                                device: {},
                                user: {}
                            },
                            identity: null
                        };
                    let a:number = 0;
                    if (length < 1) {
                        return;
                    }
                    do {
                        if (shares[keys[a]].name === address) {
                            delete shares[keys[a]];
                            break;
                        }
                        a = a + 1;
                    } while (a < length);
                    if (length === 1) {
                        const p:HTMLElement = document.createElement("p"),
                            granny:HTMLElement = parent.parentNode,
                            em:HTMLElement = document.createElement("em");
                        em.appendText(browser.agents.device[agent].name);
                        p.appendText("Device ");
                        p.appendChild(em);
                        p.appendText(" has no shares.");
                        granny.parentNode.insertBefore(p, granny);
                        granny.parentNode.removeChild(granny);
                    } else {
                        parent.parentNode.removeChild(parent);
                    }
                    manage.agents.device[agent] = browser.agents.device[agent];
                    browser.send(manage, "agent-management");
                };
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
                    span1:HTMLElement = document.createElement("span"),
                    readOnlyHandler = function browser_content_share_readOnly(event:MouseEvent):void {
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
                                identity: null
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
                        browser.send(manage, "agent-management");
                    };
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
                readOnly.onclick = readOnlyHandler;
                del.setAttribute("class", "delete");
                del.setAttribute("title", "Delete this share");
                span1.appendText("Delete this share");
                del.appendText("\u2718");
                del.appendChild(span1);
                del.setAttribute("type", "button");
                del.onclick = deleteToggle;
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
};

export default share_content;