
/* lib/browser/network - The methods that execute data requests to the local terminal instance of the application. */
import { config } from "process";
import browser from "./browser.js";
import util from "./util.js";
import webSocket from "./webSocket.js";

const network:module_network = {},
    loc:string = location.href.split("?")[0],
    fsConfig = function local_network_fsConfig(callback:(responseText:string) => void, configuration:systemDataCopy|systemDataFile, type:requestType):networkConfig {
        const copy:systemDataCopy = <systemDataCopy>configuration,
            actionType:string = (type === "fs")
            ? configuration.action
            : (copy.cut === true)
                ? "cut"
                : "copy";
        return {
            callback: function local_network_fsConfig_callback(responseType:requestType, responseText:string) {
                if (responseType === "file-list-status" && responseText.charAt(0) === "{") {
                    const status:fileStatusMessage = JSON.parse(responseText);
                    util.fileListStatus(status);
                }
                if (callback !== null) {
                    callback(responseText);
                }
            },
            error: `Transmission error when requesting ${actionType} on ${configuration.location.join(",").replace(/\\/g, "\\\\")}.`,
            payload: JSON.stringify(configuration),
            type: type
        };
    };

/* Accesses the file system */
network.copy = function local_network_copy(configuration:systemDataCopy, callback:(responseText:string) => void):void {
    network.xhr(fsConfig(callback, configuration, "copy"));
};

/* Send instructions to remove this local device/user from deleted remote agents */
network.deleteAgents = function local_network_deleteAgents(deleted:agentList):void {
    network.xhr({
        callback: null,
        error: null,
        payload: JSON.stringify(deleted),
        type: "delete-agents"
    });
};

/* Accesses the file system */
network.fileBrowser = function local_network_fileBrowser(configuration:systemDataFile, callback:(responseText:string) => void):void {
    network.xhr(fsConfig(callback, configuration, "fs"));
};

/* generate a share to describe a new share from the local device */
network.hashDevice = function local_network_hashDevice(callback:Function):void {
    const hashes:hashAgent = {
            device: browser.data.nameDevice,
            user: browser.data.nameUser
        };
    network.xhr({
        callback: function local_network_hashDevice_callback(responseType:requestType, responseText:string) {
            const hashes:hashAgent = JSON.parse(responseText);
            callback(hashes);
        },
        error: null,
        payload: JSON.stringify(hashes),
        type: "hash-device"
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
        payload: JSON.stringify(payload),
        type: "hash-share"
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
        payload: JSON.stringify(heartbeat),
        type: "heartbeat-update"
    });
};

/* Confirmed response to a user invitation */
network.inviteAccept = function local_network_invitationAcceptance(configuration:invite):void {
    network.xhr({
        callback: null,
        error: `Transmission error when requesting ${configuration.action} to ip ${configuration.ip} and port ${configuration.port}.`,
        payload: JSON.stringify(configuration),
        type: configuration.action
    });
};

/* Invite other users */
network.inviteRequest = function local_network_invite(inviteData:invite):void {
    network.xhr({
        callback: null,
        error: `Transmission error related to an invitation response to ip ${inviteData.ip} and port ${inviteData.port}.`,
        payload: JSON.stringify(inviteData),
        type: inviteData.action
    });
};

/* Publish browser logs to the terminal */
network.log = function local_network_log(...params:any[]):void {
    params.forEach(function local_network_log_each(value:any, index:number, arr:any[]):void {
        if (value !== null && value !== undefined && typeof value.nodeType === "number" && typeof value.parentNode === "object") {
            arr[index] = value.outerHTML;
        }
    });
    network.xhr({
        callback: null,
        error: null,
        payload: JSON.stringify(params),
        type: "browser-log"
    });
};

network.message = function local_network_message(message:messageItem):void {
    const error:string = (message.agentFrom === message.agentTo)
        ? `Transmission error related to text message broadcast to ${message.agentType}s.`
        : `Transmission error related to text message for ${message.agentType} ${message.agentTo}.`;
    network.xhr({
        callback: null,
        error: error,
        payload: JSON.stringify(message),
        type: "message"
    });
};

/* Writes configurations to file storage */
network.storage = function local_network_storage(type:storageType, callback:() => void):void {
    if (browser.loadFlag === true && type !== "settings") {
        return;
    }
    const storage:storage = {
            data: (type === "settings")
                ? browser.data
                : (type === "device")
                    ? browser.device
                    : browser.user,
            response: null,
            type: type
        };
    network.xhr({
        callback: callback,
        error: null,
        payload: JSON.stringify(storage),
        type: "storage"
    });
};

/* Lets the service code know the browser is fully loaded and ready receive test samples. */
network.testBrowser = function local_network_testBrowser(payload:[boolean, string, string][], index:number, task:testBrowserAction):void {
    const data:testBrowserRoute = {
            action: task,
            exit: null,
            index: index,
            result: payload,
            test: null,
            transfer: browser.testBrowser.transfer
        };
    network.xhr({
        callback: null,
        error: null,
        payload: JSON.stringify(data),
        type: "test-browser"
    });
};

/* the backbone of this library, all transmissions from the browser occur here */
network.xhr = function local_network_xhr(config:networkConfig):void {
    const xhr:XMLHttpRequest = new XMLHttpRequest(),
        testIndex:number = location.href.indexOf("?test_browser"),
        readyState = function local_network_xhr_readyState():void {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    const offline:HTMLCollectionOf<Element> = document.getElementsByClassName("offline");
                    if (xhr.status === 200 && offline.length > 0 && offline[0].getAttribute("class") === "title offline") {
                        webSocket(function local_network_xhr_readyState_webSocket():boolean {
                            return true;
                        });
                    }
                    if (config.callback !== null) {
                        config.callback(<requestType>xhr.getResponseHeader("response-type"), xhr.responseText);
                    }
                } else {
                    const error:error = {
                        error: (config.error === null)
                            ? `XHR responded with ${xhr.status} when sending messages of type ${config.type}.`
                            : config.error,
                        stack: [new Error().stack.replace(/\s+$/, "")]
                    };
                    // eslint-disable-next-line
                    console.error(error);
                }
            }
        };
    if (browser.testBrowser === null && testIndex > 0) {
        return;
    }
    if (browser.testBrowser !== null && testIndex < 0) {
        return;
    }
    xhr.onreadystatechange = readyState;
    xhr.open("POST", loc, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("request-type", config.type);
    xhr.setRequestHeader("agent-type", "device");
    if (config.type === "hash-device") {
        xhr.setRequestHeader("agent-hash", "");
    } else {
        xhr.setRequestHeader("agent-hash", browser.data.hashDevice);
    }
    xhr.send(config.payload);

};

export default network;