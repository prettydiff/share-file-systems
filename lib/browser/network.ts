
/* lib/browser/network - The methods that execute data requests to the local terminal instance of the application. */

import browser from "./browser.js";
import webSocket from "./webSocket.js";

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
                invite:invite = data as invite,
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