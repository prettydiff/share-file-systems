
/* lib/terminal/server/services/fileStatusUser - A library to transmit share updates to remote users for distribution to their devices. */

import sender from "../transmission/sender.js";
import serverVars from "../serverVars.js";

const fileStatusUser = function terminal_server_services_fileStatusUser(socketData:socketData):void {
    
    const status:service_fileStatus = socketData.data as service_fileStatus;
    if (status.agentType === "user") {
        const devices:string[] = Object.keys(serverVars.device),
            sendStatus = function terminal_server_services_fileStatus_sendStatus(agent:string):void {
                sender({
                    data: socketData.data,
                    service: "file-status-device"
                }, agent, serverVars.hashUser);
            };
        let a:number = devices.length;
        do {
            a = a - 1;
            if (devices[a] !== serverVars.hashDevice) {
                sendStatus(devices[a]);
            }
        } while (a > 0);
    }
    sender.broadcast({
        data: status,
        service: "file-status-device"
    }, "browser");
};

export default fileStatusUser;