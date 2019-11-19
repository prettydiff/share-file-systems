import browser from "./browser.js";
import fs from "./fs.js";
import network from "./network.js";
import util from "./util.js";

const modal:module_modal = {};

/* Removes a modal from the DOM for garbage collection, except systems log is merely hidden */
modal.close = function local_modal_close(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        keys:string[] = Object.keys(browser.data.modals),
        keyLength:number = keys.length;
    let parent:HTMLElement = <HTMLElement>element.parentNode,
        id:string,
        type:string,
        a:number = 0,
        count:number = 0;
    do {
        parent = <HTMLElement>parent.parentNode;
    } while (parent.getAttribute("class") !== "box");
    if (parent.parentNode === null) {
        return;
    }
    parent.onclick = null;
    parent.parentNode.removeChild(parent);
    id = parent.getAttribute("id");
    type = id.split("-")[0];
    do {
        if (browser.data.modals[keys[a]].type === type) {
            count = count + 1;
            if (count > 1) {
                break;
            }
        }
        a = a + 1;
    } while (a < keyLength);
    if (count === 1) {
        browser.data.modalTypes.splice(browser.data.modalTypes.indexOf(type), 1);
    }
    delete browser.data.modals[id];
    network.storage("settings");
};

/* Sends a network signal on modal close */
modal.closeDecline = function local_modal_closeDecline(event:MouseEvent, action:Function):void {
    action();
    modal.close(event);
};

/* Event handler for the modal's "Confirm" button */
modal.confirm = function local_modal_confirm(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        box:HTMLElement = (function local_modal_confirm_box():HTMLElement {
            let el:HTMLElement = element;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "box");
            return el;
        }()),
        id:string = box.getAttribute("id"),
        options = browser.data.modals[id];

    if (options.type === "invite-request") {
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
                family: (inputs[0].value.indexOf(":") > 0)
                    ? "ipv6"
                    : "ipv4",
                ip: inputs[0].value,
                port: port,
                message: box.getElementsByTagName("textarea")[0].value,
                modal: id,
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
        return;
    }
    if (options.type === "export") {
        modal.importSettings(event);
    } else if (options.type === "invite-accept") {
        let user:string = "";
        const para:HTMLCollectionOf<HTMLElement> = box.getElementsByClassName("body")[0].getElementsByTagName("p"),
            dataString:string = para[para.length - 1].innerHTML,
            invite:invite = JSON.parse(dataString);
        network.inviteAccept({
            action: "invite-response",
            family: invite.family,
            message: `Invite accepted: ${util.dateFormat(new Date())}`,
            name: browser.data.name,
            ip: invite.ip,
            modal: invite.modal,
            port: invite.port,
            shares: browser.users.localhost.shares,
            status: "accepted"
        });
        if (invite.ip.indexOf(":") > 0) {
            user = `${invite.name}@[${invite.ip}]:${invite.port}`;
        } else {
            user = `${invite.name}@${invite.ip}:${invite.port}`;
        }
        browser.users[user] = {
            color: ["", ""],
            shares: invite.shares
        }
        util.addUser(user);
    }
    modal.close(event);
};

/* Modal creation factory */
modal.create = function local_modal_create(options:ui_modal):HTMLElement {
    let button:HTMLElement = document.createElement("button"),
        buttonCount:number = 0,
        section:HTMLElement = document.createElement("h2"),
        input:HTMLInputElement,
        extra:HTMLElement,
        height:number = 1;
    const id:string = (options.type === "systems")
            ? "systems-modal"
            : (options.id || `${options.type}-${Math.random().toString() + browser.data.zIndex + 1}`),
        box:HTMLElement = document.createElement("div"),
        body:HTMLElement = document.createElement("div"),
        border:HTMLElement = document.createElement("div"),
        modalCount:number = Object.keys(browser.data.modals).length;
    browser.data.zIndex = browser.data.zIndex + 1;
    if (options.zIndex === undefined) {
        options.zIndex = browser.data.zIndex;
    }
    if (browser.data.modalTypes.indexOf(options.type) > -1) {
        if (options.single === true) {
            const keys:string[] = Object.keys(browser.data.modals),
                length:number = keys.length;
            let a:number = 0;
            do {
                if (browser.data.modals[keys[a]].type === options.type) {
                    return document.getElementById(keys[a]);
                }
                a = a + 1;
            } while (a < length);
            return;
        }
    } else {
        browser.data.modalTypes.push(options.type);
    }
    if (options.left === undefined) {
        options.left = 200 + (modalCount * 10);
    }
    if (options.top === undefined) {
        options.top = 200 + (modalCount * 10);
    }
    if (options.width === undefined) {
        options.width = 400;
    }
    if (options.height === undefined) {
        options.height = 400;
    }
    if (options.status === undefined) {
        options.status = "normal";
    }
    if (options.type === "systems") {
        button.innerHTML = document.getElementById("systemLog").innerHTML;
    } else {
        button.innerHTML = options.title;
    }
    button.onmousedown = modal.move;
    button.ontouchstart = modal.move;
    button.onblur  = function local_modal_create_blur():void {
        button.onclick = null;
    };
    box.setAttribute("id", id);
    box.onmousedown = modal.zTop;
    browser.data.modals[id] = options;
    box.style.zIndex = browser.data.zIndex.toString();
    box.setAttribute("class", "box");
    if (options.agent === undefined) {
        box.setAttribute("data-agent", "localhost");
    } else {
        box.setAttribute("data-agent", options.agent);
    }
    border.setAttribute("class", "border");
    body.setAttribute("class", "body");
    body.style.height = `${options.height / 10}em`;
    body.style.width = `${options.width / 10}em`;
    box.style.left = `${options.left / 10}em`;
    box.style.top = `${options.top / 10}em`;
    section.appendChild(button);
    section.setAttribute("class", "heading");
    border.appendChild(section);
    if (Array.isArray(options.inputs) === true) {
        if (options.inputs.indexOf("close") > -1 || options.inputs.indexOf("maximize") > -1 || options.inputs.indexOf("minimize") > -1) {
            section = document.createElement("p");
            section.setAttribute("class", "buttons");
            if (options.inputs.indexOf("minimize") > -1) {
                button = document.createElement("button");
                button.innerHTML = "🗕 <span>Minimize</span>";
                button.setAttribute("class", "minimize");
                button.onclick = modal.minimize;
                section.appendChild(button);
                buttonCount = buttonCount + 1;
            }
            if (options.inputs.indexOf("maximize") > -1) {
                button = document.createElement("button");
                button.innerHTML = "🗖 <span>Maximize</span>";
                button.setAttribute("class", "maximize");
                button.onclick = modal.maximize;
                section.appendChild(button);
                buttonCount = buttonCount + 1;
            }
            if (options.inputs.indexOf("close") > -1) {
                button = document.createElement("button");
                button.innerHTML = "🗙 <span>close</span>";
                button.setAttribute("class", "close");
                if (options.type === "systems") {
                    button.onclick = function local_modal_create_systemsHide(event:MouseEvent):void {
                        let box:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
                        do {
                            box = <HTMLElement>box.parentNode;
                        } while (box !== document.documentElement && box.getAttribute("class") !== "box");
                        if (box.getAttribute("class") === "box") {
                            box.style.display = "none";
                            browser.data.modals["systems-modal"].text_placeholder = browser.data.modals["systems-modal"].status;
                            browser.data.modals["systems-modal"].status = "hidden";
                        }
                        network.storage("settings");
                    };
                    if (options.status === "hidden") {
                        box.style.display = "none";
                    }
                } else if (options.type === "invite-accept") {
                    button.onclick = function local_modal_create_inviteDecline(event:MouseEvent):void {
                        modal.closeDecline(event, function local_modal_create_inviteDecline_action():void {
                            const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                                boxLocal:HTMLElement = (function local_modal_confirm_box():HTMLElement {
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
                                family: invite.family,
                                message: `Invite declined: ${util.dateFormat(new Date())}`,
                                name: browser.data.name,
                                ip: invite.ip,
                                modal: invite.modal,
                                port: invite.port,
                                shares: browser.users.localhost.shares,
                                status: "declined"
                            });
                        });
                    };
                } else {
                    button.onclick = modal.close;
                }
                section.appendChild(button);
                buttonCount = buttonCount + 1;
            }
            border.appendChild(section);
        }
        border.getElementsByTagName("h2")[0].getElementsByTagName("button")[0].style.width = `${(options.width - (buttonCount * 50)) / 18}em`;
        if (options.inputs.indexOf("text") > -1) {
            const label:HTMLElement = document.createElement("label"),
                span:HTMLElement = document.createElement("span");
            height = height + 3.5;
            span.innerHTML = "Text of file system address.";
            label.appendChild(span);
            extra = document.createElement("p");
            if (options.type === "fileNavigate") {
                extra.style.paddingLeft = "5em";
                button = document.createElement("button");
                button.innerHTML = "▲<span>Parent directory</span>";
                button.setAttribute("class", "parentDirectory");
                button.onclick = fs.parent;
                extra.appendChild(button);
            }
            input = document.createElement("input");
            input.type = "text";
            input.spellcheck = false;
            if (options.text_event !== undefined) {
                input.onblur = options.text_event;
                input.onkeyup = options.text_event;
            }
            if (options.text_placeholder !== undefined) {
                input.placeholder = options.text_placeholder;
            }
            if (options.text_value !== undefined) {
                input.value = options.text_value;
            }
            extra.setAttribute("class", "header");
            label.appendChild(input);
            extra.appendChild(label);
            border.appendChild(extra);
        }
    }
    border.appendChild(body);
    body.appendChild(options.content);
    if (options.type === "export" || options.type === "textPad") {
        body.style.overflow = "hidden";
    }
    if (options.status_bar === true) {
        height = height + 5;
        section = document.createElement("div");
        section.setAttribute("class", "status-bar");
        extra = document.createElement("p");
        section.appendChild(extra);
        border.appendChild(section);
    }
    if (Array.isArray(options.inputs) === true && (options.inputs.indexOf("cancel") > -1 || options.inputs.indexOf("confirm") > -1 || options.inputs.indexOf("save") > -1)) {
        height = height + 9.3;
        section = document.createElement("div");
        section.setAttribute("class", "footer");
        extra = document.createElement("p");
        extra.setAttribute("class", "footer-buttons");
        if (options.inputs.indexOf("save") > -1) {
            button = document.createElement("button");
            button.innerHTML = "🖫 Save File";
            button.setAttribute("class", "save");
            button.onclick = fs.saveFile;
            extra.appendChild(button);
        }
        if (options.inputs.indexOf("confirm") > -1) {
            button = document.createElement("button");
            button.innerHTML = "✓ Confirm";
            button.setAttribute("class", "confirm");
            button.onclick = modal.confirm;
            extra.appendChild(button);
        }
        if (options.inputs.indexOf("cancel") > -1) {
            button = document.createElement("button");
            button.innerHTML = "🗙 Cancel";
            button.setAttribute("class", "cancel");
            button.onclick = modal.close;
            extra.appendChild(button);
        }
        section.appendChild(extra);
        extra = document.createElement("span");
        extra.setAttribute("class", "clear");
        section.appendChild(extra);
        border.appendChild(section);
    }
    if (options.resize !== false) {
        button = document.createElement("button");
        button.innerHTML = "resize box width and height";
        button.setAttribute("class", "corner-tl");
        button.onmousedown = modal.resize;
        border.appendChild(button);
        button = document.createElement("button");
        button.innerHTML = "resize box width and height";
        button.setAttribute("class", "corner-tr");
        button.onmousedown = modal.resize;
        border.appendChild(button);
        button = document.createElement("button");
        button.innerHTML = "resize box width and height";
        button.setAttribute("class", "corner-bl");
        button.onmousedown = modal.resize;
        border.appendChild(button);
        button = document.createElement("button");
        button.innerHTML = "resize box width and height";
        button.setAttribute("class", "corner-br");
        button.onmousedown = modal.resize;
        border.appendChild(button);
        button = document.createElement("button");
        button.innerHTML = "resize box height";
        button.setAttribute("class", "side-t");
        button.style.width = `${(options.width / 10) + 1}em`;
        button.onmousedown = modal.resize;
        border.appendChild(button);
        button = document.createElement("button");
        button.innerHTML = "resize box width";
        button.setAttribute("class", "side-r");
        button.style.height = `${(options.height / 10) + height}em`;
        button.onmousedown = modal.resize;
        border.appendChild(button);
        button = document.createElement("button");
        button.innerHTML = "resize box height";
        button.setAttribute("class", "side-b");
        button.style.width = `${(options.width / 10) + 1}em`;
        button.onmousedown = modal.resize;
        border.appendChild(button);
        button = document.createElement("button");
        button.innerHTML = "resize box width";
        button.setAttribute("class", "side-l");
        button.style.height = `${(options.height / 10) + height}em`;
        button.onmousedown = modal.resize;
        border.appendChild(button);
    }
    box.appendChild(border);
    browser.content.appendChild(box);
    network.storage("settings");
    return box;
};

/* Creates an import/export modal */
modal.export = function local_modal_export(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        textArea:HTMLTextAreaElement = document.createElement("textarea");
    textArea.onblur = modal.textSave;
    textArea.value = JSON.stringify(browser.data);
    modal.create({
        agent: (element === document.getElementById("export"))
            ? "localhost"
            : util.getAgent(element),
        content: textArea,
        inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
        single: true,
        title: element.innerHTML,
        type: "export"
    });
};

/* Modifies saved settings from an imported JSON string then reloads the page */
modal.importSettings = function local_modal_importSettings(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        dataString:string = JSON.stringify(browser.data);
    let box:HTMLElement = element,
        textArea:HTMLTextAreaElement,
        button:HTMLButtonElement;
    do {
        box = <HTMLElement>box.parentNode;
    } while (box !== document.documentElement && box.getAttribute("class") !== "box");
    textArea = box.getElementsByTagName("textarea")[0];
    if (textArea.value !== dataString) {
        browser.data = JSON.parse(textArea.value);
    }
    button = <HTMLButtonElement>document.getElementsByClassName("cancel")[0];
    button.click();
    if (textArea.value !== dataString) {
        network.storage("settings");
        location.replace(location.href);
    }
};

/* The given modal consumes the entire view port of the content area */
modal.maximize = function local_modal_maximize(event:Event):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        contentArea:HTMLElement = document.getElementById("content-area");
    let box:HTMLElement = element,
        body:HTMLElement,
        title:HTMLElement,
        id:string;
    do {
        box = <HTMLElement>box.parentNode;
    } while (box !== document.documentElement && box.getAttribute("class") !== "box");
    if (box === document.documentElement) {
        return;
    }
    id = box.getAttribute("id");
    body = box.getElementsByTagName("div")[1];
    title = <HTMLElement>box.getElementsByTagName("h2")[0];
    if (title !== undefined) {
        title = title.getElementsByTagName("button")[0];
    }
    if (browser.data.modals[id].status === "maximized") {
        title.style.cursor = "move";
        title.onmousedown = modal.move;
        browser.data.modals[id].status = "normal";
        box.style.top = `${browser.data.modals[id].top / 10}em`;
        box.style.left = `${browser.data.modals[id].left / 10}em`;
        body.style.width = `${browser.data.modals[id].width / 10}em`;
        body.style.height = `${browser.data.modals[id].height / 10}em`;
    } else {
        browser.data.modals[id].status = "maximized";
        title.style.cursor = "default";
        title.onmousedown = null;
        box.style.top = "0em";
        box.style.left = "0em";
        body.style.width = `${(contentArea.clientWidth - 20) / 10}em`;
        body.style.height = (function local_modal_maximize_maxHeight():string {
            let height:number = contentArea.clientHeight,
                footer:HTMLElement = <HTMLElement>box.getElementsByClassName("footer")[0],
                header:HTMLElement = <HTMLElement>box.getElementsByClassName("header")[0];
            height = (height - title.clientHeight) - 27;
            if (footer !== undefined) {
                height = height - footer.clientHeight;
            }
            if (header !== undefined) {
                height = height - header.clientHeight;
            }
            return `${height / 10}em`;
        }());
    }
    network.storage("settings");
};

/* Visually minimize a modal to the tray at the bottom of the content area */
modal.minimize = function local_modal_minimize(event:Event):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
    let border:HTMLElement = element,
        box:HTMLElement,
        title:HTMLElement,
        id:string,
        children:NodeListOf<ChildNode>,
        child:HTMLElement,
        a:number = 1;
    do {
        border = <HTMLElement>border.parentNode;
    } while (border !== document.documentElement && border.getAttribute("class") !== "border");
    if (border === document.documentElement) {
        return;
    }
    box = <HTMLElement>border.parentNode;
    id = box.getAttribute("id");
    title = <HTMLElement>border.getElementsByTagName("h2")[0];
    title.getElementsByTagName("button")[0].onmousedown = modal.move;
    children = border.childNodes;
    if (browser.data.modals[id].status === "minimized") {
        const li:HTMLElement = <HTMLElement>box.parentNode,
            body:HTMLElement = <HTMLElement>border.getElementsByClassName("body")[0];
        do {
            child = <HTMLElement>children[a];
            child.style.display = "block";
            a = a + 1;
        } while (a < children.length);
        document.getElementById("tray").removeChild(li);
        li.removeChild(box);
        box.style.zIndex = browser.data.modals[id].zIndex.toString();
        title.getElementsByTagName("button")[0].style.cursor = "move";
        browser.content.appendChild(box);
        browser.data.modals[id].status = "normal";
        box.style.top = `${browser.data.modals[id].top / 10}em`;
        box.style.left = `${browser.data.modals[id].left / 10}em`;
        body.style.width = `${browser.data.modals[id].width / 10}em`;
        body.style.height = `${browser.data.modals[id].height / 10}em`;
    } else {
        const li:HTMLLIElement = document.createElement("li");
        do {
            child = <HTMLElement>children[a];
            child.style.display = "none";
            a = a + 1;
        } while (a < children.length);
        box.style.zIndex = "0";
        box.parentNode.removeChild(box);
        title.getElementsByTagName("button")[0].style.cursor = "pointer";
        li.appendChild(box);
        document.getElementById("tray").appendChild(li);
        browser.data.modals[id].status = "minimized";
    }
    network.storage("settings");
};

/* Drag and drop interaction for modals */
modal.move = function local_modal_move(event:Event):void {
    const x:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        heading:HTMLElement = <HTMLElement>x.parentNode,
        box:HTMLElement        = <HTMLElement>heading.parentNode.parentNode,
        settings:ui_modal = browser.data.modals[box.getAttribute("id")],
        border:HTMLElement = box.getElementsByTagName("div")[0],
        minifyTest:boolean = (box.parentNode.nodeName.toLowerCase() === "li"),
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
            const headingWidth:number = box.getElementsByTagName("h2")[0].clientWidth;
            boxLeft = box.offsetLeft;
            boxTop  = box.offsetTop;
            if (touch === true) {
                document.ontouchmove = null;
                document.ontouchend  = null;
            } else {
                document.onmousemove = null;
                document.onmouseup   = null;
            }
            if (boxTop < 10) {
                boxTop = 10;
            } else if (boxTop > (max - 40)) {
                boxTop = max - 40;
            }
            if (boxLeft < ((headingWidth * -1) + 40)) {
                boxLeft = (headingWidth * -1) + 40;
            }
            box.style.top = `${boxTop / 10}em`;
            box.style.left = `${boxLeft / 10}em`;
            border.style.opacity = "1";
            box.style.height   = "auto";
            settings.top = boxTop;
            settings.left = boxLeft;
            network.storage("settings");
            e.preventDefault();
            return false;
        },
        boxMoveTouch    = function local_modal_move_touch(f:TouchEvent):boolean {
            f.preventDefault();
            box.style.right = "auto";
            box.style.left      = `${(boxLeft + (f.touches[0].clientX - touchX)) / 10}em`;
            box.style.top       = `${(boxTop + (f.touches[0].clientY - touchY)) / 10}em`;
            document.ontouchend = drop;
            return false;
        },
        boxMoveClick = function local_modal_move_click(f:MouseEvent):boolean {
            f.preventDefault();
            box.style.right = "auto";
            box.style.left     = `${(boxLeft + (f.clientX - mouseX)) / 10}em`;
            box.style.top      = `${(boxTop + (f.clientY - mouseY)) / 10}em`;
            document.onmouseup = drop;
            return false;
        };
    let boxLeft:number    = box.offsetLeft,
        boxTop:number     = box.offsetTop,
        max:number        = browser.content.clientHeight;
    if (minifyTest === true) {
        const button:HTMLButtonElement = <HTMLButtonElement>box.getElementsByClassName("minimize")[0];
        button.click();
        return;
    }
    if (browser.data.modals[box.getAttribute("id")].status === "maximized") {
        return;
    }
    event.preventDefault();
    border.style.opacity = ".5";
    box.style.height   = ".1em";
    if (touch === true) {
        document.ontouchmove  = boxMoveTouch;
        document.ontouchstart = null;
    } else {
        document.onmousemove = boxMoveClick;
        document.onmousedown = null;
    }
};

/* Allows resizing of modals in 1 of 8 directions */
modal.resize = function local_modal_resize(event:MouseEvent):void {
    let bodyWidth:number = 0,
        bodyHeight:number = 0,
        clientWidth:number  = 0,
        clientHeight:number = 0,
        computedHeight:number = 0,
        computedWidth:number = 0;
    const node:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        parent:HTMLElement     = <HTMLElement>node.parentNode,
        box:HTMLElement        = <HTMLElement>parent.parentNode,
        top:number = box.offsetTop,
        left:number = box.offsetLeft,
        body:HTMLDivElement       = box.getElementsByTagName("div")[1],
        heading:HTMLElement = box.getElementsByTagName("h2")[0],
        headingButton:HTMLElement = heading.getElementsByTagName("button")[0],
        buttonPadding:number = (box.getElementsByClassName("buttons")[0] === undefined)
            ? 0
            : (box.getElementsByClassName("buttons")[0].getElementsByTagName("button").length * 5),
        header:HTMLElement = <HTMLElement>box.getElementsByClassName("header")[0],
        headerHeight:number = (header === undefined)
            ? 0
            : (header.clientHeight / 10),
        footer:HTMLElement = <HTMLElement>box.getElementsByClassName("footer")[0],
        message:HTMLElement = (footer === undefined)
            ? undefined
            : <HTMLElement>footer.getElementsByClassName("message")[0],
        footerButtons:HTMLElement = (footer === undefined)
            ? undefined
            : <HTMLElement>footer.getElementsByClassName("footer-buttons")[0],
        footerOffset:number = (footerButtons === undefined)
            ? 0
            : footerButtons.clientWidth / 10,
        status:HTMLElement = <HTMLElement>box.getElementsByClassName("status-bar")[0],
        statusBar:HTMLElement = (status === undefined)
            ? undefined
            : status.getElementsByTagName("p")[0],
        statusHeight:number = (status === undefined)
            ? 0
            : (status.clientHeight / 10),
        footerHeight:number = (footer === undefined)
            ? 0
            : (footer.clientHeight / 10),
        sideLeft:HTMLElement = <HTMLElement>box.getElementsByClassName("side-l")[0],
        sideRight:HTMLElement = <HTMLElement>box.getElementsByClassName("side-r")[0],
        offX:number = event.clientX,
        offY:number = event.clientY,
        mac:boolean        = (navigator.userAgent.indexOf("macintosh") > 0),
        direction:string = node.getAttribute("class").split("-")[1],
        offsetWidth:number    = (mac === true)
            ? 20
            : -16,
        offsetHeight:number    = (mac === true)
            ? 18
            : -20,
        drop       = function local_modal_resize_drop():void {
            const settings:ui_modal = browser.data.modals[box.getAttribute("id")];
            document.onmousemove = null;
            document.onmouseup = null;
            clientWidth            = body.clientWidth;
            clientHeight           = body.clientHeight;
            settings.width = clientWidth - offsetWidth;
            settings.height = clientHeight - offsetHeight;
            if (box.getAttribute("id") === "systems-modal") {
                const tabs:HTMLElement = <HTMLElement>box.getElementsByClassName("tabs")[0];
                tabs.style.width = `${body.clientWidth / 10}em`;
            }
            network.storage("settings");
        },
        sideHeight:number = headerHeight + statusHeight + footerHeight + 1, 
        side:any    = {
            b: function local_modal_resize_sizeB(f:MouseEvent):void {
                computedHeight = (clientHeight + ((f.clientY - offsetHeight) - offY)) / 10;
                if (computedHeight > 10) {
                    body.style.height  = `${computedHeight}em`;
                    sideLeft.style.height = `${computedHeight + sideHeight}em`;
                    sideRight.style.height = `${computedHeight + sideHeight}em`;
                    
                }
                document.onmouseup = drop;
            },
            bl: function local_modal_resize_sizeBL(f:MouseEvent):void {
                computedWidth = left + (f.clientX - offX);
                computedHeight = (clientHeight + ((f.clientY - offsetHeight) - offY)) / 10;
                bodyWidth = ((clientWidth - offsetWidth) + (left - computedWidth)) / 10;
                if (computedHeight > 10) {
                    body.style.height  = `${computedHeight}em`;
                    sideLeft.style.height = `${computedHeight + sideHeight}em`;
                    sideRight.style.height = `${computedHeight + sideHeight}em`;
                }
                if (bodyWidth > 35) {
                    box.style.left = `${computedWidth / 10}em`;
                    body.style.width  = `${bodyWidth}em`;
                    heading.style.width = `${bodyWidth + 0.2}em`;
                    headingButton.style.width = `${((bodyWidth - buttonPadding) / 1.8)}em`;
                    if (message !== undefined) {
                        message.style.width = `${(bodyWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        statusBar.style.width = `${(bodyWidth - 4) / 1.5}em`;
                    }
                }
                document.onmouseup = drop;
            },
            br: function local_modal_resize_sizeBR(f:MouseEvent):void {
                computedWidth = (clientWidth + ((f.clientX - offsetWidth) - offX)) / 10;
                computedHeight = (clientHeight + ((f.clientY - offsetHeight) - offY)) / 10;
                if (computedHeight > 10) {
                    body.style.height  = `${computedHeight}em`;
                    sideLeft.style.height = `${computedHeight + sideHeight}em`;
                    sideRight.style.height = `${computedHeight + sideHeight}em`;
                }
                if (computedWidth > 35) {
                    body.style.width = `${computedWidth}em`;
                    heading.style.width = `${computedWidth + 0.2}em`;
                    headingButton.style.width = `${((computedWidth - buttonPadding) / 1.8)}em`;
                    if (message !== undefined) {
                        message.style.width = `${(computedWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        statusBar.style.width = `${(computedWidth - 4) / 1.5}em`;
                    }
                }
                document.onmouseup = drop;
            },
            l: function local_modal_resize_sizeL(f:MouseEvent):void {
                computedWidth = left + (f.clientX - offX);
                bodyWidth = ((clientWidth - offsetWidth) + (left - computedWidth)) / 10;
                if (bodyWidth > 35) {
                    box.style.left = `${computedWidth / 10}em`;
                    body.style.width  = `${bodyWidth}em`;
                    heading.style.width = `${bodyWidth + 0.2}em`;
                    headingButton.style.width = `${((bodyWidth - buttonPadding) / 1.8)}em`;
                    if (message !== undefined) {
                        message.style.width = `${(bodyWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        statusBar.style.width = `${(bodyWidth - 4) / 1.5}em`;
                    }
                }
                document.onmouseup = drop;
            },
            r: function local_modal_resize_sizeR(f:MouseEvent):void {
                computedWidth = (clientWidth + ((f.clientX - offsetWidth) - offX)) / 10;
                if (computedWidth > 35) {
                    body.style.width = `${computedWidth}em`;
                    heading.style.width = `${computedWidth + 0.2}em`;
                    headingButton.style.width = `${((computedWidth - buttonPadding) / 1.8)}em`;
                    if (message !== undefined) {
                        message.style.width = `${(computedWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        statusBar.style.width = `${(computedWidth - 4) / 1.5}em`;
                    }
                }
                document.onmouseup = drop;
            },
            t: function local_modal_resize_sizeT(f:MouseEvent):void {
                computedHeight = top + (f.clientY - offY);
                bodyHeight = ((clientHeight - offsetHeight) + (top - computedHeight)) / 10;
                if (((clientHeight - offsetHeight) + (top - computedHeight)) / 10 > 10) {
                    box.style.top = `${computedHeight / 10}em`;
                    body.style.height  = `${bodyHeight}em`;
                    sideLeft.style.height = `${computedHeight + sideHeight}em`;
                    sideRight.style.height = `${computedHeight + sideHeight}em`;
                }
                document.onmouseup = drop;
            },
            tl: function local_modal_resize_sizeTL(f:MouseEvent):void {
                computedHeight = top + (f.clientY - offY);
                computedWidth = left + (f.clientX - offX);
                bodyHeight = ((clientHeight - offsetHeight) + (top - computedHeight)) / 10;
                bodyWidth = ((clientWidth - offsetWidth) + (left - computedWidth)) / 10;
                if (((clientHeight - offsetHeight) + (top - computedHeight)) / 10 > 10) {
                    box.style.top = `${computedHeight / 10}em`;
                    body.style.height  = `${bodyHeight}em`;
                    sideLeft.style.height = `${computedHeight + sideHeight}em`;
                    sideRight.style.height = `${computedHeight + sideHeight}em`;
                }
                if (bodyWidth > 35) {
                    box.style.left = `${computedWidth / 10}em`;
                    body.style.width  = `${bodyWidth}em`;
                    heading.style.width = `${bodyWidth + 0.2}em`;
                    headingButton.style.width = `${((bodyWidth - buttonPadding) / 1.8)}em`;
                    if (message !== undefined) {
                        message.style.width = `${(bodyWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        statusBar.style.width = `${(bodyWidth - 4) / 1.5}em`;
                    }
                }
                document.onmouseup = drop;
            },
            tr: function local_modal_resize_sizeTR(f:MouseEvent):void {
                computedHeight = top + (f.clientY - offY);
                computedWidth = (clientWidth + ((f.clientX - offsetWidth) - offX)) / 10;
                bodyHeight = ((clientHeight - offsetHeight) + (top - computedHeight)) / 10;
                if (((clientHeight - offsetHeight) + (top - computedHeight)) / 10 > 10) {
                    box.style.top = `${computedHeight / 10}em`;
                    body.style.height  = `${bodyHeight}em`;
                    sideLeft.style.height = `${computedHeight + sideHeight}em`;
                    sideRight.style.height = `${computedHeight + sideHeight}em`;
                }
                if (computedWidth > 35) {
                    body.style.width = `${computedWidth}em`;
                    heading.style.width = `${computedWidth + 0.2}em`;
                    headingButton.style.width = `${((computedWidth - buttonPadding) / 1.8)}em`;
                    if (message !== undefined) {
                        message.style.width = `${(computedWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        statusBar.style.width = `${(computedWidth - 4) / 1.5}em`;
                    }
                }
                document.onmouseup = drop;
            }
        };
    if (browser.data.modals[box.getAttribute("id")].status === "maximized" || browser.data.modals[box.getAttribute("id")].status === "minimized") {
        return;
    }
    clientWidth  = body.clientWidth;
    clientHeight = body.clientHeight;
    document.onmousemove = side[direction];
    document.onmousedown = null;
};

/* Displays a list of shared items for each user */
modal.shares = function local_modal_shares(event:MouseEvent, user?:string, configuration?:ui_modal):void {
    const userKeys:string[] = Object.keys(browser.users),
        keyLength:number = userKeys.length;
    let users:HTMLElement;
    if (typeof user === "string" && user.indexOf("@localhost") === user.length - 10) {
        user = "localhost";
    }
    users = util.shareContent(user);
    if (keyLength === 1 && browser.users.localhost.shares.length === 0) {
        modal.create({
            agent: user,
            content: users,
            inputs: ["close", "maximize", "minimize"],
            title: "All Shares",
            type: "shares",
            width: 800
        });
    } else {
        const title:string = (user === "")
            ? "All Shares"
            : `Shares for user - ${user}`;
        if (configuration === undefined || configuration === null) {
            configuration = {
                agent: user,
                content: users,
                title: title,
                type: "shares",
                width: 800
            };
        } else {
            configuration.content = users;
            configuration.title = title;
            configuration.type = "shares";
        }
        configuration.text_value = user;
        configuration.inputs = ["close", "maximize", "minimize"];
        modal.create(configuration);
    }
};

/* Shows the system log modal in the correct visual status */
modal.systems = function local_modal_systems() {
    document.getElementById("systems-modal").style.display = "block";
    if (browser.data.modals["systems-modal"].text_placeholder === "maximized" || browser.data.modals["systems-modal"].text_placeholder === "normal") {
        browser.data.modals["systems-modal"].status = browser.data.modals["systems-modal"].text_placeholder;
    } else {
        browser.data.modals["systems-modal"].status = "normal";
    }
};

/* Creates a textPad modal */
modal.textPad = function local_modal_textPad(event:MouseEvent, value?:string, title?:string):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        titleText:string = (typeof title === "string")
            ? title
            : element.innerHTML,
        textArea:HTMLTextAreaElement = document.createElement("textarea");
    if (typeof value === "string") {
        textArea.value = value;
    }
    textArea.onblur = modal.textSave;
    if (titleText.indexOf("Base64 - ") === 0) {
        textArea.style.whiteSpace = "normal";
    }
    modal.create({
        agent: (element === document.getElementById("textPad"))
            ? "localhost"
            : util.getAgent(element),
        content: textArea,
        inputs: ["close", "maximize", "minimize"],
        title: titleText,
        type: "textPad",
        width: 800
    });
};

/* Pushes the text content of a textPad modal into settings so that it is saved */
modal.textSave = function local_modal_textSave(event:MouseEvent):void {
    const element:HTMLTextAreaElement = <HTMLTextAreaElement>event.srcElement || <HTMLTextAreaElement>event.target;
    let box:HTMLElement = element;
        do {
            box = <HTMLElement>box.parentNode;
        } while (box !== document.documentElement && box.getAttribute("class") !== "box");
    browser.data.modals[box.getAttribute("id")].text_value = element.value;
    network.storage("settings");
};

/* Manages z-index of modals and moves a modal to the top on interaction */
modal.zTop     = function local_modal_zTop(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        parent:HTMLElement = <HTMLElement>element.parentNode,
        grandParent:HTMLElement = <HTMLElement>parent.parentNode;
    let box:HTMLElement = element;
    if ((parent.getAttribute("class") === "fileList" || grandParent.getAttribute("class") === "fileList") && browser.characterKey === "shift") {
        event.preventDefault();
    }
    if (element.getAttribute("class") !== "box") {
        do {
            box = <HTMLElement>box.parentNode;
        } while (box.getAttribute("class") !== "box" && box !== document.documentElement);
    }
    browser.data.zIndex = browser.data.zIndex + 1;
    browser.data.modals[box.getAttribute("id")].zIndex = browser.data.zIndex;
    box.style.zIndex = browser.data.zIndex.toString();
};

export default modal;