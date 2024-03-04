
/* lib/browser/modal_config/modal_document - Modal configuration for document modal type. */

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";

const modal_document = function browser_modalConfig_modalDocument(event:Event, config?:config_modal):modal {
    const payload:config_modal = (config === null || config === undefined)
        ? {
            agent: browser.identity.hashDevice,
            agentIdentity: false,
            agentType: "device",
            content: null,
            height: 600,
            inputs: ["close"],
            move: false,
            read_only: true,
            title_supplement: "Tutorial",
            type: "document"
        }
        : config;
    return modal.content(payload);
};

export default modal_document;