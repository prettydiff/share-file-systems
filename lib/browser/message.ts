
/* lib/browser/message - A library for executing the text messaging application. */

import common from "../common/common.js";

import browser from "./browser.js";
import configuration from "./configuration.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

const message:module_message = {

    /* Called from modal.create to supply the footer area modal content */
    footer: function browser_message_footer(mode:messageMode, value:string):Element {
        const textArea:HTMLTextAreaElement = document.createElement("textarea"),
            label:Element = document.createElement("label"),
            span:Element = document.createElement("span"),
            button = document.createElement("button"),
            paragraph = document.createElement("p"),
            footer = document.createElement("div"),
            clear = document.createElement("span");
        textArea.onmouseup = modal.footerResize;
        textArea.onblur = modal.textSave;
        textArea.onkeyup = modal.textTimer;
        textArea.placeholder = "Write a message.";
        textArea.value = value;
        textArea.setAttribute("class", mode);
        if (mode === "code") {
            textArea.onkeyup = null;
        } else {
            textArea.onkeyup = message.keySubmit;
        }
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

    keySubmit: function browser_message_keySubmit(event:Event):void {
        const input:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
            box:Element = input.getAncestor("box", "class"),
            id:string = box.getAttribute("id"),
            keyboardEvent:KeyboardEvent = window.event as KeyboardEvent,
            key:string = keyboardEvent.key.toLowerCase();
        if (key === "enter" && keyboardEvent.shiftKey === false && keyboardEvent.altKey === false && keyboardEvent.ctrlKey === false) {
            message.submit(event);
            // cspell:disable
        } else if (key === "arrowup" || key === "arrowdown") {
            const total:number = browser.message.length,
                agency:agency = util.getAgent(input),
                agentFrom:string = (agency[2] === "device")
                    ? browser.data.hashDevice
                    : browser.data.hashUser;
            // using the modal's timer property to store scroll message history
            let step:number = (browser.data.modals[id].timer === undefined)
                ? total
                : browser.data.modals[id].timer;
            if (key === "arrowup") {
                // cspell:enable
                if (step > 0) {
                    do {
                        step = step - 1;
                    } while (step > -1 && (browser.message[step].agentType !== agency[2] || browser.message[step].agentTo !== agency[0] || browser.message[step].agentFrom !== agentFrom));
                    if (step > -1 && browser.message[step].agentType === agency[2] && browser.message[step].agentTo === agency[0] && browser.message[step].agentFrom === agentFrom) {
                        input.value = browser.message[step].message;
                        browser.data.modals[id].timer = step;
                    }
                }
            } else {
                if (step < total) {
                    do {
                        step = step + 1;
                    } while (step < total && (browser.message[step].agentType !== agency[2] || browser.message[step].agentTo !== agency[0] || browser.message[step].agentFrom !== agentFrom));
                    if (step === total) {
                        input.value = browser.data.modals[id].status_text;
                        browser.data.modals[id].timer = total;
                    } else if (browser.message[step].agentType === agency[2] && browser.message[step].agentTo === agency[0] && browser.message[step].agentFrom === agentFrom) {
                        input.value = browser.message[step].message;
                        browser.data.modals[id].timer = step;
                    }
                }
            }
        } else {
            browser.data.modals[id].status_text = input.value;
        }
    },

    /* Launch a media type modal */
    mediaModal: function browser_message_mediaModal(mediaConfig:mediaConfig):Element {
        return modal.create({
            agent: mediaConfig.agent,
            agentType: mediaConfig.agentType,
            content: message.mediaObject(mediaConfig.mediaType, 400, 565),
            inputs: ["close", "maximize"],
            read_only: true,
            scroll: false,
            status_text: mediaConfig.mediaType,
            title: `${common.capitalize(mediaConfig.mediaType)} call with ${mediaConfig.agentType} ${browser[mediaConfig.agentType][mediaConfig.agent].name}`,
            type: "media"
        });
    },

    /* Creates an audio or video element */
    mediaObject: function browser_message_mediaObject(mediaType:mediaType, height:number, width:number):HTMLVideoElement {
        let fail:Element = null;
        const media:HTMLVideoElement = document.createElement(mediaType) as HTMLVideoElement,
            userMedia:MediaStreamConstraints = (mediaType === "video")
                ? {
                    audio: true,
                    video: {
                        height: {
                            ideal: height,
                            max: 1080
                        },
                        width: {
                            ideal: width,
                            max: 1920
                        }
                    }
                }
                : {
                    audio: true,
                    video: false
                };

        if (navigator.mediaDevices.getUserMedia !== undefined) {
            navigator.mediaDevices.getUserMedia(userMedia)
                .then(function browser_message_mediaObject_stream(stream:MediaProvider):void {
                    media.srcObject = stream;
                })
                .catch(function browser_message_mediaObject_catch(error:Error):void {
                    fail = document.createElement("p");
                    fail.innerHTML = `Video stream error: ${error.toString()}`;
                });
        }
        if (fail !== null) {
            return fail as HTMLVideoElement;
        }

        media.play();
        return media;
    },

    /* Render a message modal */
    modal: function browser_message_modal(configuration:modal, agentType:agentType, agentFrom:string):Element {
        let modalElement:Element,
            footer:Element;
        const content:Element = document.createElement("div"),
            table:Element = document.createElement("table"),
            p:Element = document.createElement("p"),
            span:Element = document.createElement("span"),
            inputCode:HTMLInputElement = document.createElement("input"),
            inputText:HTMLInputElement = document.createElement("input"),
            labelCode:Element = document.createElement("label"),
            labelText:Element = document.createElement("label"),
            textCode:Text = document.createTextNode("Code Mode"),
            textText:Text = document.createTextNode("Text Mode"),
            name:string = `message-${Math.random()}-mode`;
        if (configuration === null) {
            const name:string = (agentType === "user" && agentFrom === browser.data.hashUser)
                    ? browser.data.nameUser
                    : browser[agentType][agentFrom].name,
                title:string = (agentFrom === browser.data.hashDevice)
                    ? `💬 Text message to all ${agentType}s`
                    : `💬 Text message to ${common.capitalize(agentType)} ${name}`;
            configuration = {
                agent: agentFrom,
                agentType: agentType,
                content: null,
                inputs: ["close", "maximize", "minimize"],
                read_only: false,
                status_text: "",
                text_placeholder: "text",
                text_value: "",
                title: title,
                type: "message",
                width: 800
            };
        }
        table.setAttribute("class", "message-content");
        table.appendChild(document.createElement("tbody"));
        content.appendChild(table);
        configuration.content = content;
        modalElement = modal.create(configuration);

        p.setAttribute("class", "message-toggle");
        if (configuration.text_placeholder === "text") {
            inputText.checked = true;
        } else {
            inputCode.checked = true;
        }
        inputText.name = name;
        inputText.onclick = message.modeToggle;
        inputText.type = "radio";
        inputText.value = "text";
        labelText.appendChild(inputText);
        labelText.appendChild(textText);
        p.appendChild(labelText);
        inputCode.name = name;
        inputCode.onclick = message.modeToggle;
        inputCode.type = "radio";
        inputCode.value = "code";
        labelCode.appendChild(inputCode);
        labelCode.appendChild(textCode);
        p.appendChild(labelCode);
        p.appendChild(span);
        footer = modalElement.getElementsByClassName("footer")[0];
        footer.insertBefore(p, footer.firstChild);
        return modalElement;
    },

    /* Toggle message textarea input between text input and code input preferences */
    modeToggle: function browser_message_modeToggle(event:Event):void {
        const element:HTMLInputElement = event.target as HTMLInputElement,
            box:Element = element.getAncestor("box", "class"),
            id:string = box.getAttribute("id"),
            textarea:HTMLTextAreaElement = box.getElementsByClassName("footer")[0].getElementsByTagName("textarea")[0],
            value:messageMode = element.value as messageMode;
        browser.data.modals[id].text_placeholder = value;
        browser.data.modals[id].status_text = textarea.value;
        configuration.radio(element);
        if (value === "code") {
            textarea.onkeyup = null;
        } else {
            textarea.onkeyup = message.keySubmit;
        }
        textarea.setAttribute("class", value);
        network.settings("configuration", null);
    },

    /* Populate stored messages into message modals */
    populate: function browser_message_populate(modalId:string):void {
        if (browser.message.length > 0) {
            const messageLength:number = browser.message.length;
            let messageIndex:number = 0;
            do {
                if (browser.message[messageIndex].agentType === "device") {
                    if (browser.message[messageIndex].agentTo === browser.data.hashDevice) {
                        message.post(browser.message[messageIndex], "agentFrom", modalId);
                    } else {
                        message.post(browser.message[messageIndex], "agentTo", modalId);
                    }
                } else if (browser.message[messageIndex].agentType === "user") {
                    if (browser.message[messageIndex].agentTo === browser.data.hashUser) {
                        message.post(browser.message[messageIndex], "agentFrom", modalId);
                    } else {
                        message.post(browser.message[messageIndex], "agentTo", modalId);
                    }
                }
                messageIndex = messageIndex + 1;
            } while (messageIndex < messageLength);
        }
    },

    /* Visually display a text message */
    post: function browser_message_post(item:messageItem, target:messageTarget, modalId:string):void {
        const tr:Element = document.createElement("tr"),
            meta:Element = document.createElement("th"),
            messageCell:HTMLElement = document.createElement("td"),
            // a simple test to determine if the message is coming from this agent (though not necessarily this device if sent to a user)
            self = function browser_message_post_self(hash:string):boolean {
                if (item.agentType === "device" && hash === browser.data.hashDevice) {
                    return true;
                }
                if (item.agentType === "user" && hash === browser.data.hashUser) {
                    return true;
                }
                return false;
            },
            // a regex handler to convert unicode character entity references
            unicode = function browser_message_post_unicode(reference:string):string {
                const output:string[] = [];
                reference.split("\\u").forEach(function browser_message_post_unicode(value:string) {
                    output.push(String.fromCharCode(Number(`0x${value}`)));
                });
                return output.join("");
            },
            // a regex handler to convert html code point character entity references
            decimal = function browser_message_post_decimal(reference:string):string {
                return String.fromCodePoint(Number(reference.replace("&#", "").replace(";", "")));
            },
            // a regex handler to convert html decimal character entity references
            html = function browser_message_post_html(reference:string):string {
                return String.fromCodePoint(Number(reference.replace("&#x", "0x").replace(";", "")));
            },
            // adds the constructed message to a message modal
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
                // flag whether to create a new message modal
                writeTest = true;
            },
            date:Date = new Date(item.date),
            modals:Element[] = document.getModalsByModalType("message");
        let index:number = modals.length,
            writeTest:boolean = (browser.loadFlag === true || modalId !== ""),
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
        messageCell.innerHTML = messageText;
        messageCell.setAttribute("class", item.mode);
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
                if (
                    (modalId === "" || modals[index].getAttribute("id") === modalId) &&
                    (
                        item[target] === "all" ||
                        (modals[index].getAttribute("data-agentType") === "user" && (item[target] === "user" || (item.agentType === "user" && item[target] === modalAgent))) ||
                        (modals[index].getAttribute("data-agentType") === "device" && (item[target] === "device" || (item.agentType === "device" && item[target] === modalAgent)))
                    )
                ) {
                    writeMessage(modals[index]);
                }
            } while (index > 0);
        }

        // creates a new message modal if none matched
        if (writeTest === false) {
            const messageModal:Element = message.modal(null, item.agentType, item.agentFrom);
            writeMessage(messageModal);
        }
    },

    /* Generate a message modal from a share button */
    shareButton: function browser_message_shareButton(event:Event):void {
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
            modals:HTMLElement[] = <HTMLElement[]>document.getModalsByModalType("message");
        let a:number = modals.length,
            messageModal:Element;
        if (a > 0) {
            do {
                a = a - 1;
                if (modals[a].getAttribute("data-agentType") === agentType && modals[a].getAttribute("data-agent") === agentHash) {
                    modals[a].click();
                    return;
                }
            } while (a > 0);
        }
        messageModal = message.modal(null, agentType, agentHash);
        message.populate(messageModal.getAttribute("id"));
    },

    /* Submit event handler to take message text into a data object */
    submit: function browser_message_submit(event:Event):void {
        const element:Element = event.target as Element,
            agency:agency = util.getAgent(element),
            box:Element = element.getAncestor("box", "class"),
            footer:Element = element.getAncestor("footer", "class"),
            textArea:HTMLTextAreaElement = footer.getElementsByTagName("textarea")[0],
            payload:messageItem = {
                agentFrom: (agency[2] === "device")
                    ? browser.data.hashDevice
                    : browser.data.hashUser,
                agentTo: agency[0],
                agentType: agency[2],
                date: Date.now(),
                message: textArea.value,
                mode: textArea.getAttribute("class") as messageMode
            };
        // using timer property to store value scroll history, which doesn't need to be saved but does need to be voided on submission
        delete browser.data.modals[box.getAttribute("id")].timer;
        if (agency[2] === "user" && agency[0] === browser.data.hashUser) {
            payload.agentTo = "user";
        } else if (agency[2] === "device" && agency[0] === browser.data.hashDevice) {
            payload.agentTo = "device";
        } else if (agency[0] === "") {
            payload.agentTo = "";
        }
        message.post(payload, "agentTo", box.getAttribute("id"));
        network.message(payload);
        textArea.value = "";
    },

    /* Launch a media modal from the Video Call button of share modal*/
    videoButton: function browser_message_videoButton(event:Event):void {
        const element:Element = event.target as Element,
            agentContainer:Element = element.getAncestor("tools", "class").parentNode as Element,
            agent:string = agentContainer.getAttribute("data-hash"),
            agentType:agentType = agentContainer.getAttribute("class") as agentType;
        message.mediaModal({
            agent: agent,
            agentType: agentType,
            mediaType: "video"
        });
    }
};

export default message;