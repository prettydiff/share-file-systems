
/* lib/browser/webSocket - Handles web socket events and associated errors. This where most communications from outside the browser are processed. */
import browser from "./browser.js";
import network from "./network.js";

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
        network.receive(event.data);
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
                webSocket.send = function browser_webSocket_sendWrapper(data:socketData):void {console.log(data.service);
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