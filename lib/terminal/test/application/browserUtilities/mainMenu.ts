/* lib/terminal/test/application/browserUtilities/mainMenu - A convenience function that opens the main menu while in browser tests. */

const mainMenu = function terminal_test_application_browserUtilities_mainMenu(machine:string):test_browserItem {
    return {
        delay: {
            // primary menu is visible
            node: [
                ["getElementById", "menu", null]
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
                    ["getElementById", "menuToggle", null]
                ]
            }
        ],
        machine: machine,
        name: `On ${machine} display the primary menu`,
        unit: [
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
    };
};

export default mainMenu;