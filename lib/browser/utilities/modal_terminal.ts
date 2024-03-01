
/* lib/browser/utilities/modal_terminal - Modal configuration for terminal modals. */

import browser from "./browser.js";
import modal from "./modal.js";
import terminal from "../content/terminal.js";
import webSocket from "./webSocket.js";

const modal_terminal = function browser_utilities_modalTerminal(event:Event, config?:config_modal):modal {
    let box:modal = null;
    const content:[HTMLElement, HTMLElement] = terminal.content(),
        element:HTMLElement = (event === null)
            ? null
            : event.target as HTMLElement,
        ancestor:HTMLElement = (element === null)
            ? null
            : element.getAncestor("div", "tag"),
        shareAgent:string = (ancestor === null)
            ? null
            : ancestor.dataset.hash,
        agentName:string = (config === undefined)
            ? (shareAgent === undefined || shareAgent === null)
                ? browser.identity.hashDevice
                : shareAgent
            : config.agent,
        agentType:agentType = (config === undefined)
            ? (shareAgent === undefined || shareAgent === null)
                ? "device"
                : ancestor.getAttribute("class") as agentType
            : config.agentType,
        payloadModal:config_modal = (config === undefined)
            ? {
                agent: agentName,
                agentIdentity: true,
                agentType: agentType,
                content: content[0],
                footer: content[1],
                id: (config === undefined)
                    ? null
                    : config.id,
                inputs: ["close", "maximize", "minimize"],
                read_only: false,
                string_store: [],
                text_value: "",
                type: "terminal",
                width: 800
            }
            : config,
        textArea:HTMLTextAreaElement = content[1].getElementsByTagName("textarea")[0];
    if (config !== undefined) {
        textArea.value = config.text_value;
        config.content = content[0];
        config.footer = content[1];
        if (typeof config.text_placeholder === "string" && config.text_placeholder !== "") {
            config.footer.getElementsByClassName("terminal-cwd")[0].appendText(config.text_placeholder, true);
        }
    }
    document.getElementById("menu").style.display = "none";
    textArea.placeholder = "Type a command here. Press 'tab' key for file system auto-completion. Press 'shift + tab' or 'tab, tab' to shift focus.";
    box = modal.content(payloadModal);
    box.socket = webSocket.start(null, browser.identity.hashDevice, "terminal");
    if (config === undefined) {
        terminal.tools.send(box, "", false);
    } else {
        terminal.tools.populate(box, config.string_store, true);
    }
    return box;
};

export default modal_terminal;