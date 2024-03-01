
/* lib/browser/utilities/invite_decline - An event handler associated with closing invitation modals which require sending feedback. */

import browser from "./browser.js";
import modal_close from "./modal_close.js";

const invite_decline = function browser_utilities_inviteDecline(event:MouseEvent):void {
    const element:HTMLElement = event.target,
        boxLocal:HTMLElement = element.getAncestor("box", "class"),
        inviteBody:HTMLElement = boxLocal.getElementsByClassName("agentInvitation")[0] as HTMLElement,
        invitation:service_invite = JSON.parse(inviteBody.dataset.invitation) as service_invite;
    invitation.action = "invite-answer";
    invitation.status = "declined";
    browser.send(invitation, "invite");
    modal_close(event);
};

export default invite_decline;