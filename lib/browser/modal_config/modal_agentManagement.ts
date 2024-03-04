
/* lib/browser/modal_config/modal_agentManagement - Modal configuration for agent management modal type. */

import agent_delete from "../utilities/agent_delete.js";
import agent_management from "../content/agent_management.js";
import browser from "../utilities/browser.js";
import common from "../../common/common.js";
import modal from "../utilities/modal.js";
import modal_close from "../utilities/modal_close.js";
import util from "../utilities/util.js";

// cspell: words agenttype

const modal_agentManagement =  function browser_modalConfig_agentManagement(event:Event, config?:config_modal):modal {
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
    config.confirmHandler = function browser_modalConfig_agentManagement_confirmHandler(event:MouseEvent):void {
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
                input:HTMLElement = (function browser_modalConfig_agentManagement_confirmInvite_input():HTMLElement {
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
                modifyModals = function browser_modalConfig_agentManagement_confirmModify_modifyModals(agent:string, type:agentType, name:string):void {
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
};

export default modal_agentManagement;