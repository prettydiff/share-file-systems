
/* lib/browser/utilities/context_menu - Displays the context menu. */

import browser from "./browser.js";
import context_copy from "./context_copy.js";
import context_destroy from "./context_destroy.js";
import context_paste from "./context_paste.js";
import context_rename from "./context_rename.js";
import context_share from "./context_share.js";
import modal_fileDetails from "./modal_fileDetails.js";
import file_new from "./file_new.js";
import modal_fileEdit from "./modal_fileEdit.js";
import util from "./util.js";

// cspell: words agenttype

const context_menu = function browser_utilities_contextMenu(event:MouseEvent):void {
    const element:HTMLElement = (function browser_utilities_contextMenu_element():HTMLElement {
            const target:HTMLElement = event.target as HTMLElement,
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
            base64: function browser_utilities_contextMenu_base64():void {
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
            copy: function browser_utilities_contextMenu_copy():void {
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
            cut: function browser_utilities_contextMenu_cut():void {
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
            destroy: function browser_utilities_contextMenu_destroy():void {
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
            details: function browser_utilities_contextMenu_details():void {
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
            edit: function browser_utilities_contextMenu_edit():void {
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
            hash: function browser_utilities_contextMenu_hash():void {
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
            newDirectory: function browser_utilities_contextMenu_newDirectory():void {
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
            newFile: function browser_utilities_contextMenu_newFile():void {
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
            paste: function browser_utilities_contextMenu_paste():void {
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
            rename: function browser_utilities_contextMenu_rename():void {
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
            share: function browser_utilities_contextMenu_share():void {
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
};

export default context_menu;