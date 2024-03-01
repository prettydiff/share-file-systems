
/* lib/browser/utilities/addAgent - Populates agents into the browser UI. */

import browser from "./browser.js";
import common from "../../common/common.js";
import configuration from "../content/configuration";
import modal_configuration from "./modal_configurations";
import share_update from "./share_update.js";

// cspell: words agentType

const addAgent = function browser_content_agentManagement_addAgent(input:agentManagement_addAgent):void {
    const li:HTMLLIElement = document.createElement("li"),
        button:HTMLElement = document.createElement("button"),
        addStyle = function browser_content_agentManagement_addUser_addStyle():void {
            let body:string,
                heading:string;
            if (browser.ui.colors[input.type][input.hash] === undefined) {
                body = browser.colorDefaults[browser.ui.color][0];
                heading = browser.colorDefaults[browser.ui.color][1];
                browser.ui.colors[input.type][input.hash] = [body, heading];
                if (input.callback !== undefined) {
                    input.callback();
                }
            } else {
                body = browser.ui.colors[input.type][input.hash][0];
                heading = browser.ui.colors[input.type][input.hash][1];
            }
            if (browser.loading === false) {
                configuration.tools.styleText({
                    agent: input.hash,
                    agentType: input.type,
                    colors: [body, heading],
                    replace: false
                });
            }
        },
        status = function browser_content_agentManagement_addUser_status(status:activityStatus):HTMLElement {
            const em:HTMLElement = document.createElement("em"),
                span:HTMLElement = document.createElement("span");
            em.setAttribute("class", `status-${status}`);
            em.appendText("●");
            span.appendText(` ${common.capitalize(status)}`);
            em.appendChild(span);
            return em;
        };
    button.appendChild(status("active"));
    button.appendChild(status("idle"));
    button.appendChild(status("offline"));
    button.appendText(` ${input.name}`);
    if (input.hash === browser.identity.hashDevice) {
        button.setAttribute("class", "active");
    } else {
        button.setAttribute("class", browser.agents[input.type][input.hash].status);
    }
    button.setAttribute("id", input.hash);
    button.setAttribute("data-agenttype", input.type);
    button.setAttribute("type", "button");
    button.onclick = modal_configuration.modals.shares;
    li.appendChild(button);
    document.getElementById(input.type).getElementsByTagName("ul")[0].appendChild(li);
    addStyle();
    configuration.tools.addUserColor(input.hash, input.type);
    if (browser.loading === false) {
        share_update("");
    }
};

export default addAgent;