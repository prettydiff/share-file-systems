
/* lib/browser/content/terminal - A library to process command terminal output in the browser. */

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

// cspell:words agenttype, arrowdown, arrowup

/**
 * Interaction methods for the command terminal in the browser.
 * ```typescript
 * interface module_browserTerminal {
 *     content: () => [HTMLElement, HTMLElement];
 *     events: {
 *         receive: (socketData:socketData) => void;
 *         send: (event:KeyboardEvent) => void;
 *     };
 *     populate: (element:HTMLElement, logs:string[]) => void;
 * }
 * ``` */
const terminal:module_browserTerminal = {
    content: function browser_content_terminal_content():[HTMLElement, HTMLElement] {
        const footer:HTMLElement = document.createElement("div"),
            cwd:HTMLElement = document.createElement("p"),
            logs:HTMLElement = document.createElement("ol"),
            label:HTMLElement = document.createElement("label"),
            span:HTMLElement = document.createElement("span"),
            textArea:HTMLTextAreaElement = document.createElement("textarea");
        logs.setAttribute("class", "terminal-list");
        cwd.setAttribute("class", "terminal-cwd");
        footer.setAttribute("class", "footer");
        label.setAttribute("class", "terminal");
        textArea.setAttribute("wrap", "hard");
        textArea.setAttribute("spellcheck", "false");
        textArea.onkeyup = terminal.events.send;
        textArea.onmouseup = modal.events.footerResize;
        textArea.onblur = modal.events.textSave;
        span.appendText("Terminal command input");
        cwd.appendText(browser.projectPath);
        label.appendChild(span);
        label.appendChild(textArea);
        footer.appendChild(cwd);
        footer.appendChild(label);
        terminal.populate(logs, browser.terminalLogs);
        return [logs, footer];
    },
    events: {
        receive: function browser_content_terminalReceive(socketData:socketData):void {
            const data:service_terminal_output = socketData.data as service_terminal_output,
                terminals:HTMLElement[] = document.getModalsByModalType("terminal"),
                each = function browser_content_terminal_each(element:HTMLElement):void {
                    if (element.dataset.agent === data.agentSource.agent && element.dataset.agenttype === data.agentSource.agentType) {
                        terminal.populate(element.getElementsByClassName("body")[0].getElementsByTagName("ol")[0], data.logs);
                    }
                };
            terminals.forEach(each);
        },
        send: function browser_content_terminalSend(event:KeyboardEvent):void {
            const key:string = event.key.toLowerCase(),
                target:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
                value:string = target.value.replace(/^\s+/, "").replace(/\s+$/, ""),
                box:HTMLElement = target.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                history:string[] = browser.data.modals[id].history;
            let index:number = (isNaN(browser.data.modals[id].historyIndex))
                    ? browser.data.modals[id].history.length
                    : browser.data.modals[id].historyIndex;
            event.preventDefault();
            if (key === "enter") {
                if (value === "clear") {
                    box.getElementsByClassName("body")[0].getElementsByTagName("ol")[0].appendText("", true);
                } else {
                    const agentType:agentType = box.dataset.agenttype as agentType,
                        payload:service_terminal_input = {
                            agentRequest: (agentType === "device")
                                ? {
                                    agent: browser.data.hashDevice,
                                    agentType: "device"
                                }
                                : {
                                    agent: browser.data.hashUser,
                                    agentType: "user"
                                },
                            agentSource: {
                                agent: box.dataset.agent,
                                agentType: agentType
                            },
                            directory: target.parentNode.parentNode.getElementsByClassName("terminal-cwd")[0].innerHTML,
                            instruction: value
                        };
                    network.send(payload, "terminal-input");
                }
                if (history[history.length - 1] !== value) {
                    history.push(value);
                }
                browser.data.modals[id].text_value = "";
                target.value = "";
                network.configuration();
                return;
            }
            if (key === "arrowup") {
                if (index > 0) {
                    index = index - 1;
                    target.value = history[index];
                    browser.data.modals[id].historyIndex = index;
                    network.configuration();
                }
                return;
            }
            if (key === "arrowdown") {
                if (index < history.length) {
                    index = index + 1;
                    if (index === history.length) {
                        target.value = browser.data.modals[id].text_value;
                    } else {
                        target.value = history[index];
                    }
                    browser.data.modals[id].historyIndex = index;
                    network.configuration();
                }
                return;
            }
            if (key === "tab") {
                return;
            }
            modal.events.textTimer(event);
        }
    },
    populate: function browser_content_terminalPopulate(element:HTMLElement, logs:string[]):void {
        const each = function browser_content_terminalPopulate_each(logItem:string):void {
                let count:number = 0;
                const li:HTMLElement = document.createElement("li"),
                    names:stringStore = {
                        "1": "bold",
                        "3": "italic",
                        "4": "underline",
                        "22": "no-bold",
                        "23": "no-italic",
                        "24": "no-underline",
                        "30": "black",
                        "31": "red",
                        "32": "green",
                        "33": "yellow",
                        "34": "blue",
                        "35": "purple",
                        "36": "cyan",
                        "37": "white",
                        "39": "no-color"
                    },
                    list = function browser_content_terminalPopulate_list(result:string):string {
                        let formatList = result.replace(/^\u001b\[/, "").replace(/m\u001b\[/g, "|").replace(/m$/, "").split("|"),
                            index:number = formatList.indexOf("0"),
                            endString:string = "";
                        if (index > -1) {
                            if (index === 0) {
                                endString = end();
                                do {
                                    formatList.splice(0, 1);
                                    index = formatList.indexOf("0");
                                } while (index === 0);
                            }
                            formatList = formatList.slice(0, index);
                        }
                        formatList.forEach(function browser_Content_terminalPopulate_list_each(value:string, index:number, list:string[]):void {
                            list[index] = names[value];
                        });
                        count = count + 1;
                        return `${endString}<span class="${formatList.join(" ")}">`;
                    },
                    end = function browser_content_terminalPopulate_end():string {
                        if (count > 0) {
                            let output:string = "";
                            do {
                                count = count - 1;
                                output = output + "</span>";
                            } while (count > 0);
                            return output;
                        }
                        return "";
                    };
                logItem = util.sanitizeHTML(logItem);
                do {
                    logItem = logItem.replace(/(\u001b\[\d{1,2}m)+/g, list).replace(/\u001b\[0m/g, end);
                } while ((/(\u001b\[\d{1,2}m)+/).test(logItem) === true);
                if (count > 0) {
                    logItem = logItem + "</span>";
                }
                // eslint-disable-next-line
                li.innerHTML = logItem;
                element.appendChild(li);
            },
            parent:HTMLElement = element.parentNode,
            scrollBottom:boolean = (parent !== null && (parent.scrollTop === 0 || parent.scrollTop + parent.clientHeight === parent.scrollHeight));
        logs.forEach(each);
        if (scrollBottom === true) {
            parent.scrollTo(0, parent.scrollHeight);
        }
    }
};

export default terminal;