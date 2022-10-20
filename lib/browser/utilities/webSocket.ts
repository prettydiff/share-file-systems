
/* lib/browser/utilities/webSocket - Handles web socket events and associated errors. This where most communications from outside the browser are processed. */
import browser from "./browser.js";
import network from "./network.js";

const webSocket:module_browserSocket = {
    error: function browser_utilities_socketError():void {
        setTimeout(function browser_utilities_socketError_delay():void {
            webSocket.start(null, webSocket.hash);
        }, browser.data.statusTime);
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
    start: function browser_utilities_webSocket(callback:() => void, hashDevice:string):void {
        const title:Element = document.getElementById("title-bar"),
            scheme:string = (location.protocol === "http:")
                ? "ws"
                : "wss",
            socket:WebSocket = new webSocket.sock(`${scheme}://localhost:${browser.network.ports.ws}/`, [`browser-${hashDevice}`]),
            open = function browser_utilities_webSocket_socketOpen():void {
                if (title.getAttribute("class") === "title offline") {
                    location.reload();
                } else {
                    title.setAttribute("class", "title");
                    browser.socket = socket;
                    if (callback !== null) {
                        callback();
                    }
                }
            },
            close = function browser_utilities_webSocket_socketClose():void {
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
                    browser.socket = null;
                    title.setAttribute("class", "title offline");
                    title.getElementsByTagName("h1")[0].innerHTML = "Disconnected.";
                    webSocket.send = null;
                    if (device !== null) {
                        device.setAttribute("class", "offline");
                    }
                }
            },
            message = function browser_utilities_socketMessage(event:websocket_event):void {
                if (typeof event.data !== "string") {
                    return;
                }
                network.receive(event.data);
            };
        webSocket.hash = hashDevice;

        /* Handle Web Socket responses */
        socket.onopen = open;
        socket.onmessage = message;
        socket.onclose = close;
        socket.onerror = webSocket.error;

        // do not put a console.log in this function without first removing the log service from /lib/browser/index.ts
        // otherwise this will produce a race condition with feedback loop
        webSocket.send = function browser_utilities_webSocket_sendWrapper(data:socketData):void {
            // connecting
            if (socket.readyState === 0) {
                setTimeout(function browser_utilities_webSocket_sendWrapper_delay():void {
                    browser_utilities_webSocket_sendWrapper(data);
                }, 10);
            }
            // open
            if (socket.readyState === 1) {
                socket.send(JSON.stringify(data));
            }
        };
    }
};

export default webSocket;