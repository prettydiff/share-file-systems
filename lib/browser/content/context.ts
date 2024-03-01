
/* lib/browser/content/context - A collection of event handlers associated with the right click context menu. */

import browser from "../utilities/browser.js";
import file_directory from "../utilities/file_directory.js";
import file_select from "../utilities/file_select.js";
import file_select_addresses from "../utilities/file_select_addresses.js";
import file_select_none from "../utilities/files_select_none.js";
import modal_configuration from "../utilities/modal_configurations.js";
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
 *         contextMenuRemove: () => void;            // Removes the file system context menu from the DOM
 *         copy             : (event:Event) => void; // Handler for the *Copy* menu button, which stores file system address information in the application's clipboard.
 *         destroy          : (event:Event) => void; // Handler for the *Destroy* menu button, which is responsible for deleting file system artifacts.
 *         fsNew            : (event:Event) => void; // Handler for the *New Directory* and *New File* menu buttons.
 *         menu             : (event:Event) => void; // Generates the context menu which populates with different menu items depending upon event.target of the right click.
 *         paste            : (event:Event) => void; // Handler for the *Paste* menu item which performs the file copy operation over the network.
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
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + ALT + B`);
                    button.appendText("Base64 ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = modal_configuration.modals["file-edit"];
                    item.appendChild(button);
                    itemList.push(item);
                },
                copy: function browser_content_context_menu_copy():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + C`);
                    button.appendText("Copy ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = context.events.copy;
                    item.appendChild(button);
                    itemList.push(item);
                },
                cut: function browser_content_context_menu_cut():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + X`);
                    button.appendText("Cut ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = context.events.copy;
                    item.appendChild(button);
                    itemList.push(item);
                },
                destroy: function browser_content_context_menu_destroy():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLButtonElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText("DEL");
                    button.appendText("Destroy ");
                    button.appendChild(em);
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
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + ALT + T`);
                    button.appendText("Details ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = modal_configuration.modals.details;
                    item.appendChild(button);
                    itemList.push(item);
                },
                edit: function browser_content_context_menu_edit():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + ALT + E`);
                    if (readOnly === true) {
                        button.appendText("Read File as Text ");
                    } else {
                        button.appendText("Edit File as Text ");
                    }
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = modal_configuration.modals["file-edit"];
                    item.appendChild(button);
                    itemList.push(item);
                },
                hash: function browser_content_context_menu_hash():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + ALT + H`);
                    button.appendText("Hash ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = modal_configuration.modals["file-edit"];
                    item.appendChild(button);
                    itemList.push(item);
                },
                newDirectory: function browser_content_context_menu_newDirectory():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + ALT + D`);
                    button.appendText("New Directory ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = context.events.fsNew;
                    item.appendChild(button);
                    itemList.push(item);
                },
                newFile: function browser_content_context_menu_newFile():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + ALT + F`);
                    button.appendText("New File ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = context.events.fsNew;
                    item.appendChild(button);
                    itemList.push(item);
                },
                paste: function browser_content_context_menu_paste():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLButtonElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + V`);
                    button.appendText("Paste ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = context.events.paste;
                    if (context.clipboard === "" || (context.clipboard.indexOf("\"type\":") < 0 || context.clipboard.indexOf("\"data\":") < 0)) {
                        button.disabled = true;
                    }
                    item.appendChild(button);
                    itemList.push(item);
                },
                rename: function browser_content_context_menu_rename():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLButtonElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + ALT + R`);
                    button.appendText("Rename ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    if (root === true) {
                        button.disabled = true;
                    } else {
                        button.onclick = context.events.rename;
                    }
                    item.appendChild(button);
                    itemList.push(item);
                },
                share: function browser_content_context_menu_share():void {
                    const item:HTMLElement = document.createElement("li"),
                        button:HTMLElement = document.createElement("button"),
                        em:HTMLElement = document.createElement("em");
                    em.appendText(`${command} + ALT + S`);
                    button.appendText("Share ");
                    button.appendChild(em);
                    button.setAttribute("type", "button");
                    button.onclick = context.events.share;
                    item.appendChild(button);
                    itemList.push(item);
                }
            },
            box:modal = element.getAncestor("box", "class"),
            agentType:agentType = (box.dataset === undefined)
                ? null
                : box.dataset.agenttype as agentType,
            readOnly:boolean = (browser.ui.modals[box.getAttribute("id")].read_only && agentType !== "device"),
            clientHeight:number = browser.content.clientHeight;
        let clientX:number,
            clientY:number,
            menuTop:number = null,
            reverse:boolean = false,
            a:number = 0;
        browser.contextElement = element;
        util.contextMenuRemove();
        event.preventDefault();
        event.stopPropagation();
        menu.setAttribute("id", "contextMenu");
        menu.onclick = util.contextMenuRemove;
        if (nodeName === "ul") {
            functions.details();
            if (agentType === "device" || readOnly === false) {
                functions.newDirectory();
                functions.newFile();
                functions.paste();
            }
        } else if (nodeName === "li") {
            functions.details();
            if (agentType === "device") {
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
        menu.style.zIndex = `${browser.ui.zIndex + 10}`;

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

    events: {

        /* Handler for file system artifact copy */
        copy: function browser_content_context_copy(event:Event):void {
            const addresses:string[] = [],
                tagName:string = browser.contextElement.lowName(),
                element:HTMLElement = (tagName === "li" || tagName === "ul")
                    ? browser.contextElement
                    : browser.contextElement.getAncestor("li", "tag"),
                menu:HTMLElement = document.getElementById("contextMenu"),
                box:modal = element.getAncestor("box", "class"),
                contextElement:HTMLElement = event.target as HTMLElement,
                type:contextType = (browser.contextType !== "")
                    ? browser.contextType
                    : (contextElement.innerHTML.indexOf("Copy") === 0)
                        ? "copy"
                        : "cut",
                selected:[string, fileType, string][] = file_select_addresses(element, type),
                agency:agentId = util.getAgent(box),
                id:string = box.getAttribute("id"),
                clipData:context_clipboard = {
                    agent: agency[0],
                    agentType: agency[2],
                    data: addresses,
                    id: id,
                    share: browser.ui.modals[id].share,
                    type: type
                },
                clipStore:context_clipboard = (context.clipboard === "")
                    ? null
                    : JSON.parse(context.clipboard) as context_clipboard;
            if (selected.length < 1) {
                addresses.push(element.getElementsByTagName("label")[0].innerHTML.replace(/&amp;/g, "&"));
            } else {
                selected.forEach(function browser_content_context_destroy_each(value:[string, fileType, string]):void {
                    addresses.push(value[0].replace(/&amp;/g, "&"));
                });
            }
            if (clipStore !== null) {
                if (clipStore.id !== box.getAttribute("id") || type !== "cut") {
                    file_select_none(document.getElementById(clipStore.id));
                }
            }
            context.clipboard = JSON.stringify(clipData);
            browser.contextElement = null;
            browser.contextType = "";
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },
    
        /* Handler for removing file system artifacts via context menu */
        destroy: function browser_content_context_destroy():void {
            const element:HTMLElement = (browser.contextElement.lowName() === "li")
                    ? browser.contextElement
                    : browser.contextElement.getAncestor("li", "tag"),
                box:modal = element.getAncestor("box", "class"),
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
                },
                selected:[string, fileType, string][] = file_select_addresses(element, "destroy");
            if (selected.length < 1) {
                payload.location.push(element.dataset.path);
            } else {
                selected.forEach(function browser_content_context_destroy_each(value:[string, fileType, string]):void {
                    payload.location.push(value[0]);
                });
            }
            browser.send(payload, "file-system");
            browser.contextElement = null;
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
                            actionParent.appendText(payload.location[0], true);
                            browser.send(payload, "file-system");
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
                            actionParent.appendText(payload.location[0], true);
                            browser.send(payload, "file-system");
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
                        parent:HTMLElement = (browser.contextElement === null)
                            ? null
                            : browser.contextElement.parentNode,
                        box:modal = (parent === null)
                            ? null
                            : parent.getAncestor("box", "class"),
                        type:contextType = (browser.contextType !== "")
                            ? browser.contextType
                            : (element.innerHTML.indexOf("New File") === 0)
                                ? "file"
                                : "directory",
                        span:HTMLElement = document.createElement("span");
    
                    if (parent === null) {
                        return;
                    }
                    let slash:"/"|"\\" = "/",
                        path:string = box.getElementsByTagName("input")[0].value;
    
                    li.setAttribute("class", type);
                    if (type === "directory") {
                        li.ondblclick = file_directory;
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
                    label.appendText("Selected");
                    label.appendChild(input);
                    label.setAttribute("class", "selection");
                    p.appendChild(text);
                    spanInfo.appendText((type === "file")
                        ? "file - 0 bytes"
                        : "directory - 0 items");
                    p.appendChild(spanInfo);
                    text.oncontextmenu = context.events.menu;
                    text.onclick = file_select;
                    text.appendText(path);
                    field.onkeyup = actionKeyboard;
                    field.onblur = actionBlur;
                    field.setAttribute("id", "newFileItem");
                    field.setAttribute("data-type", type);
                    field.setAttribute("data-location", path);
                    text.appendChild(field);
                    li.appendChild(p);
                    span.onclick = file_select;
                    span.oncontextmenu = context.events.menu;
                    li.appendChild(span);
                    li.oncontextmenu = context.events.menu;
                    li.appendChild(label);
                    li.onclick = file_select;
                    if (browser.contextElement.lowName() === "ul") {
                        browser.contextElement.appendChild(li);
                    } else {
                        browser.contextElement.parentNode.appendChild(li);
                    }
                    field.focus();
                };
            if (document.getElementById("newFileItem") !== null) {
                return;
            }
            build();
            browser.contextElement = null;
            browser.contextType = "";
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },

        /* Executes shortcut key combinations. */
        keys: function browser_content_context_keys(event:KeyboardEvent):void {
            const key:string = event.key.toLowerCase(),
                windowEvent:KeyboardEvent = window.event as KeyboardEvent,
                target:HTMLElement = event.target,
                element:HTMLElement = (function browser_content_context_keys_element():HTMLElement {
                    const el:HTMLElement = document.activeElement,
                        name:string = el.lowName();
                    if (el.parentNode === null || name === "li" || name === "ul") {
                        return el;
                    }
                    return el.getAncestor("li", "tag");
                }()),
                input:HTMLInputElement = event.target as HTMLInputElement,
                elementName:string = element.lowName(),
                p:HTMLElement = element.getElementsByTagName("p")[0];
            if (key === "f5" || (windowEvent.ctrlKey === true && key === "r")) {
                location.reload();
            }
            if ((target.lowName() === "input" && input.type === "text") || element.parentNode === null || document.activeElement === document.getElementById("newFileItem")) {
                return;
            }
            if (key === "enter" && elementName === "li" && (element.getAttribute("class") === "directory" || element.getAttribute("class") === "directory lastType" || element.getAttribute("class") === "directory selected") && p.getAttribute("class") === "selected" && file_select_addresses(element, "directory").length === 1) {
                file_directory(event);
                return;
            }
            event.preventDefault();
            if (elementName !== "ul") {
                event.stopPropagation();
            }
            if (key === "delete" || key === "del") {
                browser.contextElement = element;
                context.events.destroy(event);
            } else if (windowEvent.altKey === true && windowEvent.ctrlKey === true) {
                if (key === "b" && elementName === "li") {
                    // key b, base64
                    browser.contextElement = element;
                    browser.contextType = "Base64";
                    modal_configuration.modals["file-edit"](event);
                } else if (key === "d") {
                    // key d, new directory
                    browser.contextElement = element;
                    browser.contextType = "directory";
                    context.events.fsNew(event);
                } else if (key === "e") {
                    // key e, edit file
                    browser.contextElement = element;
                    browser.contextType = "Edit";
                    modal_configuration.modals["file-edit"](event);
                } else if (key === "f") {
                    // key f, new file
                    browser.contextElement = element;
                    browser.contextType = "file";
                    context.events.fsNew(event);
                } else if (key === "h" && elementName === "li") {
                    // key h, hash
                    browser.contextElement = element;
                    browser.contextType = "Hash";
                    modal_configuration.modals["file-edit"](event);
                } else if (key === "r" && elementName === "li") {
                    // key r, rename
                    context.events.rename(event);
                } else if (key === "s") {
                    // key s, share
                    browser.contextElement = element;
                    context.events.share(event);
                } else if (key === "t") {
                    // key t, details
                    modal_configuration.modals.details(event);
                }
            } else if (windowEvent.ctrlKey === true) {
                if (key === "a") {
                    // key a, select all
                    const list:HTMLElement = (elementName === "ul")
                            ? element
                            : element.parentNode,
                        items:HTMLCollectionOf<Element> = list.getElementsByTagName("li"),
                        length:number = items.length;
                    let a:number = 0,
                        classy:string;
                    do {
                        classy = items[a].getAttribute("class");
                        if (classy !== null && classy.indexOf("cut") > -1) {
                            items[a].setAttribute("class", "selected cut");
                        } else {
                            items[a].setAttribute("class", "selected");
                        }
                        items[a].getElementsByTagName("input")[0].checked = true;
                        a = a + 1;
                    } while (a < length);
                } else if (key === "c") {
                    // key c, copy
                    browser.contextElement = element;
                    browser.contextType = "copy";
                    context.events.copy(event);
                } else if (key === "d" && elementName === "li") {
                    // key d, destroy
                    browser.contextElement = element;
                    context.events.destroy(event);
                } else if (key === "v") {
                    // key v, paste
                    browser.contextElement = element;
                    context.events.paste(event);
                } else if (key === "x") {
                    // key x, cut
                    browser.contextElement = element;
                    browser.contextType = "cut";
                    context.events.copy(event);
                }
            }
        },

        /* Creates context menu */
        menu: function browser_content_context_menu(event:Event):void {
            browser.content.parentNode.appendChild(context.content(event as MouseEvent));
        },

        /* Prepare the network action to write files */
        paste: function browser_content_context_paste():void {
            const box:modal = browser.contextElement.getAncestor("box", "class"),
                clipData:context_clipboard = (context.clipboard === "")
                    ? null
                    : JSON.parse(context.clipboard) as context_clipboard,
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
            browser.send(payload, "copy");
            context.clipboard = "";
            file_select_none(document.getElementById(clipData.id));
            browser.contextElement = null;
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },

        /* The front-side of renaming a file system object */
        rename: function browser_content_context_rename(event:KeyboardEvent|MouseEvent):void {
            const element:HTMLElement = (browser.contextElement === null)
                    ? event.target
                    : browser.contextElement,
                box:modal = element.getAncestor("box", "class"),
                input:HTMLInputElement = document.createElement("input"),
                li:HTMLElement = element.getAncestor("li", "tag"),
                menu:HTMLElement = document.getElementById("contextMenu"),
                actionComplete = function browser_content_context_rename_actionComplete(field:HTMLInputElement, labelValue:string):void {
                    field.onblur = null;
                    field.onkeyup = null;
                    label.removeChild(field);
                    label.appendText(labelValue);
                },
                action = function browser_content_fileBrowser_rename_action(action:KeyboardEvent):void {
                    const field:HTMLInputElement = action.target as HTMLInputElement;
                    if (action.type === "keyup" && action.key === "Escape") {
                        actionComplete(field, text);
                        return;
                    }
                    if (action.type === "blur" || (action.type === "keyup" && action.key === "Enter")) {
                        field.value = field.value.replace(/(\s+|\.)$/, "");
                        const agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                            slash:"/" | "\\" = (text.indexOf("/") < 0 || (text.indexOf("\\") < text.indexOf("/") && text.indexOf("\\") > -1 && text.indexOf("/") > -1))
                                ? "\\"
                                : "/",
                            payload:service_fileSystem = {
                                action: "fs-rename",
                                agentRequest: agents[0],
                                agentSource: agents[1],
                                agentWrite: null,
                                depth: 1,
                                location: [agents[1].modalAddress + slash + text],
                                name: field.value
                            };
                        actionComplete(field, field.value);
                        browser.send(payload, "file-system");
                    } else if (action.type === "keyup") {
                        field.value = field.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
                    }
                },
                label:HTMLElement = li.getElementsByTagName("label")[0],
                text:string = label.textContent;
            if (document.getElementById("fsRename") !== null) {
                return;
            }
            input.setAttribute("id", "fsRename");
            input.type = "text";
            input.value = text;
            input.onblur = action as (event:Event) => void;
            input.onkeyup = action;
            label.removeChild(label.firstChild);
            label.appendChild(input);
            input.focus();
            browser.contextElement = null;
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        },

        share: function browser_content_context_share():void {
            const element:HTMLElement = browser.contextElement,
                addresses:[string, fileType, string][] = file_select_addresses(element, "share"),
                deviceData:agentShares = browser.agents.device[addresses[0][2]].shares,
                shares:string[] = Object.keys(deviceData),
                shareLength:number = shares.length,
                addressesLength:number = addresses.length,
                menu:HTMLElement = document.getElementById("contextMenu");
            let a:number = 0,
                b:number = 0;
            browser.contextElement = null;
            // check to see if this share already exists
            if (shareLength > 0) {
                do {
                    b = 0;
                    do {
                        if (addresses[a][0] === deviceData[shares[b]].name && addresses[a][1] === deviceData[shares[b]].type) {
                            break;
                        }
                        b = b + 1;
                    } while (b < shareLength);
                    if (b === shareLength) {
                        browser.send({
                            device: addresses[a][2],
                            hash: "",
                            share: addresses[a][0],
                            type: addresses[a][1]
                        }, "hash-share");
                    }
                    a = a + 1;
                } while (a < addressesLength);
            } else {
                do {
                    browser.send({
                        device: addresses[a][2],
                        hash: "",
                        share: addresses[a][0],
                        type: addresses[a][1]
                    }, "hash-share");
                    a = a + 1;
                } while (a < addressesLength);
            }
            file_select_none(element);
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
        }
    }
};

export default context;