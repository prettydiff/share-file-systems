
/* lib/browser/webSocket - Handles web socket events and associated errors. This where most communications from outside the browser are processed. */
import browser from "./browser.js";
import fileBrowser from "./fileBrowser.js";
import invite from "./invite.js";
import message from "./message.js";
import network from "./network.js";
import remote from "./remote.js";
import share from "./share.js";
import util from "./util.js";

const title:Element = document.getElementsByClassName("title")[0],
    titleText:string = title.getElementsByTagName("h1")[0].innerHTML,
    sock:WebSocketLocal = (function browser_socket():WebSocketLocal {
        // A minor security circumvention.
        const socket:WebSocketLocal = <WebSocketLocal>WebSocket;
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
                console.error(event.data);
            },
            fsUpdateLocal = function browser_socketMessage_fsUpdateLocal():void {
                const modalKeys:string[] = Object.keys(browser.data.modals),
                    fsData:directoryList = JSON.parse(event.data)["fs-update-local"],
                    keyLength:number = modalKeys.length;
                let root:string = fsData[0][0],
                    a:number = 0;
                if ((/^\w:$/).test(root) === true) {
                    root = root + "\\";
                }
                do {
                    if (browser.data.modals[modalKeys[a]].type === "fileNavigate" && browser.data.modals[modalKeys[a]].text_value === root && browser.data.modals[modalKeys[a]].agent === browser.data.hashDevice) {
                        const box:Element = document.getElementById(modalKeys[a]),
                            body:Element = box.getElementsByClassName("body")[0],
                            list:[Element, number, string] = fileBrowser.list(root, {
                                dirs: fsData,
                                fail: fsData.failures,
                                id: modalKeys[a]
                            });
                        body.innerHTML = "";
                        body.appendChild(list[0]);
                        box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = list[2];
                    }
                    a = a + 1;
                } while (a < keyLength);
                if (a === keyLength) {
                    const payload:fileService = {
                        action: "fs-close",
                        agent: browser.data.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "",
                        location: [root],
                        name: "",
                        share: "",
                        watch: "no"
                    },
                    callback = function browser_socketMessage_closeCallback():boolean {
                        return true;
                    };
                    network.fileBrowser(payload, callback);
                }
            },
            fsUpdateRemote = function browser_socketMessage_fsUpdateRemote():void {
                const data:fsUpdateRemote = JSON.parse(event.data)["fs-update-remote"],
                    list:[Element, number, string] = fileBrowser.list(data.location, {
                        dirs: data.dirs,
                        id: data.location,
                        fail: data.fail
                    }),
                    modalKeys:string[] = Object.keys(browser.data.modals),
                    keyLength:number = modalKeys.length;
                let a:number = 0,
                    modalAgent:string,
                    body:Element,
                    box:Element,
                    status:Element;
                do {
                    modalAgent = browser.data.modals[modalKeys[a]].agent;
                    if (browser.data.modals[modalKeys[a]].type === "fileNavigate" && browser.data.modals[modalKeys[a]].text_value === data.location && data.agent === modalAgent) {
                        box = document.getElementById(browser.data.modals[modalKeys[a]].id);
                        if (box !== null) {
                            body = box.getElementsByClassName("body")[0];
                            body.innerHTML = "";
                            body.appendChild(list[0]);
                            status = box.getElementsByClassName("status-bar")[0];
                            if (status !== undefined) {
                                status.getElementsByTagName("p")[0].innerHTML = list[2];
                            }
                        }
                    }
                    a = a + 1;
                } while (a < keyLength);
                if (typeof data.status === "string") {
                    util.fileListStatus(JSON.parse(data.status));
                }
            },
            heartbeatDelete = function browser_socketMessage_heartbeatDelete():void {
                const heartbeat:heartbeat = JSON.parse(event.data)["heartbeat-delete-agents"];
                if (heartbeat.agentType === "device") {
                    const deletion:agentList = <agentList>heartbeat.status,
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
                network.storage("settings");
            },
            heartbeatStatus = function browser_socketMessage_heartbeatStatus(heartbeat:heartbeat):void {
                const button:Element = document.getElementById(heartbeat.agentFrom);
                if (button !== null && button.getAttribute("data-agent-type") === heartbeat.agentType) {
                    button.setAttribute("class", <heartbeatStatus>heartbeat.status);
                }
            },
            heartbeat = function browser_socketMessage_heartbeat():void {
                const heartbeat:heartbeat = JSON.parse(event.data)["heartbeat-complete"];
                if (heartbeat.status === "deleted") {
                    share.deleteAgent(heartbeat.agentFrom, heartbeat.agentType);
                    share.update("");
                    network.storage("settings");
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
            invitation = function browser_socketMessage_invite():void {
                const inviteData:invite = JSON.parse(event.data)["invite-error"],
                    modal:Element = document.getElementById(inviteData.modal);
                if (modal === null) {
                    return;
                }
                let footer:HTMLElement = <HTMLElement>modal.getElementsByClassName("footer")[0],
                    content:HTMLElement = <HTMLElement>modal.getElementsByClassName("inviteUser")[0],
                    p:Element = document.createElement("p");
                p.innerHTML = inviteData.message;
                p.setAttribute("class", "error");
                content.appendChild(p);
                content.parentNode.removeChild(content.parentNode.lastChild);
                content.style.display = "block";
                footer.style.display = "block";
            },
            testBrowser = function browser_socketMessage_testBrowser():void {
                const data:testBrowserRoute = JSON.parse(event.data)["test-browser"];
                if (data.action === "close") {
                    window.close();
                    return;
                }
                if (data.action !== "reset-browser") {
                    remote.event(data, false);
                }
            };
        if (event.data.indexOf("{\"error\":") === 0) {
            error();
        } else if (event.data.indexOf("{\"file-list-status\":") === 0) {
            util.fileListStatus(JSON.parse(event.data)["file-list-status"]);
        } else if (event.data.indexOf("{\"fs-update-local\":") === 0 && browser.loadTest === false) {
            fsUpdateLocal();
        } else if (event.data.indexOf("{\"fs-update-remote\":") === 0) {
            fsUpdateRemote();
        } else if (event.data.indexOf("{\"heartbeat-complete\":") === 0) {
            heartbeat();
        } else if (event.data.indexOf("{\"heartbeat-status\":") === 0) {
            heartbeatStatus(JSON.parse(event.data)["heartbeat-status"]);
        } else if (event.data.indexOf("{\"heartbeat-delete-agents\":") === 0) {
            heartbeatDelete();
        } else if (event.data.indexOf("{\"message\":") === 0) {
            message.post(JSON.parse(event.data).message);
        } else if (event.data.indexOf("{\"invite-error\":") === 0) {
            invitation();
        } else if (event.data.indexOf("{\"invite\":") === 0) {
            const invitation:invite = JSON.parse(event.data).invite;
            if (invitation.action === "invite-complete") {
                invite.complete(invitation);
            } else {
                invite.respond(invitation);
            }
        } else if (event.data.indexOf("{\"test-browser\":") === 0 && location.href.indexOf("?test_browser") > 0) {
            testBrowser();
        } else if (event.data === "reload") {
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
                browser.socket = socket;
                if (device !== null) {
                    device.setAttribute("class", "active");
                }
                title.getElementsByTagName("h1")[0].innerHTML = titleText;
                title.setAttribute("class", "title");
            },
            close = function browser_webSocket_socketClose():void {
                const device:Element = (browser.data.hashDevice === "")
                        ? null
                        : document.getElementById(browser.data.hashDevice),
                    agentList:Element = document.getElementById("agentList"),
                    active:HTMLCollectionOf<Element> = agentList.getElementsByClassName("status-active");
                let a:number = active.length,
                    parent:Element;
                if (a > 0) {
                    do {
                        a = a - 1;
                        parent = <Element>active[a].parentNode;
                        parent.setAttribute("class", "offline");
                    } while (a > 0);
                }
                title.setAttribute("class", "title offline");
                title.getElementsByTagName("h1")[0].innerHTML = "Local service terminated.";
                if (device !== null) {
                    device.setAttribute("class", "offline");
                }
            };

        /* Handle Web Socket responses */
        if ((browser.testBrowser === null && testIndex < 0) || (browser.testBrowser !== null && testIndex > 0)) {
            socket.onopen = open;
            socket.onmessage = socketMessage;
            socket.onclose = close;
            callback();
        }
    };

export default webSocket;