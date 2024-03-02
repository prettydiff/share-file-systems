
/* lib/browser/utilities/message_submit - Event handler to submit text messages by key press. */

import browser from "./browser.js";
import message_post from "./message_post.js";
import util from "./util.js";

// cspell: words arrowdown, arrowup

const message_submit = function browser_utilities_messageSubmit(event:KeyboardEvent|MouseEvent):void {
    const input:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
        box:modal = input.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        keyboardEvent:KeyboardEvent = window.event as KeyboardEvent,
        isKey:boolean = (typeof keyboardEvent.key === "string"),
        key:string = (isKey === true)
            ? keyboardEvent.key.toLowerCase()
            : null;
    if (isKey === false || (key === "enter" && keyboardEvent.shiftKey === false && keyboardEvent.altKey === false && keyboardEvent.ctrlKey === false)) {
        const element:HTMLElement = event.target,
            agency:agentId = util.getAgent(element),
            box:modal = element.getAncestor("box", "class"),
            footer:HTMLElement = element.getAncestor("footer", "class"),
            textArea:HTMLTextAreaElement = footer.getElementsByTagName("textarea")[0],
            payload:message_item = {
                agentFrom: (agency[2] === "device")
                    ? browser.identity.hashDevice
                    : browser.identity.hashUser,
                agentTo: agency[0],
                agentType: agency[2],
                date: Date.now(),
                message: textArea.value,
                mode: textArea.getAttribute("class") as messageMode,
                userDevice: false
            };
        delete browser.ui.modals[box.getAttribute("id")].historyIndex;
        if (agency[2] === "user" && agency[0] === browser.identity.hashUser) {
            payload.agentTo = "user";
        } else if (agency[2] === "device" && agency[0] === browser.identity.hashDevice) {
            payload.agentTo = "device";
        } else if (agency[0] === "") {
            payload.agentTo = "";
        }
        message_post(payload, "agentTo", box.getAttribute("id"));
        browser.send([payload], "message");
        textArea.value = "";
    } else if (key === "arrowup" || key === "arrowdown") {
        const total:number = browser.message.length,
            agency:agentId = util.getAgent(input),
            agentFrom:string = (agency[2] === "device")
                ? browser.identity.hashDevice
                : browser.identity.hashUser;
        let step:number = (browser.ui.modals[id].historyIndex === undefined)
            ? total
            : browser.ui.modals[id].historyIndex;
        if (key === "arrowup") {
            if (step > 0) {
                do {
                    step = step - 1;
                } while (step > -1 && (browser.message[step].agentType !== agency[2] || browser.message[step].agentTo !== agency[0] || browser.message[step].agentFrom !== agentFrom));
                if (step > -1 && browser.message[step].agentType === agency[2] && browser.message[step].agentTo === agency[0] && browser.message[step].agentFrom === agentFrom) {
                    input.value = browser.message[step].message;
                    browser.ui.modals[id].historyIndex = step;
                }
            }
        } else {
            if (step < total) {
                do {
                    step = step + 1;
                } while (step < total && (browser.message[step].agentType !== agency[2] || browser.message[step].agentTo !== agency[0] || browser.message[step].agentFrom !== agentFrom));
                if (step === total) {
                    input.value = browser.ui.modals[id].text_value;
                    browser.ui.modals[id].historyIndex = total;
                } else if (browser.message[step].agentType === agency[2] && browser.message[step].agentTo === agency[0] && browser.message[step].agentFrom === agentFrom) {
                    input.value = browser.message[step].message;
                    browser.ui.modals[id].historyIndex = step;
                }
            }
        }
    } else {
        browser.ui.modals[id].text_value = input.value;
    }
};

export default message_submit;