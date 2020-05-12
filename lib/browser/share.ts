
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
        },
        modals:string[] = Object.keys(browser.data.modals),
        length: number = modals.length;
    let a:number = 0,
        shareUser:Element;
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
        do {
            if (browser.data.modals[modals[a]].type === "shares" && browser.data.modals[modals[a]].agent === "") {
                const agentList:Element = <Element>document.getElementById(modals[a]).getElementsByClassName("agentList")[0];
                if (agentList !== undefined) {
                    shareUser = document.createElement("li");
                    shareUser.appendChild(share.content(userHash, type));
                    agentList.appendChild(shareUser);
                }
            }
            a = a + 1;
        } while (a < length);
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
                nameDevice: (agentType === "device")
                    ? browser.device[agent].name
                    : "",
                path: address,
                readOnly: (agent !== browser.data.hashDevice && element.getElementsByClassName("read-only-status")[0].innerHTML === "(Read Only)")
            });
        };
    let agentTypeUL:Element,
        shareListUL:Element;

    agents({
        countBy: "share",
        perAgent: function local_share_content_perAgent(agentNames:agentNames):void {
            const li:Element = document.createElement("li"),
                title:Element = document.createElement("h4");
            shareListUL = document.createElement("ul");
            title.innerHTML = browser[agentNames.agentType][agentNames.agent].name;
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
                        : "s";
                    agentTypeUL.setAttribute("class", "agentList")
                    title.innerHTML = `There are ${listLength} <strong>${type + plural}</strong> shared.`;
                    lists.appendChild(title);
                    lists.appendChild(agentTypeUL);
                } else {
                    title.innerHTML = `There are no <strong>${type}</strong> connections at this time.`;
                    lists.appendChild(title);
                }
            }
        },
        perShare: function local_share_content_perShare(agentNames:agentNames):void {
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
                if (shareItem.readOnly === true) {
                    li.setAttribute("class", "full-access");
                    li.appendChild(button);
                }
            }
            shareListUL.appendChild(li);
        },
        source: browser
    });
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
        box:Element = element.getAncestor("box", "class"),
        agent:agency = util.getAgent(box),
        payload: hashShareConfiguration = {
            callback: function local_share_context_shareHash(responseBody:string):void {
                const shareResponse:hashShareResponse = JSON.parse(responseBody).shareHashResponse,
                    update:shareUpdateConfiguration = {
                        agent: agent[0],
                        id: box.getAttribute("id"),
                        shares: browser[agent[2]][agent[0]].shares,
                        type: agent[2]
                    };
                browser.device[shareResponse.device].shares[shareResponse.hash] = {
                    execute: false,
                    name: shareResponse.share,
                    readOnly: true,
                    type: <shareType>shareResponse.type
                };
                network.storage("device");
                network.heartbeat("active", shareResponse.device, browser.device[shareResponse.device].shares);
                share.update(update);
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

/* Terminates one or more users */
share.deleteAgent = function local_shares_deleteAgent(box:Element):void {
    const body:Element = box.getElementsByClassName("body")[0],
        list:HTMLCollectionOf<Element> = body.getElementsByTagName("li"),
        deleted:[string, string][] = [],
        modals:string[] = Object.keys(browser.data.modals);
    let a:number = list.length,
        userColors:HTMLCollectionOf<Element>,
        colorLength:number,
        modalsLength:number = modals.length,
        user:boolean = false,
        device:boolean = false,
        input:HTMLInputElement,
        type:string,
        modal:Element,
        li:HTMLCollectionOf<HTMLElement>,
        liLength:number,
        subtitle:Element,
        b:number = 3,
        c:number,
        hash:string,
        length:number,
        close:HTMLButtonElement,
        parent:Element;
    do {
        a = a - 1;
        input = list[a].getElementsByTagName("input")[0];
        if (input.checked === true) {
            hash = input.value;
            type = input.getAttribute("data-type");
            parent = <Element>document.getElementById(hash).parentNode;
            deleted.push([type, hash]);
            if (list[a].parentNode.childNodes.length < 2) {
                subtitle = document.createElement("p");
                subtitle.innerHTML = `No ${type}s to delete.`;
                subtitle.setAttribute("class", "summary");
                list[a].parentNode.parentNode.insertBefore(subtitle, list[a].parentNode);
                list[a].parentNode.parentNode.removeChild(list[a].parentNode);
            } else {
                list[a].parentNode.removeChild(list[a]);
            }
            if (type === "user") {
                user = true;
            } else if (type === "device") {
                device = true;
            }
            parent.parentNode.removeChild(parent);
            delete browser[type][hash];
        }
    } while (a > 0);
    if (deleted.length < 1) {
        return;
    }
    a = 0;
    length = deleted.length;
    do {
        b = 0;
        // loop through the current modals
        do {
            if (browser.data.modals[modals[b]].type === "shares" && (browser.data.modals[modals[b]].title === "⌘ All Shares" || browser.data.modals[modals[b]].agentType === deleted[a][0])) {
                // for all open "share" type modals remove any mention of the deleted agents
                modal = document.getElementById(modals[b]);
                li = modal.getElementsByClassName("body")[0].getElementsByTagName("li");
                liLength = li.length;
                if (liLength > 0) {
                    c = 0;
                    do {
                        subtitle = <Element>li[c].parentNode.previousSibling;
                        if (li[c].getAttribute("data-hash") === deleted[a][1] && subtitle.getElementsByTagName("strong")[0].innerHTML === `${deleted[a][0]}s`) {
                            if (li[c].parentNode.childNodes.length < 2) {
                                li[c].parentNode.parentNode.removeChild(li[c].parentNode);
                                subtitle.innerHTML = `There are no <strong>${deleted[a][0]}</strong> connections at this time.`;
                            } else {
                                li[c].parentNode.removeChild(li[c]);
                            }
                            break;
                        }
                        c = c + 1;
                    } while (c < liLength);
                }
            } else if (browser.data.modals[modals[b]].agent === deleted[a][1] && browser.data.modals[modals[b]].agentType === deleted[a][0]) {
                // close all open modals related to the deleted agents
                close = <HTMLButtonElement>document.getElementById(modals[c]).getElementsByClassName("close")[0];
                close.click();
                modals.splice(modals.indexOf(modals[b], 1));
                modalsLength = modalsLength - 1;
            }
            b = b + 1;
        } while (b < modalsLength);

        b = 0;
        userColors = document.getElementById("settings-modal").getElementsByClassName(`${deleted[a][0]}-color-list`)[0].getElementsByTagName("li");
        colorLength = userColors.length;
        // loop through the color swatches in the settings modal
        do {
            subtitle = <Element>userColors[b].parentNode;
            //console.log(userColors[b].getAttribute("data-agent") === deleted[a][1]+" "+subtitle.getAttribute("class"));
            if (userColors[b].getAttribute("data-agent") === deleted[a][1] && subtitle.getAttribute("class") === `${deleted[a][0]}-color-list`) {
                userColors[b].parentNode.removeChild(userColors[b]);
                break;
            }
            b = b + 1;
        } while (b < colorLength);
        a = a + 1;
    } while (a > length);
    if (user === true) {
        network.storage("user");
    }
    if (device === true) {
        network.storage("device");
    }
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
    network.storage("device");
    network.heartbeat("active", agent[0], browser.device[agent[0]].shares);
};

/* Creates a confirmation modal listing users for deletion */
share.deleteList = function local_share_deleteList(event:MouseEvent, configuration?:ui_modal):void {
    const content:Element = document.createElement("div"),
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
    if (configuration === undefined) {
        if (total > 1) {
            payloadModal.inputs = ["confirm", "cancel", "close"];
        }
        modal.create(payloadModal);
        network.storage("settings");
    } else {
        configuration.agent = browser.data.hashDevice;
        configuration.content = content;
        if (total > 1) {
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
        title:string = (agent === "")
            ? (agentType === "")
                ? "⌘ All Shares"
                : (agentType === "device")
                    ? "🖳 All Device Shares"
                    : "👤 All User Shares"
            : (agentType === "device")
                ? `🖳 Shares for device - ${agent}`
                : `👤 Shares for user - ${agent}`;
    if (configuration === undefined || configuration === null) {
        configuration = {
            agent: agent,
            agentType: (agentType === "")
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
    network.heartbeat("active", agency[0], browser.device[agency[0]].shares);
};

/* Updates the contents of share modals */
share.update = function local_share_update(configuration:shareUpdateConfiguration):void {
    let a:number = 0,
        b:number = 0,
        shareBest:number = -1,
        shareTop:number = -1,
        title:Element,
        box:Element,
        body:Element,
        titleText:string,
        parentDirectory:HTMLElement,
        back:HTMLElement,
        header:HTMLElement,
        headings:HTMLCollectionOf<Element>,
        close:HTMLButtonElement,
        address:string,
        fileShares:boolean = false;
    const modals:string[] = Object.keys(browser.data.modals),
        modalLength:number = modals.length,
        shareKeys:string[] = (configuration.shares === "deleted")
            ? []
            : Object.keys(configuration.shares),
        shareLength:number = (configuration.shares === "deleted")
            ? 0
            : shareKeys.length,
        windows:boolean = (function local_share_update_windows():boolean {
            if (configuration.shares === "deleted" || shareLength < 1) {
                return false;
            }
            do {
                if (configuration.shares[shareKeys[b]].type === "directory" || configuration.shares[shareKeys[b]].type === "file" || configuration.shares[shareKeys[b]].type === "link") {
                    fileShares = true;
                    if (configuration.shares[shareKeys[0]].name.charAt(0) === "\\" || (/^\w:\\/).test(configuration.shares[shareKeys[0]].name) === true) {
                        return true;
                    }
                    return false;
                }
                b = b + 1;
            } while (b < shareLength);
            return false;
        }());
    if (configuration.shares !== "deleted") {
        browser[configuration.type][configuration.agent].shares = configuration.shares;
    }

    // loop through modals
    do {
        box = document.getElementById(modals[a]);
        // share modals
        if (browser.data.modals[modals[a]].type === "shares" && (browser.data.modals[modals[a]].agent === "" || browser.data.modals[modals[a]].agent === configuration.agent)) {
            if (configuration.shares === "deleted") {
                if (browser.data.modals[modals[a]].agent === configuration.agent) {
                    close = <HTMLButtonElement>box.getElementsByClassName("close")[0];
                    close.click();
                } else {
                    body = <HTMLElement>box.getElementsByClassName("body")[0];
                    headings = body.getElementsByTagName("h3");
                    b = headings.length;
                    do {
                        b = b - 1;
                        if (headings[b].innerHTML === configuration.agent) {
                            headings[b].parentNode.parentNode.removeChild(headings[b].parentNode);
                            break;
                        }
                    } while (b > 0);
                }
            } else {
                body = box.getElementsByClassName("body")[0];
                body.innerHTML = "";
                body.appendChild(share.content(browser.data.modals[modals[a]].agent, browser.data.modals[modals[a]].agentType));
            }
        // file navigate modals
        } else if (fileShares === true && browser.data.modals[modals[a]].type === "fileNavigate" && browser.data.modals[modals[a]].agent === configuration.agent) {
            if (configuration.shares === "deleted") {
                close = <HTMLButtonElement>box.getElementsByClassName("close")[0];
                close.click();
            } else if (shareLength > 0) {
                b = 0;
                shareBest = -1;
                shareTop = -1;
                title = box.getElementsByClassName("heading")[0].getElementsByTagName("button")[0];
                titleText = title.innerHTML;
                parentDirectory = <HTMLElement>box.getElementsByClassName("parentDirectory")[0];
                back = <HTMLElement>box.getElementsByClassName("backDirectory")[0];
                header = <HTMLElement>parentDirectory.parentNode;
                address = browser.data.modals[modals[a]].text_value;
                do {
                    if (address.indexOf(configuration.shares[shareKeys[b]].name) === 0 || (windows === true && address.toLowerCase().indexOf(configuration.shares[shareKeys[b]].name.toLowerCase()) === 0)) {
                        if (shareBest < 0) {
                            shareBest = b;
                            shareTop = b;
                        }
                        if (configuration.shares[shareKeys[b]].name.length > configuration.shares[shareBest].name.length) {
                            shareBest = b;
                        } else if (configuration.shares[shareKeys[b]].name.length < configuration.shares[shareTop].name.length) {
                            shareTop = b;
                        }
                    }
                    b = b + 1;
                } while (b < shareLength);
                if (shareBest > -1) {
                    if (browser.data.modals[box.getAttribute("id")].agent !== browser.data.hashDevice) {
                        if (configuration.shares[shareBest].readOnly === true) {
                            titleText = titleText.replace(/\s+(\(Read\s+Only\)\s+)?-\s+/, " (Read Only) - ");
                            title.innerHTML = titleText;
                            browser.data.modals[modals[a]].title = titleText;
                            browser.data.modals[modals[a]].read_only = true;
                        } else {
                            titleText = titleText.replace(" (Read Only)", "");
                            title.innerHTML = titleText;
                            browser.data.modals[modals[a]].title = titleText;
                            browser.data.modals[modals[a]].read_only = false;
                        }
                        if (address === configuration.shares[shareTop].name || (windows === true && address.toLowerCase() === configuration.shares[shareTop].name.toLowerCase())) {
                            parentDirectory.style.display = "none";
                            back.style.marginLeft = "-6em";
                            header.style.paddingLeft = "10.5em";
                        } else {
                            parentDirectory.style.display = "inline-block";
                            back.style.marginLeft = "-9em";
                            header.style.paddingLeft = "15em";
                        }
                    }
                }
            }
        }
        a = a + 1;
    } while (a < modalLength);
};

export default share;