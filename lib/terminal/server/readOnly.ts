
/* lib/terminal/server/readOnly - A library that stands before fileService.js to determine if the request for a remote resource is read only and then restrict access as a result. */
import { Hash } from "crypto";
import * as http from "http";

import fileService from "./fileService.js";
import hashIdentity from "./hashIdentity.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const readOnly = function terminal_server_readOnly(request:http.IncomingMessage, serverResponse:http.ServerResponse, dataString:string):void {
    const data:fileService = JSON.parse(dataString).fs,
        copyTest:boolean = (data.action === "fs-copy-file" || data.action === "fs-cut-file" || (data.copyType === "user" && (data.action === "fs-copy" || data.action === "fs-cut"))),
        location:string[] = (data.action === "fs-copy-request" || data.action === "fs-cut-request" || copyTest === true)
            ? [data.name]
            : data.location,
        remoteUserTest:boolean = ((request.headers.host.indexOf("[::1]") === 0 || request.headers.host === serverVars.hashDevice) && data.agent.indexOf("remoteUser") === 0),
        userTest:boolean = (data.agentType === "user" || data.copyType === "user");

    // Most of this code evaluates whether the remote location is read only and limits actions that make changes
    if (data.watch === "remote") {
        hashIdentity(data.share, function terminal_server_readOnly_hash(token:string):void {
            if (token === "") {
                response(serverResponse, "application/json", `{"id":"${data.id}","dirs":"noShare"}`);
            } else {
                data.agent = token;
                data.agentType = "device";
                fileService(serverResponse, data);
            }
        });
    } else if (data.agentType === "user" && data.copyType === "device" && serverVars.device[data.copyAgent] !== undefined && (data.action === "fs-copy" || data.action === "fs-cut")) {
        const localDevice:boolean = (data.copyAgent === serverVars.hashDevice),
            hash:Hash = vars.node.crypto.createHash("sha3-512");
        hash.update(serverVars.hashUser + data.copyAgent);
        data.copyShare = hash.digest("hex");
        fileService(serverResponse, data);
    } else {
        if (userTest === true && data.agent !== serverVars.hashUser && remoteUserTest === false) {
            const shares:agentShares = (copyTest === true && serverVars[data.copyType][data.copyAgent] !== undefined)
                    ? serverVars[data.copyType][data.copyAgent].shares
                    : serverVars[data.agentType][data.agent].shares,
                shareKeys:string[] = Object.keys(shares),
                windows:boolean = (location[0].charAt(0) === "\\" || (/^\w:\\/).test(location[0]) === true),
                readOnly:string[] = ["fs-base64", "fs-close", "fs-details", "fs-directory", "fs-hash", "fs-read", "fs-search"];
            let dIndex:number = location.length,
                sIndex:number = shareKeys.length,
                place:string,
                share:agentShare,
                bestMatch:number = -1;
            if (data.copyAgent === serverVars.hashDevice && data.copyType === "device") {
                readOnly.push("fs-copy-file");
            }
            if (sIndex > 0) {
                do {
                    dIndex = dIndex - 1;
                    sIndex = shareKeys.length;
                    place = (data.action === "fs-base64" || data.action === "fs-hash" || data.action === "fs-read")
                        ? location[dIndex].slice(location[dIndex].indexOf(":") + 1)
                        : location[dIndex];
                    do {
                        sIndex = sIndex - 1;
                        share = shares[shareKeys[sIndex]];
                        if (place.indexOf(share.name) === 0 || (windows === true && place.toLowerCase().indexOf(share.name.toLowerCase()) === 0)) {
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
                        bestMatch = -1;
                    }
                } while (dIndex > 0);
            } else {
                response(serverResponse, "application/json", `{"id":"${data.id}","dirs":"noShare"}`);
                return;
            }
        }
        if ((userTest === true && location.length > 0) || (userTest === false && data.agent === serverVars.hashDevice) || data.agent === serverVars.hashUser) {
            fileService(serverResponse, data);
        } else {
            response(serverResponse, "application/json", `{"id":"${data.id}","dirs":"noShare"}`);
        }
    }
};

export default readOnly;