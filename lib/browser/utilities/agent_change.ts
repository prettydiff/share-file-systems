
/* lib/browser/utilities/agent_change - Modifies agent related data in share modals. */

import browser from "./browser.js";
import common from "../../common/common.js";

const agent_change = {
    delete: function browser_utilities_agentChange_delete():HTMLElement {
        const content:HTMLElement = document.createElement("div"),
            h3:HTMLElement = document.createElement("h3"),
            deleteToggle = function browser_utilities_agentChange_delete_deleteToggle(event:MouseEvent):void {
                const element:HTMLInputElement = event.target as HTMLInputElement,
                    label:HTMLElement = element.parentNode;
                if (element.checked === true) {
                    label.setAttribute("class", "checked");
                } else {
                    label.removeAttribute("class");
                }
            };
        let li:HTMLElement,
            input:HTMLInputElement,
            label:HTMLElement,
            p:HTMLElement,
            strong:HTMLElement,
            h4:HTMLElement,
            names:string[],
            length:number,
            total:number = 0,
            ul:HTMLElement = document.createElement("ul");
        content.setAttribute("class", "delete-agents");
        common.agents({
            countBy: "agent",
            perAgent: function browser_utilities_agentChange_delete_perAgent(agentNames:agentNames):void {
                if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== browser.identity.hashDevice)) {
                    li = document.createElement("li");
                    li.setAttribute("class", "summary");
                    label = document.createElement("label");
                    input = document.createElement("input");
                    input.type = "checkbox";
                    input.value = agentNames.agent;
                    input.setAttribute("data-type", agentNames.agentType);
                    input.onclick = deleteToggle;
                    label.appendChild(input);
                    label.appendText(browser.agents[agentNames.agentType][agentNames.agent].name);
                    li.appendChild(label);
                    ul.appendChild(li);
                }
            },
            perAgentType: function browser_utilities_agentChange_delete_perAgentType(agentNames:agentNames):void {
                h4 = document.createElement("h4");
                h4.appendText(`${common.capitalize(agentNames.agentType)}s`);
                names = Object.keys(browser.agents[agentNames.agentType]);
                length = names.length;
                content.appendChild(h4);
                total = total + length;
                if ((agentNames.agentType === "device" && length < 2) || (agentNames.agentType !== "device" && length < 1)) {
                    p = document.createElement("p");
                    p.setAttribute("class", "summary");
                    p.appendText(`No ${agentNames.agentType}s to delete.`);
                    content.appendChild(p);
                } else {
                    ul = document.createElement("ul");
                    content.appendChild(ul);
                }
            },
            source: browser
        });
        if (total > 1) {
            p = document.createElement("p");
            strong = document.createElement("strong");
            strong.appendText("Please be warned that confirming these change is permanent.");
            p.appendChild(strong);
            p.appendText(" Confirming any selected changes will remove the relationship both locally and on the remote devices/users.");
            content.insertBefore(p, content.firstChild);
            h3.appendText("Delete Agents");
            content.insertBefore(h3, content.firstChild);
        }
        return content;
    },
    modify: function browser_utilities_agentChange_modify():HTMLElement {
        const div:HTMLElement = document.createElement("div"),
            h3:HTMLElement = document.createElement("h3"),
            // ipSection = function browser_utilities_agentChange_modify_ipSection():HTMLElement {
            //     const container:HTMLElement = document.createElement("div"),
            //         heading:HTMLElement = document.createElement("h4"),
            //         warning:HTMLElement = document.createElement("p"),
            //         strong:HTMLElement = document.createElement("strong"),
            //         list:HTMLElement = document.createElement("ul");

            //     heading.appendText("Display IP Address Information");
            //     util.radioListItem({
            //         defaultValue: "No",
            //         handler: agent_management.events.displayIP,
            //         list: ["No", "Yes"],
            //         name: `agent-ip-display-${Math.random()}`,
            //         parent: list
            //     });
            //     strong.appendText("Manually modifying IP address data may result in an unrecoverable disconnection.");
            //     warning.appendChild(strong);
            //     container.appendChild(heading);
            //     container.appendChild(warning);
            //     container.appendChild(list);
            //     container.setAttribute("class", "section");
            //     return container;
            // },
            section = function browser_utilities_agentChange_modify_section(agentType:agentType):void {
                const container:HTMLElement = document.createElement("div"),
                    heading:HTMLElement = document.createElement("h4"),
                    keys:string[] = Object.keys(browser.agents[agentType]),
                    len:number = keys.length,
                    list:HTMLElement = (len < 1)
                        ? document.createElement("p")
                        : document.createElement("ul"),
                    item = function browser_utilities_agentChange_modify_section_item(key:string):HTMLElement {
                        let p:HTMLElement = document.createElement("p");
                        const label:HTMLElement = document.createElement("label"),
                            input:HTMLInputElement = document.createElement("input"),
                            li:HTMLElement = document.createElement("li");

                        // agent hash
                        p.appendText(key);
                        p.setAttribute("class", "modify-agent-hash");
                        li.append(p);

                        // agent name
                        p = document.createElement("p");
                        input.type = "text";
                        input.value = browser.agents[agentType][key].name;
                        input.setAttribute("data-agent", key);
                        input.setAttribute("data-type", agentType);
                        label.appendText("Name");
                        label.appendChild(input);
                        p.appendChild(label);
                        li.appendChild(p);

                        // agent IPv6
                        // p = document.createElement("p");
                        // label = document.createElement("label");
                        // textArea.value = browser[agentType][key].ipAll.IPv6.join(",\n");
                        // label.appendText("IPv6 Addresses");
                        // label.appendChild(textArea);
                        // p.appendChild(label);
                        // p.style.display = "none";
                        // p.setAttribute("class", "agent-management-ip");
                        // li.appendChild(p);

                        // agent IPv4
                        // p = document.createElement("p");
                        // label = document.createElement("label");
                        // textArea = document.createElement("textarea");
                        // textArea.value = browser[agentType][key].ipAll.IPv4.join(",\n");
                        // label.appendText("IPv4 Addresses");
                        // label.appendChild(textArea);
                        // p.appendChild(label);
                        // p.style.display = "none";
                        // p.setAttribute("class", "agent-management-ip");
                        // li.appendChild(p);

                        return li;
                    };
                heading.appendText(common.capitalize(agentType));
                if (len < 1) {
                    list.appendText(`No agents of type ${agentType}.`);
                } else {
                    let index:number = 0;
                    do {
                        list.appendChild(item(keys[index]));
                        index = index + 1;
                    } while (index < len);
                    list.setAttribute("class", "modify-agent-list");
                }
                container.appendChild(heading);
                container.appendChild(list);
                div.appendChild(container);
            };
        h3.appendText("Edit Agent Names");
        div.appendChild(h3);
        // div.appendChild(ipSection());
        section("device");
        section("user");
        div.setAttribute("class", "modify-agents");
        return div;
    }
};

export default agent_change;