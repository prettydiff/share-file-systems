import browser from "./browser.js";
import context from "./context.js";
import systems from "./systems.js";
import util from "./util.js";

const network:module_network = {},
    loc:string = location.href.split("?")[0];
let messageTransmit:boolean = true;

/* Accesses the file system */
network.fs = function local_network_fs(configuration:fileService, callback:Function):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_fs_readyState():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                let text:string = xhr.responseText;
                text = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/--/g, "&#x2d;&#x2d;");
                if (xhr.status === 200 || xhr.status === 0) {
                    if (text.indexOf("{\"fileListStatus\":") === 0) {
                        util.fileListStatus(text);
                    } else {
                        callback(text, configuration.agent);
                    }
                } else {
                    systems.message("errors", JSON.stringify({
                        error: `XHR responded with ${xhr.status} when requesting ${configuration.action} on ${configuration.location.join(",").replace(/\\/g, "\\\\")}.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    }));
                    callback(text, configuration.agent);
                    network.storage("messages");
                }
            }
        };
    messageTransmit = false;
    context.menuRemove();
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify({
        fs: configuration
    }));
};

/* Provides active user status from across the network about every minute */
network.heartbeat = function local_network_heartbeat(status:string, refresh:boolean):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        users:HTMLCollectionOf<HTMLElement> = document.getElementById("users").getElementsByTagName("button"),
        length:number = users.length,
        readyState = function local_network_fs_readyState():void {
            if (xhr.readyState === 4) {
                if (xhr.status !== 200 && xhr.status !== 0) {
                    systems.message("errors", JSON.stringify({
                        error: `XHR responded with ${xhr.status} when sending heartbeat`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    }));
                    network.storage("messages");
                }
            }
        };
    let user:string,
        a:number = 1;

    do {
        user = users[a].lastChild.textContent.replace(/^\s+/, "");
        if (user.indexOf("@") > 0 && user.lastIndexOf("@localhost") !== user.length - 10) {
            xhr.onreadystatechange = readyState;
            xhr.open("POST", loc, true);
            xhr.withCredentials = true;
            xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            xhr.send(JSON.stringify({
                heartbeat: {
                    agent: user,
                    refresh: refresh,
                    status: status,
                    user: ""
                }
            }));
        }
        a = a + 1;
    } while (a < length);
};

/* Confirmed response to a user invitation */
network.inviteAccept = function local_network_invitationAcceptance(configuration:invite):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_fs_readyState():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status === 200 || xhr.status === 0) {
                    // todo log invitation acceptance in system log
                } else {
                    systems.message("errors", JSON.stringify({
                        error: `XHR responded with ${xhr.status} when requesting ${configuration.action} to ip ${configuration.ip} and port ${configuration.port}.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    }));
                    network.storage("messages");
                }
            }
        };
    messageTransmit = false;
    context.menuRemove();
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify({
        "invite-response": configuration
    }));
};

/* Invite other users */
network.inviteRequest = function local_network_invite(inviteData:invite):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_messages_callback():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status !== 200 && xhr.status !== 0) {
                    systems.message("errors", JSON.stringify({
                        error: `XHR responded with ${xhr.status} when sending messages related to an invitation response to ip ${inviteData.ip} and port ${inviteData.port}.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    }));
                }
            }
        };
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify({
        invite: inviteData
    }));
};

/* Writes configurations to file storage */
network.storage = function local_network_storage(type:storageType, send?:boolean):void {
    if (browser.loadTest === true && ((messageTransmit === false && type === "messages") || type !== "messages")) {
        return;
    }
    messageTransmit = false;
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_messages_callback():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status !== 200 && xhr.status !== 0) {
                    systems.message("errors", JSON.stringify({
                        error: `XHR responded with ${xhr.status} when sending messages.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    }));
                }
            }
        },
        payload:string = JSON.stringify({
            [type]: {
                data: (type === "settings")
                    ? browser.data
                    : browser[type],
                send: (send === false)
                    ? false
                    : true
            }
        });
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(payload);
};

export default network;