
import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const newHeartbeat = function terminal_server_newHeartbeat(ip:string, port:number, user:string):void {
    if (ip.charAt(0) === "[") {
        ip = ip.slice(1, ip.length - 1);
    }
    serverVars.socketList[ip] = new vars.node.net.Socket();
    serverVars.socketList[ip].connect(port, ip, function terminal_server_newHeartbeat_inviteConnect():void {
        serverVars.socketList[ip].write(`heartbeat:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","port":${serverVars.serverPort},"status":"active","user":"${user}"}`);
    });
    serverVars.socketList[ip].on("data", function terminal_server_newHeartbeat_inviteData(socketData:string):void {
        log([socketData]);
    });
    serverVars.socketList[ip].on("error", function terminal_server_newHeartbeat_inviteError(errorMessage:nodeError):void {
        if (ip.indexOf(":") > 0) {
            vars.ws.broadcast(`heartbeat:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","port":${serverVars.serverPort},"status":"offline","user":"@[${ip}]:${port}"}`);
        } else {
            vars.ws.broadcast(`heartbeat:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","port":${serverVars.serverPort},"status":"offline","user":"@${ip}:${port}"}`);
        }
        log([`Socket error on ${ip}.`, errorMessage.toString()]);
        if (serverVars.socketList[ip] !== undefined && serverVars.socketList[ip].destroyed === true) {
            serverVars.socketList[ip].destroy();
            serverVars.socketList[ip] = null;
        }
    });
};

export default newHeartbeat;