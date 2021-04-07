
/* lib/browser/localhost - The file that is sourced into the index.html file and generates the default browser experience. */

import browser from "./browser.js";
import configuration from "./configuration.js";
import context from "./context.js";
import fileBrowser from "./fileBrowser.js";
import dom from "./dom.js";
import invite from "./invite.js";
import message from "./message.js";
import modal from "./modal.js";
import network from "./network.js";
import remote from "./remote.js";
import share from "./share.js";
import util from "./util.js";
import webSocket from "./webSocket.js";

import disallowed from "../common/disallowed.js";

// intercept console.log in the browser and push its input to the terminal
(function browser_log():void {
    // eslint-disable-next-line
    const log:(...params:any[]) => void = console.log;
    // eslint-disable-next-line
    console.log = function (...params:any[]):void {
        network.log(...params);
        // eslint-disable-next-line
        params.forEach(function browser_low_params(value:any) {
            log(value);
        });
    };
}());

(function browser_init():void {

    window.onresize = util.fixHeight;
    document.getElementsByTagName("head")[0].appendChild(browser.style);

    // Extend the browser interface
    dom();
    disallowed(true);

    let settings:settingsItems,
        a:number = 0,
        cString:string = "",
        localDevice:Element = null,
        active:number = Date.now(),
        testBrowser:boolean = (location.href.indexOf("?test_browser") > 0),
        logInTest:boolean = false;
    const comments:Comment[] = <Comment[]>document.getNodesByType(8),
        commentLength:number = comments.length,
        idleTime:number = 15000,
        testBrowserReg:RegExp = (/^test_browser:/),
        testBrowserLoad = function browser_init_testBrowserLoad(delay:number):void {
            if (testBrowser === true && browser.testBrowser !== null) {
                window.onerror = remote.error;
                if (browser.testBrowser.action === "reset-request") {
                    network.testBrowser(null, -1, "reset-browser");
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
                payloadModal.content = configuration.modalContent();
                payloadModal.inputs = ["close"];
                payloadModal.title = document.getElementById("configuration").innerHTML;
                delete payloadModal.width;
                modal.create(payloadModal);
            }
        },
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
                        browser.data.nameUser = nameUser.value;
                        browser.data.nameDevice = nameDevice.value;
                        network.hashDevice(function browser_init_applyLogin_action_hash(hashes:hashAgent) {
                            browser.data.hashDevice = hashes.device;
                            browser.data.hashUser = hashes.user;
                            browser.device[hashes.device] = {
                                ipAll: browser.localNetwork.addresses,
                                ipSelected: "",
                                name: nameDevice.value,
                                port: browser.localNetwork.httpPort,
                                shares: {}
                            };
                            share.addAgent({
                                hash: hashes.device,
                                name: nameDevice.value,
                                save: false,
                                type: "device"
                            });
                            browser.pageBody.setAttribute("class", "default");
                            loadComplete();
                        });
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
            browser.loadFlag = false;
            defaultModals();
            nameUser.onkeyup = handlerKeyboard;
            nameDevice.onkeyup = handlerKeyboard;
            button.onclick = handlerMouse;
            webSocket(function browser_init_applyLogin_socket():void {
                testBrowserLoad(500);
            });
        },
        loadComplete = function browser_init_complete():void {
            const activate = function browser_init_complete_activate():void {
                    const idleness = function browser_init_complete_idleness():void {
                        const time:number = Date.now();
                        if (localDevice.getAttribute("class") === "active" && time - active > idleTime && localDevice !== null) {
                            localDevice.setAttribute("class", "idle");
                            network.heartbeat("idle", false);
                        }
                        setTimeout(browser_init_complete_idleness, idleTime);
                    };
                    idleness();
                    if (localDevice !== null) {
                        const status:string = localDevice.getAttribute("class");
                        if (status !== "active" && browser.socket.readyState === 1) {
                            const activeParent:Element = document.activeElement.parentNode as Element;
                            localDevice.setAttribute("class", "active");

                            // share interactions will trigger a heartbeat from the terminal service
                            if (activeParent === null || activeParent.getAttribute("class") !== "share") {
                                network.heartbeat("active", false);
                            }
                        }
                    }
                    active = Date.now();
                },
                shareAll = function browser_init_complete_shareAll(event:MouseEvent):void {
                    const element:Element = event.target as Element,
                        parent:Element = element.parentNode as Element,
                        classy:string = element.getAttribute("class");
                    if (parent.getAttribute("class") === "all-shares") {
                        share.modal("", "", null);
                    } else if (classy === "device-all-shares") {
                        share.modal("", "device", null);
                    } else if (classy === "user-all-shares") {
                        share.modal("", "user", null);
                    }
                },
                agentList:Element = document.getElementById("agentList"),
                allDevice:HTMLElement = agentList.getElementsByClassName("device-all-shares")[0] as HTMLElement,
                allUser:HTMLElement = agentList.getElementsByClassName("user-all-shares")[0] as HTMLElement,
                buttons:HTMLCollectionOf<HTMLButtonElement> = document.getElementById("menu").getElementsByTagName("button"),
                buttonsLength:number = buttons.length;
            let a:number = 0;
            util.fixHeight();

            if (browser.data.hashDevice === "") {
                // Terminate load completion dependent upon creation of device hash
                return;
            }

            if (browser.data.modalTypes.indexOf("message") > -1 && browser.message.length > 0) {
                const messageLength:number = browser.message.length;
                let messageIndex:number = 0;
                do {
                    if (browser.message[messageIndex].agentType === "device") {
                        if (browser.message[messageIndex].agentTo === browser.data.hashDevice) {
                            message.post(browser.message[messageIndex], "agentFrom");
                        } else {
                            message.post(browser.message[messageIndex], "agentTo");
                        }
                    } else if (browser.message[messageIndex].agentType === "user") {
                        if (browser.message[messageIndex].agentTo === browser.data.hashUser) {
                            message.post(browser.message[messageIndex], "agentFrom");
                        } else {
                            message.post(browser.message[messageIndex], "agentTo");
                        }
                    }
                    messageIndex = messageIndex + 1;
                } while (messageIndex < messageLength);
            }

            browser.loadFlag = false;
            localDevice = document.getElementById(browser.data.hashDevice);

            // watch for local idleness
            document.onclick = activate;
            document.onkeydown = activate;

            if (browser.data.hashDevice !== "" && document.getElementById("configuration-modal") === null) {
                defaultModals();
            }

            // assign key default events
            browser.content.onclick = context.menuRemove;
            document.getElementById("menuToggle").onclick = util.menu;
            agentList.getElementsByTagName("button")[0].onclick = shareAll;
            allDevice.onclick = shareAll;
            allUser.onclick = shareAll;
            document.getElementById("minimize-all").onclick = util.minimizeAll;
            document.getElementById("export").onclick = modal.export;
            document.getElementById("fileNavigator").onclick = fileBrowser.navigate;
            document.getElementById("configuration").onclick = configuration.modal;
            document.getElementById("textPad").onclick = modal.textPad;
            document.getElementById("agent-delete").onclick = share.deleteList;
            document.getElementById("agent-invite").onclick = invite.start;
            a = 0;
            do {
                buttons[a].onblur = util.menuBlur;
                a = a + 1;
            } while (a < buttonsLength);
            if (logInTest === true) {
                webSocket(function browser_init_loadComplete_socket():void {
                    activate();
                    testBrowserLoad(0);
                });
            } else {
                activate();
            }
        };
    do {
        cString = comments[a].substringData(0, comments[a].length);
        if (testBrowserReg.test(cString) === true) {
            const testString:string = cString.replace(testBrowserReg, ""),
                test = JSON.parse(testString);
            if (test.name === "refresh-complete") {
                return;
            } else if (test !== null) {
                browser.testBrowser = test;
            }
        } else if (cString.indexOf("settings:") === 0) {
            if (cString.indexOf("\"device\":{}") > 0) {
                applyLogin();
            } else {
                settings = JSON.parse(cString.replace("settings:", "").replace(/&amp;#x2d;/g, "&#x2d;").replace(/&#x2d;&#x2d;/g, "--"));
                if (settings.message !== undefined) {
                    browser.message = settings.message;
                }
                if (settings.configuration === undefined || Object.keys(settings.configuration).length < 1) {
                    applyLogin();
                } else {
                    let type:modalType,
                        count:number = 0;
                    const modalKeys:string[] = Object.keys(settings.configuration.modals),
                        indexes:[number, string][] = [],
                        // applies z-index to the modals in the proper sequence while restarting the value at 0
                        z = function browser_init_z(id:string):void {
                            count = count + 1;
                            indexes.push([settings.configuration.modals[id].zIndex, id]);
                            if (count === modalKeys.length) {
                                let cc:number = 0;
                                browser.data.zIndex = modalKeys.length;
                                indexes.sort(function browser_init_z_sort(aa:[number, string], bb:[number, string]):number {
                                    if (aa[0] < bb[0]) {
                                        return -1;
                                    }
                                    return 1;
                                });
                                do {
                                    if (settings.configuration.modals[indexes[cc][1]] !== undefined && document.getElementById(indexes[cc][1]) !== null) {
                                        settings.configuration.modals[indexes[cc][1]].zIndex = cc + 1;
                                        document.getElementById(indexes[cc][1]).style.zIndex = `${cc + 1}`;
                                    }
                                    cc = cc + 1;
                                } while (cc < modalKeys.length);
                                loadComplete();
                            }
                        },
                        restoreShares = function browser_init_restoreShares(type:agentType):void {
                            if (settings[type] === undefined) {
                                browser[type] = {};
                                return;
                            }
                            browser[type] = settings[type];
                            const list:string[] = Object.keys(settings[type]),
                                listLength:number = list.length;
                            let a:number = 0;
                            if (listLength > 0) {
                                do {
                                    share.addAgent({
                                        hash: list[a],
                                        name: browser[type][list[a]].name,
                                        save: false,
                                        type: type
                                    });
                                    a = a + 1;
                                } while (a < listLength);
                            }
                        },
                        modalDetails = function browser_init_modalDetails(id:string):void {
                            const modalItem:modal = settings.configuration.modals[id],
                            payloadNetwork:systemDataFile = {
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
                            network.fileBrowser(payloadNetwork, fileBrowser.details);
                        },
                        modalFile = function browser_init_modalFile(id:string):void {
                            const modalItem:modal = settings.configuration.modals[id],
                                agent:string = modalItem.agent,
                                delay:Element = util.delay(),
                                payload:systemDataFile = {
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
                                },
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
                                    const status:fileStatusMessage = JSON.parse(responseText),
                                        modal:Element = document.getElementById(status.address),
                                        body:Element = modal.getElementsByClassName("body")[0];
                                    body.innerHTML = "";
                                    body.appendChild(fileBrowser.list(settings.configuration.modals[status.address].text_value, status.fileList, status.message));
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
                                    network.fileBrowser(payload, directoryCallback);
                                }
                            };
                            modal.create(modalItem);
                            z(id);
                        },
                        modalInvite = function browser_init_modalInvite(id:string):void {
                            const modalItem:modal = settings.configuration.modals[id];
                            modalItem.callback = function browser_init_modalInvite_callback():void {
                                z(id);
                            };
                            invite.start(null, modalItem);
                        },
                        modalMessage = function browser_init_modalMessage(id:string):void {
                            const modalItem:modal = settings.configuration.modals[id];
                            modalItem.callback = function browser_init_modalMessage_callback():void {
                                z(id);
                            };
                            message.modal(modalItem);
                        },
                        modalSettings = function browser_init_modalSettings(id:string):void {
                            const modalItem:modal = settings.configuration.modals[id];
                            browser.data.brotli = settings.configuration.brotli;
                            browser.data.hashType = settings.configuration.hashType;
                            modalItem.callback = function browser_init_modalSettings_callback():void {
                                const inputs:HTMLCollectionOf<HTMLInputElement> = document.getElementById("configuration-modal").getElementsByTagName("input"),
                                    length:number = inputs.length;
                                let a:number = 0;
                                do {
                                    if (inputs[a].name.indexOf("color-scheme-") === 0 && inputs[a].value === settings.configuration.color) {
                                        inputs[a].click();
                                    } else if (inputs[a].name.indexOf("audio-") === 0 && (inputs[a].value === "off" && settings.configuration.audio === false) || (inputs[a].value === "on" && settings.configuration.audio === true)) {
                                        inputs[a].click();
                                    } else if (inputs[a].name === "brotli") {
                                        inputs[a].value = settings.configuration.brotli.toString();
                                    }
                                    a = a + 1;
                                } while (a < length);
                                z(id);
                            };
                            modalItem.content = configuration.modalContent();
                            modal.create(modalItem);
                        },
                        modalShares = function browser_init_modalShares(id:string):void {
                            const modalItem:modal = settings.configuration.modals[id],
                                agentType:agentType|"" = (modalItem.title.indexOf("All Shares") > -1)
                                ? ""
                                : modalItem.agentType;
                            modalItem.callback = function browser_init_modalShares_callback():void {
                                z(id);
                            };
                            share.modal(modalItem.agent, agentType, modalItem);
                        },
                        modalShareDelete = function browser_init_modalShareDelete(id:string):void {
                            const modalItem:modal = settings.configuration.modals[id];
                            modalItem.callback = function browser_init_modalShareDelete_callback():void {
                                z(id);
                            };
                            share.deleteList(null, modalItem);
                        },
                        modalText = function browser_init_modalText(id:string):void {
                            const textArea:HTMLTextAreaElement = document.createElement("textarea"),
                                label:Element = document.createElement("label"),
                                span:Element = document.createElement("span"),
                                modalItem:modal = settings.configuration.modals[id];
                            span.innerHTML = "Text Pad";
                            label.setAttribute("class", "textPad");
                            label.appendChild(span);
                            label.appendChild(textArea);
                            textArea.innerHTML = modalItem.text_value;
                            modalItem.content = label;
                            modal.create(modalItem);
                            z(id);
                        };
                    logInTest = true;
                    browser.pageBody.setAttribute("class", "default");
                    browser.data.colors = settings.configuration.colors;
                    browser.data.hashDevice = settings.configuration.hashDevice;
                    browser.data.hashUser = settings.configuration.hashUser;
                    browser.data.nameUser = settings.configuration.nameUser;
                    browser.data.nameDevice = settings.configuration.nameDevice;
                    browser.data.storage = settings.configuration.storage;
                    restoreShares("device");
                    restoreShares("user");

                    if (modalKeys.length < 1) {
                        loadComplete();
                    } else {
                        modalKeys.forEach(function browser_init_modalKeys(value:string) {
                            type = settings.configuration.modals[value].type;
                            if (type === "export" || type === "textPad") {
                                modalText(value);
                            } else if (type === "fileNavigate") {
                                modalFile(value);
                            } else if (type === "invite-request") {
                                modalInvite(value);
                            } else if (type === "message") {
                                modalMessage(value);
                            } else if (type === "configuration") {
                                modalSettings(value);
                            } else if (type === "shares") {
                                modalShares(value);
                            } else if (type === "share_delete") {
                                modalShareDelete(value);
                            } else if (type === "details") {
                                modalDetails(value);
                            }
                        });
                    }
                }
            }
        }
        a = a + 1;
    } while (a < commentLength);
}());