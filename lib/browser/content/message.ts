
/* lib/browser/content/message - A library for executing the text messaging application. */

import browser from "../utilities/browser.js";
import message_post from "../utilities/message_post.js";
import modal_message from "../modal_config/modal_message.js";

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
            message.tools.populate(messageModal);
        }
    },

    tools: {
    
        /* Populate stored messages into message modals */
        populate: function browser_content_message_populate(modal:modal):void {
            if (browser.message.length > 0) {
                const modalMatch = function browser_content_message_populate_modalMatch(direction:"agentFrom"|"agentTo"):void {
                        if (modal === null) {
                            const modals:modal[] = document.getModalsByModalType("message");
                            let len:number = modals.length,
                                modalTest:boolean = false,
                                id:string = "";
                            do {
                                len = len - 1;
                                id = modals[len].getAttribute("id");
                                if (browser.message[messageIndex].agentType === browser.ui.modals[id].agentType && browser.message[messageIndex][direction] === browser.ui.modals[id].agent) {
                                    message_post(browser.message[messageIndex], direction, modals[len]);
                                    modalTest = true;
                                }
                            } while (len > 0);
                            if (modalTest === false) {
                                const identity:boolean = (browser.message[messageIndex].agentFrom !== browser.identity.hashDevice),
                                    modalNew:modal = modal_message(null, {
                                        agent: browser.message[messageIndex][direction],
                                        agentIdentity: identity,
                                        agentType: browser.message[messageIndex].agentType,
                                        content: null,
                                        footer: null,
                                        inputs: ["close", "maximize", "minimize"],
                                        read_only: false,
                                        text_placeholder: "text",
                                        text_value: "",
                                        title_supplement: (identity === true)
                                            ? null
                                            : `all ${browser.message[messageIndex].agentType}s`,
                                        type: "message",
                                        width: 800
                                    });
                                message_post(browser.message[messageIndex], direction, modalNew);
                            }
                        } else {
                            message_post(browser.message[messageIndex], direction, modal);
                        }
                    },
                    messageLength:number = browser.message.length;
                let messageIndex:number = 0;
                do {
                    if (browser.message[messageIndex].agentType === "device") {
                        if (browser.message[messageIndex].agentTo === browser.identity.hashDevice) {
                            modalMatch("agentFrom");
                        } else {
                            modalMatch("agentTo");
                        }
                    } else if (browser.message[messageIndex].agentType === "user") {
                        if (browser.message[messageIndex].agentTo === browser.identity.hashUser) {
                            modalMatch("agentFrom");
                        } else {
                            modalMatch("agentTo");
                        }
                    }
                    messageIndex = messageIndex + 1;
                } while (messageIndex < messageLength);
            }
        }
    }
};

export default message;