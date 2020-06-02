
/* lib/browser/invite - A collection of utilities for processing invitation related tasks. */
import browser from "./browser.js";
import modal from "./modal.js";
import network from "./network.js";
import settings from "./settings.js";
import share from "./share.js";
import util from "./util.js";

import deviceShare from "../common/deviceShare.js";

const invite:module_invite = {};

/* Accept an invitation, handler on a modal's confirm button*/
invite.accept = function local_invite_accept(box:Element):void {
    const para:HTMLCollectionOf<HTMLElement> = box.getElementsByClassName("body")[0].getElementsByTagName("p"),
        dataString:string = para[para.length - 1].innerHTML,
        invitation:invite = JSON.parse(dataString).invite,
        payload:invite = invite.payload({
            action: "invite-response",
            ip: invitation.ip,
            message: `Invite accepted: ${util.dateFormat(new Date())}`,
            modal: invitation.modal,
            port: invitation.port,
            status: "accepted",
            type: invitation.type
        });
    payload.deviceHash = invitation.deviceHash;
    payload.userHash = invitation.userHash;
    invite.addAgents(invitation);
    network.inviteAccept(payload);
};

/* A wrapper around share.addAgents for converting devices type into device type */
invite.addAgents = function local_invite_addAgents(invitation:invite):void {
    const shareKeys:string[] = Object.keys(invitation.shares);
    if (invitation.type === "device") {
        const length:number = 0;
        let a:number = 0;
        do {
            if (browser.device[shareKeys[a]] === undefined) {
                browser.device[shareKeys[a]] = invitation.shares[shareKeys[a]];
                share.addAgent({
                    hash: shareKeys[a],
                    name: invitation.userName,
                    save: false,
                    type: "device"
                });
                browser.data.colors.user[shareKeys[a]] = settings.colorScheme[browser.data.color];
            }
            a = a + 1;
        } while (a < length);
        browser.data.nameUser = invitation.userName;
    } else if (invitation.type === "user") {
        browser.user[invitation.userHash] = {
            ip: invitation.ip,
            name: invitation.userName,
            port: invitation.port,
            shares: invitation.shares[shareKeys[0]].shares
        };
        share.addAgent({
            hash: shareKeys[0],
            name: invitation.name,
            save: false,
            type: "user"
        });
        browser.data.colors.user[shareKeys[0]] = settings.colorScheme[browser.data.color];
    }
    network.storage(invitation.type);
};

/* Handles final status of an invitation response */
invite.complete = function local_invite_complete(invitation:invite):void {
    const hash:string = invitation[`${invitation.type}Hash`],
        modal:Element = document.getElementById(invitation.modal);
    if (modal === null) {
        invite.addAgents(invitation);
    } else {
        const error:Element = modal.getElementsByClassName("error")[0],
            delay:HTMLElement = <HTMLElement>modal.getElementsByClassName("delay")[0],
            footer:HTMLElement = <HTMLElement>modal.getElementsByClassName("footer")[0],
            inviteUser:HTMLElement = <HTMLElement>modal.getElementsByClassName("inviteUser")[0],
            prepOutput = function local_invite_respond_prepOutput(output:Element):void {
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
        delay.style.display = "none";
        inviteUser.style.display = "block";
        if (error === null || error === undefined) {
            const p:Element = document.createElement("p");
            prepOutput(p);
            modal.getElementsByClassName("inviteUser")[0].appendChild(p);
        } else {
            prepOutput(error);
        }
    }
};

/* Handler for declining an invitation request */
invite.decline = function local_invite_decline(event:MouseEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        boxLocal:Element = element.getAncestor("box", "class"),
        para:HTMLCollectionOf<HTMLElement> = boxLocal.getElementsByClassName("body")[0].getElementsByTagName("p"),
        dataString:string = para[para.length - 1].innerHTML,
        invitation:invite = JSON.parse(dataString).invite;
    network.inviteAccept(invite.payload({
        action: "invite-response",
        ip: invitation.ip,
        message: `Invite declined: ${util.dateFormat(new Date())}`,
        modal: invitation.modal,
        port: invitation.port,
        status: "declined",
        type: invitation.type
    }));
    modal.close(event);  
};

/* Prepare the big invitation payload object from a reduced set of data */
invite.payload = function local_invite_payload(config:invitePayload):invite {
    return {
        action: config.action,
        deviceHash: browser.data.hashDevice,
        deviceName: browser.data.nameDevice,
        ip: config.ip,
        message: config.message,
        name: (config.type === "user")
            ? browser.data.nameUser
            : browser.data.nameDevice,
        modal: config.modal,
        port: config.port,
        shares: {},
        status: config.status,
        type: config.type,
        userHash: "",
        userName: ""
    };
};

/* Basic form validation on the port field */
invite.portValidation = function local_invite_port(event:KeyboardEvent):void {
    const portElement:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        portParent:Element = <Element>portElement.parentNode,
        element:HTMLInputElement = (portParent.innerHTML.indexOf("Port") === 0)
            ? portElement
            : (function local_invite_port_finder():HTMLInputElement {
                let body:Element = portParent.getAncestor("body", "class"),
                    a:number = 0;
                const inputs:HTMLCollectionOf<HTMLInputElement> = body.getElementsByTagName("input"),
                    length:number = inputs.length;
                do {
                    if (inputs[a].getAttribute("placeholder") === "Number 1024-65535") {
                        return inputs[a];
                    }
                    a = a + 1;
                } while (a < length);
            }()),
        parent:Element = <Element>element.parentNode,
        value:string = element.value.replace(/\s+/g, ""),
        numb:number = Number(value);
    if (event.type === "blur" || (event.type === "keyup" && event.keyCode === 13)) {
        if (value !== "" && (isNaN(numb) === true || numb < 1024 || numb > 65535)) {
            element.style.color = "#f00";
            element.style.borderColor = "#f00";
            parent.firstChild.textContent = "Error: Port must be a number from 1024-65535 or empty.";
            element.focus();
        } else {
            parent.firstChild.textContent = "Port";
            element.removeAttribute("style");
        }
    }
};

/* Send the invite request to the network */
invite.request = function local_invite_request(event:MouseEvent, options:ui_modal):void {
    let type:agentType,
        ip:string,
        port:string,
        portNumber:number;
    const element:Element = <Element>event.srcElement || <Element>event.target,
        box:Element = element.getAncestor("box", "class"),
        input:HTMLElement = (function local_invite_request():HTMLElement {

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
                parentNode = <Element>inputs[a].parentNode;
                if (inputs[a].value === "device" || inputs[a].value === "user") {
                    if (inputs[a].value === "device") {
                        indexes.type = a;
                    }
                    if (inputs[a].checked === true) {
                        type = <agentType>inputs[a].value;
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
                portNumber = 80;
            } else {
                portNumber = Number(port);
                if (isNaN(portNumber) === true || portNumber < 0 || portNumber > 65535) {
                    return inputs[indexes.port];
                }
            }
            return null;
        }()),
        body:Element = box.getElementsByClassName("body")[0],
        content:HTMLElement = <HTMLElement>body.getElementsByClassName("inviteUser")[0],
        footer:HTMLElement = <HTMLElement>box.getElementsByClassName("footer")[0],
        saved:inviteSaved = {
            ip: ip,
            message: box.getElementsByTagName("textarea")[0].value.replace(/"/g, "\\\""),
            port: port,
            type: type
        };
    options.text_value = JSON.stringify(saved);
    network.storage("settings");
    if (input !== null) {
        const p:Element = <Element>input.parentNode.parentNode,
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
        action: "invite",
        ip: ip,
        message: box.getElementsByTagName("textarea")[0].value,
        modal: options.id,
        port: portNumber,
        status: "invited",
        type: type
    }));
};

/* Receive an invitation from another user */
invite.respond = function local_invite_respond(invitation:invite):void {
    if (invitation.status === "invited") {
        const div:Element = document.createElement("div"),
            modals:string[] = Object.keys(browser.data.modals),
            length:number = modals.length,
            payloadModal:ui_modal = {
                agent: browser.data.hashDevice,
                agentType: "device",
                content: div,
                height: 300,
                inputs: ["cancel", "confirm", "close"],
                read_only: false,
                title: `Invitation from ${invitation.name}`,
                type: "invite-accept",
                width: 500
            },
            ip:string = (invitation.ip.indexOf(":") < 0)
                ? `${invitation.ip}:${invitation.port}`
                : `[${invitation.ip}]:${invitation.port}`;
        let text:HTMLElement = document.createElement("h3"),
            label:Element = document.createElement("label"),
            textarea:HTMLTextAreaElement = document.createElement("textarea"),
            a:number = 0;
        do {
            if (browser.data.modals[modals[a]].type === "invite-accept" && browser.data.modals[modals[a]].title === `Invitation from ${invitation.name}`) {
                // there should only be one invitation at a time from a given user otherwise there is spam
                return;
            }
            a = a + 1;
        } while (a < length);
        div.setAttribute("class", "userInvitation");
        text.innerHTML = `User <strong>${invitation.name}</strong> from ${ip} is inviting you to share spaces.`;
        div.appendChild(text);
        text = document.createElement("p");
        label.innerHTML = `${invitation.name} said:`;
        textarea.value = invitation.message;
        label.appendChild(textarea);
        text.appendChild(label);
        div.appendChild(text);
        text = document.createElement("p");
        text.innerHTML = `Press the <em>Confirm</em> button to accept the invitation or close this modal to ignore it.`;
        div.appendChild(text);
        div.appendChild(text);
        modal.create(payloadModal);
        util.audio("invite");
    } else {
        
    }
};

/* Invite users to your shared space */
invite.start = function local_invite_start(event:MouseEvent, settings?:ui_modal):void {
    const inviteElement:Element = document.createElement("div"),
        separator:string = "|spaces|",
        random:string = Math.random().toString(),
        blur = function local_invite_start_blur(event:FocusEvent):void {
            const element:Element = <Element>event.srcElement || <Element>event.target,
                box:Element = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
                textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
            invite.portValidation(event);
            browser.data.modals[id].text_value = inputs[0].value + separator + inputs[1].value + separator + textArea.value;
            network.storage("settings");
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
    input.placeholder = "Number 1024-65535";
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
        const payload:ui_modal = {
            agent: browser.data.hashDevice,
            agentType: "device",
            content: inviteElement,
            height: 650,
            inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
            read_only: false,
            title: document.getElementById("user-invite").innerHTML,
            type: "invite-request"
        };
        modal.create(payload);
    } else {
        settings.content = inviteElement;
        modal.create(settings);
    }
};

/* Switch text messaging in the invitation request modal when the user clicks on the type radio buttons */
invite.typeToggle = function local_invite_typeToggle(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        parent:Element = <Element>element.parentNode.parentNode,
        grandParent:Element = <Element>parent.parentNode,
        warning:Element = grandParent.getElementsByClassName("inviteWarning")[0],
        description:HTMLElement = <HTMLElement>grandParent.getElementsByClassName("type-description")[0];
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
};

export default invite;