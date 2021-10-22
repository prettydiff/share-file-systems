
/* lib/terminal/server/heartbeat - The code that manages sending and receiving user online status updates. */

import { ServerResponse } from "http";

import message from "./message.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import settings from "./settings.js";
import websocket from "./websocket.js";

const respond = function terminal_server_heartbeat_respond(message:string, responseType:requestType):void {
        if (serverVars.testType === "service" && responseType.indexOf("heartbeat") === 0) {
            response({
                message: message,
                mimeType: "application/json",
                responseType: responseType,
                serverResponse: serverVars.testSocket as ServerResponse
            });
            serverVars.testSocket = null;
        }
    },
    heartbeat:heartbeatObject = {
        // handler for request task: "heartbeat-complete", updates shares/settings only if necessary and then sends the payload to the browser
        complete: function terminal_server_heartbeat_complete(dataPackage:socketData, remoteIP:string):void {
            const data:heartbeat = dataPackage.data as heartbeat,
                keys:string[] = Object.keys(data.shares),
                length:number = keys.length,
                status:heartbeatStatus = data.status as heartbeatStatus,
                agent:agent = serverVars[data.agentType][data.agentFrom],
                agentStatus:heartbeatStatus = (agent === undefined)
                    ? null
                    : agent.status;
            let store:boolean = false;
            if (agent === undefined) {
                return;
            }
            if (status === "active" || status === "idle" || status === "offline") {
                // gather offline messages for a user that is now online
                if ((agentStatus === "offline" || agentStatus === undefined) && status !== "offline") {
                    const offline:messageItem[] = [];
                    let a:number = serverVars.message.length;
                    serverVars[data.agentType][data.agentFrom].status = status;
                    if (a > 0) {
                        do {
                            a = a - 1;
                            if (serverVars.message[a].agentTo === data.agentFrom && serverVars.message[a].agentType === data.agentType) {
                                if (serverVars.message[a].offline === true) {
                                    delete serverVars.message[a].offline;
                                    offline.push(serverVars.message[a]);
                                } else {
                                    break;
                                }
                            }
                        } while (a > 0);
                        if (offline.length > 0) {
                            message(offline.reverse(), false);
                        }
                    }
                } else {
                    serverVars[data.agentType][data.agentFrom].status = status;
                }
            }
            if (length > 0) {
                if (data.shareType === "device") {
                    let a:number = 0;
                    do {
                        if (serverVars.device[keys[a]] === undefined) {
                            serverVars.device[keys[a]] = data.shares[keys[a]];
                            store = true;
                        } else if (JSON.stringify(serverVars.device[keys[a]].shares) !== JSON.stringify(data.shares[keys[a]].shares)) {
                            serverVars.device[keys[a]].shares = data.shares[keys[a]].shares;
                            store = true;
                        }
                        a = a + 1;
                    } while (a < length);
                    data.shares = serverVars.device;
                } else if (data.shareType === "user") {
                    if (serverVars.user[keys[0]] === undefined) {
                        serverVars.user[keys[0]] = data.shares[keys[0]];

                        // this check is necessary such that a remote user secondary device does not
                        // assign an ip from the same user primary device and create echos
                        if (serverVars.user[keys[0]].ipSelected === "") {
                            serverVars.user[keys[0]].ipSelected = remoteIP;
                        }
                        store = true;
                    } else if (JSON.stringify(serverVars.user[keys[0]].shares) !== JSON.stringify(data.shares[keys[0]].shares)) {
                        serverVars.user[keys[0]].shares = data.shares[keys[0]].shares;
                        store = true;
                    }
                }
                if (store === true) {
                    settings({
                        data: {
                            data: serverVars[data.shareType],
                            type: data.shareType
                        },
                        service: "heartbeat-complete"
                    });
                } else {
                    data.shares = {};
                }
            } else {
                data.shares = {};
            }
            websocket.broadcast({
                data: data,
                service: "heartbeat-complete"
            }, "browser");
            if (data.agentType === "user") {
                websocket.broadcast({
                    data: data,
                    service: "heartbeat-complete"
                }, "device");
            }
            data.shares = {};
            data.status = (serverVars.device[serverVars.hashDevice].status === undefined)
                ? "active"
                : serverVars.device[serverVars.hashDevice].status;
            data.agentTo = data.agentFrom;
            data.agentFrom = (data.agentType === "device")
                ? serverVars.hashDevice
                : serverVars.hashUser;
            respond(JSON.stringify({
                agentFrom: serverVars.hashDevice,
                agentTo: serverVars.hashDevice,
                agentType: "device",
                shares: {},
                shareType: "device",
                status: "active"
            }), dataPackage.service);
        },
        // handler for request task: "heartbeat-delete-agents"
        deleteAgents: function terminal_server_heartbeat_deleteAgents(dataPackage:socketData):void {
            const data:heartbeat = dataPackage.data as heartbeat,
                removeByType = function terminal_server_heartbeat_deleteAgents_removeByType(list:string[], type:agentType):void {
                    let a:number = list.length;
                    if (a > 0) {
                        do {
                            a = a - 1;
                            if (type !== "device" || (type === "device" && list[a] !== serverVars.hashDevice)) {
                                delete serverVars[type][list[a]];
                            }
                        } while (a > 0);
                        settings({
                            data: {
                                data: serverVars[type],
                                type: type
                            },
                            service: "heartbeat-delete-agents"
                        });
                    }
                };        
            if (data.agentType === "device") {
                const deleted:agentList = data.status as agentList;
                if (deleted.device.indexOf(serverVars.hashDevice) > -1) {
                    // local device is in the deletion list, so all agents are deleted
                    removeByType(Object.keys(serverVars.device), "device");
                    removeByType(Object.keys(serverVars.user), "user");
                } else {
                    // otherwise only delete the agents specified
                    removeByType(deleted.device, "device");
                    removeByType(deleted.user, "user");
                }
            } else if (data.agentType === "user") {
                delete serverVars.user[data.agentFrom];
                settings({
                    data: {
                        data: serverVars.user,
                        type: "user"
                    },
                    service: "heartbeat-delete-agents"
                });
            }
            websocket.broadcast({
                data: data,
                service: "heartbeat-delete-agents"
            }, "browser");
            websocket.broadcast({
                data: data,
                service: "heartbeat-delete-agents"
            }, "device");
        },
        // handler for request task: "heartbeat-update", provides status updates from changes of shares and active/idle state of the user
        update: function terminal_server_heartbeat_update(dataPackage:socketData):void {
            // heartbeat from local, forward to each remote terminal
            const data:heartbeatUpdate = dataPackage.data as heartbeatUpdate,
                share:boolean = (data.shares !== null);
            if (data.agentFrom === "localhost-browser") {
                serverVars.device[serverVars.hashDevice].status = data.status;
            }
            if (share === true && data.type === "device") {
                serverVars.device = data.shares;
                settings({
                    data: {
                        data: serverVars.device,
                        type: "device"
                    },
                    service: "heartbeat-update"
                });
            }
            websocket.broadcast({
                data: data,
                service: "heartbeat-update"
            }, "device");
            respond("response from heartbeat.update", dataPackage.service);
        }
    };

export default heartbeat;