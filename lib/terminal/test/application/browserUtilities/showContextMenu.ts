/* lib/terminal/test/application/browserUtilities/showContextMenu - A convenience function that launches the modal context menu in browser tests. */

const showContextMenu = function terminal_test_application_browserUtilities_showContextMenu(node:test_browserDOM, test:test_browserTest[], machine:string):test_browserItem {
    return {
        delay: {
            node: [
                ["getElementById", "contextMenu", null]
            ],
            qualifier: "greater",
            target: ["clientHeight"],
            type: "property",
            value: 2
        },
        interaction: [
            {
                event: "contextmenu",
                node: node
            }
        ],
        machine: machine,
        name: `On ${machine} show context menu`,
        unit: test
    };
};

export default showContextMenu;