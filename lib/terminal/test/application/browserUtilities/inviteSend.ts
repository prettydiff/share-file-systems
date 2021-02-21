
/* lib/terminal/test/application/browserUtilities/inviteSend - A test generator for sending an invitation. */

import machines from "./machines.js";

const inviteSend = function terminal_test_application_browserUtilities_inviteSend(from:string, to:string, type:agentType):testBrowserItem {
    // create invitation
    const index:number = (from === "self" && to === "VM3")
        ? 1
        : 0;
    return {
        delay: {
            node: [
                ["getModalsByModalType", "invite-request", index],
                ["getElementsByClassName", "delay", 0],
                ["getElementsByTagName", "p", 0]
            ],
            qualifier: "is",
            target: ["innerHTML"],
            type: "property",
            value: "Waiting on data. Please stand by."
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", index],
                    ["getElementsByTagName", "input", (type === "device") ? 0 : 1]
                ]
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", index],
                    ["getElementsByTagName", "input", 2]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "invite-request", index],
                    ["getElementsByTagName", "input", 2]
                ],
                value: machines[to].ip
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", index],
                    ["getElementsByTagName", "input", 3]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "invite-request", index],
                    ["getElementsByTagName", "input", 3]
                ],
                value: machines[to].port.toString()
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", index],
                    ["getElementsByTagName", "textarea", 0]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "invite-request", index],
                    ["getElementsByTagName", "textarea", 0]
                ],
                value: `Hello to ${to} from ${(from === "self") ? "Primary Device" : from}.`
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", index],
                    ["getElementsByClassName", "confirm", 0]
                ]
            }
        ],
        machine: from,
        name: `On ${from} send ${type} invitation to ${to}`,
        unit: []
    };
};

export default inviteSend;