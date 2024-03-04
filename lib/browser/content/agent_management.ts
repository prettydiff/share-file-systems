
/* lib/browser/content/agent_management - Provide control of agent data: delete, invite, and edit. */

import agent_change from "../utilities/agent_change.js";
import browser from "../utilities/browser.js";
import configuration_radio from "../utilities/configuration_radio.js";
import invite_decline from "../utilities/invite_decline.js";
import modal_inviteAsk from "../utilities/modal_inviteAsk.js";
import util from "../utilities/util.js";

// cspell:words agenttype

/**
 * Manages agent data in the browser.
 * ```typescript
 * interface module_agentManagement {
 *     content: {
 *         deleteAgents: () => HTMLElement;
 *         inviteRemote: (invitation:service_invite, name:string) => HTMLElement;
 *         inviteStart: () => HTMLElement;
 *         menu: (view:"delete"|"edit_names"|"invite") => HTMLElement;
 *         modifyAgents: () => HTMLElement;
 *     };
 *     events: {
 *         confirm: (event:MouseEvent) => void;
 *         confirmInvite: (event:MouseEvent, options:config_modal) => void;
 *         confirmModify: (event:MouseEvent) => void;
 *         deleteShare: (event:MouseEvent) => void;
 *         deleteToggle: (event:MouseEvent) => void;
 *         displayIP: (event:MouseEvent) => void;
 *         inviteDecline: (event:MouseEvent) => void;
 *         invitePortValidation: (event:Event) => void;
 *         inviteTypeToggle: (event:MouseEvent) => void;
 *         modeToggle: (event:MouseEvent) => void;
 *     };
 *     tools: {
 *         addAgent: (input:agentManagement_addAgent) => void;
 *         confirmDelete: (box:modal) => void;
 *         deleteAgent: (agent:string, agentType:agentType) => void;
 *         inviteAccept: (box:modal) => void;
 *         inviteComplete: (invitation:service_invite, modal:HTMLElement) => void;
 *         inviteReceive: (invitation:service_invite) => void;
 *         inviteTransmissionReceipt: (socketData:socketData) => void;
 *         modifyReceive: (socketData:socketData) => void;
 *     };
 * }
 * ``` */
const agent_management:module_agentManagement = {
    content: {

        /* Modal content for the invite agents fields. */
        inviteStart: function browser_content_agentManagement_inviteStart():HTMLElement {
            const inviteElement:HTMLElement = document.createElement("div"),
                separator:string = "|spaces|",
                blur = function browser_content_agentManagement_inviteStart_blur(focusEvent:FocusEvent):void {
                    const element:HTMLElement = focusEvent.target,
                        box:modal = element.getAncestor("box", "class"),
                        id:string = box.getAttribute("id"),
                        inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
                        textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
                    agent_management.events.invitePortValidation(focusEvent);
                    browser.ui.modals[id].text_value = inputs[0].value + separator + inputs[1].value + separator + textArea.value;
                    browser.configuration();
                },
                textInput = function browser_content_agentManagement_inviteStart_textInput(labelText:string):void {
                    const label:HTMLElement = document.createElement("label"),
                        input:HTMLElement = (labelText === "Invitation Message")
                            ? document.createElement("textarea")
                            : document.createElement("input");
                    p = document.createElement("p");
                    label.appendText(labelText);
                    input.setAttribute("type", "text");
                    input.onblur = blur;
                    input.setAttribute("class", (labelText.indexOf("Message") > 0)
                        ? "message"
                        : labelText.slice(0, labelText.indexOf(" ")).toLowerCase());
                    label.appendChild(input);
                    p.appendChild(label);
                    section.appendChild(p);
                },
                ul:HTMLElement = document.createElement("ul"),
                h3:HTMLElement = document.createElement("h3"),
                name:string = `invite-type${Math.random()}`;
            let p:HTMLElement = document.createElement("p"),
                h4:HTMLElement = document.createElement("h4"),
                section:HTMLElement = document.createElement("div");

            h3.appendText("Invite An Agent");
            inviteElement.appendChild(h3);

            // Type
            h4.appendText("Connection Type");
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
            p.appendText("Including a user allows sharing with a different person and the devices they make available.");
            section.appendChild(p);
            inviteElement.appendChild(section);

            section = document.createElement("div");
            section.setAttribute("class", "section");
            h4 = document.createElement("h4");
            h4.appendText("Connection Details");
            section.appendChild(h4);

            // IP address
            textInput("IP Address");

            // Port
            textInput(`Port (defaults to ${browser.network.default.secure} if blank)`);

            // Message
            textInput("Invitation Message");

            inviteElement.appendChild(section);
            inviteElement.setAttribute("class", "inviteAgent");
            return inviteElement;
        },

        /* The radio buttons at the top of the modal content. */
        menu: function browser_content_agentManagement_menu(view:"delete"|"edit_names"|"invite"):HTMLElement {
            const div:HTMLElement = document.createElement("div"),
                ul:HTMLElement = document.createElement("ul"),
                h3:HTMLElement = document.createElement("h3"),
                name:string = `agent-management-${Math.random()}`,
                bodyDelete:HTMLElement = agent_change.delete(),
                bodyInvite:HTMLElement = agent_management.content.inviteStart(),
                bodyModify:HTMLElement = agent_change.modify();

            util.radioListItem({
                defaultValue: view,
                handler: agent_management.events.modeToggle,
                list: ["Invite", "Edit Names", "Delete"],
                name: name,
                parent: ul
            });
            ul.setAttribute("class", "section");

            h3.appendText("Select An Action");
            div.appendChild(h3);
            div.appendChild(ul);
            div.appendChild(bodyInvite);
            div.appendChild(bodyModify);
            div.appendChild(bodyDelete);
            if (view === "delete") {
                bodyDelete.style.display = "block";
            } else if (view === "invite") {
                bodyInvite.style.display = "block";
            } else if (view === "edit_names") {
                bodyModify.style.display = "block";
            }
            div.setAttribute("class", "agent-management");
            return div;
        }
    },
    events: {

        /* Shows and hides IP address information from the Modify view of agent management */
        displayIP: function browser_content_agentManagement_displayIP(event:MouseEvent):void {
            const target:HTMLInputElement = event.target as HTMLInputElement,
                body:HTMLElement = target.getAncestor("body", "class"),
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

        /* Basic form validation on the port field */
        invitePortValidation: function browser_content_agentManagement_invitePortValidation(event:Event):void {
            const portElement:HTMLInputElement = event.target as HTMLInputElement,
                keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                portParent:HTMLElement = portElement.parentNode,
                element:HTMLInputElement = (portParent.innerHTML.indexOf("Port") === 0)
                    ? portElement
                    : (function browser_content_agentManagement_invitePortValidation_findElement():HTMLInputElement {
                        const content:HTMLElement = portParent.getAncestor("inviteAgent", "class");
                        return content.getElementsByClassName("port")[0] as HTMLInputElement;
                    }()),
                value:string = element.value.replace(/\s+/g, ""),
                numb:number = Number(value);
            if (event.type === "blur" || (event.type === "keyup" && keyboardEvent.key === "Enter")) {
                if (value !== "" && (isNaN(numb) === true || numb < 1 || numb > 65535)) {
                    element.style.color = "#f00";
                    element.style.borderColor = "#f00";
                    element.parentNode.firstChild.textContent = "Error: Port must be a number from 1-65535 or empty.";
                    element.focus();
                } else {
                    element.parentNode.firstChild.textContent = "Port";
                    element.removeAttribute("style");
                }
            }
        },

        /* Switch text messaging in the invitation request modal when the user clicks on the type radio buttons */
        inviteTypeToggle: function browser_content_agentManagement_inviteTypeToggle(event:Event):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                inviteAgent:HTMLElement = element.getAncestor("inviteAgent", "class"),
                warning:HTMLElement = inviteAgent.getElementsByClassName("inviteWarning")[0] as HTMLElement,
                description:HTMLElement = inviteAgent.getElementsByClassName("type-description")[0] as HTMLElement,
                strong:HTMLElement = document.createElement("strong");
            if (warning !== undefined) {
                warning.parentNode.removeChild(warning);
            }
            if (element.value === "device") {
                strong.appendText("Including a personal device will provide unrestricted access to and from that device.");
                description.empty();
                description.appendChild(strong);
                description.appendText(" This username will be imposed upon that device.");
            } else {
                description.appendText("Including a user allows sharing with a different person and the devices they make available.", true);
            }
            description.style.display = "block";
            configuration_radio(element);
        },

        /* Changes the content between invite, delete, edit of agent data */
        modeToggle: function browser_content_agentManagement_modeToggle(event:MouseEvent):void {
            const target:HTMLInputElement = event.target as HTMLInputElement,
                box:modal = target.getAncestor("box", "class"),
                body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                bodyDelete:HTMLElement = body.getElementsByClassName("delete-agents")[0] as HTMLElement,
                bodyInvite:HTMLElement = body.getElementsByClassName("inviteAgent")[0] as HTMLElement,
                bodyModify:HTMLElement = body.getElementsByClassName("modify-agents")[0] as HTMLElement,
                footer:HTMLElement = box.getElementsByClassName("footer")[0] as HTMLElement;
            footer.style.display = "block";
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

        /* Handles final status of an invitation completion */
        inviteComplete: function browser_content_agentManagement_inviteComplete(invitation:service_invite, modal:HTMLElement):void {
            if (modal !== null) {
                const error:HTMLElement = modal.getElementsByClassName("error")[0] as HTMLElement,
                    delay:HTMLElement = modal.getElementsByClassName("delay")[0] as HTMLElement,
                    footer:HTMLElement = modal.getElementsByClassName("footer")[0] as HTMLElement,
                    inviteAgent:HTMLElement = modal.getElementsByClassName("inviteAgent")[0] as HTMLElement,
                    lastChild:HTMLElement = inviteAgent.lastChild as HTMLElement,
                    lastClass:string = (inviteAgent.lastChild.nodeType === 1)
                        ? lastChild.getAttribute("class")
                        : null,
                    prepOutput = function browser_content_agentManagement_inviteComplete_prepOutput(output:HTMLElement):void {
                        if (invitation.status === "accepted") {
                            output.appendText("Invitation accepted!", true);
                            output.setAttribute("class", "accepted");
                            util.audio("invite");
                        } else if (invitation.status === "declined") {
                            output.appendText("Invitation declined. :(", true);
                            output.setAttribute("class", "error");
                        } else if (invitation.status === "ignored") {
                            output.appendText("Invitation ignored.", true);
                            output.setAttribute("class", "error");
                        }
                    };
                footer.style.display = "none";
                if (delay !== undefined) {
                    delay.parentNode.removeChild(delay);
                }
                inviteAgent.style.display = "block";
                if ((error === null || error === undefined) && lastClass !== "accepted" && lastClass !== "error") {
                    const p:HTMLElement = document.createElement("p");
                    prepOutput(p);
                    inviteAgent.appendChild(p);
                } else if (error !== null && error !== undefined) {
                    prepOutput(error);
                }
            }
        },

        /* Receive an invitation from another agent */
        inviteReceive: function browser_content_agentManagement_inviteReceive(invitation:service_invite):void {
            const agentInvite:agentInvite = invitation.agentRequest,
                config:config_modal = {
                    agent: browser.identity.hashDevice,
                    agentIdentity: false,
                    agentType: "device",
                    closeHandler: invite_decline,
                    // confirmHandler = 
                    content: null,
                    height: 300,
                    id: invitation.agentRequest.modal,
                    inputs: ["cancel", "confirm", "close"],
                    read_only: false,
                    share: browser.identity.hashDevice,
                    text_value: JSON.stringify(invitation),
                    title_supplement: `User ${agentInvite.nameUser}`,
                    type: "invite-ask",
                    width: 500
                };
            modal_inviteAsk(null, config);
            util.audio("invite");
        },

        /* Routes invitation messaging from the network to the appropriate method. */
        inviteTransmissionReceipt: function browser_content_agentManagement_inviteTransmissionReceipt(socketData:socketData):void {
            const invitation:service_invite = socketData.data as service_invite,
                modal:HTMLElement = document.getElementById(invitation.agentRequest.modal);
            if (invitation.action === "invite-complete") {
                agent_management.tools.inviteComplete(invitation, modal);
            } else {
                if (modal !== null) {
                    // there should only be one invitation at a time from a given agent otherwise there is spam
                    return;
                }
                agent_management.tools.inviteReceive(invitation);
            }
        }
    }
};

export default agent_management;