
import error from "../error.js";
import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const library = {
        error: error,
        log: log
    },
    // This logic will push out heartbeat data for existing connections only, so most of this logic is just for task:invite, because inviting a user must require a new socket
    inviteHeartbeat = function terminal_server_inviteHeartbeat(dataString:string, task:string):void {
        const data:inviteHeartbeat = JSON.parse(dataString);
        if (serverVars.socketList[data.ip] === undefined && task === "invite") {
            serverVars.socketList[data.ip] = new vars.node.net.Socket();
            serverVars.socketList[data.ip].connect(data.port, data.ip, function terminal_server_inviteHeartbeat_inviteConnect():void {
                serverVars.socketList[data.ip].write(`invite:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","message":"${data.message}","modal":"${data.modal}","name":"${data.name}","port":"${serverVars.serverPort}","shares":${JSON.stringify(data.shares)},"status":"${data.status}"}`);
            });
            serverVars.socketList[data.ip].on("data", function terminal_server_inviteHeartbeat_inviteData(socketData:string):void {
                library.log([socketData]);
            });
            serverVars.socketList[data.ip].on("error", function terminal_server_inviteHeartbeat_inviteError(errorMessage:nodeError):void {
                vars.ws.broadcast(`invite-error:{"error":"${errorMessage.toString()}","modal":"${data.modal}"}`);
                library.log([`Socket error on ${data.ip}.`, errorMessage.toString()]);
                library.error([errorMessage.toString()]);
                if (serverVars.socketList[data.ip] !== undefined && serverVars.socketList[data.ip].destroyed === true) {
                    serverVars.socketList[data.ip].destroy();
                    serverVars.socketList[data.ip] = null;
                }
            });
        } else if (serverVars.socketList[data.ip] !== null && serverVars.socketList[data.ip].connecting === false) {
            if (serverVars.socketList[data.ip].connecting === true) {
                const failMessage:string = (serverVars.socketList[data.ip].localAddress === "0.0.0.0")
                    ? `Socket to ${vars.text.cyan + vars.text.bold + data.ip + vars.text.none} appears to be ${vars.text.angry}broken${vars.text.none}.`
                    : "Write to a socket not connected.";
                library.log([
                    failMessage,
                    `  ${vars.text.angry}*${vars.text.none} Specified Address: ${data.ip}`,
                    `  ${vars.text.angry}*${vars.text.none} Specified Port   : ${data.port}`,
                    `  ${vars.text.angry}*${vars.text.none} Local Address    : ${vars.text.angry + serverVars.socketList[data.ip].localAddress + vars.text.none}`,
                    `  ${vars.text.angry}*${vars.text.none} Local Port       : ${serverVars.socketList[data.ip].localPort}`,
                    `  ${vars.text.angry}*${vars.text.none} Remote Address   : ${serverVars.socketList[data.ip].remoteAddress}`,
                    `  ${vars.text.angry}*${vars.text.none} Remote Port      : ${serverVars.socketList[data.ip].remotePort}`,
                    ""
                ]);
            }
            if (task === "invite") {
                serverVars.socketList[data.ip].write(`invite:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","message":"${data.message}","modal":"${data.modal}","name":"${data.name}","port":"${serverVars.serverPort}","shares":${JSON.stringify(data.shares)},"status":"${data.status}"}`);
            } else {
                serverVars.socketList[data.ip].write(`heartbeat:{"ip":"${serverVars.addresses[0][1][1]}","family":"${serverVars.addresses[0][1][2]}","port":${serverVars.serverPort},"refresh":${data.refresh},"status":"${data.status}","user":"${data.user}"}`);
            }
        }
    };

export default inviteHeartbeat;