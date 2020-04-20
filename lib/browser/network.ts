
/* lib/browser/network - The methods that execute data requests to the local terminal instance of the application. */
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
                const error:messageError = {
                    error: `XHR responded with ${xhr.status} when requesting ${configuration.action} on ${configuration.location.join(",").replace(/\\/g, "\\\\")}.`,
                    stack: [new Error().stack.replace(/\s+$/, "")]
                };
                text = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/--/g, "&#x2d;&#x2d;");
                if (xhr.status === 200 || xhr.status === 0) {
                    if (text.indexOf("{\"fileListStatus\":") === 0) {
                        util.fileListStatus(text);
                    } else {
                        callback(text, configuration.agent);
                    }
                } else {
                    systems.message("errors", JSON.stringify(error));
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

/* generate a share to describe a new share from the local device */
network.hashDevice = function local_network_hashDevice(callback:Function):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_hashDevice_callback():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status !== 200 && xhr.status !== 0) {
                    const error:messageError = {
                        error: `XHR responded with ${xhr.status} when sending messages.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    systems.message("errors", JSON.stringify(error));
                } else {
                    const hashes:hashUser = JSON.parse(xhr.responseText);
                    callback(hashes);
                }
            }
        },
        hashes:hashUser = {
            device: browser.data.nameDevice,
            user: browser.data.nameUser
        };
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify({hashDevice:hashes}));
};

/* generate a share to describe a new share from the local device */
network.hashShare = function local_network_hashShare(configuration:hashShareConfiguration):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_hashShare_callback():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status !== 200 && xhr.status !== 0) {
                    const error:messageError = {
                        error: `XHR responded with ${xhr.status} when sending messages.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    systems.message("errors", JSON.stringify(error));
                } else {
                    configuration.callback(xhr.responseText);
                }
            }
        },
        payload:hashShare = {
            device: configuration.device,
            share: configuration.share,
            type: configuration.type
        };
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify({hashShare:payload}));
};

/* Provides active user status from across the network at regular intervals */
network.heartbeat = function local_network_heartbeat(status:heartbeatStatus, share:boolean):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_fs_readyState():void {
            if (xhr.readyState === 4) {
                if (xhr.status !== 200 && xhr.status !== 0) {
                    const error:messageError = {
                        error: `XHR responded with ${xhr.status} when sending heartbeat`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    systems.message("errors", JSON.stringify(error));
                    network.storage("messages");
                }
            }
        },
        heartbeat:heartbeat = {
            agentFrom: "localhost-browser",
            agentTo: "",
            agentType: "user",
            shares: "",
            status: status
        };
    
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify({
        heartbeat: heartbeat
    }));
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
                    const error:messageError = {
                        error: `XHR responded with ${xhr.status} when requesting ${configuration.action} to ip ${configuration.ip} and port ${configuration.port}.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    systems.message("errors", JSON.stringify(error));
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
        invite: configuration
    }));
};

/* Invite other users */
network.inviteRequest = function local_network_invite(inviteData:invite):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_messages_callback():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status !== 200 && xhr.status !== 0) {
                    const error:messageError = {
                        error: `XHR responded with ${xhr.status} when sending messages related to an invitation response to ip ${inviteData.ip} and port ${inviteData.port}.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    systems.message("errors", JSON.stringify(error));
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
network.storage = function local_network_storage(type:storageType):void {
    if (browser.loadTest === true && ((messageTransmit === false && type === "messages") || type !== "messages")) {
        return;
    }
    messageTransmit = false;
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_messages_callback():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status !== 200 && xhr.status !== 0) {
                    const error:messageError = {
                        error: `XHR responded with ${xhr.status} when sending messages.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    systems.message("errors", JSON.stringify(error));
                }
            }
        },
        payload:string = JSON.stringify({
            [type]: (type === "settings")
                ? browser.data
                : browser[type]
        });
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.send(payload);
};

export default network;