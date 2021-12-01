
/* lib/terminal/fileService/copyFile - Handles the copy-file service to push file data over the network. */

import serviceCopy from "./serviceCopy.js";
import serverVars from "../server/serverVars.js";
import transmit_http from "../server/transmission/transmit_http.js";
import user from "./user.js";

const copyFile = function terminal_fileService_copyFile(dataPackage:socketData, transmit:transmit):void {
    // copy-file just returns a file in a HTTP response
    const copyData:service_copyFile = dataPackage.data as service_copyFile;
    if (copyData.agent.id === serverVars.hashDevice) {
        serviceCopy.actions.sendFile(copyData, transmit);
    } else if (copyData.agent.id === serverVars.hashUser) {
        user({
            action: "copy-request",
            agent: copyData.agent,
            callback: function terminal_fileService_copyFile_userCallback(device:string):void {
                if (device === serverVars.hashDevice) {
                    serviceCopy.actions.sendFile(copyData, transmit);
                } else {
                    transmit_http.requestCopy({
                        agent: device,
                        agentType: "device",
                        dataString: JSON.stringify(copyData),
                        transmit: transmit
                    });
                }
            },
            transmit: transmit
        });
    } else {
        transmit_http.requestCopy({
            agent: copyData.agent.id,
            agentType: copyData.agent.type,
            dataString: JSON.stringify(copyData),
            transmit: transmit
        });
    }
};

export default copyFile;