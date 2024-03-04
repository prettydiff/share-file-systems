
/* lib/browser/utilities/modal - A collection of utilities for generating and manipulating modals/windows in the browser. */

import browser from "./browser.js";
import common from "../../common/common.js";
import file_address from "./file_address.js";
import file_text from "./file_text.js";
import invite_decline from "./invite_decline.js";
import media from "../content/media.js";
import media_kill from "./media_kill.js";
import modal_close from "./modal_close.js";
import modal_textSave from "./modal_textSave.js";
import util from "./util.js";
import webSocket from "./webSocket.js";
import zTop from "./zTop.js";

// cspell:words agenttype

/**
 * Provides generic modal specific interactions such as resize, move, generic modal buttons, and so forth.
 * ```typescript
 * interface module_modal {
 *     content: (options:config_modal) => modal; // Creates a new modal.
 *     events: {
 *         close         : (event:MouseEvent) => void;                               // Closes a modal by removing it from the DOM, removing it from state, and killing any associated media.
 *         closeEnduring : (event:MouseEvent) => void;                               // Modal types that are enduring are hidden, not destroyed, when closed.
 *         confirm       : (event:MouseEvent) => void;                               // Handling for an optional confirmation button.
 *         footerResize  : (event:MouseEvent) => void;                               // If a resizable textarea element is present in the modal outside the body this ensures the body is the correct size.
 *         importSettings: (event:MouseEvent) => void;                               // Handler for import/export modals that modify saved settings from an imported JSON string then reloads the page.
 *         maximize      : (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void; // Maximizes a modal to fill the view port.
 *         minimize      : (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void; // Minimizes a modal to the tray at the bottom of the page.
 *         move          : (event:MouseEvent|TouchEvent) => void;                    // Allows dragging a modal around the screen.
 *         resize        : (event:MouseEvent|TouchEvent, boxElement?:modal) => void; // Resizes a modal respective to the event target, which could be any of 4 corners or 4 sides.
 *         textSave      : (event:Event) => void;                                    // Handler to push the text content of a text-pad modal into settings so that it is saved.
 *         textTimer     : (event:KeyboardEvent) => void;                            // A timing event so that contents of a text-pad modal are automatically save after a brief duration of focus blur.
 *         zTop          : (event:KeyboardEvent|MouseEvent, elementInput?:HTMLElement) => void; // Processes visual overlapping or depth of modals.
 *     };
 *     tools: {
 *         dynamicWidth : (box:modal, width:number, buttonCount:number) => [number, number]; // uniformly calculates widths for modal headings and status bars.
 *         forceMinimize: (id:string) => void;                                               // Modals that do not have a minimize button still need to conform to minimize from other interactions.
 *         textModal    : (title:string, value:string, type:modalType) => HTMLElement;       // Defines the content of a textarea modal in a uniform way.
 *     };
 * }
 * ``` */
const modal:module_modal = {

    /* Modal creation factory */
    content: function browser_utilities_modal_content(options:config_modal):modal {
        let buttonCount:number = 0,
            section:HTMLElement = document.createElement("h2"),
            input:HTMLInputElement,
            extra:HTMLElement,
            widths:[number, number] = null;
        const id:string = (options.type === "configuration")
                ? "configuration-modal"
                : (options.id || `${options.type}-${Math.random().toString() + String(browser.ui.zIndex + 1)}`),
            textType:boolean = (options.type === "export" || options.type === "file-edit" || options.type === "text-pad"),
            titleButton:HTMLButtonElement = document.createElement("button"),
            box:modal = document.createElement("article"),
            body:HTMLElement = (textType === true)
                ? options.content
                : document.createElement("div"),
            border:HTMLElement = document.createElement("div"),
            modalCount:number = Object.keys(browser.ui.modals).length,
            button = function browser_utilities_modal_content_fileNavigateButtons(config:config_modal_button):void {
                const el:HTMLButtonElement = document.createElement("button");
                el.setAttribute("type", "button");
                el.appendText(config.text);
                if (config.spanText !== null) {
                    const span:HTMLElement = document.createElement("span");
                    span.appendText(config.spanText);
                    el.appendChild(span);
                }
                el.setAttribute("class", config.class);
                el.setAttribute("title", config.title);
                el.onclick = config.event;
                config.parent.appendChild(el);
            },
            socket:WebSocket = (options.socket === true)
                ? webSocket.start(null, browser.identity.hashDevice, options.type)
                : null;
        // Uniqueness constraints
        if (browser.ui.modalTypes.indexOf(options.type) > -1) {
            if (options.single === true) {
                const keys:string[] = Object.keys(browser.ui.modals),
                    length:number = keys.length;
                let a:number = 0;
                do {
                    if (browser.ui.modals[keys[a]].type === options.type && document.getElementById(keys[a]) !== null) {
                        return document.getElementById(keys[a]);
                    }
                    a = a + 1;
                } while (a < length);
            }
        } else {
            browser.ui.modalTypes.push(options.type);
        }

        // Default values
        browser.ui.zIndex = browser.ui.zIndex + 1;
        if (options.zIndex === undefined) {
            options.zIndex = browser.ui.zIndex;
        }
        if (options.left === undefined || options.left < 10) {
            options.left = 10 + (modalCount * 10) - modalCount;
        }
        if (options.top === undefined || options.top < 10) {
            options.top = 10 + (modalCount * 10) - modalCount;
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
        if (options.agent === undefined) {
            options.agent = browser.identity.hashDevice;
        }
        if (options.agentType === undefined) {
            options.agentType = "device";
        }
        options.id = id;

        // Title bar functionality
        {
            const span:HTMLElement = document.createElement("span"),
                text:string[] = [];
            if (options.type === "shares") {
                if (options.agentType as string === "") {
                    text.push("All Shares");
                    span.appendText("⌘");
                } else {
                    if (options.agentType === "device") {
                        span.appendText("🖳");
                    } else {
                        span.appendText("👤");
                    }
                    if (options.agent === "") {
                        text.push(`All ${common.capitalize(options.agentType)} Shares`);
                    } else if (browser.agents[options.agentType][options.agent].name === undefined) {
                        text.push("Shares");
                    } else {
                        text.push(`${common.capitalize(options.agentType)} ${browser.agents[options.agentType][options.agent].name} Shares`);
                    }
                }
            } else {
                text.push(browser.modal_titles[options.type].text);
                if (options.title_supplement !== "" && options.title_supplement !== null && options.title_supplement !== undefined) {
                    text.push(options.title_supplement);
                }
                if (options.agentIdentity === true) {
                    text.push(`- ${common.capitalize(options.agentType)}, ${browser.agents[options.agentType][options.agent].name}`);
                }
                span.appendText(browser.modal_titles[options.type].icon);
            }
            titleButton.setAttribute("class", options.type);
            titleButton.appendChild(span);
            titleButton.appendText(` ${text.join(" ")}`);
        }
        titleButton.onmousedown = modal.events.move;
        titleButton.ontouchstart = modal.events.move;
        titleButton.setAttribute("type", "button");
        titleButton.onblur  = function browser_utilities_modal_content_blur():void {
            titleButton.onclick = null;
        };
        section.appendChild(titleButton);
        section.setAttribute("class", "heading");
        border.appendChild(section);

        // Box universal definitions
        browser.ui.modals[id] = options;
        box.socket = socket;
        box.setAttribute("id", id);
        box.onmousedown = zTop;
        box.setAttribute("class", "box");
        box.setAttribute("data-agent", options.agent);
        box.setAttribute("data-agenttype", options.agentType);
        box.style.zIndex = browser.ui.zIndex.toString();
        box.style.left = `${options.left / 10}em`;
        box.style.top = `${options.top / 10}em`;
        body.style.height = `${options.height / 10}em`;
        body.style.width = `${options.width / 10}em`;
        if (options.scroll === false || textType === true) {
            body.style.overflow = "hidden";
        }

        // Top input controls
        section = document.createElement("p");
        section.setAttribute("class", "buttons");
        if (Array.isArray(options.inputs) === true) {
            // Universal input controls
            if (options.inputs.indexOf("maximize") > -1 || options.inputs.indexOf("minimize") > -1) {
                if (options.inputs.indexOf("minimize") > -1) {
                    button({
                        class: "minimize",
                        event: modal.events.minimize,
                        parent: section,
                        spanText: "Minimize",
                        text: "↵ ",
                        title: "Minimize"
                    });
                    buttonCount = buttonCount + 1;
                }
                if (options.inputs.indexOf("maximize") > -1) {
                    button({
                        class: "maximize",
                        event: modal.events.maximize,
                        parent: section,
                        spanText: "Maximize",
                        text: "⇱ ",
                        title: "Maximize"
                    });
                    buttonCount = buttonCount + 1;
                }
            }

            // Apply a text input control
            if (options.inputs.indexOf("text") > -1) {
                const label:HTMLElement = document.createElement("label"),
                    span:HTMLElement = document.createElement("span");
                span.appendText("Text of file system address.");
                label.appendChild(span);
                extra = document.createElement("p");
                input = document.createElement("input");
                input.type = "text";
                input.spellcheck = false;
                if (options.text_event !== undefined) {
                    input.onkeyup = options.text_event;
                    input.onclick = function browser_utilities_modal_content_inputFocus(event:MouseEvent):boolean {
                        const element:HTMLElement = event.target;
                        element.focus();
                        return false;
                    };
                }
                if (options.text_placeholder !== undefined) {
                    input.placeholder = options.text_placeholder;
                }
                if (options.text_value !== undefined) {
                    input.value = options.text_value;
                }
                if (options.type === "file-navigate") {
                    const searchLabel:HTMLElement = document.createElement("label"),
                        search:HTMLInputElement = document.createElement("input"),
                        span:HTMLElement = document.createElement("span"),
                        back = function browser_utilities_modal_content_back(event:MouseEvent):void {
                            const element:HTMLElement = event.target,
                                box:modal = element.getAncestor("box", "class"),
                                id:string = box.getAttribute("id"),
                                address:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
                                history:string[] = browser.ui.modals[id].history;
                            if (history.length > 1) {
                                history.pop();
                                address.value = history[history.length - 1];
                                file_text(event);
                                browser.configuration();
                            }
                        },
                        parent = function browser_utilities_modal_content_parent(event:MouseEvent):boolean {
                            const element:HTMLElement = event.target as HTMLInputElement,
                                header:HTMLElement = element.parentNode,
                                input:HTMLInputElement = header.getElementsByTagName("input")[0],
                                slash:string = (input.value.indexOf("/") > -1 && (input.value.indexOf("\\") < 0 || input.value.indexOf("\\") > input.value.indexOf("/")))
                                    ? "/"
                                    : "\\",
                                value:string = input.value,
                                bodyParent:HTMLElement = element.parentNode.parentNode,
                                box:modal = bodyParent.parentNode,
                                id:string = box.getAttribute("id"),
                                newAddress:string = (function browser_utilities_modal_content_parent_newAddress():string {
                                    if ((/^\w:\\$/).test(value) === true) {
                                        return "\\";
                                    }
                                    if (value.indexOf(slash) === value.lastIndexOf(slash)) {
                                        return value.slice(0, value.lastIndexOf(slash) + 1);
                                    }
                                    return value.slice(0, value.lastIndexOf(slash));
                                }()),
                                agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null, newAddress),
                                payload:service_fileSystem = {
                                    action: "fs-directory",
                                    agentRequest: agents[0],
                                    agentSource: agents[1],
                                    agentWrite: null,
                                    depth: 2,
                                    location: [newAddress],
                                    name: ""
                                };
                            if (value === "\\" || value === "/") {
                                return false;
                            }
                            file_address(event, {
                                address: newAddress,
                                history: true,
                                id: id,
                                payload: payload
                            });
                        },
                        searchHandler = function browser_utilities_modal_content_searchHandler(event?:FocusEvent|KeyboardEvent|MouseEvent, searchElement?:HTMLInputElement):void {
                            const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
                                element:HTMLInputElement = (searchElement === undefined)
                                    ? event.target as HTMLInputElement
                                    : searchElement,
                                value:string = element.value,
                                box:modal = element.getAncestor("box", "class"),
                                id:string = box.getAttribute("id"),
                                addressLabel:HTMLElement = element.parentNode.previousSibling as HTMLElement,
                                addressElement:HTMLInputElement = addressLabel.getElementsByTagName("input")[0],
                                address:string = addressElement.value;
                            if (event !== null && event.type === "blur") {
                                const searchParent:HTMLElement = element.parentNode;
                                searchParent.style.width = "12.5%";
                                addressLabel.style.width = "87.5%";
                                browser.ui.modals[id].search = [address, value];
                                browser.configuration();
                            }
                            if (event === null || (event.type === "keyup" && keyboardEvent.key === "Enter")) {
                                const body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                                    agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                                    payload:service_fileSystem = {
                                        action: "fs-search",
                                        agentRequest: agents[0],
                                        agentSource: agents[1],
                                        agentWrite: null,
                                        depth: 0,
                                        location: [address],
                                        name: value
                                    };
                                body.empty();
                                body.append(util.delay());
                                if (element.value.replace(/\s+/, "") === "") {
                                    file_text(event);
                                    element.focus();
                                    browser.ui.modals[id].search = [address, ""];
                                    browser.configuration();
                                    return;
                                }
                                if (browser.loading === false) {
                                    browser.ui.modals[id].search = [address, value];
                                    browser.ui.modals[id].selection = {};
                                    browser.configuration();
                                }
                                browser.send(payload, "file-system");
                            }
                        },
                        searchFocus = function browser_utilities_modal_content_searchFocus(event:FocusEvent):void {
                            const search:HTMLElement = event.target,
                                searchParent:HTMLElement = search.parentNode,
                                address:HTMLElement = searchParent.previousSibling as HTMLElement;
                            search.focus();
                            searchParent.style.width = "60%";
                            address.style.width = "40%";
                        };
                    extra.style.paddingLeft = "15em";
                    button({
                        class: "backDirectory",
                        event: back,
                        parent: extra,
                        spanText: "Previous address",
                        text: "◀ ",
                        title: "Back to previous address"
                    });
                    button({
                        class: "reloadDirectory",
                        event: file_text,
                        parent: extra,
                        spanText: "Reload",
                        text: "↺ ",
                        title: "Reload directory"
                    });
                    button({
                        class: "parentDirectory",
                        event: parent,
                        parent: extra,
                        spanText: "Parent directory",
                        text: "▲ ",
                        title: "Move to parent directory"
                    });
                    search.type = "text";
                    search.placeholder = "⌕ Search";
                    search.onblur = searchHandler;
                    search.onclick = searchFocus;
                    search.onfocus = searchFocus;
                    search.onkeyup = searchHandler;
                    search.value = options.search[1];
                    span.appendText("Search for file system artifacts from this location. Searches starting with ! are negation searches and regular expressions are supported if the search starts and ends with a forward slash.");
                    searchLabel.appendChild(span);
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

            // Apply history to those types that record a history state
            if (options.type === "file-navigate" || options.type === "terminal") {
                if (options.history === undefined) {
                    if (options.text_value === undefined) {
                        browser.ui.modals[id].history = [];
                    } else {
                        browser.ui.modals[id].history = [options.text_value];
                    }
                } else {
                    browser.ui.modals[id].history = options.history;
                }
            }
        }
        button({
            class: "close",
            event: (typeof options.closeHandler === "function")
                ? options.closeHandler
                : modal_close,
            parent: section,
            spanText: "Close",
            text: "⨯ ",
            title: "Close"
        });
        buttonCount = buttonCount + 1;
        border.appendChild(section);

        // Adjust titleButton width to compensate for the presence of universal input controls
        widths = modal.tools.dynamicWidth(box, options.width, buttonCount);
        titleButton.style.width = `${widths[0]}em`;

        // Append body content after top areas and before bottom areas
        if (options.content !== null && options.content !== undefined) {
            if (textType === true) {
                body.setAttribute("class", "body text-pad");
            } else {
                body.setAttribute("class", "body");
                body.appendChild(options.content);
            }
        }
        border.appendChild(body);

        // Status bar
        if (options.footer !== null && options.footer !== undefined) {
            options.footer.style.width = `${widths[1]}em`;
            border.appendChild(options.footer);
        }

        // Confirmation and text posting
        if (Array.isArray(options.inputs) === true && (options.inputs.indexOf("cancel") > -1 || options.inputs.indexOf("confirm") > -1 || options.inputs.indexOf("save") > -1)) {
            section = document.createElement("footer");
            section.setAttribute("class", "footer");
            extra = document.createElement("p");
            extra.setAttribute("class", "footer-buttons");
            if (options.inputs.indexOf("save") > -1) {
                const saveFile = function browser_content_fileBrowser_saveFile(event:MouseEvent):void {
                    const element:HTMLElement = event.target,
                        box:modal = element.getAncestor("box", "class"),
                        content:string = box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].value,
                        title:HTMLElement = box.getElementsByTagName("h2")[0].getElementsByTagName("button")[0],
                        location:string[] = title.innerHTML.split(" - "),
                        agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null, ""),
                        payload:service_fileSystem = {
                            action: "fs-write",
                            agentRequest: agents[0],
                            agentSource: agents[1],
                            agentWrite: null,
                            depth: 1,
                            location: [location[location.length - 1]],
                            name: content
                        };
                    browser.send(payload, "file-system");
                };
                button({
                    class: "save",
                    event: saveFile,
                    parent: extra,
                    spanText: null,
                    text: "🖫 Save File",
                    title: "Save"
                });
            }
            if (options.inputs.indexOf("confirm") > -1) {
                button({
                    class: "confirm",
                    event: options.confirmHandler,
                    parent: extra,
                    spanText: null,
                    text: "✓ Confirm",
                    title: "Confirm"
                });
            }
            if (options.inputs.indexOf("cancel") > -1) {
                button({
                    class: "cancel",
                    event: (options.type === "invite-ask")
                        ? invite_decline
                        : modal_close,
                    parent: extra,
                    spanText: null,
                    text: "🗙 Cancel",
                    title: "Cancel"
                });
            }
            section.appendChild(extra);
            extra = document.createElement("span");
            extra.setAttribute("class", "clear");
            section.appendChild(extra);
            border.appendChild(section);
        }

        // Append modal
        if (options.status === "hidden") {
            box.style.display = "none";
        }
        box.appendChild(border);
        browser.content.appendChild(box);

        // Modal resize buttons in border
        if (options.resize !== false) {
            const borderButton = function browser_utilities_modal_content_borderButton(className:string, text:string):void {
                const span:HTMLElement = document.createElement("span"),
                    buttonElement:HTMLElement = document.createElement("button");
                span.appendText(text);
                buttonElement.setAttribute("class", className);
                buttonElement.setAttribute("type", "button");
                buttonElement.setAttribute("aria-hidden", "true");
                buttonElement.onmousedown = modal.events.resize;
                buttonElement.appendChild(span);
                border.appendChild(buttonElement);
            };
            border.setAttribute("class", "border");
            borderButton("corner-tl", "resize both width and height");
            borderButton("corner-tr", "resize both width and height");
            borderButton("corner-bl", "resize both width and height");
            borderButton("corner-br", "resize both width and height");
            borderButton("side-t", "resize box height");
            borderButton("side-r", "resize box width");
            borderButton("side-b", "resize box height");
            borderButton("side-l", "resize box width");
        }

        // Apply universal controls from saved state
        if (options.status === "maximized" && options.inputs.indexOf("maximize") > -1) {
            const maximize:HTMLElement = box.getElementsByClassName("maximize")[0] as HTMLElement;
            browser.ui.modals[options.id].status = "normal";
            modal.events.maximize(null, options.callback, maximize);
        } else if (options.status === "minimized" && options.inputs.indexOf("minimize") > -1) {
            const minimize:HTMLElement = box.getElementsByClassName("minimize")[0] as HTMLElement;
            browser.ui.modals[options.id].status = "normal";
            modal.events.minimize(null, options.callback, minimize);
        } else if (options.status === "minimized") {
            browser.ui.modals[options.id].status = "normal";
            modal.tools.forceMinimize(options.id);
            if (options.callback !== undefined) {
                options.callback();
            }
        } else {
            if (options.status === "hidden") {
                browser.ui.modals[options.id].status = "hidden";
                box.style.display = "none";
            }
            if (browser.loading === false) {
                browser.configuration();
            }
            if (options.callback !== undefined) {
                options.callback();
            }
        }

        if (options.footer !== undefined && options.footer !== null && options.footer.getElementsByTagName("textarea").length > 0) {
            modal.events.resize(null, box);
        }

        // return modal
        return box;
    },

    events: {
    
        /* Modal types that are enduring are hidden, not destroyed, when closed */
        closeEnduring: function browser_utilities_modal_closeEnduring(event:MouseEvent):void {
            let box:modal = event.target;
            box = box.getAncestor("box", "class");
            if (box.getAttribute("class") === "box") {
                box.style.display = "none";
                // this must remain separated from modal identity as more than one thing users it
                browser.ui.modals[box.getAttribute("id")].status = "hidden";
            }
            browser.configuration();
        },
    
        /* The given modal consumes the entire view port of the content area */
        maximize: function browser_utilities_modal_maximize(event:MouseEvent, callback?:() => void, target?:HTMLElement):void {
            const element:HTMLElement = (event === null)
                    ? target
                    : event.target,
                contentArea:HTMLElement = document.getElementById("content-area"),
                box:modal = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                title:HTMLElement = box.getElementsByTagName("h2")[0],
                titleButton:HTMLElement = (title === undefined)
                    ? undefined
                    : title.getElementsByTagName("button")[0],
                status:HTMLElement = box.getElementsByClassName("status-bar")[0] as HTMLElement,
                footer:HTMLElement = box.getElementsByClassName("footer")[0] as HTMLElement,
                footerButtons:HTMLElement = (footer === undefined)
                    ? undefined
                    : footer.getElementsByClassName("footer-buttons")[0] as HTMLElement,
                footerOffset:number = (footerButtons === undefined)
                    ? 0
                    : footerButtons.clientWidth,
                message:HTMLElement = (footer === undefined)
                    ? undefined
                    : footer.getElementsByClassName("message")[0] as HTMLElement;
            if (box === document.documentElement) {
                return;
            }
            if (browser.ui.modals[id].status === "maximized") {
                titleButton.style.cursor = "move";
                titleButton.onmousedown = modal.events.move;
                browser.ui.modals[id].status = "normal";
                box.style.top = `${browser.ui.modals[id].top / 10}em`;
                box.style.left = `${browser.ui.modals[id].left / 10}em`;
                body.style.width = `${browser.ui.modals[id].width / 10}em`;
                body.style.height = `${browser.ui.modals[id].height / 10}em`;
                if (status !== undefined) {
                    status.style.width = `${(browser.ui.modals[id].width - 20) / 10}em`;
                }
            } else {
                browser.ui.modals[id].status = "maximized";
                titleButton.style.cursor = "default";
                titleButton.onmousedown = null;
                box.style.top = "0em";
                box.style.left = "0em";
                body.style.width = `${(contentArea.clientWidth - 20) / 10}em`;
                body.style.height = (function browser_utilities_modal_maximize_maxHeight():string {
                    let height:number = contentArea.clientHeight;
                    const header:HTMLElement = box.getElementsByClassName("header")[0] as HTMLElement;
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
                    }
                    if (message !== undefined) {
                        message.style.width = `${(contentArea.clientWidth - footerOffset - 60) / 15}em`;
                    }
                    return `${height / 10}em`;
                }());
            }
            if (browser.loading === false) {
                browser.configuration();
            }
            if (callback !== undefined) {
                callback();
            }
        },
    
        /* Visually minimize a modal to the tray at the bottom of the content area */
        minimize: function browser_utilities_modal_minimize(event:MouseEvent, callback?:() => void, target?:HTMLElement):void {
            const element:HTMLElement = (event === null)
                    ? target
                    : event.target,
                border:HTMLElement = element.getAncestor("border", "class"),
                box:modal = border.parentNode,
                id:string = box.getAttribute("id"),
                title:HTMLElement = border.getElementsByTagName("h2")[0],
                titleButton:HTMLElement = title.getElementsByTagName("button")[0] as HTMLElement,
                children:NodeListOf<ChildNode> = border.childNodes,
                statusBar:HTMLElement = box.getElementsByClassName("status-bar")[0] as HTMLElement;
            let buttons:HTMLElement,
                borders:number,
                child:HTMLElement,
                a:number = 1;
            if (border === document.documentElement || (event !== null && event.target.lowName() === "textarea")) {
                return;
            }
            if (browser.ui.modals[id].status === "minimized") {
                const li:HTMLElement = box.parentNode,
                    body:HTMLElement = border.getElementsByClassName("body")[0] as HTMLElement;
                do {
                    child = children[a] as HTMLElement;
                    child.style.removeProperty("display");
                    a = a + 1;
                } while (a < children.length);
                document.getElementById("tray").getElementsByTagName("ul")[0].removeChild(li);
                li.removeChild(box);
                box.style.zIndex = browser.ui.modals[id].zIndex.toString();
                titleButton.style.cursor = "move";
                browser.content.appendChild(box);
                browser.ui.modals[id].status = "normal";
                box.style.top = `${browser.ui.modals[id].top / 10}em`;
                box.style.left = `${browser.ui.modals[id].left / 10}em`;
                body.style.width = `${browser.ui.modals[id].width / 10}em`;
                body.style.height = `${browser.ui.modals[id].height / 10}em`;
                if (statusBar !== undefined) {
                    statusBar.style.width = `${(browser.ui.modals[id].width - 20) / 10}em`;
                }
                buttons = box.getElementsByClassName("buttons")[0] as HTMLElement;
                borders = (border.getElementsByClassName("corner-tl").length > 0)
                    ? 15
                    : 0;
                titleButton.style.width = `${(browser.ui.modals[id].width - buttons.clientWidth - borders) / 18}em`;
                titleButton.lastChild.textContent = titleButton.lastChild.textContent.replace(" - Minimized", "");
                titleButton.onclick = null;
            } else {
                const li:HTMLLIElement = document.createElement("li");
                do {
                    child = children[a] as HTMLElement;
                    child.style.display = "none";
                    a = a + 1;
                } while (a < children.length);
                box.style.zIndex = "0";
                browser.content.removeChild(box);
                titleButton.style.width = "11.5em";
                titleButton.style.cursor = "pointer";
                titleButton.lastChild.textContent = `${titleButton.lastChild.textContent} - Minimized`;
                titleButton.onclick = browser_utilities_modal_minimize;
                title.style.width = "";
                li.appendChild(box);
                document.getElementById("tray").getElementsByTagName("ul")[0].appendChild(li);
                browser.ui.modals[id].status = "minimized";
            }
            if (browser.loading === false) {
                browser.configuration();
            }
            if (callback !== undefined) {
                callback();
            }
        },
    
        /* Drag and drop interaction for modals */
        move: function browser_utilities_modal_move(event:MouseEvent|TouchEvent):void {
            const element:HTMLElement = event.target,
                box:modal = element.getAncestor("box", "class"),
                boxParent:HTMLElement = box.parentNode,
                settings:config_modal = browser.ui.modals[box.getAttribute("id")],
                border:HTMLElement = box.getElementsByTagName("div")[0],
                minifyTest:boolean = (boxParent.lowName() === "li"),
                touch:boolean = (event !== null && event.type === "touchstart"),
                mouseEvent:MouseEvent = event as MouseEvent,
                touchEvent:TouchEvent = event as TouchEvent,
                mouseX:number = (touch === true)
                    ? 0
                    : mouseEvent.clientX,
                mouseY:number = (touch === true)
                    ? 0
                    : mouseEvent.clientY,
                touchX:number = (touch === true)
                    ? touchEvent.touches[0].clientX
                    : 0,
                touchY:number = (touch === true)
                    ? touchEvent.touches[0].clientY
                    : 0,
                drop       = function browser_utilities_modal_move_drop(dropEvent:Event):boolean {
                    const titleBar:number = document.getElementById("title-bar").clientWidth,
                        boxWidth:number = box.clientWidth;
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
                    if (boxLeft > titleBar - 60) {
                        boxLeft = titleBar - 60;
                    } else if (boxLeft < (boxWidth * -1) + 200) {
                        boxLeft = (boxWidth * -1) + 200;
                    }
                    box.style.top = `${boxTop / 10}em`;
                    box.style.left = `${boxLeft / 10}em`;
                    border.style.opacity = "1";
                    box.style.height   = "auto";
                    settings.top = boxTop;
                    settings.left = boxLeft;
                    browser.configuration();
                    dropEvent.preventDefault();
                    return false;
                },
                boxMove         = function browser_utilities_modal_move_boxMove(moveEvent:MouseEvent|TouchEvent):boolean {
                    const touchEvent:TouchEvent = (touch === true)
                            ? moveEvent as TouchEvent
                            : null,
                        mouseEvent:MouseEvent = (touch === true)
                            ? null
                            : moveEvent as MouseEvent,
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
                },
                max:number        = browser.content.clientHeight;
            let boxLeft:number    = box.offsetLeft,
                boxTop:number     = box.offsetTop;
            if (minifyTest === true) {
                if (touch === true) {
                    const button:HTMLButtonElement = box.getElementsByClassName("minimize")[0] as HTMLButtonElement;
                    button.click();
                }
                return;
            }
            if (browser.ui.modals[box.getAttribute("id")].status === "maximized") {
                return;
            }
            element.focus();
            event.preventDefault();
            border.style.opacity = "0.5";
            box.style.height   = "0.1em";
            if (touch === true) {
                document.ontouchmove  = boxMove;
                document.ontouchstart = null;
                document.ontouchend   = drop;
            } else {
                document.onmousemove = boxMove;
                document.onmousedown = null;
                document.onmouseup   = drop;
            }
        },
    
        /* Allows resizing of modals in 1 of 8 directions */
        resize: function browser_utilities_modal_resize(event:MouseEvent|TouchEvent, boxElement?:modal):void {
            let clientWidth:number  = 0,
                clientHeight:number = 0;
            const node:HTMLElement = (boxElement === null || boxElement === undefined)
                    ? event.target
                    : boxElement.getElementsByClassName("side-r")[0] as HTMLElement,
                box:modal = (boxElement === null || boxElement === undefined)
                    ? node.getAncestor("box", "class")
                    : boxElement,
                top:number = box.offsetTop,
                left:number = box.offsetLeft,
                body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                heading:HTMLElement = box.getElementsByTagName("h2")[0],
                headingButton:HTMLElement = heading.getElementsByTagName("button")[0],
                touch:boolean = (event !== null && event.type === "touchstart"),
                boxStatus:string = browser.ui.modals[box.getAttribute("id")].status,
                footer:HTMLElement = box.getElementsByClassName("footer")[0] as HTMLElement,
                footerButton:boolean = (footer !== undefined && footer.getElementsByTagName("button").length > 0),
                status:HTMLElement = box.getElementsByClassName("status-bar")[0] as HTMLElement,
                sideBottom:HTMLElement =  box.getElementsByClassName("side-b")[0] as HTMLElement,
                sideTop:HTMLElement = box.getElementsByClassName("side-t")[0] as HTMLElement,
                mouseEvent:MouseEvent = event as MouseEvent,
                touchEvent:TouchEvent = event as TouchEvent,
                offX:number = (event === null)
                    ? node.offsetLeft
                    : (touch === true)
                        ? touchEvent.touches[0].clientX
                        : mouseEvent.clientX,
                offY:number = (event === null)
                    ? node.offsetTop
                    : (touch === true)
                        ? touchEvent.touches[0].clientY
                        : mouseEvent.clientY,
                mac:boolean = (navigator.userAgent.indexOf("macintosh") > 0),
                direction:resizeDirection = node.getAttribute("class").split("-")[1] as resizeDirection,
                offsetWidth:number = (mac === true)
                    ? 20
                    : (footerButton === false)
                        ? (browser.scrollbar * -1)
                        : 0,
                offsetHeight:number = (mac === true)
                    ? 18
                    : (footerButton === false)
                        ? (browser.scrollbar * -1)
                        : 0,
                drop  = function browser_utilities_modal_resize_drop():void {
                    const settings:config_modal = browser.ui.modals[box.getAttribute("id")];
                    if (touch === true) {
                        document.ontouchmove = null;
                        document.ontouchstart = null;
                    } else {
                        document.onmousemove = null;
                        document.onmouseup = null;
                    }
                    clientWidth = body.clientWidth;
                    clientHeight = body.clientHeight;
                    settings.width = clientWidth - offsetWidth;
                    settings.height = clientHeight - offsetHeight;
                    media_kill(settings);
                    if (settings.type === "media") {
                        body.appendChild(media.content(settings.text_value as mediaType, settings.height, settings.width));
                    }
                    browser.configuration();
                },
                compute = function browser_utilities_modal_resize_compute(leftTest:boolean, topTest:boolean, values:[number, number]):void {
                    if (values[0] > -10) {
                        const minWidth:number = 55.7,
                            computedWidth:number = (leftTest === true)
                                ? left + (values[0] - offX)
                                : (clientWidth + ((values[0] - offsetWidth) - offX)) / 10,
                            bodyWidth:number = (leftTest === true)
                                ? ((clientWidth - offsetWidth) + (left - computedWidth)) / 10
                                : 0,
                            bodyLong:boolean = (leftTest === true && bodyWidth > minWidth),
                            principle:number = (bodyLong === true)
                                ? bodyWidth
                                : computedWidth,
                            widths:[number, number] = modal.tools.dynamicWidth(box, null, null);
                        if (bodyLong === true) {
                            box.style.left = `${computedWidth / 10}em`;
                        }
                        if (bodyLong === true || (leftTest === false && computedWidth > minWidth)) {
                            body.style.width = `${principle}em`;
                            if (footer !== undefined && footer !== null) {
                                footer.style.width = `${principle - 2 - ((browser.scrollbar + 3) / 10)}em`;
                            }
                            sideBottom.style.width = `${principle}em`;
                            sideTop.style.width = `${principle}em`;
                            heading.style.width = `${principle + 0.2}em`;
                        }
                        headingButton.style.width = `${widths[0]}em`;
                        if (status !== undefined) {
                            status.style.width = `${widths[1]}em`;
                        }
                    }
                    if (values[1] > -10) {
                        const computedHeight:number = (topTest === true)
                                ? top + (values[1] - offY)
                                : (clientHeight + ((values[1] - offsetHeight) - offY)) / 10,
                            bodyHeight:number = (topTest === true)
                                ? ((clientHeight - offsetHeight) + (top - computedHeight)) / 10
                                : 0;
                        if (topTest === true && ((clientHeight - offsetHeight) + (top - computedHeight)) / 10 > 10) {
                            box.style.top = `${computedHeight / 10}em`;
                            body.style.height  = `${bodyHeight}em`;
                        } else if (topTest === false && computedHeight > 10) {
                            body.style.height  = `${computedHeight}em`;
                        }
                    }
                },
                nullCheck = function browser_utilities_modal_resize_nullCheck(moveEvent:MouseEvent|TouchEvent, xCheck:boolean, yCheck:boolean):[number, number] {
                    const mouseMove:MouseEvent = moveEvent as MouseEvent,
                        touchMove:TouchEvent = moveEvent as TouchEvent,
                        x:number = (moveEvent === null)
                            ? offX - 8
                            : (xCheck === true)
                                ? (touch === true)
                                    ? touchMove.touches[0].clientX
                                    : mouseMove.clientX
                                : -10,
                        y:number = (moveEvent === null)
                            ? offY - 8
                            : (yCheck === true)
                                ? (touch === true)
                                    ? touchMove.touches[0].clientY
                                    : mouseMove.clientY
                                : -10;
                    return [x, y];
                },
                side:modal_borderMethods    = {
                    b: function browser_utilities_modal_resize_sizeB(moveEvent:MouseEvent|TouchEvent):void {
                        compute(false, false, nullCheck(moveEvent, false, true));
                    },
                    bl: function browser_utilities_modal_resize_sizeBL(moveEvent:MouseEvent|TouchEvent):void {
                        compute(true, false, nullCheck(moveEvent, true, true));
                    },
                    br: function browser_utilities_modal_resize_sizeBR(moveEvent:MouseEvent|TouchEvent):void {
                        compute(false, false, nullCheck(moveEvent, true, true));
                    },
                    l: function browser_utilities_modal_resize_sizeL(moveEvent:MouseEvent|TouchEvent):void {
                        compute(true, false, nullCheck(moveEvent, true, false));
                    },
                    r: function browser_utilities_modal_resize_sizeR(moveEvent:MouseEvent|TouchEvent):void {
                        compute(false, false, nullCheck(moveEvent, true, false));
                    },
                    t: function browser_utilities_modal_resize_sizeT(moveEvent:MouseEvent|TouchEvent):void {
                        compute(false, true, nullCheck(moveEvent, false, true));
                    },
                    tl: function browser_utilities_modal_resize_sizeTL(moveEvent:MouseEvent|TouchEvent):void {
                        compute(true, true, nullCheck(moveEvent, true, true));
                    },
                    tr: function browser_utilities_modal_resize_sizeTR(moveEvent:MouseEvent|TouchEvent):void {
                        compute(false, true, nullCheck(moveEvent, true, true));
                    }
                };
            if (boxStatus === "maximized" || boxStatus === "minimized") {
                return;
            }
            clientWidth  = body.clientWidth;
            clientHeight = body.clientHeight;
            if (event === null) {
                side[direction](null);
            } else {
                if (touch === true) {
                    document.ontouchmove  = side[direction];
                    document.ontouchstart = null;
                    document.ontouchend   = drop;
                } else {
                    document.onmousemove = side[direction];
                    document.onmousedown = null;
                    document.onmouseup   = drop;
                }
            }
        }
    },

    tools: {

        /* A singles source of truth for computing the width of the heading button */
        dynamicWidth: function browser_utilities_modal_headingButtonWidth(box:modal, width:number, buttonCount:number):[number, number] {
            const output:[number, number] = [0, 0];
            if (buttonCount === undefined || buttonCount === null) {
                buttonCount = box.getElementsByClassName("buttons")[0].getElementsByTagName("button").length;
            }
            if (width === undefined || width === null) {
                const body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement;
                width = Number(body.style.width.replace(/em;?/, "")) * 10;
            }
            output[0] = (((width - 20) - (buttonCount * 45)) / 18);
            output[1] = ((width / 10) - 2);
            return output;
        },

        /* Modals that do not have a minimize button still need to conform to minimize from other interactions. */
        forceMinimize: function browser_utilities_modal_forceMinimize(id:string):void {
            const modalItem:HTMLElement = document.getElementById(id).getElementsByClassName("body")[0] as HTMLElement,
                handler:(event:MouseEvent) => void = modalItem.onclick;
            modalItem.onclick = modal.events.minimize;
            modalItem.click();
            modalItem.onclick = handler;
        },

        /* Defines text area modal bodies in a uniform way. */
        textModal: function browser_utilities_modal_textModal(title:string, value:string, type:modalType):HTMLElement {
            const textArea:HTMLTextAreaElement = document.createElement("textarea"),
                span:HTMLElement = document.createElement("span"),
                label:HTMLElement = document.createElement("label");
            textArea.value = value;
            if (type !== "file-edit") {
                textArea.onblur = modal_textSave;
            }
            span.appendText(title);
            label.appendChild(span);
            label.appendChild(textArea);
            return label;
        }
    }

};

export default modal;