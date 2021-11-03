
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
                console.error(socketData.data);
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
                network.configuration();
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
                    network.configuration();
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
            socketData:socketData = JSON.parse(event.data),
            type:requestType = socketData.service;
        if (type === "error") {
            error();
        } else if (type === "file-list-status-device") {
            util.fileListStatus(socketData.data as fileStatusMessage);
        } else if (type === "heartbeat") {
            const heartbeatData:heartbeat = socketData.data as heartbeat;
            if (heartbeatData.action === "complete") {
                heartbeat(heartbeatData);
            } else if (heartbeatData.action === "status") {
                heartbeatStatus(heartbeatData);
            } else if (heartbeatData.action === "delete-agents") {
                heartbeatDelete(heartbeatData);
            }
        } else if (type === "message") {
            messagePost(socketData.data as messageItem[]);
        } else if (type.indexOf("invite") === 0) {
            const invitation:invite = socketData.data as invite;
            if (invitation.action === "invite-complete") {
                invite.complete(invitation);
            } else {
                invite.respond(invitation);
            }
        } else if (type === "test-browser" && location.href.indexOf("?test_browser") > 0) {
            testBrowser(socketData.data as testBrowserRoute);
        } else if (type === "reload") {
            location.reload();
        }
    },

    webSocket:browserSocket = {
        send: null,
        start: function browser_webSocket(callback:() => void):void {
            const scheme:string = (location.protocol === "http:")
                    ? "ws"
                    : "wss",
                socket:WebSocket = new sock(`${scheme}://localhost:${browser.localNetwork.wsPort}/`, []),
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
                            active:HTMLCollectionOf<Element> = agentList.getElementsByClassName("status-active");
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
                    }
                };

            /* Handle Web Socket responses */
            if ((browser.testBrowser === null && testIndex < 0) || (browser.testBrowser !== null && testIndex > 0)) {
                socket.onopen = open;
                socket.onmessage = socketMessage;
                socket.onclose = close;
                socket.onerror = error;
                webSocket.send = function browser_webSocket_sendWrapper(data:socketData):void {
                    socket.send(JSON.stringify(data));
                };
            }
        }
    },
    error = function browser_socketError():void {
        setTimeout(function browser_socketError_delay():void {
            webSocket.start(null);
        }, 15000);
    };

export default webSocket;