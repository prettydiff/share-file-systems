
/* lib/terminal/fileService/readOnly - A library that stands before fileService.js to determine if the request for a remote resource is read only and then restrict access as a result. */

import { Hash } from "crypto";
import { IncomingMessage, ServerResponse } from "http";

import fileService from "./fileService.js";
import hashIdentity from "../server/hashIdentity.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

const readOnly = function terminal_fileService_readOnly(host:string, serverResponse:ServerResponse, data:fileService):void {
    if (data.agentType === "device" && serverVars.device[data.agent] !== undefined) {
        fileService(serverResponse, data);
    } else {
        response({
            message: `{"id":"${data.id}","dirs":"noShare"}`,
            mimeType: "application/json",
            responseType: "file-list-status",
            serverResponse: serverResponse
        });
    }
    /*const copyTest:boolean = (data.action === "fs-copy-file" || data.action === "fs-cut-file" || (data.copyType === "user" && (data.action === "fs-copy" || data.action === "fs-cut"))),
        location:string[] = (data.action === "fs-copy-request" || data.action === "fs-cut-request" || copyTest === true)
            ? [data.name]
            : data.location,
        remoteUserTest:boolean = ((request.headers.host.indexOf("[::1]") === 0 || request.headers.host === serverVars.hashDevice) && data.agent.indexOf("remoteUser") === 0),
        userTest:boolean = (data.agentType === "user" || data.copyType === "user"),
        devices:string[] = Object.keys(serverVars.device),
        responsePayload:responseConfig = {
            message: JSON.stringify({
                dirs: "noShare",
                fail: [],
                id: data.id
            }),
            mimeType: "application/json",
            responseType: "fs-update-remote",
            serverResponse: serverResponse
        };

    // Most of this code evaluates whether the remote location is read only and limits actions that make changes
    if (data.watch === "remote" && data.action !== "fs-copy-file" && data.action !== "fs-cut-file") {
        hashIdentity(data.share, function terminal_fileService_readOnly_hashIdentity(token:string):void {
            if (token === "") {
                response(responsePayload);
            } else {
                data.agent = token;
                data.agentType = "device";
                fileService(serverResponse, data);
            }
        });
    } else if (data.agentType === "user" && data.copyType === "device" && serverVars.device[data.copyAgent] !== undefined && (data.action === "fs-copy" || data.action === "fs-cut")) {
        const hash:Hash = vars.node.crypto.createHash("sha3-512");
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
                            response(responsePayload);
                            return;
                        }
                        bestMatch = -1;
                    }
                } while (dIndex > 0);
            } else {
                response(responsePayload);
                return;
            }
        }
        if ((userTest === true && location.length > 0) || (userTest === false && devices.indexOf(data.agent) > -1) || data.agent === serverVars.hashUser) {
            fileService(serverResponse, data);
        } else {
            response(responsePayload);
        }
    }*/
};

export default readOnly;