/* lib/terminal/server/services/agent_online - Determines if a remote agent is online and if so gathers their IP addresses and listening port numbers. */

import getAddress from "../../utilities/getAddress.js";
import ipResolve from "../transmission/ipResolve.js";
import network from "../transmission/network.js";
import vars from "../../utilities/vars.js";

const agent_online = function terminal_server_services_agentOnline(socketData:socketData, transmit:transmit_type):void {
    const agentData:service_agentResolve = socketData.data as service_agentResolve,
        addresses:transmit_addresses_socket = getAddress(transmit),
        local:string = addresses.local.address,
        remote:string = addresses.remote.address;
    vars.agents[agentData.agentType][agentData.agent].ipAll = agentData.ipAll;
    if (remote !== "") {
        vars.agents[agentData.agentType][agentData.agent].ipSelected = remote;
    }
    agentData.ipAll = (agentData.agentType === "device")
        ? vars.network.addresses
        : ipResolve.userAddresses();
    if (local !== "") {
        agentData.ipSelected = local;
    }
    socketData.route = {
        device: "browser",
        user: "browser"
    };
    network.send(socketData);
    socketData.route = {
        device: "broadcast",
        user: vars.identity.hashUser
    };
    network.send(socketData);
};

export default agent_online;