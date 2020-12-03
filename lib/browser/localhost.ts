
/* lib/browser/localhost - The file that is sourced into the index.html file and generates the default browser experience. */

import browser from "./browser.js";
import context from "./context.js";
import fileBrowser from "./fileBrowser.js";
import dom from "./dom.js";
import invite from "./invite.js";
import message from "./message.js";
import modal from "./modal.js";
import network from "./network.js";
import remote from "./remote.js";
import settings from "./settings.js";
import share from "./share.js";
import util from "./util.js";
import webSocket from "./webSocket.js";

(function browser_init():void {

    util.fixHeight();
    window.onresize = util.fixHeight;
    document.getElementsByTagName("head")[0].appendChild(browser.style);

    // Extend the browser interface
    dom();

    let storage:storageItems,
        a:number = 0,
        cString:string = "",
        localDevice:Element = null,
        active:number = Date.now(),
        testBrowser:boolean = (location.href.indexOf("?test_browser") > 0),
        loginFlag:boolean = false;
    const comments:Comment[] = <Comment[]>document.getNodesByType(8),
        commentLength:number = comments.length,
        idleTime:number = 15000,
        testBrowserReg:RegExp = (/^test_browser:/),
        testBrowserLoad = function browser_init_testBrowserLoad():void {
            if (testBrowser === true && browser.testBrowser !== null) {
                window.onerror = remote.error;
                if (browser.testBrowser.action === "reset-request") {
                    network.testBrowser(null, -1, "reset-browser");
                } else if (browser.testBrowser.action === "respond" || browser.testBrowser.action === "result") {
                    setTimeout(function browser_init_testBrowserLoad_delay():void {
                        remote.event(browser.testBrowser, true);
                    }, 500);
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
                type: "settings"
            };
            // building settings modal
            if (document.getElementById("settings-modal") === null) {
                payloadModal.content = settings.modalContent();
                payloadModal.inputs = ["close"];
                payloadModal.title = document.getElementById("settings").innerHTML;
                delete payloadModal.width;
                modal.create(payloadModal);
            }
        },
        applyLogin = function browser_init_applyLogin():void {
            const login:Element = document.getElementById("login"),
                button:HTMLButtonElement = login.getElementsByTagName("button")[0],
                nameUser:HTMLInputElement = <HTMLInputElement>document.getElementById("login-user"),
                nameDevice:HTMLInputElement = <HTMLInputElement>document.getElementById("login-device"),
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
                                ip: browser.localNetwork.ip,
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
                            browser.pageBody.removeAttribute("class");
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
            defaultModals();
            browser.pageBody.setAttribute("class", "login");
            nameUser.onkeyup = handlerKeyboard;
            nameDevice.onkeyup = handlerKeyboard;
            button.onclick = handlerMouse;
            webSocket(function browser_init_applyLogin_socket():void {
                testBrowserLoad();
            });
        },
        loadComplete = function browser_init_complete():void {
            const idleness = function browser_init_complete_idleness():void {
                    const time:number = Date.now(),
                        offline:HTMLCollectionOf<Element> = document.getElementsByClassName("offline");
                    if (offline.length < 1 && time - active > idleTime && localDevice !== null) {
                        localDevice.setAttribute("class", "idle");
                        network.heartbeat("idle", false);
                    }
                    setTimeout(browser_init_complete_idleness, idleTime);
                },
                activate = function browser_init_complete_activate():void {
                    if (localDevice !== null) {
                        const status:string = localDevice.getAttribute("class");
                        if (status !== "active" && browser.socket.readyState === 1) {
                            const activeParent:Element = <Element>document.activeElement.parentNode;
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
                    const element:Element = <Element>event.target,
                        parent:Element = <Element>element.parentNode,
                        classy:string = element.getAttribute("class");
                    if (parent.getAttribute("class") === "all-shares") {
                        share.modal("", "", null);
                    } else if (classy === "device-all-shares") {
                        share.modal("", "device", null);
                    } else if (classy === "user-all-shares") {
                        share.modal("", "user", null);
                    }
                },
                login = function browser_init_complete_login(event:KeyboardEvent):void {
                    util.formKeys(event, util.login);
                },
                loginInputs:HTMLCollectionOf<HTMLElement> = document.getElementById("login").getElementsByTagName("input"),
                loginInputsLength:number = loginInputs.length,
                agentList:Element = document.getElementById("agentList"),
                allDevice:HTMLElement = <HTMLElement>agentList.getElementsByClassName("device-all-shares")[0],
                allUser:HTMLElement = <HTMLElement>agentList.getElementsByClassName("user-all-shares")[0],
                buttons:HTMLCollectionOf<HTMLButtonElement> = document.getElementById("menu").getElementsByTagName("button"),
                buttonsLength:number = buttons.length;
            let a:number = 0;

            if (browser.data.hashDevice === "") {
                // Terminate load completion dependent upon creation of device hash
                return;
            }

            localDevice = document.getElementById(browser.data.hashDevice);

            do {
                loginInputs[a].onkeyup = login;
                a = a + 1;
            } while (a < loginInputsLength);

            // watch for local idleness
            document.onclick = activate;

            if (browser.data.hashDevice !== "" && document.getElementById("settings-modal") === null) {
                defaultModals();
            }

            // assign key default events
            browser.content.onclick = context.menuRemove;
            document.getElementById("menuToggle").onclick = util.menu;
            agentList.getElementsByTagName("button")[0].onclick = shareAll;
            allDevice.onclick = shareAll;
            allUser.onclick = shareAll;
            document.getElementById("minimize-all").onclick = util.minimizeAll;
            browser.menu.export.onclick = modal.export;
            browser.menu.fileNavigator.onclick = fileBrowser.navigate;
            browser.menu.settings.onclick = settings.modal;
            browser.menu.textPad.onclick = modal.textPad;
            browser.menu["agent-delete"].onclick = share.deleteList;
            browser.menu["agent-invite"].onclick = invite.start;
            a = 0;
            do {
                buttons[a].onblur = util.menuBlur;
                a = a + 1;
            } while (a < buttonsLength);

            browser.loadTest = false;

            if (loginFlag === true) {
                webSocket(function browser_init_applyLogin_socket():void {
                    activate();
                    idleness();
                    testBrowserLoad();
                });
            } else {
                activate();
                idleness();
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
        } else if (cString.indexOf("storage:") === 0) {
            if (cString.indexOf("\"device\":{}") > 0) {
                applyLogin();
            } else {
                storage = JSON.parse(cString.replace("storage:", "").replace(/&amp;#x2d;/g, "&#x2d;").replace(/&#x2d;&#x2d;/g, "--"));
                if (storage.settings === undefined || Object.keys(storage.settings).length < 1) {
                    applyLogin();
                } else {
                    const modalKeys:string[] = Object.keys(storage.settings.modals),
                        indexes:[number, string][] = [],
                        z = function browser_init_z(id:string) {
                            count = count + 1;
                            indexes.push([storage.settings.modals[id].zIndex, id]);
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
                                    if (storage.settings.modals[indexes[cc][1]] !== undefined && document.getElementById(indexes[cc][1]) !== null) {
                                        storage.settings.modals[indexes[cc][1]].zIndex = cc + 1;
                                        document.getElementById(indexes[cc][1]).style.zIndex = `${cc + 1}`;
                                    }
                                    cc = cc + 1;
                                } while (cc < modalKeys.length);
                                loadComplete();
                            }
                        },
                        restoreShares = function browser_init_restoreShares(type:agentType):void {
                            if (storage[type] === undefined) {
                                browser[type] = {};
                                return;
                            }
                            browser[type] = storage[type];
                            const list:string[] = Object.keys(storage[type]),
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
                        };
                    let count:number = 0;
                    loginFlag = true;
                    browser.data.colors = storage.settings.colors;
                    browser.data.nameUser = storage.settings.nameUser;
                    browser.data.nameDevice = storage.settings.nameDevice;
                    browser.data.hashDevice = storage.settings.hashDevice;
                    browser.data.hashUser = storage.settings.hashUser;
                    restoreShares("device");
                    restoreShares("user");

                    if (modalKeys.length < 1) {
                        loadComplete();
                    }

                    modalKeys.forEach(function browser_init_modalKeys(value:string) {
                        const modalItem:modal = storage.settings.modals[value];
                        if (modalItem.type === "fileNavigate") {
                            const agent:string = modalItem.agent,
                                payload:fileService = {
                                    action: "fs-directory",
                                    agent: agent,
                                    agentType: modalItem.agentType,
                                    copyAgent: "",
                                    copyType: "device",
                                    depth: 2,
                                    id: value,
                                    location: [modalItem.text_value],
                                    name: "",
                                    share: modalItem.share,
                                    watch: "yes"
                                },
                                selection = function browser_init_modalKeys_selection(id:string):void {
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
                                callback = function browser_init_modalKeys_fsCallback(responseText:string):void {
                                    // an empty response occurs when XHR delivers an HTTP status of not 200 and not 0, which probably means path not found
                                    const payload:fsRemote = (responseText === "")
                                            ? {
                                                dirs: "missing"
                                            }
                                            : JSON.parse(responseText),
                                        id:string = payload.id,
                                        files:[Element, number, string] = (payload.dirs === "missing" || payload.dirs === "noShare" || payload.dirs === "readOnly")
                                            ? (function browser_init_modalKeys_fsCallback_missing():[Element, number, string] {
                                                const p:Element = document.createElement("p");
                                                p.setAttribute("class", "error");
                                                if (payload.dirs === "missing") {
                                                    const local:string = (agent === browser.data.hashDevice)
                                                        ? "."
                                                        : " or remote user is offline.";
                                                    p.innerHTML = `Error 404: Requested location is not available${local}`;
                                                } else if (payload.dirs === "noShare"){
                                                    p.innerHTML = "Error 403: Forbidden. Requested location is likely not shared.";
                                                } else {
                                                    p.innerHTML = "Error 406: Not accepted. Read only shares cannot be modified.";
                                                }
                                                return [p, 0, ""];
                                            }())
                                            : fileBrowser.list(modalItem.text_value, payload);
                                    files[0].removeAttribute("title");
                                    if (responseText !== "") {
                                        const fsModal:Element = document.getElementById(id);
                                        if (fsModal === null) {
                                            return;
                                        }
                                        let body:Element = fsModal.getElementsByClassName("body")[0];
                                        fileBrowser.listFail(files[1], fsModal);
                                        body.innerHTML = "";
                                        body.appendChild(files[0]);
                                        selection(id);
                                        fsModal.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = files[2];
                                    }
                                };
                            if (modalItem.search !== undefined && modalItem.search[0] === modalItem.text_value && modalItem.search[1] !== "") {
                                let search:HTMLInputElement;
                                const delay:Element = util.delay();
                                modalItem.content = delay;
                                modalItem.id = value;
                                modalItem.text_event = fileBrowser.text;
                                modal.create(modalItem);
                                search = document.getElementById(value).getElementsByClassName("fileSearch")[0].getElementsByTagName("input")[0];
                                fileBrowser.search(null, search, function browser_init_modalKeys_searchCallback():void {
                                    selection(value);
                                });
                                z(value);
                            } else {
                                const delay:Element = util.delay();
                                modalItem.content = delay;
                                modalItem.id = value;
                                modalItem.text_event = fileBrowser.text;
                                modal.create(modalItem);
                                z(value);
                                network.fileBrowser(payload, callback);
                            }
                        } else if (modalItem.type === "textPad" || modalItem.type === "export") {
                            const textArea:HTMLTextAreaElement = document.createElement("textarea");
                            if (modalItem.type === "textPad") {
                                if (modalItem.text_value !== undefined) {
                                    textArea.value = modalItem.text_value;
                                }
                                textArea.onblur = modal.textSave;
                            } else {
                                textArea.value = JSON.stringify(storage.settings);
                            }
                            modalItem.content = textArea;
                            modalItem.id = value;
                            modal.create(modalItem);
                            z(value);
                        } else if (modalItem.type === "message") {
                            message.modal(modalItem);
                            z(value);
                        } else if (modalItem.type === "shares") {
                            const agentType:agentType|"" = (modalItem.title.indexOf("All Shares") > -1)
                                ? ""
                                : modalItem.agentType;
                            share.modal(modalItem.agent, agentType, modalItem);
                            z(value);
                        } else if (modalItem.type === "share_delete") {
                            share.deleteList(null, modalItem);
                            z(value);
                        } else if (modalItem.type === "invite-request") {
                            invite.start(null, modalItem);
                            z(value);
                        } else if (modalItem.type === "settings") {
                            browser.data.brotli = storage.settings.brotli;
                            browser.data.hashType = storage.settings.hashType;
                            modalItem.content = settings.modalContent();
                            modal.create(modalItem);
                            const settingsModal:Element = document.getElementById("settings-modal"),
                                inputs:HTMLCollectionOf<HTMLInputElement> = settingsModal.getElementsByTagName("input"),
                                length:number = inputs.length;
                            let a:number = 0;
                            do {
                                if (inputs[a].name.indexOf("color-scheme-") === 0 && inputs[a].value === storage.settings.color) {
                                    inputs[a].click();
                                } else if (inputs[a].name.indexOf("audio-") === 0 && (inputs[a].value === "off" && storage.settings.audio === false) || (inputs[a].value === "on" && storage.settings.audio === true)) {
                                    inputs[a].click();
                                } else if (inputs[a].name === "brotli") {
                                    inputs[a].value = storage.settings.brotli.toString();
                                }
                                a = a + 1;
                            } while (a < length);
                            z(value);
                        } else {
                            z(value);
                        }
                    });
                }
            }
        }
        a = a + 1;
    } while (a < commentLength);
}());