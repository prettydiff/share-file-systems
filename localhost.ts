import browser from "./lib/browser/browser.js";
import context from "./lib/browser/context.js";
import fs from "./lib/browser/fs.js";
import getNodesByType from "./lib/browser/getNodesByType.js";
import invite from "./lib/browser/invite.js";
import modal from "./lib/browser/modal.js";
import network from "./lib/browser/network.js";
import settings from "./lib/browser/settings.js";
import share from "./lib/browser/share.js";
import systems from "./lib/browser/systems.js";
import util from "./lib/browser/util.js";
import webSocket from "./lib/browser/webSocket.js";

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
                localhost:HTMLElement = null,
                active:number = Date.now();
            const comments:Comment[] = document.getNodesByType(8),
                commentLength:number = comments.length,
                idleTime:number = 15000,
                applyLogin = function local_restore_applyLogin():void {
                    const login:HTMLElement = document.getElementById("login"),
                        button:HTMLButtonElement = login.getElementsByTagName("button")[0],
                        input:HTMLInputElement = login.getElementsByTagName("input")[0],
                        action = function local_restore_applyLogin_action():void {
                            if (input.value.replace(/\s+/, "") === "") {
                                input.focus();
                            } else {
                                browser.data.name = input.value;
                                share.addUser(`${input.value}@localhost`);
                                browser.pageBody.removeAttribute("class");
                                browser.loadTest = false;
                                network.storage("settings");
                                browser.loadTest = true;
                                loadComplete();
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
                    browser.pageBody.setAttribute("class", "login");
                    document.getElementById("login-input").onkeyup = handlerKeyboard;
                    button.onclick = handlerMouse;
                },
                loadComplete = function local_restore_complete():void {
                    const idleness = function local_restore_complete_idleness():void {
                            const time:number = Date.now();
                            if (time - active > idleTime && localhost !== null && browser.socket.readyState === 1) {
                                localhost.setAttribute("class", "idle");
                                network.heartbeat("idle", false);
                            }
                            setTimeout(local_restore_complete_idleness, idleTime);
                        },
                        activate = function load_restore_complete_activate():void {
                            if (localhost !== null) {
                                const status:string = localhost.getAttribute("class");
                                if (status !== "active" && browser.socket.readyState === 1) {
                                    localhost.setAttribute("class", "active");
                                    network.heartbeat("active", false);
                                }
                            }
                            active = Date.now();
                        },
                        login = function local_restore_complete_login(event:KeyboardEvent):void {
                            util.formKeys(event, util.login);
                        },
                        loginInputs:HTMLCollectionOf<HTMLElement> = document.getElementById("login").getElementsByTagName("input"),
                        loginInputsLength:number = loginInputs.length;
                    let a:number = 0;

                    do {
                        loginInputs[a].onkeyup = login;
                        a = a + 1;
                    } while (a < loginInputsLength);

                    browser.socket = webSocket();
                    setTimeout(idleness, idleTime);

                    // assign key default events
                    browser.content.onclick = context.menuRemove;
                    document.getElementById("menuToggle").onclick = util.menu;
                    document.getElementById("all-shares").onclick = share.modal;
                    document.getElementById("minimize-all").onclick = util.minimizeAll;
                    document.getElementById("user-delete").onclick = share.deleteList;
                    document.getElementById("user-invite").onclick = invite.start;
                    document.getElementById("systemLog").onclick = systems.modal;
                    document.getElementById("fileNavigator").onclick = fs.navigate;
                    document.getElementById("textPad").onclick = modal.textPad;
                    document.getElementById("export").onclick = modal.export;
                    document.getElementById("settings").onclick = settings.modal;
                    network.heartbeat("active", true);

                    // watch for local idleness
                    document.onclick = activate;
            
                    // building logging utility (systems log)
                    if (document.getElementById("systems-modal") === null) {
                        modal.create({
                            agent: "localhost",
                            content: systems.modalContent(),
                            inputs: ["close", "maximize", "minimize"],
                            read_only: false,
                            single: true,
                            status: "hidden",
                            title: document.getElementById("systemLog").innerHTML,
                            type: "systems",
                            width: 800
                        });
                        document.getElementById("systems-modal").style.display = "none";
                    }
            
                    // building settings modal
                    if (document.getElementById("settings-modal") === null) {
                        modal.create({
                            agent: "localhost",
                            content: settings.modalContent(),
                            inputs: ["close"],
                            read_only: false,
                            single: true,
                            status: "hidden",
                            title: document.getElementById("settings").innerHTML,
                            type: "settings"
                        });
                        document.getElementById("settings-modal").style.display = "none";
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
                                systems.message("errors", JSON.stringify({
                                    error:value[1],
                                    stack:value[2]
                                }), value[0]);
                                browser.messages.errors.push([value[0], value[1], value[2]]);
                            });
                        }
                    }

                    browser.loadTest = false;
                };
            do {
                cString = comments[a].substringData(0, comments[a].length);
                if (cString.indexOf("storage:") === 0) {
                    if (cString === "storage:{\"settings\":{},\"messages\":{},\"users\":{}}") {
                        applyLogin();
                    } else {
                        storage = JSON.parse(cString.replace("storage:", "").replace(/&amp;#x2d;/g, "&#x2d;").replace(/&#x2d;&#x2d;/g, "--"));
                        if (Object.keys(storage.settings).length < 1) {
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
                                };
                            let count:number = 0;
                            browser.data.name = storage.settings.name;
                            browser.users.localhost = storage.users.localhost
                            share.addUser(`${storage.settings.name}@localhost`);
                            localhost = document.getElementById("localhost");
                            
                            // restore shares
                            {
                                browser.users = storage.users;
                                const users:string[] = Object.keys(storage.users),
                                    userLength:number = users.length;
                                let a:number = 0;
                                if (userLength > 0) {
                                    do {
                                        if (users[a] !== "localhost") {
                                            browser.users[users[a]] = storage.users[users[a]];
                                            share.addUser(users[a]);
                                        }
                                        a = a + 1;
                                    } while (a < userLength);
                                }
                            }
                            
                            if (modalKeys.length < 1) {
                                loadComplete();
                            }

                            modalKeys.forEach(function local_restore_modalKeys(value:string) {
                                if (storage.settings.modals[value].type === "fileNavigate") {
                                    const agentStrings:string[] = storage.settings.modals[value].title.split(" - "),
                                        agent:string = agentStrings[agentStrings.length - 1],
                                        selection = function local_restore_modalKeys_selection(id:string):void {
                                            const box:HTMLElement = document.getElementById(id),
                                                modalData:ui_modal = browser.data.modals[id],
                                                keys:string[] = (modalData.selection === undefined)
                                                    ? []
                                                    : Object.keys(modalData.selection),
                                                fileList:HTMLElement = <HTMLElement>box.getElementsByClassName("fileList")[0],
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
                                                files:[HTMLElement, number, string] = (payload.dirs === "missing" || payload.dirs === "noShare" || payload.dirs === "readOnly")
                                                    ? (function local_restore_modalKeys_fsCallback_missing():[HTMLElement, number, string] {
                                                        const p:HTMLElement = document.createElement("p");
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
                                                    : fs.list(storage.settings.modals[value].text_value, payload),
                                                textValue:string = files[0].getAttribute("title");
                                            files[0].removeAttribute("title");
                                            if (responseText !== "") {
                                                if (agent === "localhost") {
                                                    callbackLocal(id, files, textValue);
                                                } else {
                                                    callbackRemote(id, files);
                                                }
                                            }
                                        },
                                        callbackLocal = function local_restore_modalKeys_fsCallbackLocal(id:string, files:[HTMLElement, number, string], textValue:String):void {
                                            storage.settings.modals[id].content = files[0];
                                            storage.settings.modals[id].id = id;
                                            storage.settings.modals[value].text_event = fs.text;
                                            if (storage.settings.modals[id].text_value !== "\\" && storage.settings.modals[id].text_value !== "/") {
                                                storage.settings.modals[id].text_value = textValue;
                                            }
                                            storage.settings.modals[id].text_event = fs.text;
                                            const box:HTMLElement = modal.create(storage.settings.modals[id]);
                                            fs.listFail(files[1], box);
                                            selection(id);
                                            z(value);
                                            box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = files[2];
                                        },
                                        callbackRemote = function local_restore_modalKeys_fsCallbackRemote(id:string, files:[HTMLElement, number, string]):void {
                                            const fsModal:HTMLElement = document.getElementById(id),
                                                body:HTMLElement = <HTMLElement>fsModal.getElementsByClassName("body")[0];
                                            fs.listFail(files[1], fsModal);
                                            body.innerHTML = "";
                                            body.appendChild(files[0]);
                                            selection(id);
                                            fsModal.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = files[2];
                                        };
                                    if (storage.settings.modals[value].search !== undefined && storage.settings.modals[value].search[0] === storage.settings.modals[value].text_value && storage.settings.modals[value].search[1] !== "") {
                                        let search:HTMLInputElement;
                                        const delay:HTMLElement = util.delay();
                                        storage.settings.modals[value].content = delay;
                                        storage.settings.modals[value].id = value;
                                        storage.settings.modals[value].text_event = fs.text;
                                        modal.create(storage.settings.modals[value]);
                                        search = document.getElementById(value).getElementsByClassName("fileSearch")[0].getElementsByTagName("input")[0];
                                        fs.search(null, search, function local_restore_modalKeys_searchCallback():void {
                                            selection(value);
                                        });
                                        z(value);
                                    } else if (agent === "localhost") {
                                        network.fs({
                                            action: "fs-directory",
                                            agent: agent,
                                            copyAgent: "",
                                            depth: 2,
                                            id: value,
                                            location: [storage.settings.modals[value].text_value],
                                            name: "",
                                            watch: "yes"
                                        }, callback, value);
                                    } else {
                                        const delay:HTMLElement = util.delay();
                                        storage.settings.modals[value].content = delay;
                                        storage.settings.modals[value].id = value;
                                        storage.settings.modals[value].text_event = fs.text;
                                        modal.create(storage.settings.modals[value]);
                                        z(value);
                                        network.fs({
                                            action: "fs-directory",
                                            agent: agent,
                                            copyAgent: "",
                                            depth: 2,
                                            id: value,
                                            location: [storage.settings.modals[value].text_value],
                                            name: "",
                                            watch: "yes"
                                        }, callback);
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
                                    const systemsModal:HTMLElement = document.getElementById("systems-modal");
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
                                    share.modal(null, storage.settings.modals[value].text_value, storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "share_delete") {
                                    share.deleteList(null, storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "invite-request") {
                                    invite.start(null, storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "settings") {
                                    browser.data.brotli = storage.settings.brotli;
                                    browser.data.hash = storage.settings.hash;
                                    storage.settings.modals[value].content = settings.modalContent();
                                    modal.create(storage.settings.modals[value]);
                                    const settingsModal:HTMLElement = document.getElementById("settings-modal"),
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