
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
        message: `Invite accepted: ${util.dateFormat(new Date())}`,
        name: browser.data.name,
        ip: invite.ip,
        modal: invite.modal,
        port: invite.port,
        shares: browser.users.localhost.shares,
        status: "accepted"
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
        boxLocal:HTMLElement = (function local_invite_decline_action_box():HTMLElement {
            let el:HTMLElement = element;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "box");
            return el;
        }()),
        para:HTMLCollectionOf<HTMLElement> = boxLocal.getElementsByClassName("body")[0].getElementsByTagName("p"),
        dataString:string = para[para.length - 1].innerHTML,
        invite:invite = JSON.parse(dataString);
    network.inviteAccept({
        action: "invite-response",
        message: `Invite declined: ${util.dateFormat(new Date())}`,
        name: browser.data.name,
        ip: invite.ip,
        modal: invite.modal,
        port: invite.port,
        shares: browser.users.localhost.shares,
        status: "declined"
    });
    modal.close(event);  
};

/* Basic form validation on the port field */
invite.port = function local_invite_port(event:KeyboardEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        value:string = element.value.replace(/\s+/g, ""),
        numb:number = Number(value);
    if (event.type === "blur" || (event.type === "keyup" && event.keyCode === 13)) {
        if (value !== "" && (isNaN(numb) === true || numb < 1024 || numb > 65535)) {
            element.style.color = "#f00";
            element.style.borderColor = "#f00";
            element.focus();
        } else {
            element.removeAttribute("style");
        }
    }
};

/* Send the invite request to the network */
invite.request = function local_invite_request(options:ui_modal):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        box:HTMLElement = (function local_modal_confirm_box():HTMLElement {
            let bx:HTMLElement = element;
            do {
                bx = <HTMLElement>bx.parentNode;
            } while (bx !== document.documentElement && bx.getAttribute("class") !== "box");
            return bx;
        }()),
        inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
        body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
        content:HTMLElement = <HTMLElement>body.getElementsByClassName("inviteUser")[0],
        footer:HTMLElement = <HTMLElement>box.getElementsByClassName("footer")[0],
        port:number = (function local_modal_confirm_port():number {
            const numb:number = Number(inputs[1].value);
            if (inputs[1].value.replace(/^\s+$/, "") === "" || isNaN(numb) === true || numb < 0 || numb > 65535) {
                return 80;
            }
            return numb;
        }()),
        inviteData:invite = {
            action: "invite",
            ip: inputs[0].value,
            port: port,
            message: box.getElementsByTagName("textarea")[0].value,
            modal: options.id,
            name: browser.data.name,
            shares: browser.users.localhost.shares,
            status: "invited"
        };
    if (inviteData.ip.replace(/\s+/, "") === "" || ((/(\d{1,3}\.){3}\d{1,3}/).test(inviteData.ip) === false && (/([a-f0-9]{4}:)+/).test(inviteData.ip) === false)) {
        inputs[0].focus();
        return;
    }
    content.style.display = "none";
    footer.style.display = "none";
    if (content.getElementsByClassName("error").length > 0) {
        content.removeChild(content.getElementsByClassName("error")[0]);
    }
    body.appendChild(util.delay());
    options.text_value = `${inputs[0].value}|spaces|${inputs[1].value}|spaces|${box.getElementsByTagName("textarea")[0].value}`;
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
invite.start = function local_invite_start(event:MouseEvent, textInput?:string, settings?:ui_modal):void {
    const inviteElement:HTMLElement = document.createElement("div"),
        separator:string = "|spaces|",
        blur = function local_invite_start_blur(event:FocusEvent):void {
            const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                box:HTMLElement = (function local_invite_start_blur_box():HTMLElement {
                    let item:HTMLElement = element;
                    do {
                        item = <HTMLElement>item.parentNode;
                    } while (item !== document.documentElement && item.getAttribute("class") !== "box");
                    return item;
                }()),
                id:string = box.getAttribute("id"),
                inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
                textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
            invite.port(event);
            browser.data.modals[id].text_value = inputs[0].value + separator + inputs[1].value + separator + textArea.value;
            network.storage("settings");
        };
    let p:HTMLElement = document.createElement("p"),
        label:HTMLElement = document.createElement("label"),
        input:HTMLInputElement = document.createElement("input"),
        text:HTMLTextAreaElement = document.createElement("textarea"),
        textStorage:string,
        values:string[] = [];
    if (settings !== undefined && typeof settings.text_value === "string" && settings.text_value !== "") {
        textStorage = settings.text_value;
        values.push(textStorage.slice(0, textStorage.indexOf(separator)));
        textStorage = textStorage.slice(textStorage.indexOf(separator) + separator.length);
        values.push(textStorage.slice(0, textStorage.indexOf(separator)));
        textStorage = textStorage.slice(textStorage.indexOf(separator) + separator.length);
        values.push(textStorage);
    }
    label.innerHTML = "IP Address";
    input.setAttribute("type", "text");
    if (values.length > 0) {
        input.value = values[0];
    }
    input.onblur = blur;
    label.appendChild(input);
    p.appendChild(label);
    inviteElement.appendChild(p);
    p = document.createElement("p");
    label = document.createElement("label");
    input = document.createElement("input");
    label.innerHTML = "Port";
    input.setAttribute("type", "text");
    input.placeholder = "Number 1024-65535";
    input.onkeyup = invite.port;
    if (values.length > 0) {
        input.value = values[1];
    }
    input.onblur = blur;
    label.appendChild(input);
    p.appendChild(label);
    inviteElement.appendChild(p);
    p = document.createElement("p");
    label = document.createElement("label");
    label.innerHTML = "Invitation Message";
    if (values.length > 0) {
        text.value = values[2];
    }
    text.onblur = blur;
    label.appendChild(text);
    p.appendChild(label);
    inviteElement.appendChild(p);
    inviteElement.setAttribute("class", "inviteUser");
    if (settings === undefined) {
        modal.create({
            agent: "localhost",
            content: inviteElement,
            inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
            read_only: false,
            title: "<span class=\"icon-invite\">❤</span> Invite User",
            type: "invite-request"
        });
    } else {
        settings.content = inviteElement;
        modal.create(settings);
    }
};

export default invite;