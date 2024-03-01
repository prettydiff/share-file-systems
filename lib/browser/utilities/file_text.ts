
/* lib/browser/utilities/file_select_none - Event handler for the address field of the file navigate modals. */

import browser from "./browser.js";
import file_address from "./file_address.js";
import util from "./util.js";

const file_text = function browser_content_fileBrowser_text(event:FocusEvent|KeyboardEvent|MouseEvent):boolean {
    let box:modal,
        history:boolean = true;
    const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
        element:HTMLInputElement = (function browser_content_fileBrowser_text_element():HTMLInputElement {
            const el:HTMLInputElement = event.target as HTMLInputElement,
                parent:HTMLElement = el.parentNode,
                name:string = el.lowName();
            box = el.getAncestor("box", "class");
            if (name !== "input" || (name === "input" && parent.getAttribute("class") !== "fileAddress")) {
                history = false;
            }
            return box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0];
        }()),
        value:string = element.value,
        address:string = ((/^\w:\\?$/).test(value) === true)
            ? (value.charAt(2) === "\\")
                ? value.toUpperCase()
                : `${value.toUpperCase()}\\`
            : value;
    if (address.replace(/\s+/, "") !== "" && (history === false || (event.type === "keyup" && keyboardEvent.key === "Enter"))) {
        const id:string = box.getAttribute("id"),
            agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null, address),
            payload:service_fileSystem = {
                action: (event !== null && event.target.getAttribute("class") === "reloadDirectory" && browser.ui.modals[id].search[0] !== "")
                    ? "fs-search"
                    : "fs-directory",
                agentRequest: agents[0],
                agentSource: agents[1],
                agentWrite: null,
                depth: 2,
                location: [address],
                name: ""
            };
        file_address(event, {
            address: address,
            id: id,
            history: history,
            payload: payload
        });
    }
    return false;
};

export default file_text;