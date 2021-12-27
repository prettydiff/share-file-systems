
/* lib/terminal/fileService/copyFile - Handles the copy-file service to push file data over the network. */

import serviceCopy from "./serviceCopy.js";
import serverVars from "../server/serverVars.js";
import transmit_http from "../server/transmission/transmit_http.js";
import userPermissions from "./userPermissions.js";
import transmit_ws from "../server/transmission/transmit_ws.js";

const copyFile = function terminal_fileService_copyFile(dataPackage:socketData, transmit:transmit):void {
    const copyData:service_copyFile = dataPackage.data as service_copyFile;
    if (copyData.agentWrite.device === serverVars.hashDevice) {
        serviceCopy.actions.sendFile(copyData, transmit);
    } else if (copyData.agentWrite.user === serverVars.hashUser) {
        const requestCopy = function terminal_fileService_copyFile_requestCopy(device:string):void {
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
        };
        userPermissions(copyData.agentWrite, "copy", requestCopy);
        /*if (copyData.agent.modalAddress.indexOf(shareItem.name) === 0) {
            if (shareItem.readOnly === true) {
                respond(`Action ${config.action.replace("fs-", "")} is not allowed as this location is in a read only share.`, "readOnly");
                return;
            }
            unmask(copyData.agent.device, requestCopy);
        }
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
        });*/
    } else {
        const agentType:agentType = (copyData.agentWrite.user === serverVars.hashUser)
                ? "device"
                : "user",
            agent:string = copyData.agentWrite[agentType];
        /*transmit_http.requestCopy({
            agent: copyData.agent.user,
            agentType: "user",
            dataString: JSON.stringify(copyData),
            transmit: transmit
        });*/
        transmit_ws.send(dataPackage, transmit_ws.clientList[agentType][agent], 1);
    }
};

export default copyFile;