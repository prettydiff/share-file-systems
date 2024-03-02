
/* lib/browser/utilities/context_destroy - File system destroy function from the context menu. */

import browser from "./browser.js";
import file_select_addresses from "./file_select_addresses.js";
import util from "./util.js";

const context_destroy = function browser_utilities_contextDestroy():void {
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
        selected.forEach(function browser_utilities_contextDestroy_each(value:[string, fileType, string]):void {
            payload.location.push(value[0]);
        });
    }
    browser.send(payload, "file-system");
    browser.contextElement = null;
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

export default context_destroy;