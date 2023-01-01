
/* lib/browser/content/global_events - Events not associated with specific content or a modal type. */

import agent_management from "./agent_management.js";
import browser from "../utilities/browser.js";
import file_browser from "./file_browser.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import share from "./share.js";
import terminal from "./terminal.js";
import util from "../utilities/util.js";

/**
 * Provides a common location to store events associated with the application at large opposed to content or utility specific events.
 * ```typescript
 * interface module_globalEvents {
 *     contextMenuRemove: () => void;            // Removes a context menu if one is visible.
 *     fullscreen       : (event:Event) => void; // An event handler that launches the browser into fullscreen mode.
 *     fullscreenChange : (event:Event) => void; // An event handler that executes when the browser moves in or out of fullscreen mode.
 *     menu             : (event:Event) => void; // Displays the primary modal in the top left corner of the application.
 *     menuBlur         : (event:Event) => void; // Destroys the menu, if present.
 *     minimizeAll      : (event:Event) => void; // Forcefully minimizes all modals to the tray at the bottom of the application.
 *     minimizeAllFlag  : boolean;               // A flag that halts state saving until all modals are minimized.
 *     modal: {
 *         agentManagement: (event:MouseEvent, config?:config_modal) => void;   // Displays agent management modal content from the main menu.
 *         configuration  : (event:MouseEvent) => void;                         // Displays a configuration modal from the main menu.
 *         terminal       : (event:MouseEvent, config?:config_modal) => void;   // Displays a command terminal modal from the main menu.
 *         export         : (event:MouseEvent) => void;                         // Displays an Import/Export modal from the main menu.
 *         fileNavigate   : (Event:Event, config?:navConfig) => void;          // Displays a File Navigate modal from the main menu.
 *         textPad        : (event:KeyboardEvent|MouseEvent, config?:config_modal) => HTMLElement; // Displays a TextPad modal from the main menu.
 *     };
 *     shareAll: (event:MouseEvent) => void;     // Displays a Share modal associated with multiple agents.
 *     visibility: () => void;                   // Determines whether the current browser tab is visible or hidden.
 * }
 * ``` */
const global_events:module_globalEvents = {

    /* Removes the context menu from the DOM. */
    contextMenuRemove: function browser_content_global_contextMenuRemove():void {
        const menu:HTMLElement = document.getElementById("contextMenu");
        if (menu !== null) {
            menu.parentNode.removeChild(menu);
        }
    },

    /* Assigns proper event handler to button for the respective fullscreen state. */
    fullscreen: function browser_content_global_fullscreen():void {
        if (document.fullscreenEnabled === true) {
            if (document.fullscreenElement === null) {
                browser.pageBody.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    },

    /* Toggle fullscreen mode on and off. */
    fullscreenChange: function browser_content_global_fullscreenChange():void {
        const button:HTMLElement = document.getElementById("fullscreen"),
            span:HTMLElement = button.getElementsByTagName("span")[0];
        let text:string = (document.fullscreenElement === null)
            ? "Toggle Fullscreen"
            : "Exit Fullscreen";
        span.appendText(text);
        button.title = text;
        button.firstChild.textContent = (document.fullscreenElement === null)
            ? "\u26f6"
            : "\u26cb";
    },

    /* Show/hide for the primary application menu that hangs off the title bar. */
    menu: function browser_content_global_menu():void {
        const menu:HTMLElement = document.getElementById("menu");
        if (menu.style.display !== "block") {
            menu.style.display = "block";
            if (browser.testBrowser === null) {
                const move = function browser_content_global_menu_move(event:MouseEvent):void {
                    if (event.clientX > menu.clientWidth || event.clientY > menu.clientHeight + 51) {
                        menu.style.display = "none";
                        document.onmousemove = null;
                    }
                };
                document.onmousemove = move;
            }
        } else {
            menu.style.display = "none";
        }
    },

    /* Hides the primary menu on blur. */
    menuBlur: function browser_content_global_menuBlur():void {
        const active:HTMLElement = document.activeElement,
            menu:HTMLElement = document.getElementById("menu");
        if (active.parentNode.parentNode !== menu) {
            menu.style.display = "none";
        }
    },

    /* Minimize all modals to the bottom tray that are of modal status: normal and maximized */
    minimizeAll: function browser_content_global_minimizeAll():void {
        const keys:string[] = Object.keys(browser.data.modals),
            length:number = keys.length;
        let a:number = 0,
            status:modalStatus;
        global_events.minimizeAllFlag = true;
        do {
            status = browser.data.modals[keys[a]].status;
            if (status === "normal" || status === "maximized") {
                modal.tools.forceMinimize(keys[a]);
            }
            a = a + 1;
        } while (a < length);
        global_events.minimizeAllFlag = false;
        network.configuration();
    },

    /* A flag to keep settings informed about application state in response to minimizing all modals. */
    minimizeAllFlag: false,

    modal: {
        /* Create an agent management modal */
        agentManagement: function browser_content_global_agentManagement(event:MouseEvent, config?:config_modal):void {
            global_events.menuBlur(event);
            if (config === undefined) {
                const content:HTMLElement = agent_management.content.menu("invite"),
                    payloadModal:config_modal = {
                        agent: browser.data.hashDevice,
                        agentIdentity: false,
                        agentType: "device",
                        content: content,
                        inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
                        read_only: false,
                        single: true,
                        title: "<span class=\"icon-delete\">❤</span> Manage Agents",
                        type: "agent-management",
                        width: 750
                    };
                modal.content(payloadModal);
                network.configuration();
            } else {
                config.agent = browser.data.hashDevice;
                config.agentIdentity = false;
                config.content = agent_management.content.menu("invite");
                config.single = true;
                config.title = "<span class=\"icon-delete\">❤</span> Manage Agents";
                config.type = "agent-management";
                modal.content(config);
            }
        },

        /* Open the configuration modal */
        configuration: function browser_content_global_configuration(event:MouseEvent):void {
            const configuration:HTMLElement = document.getElementById("configuration-modal"),
                data:config_modal = browser.data.modals["configuration-modal"];
            global_events.menuBlur(event);
            modal.events.zTop(event, configuration);
            if (data.status === "hidden") {
                configuration.style.display = "block";
            }
            data.status = "normal";
            document.getElementById("menu").style.display = "none";
        },

        /* Creates an import/export modal */
        export: function browser_content_global_export(event:MouseEvent):void {
            const element:HTMLElement = event.target,
                textArea:HTMLTextAreaElement = document.createElement("textarea"),
                label:HTMLElement = document.createElement("label"),
                span:HTMLElement = document.createElement("span"),
                agency:agency = (element === document.getElementById("export"))
                    ? [browser.data.hashDevice, false, "device"]
                    : util.getAgent(element),
                payload:config_modal = {
                    agent: agency[0],
                    agentIdentity: false,
                    agentType: "device",
                    content: label,
                    inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
                    read_only: agency[1],
                    single: true,
                    title: element.innerHTML,
                    type: "export"
                };
            global_events.menuBlur(event);
            textArea.onblur = modal.events.textSave;
            textArea.value = JSON.stringify(browser.data);
            span.appendText("Import/Export Settings");
            label.appendChild(span);
            label.appendChild(textArea);
            label.setAttribute("class", "textPad");
            modal.content(payload);
            document.getElementById("menu").style.display = "none";
        },

        /* Create a file navigate modal */
        fileNavigate: function browser_content_global_fileNavigate(event:Event, config?:config_fileNavigate):void {
            const agentName:string = (config === undefined || config.agentName === undefined)
                    ? browser.data.hashDevice
                    : config.agentName,
                agentType:agentType = (agentName === browser.data.hashDevice)
                    ? "device"
                    : config.agentType,
                location:string = (config !== undefined && typeof config.path === "string")
                    ? config.path
                    : "**root**",
                share:string = (config === undefined || config.share === undefined)
                    ? ""
                    : config.share,
                readOnly:boolean = (agentName !== browser.data.hashDevice && config !== undefined && config.readOnly === true),
                readOnlyString:string = (readOnly === true && agentType === "user")
                    ? "(Read Only) "
                    : "",
                // agents not abstracted in order to make use of a config object for state restoration
                payloadNetwork:service_fileSystem = {
                    action: "fs-directory",
                    agentRequest: {
                        device: browser.data.hashDevice,
                        modalAddress: "",
                        share: "",
                        user: browser.data.hashUser
                    },
                    agentSource: {
                        device: (agentType === "device")
                            ? agentName
                            : "",
                        modalAddress: location,
                        share: share,
                        user: (agentType === "device")
                            ? browser.data.hashUser
                            : agentName
                    },
                    agentWrite: null,
                    depth: 2,
                    location: [location],
                    name: "navigate"
                },
                payloadModal:config_modal = {
                    agent: agentName,
                    agentIdentity: true,
                    agentType: agentType,
                    content: util.delay(),
                    footer: file_browser.content.footer(800),
                    inputs: ["close", "maximize", "minimize", "text"],
                    read_only: readOnly,
                    selection: {},
                    share: share,
                    text_event: file_browser.events.text,
                    text_placeholder: "Optionally type a file system address here.",
                    text_value: location,
                    title: `${document.getElementById("fileNavigator").innerHTML} ${readOnlyString}`,
                    type: "fileNavigate",
                    width: 800
                };
            global_events.menuBlur(event);
            network.send(payloadNetwork, "file-system");
            modal.content(payloadModal);
            document.getElementById("menu").style.display = "none";
        },

        /* Creates a console modal */
        terminal: function browser_content_global_terminal(event:MouseEvent, config?:config_modal):void {
            const content:[HTMLElement, HTMLElement] = terminal.content(),
                agentName:string = (config === undefined)
                    ? browser.data.hashDevice
                    : config.agent,
                agentType:agentType = (agentName === browser.data.hashDevice)
                    ? "device"
                    : config.agentType,
                payloadModal:config_modal = (config === undefined)
                    ? {
                        agent: agentName,
                        agentIdentity: false,
                        agentType: agentType,
                        content: content[0],
                        footer: content[1],
                        id: (config === undefined)
                            ? null
                            : config.id,
                        inputs: ["close", "maximize", "minimize"],
                        read_only: false,
                        socket: true,
                        text_value: "",
                        title: document.getElementById("terminal").innerHTML,
                        type: "terminal",
                        width: 800
                    }
                    : config,
                textArea:HTMLTextAreaElement = content[1].getElementsByTagName("textarea")[0];
            if (config !== undefined) {
                textArea.value = config.text_value;
                config.content = content[0];
                config.footer = content[1];
                if (typeof config.text_placeholder === "string" && config.text_placeholder !== "") {
                    config.footer.getElementsByClassName("terminal-cwd")[0].appendText(config.text_placeholder, true);
                }
            }
            textArea.placeholder = "Type a command here. Press 'ins' key for file system auto-completion.";
            global_events.menuBlur(event);
            modal.content(payloadModal);
            document.getElementById("menu").style.display = "none";
        },

        /* Creates a textPad modal */
        textPad: function browser_content_global_textPad(event:KeyboardEvent|MouseEvent, config?:config_modal):HTMLElement {
            const element:HTMLElement = (event === null)
                    ? null
                    : event.target,
                titleText:string = (element === null)
                    ? ""
                    : element.innerHTML,
                textArea:HTMLTextAreaElement = document.createElement("textarea"),
                label:HTMLElement = document.createElement("label"),
                span:HTMLElement = document.createElement("span"),
                agency:agency = (element === document.getElementById("textPad"))
                    ? [browser.data.hashDevice, false, "device"]
                    : (element === null)
                        ? null
                        : util.getAgent(element),
                payload:config_modal = (config === undefined)
                    ? {
                        agent: agency[0],
                        agentIdentity: false,
                        agentType: agency[2],
                        content: label,
                        id: (config === undefined)
                            ? null
                            : config.id,
                        inputs: ["close", "maximize", "minimize"],
                        read_only: agency[1],
                        title: titleText,
                        type: "textPad",
                        width: 800
                    }
                    : config;
            let box:modal;
            global_events.menuBlur(event);
            span.appendText("Text Pad");
            label.setAttribute("class", "textPad");
            label.appendChild(span);
            label.appendChild(textArea);
            if (config !== undefined) {
                textArea.value = config.text_value;
                payload.content = label;
            }
            textArea.onblur = modal.events.textSave;
            if (titleText.indexOf("Base64 - ") === 0) {
                textArea.style.whiteSpace = "normal";
            }
            box = modal.content(payload);
            box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].onkeyup = modal.events.textTimer;
            document.getElementById("menu").style.display = "none";
            return box;
        }
    },

    /* Associates share content to share modals representing multiple agents. */
    shareAll: function browser_content_global_shareAll(event:MouseEvent):void {
        const element:HTMLElement = event.target,
            parent:HTMLElement = element.parentNode,
            classy:string = element.getAttribute("class");
        if (parent.getAttribute("class") === "all-shares") {
            share.tools.modal("", "", null);
        } else if (classy === "device-all-shares") {
            share.tools.modal("", "device", null);
        } else if (classy === "user-all-shares") {
            share.tools.modal("", "user", null);
        }
    },

    /* Determines whether the current browser tab is visible or hidden. */
    visibility: function browser_content_global_visibility():void {
        if (document.visibilityState === "visible") {
            browser.visible = true;
        } else {
            browser.visible = false;
        }
    }
};

export default global_events;