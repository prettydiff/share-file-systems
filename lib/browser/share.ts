
/* lib/browser/share - The utilities that manage and coordinate changes to user share data. */

import common from "../common/common.js";

import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import message from "./message.js";
import modal from "./modal.js";
import network from "./network.js";
import settings from "./settings.js";
import util from "./util.js";

const share:module_share = {};

/* Adds users to the user bar */
share.addAgent = function local_share_addAgent(input:addAgent):void {
    const li:HTMLLIElement = document.createElement("li"),
        button:HTMLElement = document.createElement("button"),
        addStyle = function local_share_addUser_addStyle() {
            let body:string,
                heading:string;
            if (browser.data.colors[input.type][input.hash] === undefined) {
                body = settings.colorDefaults[browser.data.color][0];
                heading = settings.colorDefaults[browser.data.color][1];
                browser.data.colors[input.type][input.hash] = [body, heading];
                network.storage("settings");
            } else {
                body = browser.data.colors[input.type][input.hash][0];
                heading = browser.data.colors[input.type][input.hash][1];
            }
            settings.styleText({
                agent: input.hash,
                colors: [body, heading],
                replace: false,
                type: input.type
            });
        },
        sharesModal = function local_share_addUser_sharesModal(event:MouseEvent) {
            let element:Element = <Element>event.target,
                agent:string = element.getAttribute("id"),
                agentType:agentType = <agentType>element.getAttribute("data-agent-type");
            element = element.getAncestor("button", "tag");
            share.modal(agent, agentType, null);
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
    if (browser.loadTest === false) {
        settings.addUserColor(input.hash, input.type, <Element>document.getElementById("settings-modal").getElementsByClassName("settings")[0]);
        share.update("");
        if (input.save === true) {
            network.storage(input.type);
        }
    }
};

/* Generate the content of a share modal */
share.content = function local_share_content(agentName:string, agentType:agentType|""):Element {
    if (agentName === undefined) {
        return document.getElementById("systems-modal");
    }

    const lists:Element = document.createElement("div"),
        fileNavigate = function local_share_content_fileNavigate(event:MouseEvent):void {
            const element:Element = (function local_share_content_fileNavigate_getElement():Element {
                    const item:Element = <Element>event.target;
                    if (item.nodeName.toLowerCase() === "button") {
                        return item;
                    }
                    return item.getAncestor("button", "tag");
                }()),
                agency:agency = util.getAgent(element),
                agentType:agentType = <agentType>element.getAttribute("class"),
                parent:Element = <Element>element.parentNode,
                agentNode:Element = element.getAncestor("agent", "class"),
                agent:string = (agency[0] === "")
                    ? agentNode.getAttribute("data-hash")
                    : agency[0],
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
            fs.navigate(event, {
                agentName: agent,
                agentType: agentType,
                path: address,
                readOnly: browser[agentType][agent].shares[share].readOnly,
                share: (agentType === "user")
                    ? share
                    : ""
            });
        },
        deviceButton = function local_share_content_deviceButton(title:Element, hash:string):void {
            const button:HTMLElement = document.createElement("button");
                button.setAttribute("class", "file-system-root");
                button.innerHTML = "File System Root";
                button.onclick = function local_share_content_perAgent_fsRoot():void {
                    fs.navigate(null, {
                        agentName: hash,
                        agentType: "device",
                        path: "**root**",
                        readOnly: false,
                        share: ""
                    });
                };
                title.appendChild(button);
        },
        perAgent = function local_share_content_perAgent(agentNames:agentNames):void {
            const li:Element = document.createElement("li"),
                title:Element = document.createElement("h4"),
                messageButton:HTMLElement = document.createElement("button");
            shareListUL = document.createElement("ul");
            if (agentNames.agentType === "device"  && agentNames.agent == browser.data.hashDevice) {
                title.innerHTML = browser.device[agentNames.agent].name;
            } else {
                messageButton.innerHTML = `${browser[agentNames.agentType][agentNames.agent].name} <span>(text)</span>`;
                messageButton.setAttribute("class", "text-button-agent");
                messageButton.onclick = message.modal;
                title.appendChild(messageButton);
            }
            if (agentNames.agentType === "device") {
                deviceButton(title, agentNames.agent);
            }
            li.appendChild(title);
            li.setAttribute("data-hash", agentNames.agent);
            li.setAttribute("class", agentNames.agentType);
            if (Object.keys(browser[agentNames.agentType][agentNames.agent].shares).length > 0) {
                li.appendChild(shareListUL);
            } else {
                const p:Element = document.createElement("p");
                p.innerHTML = `${common.capitalize(agentNames.agentType)} <em>${browser[agentNames.agentType][agentNames.agent].name}</em> has no shares.`;
                li.appendChild(p);
            }
            agentTypeUL.appendChild(li);
        },
        perAgentType = function local_share_content_perAgentType(agentNames:agentNames):void {
            const type:agentType = agentNames.agentType;
            agentTypeUL = document.createElement("ul");
            if (agentName === "" && (agentType === "" || agentType === type)) {
                const title:Element = document.createElement("h3"),
                    list:string[] = Object.keys(browser[type]),
                    listLength:number = list.length;
                if (listLength > 0) {
                    const plural:string = (listLength === 1)
                            ? ""
                            : "s",
                        verb:string = (listLength === 1)
                            ? "is"
                            : "are",
                        adjective:string = (type === "device")
                            ? "available"
                            : "shared",
                        messageButton:HTMLElement = document.createElement("button");
                    agentTypeUL.setAttribute("class", "agentList")
                    title.innerHTML = `There ${verb} ${listLength} <strong>${type + plural}</strong> ${adjective}.`;
                    messageButton.innerHTML = `Text all ${type}s`;
                    messageButton.setAttribute("class", `text-button-${type}`);
                    messageButton.onclick = message.modal;
                    title.appendChild(messageButton);
                    lists.appendChild(title);
                    lists.appendChild(agentTypeUL);
                } else {
                    title.innerHTML = `There are no <strong>${type}</strong> connections at this time.`;
                    lists.appendChild(title);
                }
            }
        },
        perShare = function local_share_content_perShare(agentNames:agentNames):void {
            const li:Element = document.createElement("li"),
                button:HTMLElement = document.createElement("button"),
                status:Element = document.createElement("strong"),
                shareItem:agentShare = browser[agentNames.agentType][agentNames.agent].shares[agentNames.share],
                shareType:string = shareItem.type;
            button.setAttribute("class", agentNames.agentType);
            button.innerHTML = shareItem.name;
            status.setAttribute("class", "read-only-status");
            status.innerHTML = (shareItem.readOnly === true)
                ? "(Read Only)"
                : "(Full Access)"
            button.appendChild(status);
            if (shareType === "directory" || shareType === "file" || shareType === "link") {
                button.onclick = fileNavigate;
            }
            li.setAttribute("data-hash", agentNames.share);
            if (agentNames.agentType === "device") {
                const del:HTMLElement = document.createElement("button"),
                    readOnly:HTMLButtonElement = document.createElement("button"),
                    span:Element = document.createElement("span");
                if (shareItem.readOnly === true) {
                    li.setAttribute("class", "share");
                    readOnly.setAttribute("class", "grant-full-access");
                    readOnly.innerHTML = ("Grant Full Access");
                } else {
                    li.setAttribute("class", "device full-access");
                    readOnly.setAttribute("class", "make-read-only");
                    readOnly.innerHTML = ("Make Read Only");
                }
                readOnly.onclick = share.readOnly;
                del.setAttribute("class", "delete");
                del.setAttribute("title", "Delete this share");
                del.innerHTML = "\u2718<span>Delete this share</span>";
                del.onclick = share.deleteItem;
                span.setAttribute("class", "clear");
                li.appendChild(del);
                li.appendChild(button);
                li.appendChild(readOnly);
                li.appendChild(span);
            } else {
                if (shareItem.readOnly === false) {
                    li.setAttribute("class", "full-access");
                }
                li.appendChild(button);
            }
            shareListUL.appendChild(li);
        };
    let agentTypeUL:Element,
        shareListUL:Element;

    if (agentName === "" || agentType === "") {
        common.agents({
            countBy: "share",
            perAgent: perAgent,
            perAgentType: perAgentType,
            perShare: perShare,
            source: browser
        });
    } else {
        const title:Element = document.createElement("h3"),
            div:Element = document.createElement("div"),
            shares:string[] = Object.keys(browser[agentType][agentName].shares),
            shareLength:number = shares.length;
        title.innerHTML = `Shares for ${agentType} ${browser[agentType][agentName].name}`;
        div.setAttribute("class", "agentList");
        if (agentType === "device") {
            deviceButton(title, agentName);
        }
        div.appendChild(title);
        if (shareLength < 1) {
            const p:Element = document.createElement("p");
            p.setAttribute("class", "no-shares");
            p.innerHTML = `${common.capitalize(agentType)} <em>${browser[agentType][agentName].name}</em> has no shares.`;
            div.appendChild(p);
        } else {
            let a:number = 0;
            shareListUL = document.createElement("ul");
            shareListUL.setAttribute("class", "agent");
            do {
                perShare({
                    agent: agentName,
                    agentType: agentType,
                    share: shares[a]
                });
                a = a + 1;
            } while (a < shareLength);
            div.appendChild(shareListUL);
        }
        lists.appendChild(div);
    }
    return lists;
};

/* Share utility for the "adding a share" context menu list */
share.context = function local_share_context():void {
    const element:Element = context.element,
        addresses:[string, shareType, string][] = util.selectedAddresses(element, "share"),
        deviceData:agentShares = browser.device[addresses[0][2]].shares,
        shares:string[] = Object.keys(deviceData),
        shareLength:number = shares.length,
        addressesLength:number = addresses.length,
        payload: hashShareConfiguration = {
            callback: function local_share_context_shareHash(responseBody:string):void {
                const shareResponse:hashShareResponse = JSON.parse(responseBody).shareHashResponse;
                browser.device[shareResponse.device].shares[shareResponse.hash] = {
                    execute: false,
                    name: shareResponse.share,
                    readOnly: true,
                    type: <shareType>shareResponse.type
                };
                share.update("");
                network.heartbeat("active", true);
            },
            device: "",
            share: "",
            type: "file"
        };
    context.element = null;
    let a:number = 0,
        b:number = 0;
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
                payload.device = addresses[a][2];
                payload.share = addresses[a][0];
                payload.type = addresses[a][1];
                network.hashShare(payload);
            }
            a = a + 1;
        } while (a < addressesLength);
    } else {
        do {
            payload.device = addresses[a][2];
            payload.share = addresses[a][0];
            payload.type = addresses[a][1];
            network.hashShare(payload);
            a = a + 1;
        } while (a < addressesLength);
    }
    util.selectNone(element);
};

/* Terminate an agent from either a websocket request or from share.deleteAgentList */
share.deleteAgent = function local_share_deleteAgent(agent:string, agentType:agentType):void {
    const userColors = document.getElementById("settings-modal").getElementsByClassName(`${agentType}-color-list`)[0].getElementsByTagName("li"),
        colorLength:number = userColors.length,
        button:Element = document.getElementById(agent),
        parent:Element = (button === null)
            ? null
            : <Element>button.parentNode;
    let a:number = 0;

    // remove the agent from the data structures
    delete browser[agentType][agent];
    delete browser.data.colors[agentType][agent];

    // remove the named button for the agent
    if (parent !== null && button.getAttribute("data-agent-type") === agentType) {
        parent.parentNode.removeChild(parent);
    }

    // loop through the color swatches in the settings modal to remove the agent's colors
    do {
        if (userColors[a].getAttribute("data-agent") === agent) {
            userColors[a].parentNode.removeChild(userColors[a]);
            break;
        }
        a = a + 1;
    } while (a < colorLength);
};

/* Processes agent termination from a share_delete modal */
share.deleteAgentList = function local_shares_deleteAgentList(box:Element):void {
    const body:Element = box.getElementsByClassName("body")[0],
        list:HTMLCollectionOf<Element> = body.getElementsByTagName("li"),
        deleted:agentList = {
            device: [],
            user: []
        };
    let a:number = list.length,
        count:number = 0,
        input:HTMLInputElement,
        type:agentType,
        subtitle:Element,
        hash:string,
        parent:Element;

    // put the deleted agents into a list
    do {
        a = a - 1;
        input = list[a].getElementsByTagName("input")[0];
        if (input.checked === true) {
            hash = input.value;
            type = <agentType>input.getAttribute("data-type");
            parent = <Element>document.getElementById(hash).parentNode;
            if (list[a].parentNode.childNodes.length < 2) {
                subtitle = document.createElement("p");
                subtitle.innerHTML = `No ${type}s to delete.`;
                subtitle.setAttribute("class", "summary");
                list[a].parentNode.parentNode.insertBefore(subtitle, list[a].parentNode);
                list[a].parentNode.parentNode.removeChild(list[a].parentNode);
            } else {
                list[a].parentNode.removeChild(list[a]);
            }
            parent.parentNode.removeChild(parent);
            share.deleteAgent(hash, type);
            count = count + 1;
            deleted[type].push(hash);
        }
    } while (a > 0);
    if (count < 1) {
        return;
    }
    network.deleteAgents(deleted);
    share.update("");
    network.storage("settings");
};

/* Delete a share from a device */
share.deleteItem = function local_share_deleteItem(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        parent:Element = <Element>element.parentNode,
        box:Element = parent.getAncestor("box", "class"),
        agent:string = (function local_share_deleteItem_agency():string {
            const boxAgent:agency = util.getAgent(box);
            if (boxAgent[0] === null || boxAgent[0] === "") {
                return element.getAncestor("agent", "class").getAttribute("data-hash");
            }
            return boxAgent[0];
        }()),
        address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
        shares:agentShares = browser.device[agent].shares,
        keys:string[] = Object.keys(shares),
        length:number = keys.length;
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
            granny:Element = <Element>parent.parentNode;
        p.innerHTML = `Device <em>${browser.device[agent].name}</em> has no shares.`;
        granny.parentNode.appendChild(p);
        granny.parentNode.removeChild(granny);
    } else {
        parent.parentNode.removeChild(parent);
    }
    share.update(box.getAttribute("id"));
    network.heartbeat("active", true);
};

/* Creates a confirmation modal listing users for deletion */
share.deleteList = function local_share_deleteList(event:MouseEvent, configuration?:ui_modal):void {
    const content:Element = share.deleteListContent(),
        total:number = content.getElementsByTagName("li").length,
        payloadModal:ui_modal = {
            agent: browser.data.hashDevice,
            agentType: "device",
            content: content,
            inputs: ["close"],
            read_only: false,
            single: true,
            title: "<span class=\"icon-delete\">☣</span> Delete Shares",
            type: "share_delete",
            width: 750
        };
    
    if (configuration === undefined) {
        if (total > 0) {
            payloadModal.inputs = ["confirm", "cancel", "close"];
        }
        modal.create(payloadModal);
        network.storage("settings");
    } else {
        configuration.agent = browser.data.hashDevice;
        configuration.content = content;
        if (total > 0) {
            configuration.inputs = ["confirm", "cancel", "close"];
        } else {
            configuration.inputs = ["close"];
        }
        configuration.single = true;
        configuration.title = "<span class=\"icon-delete\">☣</span> Delete Shares";
        configuration.type = "share_delete";
        modal.create(configuration);
    }
    document.getElementById("menu").style.display = "none";
};

/* Creates the HTML content of the share_delete type modal. */
share.deleteListContent = function local_shares_deleteListContent():Element {
    const content:Element = document.createElement("div");
    let li:Element,
        input:HTMLInputElement,
        label:Element,
        text:Text,
        p:Element,
        h3:Element,
        names:string[],
        length:number,
        total:number = 0,
        ul:Element = document.createElement("ul");
    content.setAttribute("class", "share-delete");
    common.agents({
        countBy: "agent",
        perAgent: function local_share_deleteList_perAgent(agentNames:agentNames):void {
            if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== browser.data.hashDevice)) {
                li = document.createElement("li");
                li.setAttribute("class", "summary");
                label = document.createElement("label");
                input = document.createElement("input");
                text = document.createTextNode(browser[agentNames.agentType][agentNames.agent].name);
                input.type = "checkbox";
                input.value = agentNames.agent;
                input.setAttribute("data-type", agentNames.agentType);
                input.onclick = share.deleteToggle;
                label.appendChild(input);
                label.appendChild(text);
                li.appendChild(label);
                ul.appendChild(li);
            }
        },
        perAgentType: function local_share_deleteList_perAgentType(agentNames:agentNames):void {
            h3 = document.createElement("h3");
            h3.innerHTML = `${common.capitalize(agentNames.agentType)}s`;
            names = Object.keys(browser[agentNames.agentType]);
            length = names.length;
            content.appendChild(h3);
            total = total + length;
            if ((agentNames.agentType === "device" && length > 1) || (agentNames.agentType !== "device" && length > 0)) {
                ul = document.createElement("ul");
                content.appendChild(ul);
            } else {
                p = document.createElement("p");
                p.setAttribute("class", "summary");
                p.innerHTML = `No ${agentNames.agentType}s to delete.`;
                content.appendChild(p);
            }
        },
        source: browser
    });
    if (total > 1) {
        p = document.createElement("p");
        p.setAttribute("class", "summary");
        p.innerHTML = "<strong>Please be warned that confirming these change is permanent.</strong> Confirming any selected changes will remove the relationship both locally and on the remote devices/users.";
        content.insertBefore(p, content.firstChild);
    }
    return content;
};

/* Changes visual state of items in the shares delete list as they are checked or unchecked*/
share.deleteToggle = function local_shares_deleteToggle(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.target,
        label:Element = <Element>element.parentNode;
    if (element.checked === true) {
        label.setAttribute("class", "checked");
    } else {
        label.removeAttribute("class");
    }
};

/* Displays a list of shared items for each user */
share.modal = function local_shares_modal(agent:string, agentType:agentType|"", configuration:ui_modal|null):void {
    if (configuration === null) {
        const icon:string = (agentType === "device")
                ? "🖳"
                : "👤",
            title:string = (agent === "")
                ? (agentType === "")
                    ? "⌘ All Shares"
                    : `${icon} All ${common.capitalize(agentType)} Shares`
                : `${icon} Shares for ${agentType} - ${browser[agentType][agent].name}`;
        configuration = {
            agent: agent,
            agentType: (agentType === "" || agent === "")
                ? "device"
                : agentType,
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
    modal.create(configuration);
};

/* Toggle a share between read only and full access */
share.readOnly = function local_share_readOnly(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        parent:Element = <Element>element.parentNode,
        agency:agency = util.getAgent(element),
        hash:string = parent.getAttribute("data-hash"),
        item:agentShare = browser.device[agency[0]].shares[hash];
    if (agency[2] !== "device") {
        return;
    }
    if (item.readOnly === true) {
        item.readOnly = false;
    } else {
        item.readOnly = true;
    }
    network.heartbeat("active", true);
    share.update("");
};

/* Updates the contents of share modals */
share.update = function local_share_update(exclusion:string):void {
    const modals = Object.keys(browser.data.modals),
        modalLength = modals.length,
        closer = function local_share_update_closer(modal:Element):void {
            modal.parentNode.removeChild(modal);
            delete browser.data.modals[modal.getAttribute("id")];
        };
    let a:number = 0,
        modal:Element,
        body:Element,
        agent:string,
        item:ui_modal,
        agentType:agentType | "";
    do {
        if (exclusion !== modals[a]) {
            item = browser.data.modals[modals[a]];
            if (browser[item.agentType][item.agent] === undefined && item.type !== "shares" && item.type !== "settings" && item.type !== "systems" && item.type !== "share_delete") {
                closer(document.getElementById(modals[a]));
            } else if (item.type === "shares") {
                modal = document.getElementById(modals[a]);
                if (item.agent !== "" && browser[item.agentType][item.agent] === undefined) {
                    closer(modal);
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
                        if (item.title.indexOf("device") > -1) {
                            agentType = "device";
                        } else {
                            agentType = "user";
                        }
                        agent = item.agent;
                    }
                    body.innerHTML = "";
                    body.appendChild(share.content(agent, agentType));
                }
            } else if (item.type === "share_delete") {
                modal = document.getElementById(modals[a]);
                body = modal.getElementsByClassName("body")[0];
                body.innerHTML = "";
                body.appendChild(share.deleteListContent());
            }
        }
        a = a + 1;
    } while (a < modalLength);
};

export default share;