/* lib/terminal/test/samples/browser_delete - A list of tests that execute in the web browser and tests agent deletion. */

import inviteAccept from "../application/browserUtilities/inviteAccept.js";
import inviteConfirm from "../application/browserUtilities/inviteConfirm.js";
import inviteModal from "../application/browserUtilities/inviteModal.js";
import inviteSend from "../application/browserUtilities/inviteSend.js";
import login from "../application/browserUtilities/login.js";
import mainMenu from "../application/browserUtilities/mainMenu.js";

const browserDelete:test_browserItem[] = [
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
    inviteSend("self", "VM3", "user"),
    inviteAccept("self", "VM3", "user"),
    inviteConfirm("self", "VM3", "user"),

    //open shares on self
    {
        delay: {
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "ul", null]
            ],
            qualifier: "is",
            target: ["length"],
            type: "property",
            value: 14
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
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "<span>There is 1 <strong>user</strong> shared.</span>"
            }
        ]
    },

    //open shares on VM1
    {
        delay: {
            node: [
                ["getModalsByModalType", "shares", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "ul", null]
            ],
            qualifier: "is",
            target: ["length"],
            type: "property",
            value: 14
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
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "<span>There is 1 <strong>user</strong> shared.</span>"
            }
        ]
    },

    // access delete menu on self
    {
        delay: {
            node: [
                ["getModalsByModalType", "agent-management", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByClassName", "agent-management", 0],
                ["getElementsByClassName", "delete-agents", 0]
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
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "list-radio", 2],
                    ["getElementsByTagName", "label", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self access delete menu of the open agent management modal",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "agent-management", 0],
                    ["getElementsByClassName", "delete-agents", 0],
                    ["getElementsByTagName", "h3", 0]
                ],
                qualifier: "is",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "Delete Agents"
            },
            {
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0]
                ],
                qualifier: "is",
                target: ["clientHeight"],
                type: "property",
                value: 0
            },
            {
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "agent-management", 0],
                    ["getElementsByClassName", "modify-agents", 0]
                ],
                qualifier: "is",
                target: ["clientHeight"],
                type: "property",
                value: 0
            }
        ]
    },

    // on self vm1 for deletion
    {
        delay: {
            node: [
                ["getModalsByModalType", "agent-management", 0],
                ["getElementsByClassName", "delete-agents", 0],
                ["getElementsByClassName", "checked", 0]
            ],
            qualifier: "is",
            target: ["nodeName", "toLowerCase()"],
            type: "property",
            value: "label"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "delete-agents", 0],
                    ["getElementsByTagName", "label", 0]
                ]
            }
        ],
        machine: "self",
        name: "On self select agent VM1 for deletion",
        unit: []
    },

    // on self delete VM1
    {
        delay: {
            node: [
                ["getElementById", "device", null],
                ["getElementsByTagName", "button", null]
            ],
            qualifier: "is",
            target: ["length"],
            type: "property",
            value: 3
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "footer", 0],
                    ["getElementsByClassName", "confirm", 0]
                ]
            },
            {
                event: "wait",
                node: null,
                value: "2000"
            }
        ],
        machine: "self",
        name: "On self delete agent VM1",
        unit: [
            {
                node: [
                    ["getElementById", "device", null],
                    ["getElementsByTagName", "button", 2]
                ],
                qualifier: "is",
                target: ["lastChild", "textContent"],
                type: "property",
                value: " VM2"
            },
            {
                node: [
                    ["getModalsByModalType", "agent-management", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 0
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "agentList", 0],
                    ["getElementsByClassName", "device", null]
                ],
                qualifier: "is",
                target: ["length"],
                type: "property",
                value: 2
            },
            {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "agentList", 0],
                    ["getElementsByClassName", "device", 1],
                    ["getElementsByTagName", "h4", 0]
                ],
                qualifier: "is",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "VM2"
            },
        ]
    },

    // on VM2 verify VM1 is deleted
    {
        delay: {
            node: [
                ["getElementById", "device", null],
                ["getElementsByTagName", "button", 2]
            ],
            qualifier: "is",
            target: ["lastChild", "textContent"],
            type: "property",
            value: " Primary Device"
        },
        interaction: null,
        machine: "VM2",
        name: "On VM2 verify that device VM1 is deleted",
        unit: null
    },

    // on VM1 verify reset
    {
        delay: {
            node: [
                ["getElementById", "login", null]
            ],
            qualifier: "greater",
            target: ["clientHeight"],
            type: "property",
            value: 10
        },
        interaction: null,
        machine: "VM1",
        name: "On VM1 verify that device reset",
        unit: null
    },

    mainMenu("VM2"),
    inviteModal("VM2"),

    // access delete menu on VM2
    {
        delay: {
            node: [
                ["getModalsByModalType", "agent-management", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByClassName", "agent-management", 0],
                ["getElementsByClassName", "delete-agents", 0]
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
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "list-radio", 2],
                    ["getElementsByTagName", "label", 0]
                ]
            }
        ],
        machine: "VM2",
        name: "On VM2 access delete menu of the open agent management modal",
        unit: [
            {
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "agent-management", 0],
                    ["getElementsByClassName", "delete-agents", 0],
                    ["getElementsByTagName", "h3", 0]
                ],
                qualifier: "is",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "Delete Agents"
            },
            {
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0]
                ],
                qualifier: "is",
                target: ["clientHeight"],
                type: "property",
                value: 0
            },
            {
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "agent-management", 0],
                    ["getElementsByClassName", "modify-agents", 0]
                ],
                qualifier: "is",
                target: ["clientHeight"],
                type: "property",
                value: 0
            }
        ]
    },

    // on VM2 mark user for deletion
    {
        delay: {
            node: [
                ["getModalsByModalType", "agent-management", 0],
                ["getElementsByClassName", "delete-agents", 0],
                ["getElementsByClassName", "checked", 0]
            ],
            qualifier: "is",
            target: ["nodeName", "toLowerCase()"],
            type: "property",
            value: "label"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "delete-agents", 0],
                    ["getElementsByTagName", "label", 1]
                ]
            }
        ],
        machine: "VM2",
        name: "On VM2 select user for deletion",
        unit: []
    },

    // on VM2 delete user
    {
        delay: {
            node: [
                ["getElementById", "user", null],
                ["getElementsByTagName", "button", null]
            ],
            qualifier: "is",
            target: ["length"],
            type: "property",
            value: 1
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "footer", 0],
                    ["getElementsByClassName", "confirm", 0]
                ]
            }
        ],
        machine: "VM2",
        name: "On VM2 delete user",
        unit: null
    },

    // on self verify user is deleted
    {
        delay: {
            node: [
                ["getElementById", "user", null],
                ["getElementsByTagName", "button", null]
            ],
            qualifier: "is",
            target: ["length"],
            type: "property",
            value: 1
        },
        interaction: null,
        machine: "self",
        name: "On self verify user is deleted",
        unit: null
    }
];

export default browserDelete;