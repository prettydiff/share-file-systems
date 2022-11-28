
/* lib/browser/content/context - A collection of event handlers associated with the right click context menu. */

import browser from "../utilities/browser.js";
import file_browser from "./file_browser.js";
import global_events from "./global_events.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import share from "./share.js";
import util from "../utilities/util.js";

// cspell:words agenttype

/**
 * Creates and populates the right click context menu for the file navigate modal types.
 * ```typescript
 * interface module_context {
 *     clipboard: string;                          // Stores a file copy state pending a paste or cut action.
 *     content: (event:MouseEvent) => HTMLElement; // Creates the HTML content of the context menu.
 *     element: HTMLElement;                       // Stores a reference to the element.target associated with a given menu item.
 *     events: {
 *         copy      : (event:Event) => void; // Handler for the *Copy* menu button, which stores file system address information in the application's clipboard.
 *         dataString: (event:Event) => void; // Handler for the *Base64*, *Edit*, and *Hash* menu buttons.
 *         destroy   : (event:Event) => void; // Handler for the *Destroy* menu button, which is responsible for deleting file system artifacts.
 *         details   : (Event:Event) => void; // Handler for the *Details* menu button, which will generate a details modal.
 *         fsNew     : (event:Event) => void; // Handler for the *New Directory* and *New File* menu buttons.
 *         menu      : (event:Event) => void; // Generates the context menu which populates with different menu items depending upon event.target of the right click.
 *         paste     : (event:Event) => void; // Handler for the *Paste* menu item which performs the file copy operation over the network.
 *     };
 *     type: contextType; // Stores a context action type for awareness to the context action event handler.
 * }
 * type contextType = "" | "Base64" | "copy" | "cut" | "directory" | "Edit" | "file" | "Hash";
 * ``` */
const context:module_context = {
    clipboard: "",
    content: function browser_content_context_content(event:MouseEvent):HTMLElement {
        const element:HTMLElement = (function browser_content_context_menu_element():HTMLElement {
                const target:HTMLElement = event.target,
                    name:string = target.lowName();
                if (name === "li" || name === "ul") {
                    return target;
                }
                return target.getAncestor("li", "tag");
            }()),
            inputAddress:string = element.getAncestor("border", "class").getElementsByTagName("input")[0].value,
            root:boolean = (inputAddress === "/" || inputAddress === "\\"),
            nodeName:string = element.lowName(),
            itemList:HTMLElement[] = [],
            menu:HTMLElement = document.createElement("ul"),
            command:string = (navigator.userAgent.indexOf("Mac OS X") > 0)
                ? "Command"
                : "CTRL",
            functions:context_functions = {
                base64: function browser_content_context_menu_base64():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `Base64 <em>${command} + ALT + B</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = context.events.dataString;
                    item.appendChild(button);
                    itemList.push(item);
                },
                copy: function browser_content_context_menu_copy():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `Copy <em>${command} + C</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = context.events.copy;
                    item.appendChild(button);
                    itemList.push(item);
                },
                cut: function browser_content_context_menu_cut():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `Cut <em>${command} + X</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = context.events.copy;
                    item.appendChild(button);
                    itemList.push(item);
                },
                destroy: function browser_content_context_menu_destroy():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = "Destroy <em>DEL</em>";
                    button.setAttribute("type", "button");
                    button.setAttribute("class", "destroy");
                    if (root === true) {
                        button.disabled = true;
                    } else {
                        button.onclick = context.events.destroy;
                    }
                    item.appendChild(button);
                    itemList.push(item);
                },
                details: function browser_content_context_menu_details():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `Details <em>${command} + ALT + T</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = context.events.details;
                    item.appendChild(button);
                    itemList.push(item);
                },
                edit: function browser_content_context_menu_edit():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    if (readOnly === true) {
                        button.innerHTML = `Read File as Text <em>${command} + ALT + E</em>`;
                    } else {
                        button.innerHTML = `Edit File as Text <em>${command} + ALT + E</em>`;
                    }
                    button.setAttribute("type", "button");
                    button.onclick = context.events.dataString;
                    item.appendChild(button);
                    itemList.push(item);
                },
                hash: function browser_content_context_menu_hash():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `Hash <em>${command} + ALT + H</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = context.events.dataString;
                    item.appendChild(button);
                    itemList.push(item);
                },
                newDirectory: function browser_content_context_menu_newDirectory():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `New Directory <em>${command} + ALT + D</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = context.events.fsNew;
                    item.appendChild(button);
                    itemList.push(item);
                },
                newFile: function browser_content_context_menu_newFile():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `New File <em>${command} + ALT + F</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = context.events.fsNew;
                    item.appendChild(button);
                    itemList.push(item);
                },
                paste: function browser_content_context_menu_paste():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `Paste <em>${command} + V</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = context.events.paste;
                    if (context.clipboard === "" || (context.clipboard.indexOf("\"type\":") < 0 || context.clipboard.indexOf("\"data\":") < 0)) {
                        button.disabled = true;
                    }
                    item.appendChild(button);
                    itemList.push(item);
                },
                rename: function browser_content_context_menu_rename():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `Rename <em>${command} + ALT + R</em>`;
                    button.setAttribute("type", "button");
                    if (root === true) {
                        button.disabled = true;
                    } else {
                        button.onclick = file_browser.events.rename;
                    }
                    item.appendChild(button);
                    itemList.push(item);
                },
                share: function browser_content_context_menu_share():void {
                    item = document.createElement("li");
                    button = document.createElement("button");
                    button.innerHTML = `Share <em>${command} + ALT + S</em>`;
                    button.setAttribute("type", "button");
                    button.onclick = share.events.context;
                    item.appendChild(button);
                    itemList.push(item);
                }
            },
            clientHeight:number = browser.content.clientHeight;
        let item:HTMLElement,
            button:HTMLButtonElement,
            clientX:number,
            clientY:number,
            menuTop:number,
            box:HTMLElement = element.getAncestor("box", "class"),
            readOnly:boolean = browser.data.modals[box.getAttribute("id")].read_only,
            reverse:boolean = false,
            a:number = 0;
        context.element = element;
        global_events.contextMenuRemove();
        event.preventDefault();
        event.stopPropagation();
        menu.setAttribute("id", "contextMenu");
        menu.onclick = global_events.contextMenuRemove;
        if (nodeName === "ul") {
            functions.details();
            if (readOnly === false) {
                functions.newDirectory();
                functions.newFile();
                functions.paste();
            }
        } else if (nodeName === "li") {
            functions.details();
            if (box.dataset.agenttype === "device") {
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
            const body:HTMLElement = element.getAncestor("body", "class");
            clientX = element.offsetLeft + body.offsetLeft + box.offsetLeft + 50;
            clientY = element.offsetTop + body.offsetTop + box.offsetTop + 65;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        // menu display position
        menu.style.zIndex = `${browser.data.zIndex + 10}`;

        menuTop = ((itemList.length * 52) + 1) + clientY;
        // vertical
        if (clientHeight < menuTop) {
            // above cursor
            menu.style.bottom = "1em";
            if (clientY > clientHeight - 52) {
                reverse = true;
            }
        } else {
            // below cursor
            menu.style.top = `${clientY /  10}em`;
        }

        // horizontal
        if (browser.content.clientWidth < (200 + clientX)) {
            // right of cursor
            menu.style.left = `${(clientX - 200) / 10}em`;
        } else {
            // left of cursor
            menu.style.left = `${(clientX + 10) / 10}em`;
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
        return menu;
    },

    /* Stores an element for reference between event and menu action */
    element: null,

    events: {

        /* Handler for file system artifact copy */
        copy: function browser_content_context_copy(event:Event):void {
            const addresses:string[] = [],
                tagName:string = context.element.lowName(),
                element:HTMLElement = (tagName === "li" || tagName === "ul")
                    ? context.element
                    : context.element.getAncestor("li", "tag"),
                menu:HTMLElement = document.getElementById("contextMenu"),
                box:HTMLElement = element.getAncestor("box", "class"),
                contextElement:HTMLElement = event.target as HTMLElement,
                type:contextType = (context.type !== "")
                    ? context.type
                    : (contextElement.innerHTML.indexOf("Copy") === 0)
                        ? "copy"
                        : "cut",
                selected:[string, fileType, string][] = util.selectedAddresses(element, type),
                agency:agency = util.getAgent(box),
                id:string = box.getAttribute("id"),
                clipData:context_clipboard = {
                    agent: agency[0],
                    agentType: agency[2],
                    data: addresses,
                    id: id,
                    share: browser.data.modals[id].share,
                    type: type
                },
                clipStore:context_clipboard = (context.clipboard === "")
                    ? null
                    : JSON.parse(context.clipboard);
            if (selected.length < 1) {
                addresses.push(element.getElementsByTagName("label")[0].innerHTML.replace(/&amp;/g, "&"));
            } else {
                selected.forEach(function browser_content_context_destroy_each(value:[string, fileType, string]):void {
                    addresses.push(value[0].replace(/&amp;/g, "&"));
                });
            }
            if (clipStore !== null) {
                if (clipStore.id !== box.getAttribute("id") || type !== "cut") {
                    util.selectNone(document.getElementById(clipStore.id));
                }
            }
            context.clipboard = JSON.stringify(clipData);
            context.element = null;
            context.type = "";
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },
    
        /* Handler for base64, edit, and hash operations from the context menu */
        dataString: function browser_content_context_dataString(event:Event):void {
            const element:HTMLElement = (context.element.lowName() === "li")
                    ? context.element
                    : context.element.getAncestor("li", "tag"),
                mouseEvent:MouseEvent = event as MouseEvent,
                contextElement:HTMLElement = event.target as HTMLElement,
                type:contextType = (context.type !== "")
                    ? context.type
                    : (contextElement.innerHTML.indexOf("Base64") === 0)
                        ? "Base64"
                        : (contextElement.innerHTML.indexOf("File as Text") > 0)
                            ? "Edit"
                            : "Hash",
                menu:HTMLElement = document.getElementById("contextMenu"),
                addresses:[string, fileType, string][] = util.selectedAddresses(element, "fileEdit"),
                box:HTMLElement = element.getAncestor("box", "class"),
                length:number = addresses.length,
                agency:agency = util.getAgent(box),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                payloadNetwork:service_fileSystem = {
                    action: (type === "Edit")
                        ? "fs-read"
                        : `fs-${type.toLowerCase()}` as actionFile,
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 1,
                    location: [],
                    name: ""
                },
                payloadModal:config_modal = {
                    agent: agency[0],
                    agentIdentity: true,
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
                };
            let a:number = 0,
                delay:HTMLElement,
                modalInstance:HTMLElement;
            do {
                if (addresses[a][1].indexOf("file") === 0) {
                    delay = util.delay();
                    payloadModal.content = delay;
                    payloadModal.left = mouseEvent.clientX + (a * 10);
                    payloadModal.title = addresses[a][0];
                    payloadModal.top = (mouseEvent.clientY - 60) + (a * 10);
                    modalInstance = modal.content(payloadModal);
                    payloadNetwork.location.push(`${modalInstance.getAttribute("id")}:${addresses[a][0]}`);
                }
                a = a + 1;
            } while (a < length);
            network.send(payloadNetwork, "file-system");
            context.element = null;
            context.type = "";
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },
    
        /* Handler for removing file system artifacts via context menu */
        destroy: function browser_content_context_destroy():void {
            let element:HTMLElement = (context.element.lowName() === "li")
                    ? context.element
                    : context.element.getAncestor("li", "tag"),
                selected:[string, fileType, string][],
                box:HTMLElement = element.getAncestor("box", "class"),
                menu:HTMLElement = document.getElementById("contextMenu"),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                payload:service_fileSystem = {
                    action: "fs-destroy",
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 1,
                    location: [],
                    name: box.getElementsByClassName("header")[0].getElementsByTagName("input")[0].value
                };
            selected = util.selectedAddresses(element, "destroy");
            if (selected.length < 1) {
                payload.location.push(element.getElementsByTagName("label")[0].innerHTML);
            } else {
                selected.forEach(function browser_content_context_destroy_each(value:[string, fileType, string]):void {
                    payload.location.push(value[0]);
                });
            }
            network.send(payload, "file-system");
            context.element = null;
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },
    
        /* Handler for details action of context menu */
        details: function browser_content_context_details(event:Event):void {
            const name:string = context.element.lowName(),
                mouseEvent:MouseEvent = event as MouseEvent,
                element:HTMLElement = (name === "li" || name === "ul")
                    ? context.element
                    : context.element.getAncestor("li", "tag"),
                div:HTMLElement = util.delay(),
                box:HTMLElement = element.getAncestor("box", "class"),
                agency:agency = util.getAgent(box),
                menu:HTMLElement = document.getElementById("contextMenu"),
                addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
                addresses:[string, fileType, string][] = util.selectedAddresses(element, "details"),
                payloadModal:config_modal = {
                    agent: agency[0],
                    agentIdentity: true,
                    agentType: agency[2],
                    content: div,
                    height: 600,
                    inputs: ["close"],
                    left: mouseEvent.clientX,
                    read_only: agency[1],
                    single: true,
                    text_value: "",
                    title: `Details - ${addresses.length} items`,
                    top: (mouseEvent.clientY - 60 < 0)
                        ? 60
                        : mouseEvent.clientY - 60,
                    type: "details",
                    width: 500
                },
                modalInstance:HTMLElement = modal.content(payloadModal),
                id:string = modalInstance.getAttribute("id"),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                payloadNetwork:service_fileSystem = {
                    action: "fs-details",
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 0,
                    location: (function browser_content_context_details_addressList():string[] {
                        const output:string[] = [],
                            length:number = addresses.length;
                        let a:number = 0;
                        if (name === "ul") {
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
            if (browser.loading === true) {
                return;
            }
            browser.data.modals[id].text_value = JSON.stringify(payloadNetwork.location);
            network.send(payloadNetwork, "file-system");
            network.configuration();
            context.element = null;
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },

        /* Handler for creating new directories */
        fsNew: function browser_content_context_fsNew(event:Event):void {
            const element:HTMLElement = event.target as HTMLElement,
                menu:HTMLElement = document.getElementById("contextMenu"),
                cancel = function browser_content_context_fsNew_cancel(actionElement:HTMLElement):void {
                    const list:HTMLElement = actionElement.getAncestor("fileList", "class"),
                        input:HTMLElement = list.getElementsByTagName("input")[0] as HTMLElement;
                    setTimeout(function browser_content_context_fsNew_cancel_delay():void {
                        if (actionElement.parentNode.parentNode.parentNode.parentNode === list) {
                            list.removeChild(actionElement.parentNode.parentNode.parentNode);
                            input.focus();
                        }
                    }, 10);
                },
                actionKeyboard = function browser_content_context_fsNew_actionKeyboard(actionEvent:KeyboardEvent):void {
                    const actionElement:HTMLInputElement = actionEvent.target as HTMLInputElement,
                        actionParent:HTMLElement = actionElement.parentNode;
                    if (actionEvent.key === "Enter") {
                        const value:string = actionElement.value.replace(/(\s+|\.)$/, ""),
                            agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(actionParent, null),
                            payload:service_fileSystem = {
                                action: "fs-new",
                                agentRequest: agents[0],
                                agentSource: agents[1],
                                agentWrite: null,
                                depth: 1,
                                location: [actionElement.dataset.location + value],
                                name: actionElement.dataset.type
                            };
                        if (value.replace(/\s+/, "") !== "") {
                            actionElement.onkeyup = null;
                            actionElement.onblur = null;
                            actionParent.innerHTML = payload.location[0];
                            network.send(payload, "file-system");
                        }
                    } else {
                        if (actionEvent.key === "Escape") {
                            cancel(actionElement);
                            return;
                        }
                        actionElement.value = actionElement.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
                    }
                },
                actionBlur = function browser_content_context_fsNew_actionBlur(actionEvent:FocusEvent):void {
                    const actionElement:HTMLInputElement = actionEvent.target as HTMLInputElement,
                        value:string = actionElement.value.replace(/(\s+|\.)$/, "");
                    if (actionEvent.type === "blur") {
                        if (value.replace(/\s+/, "") === "") {
                            cancel(actionElement);
                        } else {
                            const actionParent:HTMLElement = actionElement.parentNode,
                                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(actionParent, null),
                                payload:service_fileSystem = {
                                    action: "fs-new",
                                    agentRequest: agents[0],
                                    agentSource: agents[1],
                                    agentWrite: null,
                                    depth: 1,
                                    location: [actionElement.dataset.location + value],
                                    name: actionElement.dataset.type
                                };
                            actionElement.onkeyup = null;
                            actionElement.onblur = null;
                            actionParent.innerHTML = payload.location[0];
                            network.send(payload, "file-system");
                        }
                    }
                },
                build = function browser_content_context_fsNew_build():void {
                    const li:HTMLElement = document.createElement("li"),
                        label:HTMLLabelElement = document.createElement("label"),
                        input:HTMLInputElement = document.createElement("input"),
                        field:HTMLInputElement = document.createElement("input"),
                        text:HTMLElement = document.createElement("label"),
                        p:HTMLElement = document.createElement("p"),
                        spanInfo:HTMLElement = document.createElement("span"),
                        parent:HTMLElement = (context.element === null)
                            ? null
                            : context.element.parentNode,
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
                        slash:"/"|"\\" = "/",
                        path:string = box.getElementsByTagName("input")[0].value;
    
                    li.setAttribute("class", type);
                    if (type === "directory") {
                        li.ondblclick = file_browser.events.directory;
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
                    text.oncontextmenu = context.events.menu;
                    text.onclick = file_browser.events.select;
                    text.innerHTML = path;
                    field.onkeyup = actionKeyboard;
                    field.onblur = actionBlur;
                    field.setAttribute("id", "newFileItem");
                    field.setAttribute("data-type", type);
                    field.setAttribute("data-location", path);
                    text.appendChild(field);
                    li.appendChild(p);
                    span = document.createElement("span");
                    span.onclick = file_browser.events.select;
                    span.oncontextmenu = context.events.menu;
                    li.appendChild(span);
                    li.oncontextmenu = context.events.menu;
                    li.appendChild(label);
                    li.onclick = file_browser.events.select;
                    if (context.element.lowName() === "ul") {
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
        },
    
        /* Creates context menu */
        menu: function browser_content_context_menu(event:Event):void {
            browser.content.parentNode.appendChild(context.content(event as MouseEvent));
        },
    
        /* Prepare the network action to write files */
        paste: function browser_content_context_paste():void {
            const box:HTMLElement = context.element.getAncestor("box", "class"),
                clipData:context_clipboard = (context.clipboard === "")
                    ? {}
                    : JSON.parse(context.clipboard),
                sourceModal:HTMLElement = document.getElementById(clipData.id),
                menu:HTMLElement = document.getElementById("contextMenu"),
                cut:boolean = (clipData.type === "cut"),
                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(sourceModal, box),
                payload:service_copy = {
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: agents[2],
                    cut: cut,
                    execute: false,
                    location: clipData.data
                };
            if (context.clipboard === "" || box === document.documentElement) {
                return;
            }
            network.send(payload, "copy");
            context.clipboard = "";
            util.selectNone(document.getElementById(clipData.id));
            context.element = null;
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },
    },

    /* Stores a context action type for awareness to the context action event handler */
    type: ""

};

export default context;