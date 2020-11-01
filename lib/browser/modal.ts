
/* lib/browser/modal - A collection of utilities for generating and manipulating modals/windows in the browser. */
import browser from "./browser.js";
import fs from "./fs.js";
import invite from "./invite.js";
import message from "./message.js";
import network from "./network.js";
import util from "./util.js";
import share from "./share.js";

const modal:module_modal = {};

/* Removes a modal from the DOM for garbage collection, except systems log is merely hidden */
modal.close = function browser_modal_close(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        keys:string[] = Object.keys(browser.data.modals),
        keyLength:number = keys.length,
        box:HTMLElement = <HTMLElement>element.getAncestor("box", "class");
    let id:string,
        type:string,
        a:number = 0,
        count:number = 0;
    if (box.parentNode === null) {
        return;
    }
    box.onclick = null;
    box.parentNode.removeChild(box);
    id = box.getAttribute("id");
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

/* Modal types that are enduring are hidden, not destroyed, when closed */
modal.closeEnduring = function browser_systems_closeEnduring(event:MouseEvent):void {
    let box:HTMLElement = <HTMLElement>event.target;
    box = <HTMLElement>box.getAncestor("box", "class");
    if (box.getAttribute("class") === "box") {
        box.style.display = "none";
        // this must remain separated from modal identity as more than one thing users it
        browser.data.modals[box.getAttribute("id")].status = "hidden";
    }
    network.storage("settings");
};

/* Event handler for the modal's "Confirm" button */
modal.confirm = function browser_modal_confirm(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        box:HTMLElement = <HTMLElement>element.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        options = browser.data.modals[id];

    if (options.type === "invite-request") {
        invite.request(event, options);
        return;
    }
    if (options.type === "export") {
        modal.importSettings(event);
    } else if (options.type === "invite-accept") {
        invite.accept(box);
    } else if (options.type === "share_delete") {
        share.deleteAgentList(box);
    }
    modal.close(event);
};

/* Modal creation factory */
modal.create = function browser_modal_create(options:ui_modal):Element {
    let button:HTMLElement = document.createElement("button"),
        buttonCount:number = 0,
        section:HTMLElement = document.createElement("h2"),
        input:HTMLInputElement,
        extra:HTMLElement,
        height:number = 1;
    const id:string = (options.type === "systems")
            ? "systems-modal"
            : (options.type === "settings")
                ? "settings-modal"
                : (options.id || `${options.type}-${Math.random().toString() + browser.data.zIndex + 1}`),
        box:HTMLElement = document.createElement("div"),
        body:HTMLElement = document.createElement("div"),
        border:Element = document.createElement("div"),
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
                modalSingle:Element;
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
        options.width = 565;
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
    button.onclick = modal.unMinimize;
    button.onblur  = function browser_modal_create_blur():void {
        button.onclick = null;
    };
    box.setAttribute("id", id);
    box.onmousedown = modal.zTop;
    browser.data.modals[id] = options;
    box.style.zIndex = browser.data.zIndex.toString();
    box.setAttribute("class", "box");
    if (options.agent === undefined) {
        box.setAttribute("data-agent", browser.data.hashDevice);
    } else {
        box.setAttribute("data-agent", options.agent);
    }
    if (options.agentType === undefined) {
        options.agentType = "device";
    }
    box.setAttribute("data-agentType", options.agentType);
    border.setAttribute("class", "border");
    body.setAttribute("class", "body");
    body.style.height = `${options.height / 10}em`;
    body.style.width = `${options.width / 10}em`;
    box.style.left = `${options.left / 10}em`;
    box.style.top = `${options.top / 10}em`;
    if (options.scroll === false) {
        body.style.overflow = "hidden";
    }
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
                if (options.type === "settings") {
                    button.onclick = modal.closeEnduring;
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
            const label:Element = document.createElement("label"),
                span:Element = document.createElement("span");
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
                const searchLabel:Element = document.createElement("label"),
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
                search.onblur = fs.search;
                search.onfocus = fs.searchFocus;
                search.onkeyup = fs.search;
                if (options.search !== undefined && options.search[1] !== "") {
                    search.value = options.search[1];
                } else {
                    browser.data.modals[id].search = ["", ""];
                }
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
        if (options.status_text !== undefined && options.status_text !== null && options.status_text !== "") {
            extra.innerHTML = options.status_text;
        }
        section.appendChild(extra);
        border.appendChild(section);
    }
    if (options.type === "message") {
        border.appendChild(message.footer());
    } else if (Array.isArray(options.inputs) === true && (options.inputs.indexOf("cancel") > -1 || options.inputs.indexOf("confirm") > -1 || options.inputs.indexOf("save") > -1)) {
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
            if (options.type === "invite-accept") {
                button.onclick = invite.decline;
            } else {
                button.onclick = modal.close;
            }
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
    if (browser.loadTest === false) {
        network.storage("settings");
    }
    return box;
};

/* Creates an import/export modal */
modal.export = function browser_modal_export(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        textArea:HTMLTextAreaElement = document.createElement("textarea"),
        agency:agency = (element === document.getElementById("export"))
            ? [browser.data.hashDevice, false, "device"]
            : util.getAgent(element),
        payload:ui_modal = {
            agent: agency[0],
            agentType: "device",
            content: textArea,
            inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
            read_only: agency[1],
            single: true,
            title: element.innerHTML,
            type: "export"
        };
    textArea.onblur = modal.textSave;
    textArea.value = JSON.stringify(browser.data);
    modal.create(payload);
    document.getElementById("menu").style.display = "none";
};

/* Modifies saved settings from an imported JSON string then reloads the page */
modal.importSettings = function browser_modal_importSettings(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        dataString:string = JSON.stringify(browser.data),
        box:Element = element.getAncestor("box", "class"),
        button:HTMLButtonElement = <HTMLButtonElement>document.getElementsByClassName("cancel")[0],
        textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
    if (textArea.value !== dataString) {
        browser.data = JSON.parse(textArea.value);
    }
    button.click();
    if (textArea.value !== dataString) {
        network.storage("settings");
        location.replace(location.href);
    }
};

/* The given modal consumes the entire view port of the content area */
modal.maximize = function browser_modal_maximize(event:Event):void {
    const element:Element = <Element>event.target,
        contentArea:Element = document.getElementById("content-area"),
        box:HTMLElement = <HTMLElement>element.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
        title:Element = box.getElementsByTagName("h2")[0],
        titleButton:HTMLElement = (title === undefined)
            ? undefined
            : title.getElementsByTagName("button")[0],
        status:HTMLElement = <HTMLElement>box.getElementsByClassName("status-bar")[0],
        statusBar:HTMLElement = <HTMLElement>status.getElementsByTagName("p")[0],
        footer:Element = box.getElementsByClassName("footer")[0],
        footerButtons:Element = (footer === undefined)
            ? undefined
            : <Element>footer.getElementsByClassName("footer-buttons")[0],
        footerOffset:number = (footerButtons === undefined)
            ? 0
            : footerButtons.clientWidth,
        message:HTMLElement = (footer === undefined)
            ? undefined
            : <HTMLElement>footer.getElementsByClassName("message")[0];
    if (box === document.documentElement) {
        return;
    }
    if (browser.data.modals[id].status === "maximized") {
        titleButton.style.cursor = "move";
        titleButton.onmousedown = modal.move;
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
        titleButton.style.cursor = "default";
        titleButton.onmousedown = null;
        box.style.top = "0em";
        box.style.left = "0em";
        body.style.width = `${(contentArea.clientWidth - 20) / 10}em`;
        body.style.height = (function browser_modal_maximize_maxHeight():string {
            let height:number = contentArea.clientHeight,
                header:Element = box.getElementsByClassName("header")[0];
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
modal.minimize = function browser_modal_minimize(event:Event):void {
    const element:Element = <Element>event.target,
        border:Element = element.getAncestor("border", "class"),
        box:HTMLElement = <HTMLElement>border.parentNode,
        id:string = box.getAttribute("id"),
        title:HTMLElement = <HTMLElement>border.getElementsByTagName("h2")[0].getElementsByTagName("button")[0];
    let buttons:Element,
        children:NodeListOf<ChildNode>,
        borders:number,
        child:HTMLElement,
        a:number = 1;
    if (border === document.documentElement) {
        return;
    }
    title.onmousedown = modal.move;
    children = border.childNodes;
    if (browser.data.modals[id].status === "minimized") {
        const li:Element = <Element>box.parentNode,
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
        buttons = box.getElementsByClassName("buttons")[0];
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
    if (util.minimizeAllFlag === false) {
        network.storage("settings");
    }
};

/* Drag and drop interaction for modals */
modal.move = function browser_modal_move(event:Event):void {
    const x:Element = <Element>event.target,
        heading:Element = <Element>x.parentNode,
        box:HTMLElement = <HTMLElement>heading.parentNode.parentNode,
        settings:ui_modal = browser.data.modals[box.getAttribute("id")],
        border:HTMLElement = box.getElementsByTagName("div")[0],
        minifyTest:boolean = (box.parentNode.nodeName.toLowerCase() === "li"),
        touch:boolean = (event !== null && event.type === "touchstart"),
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
        drop       = function browser_modal_move_drop(dropEvent:Event):boolean {
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
        boxMove         = function browser_modal_move_boxMove(moveEvent:TouchEvent|MouseEvent):boolean {
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
        if (touch === true) {
            const button:HTMLButtonElement = <HTMLButtonElement>box.getElementsByClassName("minimize")[0];
            button.click();
        }
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
modal.resize = function browser_modal_resize(event:MouseEvent|TouchEvent):void {
    let clientWidth:number  = 0,
        clientHeight:number = 0;
    const node:Element = <Element>event.target,
        parent:Element = <Element>node.parentNode,
        box:HTMLElement = <HTMLElement>parent.parentNode,
        top:number = box.offsetTop,
        left:number = box.offsetLeft,
        body:HTMLDivElement = <HTMLDivElement>box.getElementsByClassName("body")[0],
        heading:HTMLElement = box.getElementsByTagName("h2")[0],
        headingButton:HTMLElement = heading.getElementsByTagName("button")[0],
        touch:boolean = (event !== null && event.type === "touchstart"),
        buttonPadding:number = (box.getElementsByClassName("buttons")[0] === undefined)
            ? 0
            : (box.getElementsByClassName("buttons")[0].getElementsByTagName("button").length * 5),
        header:Element = <Element>box.getElementsByClassName("header")[0],
        headerHeight:number = (header === undefined)
            ? 0
            : (header.clientHeight / 10),
        footer:Element = <Element>box.getElementsByClassName("footer")[0],
        statusMessage:HTMLElement = (footer === undefined)
            ? undefined
            : <HTMLElement>footer.getElementsByClassName("status-message")[0],
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
        footerTextarea:HTMLElement = (footer === undefined)
            ? undefined
            : footer.getElementsByTagName("textarea")[0],
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
            : 0,
        offsetHeight:number    = (mac === true)
            ? 18
            : 0,
        sideHeight:number = headerHeight + statusHeight + footerHeight + 1,
        drop       = function browser_modal_resize_drop():void {
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
        compute = function browser_modal_resize_compute(leftTest:boolean, topTest:boolean, values:[number, number]):void {
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
                    if (statusMessage !== undefined) {
                        statusMessage.style.width = `${(bodyWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        status.style.width = `${bodyWidth - 2}em`;
                        statusBar.style.width = `${(bodyWidth - 4) / 1.5}em`;
                    }
                    if (footerTextarea !== undefined) {
                        footerTextarea.style.width = `${(bodyWidth - 4) / 1.8}em`;
                    }
                } else if (leftTest === false && computedWidth > minWidth) {
                    body.style.width = `${computedWidth}em`;
                    heading.style.width = `${computedWidth + 0.2}em`;
                    headingButton.style.width = `${((computedWidth - buttonPadding) / 1.8)}em`;
                    if (statusMessage !== undefined) {
                        statusMessage.style.width = `${(computedWidth - footerOffset - 4) / 1.5}em`;
                    }
                    if (statusBar !== undefined) {
                        status.style.width = `${computedWidth - 2}em`;
                        statusBar.style.width = `${(computedWidth - 4) / 1.5}em`;
                    }
                    if (footerTextarea !== undefined) {
                        footerTextarea.style.width = `${(computedWidth - 4) / 1.8}em`;
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
            b: function browser_modal_resize_sizeB(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    y:number = (touch === true)
                        ? touchMove.touches[0].clientY
                        : mouseMove.clientY;
                compute(false, false, [-10, y]);
            },
            bl: function browser_modal_resize_sizeBL(moveEvent:MouseEvent|TouchEvent):void {
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
            br: function browser_modal_resize_sizeBR(moveEvent:MouseEvent|TouchEvent):void {
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
            l: function browser_modal_resize_sizeL(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    x:number = (touch === true)
                        ? touchMove.touches[0].clientX
                        : mouseMove.clientX;
                compute(true, false, [x, -10]);
            },
            r: function browser_modal_resize_sizeR(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    x:number = (touch === true)
                        ? touchMove.touches[0].clientX
                        : mouseMove.clientX;
                compute(false, false, [x, -10]);
            },
            t: function browser_modal_resize_sizeT(moveEvent:MouseEvent|TouchEvent):void {
                const mouseMove:MouseEvent = <MouseEvent>moveEvent,
                    touchMove:TouchEvent = <TouchEvent>moveEvent,
                    y:number = (touch === true)
                        ? touchMove.touches[0].clientY
                        : mouseMove.clientY;
                compute(false, true, [-10, y]);
            },
            tl: function browser_modal_resize_sizeTL(moveEvent:MouseEvent|TouchEvent):void {
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
            tr: function browser_modal_resize_sizeTR(moveEvent:MouseEvent|TouchEvent):void {
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

/* Creates a textPad modal */
modal.textPad = function browser_modal_textPad(event:MouseEvent, value?:string, title?:string):void {
    const element:Element = <Element>event.target,
        titleText:string = (typeof title === "string")
            ? title
            : element.innerHTML,
        textArea:HTMLTextAreaElement = document.createElement("textarea"),
        agency:agency = (element === document.getElementById("textPad"))
            ? [browser.data.hashDevice, false, "device"]
            : util.getAgent(element),
        payload:ui_modal = {
            agent: agency[0],
            agentType: "device",
            content: textArea,
            inputs: ["close", "maximize", "minimize"],
            read_only: agency[1],
            title: titleText,
            type: "textPad",
            width: 800
        };
    let box:Element;
    if (typeof value === "string") {
        textArea.value = value;
    }
    textArea.onblur = modal.textSave;
    if (titleText.indexOf("Base64 - ") === 0) {
        textArea.style.whiteSpace = "normal";
    }
    box = modal.create(payload);
    box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].onkeyup = modal.textTimer;
    document.getElementById("menu").style.display = "none";
};

/* Pushes the text content of a textPad modal into settings so that it is saved */
modal.textSave = function browser_modal_textSave(event:MouseEvent):void {
    const element:HTMLTextAreaElement = <HTMLTextAreaElement>event.target,
        box:Element = element.getAncestor("box", "class"),
        data:ui_modal = browser.data.modals[box.getAttribute("id")];
    if (data.timer !== undefined) {
        window.clearTimeout(data.timer);
    }
    data.text_value = element.value;
    network.storage("settings");
};

/* An idle delay is a good time to save written notes */
modal.textTimer = function browser_modal_textTimer(event:KeyboardEvent):void {
    const element:HTMLTextAreaElement = <HTMLTextAreaElement>event.target,
        box:Element = element.getAncestor("box", "class"),
        data:ui_modal = browser.data.modals[box.getAttribute("id")];
    if (data.timer !== undefined) {
        window.clearTimeout(data.timer);
    }
    data.timer = window.setTimeout(function browser_modal_textTimer_delay() {
        window.clearTimeout(data.timer);
        data.text_value = element.value;
        network.storage("settings");
    }, 15000);
}

/* Restore a minimized modal to its prior size and location */
modal.unMinimize = function browser_modal_unMinimize(event:MouseEvent):void {
    const element:Element = <Element>event.target,
        box:Element = element.getAncestor("box", "class"),
        button:HTMLButtonElement = <HTMLButtonElement>box.getElementsByClassName("minimize")[0];
    if (box.parentNode.nodeName.toLowerCase() === "li") {
        button.click();
    }
};

/* Manages z-index of modals and moves a modal to the top on interaction */
modal.zTop = function browser_modal_zTop(event:MouseEvent, elementInput?:Element):void {
    const element:Element = (elementInput === undefined)
            ? <Element>event.target
            : elementInput,
        parent:Element = <Element>element.parentNode,
        grandParent:Element = <Element>parent.parentNode;
    let box:HTMLElement = <HTMLElement>element.getAncestor("box", "class");
    if ((parent.getAttribute("class") === "fileList" || grandParent.getAttribute("class") === "fileList") && event.shiftKey === true) {
        event.preventDefault();
    }
    browser.data.zIndex = browser.data.zIndex + 1;
    browser.data.modals[box.getAttribute("id")].zIndex = browser.data.zIndex;
    box.style.zIndex = browser.data.zIndex.toString();
};

export default modal;