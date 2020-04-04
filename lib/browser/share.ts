
/* lib/browser/share - The utilities that manage and coordinate changes to user share data. */
import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import modal from "./modal.js";
import network from "./network.js";
import settings from "./settings.js";
import util from "./util.js";

const share:module_share = {};

/* Adds users to the user bar */
share.addUser = function local_share_addUser(agentName:string, id:string, type:agentType):void {
    const li:HTMLLIElement = document.createElement("li"),
        button:HTMLElement = document.createElement("button"),
        addStyle = function local_share_addUser_addStyle() {
            let body:string,
                heading:string;
            const prefix:string = `#spaces .box[data-agent="${id}"] `;
            if (browser.data.colors[type][id] === undefined) {
                body = settings.colorDefaults[browser.data.color][0];
                heading = settings.colorDefaults[browser.data.color][0];
                browser.data.colors[type][id] = [body, heading];
            } else {
                body = browser.data.colors[type][id][0];
                heading = browser.data.colors[type][id][0];
            }
            browser.style.innerHTML = browser.style.innerHTML + [
                `#spaces #users button[data-agent="${id}"],${prefix}.status-bar,${prefix}.footer,${prefix} h2.heading{background-color:#${heading}}`,
                `${id}.body,#spaces #users button[data-agent="${id}"]:hover{background-color:#${body}}`
            ].join("");
        },
        sharesModal = function local_share_addUser_sharesModal(event:MouseEvent) {
            let element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                agent:string = element.getAttribute("id"),
                agentType:agentType = <agentType>element.getAttribute("data-agent-type"),
                name:string;
            element = util.getAncestor(element, "button", "tag");
            name = element.lastChild.textContent.replace(/^\s+/, "");
            share.modal(agent, agentType, null);
        },
        modals:string[] = Object.keys(browser.data.modals),
        length: number = modals.length;
    let a:number = 0,
        shareUser:HTMLElement;
    button.innerHTML = `<em class="status-active">●<span> Active</span></em><em class="status-idle">●<span> Idle</span></em><em class="status-offline">●<span> Offline</span></em> ${agentName}`;
    if (id === browser.data.deviceHash) {
        button.setAttribute("class", "active");
    } else {
        button.setAttribute("class", "offline");
        addStyle();
    }
    button.setAttribute("id", id);
    button.setAttribute("data-agent-type", type);
    button.onclick = sharesModal;
    li.appendChild(button);
    document.getElementById(type).getElementsByTagName("ul")[0].appendChild(li);
    if (browser.loadTest === false) {
        settings.addUserColor(agentName, type, <HTMLElement>document.getElementById("settings-modal").getElementsByClassName("settings")[0]);
        do {
            if (browser.data.modals[modals[a]].type === "shares" && browser.data.modals[modals[a]].agent === "") {
                const agentList:HTMLElement = <HTMLElement>document.getElementById(modals[a]).getElementsByClassName("agentList")[0];
                if (agentList !== undefined) {
                    shareUser = document.createElement("li");
                    shareUser.appendChild(share.content(id, type));
                    agentList.appendChild(shareUser);
                }
            }
            a = a + 1;
        } while (a < length);
        network.storage(type);
    }
};

/* Generate the content of a share modal */
share.content = function local_share_content(agentName:string, agentType:agentType|""):HTMLElement {
    if (agentName === undefined) {
        return document.getElementById("systems-modal");
    }
    const lists:HTMLElement = document.createElement("div"),
        fileNavigate = function local_share_content_fileNavigate(event:MouseEvent):void {
            const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                list:HTMLElement = <HTMLElement>element.parentNode.parentNode.parentNode,
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
                readOnly: (agent !== browser.data.deviceHash && element.getElementsByClassName("read-only-status")[0].innerHTML === "(Read Only)")
            });
        },
        shareButton = function local_share_content_shareButton(shareButton:shareButton):HTMLElement {
            const button:HTMLElement = document.createElement("button"),
                status:HTMLElement = document.createElement("strong"),
                itemType:string = browser[shareButton.type][shareButton.name].shares[shareButton.index].type;
            button.setAttribute("class", shareButton.type);
            button.innerHTML = browser[shareButton.type][shareButton.name].shares[shareButton.index].name;
            status.setAttribute("class", "read-only-status");
            status.innerHTML = (browser[shareButton.type][shareButton.name].shares[shareButton.index].readOnly === true)
                ? "(Read Only)"
                : "(Full Access)"
            button.appendChild(status);
            if (itemType === "directory" || itemType === "file" || itemType === "link") {
                button.onclick = fileNavigate;
            }
            return button;
        },
        shareDevice = function local_share_content_shareDevice(itemName:string, index:number):HTMLElement {
            const item:HTMLElement = document.createElement("li"),
                button:HTMLElement = shareButton({
                    index: index,
                    name: itemName,
                    type: "device"
                }),
                del:HTMLElement = document.createElement("button"),
                readOnly:HTMLElement = document.createElement("button"),
                span:HTMLElement = document.createElement("span");
            if (browser.device[itemName].shares[index].readOnly === true) {
                item.setAttribute("class", "device");
                readOnly.setAttribute("class", "grant-full-access");
                readOnly.innerHTML = ("Grant Full Access");
            } else {
                item.setAttribute("class", "device full-access");
                readOnly.setAttribute("class", "make-read-only");
                readOnly.innerHTML = ("Make Read Only");
            }
            readOnly.onclick = share.readOnly;
            del.setAttribute("class", "delete");
            del.setAttribute("title", "Delete this share");
            del.innerHTML = "\u2718<span>Delete this share</span>";
            del.onclick = share.itemDelete;
            span.setAttribute("class", "clear");
            item.appendChild(del);
            item.appendChild(button);
            item.appendChild(readOnly);
            item.appendChild(button);
            item.appendChild(span);
            return item;
        },
        shareUser = function local_share_content_shareUser(itemName:string, index:number):HTMLElement {
            const item:HTMLElement = document.createElement("li"),
                button:HTMLElement = shareButton({
                    index: index,
                    name: itemName,
                    type: "user"
                });
            if (browser.user[itemName].shares[index].readOnly === true) {
                item.removeAttribute("class");
            } else {
                item.setAttribute("class", "full-access");
            }
            item.appendChild(button);
            return item;
        },
        shareAgent = function local_share_content_shareAgent(agent:string, type:agentType, single:boolean):HTMLElement {
            const container:HTMLElement = (single === true)
                    ? lists
                    : document.createElement("li"),
                agentName:HTMLElement = (single === true)
                    ? document.createElement("h3")
                    : document.createElement("h4"),
                shareList = document.createElement("ul"),
                keys:string[] = Object.keys(browser[type][agent].shares),
                keyLength:number = keys.length;
            let a:number = 0;
            container.setAttribute("class", "agentList");
            agentName.setAttribute("class", "agent");
            agentName.innerHTML = browser[type][agent].name;
            container.appendChild(agentName);
            if (keyLength > 0) {
                do {
                    if (type === "device") {
                        shareList.appendChild(shareDevice(browser.device[agent].shares[keys[a]].name, a));
                    } else if (type === "user") {
                        shareList.appendChild(shareUser(browser.user[agent].shares[keys[a]].name, a));
                    }
                    a = a + 1;
                } while (a < keyLength);
                container.appendChild(shareList);
            } else {
                const p:HTMLElement = document.createElement("p");
                p.innerHTML = `${type.slice(0, 1).toUpperCase() + type.slice(1)} ${browser[type][agent].name} has no shares.`;
                container.appendChild(p);
            }
            return container;
        },
        buildList = function local_share_content_buildList(type:agentType):void {
            const title:HTMLElement = document.createElement("h3"),
                list:string[] = Object.keys(browser[type]),
                listLength:number = list.length;
            if (listLength === 0) {
                title.innerHTML = `There are no <strong>${type.slice(0, type.length - 1)}</strong> connections at this time.`;
                lists.appendChild(title);
            } else {
                const ul:HTMLElement = document.createElement("ul"),
                    plural:string = (listLength === 1)
                        ? ""
                        : "s";
                let a:number = 0;
                title.innerHTML = `There are ${length} <strong>${type + plural}</strong> shared.`;
                lists.appendChild(title);
                do {
                    ul.appendChild(shareAgent(list[a], type, false));
                    a = a + 1;
                } while (a < listLength);
                lists.appendChild(ul);
            }
        };
    if (agentName === "") {
        if (agentType === "") {
            buildList("device");
            buildList("user");
        } else {
            buildList(agentType);
        }
    } else {
        shareAgent(agentName, <agentType>agentType, true);
    }
    return lists;
};

/* Share utility for the context menu list */
share.context = function local_share_context():void {
    const element:HTMLElement = context.element,
        addresses:[string, shareType, string][] = util.selectedAddresses(element, "share"),
        deviceData:deviceShares = browser.device[addresses[0][2]].shares,
        shares:string[] = Object.keys(deviceData),
        shareLength:number = shares.length,
        addressesLength:number = addresses.length,
        box:HTMLElement = util.getAncestor(element, "box", "class"),
        agent:agency = util.getAgent(box);
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
                network.hashShare({
                    callback: function local_share_context_shareHash1(responseBody:string):void {
                        const shareResponse:shareHashResponse = JSON.parse(responseBody).shareHashResponse;
                        browser.device[shareResponse.device].shares[shareResponse.hash] = {
                            execute: false,
                            name: shareResponse.share,
                            readOnly: true,
                            type: <shareType>shareResponse.type
                        };
                    },
                    device: addresses[a][2],
                    share: addresses[a][0],
                    type: addresses[a][1]
                });
            }
            a = a + 1;
        } while (a < addressesLength);
    } else {
        do {
            network.hashShare({
                callback: function local_share_context_shareHash1(responseBody:string):void {
                    const shareResponse:shareHashResponse = JSON.parse(responseBody).shareHashResponse;
                    browser.device[shareResponse.device].shares[shareResponse.hash] = {
                        execute: false,
                        name: shareResponse.share,
                        readOnly: true,
                        type: <shareType>shareResponse.type
                    };
                },
                device: addresses[a][2],
                share: addresses[a][0],
                type: addresses[a][1]
            });
            a = a + 1;
        } while (a < addressesLength);
    }
    util.selectNone(element);
    share.update({
        agent: agent[0],
        id: box.getAttribute("id"),
        shares: browser[agent[2]][agent[0]].shares,
        type: agent[2]
    });
    network.heartbeat("active", true);
};

/* Creates a confirmation modal listing users for deletion */
share.deleteList = function local_share_deleteList(event:MouseEvent, configuration?:ui_modal):void {
    const content:HTMLElement = document.createElement("div"),
        p:HTMLElement = document.createElement("p"),
        ul:HTMLElement = document.createElement("ul"),
        users:devices = browser.user,
        names:string[] = Object.keys(users),
        length:number = names.length;
    let li:HTMLElement,
        a:number = 0,
        input:HTMLInputElement,
        label:HTMLElement,
        text:Text;
    p.setAttribute("class", "summary");
    if (length > 0) {
        p.innerHTML = "<strong>Please be warned that confirming this change is permanent.</strong> The user will be deleted from your devices and you from theirs.";
        ul.setAttribute("class", "sharesDeleteList");
        do {
            if (names[a] !== browser.data.deviceHash) {
                li = document.createElement("li");
                label = document.createElement("label");
                input = document.createElement("input");
                text = document.createTextNode(names[a]);
                input.type = "checkbox";
                input.onclick = share.deleteToggle;
                label.appendChild(input);
                label.appendChild(text);
                li.appendChild(label);
                ul.appendChild(li);
            }
            a = a + 1;
        } while (a < length);
        content.appendChild(p);
        content.appendChild(ul);
    } else {
        p.innerHTML = "No users to delete."
        content.appendChild(p);
    }
    if (configuration === undefined) {
        modal.create({
            agent: browser.data.deviceHash,
            agentType: "device",
            content: content,
            inputs: (length > 1)
                ? ["confirm", "cancel", "close"]
                : ["close"],
            read_only: false,
            single: true,
            title: "<span class=\"icon-delete\">☣</span> Delete Shares",
            type: "share_delete",
            width: 750
        });
        network.storage("settings");
    } else {
        configuration.agent = browser.data.deviceHash;
        configuration.content = content;
        if (length > 1) {
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
        label:HTMLElement = <HTMLElement>element.parentNode;
    if (element.checked === true) {
        label.setAttribute("class", "checked");
    } else {
        label.removeAttribute("class");
    }
};

/* Terminates one or more users */
share.deleteUser = function local_shares_deleteUser(box:HTMLElement):void {
    const body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
        agentType:agentType = <agentType>box.getAttribute("data-agentType"),
        list:HTMLCollectionOf<HTMLElement> = body.getElementsByTagName("li"),
        agents:HTMLCollectionOf<HTMLElement> = document.getElementById(agentType).getElementsByTagName("li"),
        names:string[] = [],
        modals:string[] = Object.keys(browser.data.modals),
        modalsLength:number = modals.length,
        userColors:HTMLCollectionOf<HTMLElement> = document.getElementById("settings-modal").getElementsByClassName("user-color-list")[0].getElementsByTagName("li");
    let a:number = list.length,
        agentsLength:number = agents.length,
        b:number = 3,
        c:number,
        text:string,
        length:number,
        h3:HTMLCollectionOf<HTMLElement>,
        close:HTMLButtonElement,
        colorLength:number = userColors.length;
    do {
        a = a - 1;
        if (list[a].getElementsByTagName("input")[0].checked === true) {
            text = list[a].lastChild.textContent;
            names.push(text);
            list[a].parentNode.removeChild(list[a]);
            delete browser.user[text];
        }
    } while (a > 0);
    if (names.length < 1) {
        return;
    }
    a = 0;
    length = names.length;
    do {
        b = agentsLength;
        // loop through user buttons to remove the user
        do {
            b = b - 1;
            if (agents[b].getElementsByTagName("button")[0].getAttribute("data-agent") === names[a]) {
                agents[b].parentNode.removeChild(agents[b]);
                break;
            }
        } while (b > 3);
        agentsLength = agentsLength - 1;

        // loop through shares modals to remove the deleted user
        c = 0;
        do {
            if (browser.data.modals[modals[c]].type === "shares") {
                // on the all shares modal simply remove the concerned user
                if (browser.data.modals[modals[c]].agent === "") {
                    h3 = document.getElementById(modals[c]).getElementsByTagName("h3");
                    b = h3.length;
                    do {
                        b = b - 1;
                        if (h3[b].innerHTML.indexOf(names[a]) === 0) {
                            h3[b].parentNode.parentNode.removeChild(h3[b].parentNode);
                        }
                    } while (b > 0);
                // simply close the deleted user's share modals
                } else if (browser.data.modals[modals[c]].agent === names[a]) {
                    close = <HTMLButtonElement>document.getElementById(modals[c]).getElementsByClassName("close")[0];
                    close.click();
                }
            }
            c = c + 1;
        } while (c < modalsLength);
        
        // loop through user colors
        c = 0;
        do {
            if (userColors[c].getElementsByTagName("p")[0].innerHTML === names[a]) {
                userColors[c].parentNode.removeChild(userColors[c]);
            }
            c = c + 1;
        } while (c < colorLength);
        colorLength = colorLength - 1;
        a = a + 1;
    } while (a < length);
    network.storage("user");
};

/* Delete a share from a device */
share.itemDelete = function local_share_itemDelete(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        agent:agency = util.getAgent(element),
        parent:HTMLElement = <HTMLElement>element.parentNode,
        address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
        shares:deviceShares = browser[agent[2]][agent[0]].shares,
        keys:string[] = Object.keys(shares),
        length:number = keys.length;
    let a:number = 0;
    parent.parentNode.removeChild(parent);
    do {
        if (shares[keys[a]].name === address) {
            delete shares[keys[a]];
            break;
        }
        a = a + 1;
    } while (a < length);
    network.heartbeat("active", true);
};

/* Displays a list of shared items for each user */
share.modal = function local_shares_modal(agent:string, agentType:agentType|"", configuration:ui_modal|null):void {
    const content:HTMLElement = share.content(agent, agentType),
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
            agentType: "device",
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
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        parent:HTMLElement = <HTMLElement>element.parentNode,
        address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
        agency:agency = util.getAgent(element),
        shares:deviceShares = browser[agency[2]][agency[0]].shares,
        keys:string[] = Object.keys(shares),
        length:number = keys.length,
        span:HTMLElement = <HTMLElement>parent.getElementsByClassName("read-only-status")[0];
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
    network.heartbeat("active", true);
};

/* Updates the contents of share modals */
share.update = function local_share_update(configuration:shareUpdateConfiguration):void {
    let a:number = 0,
        b:number = 0,
        shareBest:number = -1,
        shareTop:number = -1,
        title:HTMLElement,
        box:HTMLElement,
        body:HTMLElement,
        titleText:string,
        parentDirectory:HTMLElement,
        back:HTMLElement,
        header:HTMLElement,
        headings:HTMLCollectionOf<HTMLElement>,
        close:HTMLButtonElement,
        address:string,
        fileShares:boolean = false;
    const modals:string[] = (configuration.id === undefined)
            ? Object.keys(browser.data.modals)
            : [configuration.id],
        modalLength:number = modals.length,
        shareLength:number = (configuration.shares === "deleted")
            ? 0
            : Object.keys(configuration.shares).length,
        windows:boolean = (function local_util_shareUpdate_windows():boolean {
            if (configuration.shares === "deleted" || shareLength < 1) {
                return false;
            }
            do {
                if (configuration.shares[b].type === "directory" || configuration.shares[b].type === "file" || configuration.shares[b].type === "link") {
                    fileShares = true;
                    if (configuration.shares[0].name.charAt(0) === "\\" || (/^\w:\\/).test(configuration.shares[0].name) === true) {
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
                body = <HTMLElement>box.getElementsByClassName("body")[0];
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
                title = <HTMLElement>box.getElementsByClassName("heading")[0].getElementsByTagName("button")[0];
                titleText = title.innerHTML;
                parentDirectory = <HTMLElement>box.getElementsByClassName("parentDirectory")[0];
                back = <HTMLElement>box.getElementsByClassName("backDirectory")[0];
                header = <HTMLElement>parentDirectory.parentNode;
                address = browser.data.modals[modals[a]].text_value;
                do {
                    if (address.indexOf(configuration.shares[b].name) === 0 || (windows === true && address.toLowerCase().indexOf(configuration.shares[b].name.toLowerCase()) === 0)) {
                        if (shareBest < 0) {
                            shareBest = b;
                            shareTop = b;
                        }
                        if (configuration.shares[b].name.length > configuration.shares[shareBest].name.length) {
                            shareBest = b;
                        } else if (configuration.shares[b].name.length < configuration.shares[shareTop].name.length) {
                            shareTop = b;
                        }
                    }
                    b = b + 1;
                } while (b < shareLength);
                if (shareBest > -1) {
                    if (browser.data.modals[box.getAttribute("id")].agent !== browser.data.deviceHash) {
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