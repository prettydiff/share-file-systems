import browser from "./browser.js";
import context from "./context.js";
import systems from "./systems.js";

const network:module_network = {},
    loc:string = location.href.split("?")[0];
let messageTransmit:boolean = true;

/* Accesses the file system */
network.fs = function local_network_fs(configuration:fileService, callback:Function, id?:string):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest();
    messageTransmit = false;
    context.menuRemove();
    xhr.onreadystatechange = function local_network_fs_readyState():void {
        if (xhr.readyState === 4) {
            messageTransmit = true;
            let text:string = xhr.responseText;
            text = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/--/g, "&#x2d;&#x2d;");
            if (xhr.status === 200 || xhr.status === 0) {
                callback(text, configuration.agent);
            } else {
                systems.message("errors", `{"error":"XHR responded with ${xhr.status} when requesting ${configuration.action} on ${configuration.location.join(",").replace(/\\/g, "\\\\")}.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
                callback(text, configuration.agent);
                network.messages();
            }
        }
    };
    xhr.withCredentials = true;
    xhr.open("POST", loc, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify({
        fs: configuration
    }));
};

/* Provides active user status from across the network about every minute */
network.heartbeat = function local_network_heartbeat(status:string, refresh:boolean):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        users:HTMLCollectionOf<HTMLElement> = document.getElementById("users").getElementsByTagName("button"),
        length:number = users.length;
    let ip:string,
        port:number,
        user:string,
        a:number = 0,
        local:string = document.getElementById("localhost").innerHTML;
    local = (browser.localNetwork.ip.indexOf(":") > 0)
        ? `${local.slice(0, local.indexOf("@"))}@[${browser.localNetwork.ip}]:${browser.localNetwork.tcpPort}`
        : `${local.slice(0, local.indexOf("@"))}@${browser.localNetwork.ip}:${browser.localNetwork.tcpPort}`;

    do {
        user = users[a].innerHTML;
        if (user.indexOf("@") > 0 && user.indexOf("@localhost") < 0) {
            ip = user.slice(user.indexOf("@") + 1, user.lastIndexOf(":"));
            port = Number(user.slice(user.lastIndexOf(":") + 1));
            xhr.onreadystatechange = function local_network_fs_readyState():void {
                if (xhr.readyState === 4) {
                    if (xhr.status !== 200 && xhr.status !== 0) {
                        systems.message("errors", `{"error":"XHR responded with ${xhr.status} when sending heartbeat","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
                        network.messages();
                    }
                }
            };
            xhr.withCredentials = true;
            xhr.open("POST", loc, true);
            xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            xhr.send(`heartbeat:{"ip":"${ip}","port":${port},"refresh":${refresh},"status":"${status}","user":"${local}"}`);
        }
        a = a + 1;
    } while (a < length);
};

/* Confirmed response to a user invitation */
network.inviteAccept = function local_network_invitationAcceptance(configuration:invite):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest();
    messageTransmit = false;
    context.menuRemove();
    xhr.onreadystatechange = function local_network_fs_readyState():void {
        if (xhr.readyState === 4) {
            messageTransmit = true;
            if (xhr.status === 200 || xhr.status === 0) {
                // todo log invitation acceptance in system log
            } else {
                systems.message("errors", `{"error":"XHR responded with ${xhr.status} when requesting ${configuration.action} to ip ${configuration.ip} and port ${configuration.port}.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
                network.messages();
            }
        }
    };
    xhr.withCredentials = true;
    xhr.open("POST", loc, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify({"invite-response": configuration}));
};

/* Invite other users */
network.inviteRequest = function local_network_invite(inviteData:invite):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest();
    xhr.onreadystatechange = function local_network_messages_callback():void {
        if (xhr.readyState === 4) {
            messageTransmit = true;
            if (xhr.status !== 200 && xhr.status !== 0) {
                systems.message("errors", `{"error":"XHR responded with ${xhr.status} when sending messages related to an invitation response to ip ${inviteData.ip} and port ${inviteData.port}.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
            }
        }
    };
    xhr.withCredentials = true;
    xhr.open("POST", loc, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(`invite:${JSON.stringify(inviteData)}`);
};

/* Stores systems log messages to storage/messages.json file */
network.messages = function local_network_messages():void {
    if (browser.loadTest === true || messageTransmit === false) {
        return;
    }
    messageTransmit = false;
    const xhr:XMLHttpRequest = new XMLHttpRequest();
    xhr.onreadystatechange = function local_network_messages_callback():void {
        if (xhr.readyState === 4) {
            messageTransmit = true;
            if (xhr.status !== 200 && xhr.status !== 0) {
                systems.message("errors", `{"error":"XHR responded with ${xhr.status} when sending messages.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
            }
        }
    };
    xhr.withCredentials = true;
    xhr.open("POST", loc, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(`messages:${JSON.stringify(browser.messages)}`);
};

/* Stores settings data to a storage/settings.json file */
network.settings = function local_network_settings():void {
    if (browser.loadTest === true) {
        return;
    }
    const xhr:XMLHttpRequest = new XMLHttpRequest();
    xhr.onreadystatechange = function local_network_settings_callback():void {
        if (xhr.readyState === 4) {
            if (xhr.status !== 200 && xhr.status !== 0) {
                systems.message("errors", `{"error":"XHR responded with ${xhr.status} when sending settings.","stack":${new Error().stack}`);
            }
        }
    };
    xhr.withCredentials = true;
    xhr.open("POST", loc, true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(`settings:${JSON.stringify(browser.data)}`);
};

export default network;