/* lib/terminal/server/transmission/transmit_logger - Logs tranmission data to the console when in verbose mode. */

import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const transmitLogger = function terminal_server_transmission_transmitLogger(config:config_transmit_logger):void {
    vars.network.count[config.transmit.type][config.direction] = vars.network.count[config.transmit.type][config.direction] + 1;
    vars.network.size[config.transmit.type][config.direction] = vars.network.size[config.transmit.type][config.direction] + config.size;
    if (vars.settings.verbose === true) {
        if (config.socketData.service === "GET") {
            log([
                `GET response to browser for ${config.socketData.data}`
            ]);
        } else {
            log([
                `${config.direction} ${config.transmit.type} from ${config.transmit.socket.type} ${config.transmit.socket.hash}`,
                config.socketData.service,
                // @ts-ignore - A deliberate type violation to output a formatted object to the terminal
                config.socketData.data.toString(),
                ""
            ]);
        }
    }
};

export default transmitLogger;