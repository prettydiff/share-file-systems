
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
    network.xhr({
        callback: null,
        error: null,
        halt: false,
        payload: JSON.stringify({
            "delete-agents": deleted
        }),
        type: "delete-agents"
    });
};

/* Accesses the file system */
network.fs = function local_network_fs(configuration:fileService, callback:Function):void {
    context.menuRemove();
    network.xhr({
        callback: function local_network_fs_callback(responseText:string) {
            responseText = responseText.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/--/g, "&#x2d;&#x2d;");
            if (responseText.indexOf("{\"file-list-status\":") === 0) {
                util.fileListStatus(JSON.parse(responseText)["file-list-status"]);
            } else {
                callback(responseText, configuration.agent);
            }
        },
        error: `Transmission error when requesting ${configuration.action} on ${configuration.location.join(",").replace(/\\/g, "\\\\")}.`,
        halt: true,
        payload: JSON.stringify({
            fs: configuration
        }),
        type: configuration.action
    });
};

/* generate a share to describe a new share from the local device */
network.hashDevice = function local_network_hashDevice(callback:Function):void {
    const hashes:hashUser = {
            device: browser.data.nameDevice,
            user: browser.data.nameUser
        };
    network.xhr({
        callback: function local_network_hashDevice_callback(responseText:string) {
            const hashes:hashUser = JSON.parse(responseText);
            callback(hashes);
        },
        error: null,
        halt: false,
        payload: JSON.stringify({hashDevice:hashes}),
        type: "hashDevice"
    });
};

/* generate a share to describe a new share from the local device */
network.hashShare = function local_network_hashShare(configuration:hashShareConfiguration):void {
    const payload:hashShare = {
            device: configuration.device,
            share: configuration.share,
            type: configuration.type
        };
    network.xhr({
        callback: configuration.callback,
        error: null,
        halt: false,
        payload: JSON.stringify({hashShare:payload}),
        type: "hashShare"
    });
};

/* Provides active user status from across the network at regular intervals */
network.heartbeat = function local_network_heartbeat(status:heartbeatStatus, update:boolean):void {
    const heartbeat:heartbeatUpdate = {
            agentFrom: "localhost-browser",
            broadcastList: null,
            response: null,
            shares: (update === true)
                ? browser.device
                : {},
            status: status,
            type: "device"
        };
    network.xhr({
        callback: null,
        error: null,
        halt: false,
        payload: JSON.stringify({
            "heartbeat-update": heartbeat
        }),
        type: "heartbeat-update"
    });
};

/* Confirmed response to a user invitation */
network.inviteAccept = function local_network_invitationAcceptance(configuration:invite):void {
    network.xhr({
        callback: null,
        error: `Transmission error when requesting ${configuration.action} to ip ${configuration.ip} and port ${configuration.port}.`,
        halt: true,
        payload: JSON.stringify({
            invite: configuration
        }),
        type: configuration.action
    });
};

/* Invite other users */
network.inviteRequest = function local_network_invite(inviteData:invite):void {
    network.xhr({
        callback: null,
        error: `Transmission error related to an invitation response to ip ${inviteData.ip} and port ${inviteData.port}.`,
        halt: false,
        payload: JSON.stringify({
            invite: inviteData
        }),
        type: inviteData.action
    });
};

/* Writes configurations to file storage */
network.storage = function local_network_storage(type:storageType):void {
    if (browser.loadTest === true && type !== "settings" && ((messageTransmit === false && type === "messages") || type !== "messages")) {
        return;
    }
    messageTransmit = false;
    const storage:storage = {
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
    network.xhr({
        callback: null,
        error: null,
        halt: false,
        payload: payload,
        type: type
    });
};

/* Lets the service code know the browser is fully loaded and ready receive test samples. */
network.testBrowserLoaded = function local_network_testBrowserLoaded(payload:[boolean, string][], index:number):void {
   if (payload === undefined) {
        setTimeout(function local_network_testBrowserLoaded_delay():void {
            network.xhr({
                callback: null,
                error: null,
                halt: false,
                payload: JSON.stringify({
                    "test-browser-loaded": {}
                }),
                type: "test-browser-loaded"
            });
        }, 1000);
    } else {
        network.xhr({
            callback: null,
            error: null,
            halt: false,
            payload: JSON.stringify({
                "test-browser": {
                    index: index,
                    payload: payload
                }
            }),
            type: "test-browser"
        });
    }
};

/* the backbone of this library, all transmissions from the browser occur here */
network.xhr = function local_network_xhr(config:networkConfig):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        readyState = function local_network_messages_callback():void {
            if (xhr.readyState === 4) {
                messageTransmit = true;
                if (xhr.status === 200 || xhr.status === 0) {
                    if (config.callback !== null) {
                        config.callback(xhr.responseText);
                    }
                } else {
                    const error:messageError = {
                        error: (config.error === null)
                            ? `XHR responded with ${xhr.status} when sending messages of type ${config.type}.`
                            : config.error,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    systems.message("errors", JSON.stringify(error));
                    if (config.type.indexOf("fs-") === 0) {
                        config.callback(xhr.responseText);
                        network.storage("messages");
                    } else if (config.type !== "messages") {
                        network.storage("messages");
                    }
                }
            }
        };
    if (config.halt === true) {
        messageTransmit = false;
    }
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("request-type", config.type);
    xhr.send(config.payload);

};

export default network;