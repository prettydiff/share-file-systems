
/* lib/browser/fs - A collection of utilities for handling file system related tasks in the browser. */
import browser from "./browser.js";
import context from "./context.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";
import commas from "../common/commas.js";

const fs:module_fs = {};

/* step back through a modal's address history */
fs.back = function local_fs_back(event:MouseEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        box:Element = element.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        header:Element = box.getElementsByClassName("header")[0],
        address:HTMLInputElement = <HTMLInputElement>header.getElementsByTagName("input")[0],
        history = browser.data.modals[id].history;
    if (history.length > 1) {
        history.pop();
        address.value = history[history.length - 1];
        fs.text(event);
    }
};

/* navigate into a directory by double click */
fs.directory = function local_fs_directory(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        li:Element = (element.nodeName.toLowerCase() === "li")
            ? element
            : <Element>element.getAncestor("li", "tag"),
        body:Element = li.getAncestor("body", "class"),
        box:Element = <Element>body.parentNode.parentNode,
        input:HTMLInputElement = box.getElementsByTagName("input")[0],
        path:string = li.getElementsByTagName("label")[0].innerHTML,
        agency:agency = util.getAgent(box),
        id:string = box.getAttribute("id"),
        callback = function local_fs_directory_callback(responseText:string):void {
            const list:[Element, number, string] = fs.list(path, JSON.parse(responseText));
            body.innerHTML = "";
            body.appendChild(list[0]);
            fs.listFail(list[1], box);
            browser.data.modals[box.getAttribute("id")].text_value = path;
            box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = list[2];
            network.storage("settings");
        },
        payload:fileService = {
            action: "fs-directory",
            agent: agency[0],
            agentType: agency[2],
            copyAgent: "",
            copyType: "device",
            depth: 2,
            id: id,
            location: [path],
            name: "",
            share: browser.data.modals[id].share,
            watch: path
        };
    event.preventDefault();
    input.value = path;
    browser.data.modals[box.getAttribute("id")].history.push(path);
    network.fs(payload, callback);
};

/* drag and drop of selected list items */
fs.drag = function local_fs_drag(event:MouseEvent|TouchEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        item:Element = (function local_fs_drag_item():Element {
            let el:Element = element;
            if (el.nodeName.toLowerCase() !== "label" && el.nodeName.toLowerCase() !== "span") {
                event.preventDefault();
            }
            if (el.nodeName.toLowerCase() === "li") {
                return el;
            }
            return el.getAncestor("li", "tag");
        }()),
        fileList:Element = (function local_fs_drag_fileList():Element {
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
        mouseDown = function local_fs_drag_document(documentEvent:MouseEvent):void {
            documentEvent.preventDefault();
        },
        drop = function local_fs_drag_drop(dropEvent:MouseEvent|TouchEvent):void {
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
            const addresses:string[] = (function local_fs_drag_drop_addresses():string[] {
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
                target:string = (function local_fs_drag_drop_target():string {
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
                    return goal.getElementsByTagName("input")[0].value;
                }()),
                agency:agency = util.getAgent(element),
                payload:fileService = {
                    action   : (copy === true)
                        ? "fs-copy"
                        : "fs-cut",
                    agent    : browser.data.modals[id].agent,
                    agentType: browser.data.modals[id].agentType,
                    copyAgent: agency[0],
                    copyShare: browser.data.modals[box.getAttribute("id")].share,
                    copyType : agency[2],
                    depth    : 1,
                    id       : id,
                    location : addresses,
                    name     : target,
                    share    : browser.data.modals[id].share,
                    watch    : "no"
                },
                callback = function local_fs_drag_drop_callback():void {
                    return;
                };
            if (target === "") {
                return;
            }
            network.fs(payload, callback);
        },
        move = function local_fs_drag_move(moveEvent:MouseEvent|TouchEvent):boolean {
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
                        cut:boolean = true;
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
                            listItem = <HTMLElement>selected[a].parentNode.parentNode;
                            if (listItem.getAttribute("class").indexOf("cut") < 0) {
                                cut = false;
                            }
                            list.appendChild(listItem.cloneNode(true));
                            a = a + 1;
                        } while (a < length);
                        if (cut === true) {
                            copy = false;
                        }
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
        init:boolean = false,
        copy:boolean = true;
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

fs.dragFlag = "";

/* Shows child elements of a directory */
fs.expand = function local_fs_expand(event:MouseEvent):void {
    const button:Element = <Element>event.srcElement || <Element>event.target,
        box:Element = button.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        li:HTMLElement = <HTMLElement>button.parentNode;
    if (button.innerHTML.indexOf("+") === 0) {
        const agency:agency = util.getAgent(button),
            payload:fileService = {
                action: "fs-directory",
                agent: agency[0],
                agentType: agency[2],
                copyAgent: "",
                copyType: "device",
                depth: 2,
                id: id,
                location: [li.firstChild.nextSibling.textContent],
                name : "",
                share: browser.data.modals[id].share,
                watch: "no"
            },
            callback = function local_fs_expand_callback(responseText:string) {
                const list:[Element, number, string] = fs.list(li.firstChild.nextSibling.textContent, JSON.parse(responseText));
                li.appendChild(list[0]);
            };
        button.innerHTML = "-<span>Collapse this folder</span>";
        button.setAttribute("title", "Collapse this folder");
        network.fs(payload, callback);
    } else {
        const ul:HTMLCollectionOf<HTMLUListElement> = li.getElementsByTagName("ul");
        button.innerHTML = "+<span>Expand this folder</span>";
        button.setAttribute("title", "Collapse this folder");
        if (ul.length > 0) {
            li.removeChild(li.getElementsByTagName("ul")[0]);
        }
    }
    event.stopPropagation();
};

/* Builds the HTML file list */
fs.list = function local_fs_list(location:string, dirData:fsRemote):[Element, number, string] {
    const local:directoryList = [],
        list:directoryList = <directoryList>dirData.dirs,
        length:number = list.length,
        output:HTMLElement = document.createElement("ul"),
        failLength:number = (dirData.fail === undefined)
            ? 0
            : dirData.fail.length,
        box:Element = document.getElementById(dirData.id),
        count:[number, number, number, number] = [0, 0, 0, 0],
        plural = function local_fs_list_plural(input:string, quantity:number):string {
            if (quantity === 1) {
                return input;
            }
            if (input === "directory") {
                return "directories";
            }
            return `${input}s`;
        };
    let a:number = 0,
        localLength:number = 0,
        status:string = "";
    if (dirData.dirs === "missing" || dirData.dirs === "noShare" || dirData.dirs === "readOnly") {
        const p:Element = document.createElement("p");
        p.setAttribute("class", "error");
        if (dirData.dirs === "missing") {
            const local:string = (box.getAttribute("data-agent") === browser.data.hashDevice)
                ? "."
                : " or remote user is offline.";
            p.innerHTML = `Error 404: Requested location is not available${local}`;
        } else if (dirData.dirs === "noShare") {
            p.innerHTML = "Error 403: Forbidden. Requested location is likely not shared.";
        } else {
            p.innerHTML = "Error 406: Not accepted. Read only shares cannot be modified.";
        }
        if (box !== null) {
            const body:Element = box.getElementsByClassName("body")[0];
            body.innerHTML = "";
            body.appendChild(p);
        }
        return [p, 0, ""];
    }

    a = 0;
    do {
        if (list[a][3] === 0) {
            local.push(list[a]);
            if (list[a][1] === "directory") {
                count[0] = count[0] + 1;
            } else if (list[a][1] === "file") {
                count[1] = count[1] + 1;
            } else if (list[a][1] === "link") {
                count[2] = count[2] + 1;
            } else {
                count[3] = count[3] + 1;
            }
        }
        a = a + 1;
    } while (a < length);
    count[0] = count[0] - 1;
    status = (location === "\\")
        ? `${count[0]} ${plural("drive", list.length)}`
        : `${count[0]} ${plural("directory", count[0])}, ${count[1]} ${plural("file", count[1])}, ${count[2]} ${plural("symbolic link", count[2])}, ${count[3]} ${plural("error", count[3])}`;
    local.sort(function local_fs_list_sort(a:directoryItem, b:directoryItem):number {
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
                    output.appendChild(fs.listItem(local[a], "lastType"));
                } else {
                    output.appendChild(fs.listItem(local[a], ""));
                }
            }
            a = a + 1;
        } while (a < localLength);
    }
    output.tabIndex = 0;
    output.title = list[0][0];
    output.oncontextmenu = context.menu;
    output.onkeydown = util.keys;
    output.onclick = fs.listFocus;
    output.onmousedown = function local_fs_list_dragSelect(event:MouseEvent):void {
        util.dragBox(event, util.dragList);
    };
    output.setAttribute("class", "fileList");
    return [output, failLength, status];
};

/* Display status information when the Operating system locks files from access */
fs.listFail = function local_fs_listFail(count:number, box:Element):void {
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
fs.listFocus = function local_fs_listFocus(event:MouseEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
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
fs.listItem = function local_fs_listItem(item:directoryItem, extraClass:string):Element {
    const li:HTMLElement = document.createElement("li"),
        label:HTMLLabelElement = document.createElement("label"),
        text:HTMLElement = document.createElement("label"),
        input:HTMLInputElement = document.createElement("input"),
        mouseOver = function local_fs_listItem_mouseOver(event:MouseEvent):void {
            const dragBox:Element = document.getElementById("dragBox"),
                element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
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
        span.textContent = `file - ${commas(item[5].size)} byte${plural}`;
    } else if (item[1] === "directory") {
        if (item[4] > 0) {
            const button = document.createElement("button");
            button.setAttribute("class", "expansion");
            button.innerHTML = "+<span>Expand this folder</span>";
            button.setAttribute("title", "Expand this folder");
            button.onclick = fs.expand;
            li.appendChild(button);
        }
        span = document.createElement("span");
        if (item[3] === 1) {
            plural = "";
        } else {
            plural = "s";
        }
        span.textContent = `directory - ${commas(item[4])} item${plural}`;
        li.ondblclick = fs.directory;
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
    text.oncontextmenu = context.menu;
    text.onclick = fs.select;
    li.appendChild(text);

    // prepare the descriptive text
    span.onclick = fs.select;
    span.oncontextmenu = context.menu;
    li.appendChild(span);

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
    li.onclick = fs.select;
    li.oncontextmenu = context.menu;
    li.onkeydown = util.keys; // key combinations
    li.onmousedown = fs.drag;
    li.onmouseover = mouseOver;
    li.ontouchstart = fs.drag;
    return li;
};

/* Create a file navigator modal */
fs.navigate = function local_fs_navigate(event:MouseEvent, config?:navConfig):void {
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
        callback:Function = function local_fs_navigate_callback(responseText:string):void {
            if (responseText === "") {
                return;
            }
            const payload:fsRemote = JSON.parse(responseText),
                box:Element = document.getElementById(payload.id),
                replaceAddress:boolean = (location === "**root**");
            if (box === null) {
                return;
            }
            let loc:string = (replaceAddress === true)
                    ? payload.dirs[0][0]
                    : location,
            body:Element = box.getElementsByClassName("body")[0],
                files:Element = (payload.dirs === "missing")
                    ? (function local_fs_navigate_callback_missing():Element {
                        const p:Element = document.createElement("p");
                        p.innerHTML = "Error 404: This directory or object is missing or unavailable.";
                        p.setAttribute("class", "error");
                        return p;
                    }())
                    : fs.list(loc, payload)[0];
            if (replaceAddress === true) {
                const modal:ui_modal = browser.data.modals[payload.id];
                box.getElementsByTagName("input")[0].value = loc;
                modal.text_value = loc;
                modal.history[modal.history.length - 1] = loc;
                network.storage("settings");
            }
            body.innerHTML = "";
            body.appendChild(files);
        },
        payloadNetwork:fileService = {
            action: "fs-directory",
            agent: agentName,
            agentType: agentType,
            copyAgent: "",
            copyType: "device",
            depth: 2,
            id: browser.data.hashDevice,
            location: [location],
            name: "",
            share: share,
            watch: "yes"
        },
        payloadModal:ui_modal = {
            agent: agentName,
            agentType: agentType,
            content: util.delay(),
            inputs: ["close", "maximize", "minimize", "text"],
            read_only: readOnly,
            selection: {},
            share: share,
            status_bar: true,
            text_event: fs.text,
            text_placeholder: "Optionally type a file system address here.",
            text_value: location,
            title: `${document.getElementById("fileNavigator").innerHTML} ${readOnlyString}- ${agentType.charAt(0).toUpperCase() + agentType.slice(1)}, ${browser[agentType][agentName].name}`,
            type: "fileNavigate",
            width: 800
        },
        box:Element = modal.create(payloadModal);
    payloadNetwork.id = box.getAttribute("id");
    network.fs(payloadNetwork, callback);
    document.getElementById("menu").style.display = "none";
};

/* Request file system information of the parent directory */
fs.parent = function local_fs_parent(event:MouseEvent):boolean {
    const element:Element = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        header:Element = <Element>element.parentNode,
        input:HTMLInputElement = header.getElementsByTagName("input")[0],
        slash:string = (input.value.indexOf("/") > -1 && (input.value.indexOf("\\") < 0 || input.value.indexOf("\\") > input.value.indexOf("/")))
            ? "/"
            : "\\",
        value:string = input.value,
        bodyParent:Element = <Element>element.parentNode.parentNode,
        body:Element = bodyParent.getElementsByTagName("div")[0],
        box:Element = <Element>bodyParent.parentNode,
        agency:agency = util.getAgent(box),
        id:string = box.getAttribute("id"),
        newAddress:string = (function local_fs_parent_newAddress():string {
            if ((/^\w:\\$/).test(value) === true) {
                return "\\";
            }
            if (value.indexOf(slash) === value.lastIndexOf(slash)) {
                return value.slice(0, value.lastIndexOf(slash) + 1);
            }
            return value.slice(0, value.lastIndexOf(slash));
        }()),
        payload:fileService = {
            action: "fs-directory",
            agent: agency[0],
            agentType: agency[2],
            copyAgent: "",
            copyType: "device",
            depth: 2,
            id: id,
            location: [newAddress],
            name: "",
            share: browser.data.modals[id].share,
            watch: value
        },
        callback = function local_fs_parent_callback(responseText:string):void {
            const list:[Element, number, string] = fs.list(newAddress, JSON.parse(responseText));
            input.value = newAddress;
            body.innerHTML = "";
            body.appendChild(list[0]);
            fs.listFail(list[1], box);
            box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = list[2];
            browser.data.modals[id].text_value = newAddress;
            network.storage("settings");
        };
    if (value === "\\" || value === "/") {
        return false;
    }
    browser.data.modals[id].history.push(newAddress);
    network.fs(payload, callback);
};

/* The front-side of renaming a file system object */
fs.rename = function local_fs_rename(event:MouseEvent):void {
    const element:Element = (context.element === null)
            ? <Element>event.srcElement || <Element>event.target
            : context.element,
        box:Element = element.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        input:HTMLInputElement = document.createElement("input"),
        li:Element = element.getAncestor("li", "tag"),
        action = <EventHandlerNonNull>function local_fs_rename_action(action:KeyboardEvent):void {
            if (action.type === "blur" || (action.type === "keyup" && action.key === "Enter")) {
                input.value = input.value.replace(/(\s+|\.)$/, "");
                if (dir + input.value === text) {
                    label.innerHTML = text;
                } else {
                    const agency:agency = util.getAgent(element),
                        payload:fileService = {
                            action: "fs-rename",
                            agent: agency[0],
                            agentType: agency[2],
                            copyAgent: "",
                            copyType: "device",
                            depth: 1,
                            id: id,
                            location: [text.replace(/\\/g, "\\\\")],
                            name: input.value,
                            share: browser.data.modals[id].share,
                            watch: "no"
                        },
                        callback = function local_fs_rename_callback():void {
                            label.removeChild(input);
                            label.innerHTML = label.innerHTML + input.value;
                        };
                    network.fs(payload, callback);
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
};

/* A service to write file changes to the file system */
fs.saveFile = function local_fs_saveFile(event:MouseEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        box:Element = element.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        content:string = box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].value,
        agency:agency = util.getAgent(box),
        title:Element = box.getElementsByTagName("h2")[0].getElementsByTagName("button")[0],
        location:string[] = title.innerHTML.split(" - "),
        payload:fileService = {
            action: "fs-write",
            agent: agency[0],
            agentType: agency[2],
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: box.getAttribute("id"),
            location: [location[location.length - 1]],
            name: content,
            share: browser.data.modals[id].share,
            watch: "no"
        },
        callback = function local_fs_saveFile_callback(message:string):void {
            const footer:Element = box.getElementsByClassName("footer")[0],
                body:Element = box.getElementsByClassName("body")[0],
                buttons:Element = footer.getElementsByClassName("footer-buttons")[0],
                pList:HTMLCollectionOf<Element> = footer.getElementsByTagName("p"),
                p:HTMLElement = document.createElement("p");
            p.innerHTML = message;
            p.setAttribute("class", "message");
            if (pList[0] !== buttons) {
                footer.removeChild(pList[0]);
            }
            p.style.width = `${(body.clientWidth - buttons.clientWidth - 40) / 15}em`;
            footer.insertBefore(p, pList[0]);
        };
    network.fs(payload, callback);
};

/* Search for file system artifacts from a modal's current location */
fs.search = function local_fs_search(event?:KeyboardEvent, searchElement?:HTMLInputElement, callback?:Function):void {
    const element:HTMLInputElement = (searchElement === undefined)
            ? <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target
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
            addressElement:HTMLInputElement = addressLabel.getElementsByTagName("input")[0],
            address:string = addressElement.value,
            statusBar:Element = box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0],
            id:string = box.getAttribute("id"),
            value:string = element.value,
            agency:agency = util.getAgent(box),
            payload:fileService = {
                action: "fs-search",
                agent: agency[0],
                agentType: agency[2],
                copyAgent: "",
                copyType: "device",
                depth: 0,
                id: id,
                location: [address],
                name: value,
                share: browser.data.modals[id].share,
                watch: "no"
            },
            netCallback = function local_fs_search_callback(responseText:string):void {
                if (responseText === "") {
                    const local:string = (box.getAttribute("data-agent") === browser.data.hashDevice)
                        ? "."
                        : " or remote user is offline.";
                    body.innerHTML = `<p class=\"error\">Error 404: Requested location is no longer available${local}</p>`;
                } else {
                    const dirData = JSON.parse(responseText),
                        length:number = dirData.dirs.length,
                        statusString = function local_fs_search_statusString(length:number):void {
                            const plural:string = (dirData.dirs.length === 1)
                                ? ""
                                : "es";
                            statusBar.innerHTML = `Search fragment "<em>${value}</em>" returned <strong>${commas(length)}</strong> match${plural} from <em>${address}</em>.`;
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
                        output.onclick = fs.listFocus;
                        output.onmousedown = function local_fs_list_dragSelect(event:MouseEvent):void {
                            util.dragBox(event, util.dragList);
                        };
                        output.setAttribute("class", "fileList");
                        statusString(length);
                        dirData.dirs.sort(function local_fs_search_callback_sort(a:directoryItem, b:directoryItem):number {
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
                            output.appendChild(fs.listItem(dirData.dirs[a], ""));
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
        if (browser.loadTest === false) {
            browser.data.modals[id].search = [address, value];
            browser.data.modals[id].selection = {};
            network.storage("settings");
        }
        network.fs(payload, netCallback);
    }
};

/* Expand the search field to a large size when focused */
fs.searchFocus = function local_fs_searchFocus(event:Event):void {
    const search:Element = <Element>event.srcElement || <Element>event.target,
        searchParent:HTMLElement = <HTMLElement>search.parentNode,
        address:HTMLElement = <HTMLElement>searchParent.previousSibling;
    searchParent.style.width = "60%";
    address.style.width = "40%";
};

/* Select a file system item for an action */
fs.select = function local_fs_select(event:KeyboardEvent):void {
    event.preventDefault();
    event.stopPropagation();
    context.menuRemove();
    const element:Element = <Element>event.srcElement || <Element>event.target,
        li:Element = (element.nodeName.toLowerCase() === "li")
            ? element
            : <Element>element.parentNode,
        input:HTMLInputElement = li.getElementsByTagName("input")[0];
    let state:boolean = input.checked,
        body:Element = li,
        box:Element,
        modalData:ui_modal;
    if (document.getElementById("newFileItem") !== null) {
        return;
    }
    if (fs.dragFlag !== "") {
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

    if (event.ctrlKey === true || fs.dragFlag === "control") {
        if (state === true) {
            input.checked = false;
            li.setAttribute("class", li.getAttribute("class").replace(util.selectExpression, ""));
            delete modalData.selection[li.getElementsByTagName("label")[0].innerHTML];
        } else {
            input.checked = true;
            li.setAttribute("class", `${li.getAttribute("class")} selected`);
            modalData.selection[li.getElementsByTagName("label")[0].innerHTML] = "selected";
        }
    } else if (event.shiftKey === true || fs.dragFlag === "shift") {
        const liList = body.getElementsByTagName("li"),
            shift = function local_fs_select_shift(index:number, end:number):void {
                if (state === true) {
                    do {
                        liList[index].getElementsByTagName("input")[0].checked = false;
                        liList[index].setAttribute("class", liList[index].getAttribute("class").replace(util.selectExpression, ""));
                        delete  modalData.selection[liList[index].getElementsByTagName("label")[0].innerHTML];
                        index = index + 1;
                    } while (index < end);
                } else {
                    do {
                        liList[index].getElementsByTagName("input")[0].checked = true;
                        liList[index].setAttribute("class", `${liList[index].getAttribute("class")} selected`);
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
            if (liList[a] === li) {
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
                li.setAttribute("class", li.getAttribute("class").replace(util.selectExpression, ""));
                delete modalData.selection[li.getElementsByTagName("label")[0].innerHTML];
            } else {
                input.checked = true;
                li.setAttribute("class", `${li.getAttribute("class")} selected`);
                modalData.selection[li.getElementsByTagName("label")[0].innerHTML] = "selected";
            }
        } else if (focusIndex > elementIndex) {
            shift(elementIndex, focusIndex);
        } else {
            shift(focusIndex + 1, elementIndex + 1);
        }
    } else {
        const inputs = body.getElementsByTagName("input"),
            inputsLength = inputs.length,
            selected:boolean = (li.getAttribute("class").indexOf("selected") > 0);
        let a:number = 0,
            item:Element;
        do {
            if (inputs[a].checked === true) {
                inputs[a].checked = false;
                item = <Element>inputs[a].parentNode.parentNode;
                item.setAttribute("class", item.getAttribute("class").replace(util.selectExpression, ""));
            }
            a = a + 1;
        } while (a < inputsLength);
        input.checked = true;
        if (selected === false) {
            li.setAttribute("class", `${li.getAttribute("class").replace(util.selectExpression, "")} selected`);
            modalData.selection = {};
            modalData.selection[li.getElementsByTagName("label")[0].innerHTML] = "selected";
        }
    }
    modalData.focus = li;
    network.storage("settings");
};

/* Requests file system data from a text field, such as manually typing an address */
fs.text = function local_fs_text(event:KeyboardEvent):void {
    let parent:Element,
        box:Element,
        id:string,
        button:boolean = false,
        windows:boolean = false,
        historyLength:number;
    const element:HTMLInputElement = (function local_fs_text_element():HTMLInputElement {
            let el = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target;
            if (el.nodeName.toLowerCase() === "input") {
                return el;
            }
            el = <HTMLInputElement>el.parentNode;
            button = true;
            return el.getElementsByTagName("input")[0];
        }()),
        watchValue:string = element.value;
    parent = <Element>element.parentNode.parentNode.parentNode;
    box = <Element>parent.parentNode;
    id = box.getAttribute("id");
    parent = parent.getElementsByTagName("div")[0];
    if (element.value.replace(/\s+/, "") !== "" && (button === true || event.type === "blur" || (event.type === "keyup" && event.key === "Enter"))) {
        const agency:agency = util.getAgent(box),
            payload:fileService = {
                action: "fs-directory",
                agent: agency[0],
                agentType: agency[2],
                copyAgent: "",
                copyType: "device",
                depth: 2,
                id: id,
                location: [element.value],
                name: "",
                share: browser.data.modals[id].share,
                watch: watchValue
            },
            callback = function local_fs_text_callback(responseText:string):void {
                if (responseText === "") {
                    const local:string = (box.getAttribute("data-agent") === browser.data.hashDevice)
                        ? "."
                        : " or remote user is offline.";
                    parent.innerHTML = `<p class=\"error\">Error 404: Requested location is no longer available${local}</p>`;
                } else {
                    const list:[Element, number, string] = fs.list(element.value, JSON.parse(responseText));
                    parent.innerHTML = "";
                    parent.appendChild(list[0]);
                    fs.listFail(list[1], box);
                    box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = list[2];
                    browser.data.modals[id].text_value = element.value;
                    element.removeAttribute("class");
                    network.storage("settings");
                }
            };
        if ((/^\w:/).test(element.value.replace(/\s+/, "")) === true) {
            windows = true;
        }
        historyLength = browser.data.modals[id].history.length - 1;
        if (button === false && ((windows === false && element.value !== browser.data.modals[id].history[historyLength]) || (windows === true && element.value.toLowerCase() !== browser.data.modals[id].history[historyLength].toLowerCase()))) {
            browser.data.modals[id].history.push(element.value);
        }
        network.fs(payload, callback);
    }
};

export default fs;