
/* lib/browser/utilities/configuration_styleText - Modifies a dynamically populated stylesheet with user specified colors. */

import browser from "./browser.js";

const configuration_styleText = function browser_content_configuration_styleText(input:configuration_styleText):void {
    const template:string[] = [
            `#spaces .box[data-agent="${input.agent}"] .body,`,
            `#spaces #${input.agentType} button[data-agent="${input.agent}"]:hover{background-color:#`,
            browser.ui.colors[input.agentType][input.agent][0],
            "}",
            `#spaces #${input.agentType} button[data-agent="${input.agent}"],`,
            `#spaces .box[data-agent="${input.agent}"] .status-bar,`,
            `#spaces .box[data-agent="${input.agent}"] .footer,`,
            `#spaces .box[data-agent="${input.agent}"] h2.heading{background-color:#`,
            browser.ui.colors[input.agentType][input.agent][1],
            "}"
        ],
        oldStyle:string = browser.style.innerHTML;
    browser.style.empty();
    if (input.replace === true) {
        if (input.colors[0] === "" && input.colors[1] === "") {
            // removes an agent's colors
            browser.style.appendText(oldStyle.replace(template.join(""), ""));
        } else {
            const old:string = template.join("");
            if (input.colors[0] !== "") {
                template[2] = input.colors[0];
            }
            if (input.colors[1] !== "") {
                template[8] = input.colors[1];
            }
            // updates an agent's colors
            browser.style.appendText(oldStyle.replace(old, template.join("")));
        }
    } else {
        if (input.colors[0] !== "") {
            template[2] = input.colors[0];
        }
        if (input.colors[1] !== "") {
            template[8] = input.colors[1];
        }
        // adds an agent's colors
        browser.style.appendText(oldStyle + template.join(""));
    }
};

export default configuration_styleText;