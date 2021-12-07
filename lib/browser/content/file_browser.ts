
/* lib/browser/content/file_browser - A collection of utilities for handling file system related tasks in the browser. */
import browser from "../browser.js";
import common from "../../common/common.js";
import context from "./context.js";
import global_events from "./global_events.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

/**
 * Generates the user experience associated with file system interaction.
 * * **content.details** - Generates the contents of a details type modal.
 * * **content.list** - Generates the contents of a file system list for population into a file navigate modal.
 * * **dragFlag** - Allows the drag handler to identify whether the shift or control/command keys are pressed while selecting items from the file list.
 * * **events.back** - Handler for the back button, which steps back to the prior file system location of the given agent stored in the modal's navigation history.
 * * **events.directory** - Handler for navigation into a directory by means of double click.
 * * **events.drag** - Move file system artifacts from one location to another by means of double click.
 * * **events.execute** - Allows operating system execution of a file by double click interaction.
 * * **events.expand** - Opens a directory into a child list without changing the location of the current modal.
 * * **events.keyExecute** - Allows file execution by keyboard control, such as pressing the *Enter* key.
 * * **events.lisFocus** - When clicking on a file list give focus to an input field in that list so that the list can receive focus.
 * * **events.parent** - Handler to navigate into the parent directory by click the parent navigate button.
 * * **events.rename** - Converts a file system item text into a text input field so that the artifact can be renamed.
 * * **events.saveFile** - A handler for an interaction that allows writing file changes to the file system.
 * * **events.search** - Sends a search query in order to receive a filtered list of file system artifacts.
 * * **events.searchFocus** - Provides an interaction that enlarges and reduces the width of the search field.
 * * **events.select** - Select a file system item for interaction by click.
 * * **events.text** - Allows changing file system location by changing the text address of the current location.
 * * **tools.listFail** - Display status information when the Operating system locks files from access.
 * * **tools.listItem** - Generates the HTML content for a single file system artifacts that populates a file system list.
 * * **tools.modalAddress** - Updates the file system address of the current file navigate modal in response to navigating to different locations.
 *
 * ```typescript
 * interface module_fileBrowser {
 *     content: {
 *         details: (response:string) => void;
 *         list: (location:string, dirs:directoryResponse, message:string) => Element;
 *     };
 *     dragFlag: dragFlag;
 *     events: {
 *         back: (event:Event) => void;
 *         directory: (event:Event) => void;
 *         drag: (event:MouseEvent|TouchEvent) => void;
 *         execute: (event:Event) => void;
 *         expand: (event:Event) => void;
 *         keyExecute: (event:KeyboardEvent) => void;
 *         listFocus: (event:Event) => void;
 *         parent: (event:Event) => void;
 *         rename: (event:Event) => void;
 *         saveFile: (event:Event) => void;
 *         search: (event?:Event, searchElement?:HTMLInputElement, callback?:eventCallback) => void;
 *         searchFocus: (event:Event) => void;
 *         select: (event:Event) => void;
 *         text: (event:Event) => void;
 *     };
 *     tools: {
 *         listFail: (count:number, box: Element) => void;
 *         listItem: (item:directoryItem, extraClass:string) => Element;
 *         modalAddress: (config:modalHistoryConfig) => void;
 *     };
 * }
 * type eventCallback = (event:Event, callback:(event:MouseEvent, dragBox:Element) => void) => void;
 * type dragFlag = "" | "control" | "shift";
 * ``` */
const file_browser:module_fileBrowser = {
    
    content: {

        /* generates the content for a file system details modal */
        details: function browser_content_fileBrowser_details(response:string):void {
            const payload:service_fileSystemDetails = JSON.parse(util.sanitizeHTML(response)).data,
                list:directoryList = (payload.dirs === "missing" || payload.dirs === "noShare" || payload.dirs === "readOnly")
                    ? []
                    : payload.dirs,
                fileList:directoryList = [],
                body:Element = document.getElementById(payload.id).getElementsByClassName("body")[0],
                length:number = list.length,
                details:fsDetailCounts = {
                    size: 0,
                    files: 0,
                    directories: 0,
                    links: 0
                },
                output:Element = document.createElement("div");
            let a:number = 0,
                tr:Element,
                td:HTMLElement,
                heading:Element = document.createElement("h3"),
                table:HTMLElement = document.createElement("table"),
                tbody:Element = document.createElement("tbody"),
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
            heading.innerHTML = `File System Details - ${common.commas(list.length)} items`;
            output.appendChild(heading);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Location";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = payload.dirs[0][0];
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Total Size";
            tr.appendChild(td);
            td = document.createElement("td");
            if (details.size > 1024n) {
                td.innerHTML = `${common.commas(details.size)} bytes (${common.prettyBytes(details.size)})`;
            } else {
                td.innerHTML = `${common.commas(details.size)} bytes`;
            }
            tr.appendChild(td);
            tbody.appendChild(tr);
            table.appendChild(tbody);
            output.appendChild(table);
    
            heading = document.createElement("h3");
            heading.innerHTML = "Contains";
            output.appendChild(heading);
            td = document.createElement("p");
            td.innerHTML = "Does not count read protected assets.";
            output.appendChild(td);
            table = document.createElement("table");
            tbody = document.createElement("tbody");
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Files";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = common.commas(details.files);
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Directories";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = common.commas(details.directories);
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Symbolic Links";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = common.commas(details.links);
            tr.appendChild(td);
            tbody.appendChild(tr);
            table.appendChild(tbody);
            output.appendChild(table);
    
            mTime = new Date(Number(list[0][5].mtimeMs));
            aTime = new Date(Number(list[0][5].atimeMs));
            cTime = new Date(Number(list[0][5].ctimeMs));
            heading = document.createElement("h3");
            heading.innerHTML = "MAC";
            output.appendChild(heading);
            table = document.createElement("table");
            tbody = document.createElement("tbody");
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Modified";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = common.dateFormat(mTime);
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Accessed";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = common.dateFormat(aTime);
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Created";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = common.dateFormat(cTime);
            tr.appendChild(td);
            tbody.appendChild(tr);
            table.appendChild(tbody);
            output.appendChild(table);
    
            if (list[0][1] === "directory" && details.files > 0) {
                let button:HTMLElement = document.createElement("button");
                td = document.createElement("p");
                heading = document.createElement("h3");
                heading.innerHTML = "List files";
                output.appendChild(heading);
    
                // largest files
                button.innerHTML = "List 100 largest files";
                button.onclick = function browser_content_fileBrowser_details_largest(event:MouseEvent):void {
                    fileList.sort(function browser_content_fileBrowser_details_largest_sort(aa:directoryItem, bb:directoryItem):number {
                        if (aa[5].size > bb[5].size) {
                            return -1;
                        }
                        return 1;
                    });
                    const element:Element = event.target as Element,
                        grandParent:Element = element.parentNode.parentNode as Element,
                        table:HTMLElement = grandParent.getElementsByClassName("detailFileList")[0] as HTMLElement,
                        p:HTMLElement = table.previousSibling as HTMLElement,
                        tableBody:HTMLElement = table.getElementsByTagName("tbody")[0],
                        dataLength:number = Math.min(fileList.length, 100);
                    let aa:number = 0,
                        row:HTMLElement,
                        cell:HTMLElement;
                    p.innerHTML = `${dataLength} largest files`;
                    tbody.innerHTML = "";
                    do {
                        row = document.createElement("tr");
                        cell = document.createElement("th");
                        cell.setAttribute("class", "file");
                        cell.innerHTML = fileList[aa][0];
                        row.appendChild(cell);
                        cell = document.createElement("td");
                        cell.innerHTML = common.commas(fileList[aa][5].size);
                        row.appendChild(cell);
                        cell = document.createElement("td");
                        cell.innerHTML = common.prettyBytes(fileList[aa][5].size);
                        row.appendChild(cell);
                        tableBody.appendChild(row);
                        aa = aa + 1;
                    } while (aa < dataLength);
                    table.style.display = "block";
                    p.style.display = "block";
                };
                td.appendChild(button);
                output.appendChild(td);
    
                // most recent files
                td = document.createElement("p"),
                button = document.createElement("button");
                button.innerHTML = "List 100 most recently changed files";
                button.onclick = function browser_content_fileBrowser_details_recent(event:MouseEvent):void {
                    fileList.sort(function browser_content_fileBrowser_details_recent_sort(aa:directoryItem, bb:directoryItem):number {
                        if (aa[5].mtimeMs > bb[5].mtimeMs) {
                            return -1;
                        }
                        return 1;
                    });
                    const element:Element = event.target as Element,
                        grandParent:Element = element.parentNode.parentNode as Element,
                        table:HTMLElement = grandParent.getElementsByClassName("detailFileList")[0] as HTMLElement,
                        p:HTMLElement = table.previousSibling as HTMLElement,
                        tableBody:HTMLElement = table.getElementsByTagName("tbody")[0],
                        dataLength:number = Math.min(fileList.length, 100);
                    let aa:number = 0,
                        row:HTMLElement,
                        cell:HTMLElement;
                    p.innerHTML = `${dataLength} most recently changed files`;
                    tbody.innerHTML = "";
                    do {
                        row = document.createElement("tr");
                        cell = document.createElement("th");
                        cell.setAttribute("class", "file");
                        cell.innerHTML = fileList[aa][0];
                        row.appendChild(cell);
                        cell = document.createElement("td");
                        cell.innerHTML = common.dateFormat(new Date(Number(fileList[aa][5].mtimeMs)));
                        row.appendChild(cell);
                        tableBody.appendChild(row);
                        aa = aa + 1;
                    } while (aa < dataLength);
                    table.style.display = "block";
                    p.style.display = "block";
                };
                td.appendChild(button);
                output.appendChild(td);
    
                // all files
                td = document.createElement("p");
                button = document.createElement("button");
                button.innerHTML = "List all files alphabetically";
                button.onclick = function browser_content_fileBrowser_details_allFiles(event:MouseEvent):void {
                    fileList.sort(function browser_content_fileBrowser_details_allFiles_sort(aa:directoryItem, bb:directoryItem):number {
                        if (aa[0] < bb[0]) {
                            return -1;
                        }
                        return 1;
                    });
                    const element:Element = event.target as Element,
                        grandParent:Element = element.parentNode.parentNode as Element,
                        table:HTMLElement = grandParent.getElementsByClassName("detailFileList")[0] as HTMLElement,
                        p:HTMLElement = table.previousSibling as HTMLElement,
                        tableBody:HTMLElement = table.getElementsByTagName("tbody")[0],
                        dataLength:number = fileList.length;
                    let aa:number = 0,
                        row:HTMLElement,
                        cell:HTMLElement;
                    p.innerHTML = `All ${common.commas(dataLength)} files sorted alphabetically`;
                    tbody.innerHTML = "";
                    do {
                        row = document.createElement("tr");
                        cell = document.createElement("th");
                        cell.setAttribute("class", "file");
                        cell.innerHTML = fileList[aa][0];
                        row.appendChild(cell);
                        tableBody.appendChild(row);
                        aa = aa + 1;
                    } while (aa < dataLength);
                    table.style.display = "block";
                    p.style.display = "block";
                };
                td.appendChild(button);
                output.appendChild(td);
    
                // subject paragraph
                td = document.createElement("p");
                td.style.display = "none";
                output.appendChild(td);
    
                // table
                table = document.createElement("table");
                tbody = document.createElement("tbody");
                table.appendChild(tbody);
                table.style.display = "none";
                table.setAttribute("class", "detailFileList");
                output.appendChild(table);
            }
    
            body.innerHTML = "";
            body.appendChild(output);
        },

        /* Builds the HTML file list */
        list: function browser_content_fileBrowser_list(location:string, dirs:directoryResponse, message:string):Element {
            const local:directoryList = [],
                listLength:number = dirs.length,
                output:HTMLElement = document.createElement("ul");
            let a:number = 0,
                localLength:number = 0;
            if (dirs === "missing" || dirs === "noShare" || dirs === "readOnly") {
                const p:Element = document.createElement("p");
                p.setAttribute("class", "error");
                if (dirs === "missing") {
                    if (message === "") {
                        p.innerHTML = "Error 404: Requested location is not available or machine is offline.";
                    } else {
                        p.innerHTML = `Error 404: ${message}`;
                    }
                } else if (dirs === "noShare") {
                    if (message === "") {
                        p.innerHTML = "Error 403: Forbidden. Requested location is likely not shared.";
                    } else {
                        p.innerHTML = `Error 403: ${message}`;
                    }
                } else {
                    if (message === "") {
                        p.innerHTML = "Error 406: Not accepted. Read only shares cannot be modified.";
                    } else {
                        p.innerHTML = `Error 406: ${message}`;
                    }
                }
                return p;
            }

            if (listLength === 1 && dirs[0][1] === "file") {
                const div:Element = document.createElement("div");
                let p:HTMLElement = document.createElement("p");
                p.innerHTML = `Specified location <em>${dirs[0][0]}</em> is a <strong>file</strong>.`;
                div.appendChild(p);
                p = document.createElement("p");
                p.innerHTML = "To execute the file either double click it from the file list or select it from the file list and press the 'Enter' key.  To see file system details about the file right click on the file from the file list and choose 'Details'.";
                div.appendChild(p);
                return div;
            }

            if (listLength > 0) {
                do {
                    if (dirs[a][3] === 0) {
                        local.push(dirs[a]);
                    }
                    a = a + 1;
                } while (a < listLength);
            }

            local.sort(function browser_content_fileBrowser_list_sort(a:directoryItem, b:directoryItem):number {
                // when types are the same
                if (a[1] === b[1]) {
                    if (a[0].toLowerCase() < b[0].toLowerCase()) {
                        return -1;
                    }
                    return 1;
                }

                // when types are different
                if (a[1] === "directory") {
                    return -1;
                }
                if (a[1] === "link" && b[1] === "file") {
                    return -1;
                }
                return 1;
            });
            if (location === "\\" || location === "/") {
                a = 0;
            } else {
                a = 1;
            }
            localLength = local.length;
            if (localLength > 1) {
                do {
                    if (local[a][0] !== "\\" && local[a][0] !== "/") {
                        if (a < localLength - 1 && local[a + 1][1] !== local[a][1]) {
                            output.appendChild(file_browser.tools.listItem(local[a], "lastType"));
                        } else {
                            output.appendChild(file_browser.tools.listItem(local[a], ""));
                        }
                    }
                    a = a + 1;
                } while (a < localLength);
            } else {
                const li:Element = document.createElement("li"),
                    label:Element = document.createElement("label"),
                    input:HTMLInputElement = document.createElement("input"),
                    p:Element = document.createElement("p");
                li.setAttribute("class", "empty-list");
                label.innerHTML = "Empty list";
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
        }
    },

    events: {

        /* step back through a modal's address history */
        back: function browser_content_fileBrowser_back(event:Event):void {
            const element:Element = event.target as Element,
                box:Element = element.getAncestor("box", "class"),
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
        directory: function browser_content_fileBrowser_directory(event:Event):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                li:Element = (util.name(element) === "li")
                    ? element
                    : element.getAncestor("li", "tag") as Element,
                body:Element = li.getAncestor("body", "class"),
                box:Element = body.parentNode.parentNode as Element,
                path:string = (li.getAttribute("class") === "link-directory")
                    ? li.getAttribute("data-path")
                    : li.getElementsByTagName("label")[0].innerHTML,
                agency:agency = util.getAgent(box),
                id:string = box.getAttribute("id"),
                payload:service_fileSystem = {
                    action: "fs-directory",
                    agent: {
                        id: agency[0],
                        modalAddress: path,
                        share: browser.data.modals[id].share,
                        type: agency[2]
                    },
                    depth: 2,
                    location: [path],
                    name: ""
                };
            event.preventDefault();
            file_browser.tools.modalAddress({
                address: path,
                id: id,
                history: true,
                payload: payload
            });
        },
    
        /* drag and drop of selected list items */
        drag: function browser_content_fileBrowser_drag(event:MouseEvent|TouchEvent):void {
            const element:Element = event.target as Element,
                item:Element = (function browser_content_fileBrowser_drag_item():Element {
                    let el:Element = element;
                    const name:string = util.name(el);
                    if (name !== "label" && name !== "span") {
                        event.preventDefault();
                    }
                    if (name === "li") {
                        return el;
                    }
                    return el.getAncestor("li", "tag");
                }()),
                fileList:Element = (function browser_content_fileBrowser_drag_fileList():Element {
                    let parent:Element = element.parentNode as Element;
                    if (util.name(parent.parentNode as Element) !== "div") {
                        do {
                            parent = parent.parentNode as Element;
                        } while (parent !== document.documentElement && util.name(parent.parentNode as Element) !== "div");
                    }
                    return parent;
                }()),
                body:HTMLElement = fileList.parentNode as HTMLElement,
                box:HTMLElement = body.parentNode.parentNode as HTMLElement,
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
                    let id:string = "";
                    const addresses:string[] = (function browser_content_fileBrowser_drag_drop_addresses():string[] {
                            const output:string[] = [],
                                children:HTMLCollectionOf<HTMLElement> = list.getElementsByTagName("li"),
                                len:number = children.length;
                            let a:number = 0;
                            do {
                                output.push(children[a].getElementsByTagName("label")[0].innerHTML);
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
                            const ul:HTMLCollectionOf<Element> = browser.content.getElementsByClassName("fileList"),
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
                                goal:Element,
                                zIndex:number = 0;
                            do {
                                if (ul[a] !== list) {
                                    ulBody = ul[a].parentNode as HTMLElement;
                                    ulBox = ulBody.parentNode.parentNode as HTMLElement;
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
                                            goal = ul[a] as Element;
                                        }
                                    }
                                }
                                a = a + 1;
                            } while (a < length);
                            if (goal === undefined || goal === fileList) {
                                return "";
                            }
                            goal = goal.getAncestor("box", "class");
                            id = goal.getAttribute("id");
                            return goal.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value;
                        }()),
                        agency:agency = util.getAgent(element),
                        payload:service_copy = {
                            agentSource: {
                                id: browser.data.modals[id].agent,
                                share: browser.data.modals[id].share,
                                modalAddress: box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value,
                                type: browser.data.modals[id].agentType
                            },
                            agentWrite : {
                                id: agency[0],
                                share: browser.data.modals[box.getAttribute("id")].share,
                                modalAddress: target,
                                type: agency[2]
                            },
                            cut        : false,
                            execute    : false,
                            location   : addresses
                        };
                    if (target === "") {
                        return;
                    }
                    network.send(payload, "copy", null);
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
                                selected:Element[] = [];
                            let a:number = 0,
                                length:number = checkbox.length,
                                listItem:Element,
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
                                    parent = selected[a].parentNode.parentNode as HTMLElement;
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
            if (util.name(element) === "button") {
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
        execute: function browser_content_fileBrowser_execute(event:Event):void {
            const element:Element = event.target as Element,
                li:Element = (util.name(element) === "li")
                    ? element
                    : element.getAncestor("li", "tag"),
                path:string = (li.getAttribute("class") === "link-file")
                    ? li.getAttribute("data-path").replace(/&amp;/g, "&")
                    : li.getElementsByTagName("label")[0].innerHTML.replace(/&amp;/g, "&"),
                box:Element = li.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                agency:agency = util.getAgent(box),
                payload:service_fileSystem = {
                    action: "fs-execute",
                    agent: {
                        id: agency[0],
                        modalAddress: box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value,
                        share: browser.data.modals[id].share,
                        type: agency[2]
                    },
                    depth: 1,
                    location: [path],
                    name: ""
                };
            util.selectNone(box);
            file_browser.events.select(event);
            network.send(payload, "file-system", null);
        },
    
        /* Shows child elements of a directory */
        expand: function browser_content_fileBrowser_expand(event:Event):void {
            const button:HTMLElement = event.target as HTMLElement,
                box:Element = button.getAncestor("box", "class"),
                addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
                id:string = box.getAttribute("id"),
                li:HTMLElement = button.parentNode as HTMLElement;
            button.focus();
            if (button.innerHTML.indexOf("+") === 0) {
                const agency:agency = util.getAgent(button),
                    payload:service_fileSystem = {
                        action: "fs-directory",
                        agent: {
                            id: agency[0],
                            modalAddress: addressField.value,
                            share: browser.data.modals[id].share,
                            type: agency[2]
                        },
                        depth: 2,
                        location: [li.firstChild.nextSibling.firstChild.textContent],
                        name : "expand"
                    },
                    callback = function browser_content_fileBrowser_expand_callback(responseText:string):void {
                        const status:service_fileStatus = JSON.parse(responseText).data,
                            list:Element = file_browser.content.list(li.getElementsByTagName("label")[0].textContent, status.fileList, status.message);
                        if (list === null) {
                            return;
                        }
                        li.appendChild(list);
                    };
                button.innerHTML = "-<span>Collapse this folder</span>";
                button.setAttribute("title", "Collapse this folder");
                network.send(payload, "file-system", callback);
            } else {
                const ul:HTMLCollectionOf<HTMLUListElement> = li.getElementsByTagName("ul");
                button.innerHTML = "+<span>Expand this folder</span>";
                button.setAttribute("title", "Collapse this folder");
                if (ul.length > 0) {
                    li.removeChild(li.getElementsByTagName("ul")[0]);
                }
            }
        },
    
        /* Allows file execution via keyboard.  This is an accessibility improvement for keyboard users while mouse users have double click. */
        keyExecute: function browser_content_fileBrowser_keyExecute(event:KeyboardEvent):void {
            const target:Element = event.target as Element,
                element:Element = (util.name(target) === "li")
                    ? target
                    : target.getAncestor("li", "tag");
            if (event.key.toLowerCase() === "enter" && element.getElementsByTagName("p")[0].getAttribute("class") === "selected") {
                file_browser.events.execute(event);
            }
        },

        /* When clicking on a file list give focus to an input field so that the list can receive focus */
        listFocus: function browser_content_fileBrowser_listFocus(event:Event):void {
            const element:Element = event.target as Element,
                listItems:HTMLCollectionOf<Element> = element.getElementsByTagName("li"),
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
        parent: function browser_content_fileBrowser_parent(event:Event):boolean {
            const element:Element = event.target as HTMLInputElement,
                header:Element = element.parentNode as Element,
                input:HTMLInputElement = header.getElementsByTagName("input")[0],
                slash:string = (input.value.indexOf("/") > -1 && (input.value.indexOf("\\") < 0 || input.value.indexOf("\\") > input.value.indexOf("/")))
                    ? "/"
                    : "\\",
                value:string = input.value,
                bodyParent:Element = element.parentNode.parentNode as Element,
                box:Element = bodyParent.parentNode as Element,
                agency:agency = util.getAgent(box),
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
                payload:service_fileSystem = {
                    action: "fs-directory",
                    agent: {
                        id: agency[0],
                        modalAddress: newAddress,
                        share: browser.data.modals[id].share,
                        type: agency[2]
                    },
                    depth: 2,
                    location: [newAddress],
                    name: ""
                };
            if (value === "\\" || value === "/") {
                return false;
            }
            file_browser.tools.modalAddress({
                address: newAddress,
                history: true,
                id: id,
                payload: payload
            });
        },
    
        /* The front-side of renaming a file system object */
        rename: function browser_content_fileBrowser_rename(event:Event):void {
            const element:Element = (context.element === null)
                    ? event.target as Element
                    : context.element,
                box:Element = element.getAncestor("box", "class"),
                addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
                id:string = box.getAttribute("id"),
                input:HTMLInputElement = document.createElement("input"),
                li:Element = element.getAncestor("li", "tag"),
                menu:Element = document.getElementById("contextMenu"),
                action = function browser_content_fileBrowser_rename_action(action:KeyboardEvent):void {
                    if (action.type === "blur" || (action.type === "keyup" && action.key === "Enter")) {
                        input.value = input.value.replace(/(\s+|\.)$/, "");
                        if (dir + input.value === text) {
                            label.innerHTML = text;
                        } else {
                            const agency:agency = util.getAgent(element),
                                payload:service_fileSystem = {
                                    action: "fs-rename",
                                    agent: {
                                        id: agency[0],
                                        modalAddress: addressField.value,
                                        share: browser.data.modals[id].share,
                                        type: agency[2]
                                    },
                                    depth: 1,
                                    location: [text.replace(/\\/g, "\\\\")],
                                    name: input.value
                                };
                            input.onblur = null;
                            input.onkeyup = null;
                            label.removeChild(input);
                            label.innerHTML = label.innerHTML + input.value;
                            network.send(payload, "file-system", null);
                        }
                    } else if (action.type === "keyup") {
                        if (action.key === "Enter") {
                            const input:HTMLElement = li.getElementsByTagName("input")[0];
                            label.innerHTML = text;
                            input.focus();
                            return;
                        }
                        input.value = input.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
                    }
                };
            let label:Element,
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
            dirs = text.split(slash);
            last = dirs.pop();
            input.setAttribute("id", "fsRename");
            input.type = "text";
            input.value = last;
            input.onblur = action as (event:Event) => void;
            input.onkeyup = action;
            dir = dirs.join(slash) + slash;
            label.innerHTML = dir;
            label.appendChild(input);
            input.focus();
            context.element = null;
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },
    
        /* A service to write file changes to the file system */
        saveFile: function browser_content_fileBrowser_saveFile(event:Event):void {
            const element:Element = event.target as Element,
                box:Element = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                content:string = box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].value,
                agency:agency = util.getAgent(box),
                title:Element = box.getElementsByTagName("h2")[0].getElementsByTagName("button")[0],
                location:string[] = title.innerHTML.split(" - "),
                payload:service_fileSystem = {
                    action: "fs-write",
                    agent: {
                        id: agency[0],
                        modalAddress: "",
                        share: browser.data.modals[id].share,
                        type: agency[2]
                    },
                    depth: 1,
                    location: [location[location.length - 1]],
                    name: content
                },
                callback = function browser_content_fileBrowser_saveFile_callback(message:string):void {
                    const footer:Element = box.getElementsByClassName("footer")[0],
                        body:Element = box.getElementsByClassName("body")[0],
                        buttons:Element = footer.getElementsByClassName("footer-buttons")[0],
                        pList:HTMLCollectionOf<Element> = footer.getElementsByTagName("p"),
                        p:HTMLElement = document.createElement("p");
                    p.innerHTML = util.sanitizeHTML(message);
                    p.setAttribute("class", "status-message");
                    if (pList[0] !== buttons) {
                        footer.removeChild(pList[0]);
                    }
                    p.style.width = `${(body.clientWidth - buttons.clientWidth - 40) / 15}em`;
                    footer.insertBefore(p, pList[0]);
                };
            network.send(payload, "file-system", callback);
        },
    
        /* Search for file system artifacts from a modal's current location */
        search: function browser_content_fileBrowser_search(event?:Event, searchElement?:HTMLInputElement, callback?:eventCallback):void {
            const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                element:HTMLInputElement = (searchElement === undefined)
                    ? event.target as HTMLInputElement
                    : searchElement,
                value:string = element.value,
                box:Element = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                addressLabel:HTMLElement = element.parentNode.previousSibling as HTMLElement,
                addressElement:HTMLInputElement = addressLabel.getElementsByTagName("input")[0],
                address:string = addressElement.value;
            if (event !== null && event.type === "blur") {
                const searchParent:HTMLElement = element.parentNode as HTMLElement;
                searchParent.style.width = "12.5%";
                addressLabel.style.width = "87.5%";
                browser.data.modals[id].search = [address, value];
                network.configuration();
            }
            if (event === null || (event.type === "keyup" && keyboardEvent.key === "Enter")) {
                const body:Element = box.getElementsByClassName("body")[0],
                    addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
                    statusBar:Element = box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0],
                    agency:agency = util.getAgent(box),
                    payload:service_fileSystem = {
                        action: "fs-search",
                        agent: {
                            id: agency[0],
                            modalAddress: addressField.value,
                            share: browser.data.modals[id].share,
                            type: agency[2]
                        },
                        depth: 0,
                        location: [address],
                        name: value
                    },
                    netCallback = function browser_content_fileBrowser_search_callback(responseText:string):void {
                        if (responseText === "") {
                            const local:string = (box.getAttribute("data-agent") === browser.data.hashDevice)
                                ? "."
                                : ", or remote user is offline.";
                            body.innerHTML = `<p class="error">Error 404: Requested location took too long (network timeout), or is no longer available${local}</p>`;
                        } else {
                            const dirData:service_fileStatus = JSON.parse(responseText).data,
                                length:number = dirData.fileList.length;
                            if (dirData.fileList === "missing" || dirData.fileList === "noShare" || dirData.fileList === "readOnly" || length < 1) {
                                const p:HTMLElement = document.createElement("p");
                                p.setAttribute("class", "error");
                                if (dirData.fileList === "missing") {
                                    p.innerHTML = "The matching results are no longer available.";
                                } else if (dirData.fileList === "noShare") {
                                    p.innerHTML = "The matching results are no longer shared.";
                                } else if (dirData.fileList === "readOnly") {
                                    p.innerHTML = "The matching results are restricted to a read only share.";
                                } else {
                                    p.innerHTML = "There are no matching results.";
                                }
                                body.innerHTML = "";
                                body.appendChild(p);
                                statusBar.innerHTML = p.innerHTML;
                            } else {
                                const output:HTMLElement = document.createElement("ul");
                                let a:number = 0;
                                output.tabIndex = 0;
                                output.oncontextmenu = context.events.menu;
                                output.onkeydown = util.keys;
                                output.onclick = file_browser.events.listFocus;
                                output.onmousedown = function browser_content_fileBrowser_list_dragSelect(event:MouseEvent):void {
                                    util.dragBox(event, util.dragList);
                                };
                                output.setAttribute("class", "fileList");
                                statusBar.innerHTML = dirData.message;
                                dirData.fileList.sort(function browser_content_fileBrowser_search_callback_sort(a:directoryItem, b:directoryItem):number {
                                    // when types are the same
                                    if (a[1] === b[1]) {
                                        if (a[0].toLowerCase() < b[0].toLowerCase()) {
                                            return -1;
                                        }
                                        return 1;
                                    }
                            
                                    // when types are different
                                    if (a[1] === "directory") {
                                        return -1;
                                    }
                                    if (a[1] === "link" && b[1] === "file") {
                                        return -1;
                                    }
                                    return 1;
                                });
                                do {
                                    output.appendChild(file_browser.tools.listItem(dirData.fileList[a], ""));
                                    a = a + 1;
                                } while (a < length);
                                body.innerHTML = "";
                                body.appendChild(output);
                                if (callback !== undefined) {
                                    callback(null, null);
                                }
                            }
                        }
                    };
                body.innerHTML = "";
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
                network.send(payload, "file-system", netCallback);
            }
        },
    
        /* Expand the search field to a large size when focused */
        searchFocus: function browser_content_fileBrowser_searchFocus(event:Event):void {
            const search:HTMLElement = event.target as HTMLElement,
                searchParent:HTMLElement = search.parentNode as HTMLElement,
                address:HTMLElement = searchParent.previousSibling as HTMLElement;
            search.focus();
            searchParent.style.width = "60%";
            address.style.width = "40%";
        },
    
        /* Select a file system item for an action */
        select: function browser_content_fileBrowser_select(event:Event):void {
            event.preventDefault();
            global_events.contextMenuRemove();
            const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                element:Element = (function browser_content_fileBrowser_select_element():Element {
                    const el:Element = event.target as Element;
                    if (util.name(el) === "li") {
                        return el;
                    }
                    return el.getAncestor("li", "tag");
                }()),
                p:Element = element.getElementsByTagName("p")[0],
                classy:string = p.getAttribute("class"),
                parent:HTMLElement = p.parentNode as HTMLElement,
                input:HTMLInputElement = parent.getElementsByTagName("input")[0];
            let state:boolean = input.checked,
                body:Element = p,
                box:Element,
                modalData:modal;
            if (document.getElementById("newFileItem") !== null) {
                return;
            }
            if (file_browser.dragFlag !== "") {
                event.preventDefault();
                event.stopPropagation();
            }
            input.focus();
            modal.events.zTop(keyboardEvent);
            body = body.getAncestor("body", "class");
            box = body.parentNode.parentNode as Element;
            modalData = browser.data.modals[box.getAttribute("id")];
    
            if (document.getElementById("dragBox") !== null) {
                return;
            }
    
            if (keyboardEvent.ctrlKey === true || file_browser.dragFlag === "control") {
                if (state === true) {
                    input.checked = false;
                    if (classy !== null && classy.indexOf("cut") > -1) {
                        p.setAttribute("class", "cut");
                    } else {
                        p.removeAttribute("class");
                    }
                    delete modalData.selection[p.getElementsByTagName("label")[0].innerHTML];
                } else {
                    input.checked = true;
                    if (classy !== null && classy.indexOf("cut") > -1) {
                        p.setAttribute("class", "selected cut");
                    } else {
                        p.setAttribute("class", "selected");
                    }
                    modalData.selection[p.getElementsByTagName("label")[0].innerHTML] = "selected";
                }
            } else if (keyboardEvent.shiftKey === true || file_browser.dragFlag === "shift") {
                const liList:HTMLCollectionOf<HTMLElement> = body.getElementsByTagName("p"),
                    shift = function browser_content_fileBrowser_select_shift(index:number, end:number):void {
                        let liClassy:string,
                            liParent:HTMLElement;
                        if (state === true) {
                            do {
                                liClassy = liList[index].getAttribute("class");
                                liParent = liList[index].parentNode as HTMLElement;
                                liParent.getElementsByTagName("input")[0].checked = false;
                                if (liClassy !== null && liClassy.indexOf("cut") > -1) {
                                    liList[index].setAttribute("class", "cut");
                                } else {
                                    liList[index].removeAttribute("class");
                                }
                                delete  modalData.selection[liList[index].getElementsByTagName("label")[0].innerHTML];
                                index = index + 1;
                            } while (index < end);
                        } else {
                            do {
                                liClassy = liList[index].getAttribute("class");
                                liParent = liList[index].parentNode as HTMLElement;
                                liParent.getElementsByTagName("input")[0].checked = true;
                                if (liClassy !== null && liClassy.indexOf("cut") > -1) {
                                    liList[index].setAttribute("class", "selected cut");
                                } else {
                                    liList[index].setAttribute("class", "selected");
                                }
                                modalData.selection[liList[index].getElementsByTagName("label")[0].innerHTML] = "selected";
                                index = index + 1;
                            } while (index < end);
                        }
                    };
                let a:number = 0,
                    focus:Element = browser.data.modals[box.getAttribute("id")].focus,
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
                    if (state === true) {
                        input.checked = false;
                        if (classy !== null && classy.indexOf("cut") > -1) {
                            p.setAttribute("class", "cut");
                        } else {
                            p.removeAttribute("class");
                        }
                        delete modalData.selection[p.getElementsByTagName("label")[0].innerHTML];
                    } else {
                        input.checked = true;
                        if (classy !== null && classy.indexOf("cut") > -1) {
                            p.setAttribute("class", "selected cut");
                        } else {
                            p.setAttribute("class", "selected");
                        }
                        modalData.selection[p.getElementsByTagName("label")[0].innerHTML] = "selected";
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
                    item:Element,
                    itemClass:string,
                    itemParent:HTMLElement;
                do {
                    if (inputs[a].checked === true) {
                        inputs[a].checked = false;
                        itemParent = inputs[a].parentNode.parentNode as HTMLElement;
                        item = itemParent.getElementsByTagName("p")[0];
                        itemClass = item.getAttribute("class");
                        if (itemClass !== null && itemClass.indexOf("cut") > -1) {
                            item.setAttribute("class", "cut");
                        } else {
                            item.removeAttribute("class");
                        }
                    }
                    a = a + 1;
                } while (a < inputsLength);
                input.checked = true;
                if (selected === false) {
                    if (classy !== null && classy.indexOf("cut") > -1) {
                        p.setAttribute("class", "selected cut");
                    } else {
                        p.setAttribute("class", "selected");
                    }
                    modalData.selection = {};
                    modalData.selection[p.getElementsByTagName("label")[0].innerHTML] = "selected";
                }
            }
            modalData.focus = p;
            network.configuration();
        },
    
        /* Requests file system data from a text field, such as manually typing an address */
        text: function browser_content_fileBrowser_text(event:Event):boolean {
            let box:Element,
                history:boolean = true;
            const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                element:HTMLInputElement = (function browser_content_fileBrowser_text_element():HTMLInputElement {
                    const el:HTMLInputElement = event.target as HTMLInputElement,
                        parent:Element = el.parentNode as Element,
                        name:string = util.name(el);
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
                    agency:agency = util.getAgent(box),
                    payload:service_fileSystem = {
                        action: "fs-directory",
                        agent: {
                            id: agency[0],
                            modalAddress: address,
                            share: browser.data.modals[id].share,
                            type: agency[2]
                        },
                        depth: 2,
                        location: [address],
                        name: ""
                    };
                file_browser.tools.modalAddress({
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
        listFail: function browser_content_fileBrowser_listFail(count:number, box:Element):void {
            const statusBar:Element = box.getElementsByClassName("status-bar")[0],
                p:Element = statusBar.getElementsByTagName("p")[0],
                ul:Element = statusBar.getElementsByTagName("ul")[0],
                filePlural:string = (count === 1)
                    ? ""
                    : "s";
            if (ul !== undefined) {
                statusBar.removeChild(ul);
            }
            if (count < 1) {
                p.innerHTML = "";
            } else {
                p.innerHTML = `${count} file${filePlural} in this query are restricted from reading by the operating system.`;
            }
        },
    
        /* Build a single file system object from data */
        listItem: function browser_content_fileBrowser_listItem(item:directoryItem, extraClass:string):Element {
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
                    const dragBox:Element = document.getElementById("dragBox"),
                        element:HTMLElement = event.target as HTMLElement;
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
                    const button:HTMLElement = document.createElement("button");
                    button.setAttribute("class", "expansion");
                    button.innerHTML = "+<span>Expand this folder</span>";
                    button.setAttribute("title", "Expand this folder");
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
            text.innerHTML = item[0];
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
            label.innerHTML = "Selected";
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
    
        /* Updates the address of a fileNavigate modal in both UI and state */
        modalAddress: function browser_content_fileBrowser_modalAddress(config:modalHistoryConfig):void {
            const modalData:modal = browser.data.modals[config.id],
                modalItem:Element = document.getElementById(config.id),
                lastHistory:string = modalData.history[modalData.history.length - 1],
                windows:boolean = ((/^\w:/).test(config.address.replace(/\s+/, "")) || config.address === "\\");
            
            // if at root use the proper directory slash
            if (config.address === "**root**") {
                const listItem:Element = modalItem.getElementsByClassName("fileList")[0].getElementsByTagName("li")[0];
                if (listItem.getAttribute("class") === "empty-list") {
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
                    config.payload.agent.modalAddress = config.address;
                    if (config.payload.action === "fs-directory" && config.payload.name !== "expand" && config.payload.location[0] === "**root**") {
                        config.payload.location[0] = config.address;
                    }
                }
            }
    
            // change the value in the modal settings
            modalData.text_value = config.address;
    
            // change the value in modal history
            if (config.history === true && ((config.address !== lastHistory && windows === false) || (config.address.toLowerCase() !== lastHistory.toLowerCase() && windows === true))) {
                modalData.history.push(config.address);
            }
    
            // request new file system data for the new address
            if (config.payload !== null) {
                network.send(config.payload, "file-system", null);
    
                // save state
                network.configuration();
            }
    
            // change the value in the html
            modalItem.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value = config.address;
        }
    }

};

export default file_browser;