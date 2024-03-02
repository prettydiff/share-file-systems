
/* lib/browser/utilities/context_rename - File system rename function from the context menu. */

import browser from "./browser.js";
import util from "./util.js";

const context_rename = function browser_utilities_contextRename(event:KeyboardEvent|MouseEvent):void {
    const element:HTMLElement = (browser.contextElement === null)
            ? event.target
            : browser.contextElement,
        box:modal = element.getAncestor("box", "class"),
        input:HTMLInputElement = document.createElement("input"),
        li:HTMLElement = element.getAncestor("li", "tag"),
        menu:HTMLElement = document.getElementById("contextMenu"),
        action = function browser_utilities_contextRename_action(action:KeyboardEvent):void {
            const field:HTMLInputElement = action.target as HTMLInputElement,
                actionComplete = function browser_utilities_contextRename_actionComplete(field:HTMLInputElement, labelValue:string):void {
                    field.onblur = null;
                    field.onkeyup = null;
                    label.removeChild(field);
                    label.appendText(labelValue);
                };
            if (action.type === "keyup" && action.key === "Escape") {
                actionComplete(field, text);
                return;
            }
            if (action.type === "blur" || (action.type === "keyup" && action.key === "Enter")) {
                field.value = field.value.replace(/(\s+|\.)$/, "");
                const agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                    slash:"/" | "\\" = (text.indexOf("/") < 0 || (text.indexOf("\\") < text.indexOf("/") && text.indexOf("\\") > -1 && text.indexOf("/") > -1))
                        ? "\\"
                        : "/",
                    payload:service_fileSystem = {
                        action: "fs-rename",
                        agentRequest: agents[0],
                        agentSource: agents[1],
                        agentWrite: null,
                        depth: 1,
                        location: [agents[1].modalAddress + slash + text],
                        name: field.value
                    };
                actionComplete(field, field.value);
                browser.send(payload, "file-system");
            } else if (action.type === "keyup") {
                field.value = field.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
            }
        },
        label:HTMLElement = li.getElementsByTagName("label")[0],
        text:string = label.textContent;
    if (document.getElementById("fsRename") !== null) {
        return;
    }
    input.setAttribute("id", "fsRename");
    input.type = "text";
    input.value = text;
    input.onblur = action as (event:Event) => void;
    input.onkeyup = action;
    label.removeChild(label.firstChild);
    label.appendChild(input);
    input.focus();
    browser.contextElement = null;
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

export default context_rename;