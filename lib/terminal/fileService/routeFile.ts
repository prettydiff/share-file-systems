
/* lib/terminal/fileService/routeFile - A library that manages all file system operations except copy/cut operations. */

import { IncomingHttpHeaders, ServerResponse } from "http";

import httpClient from "../server/httpClient.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import serviceFile from "./serviceFile.js";

const routeFile = function terminal_fileService_routeFile(serverResponse:ServerResponse, dataString:string):void {
    const data:systemDataFile = JSON.parse(dataString),
        route = function terminal_fileService_routeFile_route():void {
            httpClient({
                agentType: data.agentType,
                callback: function terminal_fileService_routeFile_route_callback(message:string|Buffer, headers:IncomingHttpHeaders):void {
                    const responseType:requestType = <requestType>headers["response-type"];
                    if (responseType === "error") {
                        serviceFile.respond.error(serverResponse, message.toString());
                    } else if (data.action === "fs-base64" || data.action === "fs-hash" || data.action === "fs-read") {
                        const list:stringDataList = JSON.parse(message.toString());
                        serviceFile.respond.read(serverResponse, list);
                    } else if (data.action === "fs-details") {
                        const details:fsDetails = JSON.parse(message.toString());
                        serviceFile.respond.details(serverResponse, details);
                    } else {
                        serviceFile.statusMessage(serverResponse, data, null);
                    }
                },
                errorMessage: "",
                ip: serverVars[data.agentType][data.agent].ip,
                payload: dataString,
                port: serverVars[data.agentType][data.agent].port,
                requestError: function terminal_fileService_routeFile_route_requestError():void {
                    return;
                },
                requestType: "fs",
                responseStream: httpClient.stream,
                responseError: function terminal_fileService_routeFile_route_requestError():void {
                    return;
                }
            });
        };
    if (data.agentType === "device") {
        // service tests must be regarded as local device tests even they have a non-matching agent
        // otherwise there is an endless loop of http requests because service tests are only differentiated by port and not ip.
        if (data.agent === serverVars.hashDevice || serverVars.testType === "service") {
            serviceFile.menu(serverResponse, data);
        } else {
            route();
        }
    } else {
        /*const shares:agentShares = (copyTest === true && serverVars[data.copyType][data.copyAgent] !== undefined)
                ? serverVars[data.copyType][data.copyAgent].shares
                : serverVars[data.agentType][data.agent].shares,
            shareKeys:string[] = Object.keys(shares),
            windows:boolean = (location[0].charAt(0) === "\\" || (/^\w:\\/).test(location[0]) === true),
            routeFile:string[] = ["fs-base64", "fs-close", "fs-details", "fs-directory", "fs-hash", "fs-read", "fs-search"];
        let dIndex:number = location.length,
            sIndex:number = shareKeys.length,
            place:string,
            share:agentShare,
            bestMatch:number = -1;
        if (data.copyAgent === serverVars.hashDevice && data.copyType === "device") {
            routeFile.push("fs-copy-file");
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
                    if (shares[shareKeys[bestMatch]].routeFile === true && routeFile.indexOf(data.action) < 0) {
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
        if ((userTest === true && location.length > 0) || (userTest === false && devices.indexOf(data.agent) > -1) || data.agent === serverVars.hashUser) {
            fileService(serverResponse, data);
        } else {
            response(responsePayload);
        }*/
        serviceFile.statusMessage(serverResponse, data, null);
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
        hashIdentity(data.share, function terminal_fileService_routeFile_hashIdentity(token:string):void {
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
                routeFile:string[] = ["fs-base64", "fs-close", "fs-details", "fs-directory", "fs-hash", "fs-read", "fs-search"];
            let dIndex:number = location.length,
                sIndex:number = shareKeys.length,
                place:string,
                share:agentShare,
                bestMatch:number = -1;
            if (data.copyAgent === serverVars.hashDevice && data.copyType === "device") {
                routeFile.push("fs-copy-file");
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
                        if (shares[shareKeys[bestMatch]].routeFile === true && routeFile.indexOf(data.action) < 0) {
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

export default routeFile;