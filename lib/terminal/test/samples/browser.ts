
/* lib/terminal/test/samples/browser - A list of tests that execute in the web browser. */

import vars from "../../utilities/vars.js";

const windowsPath:string = vars.projectPath.replace(/\\/g, "\\\\"),
    windowsSep:string = vars.sep.replace(/\\/g, "\\\\"),
    mainMenu:testBrowserItem = {
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
    },
    browser:testBrowserItem[] = [

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
        },

        // refresh the page and test that a user populates and there is no login
        {
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

        // access the primary menu
        mainMenu,

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
        },

        // change the file system address by typing a new value
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
        },

        // double click into a child directory
        {
            delay: {
                // the file navigator modal address is now at .git
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
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
        },

        // use the back button of the file navigator modal
        {
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
        },

        // refresh the page and verify there is still a minimized file navigation modal
        {
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
                value: "block"
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
        },

        // refresh the page and verify the modal is still maximized
        {
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
        },

        // restore a maximized modal
        {
            delay: {
                // the modal is at the top of the content area
                node: [
                    ["getModalsByModalType", "fileNavigate", 0]
                ],
                qualifier: "is",
                target: ["clientLeft"],
                type: "property",
                value: 0
            },
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
        },

        // display context menu
        {
            delay: {
                // there is a details button
                node: [
                    ["getElementById", "contextMenu", null],
                    ["getElementsByTagName", "li", 0]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: "CTRL + ALT + T"
            },
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
            ]
        },

        // display details
        {
            delay: {
                // the modal loads and content populates
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
        },

        // access the primary menu
        mainMenu,

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
            name: "Launch a second 'File Navigator' modal from primary menu",
            test: [
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
                    value: `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser`
                },
                {
                    event: "blur",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByTagName", "input", 0]
                    ]
                }
            ],
            name: "Change file navigator file system location to storageBrowser",
            test: [
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
        {
            delay: {
                node: [
                    ["getElementById", "contextMenu", null]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: "New Directory"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "li", 0]
                    ]
                }
            ],
            name: "Find the new directory button from the context menu",
            test: [
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
            ]
        },

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
            name: "Evoke new directory field",
            test: [
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
            name: "Blur new directory field",
            test: []
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
            name: "Evoke new directory field second time",
            test: [
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
            name: "Press ESC key on new directory field",
            test: [
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
            name: "Evoke new directory field third time",
            test: [
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
                    ["getElementsByTagName", "li", 0]

                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: `${vars.sep}_newDirectory-1`
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
            name: "Create a new directory with 'Enter' key",
            test: [
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
                        ["getElementsByTagName", "li", 0]
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
                        ["getElementsByTagName", "li", 0]
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
            name: "Evoke new directory field fourth time",
            test: [
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
                    ["getElementsByTagName", "li", 1]

                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: `${vars.sep}_newDirectory-2`
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
            name: "Create a new directory with blur event",
            test: [
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
            name: "Evoke new file field",
            test: [
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
            name: "Blur new file field",
            test: []
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
            name: "Evoke new file field second time",
            test: [
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
            name: "Press ESC key on new file field",
            test: [
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
            name: "Evoke new file field third time",
            test: [
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
                    ["getElementsByTagName", "li", 2]

                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: `${vars.sep}_newFile-1`
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
            name: "Create a new file with 'Enter' key",
            test: [
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
                        ["getElementsByTagName", "li", 2]
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
            name: "Evoke new file field fourth time",
            test: [
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
                    ["getElementsByTagName", "li", 3]

                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: `${vars.sep}_newFile-2`
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
            name: "Create a new file with blur event",
            test: [
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
        
        mainMenu,

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
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            name: "Open text pad",
            test: [
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
            name: "Modify text pad value",
            test: [
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
            name: "Refresh following use of text pad",
            test: [
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
        
        mainMenu,

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
                        ["getElementsByTagName", "li", 3],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            name: "Open export modal",
            test: [
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
                    value: `","left":250,"top":250,"height":400,"status":"normal","text_value":"God bless kittens"}},"modalTypes":["settings","systems","fileNavigate","shares","textPad"],"nameDevice":"Primary Device","nameUser":"Primary User","zIndex":6}`
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
                    value: `{"audio":true,"brotli":7,"color":"default","colors":{"device":{"string-replace-hash-hashDevice":["fff","eee"]},"user":{}},"hashDevice":"string-replace-hash-hashDevice","hashType":"sha3-512","hashUser":"string-replace-hash-hashUser","modals":{"settings-modal":{"agent":"","agentType":"device","content":{},"read_only":false,"single":true,"status":"hidden","title":"<span class=\\"icon-settings\\">⚙</span> Settings","type":"settings","inputs":["close"],"zIndex":1,"id":"settings-modal","left":200,"top":200,"height":400,"width":565},"systems-modal":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"read_only":false,"single":true,"status":"hidden","title":"<span class=\\"icon-systemLog\\">⌬</span> System Log","type":"systems","inputs":["close"],"width":800,"zIndex":2,"id":"systems-modal","left":210,"top":210,"height":400},"fileNavigate-0.399721304278451331":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize","text"],"read_only":false,"selection":{},"share":"","status_bar":true,"text_placeholder":"Optionally type a file system address here.","text_value":"${windowsPath}.git","title":"<span class=\\"icon-fileNavigator\\">⌹</span> File Navigator - Device, Primary Device","type":"fileNavigate","width":800,"zIndex":16,"id":"fileNavigate-0.399721304278451331","left":893,"top":524,"height":400,"status":"normal","history":["${windowsSep}","${windowsPath}","${windowsPath}.git"],"search":["",""]},"shares-0.566106401484579841":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize"],"read_only":false,"text_value":"🖳 Shares for device - Primary Device","title":"🖳 Shares for device - Primary Device","type":"shares","width":800,"zIndex":14,"id":"shares-0.566106401484579841","left":860,"top":65,"height":400,"status":"normal"},"fileNavigate-0.505560485994826251":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize","text"],"read_only":false,"selection":{},"share":"","status_bar":true,"text_placeholder":"Optionally type a file system address here.","text_value":"${windowsPath}lib${windowsSep}terminal${windowsSep}test${windowsSep}storageBrowser","title":"<span class=\\"icon-fileNavigator\\">⌹</span> File Navigator - Device, Primary Device","type":"fileNavigate","width":800,"zIndex":10,"id":"fileNavigate-0.505560485994826251","left":67,"top":36,"height":400,"status":"normal","history":["${windowsSep}","${windowsPath}lib${windowsSep}terminal${windowsSep}test${windowsSep}storageBrowser"],"search":["",""]},"textPad-0.881811492258500361":{"agent":"string-replace-hash-hashDevice","agentType":"device","content":{},"inputs":["close","maximize","minimize"],"read_only":false,"title":"<span class=\\"icon-textPad\\">⍑</span> Text Pad","type":"textPad","width":800,"zIndex":12,"id":"textPad-0.881811492258500361","left":67,"top":568,"height":400,"status":"normal","text_value":"God bless kittens"}},"modalTypes":["settings","systems","fileNavigate","shares","textPad"],"nameDevice":"Primary Device","nameUser":"Primary User","zIndex":16}`
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
            name: "Modify export modal value",
            test: [
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
            name: "Step back in history of file navigator",
            test: []
        },

        // open context menu on project js directory
        {
            delay: {
                node: [
                    ["getElementById", "contextMenu", null]
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 2
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5]
                    ]
                }
            ],
            name: "Open context menu on project js directory",
            test: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 5],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "ends",
                    target: ["innerHTML"],
                    type: "property",
                    value: "js"
                }
            ]
        },

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
            name: "Copy js directory using the context menu",
            test: []
        },

        // open context menu to paste
        {
            delay: {
                node: [
                    ["getElementById", "contextMenu", null]
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 2
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                }
            ],
            name: "Open context menu to paste",
            test: []
        },

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
                        ["getElementsByTagName", "li", 2],
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
            name: "Paste from context menu",
            test: [
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
                        ["getElementsByClassName", "reloadDirectory", 0]
                    ]
                }
            ],
            name: "Update file list",
            test: [
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
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "span", 1]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "directory - 2 items"
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
            name: "Expand copied directory",
            test: [
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
        }
    ];

export default browser;