
/* lib/browser/message - A library for executing the text messaging application. */

import common from "../common/common.js";

import browser from "./browser.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

const message:module_message = {

    /* called from modal.create to supply the footer area modal content */
    footer: function browser_message_footer():Element {
        const textArea:HTMLTextAreaElement = document.createElement("textarea"),
            label:Element = document.createElement("label"),
            span:Element = document.createElement("span"),
            button = document.createElement("button"),
            paragraph = document.createElement("p"),
            footer = document.createElement("div"),
            clear = document.createElement("span");
        textArea.onmouseup = modal.footerResize;
        textArea.placeholder = "Write a message.";
        label.setAttribute("class", "textPad");
        span.innerHTML = "Write a message.";
        label.appendChild(span);
        label.appendChild(textArea);
        button.innerHTML = "✉ Send Message";
        button.setAttribute("class", "confirm");
        button.onclick = message.submit;
        paragraph.appendChild(button);
        paragraph.setAttribute("class", "footer-buttons");
        footer.setAttribute("class", "footer");
        footer.appendChild(label);
        footer.appendChild(paragraph);
        clear.setAttribute("class", "clear");
        footer.appendChild(clear);
        return footer;
    },

    /* render a message modal */
    modal: function browser_message_modal(configuration:modal):Element {
        const content:Element = document.createElement("table");
        content.setAttribute("class", "message-content");
        content.appendChild(document.createElement("tbody"));
        configuration.content = content;
        return modal.create(configuration);
    },

    /* Visually display a text message */
    post: function browser_message_post(item:messageItem, target:"agentFrom"|"agentTo"):void {
        const tr:Element = document.createElement("tr"),
            meta:Element = document.createElement("th"),
            messageCell:HTMLElement = document.createElement("td"),
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
            writeMessage = function browser_message_post_writeMessage(box:Element):void {
                const tbody:Element = box.getElementsByClassName("message-content")[0].getElementsByTagName("tbody")[0],
                    posts:HTMLCollectionOf<HTMLTableRowElement> = tbody.getElementsByTagName("tr"),
                    postsLength:number = posts.length;
                if (postsLength > 0) {
                    if (posts[0].getAttribute("data-agentFrom") === item.agentFrom) {
                        if (posts[0].getAttribute("class") === null) {
                            posts[0].setAttribute("class", "prior");
                        } else {
                            posts[0].setAttribute("class", `${posts[0].getAttribute("class")} prior`);
                        }
                        if (self(item.agentFrom) === true) {
                            tr.setAttribute("class", "message-self");
                        }
                    } else {
                        if (self(item.agentFrom) === true) {
                            tr.setAttribute("class", "base message-self");
                        } else {
                            tr.setAttribute("class", "base");
                        }
                    }
                } else {
                    if (self(item.agentFrom) === true) {
                        tr.setAttribute("class", "base message-self");
                    } else {
                        tr.setAttribute("class", "base");
                    }
                }
                tbody.insertBefore(tr.cloneNode(true), tbody.firstChild);
                writeTest = true;
            },
            date:Date = new Date(item.date),
            modals:Element[] = document.getModalsByModalType("message");
        let index:number = modals.length,
            writeTest:boolean = false,
            modalAgent:string;
        messageCell.innerHTML = `<p>${item.message
            .replace(/^\s+/, "")
            .replace(/\s+$/, "")
            .replace(/(?<!\\)(\\u[0-9a-f]{4})+/g, unicode)
            .replace(/&#\d+;/g, decimal)
            .replace(/&#x[0-9a-f]+;/, html)
            .replace(/(\r?\n)+/g, "</p><p>")}</p>`;
        tr.setAttribute("data-agentFrom", item.agentFrom);
        if (item.agentType === "user" && item.agentFrom === browser.data.hashUser) {
            meta.innerHTML = `<strong>${browser.data.nameUser}</strong> <em>${util.dateFormat(date)}</em>`;
        } else if (item.agentType === "device" && item.agentFrom === browser.data.hashDevice) {
            meta.innerHTML = `<strong>${browser.data.nameDevice}</strong> <em>${util.dateFormat(date)}</em>`;
        } else {
            meta.innerHTML = `<span>${common.capitalize(item.agentType)}</span> <strong>${browser[item.agentType][item.agentFrom].name}</strong> <em>${util.dateFormat(date)}</em>`;
        }
        tr.appendChild(meta);
        tr.appendChild(messageCell);
        
        // loop through modals
        if (index > 0) {
            do {
                index = index - 1;
                modalAgent = modals[index].getAttribute("data-agent");
                if (item[target] === "all" ||
                    (modals[index].getAttribute("data-agentType") === "user" && (item[target] === "user" || (item.agentType === "user" && item[target] === modalAgent))) ||
                    (modals[index].getAttribute("data-agentType") === "device" && (item[target] === "device" || (item.agentType === "device" && item[target] === modalAgent)))
                ) {
                    writeMessage(modals[index]);
                }
            } while (index > 0);
        }
        if (writeTest === false) {
            const title:string = `Text message to ${common.capitalize(item.agentType)} ${browser[item.agentType][item.agentFrom].name}`,
                messageModal:Element = message.modal({
                    agent: item.agentFrom,
                    agentType: item.agentType,
                    content: null,
                    inputs: ["close", "maximize", "minimize"],
                    read_only: false,
                    text_value: title,
                    title: title,
                    type: "message",
                    width: 800
                });
            writeMessage(messageModal);
        }
    },

    /* generate a message modal from a share button */
    shareButton: function browser_message_shareButton(event:MouseEvent):void {
        const element:Element = event.target as Element,
            source:Element = (util.name(element) === "button")
                ? element
                : element.parentNode as Element,
            className:string = source.getAttribute("class"),
            box:Element = element.getAncestor("box", "class"),
            grandParent:Element = source.parentNode.parentNode as Element,
            agentAttribute:string = box.getAttribute("data-agent"),
            agentHash:string = (agentAttribute === "")
                ? (className === "text-button-agent")
                    ? grandParent.getAttribute("data-hash")
                    : browser.data.hashDevice
                : agentAttribute,
            agentType:agentType = (agentAttribute === "")
                ? (className === "text-button-agent")
                    ? grandParent.getAttribute("class") as agentType
                    : source.getAttribute("class").replace("text-button-", "") as agentType
                : box.getAttribute("data-agentType") as agentType,
            title:string = (agentHash === browser.data.hashDevice)
                ? `Text message to all ${agentType}s`
                : `Text message to ${common.capitalize(agentType)} ${browser[agentType][agentHash].name}`,
            configuration:modal = {
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
    },

    /* the submit event handler to take message text into a data object */
    submit: function browser_message_submit(event:MouseEvent):void {
        const element:Element = event.target as Element,
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
        if (agency[2] === "user" && agency[0] === browser.data.hashUser) {
            payload.agentTo = "user";
        } else if (agency[2] === "device" && agency[0] === browser.data.hashDevice) {
            payload.agentTo = "device";
        } else if (agency[0] === "") {
            payload.agentTo = "";
        }
        message.post(payload, "agentTo");
        network.message(payload);
        textArea.value = "";
    }
};

export default message;