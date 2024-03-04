
/* lib/browser/modal_config/modal_socketMap - Modal configuration for socket map type modals. */

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";
import zTop from "../utilities/zTop.js";

const modal_socketMap = function browser_modalConfig_modalSocketMap(event:Event, config?:config_modal):modal {
    // building configuration modal
    if (document.getElementById("socketMap-modal") === null) {
        const payloadModal:config_modal = {
            agent: browser.identity.hashDevice,
            agentIdentity: false,
            agentType: "device",
            closeHandler: modal.events.closeEnduring,
            content: null,
            id: "socketMap-modal",
            read_only: false,
            single: true,
            status: "hidden",
            type: "socket-map"
        };
        if (config !== null && config !== undefined) {
            payloadModal.callback = config.callback;
            payloadModal.content = config.content;
            payloadModal.height = config.height;
            payloadModal.left = config.left;
            payloadModal.status = config.status;
            payloadModal.top = config.top;
            payloadModal.width = config.width;
            payloadModal.zIndex = config.zIndex;
        }
        payloadModal.content = document.createElement("div");
        payloadModal.inputs = ["close", "maximize", "minimize"];
        return modal.content(payloadModal);
    }
    if (browser.loading === true) {
        return document.getElementById("socketMap-modal");
    }
    const conf:HTMLElement = document.getElementById("socketMap-modal"),
        data:config_modal = browser.ui.modals["socketMap-modal"];
    zTop(event as MouseEvent, conf);
    if (data.status === "hidden") {
        conf.style.display = "block";
    }
    data.status = "normal";
    browser.configuration();
};

export default modal_socketMap;