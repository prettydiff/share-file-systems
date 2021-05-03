
/* lib/browser/webSocket - Handles web socket events and associated errors. This where most communications from outside the browser are processed. */
import browser from "./browser.js";
import invite from "./invite.js";
import message from "./message.js";
import network from "./network.js";
import remote from "./remote.js";
import share from "./share.js";
import util from "./util.js";

const title:Element = document.getElementById("title-bar"),
    titleText:string = title.getElementsByTagName("h1")[0].innerHTML,
    sock:WebSocketLocal = (function browser_socket():WebSocketLocal {
        // A minor security circumvention.
        const socket:WebSocketLocal = WebSocket as WebSocketLocal;
        // eslint-disable-next-line
        WebSocket = null;
        return socket;
    }()),
    socketMessage = function browser_socketMessage(event:SocketEvent):void {
        if (typeof event.data !== "string") {
            return;
        }
        const error = function browser_socketMessage_error():void {
                // eslint-disable-next-line
                console.error(body);
            },
            heartbeatDelete = function browser_socketMessage_heartbeatDelete(heartbeat:heartbeat):void {
                if (heartbeat.agentType === "device") {
                    const deletion:agentList = heartbeat.status as agentList,
                        removeSelf:boolean = (deletion.device.indexOf(browser.data.hashDevice) > -1),
                        devices:string[] = Object.keys(browser.device),
                        users:string[] = Object.keys(browser.user);
                    devices.forEach(function browser_socketMessage_heartbeatDelete_deviceEach(value:string) {
                        if (value !== browser.data.hashDevice && (removeSelf === true || deletion.device.indexOf(value) > -1)) {
                            share.deleteAgent(value, "device");
                        }
                    });
                    users.forEach(function browser_socketMessage_heartbeatDelete_userEach(value:string) {
                        if (removeSelf === true || deletion.user.indexOf(value) > -1) {
                            share.deleteAgent(value, "user");
                        }
                    });
                    share.update("");
                } else if (heartbeat.agentType === "user") {
                    share.deleteAgent(heartbeat.agentFrom, heartbeat.agentType);
                    share.update("");
                }
                network.settings("configuration", null);
            },
            heartbeatStatus = function browser_socketMessage_heartbeatStatus(heartbeat:heartbeat):void {
                const button:Element = document.getElementById(heartbeat.agentFrom);
                if (button !== null && button.getAttribute("data-agent-type") === heartbeat.agentType) {
                    button.setAttribute("class", heartbeat.status as heartbeatStatus);
                }
            },
            heartbeat = function browser_socketMessage_heartbeat(heartbeat:heartbeat):void {
                if (heartbeat.status === "deleted") {
                    share.deleteAgent(heartbeat.agentFrom, heartbeat.agentType);
                    share.update("");
                    network.settings("configuration", null);
                } else {
                    const keys:string[] = Object.keys(heartbeat.shares);
                    heartbeatStatus(heartbeat);
                    if (keys.length > 0) {
                        if (heartbeat.shareType === "device") {
                            const length:number = keys.length;
                            let a:number = 0;
                            do {
                                if (browser.device[keys[a]] === undefined) {
                                    browser.device[keys[a]] = heartbeat.shares[keys[a]];
                                    share.addAgent({
                                        hash: keys[a],
                                        name: heartbeat.shares[keys[a]].name,
                                        save: false,
                                        type: "device"
                                    });
                                }
                                a = a + 1;
                            } while (a < length);
                            browser.device[heartbeat.agentFrom] = heartbeat.shares[heartbeat.agentFrom];
                        } else if (heartbeat.shareType === "user") {
                            if (browser.user[keys[0]] === undefined) {
                                browser.user[keys[0]] = heartbeat.shares[keys[0]];
                                share.addAgent({
                                    hash: keys[0],
                                    name: heartbeat.shares[keys[0]].name,
                                    save: false,
                                    type: "user"
                                });
                            } else {
                                browser.user[keys[0]].shares = heartbeat.shares[keys[0]].shares;
                            }
                        }
                        share.update("");
                    }
                }
            },
            messagePost = function browser_socketMessage_messagePost(messageData:messageItem[]):void {
                const target:messageTarget = ((messageData[0].agentType === "user" && messageData[0].agentFrom === browser.data.hashUser) || (messageData[0].agentType === "device" && messageData[0].agentFrom === browser.data.hashDevice))
                    ? "agentTo"
                    : "agentFrom";
                document.getElementById("message-update").innerHTML = messageData[0].message;
                messageData.forEach(function browser_socketMessage_messagePost_each(item:messageItem):void {
                    message.post(item, target, "");
                });
            },
            testBrowser = function browser_socketMessage_testBrowser(data:testBrowserRoute):void {
                if (data.action === "close") {
                    window.close();
                    return;
                }
                if (data.action !== "nothing") {
                    remote.event(data, false);
                }
            },
            index:number = event.data.indexOf(","),
            type:requestType = event.data.slice(0, index) as requestType,
            body:string = event.data.slice(index + 1);
        if (type === "error") {
            error();
        } else if (type === "heartbeat-delete") {
            const agents:string[] = body.split(","),
                agentType:agentType = agents[1] as agentType;
            share.deleteAgent(agents[0], agentType);
        } else if (type === "file-list-status-device") {
            const status:fileStatusMessage = JSON.parse(body);
            util.fileListStatus(status);
        } else if (type === "heartbeat-complete") {
            heartbeat(JSON.parse(body));
        } else if (type === "heartbeat-status") {
            heartbeatStatus(JSON.parse(body));
        } else if (type === "heartbeat-delete-agents") {
            heartbeatDelete(JSON.parse(body));
        } else if (type === "message") {
            messagePost(JSON.parse(body));
        } else if (type.indexOf("invite") === 0) {
            const invitation:invite = JSON.parse(body);
            if (type === "invite-error") {
                invite.error(invitation);
            } else if (invitation.action === "invite-complete") {
                invite.complete(invitation);
            } else {
                invite.respond(invitation);
            }
        } else if (type === "test-browser" && location.href.indexOf("?test_browser") > 0) {
            testBrowser(JSON.parse(body));
        } else if (type === "reload") {
            location.reload();
        }
    },
    webSocket = function browser_webSocket(callback:() => void):void {
        const scheme:string = (location.protocol === "http:")
                ? ""
                : "s",
            socket:WebSocket = new sock(`ws${scheme}://localhost:${browser.localNetwork.wsPort}/`),
            testIndex:number = location.href.indexOf("?test_browser"),
            open = function browser_webSocket_socketOpen():void {
                const device:Element = (browser.data.hashDevice === "")
                    ? null
                    : document.getElementById(browser.data.hashDevice);
                if (title.getAttribute("class") === "title offline") {
                    location.reload();
                }
                browser.socket = socket;
                if (device !== null) {
                    device.setAttribute("class", "active");
                }
                title.getElementsByTagName("h1")[0].innerHTML = titleText;
                title.setAttribute("class", "title");
                if (callback !== null) {
                    callback();
                }
            },
            close = function browser_webSocket_socketClose():void {
                if (browser.data.hashDevice !== "") {
                    const device:Element = document.getElementById(browser.data.hashDevice),
                        agentList:Element = document.getElementById("agentList"),
                        active:HTMLCollectionOf<Element> = agentList.getElementsByClassName("status-active"),
                        delay = function browser_webSocket_socketClose_delay():void {
                            let online:boolean = false;
                            browser_webSocket(function browser_webSocket_socketClose_callback():void {
                                online = true;
                            });
                            // ensures there is time for connectivity before testing for an open web socket connection
                            setTimeout(function browser_webSocket_socketClose_delay_connectionDelay():void {
                                if (online === false) {
                                    // the recursive call
                                    setTimeout(browser_webSocket_socketClose_delay, 15000);
                                }
                            }, 100);
                        };
                    let a:number = active.length,
                        parent:Element;
                    if (a > 0) {
                        do {
                            a = a - 1;
                            parent = active[a].parentNode as Element;
                            parent.setAttribute("class", "offline");
                        } while (a > 0);
                    }
                    title.setAttribute("class", "title offline");
                    title.getElementsByTagName("h1")[0].innerHTML = "Disconnected.";
                    device.setAttribute("class", "offline");
                    // recursive loop searching for connectivity
                    setTimeout(delay, 15000);
                }
            };

        /* Handle Web Socket responses */
        if ((browser.testBrowser === null && testIndex < 0) || (browser.testBrowser !== null && testIndex > 0)) {
            socket.onopen = open;
            socket.onmessage = socketMessage;
            socket.onclose = close;
        }
    };

export default webSocket;