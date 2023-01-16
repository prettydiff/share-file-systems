
/* lib/browser/utilities/modal_configuration - A single location for storing all modal content configurations by modal type. */

import agent_management from "../content/agent_management.js";
import browser from "./browser.js";
import configuration from "../content/configuration.js";
import common from "../../common/common.js";
import context from "../content/context.js";
import file_browser from "../content/file_browser.js";
import media from "../content/media.js";
import message from "../content/message.js";
import modal from "./modal.js";
import network from "./network.js";
import share from "../content/share.js";
import terminal from "../content/terminal.js";
import util from "./util.js";

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
 *         "invite-accept": modal_open;
 *         "media": modal_open;
 *         "message": modal_open;
 *         "shares": modal_open;
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
            document.getElementById("menu").style.display = "none";
            if (config === null || config === undefined) {
                const content:HTMLElement = agent_management.content.menu("invite");
                config = {
                    agent: browser.data.hashDevice,
                    agentIdentity: false,
                    agentType: "device",
                    content: content,
                    inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
                    read_only: false,
                    single: true,
                    type: "agent-management",
                    width: 750
                };
                network.configuration();
            } else {
                config.agent = browser.data.hashDevice;
                config.agentIdentity = false;
                config.content = agent_management.content.menu("invite");
                config.single = true;
                config.type = "agent-management";
            }
            return modal.content(config);
        },

        "configuration": function browser_utilities_modalConfiguration_configuration(event:Event, config?:config_modal):modal {
            // building configuration modal
            if (document.getElementById("configuration-modal") === null) {
                const payloadModal:config_modal = (config === null || config === undefined)
                ? {
                    agent: browser.data.hashDevice,
                    agentIdentity: false,
                    agentType: "device",
                    closeHandler: modal.events.closeEnduring,
                    content: null,
                    read_only: false,
                    single: true,
                    status: "hidden",
                    type: "configuration"
                }
                : config;
                payloadModal.content = configuration.content();
                payloadModal.inputs = ["close"];
                delete payloadModal.width;
                return modal.content(payloadModal);
            }
            const conf:HTMLElement = document.getElementById("configuration-modal"),
                data:config_modal = browser.data.modals["configuration-modal"];
            modal.events.zTop(event as MouseEvent, conf);
            if (data.status === "hidden") {
                conf.style.display = "block";
            }
            data.status = "normal";
            document.getElementById("menu").style.display = "none";

        },

        "details": function browser_utilities_modalConfiguration__details(event:Event, config?:config_modal):modal {
            if (config === null || config === undefined) {
                const name:string = context.element.lowName(),
                    mouseEvent:MouseEvent = event as MouseEvent,
                    element:HTMLElement = (name === "li" || name === "ul")
                        ? context.element
                        : context.element.getAncestor("li", "tag"),
                    div:HTMLElement = util.delay(),
                    box:modal = element.getAncestor("box", "class"),
                    agency:agency = util.getAgent(box),
                    addresses:[string, fileType, string][] = util.selectedAddresses(element, "details"),
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
                    modalInstance:modal = modal.content(payloadModal);
                file_browser.content.detailsContent(modalInstance.getAttribute("id"));
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
                    location: JSON.parse(config.text_value),
                    name: config.id
                };
            network.send(payloadNetwork, "file-system");
            return modalInstance;
        },

        "document": function browser_utilities_modalConfiguration_document(event:Event, config?:config_modal, content?:HTMLElement):modal {
            const payload:config_modal = (config === null || config === undefined)
                ? {
                    agent: browser.data.hashDevice,
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
            if (content !== null && config !== undefined) {
                payload.content = content;
            }
            return modal.content(payload);
        },

        "export": function browser_utilities_modalConfiguration_export(event:Event, config?:config_modal):modal {
            const textArea:HTMLTextAreaElement = document.createElement("textarea"),
                label:HTMLElement = document.createElement("label"),
                span:HTMLElement = document.createElement("span"),
                payload:config_modal = {
                    agent: browser.data.hashDevice,
                    agentIdentity: false,
                    agentType: "device",
                    content: label,
                    inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
                    read_only: false,
                    single: true,
                    type: "export"
                };
            if (config !== null && config !== undefined) {
                payload.callback = config.callback;
            }
            document.getElementById("menu").style.display = "none";
            textArea.onblur = modal.events.textSave;
            textArea.value = JSON.stringify(browser.data);
            span.appendText("Import/Export Settings");
            label.appendChild(span);
            label.appendChild(textArea);
            label.setAttribute("class", "text-pad");
            return modal.content(payload);
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
                const element:HTMLElement = (context.element.lowName() === "li")
                        ? context.element
                        : context.element.getAncestor("li", "tag"),
                    mouseEvent:MouseEvent = event as MouseEvent,
                    contextElement:HTMLElement = event.target as HTMLElement,
                    type:contextType = (context.type !== "")
                        ? context.type
                        : (contextElement.innerHTML.indexOf("Base64") === 0)
                            ? "Base64"
                            : (contextElement.innerHTML.indexOf("File as Text") > 0)
                                ? "Edit"
                                : "Hash",
                    addresses:[string, fileType, string][] = util.selectedAddresses(element, "file-edit"),
                    box:modal = element.getAncestor("box", "class"),
                    length:number = addresses.length,
                    agency:agency = util.getAgent(box);
                let a:number = 0,
                    delay:HTMLElement;
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
                        delay = util.delay();
                        config.content = delay;
                        config.left = mouseEvent.clientX + (a * 10);
                        config.top = (mouseEvent.clientY - 60) + (a * 10);
                        config.text_value = addresses[a][0];
                        modalInstance = modal.content(config);
                        payloadNetwork.location.push(`${modalInstance.getAttribute("id")}:${addresses[a][0]}`);
                    }
                    a = a + 1;
                } while (a < length);
                network.send(payloadNetwork, "file-system");
                context.element = null;
                context.type = "";
                if (menu !== null) {
                    menu.parentNode.removeChild(menu);
                }
                return modalInstance;
            }
            config.content = util.delay();
            modalInstance = modal.content(config);
            agents = util.fileAgent(modalInstance, null, config.text_value);
            payloadNetwork.action = payloadNetwork.action = (config.title_supplement === "Edit")
                ? "fs-read"
                : `fs-${config.title_supplement.toLowerCase()}` as actionFile;
            payloadNetwork.agentRequest = {
                device: browser.data.hashDevice,
                modalAddress: "",
                share: "",
                user: browser.data.hashUser
            };
            payloadNetwork.agentSource = {
                device: (config.agentType === "device")
                    ? config.agent
                    : "",
                modalAddress: config.text_value,
                share: "",
                user: (config.agentType === "device")
                    ? browser.data.hashUser
                    : config.agent
            };
            payloadNetwork.location = [`${modalInstance.getAttribute("id")}:${config.text_value}`];
            network.send(payloadNetwork, "file-system");
            context.element = null;
            context.type = "";
            if (menu !== null) {
                menu.parentNode.removeChild(menu);
            }
            return modalInstance;
        },

        "file-navigate": function browser_utilities_modalConfiguration_fileNavigate(event:Event, config?:config_modal):modal {
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
                        : browser.data.hashDevice                    // when not coming from a modal (assume local device)
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
                readOnly:boolean = (agentName !== browser.data.hashDevice && config !== undefined && config.read_only === true),
                readOnlyString:string = (readOnly === true && agentType === "user")
                    ? "(Read Only)"
                    : "",
                // agents not abstracted in order to make use of a config object for state restoration
                payloadNetwork:service_fileSystem = {
                    action: "fs-directory",
                    agentRequest: {
                        device: browser.data.hashDevice,
                        modalAddress: "",
                        share: "",
                        user: browser.data.hashUser
                    },
                    agentSource: {
                        device: (agentType === "device")
                            ? agentName
                            : "",
                        modalAddress: location,
                        share: share,
                        user: (agentType === "device")
                            ? browser.data.hashUser
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
                    inputs: ["close", "maximize", "minimize", "text"],
                    read_only: readOnly,
                    selection: {},
                    share: share,
                    text_event: file_browser.events.text,
                    text_placeholder: "Optionally type a file system address here.",
                    text_value: location,
                    title_supplement: readOnlyString,
                    type: "file-navigate",
                    width: 800
                }
                : config;
            payloadModal.content = util.delay();
            payloadModal.footer = file_browser.content.footer(800);
            payloadModal.text_event = file_browser.events.text;
            document.getElementById("menu").style.display = "none";
            network.send(payloadNetwork, "file-system");
            return modal.content(payloadModal);
        },

        "invite-accept": function browser_utilities_modalConfiguration_inviteAccept(event:Event, config?:config_modal, content?:HTMLElement):modal {
            if (config === null || config === undefined) {
                const invitation:service_invite = JSON.parse(content.dataset.invitation),
                    agentInvite:agentInvite = invitation.agentRequest;
                config = {
                    agent: browser.data.hashDevice,
                    agentIdentity: false,
                    agentType: "device",
                    closeHandler: agent_management.events.inviteDecline,
                    content: content,
                    height: 300,
                    inputs: ["cancel", "confirm", "close"],
                    read_only: false,
                    share: browser.data.hashDevice,
                    title_supplement: (invitation.type === "device")
                        ? `Device ${agentInvite.nameDevice}`
                        : `User ${agentInvite.nameUser}`,
                    type: "invite-accept",
                    width: 500
                };
            }
            if (content !== null && content !== undefined) {
                config.content = content;
            }
            return modal.content(config);
        },

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

        "message": function browser_utilities_modalConfiguration_message(event:Event, config?:config_modal):modal {
            const text:string = (config === null)
                    ? ""
                    : config.text_value,
                placeholder:string = (config === null)
                    ? "text"
                    : config.text_placeholder,
                content:[HTMLElement, HTMLElement] = message.content.modal(text, placeholder);
            if (config === null) {
                const element:HTMLElement = event.target as HTMLElement,
                    div:HTMLElement = element.getAncestor("div", "tag"),
                    agent:string = div.dataset.hash,
                    agentType:agentType = div.getAttribute("class") as agentType,
                    identity:boolean = (agent !== browser.data.hashDevice && agent !== "");
                if (identity === true && browser[agentType][agent] === undefined) {
                    return null;
                }
                config = {
                    agent: agent,
                    agentIdentity: identity,
                    agentType: agentType,
                    content: null,
                    footer: null,
                    inputs: ["close", "maximize", "minimize"],
                    read_only: false,
                    text_placeholder: "text",
                    text_value: "",
                    title_supplement: (identity === true)
                        ? `${common.capitalize(agentType)} ${browser[agentType][agent].name}`
                        : `all ${agentType}s`,
                    type: "message",
                    width: 800
                };
            }
            config.content = content[0];
            config.footer = content[1];
            return modal.content(config);
        },

        "shares": function browser_utilities_modalConfiguration_modal(event:Event, config?:config_modal):modal {
            if (config === null || config === undefined) {
                const element:HTMLElement = event.target as HTMLElement,
                    classy:string = element.getAttribute("class"),
                    agent:string = (classy === null || classy === "device-all-shares" || classy === "user-all-shares")
                        ? ""
                        : element.getAttribute("id"),
                    agentType:agentType|"" = (classy === null)
                        ? ""
                        : (classy === "device-all-shares")
                            ? "device"
                            : (classy === "user-all-shares")
                                ? "user"
                                : element.dataset.agenttype as agentType;
                config = {
                    agent: agent,
                    agentIdentity: true,
                    agentType: agentType as agentType,
                    content: share.content(agent, agentType),
                    inputs: ["close", "maximize", "minimize"],
                    read_only: false,
                    type: "shares",
                    width: 800
                };
            } else {
                config.content = (config.agentType === "user" && config.agent === "")
                    ? share.content("", "user")
                    : share.content(config.agent, config.agentType);
                config.type = "shares";
                config.inputs = ["close", "maximize", "minimize"];
            }
            return modal.content(config);
        },

        "terminal": function browser_utilities_modalConfiguration_terminal(event:Event, config?:config_modal):modal {
            let box:modal = null;
            const content:[HTMLElement, HTMLElement] = terminal.content(),
                element:HTMLElement = (event === null)
                    ? null
                    : event.target as HTMLElement,
                ancestor:HTMLElement = (element === null)
                    ? null
                    : element.getAncestor("div", "tag"),
                shareAgent:string = (ancestor === null)
                    ? null
                    : ancestor.dataset.hash,
                agentName:string = (config === undefined)
                    ? (shareAgent === undefined || shareAgent === null)
                        ? browser.data.hashDevice
                        : shareAgent
                    : config.agent,
                agentType:agentType = (config === undefined)
                    ? (shareAgent === undefined || shareAgent === null)
                        ? "device"
                        : ancestor.getAttribute("class") as agentType
                    : config.agentType,
                payloadModal:config_modal = (config === undefined)
                    ? {
                        agent: agentName,
                        agentIdentity: true,
                        agentType: agentType,
                        content: content[0],
                        footer: content[1],
                        id: (config === undefined)
                            ? null
                            : config.id,
                        inputs: ["close", "maximize", "minimize"],
                        read_only: false,
                        socket: false,
                        text_value: "",
                        type: "terminal",
                        width: 800
                    }
                    : config,
                textArea:HTMLTextAreaElement = content[1].getElementsByTagName("textarea")[0];
            if (config !== undefined) {
                textArea.value = config.text_value;
                config.content = content[0];
                config.footer = content[1];
                if (typeof config.text_placeholder === "string" && config.text_placeholder !== "") {
                    config.footer.getElementsByClassName("terminal-cwd")[0].appendText(config.text_placeholder, true);
                }
            }
            document.getElementById("menu").style.display = "none";
            textArea.placeholder = "Type a command here. Press 'ins' key for file system auto-completion.";
            box = modal.content(payloadModal);
            terminal.tools.send(box, "", false);
            return box;
        },

        "text-pad": function browser_utilities_modalConfiguration_textPad(event:Event, config?:config_modal):modal {
            const element:HTMLElement = (event === null)
                    ? null
                    : event.target as HTMLElement,
                titleText:string = (element === null)
                    ? ""
                    : element.innerHTML,
                textArea:HTMLTextAreaElement = document.createElement("textarea"),
                label:HTMLElement = document.createElement("label"),
                span:HTMLElement = document.createElement("span"),
                payload:config_modal = (config === undefined)
                    ? {
                        agent: browser.data.hashDevice,
                        agentIdentity: false,
                        agentType: "device",
                        content: label,
                        id: (config === undefined)
                            ? null
                            : config.id,
                        inputs: ["close", "maximize", "minimize"],
                        read_only: false,
                        type: "text-pad",
                        width: 800
                    }
                    : config;
            let box:modal;
            span.appendText("Text Pad");
            label.setAttribute("class", "text-pad");
            label.appendChild(span);
            label.appendChild(textArea);
            if (config !== undefined) {
                if (config.text_value !== undefined) {
                    textArea.value = config.text_value;
                }
                payload.content = label;
            }
            textArea.onblur = modal.events.textSave;
            if (titleText.indexOf("Base64 - ") === 0) {
                textArea.style.whiteSpace = "normal";
            }
            document.getElementById("menu").style.display = "none";
            box = modal.content(payload);
            box.getElementsByClassName("body")[0].getElementsByTagName("textarea")[0].onkeyup = modal.events.textTimer;
            return box;
        }
    },
    titles: {
        "agent-management": {
            icon: "❤",
            menu: true,
            text: "Agent Management"
        },
        "configuration": {
            icon: "⚙",
            menu: true,
            text: "Configuration"
        },
        "details": {
            icon: "📂",
            menu: false,
            text: "Document"
        },
        "document": {
            icon: "🗎",
            menu: false,
            text: "Document"
        },
        "export": {
            icon: "⎆",
            menu: true,
            text: "Import/Export Settings"
        },
        "file-edit": {
            icon: "✎",
            menu: false,
            text: "File"
        },
        "file-navigate": {
            icon: "⌹",
            menu: true,
            text: "File Navigate"
        },
        "invite-accept": {
            icon: "❧",
            menu: false,
            text: "Invitation from"
        },
        "media": {
            icon: "💬",
            menu: false,
            text: "Message to"
        },
        "message": {
            icon: "☎",
            menu: false,
            text: "Text Message to"
        },
        "shares": {
            icon: "",
            menu: false,
            text: ""
        },
        "terminal": {
            icon: "›",
            menu: true,
            text: "Command Terminal"
        },
        "text-pad": {
            icon: "¶",
            menu: true,
            text: "Text Pad"
        }
    },
};

export default modal_configuration;