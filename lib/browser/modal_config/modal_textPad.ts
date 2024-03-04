
/* lib/browser/modal_config/modal_textPad - Modal configuration for text pad type modals. */

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";
import modal_textTimer from "../utilities/modal_textTimer.js";

const modal_textPad = function browser_modalConfig_modalTextPad(event:Event, config?:config_modal):modal {
    const element:HTMLElement = (event === null)
            ? null
            : event.target as HTMLElement,
        titleText:string = (element === null)
            ? "Text Pad"
            : element.innerHTML,
        payload:config_modal = (config === undefined)
            ? {
                agent: browser.identity.hashDevice,
                agentIdentity: false,
                agentType: "device",
                content: null,
                id: (config === undefined)
                    ? null
                    : config.id,
                inputs: ["close", "maximize", "minimize"],
                read_only: false,
                type: "text-pad",
                width: 800
            }
            : config;
    let box:modal = null;
    payload.content = modal.tools.textModal(titleText, (config !== undefined && config.text_value !== undefined)
        ? config.text_value
        : "", "text-pad");
    if (titleText.indexOf("Base64 - ") === 0) {
        payload.content.getElementsByTagName("textarea")[0].style.whiteSpace = "normal";
    }
    document.getElementById("menu").style.display = "none";
    box = modal.content(payload);
    box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].onkeyup = modal_textTimer;
    return box;
};

export default modal_textPad;