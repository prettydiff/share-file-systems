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
        } else if (event.data.indexOf("error:") === 0) {
            const errorData:string = event.data.slice(6),
                modal:HTMLElement = document.getElementById("systems-modal"),
                tabs:HTMLElement = <HTMLElement>modal.getElementsByClassName("tabs")[0];
            systems.message("errors", errorData, "websocket");
            if (modal.clientWidth > 0) {
                tabs.style.width = `${modal.getElementsByClassName("body")[0].scrollWidth / 10}em`;
            }
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
                        action: "fs-read",
                        agent: "self",
                        depth: 2,
                        location: [value],
                        name: "",
                        watch: "no"
                    }, function local_socketMessage_fsCallback(responseText:string):void {
                        if (responseText !== "") {
                            body.innerHTML = "";
                            body.appendChild(fs.list(value, responseText));
                        }
                    });
                    break;
                }
                a = a + 1;
            } while (a < keyLength);
            if (a === keyLength) {
                network.fs({
                    action: "fs-close",
                    agent: "self",
                    depth: 1,
                    location: [value],
                    name: "",
                    watch: "no"
                }, function local_socketMessage_closeCallback():boolean {
                    return true;
                });
            }
        } else if (event.data.indexOf("heartbeat:") === 0) {
            const heartbeats:string[] = event.data.split("heartbeat:"),
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
        } else if (event.data.indexOf("invite:") === 0) {
            util.inviteRespond(event.data.slice(7));
        } else if (event.data.indexOf("invite-error:") === 0) {
            const inviteData:inviteError = JSON.parse(event.data.slice(13)),
                modal:HTMLElement = <HTMLElement>document.getElementById(inviteData.modal);
            if (modal === null) {
                return;
            }
            let footer:HTMLElement = <HTMLElement>modal.getElementsByClassName("footer")[0],
                content:HTMLElement = <HTMLElement>modal.getElementsByClassName("inviteUser")[0],
                p:HTMLElement = document.createElement("p");
            p.innerHTML = inviteData.error;
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