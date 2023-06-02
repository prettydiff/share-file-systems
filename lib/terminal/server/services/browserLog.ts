
/* lib/terminal/server/services/browserLog - This handy utility writes log output to the terminal from the browser's console.log for more direct log visibility. */

import log from "../../utilities/log.js";
import transmit_http from "../transmission/transmit_http.js";
import vars from "../../utilities/vars.js";

const browserLog = function terminal_server_services_browserLog(socketData:socketData, transmit:transmit_type):void {
    const logData:service_log = socketData.data as service_log,
        browserIndex:number = vars.test.type.indexOf("browser");
    if (vars.environment.command === "perf") {
        return;
    }
    if (browserIndex < 0 || (browserIndex === 0 && logData[0] !== null)) {
        // the log function accepts string[] but service_log = any[] to capture error and object logging from the browser
        // eslint-disable-next-line
        log(logData);
    }
    transmit_http.respondEmpty(transmit);
};

export default browserLog;