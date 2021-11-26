
/* lib/terminal/server/services/fileListStatusDevice - Receives status updates from remote users for distribution to your devices. */

import responder from "../transmission/responder.js";
import serverVars from "../serverVars.js";
import transmit_http from "../transmission/transmit_http.js";
import transmit_ws from "../transmission/transmit_ws.js";

const fileListStatusDevice = function terminal_server_services_fileListStatusDevice(socketData:socketData, transmit:transmit):void {
    transmit_ws.broadcast(socketData, "browser");
    if (serverVars.testType === "service") {
        responder(socketData, transmit);
    } else {
        transmit_http.respondEmpty(transmit);
    }
};

export default fileListStatusDevice;