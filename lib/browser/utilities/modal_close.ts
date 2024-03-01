
/* lib/browser/utilities/modal_close - An event handler associated with closing modals. */

import browser from "./browser.js";
import media_kill from "./media_kill.js";

const modal_close = function browser_utilities_modalClose(event:MouseEvent):void {
    const element:HTMLElement = event.target,
        keys:string[] = Object.keys(browser.ui.modals),
        keyLength:number = keys.length,
        box:modal = element.getAncestor("box", "class"),
        id:string = box.getAttribute("id"),
        type:modalType = (browser.ui.modals[id] === undefined)
            ? null
            : browser.ui.modals[id].type;
    let a:number = 0,
        count:number = 0;
    
    // box is off the DOM, so don't worry about it
    if (box.parentNode === null || type === null) {
        return;
    }

    // modal type specific instructions
    if (type === "invite-ask") {
        const inviteBody:HTMLElement = box.getElementsByClassName("agentInvitation")[0] as HTMLElement,
            invitation:service_invite = JSON.parse(inviteBody.dataset.invitation) as service_invite;
        if (invitation.status === "invited") {
            invitation.action = "invite-answer";
            invitation.status = "ignored";
            browser.send(invitation, "invite");
        }
    } else if (type === "media") {
        media_kill(browser.ui.modals[id]);
    }

    if (box.socket !== null && box.socket !== undefined) {
        box.socket.close();
    }

    // remove the box
    box.onclick = null;
    box.parentNode.removeChild(box);

    // remove from modal type list if the last of respective modal types open
    do {
        if (browser.ui.modals[keys[a]].type === type) {
            count = count + 1;
            if (count > 1) {
                break;
            }
        }
        a = a + 1;
    } while (a < keyLength);
    if (count === 1) {
        browser.ui.modalTypes.splice(browser.ui.modalTypes.indexOf(type), 1);
    }

    // remove from state and send to storage
    delete browser.ui.modals[id];
    browser.configuration();
};

export default modal_close;