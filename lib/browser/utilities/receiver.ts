
/* lib/browser/utilities/receiver - Routes network messages to the respective browser library. */

import browser from "./browser.js";
import agent_management from "../content/agent_management.js";
import common from "../../common/common.js";
import configuration from "../content/configuration.js";
import file_status from "./file_status.js";
import message from "../content/message.js";
import remote from "./remote.js";
import share_update from "./share_update.js";
import terminal from "../content/terminal.js";

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
                    agent_management.tools.addAgent({
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
            "agent-management": agent_management.tools.modifyReceive,
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
            "message": message.tools.receive,
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