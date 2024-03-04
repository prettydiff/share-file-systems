
/* lib/browser/utilities/webSocket - Handles web socket events and associated errors. This where most communications from outside the browser are processed. */

import agent_delete from "./agent_delete.js";
import browser from "./browser.js";
import agent_management from "../content/agent_management.js";
import common from "../../common/common.js";
import configuration from "../content/configuration.js";
import configuration_styleText from "./configuration_styleText.js";
import file_status from "./file_status.js";
import message_post from "./message_post.js";
import modal_shares from "./modal_shares.js";
import modal_shareUpdate from "./modal_shareUpdate.js";
import remote from "./remote.js";
import share_update from "./share_update.js";
import terminal from "../content/terminal.js";

// cspell: words agenttype

/**
 * Module definition for browser-side websocket handling.
 * ```typescript
 * interface module_browserSocket {
 *     error: () => void;                                                          // An error handling method.
 *     hash : string;                                                              // Stores a hash value used to authenticate a client hash tunnel at the server.
 *     send : (data:socketData) => void;                                           // Packages micro-service data for transmission in the application's micro-service format.
 *     sock : websocket_local;                                                     // Provides a web socket object in a way that allows for explicit type declarations, reuse, and without angering the TypeScript gods.
 *     start: (callback: () => void, hashDevice:string, type:string) => WebSocket; // Initiates a web socket client from the browser.
 *     type : string;                                                              // Stores the submitted type value.
 * }
 * ``` */

const webSocket:module_browserSocket = {
    agent_add: function browser_content_agentManagement_addAgent(input:agentManagement_addAgent):void {
        const li:HTMLLIElement = document.createElement("li"),
            button:HTMLElement = document.createElement("button"),
            addStyle = function browser_content_agentManagement_addUser_addStyle():void {
                let body:string,
                    heading:string;
                if (browser.ui.colors[input.type][input.hash] === undefined) {
                    body = browser.colorDefaults[browser.ui.color][0];
                    heading = browser.colorDefaults[browser.ui.color][1];
                    browser.ui.colors[input.type][input.hash] = [body, heading];
                    if (input.callback !== undefined) {
                        input.callback();
                    }
                } else {
                    body = browser.ui.colors[input.type][input.hash][0];
                    heading = browser.ui.colors[input.type][input.hash][1];
                }
                if (browser.loading === false) {
                    configuration_styleText({
                        agent: input.hash,
                        agentType: input.type,
                        colors: [body, heading],
                        replace: false
                    });
                }
            },
            status = function browser_content_agentManagement_addUser_status(status:activityStatus):HTMLElement {
                const em:HTMLElement = document.createElement("em"),
                    span:HTMLElement = document.createElement("span");
                em.setAttribute("class", `status-${status}`);
                em.appendText("●");
                span.appendText(` ${common.capitalize(status)}`);
                em.appendChild(span);
                return em;
            };
        button.appendChild(status("active"));
        button.appendChild(status("idle"));
        button.appendChild(status("offline"));
        button.appendText(` ${input.name}`);
        if (input.hash === browser.identity.hashDevice) {
            button.setAttribute("class", "active");
        } else {
            button.setAttribute("class", browser.agents[input.type][input.hash].status);
        }
        button.setAttribute("id", input.hash);
        button.setAttribute("data-agenttype", input.type);
        button.setAttribute("type", "button");
        button.onclick = modal_shares;
        li.appendChild(button);
        document.getElementById(input.type).getElementsByTagName("ul")[0].appendChild(li);
        addStyle();
        configuration.tools.addUserColor(input.hash, input.type);
        if (browser.loading === false) {
            share_update("");
        }
    },
    error: function browser_utilities_socketError():void {
        setTimeout(function browser_utilities_socketError_delay():void {
            webSocket.start(null, webSocket.hash, webSocket.type);
        }, browser.ui.statusTime);
    },
    hash: "",
    sock: (function browser_utilities_socket():websocket_local {
        // A minor security circumvention.
        const socket:websocket_local = WebSocket as websocket_local;
        // eslint-disable-next-line no-global-assign
        WebSocket = null;
        return socket;
    }()),
    start: function browser_utilities_webSocket(callback:() => void, hashDevice:string, type:string):WebSocket {
        const title:HTMLElement = document.getElementById("title-bar"),
            scheme:string = (location.protocol.toLowerCase() === "http:")
                ? "ws"
                : "wss",
            socket:websocket_browser = new webSocket.sock(`${scheme}://localhost:${browser.network.port}/`, [`${type}-${hashDevice}`]) as websocket_browser,
            open = function browser_utilities_webSocket_socketOpen():void {
                if (title.getAttribute("class") === "title offline") {
                    location.reload();
                } else {
                    title.setAttribute("class", "title");
                    if (type === "primary") {
                        const messageDelay = function browser_utilities_webSocket_socketOpen_messageDelay():void {
                            if (browser.loadQueue.length > 0) {
                                browser.send(browser.loadQueue[0].data, browser.loadQueue[0].service);
                                browser.loadQueue.splice(0, 1);
                                if (browser.loadQueue.length > 0) {
                                    setTimeout(browser_utilities_webSocket_socketOpen_messageDelay, 5);
                                }
                            }
                        };
                        browser.socket = socket;
                        messageDelay();
                    }
                    socket.type = type;
                    if (callback !== null) {
                        callback();
                    }
                }
            },
            close = function browser_utilities_webSocket_socketClose():void {
                if (browser.identity.hashDevice !== "" && socket.type === "primary") {
                    const device:HTMLElement = document.getElementById(browser.identity.hashDevice),
                        agentList:HTMLElement = document.getElementById("agentList"),
                        active:HTMLCollectionOf<Element> = agentList.getElementsByClassName("status-active");
                    let a:number = active.length;
                    if (a > 0) {
                        do {
                            a = a - 1;
                            active[a].parentNode.setAttribute("class", "offline");
                        } while (a > 0);
                    }
                    browser.socket = null;
                    title.setAttribute("class", "title offline");
                    title.empty();
                    title.getElementsByTagName("h1")[0].appendText("Disconnected.");
                    if (device !== null) {
                        device.setAttribute("class", "offline");
                    }
                }
            },
            receiver = function browser_utilities_webSocket_receiver(event:websocket_event):void {
                const dataString:string = (typeof event.data === "string")
                        ? event.data
                        : null,
                    error = function browser_utilities_webSocket_receiver_error():void {
                        // eslint-disable-next-line no-console
                        console.error("Error", socketData.data);
                    },
                    reload = function browser_utilities_webSocket_receiver_reload():void {
                        location.reload();
                    },
                    actions:network_actions = {
                        "agent-hash": function browser_utilities_webSocket_receiver_agentHash(socketData:socketData):void {
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
                                webSocket.agent_add({
                                    callback: function browser_utilities_webSocket_receiver_agentHash_addAgent():void {
                                        browser.pageBody.setAttribute("class", "default");
                                    },
                                    hash: hashes.device,
                                    name: browser.identity.nameDevice,
                                    type: "device"
                                });
                            }
                        },
                        "agent-status": function browser_utilities_webSocket_receiver_agentStatus(socketData:socketData):void {
                            const data:service_agentStatus = socketData.data as service_agentStatus;
                            // do not receive local agent status from a remote agent
                            if (browser.agents[data.agentType][data.agent] !== undefined && (data.agentType !== "device" || (data.agentType === "device" && data.agent !== browser.identity.hashDevice))) {
                                const agent:HTMLElement = document.getElementById(data.agent);
                                agent.setAttribute("class", data.status);
                            }
                        },
                        "agent-management": function browser_utilities_webSocket_receiver_agentManagement(socketData:socketData):void {
                            const data:service_agentManagement = socketData.data as service_agentManagement;
                            if (data.action === "add") {
                                const addAgents = function browser_utilities_webSocket_receiver_agentManagement_addAgents(agentType:agentType):void {
                                    const keys:string[] = Object.keys(data.agents[agentType]),
                                        keyLength:number = keys.length;
                                    if (keyLength > 0) {
                                        let a:number = 0;
                                        do {
                                            if (browser.agents[agentType][keys[a]] === undefined) {
                                                browser.agents[agentType][keys[a]] = data.agents[agentType][keys[a]];
                                                webSocket.agent_add({
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
                                const deleteAgents = function browser_utilities_webSocket_receiver_agentManagement_deleteAgents(agentType:agentType):void {
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
                                const shareContent = function browser_utilities_webSocket_receiver_agentManagement_shareContent(agentName:string, agentType:agentType|""):void {
                                        const shareModals:HTMLElement[] = document.getModalsByModalType("shares");
                                        let shareLength:number = shareModals.length;
                                        if (shareLength > 0) {
                                            do {
                                                shareLength = shareLength - 1;
                                                if ((shareModals[shareLength].dataset.agent === agentName && shareModals[shareLength].dataset.agenttype === agentType) || (agentType === "" && shareModals[shareLength].getElementsByTagName("button")[0].firstChild.textContent === "⌘ All Shares")) {
                                                    modal_shareUpdate(shareModals[shareLength], agentName, agentType);
                                                }
                                            } while (shareLength > 0);
                                        }
                                    },
                                    modifyAgents = function browser_utilities_webSocket_receiver_agentManagement_modifyAgents(agentType:agentType):void {
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
                        "hash-share": function browser_utilities_webSocket_receiver_hashShare(socketData:socketData):void {
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
                        "file-system-details": function browser_utilities_webSocket_receiver_fileDetails(socketData:socketData):void {
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
                                row = function browser_utilities_webSocket_receiver_fileDetails_row(heading:string, cell:string, tbody:HTMLElement):void {
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
                                    sortAlpha = function browser_utilities_webSocket_receiver_fileDetails_sortAlpha(aa:directory_item, bb:directory_item):number {
                                        if (aa[0] < bb[0]) {
                                            return -1;
                                        }
                                        return 1;
                                    },
                                    sortChanged = function browser_utilities_webSocket_receiver_fileDetails_sortChanged(aa:directory_item, bb:directory_item):number {
                                        if (aa[5].mtimeMs > bb[5].mtimeMs) {
                                            return -1;
                                        }
                                        return 1;
                                    },
                                    sortLargest = function browser_utilities_webSocket_receiver_fileDetails_sortLargest(aa:directory_item, bb:directory_item):number {
                                        if (aa[5].size > bb[5].size) {
                                            return -1;
                                        }
                                        return 1;
                                    },
                                    clickGenerator = function browser_utilities_webSocket_receiver_fileDetails_clickGenerator(sortName:"alpha"|"changed"|"largest"):void {
                                        const p:HTMLElement = document.createElement("p"),
                                            button:HTMLElement = document.createElement("button");
                                        button.appendText((sortName === "alpha")
                                            ? "List all files alphabetically"
                                            : (sortName === "changed")
                                                ? "List 100 most recently changed files"
                                                : "List 100 largest files");
                                        button.onclick = function browser_utilities_webSocket_receiver_fileDetails_clickGenerator_click(event:MouseEvent):void {
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
                                            tbody.empty();
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

                            body.empty();
                            body.appendChild(output);
                        },
                        "file-system-status": file_status,
                        "file-system-string": function browser_utilities_webSocket_receiver_fileString(socketData:socketData):void {
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
                        "message": function browser_utilities_webSocket_receiver_message(socketData:socketData):void {
                            const messageData:service_message = socketData.data as service_message,
                                agentFrom:string = messageData[0].agentFrom,
                                agentType:agentType = messageData[0].agentType,
                                target:messageTarget = ((agentType === "user" && agentFrom === browser.identity.hashUser) || (agentType === "device" && agentFrom === browser.identity.hashDevice))
                                    ? "agentTo"
                                    : "agentFrom",
                                update:HTMLElement = document.getElementById("message-update");
                            update.empty();
                            update.appendText(messageData[0].message);
                            messageData.forEach(function browser_utilities_webSocket_receiver_message_each(item:message_item):void {
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
                                notify.onshow = function browser_utilities_webSocket_receiver_message_show():void {
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
        webSocket.hash = hashDevice;
        webSocket.type = type;

        /* Handle Web Socket responses */
        socket.onopen = open;
        socket.onmessage = receiver;
        socket.onclose = close;
        socket.onerror = function browser_utilities_webSocket_error():void {
            webSocket.error();
        };
        return browser.socket;
    },
    type: ""
};

export default webSocket;