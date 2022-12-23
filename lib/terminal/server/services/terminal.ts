
/* lib/terminal/server/services/terminal - Processes terminal console messaging for remote devices and display to the user in a browser. */

import { ChildProcess, spawn } from "child_process";

import sender from "../transmission/sender.js";
import vars from "../../utilities/vars.js";
import websocket from "../transmission/transmit_ws.js";

/**
 * A library to relay terminal logging between devices for presentation to the user in the browser.
 * ```typescript
 * interface module_terminal {
 *     input: (socketData:socketData) => void;
 *     output: (data:service_terminal) => void;
 * }
 * ``` */
const terminal:module_terminal = {
    input: function terminal_server_services_terminalInput(socketData:socketData):void {
        const data:service_terminal = socketData.data as service_terminal,
            sendOutput = function terminal_server_services_terminalInput_sendOutput():void {
                data.logs = vars.environment.log,
                terminal.output(data);
            };
        if (data.agentSource.agent === vars.settings.hashDevice && data.agentSource.agentType === "device") {
            // source - local device
            if (data.instruction === "") {
                sendOutput();
            } else {
                const shell:ChildProcess = spawn(data.instruction, [], {
                        shell: true
                    }),
                    dataHandle = function terminal_server_osNotification_wsClients_getHandle_data(output:Buffer):void {
                        data.logs = output.toString().replace(/\r\n/g, "\n").split("\n");
                        terminal.output(data);
                    };
                shell.on("close", function terminal_server_osNotification_wsClients_flash_close():void {
                    shell.kill(0);
                });
                shell.stdout.on("data", dataHandle);
                // shell.stdout.on("error", dataHandle);
            }
        } else {

        }
    },
    output: function terminal_server_services_terminalOutput(data:service_terminal):void {
        if (data.agentRequest.agent === vars.settings.hashDevice && data.agentRequest.agentType === "device") {
            sender.broadcast({
                data: data,
                service: "terminal"
            }, "browser");
        }
    }
};

export default terminal;