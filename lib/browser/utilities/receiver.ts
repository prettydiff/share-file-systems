
/* lib/browser/utilities/receiver - Routes network messages to the respective browser library. */

import agent_add from "./agent_add.js";
import agent_delete from "./agent_delete.js";
import browser from "./browser.js";
import agent_management from "../content/agent_management.js";
import common from "../../common/common.js";
import configuration from "../content/configuration.js";
import file_status from "./file_status.js";
import message_post from "./message_post.js";
import remote from "./remote.js";
import share_content from "./share_content.js";
import share_update from "./share_update.js";
import terminal from "../content/terminal.js";

// cspell: words agenttype

const receiver = function browser_utilities_receiver(event:websocket_event):void {
    const dataString:string = (typeof event.data === "string")
            ? event.data
            : null,
        error = function browser_utilities_receiver_error():void {
            // eslint-disable-next-line no-console
            console.error("Error", socketData.data);
        },
        reload = function browser_utilities_receiver_reload():void {
            location.reload();
        },
        actions:network_actions = {
            "agent-hash": function browser_utilities_receiver_agentHash(socketData:socketData):void {
                if (browser.identity.hashDevice === "") {
                    const hashes:service_agentHash = socketData.data as service_agentHash;
                    browser.identity.hashDevice = hashes.device;
                    browser.identity.hashUser = hashes.user;
                    browser.agents.device[hashes.device] = {
                        deviceData: hashes.deviceData,
                        ipAll: browser.network.addresses,
                        ipSelected: "",
                        name: browser.identity.nameDevice,
                        port: browser.network.port,
                        secret: browser.identity.secretDevice,
                        shares: {},
                        status: "idle"
                    };
                    agent_add({
                        callback: function browser_utilities_receiver_agentHash_addAgent():void {
                            browser.pageBody.setAttribute("class", "default");
                        },
                        hash: hashes.device,
                        name: browser.identity.nameDevice,
                        type: "device"
                    });
                }
            },
            "agent-status": function browser_utilities_receiver_agentStatus(socketData:socketData):void {
                const data:service_agentStatus = socketData.data as service_agentStatus;
    
                // do not receive local agent status from a remote agent
                if (browser.agents[data.agentType][data.agent] !== undefined && (data.agentType !== "device" || (data.agentType === "device" && data.agent !== browser.identity.hashDevice))) {
                    const agent:HTMLElement = document.getElementById(data.agent);
                    agent.setAttribute("class", data.status);
                }
            },
            "agent-management": function browser_content_agentManagement_modifyReceive(socketData:socketData):void {
                const data:service_agentManagement = socketData.data as service_agentManagement;
                if (data.action === "add") {
                    const addAgents = function browser_content_agentManagement_receive_addAgents(agentType:agentType):void {
                        const keys:string[] = Object.keys(data.agents[agentType]),
                            keyLength:number = keys.length;
                        if (keyLength > 0) {
                            let a:number = 0;
                            do {
                                if (browser.agents[agentType][keys[a]] === undefined) {
                                    browser.agents[agentType][keys[a]] = data.agents[agentType][keys[a]];
                                    agent_add({
                                        hash: keys[a],
                                        name: data.agents[agentType][keys[a]].name,
                                        type: agentType
                                    });
                                }
                                a = a + 1;
                            } while (a < keyLength);
                        }
                    };
                    if (data.identity !== null) {
                        browser.identity.hashUser = data.identity.hashUser;
                        browser.identity.nameUser = data.identity.nameUser;
                    }
                    addAgents("device");
                    addAgents("user");
                } else if (data.action === "delete") {
                    const deleteAgents = function browser_content_agentManagement_receive_deleteAgents(agentType:agentType):void {
                        const keys:string[] = Object.keys(data.agents[agentType]),
                            keyLength:number = keys.length,
                            property:"hashDevice"|"hashUser" = `hash${common.capitalize(agentType)}` as "hashDevice"|"hashUser";
                        if (keyLength > 0) {
                            let a:number = 0;
                            do {
                                if (keys[a] === browser.identity[property]) {
                                    agent_delete(data.agentFrom, agentType);
                                } else {
                                    agent_delete(keys[a], agentType);
                                }
                                a = a + 1;
                            } while (a < keyLength);
                        }
                    };
                    deleteAgents("device");
                    deleteAgents("user");
                } else if (data.action === "modify") {
                    const shareContent = function browser_content_agentManagement_receive_shareContent(agentName:string, agentType:agentType|""):void {
                            const shareModals:HTMLElement[] = document.getModalsByModalType("shares");
                            let shareLength:number = shareModals.length,
                                body:HTMLElement = null;
                            if (shareLength > 0) {
                                do {
                                    shareLength = shareLength - 1;
                                    if ((shareModals[shareLength].dataset.agent === agentName && shareModals[shareLength].dataset.agenttype === agentType) || (agentType === "" && shareModals[shareLength].getElementsByTagName("button")[0].firstChild.textContent === "⌘ All Shares")) {
                                        body = shareModals[shareLength].getElementsByClassName("body")[0] as HTMLElement;
                                        body.appendText("", true);
                                        body.appendChild(share_content(agentName, agentType));
                                    }
                                } while (shareLength > 0);
                            }
                        },
                        modifyAgents = function browser_content_agentManagement_receive_modifyAgents(agentType:agentType):void {
                            const keys:string[] = Object.keys(data.agents[agentType]),
                                keyLength:number = keys.length;
                            if (keyLength > 0) {
                                let a:number = 0;
                                do {
                                    if (browser.agents[agentType][keys[a]] !== undefined) {
                                        browser.agents[agentType][keys[a]] = data.agents[agentType][keys[a]];
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
            },
            "error": error,
            "hash-share": function browser_content_shares_hash(socketData:socketData):void {
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
                        identity: null
                    };
                browser.agents.device[hash.device].shares[hash.hash] = {
                    execute: false,
                    name: hash.share,
                    readOnly: true,
                    type: hash.type
                };
                // update any share modals
                share_update("");
                // inform other agents of the share
                browser.send(management, "agent-management");
            },
            "file-system-details": function browser_content_fileBrowser_detailsResponse(socketData:socketData):void {
                const payload:service_fileSystem_details = socketData.data as service_fileSystem_details,
                    list:directory_list = (payload.dirs === "missing" || payload.dirs === "noShare" || payload.dirs === "readOnly")
                        ? []
                        : payload.dirs,
                    listLength:number = list.length,
                    plural:string = (listLength === 1)
                        ? ""
                        : "s",
                    fileList:directory_list = [],
                    body:HTMLElement = document.getElementById(payload.id).getElementsByClassName("body")[0] as HTMLElement,
                    length:number = list.length,
                    details:fileBrowser_DetailCounts = {
                        size: 0,
                        files: 0,
                        directories: 0,
                        links: 0
                    },
                    output:HTMLElement = document.createElement("div"),
                    row = function browser_content_fileBrowser_details_row(heading:string, cell:string, tbody:HTMLElement):void {
                        const tr:HTMLElement = document.createElement("tr"),
                            th:HTMLElement = document.createElement("th"),
                            td:HTMLElement = document.createElement("td");
                        th.appendText(heading);
                        td.appendText(cell);
                        tr.appendChild(th);
                        tr.appendChild(td);
                        tbody.appendChild(tr);
                    },
                    mTime:Date = new Date(Number(list[0][5].mtimeMs)),
                    aTime:Date = new Date(Number(list[0][5].atimeMs)),
                    cTime:Date = new Date(Number(list[0][5].ctimeMs));
                let a:number = 0,
                    p:HTMLElement = null,
                    heading:HTMLElement = document.createElement("h3"),
                    table:HTMLElement = document.createElement("table"),
                    tbody:HTMLElement = document.createElement("tbody");
                if (length > 0) {
                    do {
                        if (list[a][1] === "directory") {
                            details.directories = details.directories + 1;
                        } else if (list[a][1] === "link") {
                            details.links = details.links + 1;
                        } else {
                            fileList.push(list[a]);
                            details.files = details.files + 1;
                            details.size = details.size + list[a][5].size;
                        }
                        a = a + 1;
                    } while (a < length);
                }
    
                output.setAttribute("class", "fileDetailOutput");
                heading.appendText(`File System Details - ${common.commas(listLength)} item${plural}`);
                output.appendChild(heading);
                row("Location", payload.dirs[0][0], tbody);
                row("Total Size", (details.size > 1024n)
                    ? `${common.commas(details.size)} bytes (${common.prettyBytes(details.size)})`
                    : `${common.commas(details.size)} bytes`,
                tbody);
                table.appendChild(tbody);
                output.appendChild(table);
        
                heading = document.createElement("h3");
                heading.appendText("Contains");
                output.appendChild(heading);
                p = document.createElement("p");
                p.appendText("Does not count read protected assets.");
                output.appendChild(p);
                table = document.createElement("table");
                tbody = document.createElement("tbody");
                row("Files", common.commas(details.files), tbody);
                row("Directories", common.commas(details.directories), tbody);
                row("Symbolic Links", common.commas(details.links), tbody);
                table.appendChild(tbody);
                output.appendChild(table);
    
                heading = document.createElement("h3");
                heading.appendText("MAC");
                output.appendChild(heading);
                table = document.createElement("table");
                tbody = document.createElement("tbody");
                row("Modified", common.dateFormat(mTime), tbody);
                row("Accessed", common.dateFormat(aTime), tbody);
                row("Created", common.dateFormat(cTime), tbody);
                table.appendChild(tbody);
                output.appendChild(table);
    
                if (list[0][1] === "directory" && details.files > 0) {
                    const dataLength:number = fileList.length,
                        hundred:number = Math.min(dataLength, 100),
                        sortAlpha = function browser_content_fileBrowser_details_sortAlpha(aa:directory_item, bb:directory_item):number {
                            if (aa[0] < bb[0]) {
                                return -1;
                            }
                            return 1;
                        },
                        sortChanged = function browser_content_fileBrowser_details_sortChanged(aa:directory_item, bb:directory_item):number {
                            if (aa[5].mtimeMs > bb[5].mtimeMs) {
                                return -1;
                            }
                            return 1;
                        },
                        sortLargest = function browser_content_fileBrowser_details_sortLargest(aa:directory_item, bb:directory_item):number {
                            if (aa[5].size > bb[5].size) {
                                return -1;
                            }
                            return 1;
                        },
                        clickGenerator = function browser_content_fileBrowser_details_clickGenerator(sortName:"alpha"|"changed"|"largest"):void {
                            const p:HTMLElement = document.createElement("p"),
                                button:HTMLElement = document.createElement("button");
                            button.appendText((sortName === "alpha")
                                ? "List all files alphabetically"
                                : (sortName === "changed")
                                    ? "List 100 most recently changed files"
                                    : "List 100 largest files");
                            button.onclick = function browser_content_fileBrowser_details_clickGenerator_click(event:MouseEvent):void {
                                if (sortName === "alpha") {
                                    fileList.sort(sortAlpha);
                                } else if (sortName === "changed") {
                                    fileList.sort(sortChanged);
                                } else if (sortName === "largest") {
                                    fileList.sort(sortLargest);
                                }
                                const element:HTMLElement = event.target,
                                    grandParent:HTMLElement = element.parentNode.parentNode,
                                    table:HTMLElement = grandParent.getElementsByClassName("detailFileList")[0] as HTMLElement,
                                    p:HTMLElement = table.previousSibling as HTMLElement,
                                    tableBody:HTMLElement = table.getElementsByTagName("tbody")[0],
                                    len:number = (sortName === "alpha")
                                        ? dataLength
                                        : hundred;
                                let aa:number = 0,
                                    row:HTMLElement,
                                    cell:HTMLElement;
                                p.appendText((sortName === "alpha")
                                    ? `All ${common.commas(dataLength)} files sorted alphabetically`
                                    : (sortName === "changed")
                                        ? `${hundred} most recently changed files`
                                        : `${hundred} largest files`);
                                tbody.appendText("", true);
                                do {
                                    row = document.createElement("tr");
                                    cell = document.createElement("th");
                                    cell.setAttribute("class", "file");
                                    cell.appendText(fileList[aa][0]);
                                    row.appendChild(cell);
                                    cell = document.createElement("td");
                                    cell.appendText((sortName === "alpha")
                                        ? fileList[aa][0]
                                        : (sortName === "changed")
                                            ? common.dateFormat(new Date(Number(fileList[aa][5].mtimeMs)))
                                            : common.commas(fileList[aa][5].size));
                                    row.appendChild(cell);
                                    if (sortName === "largest") {
                                        cell = document.createElement("td");
                                        cell.appendText(common.prettyBytes(fileList[aa][5].size));
                                        row.appendChild(cell);
                                    }
                                    tableBody.appendChild(row);
                                    aa = aa + 1;
                                } while (aa < len);
                                table.style.display = "block";
                                p.style.display = "block";
                            };
                            button.setAttribute("type", "button");
                            p.appendChild(button);
                            output.appendChild(p);
                        };
                    heading = document.createElement("h3");
                    heading.appendText("List Files");
                    output.appendChild(heading);
                    clickGenerator("largest");
                    clickGenerator("changed");
                    clickGenerator("alpha");
        
                    // subject paragraph
                    p = document.createElement("p");
                    p.style.display = "none";
                    output.appendChild(p);
        
                    // table
                    table = document.createElement("table");
                    tbody = document.createElement("tbody");
                    table.appendChild(tbody);
                    table.style.display = "none";
                    table.setAttribute("class", "detailFileList");
                    output.appendChild(table);
                }
        
                body.appendText("", true);
                body.appendChild(output);
            },
            "file-system-status": file_status,
            "file-system-string": function browser_utilities_receiver_dataString(socketData:socketData):void {
                const data:service_fileSystem_string = socketData.data as service_fileSystem_string,
                    length:number = data.files.length;
                let a:number = 0,
                    textArea:HTMLTextAreaElement,
                    modalResult:HTMLElement,
                    body:HTMLElement,
                    heading:HTMLElement;
                if (data.files[0] === undefined) {
                    return;
                }
                do {
                    modalResult = document.getElementById(data.files[a].id);
                    body = modalResult.getElementsByClassName("body")[0] as HTMLElement;
                    textArea = body.getElementsByTagName("textarea")[0];
                    heading = modalResult.getElementsByTagName("h2")[0].getElementsByTagName("button")[0];
                    if (data.type === "hash") {
                        textArea.style.minHeight = "5em";
                        body.style.height = "auto";
                    }
                    textArea.value = data.files[a].content;
                    heading.style.width = `${(body.clientWidth - 50) / 18}em`;
                    a = a + 1;
                } while (a < length);
                browser.configuration();
            },
            "invite": agent_management.tools.inviteTransmissionReceipt,
            "message": function browser_utilities_receiver_message(socketData:socketData):void {
                const messageData:service_message = socketData.data as service_message,
                    agentFrom:string = messageData[0].agentFrom,
                    agentType:agentType = messageData[0].agentType,
                    target:messageTarget = ((agentType === "user" && agentFrom === browser.identity.hashUser) || (agentType === "device" && agentFrom === browser.identity.hashDevice))
                        ? "agentTo"
                        : "agentFrom";
                document.getElementById("message-update").appendText(messageData[0].message, true);
                messageData.forEach(function browser_utilities_receiver_message_each(item:message_item):void {
                    message_post(item, target, null);
                });
                if (browser.visible === false && Notification.permission === "granted") {
                    const messageBody:string = messageData[0].message,
                        messageString:string = (messageBody.length > 100)
                            ? `${messageBody.slice(0, 100)}\u2026`
                            : messageBody,
                        notifyOptions:NotificationOptions = {
                            body: `Received new message from ${agentType} ${browser.agents[agentType][agentFrom].name}.\r\n\r\n${messageString}`,
                            vibrate: [200, 100]
                        },
                        notify:Notification = new Notification(`${browser.title} - New Message`, notifyOptions);
                    notify.onshow = function browser_utilities_receiver_message_show():void {
                        notify.close();
                    };
                }
            },
            "reload": reload,
            "socket-map": configuration.tools.socketMap,
            "terminal": terminal.events.receive,
            "test-browser": remote.receive
        },
        socketData:socketData = JSON.parse(dataString) as socketData,
        type:service_type = socketData.service;
    if (dataString !== null) {
        actions[type](socketData);
    }
};

export default receiver;