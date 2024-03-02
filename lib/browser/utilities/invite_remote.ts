
/* lib/browser/utilities/invite_remote - Modal content for invitations from remote agents. */

import common from "../../common/common.js";

// cspell: words agentType

const invite_remote = function browser_utilities_inviteRemote(invitation:service_invite, name:string):HTMLElement {
    const div:HTMLElement = document.createElement("div"),
        agentInvite:agentInvite = invitation.agentRequest,
        strong:HTMLElement = document.createElement("strong"),
        angryStrong:HTMLElement = document.createElement("strong"),
        em:HTMLElement = document.createElement("em"),
        ip:string = (agentInvite.ipSelected.indexOf(":") < 0)
            ? `${agentInvite.ipSelected}:${agentInvite.port}`
            : `[${agentInvite.ipSelected}]:${agentInvite.port}`,
        label:HTMLElement = document.createElement("label"),
        textarea:HTMLTextAreaElement = document.createElement("textarea");
    let text:HTMLElement = document.createElement("h3");

    div.setAttribute("class", "agentInvitation");
    div.setAttribute("data-agenttype", invitation.type);
    strong.appendText(name);
    text.appendText("User ");
    text.appendChild(strong);
    text.appendText(` from ${ip} is inviting you to share of type `);
    angryStrong.appendText(common.capitalize(invitation.type));
    angryStrong.setAttribute("class", "warning");
    text.appendChild(angryStrong);
    text.appendText(".");
    div.appendChild(text);
    text = document.createElement("p");
    label.appendText(`${name} said:`);
    textarea.value = invitation.message;
    label.appendChild(textarea);
    text.appendChild(label);
    div.appendChild(text);
    text = document.createElement("p");
    em.appendText("Confirm");
    text.appendText("Press the ");
    text.appendChild(em);
    text.appendText(" button to accept the invitation or close this modal to ignore it.");
    div.appendChild(text);
    div.setAttribute("data-invitation", JSON.stringify(invitation));
    return div;
};

export default invite_remote;