/* lib/terminal/test/application/browserUtilities/modalAddress - A convenience function that tests a file navigation modal to go to the project's location for browser tests. */

import filePathEncode from "./file_path_encode.js";

const modalAddress = function terminal_test_application_browserUtilities_modalAddress(config:test_modalAddress):test_browserItem {
    const address:string = (config.address === "")
        ? "project path"
        : config.address;
    return {
        delay: {
            node: [
                ["getModalsByModalType", "file-navigate", config.index],
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
                    ["getModalsByModalType", "file-navigate", config.index],
                    ["getElementsByTagName", "input", 0]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "file-navigate", config.index],
                    ["getElementsByTagName", "input", 0]
                ],
                value: filePathEncode("absolute", config.address)
            },
            {
                event: "keydown",
                node: [
                    ["getModalsByModalType", "file-navigate", config.index],
                    ["getElementsByTagName", "input", 0]
                ],
                value: "Enter"
            },
            {
                event: "keyup",
                node: [
                    ["getModalsByModalType", "file-navigate", config.index],
                    ["getElementsByTagName", "input", 0]
                ],
                value: "Enter"
            }
        ],
        machine: config.machine,
        name: `On ${config.machine} change file navigator ${config.index} to address ${address}`,
        unit: []
    };
};

export default modalAddress;