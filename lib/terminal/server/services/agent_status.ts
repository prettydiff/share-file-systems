/* lib/terminal/server/services/agent_status - Publishes activity status of agents. */

import network from "../transmission/network.js";
import vars from "../../utilities/vars.js";

const agent_status = function terminal_server_services_agentStatus(socketData:socketData):void {
    const data:service_agentStatus = socketData.data as service_agentStatus,
        agent:agent = vars.agents[data.agentType][data.agent],
        routeDevice:transmit_agents = {
            device: "broadcast",
            user: vars.identity.hashUser
        };

    if (agent === undefined) {
        return;
    }
    agent.status = data.status;

    // update all listening browsers on the local machine
    socketData.route = {
        device: "browser",
        user: "browser"
    };
    network.send(socketData);

    if (data.agent === vars.identity.hashDevice) {
        vars.settings.status = data.status;
    } else {
        if (data.respond === true) {
            const route:transmit_agents = (data.agentType === "device")
                ? {
                    device: data.agent,
                    user: vars.identity.hashUser
                }
                : {
                    device: "broadcast",
                    user: data.agent
                };
            network.send({
                data: {
                    agent: (data.agentType === "device")
                        ? vars.identity.hashDevice
                        : vars.identity.hashUser,
                    agentType: data.agentType,
                    broadcast: true,
                    respond: (data.respond === true && data.agent === vars.identity.hashDevice && data.agentType === "device" && data.status === "active"),
                    status: vars.settings.status
                },
                route: route,
                service: "agent-status"
            });
        }
    }

    if (data.broadcast === true) {
        data.broadcast = false;

        // from a browser on local device
        if (data.agent === vars.identity.hashDevice && data.agentType === "device") {
            // transmit to other devices
            socketData.route = routeDevice;
            network.send(socketData);

            // transmit to other users
            data.agent = vars.identity.hashUser;
            data.agentType = "user";
            data.broadcast = true;
            network.send({
                data: data,
                route: {
                    device: "broadcast",
                    user: "broadcast"
                },
                service: socketData.service
            });
        } else if (data.agentType === "user") {
            // transmit to devices of a remote user
            socketData.route = routeDevice;
            network.send(socketData);
        }
    }
};

export default agent_status;