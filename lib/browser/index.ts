
/* lib/browser/index - The base JavaScript code that initiates the application in the browser. */

import agent_hash from "./utilities/agent_hash.js";
import agent_management from "./content/agent_management.js";
import agent_status from "./utilities/agent_status.js";
import browser from "./utilities/browser.js";
import configuration from "./content/configuration.js";
import file_browser from "./content/file_browser.js";
import global_events from "./content/global_events.js";
import dom from "./utilities/dom.js";
import media from "./content/media.js";
import message from "./content/message.js";
import modal from "./utilities/modal.js";
import network from "./utilities/network.js";
import remote from "./utilities/remote.js";
import share from "./content/share.js";
import tutorial from "./content/tutorial.js";
import util from "./utilities/util.js";
import webSocket from "./utilities/webSocket.js";

import disallowed from "../common/disallowed.js";



(function browser_init():void {

    {
        // intercept console.log in the browser and push its input to the terminal
        (function browser_log():void {
            // eslint-disable-next-line
            const log:(...params:unknown[]) => void = console.log;
            // eslint-disable-next-line
            console.log = function browser_log_logger(...params:unknown[]):void {
                // this condition prevents endless recursion against the http response text
                if (params[0] !== "browser log received") {
                    const error:string = new Error().stack;
                    params.forEach(function browser_low_logger_params(value:unknown, index:number, arr:unknown[]):void {
                        const element:HTMLElement = value as HTMLElement;
                        if (value !== null && value !== undefined && typeof element.nodeType === "number" && typeof element.parentNode === "object" && (/,"service":"log"\}$/).test(JSON.stringify(value)) === false) {
                            arr[index] = element.outerHTML;
                        }
                        log(value);
                    });
                    if (
                        params[0] === null ||
                        params[0] === undefined ||
                        (
                            error.indexOf("browser_network_send") < 0 &&
                            error.indexOf("browser_utilities_webSocket_sendWrapper_delay") < 0 &&
                            // prevent sending of verbose test automation comments
                            params[0].toString().indexOf("On browser receiving test index ") !== 0 &&
                            params[0].toString().indexOf("On browser sending results for test index ") !== 0
                        )
                    ) {
                        network.send(params, "log");
                    }
                }
            };
        }());

        window.onresize = util.fixHeight;
        document.getElementsByTagName("head")[0].appendChild(browser.style);

        // Extend the browser interface
        dom();
        disallowed(true);

        let logInTest:boolean = false,
            hashDevice:string = "",
            hashUser:string = "";
        const testBrowser:boolean = (location.href.indexOf("?test_browser") > 0),
            agentList:HTMLElement = document.getElementById("agentList"),
            stateItems:HTMLCollectionOf<HTMLInputElement> = document.getElementsByTagName("input"),
            state:browserState = {
                addresses: null,
                settings: null,
                test: null,
                logs: null
            },

            // execute test automation following a page reload
            testBrowserLoad = function browser_init_testBrowserLoad(delay:number):void {
                if (testBrowser === true && browser.testBrowser !== null) {
                    if (browser.testBrowser.action === "reset") {
                        remote.sendTest(null, -1, "reset-complete");
                    } else if (browser.testBrowser.action === "result") {
                        setTimeout(function browser_init_testBrowserLoad_delay():void {
                            remote.event(browser.testBrowser, true);
                        }, delay);
                    }
                }
            },

            // populate any modals that exist by default
            defaultModals = function browser_init_defaultModals():void {
                const payloadModal:config_modal = {
                    agent: browser.data.hashDevice,
                    agentIdentity: false,
                    agentType: "device",
                    closeHandler: modal.events.closeEnduring,
                    content: null,
                    read_only: false,
                    single: true,
                    status: "hidden",
                    title: null,
                    type: "configuration"
                };
                // building configuration modal
                if (document.getElementById("configuration-modal") === null) {
                    payloadModal.content = configuration.content();
                    payloadModal.inputs = ["close"];
                    payloadModal.title = document.getElementById("configuration").innerHTML;
                    delete payloadModal.width;
                    modal.content(payloadModal);
                }
            },

            // process the login form
            applyLogin = function browser_init_applyLogin():void {
                const login:HTMLElement = document.getElementById("login"),
                    button:HTMLButtonElement = login.getElementsByTagName("button")[0],
                    nameUser:HTMLInputElement = document.getElementById("login-user") as HTMLInputElement,
                    nameDevice:HTMLInputElement = document.getElementById("login-device") as HTMLInputElement,
                    action = function browser_init_applyLogin_action():void {
                        if (nameUser.value.replace(/\s+/, "") === "") {
                            nameUser.focus();
                        } else if (nameDevice.value.replace(/\s+/, "") === "") {
                            nameDevice.focus();
                        } else {
                            agent_hash.send(nameDevice, nameUser);
                        }
                    },
                    handlerKeyboard = function browser_init_applyLogin_handleKeyboard(event:KeyboardEvent):void {
                        if (event.key === "Enter") {
                            action();
                        }
                    },
                    handlerMouse = function browser_init_applyLogin_handleMouse():void {
                        action();
                    };

                defaultModals();
                nameUser.onkeyup = handlerKeyboard;
                nameDevice.onkeyup = handlerKeyboard;
                button.onclick = handlerMouse;
                testBrowserLoad(500);
            },

            // page initiation once state restoration completes
            loadComplete = function browser_init_complete():void {
                // change status to idle
                const allDevice:HTMLElement = agentList.getElementsByClassName("device-all-shares")[0] as HTMLElement,
                    allUser:HTMLElement = agentList.getElementsByClassName("user-all-shares")[0] as HTMLElement,
                    buttons:HTMLCollectionOf<HTMLButtonElement> = document.getElementById("menu").getElementsByTagName("button");
                let b:number = buttons.length;

                if (browser.data.hashDevice === "") {
                    // Terminate load completion dependent upon creation of device hash
                    return;
                }

                // populate text messages
                if (browser.data.modalTypes.indexOf("message") > -1) {
                    message.tools.populate("");
                }

                // loading data and modals is complete
                browser.loading = false;

                if (browser.data.hashDevice !== "" && document.getElementById("configuration-modal") === null) {
                    defaultModals();
                }

                // assign key default events
                browser.content.onclick                             = global_events.contextMenuRemove;
                document.getElementById("menuToggle").onclick       = global_events.menu;
                agentList.getElementsByTagName("button")[0].onclick = global_events.shareAll;
                allDevice.onclick                                   = global_events.shareAll;
                allUser.onclick                                     = global_events.shareAll;
                document.getElementById("minimize-all").onclick     = global_events.minimizeAll;
                document.getElementById("export").onclick           = global_events.modal.export;
                document.getElementById("fileNavigator").onclick    = global_events.modal.fileNavigate;
                document.getElementById("configuration").onclick    = global_events.modal.configuration;
                document.getElementById("terminal").onclick         = global_events.modal.terminal;
                document.getElementById("textPad").onclick          = global_events.modal.textPad;
                document.getElementById("agent-management").onclick = global_events.modal.agentManagement;
                document.onvisibilitychange                         = global_events.visibility;
                Notification.requestPermission();
                if (document.fullscreenEnabled === true) {
                    document.onfullscreenchange                   = global_events.fullscreenChange;
                    document.getElementById("fullscreen").onclick = global_events.fullscreen;
                } else {
                    const fullscreen:HTMLElement = document.getElementById("fullscreen");
                    fullscreen.parentNode.removeChild(fullscreen);
                }
                do {
                    b = b - 1;
                    buttons[b].onblur = global_events.menuBlur;
                } while (b > 0);

                // initiate webSocket and activity status
                agent_status.start();
                if (logInTest === true) {
                    testBrowserLoad(0);
                }
                if (location.href.indexOf("test_browser") < 0 && (browser.data.tutorial === true || location.href.indexOf("?tutorial") > 0)) {
                    tutorial();
                }
            },

            // on page load restore the application to exactly the way it was
            restoreState = function browser_init_restoreState():void {
                // state data
                let type:modalType,
                    count:number = 0;
                const modalKeys:string[] = Object.keys(state.settings.configuration.modals),
                    indexes:[number, string][] = [],
                    contentArea:HTMLElement = document.getElementById("content-area"),
                    // applies z-index to the modals in the proper sequence while restarting the value at 0
                    z = function browser_init_z(id:string):void {
                        count = count + 1;
                        if (id !== null) {
                            indexes.push([state.settings.configuration.modals[id].zIndex, id]);
                        }
                        if (count === modalKeys.length) {
                            let index:number = 0,
                                len:number = indexes.length,
                                uiModal:config_modal,
                                modalItem:HTMLElement = null;
                            browser.data.zIndex = modalKeys.length;
                            indexes.sort(function browser_init_z_sort(aa:[number, string], bb:[number, string]):number {
                                if (aa[0] < bb[0]) {
                                    return -1;
                                }
                                return 1;
                            });
                            // apply z-index - depth and overlapping order
                            do {
                                uiModal = state.settings.configuration.modals[indexes[index][1]];
                                modalItem = document.getElementById(indexes[index][1]);
                                if (uiModal !== undefined && modalItem !== null) {
                                    uiModal.zIndex = index + 1;
                                    modalItem.style.zIndex = `${index + 1}`;
                                }
                                index = index + 1;
                            } while (index < len);
                            loadComplete();
                        }
                    },
                    restoreShares = function browser_init_restoreShares(type:agentType):void {
                        if (state.settings[type] === undefined) {
                            browser[type] = {};
                            return;
                        }
                        browser[type] = state.settings[type];
                        const list:string[] = Object.keys(state.settings[type]),
                            listLength:number = list.length;
                        let a:number = 0;
                        if (listLength > 0) {
                            do {
                                agent_management.tools.addAgent({
                                    hash: list[a],
                                    name: browser[type][list[a]].name,
                                    type: type
                                });
                                a = a + 1;
                            } while (a < listLength);
                        }
                    },
                    modalConfiguration = function browser_init_modalConfiguration(id:string):void {
                        const modalItem:config_modal = state.settings.configuration.modals[id];
                        browser.data.brotli = state.settings.configuration.brotli;
                        browser.data.hashType = state.settings.configuration.hashType;
                        modalItem.callback = function browser_init_modalConfiguration_callback():void {
                            const inputs:HTMLCollectionOf<HTMLInputElement> = document.getElementById("configuration-modal").getElementsByTagName("input"),
                                length:number = inputs.length;
                            let a:number = 0;
                            do {
                                if (inputs[a].name.indexOf("color-scheme-") === 0 && inputs[a].value === state.settings.configuration.color) {
                                    inputs[a].click();
                                } else if (inputs[a].name.indexOf("audio-") === 0 && (inputs[a].value === "off" && state.settings.configuration.audio === false) || (inputs[a].value === "on" && state.settings.configuration.audio === true)) {
                                    inputs[a].click();
                                } else if (inputs[a].name === "brotli") {
                                    inputs[a].value = state.settings.configuration.brotli.toString();
                                }
                                a = a + 1;
                            } while (a < length);
                        };
                        modalItem.closeHandler = modal.events.closeEnduring;
                        modalItem.content = configuration.content();
                        modal.content(modalItem);
                        z(id);
                    },
                    modalDetails = function browser_init_modalDetails(id:string):void {
                        const modalItem:config_modal = state.settings.configuration.modals[id],
                            agents:[fileAgent, fileAgent, fileAgent] = (function browser_init_modalDetails_agents():[fileAgent, fileAgent, fileAgent] {
                                modalItem.content = util.delay();
                                return util.fileAgent(modal.content(modalItem), null, modalItem.text_value);
                            }()),
                            payloadNetwork:service_fileSystem = {
                                action: "fs-details",
                                agentRequest: agents[0],
                                agentSource: agents[1],
                                agentWrite: null,
                                depth: 0,
                                location: JSON.parse(modalItem.text_value),
                                name: id
                            };
                        network.send(payloadNetwork, "file-system");
                        z(id);
                    },
                    modalFile = function browser_init_modalFile(id:string):void {
                        const modalItem:config_modal = state.settings.configuration.modals[id],
                            delay:HTMLElement = util.delay(),
                            selection = function browser_init_modalFile_selection(id:string):void {
                                const box:HTMLElement = document.getElementById(id),
                                    modalData:config_modal = browser.data.modals[id],
                                    keys:string[] = (modalData.selection === undefined)
                                        ? []
                                        : Object.keys(modalData.selection),
                                    fileList:HTMLElement = box.getElementsByClassName("fileList")[0] as HTMLElement,
                                    list:HTMLCollectionOf<HTMLElement> = (fileList === undefined)
                                        ? null
                                        : fileList.getElementsByTagName("li"),
                                    length:number = (list === null)
                                        ? 0
                                        : list.length;
                                let b:number = 0,
                                    address:string;
                                if (keys.length > 0 && length > 0) {
                                    do {
                                        address = list[b].getElementsByTagName("label")[0].innerHTML;
                                        if (modalData.selection[address] !== undefined) {
                                            list[b].addClass(modalData.selection[address]);
                                            list[b].getElementsByTagName("input")[0].checked = true;
                                        }
                                        b = b + 1;
                                    } while (b < length);
                                }
                            };
                        modalItem.content = delay;
                        modalItem.footer  = file_browser.content.footer(modalItem.width);
                        modalItem.id = id;
                        modalItem.text_event = file_browser.events.text;
                        modalItem.callback = function browser_init_modalFile_callback():void {
                            if (modalItem.search !== undefined && modalItem.search[0] === modalItem.text_value && modalItem.search[1] !== "") {
                                let search:HTMLInputElement;
                                search = document.getElementById(id).getElementsByClassName("fileSearch")[0].getElementsByTagName("input")[0];
                                file_browser.events.search(null, search, function browser_init_modalFile_callback_searchCallback():void {
                                    selection(id);
                                });
                            } else {
                                const agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(modalItem.content, null, modalItem.text_value),
                                    action:actionFile = (modalItem.search[1] !== undefined && modalItem.search[0] !== "" && modalItem.search[1] !== "")
                                        ? "fs-search"
                                        : "fs-directory",
                                    payload:service_fileSystem = {
                                        action: action,
                                        agentRequest: agents[0],
                                        agentSource: agents[1],
                                        agentWrite: null,
                                        depth: 2,
                                        location: [modalItem.text_value],
                                        name: (action === "fs-search")
                                            ? modalItem.search[1]
                                            : `loadPage:${id}`
                                    };
                                network.send(payload, "file-system");
                            }
                        };
                        modal.content(modalItem);
                        z(id);
                    },
                    modalGeneric = function browser_init_modalGeneric(id:string):void {
                        const modalItem:config_modal = state.settings.configuration.modals[id];
                        modalItem.callback = function browser_init_modalGeneric_callback():void {
                            z(id);
                        };
                        if (modalItem.type === "agent-management") {
                            global_events.modal.agentManagement(null, modalItem);
                        } else if (modalItem.type === "export" || modalItem.type === "textPad") {
                            global_events.modal.textPad(null, modalItem);
                        } else if (modalItem.type === "message") {
                            message.content.modal(modalItem, modalItem.agentType, modalItem.agent);
                        } else if (modalItem.type === "shares") {
                            const agentType:agentType|"" = (modalItem.title.indexOf("All Shares") > -1)
                                ? ""
                                : modalItem.agentType;
                            share.tools.modal(modalItem.agent, agentType, modalItem);
                        } else if (modalItem.type === "terminal") {
                            global_events.modal.terminal(null, modalItem);
                        } else {
                            z(null);
                        }
                    },
                    modalMedia = function browser_init_modalMedia(id:string):void {
                        const p:HTMLElement = document.createElement("p"),
                            modalData:config_modal = state.settings.configuration.modals[id],
                            restore = function browser_init_modalMedia_restore(event:MouseEvent):void {
                                const element:HTMLElement = event.target;
                                body.onclick = null;
                                element.appendText("", true);
                                element.appendChild(media.content(modalData.text_value as mediaType, modalData.height, modalData.width));
                                element.setAttribute("class", "body");
                            };
                        let body:HTMLElement = null;
                        p.appendText("Click to restore video.");
                        modalData.content = p;
                        body = modal.content(modalData).getElementsByClassName("body")[0] as HTMLElement;
                        body.setAttribute("class", "body media-restore");
                        body.onclick = restore;
                        z(id);
                    };
                logInTest = true;
                browser.data.color = state.settings.configuration.color;
                browser.data.colors = state.settings.configuration.colors;
                browser.data.fileSort = state.settings.configuration.fileSort;
                browser.data.hashDevice = state.settings.configuration.hashDevice;
                browser.data.hashUser = state.settings.configuration.hashUser;
                browser.data.nameUser = state.settings.configuration.nameUser;
                browser.data.nameDevice = state.settings.configuration.nameDevice;
                browser.data.statusTime = state.settings.configuration.statusTime;
                browser.data.storage = state.settings.configuration.storage;
                browser.data.tutorial = state.settings.configuration.tutorial;
                browser.pageBody.setAttribute("class", browser.data.color);
                restoreShares("device");
                restoreShares("user");

                if (modalKeys.length < 1) {
                    loadComplete();
                } else {
                    modalKeys.forEach(function browser_init_modalKeys(value:string) {
                        type = state.settings.configuration.modals[value].type;
                        if (type === "fileNavigate") {
                            modalFile(value);
                        } else if (type === "configuration") {
                            modalConfiguration(value);
                        } else if (type === "details") {
                            modalDetails(value);
                        } else if (type === "media") {
                            modalMedia(value);
                        } else {
                            modalGeneric(value);
                        }
                    });
                }
            },

            // callback once the socket tunnel is operational
            socketCallback = function browser_init_socketCallback():void {
                if (hashUser === "") {
                    applyLogin();
                } else {
                    restoreState();
                }
            };
        // set state from artifacts supplied to the page
        if (stateItems[0].getAttribute("type") === "hidden") {
            state.addresses = JSON.parse(stateItems[0].value);
            state.settings = JSON.parse(stateItems[1].value);
            state.test = JSON.parse(stateItems[2].value);
            browser.terminalLogs = JSON.parse(stateItems[4].value);
            browser.projectPath = stateItems[5].value;
            if (state.settings.configuration !== undefined) {
                if (state.settings.configuration.hashDevice !== undefined) {
                    hashDevice = state.settings.configuration.hashDevice;
                }
                if (state.settings.configuration.hashUser !== undefined) {
                    hashUser = state.settings.configuration.hashUser;
                }
            }
        }

        // readjusting the visual appearance of artifacts in the DOM to fit the screen before they are visible to eliminate load drag from page repaint
        util.fixHeight();
        agentList.style.right = (function browser_init_scrollBar():string {
            // agent list is position:fixed, which is outside of parent layout, so I need to ensure it does not overlap the parent scrollbar
            let width:number = 0;
            const div:HTMLElement = document.createElement("div"),
                inner:HTMLElement = document.createElement("div");
            div.style.visibility = "hidden";
            div.style.overflow = "scroll";
            div.appendChild(inner);
            browser.pageBody.appendChild(div);
            width = (div.offsetWidth - inner.offsetWidth);
            browser.pageBody.removeChild(div);
            return `${(width / 10)}em`;
        }());

        browser.network = state.addresses;
        browser.loadComplete = loadComplete;
        browser.title        = stateItems[3].value;
        if (state.settings !== undefined && state.settings !== null && state.settings.message !== undefined) {
            browser.message = state.settings.message;
        }
        if (stateItems.length > 2 && stateItems[2].value !== "{}" && testBrowser === true) {
            // browser automation test
            if (state.test.test !== null && state.test.test.name === "refresh-complete") {
                return;
            }
            browser.testBrowser = state.test;
            webSocket.start(socketCallback, "test-browser");
        } else {
            webSocket.start(socketCallback, hashDevice);
        }
    }
}());