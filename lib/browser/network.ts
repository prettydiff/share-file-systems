
/* lib/browser/network - The methods that execute data requests to the local terminal instance of the application. */
import browser from "./browser.js";
import context from "./context.js";
import systems from "./systems.js";
import util from "./util.js";

const network:module_network = {},
    loc:string = location.href.split("?")[0];
let messageTransmit:boolean = true;

/* Send instructions to remove this local device/user from deleted remote agents */
network.deleteAgents = function local_network_deleteAgents(deleted:agentList):void {
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
        };
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("request-type", "delete-agents");
    xhr.send(JSON.stringify({
        "delete-agents": deleted
    }));
};

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
                    if (text.indexOf("{\"file-list-status\":") === 0) {
                        util.fileListStatus(JSON.parse(text)["file-list-status"]);
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
    xhr.setRequestHeader("request-type", configuration.action);
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
    xhr.setRequestHeader("request-type", "hashDevice");
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
    xhr.setRequestHeader("request-type", "hashShare");
    xhr.send(JSON.stringify({hashShare:payload}));
};

/* Provides active user status from across the network at regular intervals */
network.heartbeat = function local_network_heartbeat(status:heartbeatStatus, update:boolean):void {
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
        heartbeat:heartbeatUpdate = {
            agentFrom: "localhost-browser",
            broadcastList: null,
            response: null,
            shares: (update === true)
                ? browser.device
                : {},
            status: status,
            type: "device"
        };
    
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("request-type", "heartbeat-update");
    xhr.send(JSON.stringify({
        "heartbeat-update": heartbeat
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
    xhr.setRequestHeader("request-type", configuration.action);
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
    xhr.setRequestHeader("request-type", inviteData.action);
    xhr.send(JSON.stringify({
        invite: inviteData
    }));
};

/* Writes configurations to file storage */
network.storage = function local_network_storage(type:storageType):void {
    if (browser.loadTest === true && type !== "settings" && ((messageTransmit === false && type === "messages") || type !== "messages")) {
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
        storage:storage = {
            data: (type === "settings")
                ? browser.data
                : (type === "messages")
                    ? browser.messages
                    : (type === "device")
                        ? browser.device
                        : browser.user,
            response: null,
            type: type
        },
        payload:string = JSON.stringify({
            storage: storage
        });
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("request-type", type);
    xhr.send(payload);
};

/* Lets the service code know the browser is fully loaded and ready receive test samples. */
network.testBrowserLoaded = function local_network_testBrowserLoaded(payload:[boolean, string][], index:number):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_messages_callback():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status === 200 || xhr.status === 0) {
                    // eslint-disable-next-line
                    console.log(xhr.responseText);
                } else {
                    const error:messageError = {
                        error: `XHR responded with ${xhr.status} when sending messages.`,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    systems.message("errors", JSON.stringify(error));
                }
            }
        },
        data:testBrowserResult = (payload === undefined)
            ? null
            : {
                index: index,
                payload: payload
            };
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    if (payload === undefined) {
        xhr.setRequestHeader("request-type", "test-browser-loaded");
        setTimeout(function local_network_testBrowserLoaded_delay():void {
            xhr.send(JSON.stringify({
                "test-browser-loaded": {}
            }));
        }, 1000);
    } else {
        xhr.setRequestHeader("request-type", "test-browser");
        xhr.send(JSON.stringify({
            "test-browser": data
        }));
    }
};

export default network;