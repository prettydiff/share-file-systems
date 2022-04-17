
/* lib/terminal/test/samples/browser_self - A list of tests that execute in the web browser only on this computer. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import showContextMenu from "../application/browserUtilities/showContextMenu.js";
import mainMenu from "../application/browserUtilities/mainMenu.js";
import modalAddress from "../application/browserUtilities/modalAddress.js";

const browserSelf:testBrowserItem[] = [
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementsByTagName", "body", 0]
                    ]
                }
            ],
            machine: "self",
            name: "testing",
            unit: [
                {
                    node: [
                        ["getElementsByTagName", "body", 0]
                    ],
                    qualifier: "is",
                    target: ["nodeName", "toLowerCase()"],
                    type: "property",
                    value: "body"
                },
                {
                    node: [],
                    qualifier: "begins",
                    target: ["window", "location", "href"],
                    type: "property",
                    value: "https://localhost"
                }
            ]
        },

        // complete the login
        {
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
            machine: "self",
            name: "Login form",
            unit: [
                {
                    // that class is removed from body
                    node: [
                        ["getElementsByTagName", "body", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "default"
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
        },

        // refresh the page and test that a user populates and there is no login
        {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: "self",
            name: "Refresh following login form completion",
            // assert that login remains complete, login data is stored and written to page
            unit: [
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
                },
                {
                    // that class is removed from body
                    node: [
                        ["getElementsByTagName", "body", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "default"
                }
            ]
        },

        // access the primary menu
        mainMenu("self"),

        // open a file navigator modal
        {
            delay: {
                // the file navigator modal is created
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "directory"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "fileNavigator", null]
                    ]
                }
            ],
            machine: "self",
            name: "Launch 'File Navigator' modal from primary menu",
            unit: [
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
                    value: "<p aria-live=\"polite\""
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
                        ["getElementsByTagName", "ul", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "fileList"
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
        },

        // expand a directory
        {
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
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Directory expansion",
            unit: [
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
        },

        // change the file system address by typing a new value
        modalAddress({
            address: "",
            index: 0,
            lastItem: "version.json",
            machine: "self"
        }),

        // double click into a child directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByClassName", "lastType", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "screenshots"
            },
            interaction: [
                {
                    event: "dblclick",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null],
                        ["parentNode", null, null]
                    ]
                }
            ],
            machine: "self",
            name: "Double click into a directory",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    qualifier: "ends",
                    target: ["value"],
                    type: "property",
                    value: "documentation"
                }
            ]
        },

        // use the parent directory button of the file navigator modal
        {
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
            machine: "self",
            name: "Click the parent directory button",
            unit: [
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
        },

        // use the back button of the file navigator modal
        {
            delay: {
                // the file navigator modal address is now at .git
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "lastType", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "screenshots"
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
            machine: "self",
            name: "Click the back button of a file navigator modal",
            unit: [
                {
                    // the file navigator modal address returned back to .git
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    qualifier: "ends",
                    target: ["value"],
                    type: "property",
                    value: "documentation"
                }
            ]
        },

        // use the minimize button to minimize a modal
        {
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
            machine: "self",
            name: "Click the minimize button of a file navigator modal",
            unit: [
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
        },

        // refresh the page and verify there is still a minimized file navigation modal
        {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: "self",
            name: "Refresh following file navigation minimize",
            unit: [
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
        },

        // restore the modal to normal size and location
        {
            delay: {
                // the modal body is display none
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "body", 0]
                ],
                qualifier: "is",
                target: ["style", "display"],
                type: "property",
                value: ""
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Restore a minimized modal",
            unit: [
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
        },

        // maximize the modal
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "buttons", 0],
                        ["getElementsByClassName", "maximize", 0]
                    ]
                },
                {
                    event: "wait",
                    node: null,
                    value: "100"
                }
            ],
            machine: "self",
            name: "Maximize a modal",
            unit: [
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
        },

        // refresh the page and verify the modal is still maximized
        {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: "self",
            name: "Refresh following file navigation maximize",
            unit: [
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
        },

        // wait following refresh
        {
            interaction: [
                {
                    event: "wait",
                    node: [],
                    value: "100"
                }
            ],
            machine: "self",
            name: "A minor manual delay following a refresh.",
            unit: [
                    {
                    node: [
                        ["getElementById", "content-area", null]
                    ],
                    qualifier: "greater",
                    target: ["clientHeight"],
                    type: "property",
                    value: 10
                }
            ]
        },

        // restore a maximized modal
        {
            delay: {
                // the modal is at the top of the content area
                node: [
                    ["getModalsByModalType", "fileNavigate", 0]
                ],
                qualifier: "is",
                target: ["style", "top"],
                type: "property",
                value: "20.9em"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "buttons", 0],
                        ["getElementsByClassName", "maximize", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Restore a maximized modal to its prior size and location",
            unit: [
                {
                    // the modal is at the left of the content area
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0]
                    ],
                    qualifier: "is",
                    target: ["style", "left"],
                    type: "property",
                    value: "20.9em"
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
        },

        // return to project directory
        modalAddress({
            address: "",
            index: 0,
            lastItem: "version.json",
            machine: "self"
        }),

        // display context menu
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "ul", 0]
        ], [
            {
                // the context menu is visible
                node: [
                    ["getElementById", "contextMenu", null]
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 2
            },
            {
                // the context menu is visible
                node: [
                    ["getElementById", "contextMenu", null]
                ],
                qualifier: "is",
                target: ["style", "display"],
                type: "property",
                value: ""
            }
        ], "self"),

        // display details
        {
            delay: {
                // text of the first button
                node: [
                    ["getModalsByModalType", "details", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "List 100 largest files"
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
            machine: "self",
            name: "Activate file system details",
            unit: [
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
                    value: "List 100 most recently changed files"
                },
                {
                    // text of the third button
                    node: [
                        ["getModalsByModalType", "details", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "button", 2]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "List all files alphabetically"
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
        },

        // display file list by file size
        {
            delay: {
                node: [
                    ["getModalsByModalType", "details", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "detailFileList", 0]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: "localhost.css"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "details", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Display file list by file size",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "details", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "detailFileList", 0]
                    ],
                    qualifier: "contains",
                    target: ["innerHTML"],
                    type: "property",
                    value: "3,201,649"
                }
            ]
        },

        // display file list by file modification
        {
            delay: {
                node: [
                    ["getModalsByModalType", "details", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "detailFileList", 0]
                ],
                qualifier: "contains",
                target: ["previousSibling", "innerHTML"],
                type: "property",
                value: "100 most recently changed files"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "details", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "button", 1]
                    ]
                }
            ],
            machine: "self",
            name: "Display file list by modification date",
            unit: []
        },

        // display file list all files
        {
            delay: {
                node: [
                    ["getModalsByModalType", "details", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "detailFileList", 0]
                ],
                qualifier: "contains",
                target: ["previousSibling", "innerHTML"],
                type: "property",
                value: "files sorted alphabetically"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "details", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "button", 2]
                    ]
                }
            ],
            machine: "self",
            name: "Display file list all files",
            unit: []
        },

        // close details
        {
            delay: {
                // text of the first button
                node: [
                    ["getModalsByModalType", "details", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: undefined
            },
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
            machine: "self",
            name: "Close the details modal",
            unit: []
        },

        // create two shares and open local device shares
        {
            delay: {
                // two shares are populated
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 1],
                    ["getElementsByTagName", "li", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 2
            },
            interaction: [
                // creating first share
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
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
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "p", 0]
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
            machine: "self",
            name: "Create two shares and open local device shares",
            unit: [
                {
                    // text of the subheading
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "File System Root"
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
                        ["getElementsByTagName", "ul", 1],
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
                        ["getElementsByTagName", "ul", 1],
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
                        ["getElementsByTagName", "ul", 1],
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
        },

        // convert a read only share to a full access share
        {
            interaction: [
                // creating first share
                {
                    coords: [75, 5],
                    event: "move",
                    node: [
                        ["getModalsByModalType", "shares", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "ul", 1],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 2]
                    ]
                }
            ],
            machine: "self",
            name: "Convert read only share to full access share",
            unit: [
                {
                    // get text of the second share button
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 0],
                        ["getElementsByTagName", "ul", 1],
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
                        ["getElementsByTagName", "ul", 1],
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
                        ["getElementsByTagName", "ul", 1],
                        ["getElementsByTagName", "li", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "share full-access"
                }
            ]
        },

        // access the primary menu
        mainMenu("self"),

        // open a second file navigator modal
        {
            delay: {
                // the file navigator modal is created
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "is",
                target: ["title"],
                type: "attribute",
                value: "Expand this folder"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "fileNavigator", null]
                    ]
                },
                {
                    coords: [40, 50],
                    event: "move",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1]
                    ]
                }
            ],
            machine: "self",
            name: "Launch a second 'File Navigator' modal from primary menu",
            unit: [
                {
                    // that file navigation modal contains an address bar
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "status-bar", 0]
                    ],
                    qualifier: "contains",
                    target: ["innerHTML"],
                    type: "property",
                    value: "<p aria-live=\"polite\""
                },
                {
                    // that file navigator modal contains a back button
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
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
                        ["getModalsByModalType", "fileNavigate", 1],
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
        },

        // change the file system address in second file navigator
        modalAddress({
            address: "lib/terminal/test/storageBrowser",
            index: 1,
            lastItem: "storageBrowser.txt",
            machine: "self"
        }),

        // find new directory button
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 1],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByTagName", "li", 0],
            ["getElementsByTagName", "p", 0]
        ], [
            {
                node: [
                    ["getElementById", "contextMenu", null],
                    ["getElementsByTagName", "li", 5],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: "New Directory"
            }
        ], "self"),

        // evoke new directory with an empty field, first time
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: ["parentNode", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Evoke new directory field",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // blur the newFileItem field, directory
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: [],
                type: "element",
                value: null
            },
            interaction: [
                {
                    event: "blur",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                }
            ],
            machine: "self",
            name: "Blur new directory field",
            unit: []
        },

        // evoke new directory with an empty field, second time
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: ["parentNode", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Evoke new directory field second time",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["data-type"],
                    type: "attribute",
                    value: "directory"
                },
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // escape from the newFileItem field, directory
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: [],
                type: "element",
                value: null
            },
            interaction: [
                {
                    event: "keyup",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "Escape"
                }
            ],
            machine: "self",
            name: "Press ESC key on new directory field",
            unit: [
                {
                    // the file navigator modal is created
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "ul", 0]
                    ],
                    qualifier: "contains",
                    target: ["innerHTML"],
                    type: "property",
                    value: "storageBrowser.txt"
                }
            ]
        },

        // evoke new directory with an empty field, third time
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: ["parentNode", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Evoke new directory field third time",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["data-type"],
                    type: "attribute",
                    value: "directory"
                },
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // create new directory with 'Enter' key
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "directory", 0]

                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: filePathEncode("relative", "/_newDirectory-1")
            },
            interaction: [
                {
                    event: "setValue",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "_newDirectory-1"
                },
                {
                    event: "keyup",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "Enter"
                }
            ],
            machine: "self",
            name: "Create a new directory with 'Enter' key",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: [],
                    type: "element",
                    value: null
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["firstChild", null, null]
                    ],
                    qualifier: "contains",
                    target: ["class"],
                    type: "attribute",
                    value: "directory"
                }
            ]
        },

        // evoke new directory with an empty field, fourth time
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: ["parentNode", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Evoke new directory field fourth time",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["data-type"],
                    type: "attribute",
                    value: "directory"
                },
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // create new directory with blur event
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 1]

                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: filePathEncode("relative", "/_newDirectory-2")
            },
            interaction: [
                {
                    event: "setValue",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "_newDirectory-2"
                },
                {
                    event: "blur",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                }
            ],
            machine: "self",
            name: "Create a new directory with blur event",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: [],
                    type: "element",
                    value: null
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 1]
                    ],
                    qualifier: "contains",
                    target: ["class"],
                    type: "attribute",
                    value: "directory"
                }
            ]
        },

        // evoke new file with an empty field
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: ["parentNode", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Evoke new file field",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // blur the newFileItem field, file
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: [],
                type: "element",
                value: null
            },
            interaction: [
                {
                    event: "blur",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                }
            ],
            machine: "self",
            name: "Blur new file field",
            unit: []
        },

        // refresh the file list
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "file"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "reloadDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Refresh the file navigator file list",
            unit: []
        },

        // evoke new file with an empty field, second time
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: ["parentNode", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Evoke new file field second time",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["data-type"],
                    type: "attribute",
                    value: "file"
                },
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // escape from the newFileItem field, file
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: [],
                type: "element",
                value: null
            },
            interaction: [
                {
                    event: "keyup",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "Escape"
                }
            ],
            machine: "self",
            name: "Press ESC key on new file field",
            unit: [
                {
                    // the file navigator modal is created
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "ul", 0]
                    ],
                    qualifier: "contains",
                    target: ["innerHTML"],
                    type: "property",
                    value: "storageBrowser.txt"
                }
            ]
        },

        // evoke new file with an empty field, third time
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: ["parentNode", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Evoke new file field third time",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["data-type"],
                    type: "attribute",
                    value: "file"
                },
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // create new file with 'Enter' key
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: filePathEncode("relative", "/_newFile-1")
            },
            interaction: [
                {
                    event: "setValue",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "_newFile-1"
                },
                {
                    event: "keyup",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "Enter"
                }
            ],
            machine: "self",
            name: "Create a new file with 'Enter' key",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: [],
                    type: "element",
                    value: null
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 5]
                    ],
                    qualifier: "contains",
                    target: ["class"],
                    type: "attribute",
                    value: "file"
                }
            ]
        },

        // evoke new file with an empty field, fourth time
        {
            delay: {
                node: [
                    ["getElementById", "newFileItem", null]
                ],
                qualifier: "is",
                target: ["parentNode", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Evoke new file field fourth time",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["data-type"],
                    type: "attribute",
                    value: "file"
                },
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // create new file with blur event
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 3]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: filePathEncode("relative", "/_newFile-2")
            },
            interaction: [
                {
                    event: "setValue",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "_newFile-2"
                },
                {
                    event: "blur",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                }
            ],
            machine: "self",
            name: "Create a new file with blur event",
            unit: [
                {
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    qualifier: "is",
                    target: [],
                    type: "element",
                    value: null
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 3]
                    ],
                    qualifier: "contains",
                    target: ["class"],
                    type: "attribute",
                    value: "file"
                }
            ]
        },
        
        mainMenu("self"),

        // open text pad
        {
            delay: {
                node: [
                    ["getModalsByModalType", "textPad", 0],
                    ["getElementsByClassName", "body", 0],
                ],
                qualifier: "is",
                target: ["firstChild", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "menu", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Open text pad",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "is",
                    target: ["lastChild", "nodeName", "toLowerCase()"],
                    type: "property",
                    value: "textarea"
                },
                {
                    // that file navigator modal contains a minimize button
                    node: [
                        ["getModalsByModalType", "textPad", 0],
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
                        ["getModalsByModalType", "textPad", 0],
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
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "buttons", 0],
                        ["getElementsByTagName", "button", 2]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "close"
                }
            ]
        },

        // modify text pad value
        {
            interaction: [
                {
                    event: "focus",
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    value: "God bless kittens"
                },
                {
                    event: "blur",
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ]
                },
                // artificial delay to provide time to write textpad text to settings
                {
                    event: "wait",
                    node: [],
                    value: "100"
                }
            ],
            machine: "self",
            name: "Modify text pad value",
            unit: [
                {
                    // that file navigator modal contains a minimize button
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: "God bless kittens"
                }
            ]
        },

        // refresh and test text pad value
        {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: "self",
            name: "Refresh following use of text pad",
            unit: [
                {
                    // that file navigator modal contains a minimize button
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: "God bless kittens"
                }
            ]
        },
        
        mainMenu("self"),

        // open export modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "export", 0],
                    ["getElementsByClassName", "body", 0],
                ],
                qualifier: "is",
                target: ["firstChild", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "menu", null],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Open export modal",
            unit: [
                {
                    // that file navigator modal contains a minimize button
                    node: [
                        ["getModalsByModalType", "export", 0],
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
                        ["getModalsByModalType", "export", 0],
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
                        ["getModalsByModalType", "export", 0],
                        ["getElementsByClassName", "buttons", 0],
                        ["getElementsByTagName", "button", 2]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "close"
                },
                {
                    // that file navigator modal contains a confirm button
                    node: [
                        ["getModalsByModalType", "export", 0],
                        ["getElementsByClassName", "footer", 0],
                        ["getElementsByTagName", "button", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "confirm"
                },
                {
                    // that file navigator modal contains a cancel button
                    node: [
                        ["getModalsByModalType", "export", 0],
                        ["getElementsByClassName", "footer", 0],
                        ["getElementsByTagName", "button", 1]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "cancel"
                },
                {
                    // test the text value
                    node: [
                        ["getModalsByModalType", "export", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    qualifier: "begins",
                    target: ["value"],
                    type: "property",
                    value: "{\"audio\":true,\"brotli\":7,\"color\":\"default\",\"colors\":{\"device\":{\""
                },
                {
                    // test the text value
                    node: [
                        ["getModalsByModalType", "export", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    qualifier: "ends",
                    target: ["value"],
                    type: "property",
                    value: ",\"left\":236,\"top\":236,\"height\":400,\"status\":\"normal\",\"text_value\":\"God bless kittens\"}},\"modalTypes\":[\"configuration\",\"fileNavigate\",\"shares\",\"textPad\"],\"nameDevice\":\"Primary Device\",\"nameUser\":\"Primary User\",\"storage\":\"\",\"tutorial\":true,\"zIndex\":5}"
                }
            ]
        },

        // modify export modal value
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1]
                ],
                qualifier: "is",
                target: ["offsetLeft"],
                type: "property",
                value: 67
            },
            interaction: [
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "export", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    value: `{"audio":true,"brotli":7,"color":"default","colors":{"device":{"string-replace-hash-hashDevice":["fff","eee"]},"user":{}},"hashDevice":"string-replace-hash-hashDevice","hashType":"sha3-512","hashUser":"string-replace-hash-hashUser","modals":{"configuration-modal":{"agent":"","agentType":"device","content":{},"read_only":false,"single":true,"status":"hidden","title":"<span class=\\"icon-configuration\\">⚙</span> Configuration","type":"configuration","inputs":["close"],"zIndex":1,"id":"configuration-modal","left":200,"top":200,"height":400,"width":565},"fileNavigate-0.399721304278451331":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize","text"],"read_only":false,"selection":{},"share":"","status_bar":true,"text_placeholder":"Optionally type a file system address here.","text_value":"${filePathEncode("absolute", ".git")}","title":"<span class=\\"icon-fileNavigator\\">⌹</span> File Navigator - Device, Primary Device","type":"fileNavigate","width":800,"zIndex":16,"id":"fileNavigate-0.399721304278451331","left":893,"top":524,"height":400,"status":"normal","history":["${filePathEncode("relative", "/")}","${filePathEncode("absolute", "")}","${filePathEncode("absolute", ".git")}"],"search":["",""]},"shares-0.566106401484579841":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize"],"read_only":false,"text_value":"🖳 Shares for device - Primary Device","title":"🖳 Shares for device - Primary Device","type":"shares","width":800,"zIndex":14,"id":"shares-0.566106401484579841","left":860,"top":65,"height":400,"status":"normal"},"fileNavigate-0.505560485994826251":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize","text"],"read_only":false,"selection":{},"share":"","status_bar":true,"text_placeholder":"Optionally type a file system address here.","text_value":"${filePathEncode("absolute", "lib/terminal/test/storageBrowser")}","title":"<span class=\\"icon-fileNavigator\\">⌹</span> File Navigator - Device, Primary Device","type":"fileNavigate","width":800,"zIndex":10,"id":"fileNavigate-0.505560485994826251","left":67,"top":36,"height":400,"status":"normal","history":["${filePathEncode("relative", "/")}","${filePathEncode("absolute", "lib/terminal/test/storageBrowser")}"],"search":["",""]},"textPad-0.881811492258500361":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize"],"read_only":false,"title":"<span class=\\"icon-textPad\\">⍑</span> Text Pad","type":"textPad","width":800,"zIndex":12,"id":"textPad-0.881811492258500361","left":67,"top":568,"height":400,"status":"normal","text_value":"God bless kittens"}},"modalTypes":["configuration","fileNavigate","shares","textPad"],"nameDevice":"Primary Device","nameUser":"Primary User","zIndex":16}`
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "export", 0],
                        ["getElementsByClassName", "footer", 0],
                        ["getElementsByClassName", "confirm", 0]
                    ]
                },
                {
                    event: "refresh-interaction",
                    node: []
                }
            ],
            machine: "self",
            name: "Modify export modal value",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0]
                    ],
                    qualifier: "is",
                    target: ["offsetLeft"],
                    type: "property",
                    value: 893
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0]
                    ],
                    qualifier: "is",
                    target: ["offsetTop"],
                    type: "property",
                    value: 524
                }
            ]
        },

        // test history after refresh
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "fileList", 0]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: "version.json"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "backDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Step back in history of file navigator",
            unit: []
        },

        // open context menu on project js directory
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByText", filePathEncode("absolute", "js"), 0],
            ["parentNode", null, null]
        ], [], "self"),

        // copy directory using context menu
        {
            delay: {
                node: [
                    ["getElementById", "contextMenu", null]
                ],
                qualifier: "is",
                target: [],
                type: "element",
                value: null
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Copy js directory using the context menu",
            unit: []
        },

        // open context menu to paste
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 1],
            ["getElementsByClassName", "body", 0],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByTagName", "p", 0]
        ], [], "self"),

        // paste from context menu
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Copying 100.00% complete."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 6],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Paste from context menu",
            unit: [
                {
                    node: [
                        ["getElementById", "contextMenu", null]
                    ],
                    qualifier: "is",
                    target: [],
                    type: "element",
                    value: null
                }
            ]
        },

        // update file list
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "span", 1]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "directory - "
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "reloadDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Update file list",
            unit: [
                {
                    node: [
                        ["getElementById", "contextMenu", null]
                    ],
                    qualifier: "is",
                    target: [],
                    type: "element",
                    value: null
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2]
                    ],
                    qualifier: "begins",
                    target: ["class"],
                    type: "attribute",
                    value: "directory"
                }
            ]
        },

        // expand copied directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "span", 1]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "directory - 4 items"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Expand copied directory",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "ul", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "fileList"
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "ul", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "ends",
                    target: ["innerHTML"],
                    type: "property",
                    value: "lib"
                }
            ]
        },

        // show context menu on copied directory
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 1],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByTagName", "li", 2],
            ["getElementsByTagName", "p", 0]
        ], [], "self"),

        // delete js directory using context menu
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "Destroyed 1 file system item"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 8],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Delete js directory using context menu",
            unit: []
        },

        // refresh file navigator contents
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "file"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "reloadDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Refresh the file navigator file list",
            unit: []
        },

        // select js directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 4],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "selected"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "p", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Select js directory",
            unit: []
        },

        // select additional two directories
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 3],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "selected"
            },
            interaction: [
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                }
            ],
            machine: "self",
            name: "Select additional two directories",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "selected"
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "selected"
                }
            ]
        },

        // add two selected directories to the clipboard
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 4]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "directory"
            },
            interaction: [
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                }
            ],
            machine: "self",
            name: "Add two selected directories to the clipboard",
            unit: []
        },

        // paste directories into different file navigator
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Copying 100.00% complete."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                }
            ],
            machine: "self",
            name: "Paste two directories into different file navigator",
            unit: []
        },

        // update file list
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 4],
                    ["getElementsByTagName", "p", 0],
                    ["lastChild", null, null]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "directory - 12 items"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "reloadDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Update file list 2",
            unit: [
                {
                    node: [
                        ["getElementById", "contextMenu", null]
                    ],
                    qualifier: "is",
                    target: [],
                    type: "element",
                    value: null
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2]
                    ],
                    qualifier: "begins",
                    target: ["class"],
                    type: "attribute",
                    value: "directory"
                }
            ]
        },

        // select the three pasted directories
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 3],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "selected"
            },
            interaction: [
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                }
            ],
            machine: "self",
            name: "Select the two pasted directories",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "selected"
                }
            ]
        },

        // delete the three selected directories using the keyboard shortcut
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "Destroyed 3 file system items"
            },
            interaction: [
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Delete"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Delete"
                }
            ],
            machine: "self",
            name: "Delete the two selected directories using the keyboard shortcut",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "file"
                }
            ]
        },

        // select two files
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 4],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "selected"
            },
            interaction: [
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                }
            ],
            machine: "self",
            name: "Select two files",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "selected"
                }
            ]
        },

        // display context menu on selected files
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 1],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByTagName", "li", 3],
            ["getElementsByTagName", "p", 0]
        ], [], "self"),

        // cut two files using context menu
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 3],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "selected cut"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 8],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Cut two files using context menu",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "selected cut"
                }
            ]
        },

        // navigate to a child directory using keyboard
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "empty-list"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Enter"
                }
            ],
            machine: "self",
            name: "Navigate to a child directory using keyboard",
            unit: []
        },

        // paste cut files using keyboard
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Cutting 100.00% complete."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                }
            ],
            machine: "self",
            name: "Paste cut files using keyboard",
            unit: []
        },

        // update modal file contents
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 2
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "reloadDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Update modal file contents to show pasted files",
            unit: [
                {
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "active"
                }
            ]
        },

        // select all with keyboard shortcut and cut
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "cut"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "a"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "a"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "x"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "x"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                }
            ],
            machine: "self",
            name: "Select all with keyboard shortcut and cut files with keyboard",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "cut"
                }
            ]
        },

        // display context menu
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByClassName", "file", 1],
            ["getElementsByTagName", "p", 0]
        ], [
            {
                // the context menu is visible
                node: [
                    ["getElementById", "contextMenu", null]
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 2
            },
            {
                // the context menu is visible
                node: [
                    ["getElementById", "contextMenu", null]
                ],
                qualifier: "is",
                target: ["style", "display"],
                type: "property",
                value: ""
            }
        ], "self"),

        // launch a file editor
        {
            delay: {
                // text of the first button
                node: [
                    ["getModalsByModalType", "textPad", 1],
                    ["getElementsByClassName", "body", 0]
                ],
                qualifier: "is",
                target: ["firstChild", "nodeName", "toLowerCase()"],
                type: "property",
                value: "label"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Launch a file editor",
            unit: [
                {
                    // text of the first button
                    node: [
                        ["getModalsByModalType", "textPad", 1],
                        ["getElementsByClassName", "body", 0]
                    ],
                    qualifier: "is",
                    target: ["firstChild", "lastChild", "nodeName", "toLowerCase()"],
                    type: "property",
                    value: "textarea"
                }
            ]
        },

        // minimize all
        {
            delay: {
                node: [
                    ["getModalsByModalType", "textPad", 1],
                    ["parentNode", null, null],
                    ["parentNode", null, null],
                    ["parentNode", null, null]
                ],
                qualifier: "is",
                target: ["id"],
                type: "attribute",
                value: "tray"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "minimize-all", null]
                    ]
                }
            ],
            machine: "self",
            name: "Click 'minimize-all' button",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["parentNode", null, null],
                        ["parentNode", null, null],
                        ["parentNode", null, null]
                    ],
                    qualifier: "is",
                    target: ["id"],
                    type: "attribute",
                    value: "tray"
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["parentNode", null, null],
                        ["parentNode", null, null],
                        ["parentNode", null, null]
                    ],
                    qualifier: "is",
                    target: ["id"],
                    type: "attribute",
                    value: "tray"
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["parentNode", null, null],
                        ["parentNode", null, null],
                        ["parentNode", null, null]
                    ],
                    qualifier: "is",
                    target: ["id"],
                    type: "attribute",
                    value: "tray"
                },
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["parentNode", null, null],
                        ["parentNode", null, null],
                        ["parentNode", null, null]
                    ],
                    qualifier: "is",
                    target: ["id"],
                    type: "attribute",
                    value: "tray"
                }
            ]
        },

        // restore file editor from tray
        {
            delay: {
                node: [
                    ["getModalsByModalType", "textPad", 1],
                    ["parentNode", null, null]
                ],
                qualifier: "is",
                target: ["id"],
                type: "attribute",
                value: "content-area"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "textPad", 1],
                        ["getElementsByClassName", "heading", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Restore file editor modal 1 from minimize tray",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "textPad", 1],
                        ["getElementsByClassName", "buttons", 0]
                    ],
                    qualifier: "is",
                    target: ["style", "display"],
                    type: "property",
                    value: ""
                }
            ]
        },

        // restore file editor from tray
        {
            delay: {
                node: [
                    ["getModalsByModalType", "textPad", 0],
                    ["parentNode", null, null]
                ],
                qualifier: "is",
                target: ["id"],
                type: "attribute",
                value: "content-area"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "heading", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Restore file editor modal from minimize tray 2",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "textPad", 0],
                        ["getElementsByClassName", "buttons", 0]
                    ],
                    qualifier: "is",
                    target: ["style", "display"],
                    type: "property",
                    value: ""
                },
                {
                    node: [
                        ["getModalsByModalType", "textPad", 0]
                    ],
                    qualifier: "is",
                    target: ["style", "top"],
                    type: "property",
                    value: "56.8em"
                }
            ]
        },

        // restore file navigate 0
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "heading", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Restore file navigate 0 from minimize tray",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0]
                    ],
                    qualifier: "greater",
                    target: ["clientHeight"],
                    type: "property",
                    value: 200
                },
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0]
                    ],
                    qualifier: "greater",
                    target: ["offsetLeft"],
                    type: "property",
                    value: 800
                }
            ]
        },

        // search file navigate 0 with a string fragment
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Search fragment \"<em>browser_s</em>\" returned <strong>2</strong> matches from"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "browser_s"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "blur",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Search file navigate 0 with a string fragment",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", null]
                    ],
                    qualifier: "is",
                    target: ["length"],
                    type: "property",
                    value: 2
                }
            ]
        },

        // search file navigate 0 with a regular expression
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Regular expression \"<em>/br\\w+_s/</em>\" returned <strong>1</strong> match from"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "/br\\w+_s/"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "blur",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileSearch", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Search file navigate 0 with a regular expression",
            unit: []
        },

        // test for idle state
        {
            interaction: [
                {
                    event: "wait",
                    node: [],
                    value: "16000"
                }
            ],
            machine: "self",
            name: "Wait for idle state",
            unit: [
                {
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "idle"
                }
            ]
        }
    ];

export default browserSelf;