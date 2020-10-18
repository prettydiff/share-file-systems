
/* lib/browser/message - A library for executing the text messaging application. */

import common from "../common/common.js";

import browser from "./browser.js";
import modal from "./modal.js";

const message:module_message = {};

message.modal = function local_message_modal(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        className:string = element.getAttribute("class"),
        grandParent:Element = <Element>element.parentNode.parentNode,
        agentHash:string = (className === "text-button-agent")
            ? grandParent.getAttribute("data-hash")
            : browser.data.hashDevice,
        agentType:agentType = "device",
        title:string = (agentHash === browser.data.hashDevice)
            ? `Text message all ${agentType}s`
            : `Text message ${common.capitalize(agentType)} ${browser.data[agentType][agentHash]}`,
        configuration:ui_modal = {
            agent: agentHash,
            agentType: agentType,
            content: null,
            inputs: ["close", "maximize", "minimize"],
            read_only: false,
            text_value: title,
            title: title,
            type: "shares",
            width: 800
        };
    modal.create(configuration);
};

export default message;