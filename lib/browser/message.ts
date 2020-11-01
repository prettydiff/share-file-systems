
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
message.footer = function browser_message_footer():Element {
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
message.modal = function browser_message_modal(configuration:ui_modal):void {
    const content:Element = document.createElement("table");
    content.setAttribute("class", "message-content");
    content.appendChild(document.createElement("tbody"));
    configuration.content = content;
    modal.create(configuration);
};

/* Visually display a text message from a local submission */
message.post = function browser_message_post(item:messageItem):void {
    const tr:Element = document.createElement("tr"),
        meta:Element = document.createElement("th"),
        message:HTMLElement = document.createElement("td"),
        self = function browser_message_post_self(hash:string):boolean {
            if (item.agentType === "device" && hash === browser.data.hashDevice) {
                return true;
            }
            if (item.agentType === "user" && hash === browser.data.hashUser) {
                return true;
            }
            return false;
        },
        unicode = function browser_message_post_unicode(reference:string):string {
            const output:string[] = [];
            reference.split("\\u").forEach(function browser_message_post_unicode(value:string) {
                output.push(String.fromCharCode(Number(`0x${value}`)));
            });
            return output.join("");
        },
        decimal = function browser_message_post_decimal(reference:string):string {
            return String.fromCodePoint(Number(reference.replace("&#", "").replace(";", "")));
        },
        html = function browser_message_post_html(reference:string):string {
            return String.fromCodePoint(Number(reference.replace("&#x", "0x").replace(";", "")));
        },
        date:Date = new Date(item.date),
        modals:Element[] = document.getModalsByModalType("message");
    let index:number = modals.length,
        tbody:Element,
        posts:HTMLCollectionOf<Element>;
    message.innerHTML = `<p>${item.message
        .replace(/^\s+/, "")
        .replace(/\s+$/, "")
        .replace(/(?<!\\)(\\u[0-9a-f]{4})+/g, unicode)
        .replace(/&#\d+;/g, decimal)
        .replace(/&#x[0-9a-f]+;/, html)
        .replace(/(\r?\n)+/g, "</p><p>")}</p>`;
    tr.setAttribute("data-agentFrom", item.agentFrom);
    meta.innerHTML = `<strong>${browser[item.agentType][item.agentFrom].name}</strong><span>${common.capitalize(item.agentType)}</span> <em>${util.dateFormat(date)}</em>`;
    tr.appendChild(meta);
    tr.appendChild(message);
    do {
        index = index - 1;
        if (modals[index].getAttribute("data-agentType") === item.agentType && modals[index].getAttribute("data-agent") === item.agentTo) {
            tbody = modals[index].getElementsByClassName("message-content")[0].getElementsByTagName("tbody")[0];
            posts = tbody.getElementsByTagName("tr");
            if (posts.length > 0 && self(posts[0].getAttribute("data-agentFrom")) === true) {
                if (self(item.agentTo) === true) {
                    tr.setAttribute("class", "message-self prior");
                } else {
                    tr.setAttribute("class", "prior");
                }
            } else if (self(item.agentTo) === true) {
                tr.setAttribute("class", "message-self");
            }
            tbody.insertBefore(tr, tbody.firstChild);
        }
    } while (index > 0);
};

/* generate a message modal from a share button */
message.shareButton = function browser_message_shareButton(event:MouseEvent):void {
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
message.submit = function browser_message_submit(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        agency:agency = util.getAgent(element),
        footer:Element = element.getAncestor("footer", "class"),
        textArea:HTMLTextAreaElement = footer.getElementsByTagName("textarea")[0],
        payload:messageItem = {
            agentFrom: (agency[2] === "device")
                ? browser.data.hashDevice
                : browser.data.hashUser,
            agentTo: agency[0],
            agentType: agency[2],
            date: Date.now(),
            message: textArea.value
        };
    message.post(payload);
    network.message(payload);
    textArea.value = "";
};

/* event handler for textarea resizing */
message.textareaDown = function browser_message_textareaDown():void {
    message.mousedown = true;
};

/* event handler for resizing the modal from textarea resize */
message.textareaResize = function browser_message_textareaResize(event:MouseEvent):void {
    if (message.mousedown === true) {
        const element:Element = <Element>event.target,
            box:Element = element.getAncestor("box", "class"),
            body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
            id:string = box.getAttribute("id");
        let width:number = element.clientWidth + 38;
        if (width > 557) {
            body.style.width = `${width / 10}em`;
            browser.data.modals[id].width = width;
        }
    }
};

/* event handler for textarea resizing */
message.textareaUp = function browser_message_textareaUp():void {
    message.mousedown = false;
    network.storage("settings");
};

export default message;