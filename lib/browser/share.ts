
/* lib/browser/share - The utilities that manage and coordinate changes to user share data. */

import agents from "../common/agents.js";

import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import modal from "./modal.js";
import network from "./network.js";
import settings from "./settings.js";
import util from "./util.js";

const share:module_share = {};

/* Adds users to the user bar */
share.addAgent = function local_share_addAgent(userName:string, userHash:string, type:agentType):void {
    const li:HTMLLIElement = document.createElement("li"),
        button:HTMLElement = document.createElement("button"),
        addStyle = function local_share_addUser_addStyle() {
            let body:string,
                heading:string;
            if (browser.data.colors[type][userHash] === undefined) {
                body = settings.colorDefaults[browser.data.color][0];
                heading = settings.colorDefaults[browser.data.color][1];
                browser.data.colors[type][userHash] = [body, heading];
                network.storage("settings");
            } else {
                body = browser.data.colors[type][userHash][0];
                heading = browser.data.colors[type][userHash][1];
            }
            settings.styleText({
                agent: userHash,
                colors: [body, heading],
                replace: false,
                type: type
            });
        },
        sharesModal = function local_share_addUser_sharesModal(event:MouseEvent) {
            let element:Element = <Element>event.srcElement || <Element>event.target,
                agent:string = element.getAttribute("id"),
                agentType:agentType = <agentType>element.getAttribute("data-agent-type");
            element = element.getAncestor("button", "tag");
            share.modal(agent, agentType, null);
        };
    button.innerHTML = `<em class="status-active">●<span> Active</span></em><em class="status-idle">●<span> Idle</span></em><em class="status-offline">●<span> Offline</span></em> ${userName}`;
    if (userHash === browser.data.hashDevice) {
        button.setAttribute("class", "active");
    } else {
        button.setAttribute("class", "offline");
    }
    addStyle();
    button.setAttribute("id", userHash);
    button.setAttribute("data-agent-type", type);
    button.onclick = sharesModal;
    li.appendChild(button);
    document.getElementById(type).getElementsByTagName("ul")[0].appendChild(li);
    if (browser.loadTest === false) {
        settings.addUserColor(userHash, type, <Element>document.getElementById("settings-modal").getElementsByClassName("settings")[0]);
        share.update();
        network.storage(type);
    }
};

/* Generate the content of a share modal */
share.content = function local_share_content(agentName:string, agentType:agentType|""):Element {
    if (agentName === undefined) {
        return document.getElementById("systems-modal");
    }

    const lists:Element = document.createElement("div"),
        fileNavigate = function local_share_content_fileNavigate(event:MouseEvent):void {
            const element:Element = <Element>event.srcElement || <Element>event.target,
                list:Element = <Element>element.parentNode.parentNode.parentNode,
                agentType:agentType = <agentType>list.getAttribute("id"),
                path:string = element.firstChild.textContent,
                type:string = element.getAttribute("class"),
                slash:string = (path.indexOf("/") > -1 && (path.indexOf("\\") < 0 || path.indexOf("\\") > path.indexOf("/")))
                    ? "/"
                    : "\\";
            let address:string,
                agent:string = element.parentNode.parentNode.previousSibling.firstChild.textContent;
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
                readOnly: (agent !== browser.data.hashDevice && element.getElementsByClassName("read-only-status")[0].innerHTML === "(Read Only)")
            });
        },
        perShare = function local_share_content_perShare(agentNames:agentNames):void {
            const li:Element = document.createElement("li"),
                button:HTMLElement = document.createElement("button"),
                status:Element = document.createElement("strong"),
                shareItem:deviceShare = browser[agentNames.agentType][agentNames.agent].shares[agentNames.share],
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
                    li.appendChild(button);
                }
            }
            shareListUL.appendChild(li);
        };
    let agentTypeUL:Element,
        shareListUL:Element;

    if (agentName === "" || agentType === "") {
        agents({
            countBy: "share",
            perAgent: function local_share_content_perAgent(agentNames:agentNames):void {
                const li:Element = document.createElement("li"),
                    title:Element = document.createElement("h4");
                shareListUL = document.createElement("ul");
                title.innerHTML = browser[agentNames.agentType][agentNames.agent].name;
                if (agentNames.agentType === "device") {
                    const button:HTMLElement = document.createElement("button");
                    button.setAttribute("class", "file-system-root");
                    button.innerHTML = "File System Root";
                    button.onclick = function local_share_content_perAgent_fsRoot():void {
                        fs.navigate(null, {
                            agentName: agentNames.agent,
                            agentType: "device",
                            path: "**root**",
                            readOnly: false
                        });
                    };
                    title.appendChild(button);
                }
                li.appendChild(title);
                li.setAttribute("data-hash", agentNames.agent);
                li.setAttribute("class", "agent");
                if (Object.keys(browser[agentNames.agentType][agentNames.agent].shares).length > 0) {
                    li.appendChild(shareListUL);
                } else {
                    const p:Element = document.createElement("p");
                    p.innerHTML = `${agentNames.agentType.slice(0, 1).toUpperCase() + agentNames.agentType.slice(1)} <em>${browser[agentNames.agentType][agentNames.agent].name}</em> has no shares.`;
                    li.appendChild(p);
                }
                agentTypeUL.appendChild(li);
            },
            perAgentType: function local_share_content_perAgentType(agentNames:agentNames):void {
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
                                : "shared";
                        agentTypeUL.setAttribute("class", "agentList")
                        title.innerHTML = `There ${verb} ${listLength} <strong>${type + plural}</strong> ${adjective}.`;
                        lists.appendChild(title);
                        lists.appendChild(agentTypeUL);
                    } else {
                        title.innerHTML = `There are no <strong>${type}</strong> connections at this time.`;
                        lists.appendChild(title);
                    }
                }
            },
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
            const button:HTMLElement = document.createElement("button");
            button.setAttribute("class", "file-system-root");
            button.innerHTML = "File System Root";
            button.onclick = function local_share_content_perAgent_fsRoot():void {
                fs.navigate(null, {
                    agentName: agentName,
                    agentType: "device",
                    path: "**root**",
                    readOnly: false
                });
            };
            title.appendChild(button);
        }
        div.appendChild(title);
        if (shareLength < 1) {
            const p:Element = document.createElement("p");
            p.setAttribute("class", "no-shares");
            p.innerHTML = `${agentType.slice(0, 1).toUpperCase() + agentType.slice(1)} <em>${browser[agentType][agentName].name}</em> has no shares.`;
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

/* Share utility for the context menu list */
share.context = function local_share_context():void {
    const element:Element = context.element,
        addresses:[string, shareType, string][] = util.selectedAddresses(element, "share"),
        deviceData:deviceShares = browser.device[addresses[0][2]].shares,
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
                share.update();
                network.storage("device");
                network.heartbeat("active", shareResponse.device, browser.device[shareResponse.device].shares);
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
        deleted:[string, agentType][] = [];
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
            deleted.push([hash, type]);
        }
    } while (a > 0);
    if (count < 1) {
        return;
    }
    network.deleteAgents(deleted);
    share.update();
    network.storage("settings");
};

/* Delete a share from a device */
share.deleteItem = function local_share_deleteItem(event:MouseEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        agent:agency = util.getAgent(element),
        parent:Element = <Element>element.parentNode,
        address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
        shares:deviceShares = browser.device[agent[0]].shares,
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
        p.innerHTML = `Device <em>${browser.device[agent[0]].name}</em> has no shares.`;
        granny.parentNode.appendChild(p);
        granny.parentNode.removeChild(granny);
    } else {
        parent.parentNode.removeChild(parent);
    }
    share.update();
    network.storage("device");
    network.heartbeat("active", agent[0], browser.device[agent[0]].shares);
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
    agents({
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
            h3.innerHTML = `${agentNames.agentType.charAt(0).toUpperCase() + agentNames.agentType.slice(1)}s`;
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
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        label:Element = <Element>element.parentNode;
    if (element.checked === true) {
        label.setAttribute("class", "checked");
    } else {
        label.removeAttribute("class");
    }
};

/* Displays a list of shared items for each user */
share.modal = function local_shares_modal(agent:string, agentType:agentType|"", configuration:ui_modal|null):void {
    const content:Element = share.content(agent, agentType),
        icon:string = (agentType === "device")
            ? "🖳"
            : "👤",
        title:string = (agent === "")
            ? (agentType === "")
                ? "⌘ All Shares"
                : `${icon} All ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Shares`
            : `${icon} Shares for ${agentType} - ${browser[agentType][agent].name}`;
    if (configuration === undefined || configuration === null) {
        configuration = {
            agent: agent,
            agentType: (agentType === "" || agent === "")
                ? "device"
                : agentType,
            content: content,
            read_only: false,
            title: title,
            type: "shares",
            width: 800
        };
    } else {
        configuration.content = content;
        configuration.title = title;
        configuration.type = "shares";
    }
    configuration.text_value = title;
    configuration.inputs = ["close", "maximize", "minimize"];
    modal.create(configuration);
};

/* Toggle a share between read only and full access */
share.readOnly = function local_share_readOnly(event:MouseEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        parent:Element = <Element>element.parentNode,
        address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
        agency:agency = util.getAgent(element),
        shares:deviceShares = browser[agency[2]][agency[0]].shares,
        keys:string[] = Object.keys(shares),
        length:number = keys.length,
        span:Element = parent.getElementsByClassName("read-only-status")[0];
    let a:number = 0;
    if (agency[2] !== "device") {
        return;
    }
    do {
        if (shares[keys[a]].name === address) {
            if (shares[keys[a]].readOnly === true) {
                shares[keys[a]].readOnly = false;
            } else {
                shares[keys[a]].readOnly = true;
            }
            break;
        }
        a = a + 1;
    } while (a < length);
    if (element.getAttribute("class") === "grant-full-access") {
        element.setAttribute("class", "make-read-only");
        parent.setAttribute("class", "full-access");
        element.innerHTML = "Make Read Only";
        span.innerHTML = "(Full Access)";
    } else {
        element.setAttribute("class", "grant-full-access");
        parent.removeAttribute("class");
        element.innerHTML = "Grant Full Access";
        span.innerHTML = "(Read Only)";
    }
    share.update();
    network.heartbeat("active", agency[0], browser.device[agency[0]].shares);
    network.storage(agency[2]);
};

/* Updates the contents of share modals */
share.update = function local_share_update():void {
    const modals = Object.keys(browser.data.modals),
        modalLength = modals.length,
        closer = function local_share_update_closer(modal:Element):void {
            const close = <HTMLElement>modal.getElementsByClassName("close")[0];
            close.click();
        };
    let a:number = 0,
        modal:Element,
        body:Element,
        agent:string,
        item:ui_modal,
        agentType:agentType | "";
    do {
        item = browser.data.modals[modals[a]];
        if (browser[item.agentType][item.agent] === undefined && item.type !== "shares" && item.type !== "share_delete") {
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
        a = a + 1;
    } while (a < modalLength);
};

export default share;