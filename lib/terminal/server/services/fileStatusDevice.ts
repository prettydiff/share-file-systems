
/* lib/terminal/server/services/fileStatusDevice - Receives status updates from remote users for distribution to your devices. */

import responder from "../transmission/responder.js";
import sender from "../transmission/sender.js";
import serverVars from "../serverVars.js";
import transmit_http from "../transmission/transmit_http.js";

const fileStatusDevice = function terminal_server_services_fileStatusDevice(socketData:socketData, transmit:transmit):void {
    sender.broadcast(socketData, "browser");
    if (serverVars.testType === "service") {
        responder(socketData, transmit);
    } else {
        transmit_http.respondEmpty(transmit);
    }
};

export default fileStatusDevice;