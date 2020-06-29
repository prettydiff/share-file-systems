
/* lib/browser/systems - The systems messaging utility is managed by these methods. */
import browser from "./browser.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

const systems:module_systems = {};

/* Visually hide the systems modal */
systems.close = function local_systems_close(event:MouseEvent):void {
    let box:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
    box = <HTMLElement>box.getAncestor("box", "class");
    if (box.getAttribute("class") === "box") {
        box.style.display = "none";
        // this must remain separated from modal identity as more than one thing users it
        browser.data.modals[box.getAttribute("id")].status = "hidden";
    }
    network.storage("settings");
};

/* Show/hide of stack trace information for error messages in the system log */
systems.expand = function local_systems_expand(event:MouseEvent):void {
    const button:Element = <Element>event.srcElement || <Element>event.target,
        li:Element = <Element>button.parentNode,
        ul:HTMLElement = li.getElementsByTagName("ul")[0],
        modal:Element = document.getElementById("systems-modal"),
        tabs:HTMLElement = <HTMLElement>modal.getElementsByClassName("tabs")[0];
    if (button.innerHTML.indexOf("+") === 0) {
        ul.style.display = "block";
        button.innerHTML = "-<span>Collapse stack trace</span>";
        button.setAttribute("title", "Collapse stack trace");
    } else {
        ul.style.display = "none";
        button.innerHTML = "+<span>Expand stack trace</span>";
        button.setAttribute("title", "Expand stack trace");
    }
    tabs.style.width = `${modal.getElementsByClassName("body")[0].scrollWidth / 10}em`;
};

/* Processes messages into the system log modal */
systems.message = function local_systems_message(type:messageType, content:string, timeStore?:string):void {
    const dateString:string = util.dateFormat(new Date()),
        li:Element = document.createElement("li"),
        span:Element = document.createElement("span"),
        text:Text = document.createTextNode("");
    let list:Element,
        ul:Element;
    if (browser.loadTest === true) {
        span.innerHTML = timeStore;
    } else {
        span.innerHTML = `[${dateString}]`;
    }
    content = content.replace(/(\d+m)?\[\d+m/g, "");
    if (type === "errors") {
        const messageContent:messageError = JSON.parse(content),
            button:HTMLButtonElement = document.createElement("button");
        let stackItem:Element;
        ul = document.createElement("ul");
        ul.setAttribute("class", "stack");
        if (messageContent.stack === undefined) {
            if (browser.loadTest === false) {
                browser.messages.errors.push([`[${dateString}]`, `Native Node Error: ${content}`, []]);
            }
            text.textContent = `Native Node Error: ${content}`;
        } else {
            button.setAttribute("class", "expansion");
            button.innerHTML = "+<span>Expand stack trace</span>";
            button.setAttribute("title", "Expand stack trace");
            button.onclick = systems.expand;
            messageContent.stack.forEach(function local_systems_message_stack(value:string) {
                if (value.replace(/\s+/, "") !== "") {
                    stackItem = document.createElement("li");
                    stackItem.innerHTML = value;
                    ul.appendChild(stackItem);
                }
            });
            li.appendChild(button);
            text.textContent = messageContent.error.replace(/^\s*Error:\s*/, "");
            if (browser.loadTest === false) {
                browser.messages.errors.push([`[${dateString}]`, messageContent.error.replace(/^\s*Error:\s*/, ""), messageContent.stack]);
            }
        }
    } else {
        text.textContent = content;
        if (browser.loadTest === false) {
            browser.messages[type].push([`[${dateString}]`, content]);
        }
    }
    li.appendChild(span);
    list = document.getElementById(`system-${type}`);
    if (browser.loadTest === false && list.childNodes.length > 49) {
        list.removeChild(list.getElementsByTagName("li")[0]);
        browser.messages[type].splice(0, 1);
    }
    li.appendChild(text);
    if (type === "errors") {
        li.appendChild(ul);
    }
    list.appendChild(li);
    if (JSON.stringify(browser.messages) !== "{\"status\":[],\"users\":[],\"errors\":[]}") {
        network.storage("messages");
    }
};

/* Shows the system log modal in the correct visual status */
systems.modal = function local_systems_modal(event:MouseEvent):void {
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

/* Content of the systems log modal */
systems.modalContent = function local_systems_modalContent():Element {
    const systemsElement:Element = document.createElement("div");
    let ul:Element = document.createElement("ul"),
        li:Element = document.createElement("li"),
        button:HTMLButtonElement = document.createElement("button");
    ul.setAttribute("class", "tabs");
    button.innerHTML = "⎔ System";
    button.setAttribute("class", "status active");
    button.onclick = systems.tabs;
    li.appendChild(button);
    ul.appendChild(li);
    li = document.createElement("li");
    button = document.createElement("button");
    button.innerHTML = "⎋ Users";
    button.setAttribute("class", "users");
    button.onclick = systems.tabs;
    li.appendChild(button);
    ul.appendChild(li);
    li = document.createElement("li");
    button = document.createElement("button");
    button.innerHTML = "⌁ Errors";
    button.setAttribute("class", "errors");
    button.onclick = systems.tabs;
    li.appendChild(button);
    ul.appendChild(li);
    systemsElement.appendChild(ul);
    ul = document.createElement("ul");
    ul.setAttribute("id", "system-status");
    ul.setAttribute("class", "messageList active");
    systemsElement.appendChild(ul);
    ul = document.createElement("ul");
    ul.setAttribute("id", "system-users");
    ul.setAttribute("class", "messageList");
    systemsElement.appendChild(ul);
    ul = document.createElement("ul");
    ul.setAttribute("id", "system-errors");
    ul.setAttribute("class", "messageList");
    systemsElement.appendChild(ul);
    return systemsElement;
};

/* Toggles tabs in the systems log modal */
systems.tabs = function local_systems_tabs(event:MouseEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        parent:Element = <Element>element.parentNode.parentNode,
        className:string = element.getAttribute("class").replace(" active", "");
    if (className === "status") {
        element.setAttribute("class", "status active");
        parent.getElementsByClassName("users")[0].setAttribute("class", "users");
        parent.getElementsByClassName("errors")[0].setAttribute("class", "errors");
        document.getElementById("system-status").setAttribute("class", "messageList active");
        document.getElementById("system-users").setAttribute("class", "messageList");
        document.getElementById("system-errors").setAttribute("class", "messageList");
    } else if (className === "users") {
        element.setAttribute("class", "users active");
        parent.getElementsByClassName("status")[0].setAttribute("class", "status");
        parent.getElementsByClassName("errors")[0].setAttribute("class", "errors");
        document.getElementById("system-status").setAttribute("class", "messageList");
        document.getElementById("system-users").setAttribute("class", "messageList active");
        document.getElementById("system-errors").setAttribute("class", "messageList");
    } else if (className === "errors") {
        element.setAttribute("class", "errors active");
        parent.getElementsByClassName("status")[0].setAttribute("class", "status");
        parent.getElementsByClassName("users")[0].setAttribute("class", "users");
        document.getElementById("system-status").setAttribute("class", "messageList");
        document.getElementById("system-users").setAttribute("class", "messageList");
        document.getElementById("system-errors").setAttribute("class", "messageList active");
    }
    browser.data.modals["systems-modal"].text_value = className;
    network.storage("settings");
};

export default systems;