import browser from "./browser.js";
import context from "./context.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

const fs:module_fs = {};

/* navigate into a directory by double click */
fs.directory = function local_fs_directory(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        li:HTMLElement = (element.nodeName.toLowerCase() === "li")
            ? element
            : <HTMLElement>element.parentNode,
        path:string = li.getElementsByTagName("label")[0].innerHTML;
    let body:HTMLElement = li,
        box:HTMLElement,
        input:HTMLInputElement,
        watchValue:string;
    event.preventDefault();
    do {
        body = <HTMLElement>body.parentNode;
    } while (body !== document.documentElement && body.getAttribute("class") !== "body");
    box = <HTMLElement>body.parentNode.parentNode;
    input = box.getElementsByTagName("input")[0];
    watchValue = input.value;
    input.value = path;
    network.fs({
        action: "fs-directory",
        agent: util.getAgent(box)[0],
        copyAgent: "",
        depth: 2,
        id: box.getAttribute("id"),
        location: [path],
        name: "",
        watch: watchValue
    }, function local_fs_directory_callback(responseText:string):void {
        const list:[HTMLElement, number] = fs.list(path, JSON.parse(responseText));
        body.innerHTML = "";
        body.appendChild(list[0]);
        fs.listFail(list[1], box);
        browser.data.modals[box.getAttribute("id")].text_value = path;
        network.storage("settings");
    });
};

/* Shows child elements of a directory */
fs.expand = function local_fs_expand(event:MouseEvent):void {
    const button:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        box:HTMLElement = (function local_fs_saveFile_box():HTMLElement {
            let el:HTMLElement = button;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "box");
            return el;
        }()),
        li:HTMLElement = <HTMLElement>button.parentNode;
    if (button.innerHTML.indexOf("+") === 0) {
        button.innerHTML = "-<span>Collapse this folder</span>";
        network.fs({
            action: "fs-directory",
            agent: util.getAgent(button)[0],
            copyAgent: "",
            depth: 2,
            id: box.getAttribute("id"),
            location: [li.firstChild.nextSibling.textContent],
            name : "",
            watch: "no"
        }, function local_fs_expand_callback(responseText:string) {
            const list:[HTMLElement, number] = fs.list(li.firstChild.nextSibling.textContent, JSON.parse(responseText));
            li.appendChild(list[0]);
        });
    } else {
        const ul:HTMLCollectionOf<HTMLUListElement> = li.getElementsByTagName("ul");
        button.innerHTML = "+<span>Expand this folder</span>";
        if (ul.length > 0) {
            li.removeChild(li.getElementsByTagName("ul")[0]);
        }
    }
    event.stopPropagation();
};

/* Builds the HTML file list */
fs.list = function local_fs_list(location:string, dirData:fsRemote):[HTMLElement, number] {
    const local:directoryList = [],
        list:directoryList = <directoryList>dirData.dirs,
        length:number = list.length,
        output:HTMLElement = document.createElement("ul"),
        failLength:number = (dirData.fail === undefined)
            ? 0
            : dirData.fail.length,
        modal:ui_modal = browser.data.modals[dirData.id],
        agent:string = (modal === undefined)
            ? ""
            : modal.agent,
        shares:userShares = (agent === "")
            ? []
            : browser.users[agent].shares,
        shareLength:number = shares.length,
        windows:boolean = (list[0][0].charAt(0) === "\\" || (/^\w:\\/).test(list[0][0]) === true);
    let a:number = 0,
        localLength:number = 0,
        shareBest:number = -1,
        shareTop:number = -1;
    if (dirData.dirs === "missing" || dirData.dirs === "noShare" || dirData.dirs === "readOnly") {
        const p:HTMLElement = document.createElement("p");
        p.setAttribute("class", "error");
        if (dirData.dirs === "missing") {
            p.innerHTML = "Error 404: Requested location is no longer available or remote user is offline.";
        } else if (dirData.dirs === "noShare") {
            p.innerHTML = "Error 403: Forbidden. Requested location is likely not shared.";
        } else {
            p.innerHTML = "Error 406: Not accepted. Read only shares cannot be modified.";
        }
        if (document.getElementById(dirData.id) !== null) {

        }
        return [p, 0];
    }
    if (shareLength > 0) {
        const box:HTMLElement = document.getElementById(dirData.id);
        if (box !== null) {
            const parent:HTMLElement = <HTMLElement>box.getElementsByClassName("parentDirectory")[0],
                title:HTMLElement = <HTMLElement>box.getElementsByClassName("heading")[0].getElementsByTagName("button")[0];
            do {
                if (list[0][0].indexOf(shares[a].name) === 0 || (windows === true && list[0][0].toLowerCase().indexOf(shares[a].name.toLowerCase()) === 0)) {
                    if (shareBest < 0) {
                        shareBest = a;
                        shareTop = a;
                    }
                    if (shares[a].name.length > shares[shareBest].name.length) {
                        shareBest = a;
                    } else if (shares[a].name.length < shares[shareTop].name.length) {
                        shareTop = a;
                    }
                }
                a = a + 1;
            } while (a < shareLength);
            if (shares[shareBest].readOnly === true) {
                browser.data.modals[dirData.id].read_only = true;
                title.innerHTML = title.innerHTML.replace(/\s+(\(Read\s+Only\)\s+)?-\s+/, " (Read Only) - ");
            } else {
                browser.data.modals[dirData.id].read_only = false;
                title.innerHTML = title.innerHTML.replace(" (Read Only)", "");
            }
            if (list[0][0] === shares[shareTop].name || (windows === true && list[0][0].toLowerCase() === shares[shareTop].name.toLowerCase())) {
                parent.style.display = "none";
            } else {
                parent.style.display = "inline-block";
            }
        }
    }
    a = 0;
    do {
        if (list[a][3] === 0) {
            local.push(list[a]);
        }
        a = a + 1;
    } while (a < length);
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
    output.onkeyup = util.keys;
    output.onclick = function local_fs_list_click(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            listItems:HTMLCollectionOf<HTMLElement> = element.getElementsByTagName("li"),
            inputs:HTMLCollectionOf<HTMLElement> = listItems[listItems.length - 1].getElementsByTagName("input"),
            lastInput:HTMLElement = inputs[inputs.length - 1];
        lastInput.focus();
    };
    output.onmousedown = function local_fs_list_dragSelect(event:MouseEvent):void {
        util.dragSelect(event, function local_fs_list_dragSelect_callback():void {
            const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                li:HTMLCollectionOf<HTMLElement> = element.getElementsByTagName("li"),
                length:number = li.length,
                dragBox:HTMLElement = document.getElementById("dragBox"),
                perimeter = function local_fs_list_dragSelect_callback_perimeter(node:HTMLElement):perimeter {
                    return {
                        bottom: node.offsetTop + node.clientHeight,
                        left: node.offsetLeft,
                        right: node.offsetLeft + node.clientWidth,
                        top: node.offsetTop
                    };
                },
                liLocation:perimeter[] = [],
                control:string = (browser.characterKey.indexOf("control") > -1)
                    ? "control"
                    : "shift",
                dragArea:perimeter = perimeter(dragBox);
            let a:number = 0,
                first:number = 0,
                last:number = length - 1;
            if (dragArea.bottom < 1) {
                return;
            }
            if (length > 0) {
                do {
                    liLocation.push(perimeter(li[a]));
                    a = a + 1;
                } while (a < length);
                // since list items are vertically listed we can account for left and right bounding without a loop
                if (
                    // overlap from the middle
                    (dragArea.left >= liLocation[0].left && dragArea.right <= liLocation[0].right && (
                        (dragArea.bottom >= liLocation[length - 1].bottom && dragArea.top < liLocation[length - 1].bottom) ||
                        (dragArea.top <= liLocation[0].top && dragArea.bottom > liLocation[0].top)
                    )) ||
                    // overlap from the left
                    (dragArea.left <= liLocation[0].left && dragArea.right <= liLocation[0].right) ||
                    // overlap from the right
                    (dragArea.left <= (liLocation[0].left + li[0].clientWidth) && dragArea.right >= liLocation[0].right)
                ) {
                    a = 0;
                    do {
                        if (liLocation[a].top < dragArea.top) {
                            if (liLocation[a].bottom >= dragArea.bottom) {
                                // drag area covering only a single list item
                                li[a].click();
                                return;
                            }
                            if (dragArea.top < liLocation[a].bottom) {
                                first = a;
                                if (dragArea.bottom > liLocation[length - 1].bottom) {
                                    break;
                                }
                            }
                        } else if (liLocation[a].bottom > dragArea.bottom && dragArea.bottom > liLocation[a].top) {
                            last = a;
                            break;
                        }
                        a = a + 1;
                    } while (a < length);
                    li[first].click();
                    browser.characterKey = control;
                    li[last].click();
                    browser.characterKey = "";
                }
            }
        });
    };
    output.setAttribute("class", "fileList");
    return [output, failLength];
};

/* Display status information when the Operating system locks files from access */
fs.listFail = function local_fs_listFail(count:number, box:HTMLElement):void {
    const statusBar:HTMLElement = <HTMLElement>box.getElementsByClassName("status-bar")[0],
        p:HTMLElement = statusBar.getElementsByTagName("p")[0],
        ul:HTMLElement = statusBar.getElementsByTagName("ul")[0],
        filePlural:string = (count === 1)
            ? ""
            : "s";
    if (ul !== undefined) {
        statusBar.removeChild(ul);
    }
    if (count < 1) {
        p.innerHTML = "";
    } else {
        p.innerHTML = `${count} file${filePlural} in this query are restricted from reading by the operation system.`;
    }
};

/* Build a single file system object from data */
fs.listItem = function local_fs_listItem(item:directoryItem, extraClass:string):HTMLElement {
    const driveLetter = function local_fs_listItem_driveLetter(drive:string):string {
            return drive.replace("\\\\", "\\");
        },
        li:HTMLElement = document.createElement("li"),
        label:HTMLLabelElement = document.createElement("label"),
        text:HTMLElement = document.createElement("label"),
        input:HTMLInputElement = document.createElement("input");
    let span:HTMLElement,
        plural:string;
    if (extraClass.replace(/\s+/, "") !== "") {
        li.setAttribute("class", `${item[1]} ${extraClass}`);
    } else {
        li.setAttribute("class", item[1]);
    }
    input.type = "checkbox";
    input.checked = false;
    label.innerHTML = "Selected";
    label.appendChild(input);
    label.setAttribute("class", "selection");
    text.innerHTML = item[0].replace(/^\w:\\\\/, driveLetter);
    text.oncontextmenu = context.menu;
    text.onclick = fs.select;
    li.appendChild(text);
    if (item[1] === "file") {
        span = document.createElement("span");
        if (item[5].size === 1) {
            plural = "";
        } else {
            plural = "s";
        }
        span.textContent = `file - ${util.commas(item[5].size)} byte${plural}`;
    } else if (item[1] === "directory") {
        if (item[4] > 0) {
            const button = document.createElement("button");
            button.setAttribute("class", "expansion");
            button.innerHTML = "+<span>Expand this folder</span>";
            button.onclick = fs.expand;
            li.insertBefore(button, li.firstChild);
        }
        span = document.createElement("span");
        if (item[3] === 1) {
            plural = "";
        } else {
            plural = "s";
        }
        span.textContent = `directory - ${util.commas(item[4])} item${plural}`;
        li.ondblclick = fs.directory;
    } else {
        span = document.createElement("span");
        if (item[1] === "link") {
            span.textContent = "symbolic link";
        } else {
            span.textContent = item[1];
        }
    }
    span.onclick = fs.select;
    span.oncontextmenu = context.menu;
    li.appendChild(span);
    li.appendChild(label);
    li.onclick = fs.select;
    li.oncontextmenu = context.menu;
    li.onkeyup = util.keys; // key combinations
    li.onmousedown = function local_fs_listItem_mouseDown(event:MouseEvent):void {
        event.stopPropagation();
    };
    li.onmouseover = function local_fs_listItem_mouseOver(event:MouseEvent):void {
        const dragBox:HTMLElement = document.getElementById("dragBox"),
            element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
        if (dragBox !== null) {
            if (browser.characterKey.indexOf("control") > -1) {
                element.click();
            }
        }
    };
    return li;
};

/* Create a file navigator modal */
fs.navigate = function local_fs_navigate(event:MouseEvent, config?:navConfig):void {
    const agentName = (config === undefined || config.agentName === undefined)
            ? "localhost"
            : config.agentName,
        location:string = (config !== undefined && typeof config.path === "string")
            ? config.path
            : "defaultLocation",
        readOnly:boolean = (config !== undefined && config.readOnly === true),
        readOnlyString:string = (readOnly === true)
            ? "(Read Only) "
            : "",
        callback:Function = (agentName !== "localhost")
            ? function local_fs_navigate_callbackRemote(responseText:string):void {
                if (responseText === "") {
                    return;
                }
                const payload:fsRemote = JSON.parse(responseText),
                    box:HTMLElement = document.getElementById(payload.id),
                    body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
                    files:HTMLElement = (payload.dirs === "missing")
                        ? (function local_fs_navigate_callbackRemote_missing():HTMLElement {
                            const p:HTMLElement = document.createElement("p");
                            p.innerHTML = "Error 404: This directory or object is missing or unavailable.";
                            p.setAttribute("class", "error");
                            return p;
                        }())
                        : fs.list(location, payload)[0];
                body.innerHTML = "";
                body.appendChild(files);
            }
            : function local_fs_navigate_callbackSelf(responseText:string):void {
                if (responseText === "") {
                    return;
                }
                const files:[HTMLElement, number] = fs.list(location, JSON.parse(responseText)),
                    value:string = files[0].getAttribute("title");
                files[0].removeAttribute("title");
                modal.create({
                    agent: agentName,
                    content: files[0],
                    inputs: ["close", "maximize", "minimize", "text"],
                    read_only: false,
                    status_bar: true,
                    text_event: fs.text,
                    text_placeholder: "Optionally type a file system address here.",
                    text_value: value,
                    title: `${document.getElementById("fileNavigator").innerHTML} - localhost`,
                    type: "fileNavigate",
                    width: 800
                });
            };
    let id:string = "";
    if (agentName !== "localhost") {
        const box:HTMLElement = modal.create({
            agent: agentName,
            content: util.delay(),
            inputs: ["close", "maximize", "minimize", "text"],
            read_only: readOnly,
            status_bar: true,
            text_event: fs.text,
            text_placeholder: "Optionally type a file system address here.",
            text_value: location,
            title: `${document.getElementById("fileNavigator").innerHTML} ${readOnlyString}- ${agentName}`,
            type: "fileNavigate",
            width: 800
        });
        id = box.getAttribute("id");
    }
    network.fs({
        action: "fs-directory",
        agent: agentName,
        copyAgent: "",
        depth: 2,
        id: id,
        location: [location],
        name: "",
        watch: "yes"
    }, callback);
};

/* Request file system information of the parent directory */
fs.parent = function local_fs_parent(event:MouseEvent):boolean {
    const element:HTMLElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        label:HTMLElement = <HTMLElement>element.nextSibling,
        input:HTMLInputElement = label.getElementsByTagName("input")[0],
        slash:string = (input.value.indexOf("/") > -1 && (input.value.indexOf("\\") < 0 || input.value.indexOf("\\") > input.value.indexOf("/")))
            ? "/"
            : "\\",
        value:string = input.value;
    let body:HTMLElement = <HTMLElement>element.parentNode,
        box:HTMLElement,
        id:string = "";
    if (input.value === "\\" || input.value === "/") {
        return false;
    }
    body = <HTMLElement>body.parentNode;
    box = <HTMLElement>body.parentNode;
    id = box.getAttribute("id");
    body = body.getElementsByTagName("div")[0];
    if ((/^\w:\\$/).test(value) === true) {
        input.value = "\\";
    } else if (value.indexOf(slash) === value.lastIndexOf(slash)) {
        input.value = value.slice(0, value.lastIndexOf(slash) + 1);
    } else {
        input.value = value.slice(0, value.lastIndexOf(slash));
    }
    network.fs({
        action: "fs-directory",
        agent: util.getAgent(box)[0],
        copyAgent: "",
        depth: 2,
        id: id,
        location: [input.value],
        name: "",
        watch: value
    }, function local_fs_parent_callback(responseText:string):void {
        const list:[HTMLElement, number] = fs.list(input.value, JSON.parse(responseText));
        body.innerHTML = "";
        body.appendChild(list[0]);
        fs.listFail(list[1], box);
        browser.data.modals[id].text_value = input.value;
        network.storage("settings");
    });
};

/* The front-side of renaming a file system object */
fs.rename = function local_fs_rename(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        box:HTMLElement = (function local_fs_saveFile_box():HTMLElement {
            let el:HTMLElement = element;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "box");
            return el;
        }()),
        input:HTMLInputElement = document.createElement("input"),
        action = <EventHandlerNonNull>function local_fs_rename_action(action:KeyboardEvent):void {
            if (action.type === "blur" || (action.type === "keyup" && action.keyCode === 13)) {
                input.value = input.value.replace(/(\s+|\.)$/, "");
                if (dir + input.value === text) {
                    label.innerHTML = text;
                } else {
                    network.fs({
                        action: "fs-rename",
                        agent: util.getAgent(element)[0],
                        copyAgent: "",
                        depth: 1,
                        id: box.getAttribute("id"),
                        location: [text.replace(/\\/g, "\\\\")],
                        name: input.value,
                        watch: "no"
                    }, function local_fs_rename_callback():void {
                        label.removeChild(input);
                        label.innerHTML = label.innerHTML + input.value;
                    });
                }
            } else if (action.type === "keyup") {
                if (action.keyCode === 27) {
                    const input:HTMLElement = li.getElementsByTagName("input")[0];
                    label.innerHTML = text;
                    input.focus();
                    return;
                }
                input.value = input.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
            }
        };
    let li:HTMLElement = element,
        label:HTMLElement,
        slash:"\\" | "/" = "/",
        last:string,
        text:string,
        dirs:string[],
        dir:string;
    if (document.getElementById("fsRename") !== null) {
        return;
    }
    if (li.nodeName.toLowerCase() !== "li") {
        do {
            li = <HTMLElement>li.parentNode;
        } while (li !== document.documentElement && li.nodeName.toLowerCase() !== "li");
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
};

/* A service to write file changes to the file system */
fs.saveFile = function local_fs_saveFile(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        box:HTMLElement = (function local_fs_saveFile_box():HTMLElement {
            let el:HTMLElement = element;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "box");
            return el;
        }()),
        content:string = box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].value,
        agency:[string, boolean] = util.getAgent(box);
    let location:string = box.getElementsByTagName("h2")[0].getElementsByTagName("button")[0].innerHTML.split(`${agency[0]} - `)[1];
    network.fs({
        action: "fs-write",
        agent: agency[0],
        copyAgent: agency[0],
        depth: 1,
        id: box.getAttribute("id"),
        location: [location],
        name: content,
        watch: "no"
    }, function local_fs_saveFile_callback(message:string):void {
        const footer:HTMLElement = <HTMLElement>box.getElementsByClassName("footer")[0],
            body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
            buttons:HTMLElement = <HTMLElement>footer.getElementsByClassName("footer-buttons")[0],
            pList:HTMLCollectionOf<HTMLElement> = footer.getElementsByTagName("p"),
            p:HTMLElement = document.createElement("p");
        p.innerHTML = message;
        p.setAttribute("class", "message");
        if (pList[0] !== buttons) {
            footer.removeChild(pList[0]);
        }
        p.style.width = `${(body.clientWidth - buttons.clientWidth - 40) / 15}em`;
        footer.insertBefore(p, pList[0]);
    });
};

/* Select a file system item for an action */
fs.select = function local_fs_select(event:KeyboardEvent):void {
    event.preventDefault();
    event.stopPropagation();
    context.menuRemove();
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        li:HTMLElement = (element.nodeName.toLowerCase() === "li")
            ? element
            : <HTMLElement>element.parentNode,
        input:HTMLInputElement = li.getElementsByTagName("input")[0];
    let state:boolean = input.checked,
        body:HTMLElement = li,
        box:HTMLElement;
    input.focus();
    modal.zTop(event);
    do {
        body = <HTMLElement>body.parentNode;
    } while (body !== document.documentElement && body.getAttribute("class") !== "body");
    box = <HTMLElement>body.parentNode.parentNode;
    if (browser.characterKey === "") {
        const inputs = body.getElementsByTagName("input"),
            inputsLength = inputs.length,
            selected:boolean = (li.getAttribute("class").indexOf("selected") > 0);
        let a:number = 0,
            item:HTMLElement;
        do {
            if (inputs[a].checked === true) {
                inputs[a].checked = false;
                item = <HTMLElement>inputs[a].parentNode.parentNode;
                item.setAttribute("class", item.getAttribute("class").replace(/(\s+selected)+/, ""));
            }
            a = a + 1;
        } while (a < inputsLength);
        input.checked = true;
        if (selected === false) {
            li.setAttribute("class", `${li.getAttribute("class").replace(/(\s+selected)+/, "")} selected`);
        }
    } else if (browser.characterKey === "control") {
        if (state === true) {
            input.checked = false;
            li.setAttribute("class", li.getAttribute("class").replace(/(\s+((selected)|(cut)))+/, ""));
        } else {
            input.checked = true;
            li.setAttribute("class", `${li.getAttribute("class")} selected`);
        }
    } else if (browser.characterKey === "shift") {
        const liList = body.getElementsByTagName("li"),
            shift = function local_fs_select_shift(index:number, end:number):void {
                if (state === true) {
                    do {
                        liList[index].getElementsByTagName("input")[0].checked = false;
                        liList[index].setAttribute("class", liList[index].getAttribute("class").replace(/(\s+((selected)|(cut)))+/, ""));
                        index = index + 1;
                    } while (index < end);
                } else {
                    do {
                        liList[index].getElementsByTagName("input")[0].checked = true;
                        liList[index].setAttribute("class", `${liList[index].getAttribute("class")} selected`);
                        index = index + 1;
                    } while (index < end);
                }
            };
        let a:number = 0,
            focus:HTMLElement = browser.data.modals[box.getAttribute("id")].focus,
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
                li.setAttribute("class", li.getAttribute("class").replace(/(\s+((selected)|(cut)))+/, ""));
            } else {
                input.checked = true;
                li.setAttribute("class", `${li.getAttribute("class")} selected`);
            }
        } else if (focusIndex > elementIndex) {
            shift(elementIndex, focusIndex);
        } else {
            shift(focusIndex + 1, elementIndex + 1);
        }
    }
    browser.data.modals[box.getAttribute("id")].focus = li;
};

/* Requests file system data from a text field, such as manually typing an address */
fs.text = function local_fs_text(event:KeyboardEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        watchValue:string = element.value;
    let parent:HTMLElement = <HTMLElement>element.parentNode.parentNode,
        box:HTMLElement,
        id:string;
    parent = <HTMLElement>parent.parentNode;
    box = <HTMLElement>parent.parentNode;
    id = box.getAttribute("id");
    parent = parent.getElementsByTagName("div")[0];
    if (event.type === "blur" || (event.type === "keyup" && event.keyCode === 13)) {
        network.fs({
            action: "fs-directory",
            agent: util.getAgent(box)[0],
            copyAgent: "",
            depth: 2,
            id: id,
            location: [element.value],
            name: "",
            watch: watchValue
        }, function local_fs_text_callback(responseText:string):void {
            if (responseText === "") {
                parent.innerHTML = "<p class=\"error\">Error 404: Requested location is no longer available or remote user is offline.</p>";
            } else {
                const list:[HTMLElement, number] = fs.list(element.value, JSON.parse(responseText));
                parent.innerHTML = "";
                parent.appendChild(list[0]);
                fs.listFail(list[1], box);
                browser.data.modals[id].text_value = element.value;
                element.removeAttribute("class");
                network.storage("settings");
            }
        });
    }
};

export default fs;