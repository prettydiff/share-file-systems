
/* lib/browser/content/terminal - A library to process command terminal output in the browser. */

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

// cspell:words agenttype, arrowdown, arrowup, pagedown, pageup

/**
 * Interaction methods for the command terminal in the browser.
 * ```typescript
 * interface module_browserTerminal {
 *     content: () => [HTMLElement, HTMLElement];
 *     events: {
 *         close: (event:MouseEvent) => void;
 *         command: (event:KeyboardEvent) => void;
 *         keyInput: (event:KeyboardEvent) => void;
 *         keyOutput: (event:KeyboardEvent) => void;
 *         receive: (socketData:socketData) => void;
 *     };
 *     tools: {
 *         controlKeys: (event:KeyboardEvent, list:HTMLElement) => void;
 *         populate: (box:modal, logs:string[], restore:boolean) => void;
 *         send: (box:modal, command:string, autoComplete:boolean) => void;
 *     };
 * }
 * ``` */
const terminal:module_browserTerminal = {
    content: function browser_content_terminal_content():[HTMLElement, HTMLElement] {
        const footer:HTMLElement = document.createElement("div"),
            cwd:HTMLElement = document.createElement("p"),
            logs:HTMLElement = document.createElement("ol"),
            label:HTMLElement = document.createElement("label"),
            span:HTMLElement = document.createElement("span"),
            textArea:HTMLTextAreaElement = document.createElement("textarea"),
            scroll:terminal_scroll = {
                position: -1,
                entries: []
            };
        logs.setAttribute("data-scroll", JSON.stringify(scroll));
        logs.setAttribute("class", "terminal-list");
        logs.onkeyup = terminal.events.keyOutput;
        cwd.setAttribute("class", "terminal-cwd");
        footer.setAttribute("class", "footer");
        label.setAttribute("class", "terminal");
        textArea.setAttribute("wrap", "hard");
        textArea.setAttribute("spellcheck", "false");
        textArea.onkeydown = terminal.events.command;
        textArea.onkeyup = terminal.events.keyInput;
        textArea.onmouseup = modal.events.footerResize;
        textArea.onblur = modal.events.textSave;
        span.appendText("Terminal command input");
        label.appendChild(span);
        label.appendChild(textArea);
        footer.appendChild(cwd);
        footer.appendChild(label);
        return [logs, footer];
    },
    events: {
        close: function browser_content_terminal_close(event:MouseEvent):void {
            const box:modal = event.target.getAncestor("box", "class");
            terminal.tools.send(box, "close-modal", false);
            modal.events.close(event);
        },
        command: function browser_content_terminal_command(event:KeyboardEvent):void {
            const key:string = event.key.toLowerCase(),
                target:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
                box:modal = target.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                list:HTMLElement = box.getElementsByClassName("terminal-list")[0] as HTMLElement,
                clearTarget = function browser_content_terminal_command():void {
                    browser.data.modals[id].text_value = "";
                    browser.data.modals[id].historyIndex = browser.data.modals[id].history.length;
                    target.value = "";
                    network.configuration();
                };
            if (key === "c" && event.ctrlKey === true) {
                terminal.tools.send(box, "close-modal", false);
                terminal.tools.populate(box, [""], false);
                clearTarget();
                return;
            }
            if (key === "enter" && event.shiftKey === false) {
                const value:string = target.value,
                    history:string[] = browser.data.modals[id].history;
                event.preventDefault();
                if (value === "clear") {
                    const scroll:terminal_scroll = {
                        position: -1,
                        entries: []
                    };
                    list.appendText("", true);
                    list.setAttribute("data-scroll", JSON.stringify(scroll));
                } else if (value === "") {
                    terminal.tools.populate(box, [""], false);
                } else {
                    terminal.tools.send(box, value, false);
                }
                if (history[history.length - 1] !== value && value !== "") {
                    history.push(value);
                }
                clearTarget();
            }
        },
        keyInput: function browser_content_terminal_keyInput(event:KeyboardEvent):void {
            const key:string = event.key.toLowerCase(),
                target:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
                value:string = target.value.replace(/^\s+/, "").replace(/\s+$/, ""),
                box:modal = target.getAncestor("box", "class"),
                list:HTMLElement = box.getElementsByClassName("terminal-list")[0] as HTMLElement,
                id:string = box.getAttribute("id"),
                history:string[] = browser.data.modals[id].history;
            let index:number = (isNaN(browser.data.modals[id].historyIndex))
                    ? browser.data.modals[id].history.length
                    : browser.data.modals[id].historyIndex;
            event.preventDefault();
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
            if (key === "insert") {
                terminal.tools.send(box, value, true);
                modal.events.textTimer(event);
                return;
            }
            if (key === "end" || key === "home" || key === "pagedown" || key === "pageup") {
                terminal.tools.controlKeys(event, list);
                return;
            }
            modal.events.textTimer(event);
        },
        keyOutput: function browser_content_terminal_keyOutput(event:KeyboardEvent):void {
            const list:HTMLElement = event.target;
            terminal.tools.controlKeys(event, list);
        },
        receive: function browser_content_terminal_receive(socketData:socketData):void {
            const data:service_terminal = socketData.data as service_terminal,
                write = function browser_content_terminal_receive_update(box:modal):void {
                    if (box !== null) {
                        const cwd:HTMLElement = box.getElementsByClassName("terminal-cwd")[0] as HTMLElement;
                        terminal.tools.populate(box, data.logs, false);
                        if (browser.data.modals[data.id] !== null && browser.data.modals[data.id].text_placeholder !== data.directory) {
                            browser.data.modals[data.id].text_placeholder = data.directory;
                        }
                        cwd.appendText(data.directory, true);
                        network.configuration();
                    }
                };
            if (data.id === "all") {
                const terminals:HTMLElement[] = document.getModalsByModalType("terminal"),
                    each = function browser_content_terminal_each(box:modal):void {
                        if (box.dataset.agent === data.agentSource.agent && box.dataset !== undefined && box.dataset.agenttype === data.agentSource.agentType) {
                            write(box);
                        }
                    };
                terminals.forEach(each);
            } else if (data.autoComplete > -1) {
                const box:modal = document.getElementById(data.id);
                if (box !== null) {
                    const textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
                    textArea.value = data.instruction;
                    textArea.selectionStart = data.autoComplete;
                    textArea.selectionEnd = data.autoComplete;
                }
            } else {
                const box:modal = document.getElementById(data.id);
                write(box);
            }
        }
    },
    tools: {
        controlKeys: function browser_content_terminal_controlKeys(event:KeyboardEvent, list:HTMLElement):void {
            const key:string = event.key.toLowerCase();
            if (key === "end") {
                const parent:HTMLElement = list.parentNode;
                parent.scrollTo(parent.scrollLeft, parent.scrollHeight);
                return;
            }
            if (key === "home") {
                const parent:HTMLElement = list.parentNode;
                parent.scrollTo(parent.scrollLeft, 0);
                return;
            }
            if (key === "pagedown" && event.shiftKey === true) {
                const items:HTMLCollectionOf<HTMLElement> = list.getElementsByTagName("li"),
                    parent:HTMLElement = list.parentNode,
                    scroll:terminal_scroll = JSON.parse(list.dataset.scroll) as terminal_scroll,
                    scrollPosition:number = scroll.position + 1,
                    position:number = (scroll.entries[scrollPosition] === undefined || items[scroll.entries[scrollPosition]] === undefined)
                        ? parent.scrollHeight
                        : items[scroll.entries[scrollPosition]].offsetTop;
                parent.scrollTo(parent.scrollLeft, position);
                scroll.position = (scrollPosition < scroll.entries.length)
                    ? scroll.position = scrollPosition
                    : scroll.entries.length;
                list.setAttribute("data-scroll", JSON.stringify(scroll));
                return;
            }
            if (key === "pagedown") {
                const parent:HTMLElement = list.parentNode;
                parent.scrollTo(parent.scrollLeft, parent.clientHeight + parent.scrollTop);
                return;
            }
            if (key === "pageup" && event.shiftKey === true) {
                const items:HTMLCollectionOf<HTMLElement> = list.getElementsByTagName("li"),
                    parent:HTMLElement = list.parentNode,
                    scroll:terminal_scroll = JSON.parse(list.dataset.scroll) as terminal_scroll,
                    scrollPosition:number = scroll.position - 1,
                    position:number = (scroll.entries[scrollPosition] === undefined || items[scroll.entries[scrollPosition]] === undefined)
                        ? 0
                        : items[scroll.entries[scrollPosition]].offsetTop;
                parent.scrollTo(parent.scrollLeft, position);
                scroll.position = (scrollPosition < 0)
                    ? -1
                    : scrollPosition;
                list.setAttribute("data-scroll", JSON.stringify(scroll));
                return;
            }
            if (key === "pageup") {
                const parent:HTMLElement = list.parentNode,
                    height:number = parent.clientHeight,
                    top:number = parent.scrollTop,
                    vertical:number = (height > top)
                        ? 0
                        : top - height;
                parent.scrollTo(parent.scrollLeft, vertical);
                return;
            }
        },
        populate: function browser_content_terminal_populate(box:modal, logs:string[], restore:boolean):void {
            const element:HTMLElement = box.getElementsByClassName("terminal-list")[0] as HTMLElement,
                id:string = box.getAttribute("id"),
                items:number = element.getElementsByTagName("li").length,
                each = function browser_content_terminalPopulate_each(logItem:string):void {
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
                        ansi:RegExp = (/(\u001b\[\d{1,2}(;\d{1,2})*m)+/),
                        list = function browser_content_terminalPopulate_list(result:string):string {
                            let formatList:string[] = result.replace(/^\u001b\[/, "").replace(/m\u001b\[/g, "|").replace(/m$/, "").replace(/;/g, "|").split("|"),
                                index:number = formatList.indexOf("0"),
                                endString:string = "";
                            if (result === "\u001b[0m") {
                                return "\u001b[0m";
                            }
                            if (index > -1) {
                                if (index === 0) {
                                    endString = end();
                                    do {
                                        formatList.splice(0, 1);
                                        index = formatList.indexOf("0");
                                    } while (index === 0);
                                }
                                if (index > 0) {
                                    formatList = formatList.slice(0, index);
                                }
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
                    if (restore === false) {
                        browser.data.modals[id].string_store.push(logItem);
                    }
                    logItem = util.sanitizeHTML(logItem);
                    do {
                        logItem = logItem.replace(ansi, list).replace(/\u001b\[0m/g, end);
                    } while (ansi.test(logItem) === true);
                    if (count > 0) {
                        logItem = logItem + "</span>";
                    }
                    // eslint-disable-next-line
                    li.innerHTML = logItem;
                    element.appendChild(li);
                },
                oldScroll:terminal_scroll = JSON.parse(element.dataset.scroll) as terminal_scroll,
                scroll:terminal_scroll = {
                    position: oldScroll.entries.length,
                    entries: oldScroll.entries
                },
                parent:HTMLElement = element.parentNode,
                scrollBottom:boolean = (parent !== null && (parent.scrollTop === 0 || parent.scrollTop + parent.clientHeight === parent.scrollHeight));
            scroll.entries.push(logs.length + items);
            logs.forEach(each);
            element.setAttribute("data-scroll", JSON.stringify(scroll));
            if (scrollBottom === true) {
                parent.scrollTo(0, parent.scrollHeight);
            }
        },
        send: function browser_content_terminal_send(box:modal, command:string, autoComplete:boolean):void {

            // send close signal on modal close
            // capture c + ctrl - without alt or shift

            const agentType:agentType = box.dataset.agenttype as agentType,
                payload:service_terminal = {
                    agentRequest: (agentType === "device")
                        ? {
                            agent: browser.data.hashDevice,
                            agentType: "device",
                            share: box.getAttribute("id")
                        }
                        : {
                            agent: browser.data.hashUser,
                            agentType: "user"
                        },
                    agentSource: {
                        agent: box.dataset.agent,
                        agentType: agentType
                    },
                    autoComplete: (autoComplete === true)
                        ? box.getElementsByTagName("textarea")[0].selectionStart
                        : -1,
                    directory: box.getElementsByClassName("terminal-cwd")[0].innerHTML,
                    id: box.getAttribute("id"),
                    instruction: command,
                    logs: [],
                    target: "agentSource"
                };
            network.send(payload, "terminal");
        }
    }
};

export default terminal;