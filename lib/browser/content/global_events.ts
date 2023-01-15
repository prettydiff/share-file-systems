
/* lib/browser/content/global_events - Events not associated with specific content or a modal type. */

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";

// cspell:words agenttype

/**
 * Provides a common location to store events associated with the application at large opposed to content or utility specific events.
 * ```typescript
 * interface module_globalEvents {
 *     contextMenuRemove: () => void;            // Removes a context menu if one is visible.
 *     fullscreen       : (event:Event) => void; // An event handler that launches the browser into fullscreen mode.
 *     fullscreenChange : (event:Event) => void; // An event handler that executes when the browser moves in or out of fullscreen mode.
 *     menu             : (event:Event) => void; // Displays the primary modal in the top left corner of the application.
 *     minimizeAll      : (event:Event) => void; // Forcefully minimizes all modals to the tray at the bottom of the application.
 *     minimizeAllFlag  : boolean;               // A flag that halts state saving until all modals are minimized.
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