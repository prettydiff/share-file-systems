
/* lib/browser/webSocket - Handles web socket events and associated errors. This where most communications from outside the browser are processed. */
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
    message = function local_socketMessage(event:SocketEvent):void {
        if (typeof event.data !== "string") {
            return;
        }
        const deleteUser = function local_socketMessage_deleteUser():void {
                const user:string = JSON.parse(event.data)["delete-user"],
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
                const errorData:socketError = JSON.parse(event.data).error,
                    modal:HTMLElement = document.getElementById("systems-modal"),
                    tabs:HTMLElement = <HTMLElement>modal.getElementsByClassName("tabs")[0],
                    payload:string = (errorData.error !== undefined && errorData.stack !== undefined)
                        ? JSON.stringify({
                            error: errorData.error,
                            stack: errorData.stack
                        })
                        : JSON.stringify(errorData);
                systems.message("errors", payload, "websocket");
                if (modal.clientWidth > 0) {
                    tabs.style.width = `${modal.getElementsByClassName("body")[0].scrollWidth / 10}em`;
                }
            },
            fsUpdateLocal = function local_socketMessage_fsUpdateLocal():void {
                const modalKeys:string[] = Object.keys(browser.data.modals),
                    fsData:directoryList = JSON.parse(event.data)["fs-update-local"],
                    keyLength:number = modalKeys.length;
                let root:string = fsData[0][0],
                    a:number = 0;
                if ((/^\w:$/).test(root) === true) {
                    root = root + "\\";
                }
                do {
                    if (browser.data.modals[modalKeys[a]].type === "fileNavigate" && browser.data.modals[modalKeys[a]].text_value === root && browser.data.modals[modalKeys[a]].agent === "localhost") {
                        const box:HTMLElement = document.getElementById(modalKeys[a]),
                            body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
                            list:[HTMLElement, number, string] = fs.list(root, {
                                dirs: fsData,
                                fail: fsData.failures,
                                id: modalKeys[a]
                            });
                        body.innerHTML = "";
                        body.appendChild(list[0]);
                        box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = list[2];
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
                const data:fsUpdateRemote = JSON.parse(event.data)["fs-update-remote"],
                    list:[HTMLElement, number, string] = fs.list(data.location, {
                        dirs: data.dirs,
                        id: data.location,
                        fail: data.fail
                    }),
                    modalKeys:string[] = Object.keys(browser.data.modals),
                    keyLength:number = modalKeys.length;
                let a:number = 0,
                    modalAgent:string,
                    body:HTMLElement,
                    box:HTMLElement,
                    status:HTMLElement;
                do {
                    modalAgent = browser.data.modals[modalKeys[a]].agent;
                    if (browser.data.modals[modalKeys[a]].type === "fileNavigate" && browser.data.modals[modalKeys[a]].text_value === data.location && data.agent === modalAgent) {
                        box = document.getElementById(browser.data.modals[modalKeys[a]].id);
                        if (box !== null) {
                            body = <HTMLElement>box.getElementsByClassName("body")[0];
                            body.innerHTML = "";
                            body.appendChild(list[0]);
                            status = <HTMLElement>box.getElementsByClassName("status-bar")[0];
                            if (status !== undefined) {
                                status.getElementsByTagName("p")[0].innerHTML = list[2];
                            }
                        }
                    }
                    a = a + 1;
                } while (a < keyLength);
                if (typeof data.status === "string") {
                    util.fileListStatus(data.status);
                }
            },
            heartbeat = function local_socketMessage_heartbeat():void {
                const heartbeat:heartbeat = JSON.parse(event.data)["heartbeat-response"],
                    buttons:HTMLCollectionOf<HTMLElement> = document.getElementById("users").getElementsByTagName("button"),
                    length:number = buttons.length;
                let a:number = 0;
                if (browser.users[heartbeat.user] === undefined) {
                    return;
                }
                do {
                    if (buttons[a].innerHTML.indexOf(heartbeat.user) > -1) {
                        buttons[a].setAttribute("class", heartbeat.status);
                        break;
                    }
                    a = a + 1;
                } while (a < length);
                if (heartbeat.shares !== "" && (browser.users[heartbeat.user].shares.length !== heartbeat.shares.length || JSON.stringify(browser.users[heartbeat.user].shares) !== JSON.stringify(heartbeat.shares))) {
                    share.update(heartbeat.user, heartbeat.shares);
                }
            },
            invitation = function local_socketMessage_invite():void {
                const inviteData:invite = JSON.parse(event.data)["invite-error"],
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
        if (event.data.indexOf("{\"delete-user\":") === 0) {
            deleteUser();
        } else if (event.data.indexOf("{\"error\":") === 0) {
            error();
        } else if (event.data.indexOf("{\"file-list-status\":") === 0) {
            util.fileListStatus(JSON.parse(event.data)["file-list-status"]);
        } else if (event.data.indexOf("{\"fs-update-local\":") === 0 && browser.loadTest === false) {
            fsUpdateLocal();
        } else if (event.data.indexOf("{\"fs-update-remote\":") === 0) {
            fsUpdateRemote();
        } else if (event.data.indexOf("{\"heartbeat-response\":") === 0) {
            heartbeat();
        } else if (event.data.indexOf("{\"invite-error\":") === 0) {
            invitation();
        } else if (event.data.indexOf("{\"invite\":") === 0) {
            invite.respond(event.data);
        } else if (event.data === "reload") {
            location.reload();
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