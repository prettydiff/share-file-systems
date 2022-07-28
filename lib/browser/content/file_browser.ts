
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
 *         dataString: (socketData:socketData) => void; // Populate content into modals for string output operations, such as: Base64, Hash, File Read.
 *         details   : (socketData:socketData) => void; // Generates the contents of a details type modal.
 *         list      : (location:string, dirs:directory_response, message:string) => Element; // Generates the contents of a file system list for population into a file navigate modal.
 *         status    : (socketData:socketData) => void; // Translates messaging into file system lists for the appropriate modals.
 *     };
 *     dragFlag: dragFlag; // Allows the drag handler to identify whether the shift or control/command keys are pressed while selecting items from the file list.
 *     events: {
 *         back       : (event:Event) => void;                 // Handler for the back button, which steps back to the prior file system location of the given agent stored in the modal's navigation history.
 *         directory  : (event:Event) => void;                 // Handler for navigation into a directory by means of double click.
 *         drag       : (event:MouseEvent|TouchEvent) => void; // Move file system artifacts from one location to another by means of double click.
 *         execute    : (event:Event) => void;                 // Allows operating system execution of a file by double click interaction.
 *         expand     : (event:Event) => void;                 // Opens a directory into a child list without changing the location of the current modal.
 *         keyExecute : (event:KeyboardEvent) => void;         // Allows file execution by keyboard control, such as pressing the *Enter* key.
 *         listFocus  : (event:Event) => void;                 // When clicking on a file list give focus to an input field in that list so that the list can receive focus.
 *         parent     : (event:Event) => void;                 // Handler to navigate into the parent directory by click the parent navigate button.
 *         rename     : (event:Event) => void;                 // Converts a file system item text into a text input field so that the artifact can be renamed.
 *         saveFile   : (event:Event) => void;                 // A handler for an interaction that allows writing file changes to the file system.
 *         search     : (event?:Event, searchElement?:HTMLInputElement, callback?:eventCallback) => void; // Sends a search query in order to receive a filtered list of file system artifacts.
 *         searchFocus: (event:Event) => void;                 // Provides an interaction that enlarges and reduces the width of the search field.
 *         select     : (event:Event) => void;                 // Select a file system item for interaction by click.
 *         text       : (event:Event) => void;                 // Allows changing file system location by changing the text address of the current location.
 *     };
 *     tools: {
 *         listFail    : (count:number, box: Element) => void; // Display status information when the Operating system locks files from access.
 *         listItem    : (item:directory_item, extraClass:string) => Element; // Generates the HTML content for a single file system artifacts that populates a file system list.
 *         modalAddress: (config:config_modalHistory) => void; // Updates the file system address of the current file navigate modal in response to navigating to different locations.
 *     };
 * }
 * type eventCallback = (event:Event, callback:(event:MouseEvent, dragBox:Element) => void) => void;
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
                label:Element,
                span:Element,
                modalResult:Element,
                body:HTMLElement,
                heading:HTMLElement;
            if (data.files[0] === undefined) {
                return;
            }
            do {
                textArea = document.createElement("textarea");
                label = document.createElement("label");
                span = document.createElement("span");
                span.innerHTML = "Text Pad";
                label.setAttribute("class", "textPad");
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
                body.innerHTML = "";
                body.appendChild(label);
                body.style.overflow = "hidden";
                heading.style.width = `${(body.clientWidth - 50) / 18}em`;
                a = a + 1;
            } while (a < length);
            network.configuration();
        },

        /* generates the content for a file system details modal */
        details: function browser_content_fileBrowser_details(socketData:socketData):void {
            const payload:service_fileSystem_details = socketData.data as service_fileSystem_details,
                list:directory_list = (payload.dirs === "missing" || payload.dirs === "noShare" || payload.dirs === "readOnly")
                    ? []
                    : payload.dirs,
                listLength:number = list.length,
                plural:string = (listLength === 1)
                    ? ""
                    : "s",
                fileList:directory_list = [],
                body:Element = document.getElementById(payload.id).getElementsByClassName("body")[0],
                length:number = list.length,
                details:fsDetailCounts = {
                    size: 0,
                    files: 0,
                    directories: 0,
                    links: 0
                },
                output:Element = document.createElement("div"),
                row = function browser_content_fileBrowser_details_row(heading:string, cell:string, tbody:Element):void {
                    const tr:HTMLElement = document.createElement("tr"),
                        th:HTMLElement = document.createElement("th"),
                        td:HTMLElement = document.createElement("td");
                    th.innerHTML = heading;
                    td.innerHTML = cell;
                    tr.appendChild(th);
                    tr.appendChild(td);
                    tbody.appendChild(tr);
                };
            let a:number = 0,
                p:HTMLElement = null,
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
            heading.innerHTML = `File System Details - ${common.commas(listLength)} item${plural}`;
            output.appendChild(heading);
            row("Location", payload.dirs[0][0], tbody);
            row("Total Size", (details.size > 1024n)
                ? `${common.commas(details.size)} bytes (${common.prettyBytes(details.size)})`
                : `${common.commas(details.size)} bytes`,
            tbody);
            table.appendChild(tbody);
            output.appendChild(table);
    
            heading = document.createElement("h3");
            heading.innerHTML = "Contains";
            output.appendChild(heading);
            p = document.createElement("p");
            p.innerHTML = "Does not count read protected assets.";
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
            heading.innerHTML = "MAC";
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
                        button.innerHTML = (sortName === "alpha")
                            ? "List all files alphabetically"
                            : (sortName === "changed")
                                ? "List 100 most recently changed files"
                                : "List 100 largest files";
                        button.onclick = function browser_content_fileBrowser_details_clickGenerator_click(event:MouseEvent):void {
                            if (sortName === "alpha") {
                                fileList.sort(sortAlpha);
                            } else if (sortName === "changed") {
                                fileList.sort(sortChanged);
                            } else if (sortName === "largest") {
                                fileList.sort(sortLargest);
                            }
                            const element:Element = event.target as Element,
                                grandParent:Element = element.parentNode.parentNode as Element,
                                table:HTMLElement = grandParent.getElementsByClassName("detailFileList")[0] as HTMLElement,
                                p:HTMLElement = table.previousSibling as HTMLElement,
                                tableBody:HTMLElement = table.getElementsByTagName("tbody")[0],
                                len:number = (sortName === "alpha")
                                    ? dataLength
                                    : hundred;
                            let aa:number = 0,
                                row:HTMLElement,
                                cell:HTMLElement;
                            p.innerHTML = (sortName === "alpha")
                                ? `All ${common.commas(dataLength)} files sorted alphabetically`
                                : (sortName === "changed")
                                    ? `${hundred} most recently changed files`
                                    : `${hundred} largest files`;
                            tbody.innerHTML = "";
                            do {
                                row = document.createElement("tr");
                                cell = document.createElement("th");
                                cell.setAttribute("class", "file");
                                cell.innerHTML = fileList[aa][0];
                                row.appendChild(cell);
                                cell = document.createElement("td");
                                cell.innerHTML = (sortName === "alpha")
                                    ? fileList[aa][0]
                                    : (sortName === "changed")
                                        ? common.dateFormat(new Date(Number(fileList[aa][5].mtimeMs)))
                                        : common.commas(fileList[aa][5].size);
                                row.appendChild(cell);
                                if (sortName === "largest") {
                                    cell = document.createElement("td");
                                    cell.innerHTML = common.prettyBytes(fileList[aa][5].size);
                                    row.appendChild(cell);
                                }
                                tableBody.appendChild(row);
                                aa = aa + 1;
                            } while (aa < len);
                            table.style.display = "block";
                            p.style.display = "block";
                        };
                        p.appendChild(button);
                        output.appendChild(p);
                    };
                heading = document.createElement("h3");
                heading.innerHTML = "List files";
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
    
            body.innerHTML = "";
            body.appendChild(output);
        },

        /* Builds the HTML file list */
        list: function browser_content_fileBrowser_list(location:string, dirs:directory_response, message:string):Element {
            const listLength:number = dirs.length,
                output:HTMLElement = document.createElement("ul");
            let a:number = 0,
                local:directory_list = [],
                localLength:number = 0,
                list:boolean = false;
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

            if (message.indexOf("execute-") === 0) {
                const div:Element = document.createElement("div");
                let p:HTMLElement = document.createElement("p");
                p.innerHTML = `Specified location <em>${dirs[0][0]}</em> is a <strong>file</strong>.`;
                div.appendChild(p);
                p = document.createElement("p");
                p.innerHTML = "To execute the file either double click it from the file list or select it from the file list and press the 'Enter' key.  To see file system details about the file right click on the file from the file list and choose 'Details'.";
                div.appendChild(p);
                return div;
            }

            if (listLength > 0 && dirs[0][1] === "directory" && dirs[0][3] === 0) {
                do {
                    if (dirs[a][3] === 0) {
                        local.push(dirs[a]);
                    }
                    a = a + 1;
                } while (a < listLength);
            } else {
                local = dirs as directory_list;
                list = true;
            }

            local.sort(function browser_content_fileBrowser_list_sort(a:directory_item, b:directory_item):number {
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
            if (location === "\\" || location === "/" || list === true) {
                a = 0;
            } else {
                a = 1;
            }
            localLength = local.length;
            if (a < localLength) {
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
        },

        /* A utility to format and describe status bar messaging in a file navigator modal. */
        status: function browser_content_fileBrowser_status(socketData:socketData):void {
            const data:service_fileSystem_status = socketData.data as service_fileSystem_status,
                keys:string[] = Object.keys(browser.data.modals),
                failures:[string[], number] = (data.fileList === null || typeof data.fileList === "string" || data.fileList.failures === undefined)
                    ? [[], 0]
                    : [data.fileList.failures, Math.min(10, data.fileList.failures.length)],
                fails:Element = document.createElement("ul"),
                search:boolean  = (data.message.indexOf("search-") === 0),
                searchFragment:string = (search === true)
                    ? data.message.slice(data.message.indexOf("<em>") + 4, data.message.indexOf("</em>"))
                    : "",
                expandTest:boolean = (data.message.indexOf("expand-") === 0),
                expandLocation:string = data.message.replace("expand-", ""),
                expand = function browser_content_fileBrowser_status_expand(box:Element):void {
                    const list:HTMLCollectionOf<Element> = box.getElementsByClassName("fileList")[0].getElementsByTagName("label"),
                        max:number = list.length;
                    let index:number = 0,
                        text:string = "",
                        grandParent:Element = null;
                    do {
                        if (util.name(list[index].parentNode as Element) === "p") {
                            grandParent = list[index].parentNode.parentNode as Element;
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
            let listData:Element,
                body:Element,
                clone:Element,
                keyLength:number = keys.length,
                statusBar:Element,
                list:Element,
                p:Element,
                modal:config_modal,
                box:Element;
            if (failures[1] > 0) {
                let b:number = 0,
                    li:Element;
                do {
                    li = document.createElement("li");
                    li.innerHTML = failures[0][b];
                    fails.appendChild(li);
                    b = b + 1;
                } while (b < failures[1]);
                if (failures.length > 10) {
                    li = document.createElement("li");
                    li.innerHTML = "more...";
                    fails.appendChild(li);
                }
            }

            if (keyLength > 0) {
                do {
                    keyLength = keyLength - 1;
                    modal = browser.data.modals[keys[keyLength]];
                    if (modal.type === "fileNavigate") {
                        if (modal.agent === data.agentSource[modal.agentType] && modal.text_value === data.agentSource.modalAddress && ((search === false && modal.search[1] === "") || (search === true && modal.search[1] === searchFragment))) {
                            box = document.getElementById(keys[keyLength]);
                            statusBar = box.getElementsByClassName("status-bar")[0];
                            list = statusBar.getElementsByTagName("ul")[0];
                            p = statusBar.getElementsByTagName("p")[0];
                            if (failures[1] > 0) {
                                clone = fails.cloneNode(true) as HTMLElement;
                                statusBar.appendChild(clone);
                            } else if (data.message !== "") {
                                if (expandTest === true) {
                                    expand(box);
                                } else {
                                    p.innerHTML = data.message.replace(/((execute)|(search))-/, "");
                                    p.setAttribute("aria-live", "polite");
                                    p.setAttribute("role", "status");
                                    if (list !== undefined) {
                                        statusBar.removeChild(list);
                                    }
                                }
                            }
                            if (data.fileList !== null && expandTest === false) {
                                body = box.getElementsByClassName("body")[0];
                                body.innerHTML = "";
                                listData = file_browser.content.list(data.agentSource.modalAddress, data.fileList, data.message);
                                if (listData !== null) {
                                    body.appendChild(listData);
                                    if (data.fileList.length > 0 && search === false) {
                                        file_browser.tools.modalAddress({
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
                fileList:Element = element.getAncestor("div", "tag"),
                body:HTMLElement = fileList.parentNode as HTMLElement,
                box:HTMLElement = body.getAncestor("box", "class") as HTMLElement,
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
                    let goal:Element = null;
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
        expand: function browser_content_fileBrowser_expand(event:Event):void {
            const button:HTMLElement = event.target as HTMLElement,
                box:Element = button.getAncestor("box", "class"),
                li:HTMLElement = button.parentNode as HTMLElement;
            button.focus();
            if (button.innerHTML.indexOf("+") === 0) {
                const agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                    payload:service_fileSystem = {
                        action: "fs-directory",
                        agentRequest: agents[0],
                        agentSource: agents[1],
                        agentWrite: null,
                        depth: 2,
                        location: [li.firstChild.nextSibling.firstChild.textContent],
                        name : "expand"
                    };
                button.innerHTML = "-<span>Collapse this folder</span>";
                button.setAttribute("title", "Collapse this folder");
                network.send(payload, "file-system");
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
                input:HTMLInputElement = document.createElement("input"),
                li:HTMLElement = element.getAncestor("li", "tag") as HTMLElement,
                menu:Element = document.getElementById("contextMenu"),
                actionComplete = function browser_content_fileBrowser_rename_actionComplete(field:HTMLInputElement, labelValue:string):void {
                    const liParent:HTMLElement = field.getAncestor("li", "tag") as HTMLElement;
                    liParent.onkeydown = file_browser.events.keyExecute;
                    field.onblur = null;
                    field.onkeyup = null;
                    label.removeChild(field);
                    label.innerHTML = labelValue;
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
                            label.innerHTML = text;
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
            li.onkeydown = null;
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
                content:string = box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].value,
                title:Element = box.getElementsByTagName("h2")[0].getElementsByTagName("button")[0],
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
        search: function browser_content_fileBrowser_search(event?:Event, searchElement?:HTMLInputElement):void {
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
                network.send(payload, "file-system");
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
                modalData:config_modal;
            if (document.getElementById("newFileItem") === null) {
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
            }
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
        listItem: function browser_content_fileBrowser_listItem(item:directory_item, extraClass:string):Element {
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
        modalAddress: function browser_content_fileBrowser_modalAddress(config:config_modalHistory):void {
            const modalData:config_modal = browser.data.modals[config.id],
                modalItem:Element = document.getElementById(config.id),
                lastHistory:string = modalData.history[modalData.history.length - 1],
                windows:boolean = ((/^\w:/).test(config.address.replace(/\s+/, "")) || config.address === "\\");
            
            // if at root use the proper directory slash
            if (config.address === "**root**") {
                const listItem:Element = modalItem.getElementsByClassName("fileList")[0].getElementsByTagName("li")[0];
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