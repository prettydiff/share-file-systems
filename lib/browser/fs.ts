import browser from "./browser.js";
import context from "./context.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

const fs:module_fs = {};

/* navigate into a directory by double click */
fs.directory = function local_fs_directory(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        li:HTMLElement = (element.nodeName === "li")
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
        action: "fs-read",
        agent: "self",
        depth: 2,
        location: [path.replace(/\\/g, "\\\\")],
        name: "",
        watch: watchValue
    }, function local_fs_directory_callback(responseText:string):void {
        body.innerHTML = "";
        body.appendChild(fs.list(path, responseText));
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
            action: "fs-read",
            agent: "self",
            depth: 2,
            location: [li.firstChild.nextSibling.textContent.replace(/\\/g, "\\\\")],
            name : "",
            watch: "no"
        }, function local_fs_expand_callback(responseText:string) {
            li.appendChild(fs.list(li.firstChild.nextSibling.textContent, responseText));
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
fs.list = function local_fs_list(location:string, listString:string):HTMLElement {
    const list:directoryList = JSON.parse(listString)[0],
        local:directoryList = [],
        length:number = list.length,
        output:HTMLElement = document.createElement("ul");
    let a:number = 0,
        localLength:number = 0;

    do {
        if (list[a][2] === 0) {
            local.push(list[a]);
        }
        a = a + 1;
    } while (a < length);
    local.sort(function local_network_fsRead_callback_sort(a:directoryItem, b:directoryItem):number {
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
                    output.appendChild(util.fsObject(local[a], "lastType"));
                } else {
                    output.appendChild(util.fsObject(local[a], ""));
                }
            }
            a = a + 1;
        } while (a < localLength);
    }
    output.title = local[0][0];
    output.oncontextmenu = context.menu;
    output.setAttribute("class", "fileList");
    return output;
};

/* Create a file navigator modal */
fs.navigate = function local_fs_navigate(event:MouseEvent, path?:string):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        agent:string = (element.getAttribute("id") === "fileNavigator")
            ? "self"
            : (function local_fs_navigate_agent():string {
                let parent:HTMLElement = <HTMLElement>element.parentNode.parentNode.previousSibling;
                if (parent.innerHTML === "localhost") {
                    return "self";
                }
                return parent.innerHTML;
            }()),
        location:string = (typeof path === "string")
            ? path
            : "defaultLocation",
        callback:Function = (agent === "self")
            ? function local_fs_navigate_callbackSelf(responseText:string):void {
                if (responseText === "") {
                    return;
                }
                const files:HTMLElement = fs.list(location, responseText),
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
            }
            : function local_fs_navigate_callbackRemote(responseText:string):void {
                if (responseText === "") {
                    return;
                }
                const payload:fsRemote = JSON.parse(responseText.replace("fs-remote:", "")),
                    box:HTMLElement = document.getElementById(payload.id),
                    body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
                    files:HTMLElement = fs.list(location, JSON.stringify(payload.dirs));
                body.innerHTML = "";
                body.appendChild(files);
            };
    let id:string = "";
    if (agent !== "self") {
        const box:HTMLElement = modal.create({
            content: util.delay(),
            inputs: ["close", "maximize", "minimize", "text"],
            text_event: fs.text,
            text_placeholder: "Optionally type a file system address here.",
            text_value: location,
            title: `${document.getElementById("fileNavigator").innerHTML} - ${agent}`,
            type: "fileNavigate",
            width: 800
        });
        id = box.getAttribute("id");
    }
    network.fs({
        action: "fs-read",
        agent: agent,
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
        action: "fs-read",
        agent: "self",
        depth: 2,
        location: [input.value.replace(/\\/g, "\\\\")],
        name: "",
        watch: value
    }, function local_fs_parent_callback(responseText:string):void {
        body.innerHTML = "";
        body.appendChild(fs.list(input.value, responseText));
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
                        agent: "self",
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
                    label.innerHTML = text;
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
    if (li.nodeName !== "li") {
        do {
            li = <HTMLElement>li.parentNode;
        } while (li !== document.documentElement && li.nodeName !== "li");
    }
    label = li.getElementsByTagName("label")[0];
    text = label.innerHTML;
    if (text.indexOf("/") < 0 || (text.indexOf("\\") < text.indexOf("/") && text.indexOf("\\") > -1 && text.indexOf("/") > -1)) {
        slash = "\\";
    }
    dirs = text.split(slash);
    last = dirs.pop();
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
        li:HTMLElement = (element.nodeName === "li")
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
            inputsLength = inputs.length;
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
        li.setAttribute("class", `${li.getAttribute("class").replace(/(\s+selected)+/, "")} selected`);
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

/* Requests file system data from a text field */
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
            action: "fs-read",
            agent: "self",
            depth: 2,
            location: [element.value.replace(/\\/g, "\\\\")],
            name: "",
            watch: watchValue
        }, function local_fs_text_callback(responseText:string):void {
            if (responseText === "") {
                parent.innerHTML = "<p class=\"error\">Location not found.</p>";
            } else {
                parent.innerHTML = "";
                parent.appendChild(fs.list(element.value, responseText));
                browser.data.modals[id].text_value = element.value;
                element.removeAttribute("class");
                network.settings();
            }
        });
    }
};

export default fs;