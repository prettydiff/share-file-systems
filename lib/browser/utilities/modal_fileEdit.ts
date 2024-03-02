
/* lib/browser/utilities/modal_fileEdit - Configuration details for edit modal type. */

import browser from "./browser.js";
import file_select_addresses from "./file_select_addresses.js";
import modal from "./modal.js";
import util from "./util.js";

const modal_fileEdit = function browser_utilities_modalConfiguration_fileEdit(event:Event, config?:config_modal):modal {
    let modalInstance:modal = null,
        agents:[fileAgent, fileAgent, fileAgent] = null;
    const menu:HTMLElement = document.getElementById("contextMenu"),
        payloadNetwork:service_fileSystem = {
            action: null,
            agentRequest: null,
            agentSource: null,
            agentWrite: null,
            depth: 1,
            location: [],
            name: ""
        };
    if (config === null || config === undefined) {
        const element:HTMLElement = (browser.contextElement.lowName() === "li")
                ? browser.contextElement
                : browser.contextElement.getAncestor("li", "tag"),
            mouseEvent:MouseEvent = event as MouseEvent,
            contextElement:HTMLElement = event.target as HTMLElement,
            type:contextType = (browser.contextType !== "")
                ? browser.contextType
                : (contextElement.innerHTML.indexOf("Base64") === 0)
                    ? "Base64"
                    : (contextElement.innerHTML.indexOf("File as Text") > 0)
                        ? "Edit"
                        : "Hash",
            addresses:[string, fileType, string][] = file_select_addresses(element, "file-edit"),
            box:modal = element.getAncestor("box", "class"),
            length:number = addresses.length,
            agency:agentId = util.getAgent(box);
        let a:number = 0;
        agents = util.fileAgent(box, null);
        config = {
            agent: agency[0],
            agentIdentity: true,
            agentType: agency[2],
            content: null,
            height: 500,
            inputs: (type === "Edit" && agency[1] === false)
                ? ["close", "save"]
                : ["close"],
            left: 0,
            read_only: agency[1],
            single: false,
            title_supplement: type,
            top: 0,
            type: "file-edit",
            width: 500
        };
        payloadNetwork.action = (type === "Edit")
            ? "fs-read"
            : `fs-${type.toLowerCase()}` as actionFile;
        payloadNetwork.agentRequest = agents[0];
        payloadNetwork.agentSource = agents[1];
        do {
            if (addresses[a][1].indexOf("file") === 0) {
                config.content = modal.tools.textModal("File Edit", "", "file-edit");
                config.left = mouseEvent.clientX + (a * 10);
                config.top = (mouseEvent.clientY - 60) + (a * 10);
                config.text_value = addresses[a][0];
                modalInstance = modal.content(config);
                payloadNetwork.location.push(`${modalInstance.getAttribute("id")}:${addresses[a][0]}`);
            }
            a = a + 1;
        } while (a < length);
        browser.send(payloadNetwork, "file-system");
        browser.contextElement = null;
        browser.contextType = "";
        if (menu !== null) {
            menu.parentNode.removeChild(menu);
        }
        return modalInstance;
    }
    config.content = modal.tools.textModal("File Edit", "", "file-edit");
    modalInstance = modal.content(config);
    agents = util.fileAgent(modalInstance, null, config.text_value);
    payloadNetwork.action = payloadNetwork.action = (config.title_supplement === "Edit")
        ? "fs-read"
        : `fs-${config.title_supplement.toLowerCase()}` as actionFile;
    payloadNetwork.agentRequest = {
        device: browser.identity.hashDevice,
        modalAddress: "",
        share: "",
        user: browser.identity.hashUser
    };
    payloadNetwork.agentSource = {
        device: (config.agentType === "device")
            ? config.agent
            : "",
        modalAddress: config.text_value,
        share: "",
        user: (config.agentType === "device")
            ? browser.identity.hashUser
            : config.agent
    };
    payloadNetwork.location = [`${modalInstance.getAttribute("id")}:${config.text_value}`];
    browser.send(payloadNetwork, "file-system");
    browser.contextElement = null;
    browser.contextType = "";
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
    return modalInstance;
};

export default modal_fileEdit;