
/* lib/browser/utilities/modal_shareUpdate - Updates existing modals with new share content. */

import share_content from "./share_content.js";

const modal_shareUpdate = function browser_utilities_modalShareUpdate(modal:modal, agent:string, agentType:agentType|""):void {
    const body:HTMLElement = modal.getElementsByClassName("body")[0] as HTMLElement;
    body.empty();
    body.appendChild(share_content(agent, agentType));

};

export default modal_shareUpdate