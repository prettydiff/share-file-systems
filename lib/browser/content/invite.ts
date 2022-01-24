
/* lib/browser/content/invite - A collection of utilities for processing invitation related tasks. */
import browser from "../browser.js";
import common from "../../common/common.js";
import configuration from "./configuration.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

/**
 * Provides invite modal content, invite messaging handling, and all associated interactions.
 * * **content.remote** - Prepares content for the recipient agent of an invitation.
 * * **content.start** - Starts the invitation process by creating an *invite* modal and populating it with content.
 * * **events.decline** - The event handler for when a remote user declines an invitation request.
 * * **events.portValidation** - A form validation control to assert input is formatted like an IP address.
 * * **events.request** - Issues an invitation request to the network.
 * * **events.typeToggle** - Toggles informational text when the user clicks on an agent type radio button.
 * * **tools.accept** - The event handler for when a remote user accepts an invitation request.
 * * **tools.complete** - Provides messaging at the final stage of the invitation process.
 * * **tools.receive** - Receives an invitation request at the remote agent.
 * * **tools.transmissionReceipt** - Routes invitation message traffic from the network to the appropriate method.
 *
 * ```typescript
 * interface module_invite {
 *     content: {
 *         remote: (invitation:service_invite, name:string) => Element;
 *         start: (settings?:config_modal) => Element;
 *     };
 *     events: {
 *         decline: (event:MouseEvent) => void;
 *         portValidation: (event:KeyboardEvent) => void;
 *         request: (event:Event, options:config_modal) => void;
 *         typeToggle: (event:Event) => void;
 *     },
 *     tools: {
 *         accept: (box:Element) => void;
 *         complete: (invitation:service_invite) => void;
 *         receive: (invitation:service_invite) => void;
 *         transmissionReceipt: (socketData:socketData) => void;
 *     }
 * }
 * ``` */
const invite:module_invite = {

    content: {
        /* Prepares the HTML content for the recipient agent of an invitation. */
        remote: function browser_content_invite_remote(invitation:service_invite, name:string):Element {
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

        /* Prepares the HTML content for the initiating agent of an invitation. */
        start: function browser_content_invite_start(settings?:config_modal):Element {
            const inviteElement:Element = document.createElement("div"),
                separator:string = "|spaces|",
                random:string = Math.random().toString(),
                blur = function browser_content_invite_start_blur(focusEvent:Event):void {
                    const element:Element = focusEvent.target as Element,
                        box:Element = element.getAncestor("box", "class"),
                        id:string = box.getAttribute("id"),
                        inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
                        textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
                    invite.events.portValidation(focusEvent as KeyboardEvent);
                    browser.data.modals[id].text_value = inputs[0].value + separator + inputs[1].value + separator + textArea.value;
                    network.configuration();
                },
                saved:inviteSaved = (settings !== undefined && settings.text_value !== undefined && settings.text_value.charAt(0) === "{" && settings.text_value.charAt(settings.text_value.length - 1) === "}")
                    ? JSON.parse(settings.text_value)
                    : null;
            let p:Element = document.createElement("p"),
                label:Element = document.createElement("label"),
                input:HTMLInputElement = document.createElement("input"),
                text:HTMLTextAreaElement = document.createElement("textarea"),
                h3:Element = document.createElement("h3"),
                section:Element = document.createElement("div");

            // Type
            h3.innerHTML = "Connection Type";
            section.appendChild(h3);
            input.name = `invite-type-${random}`;
            input.type = "radio";
            input.value = "device";
            if (saved !== null && saved.type === "device") {
                input.checked = true;
            }
            input.onclick = invite.events.typeToggle;
            label.setAttribute("class", "radio");
            label.innerHTML = "Personal Device";
            label.appendChild(input);
            p.appendChild(label);
            label = document.createElement("label");
            input = document.createElement("input");
            input.name = `invite-type-${random}`;
            input.type = "radio";
            input.value = "user";
            if (saved !== null && saved.type === "user") {
                input.checked = true;
            }
            input.onclick = invite.events.typeToggle;
            label.setAttribute("class", "radio");
            label.innerHTML = "User";
            label.appendChild(input);
            p.appendChild(label);
            section.setAttribute("class", "section");
            section.appendChild(p);
            p = document.createElement("p");
            p.setAttribute("class", "type-description");
            section.appendChild(p);
            inviteElement.appendChild(section);

            section = document.createElement("div");
            section.setAttribute("class", "section");
            h3 = document.createElement("h3");
            h3.innerHTML = "Connection Details";
            section.appendChild(h3);

            // IP address
            p = document.createElement("p");
            label = document.createElement("label");
            input = document.createElement("input");
            label.innerHTML = "IP Address";
            input.setAttribute("type", "text");
            if (saved !== null) {
                input.value = saved.ip;
            }
            input.onblur = blur;
            label.appendChild(input);
            p.appendChild(label);
            section.appendChild(p);

            // Port
            p = document.createElement("p");
            label = document.createElement("label");
            input = document.createElement("input");
            label.innerHTML = "Port";
            input.setAttribute("type", "text");
            input.placeholder = "Number 1-65535";
            input.onkeyup = invite.events.portValidation;
            if (saved !== null) {
                input.value = saved.port;
            }
            input.onblur = blur;
            label.appendChild(input);
            p.appendChild(label);
            section.appendChild(p);

            // Message
            p = document.createElement("p");
            label = document.createElement("label");
            label.innerHTML = "Invitation Message";
            if (saved !== null) {
                text.value = saved.message;
            }
            text.onblur = blur;
            label.appendChild(text);
            p.appendChild(label);
            section.appendChild(p);
            inviteElement.appendChild(section);
            inviteElement.setAttribute("class", "inviteUser");
            return inviteElement;
        }
    },

    events: {

        /* Handler for declining an invitation request */
        decline: function browser_content_invite_decline(event:MouseEvent):void {
            const element:Element = event.target as Element,
                boxLocal:Element = element.getAncestor("box", "class"),
                inviteBody:Element = boxLocal.getElementsByClassName("agentInvitation")[0],
                invitation:service_invite = JSON.parse(inviteBody.getAttribute("data-invitation"));
            invitation.status = "declined";
            network.send(invitation, "invite");
            modal.events.close(event);
        },
    
        /* Basic form validation on the port field */
        portValidation: function browser_content_invite_portValidation(event:Event):void {
            const portElement:HTMLInputElement = event.target as HTMLInputElement,
                keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                portParent:Element = portElement.parentNode as Element,
                element:HTMLInputElement = (portParent.innerHTML.indexOf("Port") === 0)
                    ? portElement
                    : (function browser_content_invite_portValidation_findElement():HTMLInputElement {
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
    
        /* Send the invite request to the network */
        request: function browser_content_invite_request(event:Event, options:config_modal):void {
            let type:agentType,
                ip:string,
                port:string,
                portNumber:number;
            const element:Element = event.target as Element,
                box:Element = element.getAncestor("box", "class"),
                input:HTMLElement = (function browser_content_invite_request():HTMLElement {
    
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
                content:HTMLElement = body.getElementsByClassName("inviteUser")[0] as HTMLElement,
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
                            http: Number(port),
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
    
        /* Switch text messaging in the invitation request modal when the user clicks on the type radio buttons */
        typeToggle: function browser_content_invite_typeToggle(event:Event):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                parent:Element = element.parentNode.parentNode as Element,
                grandParent:Element = parent.parentNode as Element,
                warning:Element = grandParent.getElementsByClassName("inviteWarning")[0],
                description:HTMLElement = grandParent.getElementsByClassName("type-description")[0] as HTMLElement;
            if (warning !== undefined) {
                grandParent.removeChild(warning);
                parent.removeAttribute("class");
            }
            if (element.value === "device") {
                description.innerHTML = "Including a personal device will provide unrestricted access to and from that device. This username will be imposed upon that device";
            } else {
                description.innerHTML = "Including a user allows sharing with a different person and the devices they make available.";
            }
            description.style.display = "block";
            configuration.tools.radio(element);
        }
    },

    tools: {

        /* Accept an invitation, handler on a modal's confirm button*/
        accept: function browser_content_invite_accept(box:Element):void {
            const div:Element = box.getElementsByClassName("agentInvitation")[0],
                invitation:service_invite = JSON.parse(div.getAttribute("data-invitation"));
            invitation.action = "invite-response";
            invitation.message = `Invite accepted: ${common.dateFormat(new Date())}`;
            invitation.status = "accepted";
            // this shares definition is what's written to settings when the remote agent accepts an invitation
            network.send(invitation, "invite");
        },
    
        /* Handles final status of an invitation response */
        complete: function browser_content_invite_complete(invitation:service_invite):void {
            const modal:Element = document.getElementById(invitation.agentRequest.modal);
            if (modal !== null) {
                const error:Element = modal.getElementsByClassName("error")[0],
                    delay:HTMLElement = modal.getElementsByClassName("delay")[0] as HTMLElement,
                    footer:HTMLElement = modal.getElementsByClassName("footer")[0] as HTMLElement,
                    inviteUser:HTMLElement = modal.getElementsByClassName("inviteUser")[0] as HTMLElement,
                    prepOutput = function browser_content_invite_complete_prepOutput(output:Element):void {
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
                inviteUser.style.display = "block";
                if (error === null || error === undefined) {
                    const p:Element = document.createElement("p");
                    prepOutput(p);
                    modal.getElementsByClassName("inviteUser")[0].appendChild(p);
                } else {
                    prepOutput(error);
                }
            }
        },

        /* Receive an invitation from another user */
        receive: function browser_content_invite_receive(invitation:service_invite):void {
            const agentInvite:agentInvite = invitation.agentRequest,
                name:string = (invitation.type === "device")
                    ? agentInvite.nameDevice
                    : agentInvite.nameUser,
                content:Element = invite.content.remote(invitation, name),
                modals:string[] = Object.keys(browser.data.modals),
                length:number = modals.length,
                payloadModal:config_modal = {
                    agent: browser.data.hashDevice,
                    agentType: "device",
                    content: content,
                    height: 300,
                    inputs: ["cancel", "confirm", "close"],
                    read_only: false,
                    share: browser.data.hashDevice,
                    title: (invitation.type === "device")
                        ? `Invitation from ${agentInvite.nameDevice}`
                        : `Invitation from ${agentInvite.nameUser}`,
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
        transmissionReceipt: function browser_content_invite_transmissionReceipt(socketData:socketData):void {
            const invitation:service_invite = socketData.data as service_invite;
            if (invitation.action === "invite-complete") {
                invite.tools.complete(invitation);
            } else {
                invite.tools.receive(invitation);
            }
        }
    }
};

export default invite;