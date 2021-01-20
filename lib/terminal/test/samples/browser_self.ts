
/* lib/terminal/test/samples/browser_self - A list of tests that execute in the web browser only on this computer. */

import filePathEncode from "../application/file_path_encode.js";
import showContextMenu from "../application/browser_showContextMenu.js"
import mainMenu from "../application/browser_mainMenu.js";
import projectDirectory from "../application/browser_projectDirectory.js";

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
                }
            ]
        },

        // complete the login
        {
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
            machine: "self",
            name: "Login form",
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
                    value: null
                }
            ]
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
        },

        // access the primary menu
        mainMenu("self"),

        // open a file navigator modal
        {
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
        projectDirectory(0, "self"),

        // double click into a child directory
        {
            delay: {
                // the file navigator modal address is now at .git
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByClassName", "lastType", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "refs"
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
            machine: "self",
            name: "Double click into a directory",
            unit: [
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
                value: "refs"
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
                    value: ".git"
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
        projectDirectory(0, "self"),

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
                    value: "34,080"
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
            unit: [
                {
                    // text of the first button
                    node: [
                        ["getModalsByModalType", "details", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: undefined
                }
            ]
        },

        // create two shares and open local device shares
        {
            delay: {
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
            machine: "self",
            name: "Create two shares and open local device shares",
            unit: [
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
                    value: "<p>"
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
        {
            delay: {
                // the file navigator modal is created
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 0]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: "storage.txt"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: filePathEncode("absolute", "lib/terminal/test/storageBrowser")
                },
                {
                    event: "blur",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByTagName", "input", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Change file navigator file system location to storageBrowser",
            unit: [
                {
                    // the first file system item is .git
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "status-bar", 0]
                    ],
                    qualifier: "contains",
                    target: ["innerHTML"],
                    type: "property",
                    value: "0 errors"
                }
            ]
        },

        // find new directory button
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 1],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "li", 0]
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
            delay: 
            {
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
                    value: "storage.txt"
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
                        ["getElementsByTagName", "li", 3]
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
                        ["getElementsByTagName", "li", 3]
                    ]
                },
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
                    ["getElementsByTagName", "li", 4]

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
                        ["getElementsByTagName", "li", 4]
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
                        ["getElementsByTagName", "li", 3]
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
                        ["getElementsByTagName", "li", 0]
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
            delay: 
            {
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
                    value: "storage.txt"
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
                        ["getElementsByTagName", "li", 0]
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
                    ["getElementsByTagName", "li", 5]

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
                        ["getElementsByTagName", "li", 0]
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
                    ["getElementsByTagName", "li", 6]

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
                        ["getElementsByTagName", "li", 6]
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
                value: "textarea"
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
                value: "textarea"
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
                    value: `{"audio":true,"brotli":7,"color":"default","colors":{"device":{"`
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
                    value: `","left":236,"top":236,"height":400,"status":"normal","text_value":"God bless kittens"}},"modalTypes":["settings","fileNavigate","shares","textPad"],"nameDevice":"Primary Device","nameUser":"Primary User","zIndex":5}`
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
                    value: `{"audio":true,"brotli":7,"color":"default","colors":{"device":{"string-replace-hash-hashDevice":["fff","eee"]},"user":{}},"hashDevice":"string-replace-hash-hashDevice","hashType":"sha3-512","hashUser":"string-replace-hash-hashUser","modals":{"settings-modal":{"agent":"","agentType":"device","content":{},"read_only":false,"single":true,"status":"hidden","title":"<span class=\\"icon-settings\\">⚙</span> Settings","type":"settings","inputs":["close"],"zIndex":1,"id":"settings-modal","left":200,"top":200,"height":400,"width":565},"fileNavigate-0.399721304278451331":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize","text"],"read_only":false,"selection":{},"share":"","status_bar":true,"text_placeholder":"Optionally type a file system address here.","text_value":"${filePathEncode("absolute", ".git")}","title":"<span class=\\"icon-fileNavigator\\">⌹</span> File Navigator - Device, Primary Device","type":"fileNavigate","width":800,"zIndex":16,"id":"fileNavigate-0.399721304278451331","left":893,"top":524,"height":400,"status":"normal","history":["${filePathEncode("relative", "/")}","${filePathEncode("absolute", "")}","${filePathEncode("absolute", ".git")}"],"search":["",""]},"shares-0.566106401484579841":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize"],"read_only":false,"text_value":"🖳 Shares for device - Primary Device","title":"🖳 Shares for device - Primary Device","type":"shares","width":800,"zIndex":14,"id":"shares-0.566106401484579841","left":860,"top":65,"height":400,"status":"normal"},"fileNavigate-0.505560485994826251":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize","text"],"read_only":false,"selection":{},"share":"","status_bar":true,"text_placeholder":"Optionally type a file system address here.","text_value":"${filePathEncode("absolute", "lib/terminal/test/storageBrowser")}","title":"<span class=\\"icon-fileNavigator\\">⌹</span> File Navigator - Device, Primary Device","type":"fileNavigate","width":800,"zIndex":10,"id":"fileNavigate-0.505560485994826251","left":67,"top":36,"height":400,"status":"normal","history":["${filePathEncode("relative", "/")}","${filePathEncode("absolute", "lib/terminal/test/storageBrowser")}"],"search":["",""]},"textPad-0.881811492258500361":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize"],"read_only":false,"title":"<span class=\\"icon-textPad\\">⍑</span> Text Pad","type":"textPad","width":800,"zIndex":12,"id":"textPad-0.881811492258500361","left":67,"top":568,"height":400,"status":"normal","text_value":"God bless kittens"}},"modalTypes":["settings","fileNavigate","shares","textPad"],"nameDevice":"Primary Device","nameUser":"Primary User","zIndex":16}`
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
            ["getElementsByClassName", "body", 0],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByText", filePathEncode("absolute", "js"), 0],
            ["parentNode", null, null],
            ["parentNode", null, null]
        ], [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByClassName", "lastType", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "node_modules"
            }
        ], "self"),

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
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null]
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
            ["getElementsByClassName", "fileList", 0]
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
                value: "Copy complete."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null],
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "button", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "contextMenu", null]
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
            ["getElementsByTagName", "li", 2]
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
                value: "1 item deleted."
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
                    ["getElementsByTagName", "li", 5],
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
                        ["getElementsByTagName", "li", 5]
                    ]
                }
            ],
            machine: "self",
            name: "Select js directory",
            unit: []
        },

        // select additional directory
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
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4]
                    ]
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4]
                    ],
                    value: "Control"
                }
            ],
            machine: "self",
            name: "Select additional directory",
            unit: [
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
                        ["getElementsByTagName", "li", 4]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4]
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
                value: "Copy complete."
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
                    ["getElementsByTagName", "li", 8],
                    ["getElementsByTagName", "span", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "file - 145 bytes"
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

        // select the two pasted directories
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
                        ["getElementsByTagName", "li", 2]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3]
                    ]
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3]
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

        // delete the two selected directories using the keyboard shortcut
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
                value: "2 items deleted."
            },
            interaction: [
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3]
                    ],
                    value: "Delete"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3]
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
                        ["getElementsByTagName", "li", 2]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 2]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3]
                    ]
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3]
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

        // display context menu on selected files
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 1],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByTagName", "li", 2]
        ], [], "self"),

        // cut two files using context menu
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
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
                    ["getElementsByTagName", "li", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 0
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 1]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 1]
                    ],
                    value: "Enter"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 1]
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
                value: "Cut complete. 2 files written"
            },
            interaction: [
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
        }
    ];

export default browserSelf;