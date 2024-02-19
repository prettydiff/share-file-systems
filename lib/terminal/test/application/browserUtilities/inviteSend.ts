
/* lib/terminal/test/application/browserUtilities/inviteSend - A test generator for sending an invitation. */

import machines from "./machines.js";

const inviteSend = function terminal_test_application_browserUtilities_inviteSend(from:string, to:string, type:agentType):test_browserItem {
    // create invitation
    return {
        delay: {
            node: [
                ["getModalsByModalType", "agent-management", 0],
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
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0],
                    ["getElementsByTagName", "input", (type === "device") ? 1 : 0]
                ]
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0],
                    ["getElementsByTagName", "input", 2]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0],
                    ["getElementsByTagName", "input", 2]
                ],
                value: machines[to].ip
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0],
                    ["getElementsByTagName", "input", 3]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0],
                    ["getElementsByTagName", "input", 3]
                ],
                value: machines[to].port.toString()
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0],
                    ["getElementsByTagName", "textarea", 0]
                ]
            },
            {
                event: "setValue",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "inviteAgent", 0],
                    ["getElementsByTagName", "textarea", 0]
                ],
                value: `Hello to ${to} from ${from}.`
            },
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "agent-management", 0],
                    ["getElementsByClassName", "confirm", 0]
                ]
            },
            {
                event: "wait",
                node: null,
                value: "2000"
            }
        ],
        machine: from,
        name: `On ${from} send ${type} invitation to ${to}`,
        unit: []
    };
};

export default inviteSend;