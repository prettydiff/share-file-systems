
/* lib/terminal/test/application/browserUtilities/login - A test generator to login a fresh device. */

const login = function terminal_test_application_browserUtilities_login(machine:string):test_browserItem {
    return {
        delay: 
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
            },
            {
                event: "wait",
                node: null,
                value: "3000"
            }
        ],
        machine: machine,
        name: `On ${machine} complete login form`,
        unit: [
            {
                // that class is removed from body
                node: [
                    ["getElementsByTagName", "body", 0]
                ],
                qualifier: "is",
                target: ["class"],
                type: "attribute",
                value: "default"
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
};

export default login;