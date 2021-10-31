
/* lib/browser/invite - A collection of utilities for processing invitation related tasks. */
import browser from "./browser.js";
import configuration from "./configuration.js";
import modal from "./modal.js";
import network from "./network.js";
import share from "./share.js";
import util from "./util.js";

import common from "../common/common.js";

const invite:module_invite = {

    /* Accept an invitation, handler on a modal's confirm button*/
    accept: function browser_invite_accept(box:Element):void {
        const div:Element = box.getElementsByClassName("agentInvitation")[0],
            invitation:invite = JSON.parse(div.getAttribute("data-invitation")),
            payload:invite = invite.payload({
                action: "invite-response",
                ipAll: invitation.ipAll,
                ipSelected: invitation.ipSelected,
                message: `Invite accepted: ${util.dateFormat(new Date())}`,
                modal: invitation.modal,
                ports: invitation.ports,
                status: "accepted",
                type: invitation.type
            });
        payload.deviceHash = invitation.deviceHash;
        payload.deviceName = invitation.deviceName;
        payload.userHash = invitation.userHash;
        payload.userName = invitation.userName;
        invite.addAgents(invitation);
        // this shares definition is what's written to settings when the remote agent accepts an invitation
        payload.shares = invitation.shares;
        network.inviteAccept(payload);
    },

    /* A wrapper around share.addAgents for converting devices type into device type */
    addAgents: function browser_invite_addAgents(invitation:invite):void {
        const keyShares:string[] = Object.keys(invitation.shares);
        if (invitation.type === "device") {
            let a:number = keyShares.length;
            do {
                a = a - 1;
                if (browser.device[keyShares[a]] === undefined) {
                    browser.device[keyShares[a]] = invitation.shares[keyShares[a]];
                    share.addAgent({
                        hash: keyShares[a],
                        name: invitation.shares[keyShares[a]].name,
                        save: false,
                        type: "device"
                    });
                }
            } while (a > 0);
            browser.data.nameUser = invitation.userName;
            browser.data.hashUser = invitation.userHash;
            network.settings("configuration", null);
        } else if (invitation.type === "user") {
            browser.user[keyShares[0]] = {
                deviceData: null,
                ipAll: invitation.ipAll,
                ipSelected: invitation.ipSelected,
                name: invitation.userName,
                ports: invitation.ports,
                shares: invitation.shares[keyShares[0]].shares,
                status: "offline"
            };
            share.addAgent({
                hash: keyShares[0],
                name: invitation.userName,
                save: false,
                type: "user"
            });
        }
    },

    /* Handles final status of an invitation response */
    complete: function browser_invite_complete(invitation:invite):void {
        const modal:Element = document.getElementById(invitation.modal);
        if (modal === null) {
            invite.addAgents(invitation);
        } else {
            const error:Element = modal.getElementsByClassName("error")[0],
                delay:HTMLElement = modal.getElementsByClassName("delay")[0] as HTMLElement,
                footer:HTMLElement = modal.getElementsByClassName("footer")[0] as HTMLElement,
                inviteUser:HTMLElement = modal.getElementsByClassName("inviteUser")[0] as HTMLElement,
                prepOutput = function browser_invite_respond_prepOutput(output:Element):void {
                    if (invitation.status === "accepted") {
                        output.innerHTML = "Invitation accepted!";
                        output.setAttribute("class", "accepted");
                        invite.addAgents(invitation);
                        util.audio("invite");
                    } else {
                        output.innerHTML = "Invitation declined. :(";
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

    /* Handler for declining an invitation request */
    decline: function browser_invite_decline(event:MouseEvent):void {
        const element:Element = event.target as Element,
            boxLocal:Element = element.getAncestor("box", "class"),
            inviteBody:Element = boxLocal.getElementsByClassName("agentInvitation")[0],
            invitation:invite = JSON.parse(inviteBody.getAttribute("data-invitation"));
        network.inviteAccept(invite.payload({
            action: "invite-response",
            ipAll: invitation.ipAll,
            ipSelected: invitation.ipSelected,
            message: `Invite declined: ${util.dateFormat(new Date())}`,
            modal: invitation.modal,
            ports: invitation.ports,
            status: "declined",
            type: invitation.type
        }));
        modal.close(event);  
    },

    /* Prepare the big invitation payload object from a reduced set of data */
    payload: function browser_invite_payload(config:invitePayload):invite {
        return {
            action: config.action,
            deviceHash: (config.type === "user")
                ? ""
                : browser.data.hashDevice,
            deviceName: (config.type === "user")
                ? ""
                : browser.data.nameDevice,
            ipAll: config.ipAll,
            ipSelected: config.ipSelected,
            message: config.message,
            modal: config.modal,
            ports: config.ports,
            shares: {},
            status: config.status,
            type: config.type,
            userHash: browser.data.hashUser,
            userName: browser.data.nameUser
        };
    },

    /* Basic form validation on the port field */
    portValidation: function browser_invite_port(event:Event):void {
        const portElement:HTMLInputElement = event.target as HTMLInputElement,
            keyboardEvent:KeyboardEvent = event as KeyboardEvent,
            portParent:Element = portElement.parentNode as Element,
            element:HTMLInputElement = (portParent.innerHTML.indexOf("Port") === 0)
                ? portElement
                : (function browser_invite_port_finder():HTMLInputElement {
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
    request: function browser_invite_request(event:Event, options:modal):void {
        let type:agentType,
            ip:string,
            port:string,
            portNumber:number;
        const element:Element = event.target as Element,
            box:Element = element.getAncestor("box", "class"),
            input:HTMLElement = (function browser_invite_request():HTMLElement {

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
            body:Element = box.getElementsByClassName("body")[0],
            content:HTMLElement = body.getElementsByClassName("inviteUser")[0] as HTMLElement,
            footer:HTMLElement = box.getElementsByClassName("footer")[0] as HTMLElement,
            saved:inviteSaved = {
                ip: ip,
                message: box.getElementsByTagName("textarea")[0].value.replace(/"/g, "\\\""),
                port: port,
                type: type
            };
        options.text_value = JSON.stringify(saved);
        network.settings("configuration", null);
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
        network.inviteRequest(invite.payload({
            action: "invite-start",
            ipAll: {
                IPv4: [],
                IPv6: []
            },
            ipSelected: ip,
            message: box.getElementsByTagName("textarea")[0].value,
            modal: options.id,
            ports: {
                http: portNumber,
                ws: 0
            },
            status: "invited",
            type: type
        }));
    },

    /* Receive an invitation from another user */
    respond: function browser_invite_respond(invitation:invite):void {
        const div:Element = document.createElement("div"),
            modals:string[] = Object.keys(browser.data.modals),
            length:number = modals.length,
            payloadModal:modal = {
                agent: browser.data.hashDevice,
                agentType: "device",
                content: div,
                height: 300,
                inputs: ["cancel", "confirm", "close"],
                read_only: false,
                share: browser.data.hashDevice,
                title: (invitation.type === "device")
                    ? `Invitation from ${invitation.deviceName}`
                    : `Invitation from ${invitation.userName}`,
                type: "invite-accept",
                width: 500
            },
            ip:string = (invitation.ipSelected.indexOf(":") < 0)
                ? `${invitation.ipSelected}:${invitation.ports.http}`
                : `[${invitation.ipSelected}]:${invitation.ports.http}`,
            name:string = (invitation.type === "device")
                ? invitation.deviceName
                : invitation.userName;
        let text:HTMLElement = document.createElement("h3"),
            label:Element = document.createElement("label"),
            textarea:HTMLTextAreaElement = document.createElement("textarea"),
            a:number = 0;
        do {
            if (browser.data.modals[modals[a]].type === "invite-accept" && browser.data.modals[modals[a]].title === `Invitation from ${name}`) {
                // there should only be one invitation at a time from a given user otherwise there is spam
                return;
            }
            a = a + 1;
        } while (a < length);
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
        div.setAttribute("data-invitation", JSON.stringify(invitation));
        modal.create(payloadModal);
        util.audio("invite");
    },

    /* Invite users to your shared space */
    start: function browser_invite_start(event:Event, settings?:modal):void {
        const inviteElement:Element = document.createElement("div"),
            separator:string = "|spaces|",
            keyboardEvent:KeyboardEvent = event as KeyboardEvent,
            random:string = Math.random().toString(),
            blur = function browser_invite_start_blur(event:FocusEvent):void {
                const element:Element = event.target as Element,
                    box:Element = element.getAncestor("box", "class"),
                    id:string = box.getAttribute("id"),
                    inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
                    textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
                invite.portValidation(keyboardEvent);
                browser.data.modals[id].text_value = inputs[0].value + separator + inputs[1].value + separator + textArea.value;
                network.settings("configuration", null);
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
        input.onclick = invite.typeToggle;
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
        input.onclick = invite.typeToggle;
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
        input.onkeyup = invite.portValidation;
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
        if (settings === undefined) {
            const payload:modal = {
                agent: browser.data.hashDevice,
                agentType: "device",
                content: inviteElement,
                height: 650,
                inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
                read_only: false,
                title: document.getElementById("agent-invite").innerHTML,
                type: "invite-request"
            };
            modal.create(payload);
        } else {
            settings.content = inviteElement;
            modal.create(settings);
        }
        document.getElementById("menu").style.display = "none";
    },

    /* Switch text messaging in the invitation request modal when the user clicks on the type radio buttons */
    typeToggle: function browser_invite_typeToggle(event:Event):void {
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
        configuration.radio(element);
    }

};

export default invite;