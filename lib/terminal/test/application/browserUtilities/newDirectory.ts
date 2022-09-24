
/* lib/terminal/test/application/browserUtilities/newDirectory - Generates a browser test to create new directories in the file system. */

const newDirectory = function terminal_test_samples_browserDevices_newDirectory(machine:string, index:number, name:string):test_browserItem {
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
        unit: [
            {
                node: [
                    ["getModalsByModalType", "fileNavigate", index],
                    ["getElementsByClassName", "status-bar", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: "1 directory"
            }
        ]
    };
};

export default newDirectory;