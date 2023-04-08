
/* lib/browser/content/message - A library for executing the text messaging application. */

import browser from "../utilities/browser.js";
import common from "../../common/common.js";
import configuration from "./configuration.js";
import modal from "../utilities/modal.js";
import modal_configuration from "../utilities/modal_configurations.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

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
        modal: function browser_content_message_content(text:string, placeholder:string):[HTMLElement, HTMLElement] {
            const content:HTMLElement = document.createElement("div"),
                footer:HTMLElement = document.createElement("div"),
                table:HTMLElement = document.createElement("table"),
                button:HTMLElement = document.createElement("button"),
                pButton:HTMLElement = document.createElement("p"),
                pToggle:HTMLElement = document.createElement("p"),
                spanClear:HTMLElement = document.createElement("span"),
                spanToggle:HTMLElement = document.createElement("span"),
                spanTextArea:HTMLElement = document.createElement("span"),
                textArea:HTMLTextAreaElement = document.createElement("textarea"),
                label:HTMLElement = document.createElement("label"),
                inputControl = function browser_content_message_content_input(type:"code"|"text"):void {
                    const input:HTMLInputElement = document.createElement("input"),
                        label:HTMLElement = document.createElement("label");
                    if (placeholder === type) {
                        input.checked = true;
                    }
                    input.name = name;
                    input.onclick = message.events.modeToggle;
                    input.type = "radio";
                    input.value = type;
                    label.appendChild(input);
                    label.appendText(`${common.capitalize(type)} Mode`);
                    pToggle.appendChild(label);
                },
                name:string = `message-${Math.random()}-mode`;
            table.setAttribute("class", "message-content");
            table.appendChild(document.createElement("tbody"));
            content.appendChild(table);

            inputControl("text");
            inputControl("code");
            pToggle.setAttribute("class", "message-toggle");
            pToggle.appendChild(spanToggle);
            footer.appendChild(pToggle);

            textArea.onmouseup = modal.events.footerResize;
            textArea.onblur = modal.events.textSave;
            textArea.onkeyup = modal.events.textTimer;
            textArea.placeholder = "Write a message.";
            textArea.value = text;
            textArea.setAttribute("class", placeholder);
            if (placeholder === "code") {
                textArea.onkeyup = null;
            } else {
                textArea.onkeyup = message.events.keySubmit;
            }
            label.setAttribute("class", "text-pad");
            spanTextArea.appendText("Write a message.");
            label.appendChild(spanTextArea);
            label.appendChild(textArea);
            button.appendText("✉ Send Message");
            button.setAttribute("class", "confirm");
            button.setAttribute("type", "button");
            button.onclick = message.events.submit;
            pButton.appendChild(button);
            pButton.setAttribute("class", "footer-buttons");
            footer.setAttribute("class", "footer");
            footer.appendChild(label);
            footer.appendChild(pButton);
            spanClear.setAttribute("class", "clear");
            footer.appendChild(spanClear);

            return [content, footer];
        },

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
                textArea.onkeyup = message.events.keySubmit;
            }
            label.setAttribute("class", "text-pad");
            span.appendText("Write a message.");
            label.appendChild(span);
            label.appendChild(textArea);
            button.appendText("✉ Send Message");
            button.setAttribute("class", "confirm");
            button.setAttribute("type", "button");
            button.onclick = message.events.submit;
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

        /* Submits a text message on key press, such as pressing the 'Enter' key. */
        keySubmit: function browser_content_message_keySubmit(event:KeyboardEvent):void {
            const input:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
                box:modal = input.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                keyboardEvent:KeyboardEvent = window.event as KeyboardEvent,
                key:string = keyboardEvent.key.toLowerCase();
            if (key === "enter" && keyboardEvent.shiftKey === false && keyboardEvent.altKey === false && keyboardEvent.ctrlKey === false) {
                message.events.submit(event);
            } else if (key === "arrowup" || key === "arrowdown") {
                const total:number = browser.message.length,
                    agency:agency = util.getAgent(input),
                    agentFrom:string = (agency[2] === "device")
                        ? browser.data.hashDevice
                        : browser.data.hashUser;
                let step:number = (browser.data.modals[id].historyIndex === undefined)
                    ? total
                    : browser.data.modals[id].historyIndex;
                if (key === "arrowup") {
                    if (step > 0) {
                        do {
                            step = step - 1;
                        } while (step > -1 && (browser.message[step].agentType !== agency[2] || browser.message[step].agentTo !== agency[0] || browser.message[step].agentFrom !== agentFrom));
                        if (step > -1 && browser.message[step].agentType === agency[2] && browser.message[step].agentTo === agency[0] && browser.message[step].agentFrom === agentFrom) {
                            input.value = browser.message[step].message;
                            browser.data.modals[id].historyIndex = step;
                        }
                    }
                } else {
                    if (step < total) {
                        do {
                            step = step + 1;
                        } while (step < total && (browser.message[step].agentType !== agency[2] || browser.message[step].agentTo !== agency[0] || browser.message[step].agentFrom !== agentFrom));
                        if (step === total) {
                            input.value = browser.data.modals[id].text_value;
                            browser.data.modals[id].historyIndex = total;
                        } else if (browser.message[step].agentType === agency[2] && browser.message[step].agentTo === agency[0] && browser.message[step].agentFrom === agentFrom) {
                            input.value = browser.message[step].message;
                            browser.data.modals[id].historyIndex = step;
                        }
                    }
                }
            } else {
                browser.data.modals[id].text_value = input.value;
            }
        },

        /* Toggle message textarea input between text input and code input preferences */
        modeToggle: function browser_content_message_modeToggle(event:Event):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                box:modal = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                textarea:HTMLTextAreaElement = box.getElementsByClassName("footer")[0].getElementsByTagName("textarea")[0],
                value:messageMode = element.value as messageMode;
            browser.data.modals[id].text_placeholder = value;
            browser.data.modals[id].text_value = textarea.value;
            configuration.tools.radio(element);
            if (value === "code") {
                textarea.onkeyup = null;
            } else {
                textarea.onkeyup = message.events.keySubmit;
            }
            textarea.setAttribute("class", value);
            network.configuration();
        },

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
                        : browser.data.hashDevice
                    : agentAttribute,
                agentType:agentType = (agentAttribute === "")
                    ? (className === "share-tool-message")
                        ? grandParent.getAttribute("class") as agentType
                        : source.getAttribute("class").replace("text-button-", "") as agentType
                    : box.dataset.agenttype as agentType,
                modals:HTMLElement[] = document.getModalsByModalType("message");
            let a:number = modals.length,
                messageModal:HTMLElement;
            if (a > 0) {
                do {
                    a = a - 1;
                    if (modals[a].dataset.agenttype === agentType && modals[a].dataset.agent === agentHash) {
                        modals[a].click();
                        return;
                    }
                } while (a > 0);
            }
            messageModal = modal_configuration.modals.message(event, null);
            message.tools.populate(messageModal.getAttribute("id"));
        },

        /* Submit event handler to take message text into a data object for transmission across a network. */
        submit: function browser_content_message_submit(event:KeyboardEvent|MouseEvent):void {
            const element:HTMLElement = event.target,
                agency:agency = util.getAgent(element),
                box:modal = element.getAncestor("box", "class"),
                footer:HTMLElement = element.getAncestor("footer", "class"),
                textArea:HTMLTextAreaElement = footer.getElementsByTagName("textarea")[0],
                payload:message_item = {
                    agentFrom: (agency[2] === "device")
                        ? browser.data.hashDevice
                        : browser.data.hashUser,
                    agentTo: agency[0],
                    agentType: agency[2],
                    date: Date.now(),
                    message: textArea.value,
                    mode: textArea.getAttribute("class") as messageMode
                };
            delete browser.data.modals[box.getAttribute("id")].historyIndex;
            if (agency[2] === "user" && agency[0] === browser.data.hashUser) {
                payload.agentTo = "user";
            } else if (agency[2] === "device" && agency[0] === browser.data.hashDevice) {
                payload.agentTo = "device";
            } else if (agency[0] === "") {
                payload.agentTo = "";
            }
            message.tools.post(payload, "agentTo", box.getAttribute("id"));
            network.send([payload], "message");
            textArea.value = "";
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
                        if (browser.message[messageIndex].agentTo === browser.data.hashDevice) {
                            message.tools.post(browser.message[messageIndex], "agentFrom", modalId);
                        } else {
                            message.tools.post(browser.message[messageIndex], "agentTo", modalId);
                        }
                    } else if (browser.message[messageIndex].agentType === "user") {
                        if (browser.message[messageIndex].agentTo === browser.data.hashUser) {
                            message.tools.post(browser.message[messageIndex], "agentFrom", modalId);
                        } else {
                            message.tools.post(browser.message[messageIndex], "agentTo", modalId);
                        }
                    }
                    messageIndex = messageIndex + 1;
                } while (messageIndex < messageLength);
            }
        },
    
        /* Visually display a text message */
        post: function browser_content_message_post(item:message_item, target:messageTarget, modalId:string):void {
            const tr:HTMLElement = document.createElement("tr"),
                meta:HTMLElement = document.createElement("th"),
                messageCell:HTMLElement = document.createElement("td"),
                // a simple test to determine if the message is coming from this agent (though not necessarily this device if sent to a user)
                self = function browser_content_message_post_self(hash:string):boolean {
                    if (item.agentType === "device" && hash === browser.data.hashDevice) {
                        return true;
                    }
                    if (item.agentType === "user" && hash === browser.data.hashUser) {
                        return true;
                    }
                    return false;
                },
                // a regex handler to convert unicode character entity references
                unicode = function browser_content_message_post_unicode(reference:string):string {
                    const output:string[] = [];
                    reference.split("\\u").forEach(function browser_content_message_post_unicode(value:string) {
                        output.push(String.fromCharCode(Number(`0x${value}`)));
                    });
                    return output.join("");
                },
                // a regex handler to convert html code point character entity references
                decimal = function browser_content_message_post_decimal(reference:string):string {
                    return String.fromCodePoint(Number(reference.replace("&#", "").replace(";", "")));
                },
                // a regex handler to convert html decimal character entity references
                html = function browser_content_message_post_html(reference:string):string {
                    return String.fromCodePoint(Number(reference.replace("&#x", "0x").replace(";", "")));
                },
                // adds the constructed message to a message modal
                writeMessage = function browser_content_message_post_writeMessage(box:modal):void {
                    const tbody:HTMLElement = box.getElementsByClassName("message-content")[0].getElementsByTagName("tbody")[0],
                        posts:HTMLCollectionOf<HTMLTableRowElement> = tbody.getElementsByTagName("tr"),
                        postsLength:number = posts.length;
                    if (postsLength > 0) {
                        if (posts[0].dataset.agentFrom === item.agentFrom) {
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
                    // flag whether to create a new message modal
                    writeTest = true;
                },
                date:Date = new Date(item.date),
                modals:HTMLElement[] = document.getModalsByModalType("message") as HTMLElement[];
            let index:number = modals.length,
                writeTest:boolean = (browser.loading === true || modalId !== ""),
                modalAgent:string,
                messageText:string = (item.mode === "code")
                    ? `<p>${item.message}</p>`
                    : `<p>${item.message
                        .replace(/^\s+/, "")
                        .replace(/\s+$/, "")
                        .replace(/(?<!\\)(\\u[0-9a-f]{4})+/g, unicode)
                        .replace(/&#\d+;/g, decimal)
                        .replace(/&#x[0-9a-f]+;/, html)
                        .replace(/(\r?\n)+/g, "</p><p>")}</p>`;
            if (item.mode === "text") {
                const strings:string[] = messageText.split("http"),
                    stringsLength:number = strings.length;
                if (stringsLength > 1) {
                    let a:number = 1,
                        b:number = 0,
                        segment:number = 0;
                    do {
                        if ((/^s?:\/\//).test(strings[a]) === true) {
                            b = 0;
                            segment = strings[a].length;
                            do {
                                if ((/\s|</).test(strings[a].charAt(b)) === true) {
                                    break;
                                }
                                b = b + 1;
                            } while (b < segment);
                            if (b === segment) {
                                strings[a] = `<a target="_blank" href="http${strings[a]}">http${strings[a]}</a>`;
                            } else {
                                strings[a] = `<a target="_blank" href="http${strings[a].slice(0, b)}">http${strings[a].slice(0, b)}</a>${strings[a].slice(b)}`;
                            }
                        }
                        a = a + 1;
                    } while (a < stringsLength);
                    messageText = strings.join("");
                }
            }
            // eslint-disable-next-line
            messageCell.innerHTML = messageText;
            messageCell.setAttribute("class", item.mode);
            tr.setAttribute("data-agentFrom", item.agentFrom);
            if (item.agentType === "user" && item.agentFrom === browser.data.hashUser) {
                const strong:HTMLElement = document.createElement("strong"),
                    em:HTMLElement = document.createElement("em");
                strong.appendText(browser.data.nameUser);
                em.appendText(common.dateFormat(date));
                meta.appendChild(strong);
                meta.appendText(" ");
                meta.appendChild(em);
            } else if (item.agentType === "device" && item.agentFrom === browser.data.hashDevice) {
                const strong:HTMLElement = document.createElement("strong"),
                    em:HTMLElement = document.createElement("em");
                strong.appendText(browser.data.nameDevice);
                em.appendText(common.dateFormat(date));
                meta.appendChild(strong);
                meta.appendText(" ");
                meta.appendChild(em);
            } else {
                const strong:HTMLElement = document.createElement("strong"),
                    em:HTMLElement = document.createElement("em"),
                    span:HTMLElement = document.createElement("span");
                span.appendText(common.capitalize(item.agentType));
                strong.appendText(browser[item.agentType][item.agentFrom].name);
                em.appendText(common.dateFormat(date));
                meta.appendChild(span);
                meta.appendText(" ");
                meta.appendChild(strong);
                meta.appendText(" ");
                meta.appendChild(em);
            }
            tr.appendChild(meta);
            tr.appendChild(messageCell);
            
            // loop through modals
            if (index > 0) {
                do {
                    index = index - 1;
                    modalAgent = modals[index].dataset.agent;
                    if (
                        (modalId === "" || modals[index].getAttribute("id") === modalId) &&
                        (
                            item[target] === "all" ||
                            (modals[index].dataset.agenttype === "user" && (item[target] === "user" || (item.agentType === "user" && item[target] === modalAgent))) ||
                            (modals[index].dataset.agenttype === "device" && (item[target] === "device" || (item.agentType === "device" && item[target] === modalAgent)))
                        )
                    ) {
                        writeMessage(modals[index]);
                    }
                } while (index > 0);
            }
    
            // creates a new message modal if none matched
            if (writeTest === false) {
                const identity:boolean = (item.agentFrom !== browser.data.hashDevice),
                    modalItem:modal = modal_configuration.modals.message(null, {
                        agent: item.agentFrom,
                        agentIdentity: identity,
                        agentType: item.agentType,
                        content: null,
                        footer: null,
                        inputs: ["close", "maximize", "minimize"],
                        read_only: false,
                        text_placeholder: "text",
                        text_value: "",
                        title_supplement: (identity === true)
                            ? null
                            : `all ${item.agentType}s`,
                        type: "message",
                        width: 800
                    });
                writeMessage(modalItem);
            }
        },
    
        /* Receives messages from the network */
        receive: function browser_content_message_receive(socketData:socketData):void {
            const messageData:service_message = socketData.data as service_message,
                agentFrom:string = messageData[0].agentFrom,
                agentType:agentType = messageData[0].agentType,
                target:messageTarget = ((agentType === "user" && agentFrom === browser.data.hashUser) || (agentType === "device" && agentFrom === browser.data.hashDevice))
                    ? "agentTo"
                    : "agentFrom";
            document.getElementById("message-update").appendText(messageData[0].message, true);
            messageData.forEach(function browser_socketMessage_messagePost_each(item:message_item):void {
                message.tools.post(item, target, "");
            });
            if (browser.visible === false && Notification.permission === "granted") {
                const messageBody:string = messageData[0].message,
                    messageString:string = (messageBody.length > 100)
                        ? `${messageBody.slice(0, 100)}\u2026`
                        : messageBody,
                    notifyOptions:NotificationOptions = {
                        body: `Received new message from ${agentType} ${browser[agentType][agentFrom].name}.\r\n\r\n${messageString}`,
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