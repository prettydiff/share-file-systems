import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import modal from "./modal.js";
import network from "./network.js";

const util:module_util = {};

/* Adds users to the user bar */
util.addUser = function local_util_addUser(userName:string, shares?:[string, string][]):void {
    const li:HTMLLIElement = document.createElement("li"),
        button:HTMLElement = document.createElement("button");
    button.innerHTML = userName;
    if (userName.split("@")[1] === "localhost") {
        button.setAttribute("class", "active");
    } else {
        button.setAttribute("class", "offline");
        browser.data.shares[userName] = shares;
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

/* Resizes the interactive area to fit the browser viewport */
util.fixHeight = function local_util_fixHeight():void {
    const height:number   = window.innerHeight || document.getElementsByTagName("body")[0].clientHeight;
    document.getElementById("spaces").style.height = `${height / 10}em`;
    browser.content.style.height = `${(height - 51) / 10}em`;
    document.getElementById("users").style.height = `${(height - 102) / 10}em`;
};

/* Build a single file system object from data */
util.fsObject = function local_util_fsObject(item:directoryItem, extraClass:string):HTMLElement {
    const driveLetter = function local_util_fsObject_driveLetter(drive:string):string {
            return drive.replace("\\\\", "\\");
        },
        li:HTMLElement = document.createElement("li"),
        label:HTMLLabelElement = document.createElement("label"),
        text:HTMLElement = document.createElement("label"),
        input:HTMLInputElement = document.createElement("input");
    let span:HTMLElement,
        plural:string;
    if (extraClass.replace(/\s+/, "") !== "") {
        li.setAttribute("class", `${item[1]} ${extraClass}`);
    } else {
        li.setAttribute("class", item[1]);
    }
    input.type = "checkbox";
    input.checked = false;
    input.onkeydown = function local_ui_fs_list_keydown(event:KeyboardEvent):void {
        const key:string = event.key.toLowerCase(),
            fileList:HTMLElement = (function local_util_fsObject_keydown():HTMLElement {
                let element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
                do {
                    element = <HTMLElement>element.parentNode;
                } while (element !== document.documentElement && element.getAttribute("class") !== "fileList");
                return element;
            }());
        if (browser.characterKey === "control" && key === "a") {
            let a:number = 0,
                inputs:HTMLCollectionOf<HTMLInputElement>;
            const list:HTMLCollectionOf<HTMLLIElement> = fileList.getElementsByTagName("li"),
                listLength:number = list.length;
            event.preventDefault();
            do {
                list[a].setAttribute("class", list[a].getAttribute("class").replace(/(\s+selected)+/, "") + " selected");
                inputs = list[a].getElementsByTagName("input");
                inputs[inputs.length - 1].checked = true;
                a = a + 1;
            } while (a < listLength);
        }
    };
    label.innerHTML = "Selected";
    label.appendChild(input);
    label.setAttribute("class", "selection");
    text.innerHTML = item[0].replace(/^\w:\\\\/, driveLetter);
    text.oncontextmenu = context.menu;
    text.onclick = fs.select;
    li.appendChild(text);
    if (item[1] === "file") {
        span = document.createElement("span");
        if (item[4].size === 1) {
            plural = "";
        } else {
            plural = "s";
        }
        span.textContent = `file - ${util.commas(item[4].size)} byte${plural}`;
    } else if (item[1] === "directory") {
        if (item[3] > 0) {
            const button = document.createElement("button");
            button.setAttribute("class", "expansion");
            button.innerHTML = "+<span>Expand this folder</span>";
            button.onclick = fs.expand;
            li.insertBefore(button, li.firstChild);
        }
        span = document.createElement("span");
        if (item[3] === 1) {
            plural = "";
        } else {
            plural = "s";
        }
        span.textContent = `directory - ${util.commas(item[3])} item${plural}`;
        li.ondblclick = fs.directory;
    } else {
        span = document.createElement("span");
        if (item[1] === "link") {
            span.textContent = "symbolic link";
        } else {
            span.textContent = item[1];
        }
    }
    span.onclick = fs.select;
    span.oncontextmenu = context.menu;
    li.appendChild(span);
    li.oncontextmenu = context.menu;
    li.appendChild(label);
    li.onclick = fs.select;
    return li;
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
            content: div,
            height: 300,
            inputs: ["cancel", "confirm", "close"],
            title: `Invitation from ${invite.name}`,
            type: "invite-accept",
            width: 500
        });
        network.settings();
    } else {
        const modal:HTMLElement = document.getElementById(invite.modal);
        if (modal === null) {
            if (invite.status === "accepted") {
                if (invite.family === "ipv4") {
                    util.addUser(`${invite.name}@${invite.ip}:${invite.port}`, invite.shares);
                } else {
                    util.addUser(`${invite.name}@[${invite.ip}]:${invite.port}`, invite.shares);
                }
            }
        } else {
            const error:HTMLElement = <HTMLElement>modal.getElementsByClassName("error")[0],
                delay:HTMLElement = <HTMLElement>modal.getElementsByClassName("delay")[0],
                footer:HTMLElement = <HTMLElement>modal.getElementsByClassName("footer")[0],
                user:HTMLElement = <HTMLElement>modal.getElementsByClassName("inviteUser")[0],
                prepOutput = function local_util_inviteRespond_prepOutput(output:HTMLElement):void {
                    if (invite.status === "accepted") {
                        output.innerHTML = "Invitation accepted!";
                        output.setAttribute("class", "accepted");
                        if (invite.family === "ipv4") {
                            util.addUser(`${invite.name}@${invite.ip}:${invite.port}`, invite.shares);
                        } else {
                            util.addUser(`${invite.name}@[${invite.ip}]:${invite.port}`, invite.shares);
                        }
                        network.settings();
                    } else {
                        output.innerHTML = "Invitation declined. :(";
                        output.setAttribute("class", "error");
                    }
                };
            footer.style.display = "none";
            delay.style.display = "none";
            user.style.display = "block";
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