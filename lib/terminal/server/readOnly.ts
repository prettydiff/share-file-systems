
/* lib/terminal/server/readOnly - A library that stands before fileService.js to determine if the request for a remote resource is read only and then restrict access as a result. */
import * as http from "http";

import fileService from "./fileService.js";
import response from "./response.js";
import serverVars from "./serverVars.js";

const readOnly = function terminal_server_readOnly(request:http.IncomingMessage, serverResponse:http.ServerResponse, dataString:string):void {
    const data:fileService = JSON.parse(dataString).fs,
        location:string[] = (data.action === "fs-copy-request" || data.action === "fs-copy-file")
            ? [data.name]
            : data.location,
        remoteUserTest:boolean = ((request.headers.host.indexOf("[::1]") === 0 || request.headers.host === serverVars.hashDevice) && data.agent.indexOf("remoteUser") === 0);

    // Most of this code evaluates whether the remote location is read only and limits actions that make changes
    if (data.agentType !== "device" && data.agent !== serverVars.hashUser && remoteUserTest === false) {
        const shares:deviceShares = (data.action === "fs-copy-file" && serverVars[data.copyType][data.copyAgent] !== undefined)
                ? serverVars[data.copyType][data.copyAgent].shares
                : serverVars[data.agentType][data.agent].shares,
            shareKeys:string[] = Object.keys(shares),
            windows:boolean = (location[0].charAt(0) === "\\" || (/^\w:\\/).test(location[0]) === true),
            readOnly:string[] = ["fs-base64", "fs-close", "fs-copy", "fs-copy-list", "fs-copy-request", "fs-copy-self", "fs-details", "fs-directory", "fs-hash", "fs-read", "fs-search"];
        let dIndex:number = location.length,
            sIndex:number = shareKeys.length,
            share:deviceShare,
            bestMatch:number = -1;
        if (data.copyAgent === serverVars.hashDevice && data.copyType === "device") {
            readOnly.push("fs-copy-file");
        }
        if (sIndex > 0) {
            do {
                dIndex = dIndex - 1;
                sIndex = shareKeys.length;
                do {
                    sIndex = sIndex - 1;
                    share = shares[shareKeys[sIndex]];
                    if (location[dIndex].indexOf(share.name) === 0 || (windows === true && location[dIndex].toLowerCase().indexOf(share.name.toLowerCase()) === 0)) {
                        if (bestMatch < 0 || share.name.length > shares[shareKeys[bestMatch]].name.length) {
                            bestMatch = sIndex;
                        }
                    }
                } while (sIndex > 0);
                if (bestMatch < 0) {
                    location.splice(dIndex, 1);
                } else {
                    if (shares[shareKeys[bestMatch]].readOnly === true && readOnly.indexOf(data.action) < 0) {
                        response(serverResponse, "application/json", `{"id":"${data.id}","dirs":"readOnly"}`);
                        return;
                    }
                }
            } while (dIndex > 0);
        } else {
            response(serverResponse, "application/json", `{"id":"${data.id}","dirs":"noShare"}`);
            return;
        }
    }
    if (location.length > 0 || data.agent === serverVars.hashDevice || data.agent === serverVars.hashUser) {
        fileService(serverResponse, data);
    } else {
        response(serverResponse, "application/json", `{"id":"${data.id}","dirs":"noShare"}`);
    }
};

export default readOnly;