
/* lib/browser/network - The methods that execute data requests to the local terminal instance of the application. */

import browser from "./browser.js";
import webSocket from "./webSocket.js";

/**
 * Builds HTTP request bodies for transfer to the terminal.
 * * **configuration** - A convenience method for setting state changes to a file.
 * * **heartbeat** - A convenience method for setting heartbeat status changes.
 * * **send** - Provides a means for allowing arbitrary HTTP requests.
 * 
 * ```typescript
 * interface module_network {
 *     configuration: () => void;
 *     heartbeat: (status:heartbeatStatus, update:boolean) => void;
 *     send:(data:socketDataType, service:requestType, callback:(responseString:string) => void) => void;
 * }
 * type heartbeatStatus = "" | "active" | "deleted" | "idle" | "offline";
 * type requestType = hashTypes | "agent-online" | "browser-log" | "copy" | "error" | "file-list-status-device" | "file-list-status-user" | "forbidden" | "fs" | "GET" | "heartbeat" | "invite" | "message" | "reload" | "response-no-action" | "settings" | "test-browser";
 * type socketDataType = Buffer | NodeJS.ErrnoException | service_agentDeletion | service_agentResolve | service_agentUpdate | service_copy | service_copyFile | service_fileRequest | service_fileStatus | service_fileSystem | service_fileSystemDetails | service_hashAgent | service_hashShare | service_heartbeat | service_invite | service_log | service_message | service_settings | service_stringGenerate | service_testBrowser;
 * ``` */
const network:module_network = {
    /* A convenience method for updating state */
    configuration: function local_network_configuration():void {
        if (browser.loadFlag === false) {
            network.send({
                settings: browser.data,
                type: "configuration"
            }, "settings", null);
        }
    },

    /* Provides active user status from across the network at regular intervals */
    heartbeat: function local_network_heartbeat(status:heartbeatStatus, update:boolean):void {
        const heartbeat:service_agentUpdate = {
                action: "update",
                agentFrom: "localhost-browser",
                broadcastList: null,
                shares: (update === true)
                    ? browser.device
                    : null,
                status: status,
                type: "device"
            };
        network.send(heartbeat, "heartbeat", null);
    },

    /* Performs the HTTP request */
    send: function local_network_send(data:socketDataType, service:requestType, callback:(responseString:string) => void):void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            dataString:string = JSON.stringify({
                data: data,
                service: service
            }),
            invite:service_invite = data as service_invite,
            address:string = location.href.split("?")[0],
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
                        if (callback !== null) {
                            callback(xhr.responseText);
                        }
                    } else {
                        const error:Error = {
                            message: `XHR responded with ${xhr.status} when sending messages of type ${service}.`,
                            name: "XHR Error",
                            stack: new Error().stack.replace(/\s+$/, "")
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
        xhr.open("POST", address, true);
        xhr.withCredentials = true;
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.setRequestHeader("request-type", (service === "invite")
            ? invite.action
            : service);
        xhr.setRequestHeader("agent-type", "device");
        xhr.timeout = 5000;
        if (service === "hash-device") {
            xhr.setRequestHeader("agent-hash", "");
        } else {
            xhr.setRequestHeader("agent-hash", browser.data.hashDevice);
        }
        xhr.send(dataString);
    }
};

export default network;