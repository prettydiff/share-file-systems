
/* lib/browser/message - A library for executing the text messaging application. */

import common from "../common/common.js";

import browser from "./browser.js";
import modal from "./modal.js";

const message:module_message = {};

message.modal = function local_message_modal(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        button:Element = (element.nodeName.toLowerCase() === "button")
            ? element
            : <Element>element.parentNode,
        className:string = button.getAttribute("class"),
        grandParent:Element = <Element>button.parentNode.parentNode,
        agentHash:string = (className === "text-button-agent")
            ? grandParent.getAttribute("data-hash")
            : browser.data.hashDevice,
        agentType:agentType = (className === "text-button-agent")
            ? <agentType>grandParent.getAttribute("class")
            : <agentType>button.getAttribute("class").replace("text-button-", ""),
        title:string = (className === "text-button-agent")
            ? `Text message ${common.capitalize(agentType)} ${browser[agentType][agentHash].name}`
            : `Text message all ${agentType}s`,
        content:Element = document.createElement("div"),
        textarea:Element = document.createElement("textarea"),
        list:Element = document.createElement("ol"),
        configuration:ui_modal = {
            agent: agentHash,
            agentType: agentType,
            content: content,
            inputs: ["close", "maximize", "minimize"],
            read_only: false,
            text_value: title,
            title: title,
            type: "shares",
            width: 800
        };
    content.setAttribute("class", "message-content");
    content.appendChild(textarea);
    content.appendChild(list);
    modal.create(configuration);
};

export default message;