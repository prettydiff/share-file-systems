
/* lib/browser/message - A library for executing the text messaging application. */

import common from "../common/common.js";

import browser from "./browser.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

const message:module_message = {
    mousedown: false
};

/* called from modal.create to supply the footer area modal content */
message.footer = function local_message_footer():Element {
    const textArea:HTMLTextAreaElement = document.createElement("textarea"),
        button = document.createElement("button"),
        paragraph = document.createElement("p"),
        footer = document.createElement("div"),
        clear = document.createElement("span");
    textArea.onmousedown = message.textareaDown;
    textArea.onmousemove = message.textareaResize;
    textArea.onmouseup = message.textareaUp;
    button.innerHTML = "✉ Send Message";
    button.setAttribute("class", "confirm");
    button.onclick = message.submit;
    paragraph.appendChild(button);
    paragraph.setAttribute("class", "footer-buttons");
    footer.setAttribute("class", "footer");
    footer.appendChild(textArea);
    footer.appendChild(paragraph);
    clear.setAttribute("class", "clear");
    footer.appendChild(clear);
    return footer;
};

/* render a message modal */
message.modal = function local_message_modal(configuration:ui_modal):void {
    const content:Element = document.createElement("ol");
    content.setAttribute("class", "message-content");
    configuration.content = content;
    modal.create(configuration);
};

/* Visually display a text message from a local submission */
message.post = function local_message_post(item:messageItem):void {
    const li:Element = document.createElement("li"),
        meta:Element = document.createElement("p"),
        message:HTMLElement = document.createElement("p"),
        self:boolean = ((item.agentType === "device" && item.agentFrom === browser.data.hashDevice) || (item.agentType === "user" && item.agentFrom === browser.data.hashUser)),
        clear:Element = document.createElement("span"),
        date:Date = new Date(item.date),
        modals:Element[] = document.getModalsByModalType("message");
    let index:number = modals.length,
        ol:Element;
    message.innerHTML = item.message;
    clear.setAttribute("class", "clear");
    if (self === true) {
        li.setAttribute("class", "message-self");
    }
    meta.setAttribute("class", "message-meta");
    meta.innerHTML = `<strong>${browser[item.agentType][item.agentFrom].name}</strong> ${common.capitalize(item.agentType)} <em>${util.dateFormat(date)}</em>`;
    li.appendChild(meta);
    li.appendChild(message);
    li.appendChild(clear);
    do {
        index = index - 1;
        if (modals[index].getAttribute("data-agentType") === item.agentType && modals[index].getAttribute("data-agent") === item.agentTo) {
            ol = modals[index].getElementsByClassName("message-content")[0];
            ol.insertBefore(li, ol.firstChild);
        }
    } while (index > 0);
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
            text_value: title,
            title: title,
            type: "message",
            width: 800
        },
        modals:HTMLElement[] = <HTMLElement[]>document.getModalsByModalType("message");
    let a:number = modals.length;
    if (a > 0) {
        do {
            a = a - 1;
            if (modals[a].getAttribute("data-agentType") === agentType && modals[a].getAttribute("data-agent") === agentHash) {
                modals[a].click();
                return;
            }
        } while (a > 0);
    }
    message.modal(configuration);
};

/* the submit event handler to take message text into a data object */
message.submit = function local_message_submit(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        agency:agency = util.getAgent(element),
        footer:Element = element.getAncestor("footer", "class"),
        textArea:HTMLTextAreaElement = footer.getElementsByTagName("textarea")[0],
        messageValue:string = textArea.value,
        payload:messageItem = {
            agentFrom: (agency[2] === "device")
                ? browser.data.hashDevice
                : browser.data.hashUser,
            agentTo: agency[0],
            agentType: agency[2],
            date: Date.now(),
            message: messageValue
        };
    message.post(payload);
};

/* event handler for textarea resizing */
message.textareaDown = function local_message_textareaDown():void {
    message.mousedown = true;
};

/* event handler for resizing the modal from textarea resize */
message.textareaResize = function local_message_textareaResize(event:MouseEvent):void {
    if (message.mousedown === true) {
        const element:Element = <Element>event.target,
            box:Element = element.getAncestor("box", "class"),
            body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
            id:string = box.getAttribute("id");
        let width:number = element.clientWidth + 38;
        if (width > 557) {console.log(width);
            body.style.width = `${width / 10}em`;
            browser.data.modals[id].width = width;
        }
    }
};

/* event handler for textarea resizing */
message.textareaUp = function local_message_textareaUp():void {
    message.mousedown = false;
    network.storage("settings");
};

export default message;