
/* lib/browser/context - A collection of event handlers associated with the right click context menu. */

import browser from "./browser.js";
import fileBrowser from "./fileBrowser.js";
import modal from "./modal.js";
import network from "./network.js";
import share from "./share.js";
import util from "./util.js";

import common from "../common/common.js";

const context:module_context = {
    element: null,
    type: ""
};
let clipboard:string = "";

/* Handler for file system artifact copy */
context.copy = function browser_context_copy(event:MouseEvent):void {
    const addresses:string[] = [],
        tagName:string = context.element.nodeName.toLowerCase(),
        element:Element = (tagName === "li" || tagName === "ul")
            ? context.element
            : context.element.getAncestor("li", "tag") as Element,
        menu:Element = document.getElementById("contextMenu"),
        box:Element = element.getAncestor("box", "class"),
        contextElement:Element = event.target as Element,
        type:contextType = (context.type !== "")
            ? context.type
            : (contextElement.innerHTML.indexOf("Copy") === 0)
                ? "copy"
                : "cut",
        selected:[string, shareType, string][] = util.selectedAddresses(element, type),
        agency:agency = util.getAgent(box),
        id:string = box.getAttribute("id"),
        clipData:clipboard = {
            agent: agency[0],
            agentType: agency[2],
            data: addresses,
            id: id,
            share: browser.data.modals[id].share,
            type: type
        },
        clipStore:clipboard = (clipboard === "")
            ? null
            : JSON.parse(clipboard);
    if (selected.length < 1) {
        addresses.push(element.getElementsByTagName("label")[0].innerHTML.replace(/&amp;/g, "&"));
    } else {
        selected.forEach(function browser_context_destroy_each(value:[string, shareType, string]):void {
            addresses.push(value[0].replace(/&amp;/g, "&"));
        });
    }
    if (clipStore !== null) {
        if (clipStore.id !== box.getAttribute("id") || type !== "cut") {
            util.selectNone(document.getElementById(clipStore.id));
        }
    }
    clipboard = JSON.stringify(clipData);
    context.element = null;
    context.type = "";
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

/* Handler for base64, edit, and hash operations from the context menu */
context.dataString = function browser_context_dataString(event:MouseEvent):void {
    const element:Element = (context.element.nodeName.toLowerCase() === "li")
            ? context.element
            : context.element.getAncestor("li", "tag") as Element,
        contextElement:Element = event.target as Element,
        type:contextType = (context.type !== "")
            ? context.type
            : (contextElement.innerHTML.indexOf("Base64") === 0)
                ? "Base64"
                : (contextElement.innerHTML.indexOf("File as Text") > 0)
                    ? "Edit"
                    : "Hash",
        menu:Element = document.getElementById("contextMenu"),
        addresses:[string, shareType, string][] = util.selectedAddresses(element, "fileEdit"),
        box:Element = element.getAncestor("box", "class"),
        addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
        length:number = addresses.length,
        agency:agency = util.getAgent(box),
        id:string = box.getAttribute("id"),
        payloadNetwork:systemDataFile = {
            action: (type === "Edit")
                ? "fs-read"
                : `fs-${type.toLowerCase()}` as fileAction,
            agent: {
                id: agency[0],
                modalAddress: addressField.value,
                share: browser.data.modals[id].share,
                type: agency[2]
            },
            depth: 1,
            location: [],
            name: ""
        },
        payloadModal:modal = {
            agent: agency[0],
            agentType: agency[2],
            content: null,
            height: 500,
            inputs: (type === "Edit" && agency[1] === false)
                ? ["close", "save"]
                : ["close"],
            left: 0,
            read_only: agency[1],
            single: false,
            title: "",
            top: 0,
            type: "textPad",
            width: 500
        },
        callback = function browser_context_dataString_callback(resultString:string):void {
            const data:stringDataList = JSON.parse(resultString),
                length:number = data.length;
            let a:number = 0,
                textArea:HTMLTextAreaElement,
                label:Element,
                span:Element,
                modalResult:Element,
                body:HTMLElement,
                heading:HTMLElement;
            if (data[0] === undefined) {
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
                modalResult = document.getElementById(data[a].id),
                body = modalResult.getElementsByClassName("body")[0] as HTMLElement;
                textArea.onblur = modal.textSave;
                heading = modalResult.getElementsByTagName("h2")[0].getElementsByTagName("button")[0];
                if (type === "Base64") {
                    textArea.style.whiteSpace = "normal";
                }
                if (type === "Hash") {
                    textArea.style.minHeight = "5em";
                    body.style.height = "auto";
                }
                browser.data.modals[data[a].id].text_value = data[a].content;
                textArea.value = data[a].content;
                body.innerHTML = "";
                body.appendChild(label);
                body.style.overflow = "hidden";
                heading.style.width = `${(body.clientWidth - 50) / 18}em`;
                a = a + 1;
            } while (a < length);
            network.storage("settings", null);
        };
    let a:number = 0,
        delay:Element,
        modalInstance:Element;
    do {
        if (addresses[a][1].indexOf("file") === 0) {
            delay = util.delay();
            payloadModal.content = delay;
            payloadModal.left = event.clientX + (a * 10);
            payloadModal.title = `${type} - ${browser[agency[2]][agency[0]].name} - ${addresses[a][0]}`;
            payloadModal.top = (event.clientY - 60) + (a * 10);
            modalInstance = modal.create(payloadModal);
            payloadNetwork.location.push(`${modalInstance.getAttribute("id")}:${addresses[a][0]}`);
        }
        a = a + 1;
    } while (a < length);
    network.fileBrowser(payloadNetwork, callback);
    context.element = null;
    context.type = "";
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

/* Handler for removing file system artifacts via context menu */
context.destroy = function browser_context_destroy():void {
    let element:Element = (context.element.nodeName.toLowerCase() === "li")
            ? context.element
            : context.element.getAncestor("li", "tag") as Element,
        selected:[string, shareType, string][],
        box:Element = element.getAncestor("box", "class"),
        addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
        agency:agency = util.getAgent(element),
        id:string = box.getAttribute("id"),
        menu:Element = document.getElementById("contextMenu"),
        payload:systemDataFile = {
            action: "fs-destroy",
            agent: {
                id: agency[0],
                modalAddress: addressField.value,
                share: browser.data.modals[id].share,
                type: agency[2]
            },
            depth: 1,
            location: [],
            name: box.getElementsByClassName("header")[0].getElementsByTagName("input")[0].value
        }; 
    if (element.nodeName.toLowerCase() !== "li") {
        element = element.parentNode as HTMLElement;
    }
    selected = util.selectedAddresses(element, "destroy");
    if (selected.length < 1) {
        payload.location.push(element.getElementsByTagName("label")[0].innerHTML);
    } else {
        selected.forEach(function browser_context_destroy_each(value:[string, shareType, string]):void {
            payload.location.push(value[0]);
        });
    }
    network.fileBrowser(payload, null);
    context.element = null;
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

/* Handler for details action of context menu */
context.details = function browser_context_details(event:MouseEvent):void {
    const name:string = context.element.nodeName.toLowerCase(),
        element:Element = (name === "li" || name === "ul")
            ? context.element
            : context.element.getAncestor("li", "tag") as Element,
        div:Element = util.delay(),
        agency:agency = util.getAgent(element),
        box:Element = element.getAncestor("box", "class"),
        menu:Element = document.getElementById("contextMenu"),
        addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
        addresses:[string, shareType, string][] = util.selectedAddresses(element, "details"),
        payloadModal:modal = {
            agent: agency[0],
            agentType: agency[2],
            content: div,
            height: 600,
            inputs: ["close"],
            left: event.clientX,
            read_only: agency[1],
            single: true,
            text_value: "",
            title: `Details - ${common.capitalize(agency[2])}, ${browser[agency[2]][agency[0]].name} - ${addresses.length} items`,
            top: (event.clientY - 60 < 0)
                ? 60
                : event.clientY - 60,
            type: "details",
            width: 500
        },
        modalInstance:Element = modal.create(payloadModal),
        id:string = modalInstance.getAttribute("id"),
        payloadNetwork:systemDataFile = {
            action: "fs-details",
            agent: {
                id: agency[0],
                modalAddress: addressField.value,
                share: browser.data.modals[id].share,
                type: agency[2]
            },
            depth: 0,
            location: (function browser_context_details_addressList():string[] {
                const output:string[] = [],
                    length:number = addresses.length;
                let a:number = 0;
                if (context.element.nodeName.toLowerCase() === "ul") {
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
    if (browser.loadFlag === true) {
        return;
    }
    payloadModal.text_value = payloadNetwork.location[0];
    network.fileBrowser(payloadNetwork, fileBrowser.details);
    context.element = null;
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

/* Handler for creating new directories */
context.fsNew = function browser_context_fsNew(event:MouseEvent):void {
    const element:Element = event.target as Element,
        box:Element = element.getAncestor("box", "class"),
        addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
        menu:Element = document.getElementById("contextMenu"),
        cancel = function browser_context_fsNew_cancel(actionElement:Element):void {
            const list:Element = actionElement.getAncestor("fileList", "class"),
                input:HTMLElement = list.getElementsByTagName("input")[0] as HTMLElement;
            setTimeout(function browser_context_fsNew_cancel_delay():void {
                if (actionElement.parentNode.parentNode.parentNode.parentNode === list) {
                    list.removeChild(actionElement.parentNode.parentNode.parentNode);
                    input.focus();
                }
            }, 10);
        },
        actionKeyboard = function browser_context_fsNew_actionKeyboard(actionEvent:KeyboardEvent):void {
            const actionElement:HTMLInputElement = actionEvent.target as HTMLInputElement,
                actionParent:Element = actionElement.parentNode as Element;
            if (actionEvent.key === "Enter") {
                const value:string = actionElement.value.replace(/(\s+|\.)$/, ""),
                    parent:Element = actionElement.parentNode as Element,
                    id:string = parent.getAncestor("box", "class").getAttribute("id"),
                    agency:agency = util.getAgent(actionElement),
                    payload:systemDataFile = {
                        action: "fs-new",
                        agent: {
                            id: agency[0],
                            modalAddress: addressField.value,
                            share: browser.data.modals[id].share,
                            type: agency[2]
                        },
                        depth: 1,
                        location: [actionElement.getAttribute("data-location") + value],
                        name: actionElement.getAttribute("data-type")
                    };
                if (value.replace(/\s+/, "") !== "") {
                    actionElement.onkeyup = null;
                    actionElement.onblur = null;
                    actionParent.innerHTML = payload.location[0];
                    network.fileBrowser(payload, null);
                }
            } else {
                if (actionEvent.key === "Escape") {
                    cancel(actionElement);
                    return;
                }
                actionElement.value = actionElement.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
            }
        },
        actionBlur = function browser_context_fsNew_actionBlur(actionEvent:FocusEvent):void {
            const actionElement:HTMLInputElement = actionEvent.target as HTMLInputElement,
                value:string = actionElement.value.replace(/(\s+|\.)$/, "");
            if (actionEvent.type === "blur") {
                if (value.replace(/\s+/, "") === "") {
                    cancel(actionElement);
                } else {
                    const actionParent:Element = actionElement.parentNode as Element,
                        agency:agency = util.getAgent(actionElement),
                        id:string = actionParent.getAncestor("box", "class").getAttribute("id"),
                        payload:systemDataFile = {
                            action: "fs-new",
                            agent: {
                                id: agency[0],
                                modalAddress: addressField.value,
                                share: browser.data.modals[id].share,
                                type: agency[2]
                            },
                            depth: 1,
                            location: [actionElement.getAttribute("data-location") + value],
                            name: actionElement.getAttribute("data-type")
                        };
                    actionElement.onkeyup = null;
                    actionElement.onblur = null;
                    actionParent.innerHTML = payload.location[0];
                    network.fileBrowser(payload, null);
                }
            }
        },
        build = function browser_context_fsNew_build():void {
            const li:HTMLElement = document.createElement("li"),
                label:HTMLLabelElement = document.createElement("label"),
                input:HTMLInputElement = document.createElement("input"),
                field:HTMLInputElement = document.createElement("input"),
                text:HTMLElement = document.createElement("label"),
                p:HTMLElement = document.createElement("p"),
                spanInfo:HTMLElement = document.createElement("span"),
                parent:Element = (context.element === null)
                    ? null
                    : context.element.parentNode as Element,
                box = (parent === null)
                    ? null
                    : parent.getAncestor("box", "class"),
                type:contextType = (context.type !== "")
                    ? context.type
                    : (element.innerHTML.indexOf("New File") === 0)
                        ? "file"
                        : "directory";

            if (parent === null) {
                return;
            }

            let span:HTMLElement,
                slash:"\\"|"/" = "/",
                path:string = box.getElementsByTagName("input")[0].value;

            li.setAttribute("class", type);
            if (type === "directory") {
                li.ondblclick = fileBrowser.directory;
            }
            path = box.getElementsByTagName("input")[0].value;
            if (path.indexOf("/") < 0 || (path.indexOf("\\") < path.indexOf("/") && path.indexOf("\\") > -1 && path.indexOf("/") > -1)) {
                slash = "\\";
            }
            if (path.charAt(path.length - 1) !== slash) {
                path = path + slash;
            }
            input.type = "checkbox";
            input.checked = false;
            label.innerHTML = "Selected";
            label.appendChild(input);
            label.setAttribute("class", "selection");
            p.appendChild(text);
            spanInfo.innerHTML = (type === "file")
                ? "file - 0 bytes"
                : "directory - 0 items";
            p.appendChild(spanInfo);
            text.oncontextmenu = context.menu;
            text.onclick = fileBrowser.select;
            text.innerHTML = path;
            field.onkeyup = actionKeyboard;
            field.onblur = actionBlur;
            field.setAttribute("id", "newFileItem");
            field.setAttribute("data-type", type);
            field.setAttribute("data-location", path);
            text.appendChild(field);
            li.appendChild(p);
            span = document.createElement("span");
            span.onclick = fileBrowser.select;
            span.oncontextmenu = context.menu;
            li.appendChild(span);
            li.oncontextmenu = context.menu;
            li.appendChild(label);
            li.onclick = fileBrowser.select;
            if (context.element.nodeName.toLowerCase() === "ul") {
                context.element.appendChild(li);
            } else {
                context.element.parentNode.appendChild(li);
            }
            field.focus();
        };
    if (document.getElementById("newFileItem") !== null) {
        return;
    }
    build();
    context.element = null;
    context.type = "";
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

/* Creates context menu */
context.menu = function browser_context_menu(event:MouseEvent):void {
    const element:HTMLElement = (function browser_context_menu_element():HTMLElement {
            const target:HTMLElement = event.target as HTMLElement,
                name:string = target.nodeName.toLowerCase();
            if (name === "li" || name === "ul") {
                return target;
            }
            return target.getAncestor("li", "tag") as HTMLElement;
        }()),
        inputAddress:string = element.getAncestor("border", "class").getElementsByTagName("input")[0].value,
        root:boolean = (inputAddress === "/" || inputAddress === "\\"),
        nodeName:string = element.nodeName.toLowerCase(),
        itemList:Element[] = [],
        menu:HTMLElement = document.createElement("ul"),
        command:string = (navigator.userAgent.indexOf("Mac OS X") > 0)
            ? "Command"
            : "CTRL",
        functions:contextFunctions = {
            base64: function browser_context_menu_base64():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Base64 <em>${command} + ALT + B</em>`;
                button.onclick = context.dataString;
                item.appendChild(button);
                itemList.push(item);
            },
            copy: function browser_context_menu_copy():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Copy <em>${command} + C</em>`;
                button.onclick = context.copy;
                item.appendChild(button);
                itemList.push(item);
            },
            cut: function browser_context_menu_cut():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Cut <em>${command} + X</em>`;
                button.onclick = context.copy;
                item.appendChild(button);
                itemList.push(item);
            },
            destroy: function browser_context_menu_destroy():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Destroy <em>DEL</em>`;
                button.setAttribute("class", "destroy");
                if (root === true) {
                    button.disabled = true;
                } else {
                    button.onclick = context.destroy;
                }
                item.appendChild(button);
                itemList.push(item);
            },
            details: function browser_context_menu_details():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Details <em>${command} + ALT + T</em>`;
                button.onclick = context.details;
                item.appendChild(button);
                itemList.push(item);
            },
            edit: function browser_context_menu_edit():void {
                item = document.createElement("li");
                button = document.createElement("button");
                if (readOnly === true) {
                    button.innerHTML = `Read File as Text <em>${command} + ALT + E</em>`;
                } else {
                    button.innerHTML = `Edit File as Text <em>${command} + ALT + E</em>`;
                }
                button.onclick = context.dataString;
                item.appendChild(button);
                itemList.push(item);
            },
            hash: function browser_context_menu_hash():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Hash <em>${command} + ALT + H</em>`;
                button.onclick = context.dataString;
                item.appendChild(button);
                itemList.push(item);
            },
            newDirectory: function browser_context_menu_newDirectory():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `New Directory <em>${command} + ALT + D</em>`;
                button.onclick = context.fsNew;
                item.appendChild(button);
                itemList.push(item);
            },
            newFile: function browser_context_menu_newFile():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `New File <em>${command} + ALT + F</em>`;
                button.onclick = context.fsNew;
                item.appendChild(button);
                itemList.push(item);
            },
            paste: function browser_context_menu_paste():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Paste <em>${command} + V</em>`;
                button.onclick = context.paste;
                if (clipboard === "" || (clipboard.indexOf("\"type\":") < 0 || clipboard.indexOf("\"data\":") < 0)) {
                    button.disabled = true;
                }
                item.appendChild(button);
                itemList.push(item);
            },
            rename: function browser_context_menu_rename():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Rename <em>${command} + ALT + R</em>`;
                if (root === true) {
                    button.disabled = true;
                } else {
                    button.onclick = fileBrowser.rename;
                }
                item.appendChild(button);
                itemList.push(item);
            },
            share: function browser_context_menu_share():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Share <em>${command} + ALT + S</em>`;
                button.onclick = share.context;
                item.appendChild(button);
                itemList.push(item);
            }
        };
    let item:Element,
        button:HTMLButtonElement,
        clientX:number,
        clientY:number,
        box:HTMLElement = element.getAncestor("box", "class") as HTMLElement,
        readOnly:boolean = browser.data.modals[box.getAttribute("id")].read_only,
        reverse:boolean = false,
        a:number = 0;
    context.element = element;
    context.menuRemove();
    event.preventDefault();
    event.stopPropagation();
    menu.setAttribute("id", "contextMenu");
    menu.onclick = context.menuRemove;
    if (nodeName === "ul") {
        functions.details();
        if (readOnly === true) {
            return;
        }
        functions.newDirectory();
        functions.newFile();
        functions.paste();
    } else if (nodeName === "li") {
        functions.details();
        if (box.getAttribute("data-agentType") === "device") {
            functions.share();
        }
        if (element.getAttribute("class").indexOf("file") === 0) {
            functions.edit();
            functions.hash();
            functions.base64();
        }

        if (readOnly === false) {
            functions.newDirectory();
            functions.newFile();
        }
        functions.copy();
        if (readOnly === false) {
            functions.cut();
            functions.paste();
            functions.rename();
            functions.destroy();
        }
    }

    // this accounts for events artificially created during test automation
    if (event.clientY === undefined || event.clientX === undefined) {
        const body:HTMLElement = element.getAncestor("body", "class") as HTMLElement;
        clientX = element.offsetLeft + body.offsetLeft + box.offsetLeft + 50;
        clientY = element.offsetTop + body.offsetTop + box.offsetTop + 65;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    // menu display position
    menu.style.zIndex = `${browser.data.zIndex + 10}`;
    // vertical
    if (browser.content.clientHeight < ((itemList.length * 57) + 1) + clientY) {
        const offset:number = (function browser_context_menu_verticalOffset():number {
            // modify position of the menu when performing test automation
            if (event.clientY === undefined) {
                return -25;
            }
            if (location.href.indexOf("?test_browser") < 0) {
                reverse = true;
            }
            return 1;
        }());
        menu.style.top = `${(clientY - ((itemList.length * 57) + offset)) / 10}em`;
    } else {
        menu.style.top = `${(clientY - 50) / 10}em`;
    }
    // horizontal
    if (browser.content.clientWidth < (200 + clientX)) {
        if (event.clientX !== undefined && location.href.indexOf("?test_browser") < 0) {
            reverse = true;
        }
        menu.style.left = `${(clientX - 200) / 10}em`;
    } else {
        menu.style.left = `${clientX / 10}em`;
    }

    // button order
    if (reverse === true) {
        a = itemList.length;
        do {
            a = a - 1;
            menu.appendChild(itemList[a]);
        } while (a > 0);
    } else {
        do {
            menu.appendChild(itemList[a]);
            a = a + 1;
        } while (a < itemList.length);
    }
    browser.content.appendChild(menu);
};

/* Destroys a context menu */
context.menuRemove = function browser_context_menuRemove():void {
    const menu:Element = document.getElementById("contextMenu"),
        offline:HTMLCollectionOf<Element> = document.getElementsByClassName("offline");
    if (offline.length > 0 && offline[0].getAttribute("class") === "title offline") {
        network.heartbeat("active", true);
    }
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

/* Prepare the network action to write files */
context.paste = function browser_context_paste():void {
    const box = context.element.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        destination:string = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value,
        clipData:clipboard = (clipboard === "")
            ? {}
            : JSON.parse(clipboard),
        sourceModal:Element = document.getElementById(clipData.id),
        menu:Element = document.getElementById("contextMenu"),
        cut:boolean = (clipData.type === "cut"),
        payload:systemDataCopy = {
            agentSource: {
                id: clipData.agent,
                modalAddress: (sourceModal === null)
                    ? null
                    : sourceModal.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value,
                share: (sourceModal === null)
                    ? null
                    : browser.data.modals[clipData.id].share,
                type: clipData.agentType
            },
            agentWrite: {
                id: browser.data.modals[id].agent,
                modalAddress: destination,
                share: browser.data.modals[id].share,
                type: browser.data.modals[id].agentType
            },
            cut: cut,
            location: clipData.data
        },
        callback = function browser_context_paste_callback(message:string):void {
            const copyModal:Element = document.getElementById(id);
            clipboard = "";
            util.selectNone(document.getElementById(clipData.id));
            if (copyModal !== null) {
                const body:Element = copyModal.getElementsByClassName("body")[0],
                    status:fileStatusMessage = (message === "" || message === null)
                        ? null
                        : JSON.parse(message);
                if (status !== null) {
                    body.innerHTML = "";
                    body.appendChild(fileBrowser.list(destination, status.fileList, status.message));
                    if (status.fileList === "missing" || status.fileList === "noShare" || status.fileList === "readOnly") {
                        const p:HTMLElement = document.createElement("p"),
                            statusBar:HTMLElement = copyModal.getElementsByClassName("status-bar")[0] as HTMLElement;
                        p.innerHTML = status.message;
                        statusBar.innerHTML = "";
                        statusBar.appendChild(p);
                    }
                }
            }
        };
    if (clipboard === "" || box === document.documentElement) {
        return;
    }
    network.copy(payload, callback);
    context.element = null;
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

context.type = "";

export default context;