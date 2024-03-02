
/* lib/browser/utilities/context_copy - File system copy function from the context menu. */

import browser from "./browser.js";
import file_select_addresses from "./file_select_addresses.js";
import file_select_none from "./file_select_none.js";
import util from "./util.js";

const context_copy = function browser_utilities_contextCopy(event:Event):void {
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
        clipStore:context_clipboard = (browser.context_clipboard === "")
            ? null
            : JSON.parse(browser.context_clipboard) as context_clipboard;
    if (selected.length < 1) {
        addresses.push(element.getElementsByTagName("label")[0].innerHTML.replace(/&amp;/g, "&"));
    } else {
        selected.forEach(function browser_utilities_contextCopy_each(value:[string, fileType, string]):void {
            addresses.push(value[0].replace(/&amp;/g, "&"));
        });
    }
    if (clipStore !== null) {
        if (clipStore.id !== box.getAttribute("id") || type !== "cut") {
            file_select_none(document.getElementById(clipStore.id));
        }
    }
    browser.context_clipboard = JSON.stringify(clipData);
    browser.contextElement = null;
    browser.contextType = "";
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

export default context_copy;