/* lib/terminal/test/samples/browser_showContextMenu - A convenience function that launches the modal context menu in browser tests. */

const showContextMenu = function terminal_test_samples_showContextMenu(node:testBrowserDOM, test:testBrowserTest[], machine:string):testBrowserItem {
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

export default showContextMenu