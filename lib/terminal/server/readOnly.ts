
/* lib/terminal/server/readOnly - A library that stands before fileService.js to determine if the request for a remote resource is read only and then restrict access as a result. */
import * as http from "http";

import fileService from "./fileService.js";
import serverVars from "./serverVars.js";

const readOnly = function terminal_server_readOnly(request:http.IncomingMessage, response:http.ServerResponse, dataString:string):void {
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
            windows:boolean = (location[0].charAt(0) === "\\" || (/^\w:\\/).test(location[0]) === true),
            readOnly:string[] = ["fs-base64", "fs-close", "fs-copy", "fs-copy-list", "fs-copy-request", "fs-copy-self", "fs-details", "fs-directory", "fs-hash", "fs-read", "fs-search"];
        let dIndex:number = location.length,
            sIndex:number = Object.keys(shares).length,
            bestMatch:number = -1;
        if (data.copyAgent === serverVars.hashDevice && data.copyType === "device") {
            readOnly.push("fs-copy-file");
        }
        if (sIndex > 0) {
            do {
                dIndex = dIndex - 1;
                sIndex = Object.keys(shares).length;
                do {
                    sIndex = sIndex - 1;
                    if (location[dIndex].indexOf(shares[sIndex].name) === 0 || (windows === true && location[dIndex].toLowerCase().indexOf(shares[sIndex].name.toLowerCase()) === 0)) {
                        if (bestMatch < 0 || shares[sIndex].name.length > shares[bestMatch].name.length) {
                            bestMatch = sIndex;
                        }
                    }
                } while (sIndex > 0);
                if (bestMatch < 0) {
                    location.splice(dIndex, 1);
                } else {
                    if (shares[bestMatch].readOnly === true && readOnly.indexOf(data.action) < 0) {
                        response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
                        response.write(`{"id":"${data.id}","dirs":"readOnly"}`);
                        response.end();
                        return;
                    }
                }
            } while (dIndex > 0);
        } else {
            response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
            response.write(`{"id":"${data.id}","dirs":"noShare"}`);
            response.end();
            return;
        }
    }
    if (location.length > 0 || data.agent === serverVars.hashDevice || data.agent === serverVars.hashUser) {
        fileService(response, data);
    } else {
        response.writeHead(403, {"Content-Type": "text/plain; charset=utf-8"});
        response.write(`{"id":"${data.id}","dirs":"noShare"}`);
        response.end();
    }
};

export default readOnly;