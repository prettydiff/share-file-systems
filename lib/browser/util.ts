import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import modal from "./modal.js";
import network from "./network.js";
import { ChildProcess } from "child_process";

const util:module_util = {};

/* Adds users to the user bar */
util.addUser = function local_util_addUser(userName:string):void {
    const li:HTMLLIElement = document.createElement("li"),
        button:HTMLElement = document.createElement("button"),
        addStyle = function local_util_addUser_addStyle() {
            let body:string,
                heading:string;
            const prefix:string = `#spaces .box[data-agent="${userName}"]`,
                generateColor = function local_util_addUser_addStyle_generateColor():void {
                    const rand:[number, number, number] = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)],
                        code1:string[] = ["#"],
                        code2:string[] = ["#"];
                    rand.forEach(function local_util_addUser_addStyle_generateColor_each(value:number) {
                        if (value < 4) {
                            code1.push("d");
                            code2.push("c");
                        } else if (value < 7) {
                            code1.push("e");
                            code2.push("d");
                        } else {
                            code1.push("f");
                            code2.push("e");
                        }
                    });
                    body = code1.join("");
                    heading = code2.join("");
                };
            if (browser.data.users[userName].color[0] === "") {
                generateColor();
                if (body.charAt(1) === body.charAt(2) && body.charAt(2) === body.charAt(3)) {
                    do {
                        generateColor();
                    } while (body.charAt(1) === body.charAt(2) && body.charAt(2) === body.charAt(3));
                }
                browser.data.users[userName].color = [body, heading];
            } else {
                body = browser.data.users[userName].color[0];
                heading = browser.data.users[userName].color[1];
            }
            browser.style.innerHTML = `${browser.style.innerHTML + prefix} .body{background-color:${body}}${prefix} h2.heading{background-color:${heading}}#spaces #users button[data-agent="${userName}"]{background-color:${heading}}#spaces #users button[data-agent="${userName}"]:hover{background-color:${body}}`;
        };
    button.innerHTML = userName;
    if (userName.split("@")[1] === "localhost") {
        button.setAttribute("class", "active");
    } else {
        button.setAttribute("class", "offline");
        button.setAttribute("data-agent", userName);
        addStyle();
    }
    button.onclick = function local_util_addUser(event:MouseEvent) {
        modal.shares(event, button.innerHTML, null);
    };
    li.appendChild(button);
    document.getElementById("users").getElementsByTagName("ul")[0].appendChild(li);
    if (userName.indexOf("@localhost") > -1) {
        button.setAttribute("id", "localhost");
    }
};

/* Transforms numbers into a string of 3 digit comma separated groups */
util.commas = function local_util_commas(number:number):string {
    const str:string = String(number);
    let arr:string[] = [],
        a:number   = str.length;
    if (a < 4) {
        return str;
    }
    arr = String(number).split("");
    a   = arr.length;
    do {
        a      = a - 3;
        arr[a] = "," + arr[a];
    } while (a > 3);
    return arr.join("");
};

/* Converts a date object into US Army date format */
util.dateFormat = function local_util_dateFormat(date:Date):string {
    const dateData:string[] = [
            date.getFullYear().toString(),
            date.getMonth().toString(),
            date.getDate().toString(),
            date.getHours().toString(),
            date.getMinutes().toString(),
            date.getSeconds().toString(),
            date.getMilliseconds().toString()
        ],
        output:string[] = [];
    let month:string;
    if (dateData[2].length === 1) {
        dateData[2] = `0${dateData[2]}`;
    }
    if (dateData[3].length === 1) {
        dateData[3] = `0${dateData[3]}`;
    }
    if (dateData[4].length === 1) {
        dateData[4] = `0${dateData[4]}`;
    }
    if (dateData[5].length === 1) {
        dateData[5] = `0${dateData[5]}`;
    }
    if (dateData[6].length === 1) {
        dateData[6] = `00${dateData[6]}`;
    } else if (dateData[6].length === 2) {
        dateData[6] = `0${dateData[6]}`;
    }
    if (dateData[1] === "0") {
        month = "JAN";
    } else if (dateData[1] === "1") {
        month = "FEB";
    } else if (dateData[1] === "2") {
        month = "MAR";
    } else if (dateData[1] === "3") {
        month = "APR";
    } else if (dateData[1] === "4") {
        month = "MAY";
    } else if (dateData[1] === "5") {
        month = "JUN";
    } else if (dateData[1] === "6") {
        month = "JUL";
    } else if (dateData[1] === "7") {
        month = "AUG";
    } else if (dateData[1] === "8") {
        month = "SEP";
    } else if (dateData[1] === "9") {
        month = "OCT";
    } else if (dateData[1] === "10") {
        month = "NOV";
    } else if (dateData[1] === "11") {
        month = "DEC";
    }
    output.push(dateData[2]);
    output.push(month);
    output.push(`${dateData[0]},`);
    output.push(`${dateData[3]}:${dateData[4]}:${dateData[5]}.${dateData[6]}`);
    return output.join(" ");
};

/* Create a div element with a spinner and class name of 'delay' */
util.delay = function local_util_delay():HTMLElement {
    const div:HTMLElement = document.createElement("div"),
        text:HTMLElement = document.createElement("p"),
        svg:Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // cspell:disable
    svg.setAttribute("viewBox", "0 0 57 57");
    svg.innerHTML = `<g fill="none" fill-rule="evenodd"><g transform="translate(1 1)" stroke-width="2"><circle cx="5" cy="50" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" values="50;5;50;50" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" begin="0s" dur="2.2s" values="5;27;49;5" calcMode="linear" repeatCount="indefinite"/></circle><circle cx="27" cy="5" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" from="5" to="5" values="5;50;50;5" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" begin="0s" dur="2.2s" from="27" to="27" values="27;49;5;27" calcMode="linear" repeatCount="indefinite"/></circle><circle cx="49" cy="50" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" values="50;50;5;50" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" from="49" to="49" begin="0s" dur="2.2s" values="49;5;27;49" calcMode="linear" repeatCount="indefinite"/></circle></g></g>`;
    //svg.setAttribute("viewBox", "0 0 44 44");
    //svg.innerHTML = `<g fill="none" fill-rule="evenodd" stroke-width="2"><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/><animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/></circle><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/><animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/></circle></g>`;
    // cspell:enable
    text.innerHTML = "Waiting on data. Please stand by.";
    div.setAttribute("class", "delay");
    div.appendChild(svg);
    div.appendChild(text);
    return div;
};

/* Drag a selection box to capture a collection of items into a selection */
util.dragSelect = function local_util_dragSelect(event:Event, callback:Function):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        list:HTMLElement = (function local_util_dragSelect_list():HTMLElement {
            if (element.getAttribute("class") === "fileList") {
                return element;
            }
            let el:HTMLElement = element;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "fileList");
            return el;
        }()),
        body:HTMLElement = (function local_util_dragSelect_body():HTMLElement {
            let el:HTMLElement = list;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "body");
            return el;
        }()),
        box:HTMLElement = (function local_util_dragSelect_box():HTMLElement {
            let el:HTMLElement = body;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "box");
            return el;
        }()),
        boxTop:number = box.offsetTop,
        boxLeft:number = box.offsetLeft,
        bodyTop:number = body.offsetTop,
        bodyLeft:number = body.offsetLeft,
        listHeight:number = list.clientHeight,
        bodyHeight:number = body.clientHeight,
        bodyWidth:number = body.clientWidth,
        bodyScrollTop:number = body.scrollTop,
        bodyScrollLeft:number = body.scrollLeft,
        offsetLeft:number = boxLeft + bodyLeft - body.scrollLeft,
        offsetTop:number = boxTop + bodyTop - bodyScrollTop + 50,
        maxUp:number = boxTop + bodyTop + 50 - bodyScrollTop,
        maxDown:number = boxTop + bodyTop + listHeight + 50 - bodyScrollTop,
        maxLeft:number = boxLeft + bodyLeft - bodyScrollLeft,
        maxRight:number = boxLeft + bodyLeft + bodyWidth - 4,
        drag:HTMLElement = document.createElement("div"),
        touch:boolean      = (event !== null && event.type === "touchstart"),
        mouseEvent = <MouseEvent>event,
        touchEvent = <TouchEvent>event,
        mouseX = (touch === true)
            ? 0
            : mouseEvent.clientX,
        mouseY = (touch === true)
            ? 0
            : mouseEvent.clientY,
        touchX = (touch === true)
            ? touchEvent.touches[0].clientX
            : 0,
        touchY = (touch === true)
            ? touchEvent.touches[0].clientY
            : 0,   
        drop       = function local_modal_move_drop(e:Event):boolean {
            callback();
            drag.parentNode.removeChild(drag);
            if (touch === true) {
                document.ontouchmove = null;
                document.ontouchend  = null;
            } else {
                document.onmousemove = null;
                document.onmouseup   = null;
            }
            network.settings();
            e.preventDefault();
            return false;
        },
        boxMoveTouch    = function local_modal_move_touch(f:TouchEvent):boolean {
            f.preventDefault();
            // horizontal
            if (mouseX > f.touches[0].clientX) {
                // drag left
                if (f.touches[0].clientX > maxLeft) {
                    drag.style.width = `${(touchX - f.touches[0].clientX) / 10}em`;
                    drag.style.left = `${(f.touches[0].clientX - offsetLeft) / 10}em`;
                    if (f.touches[0].clientX < (viewportX - bodyWidth - 4)) {
                        body.scrollLeft = body.scrollLeft - ((viewportX - bodyWidth - 4) - f.touches[0].clientX);
                        viewportX = f.touches[0].clientX + bodyWidth + 4;
                    }
                }
            } else {
                // drag right
                if (f.touches[0].clientX < maxRight) {
                    drag.style.width = `${(f.touches[0].clientX - touchX) / 10}em`;
                    drag.style.left = `${(touchX - offsetLeft) / 10}em`;
                    if (f.touches[0].clientX > viewportX) {
                        body.scrollLeft = body.scrollLeft + (f.touches[0].clientX - viewportX);
                        viewportX = f.touches[0].clientX;
                    }
                }
            }

            // vertical
            if (touchY > f.touches[0].clientY) {
                // drag up
                if (f.touches[0].clientY > maxUp) {
                    drag.style.height = `${(touchY - f.touches[0].clientY) / 10}em`;
                    drag.style.top = `${(f.touches[0].clientY - offsetTop) / 10}em`;
                    if (f.touches[0].clientY < (viewportY - bodyHeight - 50)) {
                        body.scrollTop = body.scrollTop - ((viewportY - bodyHeight - 50) - f.touches[0].clientY);
                        viewportY = f.touches[0].clientY + bodyHeight + 50;
                    }
                }
            } else {
                // drag down
                if (f.touches[0].clientY < maxDown) {
                    drag.style.height = `${(f.touches[0].clientY - touchY) / 10}em`;
                    drag.style.top = `${(touchY - offsetTop) / 10}em`;
                    if (f.touches[0].clientY > viewportY) {
                        body.scrollTop = body.scrollTop + (f.touches[0].clientY - viewportY);
                        viewportY = f.touches[0].clientY;
                    }
                }
            }
            return false;
        },
        boxMoveClick = function local_modal_move_click(f:MouseEvent):boolean {
            f.preventDefault();
            // horizontal
            if (mouseX > f.clientX) {
                // drag left
                if (f.clientX > maxLeft) {
                    drag.style.width = `${(mouseX - f.clientX) / 10}em`;
                    drag.style.left = `${(f.clientX - offsetLeft) / 10}em`;
                    if (f.clientX < (viewportX - bodyWidth - 4)) {
                        body.scrollLeft = body.scrollLeft - ((viewportX - bodyWidth - 4) - f.clientX);
                        viewportX = f.clientX + bodyWidth + 4;
                    }
                }
            } else {
                // drag right
                if (f.clientX < maxRight) {
                    drag.style.width = `${(f.clientX - mouseX) / 10}em`;
                    drag.style.left = `${(mouseX - offsetLeft) / 10}em`;
                    if (f.clientX > viewportX) {
                        body.scrollLeft = body.scrollLeft + (f.clientX - viewportX);
                        viewportX = f.clientX;
                    }
                }
            }

            // vertical
            if (mouseY > f.clientY) {
                // drag up
                if (f.clientY > maxUp) {
                    drag.style.height = `${(mouseY - f.clientY) / 10}em`;
                    drag.style.top = `${(f.clientY - offsetTop) / 10}em`;
                    if (f.clientY < (viewportY - bodyHeight - 50)) {
                        body.scrollTop = body.scrollTop - ((viewportY - bodyHeight - 50) - f.clientY);
                        viewportY = f.clientY + bodyHeight + 50;
                    }
                }
            } else {
                // drag down
                if (f.clientY < maxDown) {
                    drag.style.height = `${(f.clientY - mouseY) / 10}em`;
                    drag.style.top = `${(mouseY - offsetTop) / 10}em`;
                    if (f.clientY > viewportY) {
                        body.scrollTop = body.scrollTop + (f.clientY - viewportY);
                        viewportY = f.clientY;
                    }
                }
            }
            return false;
        };
    let viewportY:number = bodyTop + boxTop + bodyHeight + 50 + bodyScrollTop,
        viewportX:number = bodyLeft + boxLeft + 4 + bodyScrollLeft;
    event.preventDefault();
    drag.setAttribute("id", "dragBox");
    body.insertBefore(drag, body.firstChild);
    if (touch === true) {
        document.ontouchend = drop;
        document.ontouchmove  = boxMoveTouch;
        document.ontouchstart = null;
    } else {
        document.onmouseup = drop;
        document.onmousemove = boxMoveClick;
        document.onmousedown = null;
    }
};

/* Resizes the interactive area to fit the browser viewport */
util.fixHeight = function local_util_fixHeight():void {
    const height:number   = window.innerHeight || document.getElementsByTagName("body")[0].clientHeight;
    document.getElementById("spaces").style.height = `${height / 10}em`;
    browser.content.style.height = `${(height - 51) / 10}em`;
    document.getElementById("users").style.height = `${(height - 102) / 10}em`;
};

/* Get the agent of a given modal */
util.getAgent = function local_util_getAgent(element:HTMLElement):string {
    const box:HTMLElement = (element.getAttribute("class") === "box")
        ? element
        : (function local_util_getAgent_box():HTMLElement {
            let boxEl:HTMLElement = element;
            do {
                boxEl = <HTMLElement>boxEl.parentNode;
            } while (boxEl !== document.documentElement && boxEl.getAttribute("class") !== "box");
            return boxEl;
        }()),
    id:string = box.getAttribute("id");
    return browser.data.modals[id].agent;
};

/* Invite users to your shared space */
util.inviteStart = function local_util_invite(event:MouseEvent, textInput?:string, settings?:ui_modal):void {
    const invite:HTMLElement = document.createElement("div"),
        separator:string = "|spaces|",
        blur = function local_util_invite_blur(event:FocusEvent):void {
            const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                box:HTMLElement = (function local_util_invite_blur_box():HTMLElement {
                    let item:HTMLElement = element;
                    do {
                        item = <HTMLElement>item.parentNode;
                    } while (item !== document.documentElement && item.getAttribute("class") !== "box");
                    return item;
                }()),
                id:string = box.getAttribute("id"),
                inputs:HTMLCollectionOf<HTMLInputElement> = box.getElementsByTagName("input"),
                textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
            browser.data.modals[id].text_value = inputs[0].value + separator + inputs[1].value + separator + textArea.value;
            network.settings();
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
    invite.appendChild(p);
    p = document.createElement("p");
    label = document.createElement("label");
    input = document.createElement("input");
    label.innerHTML = "Port";
    input.setAttribute("type", "text");
    input.placeholder = "Number 1024-65535";
    if (values.length > 0) {
        input.value = values[1];
    }
    input.onblur = blur;
    label.appendChild(input);
    p.appendChild(label);
    invite.appendChild(p);
    p = document.createElement("p");
    label = document.createElement("label");
    label.innerHTML = "Invitation Message";
    if (values.length > 0) {
        text.value = values[2];
    }
    text.onblur = blur;
    label.appendChild(text);
    p.appendChild(label);
    invite.appendChild(p);
    invite.setAttribute("class", "inviteUser");
    if (settings === undefined) {
        modal.create({
            agent: "localhost",
            content: invite,
            inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
            title: "<span class=\"icon-inviteUser\">❤</span> Invite User",
            type: "invite-request"
        });
    } else {
        settings.content = invite;
        modal.create(settings);
    }
};

/* Receive an invitation from another user */
util.inviteRespond = function local_util_inviteRespond(message:string):void {
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
        if (invite.family === "ipv4") {
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
            title: `Invitation from ${invite.name}`,
            type: "invite-accept",
            width: 500
        });
        network.settings();
    } else {
        let user:string = "";
        const modal:HTMLElement = document.getElementById(invite.modal);
        if (modal === null) {
            if (invite.status === "accepted") {
                if (invite.family === "ipv4") {
                    user = `${invite.name}@${invite.ip}:${invite.port}`;
                } else {
                    user = `${invite.name}@[${invite.ip}]:${invite.port}`;
                }
                browser.data.users[user] = {
                    color:["", ""],
                    shares: invite.shares
                }
                util.addUser(user);
            }
        } else {
            const error:HTMLElement = <HTMLElement>modal.getElementsByClassName("error")[0],
                delay:HTMLElement = <HTMLElement>modal.getElementsByClassName("delay")[0],
                footer:HTMLElement = <HTMLElement>modal.getElementsByClassName("footer")[0],
                inviteUser:HTMLElement = <HTMLElement>modal.getElementsByClassName("inviteUser")[0],
                prepOutput = function local_util_inviteRespond_prepOutput(output:HTMLElement):void {
                    if (invite.status === "accepted") {
                        output.innerHTML = "Invitation accepted!";
                        output.setAttribute("class", "accepted");
                        if (invite.family === "ipv4") {
                            user = `${invite.name}@${invite.ip}:${invite.port}`;
                        } else {
                            user = `${invite.name}@[${invite.ip}]:${invite.port}`;
                        }
                        browser.data.users[user] = {
                            color:["", ""],
                            shares: invite.shares
                        }
                        util.addUser(user);
                        network.settings();
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

/* Shortcut key combinations */
util.keys = function local_util_keys(event:KeyboardEvent):void {
    const element:HTMLElement = (function local_util_keys_element():HTMLElement {
            let el:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
            if (el.nodeName.toLowerCase() === "li" || el.nodeName.toLowerCase() === "ul") {
                return el;
            }
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.nodeName.toLowerCase() !== "li");
            return el;
        }()),
        key:number = event.keyCode;
    event.preventDefault();
    if (element.nodeName.toLowerCase() !== "ul") {
        event.stopPropagation();
        util.keyup(event);
    }
    if (key === 46) {
        context.destroy(element);
    } else if (browser.characterKey === "control-alt") {
        if (key === 66 && element.nodeName.toLowerCase() === "li") {
            // key b, base64
            context.dataString(event, element, "Base64");
        } else if (key === 68) {
            // key d, new directory
            context.fsNew(element, "directory");
        } else if (key === 69) {
            // key e, edit file
            context.dataString(event, element, "Edit");
        } else if (key === 70) {
            // key f, new file
            context.fsNew(element, "file");
        } else if (key === 72 && element.nodeName.toLowerCase() === "li") {
            // key h, hash
            context.dataString(event, element, "Hash");
        } else if (key === 82 && element.nodeName.toLowerCase() === "li") {
            // key r, rename
            fs.rename(event);
        } else if (key === 83) {
            // key s, share
            context.share(element);
        } else if (key === 84) {
            // key t, details
            context.details(event, element);
        }
    } else if (browser.characterKey === "control") {
        if (key === 65) {
            // key a, select all
            const list:HTMLElement = (element.nodeName.toLowerCase() === "ul")
                    ? element
                    : <HTMLElement>element.parentNode,
                items:HTMLCollectionOf<HTMLElement> = list.getElementsByTagName("li"),
                length:number = items.length;
            let a:number = 0;
            do {
                items[a].setAttribute("class", `${items[a].getAttribute("class").replace(" selected", "")} selected`);
                items[a].getElementsByTagName("input")[0].checked = true;
                a = a + 1;
            } while (a < length);
        } else if (key === 67) {
            // key c, copy
            context.copy(element, "copy");
        } else if (key === 68 && element.nodeName.toLowerCase() === "li") {
            // key d, destroy
            context.destroy(element);
        } else if (key === 86) {
            // key v, paste
            context.paste(element);
        } else if (key === 88) {
            // key x, cut
            context.copy(element, "cut");
        }
    }
};

/* Release control keys necessary for shortcut key combinations */
util.keyup = function local_util_keys(event:KeyboardEvent):void {
    const key:number = event.keyCode;
    if (key === 16) {
        browser.characterKey = browser.characterKey.replace(/-?shift/, "");
    } else if (key === 17 || key === 224) {
        browser.characterKey = browser.characterKey.replace(/control-?/, "");
    } else if (key === 18) {
        browser.characterKey = browser.characterKey.replace(/-?alt/, "");
    }
};

/* Show/hide for the primary application menu that hangs off the title bar */
util.menu = function local_util_menu():void {
    const menu:HTMLElement = document.getElementById("menu"),
        move = function local_util_menu_move(event:MouseEvent):void {
            const menu:HTMLElement = document.getElementById("menu");
            if (event.clientX > menu.clientWidth || event.clientY > menu.clientHeight + 51) {
                menu.style.display = "none";
                document.onmousemove = null;
            }
        };
    menu.style.display = "block";
    document.onmousemove = move;
};

/* Round data sizes to human readable powers of 1024 */
util.prettyBytes = function local_util_prettyBytes(an_integer:number):string {
    //find the string length of input and divide into triplets
    let output:string = "",
        length:number  = an_integer
            .toString()
            .length;
    const triples:number = (function local_util_prettyBytes_triples():number {
            if (length < 22) {
                return Math.floor((length - 1) / 3);
            }
            //it seems the maximum supported length of integer is 22
            return 8;
        }()),
        //each triplet is worth an exponent of 1024 (2 ^ 10)
        power:number   = (function local_util_prettyBytes_power():number {
            let a = triples - 1,
                b = 1024;
            if (triples === 0) {
                return 0;
            }
            if (triples === 1) {
                return 1024;
            }
            do {
                b = b * 1024;
                a = a - 1;
            } while (a > 0);
            return b;
        }()),
        //kilobytes, megabytes, and so forth...
        unit    = [
            "",
            "KB",
            "MB",
            "GB",
            "TB",
            "PB",
            "EB",
            "ZB",
            "YB"
        ];

    if (typeof an_integer !== "number" || Number.isNaN(an_integer) === true || an_integer < 0 || an_integer % 1 > 0) {
        //input not a positive integer
        output = "0.0B";
    } else if (triples === 0) {
        //input less than 1000
        output = `${an_integer}B`;
    } else {
        //for input greater than 999
        length = Math.floor((an_integer / power) * 100) / 100;
        output = length.toFixed(1) + unit[triples];
    }
    return output;
};

/* Gather the selected addresses and types of file system artifacts in a fileNavigator modal */
util.selectedAddresses = function local_util_selectedAddresses(element:HTMLElement, type:string):[string, string][] {
    const output:[string, string][] = [];
    let a:number = 0,
        length:number = 0,
        itemList:HTMLCollectionOf<HTMLElement>,
        addressItem:HTMLElement,
        box:HTMLElement;
    if (element.nodeName.toLowerCase() !== "li") {
        element = <HTMLElement>element.parentNode;
    }
    box = element;
    if (box.getAttribute("class") !== "box") {
        do {
            box = <HTMLElement>box.parentNode;
        } while (box !== document.documentElement && box.getAttribute("class") !== "box");
    }
    itemList = box.getElementsByClassName("fileList")[0].getElementsByTagName("li");
    length = itemList.length;
    do {
        if (itemList[a].getElementsByTagName("input")[0].checked === true) {
            addressItem = (itemList[a].firstChild.nodeName.toLowerCase() === "button")
                ? <HTMLElement>itemList[a].firstChild.nextSibling
                : <HTMLElement>itemList[a].firstChild;
            output.push([addressItem.innerHTML, itemList[a].getAttribute("class").replace(/(\s+((selected)|(cut)))+/, "")]);
            if (type === "cut") {
                itemList[a].setAttribute("class", itemList[a].getAttribute("class").replace(/(\s+((selected)|(cut)))+/, " cut"));
            }
        } else {
            itemList[a].setAttribute("class", itemList[a].getAttribute("class").replace(/(\s+((selected)|(cut)))+/, ""));
        }
        a = a + 1;
    } while (a < length);
    if (output.length > 0) {
        return output;
    }
    output.push([element.getElementsByTagName("label")[0].innerHTML, element.getAttribute("class")]);
    if (type === "cut") {
        element.setAttribute("class", element.getAttribute("class").replace(/(\s+((selected)|(cut)))+/, " cut"));
    }
    return output;
};

/* Remove selections of file system artifacts in a given fileNavigator modal */
util.selectNone = function local_util_selectNone(element:HTMLElement):void {
    let a:number = 0,
        inputLength:number,
        li:HTMLCollectionOf<HTMLElement>,
        inputs:HTMLCollectionOf<HTMLInputElement>,
        box:HTMLElement = element,
        fileList:HTMLElement;
    if (box.getAttribute("class") !== "box") {
        do {
            box = <HTMLElement>box.parentNode;
        } while (box !== document.documentElement && box.getAttribute("class") !== "box");
    }
    fileList = <HTMLElement>box.getElementsByClassName("fileList")[0];
    inputs = fileList.getElementsByTagName("input");
    li = fileList.getElementsByTagName("li");
    inputLength = inputs.length;
    if (inputLength > 0) {
        do {
            if (inputs[a].type === "checkbox") {
                inputs[a].checked = false;
                li[a].setAttribute("class", li[a].getAttribute("class").replace(/(\s+((selected)|(cut)))+/, ""));
            }
            a = a + 1;
        } while (a < inputLength);
    }
};

export default util;