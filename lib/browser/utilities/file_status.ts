
/* lib/browser/utilities/file_status - File navigate modal type contents. */

import browser from "./browser.js";
import common from "../../common/common.js";
import context_keys from "./context_keys.js";
import context_menu from "./context_menu.js";
import file_address from "./file_address";
import file_directory from "./file_directory.js";
import file_select from "./file_select.js";
import file_select_none from "./file_select_none.js";
import util from "./util.js";

const file_status = function browser_utilities_fileStatus(socketData:socketData):void {
    const data:service_fileSystem_status = socketData.data as service_fileSystem_status,
        keys:string[] = Object.keys(browser.ui.modals),
        failures:[string[], number] = (data.fileList === null || typeof data.fileList === "string" || data.fileList.failures === undefined)
            ? [[], 0]
            : [data.fileList.failures, Math.min(10, data.fileList.failures.length)],
        fails:HTMLElement = document.createElement("ul"),
        search:boolean  = (data.message.indexOf("search-") === 0),
        expandTest:boolean = (data.message.indexOf("expand-") === 0),
        expandLocation:string = data.message.replace("expand-", ""),
        fileList = function browser_utilities_fileStatus_fileList(location:string, dirs:directory_response, message:string):HTMLElement {
            const listLength:number = dirs.length,
                local:directory_list = (function browser_utilities_fileStatus_fileList_local():directory_list {
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
                const fileListItem = function browser_utilities_fileStatus_fileList_listItem(item:directory_item, location:string, extraClass:string):HTMLElement {
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
                        mouseOver = function browser_utilities_fileStatus_fileList_listItem_mouseOver(event:MouseEvent):void {
                            const dragBox:HTMLElement = document.getElementById("dragBox"),
                                element:HTMLElement = event.target;
                            if (dragBox !== null) {
                                if (event.ctrlKey === true) {
                                    element.click();
                                }
                            }
                        },
                        execute = function browser_utilities_fileStatus_fileList_listItem_execute(event:KeyboardEvent|MouseEvent):void {
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
                        keyExecute = function browser_utilities_fileStatus_fileList_listItem_keyExecute(event:KeyboardEvent):void {
                            const target:HTMLElement = event.target,
                                element:HTMLElement = (target.lowName() === "li")
                                    ? target
                                    : target.getAncestor("li", "tag");
                            if (event.key.toLowerCase() === "enter" && element.getElementsByTagName("p")[0].getAttribute("class") === "selected") {
                                execute(event);
                            }
                        },
                        drag = function browser_utilities_fileStatus_fileList_listItem_drag(event:MouseEvent|TouchEvent):void {
                            const element:HTMLElement = event.target,
                                item:HTMLElement = (function browser_utilities_fileStatus_fileList_listItem_drag_item():HTMLElement {
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
                                mouseDown = function browser_utilities_fileStatus_fileList_listItem_drag_document(documentEvent:MouseEvent):void {
                                    documentEvent.preventDefault();
                                },
                                drop = function browser_utilities_fileStatus_fileList_listItem_drag_drop(dropEvent:MouseEvent|TouchEvent):void {
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
                                    const addresses:string[] = (function browser_utilities_fileStatus_fileList_listItem_drag_drop_addresses():string[] {
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
                                        target:string = (function browser_utilities_fileStatus_fileList_listItem_drag_drop_target():string {
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
                                move = function browser_utilities_fileStatus_fileList_listItem_drag_move(moveEvent:MouseEvent|TouchEvent):boolean {
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
                        li.ondblclick = execute;
                        li.onkeydown = keyExecute;
                        li.setAttribute("data-path", item[0]);
                    } else if (item[1] === "directory") {
                        if (item[4] > 0) {
                            const button:HTMLElement = document.createElement("button"),
                                span:HTMLElement = document.createElement("span"),
                                expand = function browser_content_fileBrowser_expand(event:MouseEvent):void {
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
                                };
                            button.setAttribute("class", "expansion");
                            span.appendText("Expand this folder");
                            button.appendText("+", true);
                            button.appendChild(span);
                            button.setAttribute("title", "Expand this folder");
                            button.setAttribute("type", "button");
                            button.onclick = expand;
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
                            li.ondblclick = execute;
                            li.onkeydown = keyExecute;
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
                    p.oncontextmenu = context_menu;
                    p.onkeydown = context_keys;
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
                    li.onmousedown = drag;
                    li.onmouseover = mouseOver;
                    li.ontouchstart = drag;
                    return li;
                };
                do {
                    if (local[a][0] !== location) {
                        output.appendChild(fileListItem(
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
            output.oncontextmenu = context_menu;
            output.onkeydown = context_keys;
            output.onclick = function browser_content_fileBrowser_listFocus(event:MouseEvent):void {
                const element:HTMLElement = event.target,
                    name:string = element.lowName(),
                    li:HTMLElement = (name === "ul" || name === "li")
                        ? element
                        : element.getAncestor("li", "tag"),
                    inputs:HTMLCollectionOf<HTMLElement> = li.getElementsByTagName("input"),
                    input:HTMLElement = inputs[inputs.length - 1];
                input.focus();
            };
            output.onmousedown = function browser_file_browser_list_dragSelect(event:MouseEvent):void {
                util.dragBox(event, util.dragList);
            };
            output.setAttribute("class", "fileList");
            return output;
        },
        expand = function browser_utilities_fileStatus_expand(box:modal):void {
            const list:HTMLCollectionOf<HTMLElement> = box.getElementsByClassName("fileList")[0].getElementsByTagName("li"),
                max:number = list.length;
            let index:number = 0,
                text:string = "";
            if (max > 0) {
                do {
                    text = list[index].dataset.path;
                    if (text === expandLocation) {
                        if (list[index].getAttribute("class").indexOf("directory") > -1) {
                            list[index].appendChild(fileList(text, data.fileList, ""));
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
                                const list:[string, string][] = JSON.parse(data.message.replace("search-", "")) as [string, string][],
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
                        listData = fileList(data.agentSource.modalAddress, data.fileList, data.message);
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
};

export default file_status;