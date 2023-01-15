
/* lib/browser/content/file_browser - A collection of utilities for handling file system related tasks in the browser. */
import browser from "../utilities/browser.js";
import common from "../../common/common.js";
import context from "./context.js";
import global_events from "./global_events.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

/**
 * Generates the user experience associated with file system interaction.
 * ```typescript
 * interface module_fileBrowser {
 *     content: {
 *         dataString     : (socketData:socketData) => void; // Populate content into modals for string output operations, such as: Base64, Hash, File Read.
 *         detailsContent : (id:string) => void;             // Generates the initial content and network request for file system details.
 *         detailsResponse: (socketData:socketData) => void; // Generates the contents of a details type modal from file system data.
 *         footer         : (width:number) => HTMLElement;   // Generates the status bar content for the file browser modal.
 *         list           : (location:string, dirs:directory_response, message:string) => HTMLElement; // Generates the contents of a file system list for population into a file navigate modal.
 *         status         : (socketData:socketData) => void; // Translates messaging into file system lists for the appropriate modals.
 *     };
 *     dragFlag: dragFlag; // Allows the drag handler to identify whether the shift or control/command keys are pressed while selecting items from the file list.
 *     events: {
 *         back       : (event:MouseEvent) => void;               // Handler for the back button, which steps back to the prior file system location of the given agent stored in the modal's navigation history.
 *         directory  : (event:KeyboardEvent|MouseEvent) => void; // Handler for navigation into a directory by means of double click.
 *         drag       : (event:MouseEvent|TouchEvent) => void;    // Move file system artifacts from one location to another by means of double click.
 *         execute    : (event:KeyboardEvent|MouseEvent) => void; // Allows operating system execution of a file by double click interaction.
 *         expand     : (event:MouseEvent) => void;               // Opens a directory into a child list without changing the location of the current modal.
 *         keyExecute : (event:KeyboardEvent) => void;            // Allows file execution by keyboard control, such as pressing the *Enter* key.
 *         listFocus  : (event:MouseEvent) => void;               // When clicking on a file list give focus to an input field in that list so that the list can receive focus.
 *         parent     : (event:MouseEvent) => void;               // Handler to navigate into the parent directory by click the parent navigate button.
 *         rename     : (event:KeyboardEvent|MouseEvent) => void; // Converts a file system item text into a text input field so that the artifact can be renamed.
 *         saveFile   : (event:MouseEvent) => void;               // A handler for an interaction that allows writing file changes to the file system.
 *         search     : (event?:FocusEvent|KeyboardEvent|MouseEvent, searchElement?:HTMLInputElement, callback?:(event:Event, callback:(event:MouseEvent, dragBox:HTMLElement) => void) => void) => void; // Sends a search query in order to receive a filtered list of file system artifacts.
 *         searchFocus: (event:FocusEvent) => void;               // Provides an interaction that enlarges and reduces the width of the search field.
 *         select     : (event:KeyboardEvent|MouseEvent) => void; // Select a file system item for interaction by click.
 *         text       : (event:FocusEvent|KeyboardEvent|MouseEvent) => void; // Allows changing file system location by changing the text address of the current location.
 *     };
 *     tools: {
 *         listFail    : (count:number, box:modal) => void; // Display status information when the Operating system locks files from access.
 *         listItem    : (item:directory_item, extraClass:string) => HTMLElement; // Generates the HTML content for a single file system artifacts that populates a file system list.
 *         modalAddress: (event:FocusEvent|KeyboardEvent|MouseEvent, config:config_modal_history) => void; // Updates the file system address of the current file navigate modal in response to navigating to different locations.
 *     };
 * }
 * type dragFlag = "" | "control" | "shift";
 * ``` */
const file_browser:module_fileBrowser = {
    content: {

        /* Populate content into modals for string content, such as: Base64, Hash, File Read */
        dataString: function browser_content_fileBrowser_dataString(socketData:socketData):void {
            const data:service_fileSystem_string = socketData.data as service_fileSystem_string,
                length:number = data.files.length;
            let a:number = 0,
                textArea:HTMLTextAreaElement,
                label:HTMLElement,
                span:HTMLElement,
                modalResult:HTMLElement,
                body:HTMLElement,
                heading:HTMLElement;
            if (data.files[0] === undefined) {
                return;
            }
            do {
                textArea = document.createElement("textarea");
                label = document.createElement("label");
                span = document.createElement("span");
                span.appendText("Text Pad");
                label.setAttribute("class", "text-pad");
                label.appendChild(span);
                label.appendChild(textArea);
                modalResult = document.getElementById(data.files[a].id),
                body = modalResult.getElementsByClassName("body")[0] as HTMLElement;
                textArea.onblur = modal.events.textSave;
                heading = modalResult.getElementsByTagName("h2")[0].getElementsByTagName("button")[0];
                if (data.type === "base64") {
                    textArea.style.whiteSpace = "normal";
                }
                if (data.type === "hash") {
                    textArea.style.minHeight = "5em";
                    body.style.height = "auto";
                }
                browser.data.modals[data.files[a].id].text_value = data.files[a].content;
                textArea.value = data.files[a].content;
                body.appendText("", true);
                body.appendChild(label);
                body.style.overflow = "hidden";
                heading.style.width = `${(body.clientWidth - 50) / 18}em`;
                a = a + 1;
            } while (a < length);
            network.configuration();
        },

        /* Initiates a network request for file system details */
        detailsContent: function browser_content_fileBrowser_detailsContent(id:string):void {
            const name:string = context.element.lowName(),
                element:HTMLElement = (name === "li" || name === "ul")
                    ? context.element
                    : context.element.getAncestor("li", "tag"),
                box:modal = element.getAncestor("box", "class"),
                menu:HTMLElement = document.getElementById("contextMenu"),
                addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
                addresses:[string, fileType, string][] = util.selectedAddresses(element, "details"),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                payloadNetwork:service_fileSystem = {
                    action: "fs-details",
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 0,
                    location: (function browser_content_context_details_addressList():string[] {
                        const output:string[] = [],
                            length:number = addresses.length;
                        let a:number = 0;
                        if (name === "ul") {
                            return [addressField.value];
                        }
                        do {
                            output.push(addresses[a][0]);
                            a = a + 1;
                        } while (a < length);
                        return output;
                    }()),
                    name: id
                };
            if (browser.loading === true) {
                return;
            }
            browser.data.modals[id].text_value = JSON.stringify(payloadNetwork.location);
            network.send(payloadNetwork, "file-system");
            network.configuration();
            context.element = null;
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },

        /* generates the content for a file system details modal */
        detailsResponse: function browser_content_fileBrowser_detailsResponse(socketData:socketData):void {
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
                };
            let a:number = 0,
                p:HTMLElement = null,
                heading:HTMLElement = document.createElement("h3"),
                table:HTMLElement = document.createElement("table"),
                tbody:HTMLElement = document.createElement("tbody"),
                mTime:Date,
                aTime:Date,
                cTime:Date;
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
    
            mTime = new Date(Number(list[0][5].mtimeMs));
            aTime = new Date(Number(list[0][5].atimeMs));
            cTime = new Date(Number(list[0][5].ctimeMs));
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

        /* generates the status bar content for the file navigate modal */
        footer: function browser_content_fileBrowser_footer(width:number):HTMLElement {
            const  footer:HTMLElement = document.createElement("div"),
            extra:HTMLElement = document.createElement("p");
            footer.setAttribute("class", "status-bar");
            footer.style.width = `${(width / 10) - 2}em`;
            extra.setAttribute("aria-live", "polite");
            extra.setAttribute("role", "status");
            footer.appendChild(extra);
            return footer;
        },

        /* Builds the HTML file list */
        list: function browser_content_fileBrowser_list(location:string, dirs:directory_response, message:string):HTMLElement {
            const listLength:number = dirs.length,
                local:directory_list = (function browser_content_fileBrowser_list_local():directory_list {
                    if (Array.isArray(dirs) === true) {
                        if (listLength > 0 && dirs[0][1] === "directory" && dirs[0][3] === 0) {
                            const output:directory_list = [];
                            if (listLength > 1) {
                                let index:number = 1;
                                do {
                                    if (dirs[index][3] === 0) {
                                        output.push(dirs[index] as directory_item);
                                    }
                                    index = index + 1;
                                } while (index < listLength);
                                return common.sortFileList(output, location, browser.data.fileSort);
                            }
                            return output;
                        }
                        return dirs as directory_list;
                    }
                    return null;
                }()),
                localLength:number = (local === null)
                    ? 0
                    : local.length,
                output:HTMLElement = document.createElement("ul");

            location = location.replace(/(\\|\/)+$/, "");

            if (dirs === "missing" || dirs === "noShare" || dirs === "readOnly") {
                const p:HTMLElement = document.createElement("p");
                p.appendText((dirs === "missing")
                    ? (message === "")
                        ? "Error 404: Requested location is not available or machine is offline."
                        : `Error 404: ${message}`
                    : (dirs === "noShare")
                        ? (message === "")
                            ? "Error 403: Forbidden. Requested location is likely not shared."
                            : `Error 403: ${message}`
                        : (message === "")
                            ? "Error 406: Not accepted. Read only shares cannot be modified."
                            : `Error 406: ${message}`);
                p.setAttribute("class", "error");
                return p;
            }

            if (message.indexOf("execute-") === 0) {
                const div:HTMLElement = document.createElement("div"),
                    em:HTMLElement = document.createElement("em"),
                    strong:HTMLElement = document.createElement("strong");
                let p:HTMLElement = document.createElement("p");
                em.appendText(dirs[0][0]);
                strong.appendText("file");
                p.appendText("Specified location ");
                p.appendChild(em);
                p.appendText(" is a ");
                p.appendChild(strong);
                p.appendText(".");
                div.appendChild(p);
                p = document.createElement("p");
                p.appendText("To execute the file either double click it from the file list or select it from the file list and press the 'Enter' key.  To see file system details about the file right click on the file from the file list and choose 'Details'.");
                div.appendChild(p);
                return div;
            }

            if (localLength > 0) {
                let a:number = 0;
                do {
                    if (local[a][0] !== location) {
                        output.appendChild(file_browser.tools.listItem(local[a], (a < localLength - 1 && local[a + 1][1] !== local[a][1])
                            ? "lastType"
                            : ""));
                    }
                    a = a + 1;
                } while (a < localLength);
            } else {
                const li:HTMLElement = document.createElement("li"),
                    label:HTMLElement = document.createElement("label"),
                    input:HTMLInputElement = document.createElement("input"),
                    p:HTMLElement = document.createElement("p");
                li.setAttribute("class", "empty-list");
                label.appendText("Empty list");
                input.type = "checkbox";
                label.appendChild(input);
                p.appendChild(label);
                li.appendChild(p);
                output.appendChild(li);
            }
            output.tabIndex = 0;
            output.oncontextmenu = context.events.menu;
            output.onkeydown = util.keys;
            output.onclick = file_browser.events.listFocus;
            output.onmousedown = function browser_file_browser_list_dragSelect(event:MouseEvent):void {
                util.dragBox(event, util.dragList);
            };
            output.setAttribute("class", "fileList");
            return output;
        },

        /* A utility to format and describe status bar messaging in a file navigator modal. */
        status: function browser_content_fileBrowser_status(socketData:socketData):void {
            const data:service_fileSystem_status = socketData.data as service_fileSystem_status,
                keys:string[] = Object.keys(browser.data.modals),
                failures:[string[], number] = (data.fileList === null || typeof data.fileList === "string" || data.fileList.failures === undefined)
                    ? [[], 0]
                    : [data.fileList.failures, Math.min(10, data.fileList.failures.length)],
                fails:HTMLElement = document.createElement("ul"),
                search:boolean  = (data.message.indexOf("search-") === 0),
                searchFragment:string = (search === true)
                    ? data.message.slice(data.message.indexOf("<em>") + 4, data.message.indexOf("</em>"))
                    : "",
                expandTest:boolean = (data.message.indexOf("expand-") === 0),
                expandLocation:string = data.message.replace("expand-", ""),
                expand = function browser_content_fileBrowser_status_expand(box:modal):void {
                    const list:HTMLCollectionOf<Element> = box.getElementsByClassName("fileList")[0].getElementsByTagName("label"),
                        max:number = list.length;
                    let index:number = 0,
                        text:string = "",
                        grandParent:HTMLElement = null;
                    do {
                        if (list[index].parentNode.lowName() === "p") {
                            grandParent = list[index].parentNode.parentNode;
                            text = list[index].firstChild.textContent;
                            if (text === expandLocation) {
                                if (grandParent.getAttribute("class").indexOf("directory") > -1) {
                                    grandParent.appendChild(file_browser.content.list(text, data.fileList, ""));
                                    return;
                                }
                            }
                            if (grandParent.getAttribute("class").indexOf("directory") < 0) {
                                break;
                            }
                        }
                        index = index + 1;
                    } while (index < max);
                };
            let listData:HTMLElement,
                body:HTMLElement,
                clone:HTMLElement,
                keyLength:number = keys.length,
                statusBar:HTMLElement,
                list:HTMLElement,
                p:HTMLElement,
                modal:config_modal,
                box:modal;
            if (failures[1] > 0) {
                let b:number = 0,
                    li:HTMLElement;
                do {
                    li = document.createElement("li");
                    li.appendText(failures[0][b]);
                    fails.appendChild(li);
                    b = b + 1;
                } while (b < failures[1]);
                if (failures.length > 10) {
                    li = document.createElement("li");
                    li.appendText("more...");
                    fails.appendChild(li);
                }
            }

            if (keyLength > 0) {
                do {
                    keyLength = keyLength - 1;
                    modal = browser.data.modals[keys[keyLength]];
                    if (modal.type === "file-navigate") {
                        if (
                            // get modals from data.agentSource, this device, and targeted shares
                            (modal.agent === data.agentSource[modal.agentType] || (browser.device[modal.agent] !== undefined && browser.device[modal.agent].shares[data.agentSource.share] !== undefined)) &&
                            // modals that match the data address posix (case sensitive) vs windows (case insensitive)
                            ((modal.text_value.charAt(0) === "/" && modal.text_value === data.agentSource.modalAddress) || (modal.text_value.charAt(0) !== "/" && modal.text_value.toLowerCase() === data.agentSource.modalAddress.toLowerCase())) &&
                            // if the data is a search result then only populate modals containing the specific fragment
                            (search === false || (search === true && modal.search[0] === modal.text_value && modal.search[1] === searchFragment))
                        ) {
                            box = document.getElementById(keys[keyLength]);
                            statusBar = box.getElementsByClassName("status-bar")[0] as HTMLElement;
                            list = statusBar.getElementsByTagName("ul")[0];
                            p = statusBar.getElementsByTagName("p")[0];
                            if (failures[1] > 0) {
                                clone = fails.cloneNode(true) as HTMLElement;
                                statusBar.appendChild(clone);
                            } else if (data.message !== "") {
                                if (expandTest === true) {
                                    expand(box);
                                } else {
                                    // eslint-disable-next-line
                                    p.innerHTML = data.message.replace(/((execute)|(search))-/, "");
                                    p.setAttribute("aria-live", "polite");
                                    p.setAttribute("role", "status");
                                    if (list !== undefined) {
                                        statusBar.removeChild(list);
                                    }
                                }
                            }
                            if (data.fileList !== null && expandTest === false) {
                                body = box.getElementsByClassName("body")[0] as HTMLElement;
                                body.appendText("", true);
                                listData = file_browser.content.list(data.agentSource.modalAddress, data.fileList, data.message);
                                if (listData !== null) {
                                    body.appendChild(listData);
                                    if (Array.isArray(data.fileList) === true && search === false) {
                                        file_browser.tools.modalAddress(null, {
                                            address: data.fileList[0][0],
                                            history: false,
                                            id: keys[keyLength],
                                            payload: null
                                        });
                                    }
                                }
                            }
                        }
                    }
                } while (keyLength > 0);
            }
        }
    },

    events: {

        /* step back through a modal's address history */
        back: function browser_content_fileBrowser_back(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                box:modal = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                address:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0] as HTMLInputElement,
                history = browser.data.modals[id].history;
            if (history.length > 1) {
                history.pop();
                address.value = history[history.length - 1];
                file_browser.events.text(event);
            }
        },

        /* navigate into a directory by double click */
        directory: function browser_content_fileBrowser_directory(event:KeyboardEvent|MouseEvent):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                li:HTMLElement = (element.lowName() === "li")
                    ? element
                    : element.getAncestor("li", "tag"),
                body:HTMLElement = li.getAncestor("body", "class"),
                box:modal = body.parentNode.parentNode,
                path:string = (li.getAttribute("class") === "link-directory")
                    ? li.dataset.path
                    : li.getElementsByTagName("label")[0].firstChild.textContent,
                id:string = box.getAttribute("id"),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null, path),
                payload:service_fileSystem = {
                    action: "fs-directory",
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 2,
                    location: [path],
                    name: ""
                };
            event.preventDefault();
            file_browser.tools.modalAddress(event, {
                address: path,
                id: id,
                history: true,
                payload: payload
            });
        },
    
        /* drag and drop of selected list items */
        drag: function browser_content_fileBrowser_drag(event:MouseEvent|TouchEvent):void {
            const element:HTMLElement = event.target,
                item:HTMLElement = (function browser_content_fileBrowser_drag_item():HTMLElement {
                    let el:HTMLElement = element;
                    const name:string = el.lowName();
                    if (name !== "label" && name !== "span") {
                        event.preventDefault();
                    }
                    if (name === "li") {
                        return el;
                    }
                    return el.getAncestor("li", "tag");
                }()),
                fileList:HTMLElement = element.getAncestor("div", "tag"),
                body:HTMLElement = fileList.parentNode,
                box:modal = body.getAncestor("box", "class"),
                header:number = (box.getElementsByClassName("header")[0] === undefined)
                    ? 0
                    : box.getElementsByClassName("header")[0].clientHeight + 13,
                top:number = body.offsetTop + header + box.offsetTop,
                left:number = body.offsetLeft + box.offsetLeft,
                bottom:number = top + body.clientHeight,
                right:number = left+ + body.clientWidth,
                touch:boolean = (event !== null && event.type === "touchstart"),
                list:HTMLElement = document.createElement("ul"),
                mouseDown = function browser_content_fileBrowser_drag_document(documentEvent:MouseEvent):void {
                    documentEvent.preventDefault();
                },
                drop = function browser_content_fileBrowser_drag_drop(dropEvent:MouseEvent|TouchEvent):void {
                    if (list.parentNode !== null) {
                        list.parentNode.removeChild(list);
                    }
                    if (touch === true) {
                        document.ontouchmove = null;
                        document.ontouchend = null;
                    } else {
                        document.onmousemove = null;
                        document.onmouseup = null;
                    }
                    if (init === false) {
                        return;
                    }
                    let goal:HTMLElement = null;
                    const addresses:string[] = (function browser_content_fileBrowser_drag_drop_addresses():string[] {
                            const output:string[] = [],
                                children:HTMLCollectionOf<HTMLElement> = list.getElementsByTagName("li"),
                                len:number = children.length;
                            let a:number = 0;
                            do {
                                output.push(children[a].getElementsByTagName("label")[0].firstChild.textContent);
                                a = a + 1;
                            } while (a < len);
                            return output;
                        }()),
                        touchDrop:TouchEvent = (touch === true)
                            ? dropEvent as TouchEvent
                            : null, 
                        mouseDrop:MouseEvent = (touch === true)
                            ? null
                            : dropEvent as MouseEvent,
                        clientX:number = (touch === true)
                            ? touchDrop.touches[0].clientX
                            : mouseDrop.clientX,
                        clientY:number = (touch === true)
                            ? touchDrop.touches[0].clientY
                            : mouseDrop.clientY,
                        target:string = (function browser_content_fileBrowser_drag_drop_target():string {
                            const ul:HTMLCollectionOf<HTMLElement> = browser.content.getElementsByClassName("fileList") as HTMLCollectionOf<HTMLElement>,
                                length:number = ul.length;
                            let a:number = 0,
                                ulBody:HTMLElement,
                                ulBox:HTMLElement,
                                ulHeader:number,
                                ulTop:number,
                                ulLeft:number,
                                ulBottom:number,
                                ulRight:number,
                                ulIndex:number,
                                zIndex:number = 0;
                            do {
                                if (ul[a] !== list) {
                                    ulBody = ul[a].parentNode;
                                    ulBox = ulBody.parentNode.parentNode;
                                    ulHeader = (ulBox.getElementsByClassName("header")[0] === undefined)
                                        ? 0
                                        : box.getElementsByClassName("header")[0].clientHeight + 13;
                                    ulTop = ulBody.offsetTop + ulHeader + ulBox.offsetTop;
                                    ulLeft = ulBody.offsetLeft + ulBox.offsetLeft;
                                    if (ulTop < clientY && ulLeft < clientX) {
                                        ulBottom = ulTop + ulBody.clientHeight;
                                        ulRight = ulLeft + ulBody.clientWidth;
                                        ulIndex = browser.data.modals[ulBox.getAttribute("id")].zIndex;
                                        if (ulBottom > clientY && ulRight > clientX && ulIndex > zIndex) {
                                            zIndex = ulIndex;
                                            goal = ul[a];
                                        }
                                    }
                                }
                                a = a + 1;
                            } while (a < length);
                            if (goal === undefined || goal === fileList) {
                                return "";
                            }
                            goal = goal.getAncestor("box", "class");
                            return goal.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value;
                        }()),
                        agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(goal, box, box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value),
                        payload:service_copy = {
                            agentRequest: agents[0],
                            agentSource : agents[1],
                            agentWrite  : agents[2],
                            cut         : false,
                            execute     : false,
                            location    : addresses
                        };
                        payload.agentWrite.modalAddress = target;
                    if (target === "") {
                        return;
                    }
                    network.send(payload, "copy");
                },
                move = function browser_content_fileBrowser_drag_move(moveEvent:MouseEvent|TouchEvent):boolean {
                    const touchMove:TouchEvent = (touch === true)
                            ? moveEvent as TouchEvent
                            : null,
                        mouseMove:MouseEvent = (touch === true)
                            ? null
                            : moveEvent as MouseEvent,
                        clientX:number = (touch === true)
                            ? touchMove.touches[0].clientX
                            : mouseMove.clientX,
                        clientY:number = (touch === true)
                            ? touchMove.touches[0].clientY
                            : mouseMove.clientY;
                    moveEvent.preventDefault();
                    if (outOfBounds === false && (clientX < left || clientX > right || clientY < top || clientY > bottom)) {
                        outOfBounds = true;
                        if (init === false) {
                            const checkbox:HTMLCollectionOf<HTMLInputElement> = fileList.getElementsByTagName("input"),
                                selected:HTMLElement[] = [];
                            let a:number = 0,
                                length:number = checkbox.length,
                                listItem:HTMLElement,
                                parent:HTMLElement;
                            init = true;
                            list.setAttribute("id", "file-list-drag");
                            list.setAttribute("class", "fileList");
                            do {
                                if (checkbox[a].type === "checkbox" && checkbox[a].checked === true) {
                                    selected.push(checkbox[a]);
                                }
                                a = a + 1;
                            } while (a < length);
                            length = selected.length;
                            if (length < 1) {
                                list.appendChild(item.cloneNode(true));
                            } else {
                                a = 0;
                                do {
                                    parent = selected[a].parentNode.parentNode;
                                    listItem = parent.getElementsByTagName("p")[0];
                                    list.appendChild(listItem.parentNode.cloneNode(true));
                                    a = a + 1;
                                } while (a < length);
                            }
                            browser.content.appendChild(list);
                        }
                        list.style.display = "block";
                    }
                    if (outOfBounds === true && clientX > left && clientX < right && clientY > top && clientY < bottom) {
                        outOfBounds = false;
                        list.style.display = "none";
                    }
                    list.style.top = `${(clientY - header) / 10}em`;
                    list.style.left = `${clientX / 10}em`;
                    return false;
                };
            let outOfBounds:boolean = false,
                init:boolean = false;
            event.stopPropagation();
            document.onmousedown = mouseDown;
            if (element.lowName() === "button") {
                return;
            }
            list.style.display = "none";
            list.style.zIndex = (browser.data.zIndex + 1).toString();
            if (touch === true) {
                document.ontouchmove  = move;
                document.ontouchstart = null;
                document.ontouchend   = drop;
            } else {
                document.onmousemove = move;
                document.onmousedown = null;
                document.onmouseup   = drop;
            }
        },

        /* Send instructions to execute a file */
        execute: function browser_content_fileBrowser_execute(event:KeyboardEvent|MouseEvent):void {
            const element:HTMLElement = event.target,
                li:HTMLElement = (element.lowName() === "li")
                    ? element
                    : element.getAncestor("li", "tag"),
                path:string = (li.getAttribute("class") === "link-file")
                    ? li.dataset.path.replace(/&amp;/g, "&")
                    : li.getElementsByTagName("label")[0].firstChild.textContent.replace(/&amp;/g, "&"),
                box:modal = li.getAncestor("box", "class"),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                payload:service_fileSystem = {
                    action: "fs-execute",
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 1,
                    location: [path],
                    name: ""
                };
            util.selectNone(box);
            network.send(payload, "file-system");
            file_browser.events.select(event);
        },
    
        /* Shows child elements of a directory */
        expand: function browser_content_fileBrowser_expand(event:MouseEvent):void {
            const button:HTMLElement = event.target,
                box:modal = button.getAncestor("box", "class"),
                li:HTMLElement = button.parentNode;
            button.focus();
            if (button.firstChild.textContent.indexOf("+") === 0) {
                const agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                    payload:service_fileSystem = {
                        action: "fs-directory",
                        agentRequest: agents[0],
                        agentSource: agents[1],
                        agentWrite: null,
                        depth: 2,
                        location: [li.firstChild.nextSibling.firstChild.textContent],
                        name : "expand"
                    },
                    span:HTMLElement = document.createElement("span");
                span.appendText("Collapse this folder");
                button.appendText("-", true);
                button.appendChild(span);
                button.setAttribute("title", "Collapse this folder");
                network.send(payload, "file-system");
            } else {
                const ul:HTMLCollectionOf<HTMLUListElement> = li.getElementsByTagName("ul"),
                    span:HTMLElement = document.createElement("span");
                span.appendText("Expand this folder");
                button.appendText("+", true);
                button.appendChild(span);
                button.setAttribute("title", "Collapse this folder");
                if (ul.length > 0) {
                    li.removeChild(li.getElementsByTagName("ul")[0]);
                }
            }
        },
    
        /* Allows file execution via keyboard.  This is an accessibility improvement for keyboard users while mouse users have double click. */
        keyExecute: function browser_content_fileBrowser_keyExecute(event:KeyboardEvent):void {
            const target:HTMLElement = event.target,
                element:HTMLElement = (target.lowName() === "li")
                    ? target
                    : target.getAncestor("li", "tag");
            if (event.key.toLowerCase() === "enter" && element.getElementsByTagName("p")[0].getAttribute("class") === "selected") {
                file_browser.events.execute(event);
            }
        },

        /* When clicking on a file list give focus to an input field so that the list can receive focus */
        listFocus: function browser_content_fileBrowser_listFocus(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                listItems:HTMLCollectionOf<HTMLElement> = element.getElementsByTagName("li"),
                inputs:HTMLCollectionOf<HTMLElement> = (listItems.length > 0)
                    ? listItems[listItems.length - 1].getElementsByTagName("input")
                    : null,
                lastInput:HTMLElement = (inputs === null)
                    ? null
                    : inputs[inputs.length - 1];
            if (lastInput !== null) {
                lastInput.focus();
            }
        },

        /* Request file system information of the parent directory */
        parent: function browser_content_fileBrowser_parent(event:MouseEvent):boolean {
            const element:HTMLElement = event.target as HTMLInputElement,
                header:HTMLElement = element.parentNode,
                input:HTMLInputElement = header.getElementsByTagName("input")[0],
                slash:string = (input.value.indexOf("/") > -1 && (input.value.indexOf("\\") < 0 || input.value.indexOf("\\") > input.value.indexOf("/")))
                    ? "/"
                    : "\\",
                value:string = input.value,
                bodyParent:HTMLElement = element.parentNode.parentNode,
                box:modal = bodyParent.parentNode,
                id:string = box.getAttribute("id"),
                newAddress:string = (function browser_content_fileBrowser_parent_newAddress():string {
                    if ((/^\w:\\$/).test(value) === true) {
                        return "\\";
                    }
                    if (value.indexOf(slash) === value.lastIndexOf(slash)) {
                        return value.slice(0, value.lastIndexOf(slash) + 1);
                    }
                    return value.slice(0, value.lastIndexOf(slash));
                }()),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null, newAddress),
                payload:service_fileSystem = {
                    action: "fs-directory",
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 2,
                    location: [newAddress],
                    name: ""
                };
            if (value === "\\" || value === "/") {
                return false;
            }
            file_browser.tools.modalAddress(event, {
                address: newAddress,
                history: true,
                id: id,
                payload: payload
            });
        },
    
        /* The front-side of renaming a file system object */
        rename: function browser_content_fileBrowser_rename(event:KeyboardEvent|MouseEvent):void {
            const element:HTMLElement = (context.element === null)
                    ? event.target
                    : context.element,
                box:modal = element.getAncestor("box", "class"),
                input:HTMLInputElement = document.createElement("input"),
                li:HTMLElement = element.getAncestor("li", "tag"),
                menu:HTMLElement = document.getElementById("contextMenu"),
                actionComplete = function browser_content_fileBrowser_rename_actionComplete(field:HTMLInputElement, labelValue:string):void {
                    const liParent:HTMLElement = field.getAncestor("li", "tag");
                    liParent.onkeydown = file_browser.events.keyExecute;
                    field.onblur = null;
                    field.onkeyup = null;
                    label.removeChild(field);
                    label.appendText(labelValue);
                },
                action = function browser_content_fileBrowser_rename_action(action:KeyboardEvent):void {
                    const field:HTMLInputElement = action.target as HTMLInputElement;
                    if (action.type === "keyup" && action.key === "Escape") {
                        actionComplete(field, text);
                        return;
                    }
                    if (action.type === "blur" || (action.type === "keyup" && action.key === "Enter")) {
                        field.value = field.value.replace(/(\s+|\.)$/, "");
                        if (dir + field.value === text) {
                            label.appendText(text);
                        } else {
                            const agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                                payload:service_fileSystem = {
                                    action: "fs-rename",
                                    agentRequest: agents[0],
                                    agentSource: agents[1],
                                    agentWrite: null,
                                    depth: 1,
                                    location: [text.replace(/\\/g, "\\\\")],
                                    name: field.value
                                };
                            actionComplete(field, label.innerHTML + field.value);
                            network.send(payload, "file-system");
                        }
                    } else if (action.type === "keyup") {
                        field.value = field.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
                    }
                };
            let label:HTMLElement,
                slash:"/" | "\\" = "/",
                last:string,
                text:string,
                dirs:string[],
                dir:string;
            if (document.getElementById("fsRename") !== null) {
                return;
            }
            label = li.getElementsByTagName("label")[0];
            text = label.innerHTML;
            if (text.indexOf("/") < 0 || (text.indexOf("\\") < text.indexOf("/") && text.indexOf("\\") > -1 && text.indexOf("/") > -1)) {
                slash = "\\";
            }
            li.onkeydown = null;
            dirs = text.split(slash);
            last = dirs.pop();
            input.setAttribute("id", "fsRename");
            input.type = "text";
            input.value = last;
            input.onblur = action as (event:Event) => void;
            input.onkeyup = action;
            dir = dirs.join(slash) + slash;
            label.appendText(dir);
            label.appendChild(input);
            input.focus();
            context.element = null;
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },
    
        /* A service to write file changes to the file system */
        saveFile: function browser_content_fileBrowser_saveFile(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                box:modal = element.getAncestor("box", "class"),
                content:string = box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].value,
                title:HTMLElement = box.getElementsByTagName("h2")[0].getElementsByTagName("button")[0],
                location:string[] = title.innerHTML.split(" - "),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null, ""),
                payload:service_fileSystem = {
                    action: "fs-write",
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 1,
                    location: [location[location.length - 1]],
                    name: content
                };
            network.send(payload, "file-system");
        },
    
        /* Search for file system artifacts from a modal's current location */
        search: function browser_content_fileBrowser_search(event?:FocusEvent|KeyboardEvent|MouseEvent, searchElement?:HTMLInputElement):void {
            const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                element:HTMLInputElement = (searchElement === undefined)
                    ? event.target as HTMLInputElement
                    : searchElement,
                value:string = element.value,
                box:modal = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                addressLabel:HTMLElement = element.parentNode.previousSibling as HTMLElement,
                addressElement:HTMLInputElement = addressLabel.getElementsByTagName("input")[0],
                address:string = addressElement.value;
            if (event !== null && event.type === "blur") {
                const searchParent:HTMLElement = element.parentNode;
                searchParent.style.width = "12.5%";
                addressLabel.style.width = "87.5%";
                browser.data.modals[id].search = [address, value];
                network.configuration();
            }
            if (event === null || (event.type === "keyup" && keyboardEvent.key === "Enter")) {
                const body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                    agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                    payload:service_fileSystem = {
                        action: "fs-search",
                        agentRequest: agents[0],
                        agentSource: agents[1],
                        agentWrite: null,
                        depth: 0,
                        location: [address],
                        name: value
                    };
                body.appendText("", true);
                body.append(util.delay());
                if (element.value.replace(/\s+/, "") === "") {
                    file_browser.events.text(event);
                    element.focus();
                    browser.data.modals[id].search = [address, ""];
                    network.configuration();
                    return;
                }
                if (browser.loading === false) {
                    browser.data.modals[id].search = [address, value];
                    browser.data.modals[id].selection = {};
                    network.configuration();
                }
                network.send(payload, "file-system");
            }
        },
    
        /* Expand the search field to a large size when focused */
        searchFocus: function browser_content_fileBrowser_searchFocus(event:FocusEvent):void {
            const search:HTMLElement = event.target,
                searchParent:HTMLElement = search.parentNode,
                address:HTMLElement = searchParent.previousSibling as HTMLElement;
            search.focus();
            searchParent.style.width = "60%";
            address.style.width = "40%";
        },
    
        /* Select a file system item for an action */
        select: function browser_content_fileBrowser_select(event:KeyboardEvent|MouseEvent):void {
            event.preventDefault();
            global_events.contextMenuRemove();
            const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                element:HTMLElement = (function browser_content_fileBrowser_select_element():HTMLElement {
                    const el:HTMLElement = event.target;
                    if (el.lowName() === "li") {
                        return el;
                    }
                    return el.getAncestor("li", "tag");
                }()),
                setClasses = function browser_content_fileBrowser_select_setClasses(el:HTMLElement, className:string, selectState:boolean):void {
                    const parent:HTMLElement = el.parentNode;
                    if (selectState === true) {
                        if (className !== null && className.indexOf("cut") > -1) {
                            el.setAttribute("class", "cut");
                        } else {
                            el.removeAttribute("class");
                        }
                        parent.getElementsByTagName("input")[0].checked = false;
                        delete modalData.selection[el.getElementsByTagName("label")[0].innerHTML];
                    } else {
                        if (className !== null && className.indexOf("cut") > -1) {
                            el.setAttribute("class", "selected cut");
                        } else {
                            el.setAttribute("class", "selected");
                        }
                        parent.getElementsByTagName("input")[0].checked = true;
                        modalData.selection[el.getElementsByTagName("label")[0].innerHTML] = "selected";
                    }
                },
                p:HTMLElement = element.getElementsByTagName("p")[0],
                classy:string = p.getAttribute("class"),
                parent:HTMLElement = p.parentNode,
                input:HTMLInputElement = parent.getElementsByTagName("input")[0];
            let state:boolean = input.checked,
                body:HTMLElement = p,
                box:modal,
                modalData:config_modal;
            if (document.getElementById("newFileItem") === null) {
                if (file_browser.dragFlag !== "") {
                    event.preventDefault();
                    event.stopPropagation();
                }
                input.focus();
                modal.events.zTop(keyboardEvent);
                body = body.getAncestor("body", "class");
                box = body.parentNode.parentNode;
                modalData = browser.data.modals[box.getAttribute("id")];

                if (document.getElementById("dragBox") !== null) {
                    return;
                }

                if (keyboardEvent.ctrlKey === true || file_browser.dragFlag === "control") {
                    setClasses(p, classy, state);
                } else if (keyboardEvent.shiftKey === true || file_browser.dragFlag === "shift") {
                    const liList:HTMLCollectionOf<HTMLElement> = body.getElementsByTagName("p"),
                        shift = function browser_content_fileBrowser_select_shift(index:number, end:number):void {
                            let liClassy:string;
                            if (state === true) {
                                do {
                                    liClassy = liList[index].getAttribute("class");
                                    setClasses(liList[index], liClassy, state);
                                    index = index + 1;
                                } while (index < end);
                            } else {
                                do {
                                    liClassy = liList[index].getAttribute("class");
                                    setClasses(liList[index], liClassy, state);
                                    index = index + 1;
                                } while (index < end);
                            }
                        };
                    let a:number = 0,
                        focus:HTMLElement = browser.data.modals[box.getAttribute("id")].focus as HTMLElement,
                        elementIndex:number = -1,
                        focusIndex:number = -1,
                        listLength:number = liList.length;
                    if (focus === null || focus === undefined) {
                        browser.data.modals[box.getAttribute("id")].focus = liList[0];
                        focus = liList[0];
                    }
                    do {
                        if (liList[a] === p) {
                            elementIndex = a;
                            if (focusIndex > -1) {
                                break;
                            }
                        } else if (liList[a] === focus) {
                            focusIndex = a;
                            if (elementIndex > -1) {
                                break;
                            }
                        }
                        a = a + 1;
                    } while (a < listLength);
                    if (focusIndex === elementIndex) {
                        setClasses(p, classy, state);
                        if (state === true) {
                            input.checked = false;
                        } else {
                            input.checked = true;
                        }
                    } else if (focusIndex > elementIndex) {
                        shift(elementIndex, focusIndex);
                    } else {
                        shift(focusIndex + 1, elementIndex + 1);
                    }
                } else {
                    const inputs:HTMLCollectionOf<HTMLInputElement> = body.getElementsByTagName("input"),
                        inputsLength = inputs.length,
                        selected:boolean = (p.getAttribute("class") !== null && p.getAttribute("class").indexOf("selected") > -1);
                    let a:number = 0,
                        item:HTMLElement,
                        itemClass:string,
                        itemParent:HTMLElement;
                    do {
                        if (inputs[a].checked === true) {
                            itemParent = inputs[a].parentNode.parentNode;
                            item = itemParent.getElementsByTagName("p")[0];
                            itemClass = item.getAttribute("class");
                            setClasses(item, itemClass, true);
                        }
                        a = a + 1;
                    } while (a < inputsLength);
                    input.checked = true;
                    if (selected === false) {
                        setClasses(p, classy, false);
                        modalData.selection = {};
                    }
                }
                modalData.focus = p;
                network.configuration();
            }
        },
    
        /* Requests file system data from a text field, such as manually typing an address */
        text: function browser_content_fileBrowser_text(event:FocusEvent|KeyboardEvent|MouseEvent):boolean {
            let box:modal,
                history:boolean = true;
            const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                element:HTMLInputElement = (function browser_content_fileBrowser_text_element():HTMLInputElement {
                    const el:HTMLInputElement = event.target as HTMLInputElement,
                        parent:HTMLElement = el.parentNode,
                        name:string = el.lowName();
                    box = el.getAncestor("box", "class");
                    if (name !== "input" || (name === "input" && parent.getAttribute("class") !== "fileAddress")) {
                        history = false;
                    }
                    return box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0];
                }()),
                value:string = element.value,
                address:string = ((/^\w:\\?$/).test(value) === true)
                    ? (value.charAt(2) === "\\")
                        ? value.toUpperCase()
                        : `${value.toUpperCase()}\\`
                    : value;
            if (address.replace(/\s+/, "") !== "" && (history === false || (event.type === "keyup" && keyboardEvent.key === "Enter"))) {
                const id:string = box.getAttribute("id"),
                    agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null, address),
                    payload:service_fileSystem = {
                        action: "fs-directory",
                        agentRequest: agents[0],
                        agentSource: agents[1],
                        agentWrite: null,
                        depth: 2,
                        location: [address],
                        name: ""
                    };
                file_browser.tools.modalAddress(event, {
                    address: address,
                    id: id,
                    history: history,
                    payload: payload
                });
            }
            return false;
        }
    },

    /* Stores whether Control or Shift keys were pressed when drag initiated */
    dragFlag: "",

    tools: {
    
        /* Display status information when the Operating system locks files from access */
        listFail: function browser_content_fileBrowser_listFail(count:number, box:modal):void {
            const statusBar:HTMLElement = box.getElementsByClassName("status-bar")[0] as HTMLElement,
                p:HTMLElement = statusBar.getElementsByTagName("p")[0],
                ul:HTMLElement = statusBar.getElementsByTagName("ul")[0],
                filePlural:string = (count === 1)
                    ? ""
                    : "s";
            if (ul !== undefined) {
                statusBar.removeChild(ul);
            }
            if (count < 1) {
                p.appendText("", true);
            } else {
                p.appendText(`${count} file${filePlural} in this query are restricted from reading by the operating system.`, true);
            }
        },
    
        /* Build a single file system object from data */
        listItem: function browser_content_fileBrowser_listItem(item:directory_item, extraClass:string):HTMLElement {
            const li:HTMLElement = document.createElement("li"),
                label:HTMLLabelElement = document.createElement("label"),
                p:HTMLElement = document.createElement("p"),
                text:HTMLElement = document.createElement("label"),
                input:HTMLInputElement = document.createElement("input"),
                className:string = (item[1] === "link")
                    ? (item[5].linkType === "directory")
                        ? "link-directory"
                        : "link-file"
                    : item[1],
                mouseOver = function browser_content_fileBrowser_listItem_mouseOver(event:MouseEvent):void {
                    const dragBox:HTMLElement = document.getElementById("dragBox"),
                        element:HTMLElement = event.target;
                    if (dragBox !== null) {
                        if (event.ctrlKey === true) {
                            element.click();
                        }
                    }
                };
            let span:HTMLElement,
                plural:string;
    
            // preparation of descriptive text and assistive features
            if (item[1] === "file") {
                span = document.createElement("span");
                if (item[5].size === 1) {
                    plural = "";
                } else {
                    plural = "s";
                }
                span.textContent = `file - ${common.commas(item[5].size)} byte${plural}`;
                li.ondblclick = file_browser.events.execute;
                li.onkeydown = file_browser.events.keyExecute;
            } else if (item[1] === "directory") {
                if (item[4] > 0) {
                    const button:HTMLElement = document.createElement("button"),
                        span:HTMLElement = document.createElement("span");
                    button.setAttribute("class", "expansion");
                    span.appendText("Expand this folder");
                    button.appendText("+", true);
                    button.appendChild(span);
                    button.setAttribute("title", "Expand this folder");
                    button.setAttribute("type", "button");
                    button.onclick = file_browser.events.expand;
                    li.appendChild(button);
                }
                span = document.createElement("span");
                if (item[3] === 1) {
                    plural = "";
                } else {
                    plural = "s";
                }
                span.textContent = `directory - ${common.commas(item[4])} item${plural}`;
                li.ondblclick = file_browser.events.directory;
            } else {
                span = document.createElement("span");
                if (className === "link-directory") {
                    li.ondblclick = file_browser.events.directory;
                } else {
                    li.ondblclick = file_browser.events.execute;
                    li.onkeydown = file_browser.events.keyExecute;
                }
                li.setAttribute("data-path", item[5].linkPath);
                if (item[1] === "link") {
                    span.textContent = "symbolic link";
                } else {
                    span.textContent = item[1];
                }
            }
    
            // prepare the primary item text (address)
            text.appendText(item[0]);
            p.appendChild(text);
    
            // prepare the descriptive text
            p.oncontextmenu = context.events.menu;
            p.onclick = file_browser.events.select;
            p.onkeydown = util.keys; // key combinations
            p.appendChild(span);
            li.appendChild(p);
    
            // prepare the checkbox that provides accessibility and click functionality
            input.type = "checkbox";
            input.checked = false;
            label.appendText("Selected");
            label.appendChild(input);
            label.setAttribute("class", "selection");
            li.appendChild(label);
    
            // prepare the parent container
            if (extraClass.replace(/\s+/, "") !== "") {
                li.setAttribute("class", `${className} ${extraClass}`);
            } else {
                li.setAttribute("class", className);
            }
            li.onmousedown = file_browser.events.drag;
            li.onmouseover = mouseOver;
            li.ontouchstart = file_browser.events.drag;
            return li;
        },

        /* Updates the address of a file-navigate modal in both UI and state */
        modalAddress: function browser_content_fileBrowser_modalAddress(event:FocusEvent|KeyboardEvent|MouseEvent, config:config_modal_history):void {
            const modalData:config_modal = browser.data.modals[config.id],
                modalItem:HTMLElement = document.getElementById(config.id),
                lastHistory:string = modalData.history[modalData.history.length - 1],
                windows:boolean = ((/^\w:/).test(config.address.replace(/\s+/, "")) || config.address === "\\");

            // if at root use the proper directory slash
            if (config.address === "**root**") {
                const fileList:HTMLElement = modalItem.getElementsByClassName("fileList")[0] as HTMLElement,
                    listItem:HTMLElement = (fileList === undefined)
                        ? undefined
                        : fileList.getElementsByTagName("li")[0];
                if (listItem === undefined || listItem.getAttribute("class") === "empty-list") {
                    config.address = "/";
                } else {
                    const file:string = listItem.getElementsByTagName("p")[0].getElementsByTagName("label")[0].innerHTML;
                    if (file.charAt(0) === "/") {
                        config.address = "/";
                    } else {
                        config.address = "\\";
                    }
                }
                if (config.payload !== null) {
                    config.payload.agentSource.modalAddress = config.address;
                    if (config.payload.action === "fs-directory" && config.payload.name !== "expand" && config.payload.location[0] === "**root**") {
                        config.payload.location[0] = config.address;
                    }
                }
            }

            // change the value in the modal settings
            modalData.text_value = config.address;
            if (event === null || event.target.getAttribute("class") !== "reloadDirectory") {
                modalData.search[0] = "";
            }

            // change the value in modal history
            if (config.history === true && ((config.address !== lastHistory && windows === false) || (config.address.toLowerCase() !== lastHistory.toLowerCase() && windows === true))) {
                modalData.history.push(config.address);
            }

            // request new file system data for the new address
            if (config.payload !== null) {
                network.send(config.payload, "file-system");

                // save state
                network.configuration();
            }

            // change the value in the html
            modalItem.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value = config.address;
        }
    }

};

export default file_browser;