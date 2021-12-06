/* lib/terminal/server/services/agent_status - Publishes activity status of agents. */

import serverVars from "../serverVars.js";
import transmit_http from "../transmission/transmit_http.js";
import transmit_ws from "../transmission/transmit_ws.js";

const agent_status = function terminal_server_services_agentStatus(socketData:socketData, transmit:transmit):void {
    const data:service_agentStatus = socketData.data as service_agentStatus;

    // update all listening browsers on the local machine
    transmit_ws.broadcast(socketData, "browser");

    if (data.broadcast === true) {
        data.broadcast = false;

        // from a browser on local device
        if (data.agent === serverVars.hashDevice && data.agentType === "device") {
            // transmit to other devices
            transmit_ws.broadcast(socketData, "device");

            // transmit to other users
            data.agent = serverVars.hashUser;
            data.agentType = "user";
            data.broadcast = true;
            transmit_ws.broadcast({
                data: data,
                service: socketData.service
            }, "user");
        } else if (data.agentType === "user") {
            // transmit to devices of a remote user
            transmit_ws.broadcast(socketData, "device");
        }

        if (transmit !== null && transmit.type === "http") {
            transmit_http.respondEmpty(transmit);
        }
    }
};

export default agent_status;