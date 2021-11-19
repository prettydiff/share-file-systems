
/* lib/browser/share - The utilities that manage and coordinate changes to user share data. */

import common from "../common/common.js";

import browser from "./browser.js";
import configuration from "./configuration.js";
import context from "./context.js";
import fileBrowser from "./fileBrowser.js";
import message from "./message.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

/**
 * Populates the various agent modals, device details, and share data lists.
 * * **addAgent** - Converts agent data into interactive components in the browser.
 * * **content** - Generates the content of the share modal.
 * * **context** - Handler for the File Navigate context menu item *Add a Share*. 
 * * **deleteAgent** - Automatically removes an agent from the browser interface due to instructions from the terminal.
 * * **deleteAgentList** - Process termination of one or more agents from a *share_delete* modal.
 * * **deleteItem** - Delete a share from a device.
 * * **deleteList** - Creates a confirmation modal listing users for deletion.
 * * **deleteListContent** - Creates the HTML content of the share_delete type modal.
 * * **deleteToggle** -  Changes visual state of items in the shares delete list as they are checked or unchecked.
 * * **modal** - Creates a share modal displaying device details, shares, and available features.
 * * **readOnly** - Toggle a share between read only and full access.
 * * **update** - Updates the content of device shares in response to messaging from the network and local user interaction.
 *
 * ```typescript
 * interface module_share {
 *     addAgent: (input:addAgent) => void;
 *     content: (agent:string, agentType:agentType|"") => Element;
 *     context: (event:Event) => void;
 *     deleteAgent: (agent:string, agentType:agentType) => void;
 *     deleteAgentList: (box:Element) => void;
 *     deleteItem: (event:MouseEvent) => void;
 *     deleteList: (event:MouseEvent, configuration?:modal) => void;
 *     deleteListContent: () => Element;
 *     deleteToggle: (event:MouseEvent) => void;
 *     modal: (agent:string, agentType:agentType|"", configuration:modal) => void;
 *     readOnly: (event:MouseEvent) => void;
 *     update: (exclusion:string) => void;
 * }
 * ``` */
const share:module_share = {

    /* Adds users to the user bar */
    addAgent: function browser_share_addAgent(input:addAgent):void {
        const li:HTMLLIElement = document.createElement("li"),
            button:HTMLElement = document.createElement("button"),
            addStyle = function browser_share_addUser_addStyle():void {
                let body:string,
                    heading:string;
                if (browser.data.colors[input.type][input.hash] === undefined) {
                    body = configuration.colorDefaults[browser.data.color][0];
                    heading = configuration.colorDefaults[browser.data.color][1];
                    browser.data.colors[input.type][input.hash] = [body, heading];
                    network.configuration();
                } else {
                    body = browser.data.colors[input.type][input.hash][0];
                    heading = browser.data.colors[input.type][input.hash][1];
                }
                configuration.styleText({
                    agent: input.hash,
                    colors: [body, heading],
                    replace: false,
                    type: input.type
                });
            },
            sharesModal = function browser_share_addUser_sharesModal(event:MouseEvent):void {
                let element:Element = event.target as Element,
                    agent:string = element.getAttribute("id"),
                    agentType:agentType = element.getAttribute("data-agent-type") as agentType;
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
        if (browser.loading === false) {
            configuration.addUserColor(input.hash, input.type, document.getElementById("configuration-modal").getElementsByClassName("configuration")[0] as Element);
            share.update("");
            if (input.save === true) {
                network.send({
                    settings: browser[input.type],
                    type: input.type
                }, "settings", null);
            }
        }
    },

    /* Generate the content of a share modal */
    content: function browser_share_content(agentName:string, agentType:agentType|""):Element {
        let shareListUL:Element = document.createElement("ul"),
            agent:Element,
            user:boolean = false;
        const sections = {
                device: document.createElement("div"),
                user: document.createElement("div")
            },
            all:Element = document.createElement("div"),
            // open a file navigate modal to a location
            fileNavigate = function browser_share_content_fileNavigate(event:MouseEvent):void {
                const element:Element = (function browser_share_content_fileNavigate_getElement():Element {
                        const item:Element = event.target as Element;
                        if (util.name(item) === "button") {
                            return item;
                        }
                        return item.getAncestor("button", "tag");
                    }()),
                    agency:agency = util.getAgent(element),
                    agentType:agentType = element.getAttribute("class").replace("-share", "") as agentType,
                    parent:Element = element.parentNode as Element,
                    agentNode:Element = parent.getAncestor(agentType, "class"),
                    agent:string = (agency[0] === "" || agency[0] === null)
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
                fileBrowser.navigate(event, {
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
            deviceButton = function browser_share_content_deviceButton(hash:string):HTMLElement {
                const button:HTMLElement = document.createElement("button");
                button.setAttribute("class", "file-system-root");
                button.innerHTML = "File System Root";
                button.onclick = function browser_share_content_perAgent_fsRoot():void {
                    fileBrowser.navigate(null, {
                        agentName: hash,
                        agentType: "device",
                        path: "**root**",
                        readOnly: false,
                        share: ""
                    });
                };
                return button;
            },
            // hardware and OS details about a device
            agentDetails = function browser_share_content_agentDetails(type:agentType, agent:string):Element {
                const agentDetails:Element = document.createElement("ul"),
                    ip:string = (type === "device" && agent === browser.data.hashDevice)
                        ? "(local device)"
                        : browser[type][agent].ipSelected;
                let agentItem:Element = document.createElement("li");
                agentItem.innerHTML = `${common.capitalize(type)} ID: ${agent}`;
                agentItem.setAttribute("class", "share-agent-details");
                agentDetails.appendChild(agentItem);
                agentItem = document.createElement("li");
                agentItem.innerHTML = `IP Address: ${ip}`;
                agentItem.setAttribute("class", "share-agent-details");
                agentDetails.appendChild(agentItem);
                agentItem = document.createElement("li");
                agentItem.innerHTML = `Port: HTTP ${browser[type][agent].ports.http}, WS ${browser[type][agent].ports.ws}`;
                agentItem.setAttribute("class", "share-agent-details");
                agentDetails.appendChild(agentItem);

                if (type === "device") {
                    agentItem = document.createElement("li");
                    agentItem.innerHTML = `CPU Cores: ${browser[type][agent].deviceData.cpuCores}`;
                    agentItem.setAttribute("class", "share-agent-details");
                    agentDetails.appendChild(agentItem);
                    agentItem = document.createElement("li");
                    agentItem.innerHTML = `CPU Label: ${browser[type][agent].deviceData.cpuID}`;
                    agentItem.setAttribute("class", "share-agent-details");
                    agentDetails.appendChild(agentItem);
                    agentItem = document.createElement("li");
                    agentItem.innerHTML = `Total Memory: ${common.prettyBytes(browser[type][agent].deviceData.memTotal)}`;
                    agentItem.setAttribute("class", "share-agent-details");
                    agentDetails.appendChild(agentItem);
                    agentItem = document.createElement("li");
                    agentItem.innerHTML = `OS Version: ${browser[type][agent].deviceData.osVersion}`;
                    agentItem.setAttribute("class", "share-agent-details");
                    agentDetails.appendChild(agentItem);
                    agentItem = document.createElement("li");
                    agentItem.innerHTML = `OS Type: ${browser[type][agent].deviceData.osType}`;
                    agentItem.setAttribute("class", "share-agent-details");
                    agentDetails.appendChild(agentItem);
                    agentItem = document.createElement("li");
                    agentItem.innerHTML = `Platform: ${browser[type][agent].deviceData.platform}`;
                    agentItem.setAttribute("class", "share-agent-details");
                    agentDetails.appendChild(agentItem);
                }
                return agentDetails;
            },
            perAgent = function browser_share_content_perAgent(agentNames:agentNames):void {
                if ((agentName === "" || agentName === agentNames.agent) && (agentType === "" || agentType === agentNames.agentType)) {
                    const title:Element = document.createElement("h4"),
                        toolList:Element = document.createElement("ul"),
                        messageButton:HTMLElement = document.createElement("button"),
                        //videoButton:HTMLElement = document.createElement("button"),
                        subTitle = function browser_share_content_perAgent_subTitle(text:string):void {
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
                        li.appendChild(deviceButton(agentNames.agent));
                        toolList.appendChild(li);
                    }
                    if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== browser.data.hashDevice)) {
                        // text button
                        li = document.createElement("li");
                        messageButton.innerHTML = `<span>Text</span> ${browser[agentNames.agentType][agentNames.agent].name}`;
                        messageButton.setAttribute("class", "text-button-agent");
                        messageButton.onclick = message.shareButton;
                        li.appendChild(messageButton);
                        toolList.appendChild(li);

                        // video button
                        /*li = document.createElement("li");
                        videoButton.innerHTML = `<span>Video Call</span> ${browser[agentNames.agentType][agentNames.agent].name}`;
                        videoButton.setAttribute("class", "video-button-agent");
                        videoButton.onclick = media.videoButton;
                        li.appendChild(videoButton);
                        toolList.appendChild(li);*/
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
            perAgentType = function browser_share_content_perAgentType(agentNames:agentNames):void {
                const type:agentType = agentNames.agentType;
                if (agentName === "" && (agentType === "" || agentType === type)) {
                    const title:Element = document.createElement("h3"),
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
                    title.innerHTML = `There ${verb} ${listLength} <strong>${type + plural}</strong> ${adjective}.`;
                    title.setAttribute("class", "agent-list-heading");
                    messageButton.innerHTML = `Text all ${type}s`;
                    messageButton.setAttribute("class", `text-button-${type}`);
                    messageButton.onclick = message.shareButton;
                    title.appendChild(messageButton);
                    sections[agentNames.agentType].appendChild(title);
                }
                sections[agentNames.agentType].setAttribute("class", "agentList");
                all.appendChild(sections[agentNames.agentType]);
                if (agentNames.agentType === "user") {
                    user = true;
                }
            },
            perShare = function browser_share_content_perShare(agentNames:agentNames):void {
                const li:Element = document.createElement("li"),
                    button:HTMLElement = document.createElement("button"),
                    status:Element = document.createElement("strong"),
                    shareItem:agentShare = browser[agentNames.agentType][agentNames.agent].shares[agentNames.share],
                    shareType:string = shareItem.type;
                button.setAttribute("class", `${agentNames.agentType}-share`);
                button.innerHTML = shareItem.name;
                status.setAttribute("class", "read-only-status");
                status.innerHTML = (shareItem.readOnly === true)
                    ? "(Read Only)"
                    : "(Full Access)";
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
                        li.setAttribute("class", "share full-access");
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

    /* Share utility for the "adding a share" context menu list */
    context: function browser_share_context():void {
        const element:Element = context.element,
            addresses:[string, shareType, string][] = util.selectedAddresses(element, "share"),
            deviceData:agentShares = browser.device[addresses[0][2]].shares,
            shares:string[] = Object.keys(deviceData),
            shareLength:number = shares.length,
            addressesLength:number = addresses.length,
            shareCallback = function browser_share_context_shareHash(responseText:string):void {
                const shareResponse:service_hashShare = JSON.parse(responseText).data;
                browser.device[shareResponse.device].shares[shareResponse.hash] = {
                    execute: false,
                    name: shareResponse.share,
                    readOnly: true,
                    type: shareResponse.type as shareType
                };
                // update any share modals
                share.update("");
                // inform other agents of the share
                network.heartbeat("active", true);
            },
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
                    }, "hash-share", shareCallback);
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
                }, "hash-share", shareCallback);
                a = a + 1;
            } while (a < addressesLength);
        }
        util.selectNone(element);
        if (menu !== null) {
            menu.parentNode.removeChild(menu);
        }
    },

    /* Terminate an agent from either a websocket request or from share.deleteAgentList */
    deleteAgent: function browser_share_deleteAgent(agent:string, agentType:agentType):void {
        const userColors:HTMLCollectionOf<Element> = document.getElementById("configuration-modal").getElementsByClassName(`${agentType}-color-list`)[0].getElementsByTagName("li"),
            colorLength:number = userColors.length,
            button:Element = document.getElementById(agent),
            parent:Element = (button === null)
                ? null
                : button.parentNode as Element;
        let a:number = 0;

        // loop through the color swatches in the settings modal to remove the agent's colors
        do {
            if (userColors[a].getAttribute("data-agent") === agent) {
                userColors[a].parentNode.removeChild(userColors[a]);
                configuration.styleText({
                    agent: agent,
                    colors: ["", ""],
                    replace: true,
                    type: agentType
                });
                break;
            }
            a = a + 1;
        } while (a < colorLength);

        // remove the agent from the data structures
        delete browser[agentType][agent];
        delete browser.data.colors[agentType][agent];

        // remove the named button for the agent
        if (parent !== null && button.getAttribute("data-agent-type") === agentType) {
            parent.parentNode.removeChild(parent);
        }
    },

    /* Processes agent termination from a share_delete modal */
    deleteAgentList: function browser_shares_deleteAgentList(box:Element):void {
        const body:Element = box.getElementsByClassName("body")[0],
            list:HTMLCollectionOf<Element> = body.getElementsByTagName("li"),
            heartbeat:service_heartbeat = {
                action: "delete-agents",
                agentFrom: browser.data.hashDevice,
                agentTo: browser.data.hashDevice,
                agentType: "device",
                shares: null,
                shareType: "device",
                status: {
                    device: [],
                    user: []
                }
            },
            agentList:service_agentDeletion = heartbeat.status as service_agentDeletion;
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
                type = input.getAttribute("data-type") as agentType;
                parent = document.getElementById(hash).parentNode as Element;
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
                agentList[type].push(hash);
            }
        } while (a > 0);
        if (count < 1) {
            return;
        }
        network.send(heartbeat, "heartbeat", null);
        share.update("");
        network.configuration();
    },

    /* Delete a share from a device */
    deleteItem: function browser_share_deleteItem(event:MouseEvent):void {
        const element:Element = event.target as Element,
            parent:Element = element.parentNode as Element,
            box:Element = parent.getAncestor("box", "class"),
            agent:string = (function browser_share_deleteItem_agency():string {
                const boxAgent:agency = util.getAgent(box);
                if (boxAgent[0] === null || boxAgent[0] === "") {
                    return element.getAncestor("ul", "tag").getAncestor("li", "tag").getAttribute("data-hash");
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
                granny:Element = parent.parentNode as Element;
            p.innerHTML = `Device <em>${browser.device[agent].name}</em> has no shares.`;
            granny.parentNode.appendChild(p);
            granny.parentNode.removeChild(granny);
        } else {
            parent.parentNode.removeChild(parent);
        }
        share.update(box.getAttribute("id"));
        network.heartbeat("active", true);
    },

    /* Creates a confirmation modal listing users for deletion */
    deleteList: function browser_share_deleteList(event:MouseEvent, configuration?:modal):void {
        const content:Element = share.deleteListContent(),
            total:number = content.getElementsByTagName("li").length,
            payloadModal:modal = {
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
            network.configuration();
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
    },

    /* Creates the HTML content of the share_delete type modal. */
    deleteListContent: function browser_shares_deleteListContent():Element {
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
            perAgent: function browser_share_deleteList_perAgent(agentNames:agentNames):void {
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
            perAgentType: function browser_share_deleteList_perAgentType(agentNames:agentNames):void {
                h3 = document.createElement("h3");
                h3.innerHTML = `${common.capitalize(agentNames.agentType)}s`;
                names = Object.keys(browser[agentNames.agentType]);
                length = names.length;
                content.appendChild(h3);
                total = total + length;
                if ((agentNames.agentType === "device" && length < 2) || (agentNames.agentType !== "device" && length < 1)) {
                    p = document.createElement("p");
                    p.setAttribute("class", "summary");
                    p.innerHTML = `No ${agentNames.agentType}s to delete.`;
                    content.appendChild(p);
                } else {
                    ul = document.createElement("ul");
                    content.appendChild(ul);
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
    },

    /* Changes visual state of items in the shares delete list as they are checked or unchecked. */
    deleteToggle: function browser_shares_deleteToggle(event:MouseEvent):void {
        const element:HTMLInputElement = event.target as HTMLInputElement,
            label:Element = element.parentNode as Element;
        if (element.checked === true) {
            label.setAttribute("class", "checked");
        } else {
            label.removeAttribute("class");
        }
    },

    /* Displays a list of shared items for each user */
    modal: function browser_shares_modal(agent:string, agentType:agentType|"", configuration:modal|null):void {
        if (configuration === null) {
            const icon:string = (agentType === "device")
                    ? "🖳"
                    : "👤",
                title:string = (agent === "")
                    ? (agentType === "")
                        ? "⌘ All Shares"
                        : `${icon} All ${common.capitalize(agentType)} Shares`
                    : `${icon} Shares for ${agentType} - ${browser[agentType as agentType][agent].name}`;
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
    },

    /* Toggle a share between read only and full access. */
    readOnly: function browser_share_readOnly(event:MouseEvent):void {
        const element:Element = event.target as Element,
            box:Element = element.getAncestor("box", "class"),
            boxHash:string = box.getAttribute("data-agent"),
            parent:Element = element.parentNode as Element,
            hashDevice:string = (boxHash === "")
                ? element.getAncestor("device", "class").getAttribute("data-hash")
                : boxHash,
            hashShare:string = parent.getAttribute("data-hash");
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
        network.heartbeat("active", true);
        share.update("");
    },

    /* Updates the contents of share modals */
    update: function browser_share_update(exclusion:string):void {
        const modals:string[] = Object.keys(browser.data.modals),
            modalLength = modals.length,
            closer = function browser_share_update_closer(modal:Element):void {
                modal.parentNode.removeChild(modal);
                delete browser.data.modals[modal.getAttribute("id")];
            };
        let a:number = 0,
            modal:Element,
            body:Element,
            agent:string,
            item:modal,
            agentType:agentType | "";
        do {
            if (exclusion !== modals[a]) {
                item = browser.data.modals[modals[a]];
                if (browser[item.agentType][item.agent] === undefined && item.type !== "shares" && item.type !== "configuration" && item.type !== "share_delete") {
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
    }

};

export default share;