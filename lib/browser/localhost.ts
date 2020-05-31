
/* lib/browser/localhost - The file that is sourced into the index.html file and generates the default browser experience. */

import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import getNodesByType from "./dom.js";
import invite from "./invite.js";
import modal from "./modal.js";
import network from "./network.js";
import settings from "./settings.js";
import share from "./share.js";
import systems from "./systems.js";
import util from "./util.js";
import webSocket from "./webSocket.js";

(function local():void {

    util.fixHeight();
    window.onresize = util.fixHeight;
    browser.style.type = "text/css";
    document.getElementsByTagName("head")[0].appendChild(browser.style);

    /* Restore state and assign events */
    (function local_load():void {

        // getNodesByType
        getNodesByType();

        // restore state
        (function local_restore():void {
            let storage:any,
                a:number = 0,
                cString:string = "",
                localDevice:Element = null,
                active:number = Date.now();
            const comments:Comment[] = document.getNodesByType(8),
                commentLength:number = comments.length,
                idleTime:number = 15000,
                defaultModals = function local_restore_defaultModals():void {
                    const payloadModal:ui_modal = {
                        agent: browser.data.hashDevice,
                        agentType: "device",
                        content: null,
                        read_only: false,
                        single: true,
                        status: "hidden",
                        title: "",
                        type: "systems"
                    };

                    // building logging utility (systems log)
                    if (document.getElementById("systems-modal") === null) {
                        payloadModal.content = systems.modalContent();
                        payloadModal.inputs = ["close"];
                        payloadModal.title = document.getElementById("systemLog").innerHTML;
                        payloadModal.type = "systems";
                        payloadModal.width = 800;
                        modal.create(payloadModal);
                        document.getElementById("systems-modal").style.display = "none";
                    }
                    // building settings modal
                    if (document.getElementById("settings-modal") === null) {
                        payloadModal.content = settings.modalContent();
                        payloadModal.inputs = ["close"];
                        payloadModal.title = document.getElementById("settings").innerHTML;
                        payloadModal.type = "settings";
                        delete payloadModal.width;
                        modal.create(payloadModal);
                        document.getElementById("settings-modal").style.display = "none";
                    }
                },
                applyLogin = function local_restore_applyLogin():void {
                    const login:Element = document.getElementById("login"),
                        button:HTMLButtonElement = login.getElementsByTagName("button")[0],
                        nameUser:HTMLInputElement = <HTMLInputElement>document.getElementById("login-user"),
                        nameDevice:HTMLInputElement = <HTMLInputElement>document.getElementById("login-device"),
                        action = function local_restore_applyLogin_action():void {
                            if (nameUser.value.replace(/\s+/, "") === "") {
                                nameUser.focus();
                            } else if (nameDevice.value.replace(/\s+/, "") === "") {
                                nameDevice.focus();
                            } else {
                                browser.data.nameUser = nameUser.value;
                                browser.data.nameDevice = nameDevice.value;
                                network.hashDevice(function local_restore_applyLogin_action_hash(hashes:hashUser) {
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
                                        save: true,
                                        type: "device"
                                    });
                                    browser.pageBody.removeAttribute("class");
                                    browser.loadTest = false;
                                    network.storage("device");
                                    network.storage("settings");
                                    browser.loadTest = true;
                                    loadComplete();
                                });
                            }
                        },
                        handlerKeyboard = function local_restore_applyLogin_button(event:KeyboardEvent):void {
                            if (event.keyCode === 13) {
                                action();
                            }
                        },
                        handlerMouse = function local_restore_applyLogin_button():void {
                            action();
                        };
                    defaultModals();
                    browser.pageBody.setAttribute("class", "login");
                    nameUser.onkeyup = handlerKeyboard;
                    nameDevice.onkeyup = handlerKeyboard;
                    button.onclick = handlerMouse;
                },
                loadComplete = function local_restore_complete():void {
                    const idleness = function local_restore_complete_idleness():void {
                            const time:number = Date.now();
                            if (time - active > idleTime && localDevice !== null && browser.socket.readyState === 1) {
                                localDevice.setAttribute("class", "idle");
                                network.heartbeat("idle", "", {});
                            }
                            setTimeout(local_restore_complete_idleness, idleTime);
                        },
                        activate = function local_restore_complete_activate():void {
                            if (localDevice !== null) {
                                const status:string = localDevice.getAttribute("class");
                                if (status !== "active" && browser.socket.readyState === 1) {
                                    localDevice.setAttribute("class", "active");
                                    network.heartbeat("active", "", {});
                                }
                            }
                            active = Date.now();
                        },
                        shareAll = function local_restore_complete_shareAll(event:MouseEvent):void {
                            const element:Element = <Element>event.srcElement || <Element>event.target,
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
                        login = function local_restore_complete_login(event:KeyboardEvent):void {
                            util.formKeys(event, util.login);
                        },
                        loginInputs:HTMLCollectionOf<HTMLElement> = document.getElementById("login").getElementsByTagName("input"),
                        loginInputsLength:number = loginInputs.length,
                        agentList:Element = document.getElementById("agentList"),
                        allDevice:HTMLElement = <HTMLElement>agentList.getElementsByClassName("device-all-shares")[0],
                        allUser:HTMLElement = <HTMLElement>agentList.getElementsByClassName("user-all-shares")[0];
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

                    browser.socket = webSocket();
                    setTimeout(idleness, idleTime);

                    // assign key default events
                    browser.content.onclick = context.menuRemove;
                    document.getElementById("menuToggle").onclick = util.menu;
                    agentList.getElementsByTagName("button")[0].onclick = shareAll;
                    allDevice.onclick = shareAll;
                    allUser.onclick = shareAll;
                    document.getElementById("minimize-all").onclick = util.minimizeAll;
                    document.getElementById("user-delete").onclick = share.deleteList;
                    document.getElementById("user-invite").onclick = invite.start;
                    document.getElementById("systemLog").onclick = systems.modal;
                    document.getElementById("fileNavigator").onclick = fs.navigate;
                    document.getElementById("textPad").onclick = modal.textPad;
                    document.getElementById("export").onclick = modal.export;
                    document.getElementById("settings").onclick = settings.modal;
                    activate();

                    // watch for local idleness
                    document.onclick = activate;

                    if (browser.data.hashDevice !== "" && (document.getElementById("settings-modal") === null || document.getElementById("systems-modal") === null)) {
                        defaultModals();
                    }

                    // systems log messages
                    if (storage !== undefined && storage.messages !== undefined) {
                        if (storage.messages.status !== undefined && storage.messages.status.length > 0) {
                            storage.messages.status.forEach(function local_restore_statusEach(value:messageList):void {
                                systems.message("status", value[1], value[0]);
                                browser.messages.status.push([value[0], value[1]]);
                            });
                        }
                        if (storage.messages.users !== undefined && storage.messages.users.length > 0) {
                            storage.messages.users.forEach(function local_restore_usersEach(value:messageList):void {
                                systems.message("users", value[1], value[0]);
                                browser.messages.users.push([value[0], value[1]]);
                            });
                        }
                        if (storage.messages.errors !== undefined && storage.messages.errors.length > 0) {
                            storage.messages.errors.forEach(function local_restore_errorsEach(value:messageListError):void {
                                const error:messageError = {
                                    error:value[1],
                                    stack:value[2]
                                };
                                systems.message("errors", JSON.stringify(error), value[0]);
                                browser.messages.errors.push([value[0], value[1], value[2]]);
                            });
                        }
                    }

                    browser.loadTest = false;
                };
            do {
                cString = comments[a].substringData(0, comments[a].length);
                if (cString.indexOf("storage:") === 0) {
                    if (cString.indexOf("\"device\":{}") > 0) {
                        applyLogin();
                    } else {
                        storage = JSON.parse(cString.replace("storage:", "").replace(/&amp;#x2d;/g, "&#x2d;").replace(/&#x2d;&#x2d;/g, "--"));
                        if (storage.settings === undefined || Object.keys(storage.settings).length < 1) {
                            applyLogin();
                        } else {
                            const modalKeys:string[] = Object.keys(storage.settings.modals),
                                indexes:[number, string][] = [],
                                z = function local_restore_z(id:string) {
                                    count = count + 1;
                                    indexes.push([storage.settings.modals[id].zIndex, id]);
                                    if (count === modalKeys.length) {
                                        let cc:number = 0;
                                        browser.data.zIndex = modalKeys.length;
                                        indexes.sort(function local_restore_z_sort(aa:[number, string], bb:[number, string]):number {
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
                                restoreShares = function local_restore_restoreShares(type:agentType):void {
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
                            browser.data.colors = storage.settings.colors;
                            restoreShares("device");
                            restoreShares("user");
                            browser.data.nameUser = storage.settings.nameUser;
                            browser.data.nameDevice = storage.settings.nameDevice;
                            browser.data.hashDevice = storage.settings.hashDevice;
                            browser.data.hashUser = storage.settings.hashUser;

                            if (modalKeys.length < 1) {
                                loadComplete();
                            }

                            modalKeys.forEach(function local_restore_modalKeys(value:string) {
                                if (storage.settings.modals[value].type === "fileNavigate") {
                                    const agent:string = storage.settings.modals[value].agent,
                                        payload:fileService = {
                                            action: "fs-directory",
                                            agent: agent,
                                            agentType: storage.settings.modals[value].agentType,
                                            copyAgent: "",
                                            copyType: "device",
                                            depth: 2,
                                            id: value,
                                            location: [storage.settings.modals[value].text_value],
                                            name: "",
                                            watch: "yes"
                                        },
                                        selection = function local_restore_modalKeys_selection(id:string):void {
                                            const box:Element = document.getElementById(id),
                                                modalData:ui_modal = browser.data.modals[id],
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
                                        callback = function local_restore_modalKeys_fsCallback(responseText:string, agent:string):void {
                                            // an empty response occurs when XHR delivers an HTTP status of not 200 and not 0, which probably means path not found
                                            const payload:fsRemote = (responseText === "")
                                                    ? {
                                                        dirs: "missing"
                                                    }
                                                    : JSON.parse(responseText),
                                                id:string = payload.id,
                                                files:[Element, number, string] = (payload.dirs === "missing" || payload.dirs === "noShare" || payload.dirs === "readOnly")
                                                    ? (function local_restore_modalKeys_fsCallback_missing():[Element, number, string] {
                                                        const p:Element = document.createElement("p");
                                                        p.setAttribute("class", "error");
                                                        if (payload.dirs === "missing") {
                                                            p.innerHTML = "Error 404: Requested location is not available or remote user is offline.";
                                                        } else if (payload.dirs === "noShare"){
                                                            p.innerHTML = "Error 403: Forbidden. Requested location is likely not shared.";
                                                        } else {
                                                            p.innerHTML = "Error 406: Not accepted. Read only shares cannot be modified.";
                                                        }
                                                        return [p, 0, ""];
                                                    }())
                                                    : fs.list(storage.settings.modals[value].text_value, payload);
                                            files[0].removeAttribute("title");
                                            if (responseText !== "") {
                                                const fsModal:Element = document.getElementById(id);
                                                if (fsModal === null) {
                                                    return;
                                                }
                                                let body:Element = fsModal.getElementsByClassName("body")[0];
                                                fs.listFail(files[1], fsModal);
                                                body.innerHTML = "";
                                                body.appendChild(files[0]);
                                                selection(id);
                                                fsModal.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = files[2];
                                            }
                                        };
                                    if (storage.settings.modals[value].search !== undefined && storage.settings.modals[value].search[0] === storage.settings.modals[value].text_value && storage.settings.modals[value].search[1] !== "") {
                                        let search:HTMLInputElement;
                                        const delay:Element = util.delay();
                                        storage.settings.modals[value].content = delay;
                                        storage.settings.modals[value].id = value;
                                        storage.settings.modals[value].text_event = fs.text;
                                        modal.create(storage.settings.modals[value]);
                                        search = document.getElementById(value).getElementsByClassName("fileSearch")[0].getElementsByTagName("input")[0];
                                        fs.search(null, search, function local_restore_modalKeys_searchCallback():void {
                                            selection(value);
                                        });
                                        z(value);
                                    } else {
                                        const delay:Element = util.delay();
                                        storage.settings.modals[value].content = delay;
                                        storage.settings.modals[value].id = value;
                                        storage.settings.modals[value].text_event = fs.text;
                                        modal.create(storage.settings.modals[value]);
                                        z(value);
                                        network.fs(payload, callback);
                                    }
                                } else if (storage.settings.modals[value].type === "textPad" || storage.settings.modals[value].type === "export") {
                                    const textArea:HTMLTextAreaElement = document.createElement("textarea");
                                    if (storage.settings.modals[value].type === "textPad") {
                                        if (storage.settings.modals[value].text_value !== undefined) {
                                            textArea.value = storage.settings.modals[value].text_value;
                                        }
                                        textArea.onblur = modal.textSave;
                                    } else {
                                        textArea.value = JSON.stringify(storage.settings);
                                    }
                                    storage.settings.modals[value].content = textArea;
                                    storage.settings.modals[value].id = value;
                                    modal.create(storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "systems") {
                                    storage.settings.modals[value].content = systems.modalContent();
                                    modal.create(storage.settings.modals[value]);
                                    const systemsModal:Element = document.getElementById("systems-modal");
                                    let button:HTMLButtonElement;
                                    if (storage.settings.modals[value].text_value === "status") {
                                        button = <HTMLButtonElement>systemsModal.getElementsByClassName("status")[0];
                                        button.click();
                                    } else if (storage.settings.modals[value].text_value === "users") {
                                        button = <HTMLButtonElement>systemsModal.getElementsByClassName("users")[0];
                                        button.click();
                                    } else if (storage.settings.modals[value].text_value === "errors") {
                                        button = <HTMLButtonElement>systemsModal.getElementsByClassName("errors")[0];
                                        button.click();
                                    }
                                    if (storage.settings.modals[value].status === "normal") {
                                        document.getElementById("systems-modal").style.display = "block";
                                    }
                                    z(value);
                                } else if (storage.settings.modals[value].type === "shares") {
                                    const agentType:agentType|"" = (storage.settings.modals[value].title.indexOf("All Shares") > -1)
                                        ? ""
                                        : storage.settings.modals[value].agentType;
                                    share.modal(storage.settings.modals[value].agent, agentType, storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "share_delete") {
                                    share.deleteList(null, storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "invite-request") {
                                    invite.start(null, storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "settings") {
                                    browser.data.brotli = storage.settings.brotli;
                                    browser.data.hashType = storage.settings.hashType;
                                    storage.settings.modals[value].content = settings.modalContent();
                                    modal.create(storage.settings.modals[value]);
                                    const settingsModal:Element = document.getElementById("settings-modal"),
                                        inputs:HTMLCollectionOf<HTMLInputElement> = settingsModal.getElementsByTagName("input"),
                                        length:number = inputs.length;
                                    let a:number = 0;
                                    do {
                                        if (inputs[a].name.indexOf("color-scheme-") === 0 && inputs[a].value === storage.settings.color) {
                                            inputs[a].click();
                                        } else if (inputs[a].name.indexOf("audio-") === 0 && inputs[a].value === "off" && storage.settings.audio === false) {
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
    }());
}());