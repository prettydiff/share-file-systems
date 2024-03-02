
/* lib/browser/utilities/file_new - File system new artifact function from the context menu. */

import browser from "./browser.js";
import context_menu from "./context_menu.js";
import file_directory from "./file_directory.js";
import file_select from "./file_select.js";
import util from "./util.js";

const file_new = function browser_utilities_fileNew(event:Event):void {
    const element:HTMLElement = event.target as HTMLElement,
        menu:HTMLElement = document.getElementById("contextMenu"),
        cancel = function browser_utilities_fileNew_cancel(actionElement:HTMLElement):void {
            const list:HTMLElement = actionElement.getAncestor("fileList", "class"),
                input:HTMLElement = list.getElementsByTagName("input")[0] as HTMLElement;
            setTimeout(function browser_utilities_fileNew_cancel_delay():void {
                if (actionElement.parentNode.parentNode.parentNode.parentNode === list) {
                    list.removeChild(actionElement.parentNode.parentNode.parentNode);
                    input.focus();
                }
            }, 10);
        },
        actionKeyboard = function browser_utilities_fileNew_actionKeyboard(actionEvent:KeyboardEvent):void {
            const actionElement:HTMLInputElement = actionEvent.target as HTMLInputElement,
                actionParent:HTMLElement = actionElement.parentNode;
            if (actionEvent.key === "Enter") {
                const value:string = actionElement.value.replace(/(\s+|\.)$/, ""),
                    agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(actionParent, null),
                    payload:service_fileSystem = {
                        action: "fs-new",
                        agentRequest: agents[0],
                        agentSource: agents[1],
                        agentWrite: null,
                        depth: 1,
                        location: [actionElement.dataset.location + value],
                        name: actionElement.dataset.type
                    };
                if (value.replace(/\s+/, "") !== "") {
                    actionElement.onkeyup = null;
                    actionElement.onblur = null;
                    actionParent.appendText(payload.location[0], true);
                    browser.send(payload, "file-system");
                }
            } else {
                if (actionEvent.key === "Escape") {
                    cancel(actionElement);
                    return;
                }
                actionElement.value = actionElement.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
            }
        },
        actionBlur = function browser_utilities_fileNew_actionBlur(actionEvent:FocusEvent):void {
            const actionElement:HTMLInputElement = actionEvent.target as HTMLInputElement,
                value:string = actionElement.value.replace(/(\s+|\.)$/, "");
            if (actionEvent.type === "blur") {
                if (value.replace(/\s+/, "") === "") {
                    cancel(actionElement);
                } else {
                    const actionParent:HTMLElement = actionElement.parentNode,
                        agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(actionParent, null),
                        payload:service_fileSystem = {
                            action: "fs-new",
                            agentRequest: agents[0],
                            agentSource: agents[1],
                            agentWrite: null,
                            depth: 1,
                            location: [actionElement.dataset.location + value],
                            name: actionElement.dataset.type
                        };
                    actionElement.onkeyup = null;
                    actionElement.onblur = null;
                    actionParent.appendText(payload.location[0], true);
                    browser.send(payload, "file-system");
                }
            }
        },
        build = function browser_utilities_fileNew_build():void {
            const li:HTMLElement = document.createElement("li"),
                label:HTMLLabelElement = document.createElement("label"),
                input:HTMLInputElement = document.createElement("input"),
                field:HTMLInputElement = document.createElement("input"),
                text:HTMLElement = document.createElement("label"),
                p:HTMLElement = document.createElement("p"),
                spanInfo:HTMLElement = document.createElement("span"),
                parent:HTMLElement = (browser.contextElement === null)
                    ? null
                    : browser.contextElement.parentNode,
                box:modal = (parent === null)
                    ? null
                    : parent.getAncestor("box", "class"),
                type:contextType = (browser.contextType !== "")
                    ? browser.contextType
                    : (element.innerHTML.indexOf("New File") === 0)
                        ? "file"
                        : "directory",
                span:HTMLElement = document.createElement("span");

            if (parent === null) {
                return;
            }
            let slash:"/"|"\\" = "/",
                path:string = box.getElementsByTagName("input")[0].value;

            li.setAttribute("class", type);
            if (type === "directory") {
                li.ondblclick = file_directory;
            }
            path = box.getElementsByTagName("input")[0].value;
            if (path.indexOf("/") < 0 || (path.indexOf("\\") < path.indexOf("/") && path.indexOf("\\") > -1 && path.indexOf("/") > -1)) {
                slash = "\\";
            }
            if (path.charAt(path.length - 1) !== slash) {
                path = path + slash;
            }
            input.type = "checkbox";
            input.checked = false;
            label.appendText("Selected");
            label.appendChild(input);
            label.setAttribute("class", "selection");
            p.appendChild(text);
            spanInfo.appendText((type === "file")
                ? "file - 0 bytes"
                : "directory - 0 items");
            p.appendChild(spanInfo);
            text.oncontextmenu = context_menu;
            text.onclick = file_select;
            text.appendText(path);
            field.onkeyup = actionKeyboard;
            field.onblur = actionBlur;
            field.setAttribute("id", "newFileItem");
            field.setAttribute("data-type", type);
            field.setAttribute("data-location", path);
            text.appendChild(field);
            li.appendChild(p);
            span.onclick = file_select;
            span.oncontextmenu = context_menu;
            li.appendChild(span);
            li.oncontextmenu = context_menu;
            li.appendChild(label);
            li.onclick = file_select;
            if (browser.contextElement.lowName() === "ul") {
                browser.contextElement.appendChild(li);
            } else {
                browser.contextElement.parentNode.appendChild(li);
            }
            field.focus();
        };
    if (document.getElementById("newFileItem") !== null) {
        return;
    }
    build();
    browser.contextElement = null;
    browser.contextType = "";
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

export default file_new;