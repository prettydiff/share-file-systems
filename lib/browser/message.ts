
/* lib/browser/message - A library for executing the text messaging application. */

import common from "../common/common.js";

import browser from "./browser.js";
import modal from "./modal.js";
import network from "./network.js";

const message:module_message = {
    mousedown: false
};

/* render a message modal */
message.modal = function local_message_modal(configuration:ui_modal):void {
    const content:Element = document.createElement("ol");
    content.setAttribute("class", "message-content");
    configuration.content = content;
    modal.create(configuration);
};

/* generate a message modal from a share button */
message.shareButton = function local_message_shareButton(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        source:Element = (element.nodeName.toLowerCase() === "button")
            ? element
            : <Element>element.parentNode,
        className:string = source.getAttribute("class"),
        grandParent:Element = <Element>source.parentNode.parentNode,
        agentHash:string = (className === "text-button-agent")
            ? grandParent.getAttribute("data-hash")
            : browser.data.hashDevice,
        agentType:agentType = (className === "text-button-agent")
            ? <agentType>grandParent.getAttribute("class")
            : <agentType>source.getAttribute("class").replace("text-button-", ""),
        title:string = (agentHash === browser.data.hashDevice)
            ? `Text message to all ${agentType}s`
            : `Text message to ${common.capitalize(agentType)} ${browser[agentType][agentHash].name}`,
        configuration:ui_modal = {
            agent: agentHash,
            agentType: agentType,
            content: null,
            inputs: ["close", "maximize", "minimize"],
            read_only: false,
            scroll: false,
            text_value: title,
            title: title,
            type: "message",
            width: 800
        };
    message.modal(configuration);
};

message.textareaDown = function local_message_textareaDown():void {
    message.mousedown = true;
};

message.textareaResize = function local_message_textareaResize(event:MouseEvent):void {
    if (message.mousedown === true) {
        const element:Element = <Element>event.target,
            box:Element = element.getAncestor("box", "class"),
            body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
            id:string = box.getAttribute("id");
        let width:number = element.clientWidth + 40;
        if (width > 557) {
            body.style.width = `${width / 10}em`;
            browser.data.modals[id].width = width;
        }
    }
};

message.textareaUp = function local_message_textareaUp():void {
    message.mousedown = false;
    network.storage("settings");
};

export default message;