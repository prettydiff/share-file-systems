/* lib/terminal/test/application/browser_modalAddress - A convenience function that tests a file navigation modal to go to the project's location for browser tests. */

import filePathEncode from "./file_path_encode.js";

const modalAddress = function terminal_test_samples_modalAddress(config:testModalAddress):testBrowserItem {
    const address:string = (config.address === "")
        ? "project path"
        : config.address
    return {
        delay: {
            node: [
                ["getModalsByModalType", "fileNavigate", config.index],
                ["getElementsByClassName", "fileList", 0],
                ["lastChild", null, null],
                ["getElementsByTagName", "label", 0]
            ],
            qualifier: "ends",
            target: ["innerHTML"],
            type: "property",
            value: config.lastItem
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", config.index],
                    ["getElementsByTagName", "input", 0]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "fileNavigate", config.index],
                    ["getElementsByTagName", "input", 0]
                ],
                value: filePathEncode("absolute", config.address)
            },
            {
                event: "blur",
                node: [
                    ["getModalsByModalType", "fileNavigate", config.index],
                    ["getElementsByTagName", "input", 0]
                ]
            }
        ],
        machine: config.machine,
        name: `On ${config.machine} change file navigator ${config.index} to address ${address}`,
        unit: []
    };
};

export default modalAddress;