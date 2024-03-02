
/* lib/browser/utilities/context_paste - File system paste function from the context menu. */

import browser from "./browser.js";
import file_select_none from "./file_select_none";
import util from "./util.js";

const context_paste = function browser_utilities_contextPaste():void {
    const box:modal = browser.contextElement.getAncestor("box", "class"),
        clipData:context_clipboard = (browser.context_clipboard === "")
            ? null
            : JSON.parse(browser.context_clipboard) as context_clipboard,
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
    if (browser.context_clipboard === "" || box === document.documentElement) {
        return;
    }
    browser.send(payload, "copy");
    browser.context_clipboard = "";
    file_select_none(document.getElementById(clipData.id));
    browser.contextElement = null;
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

export default context_paste;