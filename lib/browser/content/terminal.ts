
/* lib/browser/content/terminal - A library to process command terminal output in the browser. */

import util from "../utilities/util.js";

// cspell:words agenttype

/**
 * Interaction methods for the command terminal in the browser.
 * ```typescript
 * interface module_browserTerminal {
 *     populate: (element:HTMLElement, logs:string[]) => HTMLElement;
 *     receive: (socketData:socketData) => void;
 *     send: () => void;
 * }
 * ``` */
const terminal:module_browserTerminal = {
    populate: function browser_content_terminalPopulate(element:HTMLElement, logs:string[]):HTMLElement {
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
        return element;
    },
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
    send: function browser_content_terminalSend():void {}
};

export default terminal;