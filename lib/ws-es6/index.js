
// ported from NPM package ws@7.1.2 to achieve compliance with ES6 modules

import WebSocket from "./lib/websocket.js";
import createWebSocketStream from "./lib/stream.js";
import Server from "./lib/websocket-server.js";
import Receiver from "./lib/receiver.js";
import Sender from "./lib/sender.js";

WebSocket.createWebSocketStream = createWebSocketStream;
WebSocket.Server = Server;
WebSocket.Receiver = Receiver;
WebSocket.Sender = Sender;

export default WebSocket;
