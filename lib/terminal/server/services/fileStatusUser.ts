
/* lib/terminal/server/services/fileStatusUser - A library to transmit share updates to remote users for distribution to their devices. */

import serverVars from "../serverVars.js";
import transmit_http from "../transmission/transmit_http.js";
import transmit_ws from "../transmission/transmit_ws.js";

const fileStatusUser = function terminal_server_services_fileStatusUser(socketData:socketData, transmit:transmit):void {
    
    const status:service_fileStatus = socketData.data as service_fileStatus;
    if (status.agentType === "user") {
        const devices:string[] = Object.keys(serverVars.device),
            sendStatus = function terminal_server_services_fileStatus_sendStatus(agent:string):void {
                transmit_http.request({
                    agent: agent,
                    agentType: "device",
                    callback: null,
                    ip: serverVars.device[agent].ipSelected,
                    payload: {
                        data: socketData.data,
                        service: "file-status-device"
                    },
                    port: serverVars.device[agent].ports.http
                });
            };
        let a:number = devices.length;
        do {
            a = a - 1;
            if (devices[a] !== serverVars.hashDevice) {
                sendStatus(devices[a]);
            }
        } while (a > 0);
    }
    transmit_ws.broadcast({
        data: status,
        service: "file-status-device"
    }, "browser");
    transmit_http.respondEmpty(transmit);
};

export default fileStatusUser;