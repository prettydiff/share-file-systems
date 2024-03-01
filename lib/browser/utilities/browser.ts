
/* lib/browser/utilities/browser - A list of declared variables globally available to the browser instance of the application. */

import uiDefault from "../../common/uiDefault.js";

const browser:browser = {
    agents: {                                           // agents - stores agent objects by agent hash id
        device: {},
        user: {}
    },
    colorDefaults: {                                    // colorDefaults - default color definitions for the various supported color scheme
        "blush": ["fff", "fee"],
        "dark": ["222", "333"],
        "default": ["fff", "eee"]
    },
    content: document.getElementById("content-area"),   // content - stores a reference to the content area of the page
    configuration: function browser_utilities_socketConfiguration():void { //configuration - send UI configuration data up for storage
        if (browser.loading === false) {
            browser.send({
                settings: browser.ui,
                type: "ui"
            }, "settings");
        }
    },
    contextElement: null,                               // contextElement - stores the element where the context menu is activated
    contextType: "",                                    // contextType - stores a context action type
    dragFlag: "",                                       // dragFlag - Stores whether a drag action is modified with shift or control key
    identity: {                                         // identity - stores identifiers for the given user/device
        hashDevice: "",
        hashUser: "",
        nameDevice: "",
        nameUser: "",
        secretDevice: "",
        secretUser: ""
    },
    loading: true,                                      // loading - whether the page is still loading events from start/restart
    loadQueue: [],                                      // loadQueue - a message queue to store network messages pending page load
    network: null,                                      // network - stores network identifiers such as ports and IP addresses
    message: [],                                        // message - stores text messages to/from the respective device
    modal_titles: {                                     // modal_titles - stores title data by modal type for reuse
        "agent-management": {
            icon: "❤",
            menu: true,
            text: "Agent Management"
        },
        "configuration": {
            icon: "⚙",
            menu: true,
            text: "Configuration"
        },
        "details": {
            icon: "📂",
            menu: false,
            text: "Document"
        },
        "document": {
            icon: "🗎",
            menu: false,
            text: "Document"
        },
        "export": {
            icon: "⎆",
            menu: true,
            text: "Import/Export Settings"
        },
        "file-edit": {
            icon: "✎",
            menu: false,
            text: "File"
        },
        "file-navigate": {
            icon: "⌹",
            menu: true,
            text: "File Navigate"
        },
        "invite-ask": {
            icon: "❧",
            menu: false,
            text: "Invitation from"
        },
        "media": {
            icon: "💬",
            menu: false,
            text: "Message to"
        },
        "message": {
            icon: "☎",
            menu: false,
            text: "Text Message to"
        },
        "shares": {
            icon: "",
            menu: false,
            text: ""
        },
        "socket-map": {
            icon: "🖧",
            menu: false,
            text: "Open Sockets"
        },
        "terminal": {
            icon: "›",
            menu: true,
            text: "Command Terminal"
        },
        "text-pad": {
            icon: "¶",
            menu: true,
            text: "Text Pad"
        }
    },
    pageBody: document.getElementsByTagName("body")[0], // pageBody - stores a reference to the page's body element
    scrollbar: 0,                                       // scrollbar - stores the pixel width of scrollbars in the current browser display
    send: function browser_utilities_browser_sendWrapper(data:socketDataType, service:service_type):void { // send - sends messages out of the browser
        // do not put a console.log in this function without first removing the log service from /lib/browser/index.ts
        // otherwise this will produce a race condition with feedback loop
        const socketData:socketData = {
            data: data,
            service: service
        };
        // connecting
        if (browser.socket === null || browser.socket.readyState === 0 || browser.loading === true) {
            setTimeout(function browser_utilities_browser_sendWrapper_delay():void {
                browser_utilities_browser_sendWrapper(data, service);
            }, 10);
        } else if (browser.socket.readyState === 1) {
            browser.socket.send(JSON.stringify(socketData));
        }
    },
    socket: null,                                       // socket - stores the primary application socket out of the browser
    style: document.createElement("style"),             // style - stores a reference to a custom created style element that stores user defined presentation data
    testBrowser: null,                                  // testBrowser - stores test automation data respective to a current test item
    title: "",                                          // title - stores the text of the application name
    ui: uiDefault,                                      // ui - the user interface state object
    visible: true                                       // visible - toggles visibility of the document, a performance hack because JavaScript executes faster than visual artifacts render to screen
};

export default browser;