
/* lib/terminal/test/samples/browser_agents - A list of tests that execute in the web browser and require multiple computers. */

import machines from "../application/browser_machines.js";
import mainMenu from "../application/browser_mainMenu.js";
import projectDirectory from "../application/browser_projectDirectory.js";
import showContextMenu from "../application/browser_showContextMenu.js";

const idle = function terminal_test_application_samples_browserAgents_idle(machine:string, delay:number):testBrowserItem {
        return {
            interaction: [
                {
                    event: "wait",
                    node: [],
                    value: delay.toString()
                }
            ],
            machine: machine,
            name: `Test for idle state on ${machine}`,
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
        };
    },
    invite1 = function terminal_test_application_samples_browserAgents_invite1(from:string):testBrowserItem {
        // open invite modal on
        return {
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
            machine: from,
            name: `Spawn invitation modal on ${from}`,
            unit: []
        };
    },
    invite2 = function terminal_test_application_samples_browserAgents_invite2(from:string, to:string, type:agentType):testBrowserItem {
        // create invitation
        return {
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
                        ["getElementsByTagName", "input", (type === "device") ? 0 : 1]
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
                    value: machines[to].ip
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
                    value: machines[to].port.toString()
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
                    value: `Hello to ${to} from ${(from === "self") ? "Primary Device" : from}.`
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", 0],
                        ["getElementsByClassName", "confirm", 0]
                    ]
                }
            ],
            machine: from,
            name: `Send ${type} invitation from ${from} to ${to}`,
            unit: []
        };
    },
    invite3 = function terminal_test_application_samples_browserAgents_invite3(from:string, to:string, type:agentType):testBrowserItem {
        // read invitation
        const fromName:string = (from === "self")
            ? "Primary Device"
            : from;
        return {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-accept", 0]
                    ]
                }
            ],
            machine: to,
            name: `On ${to} read ${type} invitation from ${from}`,
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "invite-accept", 0],
                        ["getElementsByTagName", "h3", 0]
                    ],
                    qualifier: "begins",
                    target: ["innerHTML"],
                    type: "property",
                    value: `Device <strong>${fromName}</strong> from`
                },
                {
                    node: [
                        ["getModalsByModalType", "invite-accept", 0],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "begins",
                    target: ["innerHTML"],
                    type: "property",
                    value: `${fromName} said:`
                },
                {
                    node: [
                        ["getModalsByModalType", "invite-accept", 0],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    qualifier: "is",
                    target: ["value"],
                    type: "property",
                    value: `Hello to ${to} from ${fromName}.`
                }
            ]
        };
    },
    invite4 = function terminal_test_application_samples_browserAgents_invite4(from:string, to:string, type:agentType):testBrowserItem {
        // accept invitation
        return {
            delay: {
                node: [
                    ["getElementById", type, null],
                    ["getElementsByTagName", "li", (type === "device") ? 2 : 1],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "is",
                target: ["lastChild", "textContent"],
                type: "property",
                value: ` ${(from === "self") ? "Device-self" : from}`
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
            machine: to,
            name: `On ${to} accept ${type} invitation from ${from}`,
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
        };
    },
    login = function terminal_test_application_samples_browserAgents_login(machine:string):testBrowserItem {
        return {
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
                    value: `Device-${machine}`
                },
                {
                    event: "click",
                    node: [["getElementById", "login-device", null]]
                },
                {
                    event: "setValue",
                    node: [["getElementById", "login-device", null]],
                    value: (machine === "self")
                        ? "Primary Device"
                        : machine
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
            machine: machine,
            name: `Login form on ${machine}`,
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
        };
    },
    loginRefresh = function terminal_test_application_samples_browserAgents_loginRefresh(machine:string):testBrowserItem {
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
    browserAgents:testBrowserItem[] = [
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
        loginRefresh("self"),

        // complete the login on VM1
        login("VM1"),
        loginRefresh("VM1"),

        // complete the login on VM2
        login("VM2"),
        loginRefresh("VM2"),

        // complete the login on VM3
        login("VM3"),
        loginRefresh("VM3"),

        // complete the login on VM4
        login("VM4"),
        loginRefresh("VM4"),

        // invite device VM2 from VM1
        mainMenu("VM1"),
        invite1("VM1"),
        invite2("VM1", "VM2", "device"),
        invite3("VM1", "VM2", "device"),
        invite4("VM1", "VM2", "device"),

        // invite device VM4 from VM3
        mainMenu("VM3"),
        invite1("VM3"),
        invite2("VM3", "VM4", "device"),
        invite3("VM3", "VM4", "device"),
        invite4("VM3", "VM4", "device"),

        // invite device VM1 from self
        mainMenu("self"),
        invite1("self"),
        invite2("self", "VM1", "device"),
        invite3("self", "VM1", "device"),
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
        invite1("self"),
        invite2("self", "VM3", "user"),
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
                    value: "User <strong>Device-self</strong> from"
                },
                {
                    node: [
                        ["getModalsByModalType", "invite-accept", 0],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "begins",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Device-self said:"
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
        invite4("self", "VM3", "user"),

        // test for idle state on VM1
        idle("VM1", 28000),

        // test for idle state on VM2
        idle("VM2", 0),

        // test for idle state on VM3
        idle("VM3", 0),

        // test for idle state on VM4
        idle("VM4", 0),

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
            name: "Open shares modal on self of all shares",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "ul", 0],
                        ["getElementsByTagName", "li", null]
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
                        ["getElementsByTagName", "ul", 1],
                        ["getElementsByTagName", "li", null]
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
                    value: 0
                }
            ]
        },

        //open shares on user VM3
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
            machine: "VM3",
            name: "Open shares modal on VM3 of all shares",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "ul", 0],
                        ["getElementsByTagName", "li", null]
                    ],
                    qualifier: "is",
                    target: ["length"],
                    type: "property",
                    value: 2
                },
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByTagName", "ul", 1],
                        ["getElementsByTagName", "li", null]
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
                    value: 0
                }
            ]
        },

        mainMenu("VM3"),

        // open file navigator modal on VM3
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
            machine: "VM3",
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

        // change address location of file navigator modal on VM3
        projectDirectory(0, "VM3"),
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "li", 3],
            ["getElementsByTagName", "label", 0]
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
        ], "VM3"),

        // share a directory from VM3
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
            machine: "VM3",
            name: "Share a directory from VM3",
            unit: []
        },

        // share a directory from VM3
        {
            interaction: [
                {
                    event: "wait",
                    node: []
                }
            ],
            machine: "self",
            name: "Verify shared directory from VM3 on self",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "user", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 0]
                    ],
                    qualifier: "ends",
                    target: ["firstChild", "textContent"],
                    type: "property",
                    value: "documentation"
                }
            ]
        },

        // access VM3's share directory on self
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0]
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
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "user", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "Open VM3's share on self",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "ends",
                    target: ["firstChild", "textContent"],
                    type: "property",
                    value: "api.md"
                }
            ]
        }
    ];

export default browserAgents;