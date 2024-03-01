
/* lib/browser/content/file_browser - A collection of utilities for handling file system related tasks in the browser. */
import browser from "../utilities/browser.js";
import common from "../../common/common.js";
import context from "./context.js";
import file_address from "../utilities/file_address.js";
import file_directory from "../utilities/file_directory.js";
import file_select from "../utilities/file_select.js";
import file_select_addresses from "../utilities/file_select_addresses.js";
import file_select_none from "../utilities/files_select_none.js";
import file_text from "../utilities/file_text.js";
import util from "../utilities/util.js";

/**
 * Generates the user experience associated with file system interaction.
 * ```typescript
 * interface module_fileBrowser {
 *     content: {
 *         dataString     : (socketData:socketData) => void; // Populate content into modals for string output operations, such as: Base64, Hash, File Read.
 *         detailsContent : (id:string) => void;             // Generates the initial content and network request for file system details.
 *         detailsResponse: (socketData:socketData) => void; // Generates the contents of a details type modal from file system data.
 *         footer         : () => HTMLElement;               // Generates the status bar content for the file browser modal.
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
 *         listFail         : (count:number, box:modal) => void; // Display status information when the Operating system locks files from access.
 *         listItem         : (item:directory_item, extraClass:string) => HTMLElement; // Generates the HTML content for a single file system artifacts that populates a file system list.
 *         modalAddress     : (event:FocusEvent|KeyboardEvent|MouseEvent, config:config_modal_history) => void; // Updates the file system address of the current file navigate modal in response to navigating to different locations.
 *         selectedAddresses: (element:HTMLElement, type:string) => [string, fileType, string][]; // Gather the selected addresses and types of file system artifacts in a fileNavigator modal.
 *         selectNone       : (element:HTMLElement) => void;                     // Remove selections of file system artifacts in a given fileNavigator modal.
 *     };
 * }
 * type dragFlag = "" | "control" | "shift";
 * ``` */
const file_browser:module_fileBrowser = {
    content: {

        /* generates the status bar content for the file navigate modal */
        footer: function browser_content_fileBrowser_footer():HTMLElement {
            const  footer:HTMLElement = document.createElement("div"),
            extra:HTMLElement = document.createElement("p");
            footer.setAttribute("class", "status-bar");
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
                                return common.sortFileList(output, location, browser.ui.fileSort);
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
                        output.appendChild(file_browser.tools.listItem(
                            local[a],
                            location,
                            (a < localLength - 1 && local[a + 1][1] !== local[a][1])
                                ? "lastType"
                                : ""
                        ));
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
            output.oncontextmenu = context.events.menu;
            output.onkeydown = context.events.keys;
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
                keys:string[] = Object.keys(browser.ui.modals),
                failures:[string[], number] = (data.fileList === null || typeof data.fileList === "string" || data.fileList.failures === undefined)
                    ? [[], 0]
                    : [data.fileList.failures, Math.min(10, data.fileList.failures.length)],
                fails:HTMLElement = document.createElement("ul"),
                search:boolean  = (data.message.indexOf("search-") === 0),
                expandTest:boolean = (data.message.indexOf("expand-") === 0),
                expandLocation:string = data.message.replace("expand-", ""),
                expand = function browser_content_fileBrowser_status_expand(box:modal):void {
                    const list:HTMLCollectionOf<HTMLElement> = box.getElementsByClassName("fileList")[0].getElementsByTagName("li"),
                        max:number = list.length;
                    let index:number = 0,
                        text:string = "";
                    if (max > 0) {
                        do {
                            text = list[index].dataset.path;
                            if (text === expandLocation) {
                                if (list[index].getAttribute("class").indexOf("directory") > -1) {
                                    list[index].appendChild(file_browser.content.list(text, data.fileList, ""));
                                    return;
                                }
                            }
                            if (list[index].getAttribute("class").indexOf("directory") < 0) {
                                break;
                            }
                            index = index + 1;
                        } while (index < max);
                    }
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
                    modal = browser.ui.modals[keys[keyLength]];
                    if (modal.type === "file-navigate") {
                        if (
                            // get modals from data.agentSource, this device, and targeted shares
                            (modal.agent === data.agentSource[modal.agentType] || (browser.agents.device[modal.agent] !== undefined && browser.agents.device[modal.agent].shares[data.agentSource.share] !== undefined)) &&
                            // modals that match the data address posix (case sensitive) vs windows (case insensitive)
                            ((modal.text_value.charAt(0) === "/" && modal.text_value === data.agentSource.modalAddress) || (modal.text_value.charAt(0) !== "/" && modal.text_value.toLowerCase() === data.agentSource.modalAddress.toLowerCase())) &&
                            // if the data is a search result then only populate modals containing the specific fragment
                            (search === false || (search === true && modal.search[0] === modal.text_value && data.message.includes(`,["em","${modal.search[1].replace(/\\/g, "\\\\")}"],`)))
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
                                    p.parentNode.removeChild(p);
                                    p = document.createElement("p");
                                    p.setAttribute("aria-live", "polite");
                                    p.setAttribute("role", "status");
                                    if (data.message.indexOf("search-") === 0) {
                                        const list:[string, string][] = JSON.parse(data.message.replace("search-", "")),
                                            len:number = list.length;
                                        let index:number = 0,
                                            child:HTMLElement = null;
                                        do {
                                            if (list[index][0] === "") {
                                                p.appendText(list[index][1]);
                                            } else {
                                                child = document.createElement(list[index][0]);
                                                child.appendText(list[index][1]);
                                                p.appendChild(child);
                                            }
                                            index = index + 1;
                                        } while (index < len);
                                    } else {
                                        p.appendText(data.message.replace(/execute-/, ""));
                                        p.setAttribute("aria-live", "polite");
                                        p.setAttribute("role", "status");
                                        if (list !== undefined) {
                                            statusBar.removeChild(list);
                                        }
                                    }
                                    statusBar.appendChild(p);
                                }
                            }
                            if (data.fileList !== null && expandTest === false) {
                                body = box.getElementsByClassName("body")[0] as HTMLElement;
                                body.appendText("", true);
                                listData = file_browser.content.list(data.agentSource.modalAddress, data.fileList, data.message);
                                if (listData !== null) {
                                    body.appendChild(listData);
                                    if (Array.isArray(data.fileList) === true && search === false) {
                                        // ensures modal address matches the addressed returned from the file system
                                        // **root** pseudo address is converted to actual system address 
                                        file_address(null, {
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
    
        /* drag and drop of selected list items */
        drag: function browser_content_fileBrowser_drag(event:MouseEvent|TouchEvent):void {
            const element:HTMLElement = event.target,
                item:HTMLElement = (function browser_content_fileBrowser_drag_item():HTMLElement {
                    const el:HTMLElement = element,
                        name:string = el.lowName();
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
                                output.push(children[a].dataset.path);
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
                                        ulIndex = browser.ui.modals[ulBox.getAttribute("id")].zIndex;
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
                    browser.send(payload, "copy");
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
            list.style.zIndex = (browser.ui.zIndex + 1).toString();
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
                path:string = li.dataset.path.replace(/&amp;/g, "&"),
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
            file_select_none(box);
            browser.send(payload, "file-system");
            file_select(event);
            event.stopPropagation();
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
                        location: [li.dataset.path],
                        name : "expand"
                    },
                    span:HTMLElement = document.createElement("span");
                span.appendText("Collapse this folder");
                button.appendText("-", true);
                button.appendChild(span);
                button.setAttribute("title", "Collapse this folder");
                browser.send(payload, "file-system");
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
                name:string = element.lowName(),
                li:HTMLElement = (name === "ul" || name === "li")
                    ? element
                    : element.getAncestor("li", "tag"),
                inputs:HTMLCollectionOf<HTMLElement> = li.getElementsByTagName("input"),
                input:HTMLElement = inputs[inputs.length - 1];
            input.focus();
        }
    },

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
        listItem: function browser_content_fileBrowser_listItem(item:directory_item, location:string, extraClass:string):HTMLElement {
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
                li.setAttribute("data-path", item[0]);
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
                li.ondblclick = file_directory;
                li.setAttribute("data-path", item[0]);
            } else {
                // symbolic link
                span = document.createElement("span");
                if (className === "link-directory") {
                    li.ondblclick = file_directory;
                } else {
                    li.ondblclick = file_browser.events.execute;
                    li.onkeydown = file_browser.events.keyExecute;
                }
                if (item[1] === "link") {
                    span.textContent = "symbolic link";
                    li.setAttribute("data-path", item[5].linkPath);
                } else {
                    span.textContent = item[1];
                    li.setAttribute("data-path", item[0]);
                }
            }
    
            // prepare the primary item text (address) to become a local name instead of absolute path
            if (location === "") {
                text.appendText(item[0]);
            } else {
                text.appendText(item[0].slice(location.length + 1));
            }
            p.appendChild(text);
    
            // prepare the descriptive text
            p.oncontextmenu = context.events.menu;
            p.onkeydown = context.events.keys;
            p.onclick = file_select;
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
        }
    }

};

export default file_browser;