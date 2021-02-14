
/* lib/terminal/test/samples/browser_user - A list of tests that execute in the web browser and require multiple computers. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import inviteAccept from "../application/browserUtilities/inviteAccept.js";
import inviteConfirm from "../application/browserUtilities/inviteConfirm.js";
import inviteModal from "../application/browserUtilities/inviteModal.js";
import inviteSend from "../application/browserUtilities/inviteSend.js";
import login from "../application/browserUtilities/login.js";
import mainMenu from "../application/browserUtilities/mainMenu.js";
import moveToSandbox from "../application/browserUtilities/moveToSandbox.js";
import newDirectory from "../application/browserUtilities/newDirectory.js";

const browserUser:testBrowserItem[] = [
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
        name: `On VM1 accept device invitation from self`,
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
        name: `On self verify addition of two devices`,
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
    inviteSend("self", "VM3", "user"),
    {
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-accept", 0]
                ]
            }
        ],
        machine: "VM3",
        name: "On VM3 read user invitation from self",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "invite-accept", 0],
                    ["getElementsByTagName", "h3", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "User <strong>User-self</strong> from"
            },
            {
                node: [
                    ["getModalsByModalType", "invite-accept", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "User-self said:"
            },
            {
                node: [
                    ["getModalsByModalType", "invite-accept", 0],
                    ["getElementsByTagName", "textarea", 0]
                ],
                qualifier: "is",
                target: ["value"],
                type: "property",
                value: "Hello to VM3 from Primary Device."
            }
        ]
    },
    inviteConfirm("self", "VM3", "user"),

    mainMenu("VM4"),

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
                event: "click",
                node: [
                    ["getElementById", "user", null],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "button", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self open shares for user VM3",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "<div><div class=\"agentList\"><h3>Shares for user User-VM3</h3><p class=\"no-shares\">User <em>User-VM3</em> has no shares.</p></div></div>"
            }
        ]
    },

    // on VM4 open a file navigator modal
    {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
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
                    ["getElementById", "fileNavigator", null]
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
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "fileList", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "label", 0]
            ],
            qualifier: "ends",
            target: ["innerHTML"],
            type: "property",
            value: "device.json"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileAddress", 0],
                    ["getElementsByTagName", "input", 0]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileAddress", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                value: filePathEncode("absolute", "lib/terminal/test/storageBrowser")
            },
            {
                event: "blur",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
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
                ["getModalsByModalType", "fileNavigate", 0],
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
                    ["getModalsByModalType", "fileNavigate", 0],
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
            value: "VM4"
        },
        interaction: [
            {
                event: "contextmenu",
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
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
        name: "On self verify VM4's share is immediately present",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "agentList", 0],
                    ["getElementsByClassName", "user-share", 0]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "VM4"
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "agentList", 0],
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
                    ["getElementsByClassName", "agentList", 0],
                    ["getElementsByClassName", "user-share", 0],
                    ["lastChild", null, null]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "(Read Only)"
            }
        ]
    }
];

export default browserUser;