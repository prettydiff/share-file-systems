
/* lib/browser/utilities/browser - A list of declared variables globally available to the browser instance of the application. */

import uiDefault from "../../common/uiDefault.js";

const browser:browser = {
    agents: {                                           // agents - stores agent objects by agent hash id
        device: {},
        user: {}
    },
    content: document.getElementById("content-area"),   // content - stores a reference to the content area of the page
    contextElement: null,                               // contextElement - stores the element where the context menu is activated
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
    socket: null,                                       // socket - stores the primary application socket out of the browser
    style: document.createElement("style"),             // style - stores a reference to a custom created style element that stores user defined presentation data
    testBrowser: null,                                  // testBrowser - stores test automation data respective to a current test item
    title: "",                                          // title - stores the text of the application name
    ui: uiDefault,                                      // ui - the user interface state object
    visible: true                                       // visible - toggles visibility of the document, a performance hack because JavaScript executes faster than visual artifacts render to screen
};

export default browser;