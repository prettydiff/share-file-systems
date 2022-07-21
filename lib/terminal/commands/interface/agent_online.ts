/* lib/terminal/commands/interface/agent_online - Shell interface for agent_online which is a connectivity tester to remote agents. */

import agentOnline from "../library/agent_online.js";
import error from "../../utilities/error.js";
import vars from "../../utilities/vars.js";

const interfaceAgentOnline = function terminal_commands_interface_agentOnline(callback:commandCallback):void {
    if (process.argv[0] === undefined) {
        error([
            `${vars.text.angry}Missing parameter for agent hash.${vars.text.none}  Example:`,
            `${vars.text.green + vars.terminal.command_instruction}test_agent a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e${vars.text.none}`
        ], true);
        return;
    }
    agentOnline(callback);
};

export default interfaceAgentOnline;