import browser from "./browser.js";
import fs from "./fs.js";
import network from "./network.js";
import systems from "./systems.js";
import util from "./util.js";

const webSocket = function local_webSocket():WebSocket {
    const title:HTMLElement = <HTMLElement>document.getElementsByClassName("title")[0],
        socket:WebSocket = (browser.localNetwork.family === "ipv4")
            ? new WebSocket(`ws://${browser.localNetwork.ip}:${browser.localNetwork.wsPort}`)
            : new WebSocket(`ws://[${browser.localNetwork.ip}]:${browser.localNetwork.wsPort}`);
    
    /* Handle Web Socket responses */
    socket.onopen = function local_socketOpen():void {
        document.getElementById("localhost").setAttribute("class", "active");
        title.style.background = "#ddd";
        title.getElementsByTagName("h1")[0].innerHTML = "Shared Spaces";
    };
    socket.onmessage = function local_socketMessage(event:SocketEvent):void {
        if (event.data === "reload") {
            location.reload();
        } else if (event.data.indexOf("fileListStatus:") === 0) {
            const data:copyStatus = JSON.parse(event.data.slice("fileListStatus:".length)),
                statusBar:HTMLElement = <HTMLElement>document.getElementById(data.id).getElementsByClassName("status-bar")[0],
                list:HTMLElement = statusBar.getElementsByTagName("ul")[0],
                p:HTMLElement = statusBar.getElementsByTagName("p")[0];
            p.innerHTML = data.message;
            if (list !== undefined) {
                statusBar.removeChild(list);
            }
            if (data.failures.length > 0) {
                const failLength:number = Math.min(10, data.failures.length),
                    fails:HTMLElement = document.createElement("ul");
                let a:number = 0,
                    li:HTMLElement;
                do {
                    li = document.createElement("li");
                    li.innerHTML = data.failures[a];
                    fails.appendChild(li);
                    a = a + 1;
                } while (a < failLength);
                if (data.failures.length > 10) {
                    li = document.createElement("li");
                    li.innerHTML = "more...";
                    fails.appendChild(li);
                }
                statusBar.appendChild(fails);
            }
        } else if (event.data.indexOf("error:") === 0) {
            const errorData:string = event.data.slice(6),
                modal:HTMLElement = document.getElementById("systems-modal"),
                tabs:HTMLElement = <HTMLElement>modal.getElementsByClassName("tabs")[0];
            systems.message("errors", errorData, "websocket");
            if (modal.clientWidth > 0) {
                tabs.style.width = `${modal.getElementsByClassName("body")[0].scrollWidth / 10}em`;
            }
        } else if (event.data.indexOf("fsUpdateRemote:") === 0) {
            const data:fsUpdateRemote = JSON.parse(event.data.replace("fsUpdateRemote:", "")),
                list:[HTMLElement, number] = fs.list(data.location, {
                    dirs: data.dirs,
                    id: data.location,
                    fail: data.fail
                }),
                modalKeys:string[] = Object.keys(browser.data.modals),
                keyLength:number = modalKeys.length;
            let a:number = 0,
                modalAgent:string,
                body:HTMLElement;
            do {
                modalAgent = browser.data.modals[modalKeys[a]].agent;
                if (browser.data.modals[modalKeys[a]].type === "fileNavigate" && browser.data.modals[modalKeys[a]].text_value === data.location && data.agent === modalAgent) {
                    body = <HTMLElement>document.getElementById(browser.data.modals[modalKeys[a]].id).getElementsByClassName("body")[0];
                    body.innerHTML = "";
                    body.appendChild(list[0]);
                }
                a = a + 1;
            } while (a < keyLength);
        } else if (event.data.indexOf("fsUpdate:") === 0 && browser.loadTest === false) {
            const modalKeys:string[] = Object.keys(browser.data.modals),
                keyLength:number = modalKeys.length;
            let value:string = event.data.slice(9).replace(/(\\|\/)+$/, "").replace(/\\\\/g, "\\"),
                a:number = 0;
            if ((/^\w:$/).test(value) === true) {
                value = value + "\\";
            }
            do {
                if (browser.data.modals[modalKeys[a]].type === "fileNavigate" && browser.data.modals[modalKeys[a]].text_value === value) {
                    const body:HTMLElement = <HTMLElement>document.getElementById(modalKeys[a]).getElementsByClassName("body")[0];
                    network.fs({
                        action: "fs-directory",
                        agent: "localhost",
                        copyAgent: "",
                        depth: 2,
                        location: [value],
                        name: "",
                        watch: "no"
                    }, function local_socketMessage_fsCallback(responseText:string):void {
                        if (responseText !== "") {
                            body.innerHTML = "";
                            body.appendChild(fs.list(value, JSON.parse(responseText))[0]);
                        }
                    });
                    break;
                }
                a = a + 1;
            } while (a < keyLength);
            if (a === keyLength) {
                network.fs({
                    action: "fs-close",
                    agent: "localhost",
                    copyAgent: "",
                    depth: 1,
                    location: [value],
                    name: "",
                    watch: "no"
                }, function local_socketMessage_closeCallback():boolean {
                    return true;
                });
            }
        } else if (event.data.indexOf("heartbeat-update:") === 0) {
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
        } else if (event.data.indexOf("invite-request:") === 0) {
            util.inviteRespond(event.data.slice(15));
        } else if (event.data.indexOf("invite-error:") === 0) {
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
        }
    };
    socket.onclose = function local_socketClose():void {
        title.style.background = "#ff6";
        title.getElementsByTagName("h1")[0].innerHTML = "Local service terminated.";
        document.getElementById("localhost").setAttribute("class", "offline");
    };
    socket.onerror = function local_socketError(this:WebSocket):any {
        setTimeout(function local_socketError_timeout():void {
            browser.socket = local_webSocket();
        }, 5000);
    };
    return socket;
};

export default webSocket;