
/* lib/terminal/server/services/terminal - Processes terminal console messaging for remote devices and display to the user in a browser. */

import sender from "../transmission/sender.js";
import vars from "../../utilities/vars.js";

/**
 * A library to relay terminal logging between devices for presentation to the user in the browser.
 * ```typescript
 * interface module_terminal {
 *     input: (socketData:socketData) => void;
 *     output: (socketData:socketData) => void;
 * }
 * ``` */
const terminal:module_terminal = {
    input: function terminal_server_services_terminalInput(socketData:socketData):void {
        const data:service_terminal_input = socketData.data as service_terminal_input,
            sendOutput = function terminal_server_services_terminalInput_sendOutput():void {
                const output:service_terminal_output = {
                    agentRequest: data.agentRequest,
                    agentSource: data.agentSource,
                    logs: vars.environment.log
                };
                terminal.output({
                    data: output,
                    service: "terminal-output"
                });
            };
        if (data.agentSource.agent === vars.settings.hashDevice && data.agentSource.agentType === "device") {
            // source - local device
            if (data.instruction === "") {
                sendOutput();
            }
        } else {

        }
    },
    output: function terminal_server_services_terminalOutput(socketData:socketData):void {
        const data:service_terminal_output = socketData.data as service_terminal_output;
        if (data.agentRequest.agent === vars.settings.hashDevice && data.agentRequest.agentType === "device") {
            sender.broadcast(socketData, "browser");
        }
    }
};

export default terminal;