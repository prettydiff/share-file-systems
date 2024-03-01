
/* lib/browser/utilities/modal_message - Modal configuration for message modals. */

import browser from "./browser.js";
import common from "../../common/common.js";
import message from "../content/message.js";
import modal from "./modal.js";

const modal_message = function browser_utilities_modalMessage(event:Event, config?:config_modal):modal {
    const text:string = (config === null)
            ? ""
            : config.text_value,
        placeholder:string = (config === null)
            ? "text"
            : config.text_placeholder,
        content:[HTMLElement, HTMLElement] = message.content.modal(text, placeholder);
    if (config === null) {
        const element:HTMLElement = event.target as HTMLElement,
            div:HTMLElement = element.getAncestor("div", "tag"),
            agent:string = div.dataset.hash,
            agentType:agentType = div.getAttribute("class") as agentType,
            identity:boolean = (agent === browser.identity.hashDevice || agent === "");
        if (identity === true && browser.agents[agentType][agent] === undefined) {
            return null;
        }
        config = {
            agent: agent,
            agentIdentity: identity,
            agentType: agentType,
            content: null,
            footer: null,
            inputs: ["close", "maximize", "minimize"],
            read_only: false,
            text_placeholder: "text",
            text_value: "",
            title_supplement: (identity === true)
                ? `all ${agentType}s`
                : `${common.capitalize(agentType)} ${browser.agents[agentType][agent].name}`,
            type: "message",
            width: 800
        };
    }
    config.content = content[0];
    config.footer = content[1];
    return modal.content(config);
};

export default modal_message;