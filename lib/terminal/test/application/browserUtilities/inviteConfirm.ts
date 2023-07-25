
/* lib/terminal/test/application/browserUtilities/inviteConfirm - A test generator for accepting an invitation. */

const inviteConfirm = function terminal_test_application_browserUtilities_inviteConfirm(from:string, to:string, type:agentType):test_browserItem {
    // accept invitation
    return {
        delay: {
            node: [
                ["getElementById", type, null],
                ["getElementsByTagName", "li", (type === "device")
                    ? (from === "self" && to === "VM1")
                        ? 3
                        : 2
                    : 1
                ],
                ["getElementsByTagName", "button", 0]
            ],
            qualifier: "is",
            target: ["lastChild", "textContent"],
            type: "property",
            value: ` ${(from === "self")
                ? (type === "device")
                    ? "Primary Device"
                    : "User-self"
                : from}`
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-ask", 0],
                    ["getElementsByClassName", "confirm", 0]
                ]
            }
        ],
        machine: to,
        name: `On ${to} accept ${type} invitation from ${from}`,
        unit: [
            {
                node: [
                    ["getModalsByModalType", "invite-ask", 0]
                ],
                qualifier: "is",
                target: [],
                type: "element",
                value: undefined
            }
        ]
    };
};

export default inviteConfirm;