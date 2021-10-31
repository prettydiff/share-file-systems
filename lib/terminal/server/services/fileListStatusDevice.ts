
/* lib/terminal/server/services/fileListStatusDevice - Receives status updates from remote users for distribution to your devices. */

import agent_ws from "../transmission/agent_ws.js";
import responder from "../transmission/responder.js";
import serverVars from "../serverVars.js";

const fileListStatusDevice = function terminal_server_services_fileListStatusDevice(socketData:socketData, transmit:transmit):void {
    agent_ws.broadcast(socketData, "browser");
    if (serverVars.testType === "service") {
        responder(socketData, transmit);
    } else {
        transmit.socket.destroy();
    }
};

export default fileListStatusDevice;