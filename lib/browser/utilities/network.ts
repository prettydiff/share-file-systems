
/* lib/browser/utilities/network - The methods that execute data requests to the local terminal instance of the application. */

import agent_hash from "./agent_hash.js";
import agent_management from "./agent_management.js";
import agent_status from "./agent_status.js";
import browser from "../browser.js";
import file_browser from "../content/file_browser.js";
import invite from "../content/invite.js";
import message from "../content/message.js";
import remote from "./remote.js";
import share from "../content/share.js";
import webSocket from "./webSocket.js";

/**
 * Builds HTTP request bodies for transfer to the terminal.
 * ```typescript
 * interface module_network {
 *     configuration: () => void;                                         // A convenience method for setting state changes to a file.
 *     http         : (socketData:socketData) => void;                    // Prepares XHR and manages response text.
 *     receive      : (dataString:string) => void;                        // Receives data from the network.
 *     send         : (data:socketDataType, service:requestType) => void; // Provides a means for allowing arbitrary HTTP requests.
 * }
 * type requestType = "agent-hash" | "agent-management" | "agent-online" | "agent-resolve" | "agent-status" | "copy-file-request" | "copy-file" | "copy" | "error" | "file-system-status" | "file-system-details" | "file-system" | "GET" | "hash-share" | "invite" | "log" | "message" | "response-no-action" | "settings" | "string-generate" | "test-browser";
 * type socketDataType = Buffer | service_agentHash | service_agentManagement | service_agentResolve | service_agentStatus | service_copy | service_copy_file | service_error | service_copy_fileRequest | service_fileStatus | service_fileSystem | service_fileSystemDetails | service_hashShare | service_invite | service_log | service_message | service_settings | service_stringGenerate | service_testBrowser;
 * ``` */
const network:module_network = {
    /* A convenience method for updating state */
    configuration: function browser_utilities_network_configuration():void {
        if (browser.loading === false) {
            // the delay ensures pushing settings does not block other out-going traffic
            setTimeout(function browser_utilities_network_configuration_delay():void {
                network.send({
                    settings: browser.data,
                    type: "configuration"
                }, "settings");
            }, 5);
        }
    },

    /* Use HTTP in the cases where a callback is provided. */
    http: function browser_utilities_network_http(socketData:socketData):void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            dataString:string = JSON.stringify(socketData),
            invite:service_invite = socketData.data as service_invite,
            address:string = location.href.split("?")[0],
            testIndex:number = location.href.indexOf("?test_browser"),
            readyState = function browser_utilities_network_xhr_readyState():void {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        const offline:HTMLCollectionOf<Element> = document.getElementsByClassName("offline");
                        if (xhr.status === 200 && offline.length > 0 && offline[0].getAttribute("class") === "title offline") {
                            webSocket.start(null, browser.data.hashDevice);
                        }
                    } else {
                        const error:Error = {
                            message: `XHR responded with ${xhr.status} when sending messages of type ${socketData.service}.`,
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
        xhr.setRequestHeader("request-type", (socketData.service === "invite")
            ? invite.action
            : socketData.service);
        xhr.setRequestHeader("agent-type", "device");
        xhr.timeout = 5000;
        if (socketData.service === "agent-hash") {
            xhr.setRequestHeader("agent-hash", "");
        } else {
            xhr.setRequestHeader("agent-hash", browser.data.hashDevice);
        }
        xhr.send(dataString);
    },

    /* Receives data from the network */
    receive: function browser_utilities_network_receive(dataString:string):void {
        const error = function browser_utilities_network_receive_error():void {
                // eslint-disable-next-line
                console.error("Error", socketData.data);
            },
            reload = function browser_utilities_network_receive_reload():void {
                location.reload();
            },
            actions:browserActions = {
                "agent-hash": agent_hash.receive,
                "agent-status": agent_status.receive,
                "agent-management": agent_management.receive,
                "error": error,
                "hash-share": share.tools.hash,
                "file-system-details": file_browser.content.details,
                "file-system-status": file_browser.content.status,
                "file-system-string": file_browser.content.dataString,
                "invite": invite.tools.transmissionReceipt,
                "message": message.tools.receive,
                "reload": reload,
                "test-browser": remote.receive
            },
            socketData:socketData = JSON.parse(dataString),
            type:requestType = socketData.service;
        actions[type](socketData);
    },

    /* Performs the HTTP request */
    send: function browser_utilities_network_send(data:socketDataType, service:requestType):void {
        const socketData:socketData = {
            data: data,
            service: service
        };
        if (webSocket.send === null) {
            return;
        }
        webSocket.send(socketData);
    }
};

export default network;