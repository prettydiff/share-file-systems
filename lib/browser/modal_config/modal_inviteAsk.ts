
/* lib/browser/modal_config/modal_inviteAsk - Modal configuration for invitations from remote agents. */

import browser from "../utilities/browser.js";
import common from "../../common/common.js";
import invite_decline from "../utilities/invite_decline.js";
import invite_remote from "../utilities/invite_remote.js";
import modal from "../utilities/modal.js";
import modal_close from "../utilities/modal_close.js";

const modal_inviteAsk = function browser_modalConfig_modalInviteAsk(event:Event, config?:config_modal):modal {
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
    config.confirmHandler = function browser_modalConfig_modalInviteAsk_confirmHandler(event:MouseEvent):void {
        const box:HTMLElement = event.target.getAncestor("box", "class"),
            div:HTMLElement = box.getElementsByClassName("agentInvitation")[0] as HTMLElement,
            invitation:service_invite = JSON.parse(div.dataset.invitation) as service_invite;
        invitation.action = "invite-answer";
        invitation.message = `Invite accepted: ${common.dateFormat(new Date())}`;
        invitation.status = "accepted";
        if (invitation.type === "device") {
            browser.identity.hashUser = invitation.agentRequest.hashUser;
            browser.identity.nameUser = invitation.agentRequest.nameUser;
            browser.configuration();
        }
        browser.send(invitation, "invite");
        modal_close(event);
    };
    config.content = invite_remote(invitation, inviteName);
    return modal.content(config);
};

export default modal_inviteAsk;