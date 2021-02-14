
/* lib/terminal/test/application/browserUtilities/moveToSandbox - Generates a browser test to move a file navigate modal to the project's internal test location. */

const moveToSandbox = function terminal_test_samples_browserDevices_moveToSandbox(index:number, machine:string, test:string):testBrowserItem {
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
        unit: []
    };
};

export default moveToSandbox;