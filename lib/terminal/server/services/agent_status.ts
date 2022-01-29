/* lib/terminal/server/services/agent_status - Publishes activity status of agents. */

import sender from "../transmission/sender.js";
import serverVars from "../serverVars.js";

const agent_status = function terminal_server_services_agentStatus(socketData:socketData):void {
    const data:service_agentStatus = socketData.data as service_agentStatus;

    // update all listening browsers on the local machine
    sender.broadcast(socketData, "browser");

    if (data.broadcast === true) {
        data.broadcast = false;

        // from a browser on local device
        if (data.agent === serverVars.hashDevice && data.agentType === "device") {
            // transmit to other devices
            sender.broadcast(socketData, "device");

            // transmit to other users
            data.agent = serverVars.hashUser;
            data.agentType = "user";
            data.broadcast = true;
            sender.broadcast({
                data: data,
                service: socketData.service
            }, "user");
        } else if (data.agentType === "user") {
            // transmit to devices of a remote user
            sender.broadcast(socketData, "device");
        }
    }
};

export default agent_status;