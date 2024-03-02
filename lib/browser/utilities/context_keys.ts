
/* lib/browser/utilities/context_keys - Shortcut key handling for context menu operations. */

import browser from "./browser.js";
import context_copy from "./context_copy.js";
import context_destroy from "./context_destroy.js";
import context_paste from "./context_paste.js";
import context_rename from "./context_rename.js";
import context_share from "./context_share.js";
import file_directory from "./file_directory.js";
import file_new from "./file_new.js";
import file_select_addresses from "./file_select_addresses.js";
import modal_fileDetails from "./modal_fileDetails.js";
import modal_fileEdit from "./modal_fileEdit.js";

const context_keys = function browser_utilities_contextKeys(event:KeyboardEvent):void {
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
};

export default context_keys;