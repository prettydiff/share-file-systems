
/* lib/terminal/server/services/browserLog - This handy utility writes log output to the terminal from the browser's console.log for more direct log visibility. */

import agent_http from "../transmission/agent_http.js";
import log from "../../utilities/log.js";
import serverVars from "../serverVars.js";

const browserLog = function terminal_server_services_browserLog(socketData:socketData, transmit:transmit):void {
    const logData:service_log = socketData.data as service_log,
        browserIndex:number = serverVars.testType.indexOf("browser");
    if (browserIndex < 0 || (browserIndex === 0 && logData[0] !== null && logData[0].toString().indexOf("Executing delay on test number") !== 0)) {
        log(logData);
    }
    agent_http.respondEmpty(transmit);
};

export default browserLog;