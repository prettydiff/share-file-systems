
/* lib/terminal/test/samples/browser_user - A list of tests that execute in the web browser and require multiple computers. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import inviteAccept from "../application/browserUtilities/inviteAccept.js";
import inviteConfirm from "../application/browserUtilities/inviteConfirm.js";
import inviteModal from "../application/browserUtilities/inviteModal.js";
import inviteSend from "../application/browserUtilities/inviteSend.js";
import login from "../application/browserUtilities/login.js";
import mainMenu from "../application/browserUtilities/mainMenu.js";
import modalAddress from "../application/browserUtilities/modalAddress.js";
import moveToSandbox from "../application/browserUtilities/moveToSandbox.js";
import newDirectory from "../application/browserUtilities/newDirectory.js";

const docFiles:string = "Writing 100.00% complete. 21 files written at size ",
    browserUser:test_browserItem[] = [
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
        //loginRefresh("self"),

        // complete the login on VM1
        login("VM1"),
        //loginRefresh("VM1"),

        // complete the login on VM2
        login("VM2"),
        //loginRefresh("VM2"),

        // complete the login on VM3
        login("VM3"),
        //loginRefresh("VM3"),

        // complete the login on VM4
        login("VM4"),
        //loginRefresh("VM4"),

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
        inviteConfirm("self", "VM1", "device"),
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
                value: " VM2"
            },
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
            unit: []
        },

        // invite user VM3 from self
        mainMenu("self"),
        inviteModal("self"),
        inviteSend("self", "VM3", "user"),
        {
            delay: {
                node: [
                    ["getModalsByModalType", "invite-ask", 0],
                    ["getElementsByTagName", "h3", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "User <strong>User-self</strong> from"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-ask", 0]
                    ]
                },
                {
                    event: "wait",
                    node: null,
                    value: "500"
                }
            ],
            machine: "VM3",
            name: "On VM3 read user invitation from self",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "invite-ask", 0],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "begins",
                    target: ["innerHTML"],
                    type: "property",
                    value: "User-self said:"
                },
                {
                    node: [
                        ["getModalsByModalType", "invite-ask", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: "Hello to VM3 from self."
                }
            ]
        },
        inviteConfirm("self", "VM3", "user"),

        // on self open VM3 shares
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0]
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 10
            },
            interaction: [
                {
                    event: "wait",
                    node: null,
                    value: "250"
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "user", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self open shares for user User-VM3",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0]
                    ],
                    qualifier: "begins",
                    target: ["innerHTML"],
                    type: "property",
                    value: "<div><div class=\"agentList\"></div><div class=\"agentList\"><div data-hash=\""
                }
            ]
        },

        mainMenu("VM4"),

        // on VM4 open a file navigator modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", null]
                ],
                qualifier: "greater",
                target: ["length"],
                type: "property",
                value: 5
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "menu", null],
                        ["getElementsByClassName", "file-navigate", 0]
                    ]
                }
            ],
            machine: "VM4",
            name: "On VM4 open a file navigate modal",
            unit: []
        },

        // on VM4 move to the sandbox location
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: "temp/device"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: filePathEncode("absolute", "lib/terminal/test/storageTest/temp")
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "blur",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                }
            ],
            machine: "VM4",
            name: "On VM4 move to the sandbox location",
            unit: []
        },

        // on VM4 create a new directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "VM4"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
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
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "VM4"
                },
                {
                    event: "blur",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                }
            ],
            machine: "VM4",
            name: "On VM4 create a new directory",
            unit: []
        },

        // on VM4 open shares
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0],
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 10
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "VM4",
            name: "On VM4 open shares modal of only VM4's shares",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Device <em>VM4</em> has no shares."
                }
            ]
        },

        // on VM4 share new directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "agentList", 0],
                    ["getElementsByClassName", "share", 0],
                    ["getElementsByClassName", "device-share", 0]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "temp"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "header", 0],
                        ["getElementsByClassName", "parentDirectory", 0]
                    ]
                },
                {
                    event: "wait",
                    node: null,
                    value: "100"
                },
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileList", 0],
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
                }
            ],
            machine: "VM4",
            name: "On VM4 share new directory",
            unit: []
        },

        // verify VM4's share is already visible on self
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "agentList", 1],
                    ["getElementsByClassName", "user-share", 0]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "temp"
            },
            interaction: [
                {
                    event: "wait",
                    node: [
                        ["getElementById", "contentArea", null]
                    ],
                    value: "150"
                }
            ],
            machine: "self",
            name: "On self verify VM4's share is immediately present",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 1],
                        ["getElementsByClassName", "user-share", 0],
                        ["lastChild", null, null]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "read-only-status"
                },
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 1],
                        ["getElementsByClassName", "user-share", 0],
                        ["lastChild", null, null]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "(Read Only)"
                }
            ]
        },

        // on VM3 open a file navigator modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", null]
                ],
                qualifier: "greater",
                target: ["length"],
                type: "property",
                value: 5
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "menu", null],
                        ["getElementsByClassName", "file-navigate", 0]
                    ]
                }
            ],
            machine: "VM3",
            name: "On VM3 open a file navigate modal",
            unit: []
        },

        // on VM3 move to the sandbox location
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "contains",
                target: ["innerHTML"],
                type: "property",
                value: "temp/device"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: filePathEncode("absolute", "lib/terminal/test/storageTest/temp")
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                }
            ],
            machine: "VM3",
            name: "On VM3 move to the sandbox location",
            unit: []
        },

        // on VM3 refresh the file navigate modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "device.json"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "header", 0],
                        ["getElementsByClassName", "reloadDirectory", 0]
                    ]
                }
            ],
            machine: "VM3",
            name: "On VM3 refresh the contents of File Navigator",
            unit: []
        },

        // on VM3 create a new directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "VM3"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
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
                },
                {
                    event: "click",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ],
                    value: "VM3"
                },
                {
                    event: "blur",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                }
            ],
            machine: "VM3",
            name: "On VM3 create a new directory",
            unit: []
        },

        // on VM3 open shares
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0],
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 10
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "VM3",
            name: "On VM3 open shares modal of only VM3's shares",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Device <em>VM3</em> has no shares."
                }
            ]
        },

        // on VM3 share new directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "agentList", 0],
                    ["getElementsByClassName", "share", 0],
                    ["getElementsByClassName", "device-share", 0]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "application"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "header", 0],
                        ["getElementsByClassName", "parentDirectory", 0]
                    ]
                },
                {
                    event: "wait",
                    node: null,
                    value: "200"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "header", 0],
                        ["getElementsByClassName", "parentDirectory", 0]
                    ]
                },
                {
                    event: "wait",
                    node: null,
                    value: "200"
                },
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileList", 0],
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
                }
            ],
            machine: "VM3",
            name: "On VM3 share new directory",
            unit: []
        },

        // verify VM3's share is already visible on self
        {
            interaction: [
                {
                    event: "wait",
                    node: [
                        ["getElementById", "contentArea", null]
                    ],
                    value: "0"
                }
            ],
            machine: "self",
            name: "On self verify VM3's share is immediately present",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 1],
                        ["getElementsByClassName", "user-share", 1]
                    ],
                    qualifier: "ends",
                    target: ["firstChild", "textContent"],
                    type: "property",
                    value: "application"
                },
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 1],
                        ["getElementsByClassName", "user-share", 1],
                        ["lastChild", null, null]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "read-only-status"
                },
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 1],
                        ["getElementsByClassName", "user-share", 1],
                        ["lastChild", null, null]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "(Read Only)"
                }
            ]
        },

        // on self open share to VM3
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0]
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 10
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 1],
                        ["getElementsByTagName", "ul", 1],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByClassName", "user-share", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self open VM3's share",
            unit: []
        },

        // on self navigate to unshared parent directory of VM3
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "Security violation from file system action <em>directory</em>."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "parentDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self navigate to unshared parent directory of VM3",
            unit: []
        },

        // on self navigate back on VM3's modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
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
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "backDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self navigate back on VM3's modal",
            unit: []
        },

        // on VM1 open a file navigate modal
        mainMenu("VM1"),
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", null]
                ],
                qualifier: "greater",
                target: ["length"],
                type: "property",
                value: 5
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "menu", null],
                        ["getElementsByClassName", "file-navigate", 0]
                    ]
                }
            ],
            machine: "VM1",
            name: "On VM1 open a file navigate modal",
            unit: []
        },

        // on VM1 navigate to project directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 3],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "documentation"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: filePathEncode("absolute", "")
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                }
            ],
            machine: "VM1",
            name: "On VM1 navigate modal to project location",
            unit: []
        },

        // on VM1 open local shares
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0]
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 10
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "VM1",
            name: "On VM1 open local shares",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "device", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Device <em>VM1</em> has no shares."
                }
            ]
        },

        // on VM1 create a share
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "agentList", 0],
                    ["getElementsByClassName", "share", 0],
                    ["getElementsByClassName", "device-share", 0]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "documentation"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 3],
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
                }
            ],
            machine: "VM1",
            name: "On VM1 share the project documentation directory",
            unit: []
        },

        // on self open file navigate modal to VM1
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
                    ["getElementsByClassName", "heading", 0],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "is",
                target: ["lastChild", "textContent"],
                type: "property",
                value: " File Navigate - Device, VM2"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "ul", 0],
                        ["lastChild", null, null],
                        ["getElementsByTagName", "button", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 1],
                        ["getElementsByClassName", "agentList", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self open file navigate modal for VM2",
            unit: []
        },

        moveToSandbox(0, "self", "directory lastType"),

        // on self open second self fila navigation modal
        mainMenu("self"),
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 2],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", null]
                ],
                qualifier: "greater",
                target: ["length"],
                type: "property",
                value: 1
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "menu", null],
                        ["getElementsByClassName", "file-navigate", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self open a second local file navigator modal",
            unit: []
        },

        modalAddress({
            address: "",
            index: 2,
            lastItem: "version.json",
            machine: "self"
        }),

        // on self navigate to unshared parent directory of VM3
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "Security violation from file system action <em>directory</em>."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "parentDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self navigate to unshared parent directory of VM3",
            unit: []
        },

        // on self navigate back on VM3's modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
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
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "backDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self navigate back on VM3's modal",
            unit: []
        },

        // copy from self to read only share of VM3
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 0],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Security violation from attempted copy/cut."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
            ],
            machine: "self",
            name: "On self copy a directory to read only share of VM3",
            unit: []
        },

        // close the read only file navigate modal
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 0],
                        ["getElementsByClassName", "buttons", 0],
                        ["getElementsByClassName", "close", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self close read only file navigate modal to VM3.",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "file-navigate", null]
                    ],
                    qualifier: "is",
                    target: ["length"],
                    type: "property",
                    value: 2
                }
            ]
        },

        // on VM3 open all device shares
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 1]
                ],
                qualifier: "greater",
                target: ["clientHeight"],
                type: "property",
                value: 10
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "VM3",
            name: "On VM3 open all device shares.",
            unit: []
        },

        // on VM3 change VM3 share to full access
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "device", 0],
                        ["getElementsByClassName", "share", 0],
                        ["getElementsByClassName", "grant-full-access", 0]
                    ]
                }
            ],
            machine: "VM3",
            name: "On VM3 change VM3 share to full access.",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "device", 0],
                        ["getElementsByClassName", "share", 0],
                        ["getElementsByClassName", "make-read-only", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Make Read Only"
                }
            ]
        },

        // On self verify share VM3 is full access
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self verify share VM3 from user User-VM3 is full access",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "ul", 1],
                        ["getElementsByClassName", "full-access", 0],
                        ["getElementsByTagName", "strong", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "(Full Access)"
                }
            ]
        },

        // On self open user share VM3
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 2],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "1 directory, 7 files, 0 symbolic links, 0 errors"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "full-access", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self open user share VM3",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "directory lastType"
                },
                {
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "heading", 0],
                        ["getElementsByTagName", "button", 0]
                    ],
                    qualifier: "is",
                    target: ["lastChild", "textContent"],
                    type: "property",
                    value: " File Navigate - User, User-VM3"
                }
            ]
        },

        // copy from self to full access share of VM3
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 2],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: docFiles
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "wait",
                    node: null,
                    value: "500"
                }
            ],
            machine: "self",
            name: "On self copy a directory to full access share of VM3",
            unit: []
        },

        // move self modal into documentation directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "p", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "code_style.md"
            },
            interaction: [
                {
                    event: "dblclick",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null],
                        ["parentNode", null, null]
                    ]
                }
            ],
            machine: "self",
            name: "On self navigate the self file navigate modal to project documentation directory",
            unit: []
        },

        moveToSandbox(1, "self", "directory lastType"),

        newDirectory("self", 1, "selfShare"),

        // refresh self file navigate modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
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
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "reloadDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self reload the file navigate modal of self",
            unit: []
        },

        // open self share modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 2],
                    ["getElementsByTagName", "h2", 0],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "<span>🖳</span> Device Primary Device Shares"
            },
            interaction: [
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
            name: "On self open share list of self device",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 2],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Device <em>Primary Device</em> has no shares."
                }
            ]
        },

        // share new directory on self
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 2],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 1],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "button", 2]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "grant-full-access"
            },
            interaction: [
                {
                    event: "contextmenu",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
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
                }
            ],
            machine: "self",
            name: "On self share new directory named 'selfShare'.",
            unit: []
        },

        // move self modal into shared directory
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
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
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self navigate the self file navigate modal to the shared directory.",
            unit: []
        },

        

        // copy from VM3 share to read only share of self
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Writing 100.00% complete. 14 files written at size "
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 2],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
            ],
            machine: "self",
            name: "On self copy a directory from VM3 share to read only share of self",
            unit: []
        },

        // on self open shares to VM4
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 3],
                    ["getElementsByClassName", "fileAddress", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                qualifier: "ends",
                target: ["value"],
                type: "property",
                value: "temp"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "agentList", 1],
                        ["getElementsByClassName", "user-share", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self open share to read only share of VM4",
            unit: []
        },

        // return self modal to project root
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: ".git"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: filePathEncode("absolute", "")
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "Enter"
                }
            ],
            machine: "self",
            name: "On self move self file navigate modal to project root",
            unit: []
        },

        // copy from self to read only share of VM4
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 3],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "Security violation from attempted copy/cut."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
            ],
            machine: "self",
            name: "On self copy a directory to read only share of VM4",
            unit: []
        },

        // close the read only file navigate modal
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "buttons", 0],
                        ["getElementsByClassName", "close", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self close read only file navigate modal to VM4.",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "file-navigate", null]
                    ],
                    qualifier: "is",
                    target: ["length"],
                    type: "property",
                    value: 3
                }
            ]
        },

        // on VM3 change VM4 share to full access
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "device", 1],
                        ["getElementsByClassName", "share", 0],
                        ["getElementsByClassName", "grant-full-access", 0]
                    ]
                }
            ],
            machine: "VM3",
            name: "On VM3 change VM4 share to full access.",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 1],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "device", 1],
                        ["getElementsByClassName", "share", 0],
                        ["getElementsByClassName", "make-read-only", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Make Read Only"
                }
            ]
        },

        // On self verify share VM4 is full access
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self verify share VM4 from user User-VM3 is full access",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "ul", 1],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "strong", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "(Full Access)"
                }
            ]
        },

        // On self open user share VM4
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 3],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "1 directory, 5 files, 0 symbolic links, 0 errors"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "user-share", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self open user share VM4",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "directory lastType"
                },
                {
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "heading", 0],
                        ["getElementsByTagName", "button", 0]
                    ],
                    qualifier: "is",
                    target: ["lastChild", "textContent"],
                    type: "property",
                    value: " File Navigate - User, User-VM3"
                }
            ]
        },

        // copy from self to full access share of VM4
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 3],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: docFiles
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByText", filePathEncode("absolute", "documentation"), 0],
                        ["parentNode", null, null]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
            ],
            machine: "self",
            name: "On self copy a directory to full access share of VM4",
            unit: []
        },

        // on self return self file navigate modal to previous location
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: "browserUtilities"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "backDirectory", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self move self file navigate modal to prior directory location",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", null]
                    ],
                    qualifier: "is",
                    target: ["length"],
                    type: "property",
                    value: 1
                }
            ]
        },

        // on self of self file navigate modal delete documentation directory from sandbox location
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
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
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "del"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "del"
                }
            ],
            machine: "self",
            name: "On self delete documentation direct from sandbox location of self file navigate modal",
            unit: []
        },

        // copy from VM4 share to read only share of self
        {
            delay: {
                node: [
                    ["getModalsByModalType", "file-navigate", 1],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: docFiles
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 3],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "v"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "file-navigate", 1],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
            ],
            machine: "self",
            name: "On self copy a directory from VM4 share to read only share of self",
            unit: []
        }
    ];

export default browserUser;