
/* lib/browser/content/message - A library for executing the text messaging application. */

import browser from "../utilities/browser.js";
import message_post from "../utilities/message_post.js";
import message_submit from "../utilities/message_submit.js";
import modal from "../utilities/modal.js";
import modal_message from "../utilities/modal_message.js";

// cspell:words agenttype, arrowdown, arrowup

/**
 * Generates text message modals and all associated interactions.
 * ```typescript
 * interface module_message {
 *     content: {
 *         footer: (mode:messageMode, value:string) => HTMLElement;                 // Called from modal.create to supply the footer area modal content.
 *         modal : (text:string, placeholder:string) => [HTMLElement, HTMLElement]; // Generates a message modal.
 *     };
 *     events: {
 *         keySubmit  : (event:KeyboardEvent) => void;            // Submits a text message on key press, such as pressing the 'Enter' key.
 *         modeToggle : (event:MouseEvent) => void;               // Toggles between code type input and text type input.
 *         shareButton: (event:MouseEvent) => void;               // Creates a message button for the *share* modals.
 *         submit     : (event:KeyboardEvent|MouseEvent) => void; // Submit event handler to take message text into a data object for transmission across a network.
 *     };
 *     tools: {
 *         populate:(modalId:string) => void;                                           // Populate stored messages into message modals.
 *         post    : (item:message_item, target:messageTarget, modalId:string) => void; // Visually display the submitted and received messages as modal content.
 *         receive : (socketData:socketData) => void;                                   // Receives message updates from the network.
 *     };
 * }
 * type messageMode = "code" | "text";
 * type messageTarget = "agentFrom" | "agentTo";
 * ``` */
const message:module_message = {

    /* Render a message modal */
    content: {

        /* Called from modal.create to supply the footer area modal content */
        footer: function browser_content_message_footer(mode:messageMode, value:string):HTMLElement {
            const textArea:HTMLTextAreaElement = document.createElement("textarea"),
                label:HTMLElement = document.createElement("label"),
                span:HTMLElement = document.createElement("span"),
                button:HTMLElement = document.createElement("button"),
                paragraph:HTMLElement = document.createElement("p"),
                footer:HTMLElement = document.createElement("div"),
                clear:HTMLElement = document.createElement("span");
            textArea.onmouseup = modal.events.footerResize;
            textArea.onblur = modal.events.textSave;
            textArea.onkeyup = modal.events.textTimer;
            textArea.placeholder = "Write a message.";
            textArea.value = value;
            textArea.setAttribute("class", mode);
            if (mode === "code") {
                textArea.onkeyup = null;
            } else {
                textArea.onkeyup = message_submit;
            }
            label.setAttribute("class", "text-pad");
            span.appendText("Write a message.");
            label.appendChild(span);
            label.appendChild(textArea);
            button.appendText("✉ Send Message");
            button.setAttribute("class", "confirm");
            button.setAttribute("type", "button");
            button.onclick = message_submit;
            paragraph.appendChild(button);
            paragraph.setAttribute("class", "footer-buttons");
            footer.setAttribute("class", "footer");
            footer.appendChild(label);
            footer.appendChild(paragraph);
            clear.setAttribute("class", "clear");
            footer.appendChild(clear);
            return footer;
        }
    },

    events: {

        /* Generate a message modal from a share button */
        shareButton: function browser_content_message_shareButton(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                source:HTMLElement = (element.lowName() === "button")
                    ? element
                    : element.parentNode,
                className:string = source.getAttribute("class"),
                box:modal = element.getAncestor("box", "class"),
                grandParent:HTMLElement = source.parentNode.parentNode,
                agentAttribute:string = box.dataset.agent,
                agentHash:string = (agentAttribute === "")
                    ? (className === "share-tool-message")
                        ? grandParent.dataset.hash
                        : browser.identity.hashDevice
                    : agentAttribute,
                agentType:agentType = (agentAttribute === "")
                    ? (className === "share-tool-message")
                        ? grandParent.getAttribute("class") as agentType
                        : source.getAttribute("class").replace("text-button-", "") as agentType
                    : box.dataset.agenttype as agentType,
                modals:HTMLElement[] = document.getModalsByModalType("message");
            let a:number = modals.length,
                messageModal:HTMLElement = null;
            if (a > 0) {
                do {
                    a = a - 1;
                    if (modals[a].dataset.agenttype === agentType && modals[a].dataset.agent === agentHash) {
                        modals[a].click();
                        return;
                    }
                } while (a > 0);
            }
            messageModal = modal_message(event, null);
            message.tools.populate(messageModal.getAttribute("id"));
        }
    },

    tools: {
    
        /* Populate stored messages into message modals */
        populate: function browser_content_message_populate(modalId:string):void {
            if (browser.message.length > 0) {
                const messageLength:number = browser.message.length;
                let messageIndex:number = 0;
                do {
                    if (browser.message[messageIndex].agentType === "device") {
                        if (browser.message[messageIndex].agentTo === browser.identity.hashDevice) {
                            message_post(browser.message[messageIndex], "agentFrom", modalId);
                        } else {
                            message_post(browser.message[messageIndex], "agentTo", modalId);
                        }
                    } else if (browser.message[messageIndex].agentType === "user") {
                        if (browser.message[messageIndex].agentTo === browser.identity.hashUser) {
                            message_post(browser.message[messageIndex], "agentFrom", modalId);
                        } else {
                            message_post(browser.message[messageIndex], "agentTo", modalId);
                        }
                    }
                    messageIndex = messageIndex + 1;
                } while (messageIndex < messageLength);
            }
        },
    
        /* Receives messages from the network */
        receive: function browser_content_message_receive(socketData:socketData):void {
            const messageData:service_message = socketData.data as service_message,
                agentFrom:string = messageData[0].agentFrom,
                agentType:agentType = messageData[0].agentType,
                target:messageTarget = ((agentType === "user" && agentFrom === browser.identity.hashUser) || (agentType === "device" && agentFrom === browser.identity.hashDevice))
                    ? "agentTo"
                    : "agentFrom";
            document.getElementById("message-update").appendText(messageData[0].message, true);
            messageData.forEach(function browser_socketMessage_messagePost_each(item:message_item):void {
                message_post(item, target, "");
            });
            if (browser.visible === false && Notification.permission === "granted") {
                const messageBody:string = messageData[0].message,
                    messageString:string = (messageBody.length > 100)
                        ? `${messageBody.slice(0, 100)}\u2026`
                        : messageBody,
                    notifyOptions:NotificationOptions = {
                        body: `Received new message from ${agentType} ${browser.agents[agentType][agentFrom].name}.\r\n\r\n${messageString}`,
                        vibrate: [200, 100]
                    },
                    notify:Notification = new Notification(`${browser.title} - New Message`, notifyOptions);
                notify.onshow = function browser_content_message_receive():void {
                    notify.close();
                };
            }
        }
    }
};

export default message;