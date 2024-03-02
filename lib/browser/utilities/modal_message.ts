
/* lib/browser/utilities/modal_message - Modal configuration for message modals. */

import browser from "./browser.js";
import common from "../../common/common.js";
import configuration_radio from "./configuration_radio.js";
import message_submit from "./message_submit.js";
import modal from "./modal.js";

const modal_message = function browser_utilities_modalMessage(event:Event, config?:config_modal):modal {
    const text:string = (config === null)
            ? ""
            : config.text_value,
        placeholder:string = (config === null)
            ? "text"
            : config.text_placeholder,
        content:HTMLElement = document.createElement("div"),
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
                label:HTMLElement = document.createElement("label"),
                modeToggle = function browser_utilities_modeToggle_modeToggle(event:Event):void {
                    const element:HTMLInputElement = event.target as HTMLInputElement,
                        box:modal = element.getAncestor("box", "class"),
                        id:string = box.getAttribute("id"),
                        textarea:HTMLTextAreaElement = box.getElementsByClassName("footer")[0].getElementsByTagName("textarea")[0],
                        value:messageMode = element.value as messageMode;
                    browser.ui.modals[id].text_placeholder = value;
                    browser.ui.modals[id].text_value = textarea.value;
                    configuration_radio(element);
                    if (value === "code") {
                        textarea.onkeyup = null;
                    } else {
                        textarea.onkeyup = message_submit;
                    }
                    textarea.setAttribute("class", value);
                    browser.configuration();
                };
            if (placeholder === type) {
                input.checked = true;
            }
            input.name = name;
            input.onclick = modeToggle;
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
        textArea.onkeyup = message_submit;
    }
    label.setAttribute("class", "text-pad");
    spanTextArea.appendText("Write a message.");
    label.appendChild(spanTextArea);
    label.appendChild(textArea);
    button.appendText("✉ Send Message");
    button.setAttribute("class", "confirm");
    button.setAttribute("type", "button");
    button.onclick = message_submit;
    pButton.appendChild(button);
    pButton.setAttribute("class", "footer-buttons");
    footer.setAttribute("class", "footer");
    footer.appendChild(label);
    footer.appendChild(pButton);
    spanClear.setAttribute("class", "clear");
    footer.appendChild(spanClear);
    if (config === null) {
        const element:HTMLElement = event.target as HTMLElement,
            div:HTMLElement = element.getAncestor("div", "tag"),
            agent:string = div.dataset.hash,
            agentType:agentType = div.getAttribute("class") as agentType,
            identity:boolean = (agent === browser.identity.hashDevice || agent === "");
        if (identity === true && browser.agents[agentType][agent] === undefined) {
            return null;
        }
        config = {
            agent: agent,
            agentIdentity: identity,
            agentType: agentType,
            content: null,
            footer: null,
            inputs: ["close", "maximize", "minimize"],
            read_only: false,
            text_placeholder: "text",
            text_value: "",
            title_supplement: (identity === true)
                ? `all ${agentType}s`
                : `${common.capitalize(agentType)} ${browser.agents[agentType][agent].name}`,
            type: "message",
            width: 800
        };
    }
    config.content = content;
    config.footer = footer;
    return modal.content(config);
};

export default modal_message;