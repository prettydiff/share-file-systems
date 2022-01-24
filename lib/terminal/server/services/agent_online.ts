/* lib/terminal/server/services/agent_online - Determines if a remote agent is online and if so gathers their IP addresses and listening port numbers. */

import getAddress from "../../utilities/getAddress.js";
import ipResolve from "../transmission/ipResolve.js";
import sender from "../transmission/sender.js";
import serverVars from "../serverVars.js";

const agent_online = function terminal_server_services_agentOnline(socketData:socketData, transmit:transmit):void {
    const agentData:service_agentResolve = socketData.data as service_agentResolve,
        addresses:addresses = getAddress(transmit),
        local:string = ipResolve.parse(addresses.local),
        remote:string = ipResolve.parse(addresses.remote);
    serverVars[agentData.agentType][agentData.agent].ipAll = agentData.ipAll;
    if (remote !== "") {
        serverVars[agentData.agentType][agentData.agent].ipSelected = remote;
    }
    agentData.ipAll = (agentData.agentType === "device")
        ? serverVars.localAddresses
        : ipResolve.userAddresses();
    if (local !== "") {
        agentData.ipSelected = local;
    }
    sender.broadcast(socketData, "browser");
    sender.broadcast(socketData, "device");
};

export default agent_online;