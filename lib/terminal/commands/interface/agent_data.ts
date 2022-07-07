

/* lib/terminal/commands/interface/agent_data - Shell interface for agent_data which forms a report of agent data points. */

import agentData from "../library/agent_data.js";
import log from "../../utilities/log.js";

const interfaceAgentData = function terminal_commands_interface_agentData():void {
    const type:agentType = (process.argv[0].toLowerCase() === "device" || process.argv[0].toLowerCase() === "devices" || process.argv[0].toLowerCase() === "user" || process.argv[0].toLowerCase() === "users")
        ? process.argv[0].replace(/s$/, "") as agentType
        : null;
    agentData(type, function terminal_commands_interface_interface_agentData_callback(title:string, text:string[]):void {
        log.title(title);
        log(text);
    });
};

export default interfaceAgentData;