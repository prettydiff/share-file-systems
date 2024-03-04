
/* lib/browser/modal_config/modal_export - Modal configuration for export modal type. */

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";
import modal_close from "../utilities/modal_close.js";

const modal_export = function browser_modalConfig_modalExport(event:Event, config?:config_modal):modal {
    let modalItem:modal = null,
        id:string = "";
    const payload_modal:config_modal = (config === null || config === undefined)
            ? {
                agent: browser.identity.hashDevice,
                agentIdentity: false,
                agentType: "device",
                content: null,
                inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
                read_only: false,
                single: true,
                type: "export"
            }
            : config,
        payloadNetwork:service_fileSystem = {
            action: "fs-base64",
            agentRequest: {
                device: browser.identity.hashDevice,
                modalAddress: "",
                share: "",
                user: browser.identity.hashUser
            },
            agentSource: {
                device: browser.identity.hashDevice,
                modalAddress: "",
                share: "",
                user: browser.identity.hashUser
            },
            agentWrite: null,
            depth: 1,
            location: [],
            name: ""
        };
    if (config !== null && config !== undefined) {
        payload_modal.callback = config.callback;
    }
    payload_modal.confirmHandler = function browser_modalConfig_modalExport_importSettings(event:MouseEvent):void {
        const element:HTMLElement = event.target,
            box:modal = element.getAncestor("box", "class"),
            button:HTMLButtonElement = document.getElementsByClassName("cancel")[0] as HTMLButtonElement,
            textArea:HTMLTextAreaElement = box.getElementsByTagName("textarea")[0];
        button.click();
        browser.send(textArea.value, "import");
        modal_close(event);
    };
    document.getElementById("menu").style.display = "none";
    payload_modal.content = modal.tools.textModal("Import/Export Settings", "", "export");
    modalItem =  modal.content(payload_modal);
    id = modalItem.getAttribute("id");
    payloadNetwork.location.push(`${id}:export-settings`);
    browser.send(payloadNetwork, "file-system");
    return modalItem;
};

export default modal_export;