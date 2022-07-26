/* lib/terminal/server/transmission/transmit_logger - Logs tranmission data to the console when in verbose mode. */

import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const transmitLogger = function terminal_server_transmission_transmitLogger(socketData:{data:Buffer | socketDataType | string; service:requestType;}, transmit:transmit_type, direction:"receive"|"send"):void {
    if (vars.settings.verbose === true) {
        if (socketData.service === "GET") {
            log([
                `GET response to browser for ${socketData.data}`
            ]);
        } else {
            log([
                `${direction} ${transmit.type} from ${transmit.socket.type} ${transmit.socket.hash}`,
                socketData.service,
                // @ts-ignore - A deliberate type violation to output a formatted object to the terminal
                socketData.data,
                ""
            ]);
        }
    }
};

export default transmitLogger;