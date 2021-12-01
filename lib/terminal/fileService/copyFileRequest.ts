
/* lib/terminal/fileService/copyFileRequest - Handles the service copy-request-files to request a list of files from a file system tree of a remote agent. */

import responder from "../server/transmission/responder.js";
import route from "./route.js";
import serviceCopy from "./serviceCopy.js";
import serverVars from "../server/serverVars.js";
import user from "./user.js";

const copyFileRequest = function terminal_fileService_copyFileRequest(dataPackage:socketData, transmit:transmit):void {
    const data:service_copyFileRequest = dataPackage.data as service_copyFileRequest,
        statusData:service_copy = data.copyData as service_copy,
        routeRequestFiles = function terminal_fileService_copyFileRequest_routeRequestFiles(agent:string, type:agentType):void {
            route({
                agent: agent,
                agentData: "data.agent",
                agentType: type,
                callback: function terminal_fileService_copyFileRequest_routeRequestFiles_callback(message:socketData):void {
                    // message.data:copyFileRequest
                    responder(message, transmit);
                },
                data: data,
                requestType: "copy",
                transmit: transmit
            });
        };
    if (serverVars.testType === "service") {
        // a premature response is necessary for service tests since they are multiple services on the same device creating a feedback loop
        const status:service_fileStatus = {
            address: statusData.agentSource.modalAddress,
            agent: statusData.agentSource.id,
            agentType: statusData.agentSource.type,
            fileList: [],
            message: "Copying 1 00% complete. 1 file written at size 10 (10 bytes) with 0 integrity failures."
        };
        responder({
            data: status,
            service: "file-status-device"
        }, transmit);
    } else if (statusData.agentWrite.id === serverVars.hashDevice) {
        serviceCopy.actions.requestFiles(data, transmit);
    } else if (statusData.agentWrite.id === serverVars.hashUser) {
        user({
            action: "copy-request",
            agent: statusData.agentWrite,
            callback: function terminal_fileService_copyFileRequest_userCopyRequest(device:string):void {
                if (device === serverVars.hashDevice) {
                    serviceCopy.actions.requestFiles(data, transmit);
                } else {
                    routeRequestFiles(device, "device");
                }
            },
            transmit: transmit
        });
    } else {
        routeRequestFiles(statusData.agentWrite.id, statusData.agentWrite.type);
    }
};

export default copyFileRequest;