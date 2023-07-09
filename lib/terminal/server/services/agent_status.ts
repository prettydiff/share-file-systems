/* lib/terminal/server/services/agent_status - Publishes activity status of agents. */

import sender from "../transmission/sender.js";
import vars from "../../utilities/vars.js";

const agent_status = function terminal_server_services_agentStatus(socketData:socketData):void {
    const data:service_agentStatus = socketData.data as service_agentStatus,
        agent:agent = vars.agents[data.agentType][data.agent];

    if (agent === undefined) {
        return;
    }
    agent.status = data.status;

    // update all listening browsers on the local machine
    sender.broadcast(socketData, "browser");

    if (data.agent === vars.identity.hashDevice) {
        vars.settings.status = data.status;
    } else {
        if (data.respond === true) {
            const device:string = (data.agentType === "device")
                ? data.agent
                : "";
            sender.send({
                data: {
                    agent: (data.agentType === "device")
                        ? vars.identity.hashDevice
                        : vars.identity.hashUser,
                    agentType: data.agentType,
                    broadcast: true,
                    respond: (data.respond === true && data.agent === vars.identity.hashDevice && data.agentType === "device" && data.status === "active"),
                    status: vars.settings.status
                },
                service: "agent-status"
            }, {
                device: device,
                user: vars.identity.hashUser
            });
        }
    }

    if (data.broadcast === true) {
        data.broadcast = false;

        // from a browser on local device
        if (data.agent === vars.identity.hashDevice && data.agentType === "device") {
            // transmit to other devices
            sender.broadcast(socketData, "device");

            // transmit to other users
            data.agent = vars.identity.hashUser;
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