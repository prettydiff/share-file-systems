
/* lib/browser/utilities/file_status - File navigate modal type contents. */

import browser from "./browser.js";
import common from "../../common/common.js";
import context_copy from "./context_copy.js";
import context_destroy from "./context_destroy.js";
import context_paste from "./context_paste.js";
import context_rename from "./context_rename.js";
import context_share from "./context_share.js";
import file_address from "./file_address";
import file_directory from "./file_directory.js";
import file_select from "./file_select.js";
import file_select_addresses from "./file_select_addresses.js";
import file_select_none from "./file_select_none.js";
import modal_fileDetails from "../modal_config/modal_fileDetails.js";
import modal_fileEdit from "../modal_config/modal_fileEdit.js";
import util from "./util.js";

// cspell: words agenttype

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
        fileList = function browser_utilities_fileStatus_fileList(fileLocation:string, dirs:directory_response, message:string):HTMLElement {
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
                                return common.sortFileList(output, fileLocation, browser.ui.fileSort);
                            }
                            return output;
                        }
                        return dirs as directory_list;
                    }
                    return null;
                }()),
                context_menu = function browser_utilities_fileStatus_contextMenu(event:MouseEvent):void {
                    const element:HTMLElement = (function browser_utilities_contextMenu_element():HTMLElement {
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
                            base64: function browser_utilities_fileStatus_contextMenu_base64():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + ALT + B`);
                                button.appendText("Base64 ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = modal_fileEdit;
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            copy: function browser_utilities_fileStatus_contextMenu_copy():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + C`);
                                button.appendText("Copy ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = context_copy;
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            cut: function browser_utilities_fileStatus_contextMenu_cut():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + X`);
                                button.appendText("Cut ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = context_copy;
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            destroy: function browser_utilities_fileStatus_contextMenu_destroy():void {
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
                                    button.onclick = context_destroy;
                                }
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            details: function browser_utilities_fileStatus_contextMenu_details():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + ALT + T`);
                                button.appendText("Details ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = modal_fileDetails;
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            edit: function browser_utilities_fileStatus_contextMenu_edit():void {
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
                                button.onclick = modal_fileEdit;
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            hash: function browser_utilities_fileStatus_contextMenu_hash():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + ALT + H`);
                                button.appendText("Hash ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = modal_fileEdit;
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            newDirectory: function browser_utilities_fileStatus_contextMenu_newDirectory():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + ALT + D`);
                                button.appendText("New Directory ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = file_new;
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            newFile: function browser_utilities_fileStatus_contextMenu_newFile():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + ALT + F`);
                                button.appendText("New File ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = file_new;
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            paste: function browser_utilities_fileStatus_contextMenu_paste():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLButtonElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + V`);
                                button.appendText("Paste ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = context_paste;
                                if (browser.context_clipboard === "" || (browser.context_clipboard.indexOf("\"type\":") < 0 || browser.context_clipboard.indexOf("\"data\":") < 0)) {
                                    button.disabled = true;
                                }
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            rename: function browser_utilities_fileStatus_contextMenu_rename():void {
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
                                    button.onclick = context_rename;
                                }
                                item.appendChild(button);
                                itemList.push(item);
                            },
                            share: function browser_utilities_fileStatus_contextMenu_share():void {
                                const item:HTMLElement = document.createElement("li"),
                                    button:HTMLElement = document.createElement("button"),
                                    em:HTMLElement = document.createElement("em");
                                em.appendText(`${command} + ALT + S`);
                                button.appendText("Share ");
                                button.appendChild(em);
                                button.setAttribute("type", "button");
                                button.onclick = context_share;
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
                    browser.content.parentNode.appendChild(menu);
                },
                context_keys = function browser_utilities_fileStatus_contextKeys(event:KeyboardEvent):void {
                    const key:string = event.key.toLowerCase(),
                        windowEvent:KeyboardEvent = window.event as KeyboardEvent,
                        target:HTMLElement = event.target,
                        element:HTMLElement = (function browser_utilities_contextKeys_element():HTMLElement {
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
                        context_destroy();
                    } else if (windowEvent.altKey === true && windowEvent.ctrlKey === true) {
                        if (key === "b" && elementName === "li") {
                            // key b, base64
                            browser.contextElement = element;
                            browser.contextType = "Base64";
                            modal_fileEdit(event);
                        } else if (key === "d") {
                            // key d, new directory
                            browser.contextElement = element;
                            browser.contextType = "directory";
                            file_new(event);
                        } else if (key === "e") {
                            // key e, edit file
                            browser.contextElement = element;
                            browser.contextType = "Edit";
                            modal_fileEdit(event);
                        } else if (key === "f") {
                            // key f, new file
                            browser.contextElement = element;
                            browser.contextType = "file";
                            file_new(event);
                        } else if (key === "h" && elementName === "li") {
                            // key h, hash
                            browser.contextElement = element;
                            browser.contextType = "Hash";
                            modal_fileEdit(event);
                        } else if (key === "r" && elementName === "li") {
                            // key r, rename
                            context_rename(event);
                        } else if (key === "s") {
                            // key s, share
                            browser.contextElement = element;
                            context_share();
                        } else if (key === "t") {
                            // key t, details
                            modal_fileDetails(event);
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
                            context_copy(event);
                        } else if (key === "d" && elementName === "li") {
                            // key d, destroy
                            browser.contextElement = element;
                            context_destroy();
                        } else if (key === "v") {
                            // key v, paste
                            browser.contextElement = element;
                            context_paste();
                        } else if (key === "x") {
                            // key x, cut
                            browser.contextElement = element;
                            browser.contextType = "cut";
                            context_copy(event);
                        }
                    }
                },
                file_new = function browser_utilities_fileStatus_fileNew(event:Event):void {
                    const element:HTMLElement = event.target as HTMLElement,
                        menu:HTMLElement = document.getElementById("contextMenu"),
                        cancel = function browser_utilities_fileNew_cancel(actionElement:HTMLElement):void {
                            const list:HTMLElement = actionElement.getAncestor("fileList", "class"),
                                input:HTMLElement = list.getElementsByTagName("input")[0] as HTMLElement;
                            setTimeout(function browser_utilities_fileNew_cancel_delay():void {
                                if (actionElement.parentNode.parentNode.parentNode.parentNode === list) {
                                    list.removeChild(actionElement.parentNode.parentNode.parentNode);
                                    input.focus();
                                }
                            }, 10);
                        },
                        actionKeyboard = function browser_utilities_fileStatus_fileNew_actionKeyboard(actionEvent:KeyboardEvent):void {
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
                                    actionParent.empty();
                                    actionParent.appendText(payload.location[0]);
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
                        actionBlur = function browser_utilities_fileStatus_fileNew_actionBlur(actionEvent:FocusEvent):void {
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
                                    actionParent.empty();
                                    actionParent.appendText(payload.location[0]);
                                    browser.send(payload, "file-system");
                                }
                            }
                        },
                        build = function browser_utilities_fileStatus_fileNew_build():void {
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
                            text.oncontextmenu = context_menu;
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
                            span.oncontextmenu = context_menu;
                            li.appendChild(span);
                            li.oncontextmenu = context_menu;
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
                localLength:number = (local === null)
                    ? 0
                    : local.length,
                output:HTMLElement = document.createElement("ul");

            fileLocation = fileLocation.replace(/(\\|\/)+$/, "");

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
                const fileListItem = function browser_utilities_fileStatus_fileList_listItem(item:directory_item, itemLocation:string, extraClass:string):HTMLElement {
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
                                        button.empty();
                                        button.appendText("-");
                                        button.appendChild(span);
                                        button.setAttribute("title", "Collapse this folder");
                                        browser.send(payload, "file-system");
                                    } else {
                                        const ul:HTMLCollectionOf<HTMLUListElement> = li.getElementsByTagName("ul"),
                                            span:HTMLElement = document.createElement("span");
                                        span.appendText("Expand this folder");
                                        button.empty();
                                        button.appendText("+");
                                        button.appendChild(span);
                                        button.setAttribute("title", "Collapse this folder");
                                        if (ul.length > 0) {
                                            li.removeChild(li.getElementsByTagName("ul")[0]);
                                        }
                                    }
                                };
                            button.setAttribute("class", "expansion");
                            span.appendText("Expand this folder");
                            button.empty();
                            button.appendText("+");
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
                    if (itemLocation === "") {
                        text.appendText(item[0]);
                    } else {
                        text.appendText(item[0].slice(itemLocation.length + 1));
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
                    if (local[a][0] !== fileLocation) {
                        output.appendChild(fileListItem(
                            local[a],
                            fileLocation,
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
                        body.empty();
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