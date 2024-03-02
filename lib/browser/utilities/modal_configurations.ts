
/* lib/browser/utilities/modal_configuration - A single location for storing all modal content configurations by modal type. */

import agent_delete from "./agent_delete.js";
import agent_management from "../content/agent_management.js";
import browser from "./browser.js";
import common from "../../common/common.js";
import configuration from "../content/configuration.js";
import file_select_addresses from "../utilities/file_select_addresses.js";
import media from "../content/media.js";
import modal from "./modal.js";
import modal_close from "./modal_close.js";
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
            config.confirmHandler = function browser_utilities_modalConfiguration_agentManagement_confirmHandler(event:MouseEvent):void {
                const box:HTMLElement = event.target.getAncestor("box", "class"),
                    section:HTMLElement = box.getElementsByClassName("section")[0] as HTMLElement,
                    inputs:HTMLCollectionOf<HTMLInputElement> = section.getElementsByTagName("input"),
                    firstInput:HTMLElement = box.getElementsByTagName("input")[0],
                    type:string = (function browser_content_agentManagement_confirm_type():string {
                        const radios:NodeListOf<HTMLInputElement> = document.getElementsByName(firstInput.getAttribute("name")) as NodeListOf<HTMLInputElement>;
                        let len:number = radios.length;
                        do {
                            len = len - 1;
                            if (radios[len].checked === true) {
                                return radios[len].value;
                            }
                        } while (len > 0);
                        return null;
                    }());
                let a:number = inputs.length;
                do {
                    a = a - 1;
                    if (inputs[a].value === "invite") {
                        break;
                    }
                } while (a > 0);
                if (type === "invite") {
                    let type:agentType,
                        ip:string,
                        port:string,
                        portNumber:number;
                    const element:HTMLButtonElement = event.target as HTMLButtonElement,
                        box:modal = element.getAncestor("box", "class"),
                        options:config_modal = browser.ui.modals[box.getAttribute("id")],
                        body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                        content:HTMLElement = body.getElementsByClassName("inviteAgent")[0] as HTMLElement,
                        input:HTMLElement = (function browser_content_agentManagement_confirmInvite_input():HTMLElement {
                            // value attainment and form validation
                            const inputs:HTMLCollectionOf<HTMLInputElement> = content.getElementsByTagName("input"),
                                length:number = inputs.length,
                                indexes:invite_indexes = {
                                    type: -1,
                                    ip: -1,
                                    port: -1
                                };
                            let a:number = 0,
                                parentNode:HTMLElement;
                            do {
                                parentNode = inputs[a].parentNode;
                                if (inputs[a].value === "device" || inputs[a].value === "user") {
                                    if (inputs[a].value === "device") {
                                        indexes.type = a;
                                    }
                                    if (inputs[a].checked === true) {
                                        type = inputs[a].value as agentType;
                                    }
                                } else if (parentNode.innerHTML.indexOf("IP Address") === 0) {
                                    indexes.ip = a;
                                    ip = inputs[a].value;
                                } else if (parentNode.innerHTML.indexOf("Port") === 0) {
                                    indexes.port = a;
                                    port = inputs[a].value;
                                }
                                a = a + 1;
                            } while (a < length);
                            if (type === undefined) {
                                return inputs[indexes.type];
                            }
                            if (ip === undefined || ip.replace(/\s+/, "") === "" || ((/(\d{1,3}\.){3}\d{1,3}/).test(ip) === false && (/([a-f0-9]{4}:)+/).test(ip) === false)) {
                                return inputs[indexes.ip];
                            }
                            if (port === undefined || port.replace(/^\s+$/, "") === "") {
                                port = "";
                                portNumber = (location.href.indexOf("https") === 0)
                                    ? browser.network.default.secure
                                    : browser.network.default.unsecure;
                            } else {
                                portNumber = Number(port);
                                if (isNaN(portNumber) === true || portNumber < 0 || portNumber > 65535) {
                                    return inputs[indexes.port];
                                }
                            }
                            return null;
                        }()),
                        saved:invite_saved = {
                            ip: ip,
                            message: content.getElementsByTagName("textarea")[0].value.replace(/"/g, "\\\""),
                            port: port,
                            type: type
                        },
                        userData:userData = common.userData(browser.agents.device, type, browser.identity.hashDevice),
                        invitation:service_invite = {
                            action: "invite-start",
                            agentRequest: {
                                devices: null,
                                hashUser: "",
                                ipAll: userData[1],
                                ipSelected: "",
                                modal: options.id,
                                nameUser: browser.identity.nameUser,
                                port: browser.network.port,
                                secret: "",
                                session: "",
                                shares: userData[0]
                            },
                            agentSource: {
                                devices: null,
                                hashUser: "",
                                ipAll: null,
                                ipSelected: ip,
                                modal: "",
                                nameUser: "",
                                port: portNumber,
                                secret: "",
                                session: "",
                                shares: null
                            },
                            message: saved.message,
                            status: "invited",
                            type: type
                        };
                    options.text_value = JSON.stringify(saved);
                    browser.configuration();
                    if (input !== null) {
                        const p:HTMLElement = input.parentNode.parentNode,
                            warning:HTMLElement = document.createElement("p"),
                            strong:HTMLElement = document.createElement("strong");
                        p.setAttribute("class", "warning");
                        input.focus();
                        strong.appendText("Please select an invitation type.");
                        warning.appendChild(strong);
                        warning.setAttribute("class", "inviteWarning");
                        p.parentNode.appendChild(warning);
                        return;
                    }
                    content.style.display = "none";
                    if (content.getElementsByClassName("error").length > 0) {
                        content.removeChild(content.getElementsByClassName("error")[0]);
                    }
                    body.appendChild(util.delay());
                    browser.send(invitation, "invite");
                } else if (type === "edit_names") {
                    const target:HTMLElement = event.target,
                        box:modal = target.getAncestor("box", "class"),
                        boxes:HTMLCollectionOf<HTMLDivElement> = document.getElementsByClassName("box") as HTMLCollectionOf<HTMLDivElement>,
                        modify:HTMLElement = box.getElementsByClassName("modify-agents")[0] as HTMLElement,
                        inputs:HTMLCollectionOf<HTMLInputElement> = modify.getElementsByTagName("input"),
                        flags:flagList = {
                            device: false,
                            user: false
                        },
                        modifyService:service_agentManagement = {
                            action: "rename",
                            agents: {
                                device: {},
                                user: {}
                            },
                            agentFrom: browser.identity.hashDevice,
                            identity: null
                        },
                        modifyModals = function browser_content_agentManagement_confirmModify_modifyModals(agent:string, type:agentType, name:string):void {
                            const typeString:string = `${common.capitalize(type)}, `;
                            let boxLen:number = boxes.length,
                                button:HTMLElement = null,
                                text:string = "";
                            do {
                                boxLen = boxLen - 1;
                                if (boxes[boxLen].dataset.agent === agent && boxes[boxLen].dataset.agenttype === type) {
                                    button = boxes[boxLen].getElementsByTagName("button")[0];
                                    text = button.innerHTML;
                                    text = text.slice(0, text.indexOf(typeString) + typeString.length) + name;
                                    button.appendText(text);
                                }
                            } while (boxLen > 0);
                        };
                    let len:number = inputs.length,
                        agent:string = "",
                        name:string = "",
                        type:agentType = null,
                        value:string = "";
                    do {
                        len = len - 1;
                        agent = inputs[len].dataset.agent;
                        type = inputs[len].dataset.type as agentType;
                        name = browser.agents[type][agent].name;
                        value = inputs[len].value;
                        if (value !== name) {
                            flags[type] = true;
                            browser.agents[type][agent].name = value;
                            document.getElementById(agent).lastChild.textContent = ` ${value}`;
                            modifyModals(agent, type, value);
                            modifyService.agents[type][agent] = browser.agents[type][agent];
                        }
                    } while (len > 0);
                    if (flags.user === true || flags.device === true) {
                        browser.send(modifyService, "agent-management");
                        browser.configuration();
                    }
                } else if (type === "delete") {
                    const body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
                        list:HTMLCollectionOf<Element> = body.getElementsByClassName("delete-agents")[0].getElementsByTagName("li"),
                        manage:service_agentManagement = {
                            action: "delete",
                            agentFrom: browser.identity.hashDevice,
                            agents: {
                                device: {},
                                user: {}
                            },
                            identity: null
                        };
                    let a:number = list.length,
                        count:number = 0,
                        input:HTMLInputElement,
                        type:agentType,
                        subtitle:HTMLElement,
                        hash:string,
                        parent:HTMLElement;

                    // put the deleted agents into a list
                    do {
                        a = a - 1;
                        input = list[a].getElementsByTagName("input")[0];
                        if (input.checked === true) {
                            hash = input.value;
                            type = input.dataset.type as agentType;
                            parent = document.getElementById(hash).parentNode;
                            if (list[a].parentNode.childNodes.length < 2) {
                                subtitle = document.createElement("p");
                                subtitle.appendText(`No ${type}s to delete.`);
                                subtitle.setAttribute("class", "summary");
                                list[a].parentNode.parentNode.insertBefore(subtitle, list[a].parentNode);
                                list[a].parentNode.parentNode.removeChild(list[a].parentNode);
                            } else {
                                list[a].parentNode.removeChild(list[a]);
                            }
                            manage.agents[type][hash] = browser.agents[type][hash];
                            parent.parentNode.removeChild(parent);
                            agent_delete(hash, type);
                            count = count + 1;
                        }
                    } while (a > 0);
                    if (count < 1) {
                        return;
                    }
                    browser.send(manage, "agent-management");
                    //share_update("");
                    browser.configuration();
                }
                if (inputs[a].value === "invite" && inputs[a].checked === true) {
                    return;
                }
                modal_close(event);
            };
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
            payload_modal.confirmHandler = function browser_utilities_modal_importSettings(event:MouseEvent):void {
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