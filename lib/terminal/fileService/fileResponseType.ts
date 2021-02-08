
/* lib/terminal/fileService/fileResponseType - A module to determine if file status updates are necessary. */

import { ServerResponse } from "http";

import serviceFile from "./serviceFile.js";

const fileResponseType = function terminal_fileService_fileResponseType(serverResponse:ServerResponse, data:systemDataFile, status:fileStatusMessage):void {
    const type:"file-list-status"|"response-no-action" = (function terminal_fileService_fileResponseType_type():"file-list-status"|"response-no-action" {
        if (data.action === "fs-directory") {
            if (data.name === "expand" || data.name === "navigate") {
                return "response-no-action";
            }
            if (data.name.indexOf("loadPage:") === 0) {
                status.address = data.name.replace("loadPage:", "");
                return "response-no-action";
            }
        }
        if (data.action === "fs-search") {
            return "response-no-action";
        }
        return "file-list-status";
    }());
    
    serviceFile.respond.status(serverResponse, status, type);
};

export default fileResponseType;