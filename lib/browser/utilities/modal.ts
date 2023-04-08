
/* lib/browser/utilities/modal - A collection of utilities for generating and manipulating modals/windows in the browser. */

import agent_management from "../content/agent_management.js";
import browser from "./browser.js";
import common from "../../common/common.js";
import file_browser from "../content/file_browser.js";
import media from "../content/media.js";
import modal_configuration from "./modal_configurations.js";
import network from "./network.js";
import webSocket from "./webSocket.js";

// cspell:words agenttype

/**
 * Provides generic modal specific interactions such as resize, move, generic modal buttons, and so forth.
 * ```typescript
 * interface module_modal {
 *     content: (options:config_modal) => modal; // Creates a new modal.
 *     events: {
 *         close         : (event:MouseEvent) => void;                  // Closes a modal by removing it from the DOM, removing it from state, and killing any associated media.
 *         closeEnduring : (event:MouseEvent) => void;                  // Modal types that are enduring are hidden, not destroyed, when closed.
 *         confirm       : (event:MouseEvent) => void;                  // Handling for an optional confirmation button.
 *         footerResize  : (event:MouseEvent) => void;                  // If a resizable textarea element is present in the modal outside the body this ensures the body is the correct size.
 *         importSettings: (event:MouseEvent) => void;                  // Handler for import/export modals that modify saved settings from an imported JSON string then reloads the page.
 *         maximize      : (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void; // Maximizes a modal to fill the view port.
 *         minimize      : (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void; // Minimizes a modal to the tray at the bottom of the page.
 *         move          : (event:MouseEvent|TouchEvent) => void;       // Allows dragging a modal around the screen.
 *         resize        : (event:MouseEvent|TouchEvent) => void;       // Resizes a modal respective to the event target, which could be any of 4 corners or 4 sides.
 *         textSave      : (event:Event) => void;                       // Handler to push the text content of a text-pad modal into settings so that it is saved.
 *         textTimer     : (event:KeyboardEvent) => void;               // A timing event so that contents of a text-pad modal are automatically save after a brief duration of focus blur.
 *         unMinimize    : (event:MouseEvent) => void;                  // Restores a minimized modal to its prior size and location.
 *         zTop          : (event:KeyboardEvent|MouseEvent, elementInput?:HTMLElement) => void; // Processes visual overlapping or depth of modals.
 *     };
 *     tools: {
 *         forceMinimize: (id:string) => void; // Modals that do not have a minimize button still need to conform to minimize from other interactions.
 *     };
 * }
 * ``` */
const modal:module_modal = {

    /* Modal creation factory */
    content: function browser_utilities_modal_content(options:config_modal):HTMLElement {
        let buttonCount:number = 0,
            section:HTMLElement = document.createElement("h2"),
            input:HTMLInputElement,
            extra:HTMLElement;
        const id:string = (options.type === "configuration")
                ? "configuration-modal"
                : (options.id || `${options.type}-${Math.random().toString() + browser.data.zIndex + 1}`),
            titleButton:HTMLButtonElement = document.createElement("button"),
            box:modal = document.createElement("article"),
            body:HTMLElement = document.createElement("div"),
            border:HTMLElement = document.createElement("div"),
            modalCount:number = Object.keys(browser.data.modals).length,
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
            scheme:string = (location.protocol.toLowerCase() === "http:")
                ? "ws"
                : "wss",
            socket:WebSocket = (options.socket === true)
                ? new webSocket.sock(`${scheme}://localhost:${browser.network.ports.ws}/`, [`${options.type}-${browser.data.hashDevice}`])
                : null;

        // Uniqueness constraints
        if (browser.data.modalTypes.indexOf(options.type) > -1) {
            if (options.single === true) {
                const keys:string[] = Object.keys(browser.data.modals),
                    length:number = keys.length;
                let a:number = 0,
                    modalSingle:HTMLElement;
                do {
                    if (browser.data.modals[keys[a]].type === options.type) {
                        modalSingle = document.getElementById(keys[a]);
                        modal.events.zTop(null, modalSingle as HTMLElement);
                        return modalSingle;
                    }
                    a = a + 1;
                } while (a < length);
                return;
            }
        } else {
            browser.data.modalTypes.push(options.type);
        }

        // Default values
        browser.data.zIndex = browser.data.zIndex + 1;
        if (options.zIndex === undefined) {
            options.zIndex = browser.data.zIndex;
        }
        if (options.left === undefined) {
            options.left = 200 + (modalCount * 10) - modalCount;
        }
        if (options.top === undefined || options.top < 20) {
            options.top = 200 + (modalCount * 10) - modalCount;
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
            options.agent = browser.data.hashDevice;
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
                    } else if (browser[options.agentType][options.agent].name === undefined) {
                        text.push("Shares");
                    } else {
                        text.push(`${common.capitalize(options.agentType)} ${browser[options.agentType][options.agent].name} Shares`);
                    }
                }
            } else {
                text.push(modal_configuration.titles[options.type].text);
                if (options.title_supplement !== "" && options.title_supplement !== null && options.title_supplement !== undefined) {
                    text.push(options.title_supplement);
                }
                if (options.agentIdentity === true) {
                    text.push(`- ${common.capitalize(options.agentType)}, ${browser[options.agentType][options.agent].name}`);
                }
                span.appendText(modal_configuration.titles[options.type].icon);
            }
            titleButton.setAttribute("class", options.type);
            titleButton.appendChild(span);
            titleButton.appendText(` ${text.join(" ")}`);
        }
        titleButton.onmousedown = modal.events.move;
        titleButton.ontouchstart = modal.events.move;
        titleButton.setAttribute("type", "button");
        titleButton.onclick = modal.events.unMinimize;
        titleButton.onblur  = function browser_utilities_modal_content_blur():void {
            titleButton.onclick = null;
        };
        section.appendChild(titleButton);
        section.setAttribute("class", "heading");
        border.appendChild(section);

        // Box universal definitions
        browser.data.modals[id] = options;
        box.socket = socket;
        box.setAttribute("id", id);
        box.onmousedown = modal.events.zTop;
        box.setAttribute("class", "box");
        box.setAttribute("data-agent", options.agent);
        box.setAttribute("data-agenttype", options.agentType);
        border.setAttribute("class", "border");
        body.setAttribute("class", "body");
        box.style.zIndex = browser.data.zIndex.toString();
        box.style.left = `${options.left / 10}em`;
        box.style.top = `${options.top / 10}em`;
        body.style.height = `${options.height / 10}em`;
        body.style.width = `${options.width / 10}em`;
        if (options.scroll === false || options.type === "export" || options.type === "text-pad") {
            body.style.overflow = "hidden";
        }

        // Top input controls
        if (Array.isArray(options.inputs) === true) {
            // Universal input controls
            if (options.inputs.indexOf("close") > -1 || options.inputs.indexOf("maximize") > -1 || options.inputs.indexOf("minimize") > -1) {
                section = document.createElement("p");
                section.setAttribute("class", "buttons");
                if (options.inputs.indexOf("minimize") > -1) {
                    button({
                        class: "minimize",
                        event: modal.events.minimize,
                        parent: section,
                        spanText: "Minimize",
                        text: "↙ ",
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
                if (options.inputs.indexOf("close") > -1) {
                    button({
                        class: "close",
                        event: (typeof options.closeHandler === "function")
                            ? options.closeHandler
                            : modal.events.close,
                        parent: section,
                        spanText: "Close",
                        text: "✖ ",
                        title: "Close"
                    });
                    buttonCount = buttonCount + 1;
                }
                border.appendChild(section);
            }

            // Adjust titleButton width to compensate for the presence of universal input controls
            titleButton.style.width = `${(options.width - (buttonCount * 50)) / 18}em`;

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
                        span:HTMLElement = document.createElement("span");
                    extra.style.paddingLeft = "15em";
                    button({
                        class: "backDirectory",
                        event: file_browser.events.back,
                        parent: extra,
                        spanText: "Previous address",
                        text: "◀ ",
                        title: "Back to previous address"
                    });
                    button({
                        class: "reloadDirectory",
                        event: file_browser.events.text,
                        parent: extra,
                        spanText: "Reload",
                        text: "↺ ",
                        title: "Reload directory"
                    });
                    button({
                        class: "parentDirectory",
                        event: file_browser.events.parent,
                        parent: extra,
                        spanText: "Parent directory",
                        text: "▲ ",
                        title: "Move to parent directory"
                    });
                    search.type = "text";
                    search.placeholder = "⌕ Search";
                    search.onblur = file_browser.events.search;
                    search.onclick = file_browser.events.searchFocus;
                    search.onfocus = file_browser.events.searchFocus;
                    search.onkeyup = file_browser.events.search;
                    if (options.search !== undefined && options.search[1] !== "") {
                        search.value = options.search[1];
                    } else {
                        browser.data.modals[id].search = ["", ""];
                    }
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
                        options.history = [];
                    } else {
                        options.history = [options.text_value];
                    }
                }
            }
        }

        // Append body content after top areas and before bottom areas
        if (options.content !== null && options.content !== undefined) {
            body.appendChild(options.content);
        }
        border.appendChild(body);

        // Status bar
        if (options.footer !== null && options.footer !== undefined) {
            border.appendChild(options.footer);
        }

        // Confirmation and text posting
        if (Array.isArray(options.inputs) === true && (options.inputs.indexOf("cancel") > -1 || options.inputs.indexOf("confirm") > -1 || options.inputs.indexOf("save") > -1)) {
            section = document.createElement("footer");
            section.setAttribute("class", "footer");
            extra = document.createElement("p");
            extra.setAttribute("class", "footer-buttons");
            if (options.inputs.indexOf("save") > -1) {
                button({
                    class: "save",
                    event: file_browser.events.saveFile,
                    parent: extra,
                    spanText: null,
                    text: "🖫 Save File",
                    title: "Save"
                });
            }
            if (options.inputs.indexOf("confirm") > -1) {
                button({
                    class: "confirm",
                    event: modal.events.confirm,
                    parent: extra,
                    spanText: null,
                    text: "✓ Confirm",
                    title: "Confirm"
                });
            }
            if (options.inputs.indexOf("cancel") > -1) {
                button({
                    class: "cancel",
                    event: (options.type === "invite-accept")
                        ? agent_management.events.inviteDecline
                        : modal.events.close,
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
                buttonElement.onmousedown = modal.events.resize;
                buttonElement.appendChild(span);
                border.appendChild(buttonElement);
            };
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
            browser.data.modals[options.id].status = "normal";
            modal.events.maximize(null, options.callback, maximize);
        } else if (options.status === "minimized" && options.inputs.indexOf("minimize") > -1) {
            const minimize:HTMLElement = box.getElementsByClassName("minimize")[0] as HTMLElement;
            browser.data.modals[options.id].status = "normal";
            modal.events.minimize(null, options.callback, minimize);
        } else if (options.callback !== undefined) {
            if (browser.loading === false) {
                network.configuration();
            }
            options.callback();
        } else if (browser.loading === false) {
            network.configuration();
        }

        // return modal
        return box;
    },

    events: {

        /* Removes a modal from the DOM for garbage collection */
        close: function browser_utilities_modal_close(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                keys:string[] = Object.keys(browser.data.modals),
                keyLength:number = keys.length,
                box:modal = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                type:modalType = (browser.data.modals[id] === undefined)
                    ? null
                    : browser.data.modals[id].type;
            let a:number = 0,
                count:number = 0;
            
            // box is off the DOM, so don't worry about it
            if (box.parentNode === null || type === null) {
                return;
            }
    
            // modal type specific instructions
            if (type === "invite-accept") {
                const inviteBody:HTMLElement = box.getElementsByClassName("agentInvitation")[0] as HTMLElement,
                    invitation:service_invite = JSON.parse(inviteBody.dataset.invitation);
                invitation.status = "ignored";
                network.send(invitation, "invite");
            } else if (type === "media") {
                media.tools.kill(browser.data.modals[id]);
            }
    
            // remove the box
            box.onclick = null;
            box.parentNode.removeChild(box);
    
            // remove from modal type list if the last of respective modal types open
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
    
            // remove from state and send to storage
            delete browser.data.modals[id];
            network.configuration();
        },
    
        /* Modal types that are enduring are hidden, not destroyed, when closed */
        closeEnduring: function browser_utilities_modal_closeEnduring(event:MouseEvent):void {
            let box:modal = event.target;
            box = box.getAncestor("box", "class");
            if (box.getAttribute("class") === "box") {
                box.style.display = "none";
                // this must remain separated from modal identity as more than one thing users it
                browser.data.modals[box.getAttribute("id")].status = "hidden";
            }
            network.configuration();
        },
    
        /* Event handler for the modal's "Confirm" button */
        confirm: function browser_utilities_modal_confirm(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                box:modal = element.getAncestor("box", "class"),
                id:string = box.getAttribute("id"),
                options:config_modal = browser.data.modals[id];
            if (options.type === "export") {
                modal.events.importSettings(event);
            } else if (options.type === "invite-accept") {
                agent_management.tools.inviteAccept(box);
            } else if (options.type === "agent-management") {
                const section:HTMLElement = box.getElementsByClassName("section")[0] as HTMLElement,
                    inputs:HTMLCollectionOf<HTMLInputElement> = section.getElementsByTagName("input");
                let a:number = inputs.length;
                do {
                    a = a - 1;
                    if (inputs[a].value === "invite") {
                        break;
                    }
                } while (a > 0);
                agent_management.events.confirm(event);
                if (inputs[a].value === "invite" && inputs[a].checked === true) {
                    return;
                }
            }
            modal.events.close(event);
        },
    
        /* If a resizable textarea element is present in the modal outside the body this ensures the body is the correct size. */
        footerResize: function browser_utilities_modal_footerResize(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                box:modal = element.getAncestor("box", "class"),
                body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                bottom:HTMLElement = box.getElementsByClassName("side-b")[0] as HTMLElement,
                top:HTMLElement = box.getElementsByClassName("side-t")[0] as HTMLElement,
                width:number = (box.clientWidth - 19) / 10,
                title:HTMLElement = box.getElementsByTagName("h2")[0];
            body.style.width = `${width}em`;
            bottom.style.width = `${width}em`;
            top.style.width = `${width}em`;
            title.style.width = `${(box.clientWidth - 17) / 10}em`;
            element.style.width = "100%";
        },

        /* Modifies saved settings from an imported JSON string then reloads the page */
        importSettings: function browser_utilities_modal_importSettings(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                dataString:string = JSON.stringify(browser.data),
                box:modal = element.getAncestor("box", "class"),
                button:HTMLButtonElement = document.getElementsByClassName("cancel")[0] as HTMLButtonElement,
                textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
            if (textArea.value !== dataString) {
                browser.data = JSON.parse(textArea.value);
            }
            button.click();
            if (textArea.value !== dataString) {
                network.send({
                    settings: browser.data,
                    type: "configuration"
                }, "settings");
                location.reload();
            }
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
                statusBar:HTMLElement = (status === undefined)
                    ? null
                    : status.getElementsByTagName("p")[0] as HTMLElement,
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
            if (browser.data.modals[id].status === "maximized") {
                titleButton.style.cursor = "move";
                titleButton.onmousedown = modal.events.move;
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
                body.style.height = (function browser_utilities_modal_maximize_maxHeight():string {
                    let height:number = contentArea.clientHeight,
                        header:HTMLElement = box.getElementsByClassName("header")[0] as HTMLElement;
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
            if (browser.loading === false) {
                network.configuration();
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
                statusBar:HTMLElement = box.getElementsByClassName("status-bar")[0] as HTMLElement;
            let buttons:HTMLElement,
                children:NodeListOf<ChildNode>,
                borders:number,
                child:HTMLElement,
                a:number = 1;
            if (border === document.documentElement) {
                return;
            }
            title.onmousedown = modal.events.move;
            children = border.childNodes;
            if (browser.data.modals[id].status === "minimized") {
                const li:HTMLElement = box.parentNode,
                    body:HTMLElement = border.getElementsByClassName("body")[0] as HTMLElement;
                do {
                    child = children[a] as HTMLElement;
                    child.style.removeProperty("display");
                    a = a + 1;
                } while (a < children.length);
                document.getElementById("tray").getElementsByTagName("ul")[0].removeChild(li);
                li.removeChild(box);
                box.style.zIndex = browser.data.modals[id].zIndex.toString();
                titleButton.style.cursor = "move";
                browser.content.appendChild(box);
                browser.data.modals[id].status = "normal";
                box.style.top = `${browser.data.modals[id].top / 10}em`;
                box.style.left = `${browser.data.modals[id].left / 10}em`;
                body.style.width = `${browser.data.modals[id].width / 10}em`;
                body.style.height = `${browser.data.modals[id].height / 10}em`;
                if (statusBar !== undefined) {
                    statusBar.style.width = `${(browser.data.modals[id].width - 20) / 10}em`;
                }
                buttons = box.getElementsByClassName("buttons")[0] as HTMLElement;
                borders = (border.getElementsByClassName("corner-tl").length > 0)
                    ? 15
                    : 0;
                titleButton.style.width = `${(browser.data.modals[id].width - buttons.clientWidth - borders) / 18}em`;
                titleButton.lastChild.textContent = titleButton.lastChild.textContent.replace(" - Minimized", "");
            } else {
                const li:HTMLLIElement = document.createElement("li");
                do {
                    child = children[a] as HTMLElement;
                    child.style.display = "none";
                    a = a + 1;
                } while (a < children.length);
                box.style.zIndex = "0";
                box.parentNode.removeChild(box);
                titleButton.style.width = "11.5em";
                titleButton.style.cursor = "pointer";
                titleButton.lastChild.textContent = `${titleButton.lastChild.textContent} - Minimized`;
                title.style.width = "";
                li.appendChild(box);
                document.getElementById("tray").getElementsByTagName("ul")[0].appendChild(li);
                browser.data.modals[id].status = "minimized";
            }
            if (browser.loading === false) {
                network.configuration();
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
                settings:config_modal = browser.data.modals[box.getAttribute("id")],
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
                    network.configuration();
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
                };
            let boxLeft:number    = box.offsetLeft,
                boxTop:number     = box.offsetTop,
                max:number        = browser.content.clientHeight;
            if (minifyTest === true) {
                if (touch === true) {
                    const button:HTMLButtonElement = box.getElementsByClassName("minimize")[0] as HTMLButtonElement;
                    button.click();
                }
                return;
            }
            if (browser.data.modals[box.getAttribute("id")].status === "maximized") {
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
        resize: function browser_utilities_modal_resize(event:MouseEvent|TouchEvent):void {
            let clientWidth:number  = 0,
                clientHeight:number = 0;
            const node:HTMLElement = event.target,
                box:modal = node.getAncestor("box", "class"),
                top:number = box.offsetTop,
                left:number = box.offsetLeft,
                body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                heading:HTMLElement = box.getElementsByTagName("h2")[0],
                headingButton:HTMLElement = heading.getElementsByTagName("button")[0],
                touch:boolean = (event !== null && event.type === "touchstart"),
                boxStatus:string = browser.data.modals[box.getAttribute("id")].status,
                buttonPadding:number = (box.getElementsByClassName("buttons")[0] === undefined)
                    ? 0
                    : (box.getElementsByClassName("buttons")[0].getElementsByTagName("button").length * 5),
                header:HTMLElement = box.getElementsByClassName("header")[0] as HTMLElement,
                headerHeight:number = (header === undefined)
                    ? 0
                    : (header.clientHeight / 10),
                footer:HTMLElement = box.getElementsByClassName("footer")[0] as HTMLElement,
                statusMessage:HTMLElement = (footer === undefined)
                    ? undefined
                    : footer.getElementsByClassName("status-message")[0] as HTMLElement,
                footerButtons:HTMLElement = (footer === undefined)
                    ? undefined
                    : footer.getElementsByClassName("footer-buttons")[0] as HTMLElement,
                footerOffset:number = (footerButtons === undefined)
                    ? 0
                    : footerButtons.clientWidth / 10,
                footerHeight:number = (footerOffset > 0)
                    ? footer.clientHeight
                    : 0,
                status:HTMLElement = box.getElementsByClassName("status-bar")[0] as HTMLElement,
                statusBar:HTMLElement = (status === undefined)
                    ? undefined
                    : status.getElementsByTagName("p")[0],
                statusHeight:number = (status === undefined)
                    ? 0
                    : (status.clientHeight / 10),
                sideBottom:HTMLElement =  box.getElementsByClassName("side-b")[0] as HTMLElement,
                sideLeft:HTMLElement =  box.getElementsByClassName("side-l")[0] as HTMLElement,
                sideRight:HTMLElement = box.getElementsByClassName("side-r")[0] as HTMLElement,
                sideTop:HTMLElement = box.getElementsByClassName("side-t")[0] as HTMLElement,
                mouseEvent:MouseEvent = event as MouseEvent,
                touchEvent:TouchEvent = event as TouchEvent,
                offX:number = (touch === true)
                    ? touchEvent.touches[0].clientX
                    : mouseEvent.clientX,
                offY:number = (touch === true)
                    ? touchEvent.touches[0].clientY
                    : mouseEvent.clientY,
                mac:boolean = (navigator.userAgent.indexOf("macintosh") > 0),
                direction:resizeDirection = node.getAttribute("class").split("-")[1] as resizeDirection,
                offsetWidth:number = (mac === true)
                    ? 20
                    : -20,
                offsetHeight:number = (mac === true)
                    ? 18
                    : -20,
                sideHeight:number = headerHeight + statusHeight + footerHeight + 1,
                drop  = function browser_utilities_modal_resize_drop():void {
                    const settings:config_modal = browser.data.modals[box.getAttribute("id")];
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
                    media.tools.kill(settings);
                    if (settings.type === "media") {
                        body.appendChild(media.content(settings.text_value as mediaType, settings.height, settings.width));
                    }
                    network.configuration();
                },
                compute = function browser_utilities_modal_resize_compute(leftTest:boolean, topTest:boolean, values:[number, number]):void {
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
                            sideBottom.style.width = `${bodyWidth}em`;
                            sideTop.style.width = `${bodyWidth}em`;
                            heading.style.width = `${bodyWidth + 0.2}em`;
                            headingButton.style.width = `${((bodyWidth - buttonPadding) / 1.8)}em`;
                            if (statusMessage !== undefined) {
                                statusMessage.style.width = `${(bodyWidth - footerOffset - 4) / 1.5}em`;
                            }
                            if (statusBar !== undefined) {
                                status.style.width = `${bodyWidth - 2}em`;
                                statusBar.style.width = `${(bodyWidth - 4) / 1.5}em`;
                            }
                        } else if (leftTest === false && computedWidth > minWidth) {
                            body.style.width = `${computedWidth}em`;
                            sideBottom.style.width = `${computedWidth}em`;
                            sideTop.style.width = `${computedWidth}em`;
                            heading.style.width = `${computedWidth + 0.2}em`;
                            headingButton.style.width = `${((computedWidth - buttonPadding) / 1.8)}em`;
                            if (statusMessage !== undefined) {
                                statusMessage.style.width = `${(computedWidth - footerOffset - 4) / 1.5}em`;
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
                side:modal_borderMethods    = {
                    b: function browser_utilities_modal_resize_sizeB(moveEvent:MouseEvent|TouchEvent):void {
                        const mouseMove:MouseEvent = moveEvent as MouseEvent,
                            touchMove:TouchEvent = moveEvent as TouchEvent,
                            y:number = (touch === true)
                                ? touchMove.touches[0].clientY
                                : mouseMove.clientY;
                        compute(false, false, [-10, y]);
                    },
                    bl: function browser_utilities_modal_resize_sizeBL(moveEvent:MouseEvent|TouchEvent):void {
                        const mouseMove:MouseEvent = moveEvent as MouseEvent,
                            touchMove:TouchEvent = moveEvent as TouchEvent,
                            x:number = (touch === true)
                                ? touchMove.touches[0].clientX
                                : mouseMove.clientX,
                            y:number = (touch === true)
                                ? touchMove.touches[0].clientY
                                : mouseMove.clientY;
                        compute(true, false, [x, y]);
                    },
                    br: function browser_utilities_modal_resize_sizeBR(moveEvent:MouseEvent|TouchEvent):void {
                        const mouseMove:MouseEvent = moveEvent as MouseEvent,
                            touchMove:TouchEvent = moveEvent as TouchEvent,
                            x:number = (touch === true)
                                ? touchMove.touches[0].clientX
                                : mouseMove.clientX,
                            y:number = (touch === true)
                                ? touchMove.touches[0].clientY
                                : mouseMove.clientY;
                        compute(false, false, [x, y]);
                    },
                    l: function browser_utilities_modal_resize_sizeL(moveEvent:MouseEvent|TouchEvent):void {
                        const mouseMove:MouseEvent = moveEvent as MouseEvent,
                            touchMove:TouchEvent = moveEvent as TouchEvent,
                            x:number = (touch === true)
                                ? touchMove.touches[0].clientX
                                : mouseMove.clientX;
                        compute(true, false, [x, -10]);
                    },
                    r: function browser_utilities_modal_resize_sizeR(moveEvent:MouseEvent|TouchEvent):void {
                        const mouseMove:MouseEvent = moveEvent as MouseEvent,
                            touchMove:TouchEvent = moveEvent as TouchEvent,
                            x:number = (touch === true)
                                ? touchMove.touches[0].clientX
                                : mouseMove.clientX;
                        compute(false, false, [x, -10]);
                    },
                    t: function browser_utilities_modal_resize_sizeT(moveEvent:MouseEvent|TouchEvent):void {
                        const mouseMove:MouseEvent = moveEvent as MouseEvent,
                            touchMove:TouchEvent = moveEvent as TouchEvent,
                            y:number = (touch === true)
                                ? touchMove.touches[0].clientY
                                : mouseMove.clientY;
                        compute(false, true, [-10, y]);
                    },
                    tl: function browser_utilities_modal_resize_sizeTL(moveEvent:MouseEvent|TouchEvent):void {
                        const mouseMove:MouseEvent = moveEvent as MouseEvent,
                            touchMove:TouchEvent = moveEvent as TouchEvent,
                            x:number = (touch === true)
                                ? touchMove.touches[0].clientX
                                : mouseMove.clientX,
                            y:number = (touch === true)
                                ? touchMove.touches[0].clientY
                                : mouseMove.clientY;
                        compute(true, true, [x, y]);
                    },
                    tr: function browser_utilities_modal_resize_sizeTR(moveEvent:MouseEvent|TouchEvent):void {
                        const mouseMove:MouseEvent = moveEvent as MouseEvent,
                            touchMove:TouchEvent = moveEvent as TouchEvent,
                            x:number = (touch === true)
                                ? touchMove.touches[0].clientX
                                : mouseMove.clientX,
                            y:number = (touch === true)
                                ? touchMove.touches[0].clientY
                                : mouseMove.clientY;
                        compute(false, true, [x, y]);
                    }
                };
            if (boxStatus === "maximized" || boxStatus === "minimized") {
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
                document.onmouseup   = drop;
            }
        },
    
        /* Pushes the text content of a text-pad modal into settings so that it is saved */
        textSave: function browser_utilities_modal_textSave(event:Event):void {
            const element:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
                box:modal = element.getAncestor("box", "class"),
                data:config_modal = browser.data.modals[box.getAttribute("id")];
            if (box.timer !== undefined) {
                window.clearTimeout(box.timer);
            }
            data.text_value = element.value;
            network.configuration();
        },
    
        /* An idle delay is a good time to save written notes */
        textTimer: function browser_utilities_modal_textTimer(event:KeyboardEvent):void {
            const element:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
                box:modal = element.getAncestor("box", "class"),
                data:config_modal = browser.data.modals[box.getAttribute("id")];
            if (box.timer !== undefined) {
                window.clearTimeout(box.timer);
            }
            box.timer = window.setTimeout(function browser_utilities_modal_textTimer_delay() {
                window.clearTimeout(box.timer);
                if (data.text_value !== element.value) {
                    data.text_value = element.value;
                    network.configuration();
                }
            }, browser.data.statusTime);
        },
    
        /* Restore a minimized modal to its prior size and location */
        unMinimize: function browser_utilities_modal_unMinimize(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                box:modal = element.getAncestor("box", "class"),
                boxParent:HTMLElement = box.parentNode;
            if (boxParent.lowName() === "li") {
                modal.tools.forceMinimize(box.getAttribute("id"));
            }
        },
    
        /* Manages z-index of modals and moves a modal to the top on interaction */
        zTop: function browser_utilities_modal_zTop(event:KeyboardEvent|MouseEvent, elementInput?:HTMLElement):void {
            const element:HTMLElement = (event !== null && elementInput === undefined)
                    ? event.target
                    : elementInput,
                parent:HTMLElement = element.parentNode,
                grandParent:HTMLElement = parent.parentNode,
                box:modal = element.getAncestor("box", "class");
            if ((parent.getAttribute("class") === "fileList" || grandParent.getAttribute("class") === "fileList") && event.shiftKey === true) {
                event.preventDefault();
            }
            browser.data.zIndex = browser.data.zIndex + 1;
            browser.data.modals[box.getAttribute("id")].zIndex = browser.data.zIndex;
            box.style.zIndex = browser.data.zIndex.toString();
        }
    },

    tools: {

        /* Modals that do not have a minimize button still need to conform to minimize from other interactions. */
        forceMinimize: function browser_utilities_modal_forceMinimize(id:string):void {
            const modalItem:HTMLElement = document.getElementById(id).getElementsByClassName("body")[0] as HTMLElement,
                handler:(event:MouseEvent) => void = modalItem.onclick;
            modalItem.onclick = modal.events.minimize;
            modalItem.click();
            modalItem.onclick = handler;
        }
    }

};

export default modal;