
/* lib/browser/utilities/modal_fileNavigate - Modal configuration for file navigate modals. */

import browser from "./browser.js";
import file_browser from "../content/file_browser.js";
import file_text from "./file_text.js";
import modal from "./modal.js";
import util from "./util.js";

// cspell: words agentType

const modal_fileNavigate = function browser_utilities_ModalFileNavigate(event:Event, config?:config_modal):modal {
    const element:HTMLElement = (event === null)
            ? null
            : (event as MouseEvent).target,
        box:HTMLElement = (element === null)
            ? null
            : element.getAncestor("box", "class"),
        div:HTMLElement = (element === null)
            ? null
            : element.getAncestor("div", "tag"),
        agentName:string = (config === null || config === undefined || config.agent === undefined)
            ? (box !== document.documentElement)
                ? (box.dataset.agent === undefined || box.dataset.agent === "")
                    ? div.dataset.hash                       // multi-agent share modals not bound to one agent
                    : box.dataset.agent                      // modals bound to an agent
                : browser.identity.hashDevice                // when not coming from a modal (assume local device)
            : config.agent,                                  // state restoration
        agentType:agentType = (config === null || config === undefined || config.agentType === undefined)
            ? (box !== document.documentElement)
                ? (box.dataset.agent === undefined || box.dataset.agent === "")
                    ? div.getAttribute("class") as agentType // multi-agent share modals not bound to one agent
                    : box.dataset.agenttype as agentType     // modals bound to an agent
                : "device"                                   // when not coming from a modal (assume local device)
            : config.agentType,                              // state restoration
        location:string = (config !== null && config !== undefined && typeof config.text_value === "string")
            ? config.text_value
            : "**root**",
        share:string = (config === null || config === undefined || config.share === undefined)
            ? ""
            : config.share,
        readOnly:boolean = (agentName !== browser.identity.hashDevice && config !== undefined && config.read_only === true),
        readOnlyString:string = (readOnly === true && agentType === "user")
            ? "(Read Only)"
            : "",
        // agents not abstracted in order to make use of a config object for state restoration
        payloadNetwork:service_fileSystem = {
            action: "fs-directory",
            agentRequest: {
                device: browser.identity.hashDevice,
                modalAddress: "",
                share: "",
                user: browser.identity.hashUser
            },
            agentSource: {
                device: (agentType === "device")
                    ? agentName
                    : "",
                modalAddress: location,
                share: share,
                user: (agentType === "device")
                    ? browser.identity.hashUser
                    : agentName
            },
            agentWrite: null,
            depth: 2,
            location: [location],
            name: "navigate"
        },
        payloadModal:config_modal = (config === null || config === undefined)
            ? {
                agent: agentName,
                agentIdentity: true,
                agentType: agentType,
                content: null,
                footer: null,
                read_only: readOnly,
                selection: {},
                share: share,
                text_event: file_text,
                text_placeholder: "Optionally type a file system address here.",
                text_value: location,
                title_supplement: readOnlyString,
                type: "file-navigate",
                width: 800
            }
            : config;
    if (payloadModal.history === undefined || payloadModal.history === null || payloadModal.history.length < 1) {
        payloadModal.history = [location];
    }
    if (payloadModal.search === undefined || payloadModal.search === null) {
        payloadModal.search = ["", ""];
    }
    if (payloadModal.selection === undefined || payloadModal.selection === null) {
        payloadModal.selection = {};
    }
    payloadModal.inputs = ["close", "maximize", "minimize", "text"];
    payloadModal.content = util.delay();
    payloadModal.footer = file_browser.content.footer();
    payloadModal.text_event = file_text;
    document.getElementById("menu").style.display = "none";
    browser.send(payloadNetwork, "file-system");
    return modal.content(payloadModal);
};

export default modal_fileNavigate;