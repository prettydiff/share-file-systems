
/* lib/browser/utilities/webSocket - Handles web socket events and associated errors. This where most communications from outside the browser are processed. */
import browser from "./browser.js";
import network from "./network.js";

const webSocket:module_browserSocket = {
    error: function browser_utilities_socketError():void {
        setTimeout(function browser_utilities_socketError_delay():void {
            webSocket.start(null, webSocket.hash, webSocket.type);
        }, browser.ui.statusTime);
    },
    hash: "",
    send: null,
    sock: (function browser_utilities_socket():websocket_local {
        // A minor security circumvention.
        const socket:websocket_local = WebSocket as websocket_local;
        // eslint-disable-next-line
        WebSocket = null;
        return socket;
    }()),
    start: function browser_utilities_webSocket(callback:() => void, hashDevice:string, type:string):WebSocket {
        const title:HTMLElement = document.getElementById("title-bar"),
            scheme:string = (location.protocol.toLowerCase() === "http:")
                ? "ws"
                : "wss",
            socket:websocket_browser = new webSocket.sock(`${scheme}://localhost:${browser.network.ports.ws}/`, [`${type}-${hashDevice}`]) as websocket_browser,
            open = function browser_utilities_webSocket_socketOpen():void {
                if (title.getAttribute("class") === "title offline") {
                    location.reload();
                } else {
                    title.setAttribute("class", "title");
                    if (type === "primary") {
                        const messageDelay = function browser_init_complete_messageDelay():void {
                            if (browser.loadQueue.length > 0) {
                                network.send(browser.loadQueue[0].data, browser.loadQueue[0].service);
                                browser.loadQueue.splice(0, 1);
                                if (browser.loadQueue.length > 0) {
                                    setTimeout(browser_init_complete_messageDelay, 5);
                                }
                            }
                        };
                        browser.socket = socket;
                        messageDelay();
                    }
                    socket.type = type;
                    if (callback !== null) {
                        callback();
                    }
                }
            },
            close = function browser_utilities_webSocket_socketClose():void {
                if (browser.identity.hashDevice !== "" && socket.type === "primary") {
                    const device:HTMLElement = document.getElementById(browser.identity.hashDevice),
                        agentList:HTMLElement = document.getElementById("agentList"),
                        active:HTMLCollectionOf<Element> = agentList.getElementsByClassName("status-active");
                    let a:number = active.length;
                    if (a > 0) {
                        do {
                            a = a - 1;
                            active[a].parentNode.setAttribute("class", "offline");
                        } while (a > 0);
                    }
                    browser.socket = null;
                    title.setAttribute("class", "title offline");
                    title.getElementsByTagName("h1")[0].appendText("Disconnected.", true);
                    webSocket.send = null;
                    if (device !== null) {
                        device.setAttribute("class", "offline");
                    }
                }
            },
            message = function browser_utilities_webSocket_message(event:websocket_event):void {
                if (typeof event.data !== "string") {
                    return;
                }
                network.receive(event.data);
            };
        webSocket.hash = hashDevice;
        webSocket.type = type;

        /* Handle Web Socket responses */
        socket.onopen = open;
        socket.onmessage = message;
        socket.onclose = close;
        socket.onerror = function browser_utilities_webSocket_error():void {
            webSocket.error();
        };

        // do not put a console.log in this function without first removing the log service from /lib/browser/index.ts
        // otherwise this will produce a race condition with feedback loop
        webSocket.send = function browser_utilities_webSocket_sendWrapper(data:socketData):void {
            // connecting
            if (browser.socket.readyState === 0) {
                setTimeout(function browser_utilities_webSocket_sendWrapper_delay():void {
                    browser_utilities_webSocket_sendWrapper(data);
                }, 10);
            }
            // open
            if (browser.socket.readyState === 1) {
                browser.socket.send(JSON.stringify(data));
            }
        };
        return browser.socket;
    },
    type: ""
};

export default webSocket;