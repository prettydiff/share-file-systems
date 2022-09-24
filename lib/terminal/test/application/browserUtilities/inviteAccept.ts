
/* lib/terminal/test/application/browserUtilities/inviteAccept - A test generator for accepting an invitation. */

import common from "../../../../common/common.js";

const inviteAccept = function terminal_test_application_browserUtilities_inviteAccept(from:string, to:string, type:agentType):test_browserItem {
    // read invitation
    const fromName:string = (from === "self")
            ? (type === "device")
                ? "Primary Device"
                : "User-self"
            : from,
        fromText:string = (fromName === "User-self")
            ? "Primary Device"
            : fromName;
    return {
        delay: {
            node: [
                ["getModalsByModalType", "invite-accept", 0],
                ["getElementsByTagName", "h3", 0]
            ],
            qualifier: "begins",
            target: ["innerHTML"],
            type: "property",
            value: `${common.capitalize(type)} <strong>${fromName}</strong> from`
        },
        interaction: [
            {
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-accept", 0]
                ]
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
                value: `Hello to ${to} from ${fromText}.`
            }
        ]
    };
};

export default inviteAccept;