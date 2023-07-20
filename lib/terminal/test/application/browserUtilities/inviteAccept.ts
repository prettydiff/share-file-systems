
/* lib/terminal/test/application/browserUtilities/inviteAccept - A test generator for accepting an invitation. */

const inviteAccept = function terminal_test_application_browserUtilities_inviteAccept(from:string, to:string, type:agentType):test_browserItem {
    // read invitation
    const fromName:string = `User-${from}`;
    return {
        delay: {
            node: [
                ["getModalsByModalType", "invite-ask", 0],
                ["getElementsByTagName", "h3", 0]
            ],
            qualifier: "begins",
            target: ["innerHTML"],
            type: "property",
            value: `User <strong>${fromName}</strong> from`
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementById", "spaces", null]
                ]
            }
        ],
        machine: to,
        name: `On ${to} read ${type} invitation from ${from}`,
        unit: [
            {
                node: [
                    ["getModalsByModalType", "invite-ask", 0],
                    ["getElementsByTagName", "label", 0]
                ],
                qualifier: "begins",
                target: ["innerHTML"],
                type: "property",
                value: `${fromName} said:`
            },
            {
                node: [
                    ["getModalsByModalType", "invite-ask", 0],
                    ["getElementsByTagName", "textarea", 0]
                ],
                qualifier: "is",
                target: ["value"],
                type: "property",
                value: `Hello to ${to} from ${from}.`
            }
        ]
    };
};

export default inviteAccept;