
/* lib/terminal/test/samples/browser - A list of tests that execute in the web browser. */

import { ServerResponse } from "http";

import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import server from "../../commands/server.js";
import serverVars from "../../server/serverVars.js";
import vars from "../../utilities/vars.js";
import remove from "../../commands/remove.js";
import response from "../../server/response.js";

const browser:testBrowser = [];

// complete the login
browser.push({
    delay: {
        // that class is removed from body
        node: [
            ["getElementsByTagName", "body", 0]
        ],
        qualifier: "is",
        target: ["class"],
        type: "attribute",
        value: null
    },
    interaction: [
        {
            event: "click",
            node: [["getElementById", "login-user", null]]
        },
        {
            event: "setValue",
            node: [["getElementById", "login-user", null]],
            value: "Primary User"
        },
        {
            event: "click",
            node: [["getElementById", "login-device", null]]
        },
        {
            event: "setValue",
            node: [["getElementById", "login-device", null]],
            value: "Primary Device"
        },
        {
            event: "click",
            node: [
                ["getElementById", "login-device", null],
                ["parentNode", "", null],
                ["parentNode", "", null],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Login form",
    test: [
        {
            // that a local user button is present and active
            node: [
                ["getElementById", "device", null],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "active"
        },
        {
            // that the login messaging is not visible
            node: [
                ["getElementById", "login", null]
            ],
            qualifier: "is",
            target: ["clientHeight"],
            type: "property",
            value: 0
        }
    ]
});

// refresh the page and test that a user populates and there is no login
browser.push({
    delay: {
        // that a local user button is present and active
        node: [
            ["getElementById", "device", null],
            ["getElementsByTagName", "button", 1]
        ],
        qualifier: "is",
        target: ["class"],
        type: "attribute",
        value: "active"
    },
    interaction: [
        {
            event: "refresh",
            node: null
        }
    ],
    name: "Refresh following login form completion",
    // assert that login remains complete, login data is stored and written to page
    test: [
        {
            // that the login messaging is not visible
            node: [
                ["getElementById", "login", null]
            ],
            qualifier: "is",
            target: ["clientHeight"],
            type: "property",
            value: 0
        },
        {
            // that class is removed from body
            node: [
                ["getElementsByTagName", "body", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: null
        }
    ]
});

// access the primary menu
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getElementById", "menuToggle", null]
            ]
        }
    ],
    name: "Display the primary menu",
    test: [
        {
            // primary menu is visible
            node: [
                ["getElementById", "menu", null]
            ],
            qualifier: "is",
            target: ["style", "display"],
            type: "property",
            value: "block"
        }
    ]
});

// open a file navigator modal
browser.push({
    delay: {
        // the file navigator modal is created
        node: [
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "ul", 0]
        ],
        qualifier: "is",
        target: ["class"],
        type: "attribute",
        value: "fileList"
    },
    interaction: [
        {
            event: "click",
            node: [
                ["getElementById", "fileNavigator", null]
            ]
        }
    ],
    name: "Launch 'File Navigator' modal from primary menu",
    test: [
        {
            // that file navigation modal contains an address bar
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "input", 0]
            ],
            qualifier: "is",
            target: ["placeholder"],
            type: "attribute",
            value: "Optionally type a file system address here."
        },
        {
            // the file navigate modal contains a search field
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "input", 1]
            ],
            qualifier: "is",
            target: ["placeholder"],
            type: "attribute",
            value: "⌕ Search"
        },
        {
            // the file navigate modal contains a status bar
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "status-bar", 0]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "<p>"
        },
        {
            // that file navigator modal contains a back button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "backDirectory"
        },
        {
            // that file navigator modal contains a reload button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "reloadDirectory"
        },
        {
            // that file navigator modal contains a parent navigation button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 2]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "parentDirectory"
        },
        {
            // that file navigator modal contains a minimize button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "buttons", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "minimize"
        },
        {
            // that file navigator modal contains a maximize button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "buttons", 0],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "maximize"
        },
        {
            // that file navigator modal contains a close button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "buttons", 0],
                ["getElementsByTagName", "button", 2]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "close"
        },
        {
            // the file navigate modal displays file system results with a directory
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "directory"
        },
        {
            // that directory contains an expansion button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "expansion"
        }
    ]
});

// close the primary menu
browser.push({
    delay: {
        node: [
            ["getElementById", "menu", null]
        ],
        qualifier: "is",
        target: ["clientHeight"],
        type: "property",
        value: 0
    },
    interaction: [
        {
            event: "click",
            node: [
                ["getElementById", "menuToggle", null]
            ]
        }
    ],
    name: "Close menu",
    test: [
        {
            node: [
                ["getElementById", "menu", null]
            ],
            qualifier: "is",
            target: ["style", "display"],
            type: "property",
            value: "none"
        }
    ]
});

// expand a directory
browser.push({
    delay: {
        // that file list contents are available
        node: [
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByTagName", "li", 0],
            ["getElementsByTagName", "ul", 0]
        ],
        qualifier: "is",
        target: ["class"],
        type: "attribute",
        value: "fileList"
    },
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Directory expansion",
    test: [
        {
            // the first child list item of the expanded directory thus contains its own expansion button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "span", 0]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "Expand this folder"
        },
        // the first child list of the expanded directory is itself a directory
        {
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "span", 1]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "directory"
        }
    ]
});

// change the file system address by typing a new value
browser.push({
    delay: {
        // the last file system item is version.json
        node: [
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "li", -1],
            ["getElementsByTagName", "label", 0]
        ],
        qualifier: "ends",
        target: ["innerHTML"],
        type: "property",
        value: "version.json"
    },
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "input", 0]
            ]
        },
        {
            event: "setValue",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "input", 0]
            ],
            value: vars.projectPath
        },
        {
            event: "blur",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "input", 0]
            ]
        }
    ],
    name: "Change file navigator file system location",
    test: [
        {
            // the first file system item is .git
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "label", 0]
            ],
            qualifier: "ends",
            target: ["innerHTML"],
            type: "property",
            value: ".git"
        }
    ]
});

// double click into a child directory
browser.push({
    delay: {
        // the file navigator modal address is now at .git
        node: [
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "li", 0],
            ["getElementsByTagName", "label", 0]
        ],
        qualifier: "ends",
        target: ["innerHTML"],
        type: "property",
        value: "hooks"
    },
    interaction: [
        {
            event: "dblclick",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
            ]
        }
    ],
    name: "Double click into a directory",
    test: [
        {
            // the file navigator modal address is now at .git
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "input", 0]
            ],
            qualifier: "ends",
            target: ["value"],
            type: "property",
            value: ".git"
        }
    ]
});

// use the parent directory button of the file navigator modal
browser.push({
    delay: {
        // the last file system item is version.json
        node: [
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "li", -1],
            ["getElementsByTagName", "label", 0]
        ],
        qualifier: "ends",
        target: ["innerHTML"],
        type: "property",
        value: "version.json"
    },
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 2]
            ]
        }
    ],
    name: "Click the parent directory button",
    test: [
        {
            // the file navigator modal address is now at share-file-systems
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "input", 0]
            ],
            qualifier: "ends",
            target: ["value"],
            type: "property",
            value: "share-file-systems"
        }
    ]
});

// use the back button of the file navigator modal
browser.push({
    delay: {
        // the file navigator modal address is now at .git
        node: [
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "li", 0],
            ["getElementsByTagName", "label", 0]
        ],
        qualifier: "ends",
        target: ["innerHTML"],
        type: "property",
        value: "hooks"
    },
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "header", 0],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Click the back button of a file navigator modal",
    test: [
        {
            // the file navigator modal address returned back to .git
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "input", 0]
            ],
            qualifier: "ends",
            target: ["value"],
            type: "property",
            value: ".git"
        }
    ]
});

// use the minimize button to minimize a modal
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "buttons", 0],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Click the minimize button of a file navigator modal",
    test: [
        {
            // the file navigator modal is 11.5em when minimized
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["style", "width"],
            type: "property",
            value: "11.5em"
        },
        {
            // the modal body is display none
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0]
            ],
            qualifier: "is",
            target: ["style", "display"],
            type: "property",
            value: "none"
        },
        {
            // the file navigator modal is reduced to the tray
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["parentNode", "nodeName", "toLowerCase()"],
            type: "property",
            value: "li"
        }
    ]
});

// refresh the page and verify there is still a minimized file navigation modal
browser.push({
    interaction: [
        {
            event: "refresh",
            node: null
        }
    ],
    name: "Refresh following file navigation minimize",
    test: [
        {
            // the file navigator modal is 11.5em when minimized
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["style", "width"],
            type: "property",
            value: "11.5em"
        },
        {
            // the modal body is display none
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0]
            ],
            qualifier: "is",
            target: ["style", "display"],
            type: "property",
            value: "none"
        },
        {
            // the file navigator modal is reduced to the tray
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["parentNode", "nodeName", "toLowerCase()"],
            type: "property",
            value: "li"
        }
    ]
});

// restore the modal to normal size and location
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Restore a minimized modal",
    test: [
        {
            // the file navigator modal is 11.5em when minimized
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "not",
            target: ["style", "width"],
            type: "property",
            value: "11.5em"
        },
        {
            // the modal body is display none
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0]
            ],
            qualifier: "is",
            target: ["style", "display"],
            type: "property",
            value: "block"
        },
        {
            // the file navigator modal is reduced to the tray
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["parentNode", "nodeName", "toLowerCase()"],
            type: "property",
            value: "div"
        }
    ]
});

// maximize the modal
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "buttons", 0],
                ["getElementsByTagName", "button", 1]
            ]
        }
    ],
    name: "Maximize a modal",
    test: [
        {
            // the modal is at the top of the content area
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["style", "top"],
            type: "property",
            value: "0em"
        },
        {
            // the modal is at the left of the content area
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["style", "left"],
            type: "property",
            value: "0em"
        },
        {
            // the file navigator modal is a different size
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0]
            ],
            qualifier: "not",
            target: ["style", "width"],
            type: "property",
            value: "80em"
        }
    ]
});

// refresh the page and verify the modal is still maximized
browser.push({
    interaction: [
        {
            event: "refresh",
            node: null
        }
    ],
    name: "Refresh following file navigation maximize",
    test: [
        {
            // the modal is at the top of the content area
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["style", "top"],
            type: "property",
            value: "0em"
        },
        {
            // the modal is at the left of the content area
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["style", "left"],
            type: "property",
            value: "0em"
        },
        {
            // the file navigator modal is a different size
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0]
            ],
            qualifier: "not",
            target: ["style", "width"],
            type: "property",
            value: "80em"
        }
    ]
});

// restore a maximized modal
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "buttons", 0],
                ["getElementsByTagName", "button", 1]
            ]
        }
    ],
    name: "Restore a maximized modal to its prior size and location",
    test: [
        {
            // the modal is at the top of the content area
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["style", "top"],
            type: "property",
            value: "22em"
        },
        {
            // the modal is at the left of the content area
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ],
            qualifier: "is",
            target: ["style", "left"],
            type: "property",
            value: "22em"
        },
        {
            // the file navigator modal is a different size
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0]
            ],
            qualifier: "is",
            target: ["style", "width"],
            type: "property",
            value: "80em"
        }
    ]
});

// display context menu
browser.push({
    interaction: [
        {
            event: "contextmenu",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0]
            ]
        }
    ],
    name: "Display file system context menu (right click)",
    test: [
        {
            // the context menu is visible
            node: [
                ["getElementById", "contextMenu", null]
            ],
            qualifier: "is",
            target: ["style", "display"],
            type: "property",
            value: ""
        },
        {
            // there is a details button
            node: [
                ["getElementById", "contextMenu", null],
                ["getElementsByTagName", "li", 0]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "CTRL + ALT + T"
        }
    ]
});

// display details
browser.push({
    delay: {
        // the modal loads and content populates
        node: [
            ["getModalsByModalType", "details", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "h3", 0]
        ],
        qualifier: "begins",
        target: ["innerHTML"],
        type: "property",
        value: "File System Details - "
    },
    interaction: [
        {
            event: "click",
            node: [
                ["getElementById", "contextMenu", null],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Activate file system details",
    test: [
        {
            // text of the first button
            node: [
                ["getModalsByModalType", "details", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["innerHTML"],
            type: "property",
            value: "Largest size"
        },
        {
            // text of the second button
            node: [
                ["getModalsByModalType", "details", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "is",
            target: ["innerHTML"],
            type: "property",
            value: "Recently changed"
        },
        {
            // model does not have a maximize button
            node: [
                ["getModalsByModalType", "details", 0],
                ["getElementsByClassName", "buttons", 0]
            ],
            qualifier: "not contains",
            target: ["innerHTML"],
            type: "property",
            value: "Maximize"
        },
        {
            // model does not have a minimize button
            node: [
                ["getModalsByModalType", "details", 0],
                ["getElementsByClassName", "buttons", 0]
            ],
            qualifier: "not contains",
            target: ["innerHTML"],
            type: "property",
            value: "Minimize"
        },
        {
            // model does have a close button
            node: [
                ["getModalsByModalType", "details", 0],
                ["getElementsByClassName", "buttons", 0]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "Close"
        },
        {
            // model does not contain NaN
            node: [
                ["getModalsByModalType", "details", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "table", 2]
            ],
            qualifier: "not contains",
            target: ["innerHTML"],
            type: "property",
            value: "NaN"
        }
    ]
});

// close details
browser.push({
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "details", 0],
                ["getElementsByClassName", "buttons", 0],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Close the details modal",
    test: [
        {
            // text of the first button
            node: [
                ["getModalsByModalType", "details", 0]
            ],
            qualifier: "is",
            target: ["innerHTML"],
            type: "property",
            value: null
        }
    ]
});

// create two shares and open local device shares
browser.push({
    delay: {
        // is the share modal present?
        node: [
            ["getModalsByModalType", "shares", 0]
        ],
        qualifier: "not",
        target: [],
        type: "element",
        value: null
    },
    interaction: [
        // creating first share
        {
            event: "contextmenu",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0]
            ]
        },
        {
            event: "click",
            node: [
                ["getElementById", "contextMenu", null],
                ["getElementsByTagName", "li", 1],
                ["getElementsByTagName", "button", 0]
            ]
        },
        // creating second share
        {
            event: "contextmenu",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 1]
            ]
        },
        {
            event: "click",
            node: [
                ["getElementById", "contextMenu", null],
                ["getElementsByTagName", "li", 1],
                ["getElementsByTagName", "button", 0]
            ]
        },
        // opening local device shares
        {
            event: "click",
            node: [
                ["getElementById", "device", null],
                ["getElementsByTagName", "li", 1],
                ["getElementsByTagName", "button", 0]
            ]
        }
    ],
    name: "Create two shares and open local device shares",
    test: [
        {
            // text of the subheading
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "h3", 0]
            ],
            qualifier: "begins",
            target: ["innerHTML"],
            type: "property",
            value: "Shares for device Primary Device"
        },
        {
            // two shares are populated
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", null]
            ],
            qualifier: "is",
            target: ["length"],
            type: "property",
            value: 2
        },
        {
            // class name of the first button
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "agentList", 0],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "file-system-root"
        },
        {
            // get text of the first share button
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "agentList", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 0],
                ["getNodesByType", "text_node", 1]
            ],
            qualifier: "is",
            target: ["textContent"],
            type: "property",
            value: "Delete this share"
        },
        {
            // get text of the second share button
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "agentList", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 1],
                ["getNodesByType", "text_node", 1]
            ],
            qualifier: "is",
            target: ["textContent"],
            type: "property",
            value: "(Read Only)"
        },
        {
            // get text of the third share button
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "agentList", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 2],
                ["getNodesByType", "text_node", 0]
            ],
            qualifier: "is",
            target: ["textContent"],
            type: "property",
            value: "Grant Full Access"
        }
    ]
});

// convert a read only share to a full access share
browser.push({
    interaction: [
        // creating first share
        {
            event: "click",
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 2]
            ]
        }
    ],
    name: "Convert read only share to full access share",
    test: [
        {
            // get text of the second share button
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "agentList", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 1],
                ["getNodesByType", "text_node", 1]
            ],
            qualifier: "is",
            target: ["textContent"],
            type: "property",
            value: "(Full Access)"
        },
        {
            // get text of the third share button
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "agentList", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 2],
                ["getNodesByType", "text_node", 0]
            ],
            qualifier: "is",
            target: ["textContent"],
            type: "property",
            value: "Make Read Only"
        },
        {
            // get share class
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "agentList", 0],
                ["getElementsByTagName", "li", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "device full-access"
        }
    ]
});

browser.args = {
    demo: false,
    noClose: false
};
browser.index = -1;

browser.execute = function test_browser_execute(args:testBrowserArgs):void {
    browser.args.demo = args.demo;
    browser.args.noClose = args.noClose;
    serverVars.storage = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`;
    vars.node.fs.readdir(serverVars.storage.slice(0, serverVars.storage.length - 1), function test_browser_execute_readdir(dErr:nodeError, files:string[]):void {
        if (dErr !== null) {
            log([dErr.toString()]);
            error([dErr.toString()]);
            return;
        }
        const browserLaunch = function test_browser_execute_readdir_launch():void {
            const serviceCallback = function test_browser_execute_readdir_launch_serviceCallback(output:serverOutput):void {
                const keyword:string = (process.platform === "darwin")
                        ? "open"
                        : (process.platform === "win32")
                            ? "start"
                            : "xdg-open",
                    port:string = (serverVars.webPort === 443)
                        ? ""
                        : `:${String(serverVars.webPort)}`,
                    path:string = `https://localhost${port}/?test_browser`,
                    // execute a browser by file path to the browser binary
                    binary:string = (process.argv.length > -1 && (process.argv[0].indexOf("\\") > -1 || process.argv[0].indexOf("/") > -1))
                        ? (function test_browser_execute_readdir_launch_serviceCall_binary():string {
                            if (process.platform === "win32") {
                                // yes, this is ugly.  Windows old cmd shell doesn't play well with file paths
                                process.argv.forEach(function test_browser_execute_readdir_launch_serviceCall_binary_eachWin32(value:string, index:number, array:string[]) {
                                    array[index] = ` ${value.replace(/\\/g, "\"\\\"").replace("\"\\", "\\") + "\""}`;
                                });
                            } else {
                                process.argv.forEach(function test_browser_execute_readdir_launch_serviceCall_binary_each(value:string, index:number, array:string[]) {
                                    array[index] = ` "${value}"`;
                                });
                            }
                            return process.argv.join(" ");
                        }())
                        : "",
                    browserCommand:string = `${keyword + binary} ${path}`;
                browser.server = output.server;
                vars.node.child(browserCommand, {cwd: vars.cwd}, function test_browser_execute_readdir_launch_serviceCallback_browser(errs:nodeError):void {
                    if (errs !== null) {
                        log([errs.toString()]);
                        error([errs.toString()]);
                        return;
                    }
                    serverVars.testBrowserCallback = function test_browser_execute_readdir_launch_serviceCallback_browser_testBrowserCallback(serverResponse:ServerResponse):void {
                        log([`${humanTime(false)}browser loaded...`]);
                        response(serverResponse, "text/plain", "Preparing to send browser test 0.");
                        browser.iterate(0);
                    };
                });
            };
            server({
                agent: "",
                agentType: "device",
                callback: serviceCallback
            });
        };
        let length:number = files.length,
            flags:number = length;
        if (length === 1) {
            browserLaunch();
        } else {
            do {
                length = length - 1;
                if (files[length].indexOf(".json") > 0 || files[length].indexOf(".pem") > 0) {
                    remove(serverVars.storage + files[length], function test_browser_execute_readdir_remove():void {
                        flags = flags - 1;
                        if (flags === 1) {
                            browserLaunch();
                        }
                    });
                }
            } while (length > 0);
        }
    });
};

browser.iterate = function test_browser_iterate(index:number):void {
    // not writing to storage
    browser[index].index = index;
    serverVars.testBrowser = JSON.stringify(browser[index]);
    const message:string = JSON.stringify({
            "test-browser": browser[index]
        }),
        delay:number = (browser.args.demo === true || (index > 0 && browser[index - 1].interaction[0].event === "refresh"))
            ? 500
            : 25;
    // delay is necessary to prevent a race condition
    // * about 1 in 10 times this will fail following event "refresh"
    // * because serverVars.testBrowser is not updated to methodGET library fast enough
    setTimeout(function test_browser_iterate_delay():void {
        vars.ws.broadcast(message);
    }, delay);
};

browser.result = function test_browser_result(item:testBrowserResult, serverResponse:ServerResponse):void {
    let a:number = 0,
        falseFlag:boolean = false;
    const length:number = item.payload.length,
        completion = function test_browser_result_completion(pass:boolean):void {
            const plural:string = (browser.length === 1)
                    ? ""
                    : "s",
                totalTests:number = (function test_browser_result_completion_total():number {
                    // gathers a total count of tests
                    let aa:number = browser.length,
                        bb:number = 0;
                    do {
                        aa = aa - 1;
                        bb = bb + browser[aa].test.length;
                    } while (aa > 0);
                    if (browser[aa].delay === undefined) {
                        return bb;
                    }
                    return bb + 1;
                }()),
                exit = function test_browser_result_completion_exit(type:number, message:string):void {
                    if (browser.args.demo === false && browser.args.noClose === false) {
                        vars.ws.broadcast(JSON.stringify({
                            "test-browser-close": {}
                        }));
                    }
                    log([message], true);
                    setTimeout(function test_browser_result_completion_exit_delay() {
                        process.exit(type);
                    }, 50);
                };
            vars.verbose = true;
            if (pass === true) {
                const passPlural:string = (item.index === 1)
                    ? ""
                    : "s";
                exit(0, `${vars.text.green + vars.text.bold}Passed${vars.text.none} all ${totalTests} tests from ${item.index} test campaign${passPlural}.`);
                return;
            }
            exit(1, `${vars.text.angry}Failed${vars.text.none} on test campaign ${vars.text.angry + item.index + vars.text.none}: "${vars.text.cyan + browser[item.index].name + vars.text.none}" out of ${browser.length} total campaign${plural} and ${totalTests} tests.`);
        },
        summary = function test_browser_result_summary(pass:boolean):string {
            const text:string = ` browser test ${item.index}: ${vars.text.none + browser[item.index].name}`,
                resultString:string = (pass === true)
                    ? `${vars.text.green}Passed`
                    : `${vars.text.angry}Failed`;
            return humanTime(false) + resultString + text;
        },
        buildNode = function test_Browser_result_buildNode(config:testBrowserTest, elementOnly:boolean):string {
            let b:number = 0;
            const node:browserDOM[] = config.node,
                property:string[] = config.target,
                nodeLength:number = node.length,
                propertyLength:number = property.length,
                output:string[] = ["document"];
            do {
                output.push(".");
                output.push(node[b][0]);
                output.push("(\"");
                output.push(node[b][1]);
                output.push("\")");
                if (node[b][2] !== null) {
                    output.push("[");
                    output.push(node[b][2].toString());
                    output.push("]");
                }
                b = b + 1;
            } while (b < nodeLength);
            if (config.type === "element" || elementOnly === true) {
                return output.join("");
            }
            if (config.type === "attribute") {
                output.push(".");
                output.push("getAttribute(\"");
                output.push(config.target[0]);
                output.push("\")");
            } else if (config.type === "property") {
                b = 0;
                do {
                    output.push(".");
                    output.push(config.target[b]);
                    b = b + 1;
                } while (b < propertyLength);
            }
            return output.join("");
        },
        testString = function test_browser_result_testString(pass:boolean, config:testBrowserTest):string {
            const valueStore:primitive = config.value,
                valueType:string = typeof valueStore,
                value = (valueStore === null)
                    ? "null"
                    : (valueType === "string")
                        ? `"${valueStore}"`
                        : String(valueStore),
                star:string = `   ${vars.text.angry}*${vars.text.none} `,
                resultString:string = (pass === true)
                    ? `${vars.text.green}Passed:`
                    : (config === browser[item.index].delay)
                        ? `${vars.text.angry}Failed (delay timeout):`
                        : `${vars.text.angry}Failed:`,
                qualifier:string = (config.qualifier === "begins")
                    ? (pass === true)
                        ? "begins with"
                        : `${vars.text.angry}does not begin with${vars.text.none}`
                    : (config.qualifier === "contains")
                        ? (pass === true)
                            ? "contains"
                            : `${vars.text.angry}does not contain${vars.text.none}`
                        : (config.qualifier === "ends")
                            ? (pass === true)
                                ? "ends with"
                                : `${vars.text.angry}does not end with${vars.text.none}`
                            : (config.qualifier === "greater")
                                ? (pass === true)
                                    ? "is greater than"
                                    : `${vars.text.angry}is not greater than${vars.text.none}`
                                : (config.qualifier === "is")
                                    ? (pass === true)
                                        ? "is"
                                        : `${vars.text.angry}is not${vars.text.none}`
                                    : (config.qualifier === "lesser")
                                        ? (pass === true)
                                            ? "is less than"
                                            : `${vars.text.angry}is not less than${vars.text.none}`
                                        : (config.qualifier === "not")
                                            ? (pass === true)
                                                ? "is not"
                                                : `${vars.text.angry}is${vars.text.none}`
                                            : (pass === true)
                                                ? "does not contain"
                                                : `${vars.text.angry}contains${vars.text.none}`,
                nodeString = `${vars.text.none} ${buildNode(config, false)} ${qualifier} ${value}`;
            return star + resultString + nodeString;
        },
        failureMessage = function test_Browser_result_failureMessage(index:number):void {
            if (item.payload[index][2] === buildNode(browser[item.index].test[index], true)) {
                failure.push(`     Actual value: ${vars.text.cyan + item.payload[index][1] + vars.text.none}`);
            } else {
                failure.push(`     DOM node is null: ${vars.text.cyan + item.payload[index][2] + vars.text.none}`);
            }
        },
        failure:string[] = [];

    response(serverResponse, "text/plain", `Processing browser test ${item.index + 1}: ${browser[item.index].name}`);
    if (browser.index < item.index) {
        browser.index = item.index;
        if (item.payload[0][0] === false && item.payload[0][1] === "delay timeout") {
            failure.push(testString((item.payload[1][0] === true), browser[item.index].delay));
            failureMessage(1);
            falseFlag = true;
        } else {
            do {
                failure.push(testString((item.payload[a][0] === true), browser[item.index].test[a]));
                if (item.payload[a][0] === false) {
                    failureMessage(a);
                    falseFlag = true;
                }
                a = a + 1;
            } while (a < length);
        }


        if (falseFlag === true) {
            failure.splice(0, 0, summary(false));
            log(failure);
            completion(false);
            return;
        }
        log([summary(true)]);
        if (item.index + 1 < browser.length) {
            browser.iterate(item.index + 1);
        } else {
            completion(true);
        }
    }
};

export default browser;