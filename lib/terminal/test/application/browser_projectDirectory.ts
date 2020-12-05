/* lib/terminal/test/samples/browser_projectDirectory - A convenience function that tests a file navigation modal to go to the project's location for browser tests. */

import vars from "../../utilities/vars.js";

const projectDirectory = function terminal_test_samples_projectDirectory(index:number, machine:string):testBrowserItem {
    return {
        delay: {
            // the last file system item is version.json
            node: [
                ["getModalsByModalType", "fileNavigate", index],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", -1],
                ["getElementsByTagName", "label", 0]
            ],
            qualifier: "ends",
            target: ["innerHTML"],
            type: "property",
            value: "version.json"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", index],
                    ["getElementsByTagName", "input", 0]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "fileNavigate", index],
                    ["getElementsByTagName", "input", 0]
                ],
                value: vars.projectPath
            },
            {
                event: "blur",
                node: [
                    ["getModalsByModalType", "fileNavigate", index],
                    ["getElementsByTagName", "input", 0]
                ]
            }
        ],
        machine: machine,
        name: "Change file navigator file system location",
        unit: [
            {
                // the first file system item is .git
                node: [
                    ["getModalsByModalType", "fileNavigate", index],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "ends",
                target: ["innerHTML"],
                type: "property",
                value: ".git"
            }
        ]
    };
};

export default projectDirectory;