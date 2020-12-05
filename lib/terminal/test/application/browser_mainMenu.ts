/* lib/terminal/test/samples/browser_mainMenu - A convenience function that opens the main menu while in browser tests. */

const mainMenu = function terminal_test_samples_mainMenu(machine:string):testBrowserItem {
    return {
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementById", "menuToggle", null]
                ]
            }
        ],
        machine: machine,
        name: "Display the primary menu",
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
    }
};

export default mainMenu;