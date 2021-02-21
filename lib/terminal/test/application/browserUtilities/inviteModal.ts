
/* lib/terminal/test/application/browserUtilities/inviteModal - A test generator for spawning the invitation modal. */

const inviteModal = function terminal_test_application_browserUtilities_inviteModal(from:string):testBrowserItem {
    // open invite modal
    return {
        delay: {
            node: [
                ["getModalsByModalType", "invite-request", 0],
                ["getElementsByTagName", "h3", 0]
            ],
            qualifier: "is",
            target: ["innerHTML"],
            type: "property",
            value: "Connection Type"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementById", "agent-invite", null]
                ]
            }
        ],
        machine: from,
        name: `On ${from} spawn invitation modal`,
        unit: []
    };
};
export default inviteModal;