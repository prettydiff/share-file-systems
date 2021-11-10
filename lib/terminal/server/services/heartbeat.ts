
/* lib/terminal/server/services/heartbeat - The code that manages sending and receiving user online status updates. */

import getAddress from "../../utilities/getAddress.js";
import message from "./message.js";
import responder from "../transmission/responder.js";
import serverVars from "../serverVars.js";
import settings from "./settings.js";
import agentWs from "../transmission/agent_ws.js";

const heartbeat = function terminal_server_services_heartbeat(socketData:socketData, transmit:transmit):void {
    const data:service_heartbeat = socketData.data as service_heartbeat,
        heartbeatObject:module_heartbeatObject = {
            // Handler for heartbeat-action *heartbeat-complete*, which updates shares/settings only if necessary and then sends the payload to the browser.
            "complete": function terminal_server_services_heartbeat_complete():void {
                const keys:string[] = Object.keys(data.shares),
                    length:number = keys.length,
                    status:heartbeatStatus = data.status as heartbeatStatus,
                    agent:agent = serverVars[data.agentType][data.agentFrom],
                    agentStatus:heartbeatStatus = (agent === undefined)
                        ? null
                        : agent.status,
                    remoteIP = getAddress(transmit).remote;
                let store:boolean = false;
                if (agent === undefined) {
                    return;
                }
                if (status === "active" || status === "idle" || status === "offline") {
                    // gather offline messages for a user that is now online
                    if ((agentStatus === "offline" || agentStatus === undefined) && status !== "offline") {
                        const offline:service_message = [];
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
                                settings: serverVars[data.shareType],
                                type: data.shareType
                            },
                            service: "heartbeat"
                        });
                    } else {
                        data.shares = {};
                    }
                } else {
                    data.shares = {};
                }
                agentWs.broadcast({
                    data: data,
                    service: "heartbeat"
                }, "browser");
                if (data.agentType === "user") {
                    agentWs.broadcast({
                        data: data,
                        service: "heartbeat"
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
                responder({
                    data: {
                        action: "complete",
                        agentFrom: serverVars.hashDevice,
                        agentTo: serverVars.hashDevice,
                        agentType: "device",
                        shares: {},
                        shareType: "device",
                        status: "active"
                    },
                    service: socketData.service
                }, transmit);
            },
            // handler for request task: "heartbeat-delete-agents"
            "delete-agents": function terminal_server_services_heartbeat_deleteAgents():void {
                const removeByType = function terminal_server_services_heartbeat_deleteAgents_removeByType(list:string[], type:agentType):void {
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
                                settings: serverVars[type],
                                type: type
                            },
                            service: "heartbeat"
                        });
                    }
                };        
                if (data.agentType === "device") {
                    const deleted:service_agentDeletion = data.status as service_agentDeletion;
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
                            settings: serverVars.user,
                            type: "user"
                        },
                        service: "heartbeat"
                    });
                }
                agentWs.broadcast({
                    data: data,
                    service: "heartbeat"
                }, "browser");
                agentWs.broadcast({
                    data: data,
                    service: "heartbeat"
                }, "device");
            },
            // handler for request task: "heartbeat-update", provides status updates from changes of shares and active/idle state of the user
            "update": function terminal_server_services_heartbeat_update():void {
                // heartbeat from local, forward to each remote terminal
                const update:service_agentUpdate = socketData.data as service_agentUpdate,
                    share:boolean = (update.shares !== null);
                if (update.agentFrom === "localhost-browser") {
                    serverVars.device[serverVars.hashDevice].status = update.status;
                }
                if (share === true && update.type === "device") {
                    serverVars.device = update.shares;
                    settings({
                        data: {
                            settings: serverVars.device,
                            type: "device"
                        },
                        service: "heartbeat"
                    });
                }
                agentWs.broadcast({
                    data: update,
                    service: "heartbeat"
                }, "device");
                if (serverVars.testType === "service" && socketData.service === "heartbeat") {
                    responder({
                        data: data,
                        service: socketData.service
                    }, {
                        socket: serverVars.testSocket,
                        type: "http"
                    });
                    serverVars.testSocket = null;
                }
            }
        };
    if (data.action === "status") {
        agentWs.broadcast(socketData, "browser");
    } else {
        heartbeatObject[data.action]();
    }
};

export default heartbeat;