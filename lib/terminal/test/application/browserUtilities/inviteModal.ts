
/* lib/terminal/test/application/browserUtilities/inviteModal - A test generator for spawning the invitation modal. */

const inviteModal = function terminal_test_application_browserUtilities_inviteModal(from:string):testBrowserItem {
    // open invite modal
    return {
        delay: {
            node: [
                ["getModalsByModalType", "agent-management", 0],
                ["getElementsByTagName", "h3", 0]
            ],
            qualifier: "is",
            target: ["innerHTML"],
            type: "property",
            value: "Select An Action"
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getElementById", "agent-management", null]
                ]
            }
        ],
        machine: from,
        name: `On ${from} spawn invitation modal`,
        unit: [{
            node: [
                ["getModalsByModalType", "agent-management", 0],
                ["getElementsByTagName", "h3", 1]
            ],
            qualifier: "is",
            target: ["innerHTML"],
            type: "property",
            value: "Invite An Agent"
        }]
    };
};
export default inviteModal;