
/* lib/browser/utilities/modal_configuration - A single location for storing all modal content configurations by modal type. */

import agent_management from "../content/agent_management.js";
import browser from "./browser.js";
import configuration from "../content/configuration.js";
import file_select_addresses from "../utilities/file_select_addresses.js";
import media from "../content/media.js";
import modal from "./modal.js";
import modal_fileNavigate from "./modal_fileNavigate.js";
import modal_inviteAsk from "./modal_inviteAsk.js";
import modal_message from "./modal_message.js";
import modal_shares from "./modal_shares.js";
import modal_terminal from "./modal_terminal.js";
import util from "./util.js";
import zTop from "./zTop.js";

// cspell:words agenttype

/**
 * Provides a central location for the configuration of modals by modal type.
 * ```typescript
 * interface module_modalConfiguration {
 *     modals: {
 *         "agent-management": modal_open;
 *         "configuration": modal_open;
 *         "details": modal_open;
 *         "document": modal_open;
 *         "export": modal_open;
 *         "file-edit": modal_open;
 *         "file-navigate": modal_open;
 *         "invite-ask": modal_open;
 *         "media": modal_open;
 *         "message": modal_open;
 *         "shares": modal_open;
 *         "socket-map": modal_open;
 *         "terminal": modal_open;
 *         "text-pad": modal_open;
 *     };
 *     titles: {
 *         [key:string]: {
 *             icon: string;
 *             menu: boolean;
 *             text: string;
 *         };
 *     };
 * }
 * ``` */
const modal_configuration:module_modalConfiguration = {
    modals: {
        "agent-management": function browser_utilities_modalConfiguration_agentManagement(event:Event, config?:config_modal):modal {
            const content:HTMLElement = agent_management.content.menu("invite");
            document.getElementById("menu").style.display = "none";
            if (config === null || config === undefined) {
                config = {
                    agent: browser.identity.hashDevice,
                    agentIdentity: false,
                    agentType: "device",
                    content: content,
                    inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
                    read_only: false,
                    single: true,
                    type: "agent-management",
                    width: 750
                };
                browser.configuration();
            } else {
                config.agent = browser.identity.hashDevice;
                config.agentIdentity = false;
                config.content = content;
                config.single = true;
                config.type = "agent-management";
            }
            return modal.content(config);
        },

        "configuration": function browser_utilities_modalConfiguration_configuration(event:Event, config?:config_modal):modal {
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
        },

        "details": function browser_utilities_modalConfiguration__details(event:Event, config?:config_modal):modal {
            if (config === null || config === undefined) {
                const name:string = browser.contextElement.lowName(),
                    mouseEvent:MouseEvent = event as MouseEvent,
                    element:HTMLElement = (name === "li" || name === "ul")
                        ? browser.contextElement
                        : browser.contextElement.getAncestor("li", "tag"),
                    div:HTMLElement = util.delay(),
                    box:modal = element.getAncestor("box", "class"),
                    agency:agentId = util.getAgent(box),
                    addresses:[string, fileType, string][] = file_select_addresses(element, "details"),
                    plural:string = (addresses.length === 1)
                        ? ""
                        : "s",
                    payloadModal:config_modal = {
                        agent: agency[0],
                        agentIdentity: true,
                        agentType: agency[2],
                        content: div,
                        height: 600,
                        inputs: ["close"],
                        left: mouseEvent.clientX,
                        read_only: agency[1],
                        single: true,
                        text_value: "",
                        title_supplement: `${addresses.length} item${plural}`,
                        top: (mouseEvent.clientY - 60 < 0)
                            ? 60
                            : mouseEvent.clientY - 60,
                        type: "details",
                        width: 500
                    },
                    modalInstance:modal = modal.content(payloadModal),
                    id:string = modalInstance.getAttribute("id"),
                    nameContext:string = browser.contextElement.lowName(),
                    menu:HTMLElement = document.getElementById("contextMenu"),
                    addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
                    agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
                    payloadNetwork:service_fileSystem = {
                        action: "fs-details",
                        agentRequest: agents[0],
                        agentSource: agents[1],
                        agentWrite: null,
                        depth: 0,
                        location: (function browser_content_context_details_addressList():string[] {
                            const output:string[] = [],
                                length:number = addresses.length;
                            let a:number = 0;
                            if (nameContext === "ul") {
                                return [addressField.value];
                            }
                            do {
                                output.push(addresses[a][0]);
                                a = a + 1;
                            } while (a < length);
                            return output;
                        }()),
                        name: id
                    };
                if (browser.loading === true) {
                    return;
                }
                browser.ui.modals[id].text_value = JSON.stringify(payloadNetwork.location);
                browser.send(payloadNetwork, "file-system");
                browser.configuration();
                browser.contextElement = null;
                if (menu !== null) {
                    menu.parentNode.removeChild(menu);
                }
                return modalInstance;
            }
            let modalInstance:modal = null;
            const agents:[fileAgent, fileAgent, fileAgent] = (function browser_init_modalDetails_agents():[fileAgent, fileAgent, fileAgent] {
                    config.content = util.delay();
                    modalInstance = modal.content(config);
                    return util.fileAgent(modalInstance, null, config.text_value);
                }()),
                payloadNetwork:service_fileSystem = {
                    action: "fs-details",
                    agentRequest: agents[0],
                    agentSource: agents[1],
                    agentWrite: null,
                    depth: 0,
                    location: JSON.parse(config.text_value) as string[],
                    name: config.id
                };
            browser.send(payloadNetwork, "file-system");
            return modalInstance;
        },

        "document": function browser_utilities_modalConfiguration_document(event:Event, config?:config_modal):modal {
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
        },

        "export": function browser_utilities_modalConfiguration_export(event:Event, config?:config_modal):modal {
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
            document.getElementById("menu").style.display = "none";
            payload_modal.content = modal.tools.textModal("Import/Export Settings", "", "export");
            modalItem =  modal.content(payload_modal);
            id = modalItem.getAttribute("id");
            payloadNetwork.location.push(`${id}:export-settings`);
            browser.send(payloadNetwork, "file-system");
            return modalItem;
        },

        "file-edit": function browser_utilities_modalConfiguration_fileEdit(event:Event, config?:config_modal):modal {
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
        },

        "file-navigate": modal_fileNavigate,

        "invite-ask": modal_inviteAsk,

        "media": function browser_utilities_modalConfiguration_media(event:Event):modal {
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
                text_value: mediaType,
                type: "media"
            });
        },

        "message": modal_message,

        "shares": modal_shares,

        "socket-map": function browser_utilities_modalConfiguration_socketMap(event:Event, config?:config_modal):modal {
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
        },

        "terminal": modal_terminal,

        "text-pad": function browser_utilities_modalConfiguration_textPad(event:Event, config?:config_modal):modal {
            const element:HTMLElement = (event === null)
                    ? null
                    : event.target as HTMLElement,
                titleText:string = (element === null)
                    ? "Text Pad"
                    : element.innerHTML,
                payload:config_modal = (config === undefined)
                    ? {
                        agent: browser.identity.hashDevice,
                        agentIdentity: false,
                        agentType: "device",
                        content: null,
                        id: (config === undefined)
                            ? null
                            : config.id,
                        inputs: ["close", "maximize", "minimize"],
                        read_only: false,
                        type: "text-pad",
                        width: 800
                    }
                    : config;
            let box:modal = null;
            payload.content = modal.tools.textModal(titleText, (config !== undefined && config.text_value !== undefined)
                ? config.text_value
                : "", "text-pad");
            if (titleText.indexOf("Base64 - ") === 0) {
                payload.content.getElementsByTagName("textarea")[0].style.whiteSpace = "normal";
            }
            document.getElementById("menu").style.display = "none";
            box = modal.content(payload);
            box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].onkeyup = modal.events.textTimer;
            return box;
        }
    }
};

export default modal_configuration;