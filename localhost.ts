import browser from "./lib/browser/browser.js";
import context from "./lib/browser/context.js";
import fs from "./lib/browser/fs.js";
import getNodesByType from "./lib/browser/getNodesByType.js";
import modal from "./lib/browser/modal.js";
import network from "./lib/browser/network.js";
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

        // system modal that contains logging data
        const systemsBox:HTMLElement = (function local_systems():HTMLElement {
            const systemsElement:HTMLElement = document.createElement("div");
            let ul:HTMLElement = document.createElement("ul"),
                li:HTMLElement = document.createElement("li"),
                button:HTMLButtonElement = document.createElement("button");
            ul.setAttribute("class", "tabs");
            button.innerHTML = "⎔ System";
            button.setAttribute("class", "status active");
            button.onclick = systems.tabs;
            li.appendChild(button);
            ul.appendChild(li);
            li = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "⎋ Users";
            button.setAttribute("class", "users");
            button.onclick = systems.tabs;
            li.appendChild(button);
            ul.appendChild(li);
            li = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "⌁ Errors";
            button.setAttribute("class", "errors");
            button.onclick = systems.tabs;
            li.appendChild(button);
            ul.appendChild(li);
            systemsElement.appendChild(ul);
            ul = document.createElement("ul");
            ul.setAttribute("id", "system-status");
            ul.setAttribute("class", "messageList active");
            systemsElement.appendChild(ul);
            ul = document.createElement("ul");
            ul.setAttribute("id", "system-users");
            ul.setAttribute("class", "messageList");
            systemsElement.appendChild(ul);
            ul = document.createElement("ul");
            ul.setAttribute("id", "system-errors");
            ul.setAttribute("class", "messageList");
            systemsElement.appendChild(ul);
            return systemsElement;
        }());

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
                                util.addUser(`${input.value}@localhost`);
                                browser.pageBody.removeAttribute("class");
                                browser.loadTest = false;
                                network.settings();
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
                    const idleness = function local_restore_idleness():void {
                        const time:number = Date.now();
                        if (time - active > idleTime && localhost !== null && browser.socket.readyState === 1) {
                            localhost.setAttribute("class", "idle");
                            network.heartbeat("idle", false);
                        }
                        setTimeout(local_restore_idleness, idleTime);
                    };
                    browser.socket = webSocket();
                    setTimeout(idleness, idleTime);

                    // assign key default events
                    browser.content.onclick = context.menuRemove;
                    document.getElementById("all-shares").onclick = function local_restore_complete_sharesAll(event:MouseEvent):void {
                        modal.shares(event, "", null);
                    };
                    document.getElementById("invite-user").onclick = util.inviteStart;
                    document.getElementById("login-input").onkeyup = util.login;
                    document.getElementById("menuToggle").onclick = util.menu;
                    document.getElementById("systemLog").onclick = modal.systems;
                    document.getElementById("fileNavigator").onclick = fs.navigate;
                    document.getElementById("textPad").onclick = modal.textPad;
                    document.getElementById("export").onclick = modal.export;
                    network.heartbeat("active", true);
            
                    // determine if keyboard control keys are held
                    document.onkeydown = function load_restore_complete_keydown(event:KeyboardEvent):void {
                        const key:number = event.keyCode;
                        if (key === 16) {
                            browser.characterKey = `${browser.characterKey.replace(/-?shift/, "")}-shift`;
                        } else if (key === 17 || key === 224) {
                            browser.characterKey = `control-${browser.characterKey.replace(/control-?/, "")}`;
                        } else if (key === 18) {
                            browser.characterKey = `${browser.characterKey.replace(/-?alt/, "")}-alt`;
                        }
                        browser.characterKey = browser.characterKey.replace(/^-/, "").replace(/-$/, "").replace("alt-shift", "shift-alt");
                        if (localhost !== null && browser.socket.readyState === 1) {
                            const status:string = localhost.getAttribute("class");
                            if (status !== "active") {
                                localhost.setAttribute("class", "active");
                                network.heartbeat("active", false);
                            }
                        }
                        active = Date.now();
                    };
                    document.onkeyup = util.keyup;

                    // watch for local idleness
                    document.onclick = function load_restore_complete_click():void {
                        if (localhost !== null) {
                            const status:string = localhost.getAttribute("class");
                            if (status !== "active" && browser.socket.readyState === 1) {
                                localhost.setAttribute("class", "active");
                                network.heartbeat("active", false);
                            }
                        }
                        active = Date.now();
                    };
            
                    // building logging utility (systems log)
                    if (document.getElementById("systems-modal") === null) {
                        modal.create({
                            agent: "localhost",
                            content: systemsBox,
                            inputs: ["close", "maximize", "minimize"],
                            single: true,
                            title: "",
                            type: "systems",
                            width: 800
                        });
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
                            util.addUser(`${storage.settings.name}@localhost`);
                            localhost = document.getElementById("localhost");
                            
                            // restore shares
                            {
                                browser.users = storage.users;
                                const users:string[] = Object.keys(storage.users),
                                    userLength:number = users.length;
                                let a:number = 0;
                                do {
                                    if (users[a] !== "localhost") {
                                        browser.users[users[a]] = storage.users[users[a]];
                                        util.addUser(users[a]);
                                    }
                                    a = a + 1;
                                } while (a < userLength);
                            }
                            
                            if (modalKeys.length < 1) {
                                loadComplete();
                            }
                            modalKeys.forEach(function local_restore_modalKeys(value:string) {
                                if (storage.settings.modals[value].type === "fileNavigate") {
                                    const agentStrings:string[] = storage.settings.modals[value].title.split(" - "),
                                        agent:string = agentStrings[agentStrings.length - 1],
                                        callback = function local_restore_modalKeys_fsCallback(responseText:string, agent:string):void {
                                            // an empty response occurs when XHR delivers an HTTP status of not 200 and not 0, which probably means path not found
                                            const payload:fsRemote = JSON.parse(responseText),
                                                id:string = payload.id,
                                                files:[HTMLElement, number] = (payload.dirs === "missing")
                                                    ? (function local_restore_modalKeys_fsCallback_missing():[HTMLElement, number] {
                                                        const p:HTMLElement = document.createElement("p");
                                                        p.setAttribute("class", "error");
                                                        p.innerHTML = "Error 404: Requested location is no longer available or remote user is offline.";
                                                        return [p, 0];
                                                    }())
                                                    : fs.list(storage.settings.modals[value].text_value, payload),
                                                textValue:string = files[0].getAttribute("title");
                                            files[0].removeAttribute("title");
                                            if (agent === "localhost") {
                                                callbackLocal(id, files, textValue);
                                            } else {
                                                callbackRemote(id, files);
                                            }
                                        },
                                        callbackLocal = function local_restore_modalKeys_fsCallbackLocal(id:string, files:[HTMLElement, number], textValue:String):void {
                                            storage.settings.modals[id].content = files[0];
                                            storage.settings.modals[id].id = id;
                                            if (storage.settings.modals[id].text_value !== "\\" && storage.settings.modals[id].text_value !== "/") {
                                                storage.settings.modals[id].text_value = textValue;
                                            }
                                            storage.settings.modals[id].text_event = fs.text;
                                            const box:HTMLElement = modal.create(storage.settings.modals[id]);
                                            fs.listFail(files[1], box);
                                            z(id);
                                            if (storage.settings.modals[id].status === "maximized") {
                                                const button:HTMLButtonElement = <HTMLButtonElement>document.getElementById(id).getElementsByClassName("maximize")[0];
                                                browser.data.modals[id].status = "normal";
                                                button.click();
                                            } else if (storage.settings.modals[id].status === "minimized") {
                                                const button:HTMLButtonElement = <HTMLButtonElement>document.getElementById(id).getElementsByClassName("minimize")[0];
                                                browser.data.modals[id].status = "normal";
                                                button.click();
                                            }
                                        },
                                        callbackRemote = function local_restore_modalKeys_fsCallbackRemote(id:string, files:[HTMLElement, number]):void {
                                            const fsModal:HTMLElement = document.getElementById(id),
                                                body:HTMLElement = <HTMLElement>fsModal.getElementsByClassName("body")[0];
                                            fs.listFail(files[1], fsModal);
                                            body.innerHTML = "";
                                            body.appendChild(files[0]);

                                        };
                                    if (agent === "localhost") {
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
                                        modal.create(storage.settings.modals[value]);
                                        z(value);
                                        if (storage.settings.modals[value].status === "maximized") {
                                            const button:HTMLButtonElement = <HTMLButtonElement>document.getElementById(value).getElementsByClassName("maximize")[0];
                                            browser.data.modals[value].status = "normal";
                                            button.click();
                                        } else if (storage.settings.modals[value].status === "minimized") {
                                            const button:HTMLButtonElement = <HTMLButtonElement>document.getElementById(value).getElementsByClassName("minimize")[0];
                                            browser.data.modals[value].status = "normal";
                                            button.click();
                                        }
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
                                    storage.settings.modals[value].content = systemsBox;
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
                                    modal.shares(null, storage.settings.modals[value].text_value, storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "invite-request") {
                                    util.inviteStart(null, "", storage.settings.modals[value]);
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