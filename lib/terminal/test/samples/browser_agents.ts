
/* lib/terminal/test/samples/browser_agents - A list of tests that execute in the web browser and require multiple computers. */

import filePathEncode from "../application/file_path_encode.js";
import machines from "../application/browser_machines.js";
import mainMenu from "../application/browser_mainMenu.js";
import modalAddress from "../application/browser_modalAddress.js";
import showContextMenu from "../application/browser_showContextMenu.js";

const idle = function terminal_test_samples_browserAgents_idle(machine:string, delay:number):testBrowserItem {
        return {
            interaction: [
                {
                    event: "wait",
                    node: [],
                    value: delay.toString()
                }
            ],
            machine: machine,
            name: `On ${machine} test for idle state`,
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
    moveToSandbox = function terminal_test_samples_browserAgents_moveToSandbox(index:number, machine:string, test:string):testBrowserItem {
        const otherTest:string = (test === "empty-list")
            ? "Empty list"
            : "user.json"
        return {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", index],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: test
            },
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ],
                    value: "replace\u0000documentation\u0000lib/terminal/test/storageBrowser"
                },
                {
                    event: "blur",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileAddress", 0],
                        ["getElementsByTagName", "input", 0]
                    ]
                }
            ],
            machine: "self",
            name: `On self move to sandbox of ${machine} file navigate modal`,
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileList", 0],
                        ["lastChild", null, null],
                        ["getElementsByTagName", "label", 0]
                    ],
                    qualifier: "ends",
                    target: ["firstChild", "textContent"],
                    type: "property",
                    value: otherTest
                }
            ]
        };
    },
    newDirectory = function terminal_test_samples_browserAgents_newDirectory(machine:string, index:number, name:string):testBrowserItem {
        return {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", index],
                    ["getElementsByClassName", "fileList", 0],
                    ["firstChild", null, null]
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
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Alt"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "d"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "d"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Alt"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", index],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
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
                    value: name
                },
                {
                    event: "blur",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                }
            ],
            machine: machine,
            name: `On ${machine} create a new directory on file navigate modal index ${index}`,
            unit: []
        };
    },
    invite1 = function terminal_test_samples_browserAgents_invite1(from:string):testBrowserItem {
        // open invite modal
        return {
            delay: {
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
            name: `On ${from} spawn invitation modal`,
            unit: []
        };
    },
    invite2 = function terminal_test_samples_browserAgents_invite2(from:string, to:string, type:agentType):testBrowserItem {
        // create invitation
        const index:number = (from === "self" && to === "VM3")
            ? 1
            : 0;
        return {
            delay: {
                node: [
                    ["getModalsByModalType", "invite-request", index],
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
                        ["getModalsByModalType", "invite-request", index],
                        ["getElementsByTagName", "input", (type === "device") ? 0 : 1]
                    ]
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", index],
                        ["getElementsByTagName", "input", 2]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "invite-request", index],
                        ["getElementsByTagName", "input", 2]
                    ],
                    value: machines[to].ip
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", index],
                        ["getElementsByTagName", "input", 3]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "invite-request", index],
                        ["getElementsByTagName", "input", 3]
                    ],
                    value: machines[to].port.toString()
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", index],
                        ["getElementsByTagName", "textarea", 0]
                    ]
                },
                {
                    event: "setValue",
                    node: [
                        ["getModalsByModalType", "invite-request", index],
                        ["getElementsByTagName", "textarea", 0]
                    ],
                    value: `Hello to ${to} from ${(from === "self") ? "Primary Device" : from}.`
                },
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "invite-request", index],
                        ["getElementsByClassName", "confirm", 0]
                    ]
                }
            ],
            machine: from,
            name: `On ${from} send ${type} invitation to ${to}`,
            unit: []
        };
    },
    invite3 = function terminal_test_samples_browserAgents_invite3(from:string, to:string, type:agentType):testBrowserItem {
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
    invite4 = function terminal_test_samples_browserAgents_invite4(from:string, to:string, type:agentType):testBrowserItem {
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
                value: ` ${(from === "self") ? "User-self" : from}`
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
    login = function terminal_test_samples_browserAgents_login(machine:string):testBrowserItem {
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
                    value: `User-${machine}`
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
            name: `On ${machine} complete login form`,
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
        invite4("self", "VM3", "user"),

        // test for idle state on VM1
        //idle("VM1", 16000),

        // test for idle state on VM2
        //idle("VM2", 0),

        // test for idle state on VM3
        //idle("VM3", 0),

        // test for idle state on VM4
        //idle("VM4", 0),

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
                    ["getElementsByTagName", "li", 0],
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
            ["getElementsByTagName", "li", 0],
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
            name: "On VM3 open shares modal of all shares",
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
                        ["getElementsByClassName", "user", null]
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
            name: "On VM3 launch 'File Navigator' modal from primary menu",
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
        modalAddress({
            address: "",
            index: 0,
            lastItem: "version.json",
            machine: "VM3"
        }),
        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "body", 0],
            ["getElementsByTagName", "li", 3],
            ["getElementsByTagName", "p", 0]
        ], [], "VM3"),

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
            name: "On VM3 share a directory",
            unit: []
        },

        // verify VM3 share from self
        {
            interaction: [
                {
                    event: "wait",
                    node: []
                }
            ],
            machine: "self",
            name: "On self verify shared directory from VM3",
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
                },
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "user", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 0],
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
                        ["getElementsByClassName", "user", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 0],
                        ["getElementsByTagName", "strong", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "read-only-status"
                }
            ]
        },

        // access VM3's share directory on self
        {
            delay: {
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
            name: "On self open VM3's share",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "user", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 0],
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
                        ["getElementsByClassName", "user", 0],
                        ["getElementsByTagName", "li", 0],
                        ["getElementsByTagName", "button", 0],
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
            ["getElementsByTagName", "li", 0],
            ["getElementsByTagName", "p", 0]
        ],
        [], "self"),

        // on self read from a VM3 file
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
                        ["getElementsByTagName", "li", 1],
                        ["getElementsByTagName", "button", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self open a file from VM3",
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

        // access file navigate modal on self
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
            index: 2,
            lastItem: "user.json",
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
                        ["getElementsByTagName", "li", null]
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
                value: "file"
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
        moveToSandbox(3, "VM2", "file"),

        // on self move to sandbox for VM3 modal
        moveToSandbox(1, "VM3", "empty-list"),

        // on VM3 move the file navigate modal to the test folder
        {
            delay: 
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", 0],
                    ["getElementsByClassName", "fileList", 0],
                    ["lastChild", null, null],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "storageService"
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
                    value: filePathEncode("absolute", "lib/terminal/test")
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
            machine: "VM3",
            name: "On VM3 move the file navigate modal to the test location",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 0],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 0]
                    ],
                    qualifier: "is",
                    target: ["class"],
                    type: "attribute",
                    value: "directory"
                }
            ]
        },

        showContextMenu([
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByTagName", "li", 2],
            ["getElementsByTagName", "p", 0]
        ],
        [], "VM3"),

        // on VM3 add a share
        {
            delay: {
                node: [
                    ["getModalsByModalType", "shares", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByClassName", "share", 1],
                    ["getElementsByTagName", "button", 1]
                ],
                qualifier: "ends",
                target: ["firstChild", "textContent"],
                type: "property",
                value: "storageBrowser"
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
            name: "On VM3 share a directory",
            unit: []
        },

        // on self close the VM3 modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", null]
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
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "close", 0]
                    ]
                }
            ],
            machine: "self",
            name: "On self close the VM3 modal",
            unit: []
        },

        // on self open a new VM3 file navigate modal from the share
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 3],
                    ["getElementsByTagName", "h2", 0],
                    ["getElementsByTagName", "button", 0]
                ],
                qualifier: "ends",
                target: ["lastChild", "textContent"],
                type: "property",
                value: "VM3"
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
            name: "On self open a new VM3 file navigate modal from a share",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 3],
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

        // on self create a new directory on self's modal
        newDirectory("self", 1, "sandbox"),

        // on self create a new directory on VM1's modal
        newDirectory("self", 0, "sandbox"),

        // on self create a new directory on VM2's modal
        newDirectory("self", 2, "sandbox"),

        // on self create a new directory on VM3's modal
        {
            delay: {
                node: [
                    ["getModalsByModalType", "fileNavigate", 3],
                    ["getElementsByClassName", "fileList", 0],
                    ["firstChild", null, null]
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
                        ["getModalsByModalType", "fileNavigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Alt"
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "d"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "d"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Alt"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 3],
                        ["getElementsByClassName", "fileList", 0]
                    ],
                    value: "Control"
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
                    value: "sandbox"
                },
                {
                    event: "blur",
                    node: [
                        ["getElementById", "newFileItem", null]
                    ]
                }
            ],
            machine: "self",
            name: `On self attempt to create a directory on a read only share`,
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "fileNavigate", 3],
                        ["getElementsByClassName", "status-bar", 0],
                        ["getElementsByTagName", "p", 0]
                    ],
                    qualifier: "begins",
                    target: ["innerHTML"],
                    type: "property",
                    value: "Attempted action \"new\" to location "
                }
            ]
        },

        // make vm3's share full control
        {
            interaction: [
                {
                    event: "click",
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "share", 1],
                        ["getElementsByTagName", "button", 2]
                    ]
                }
            ],
            machine: "VM3",
            name: "On VM3 make the share full access.",
            unit: [
                {
                    node: [
                        ["getModalsByModalType", "shares", 0],
                        ["getElementsByClassName", "body", 0],
                        ["getElementsByClassName", "share", 1],
                        ["getElementsByTagName", "strong", 0]
                    ],
                    qualifier: "is",
                    target: ["innerHTML"],
                    type: "property",
                    value: "(Full Access)"
                }
            ]
        },

        // on self create a new directory on VM3's modal
        newDirectory("self", 3, "sandbox"),

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
                value: "Copying 100.00% complete. 4 files written at size 1"
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
                    event: "click",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "p", 0]
                    ]
                },
                {
                    event: "keydown",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "c"
                },
                {
                    event: "keyup",
                    node: [
                        ["getModalsByModalType", "fileNavigate", 1],
                        ["getElementsByClassName", "fileList", 0],
                        ["getElementsByTagName", "li", 4],
                        ["getElementsByTagName", "p", 0]
                    ],
                    value: "c"
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
                    value: "device.json"
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
                value: "Copying 100.00% complete. 4 files written at size 1"
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
                value: "Copying 100.00% complete. 4 files written at size 1"
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
                        ["getModalsByModalType", "fileNavigate", 2],
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
                value: "0 directories, 0 files, 0 symbolic links, 0 errors"
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
            name: "On self cut directory and then paste them from VM2 to self",
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
                    value: "empty-list"
                }
            ]
        }
    ];

export default browserAgents;