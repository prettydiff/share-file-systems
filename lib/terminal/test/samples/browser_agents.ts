
/* lib/terminal/test/samples/browser_agents - A list of tests that execute in the web browser and require multiple computers. */

import machines from "../application/browser_machines.js";
import mainMenu from "../application/browser_mainMenu.js";

const browserAgents:testBrowserItem[] = [
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

        // complete the login on VM1
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
                    value: "Device-VM1"
                },
                {
                    event: "click",
                    node: [["getElementById", "login-device", null]]
                },
                {
                    event: "setValue",
                    node: [["getElementById", "login-device", null]],
                    value: "VM1"
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
            machine: "VM1",
            name: "Login form on VM1",
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

        // refresh VM1 and test that a user populates and there is no login
        {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: "VM1",
            name: "Refresh following login form completion on VM1",
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

        // complete the login on VM2
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
                    value: "Device-VM2"
                },
                {
                    event: "click",
                    node: [["getElementById", "login-device", null]]
                },
                {
                    event: "setValue",
                    node: [["getElementById", "login-device", null]],
                    value: "VM2"
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
            machine: "VM2",
            name: "Login form on VM2",
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

        // refresh VM2 and test that a user populates and there is no login
        {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: "VM2",
            name: "Refresh following login form completion on VM2",
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

        // complete the login on VM3
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
                    value: "User-VM3"
                },
                {
                    event: "click",
                    node: [["getElementById", "login-device", null]]
                },
                {
                    event: "setValue",
                    node: [["getElementById", "login-device", null]],
                    value: "VM3"
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
            machine: "VM3",
            name: "Login form on VM3",
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

        // refresh VM3 and test that a user populates and there is no login
        {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: "VM3",
            name: "Refresh following login form completion on VM3",
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

        // complete the login on VM4
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
                    value: "User-VM4"
                },
                {
                    event: "click",
                    node: [["getElementById", "login-device", null]]
                },
                {
                    event: "setValue",
                    node: [["getElementById", "login-device", null]],
                    value: "VM4"
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
            machine: "VM4",
            name: "Login form on VM4",
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

        // refresh VM4 and test that a user populates and there is no login
        {
            interaction: [
                {
                    event: "refresh",
                    node: null
                }
            ],
            machine: "VM4",
            name: "Refresh following login form completion on VM4",
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

        mainMenu("VM1"),

        // open invite modal on VM1
        {
            delay: {
                // the file navigator modal is created
                node: [
                    ["getModalsByModalType", "invite-request", 0],
                    ["getElementsByTagName", "h3", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "Connection Type"
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getElementById", "agent-invite", null]
                    ]
                }
            ],
            machine: "VM1",
            name: "Spawn invitation modal on VM1",
            unit: []
        },

        // create device invitation on VM1 to VM2
        {
            delay: {
                node: [
                    ["getModalsByModalType", "invite-request", 0],
                    ["getElementsByClassName", "delay", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "is",
                target: ["innerHTML"],
                type: "property",
                value: "Waiting on data. Please stand by."
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByTagName", "input", 2]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByTagName", "input", 2]
                    ],
                    value: machines.VM2.ip
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByTagName", "input", 3]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByTagName", "input", 3]
                    ],
                    value: machines.VM2.port.toString()
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    value: "Hello to VM2 from VM1."
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByClassName", "confirm", 0]
                    ]
                }
            ],
            machine: "VM1",
            name: "Send device invitation from VM1 to VM2",
            unit: []
        },

        // on VM2 read device invitation from VM1
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-accept", 0]
                    ]
                }
            ],
            machine: "VM2",
            name: "On VM2 read device invitation from VM1",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "invite-accept", 0],
                        ["getElementsByTagName", "h3", 0]
                    ],
                    qualifier: "begins",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Device <strong>VM1</strong> from"
                },
                {
                    node: [
                        ["getModalsByModalType", "invite-accept", 0],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "begins",
                    target: ["innerHTML"],
                    type: "property",
                    value: "VM1 said:"
                },
                {
                    node: [
                        ["getModalsByModalType", "invite-accept", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: "Hello to VM2 from VM1."
                }
            ]
        },

        // on VM2 accept device invitation from VM1
        {
            delay: {
                node: [
                    ["getElementById", "device", null],
                    ["getElementsByTagName", "li", 2],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "is",
                target: ["lastChild", "textContent"],
                type: "property",
                value: " VM1"
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
            machine: "VM2",
            name: "On VM2 accept device invitation from VM1",
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

        // test for idle state on VM1
        {
            interaction: [
                {
                    event: "wait",
                    node: [],
                    value: "15000"
                }
            ],
            machine: "VM1",
            name: "Test for idle state on VM1",
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
                },
                {
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "li", 2],
                        ["getElementsByTagName", "button", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "idle"
                }
            ]
        },

        // test for idle state on VM2
        {
            interaction: [
                {
                    event: "wait",
                    node: [],
                    value: "0"
                }
            ],
            machine: "VM2",
            name: "Test for idle state on VM2",
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
                },
                {
                    node: [
                        ["getElementById", "device", null],
                        ["getElementsByTagName", "li", 2],
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

export default browserAgents;