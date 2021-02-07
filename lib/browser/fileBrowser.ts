
/* lib/browser/fileBrowser - A collection of utilities for handling file system related tasks in the browser. */
import browser from "./browser.js";
import context from "./context.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

import common from "../common/common.js";

const fileBrowser:module_fileBrowser = {};

/* step back through a modal's address history */
fileBrowser.back = function browser_fileBrowser_back(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        box:Element = element.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        address:HTMLInputElement = <HTMLInputElement>box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
        history = browser.data.modals[id].history;
    if (history.length > 1) {
        history.pop();
        address.value = history[history.length - 1];
        fileBrowser.text(event);
    }
};

/* navigate into a directory by double click */
fileBrowser.directory = function browser_fileBrowser_directory(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.target,
        li:Element = (element.nodeName.toLowerCase() === "li")
            ? element
            : <Element>element.getAncestor("li", "tag"),
        body:Element = li.getAncestor("body", "class"),
        box:Element = <Element>body.parentNode.parentNode,
        path:string = li.getElementsByTagName("label")[0].innerHTML,
        agency:agency = util.getAgent(box),
        id:string = box.getAttribute("id"),
        payload:systemDataFile = {
            action: "fs-directory",
            agent: agency[0],
            agentType: agency[2],
            depth: 2,
            location: [path],
            modalAddress: path,
            name: "",
            share: browser.data.modals[id].share,
            watch: path
        };
    event.preventDefault();
    fileBrowser.modalAddress({
        address: path,
        id: id,
        history: true,
        payload: payload
    });
};

/* drag and drop of selected list items */
fileBrowser.drag = function browser_fileBrowser_drag(event:MouseEvent|TouchEvent):void {
    const element:Element = <Element>event.target,
        item:Element = (function browser_fileBrowser_drag_item():Element {
            let el:Element = element;
            if (el.nodeName.toLowerCase() !== "label" && el.nodeName.toLowerCase() !== "span") {
                event.preventDefault();
            }
            if (el.nodeName.toLowerCase() === "li") {
                return el;
            }
            return el.getAncestor("li", "tag");
        }()),
        fileList:Element = (function browser_fileBrowser_drag_fileList():Element {
            let parent:Element = <Element>element.parentNode;
            if (parent.parentNode.nodeName.toLowerCase() !== "div") {
                do {
                    parent = <Element>parent.parentNode;
                } while (parent !== document.documentElement && parent.parentNode.nodeName.toLowerCase() !== "div");
            }
            return parent;
        }()),
        body:HTMLElement = <HTMLElement>fileList.parentNode,
        box:HTMLElement = <HTMLElement>body.parentNode.parentNode,
        header:number = (box.getElementsByClassName("header")[0] === undefined)
            ? 0
            : box.getElementsByClassName("header")[0].clientHeight + 13,
        top:number = body.offsetTop + header + box.offsetTop,
        left:number = body.offsetLeft + box.offsetLeft,
        bottom:number = top + body.clientHeight,
        right:number = left+ + body.clientWidth,
        touch:boolean = (event !== null && event.type === "touchstart"),
        list:HTMLElement = document.createElement("ul"),
        mouseDown = function browser_fileBrowser_drag_document(documentEvent:MouseEvent):void {
            documentEvent.preventDefault();
        },
        drop = function browser_fileBrowser_drag_drop(dropEvent:MouseEvent|TouchEvent):void {
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
            const addresses:string[] = (function browser_fileBrowser_drag_drop_addresses():string[] {
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
                    ? <TouchEvent>dropEvent
                    : null, 
                mouseDrop:MouseEvent = (touch === true)
                    ? null
                    : <MouseEvent>dropEvent,
                clientX:number = (touch === true)
                    ? touchDrop.touches[0].clientX
                    : mouseDrop.clientX,
                clientY:number = (touch === true)
                    ? touchDrop.touches[0].clientY
                    : mouseDrop.clientY,
                target:string = (function browser_fileBrowser_drag_drop_target():string {
                    const ul = browser.content.getElementsByClassName("fileList"),
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
                            ulBody = <HTMLElement>ul[a].parentNode;
                            ulBox = <HTMLElement>ulBody.parentNode.parentNode;
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
                                    goal = <Element>ul[a];
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
                payload:systemDataCopy = {
                    action      : "copy",
                    agent       : browser.data.modals[id].agent,
                    agentType   : browser.data.modals[id].agentType,
                    copyAgent   : agency[0],
                    copyType    : agency[2],
                    cut         : false,
                    destination : target,
                    location    : addresses,
                    modalAddress: target,
                    originAgent : (agency[2] === "device")
                        ? browser.data.hashDevice
                        : browser.data.hashUser,
                    share       : browser.data.modals[box.getAttribute("id")].share
                },
                callback = function browser_fileBrowser_drag_drop_callback():void {
                    return;
                };
            if (target === "") {
                return;
            }
            network.copy(payload, callback);
        },
        move = function browser_fileBrowser_drag_move(moveEvent:MouseEvent|TouchEvent):boolean {
            const touchMove:TouchEvent = (touch === true)
                    ? <TouchEvent>moveEvent
                    : null, 
                mouseMove:MouseEvent = (touch === true)
                    ? null
                    : <MouseEvent>moveEvent,
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
                            parent = <HTMLElement>selected[a].parentNode.parentNode;
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
    if (element.nodeName.toLowerCase() === "button") {
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
};

fileBrowser.dragFlag = "";

/* Shows child elements of a directory */
fileBrowser.expand = function browser_fileBrowser_expand(event:MouseEvent):void {
    const button:Element = <Element>event.target,
        box:Element = button.getAncestor("box", "class"),
        addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
        id:string = box.getAttribute("id"),
        li:HTMLElement = <HTMLElement>button.parentNode;
    if (button.innerHTML.indexOf("+") === 0) {
        const agency:agency = util.getAgent(button),
            payload:systemDataFile = {
                action: "fs-directory",
                agent: agency[0],
                agentType: agency[2],
                depth: 2,
                location: [li.firstChild.nextSibling.firstChild.textContent],
                modalAddress: addressField.value,
                name : "expand",
                share: browser.data.modals[id].share,
                watch: "no"
            },
            callback = function browser_fileBrowser_expand_callback(responseText:string) {
                const status:fsStatusMessage = JSON.parse(responseText),
                    list:Element = fileBrowser.list(li.firstChild.nextSibling.textContent, status.fileList);
                if (list === null) {
                    return;
                }
                li.appendChild(list);
            };
        button.innerHTML = "-<span>Collapse this folder</span>";
        button.setAttribute("title", "Collapse this folder");
        network.fileBrowser(payload, callback);
    } else {
        const ul:HTMLCollectionOf<HTMLUListElement> = li.getElementsByTagName("ul");
        button.innerHTML = "+<span>Expand this folder</span>";
        button.setAttribute("title", "Collapse this folder");
        if (ul.length > 0) {
            li.removeChild(li.getElementsByTagName("ul")[0]);
        }
    }
};

/* Builds the HTML file list */
fileBrowser.list = function browser_fileBrowser_list(location:string, dirs:directoryResponse):Element {
    const local:directoryList = [],
        listLength:number = dirs.length,
        output:HTMLElement = document.createElement("ul");
    let a:number = 0,
        localLength:number = 0;
    if (dirs === "missing" || dirs === "noShare" || dirs === "readOnly") {
        const p:Element = document.createElement("p");
        p.setAttribute("class", "error");
        if (dirs === "missing") {
            p.innerHTML = `Error 404: Requested location is not available or machine is offline.`;
        } else if (dirs === "noShare") {
            p.innerHTML = "Error 403: Forbidden. Requested location is likely not shared.";
        } else {
            p.innerHTML = "Error 406: Not accepted. Read only shares cannot be modified.";
        }
        return p;
    }

    if (listLength > 0) {
        do {
            if (dirs[a][3] === 0) {
                local.push(dirs[a]);
            }
            a = a + 1;
        } while (a < listLength);
    }

    local.sort(function browser_fileBrowser_list_sort(a:directoryItem, b:directoryItem):number {
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
                    output.appendChild(fileBrowser.listItem(local[a], "lastType"));
                } else {
                    output.appendChild(fileBrowser.listItem(local[a], ""));
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
    output.oncontextmenu = context.menu;
    output.onkeydown = util.keys;
    output.onclick = fileBrowser.listFocus;
    output.onmousedown = function browser_fileBrowser_list_dragSelect(event:MouseEvent):void {
        util.dragBox(event, util.dragList);
    };
    output.setAttribute("class", "fileList");
    return output;
};

/* Display status information when the Operating system locks files from access */
fileBrowser.listFail = function browser_fileBrowser_listFail(count:number, box:Element):void {
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
};

/* When clicking on a file list give focus to an input field so that the list can receive focus */
fileBrowser.listFocus = function browser_fileBrowser_listFocus(event:MouseEvent):void {
    const element:Element = <Element>event.target,
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
};

/* Build a single file system object from data */
fileBrowser.listItem = function browser_fileBrowser_listItem(item:directoryItem, extraClass:string):Element {
    const li:HTMLElement = document.createElement("li"),
        label:HTMLLabelElement = document.createElement("label"),
        p:HTMLElement = document.createElement("p"),
        text:HTMLElement = document.createElement("label"),
        input:HTMLInputElement = document.createElement("input"),
        mouseOver = function browser_fileBrowser_listItem_mouseOver(event:MouseEvent):void {
            const dragBox:Element = document.getElementById("dragBox"),
                element:HTMLElement = <HTMLElement>event.target;
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
    } else if (item[1] === "directory") {
        if (item[4] > 0) {
            const button = document.createElement("button");
            button.setAttribute("class", "expansion");
            button.innerHTML = "+<span>Expand this folder</span>";
            button.setAttribute("title", "Expand this folder");
            button.onclick = fileBrowser.expand;
            li.appendChild(button);
        }
        span = document.createElement("span");
        if (item[3] === 1) {
            plural = "";
        } else {
            plural = "s";
        }
        span.textContent = `directory - ${common.commas(item[4])} item${plural}`;
        li.ondblclick = fileBrowser.directory;
    } else {
        span = document.createElement("span");
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
    p.oncontextmenu = context.menu;
    p.onclick = fileBrowser.select;
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
        li.setAttribute("class", `${item[1]} ${extraClass}`);
    } else {
        li.setAttribute("class", item[1]);
    }
    li.onmousedown = fileBrowser.drag;
    li.onmouseover = mouseOver;
    li.ontouchstart = fileBrowser.drag;
    return li;
};

/* Updates the address of a fileNavigate modal in both UI and state */
fileBrowser.modalAddress = function browser_fileBrowser_modalAddress(config:modalHistoryConfig):void {
    const modalData:modal = browser.data.modals[config.id],
        modalItem:Element = document.getElementById(config.id),
        lastHistory:string = modalData.history[modalData.history.length - 1],
        windows:boolean = ((/^\w:/).test(config.address.replace(/\s+/, "")) || config.address === "\\");
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
            config.payload.modalAddress = config.address;
            if (config.payload.action === "fs-directory" && config.payload.name !== "expand" && config.payload.location[0] === "**root**") {
                config.payload.location[0] = config.address;
            }
        }
    }
    modalData.text_value = config.address;
    if (config.history === true && ((config.address !== lastHistory && windows === false) || (config.address.toLowerCase() !== lastHistory.toLowerCase() && windows === true))) {
        modalData.history.push(config.address);
    }
    modalItem.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value = config.address;
    network.storage("settings", null);
    if (config.payload !== null) {
        network.fileBrowser(config.payload, null);
    }
};

/* Create a file navigator modal */
fileBrowser.navigate = function browser_fileBrowser_navigate(event:MouseEvent, config?:navConfig):void {
    const agentName:string = (config === undefined || config.agentName === undefined)
            ? browser.data.hashDevice
            : config.agentName,
        agentType:agentType = (agentName === browser.data.hashDevice)
            ? "device"
            : config.agentType,
        location:string = (config !== undefined && typeof config.path === "string")
            ? config.path
            : "**root**",
        share:string = (config === undefined || config.share === undefined)
            ? ""
            : config.share,
        readOnly:boolean = (agentName !== browser.data.hashDevice && config !== undefined && config.readOnly === true),
        readOnlyString:string = (readOnly === true)
            ? "(Read Only) "
            : "",
        callback:Function = function browser_fileBrowser_navigate_callback(responseText:string):void {
            if (responseText === "") {
                return;
            }
            const status:fsStatusMessage = JSON.parse(responseText),
                replaceAddress:boolean = (location === "**root**");
            if (box === null) {
                return;
            }
            util.fileListStatus(status);
            if (replaceAddress === true) {
                let loc:string = (replaceAddress === true && typeof status.fileList !== "string")
                    ? status.fileList[0][0]
                    : location;
                const modal:modal = browser.data.modals[id];
                box.getElementsByTagName("input")[0].value = (typeof status.fileList === "string")
                    ? "/"
                    : status.fileList[0][0];
                modal.text_value = loc;
                modal.history[modal.history.length - 1] = loc;
                network.storage("settings", null);
            }
        },
        payloadNetwork:systemDataFile = {
            action: "fs-directory",
            agent: agentName,
            agentType: agentType,
            depth: 2,
            location: [location],
            modalAddress: location,
            name: "navigate",
            share: share,
            watch: "yes"
        },
        payloadModal:modal = {
            agent: agentName,
            agentType: agentType,
            content: util.delay(),
            inputs: ["close", "maximize", "minimize", "text"],
            read_only: readOnly,
            selection: {},
            share: share,
            status_bar: true,
            text_event: fileBrowser.text,
            text_placeholder: "Optionally type a file system address here.",
            text_value: location,
            title: `${document.getElementById("fileNavigator").innerHTML} ${readOnlyString}- ${common.capitalize(agentType)}, ${browser[agentType][agentName].name}`,
            type: "fileNavigate",
            width: 800
        },
        box:Element = modal.create(payloadModal),
        id:string = box.getAttribute("id");
    network.fileBrowser(payloadNetwork, callback);
    document.getElementById("menu").style.display = "none";
};

/* Request file system information of the parent directory */
fileBrowser.parent = function browser_fileBrowser_parent(event:MouseEvent):boolean {
    const element:Element = <HTMLInputElement>event.target,
        header:Element = <Element>element.parentNode,
        input:HTMLInputElement = header.getElementsByTagName("input")[0],
        slash:string = (input.value.indexOf("/") > -1 && (input.value.indexOf("\\") < 0 || input.value.indexOf("\\") > input.value.indexOf("/")))
            ? "/"
            : "\\",
        value:string = input.value,
        bodyParent:Element = <Element>element.parentNode.parentNode,
        box:Element = <Element>bodyParent.parentNode,
        agency:agency = util.getAgent(box),
        id:string = box.getAttribute("id"),
        newAddress:string = (function browser_fileBrowser_parent_newAddress():string {
            if ((/^\w:\\$/).test(value) === true) {
                return "\\";
            }
            if (value.indexOf(slash) === value.lastIndexOf(slash)) {
                return value.slice(0, value.lastIndexOf(slash) + 1);
            }
            return value.slice(0, value.lastIndexOf(slash));
        }()),
        payload:systemDataFile = {
            action: "fs-directory",
            agent: agency[0],
            agentType: agency[2],
            depth: 2,
            location: [newAddress],
            modalAddress: newAddress,
            name: "",
            share: browser.data.modals[id].share,
            watch: value
        };
    if (value === "\\" || value === "/") {
        return false;
    }
    fileBrowser.modalAddress({
        address: newAddress,
        history: true,
        id: id,
        payload: payload
    });
};

/* The front-side of renaming a file system object */
fileBrowser.rename = function browser_fileBrowser_rename(event:MouseEvent):void {
    const element:Element = (context.element === null)
            ? <Element>event.target
            : context.element,
        box:Element = element.getAncestor("box", "class"),
        addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
        id:string = box.getAttribute("id"),
        input:HTMLInputElement = document.createElement("input"),
        li:Element = element.getAncestor("li", "tag"),
        menu:Element = document.getElementById("contextMenu"),
        action = <EventHandlerNonNull>function browser_fileBrowser_rename_action(action:KeyboardEvent):void {
            if (action.type === "blur" || (action.type === "keyup" && action.key === "Enter")) {
                input.value = input.value.replace(/(\s+|\.)$/, "");
                if (dir + input.value === text) {
                    label.innerHTML = text;
                } else {
                    const agency:agency = util.getAgent(element),
                        payload:systemDataFile = {
                            action: "fs-rename",
                            agent: agency[0],
                            agentType: agency[2],
                            depth: 1,
                            location: [text.replace(/\\/g, "\\\\")],
                            modalAddress: addressField.value,
                            name: input.value,
                            share: browser.data.modals[id].share,
                            watch: "no"
                        };
                    input.onblur = null;
                    input.onkeyup = null;
                    label.removeChild(input);
                    label.innerHTML = label.innerHTML + input.value;
                    network.fileBrowser(payload, null);
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
        slash:"\\" | "/" = "/",
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
    input.onblur = action;
    input.onkeyup = action;
    dir = dirs.join(slash) + slash;
    label.innerHTML = dir;
    label.appendChild(input);
    input.focus();
    context.element = null;
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

/* A service to write file changes to the file system */
fileBrowser.saveFile = function browser_fileBrowser_saveFile(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        box:Element = element.getAncestor("box", "class"),
        addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
        id:string = box.getAttribute("id"),
        content:string = box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].value,
        agency:agency = util.getAgent(box),
        title:Element = box.getElementsByTagName("h2")[0].getElementsByTagName("button")[0],
        location:string[] = title.innerHTML.split(" - "),
        payload:systemDataFile = {
            action: "fs-write",
            agent: agency[0],
            agentType: agency[2],
            depth: 1,
            location: [location[location.length - 1]],
            modalAddress: addressField.value,
            name: content,
            share: browser.data.modals[id].share,
            watch: "no"
        },
        callback = function browser_fileBrowser_saveFile_callback(message:string):void {
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
    network.fileBrowser(payload, callback);
};

/* Search for file system artifacts from a modal's current location */
fileBrowser.search = function browser_fileBrowser_search(event?:KeyboardEvent, searchElement?:HTMLInputElement, callback?:Function):void {
    const element:HTMLInputElement = (searchElement === undefined)
            ? <HTMLInputElement>event.target
            : searchElement,
        addressLabel:HTMLElement = <HTMLElement>element.parentNode.previousSibling;
    if (event !== null && event.type === "blur") {
        const searchParent:HTMLElement = <HTMLElement>element.parentNode;
        searchParent.style.width = "12.5%";
        addressLabel.style.width = "87.5%";
    }
    if (event === null || (event.type === "keyup" && event.key === "Enter")) {
        const box:Element = element.getAncestor("box", "class"),
            body:Element = box.getElementsByClassName("body")[0],
            addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
            addressElement:HTMLInputElement = addressLabel.getElementsByTagName("input")[0],
            address:string = addressElement.value,
            statusBar:Element = box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0],
            id:string = box.getAttribute("id"),
            value:string = element.value,
            agency:agency = util.getAgent(box),
            payload:systemDataFile = {
                action: "fs-search",
                agent: agency[0],
                agentType: agency[2],
                depth: 0,
                location: [address],
                modalAddress: addressField.value,
                name: value,
                share: browser.data.modals[id].share,
                watch: "no"
            },
            netCallback = function browser_fileBrowser_search_callback(responseText:string):void {
                if (responseText === "") {
                    const local:string = (box.getAttribute("data-agent") === browser.data.hashDevice)
                        ? "."
                        : " or remote user is offline.";
                    body.innerHTML = `<p class="error">Error 404: Requested location is no longer available${local}</p>`;
                } else {
                    const dirData = JSON.parse(responseText),
                        length:number = dirData.dirs.length,
                        statusString = function browser_fileBrowser_search_statusString(length:number):void {
                            const plural:string = (dirData.dirs.length === 1)
                                ? ""
                                : "es";
                            statusBar.innerHTML = `Search fragment "<em>${value}</em>" returned <strong>${common.commas(length)}</strong> match${plural} from <em>${address}</em>.`;
                        };
                    if (dirData.dirs === "missing" || dirData.dirs === "noShare" || dirData.dirs === "readOnly" || length < 1) {
                        const p:HTMLElement = document.createElement("p");
                        p.setAttribute("class", "error");
                        if (dirData.dirs === "missing") {
                            p.innerHTML = "The matching results are no longer available.";
                        } else if (dirData.dirs === "noShare") {
                            p.innerHTML = "The matching results are no longer shared.";
                        } else if (dirData.dirs === "readOnly") {
                            p.innerHTML = "The matching results are restricted to a read only share.";
                        } else {
                            p.innerHTML = "There are no matching results.";
                        }
                        body.innerHTML = "";
                        body.appendChild(p);
                        statusString(0);
                    } else {
                        const output:HTMLElement = document.createElement("ul");
                        let a:number = 0;
                        output.tabIndex = 0;
                        output.oncontextmenu = context.menu;
                        output.onkeydown = util.keys;
                        output.onclick = fileBrowser.listFocus;
                        output.onmousedown = function browser_fileBrowser_list_dragSelect(event:MouseEvent):void {
                            util.dragBox(event, util.dragList);
                        };
                        output.setAttribute("class", "fileList");
                        statusString(length);
                        dirData.dirs.sort(function browser_fileBrowser_search_callback_sort(a:directoryItem, b:directoryItem):number {
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
                            output.appendChild(fileBrowser.listItem(dirData.dirs[a], ""));
                            a = a + 1;
                        } while (a < length);
                        body.innerHTML = "";
                        body.appendChild(output);
                        if (callback !== undefined) {
                            callback();
                        }
                    }
                }
            };
        body.innerHTML = "";
        body.append(util.delay());
        if (element.value.replace(/\s+/, "") === "") {
            addressElement.focus();
            addressElement.blur();
            element.focus();
            browser.data.modals[id].search = [address, ""];
            return;
        }
        if (browser.loadFlag === false) {
            browser.data.modals[id].search = [address, value];
            browser.data.modals[id].selection = {};
            network.storage("settings", null);
        }
        network.fileBrowser(payload, netCallback);
    }
};

/* Expand the search field to a large size when focused */
fileBrowser.searchFocus = function browser_fileBrowser_searchFocus(event:Event):void {
    const search:Element = <Element>event.target,
        searchParent:HTMLElement = <HTMLElement>search.parentNode,
        address:HTMLElement = <HTMLElement>searchParent.previousSibling;
    searchParent.style.width = "60%";
    address.style.width = "40%";
};

/* Select a file system item for an action */
fileBrowser.select = function browser_fileBrowser_select(event:KeyboardEvent):void {
    event.preventDefault();
    context.menuRemove();
    const element:Element = (function browser_fileBrowser_select_element():Element {
            const el:Element = <Element>event.target;
            if (el.nodeName.toLowerCase() === "li") {
                return el;
            }
            return el.getAncestor("li", "tag");
        }()),
        p:Element = element.getElementsByTagName("p")[0],
        classy:string = p.getAttribute("class"),
        parent:HTMLElement = <HTMLElement>p.parentNode,
        input:HTMLInputElement = parent.getElementsByTagName("input")[0];
    let state:boolean = input.checked,
        body:Element = p,
        box:Element,
        modalData:modal;
    if (document.getElementById("newFileItem") !== null) {
        return;
    }
    if (fileBrowser.dragFlag !== "") {
        event.preventDefault();
        event.stopPropagation();
    }
    input.focus();
    modal.zTop(event);
    body = body.getAncestor("body", "class");
    box = <Element>body.parentNode.parentNode;
    modalData = browser.data.modals[box.getAttribute("id")];

    if (document.getElementById("dragBox") !== null) {
        return;
    }

    if (event.ctrlKey === true || fileBrowser.dragFlag === "control") {
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
    } else if (event.shiftKey === true || fileBrowser.dragFlag === "shift") {
        const liList = body.getElementsByTagName("p"),
            shift = function browser_fileBrowser_select_shift(index:number, end:number):void {
                let liClassy:string,
                    liParent:HTMLElement;
                if (state === true) {
                    do {
                        liClassy = liList[index].getAttribute("class");
                        liParent = <HTMLElement>liList[index].parentNode;
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
                        liParent = <HTMLElement>liList[index].parentNode;
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
        const inputs = body.getElementsByTagName("input"),
            inputsLength = inputs.length,
            selected:boolean = (p.getAttribute("class") !== null && p.getAttribute("class").indexOf("selected") > -1);
        let a:number = 0,
            item:Element,
            itemClass:string,
            itemParent:HTMLElement;
        do {
            if (inputs[a].checked === true) {
                inputs[a].checked = false;
                itemParent = <HTMLElement>inputs[a].parentNode.parentNode;
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
    network.storage("settings", null);
};

/* Requests file system data from a text field, such as manually typing an address */
fileBrowser.text = function browser_fileBrowser_text(event:KeyboardEvent):void {
    let box:Element,
        history:boolean = true;
    const element:HTMLInputElement = (function browser_fileBrowser_text_element():HTMLInputElement {
            let el = <HTMLInputElement>event.target;
            box = el.getAncestor("box", "class");
            if (el.nodeName.toLowerCase() === "input") {
                return el;
            }
            history = false;
            return box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0];
        }()),
        address:string = element.value;
    if (address.replace(/\s+/, "") !== "" && (history === false || event.type === "blur" || (event.type === "keyup" && event.key === "Enter"))) {
        const id:string = box.getAttribute("id"),
            agency:agency = util.getAgent(box),
            payload:systemDataFile = {
                action: "fs-directory",
                agent: agency[0],
                agentType: agency[2],
                depth: 2,
                location: [address],
                modalAddress: address,
                name: "",
                share: browser.data.modals[id].share,
                watch: address
            };
        fileBrowser.modalAddress({
            address: address,
            id: id,
            history: history,
            payload: payload
        });
    }
};

export default fileBrowser;