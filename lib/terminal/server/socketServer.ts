
import { Socket } from "net";

import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";
import newHeartbeat from "./newHeartbeat.js";

// This function provides the events for a TCP socket server.
const socketServer = function terminal_server_socketServer(socketResponse:Socket):void {
    socketResponse.on("data", function terminal_server_socketServer_data(data:Buffer):void {
        const message:string = data.toString();
        if (message.indexOf("invite:") === 0 && message !== "invite:") {
            vars.ws.broadcast(message);
        } else if (message.indexOf("heartbeat:") === 0 && message !== "heartbeat:") {
            const heartbeat:heartbeat = JSON.parse(message.slice(message.indexOf("{")));
            if (serverVars.socketList[heartbeat.ip] === null) {
                newHeartbeat(heartbeat.ip, Number(heartbeat.port), heartbeat.user);
            }
            vars.ws.broadcast(message);
        }
    });
    socketResponse.on("end", function terminal_server_socketServer_end():void {
        log(["Socket server disconnected."]);
    });
    socketResponse.on("error", function terminal_server_socketServer_error(data:Buffer):void {
        const error:string = data.toString();
        log(["Socket server."]);
        if (error.indexOf("ECONNRESET") > 0) {
            log(["Connection reset.  That is a fancy way of saying the remote took a dump. :("]);
        } else {
            log(["Socket server error"]);
        }
        log([error]);
    });
};

export default socketServer;