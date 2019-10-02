
import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const newHeartbeat = function terminal_server_newHeartbeat(heartbeat:heartbeat):void {
    if (heartbeat.ip.charAt(0) === "[") {
        heartbeat.ip = heartbeat.ip.slice(1, heartbeat.ip.length - 1);
    }
    serverVars.socketList[heartbeat.ip] = new vars.node.net.Socket();
    serverVars.socketList[heartbeat.ip].connect(heartbeat.port, heartbeat.ip, function terminal_server_newHeartbeat_inviteConnect():void {
        serverVars.socketList[heartbeat.ip].write(`heartbeat:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","port":${serverVars.serverPort},"refresh":false,"status":"active","user":"${heartbeat.user}"}`);
    });
    serverVars.socketList[heartbeat.ip].on("data", function terminal_server_newHeartbeat_inviteData(socketData:string):void {
        log([socketData]);
    });
    serverVars.socketList[heartbeat.ip].on("error", function terminal_server_newHeartbeat_inviteError(errorMessage:nodeError):void {console.log(errorMessage);
        if (heartbeat.ip.indexOf(":") > 0) {
            vars.ws.broadcast(`heartbeat:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","port":${serverVars.serverPort},"refresh":false,"status":"offline","user":"@[${heartbeat.ip}]:${heartbeat.port}"}`);
        } else {
            vars.ws.broadcast(`heartbeat:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","port":${serverVars.serverPort},"refresh":false,"status":"offline","user":"@${heartbeat.ip}:${heartbeat.port}"}`);
        }
        log([`Socket error on ${heartbeat.ip}.`, errorMessage.toString()]);
        if (serverVars.socketList[heartbeat.ip] !== undefined && serverVars.socketList[heartbeat.ip].destroyed === true) {
            serverVars.socketList[heartbeat.ip].destroy();
            serverVars.socketList[heartbeat.ip] = null;
        }
    });
};

export default newHeartbeat;