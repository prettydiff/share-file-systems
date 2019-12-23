import browser from "./browser.js";
import fs from "./fs.js";
import invite from "./invite.js";
import network from "./network.js";
import systems from "./systems.js";
import util from "./util.js";
import share from "./share.js";

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
        invite.request(options);
        return;
    }
    if (options.type === "export") {
        modal.importSettings(event);
    } else if (options.type === "invite-accept") {
        invite.accept(box);
    } else if (options.type === "share_delete") {
        share.deleteUser(box);
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
            let a:number = 0,
                modalSingle:HTMLElement;
            do {
                if (browser.data.modals[keys[a]].type === options.type) {
                    modalSingle = document.getElementById(keys[a]);
                    modal.zTop(event, modalSingle);
                    return modalSingle;
                }
                a = a + 1;
            } while (a < length);
            return;
        }
    } else {
        browser.data.modalTypes.push(options.type);
    }
    options.id = id;
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
                button.innerHTML = "↙ <span>Minimize</span>";
                button.setAttribute("class", "minimize");
                button.setAttribute("title", "Minimize");
                button.onclick = modal.minimize;
                section.appendChild(button);
                buttonCount = buttonCount + 1;
            }
            if (options.inputs.indexOf("maximize") > -1) {
                button = document.createElement("button");
                button.innerHTML = "⇱ <span>Maximize</span>";
                button.setAttribute("class", "maximize");
                button.setAttribute("title", "Maximize");
                button.onclick = modal.maximize;
                section.appendChild(button);
                buttonCount = buttonCount + 1;
            }
            if (options.inputs.indexOf("close") > -1) {
                button = document.createElement("button");
                button.innerHTML = "✖ <span>close</span>";
                button.setAttribute("class", "close");
                button.setAttribute("title", "Close");
                if (options.type === "systems") {
                    button.onclick = systems.close;
                    if (options.status === "hidden") {
                        box.style.display = "none";
                    }
                } else if (options.type === "invite-accept") {
                    button.onclick = invite.decline;
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
            if (options.type === "fileNavigate") {
                const searchLabel:HTMLElement = document.createElement("label"),
                    search:HTMLInputElement = document.createElement("input");
                if (options.history === undefined) {
                    if (options.text_value === undefined) {
                        options.history = [];
                    } else {
                        options.history = [options.text_value];
                    }
                }
                extra.style.paddingLeft = "15em";
                button = document.createElement("button");
                button.innerHTML = "◀<span>Previous address</span>";
                button.setAttribute("class", "backDirectory");
                button.setAttribute("title", "Back to previous address");
                button.onclick = fs.back;
                extra.appendChild(button);
                button = document.createElement("button");
                button.innerHTML = "↺<span>Reload</span>";
                button.setAttribute("class", "reloadDirectory");
                button.setAttribute("title", "Reload directory");
                button.onclick = fs.text;
                extra.appendChild(button);
                button = document.createElement("button");
                button.innerHTML = "▲<span>Parent directory</span>";
                button.setAttribute("class", "parentDirectory");
                button.setAttribute("title", "Parent directory");
                button.onclick = fs.parent;
                extra.appendChild(button);
                search.type = "text";
                search.placeholder = "⌕ Search";
                search.onblur = fs.searchBlur;
                search.onfocus = fs.searchFocus;
                search.onkeyup = fs.search;
                searchLabel.innerHTML = "<span>Search for file system artifacts from this location.</span>";
                searchLabel.setAttribute("class", "fileSearch");
                searchLabel.appendChild(search);
                extra.setAttribute("class", "header");
                label.setAttribute("class", "fileAddress");
                label.appendChild(input);
                extra.appendChild(label);
                extra.appendChild(searchLabel);
            } else {
                extra.setAttribute("class", "header");
                label.appendChild(input);
                extra.appendChild(label);
            }
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
        section.style.width = `${(options.width / 10) - 2}em`;
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
    if (options.status === "minimized" && options.inputs.indexOf("minimize") > -1) {
        const minimize:HTMLElement = <HTMLElement>box.getElementsByClassName("minimize")[0];
        options.status = "normal";
        if (options.type === "systems") {
            box.style.display = "block";
        }
        minimize.click();
    } else if (options.status === "maximized" && options.inputs.indexOf("maximize") > -1) {
        const maximize:HTMLElement = <HTMLElement>box.getElementsByClassName("maximize")[0];
        options.status = "normal";
        if (options.type === "systems") {
            box.style.display = "block";
        }
        maximize.click();
    }
    network.storage("settings");
    return box;
};

/* Creates an import/export modal */
modal.export = function local_modal_export(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        textArea:HTMLTextAreaElement = document.createElement("textarea"),
        agency:[string, boolean] = (element === document.getElementById("export"))
            ? ["localhost", false]
            : util.getAgent(element);
    textArea.onblur = modal.textSave;
    textArea.value = JSON.stringify(browser.data);
    modal.create({
        agent: agency[0],
        content: textArea,
        inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
        read_only: agency[1],
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
        id:string,
        status:HTMLElement,
        statusBar:HTMLElement,
        footer:HTMLElement,
        footerButtons:HTMLElement,
        footerOffset:number,
        message:HTMLElement;
    do {
        box = <HTMLElement>box.parentNode;
    } while (box !== document.documentElement && box.getAttribute("class") !== "box");
    if (box === document.documentElement) {
        return;
    }
    id = box.getAttribute("id");
    body = box.getElementsByTagName("div")[1];
    title = <HTMLElement>box.getElementsByTagName("h2")[0];
    status = <HTMLElement>box.getElementsByClassName("status-bar")[0];
    statusBar = <HTMLElement>status.getElementsByTagName("p")[0];
    footer = <HTMLElement>box.getElementsByClassName("footer")[0];
    footerButtons = (footer === undefined)
        ? undefined
        : <HTMLElement>footer.getElementsByClassName("footer-buttons")[0];
    footerOffset = (footerButtons === undefined)
        ? 0
        : footerButtons.clientWidth;
    message = (footer === undefined)
        ? undefined
        : <HTMLElement>footer.getElementsByClassName("message")[0];
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
        if (status !== undefined) {
            status.style.width = `${(browser.data.modals[id].width - 20) / 10}em`;
            statusBar.style.width = `${(browser.data.modals[id].width - 40) / 15}em`;
        }
    } else {
        browser.data.modals[id].status = "maximized";
        title.style.cursor = "default";
        title.onmousedown = null;
        box.style.top = "0em";
        box.style.left = "0em";
        body.style.width = `${(contentArea.clientWidth - 20) / 10}em`;
        body.style.height = (function local_modal_maximize_maxHeight():string {
            let height:number = contentArea.clientHeight,
                header:HTMLElement = <HTMLElement>box.getElementsByClassName("header")[0];
            height = (height - title.clientHeight) - 27;
            if (footer !== undefined) {
                height = height - footer.clientHeight;
            }
            if (header !== undefined) {
                height = height - header.clientHeight;
            }
            if (status !== undefined) {
                height = height - status.clientHeight;
                status.style.width = `${(contentArea.clientWidth - 40) / 10}em`;
                statusBar.style.width = `${(contentArea.clientWidth - 60) / 15}em`;
            }
            if (message !== undefined) {
                message.style.width = `${(contentArea.clientWidth - footerOffset - 60) / 15}em`;
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
        buttons:HTMLElement,
        box:HTMLElement,
        title:HTMLElement,
        id:string,
        children:NodeListOf<ChildNode>,
        borders:number,
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
    title = <HTMLElement>border.getElementsByTagName("h2")[0].getElementsByTagName("button")[0];
    title.onmousedown = modal.move;
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
        title.style.cursor = "move";
        browser.content.appendChild(box);
        browser.data.modals[id].status = "normal";
        box.style.top = `${browser.data.modals[id].top / 10}em`;
        box.style.left = `${browser.data.modals[id].left / 10}em`;
        body.style.width = `${browser.data.modals[id].width / 10}em`;
        body.style.height = `${browser.data.modals[id].height / 10}em`;
        buttons = <HTMLElement>box.getElementsByClassName("buttons")[0];
        borders = (border.getElementsByClassName("corner-tl").length > 0)
            ? 15
            : 0;
        title.style.width = `${(browser.data.modals[id].width - buttons.clientWidth - borders) / 18}em`;
    } else {
        const li:HTMLLIElement = document.createElement("li");
        do {
            child = <HTMLElement>children[a];
            child.style.display = "none";
            a = a + 1;
        } while (a < children.length);
        box.style.zIndex = "0";
        box.parentNode.removeChild(box);
        title.style.width = "11.5em";
        title.style.cursor = "pointer";
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
        drop       = function local_modal_move_drop(dropEvent:Event):boolean {
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
            dropEvent.preventDefault();
            return false;
        },
        boxMove         = function local_modal_move_boxMove(moveEvent:TouchEvent|MouseEvent):boolean {
            const touchEvent:TouchEvent = (touch === true)
                    ? <TouchEvent>moveEvent
                    : null, 
                mouseEvent:MouseEvent = (touch === true)
                    ? null
                    : <MouseEvent>moveEvent,
                clientX:number = (touch === true)
                    ? touchEvent.touches[0].clientX
                    : mouseEvent.clientX,
                clientY:number = (touch === true)
                    ? touchEvent.touches[0].clientY
                    : mouseEvent.clientY,
                x:number = (touch === true)
                    ? touchX
                    : mouseX,
                y:number = (touch === true)
                    ? touchY
                    : mouseY;
            moveEvent.preventDefault();
            box.style.right = "auto";
            box.style.left      = `${(boxLeft + (clientX - x)) / 10}em`;
            box.style.top       = `${(boxTop + (clientY - y)) / 10}em`;
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
        document.ontouchmove  = boxMove;
        document.ontouchstart = null;
        document.ontouchend   = drop;
    } else {
        document.onmousemove = boxMove;
        document.onmousedown = null;
        document.onmouseup   = drop;
    }
};

/* Allows resizing of modals in 1 of 8 directions */
modal.resize = function local_modal_resize(event:MouseEvent|TouchEvent):void {
    let clientWidth:number  = 0,
        clientHeight:number = 0;
    const node:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        parent:HTMLElement     = <HTMLElement>node.parentNode,
        box:HTMLElement        = <HTMLElement>parent.parentNode,
        top:number = box.offsetTop,
        left:number = box.offsetLeft,
        body:HTMLDivElement       = box.getElementsByTagName("div")[1],
        heading:HTMLElement = box.getElementsByTagName("h2")[0],
        headingButton:HTMLElement = heading.getElementsByTagName("button")[0],
        touch:boolean = (event !== null && event.type === "touchstart"),
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
        mouseEvent:MouseEvent = <MouseEvent>event,
        touchEvent:TouchEvent = <TouchEvent>event,
        offX:number = (touch === true)
            ? touchEvent.touches[0].clientX
            : mouseEvent.clientX,
        offY:number = (touch === true)
            ? touchEvent.touches[0].clientY
            : mouseEvent.clientY,
        mac:boolean        = (navigator.userAgent.indexOf("macintosh") > 0),
        direction:string = node.getAttribute("class").split("-")[1],
        offsetWidth:number    = (mac === true)
            ? 20
            : -16,
        offsetHeight:number    = (mac === true)
            ? 18
            : -20,
        sideHeight:number = headerHeight + statusHeight + footerHeight + 1,
        drop       = function local_modal_resize_drop():void {
            const settings:ui_modal = browser.data.modals[box.getAttribute("id")];
            if (touch === true) {
                document.ontouchmove = null;
                document.ontouchstart = null;
            } else {
                document.onmousemove = null;
                document.onmouseup = null;
            }
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
        compute = function local_modal_resize_compute(leftTest:boolean, topTest:boolean, values:[number, number]):void {
            const minWidth:number = 55.7;
            let bodyWidth:number,
                bodyHeight:number,
                computedWidth:number,
                computedHeight:number;
            if (values[0] > -10) {
                computedWidth = (leftTest === true)
                    ? left + (values[0] - offX)
                    : (clientWidth + ((values[0] - offsetWidth) - offX)) / 10;
                bodyWidth = (leftTest === true)
                    ? ((clientWidth - offsetWidth) + (left - computedWidth)) / 10
                    : 0;
                if (leftTest === true && bodyWidth > minWidth) {
                    box.style.left = `${computedWidth / 10}em`;
                    body.style.width = `${bodyWidth}em`;
                    heading.style.width = `${bodyWidth + 0.2}em`;
                    headingButton.style.width = `${((bodyWidth - buttonPadding) / 1.8)}em`;
                    if (message !== undefined) {
                        message.style.width = `${(bodyWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        status.style.width = `${bodyWidth - 2}em`;
                        statusBar.style.width = `${(bodyWidth - 4) / 1.5}em`;
                    }
                } else if (leftTest === false && computedWidth > minWidth) {
                    body.style.width = `${computedWidth}em`;
                    heading.style.width = `${computedWidth + 0.2}em`;
                    headingButton.style.width = `${((computedWidth - buttonPadding) / 1.8)}em`;
                    if (message !== undefined) {
                        message.style.width = `${(computedWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        status.style.width = `${computedWidth - 2}em`;
                        statusBar.style.width = `${(computedWidth - 4) / 1.5}em`;
                    }
                }
            }
            if (values[1] > -10) {
                computedHeight = (topTest === true)
                    ? top + (values[1] - offY)
                    : (clientHeight + ((values[1] - offsetHeight) - offY)) / 10;
                bodyHeight = (topTest === true)
                    ? ((clientHeight - offsetHeight) + (top - computedHeight)) / 10
                    : 0;
                if (topTest === true && ((clientHeight - offsetHeight) + (top - computedHeight)) / 10 > 10) {
                    box.style.top = `${computedHeight / 10}em`;
                    body.style.height  = `${bodyHeight}em`;
                    sideLeft.style.height = `${computedHeight + sideHeight}em`;
                    sideRight.style.height = `${computedHeight + sideHeight}em`;
                } else if (topTest === false && computedHeight > 10) {
                    body.style.height  = `${computedHeight}em`;
                    sideLeft.style.height = `${computedHeight + sideHeight}em`;
                    sideRight.style.height = `${computedHeight + sideHeight}em`;
                }
            }
        },
        side:any    = {
            b: function local_modal_resize_sizeB(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    y:number = (touch === true)
                        ? touchMove.touches[0].clientY
                        : mouseMove.clientY;
                compute(false, false, [-10, y]);
            },
            bl: function local_modal_resize_sizeBL(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    x:number = (touch === true)
                        ? touchMove.touches[0].clientX
                        : mouseMove.clientX,
                    y:number = (touch === true)
                        ? touchMove.touches[0].clientY
                        : mouseMove.clientY;
                compute(true, false, [x, y]);
            },
            br: function local_modal_resize_sizeBR(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    x:number = (touch === true)
                        ? touchMove.touches[0].clientX
                        : mouseMove.clientX,
                    y:number = (touch === true)
                        ? touchMove.touches[0].clientY
                        : mouseMove.clientY;
                compute(false, false, [x, y]);
            },
            l: function local_modal_resize_sizeL(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    x:number = (touch === true)
                        ? touchMove.touches[0].clientX
                        : mouseMove.clientX;
                compute(true, false, [x, -10]);
            },
            r: function local_modal_resize_sizeR(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    x:number = (touch === true)
                        ? touchMove.touches[0].clientX
                        : mouseMove.clientX;
                compute(false, false, [x, -10]);
            },
            t: function local_modal_resize_sizeT(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    y:number = (touch === true)
                        ? touchMove.touches[0].clientY
                        : mouseMove.clientY;
                compute(false, true, [-10, y]);
            },
            tl: function local_modal_resize_sizeTL(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    x:number = (touch === true)
                        ? touchMove.touches[0].clientX
                        : mouseMove.clientX,
                    y:number = (touch === true)
                        ? touchMove.touches[0].clientY
                        : mouseMove.clientY;
                compute(true, true, [x, y]);
            },
            tr: function local_modal_resize_sizeTR(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    x:number = (touch === true)
                        ? touchMove.touches[0].clientX
                        : mouseMove.clientX,
                    y:number = (touch === true)
                        ? touchMove.touches[0].clientY
                        : mouseMove.clientY;
                compute(false, true, [x, y]);
            }
        };
    if (browser.data.modals[box.getAttribute("id")].status === "maximized" || browser.data.modals[box.getAttribute("id")].status === "minimized") {
        return;
    }
    clientWidth  = body.clientWidth;
    clientHeight = body.clientHeight;
    if (touch === true) {
        document.ontouchmove  = side[direction];
        document.ontouchstart = null;
        document.ontouchend   = drop;
    } else {
        document.onmousemove = side[direction];
        document.onmousedown = null;
        document.onmouseup = drop;
    }
};

/* Shows the system log modal in the correct visual status */
modal.systems = function local_modal_systems(event:MouseEvent) {
    const systems:HTMLElement = document.getElementById("systems-modal"),
        data:ui_modal = browser.data.modals["systems-modal"],
        minimize:HTMLElement = <HTMLElement>systems.getElementsByClassName("minimize")[0];
    if (<modalStatus>data.status === "minimized") {
        minimize.click();
    } else {
        modal.zTop(event, systems);
        if (data.status === "hidden") {
            systems.style.display = "block";
        }
        data.status = "normal";
    }
};

/* Creates a textPad modal */
modal.textPad = function local_modal_textPad(event:MouseEvent, value?:string, title?:string):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        titleText:string = (typeof title === "string")
            ? title
            : element.innerHTML,
        textArea:HTMLTextAreaElement = document.createElement("textarea"),
        agency:[string, boolean] = (element === document.getElementById("textPad"))
            ? ["localhost", false]
            : util.getAgent(element);
    if (typeof value === "string") {
        textArea.value = value;
    }
    textArea.onblur = modal.textSave;
    if (titleText.indexOf("Base64 - ") === 0) {
        textArea.style.whiteSpace = "normal";
    }
    modal.create({
        agent: agency[0],
        content: textArea,
        inputs: ["close", "maximize", "minimize"],
        read_only: agency[1],
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
modal.zTop     = function local_modal_zTop(event:MouseEvent, elementInput?:HTMLElement):void {
    const element:HTMLElement = (elementInput === undefined)
            ? <HTMLElement>event.srcElement || <HTMLElement>event.target
            : elementInput,
        parent:HTMLElement = <HTMLElement>element.parentNode,
        grandParent:HTMLElement = <HTMLElement>parent.parentNode;
    let box:HTMLElement = element;
    if ((parent.getAttribute("class") === "fileList" || grandParent.getAttribute("class") === "fileList") && event.shiftKey === true) {
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