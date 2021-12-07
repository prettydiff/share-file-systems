
/* lib/browser/localhost - The file that is sourced into the index.html file and generates the default browser experience. */

import agent_management from "./utilities/agent_management.js";
import agent_status from "./utilities/agent_status.js";
import browser from "./browser.js";
import configuration from "./content/configuration.js";
import fileBrowser from "./fileBrowser.js";
import global_events from "./content/global_events.js";
import dom from "./utilities/dom.js";
import invite from "./invite.js";
import media from "./media.js";
import message from "./message.js";
import modal from "./modal.js";
import network from "./utilities/network.js";
import remote from "./utilities/remote.js";
import share from "./content/share.js";
import tutorial from "./content/tutorial.js";
import util from "./utilities/util.js";
import webSocket from "./utilities/webSocket.js";

import disallowed from "../common/disallowed.js";

// intercept console.log in the browser and push its input to the terminal
(function browser_log():void {
    // eslint-disable-next-line
    const log:(...params:unknown[]) => void = console.log;
    // eslint-disable-next-line
    console.log = function browser_log_logger(...params:unknown[]):void {
        // this condition prevents endless recursion against the http response text
        if (params[0] !== "browser log received") {
            params.forEach(function browser_low_logger_params(value:unknown, index:number, arr:unknown[]):void {
                const element:Element = value as Element;
                if (value !== null && value !== undefined && typeof element.nodeType === "number" && typeof element.parentNode === "object" && (/,"service":"log"\}$/).test(JSON.stringify(value)) === false) {
                    arr[index] = element.outerHTML;
                }
                log(value);
            });
            if (
                params[0] === null ||
                params[0] === undefined ||
                (new Error().stack.indexOf("browser_network_send") < 0 &&
                // prevent sending of verbose test automation comments
                params[0].toString().indexOf("On browser receiving test index ") !== 0 &&
                params[0].toString().indexOf("On browser sending results for test index ") !== 0)
            ) {
                network.send(params, "log", null);
            }
        }
    };
}());

(function browser_init():void {

    window.onresize = util.fixHeight;
    document.getElementsByTagName("head")[0].appendChild(browser.style);

    // Extend the browser interface
    dom();
    disallowed(true);

    let logInTest:boolean = false;
    const testBrowser:boolean = (location.href.indexOf("?test_browser") > 0),
        stateItems:HTMLCollectionOf<HTMLInputElement> = document.getElementsByTagName("input"),
        state:browserState = {
            addresses: JSON.parse(stateItems[0].value),
            settings: JSON.parse(stateItems[1].value),
            test: JSON.parse(stateItems[2].value)
        },
        testBrowserLoad = function browser_init_testBrowserLoad(delay:number):void {
            if (testBrowser === true && browser.testBrowser !== null) {
                if (browser.testBrowser.action === "reset-request") {
                    remote.sendTest(null, -1, "reset-browser");
                } else if (browser.testBrowser.action === "respond" || browser.testBrowser.action === "result") {
                    setTimeout(function browser_init_testBrowserLoad_delay():void {
                        remote.event(browser.testBrowser, true);
                    }, delay);
                }
            }
        },
        defaultModals = function browser_init_defaultModals():void {
            const payloadModal:modal = {
                agent: browser.data.hashDevice,
                agentType: "device",
                content: null,
                read_only: false,
                single: true,
                status: "hidden",
                title: "",
                type: "configuration"
            };
            // building configuration modal
            if (document.getElementById("configuration-modal") === null) {
                payloadModal.content = configuration.content();
                payloadModal.inputs = ["close"];
                payloadModal.title = document.getElementById("configuration").innerHTML;
                delete payloadModal.width;
                modal.create(payloadModal);
            }
        },

        // process the login form
        applyLogin = function browser_init_applyLogin():void {
            const login:Element = document.getElementById("login"),
                button:HTMLButtonElement = login.getElementsByTagName("button")[0],
                nameUser:HTMLInputElement = document.getElementById("login-user") as HTMLInputElement,
                nameDevice:HTMLInputElement = document.getElementById("login-device") as HTMLInputElement,
                action = function browser_init_applyLogin_action():void {
                    if (nameUser.value.replace(/\s+/, "") === "") {
                        nameUser.focus();
                    } else if (nameDevice.value.replace(/\s+/, "") === "") {
                        nameDevice.focus();
                    } else {
                        const callback = function browser_init_applyLogin_action_callback(responseText:string):void {
                            const hashes:service_hashAgent = JSON.parse(responseText).data;
                            browser.data.hashDevice = hashes.device;
                            browser.data.hashUser = hashes.user;
                            browser.device[hashes.device] = {
                                deviceData: hashes.deviceData,
                                ipAll: browser.localNetwork.addresses,
                                ipSelected: "",
                                name: nameDevice.value,
                                ports: {
                                    http: browser.localNetwork.httpPort,
                                    ws: browser.localNetwork.wsPort
                                },
                                shares: {},
                                status: "active"
                            };
                            agent_management.addAgent({
                                callback: function browser_init_applyLogin_action_callback_addAgentCallback():void {
                                    browser.pageBody.setAttribute("class", "default");
                                    loadComplete();
                                },
                                hash: hashes.device,
                                name: nameDevice.value,
                                type: "device"
                            });
                        };
                        browser.data.nameUser = nameUser.value;
                        browser.data.nameDevice = nameDevice.value;
                        network.send({
                            device: browser.data.nameDevice,
                            deviceData: null,
                            user: browser.data.nameUser
                        }, "hash-agent", callback);
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
            const agentList:Element = document.getElementById("agentList"),
                allDevice:HTMLElement = agentList.getElementsByClassName("device-all-shares")[0] as HTMLElement,
                allUser:HTMLElement = agentList.getElementsByClassName("user-all-shares")[0] as HTMLElement,
                buttons:HTMLCollectionOf<HTMLButtonElement> = document.getElementById("menu").getElementsByTagName("button");
            let b:number = buttons.length;
            util.fixHeight();

            if (browser.data.hashDevice === "") {
                // Terminate load completion dependent upon creation of device hash
                return;
            }

            // populate text messages
            if (browser.data.modalTypes.indexOf("message") > -1) {
                message.populate("");
            }

            // prevent scroll bar overlap
            document.getElementById("agentList").style.right = `${((browser.content.offsetWidth - browser.content.clientWidth) / 10)}em`;

            // loading data and modals is complete
            browser.loading = false;

            if (browser.data.hashDevice !== "" && document.getElementById("configuration-modal") === null) {
                defaultModals();
            }

            // assign key default events
            browser.content.onclick = global_events.contextMenuRemove;
            document.getElementById("menuToggle").onclick = global_events.menu;
            agentList.getElementsByTagName("button")[0].onclick = global_events.shareAll;
            allDevice.onclick = global_events.shareAll;
            allUser.onclick = global_events.shareAll;
            document.getElementById("minimize-all").onclick = global_events.minimizeAll;
            document.getElementById("export").onclick = modal.export;
            document.getElementById("fileNavigator").onclick = fileBrowser.navigate;
            document.getElementById("configuration").onclick = global_events.modal.configuration;
            document.getElementById("textPad").onclick = modal.textPad;
            document.getElementById("agent-delete").onclick = share.events.deleteList;
            document.getElementById("agent-invite").onclick = invite.start;
            if (document.fullscreenEnabled === true) {
                document.onfullscreenchange = global_events.fullscreenChange;
                document.getElementById("fullscreen").onclick = global_events.fullscreen;
            } else {
                const fullscreen:Element = document.getElementById("fullscreen");
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
            // state items
            if (stateItems[2].value !== "{}" && testBrowser === true) {
                // browser automation test
                if (state.test.test !== null && state.test.test.name === "refresh-complete") {
                    return;
                }
                browser.testBrowser = state.test;
            }
            browser.localNetwork = state.addresses;
            if (stateItems[1].value.indexOf(",\"device\":{}") > 0) {
                // storage object empty
                applyLogin();
            } else {

                // storage object
                if (state.settings.message !== undefined) {
                    browser.message = state.settings.message;
                }
                if (state.settings.configuration === undefined || Object.keys(state.settings.configuration).length < 1) {
                    applyLogin();
                } else {

                    // state data
                    let type:modalType,
                        count:number = 0;
                    const modalKeys:string[] = Object.keys(state.settings.configuration.modals),
                        indexes:[number, string][] = [],
                        // applies z-index to the modals in the proper sequence while restarting the value at 0
                        z = function browser_init_z(id:string):void {
                            count = count + 1;
                            if (id !== null) {
                                indexes.push([state.settings.configuration.modals[id].zIndex, id]);
                            }
                            if (count === modalKeys.length) {
                                let cc:number = 0,
                                    len:number = indexes.length;
                                browser.data.zIndex = modalKeys.length;
                                indexes.sort(function browser_init_z_sort(aa:[number, string], bb:[number, string]):number {
                                    if (aa[0] < bb[0]) {
                                        return -1;
                                    }
                                    return 1;
                                });
                                do {
                                    if (state.settings.configuration.modals[indexes[cc][1]] !== undefined && document.getElementById(indexes[cc][1]) !== null) {
                                        state.settings.configuration.modals[indexes[cc][1]].zIndex = cc + 1;
                                        document.getElementById(indexes[cc][1]).style.zIndex = `${cc + 1}`;
                                    }
                                    cc = cc + 1;
                                } while (cc < len);
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
                                    agent_management.addAgent({
                                        hash: list[a],
                                        name: browser[type][list[a]].name,
                                        type: type
                                    });
                                    a = a + 1;
                                } while (a < listLength);
                            }
                        },
                        modalConfiguration = function browser_init_modalConfiguration(id:string):void {
                            const modalItem:modal = state.settings.configuration.modals[id];
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
                            modalItem.content = configuration.content();
                            modal.create(modalItem);
                            z(id);
                        },
                        modalDetails = function browser_init_modalDetails(id:string):void {
                            const modalItem:modal = state.settings.configuration.modals[id],
                            payloadNetwork:service_fileSystem = {
                                action: "fs-details",
                                agent: {
                                    id: modalItem.agent,
                                    modalAddress: modalItem.text_value,
                                    share: modalItem.share,
                                    type: modalItem.agentType
                                },
                                depth: 0,
                                location: [modalItem.text_value],
                                name: id
                            };
                            modalItem.content = util.delay();
                            modal.create(modalItem);
                            network.send(payloadNetwork, "file-system", fileBrowser.details);
                        },
                        modalFile = function browser_init_modalFile(id:string):void {
                            const modalItem:modal = state.settings.configuration.modals[id],
                                agent:string = modalItem.agent,
                                delay:Element = util.delay(),
                                selection = function browser_init_modalFile_selection(id:string):void {
                                    const box:Element = document.getElementById(id),
                                        modalData:modal = browser.data.modals[id],
                                        keys:string[] = (modalData.selection === undefined)
                                            ? []
                                            : Object.keys(modalData.selection),
                                        fileList:Element = box.getElementsByClassName("fileList")[0],
                                        list:HTMLCollectionOf<Element> = (fileList === undefined)
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
                                                list[b].setAttribute("class", `${list[b].getAttribute("class")} ${modalData.selection[address]}`);
                                                list[b].getElementsByTagName("input")[0].checked = true;
                                            }
                                            b = b + 1;
                                        } while (b < length);
                                    }
                                },
                                directoryCallback = function browser_init_modalFile_callback_directoryCallback(responseText:string):void {
                                    if (responseText === "") {
                                        return;
                                    }
                                    const status:service_fileStatus = JSON.parse(responseText).data,
                                        modal:Element = document.getElementById(status.address),
                                        body:Element = modal.getElementsByClassName("body")[0];
                                    body.innerHTML = "";
                                    body.appendChild(fileBrowser.list(state.settings.configuration.modals[status.address].text_value, status.fileList, status.message));
                                    modal.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = status.message;
                                    selection(status.address);
                                };
                            modalItem.content = delay;
                            modalItem.id = id;
                            modalItem.text_event = fileBrowser.text;
                            modalItem.callback = function browser_init_modalFile_callback():void {
                                if (modalItem.search !== undefined && modalItem.search[0] === modalItem.text_value && modalItem.search[1] !== "") {
                                    let search:HTMLInputElement;
                                    search = document.getElementById(id).getElementsByClassName("fileSearch")[0].getElementsByTagName("input")[0];
                                    fileBrowser.search(null, search, function browser_init_modalFile_callback_searchCallback():void {
                                        selection(id);
                                    });
                                } else {
                                    const payload:service_fileSystem = {
                                        action: "fs-directory",
                                        agent: {
                                            id: agent,
                                            modalAddress: modalItem.text_value,
                                            share: modalItem.share,
                                            type: modalItem.agentType
                                        },
                                        depth: 2,
                                        location: [modalItem.text_value],
                                        name: `loadPage:${id}`
                                    };
                                    network.send(payload, "file-system", directoryCallback);
                                }
                            };
                            modal.create(modalItem);
                            z(id);
                        },
                        modalGeneric = function browser_init_modalGeneric(id:string):void {
                            const modalItem:modal = state.settings.configuration.modals[id];
                            modalItem.callback = function browser_init_modalGeneric_callback():void {
                                z(id);
                            };
                            if (modalItem.type === "invite-request") {
                                invite.start(null, modalItem);
                            } else if (modalItem.type === "message") {
                                message.modal(modalItem, modalItem.agentType, modalItem.agent);
                            } else if (modalItem.type === "share_delete") {
                                share.events.deleteList(null, modalItem);
                            } else {
                                z(null);
                            }
                        },
                        modalMedia = function browser_init_modalMedia(id:string):void {
                            const p:HTMLElement = document.createElement("p"),
                                modalData:modal = state.settings.configuration.modals[id],
                                restore = function browser_init_modalMedia_restore(event:MouseEvent):void {
                                    const element:Element = event.target as Element;
                                    body.onclick = null;
                                    element.removeChild(element.firstChild);
                                    element.appendChild(media.element(modalData.status_text as mediaType, modalData.height, modalData.width));
                                    element.setAttribute("class", "body");
                                };
                            let body:HTMLElement = null;
                            p.innerHTML = "Click to restore video.";
                            modalData.content = p;
                            body = modal.create(modalData).getElementsByClassName("body")[0] as HTMLElement;
                            body.setAttribute("class", "body media-restore");
                            body.onclick = restore;
                            z(id);
                        },
                        modalShares = function browser_init_modalShares(id:string):void {
                            const modalItem:modal = state.settings.configuration.modals[id],
                                agentType:agentType|"" = (modalItem.title.indexOf("All Shares") > -1)
                                ? ""
                                : modalItem.agentType;
                            modalItem.callback = function browser_init_modalShares_callback():void {
                                z(id);
                            };
                            share.tools.modal(modalItem.agent, agentType, modalItem);
                        },
                        modalText = function browser_init_modalText(id:string):void {
                            const modalItem:modal = state.settings.configuration.modals[id];
                            modal.textPad(null, modalItem);
                            z(id);
                        };
                    logInTest = true;
                    browser.pageBody.setAttribute("class", "default");
                    browser.data.colors = state.settings.configuration.colors;
                    browser.data.hashDevice = state.settings.configuration.hashDevice;
                    browser.data.hashUser = state.settings.configuration.hashUser;
                    browser.data.nameUser = state.settings.configuration.nameUser;
                    browser.data.nameDevice = state.settings.configuration.nameDevice;
                    browser.data.storage = state.settings.configuration.storage;
                    browser.data.tutorial = state.settings.configuration.tutorial;
                    restoreShares("device");
                    restoreShares("user");

                    if (modalKeys.length < 1) {
                        loadComplete();
                    } else {
                        modalKeys.forEach(function browser_init_modalKeys(value:string) {
                            type = state.settings.configuration.modals[value].type;
                            if (type === "export" || type === "textPad") {
                                modalText(value);
                            } else if (type === "fileNavigate") {
                                modalFile(value);
                            } else if (type === "configuration") {
                                modalConfiguration(value);
                            } else if (type === "shares") {
                                modalShares(value);
                            } else if (type === "details") {
                                modalDetails(value);
                            } else if (type === "media") {
                                modalMedia(value);
                            } else {
                                modalGeneric(value);
                            }
                        });
                    }
                }
            }
        };

    browser.localNetwork = state.addresses;
    webSocket.start(function browser_init_socket():void {
        restoreState();
    });
}());