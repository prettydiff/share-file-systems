
/* lib/browser/modal_config/modal_media - Modal configuration for media type modals. */

import media from "../content/media.js";
import modal from "../utilities/modal.js";

const modal_media = function browser_modalConfig_modalMedia(event:Event):modal {
    const element:HTMLElement = event.target as HTMLElement,
        div:HTMLElement = element.getAncestor("div", "tag"),
        agentType:agentType = div.getAttribute("class") as agentType,
        mediaType:mediaType = element.getAttribute("class") as mediaType;
    return modal.content({
        agent: div.dataset.hash,
        agentIdentity: true,
        agentType: agentType,
        closeHandler: media.events.close,
        content: media.content(mediaType, 400, 565),
        inputs: ["close", "maximize"],
        read_only: true,
        scroll: false,
        socket: true,
        text_value: mediaType,
        type: "media"
    });
};

export default modal_media;