
import browser from "./browser.js";
import modal from "./modal.js";
import network from "./network.js";
import share from "./share.js";
import util from "./util.js";

const invite:module_invite = {};

/* Accept an invitation, handler on a modal's confirm button*/
invite.accept = function local_invite_accept(box:HTMLElement):void {
    let user:string = "";
    const para:HTMLCollectionOf<HTMLElement> = box.getElementsByClassName("body")[0].getElementsByTagName("p"),
        dataString:string = para[para.length - 1].innerHTML,
        invite:invite = JSON.parse(dataString);
    network.inviteAccept({
        action: "invite-response",
        deviceKey: "",
        deviceName: "",
        ip: invite.ip,
        message: `Invite accepted: ${util.dateFormat(new Date())}`,
        name: browser.data.name,
        modal: invite.modal,
        port: invite.port,
        shares: browser.users.localhost.shares,
        status: "accepted",
        type: invite.type,
        userHash: "",
        userName: ""
    });
    if (invite.ip.indexOf(":") < 0) {
        user = `${invite.name}@${invite.ip}:${invite.port}`;
    } else {
        user = `${invite.name}@[${invite.ip}]:${invite.port}`;
    }
    browser.users[user] = {
        color: ["", ""],
        shares: invite.shares
    };
    share.addUser(user);
};

/* Handler for declining an invitation request */
invite.decline = function local_invite_decline(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        boxLocal:HTMLElement = util.getAncestor(element, "box", "class"),
        para:HTMLCollectionOf<HTMLElement> = boxLocal.getElementsByClassName("body")[0].getElementsByTagName("p"),
        dataString:string = para[para.length - 1].innerHTML,
        invite:invite = JSON.parse(dataString);
    network.inviteAccept({
        action: "invite-response",
        deviceKey: "",
        deviceName: "",
        message: `Invite declined: ${util.dateFormat(new Date())}`,
        name: browser.data.name,
        ip: invite.ip,
        modal: invite.modal,
        port: invite.port,
        shares: browser.users.localhost.shares,
        status: "declined",
        type: invite.type,
        userHash: "",
        userName: ""
    });
    modal.close(event);  
};

/* Basic form validation on the port field */
invite.portValidation = function local_invite_port(event:KeyboardEvent):void {
    const portElement:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        portParent:HTMLElement = <HTMLElement>portElement.parentNode,
        element:HTMLInputElement = (portParent.innerHTML.indexOf("Port") === 0)
            ? portElement
            : (function local_invite_port_finder():HTMLInputElement {
                let body:HTMLElement = util.getAncestor(portParent, "body", "class"),
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
        parent:HTMLElement = <HTMLElement>element.parentNode,
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
invite.request = function local_invite_request(options:ui_modal):void {
    let type:inviteType,
        ip:string,
        port:string,
        portNumber:number;
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        box:HTMLElement = util.getAncestor(element, "box", "class"),
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
                parentNode:HTMLElement;
            do {
                parentNode = <HTMLElement>inputs[a].parentNode;
                if (inputs[a].value === "device" || inputs[a].value === "user") {
                    if (inputs[a].value === "device") {
                        indexes.type = a;
                    }
                    if (inputs[a].checked === true) {
                        type = <inviteType>inputs[a].value;
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
        body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
        content:HTMLElement = <HTMLElement>body.getElementsByClassName("inviteUser")[0],
        footer:HTMLElement = <HTMLElement>box.getElementsByClassName("footer")[0],
        inviteData:invite = {
            action: "invite",
            deviceKey: "",
            deviceName: "",
            ip: ip,
            message: box.getElementsByTagName("textarea")[0].value,
            modal: options.id,
            name: browser.data.name,
            port: portNumber,
            shares: browser.users.localhost.shares,
            status: "invited",
            type: type,
            userHash: "",
            userName: ""
        };
    options.text_value = `{"type":"${type}","ip":"${ip}","port":"${port}","message":"${box.getElementsByTagName("textarea")[0].value.replace(/"/g, "\\\"")}"}`;
    network.storage("settings");
    if (input !== null) {
        input.focus();
        return;
    }
    content.style.display = "none";
    footer.style.display = "none";
    if (content.getElementsByClassName("error").length > 0) {
        content.removeChild(content.getElementsByClassName("error")[0]);
    }
    body.appendChild(util.delay());
    network.inviteRequest(inviteData);
};

/* Receive an invitation from another user */
invite.respond = function local_invite_respond(message:string):void {
    const invite:invite = JSON.parse(message);
    if (invite.status === "invited") {
        const div:HTMLElement = document.createElement("div"),
            modals:string[] = Object.keys(browser.data.modals),
            length:number = modals.length;
        let text:HTMLElement = document.createElement("h3"),
            label:HTMLElement = document.createElement("label"),
            textarea:HTMLTextAreaElement = document.createElement("textarea"),
            a:number = 0;
        do {
            if (browser.data.modals[modals[a]].type === "invite-accept" && browser.data.modals[modals[a]].title === `Invitation from ${invite.name}`) {
                // there should only be one invitation at a time from a given user otherwise there is spam
                return;
            }
            a = a + 1;
        } while (a < length);
        div.setAttribute("class", "userInvitation");
        if (invite.ip.indexOf(":") < 0) {
            text.innerHTML = `User <strong>${invite.name}</strong> from ${invite.ip}:${invite.port} is inviting you to share spaces.`;
        } else {
            text.innerHTML = `User <strong>${invite.name}</strong> from [${invite.ip}]:${invite.port} is inviting you to share spaces.`;
        }
        div.appendChild(text);
        text = document.createElement("p");
        label.innerHTML = `${invite.name} said:`;
        textarea.value = invite.message;
        label.appendChild(textarea);
        text.appendChild(label);
        div.appendChild(text);
        text = document.createElement("p");
        text.innerHTML = `Press the <em>Confirm</em> button to accept the invitation or close this modal to ignore it.`;
        div.appendChild(text);
        text = document.createElement("p");
        text.innerHTML = message;
        text.style.display = "none";
        div.appendChild(text);
        modal.create({
            agent: "localhost",
            content: div,
            height: 300,
            inputs: ["cancel", "confirm", "close"],
            read_only: false,
            title: `Invitation from ${invite.name}`,
            type: "invite-accept",
            width: 500
        });
        util.audio("invite");
    } else {
        let user:string = "";
        const modal:HTMLElement = document.getElementById(invite.modal);
        if (modal === null) {
            if (invite.status === "accepted") {
                if (invite.ip.indexOf(":") < 0) {
                    user = `${invite.name}@${invite.ip}:${invite.port}`;
                } else {
                    user = `${invite.name}@[${invite.ip}]:${invite.port}`;
                }
                browser.users[user] = {
                    color:["", ""],
                    shares: invite.shares
                }
                share.addUser(user);
            }
        } else {
            const error:HTMLElement = <HTMLElement>modal.getElementsByClassName("error")[0],
                delay:HTMLElement = <HTMLElement>modal.getElementsByClassName("delay")[0],
                footer:HTMLElement = <HTMLElement>modal.getElementsByClassName("footer")[0],
                inviteUser:HTMLElement = <HTMLElement>modal.getElementsByClassName("inviteUser")[0],
                prepOutput = function local_invite_respond_prepOutput(output:HTMLElement):void {
                    if (invite.status === "accepted") {
                        output.innerHTML = "Invitation accepted!";
                        output.setAttribute("class", "accepted");
                        if (invite.ip.indexOf(":") < 0) {
                            user = `${invite.name}@${invite.ip}:${invite.port}`;
                        } else {
                            user = `${invite.name}@[${invite.ip}]:${invite.port}`;
                        }
                        browser.users[user] = {
                            color:["", ""],
                            shares: invite.shares
                        }
                        util.audio("invite");
                        share.addUser(user);
                    } else {
                        output.innerHTML = "Invitation declined. :(";
                        output.setAttribute("class", "error");
                    }
                };
            footer.style.display = "none";
            delay.style.display = "none";
            inviteUser.style.display = "block";
            if (error === null || error === undefined) {
                const p:HTMLElement = document.createElement("p");
                prepOutput(p);
                modal.getElementsByClassName("inviteUser")[0].appendChild(p);
            } else {
                prepOutput(error);
            }
        }
    }
};

/* Invite users to your shared space */
invite.start = function local_invite_start(event:MouseEvent, settings?:ui_modal):void {
    const inviteElement:HTMLElement = document.createElement("div"),
        separator:string = "|spaces|",
        random:string = Math.random().toString(),
        blur = function local_invite_start_blur(event:FocusEvent):void {
            const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                box:HTMLElement = util.getAncestor(element, "box", "class"),
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
    let p:HTMLElement = document.createElement("p"),
        label:HTMLElement = document.createElement("label"),
        input:HTMLInputElement = document.createElement("input"),
        text:HTMLTextAreaElement = document.createElement("textarea"),
        h3:HTMLElement = document.createElement("h3"),
        section:HTMLElement = document.createElement("div");

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
        modal.create({
            agent: "localhost",
            content: inviteElement,
            height: 550,
            inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
            read_only: false,
            title: document.getElementById("user-invite").innerHTML,
            type: "invite-request"
        });
    } else {
        settings.content = inviteElement;
        modal.create(settings);
    }
};

invite.typeToggle = function local_invite_typeToggle(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        description:HTMLElement = <HTMLElement>element.parentNode.parentNode.parentNode.lastChild;
    if (element.value === "device") {
        description.innerHTML = "Including a personal device will provide unrestricted access to that device and impose the user keys and user name of this user account upon that device.";
    } else {
        description.innerHTML = "Including a user allows sharing with a different person and the devices they make available.";
    }
    description.style.display = "block";
};

export default invite;