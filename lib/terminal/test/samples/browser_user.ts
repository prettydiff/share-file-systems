
/* lib/terminal/test/samples/browser_user - A list of tests that execute in the web browser and require multiple computers. */

import inviteAccept from "../application/browserUtilities/inviteAccept.js";
import inviteConfirm from "../application/browserUtilities/inviteConfirm.js";
import inviteModal from "../application/browserUtilities/inviteModal.js";
import inviteSend from "../application/browserUtilities/inviteSend.js";
import login from "../application/browserUtilities/login.js";
import mainMenu from "../application/browserUtilities/mainMenu.js";

const loginRefresh = function terminal_test_application_samples_browserAgents_loginRefresh(machine:string):testBrowserItem {
        return {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: machine,
            name: `Refresh ${machine} following login form completion`,
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
        };
    },
    browserUser:testBrowserItem[] = [
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
        inviteConfirm("self", "VM3", "user")
    ];

export default browserUser;