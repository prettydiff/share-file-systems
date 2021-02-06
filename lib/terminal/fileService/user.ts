
/* lib/terminal/fileService/user - Manages user security permissions. */

import { ServerResponse } from "http";
import serviceCopy from "./serviceCopy.js";
import serviceFile from "./serviceFile.js";
import serverVars from "../server/serverVars.js";

// you write to copyAgent
// you must not read from agent if it is unshared
//
// exclude agent like normal AND
// * data.cut is true
//
// exclude copyAgent if type user AND
// * not shared
// * read only


const user = function terminal_fileService_user(serverResponse:ServerResponse, data:systemDataFile|systemDataCopy, callback:(serverResponse:ServerResponse, data:systemDataFile|systemDataCopy) => void):void {
    if (data.agent === serverVars.hashUser) {
        const devices:string[] = Object.keys(serverVars.device),
            shares:agentShare[] = (function terminal_fileService_routeFile_shares():agentShare[] {
                const list:agentShare[] = [];
                let a:number = devices.length,
                    b:number = 0,
                    shareList:string[];
                do {
                    a = a - 1;
                    shareList = Object.keys(serverVars.device[devices[a]].shares);
                    b = shareList.length;
                    if (b > 0) {
                        do {
                            b = b - 1;
                            list.push(serverVars.device[devices[a]].shares[shareList[b]]);
                        } while (b > 0);
                    }
                } while (a > 0);
                return list;
            }()),
            shareLength:number = shares.length,
            locationLength:number = data.location.length;
        let a:number = 0,
            b:number = 0;
        shares.sort(function terminal_fileService_routeFile_sort(a:agentShare, b:agentShare):-1|1 {
            if (a.name.length > b.name.length) {
                return -1;
            }
            return 1;
        });
        if (shareLength > 0) {
            do {
                b = locationLength;
                do {
                    b = b - 1;
                    if ((shares[a].name.charAt(0) === "/" && data.location[b].indexOf(shares[a].name) === 0) || data.location[b].toLowerCase().indexOf(shares[a].name.toLowerCase()) === 0) {
                        if (shares[a].readOnly === true && (data.action === "fs-destroy" || data.action === "fs-new" || data.action === "fs-rename" || data.action === "fs-write")) {
                            serviceFile.respond.status(serverResponse, {
                                address: data.modalAddress,
                                agent: serverVars.hashUser,
                                agentType: "user",
                                fileList: [],
                                message: `Attempted action "${data.action.replace("fs-", "").replace("copy-", "")}" to location ${data.location[b]} which is in a read only share of: ${serverVars.nameUser}.`
                            }, "file-list-status");
                            return;
                        }
                        if (serverVars.device[serverVars.hashDevice].shares[data.share] === undefined) {
                            a = devices.length;
                            do {
                                a = a - 1;
                                if (serverVars.device[devices[a]].shares[data.share] !== undefined) {
                                    data.agent = devices[a];
                                    data.agentType = "device";
                                    callback(serverResponse, data);
                                    return;
                                }
                            } while (a > 0);
                            serviceFile.respond.status(serverResponse, {
                                address: data.modalAddress,
                                agent: serverVars.hashUser,
                                agentType: "user",
                                fileList: [],
                                message: `User ${serverVars.nameUser} does not have share: ${data.share}.`
                            }, "file-list-status");
                            return;
                        }
                        if (data.action.indexOf("copy") === 0) {
                            if (data.action === "copy") {
                                if (data.agent === data.copyAgent) {
                                    serviceCopy.actions.sameAgent(serverResponse, data);
                                } else {
                                    serviceCopy.actions.requestList(serverResponse, data, 0);
                                }
                            } else {
                                serviceFile.respond.status(serverResponse, {
                                    address: data.modalAddress,
                                    agent: serverVars.hashUser,
                                    agentType: "user",
                                    fileList: [],
                                    message: `Requested action "${data.action.replace("copy-", "")}" is not supported.`
                                }, "file-list-status");
                            }
                        } else {
                            serviceFile.menu(serverResponse, <systemDataFile>data);
                        }
                        return;
                    }
                } while (b > 0);
                a = a + 1;
            } while (a < shareLength);
            serviceFile.respond.status(serverResponse, {
                address: data.modalAddress,
                agent: serverVars.hashUser,
                agentType: "user",
                fileList: [],
                message: `Requested location "${data.location[b]}" is not in a location shared by user ${serverVars.nameUser}.`
            }, "file-list-status");
        } else {
            serviceFile.respond.status(serverResponse, {
                address: data.modalAddress,
                agent: serverVars.hashUser,
                agentType: "user",
                fileList: [],
                message: `User ${serverVars.nameUser} currently has no shares.`
            }, "file-list-status");
        }
    } else {
        callback(serverResponse, data);
    }
};

export default user;