
/* lib/terminal/test/application/browserUtilities/inviteAccept - A test generator for accepting an invitation. */

const inviteAccept = function terminal_test_application_browserUtilities_inviteAccept(from:string, to:string, type:agentType):testBrowserItem {
    // read invitation
    const fromName:string = (from === "self")
        ? "Primary Device"
        : from;
    return {
        delay: {
            node: [
                ["getModalsByModalType", "invite-accept", 0],
                ["getElementsByTagName", "h3", 0]
            ],
            qualifier: "begins",
            target: ["innerHTML"],
            type: "property",
            value: `Device <strong>${fromName}</strong> from`
        },
        interaction: [
            {
                event: "wait",
                node: null,
                value: "100"
            }
        ],
        machine: to,
        name: `On ${to} read ${type} invitation from ${from}`,
        unit: [
            {
                node: [
                    ["getModalsByModalType", "invite-accept", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: `${fromName} said:`
            },
            {
                node: [
                    ["getModalsByModalType", "invite-accept", 0],
                    ["getElementsByTagName", "textarea", 0]
                ],
                qualifier: "is",
                target: ["value"],
                type: "property",
                value: `Hello to ${to} from ${fromName}.`
            }
        ]
    };
};

export default inviteAccept;