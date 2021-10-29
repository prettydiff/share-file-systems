
/* lib/browser/network - The methods that execute data requests to the local terminal instance of the application. */

import browser from "./browser.js";
import util from "./util.js";
import webSocket from "./webSocket.js";

const fsConfig = function local_network_fsConfig(callback:(responseText:string) => void, configuration:systemDataCopy|systemDataFile, type:requestType):networkConfig {
        const copy:systemDataCopy = configuration as systemDataCopy,
            file:systemDataFile = configuration as systemDataFile,
            actionType:string = (type === "fs")
                ? file.action
                : (copy.cut === true)
                    ? "cut"
                    : "copy";
        return {
            callback: function local_network_fsConfig_callback(responseType:requestType, responseText:string):void {
                if (responseType === "file-list-status-device" || responseType === "file-list-status-user") {
                    const status:fileStatusMessage = JSON.parse(responseText).data;
                    util.fileListStatus(status);
                }
                if (callback !== null) {
                    callback(responseText);
                }
            },
            error: `Transmission error when requesting ${actionType} on ${configuration.location.join(",").replace(/\\/g, "\\\\")}.`,
            payload: {
                data: configuration,
                service: type
            }
        };
    },
    loc = location.href.split("?")[0],
    network:module_network = {
        /* Accesses the file system */
        copy: function local_network_copy(configuration:systemDataCopy, callback:(responseText:string) => void):void {
            network.xhr(fsConfig(callback, configuration, "copy"));
        },

        /* Send instructions to remove this local device/user from deleted remote agents */
        deleteAgents: function local_network_deleteAgents(deleted:agentList):void {
            const heartbeat:heartbeat = {
                action: "delete-agents",
                agentFrom: browser.data.hashDevice,
                agentTo: browser.data.hashDevice,
                agentType: "device",
                shares: null,
                shareType: "device",
                status: deleted
            };
            network.xhr({
                callback: null,
                error: null,
                payload: {
                    data: heartbeat,
                    service: "heartbeat"
                }
            });
        },

        /* Accesses the file system */
        fileBrowser: function local_network_fileBrowser(configuration:systemDataFile, callback:(responseText:string) => void):void {
            network.xhr(fsConfig(callback, configuration, "fs"));
        },

        /* generate a share to describe a new share from the local device */
        hashDevice: function local_network_hashDevice(callback:Function):void {
            const hashes:hashAgent = {
                    device: browser.data.nameDevice,
                    deviceData: null,
                    user: browser.data.nameUser
                };
            network.xhr({
                callback: function local_network_hashDevice_callback(responseType:requestType, responseText:string) {
                    const hashes:hashAgent = JSON.parse(responseText).data;
                    callback(hashes);
                },
                error: null,
                payload: {
                    data: hashes,
                    service: "hash-device"
                }
            });
        },

        /* generate a share to describe a new share from the local device */
        hashShare: function local_network_hashShare(configuration:hashShareConfiguration):void {
            const payload:hashShare = {
                    device: configuration.device,
                    share: configuration.share,
                    type: configuration.type
                };
            network.xhr({
                callback: configuration.callback,
                error: null,
                payload: {
                    data: payload,
                    service: "hash-share"
                }
            });
        },

        /* Provides active user status from across the network at regular intervals */
        heartbeat: function local_network_heartbeat(status:heartbeatStatus, update:boolean):void {
            const heartbeat:heartbeatUpdate = {
                    action: "update",
                    agentFrom: "localhost-browser",
                    broadcastList: null,
                    shares: (update === true)
                        ? browser.device
                        : null,
                    status: status,
                    type: "device"
                };
            network.xhr({
                callback: null,
                error: null,
                payload: {
                    data: heartbeat,
                    service: "heartbeat"
                }
            });
        },

        /* Confirmed response to a user invitation */
        inviteAccept: function local_network_invitationAcceptance(configuration:invite):void {
            network.xhr({
                callback: null,
                error: `Transmission error when requesting ${configuration.action} to ip ${configuration.ipSelected} and port ${configuration.ports.http}.`,
                payload: {
                    data: configuration,
                    service: configuration.action
                }
            });
        },

        /* Invite other users */
        inviteRequest: function local_network_invite(inviteData:invite):void {
            network.xhr({
                callback: null,
                error: `Transmission error related to an invitation response to ip ${inviteData.ipSelected} and port ${inviteData.ports.http}.`,
                payload: {
                    data: inviteData,
                    service: inviteData.action
                }
            });
        },

        /* Publish browser logs to the terminal */
        // eslint-disable-next-line
        log: function local_network_log(...params:unknown[]):void {
            // eslint-disable-next-line
            params.forEach(function local_network_log_each(value:any, index:number, arr:unknown[]):void {
                if (value !== null && value !== undefined && typeof value.nodeType === "number" && typeof value.parentNode === "object") {
                    arr[index] = value.outerHTML;
                }
            });
            network.xhr({
                callback: null,
                error: null,
                payload: {
                    data: params,
                    service: "browser-log"
                }
            });
        },

        /* Sends text message */
        message: function local_network_message(message:messageItem):void {
            const error:string = (message.agentFrom === message.agentTo)
                ? `Transmission error related to text message broadcast to ${message.agentType}s.`
                : `Transmission error related to text message for ${message.agentType} ${message.agentTo}.`;
            network.xhr({
                callback: null,
                error: error,
                payload: {
                    data: [message],
                    service: "message"
                }
            });
        },

        /* Writes configurations to file settings */
        settings: function local_network_settings(type:settingsType, callback:() => void):void {
            if (browser.loadFlag === true && type !== "configuration") {
                return;
            }
            const settings:settings = {
                    settings: (type === "configuration")
                        ? browser.data
                        : (type === "device")
                            ? browser.device
                            : browser.user,
                    type: type
                };
            network.xhr({
                callback: callback,
                error: null,
                payload: {
                    data: settings,
                    service: "settings"
                }
            });
        },

        /* Lets the service code know the browser is fully loaded and ready receive test samples. */
        testBrowser: function local_network_testBrowser(payload:[boolean, string, string][], index:number, task:testBrowserAction):void {
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
                payload: {
                    data: data,
                    service: "test-browser"
                }
            });
        },

        /* the backbone of this library, all transmissions from the browser occur here */
        xhr: function local_network_xhr(config:networkConfig):void {
            const xhr:XMLHttpRequest = new XMLHttpRequest(),
                dataString:string = JSON.stringify(config.payload),
                testIndex:number = location.href.indexOf("?test_browser"),
                readyState = function local_network_xhr_readyState():void {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200 || xhr.status === 0) {
                            const offline:HTMLCollectionOf<Element> = document.getElementsByClassName("offline");
                            if (xhr.status === 200 && offline.length > 0 && offline[0].getAttribute("class") === "title offline") {
                                webSocket.start(function local_network_xhr_readyState_webSocket():boolean {
                                    return true;
                                });
                            }
                            if (config.callback !== null) {
                                config.callback(xhr.getResponseHeader("response-type") as requestType, xhr.responseText);
                            }
                        } else {
                            const error:error = {
                                error: (config.error === null)
                                    ? `XHR responded with ${xhr.status} when sending messages of type ${config.payload.service}.`
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
            xhr.setRequestHeader("request-type", config.payload.service);
            xhr.setRequestHeader("agent-type", "device");
            xhr.timeout = 5000;
            if (config.payload.service === "hash-device") {
                xhr.setRequestHeader("agent-hash", "");
            } else {
                xhr.setRequestHeader("agent-hash", browser.data.hashDevice);
            }
            xhr.send(dataString);

        }

    };

export default network;