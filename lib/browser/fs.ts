import browser from "./browser.js";
import context from "./context.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

const fs:module_fs = {},
    agent = function local_fs_agent(element:HTMLElement):string {
        const box:HTMLElement = (element.getAttribute("class") === "box")
                ? element
                : (function local_fs_agent_box():HTMLElement {
                    let boxEl:HTMLElement = element;
                    do {
                        boxEl = <HTMLElement>boxEl.parentNode;
                    } while (boxEl !== document.documentElement && boxEl.getAttribute("class") !== "box");
                    return boxEl;
                }()),
            searchString:string = "Navigator - ";
        let text:string = box.getElementsByTagName("h2")[0].lastChild.textContent;
        text = text.slice(text.indexOf(searchString) + searchString.length);
        return text;
    };

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
        agent: agent(box),
        copyAgent: "",
        depth: 2,
        location: [path.replace(/\\/g, "\\\\")],
        name: "",
        watch: watchValue
    }, function local_fs_directory_callback(responseText:string):void {
        body.innerHTML = "";
        body.appendChild(fs.list(path, JSON.parse(responseText).dirs));
        browser.data.modals[box.getAttribute("id")].text_value = path;
        network.settings();
    });
};

/* Shows child elements of a directory */
fs.expand = function local_fs_expand(event:MouseEvent):void {
    const button:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        li:HTMLElement = <HTMLElement>button.parentNode;
    if (button.innerHTML.indexOf("+") === 0) {
        button.innerHTML = "-<span>Collapse this folder</span>";
        network.fs({
            action: "fs-directory",
            agent: agent(button),
            copyAgent: "",
            depth: 2,
            location: [li.firstChild.nextSibling.textContent.replace(/\\/g, "\\\\")],
            name : "",
            watch: "no"
        }, function local_fs_expand_callback(responseText:string) {
            li.appendChild(fs.list(li.firstChild.nextSibling.textContent, JSON.parse(responseText).dirs));
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
fs.list = function local_fs_list(location:string, list:directoryList):HTMLElement {
    const local:directoryList = [],
        length:number = list.length,
        output:HTMLElement = document.createElement("ul");
    let a:number = 0,
        localLength:number = 0;

    do {
        if (list[a][3] === 0) {
            local.push(list[a]);
        }
        a = a + 1;
    } while (a < length);
    local.sort(function local_fs_list_sort(a:directoryItem, b:directoryItem):number {
        // when types are the same
        if (a[1] === b[1]) {
            if (a[0] < b[0]) {
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
    output.title = location;
    output.oncontextmenu = context.menu;
    output.onkeyup = util.keys;
    output.onmousedown = function local_fs_list_dragSelect(event:MouseEvent) {
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
                    (dragArea.left >= liLocation[0].left && dragArea.right >= liLocation[0].right)
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
    return output;
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
        if (item[3] > 0) {
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
        span.textContent = `directory - ${util.commas(item[3])} item${plural}`;
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
    li.onkeyup = util.keys;
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
fs.navigate = function local_fs_navigate(event:MouseEvent, path?:string, agentName?:string):void {
    if (agentName === undefined) {
        agentName = "localhost";
    }
    const location:string = (typeof path === "string")
            ? path
            : "defaultLocation",
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
                        : fs.list(location, payload.dirs);
                body.innerHTML = "";
                body.appendChild(files);
            }
            : function local_fs_navigate_callbackSelf(responseText:string):void {
                if (responseText === "") {
                    return;
                }
                const files:HTMLElement = fs.list(location, JSON.parse(responseText).dirs),
                    value:string = files.getAttribute("title");
                files.removeAttribute("title");
                modal.create({
                    content: files,
                    inputs: ["close", "maximize", "minimize", "text"],
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
            content: util.delay(),
            inputs: ["close", "maximize", "minimize", "text"],
            text_event: fs.text,
            text_placeholder: "Optionally type a file system address here.",
            text_value: location,
            title: `${document.getElementById("fileNavigator").innerHTML} - ${agentName}`,
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
        agent: agent(box),
        copyAgent: "",
        depth: 2,
        location: [input.value.replace(/\\/g, "\\\\")],
        name: "",
        watch: value
    }, function local_fs_parent_callback(responseText:string):void {
        body.innerHTML = "";
        body.appendChild(fs.list(input.value, JSON.parse(responseText).dirs));
        browser.data.modals[id].text_value = input.value;
        network.settings();
    });
};

/* The front-side of renaming a file system object */
fs.rename = function local_fs_rename(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        input:HTMLInputElement = document.createElement("input"),
        action = <EventHandlerNonNull>function local_fs_rename_action(action:KeyboardEvent):void {
            if (action.type === "blur" || (action.type === "keyup" && action.keyCode === 13)) {
                input.value = input.value.replace(/(\s+|\.)$/, "");
                if (dir + input.value === text) {
                    label.innerHTML = text;
                } else {
                    network.fs({
                        action: "fs-rename",
                        agent: agent(element),
                        copyAgent: "",
                        depth: 1,
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

/* Select a file system item for an action */
fs.select = function local_fs_select(event:KeyboardEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        li:HTMLElement = (element.nodeName.toLowerCase() === "li")
            ? element
            : <HTMLElement>element.parentNode,
        input:HTMLInputElement = li.getElementsByTagName("input")[0];
    event.preventDefault();
    input.focus();
    let state:boolean = input.checked,
        body:HTMLElement = li,
        box:HTMLElement;
    event.stopPropagation();
    context.menuRemove();
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
            agent: agent(box),
            copyAgent: "",
            depth: 2,
            location: [element.value.replace(/\\/g, "\\\\")],
            name: "",
            watch: watchValue
        }, function local_fs_text_callback(responseText:string):void {
            if (responseText === "") {
                parent.innerHTML = "<p class=\"error\">Location not found.</p>";
            } else {
                parent.innerHTML = "";
                parent.appendChild(fs.list(element.value, JSON.parse(responseText).dirs));
                browser.data.modals[id].text_value = element.value;
                element.removeAttribute("class");
                network.settings();
            }
        });
    }
};

export default fs;