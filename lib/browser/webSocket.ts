import browser from "./browser.js";
import fs from "./fs.js";
import invite from "./invite.js";
import network from "./network.js";
import share from "./share.js";
import systems from "./systems.js";
import util from "./util.js";

const title:HTMLElement = <HTMLElement>document.getElementsByClassName("title")[0],
    titleText:string = title.getElementsByTagName("h1")[0].innerHTML,
    close = function local_socketClose():void {
        title.setAttribute("class", "title offline");
        title.getElementsByTagName("h1")[0].innerHTML = "Local service terminated.";
        document.getElementById("localhost").setAttribute("class", "offline");
    },
    message = function local_socketMessage(event:SocketEvent):void {console.log(event.data);
        if (typeof event.data !== "string") {
            return;
        }
        const deleteUser = function local_socketMessage_deleteUser():void {
                const user:string = event.data.replace("deleteUser:", ""),
                    userList:HTMLCollectionOf<HTMLElement> = document.getElementById("users").getElementsByTagName("li"),
                    length:number = userList.length;
                let a:number = 1;
                delete browser.users[user];
                do {
                    if (userList[a].innerHTML.indexOf(user) > 0) {
                        userList[a].parentNode.removeChild(userList[a]);
                        break;
                    }
                    a = a + 1;
                } while (a < length);
                share.update(user, "deleted");
            },
            error = function local_socketMessage_error():void {
                const errorData:string = event.data.slice(6),
                    modal:HTMLElement = document.getElementById("systems-modal"),
                    tabs:HTMLElement = <HTMLElement>modal.getElementsByClassName("tabs")[0];
                systems.message("errors", errorData, "websocket");
                if (modal.clientWidth > 0) {
                    tabs.style.width = `${modal.getElementsByClassName("body")[0].scrollWidth / 10}em`;
                }
            },
            fsUpdateLocal = function local_socketMessage_fsUpdateLocal():void {
                const modalKeys:string[] = Object.keys(browser.data.modals),
                    fsData:directoryList = JSON.parse(event.data).fsUpdateLocal,
                    keyLength:number = modalKeys.length;
                let root:string = fsData[0][0],
                    a:number = 0;
                if ((/^\w:$/).test(root) === true) {
                    root = root + "\\";
                }
                do {
                    if (browser.data.modals[modalKeys[a]].type === "fileNavigate" && browser.data.modals[modalKeys[a]].text_value === root && browser.data.modals[modalKeys[a]].agent === "localhost") {
                        const body:HTMLElement = <HTMLElement>document.getElementById(modalKeys[a]).getElementsByClassName("body")[0];
                        body.innerHTML = "";
                        body.appendChild(fs.list(root, {
                            dirs: fsData,
                            fail: fsData.failures,
                            id: modalKeys[a]
                        })[0]);
                    }
                    a = a + 1;
                } while (a < keyLength);
                if (a === keyLength) {
                    network.fs({
                        action: "fs-close",
                        agent: "localhost",
                        copyAgent: "",
                        depth: 1,
                        location: [root],
                        name: "",
                        watch: "no"
                    }, function local_socketMessage_closeCallback():boolean {
                        return true;
                    });
                }
            },
            fsUpdateRemote = function local_socketMessage_fsUpdateRemote():void {
                const data:fsUpdateRemote = JSON.parse(event.data.replace("{\"fsUpdateRemote\":", "").replace(/\}$/, "")),
                    list:[HTMLElement, number] = fs.list(data.location, {
                        dirs: data.dirs,
                        id: data.location,
                        fail: data.fail
                    }),
                    modalKeys:string[] = Object.keys(browser.data.modals),
                    keyLength:number = modalKeys.length;
                let a:number = 0,
                    modalAgent:string,
                    body:HTMLElement,
                    box:HTMLElement;
                do {
                    modalAgent = browser.data.modals[modalKeys[a]].agent;
                    if (browser.data.modals[modalKeys[a]].type === "fileNavigate" && browser.data.modals[modalKeys[a]].text_value === data.location && data.agent === modalAgent) {
                        box = document.getElementById(browser.data.modals[modalKeys[a]].id);
                        if (box !== null) {
                            body = <HTMLElement>box.getElementsByClassName("body")[0];
                            body.innerHTML = "";
                            body.appendChild(list[0]);
                        }
                    }
                    a = a + 1;
                } while (a < keyLength);
                if (typeof data.status === "string") {
                    util.fileListStatus(data.status);
                }
            },
            heartbeat = function local_socketMessage_heartbeat():void {
                const heartbeats:string[] = event.data.split("heartbeat-update:"),
                    heartbeat:heartbeat = JSON.parse(heartbeats[heartbeats.length - 1]),
                    buttons:HTMLCollectionOf<HTMLElement> = document.getElementById("users").getElementsByTagName("button"),
                    length:number = buttons.length;
                let a:number = 0;
                if (heartbeat.refresh === true) {
                    network.heartbeat(<"active"|"idle">document.getElementById("localhost").getAttribute("class"), false);
                }
                do {
                    if (buttons[a].innerHTML.indexOf(heartbeat.user) > -1) {
                        buttons[a].setAttribute("class", heartbeat.status);
                        break;
                    }
                    a = a + 1;
                } while (a < length);
            },
            invitation = function local_socketMessage_invite():void {
                const inviteData:invite = JSON.parse(event.data.slice(13)),
                    modal:HTMLElement = <HTMLElement>document.getElementById(inviteData.modal);
                if (modal === null) {
                    return;
                }
                let footer:HTMLElement = <HTMLElement>modal.getElementsByClassName("footer")[0],
                    content:HTMLElement = <HTMLElement>modal.getElementsByClassName("inviteUser")[0],
                    p:HTMLElement = document.createElement("p");
                p.innerHTML = inviteData.message;
                p.setAttribute("class", "error");
                content.appendChild(p);
                content.parentNode.removeChild(content.parentNode.lastChild);
                content.style.display = "block";
                footer.style.display = "block";
            };
        if (event.data.indexOf("deleteUser:") === 0) {
            deleteUser();
        } else if (event.data.indexOf("error:") === 0) {
            error();
        } else if (event.data.indexOf("{\"fileListStatus\":") === 0) {
            util.fileListStatus(event.data);
        } else if (event.data.indexOf("{\"fsUpdateLocal\":") === 0 && browser.loadTest === false) {
            fsUpdateLocal();
        } else if (event.data.indexOf("{\"fsUpdateRemote\":") === 0) {
            fsUpdateRemote();
        } else if (event.data.indexOf("heartbeat-update:") === 0) {
            heartbeat();
        } else if (event.data.indexOf("invite-error:") === 0) {
            invitation();
        } else if (event.data.indexOf("invite-request:") === 0) {
            invite.respond(event.data.slice(15));
        } else if (event.data === "reload") {
            location.reload();
        } else if (event.data.indexOf("shareUpdate:") === 0) {
            const update:shareUpdate = JSON.parse(event.data.slice("shareUpdate:".length));
            share.update(update.user, update.shares);
        } else {
            console.log(event.data);
        }
    },
    open = function local_socketOpen():void {
        document.getElementById("localhost").setAttribute("class", "active");
        title.getElementsByTagName("h1")[0].innerHTML = titleText;
        title.setAttribute("class", "title");
    },
    webSocket = function local_webSocket():WebSocket {
        const socket:WebSocket = new WebSocket(`ws://localhost:${browser.localNetwork.wsPort}/`),
            error = function local_socketError(this:WebSocket):any {
                setTimeout(function local_socketError_timeout():void {
                    browser.socket = local_webSocket();
                }, 5000);
            };
        
        /* Handle Web Socket responses */
        socket.onopen = open;
        socket.onmessage = message;
        socket.onclose = close;
        socket.onerror = error;
        return socket;
    };

export default webSocket;