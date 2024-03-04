
/* lib/browser/modal_config/modal_configuration - Modal configuration for configuration modal type. */

import browser from "../utilities/browser.js";
import configuration from "../content/configuration.js";
import modal from "../utilities/modal.js";
import zTop from "../utilities/zTop.js";

const modal_configuration = function browser_modalConfig_modalConfiguration(event:Event, config?:config_modal):modal {
    // building configuration modal
    if (document.getElementById("configuration-modal") === null) {
        const payloadModal:config_modal = {
            agent: browser.identity.hashDevice,
            agentIdentity: false,
            agentType: "device",
            closeHandler: modal.events.closeEnduring,
            content: null,
            id: "configuration-modal",
            read_only: false,
            single: true,
            status: "hidden",
            type: "configuration"
        };
        if (config !== null && config !== undefined) {
            payloadModal.callback = config.callback;
            payloadModal.height = config.height;
            payloadModal.left = config.left;
            payloadModal.status = config.status;
            payloadModal.top = config.top;
            payloadModal.width = config.width;
            payloadModal.zIndex = config.zIndex;
        }
        payloadModal.content = configuration.content();
        payloadModal.inputs = ["close"];
        return modal.content(payloadModal);
    }
    if (browser.loading === true) {
        return document.getElementById("configuration-modal");
    }
    const conf:HTMLElement = document.getElementById("configuration-modal"),
        data:config_modal = browser.ui.modals["configuration-modal"];
    zTop(event as MouseEvent, conf);
    if (data.status === "hidden") {
        conf.style.display = "block";
    }
    data.status = "normal";
    document.getElementById("menu").style.display = "none";
};

export default modal_configuration;