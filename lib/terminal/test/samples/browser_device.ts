
/* lib/terminal/test/samples/browser_device - A list of tests that execute in the web browser and require multiple computers. */

import inviteAccept from "../application/browserUtilities/inviteAccept.js";
import inviteConfirm from "../application/browserUtilities/inviteConfirm.js";
import inviteModal from "../application/browserUtilities/inviteModal.js";
import inviteSend from "../application/browserUtilities/inviteSend.js";
import login from "../application/browserUtilities/login.js";
import mainMenu from "../application/browserUtilities/mainMenu.js";
import modalAddress from "../application/browserUtilities/modalAddress.js";
import moveToSandbox from "../application/browserUtilities/moveToSandbox.js";
import newDirectory from "../application/browserUtilities/newDirectory.js";
import showContextMenu from "../application/browserUtilities/showContextMenu.js";

const browserDevice:testBrowserItem[] = [
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
    login("self"),

    // complete the login on VM1
    login("VM1"),

    // complete the login on VM2
    login("VM2"),

    // complete the login on VM3
    login("VM3"),

    // complete the login on VM4
    login("VM4"),

    // invite device VM2 from VM1
    mainMenu("VM1"),
    inviteModal("VM1"),
    inviteSend("VM1", "VM2", "device"),
    inviteAccept("VM1", "VM2", "device"),
    inviteConfirm("VM1", "VM2", "device"),

    // invite device VM4 from VM3
    mainMenu("VM3"),
    inviteModal("VM3"),
    inviteSend("VM3", "VM4", "device"),
    inviteAccept("VM3", "VM4", "device"),
    inviteConfirm("VM3", "VM4", "device"),

    // invite device VM1 from self
    mainMenu("self"),
    inviteModal("self"),
    inviteSend("self", "VM1", "device"),
    inviteAccept("self", "VM1", "device"),
    {
        delay: {
            node: [
                ["getElementById", "device", null],
                ["getElementsByTagName", "li", 3],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["lastChild", "textContent"],
            type: "property",
            value: " Primary Device"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-accept", 0],
                    ["getElementsByClassName", "confirm", 0]
                ]
            }
        ],
        machine: "VM1",
        name: "On VM1 accept device invitation from self",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "invite-accept", 0]
                ],
                qualifier: "is",
                target: [],
                type: "element",
                value: undefined
            }
        ]
    },
    {
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementById", "content-area", null]
                ]
            }
        ],
        machine: "self",
        name: "On self verify addition of two devices",
        unit: [
            {
                node: [
                    ["getElementById", "device", null],
                    ["getElementsByTagName", "li", 3],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "is",
                target: ["lastChild", "textContent"],
                type: "property",
                value: " VM1"
            }
        ]
    },

    // invite user VM3 from self
    mainMenu("self"),
    inviteModal("self"),

    //open shares on self
    {
        delay: {
            node: [
                ["getModalsByModalType", "shares", 0]
            ],
            qualifier: "greater",
            target: ["clientHeight"],
            type: "property",
            value: 200
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementsByClassName", "all-shares", 0],
                    ["getElementsByTagName", "button", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self open shares modal of all shares",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByClassName", "device", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 3
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 4
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "share", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 0
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "h3", 1]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "There are <strong>0 users</strong> available."
            }
        ]
    },

    //open shares on VM1
    {
        delay: {
            node: [
                ["getModalsByModalType", "shares", 0]
            ],
            qualifier: "greater",
            target: ["clientHeight"],
            type: "property",
            value: 200
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementsByClassName", "all-shares", 0],
                    ["getElementsByTagName", "button", 0]
                ]
            }
        ],
        machine: "VM1",
        name: "On VM1 open shares modal of all shares",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByClassName", "device", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 3
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 4
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "share", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 0
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "h3", 1]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "There are <strong>0 users</strong> available."
            }
        ]
    },

    mainMenu("VM1"),

    // open file navigator modal on VM1
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
        machine: "VM1",
        name: "On VM1 launch 'File Navigator' modal from primary menu",
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
                value: "<p aria-live=\"polite\" role=\"status\">"
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

    // change address location of file navigator modal on VM1
    modalAddress({
        address: "",
        index: 0,
        lastItem: "version.json",
        machine: "VM1"
    }),
    showContextMenu([
        ["getModalsByModalType", "fileNavigate", 0],
        ["getElementsByClassName", "body", 0],
        ["getElementsByTagName", "li", 3],
        ["getElementsByTagName", "p", 0]
    ], [], "VM1"),

    // share a directory from VM1
    {
        delay: {
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByClassName", "share", 0],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "ends",
            target: ["firstChild", "textContent"],
            type: "property",
            value: "documentation"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementById", "contextMenu", null],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "button", 0]
                ]
            }
        ],
        machine: "VM1",
        name: "On VM1 share a directory",
        unit: []
    },

    // verify VM1 share from self
    {
        interaction: [
            {
                event: "wait",
                node: []
            }
        ],
        machine: "self",
        name: "On self verify shared directory from VM1",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "device", 2],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "button", 1]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "documentation"
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "device", 2],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "button", 1],
                    ["getElementsByTagName", "strong", 0]
                ],
                qualifier: "is",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "(Read Only)"
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "device", 2],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "button", 1],
                    ["getElementsByTagName", "strong", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "read-only-status"
            }
        ]
    },

    // access VM1's share directory on self
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "fileList", 0],
                ["getElementsByTagName", "li", 1],
                ["getElementsByTagName", "label", 0]
            ],
            qualifier: "ends",
            target: ["firstChild", "textContent"],
            type: "property",
            value: "api.md"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "device", 2],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "button", 1]
                ]
            }
        ],
        machine: "self",
        name: "On self open VM1's share",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "device", 2],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "button", 1],
                    ["getElementsByTagName", "strong", 0]
                ],
                qualifier: "is",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "(Read Only)"
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "device", 2],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "button", 1],
                    ["getElementsByTagName", "strong", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "read-only-status"
            },
        ]
    },

    // open file navigate context menu at self
    showContextMenu([
        ["getModalsByModalType", "fileNavigate", 0],
        ["getElementsByClassName", "body", 0],
        ["getElementsByTagName", "li", 1],
        ["getElementsByTagName", "p", 0]
    ],
    [], "self"),

    // on self read from a VM1 file
    {
        delay: {
            node: [
                ["getModalsByModalType", "textPad", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "textarea", 0]
            ],
            qualifier: "greater",
            target: ["clientHeight"],
            type: "property",
            value: 200
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
        name: "On self open a file from VM1",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "textPad", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "textarea", 0]
                ],
                qualifier: "begins",
                target: ["value"],
                type: "property",
                value: "<!-- documentation/api - This documentation details"
            }
        ]
    },

    // open file navigate context menu at self
    showContextMenu([
        ["getModalsByModalType", "fileNavigate", 0],
        ["getElementsByClassName", "body", 0],
        ["getElementsByTagName", "li", 0],
        ["getElementsByTagName", "p", 0]
    ],
    [], "self"),

    // access file navigate modal on self
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
            value: "directory"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "device", 0],
                    ["getElementsByTagName", "button", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self open local files in file navigate modal",
        unit: []
    },

    modalAddress({
        address: "/lib/terminal/test/storageBrowser",
        index: 1,
        lastItem: "settings.txt",
        machine: "self"
    }),

    mainMenu("VM2"),

    // open file navigator modal on VM2
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
        machine: "VM2",
        name: "On VM2 launch 'File Navigator' modal from primary menu",
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
                value: "<p aria-live=\"polite\" role=\"status\">"
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

    // change address location of file navigator modal on VM2
    modalAddress({
        address: "",
        index: 0,
        lastItem: "version.json",
        machine: "VM2"
    }),

    //open shares on VM2
    {
        delay: {
            node: [
                ["getModalsByModalType", "shares", 0]
            ],
            qualifier: "greater",
            target: ["clientHeight"],
            type: "property",
            value: 200
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementsByClassName", "all-shares", 0],
                    ["getElementsByTagName", "button", 0]
                ]
            }
        ],
        machine: "VM2",
        name: "On VM2 open shares modal of all shares",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByClassName", "device", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 3
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "device", 1],
                    ["getElementsByClassName", "share", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 1
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "share", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 1
            }
        ]
    },

    // open file navigate context menu at VM2
    showContextMenu([
        ["getModalsByModalType", "fileNavigate", 0],
        ["getElementsByClassName", "body", 0],
        ["getElementsByTagName", "li", 3],
        ["getElementsByTagName", "p", 0]
    ],
    [], "VM2"),

    // share a directory from VM2
    {
        delay: {
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByClassName", "share", 0],
                ["getElementsByTagName", "button", 1]
            ],
            qualifier: "ends",
            target: ["firstChild", "textContent"],
            type: "property",
            value: "documentation"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementById", "contextMenu", null],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "button", 0]
                ]
            }
        ],
        machine: "VM2",
        name: "On VM2 share a directory",
        unit: []
    },

    // open VM2's share on self
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 2],
                ["getElementsByClassName", "fileList", 0],
                ["getElementsByTagName", "li", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "directory lastType"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "share", 0],
                    ["getElementsByTagName", "button", 1]
                ]
            }
        ],
        machine: "self",
        name: "On self open VM2's share",
        unit: []
    },

    // on self move to sandbox for VM1 modal
    moveToSandbox(0, "VM1", "file"),

    // on self move to sandbox for VM2 modal
    moveToSandbox(2, "VM2", "file"),

    // on self create a new directory on self's modal
    newDirectory("self", 1, "sandbox"),

    // on self create a new directory on VM1's modal
    newDirectory("self", 0, "sandbox"),

    // on self create a new directory on VM2's modal
    newDirectory("self", 2, "sandbox"),

    // on self move inside VM1's new folder
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
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
                event: "dblclick",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self move inside VM1's new directory",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileAddress", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                qualifier: "ends",
                target: ["value"],
                type: "property",
                value: "sandbox"
            }
        ]
    },

    // on self copy files to VM1
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
            value: "Copying 100.00% complete. 3 files written at size 1"
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
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 3],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "c"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 3],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "c"
            },
            {
                event: "keyup",
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
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "Control"
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "v"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "v"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "Control"
            }
        ],
        machine: "self",
        name: "On self copy files and then paste them into VM1",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "configuration.json"
            }
        ]
    },

    // on self move inside se1f's new folder
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
                event: "dblclick",
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self move inside self's sandbox directory",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileAddress", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                qualifier: "ends",
                target: ["value"],
                type: "property",
                value: "sandbox"
            }
        ]
    },

    // on self move inside VM2's new folder
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 2],
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
                event: "dblclick",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self move inside VM2's sandbox directory",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileAddress", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                qualifier: "ends",
                target: ["value"],
                type: "property",
                value: "sandbox"
            }
        ]
    },

    // on self move into VM1's parent directory
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "fileList", 0],
                ["getElementsByTagName", "li", 0]
            ],
            qualifier: "is",
            target: ["class"],
            type: "attribute",
            value: "directory lastType"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "parentDirectory", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self move inside VM1's parent directory",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileAddress", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                qualifier: "ends",
                target: ["value"],
                type: "property",
                value: "storageBrowser"
            }
        ]
    },

    // on self copy directory from VM1's modal to self modal
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
            value: "Copying 100.00% complete. 3 files written at size 1"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Control"
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "c"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "c"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Control"
            },
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
        name: "On self copy files and then paste them from VM1 to self",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "sandbox"
            }
        ]
    },

    // on self copy directory from VM1's modal to VM2's modal
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 2],
                ["getElementsByClassName", "status-bar", 0],
                ["getElementsByTagName", "p", 0]
            ],
            qualifier: "begins",
            target: ["innerHTML"],
            type: "property",
            value: "Copying 100.00% complete. 5 files written at size "
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Control"
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "c"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "c"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Control"
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "Control"
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "v"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "v"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "Control"
            }
        ],
        machine: "self",
        name: "On self copy files and then paste them from VM1 to VM2",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "sandbox"
            }
        ]
    },

    // on self delete the sandbox child folder in self's modal
    {
        delay: 
        {
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
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Delete"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Delete"
            }
        ],
        machine: "self",
        name: "On self destroy the sandbox child folder in self's modal",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "Destroyed 1 file system item"
            }
        ]
    },

    // on self cut a directory from VM2's modal to self modal
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 2],
                ["getElementsByClassName", "status-bar", 0],
                ["getElementsByTagName", "p", 0]
            ],
            qualifier: "begins",
            target: ["innerHTML"],
            type: "property",
            value: "Cutting 100.00% complete. "
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Control"
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "x"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "x"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Control"
            },
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
        name: "On self cut file and then paste it from VM2 to self",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "directory"
            },
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "file"
            }
        ]
    },
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 2],
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
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Delete"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Delete"
            }
        ],
        machine: "self",
        name: "On self remove one file from VM2",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "file"
            }
        ]
    },
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "status-bar", 0],
                ["getElementsByTagName", "p", 0]
            ],
            qualifier: "is",
            target: ["innerHTML"],
            type: "property",
            value: "Cutting 100.00% complete. 2 files destroyed."
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Control"
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "p", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "x"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "x"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "p", 0]
                ],
                value: "Control"
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ]
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "Control"
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "v"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "v"
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0]
                ],
                value: "Control"
            }
        ],
        machine: "self",
        name: "On self cut directory from VM1 to VM2",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "file"
            },
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 2],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Copying 100.00% complete. 2 files written at size "
            },
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "Cutting 100.00% complete. 2 files destroyed."
            }
        ]
    }
];

export default browserDevice;