
/* lib/terminal/server/services/fileListStatusUser - A library to transmit share updates to remote users for distribution to their devices. */

import agent_http from "../transmission/agent_http.js";
import agent_ws from "../transmission/agent_ws.js";
import serverVars from "../serverVars.js";

const fileListStatusUser = function terminal_server_services_fileListStatusUser(socketData:socketData, transmit:transmit):void {
    
    const status:fileStatusMessage = socketData.data as fileStatusMessage;
    if (status.agentType === "user") {
        const devices:string[] = Object.keys(serverVars.device),
            sendStatus = function terminal_server_services_fileListStatus_sendStatus(agent:string):void {
                agent_http.request({
                    agent: agent,
                    agentType: "device",
                    callback: null,
                    ip: serverVars.device[agent].ipSelected,
                    payload: {
                        data: socketData.data,
                        service: "file-list-status-device"
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
    agent_ws.broadcast({
        data: status,
        service: "file-list-status-device"
    }, "browser");
    transmit.socket.destroy();
};

export default fileListStatusUser;