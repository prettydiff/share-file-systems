
/* lib/browser/utilities/invite_ask - Modal configuration for invitations from remote agents. */

import browser from "./browser.js";
import invite_decline from "./invite_decline.js";
import invite_remote from "./invite_remote.js";
import modal from "./modal.js";

const modal_inviteAsk = function browser_utilities_inviteAsk(event:Event, config?:config_modal):modal {
    const invitation:service_invite = JSON.parse(config.text_value) as service_invite,
        agentInvite:agentInvite = invitation.agentRequest,
        inviteName:string = invitation.agentRequest.nameUser;
    if (config === null || config === undefined) {
        config = {
            agent: browser.identity.hashDevice,
            agentIdentity: false,
            agentType: "device",
            closeHandler: invite_decline,
            content: null,
            height: 300,
            inputs: ["cancel", "confirm", "close"],
            read_only: false,
            share: browser.identity.hashDevice,
            title_supplement: `User ${agentInvite.nameUser}`,
            type: "invite-ask",
            width: 500
        };
    }
    config.content = invite_remote(invitation, inviteName);
    return modal.content(config);
};

export default modal_inviteAsk;