
/* lib/browser/utilities/websocket_open - Opens websocket connections using standard web APIs in the browser. */

import browser from "./browser.js";

const websocket_open = function browser_utilities_websocketOpen(handler:() => void, type:string, hashDevice:string):websocket_browser {
    const scheme:string = (location.protocol.toLowerCase() === "http:")
            ? "ws"
            : "wss",
        socket:websocket_browser = new browser.socketConstructor(`${scheme}://localhost:${browser.network.port}/`, [`${type}-${hashDevice}`]) as websocket_browser;
    socket.hash = hashDevice;
    socket.type = type;
    socket.onopen = handler;
    return socket;
};

export default websocket_open;