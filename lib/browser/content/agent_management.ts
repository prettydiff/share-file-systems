
/* lib/browser/content/agent_management - Provide control of agent data: delete, invite, and edit. */

import browser from "../utilities/browser.js";
import common from "../../common/common.js";
import configuration from "./configuration.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import share from "./share.js";
import util from "../utilities/util.js";

const agent_management = {
    content: {
        /* Modal content for the agent delete list. */
        deleteAgents: function browser_content_agentManagement_deleteAgents():Element {
            const content:Element = document.createElement("div"),
                h3:Element = document.createElement("h3");
            let li:Element,
                input:HTMLInputElement,
                label:Element,
                text:Text,
                p:Element,
                h4:Element,
                names:string[],
                length:number,
                total:number = 0,
                ul:Element = document.createElement("ul");
            content.setAttribute("class", "delete-agents");
            common.agents({
                countBy: "agent",
                perAgent: function browser_content_agentManagement_deleteAgents_perAgent(agentNames:agentNames):void {
                    if (agentNames.agentType !== "device" || (agentNames.agentType === "device" && agentNames.agent !== browser.data.hashDevice)) {
                        li = document.createElement("li");
                        li.setAttribute("class", "summary");
                        label = document.createElement("label");
                        input = document.createElement("input");
                        text = document.createTextNode(browser[agentNames.agentType][agentNames.agent].name);
                        input.type = "checkbox";
                        input.value = agentNames.agent;
                        input.setAttribute("data-type", agentNames.agentType);
                        input.onclick = agent_management.events.deleteToggle;
                        label.appendChild(input);
                        label.appendChild(text);
                        li.appendChild(label);
                        ul.appendChild(li);
                    }
                },
                perAgentType: function browser_content_agentManagement_deleteAgents_perAgentType(agentNames:agentNames):void {
                    h4 = document.createElement("h4");
                    h4.innerHTML = `${common.capitalize(agentNames.agentType)}s`;
                    names = Object.keys(browser[agentNames.agentType]);
                    length = names.length;
                    content.appendChild(h4);
                    total = total + length;
                    if ((agentNames.agentType === "device" && length < 2) || (agentNames.agentType !== "device" && length < 1)) {
                        p = document.createElement("p");
                        p.setAttribute("class", "summary");
                        p.innerHTML = `No ${agentNames.agentType}s to delete.`;
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
                p.innerHTML = "<strong>Please be warned that confirming these change is permanent.</strong> Confirming any selected changes will remove the relationship both locally and on the remote devices/users.";
                content.insertBefore(p, content.firstChild);
                h3.innerHTML = "Delete Agents";
                content.insertBefore(h3, content.firstChild);
            }
            return content;
        },

        /* Modal content for invitation notification on remote agents. */
        inviteRemote: function browser_content_agentManagement_inviteRemote(invitation:service_invite, name:string):Element {
            const div:Element = document.createElement("div"),
                agentInvite:agentInvite = invitation.agentRequest,
                ip:string = (agentInvite.ipSelected.indexOf(":") < 0)
                    ? `${agentInvite.ipSelected}:${agentInvite.ports.http}`
                    : `[${agentInvite.ipSelected}]:${agentInvite.ports.http}`;
            let text:HTMLElement = document.createElement("h3"),
                label:Element = document.createElement("label"),
                textarea:HTMLTextAreaElement = document.createElement("textarea");

            div.setAttribute("class", "agentInvitation");
            text.innerHTML = `${common.capitalize(invitation.type)} <strong>${name}</strong> from ${ip} is inviting you to share.`;
            div.appendChild(text);
            text = document.createElement("p");
            label.innerHTML = `${name} said:`;
            textarea.value = invitation.message;
            label.appendChild(textarea);
            text.appendChild(label);
            div.appendChild(text);
            text = document.createElement("p");
            text.innerHTML = "Press the <em>Confirm</em> button to accept the invitation or close this modal to ignore it.";
            div.appendChild(text);
            return div;
        },

        /* Modal content for the invite agents fields. */
        inviteStart: function browser_content_agentManagement_inviteStart():Element {
            const inviteElement:Element = document.createElement("div"),
                separator:string = "|spaces|",
                blur = function browser_content_agentManagement_inviteStart_blur(focusEvent:Event):void {
                    const element:Element = focusEvent.target as Element,
                        box:Element = element.getAncestor("box", "class"),
                        id:string = box.getAttribute("id"),
                        inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
                        textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
                    agent_management.events.invitePortValidation(focusEvent as KeyboardEvent);
                    browser.data.modals[id].text_value = inputs[0].value + separator + inputs[1].value + separator + textArea.value;
                    network.configuration();
                },
                textInput = function browser_content_agentManagement_inviteStart_textInput(labelText:string):void {
                    const label:Element = document.createElement("label"),
                        input:HTMLElement = (labelText === "Invitation Message")
                            ? document.createElement("textarea")
                            : document.createElement("input");
                    p = document.createElement("p");
                    label.innerHTML = labelText;
                    input.setAttribute("type", "text");
                    input.onblur = blur;
                    label.appendChild(input);
                    p.appendChild(label);
                    section.appendChild(p);
                },
                ul:HTMLElement = document.createElement("ul"),
                name:string = `invite-type${Math.random()}`;
            let p:Element = document.createElement("p"),
                h3:Element = document.createElement("h3"),
                h4:Element = document.createElement("h4"),
                section:Element = document.createElement("div");

            h3.innerHTML = "Invite An Agent";
            inviteElement.appendChild(h3);

            // Type
            h4.innerHTML = "Connection Type";
            section.appendChild(h4);
            util.radioListItem({
                defaultValue: "User",
                handler: agent_management.events.inviteTypeToggle,
                list: ["User", "Device"],
                name: name,
                parent: ul
            });
            section.appendChild(ul);

            // type description text
            section.setAttribute("class", "section");
            p.setAttribute("class", "type-description");
            p.innerHTML = "Including a user allows sharing with a different person and the devices they make available.";
            section.appendChild(p);
            inviteElement.appendChild(section);

            section = document.createElement("div");
            section.setAttribute("class", "section");
            h4 = document.createElement("h4");
            h4.innerHTML = "Connection Details";
            section.appendChild(h4);

            // IP address
            textInput("IP Address");

            // Port
            textInput("Port (defaults to 443 if blank)");

            // Message
            textInput("nvitation Message");

            inviteElement.appendChild(section);
            inviteElement.setAttribute("class", "inviteAgent");
            return inviteElement;
        },

        /* Modal content for the modify agents area. */
        modifyAgents: function browser_content_agentManagement_modifyAgents():Element {
            const div:Element = document.createElement("div"),
                h3:Element = document.createElement("h3"),
                // ipSection = function browser_content_agentManagement_modifyAgents_ipSection():HTMLElement {
                //     const container:HTMLElement = document.createElement("div"),
                //         heading:HTMLElement = document.createElement("h4"),
                //         warning:HTMLElement = document.createElement("p"),
                //         list:HTMLElement = document.createElement("ul");

                //     heading.innerHTML = "Display IP Address Information";
                //     util.radioListItem({
                //         defaultValue: "No",
                //         handler: agent_management.events.displayIP,
                //         list: ["No", "Yes"],
                //         name: `agent-ip-display-${Math.random()}`,
                //         parent: list
                //     });
                //     warning.innerHTML = "<strong>Manually modifying IP address data may result in an unrecoverable disconnection.</strong>";
                //     container.appendChild(heading);
                //     container.appendChild(warning);
                //     container.appendChild(list);
                //     container.setAttribute("class", "section");
                //     return container;
                // },
                section = function browser_content_agentManagement_modifyAgents_section(agentType:agentType):void {
                    const container:Element = document.createElement("div"),
                        heading:Element = document.createElement("h4"),
                        keys:string[] = Object.keys(browser[agentType]),
                        len:number = keys.length,
                        list:Element = (len < 1)
                            ? document.createElement("p")
                            : document.createElement("ul"),
                        item = function browser_content_agentManagement_modifyAgents_section_item(key:string):Element {
                            let p:HTMLElement = document.createElement("p"),
                                label:HTMLElement = document.createElement("label"),
                                input:HTMLInputElement = document.createElement("input"),
                                textArea:HTMLTextAreaElement = document.createElement("textarea");
                            const li = document.createElement("li");

                            // agent hash
                            p.innerHTML = key;
                            p.setAttribute("class", "modify-agent-hash");
                            li.append(p);

                            // agent name
                            p = document.createElement("p");
                            input.type = "text";
                            input.value = browser[agentType][key].name;
                            input.setAttribute("data-agent", key);
                            input.setAttribute("data-type", agentType);
                            label.innerHTML = "Name";
                            label.appendChild(input);
                            p.appendChild(label);
                            li.appendChild(p);

                            // agent IPv6
                            // p = document.createElement("p");
                            // label = document.createElement("label");
                            // textArea.value = browser[agentType][key].ipAll.IPv6.join(",\n");
                            // label.innerHTML = "IPv6 Addresses";
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
                            // label.innerHTML = "IPv4 Addresses";
                            // label.appendChild(textArea);
                            // p.appendChild(label);
                            // p.style.display = "none";
                            // p.setAttribute("class", "agent-management-ip");
                            // li.appendChild(p);

                            return li;
                        };
                    heading.innerHTML = common.capitalize(agentType);
                    if (len < 1) {
                        list.innerHTML = `No agents of type ${agentType}.`
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
            h3.innerHTML = "Edit Agent Names";
            div.appendChild(h3);
            // div.appendChild(ipSection());
            section("device");
            section("user");
            div.setAttribute("class", "modify-agents");
            return div;
        },

        /* The radio buttons at the top of the modal content. */
        menu: function browser_content_agentManagement_menu(view:"delete"|"edit_names"|"invite"):HTMLElement {
            const div:HTMLElement = document.createElement("div"),
                ul:HTMLElement = document.createElement("ul"),
                h3:HTMLElement = document.createElement("h3"),
                name:string = `agent-management-${Math.random()}`,
                bodyDelete:HTMLElement = agent_management.content.deleteAgents() as HTMLElement,
                bodyInvite:HTMLElement = agent_management.content.inviteStart() as HTMLElement,
                bodyModify:HTMLElement = agent_management.content.modifyAgents() as HTMLElement;

            util.radioListItem({
                defaultValue: view,
                handler: agent_management.events.modeToggle,
                list: ["Invite", "Edit Names", "Delete"],
                name: name,
                parent: ul
            });
            ul.setAttribute("class", "section");

            h3.innerHTML = "Select An Action";
            div.appendChild(h3);
            div.appendChild(ul);
            if (view === "delete") {
                bodyInvite.style.display = "none";
                bodyModify.style.display = "none";
            } else if (view === "invite") {
                bodyDelete.style.display = "none";
                bodyModify.style.display = "none";
            } else if (view === "edit_names") {
                bodyInvite.style.display = "none";
                bodyModify.style.display = "none";
            }
            div.appendChild(bodyInvite);
            div.appendChild(bodyModify);
            div.appendChild(bodyDelete);
            div.setAttribute("class", "agent-management");
            return div;
        }
    },
    events: {
        /* Changes visual state of items in the agent delete list as they are checked or unchecked. */
        deleteToggle: function browser_content_agentManagement_deleteToggle(event:MouseEvent):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                label:Element = element.parentNode as Element;
            if (element.checked === true) {
                label.setAttribute("class", "checked");
            } else {
                label.removeAttribute("class");
            }
        },

        /* Shows and hides IP address information from the Modify view of agent management */
        displayIP: function browser_content_agentManagement_displayIP(event:MouseEvent):void {
            const target:HTMLInputElement = event.target as HTMLInputElement,
                body:Element = target.getAncestor("body", "class"),
                value:string = (target.value === "yes")
                    ? "block"
                    : "none",
                ipList:HTMLCollectionOf<HTMLElement> = body.getElementsByClassName("agent-management-ip") as HTMLCollectionOf<HTMLElement>;
            let len:number = ipList.length;
            if (len > 0) {
                do {
                    len = len - 1;
                    ipList[len].style.display = value;
                } while (len > 0);
            }
        },

        /* Handler for declining an invitation request */
        inviteDecline: function browser_content_invite_decline(event:MouseEvent):void {
            const element:Element = event.target as Element,
                boxLocal:Element = element.getAncestor("box", "class"),
                inviteBody:Element = boxLocal.getElementsByClassName("agentInvitation")[0],
                invitation:service_invite = JSON.parse(inviteBody.getAttribute("data-invitation"));
            invitation.status = "declined";
            network.send(invitation, "invite");
            modal.events.close(event);
        },

        /* Basic form validation on the port field */
        invitePortValidation: function browser_content_agentManagement_invitePortValidation(event:Event):void {
            const portElement:HTMLInputElement = event.target as HTMLInputElement,
                keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                portParent:Element = portElement.parentNode as Element,
                element:HTMLInputElement = (portParent.innerHTML.indexOf("Port") === 0)
                    ? portElement
                    : (function browser_content_agentManagement_invitePortValidation_findElement():HTMLInputElement {
                        let body:Element = portParent.getAncestor("body", "class"),
                            a:number = 0;
                        const inputs:HTMLCollectionOf<HTMLInputElement> = body.getElementsByTagName("input"),
                            length:number = inputs.length;
                        do {
                            if (inputs[a].getAttribute("placeholder") === "Number 1-65535") {
                                return inputs[a];
                            }
                            a = a + 1;
                        } while (a < length);
                    }()),
                parent:Element = element.parentNode as Element,
                value:string = element.value.replace(/\s+/g, ""),
                numb:number = Number(value);
            if (event.type === "blur" || (event.type === "keyup" && keyboardEvent.key === "Enter")) {
                if (value !== "" && (isNaN(numb) === true || numb < 1 || numb > 65535)) {
                    element.style.color = "#f00";
                    element.style.borderColor = "#f00";
                    parent.firstChild.textContent = "Error: Port must be a number from 1-65535 or empty.";
                    element.focus();
                } else {
                    parent.firstChild.textContent = "Port";
                    element.removeAttribute("style");
                }
            }
        },

        /* Switch text messaging in the invitation request modal when the user clicks on the type radio buttons */
        inviteTypeToggle: function browser_content_agentManagement_inviteTypeToggle(event:Event):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                inviteAgent:Element = element.getAncestor("inviteAgent", "class"),
                warning:Element = inviteAgent.getElementsByClassName("inviteWarning")[0],
                description:HTMLElement = inviteAgent.getElementsByClassName("type-description")[0] as HTMLElement;
            if (warning !== undefined) {
                warning.parentNode.removeChild(warning);
            }
            if (element.value === "device") {
                description.innerHTML = "<strong>Including a personal device will provide unrestricted access to and from that device.</strong> This username will be imposed upon that device.";
            } else {
                description.innerHTML = "Including a user allows sharing with a different person and the devices they make available.";
            }
            description.style.display = "block";
            configuration.tools.radio(element);
        },

        /* Changes the content between invite, delete, edit of agent data */
        modeToggle: function browser_content_agentManagement_modeToggle(event:MouseEvent):void {
            const target:HTMLInputElement = event.target as HTMLInputElement,
                body:Element = target.getAncestor("body", "class"),
                bodyDelete:HTMLElement = body.getElementsByClassName("delete-agents")[0] as HTMLElement,
                bodyInvite:HTMLElement = body.getElementsByClassName("inviteAgent")[0] as HTMLElement,
                bodyModify:HTMLElement = body.getElementsByClassName("modify-agents")[0] as HTMLElement;
            if (target.value === "delete") {
                bodyDelete.style.display = "block";
                bodyInvite.style.display = "none";
                bodyModify.style.display = "none";
            } else if (target.value === "invite") {
                bodyDelete.style.display = "none";
                bodyInvite.style.display = "block";
                bodyModify.style.display = "none";
            } else if (target.value === "edit_names") {
                bodyDelete.style.display = "none";
                bodyInvite.style.display = "none";
                bodyModify.style.display = "block";
            }
        }
    },
    tools: {
        /* Adds an agent into the browser user interface whether the agent is new or the page is loading. */
        addAgent: function browser_content_agentManagement_addAgent(input:addAgent):void {
            const li:HTMLLIElement = document.createElement("li"),
                button:HTMLElement = document.createElement("button"),
                addStyle = function browser_content_agentManagement_addUser_addStyle():void {
                    let body:string,
                        heading:string;
                    if (browser.data.colors[input.type][input.hash] === undefined) {
                        body = configuration.colorDefaults[browser.data.color][0];
                        heading = configuration.colorDefaults[browser.data.color][1];
                        browser.data.colors[input.type][input.hash] = [body, heading];
                        if (input.callback === undefined) {
                            network.configuration();
                        } else {
                            network.send({
                                settings: browser.data,
                                type: "configuration"
                            }, "settings");
                            input.callback();
                        }
                    } else {
                        body = browser.data.colors[input.type][input.hash][0];
                        heading = browser.data.colors[input.type][input.hash][1];
                    }
                    if (browser.loading === false) {
                        configuration.tools.styleText({
                            agent: input.hash,
                            colors: [body, heading],
                            replace: false,
                            type: input.type
                        });
                    }
                },
                sharesModal = function browser_content_agentManagement_addUser_sharesModal(event:MouseEvent):void {
                    let element:Element = event.target as Element,
                        agent:string = element.getAttribute("id"),
                        agentType:agentType = element.getAttribute("data-agent-type") as agentType;
                    element = element.getAncestor("button", "tag");
                    share.tools.modal(agent, agentType, null);
                };
            button.innerHTML = `<em class="status-active">●<span> Active</span></em><em class="status-idle">●<span> Idle</span></em><em class="status-offline">●<span> Offline</span></em> ${input.name}`;
            if (input.hash === browser.data.hashDevice) {
                button.setAttribute("class", "active");
            } else {
                button.setAttribute("class", browser[input.type][input.hash].status);
            }
            button.setAttribute("id", input.hash);
            button.setAttribute("data-agent-type", input.type);
            button.onclick = sharesModal;
            li.appendChild(button);
            document.getElementById(input.type).getElementsByTagName("ul")[0].appendChild(li);
            addStyle();
            if (browser.loading === false) {
                configuration.tools.addUserColor(input.hash, input.type, document.getElementById("configuration-modal").getElementsByClassName("configuration")[0] as Element);
                share.tools.update("");
            }
        },

        /* Handles the confirmation button for the agent management modal type. */
        confirm: function browser_content_agentManagement_confirm(event:MouseEvent):void {
            const target:HTMLElement = event.target as HTMLElement,
                box = target.getAncestor("box", "class"),
                firstInput = box.getElementsByTagName("input")[0],
                type:string = (function browser_content_agentManagement_confirm_type():string {
                    const radios:NodeListOf<HTMLInputElement> = document.getElementsByName(firstInput.getAttribute("name")) as NodeListOf<HTMLInputElement>;
                    let len:number = radios.length;
                    do {
                        len = len - 1;
                        if (radios[len].checked === true) {
                            return radios[len].value;
                        }
                    } while (len > 0);
                    return null;
                }());
            if (type === "invite") {
                agent_management.tools.confirmInvite(event, browser.data.modals[box.getAttribute("id")]);
            } else if (type === "edit_names") {
                agent_management.tools.confirmModify(event);
            } else if (type === "delete") {
                agent_management.tools.confirmDelete(box);
            }
        },

        /* Processes agent termination from a delete-agents content of agent-management */
        confirmDelete: function browser_content_agentManagement_confirmDelete(box:Element):void {
            const body:Element = box.getElementsByClassName("body")[0],
                list:HTMLCollectionOf<Element> = body.getElementsByTagName("li"),
                manage:service_agentManagement = {
                    action: "delete",
                    agentFrom: browser.data.hashDevice,
                    agents: {
                        device: {},
                        user: {}
                    }
                };
            let a:number = list.length,
                count:number = 0,
                input:HTMLInputElement,
                type:agentType,
                subtitle:Element,
                hash:string,
                parent:Element;

            // put the deleted agents into a list
            do {
                a = a - 1;
                input = list[a].getElementsByTagName("input")[0];
                if (input.checked === true) {
                    hash = input.value;
                    type = input.getAttribute("data-type") as agentType;
                    parent = document.getElementById(hash).parentNode as Element;
                    if (list[a].parentNode.childNodes.length < 2) {
                        subtitle = document.createElement("p");
                        subtitle.innerHTML = `No ${type}s to delete.`;
                        subtitle.setAttribute("class", "summary");
                        list[a].parentNode.parentNode.insertBefore(subtitle, list[a].parentNode);
                        list[a].parentNode.parentNode.removeChild(list[a].parentNode);
                    } else {
                        list[a].parentNode.removeChild(list[a]);
                    }
                    manage.agents[type][hash] = browser[type][hash];
                    parent.parentNode.removeChild(parent);
                    agent_management.tools.deleteAgent(hash, type);
                    count = count + 1;
                }
            } while (a > 0);
            if (count < 1) {
                return;
            }
            network.send(manage, "agent-management");
            share.tools.update("");
            network.configuration();
        },

        /* Send the invite request to the network */
        confirmInvite: function browser_content_agentManagement_confirmInvite(event:Event, options:config_modal):void {
            let type:agentType,
                ip:string,
                port:string,
                portNumber:number;
            const element:Element = event.target as Element,
                box:Element = element.getAncestor("box", "class"),
                input:HTMLElement = (function browser_content_agentManagement_confirmInvite_input():HTMLElement {
    
                    // value attainment and form validation
                    const inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
                        length = inputs.length,
                        indexes:inviteIndexes = {
                            type: -1,
                            ip: -1,
                            port: -1
                        };
                    let a:number = 0,
                        parentNode:Element;
                    do {
                        parentNode = inputs[a].parentNode as Element;
                        if (inputs[a].value === "device" || inputs[a].value === "user") {
                            if (inputs[a].value === "device") {
                                indexes.type = a;
                            }
                            if (inputs[a].checked === true) {
                                type = inputs[a].value as agentType;
                            }
                        } else if (parentNode.innerHTML.indexOf("IP Address") === 0) {
                            indexes.ip = a;
                            ip = inputs[a].value;
                        } else if (parentNode.innerHTML.indexOf("Port") === 0) {
                            indexes.port = a;
                            port = inputs[a].value;
                        }
                        a = a + 1;
                    } while (a < length);
                    if (type === undefined) {
                        return inputs[indexes.type];
                    }
                    if (ip === undefined || ip.replace(/\s+/, "") === "" || ((/(\d{1,3}\.){3}\d{1,3}/).test(ip) === false && (/([a-f0-9]{4}:)+/).test(ip) === false)) {
                        return inputs[indexes.ip];
                    }
                    if (port === undefined || port.replace(/^\s+$/, "") === "") {
                        port = "";
                        portNumber = (location.href.indexOf("https") === 0)
                            ? 443
                            : 80;
                    } else {
                        portNumber = Number(port);
                        if (isNaN(portNumber) === true || portNumber < 0 || portNumber > 65535) {
                            return inputs[indexes.port];
                        }
                    }
                    return null;
                }()),
                ipSelected:string = ((/(\d{1,3}\.){3}\d{1,3}/).test(ip) === false && browser.localNetwork.addresses.IPv6.length > 0)
                    ? browser.localNetwork.addresses.IPv6[0]
                    : browser.localNetwork.addresses.IPv4[0],
                body:Element = box.getElementsByClassName("body")[0],
                content:HTMLElement = body.getElementsByClassName("inviteAgent")[0] as HTMLElement,
                footer:HTMLElement = box.getElementsByClassName("footer")[0] as HTMLElement,
                saved:inviteSaved = {
                    ip: ip,
                    message: box.getElementsByTagName("textarea")[0].value.replace(/"/g, "\\\""),
                    port: port,
                    type: type
                },
                invitation:service_invite = {
                    action: "invite-start",
                    agentRequest: {
                        devices: (type === "device")
                            ? browser.device
                            : {},
                        hashDevice: (type === "device")
                            ? browser.data.hashDevice
                            : "",
                        hashUser: browser.data.hashUser,
                        ipAll: browser.localNetwork.addresses,
                        ipSelected: ipSelected,
                        modal: options.id,
                        nameDevice: (type === "device")
                            ? browser.data.nameDevice
                            : "",
                        nameUser: browser.data.nameUser,
                        ports: {
                            http: browser.localNetwork.httpPort,
                            ws: browser.localNetwork.wsPort
                        },
                        shares: (type === "device")
                            ? {}
                            : common.selfShares(browser.user)
                    },
                    agentResponse: {
                        devices: null,
                        hashDevice: "",
                        hashUser: "",
                        ipAll: null,
                        ipSelected: ip,
                        modal: "",
                        nameDevice: "",
                        nameUser: "",
                        ports: {
                            http: portNumber,
                            ws: 0
                        },
                        shares: null
                    },
                    message: saved.message,
                    status: "invited",
                    type: type
                };
            options.text_value = JSON.stringify(saved);
            network.configuration();
            if (input !== null) {
                const p:Element = input.parentNode.parentNode as Element,
                    warning:Element = document.createElement("p");
                p.setAttribute("class", "warning");
                input.focus();
                warning.innerHTML = "<strong>Please select an invitation type.</strong>";
                warning.setAttribute("class", "inviteWarning");
                p.parentNode.appendChild(warning);
                return;
            }
            content.style.display = "none";
            footer.style.display = "none";
            if (content.getElementsByClassName("error").length > 0) {
                content.removeChild(content.getElementsByClassName("error")[0]);
            }
            body.appendChild(util.delay());
            network.send(invitation, "invite");
        },

        /* Handle confirmation of changes to agent data. */
        confirmModify: function browser_content_agentManagement_confirmModify(event:MouseEvent):void {
            const target:Element = event.target as Element,
                box:Element = target.getAncestor("box", "class"),
                boxes:HTMLCollectionOf<HTMLDivElement> = document.getElementsByClassName("box") as HTMLCollectionOf<HTMLDivElement>,
                modify:Element = box.getElementsByClassName("modify-agents")[0],
                inputs:HTMLCollectionOf<HTMLInputElement> = modify.getElementsByTagName("input"),
                flags:flagList = {
                    device: false,
                    user: false
                },
                modifyService:service_agentManagement = {
                    action: "rename",
                    agents: {
                        device: {},
                        user: {}
                    },
                    agentFrom: browser.data.hashDevice
                },
                modifyModals = function browser_content_agentManagement_confirmModify_modifyModals(agent:string, type:agentType, name:string):void {
                    const typeString:string = `${common.capitalize(type)}, `;
                    let boxLen:number = boxes.length,
                        button:Element = null,
                        id:string = "",
                        text:string = "";
                    do {
                        boxLen = boxLen - 1;
                        if (boxes[boxLen].getAttribute("data-agent") === agent && boxes[boxLen].getAttribute("data-agenttype") === type) {
                            id = boxes[boxLen].getAttribute("id");
                            button = boxes[boxLen].getElementsByTagName("button")[0];
                            text = button.innerHTML;
                            text = text.slice(0, text.indexOf(typeString) + typeString.length) + name;
                            button.innerHTML = text;
                            browser.data.modals[id].title = text;
                        }
                    } while (boxLen > 0);
                };
            let len:number = inputs.length,
                agent:string = "",
                name:string = "",
                type:agentType = null,
                value:string = "";
            do {
                len = len - 1;
                agent = inputs[len].getAttribute("data-agent");
                type = inputs[len].getAttribute("data-type") as agentType;
                name = browser[type][agent].name;
                value = inputs[len].value;
                if (value !== name) {
                    flags[type] = true;
                    browser[type][agent].name = value;
                    document.getElementById(agent).lastChild.textContent = ` ${value}`;
                    modifyModals(agent, type, value);
                    modifyService.agents[type][agent] = browser[type][agent];
                }
            } while (len > 0);
            if (flags.user === true || flags.device === true) {
                network.send(modifyService, "agent-management");
                network.configuration();
            }
        },

        /* Removes an agent from the browser interface */
        deleteAgent: function browser_content_agentManagement_deleteAgent(agent:string, agentType:agentType):void {
            const userColors:HTMLCollectionOf<Element> = document.getElementById("configuration-modal").getElementsByClassName(`${agentType}-color-list`)[0].getElementsByTagName("li"),
                shareModals = document.getModalsByModalType("shares"),
                colorLength:number = userColors.length,
                button:Element = document.getElementById(agent),
                parent:Element = (button === null)
                    ? null
                    : button.parentNode as Element;
            let a:number = 0,
                shareLength = shareModals.length,
                closeButton:HTMLButtonElement = null;
    
            // loop through the color swatches in the settings modal to remove the agent's colors
            if (colorLength > 0) {
                do {
                    if (userColors[a].getAttribute("data-agent") === agent) {
                        userColors[a].parentNode.removeChild(userColors[a]);
                        configuration.tools.styleText({
                            agent: agent,
                            colors: ["", ""],
                            replace: true,
                            type: agentType
                        });
                        break;
                    }
                    a = a + 1;
                } while (a < colorLength);
            }
    
            // remove the agent from the data structures
            delete browser[agentType][agent];
            delete browser.data.colors[agentType][agent];
    
            // remove agent associated share modals
            if (shareLength > 0) {
                do {
                    shareLength = shareLength - 1;
                    if (shareModals[shareLength].getAttribute("data-agent") === agent && shareModals[shareLength].getAttribute("data-agentType") === agentType) {
                        closeButton = shareModals[shareLength].getElementsByClassName("close")[0] as HTMLButtonElement;
                        closeButton.click();
                    }
                } while (shareLength > 0);
            }
    
            // remove the named button for the agent
            if (parent !== null && button.getAttribute("data-agent-type") === agentType) {
                parent.parentNode.removeChild(parent);
            }
        },

        /* Removes a share from a device of the local user. */
        deleteShare: function browser_content_agentManagement_deleteShare(event:MouseEvent):void {
            const element:Element = event.target as Element,
                parent:Element = element.parentNode as Element,
                box:Element = parent.getAncestor("box", "class"),
                agent:string = (function browser_content_agentManagement_deleteShare_agency():string {
                    const boxAgent:agency = util.getAgent(box);
                    if (boxAgent[0] === null || boxAgent[0] === "") {
                        return element.getAncestor("ul", "tag").getAncestor("li", "tag").getAttribute("data-hash");
                    }
                    return boxAgent[0];
                }()),
                address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
                shares:agentShares = browser.device[agent].shares,
                keys:string[] = Object.keys(shares),
                length:number = keys.length,
                manage:service_agentManagement = {
                    action: "modify",
                    agentFrom: browser.data.hashDevice,
                    agents: {
                        device: {},
                        user: {}
                    }
                };
            let a:number = 0;
            do {
                if (shares[keys[a]].name === address) {
                    delete shares[keys[a]];
                    break;
                }
                a = a + 1;
            } while (a < length);
            if (length === 1) {
                const p:Element = document.createElement("p"),
                    granny:Element = parent.parentNode as Element;
                p.innerHTML = `Device <em>${browser.device[agent].name}</em> has no shares.`;
                granny.parentNode.insertBefore(p, granny);
                granny.parentNode.removeChild(granny);
            } else {
                parent.parentNode.removeChild(parent);
            }
            share.tools.update(box.getAttribute("id"));
            manage.agents.device[agent] = browser.device[agent];
            network.send(manage, "agent-management");
        },

        /* Accept an invitation, handler on a modal's confirm button */
        inviteAccept: function browser_content_agentManagement_inviteAccept(box:Element):void {
            const div:Element = box.getElementsByClassName("agentInvitation")[0],
                invitation:service_invite = JSON.parse(div.getAttribute("data-invitation"));
            invitation.action = "invite-response";
            invitation.message = `Invite accepted: ${common.dateFormat(new Date())}`;
            invitation.status = "accepted";
            if (invitation.type === "device") {
                browser.data.hashUser = invitation.agentRequest.hashUser;
                browser.data.nameUser = invitation.agentRequest.nameUser;
                network.configuration();
            }
            // this shares definition is what's written to settings when the remote agent accepts an invitation
            network.send(invitation, "invite");
        },

        /* Handles final status of an invitation response */
        inviteComplete: function browser_content_agentManagement_inviteComplete(invitation:service_invite):void {
            const modal:Element = document.getElementById(invitation.agentRequest.modal);
            if (modal !== null) {
                const error:Element = modal.getElementsByClassName("error")[0],
                    delay:HTMLElement = modal.getElementsByClassName("delay")[0] as HTMLElement,
                    footer:HTMLElement = modal.getElementsByClassName("footer")[0] as HTMLElement,
                    inviteAgent:HTMLElement = modal.getElementsByClassName("inviteAgent")[0] as HTMLElement,
                    prepOutput = function browser_content_agentManagement_inviteComplete_prepOutput(output:Element):void {
                        if (invitation.status === "accepted") {
                            output.innerHTML = "Invitation accepted!";
                            output.setAttribute("class", "accepted");
                            util.audio("invite");
                        } else if (invitation.status === "declined") {
                            output.innerHTML = "Invitation declined. :(";
                            output.setAttribute("class", "error");
                        } else if (invitation.status === "ignored") {
                            output.innerHTML = "Invitation ignored.";
                            output.setAttribute("class", "error");
                        }
                    };
                footer.style.display = "none";
                if (delay !== undefined) {
                    delay.style.display = "none";
                }
                inviteAgent.style.display = "block";
                if (error === null || error === undefined) {
                    const p:Element = document.createElement("p");
                    prepOutput(p);
                    modal.getElementsByClassName("inviteAgent")[0].appendChild(p);
                } else {
                    prepOutput(error);
                }
            }
        },

        /* Receive an invitation from another user */
        inviteReceive: function browser_content_agentManagement_inviteReceive(invitation:service_invite):void {
            const agentInvite:agentInvite = invitation.agentRequest,
                name:string = (invitation.type === "device")
                    ? agentInvite.nameDevice
                    : agentInvite.nameUser,
                content:Element = agent_management.content.inviteRemote(invitation, name),
                modals:string[] = Object.keys(browser.data.modals),
                length:number = modals.length,
                payloadModal:config_modal = {
                    agent: browser.data.hashDevice,
                    agentIdentity: false,
                    agentType: "device",
                    content: content,
                    height: 300,
                    inputs: ["cancel", "confirm", "close"],
                    read_only: false,
                    share: browser.data.hashDevice,
                    title: (invitation.type === "device")
                        ? `Invitation from Device ${agentInvite.nameDevice}`
                        : `Invitation from User ${agentInvite.nameUser}`,
                    type: "invite-accept",
                    width: 500
                };
            let a:number = 0;
            do {
                if (browser.data.modals[modals[a]].type === "invite-accept" && browser.data.modals[modals[a]].title === `Invitation from ${name}`) {
                    // there should only be one invitation at a time from a given user otherwise there is spam
                    return;
                }
                a = a + 1;
            } while (a < length);
            invitation.agentResponse.modal = modal.content(payloadModal).getAttribute("id");
            content.setAttribute("data-invitation", JSON.stringify(invitation));
            util.audio("invite");
        },

        /* Routes invitation messaging from the network to the appropriate method. */
        inviteTransmissionReceipt: function browser_content_agentManagement_inviteTransmissionReceipt(socketData:socketData):void {
            const invitation:service_invite = socketData.data as service_invite;
            if (invitation.action === "invite-complete") {
                agent_management.tools.inviteComplete(invitation);
            } else {
                agent_management.tools.inviteReceive(invitation);
            }
        },

        /* Receives agent data from the terminal for processing in the browser. */
        modifyReceive: function browser_content_agentManagement_modifyReceive(socketData:socketData):void {
            const data:service_agentManagement = socketData.data as service_agentManagement;
            if (data.action === "add") {
                const addAgents = function browser_content_agentManagement_receive_addAgents(agentType:agentType):void {
                    const keys:string[] = Object.keys(data.agents[agentType]),
                        keyLength:number = keys.length;
                    if (keyLength > 0) {
                        let a:number = 0;
                        do {
                            if (browser[agentType][keys[a]] === undefined) {
                                browser[agentType][keys[a]] = data.agents[agentType][keys[a]];
                                agent_management.tools.addAgent({
                                    hash: keys[a],
                                    name: data.agents[agentType][keys[a]].name,
                                    type: agentType
                                });
                            }
                            a = a + 1;
                        } while (a < keyLength);
                    }
                };
                addAgents("device");
                addAgents("user");
            } else if (data.action === "delete") {
                const deleteAgents = function browser_content_agentManagement_receive_deleteAgents(agentType:agentType):void {
                    const keys:string[] = Object.keys(data.agents[agentType]),
                        keyLength:number = keys.length,
                        property:"hashDevice"|"hashUser" = `hash${common.capitalize(agentType)}` as "hashDevice"|"hashUser";
                    if (keyLength > 0) {
                        let a:number = 0;
                        do {
                            if (keys[a] === browser.data[property]) {
                                agent_management.tools.deleteAgent(data.agentFrom, agentType);
                            } else {
                                agent_management.tools.deleteAgent(keys[a], agentType);
                            }
                            a = a + 1;
                        } while (a < keyLength);
                    }
                };
                deleteAgents("device");
                deleteAgents("user");
                network.configuration();
            } else if (data.action === "modify") {
                const shareContent = function browser_content_agentManagement_receive_shareContent(agentName:string, agentType:agentType|""):void {
                        const shareModals:Element[] = document.getModalsByModalType("shares");
                        let shareLength:number = shareModals.length,
                            body:Element = null;
                        if (shareLength > 0) {
                            do {
                                shareLength = shareLength - 1;
                                if ((shareModals[shareLength].getAttribute("data-agent") === agentName && shareModals[shareLength].getAttribute("data-agentType") === agentType) || (agentType === "" && shareModals[shareLength].getElementsByTagName("button")[0].innerHTML === "⌘ All Shares")) {
                                    body = shareModals[shareLength].getElementsByClassName("body")[0];
                                    body.innerHTML = "";
                                    body.appendChild(share.content(agentName, agentType));
                                }
                            } while (shareLength > 0);
                        }
                    },
                    modifyAgents = function browser_content_agentManagement_receive_modifyAgents(agentType:agentType):void {
                        const keys:string[] = Object.keys(data.agents[agentType]),
                            keyLength:number = keys.length;
                        if (keyLength > 0) {
                            let a:number = 0;
                            do {
                                if (browser[agentType][keys[a]] !== undefined) {
                                    browser[agentType][keys[a]] = data.agents[agentType][keys[a]];
                                    shareContent(keys[a], agentType);
                                }
                                a = a + 1;
                            } while (a < keyLength);
                            shareContent("", agentType);
                        }
                    };
                modifyAgents("device");
                modifyAgents("user");
                shareContent("", "");
            }
        }
    }
};

export default agent_management;