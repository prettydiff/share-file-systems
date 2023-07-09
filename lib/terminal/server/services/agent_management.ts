/* lib/terminal/server/services/agent_management - Add, delete, and modify agent data. */

import common from "../../../common/common.js";
import sender from "../transmission/sender.js";
import settings from "./settings.js";
import transmit_ws from "../transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

const agent_management = function terminal_server_services_agentManagement(socketData:socketData):void {
    const data:service_agentManagement = socketData.data as service_agentManagement;
    if (data.action === "add") {
        const addAgents = function terminal_server_services_agentManagement_addAgents(type:agentType):void {
            const keys:string[] = (data.agents[type] === null)
                    ? []
                    : Object.keys(data.agents[type]),
                lengthKeys:number = keys.length;
            if (lengthKeys > 0) {
                let a:number = 0,
                    count:number = 0;
                do {
                    if (vars.agents[type][keys[a]] === undefined) {
                        vars.agents[type][keys[a]] = data.agents[type][keys[a]];
                        count = count + 1;
                    }
                    a = a + 1;
                } while (a < lengthKeys);
                if (count > 0) {
                    if (vars.agents.device[data.agentFrom] !== undefined && data.userHash !== null && data.userName !== null && data.userHash.length === 128) {
                        vars.identity.nameUser = data.userName;
                        vars.identity.hashUser = data.userHash;
                    }
                    settings({
                        data: {
                            settings: vars.agents[type],
                            type: type
                        },
                        service: "settings"
                    });
                    settings({
                        data: {
                            settings: vars.identity,
                            type: "identity"
                        },
                        service: "settings"
                    });
                    sender.broadcast({
                        data: data,
                        service: "agent-management"
                    }, "device");
                    sender.broadcast(socketData, "browser");
                }
            }
        };
        addAgents("device");
        addAgents("user");
    } else if (data.action === "delete") {
        const deleteContainer = function terminal_server_services_agentManagement_deleteContainer():void {
            const deleteAgents = function terminal_server_services_agentManagement_deleteContainer_deleteAgents(type:agentType):void {
                const keys:string[] = (data.agents[type] === null)
                        ? []
                        : Object.keys(data.agents[type]),
                    lengthKeys:number = keys.length;
                if (lengthKeys > 0) {
                    let a:number = 0,
                        socket:websocket_client = null;
                    do {
                        if (keys[a] === vars.identity.hashUser && type === "user") {
                            socket = transmit_ws.socketList[type][data.agentFrom];
                            if (socket !== null && socket !== undefined) {
                                socket.destroy();
                            }
                            delete vars.agents.user[data.agentFrom];
                            delete transmit_ws.socketList.user[data.agentFrom];
                            delete transmit_ws.status[data.agentFrom];
                        } else {
                            socket = transmit_ws.socketList[type][keys[a]];
                            if (socket !== null && socket !== undefined) {
                                socket.destroy();
                            }
                            delete vars.agents[type][keys[a]];
                            delete transmit_ws.socketList[type][keys[a]];
                            delete transmit_ws.status[keys[a]];
                        }
                        a = a + 1;
                    } while (a < lengthKeys);
                    settings({
                        data: {
                            settings: vars.agents[type],
                            type: type
                        },
                        service: "settings"
                    });
                }
            };
            deleteAgents("device");
            deleteAgents("user");
        };
        if (data.agentFrom === vars.identity.hashDevice) {
            // device issuing the deletion
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
            setTimeout(deleteContainer, 25);
        } else if (data.agents.device[vars.identity.hashDevice] !== undefined) {
            // a deleted device
            vars.identity = {
                hashDevice: "",
                hashUser: "",
                keyDevicePrivate: "",
                keyDevicePublic: "",
                keyUserPrivate: "",
                keyUserPublic: "",
                nameDevice: "",
                nameUser: ""
            };
            vars.agents = {
                device: {},
                user: {}
            };
            transmit_ws.status = {};
            settings({
                data: {
                    settings: {},
                    type: "device"
                },
                service: "settings"
            });
            settings({
                data: {
                    settings: {},
                    type: "user"
                },
                service: "settings"
            });
            settings({
                data: {
                    settings: vars.identity,
                    type: "identity"
                },
                service: "settings"
            });
            sender.broadcast({
                data: null,
                service: "reload"
            }, "browser");
        } else {
            // either
            // a device receiving notification of deletion of a third device
            // a deleted user
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
            deleteContainer();
        }
    } else if (data.action === "modify") {
        const modifyAgents = function terminal_server_services_agentManagement_modifyAgents(type:agentType):void {
                const keys:string[] = (data.agents[type] === undefined || data.agents[type] === null)
                        ? []
                        : Object.keys(data.agents[type]),
                    lengthKeys:number = keys.length;
                if (lengthKeys > 0) {
                    let a:number = 0;
                    do {
                        if (vars.agents[type][keys[a]] !== undefined) {
                            if (data.agents[type][keys[a]].ipSelected === "" || data.agents[type][keys[a]].ipSelected === "127.0.0.1") {
                                data.agents[type][keys[a]].ipSelected = vars.agents[type][keys[a]].ipSelected;
                            }
                            vars.agents[type][keys[a]] = data.agents[type][keys[a]];
                        }
                        a = a + 1;
                    } while (a < lengthKeys);
                    settings({
                        data: {
                            settings: vars.agents[type],
                            type: type
                        },
                        service: "settings"
                    });
                }
            },
            users = function terminal_server_services_agentManagement_users():void {
                const userLength:number = Object.keys(transmit_ws.socketList.user).length;

                if (userLength > 0) {
                    const userData:userData = common.userData(vars.agents.device, "user", "");
                    data.agentFrom = vars.identity.hashUser;
                    data.agents.device = {};
                    data.agents.user[vars.identity.hashUser] = {
                        deviceData: null,
                        ipAll: userData[1],
                        ipSelected: "",
                        name: vars.identity.nameUser,
                        ports: vars.network.ports,
                        shares: userData[0],
                        status: "active"
                    };

                    sender.broadcast({
                        data: data,
                        service: "agent-management"
                    }, "user");
                }
            };
        modifyAgents("device");
        modifyAgents("user");
        if (data.agentFrom === vars.identity.hashDevice) {
            // same device
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
            users();
        } else if (vars.agents.user[data.agentFrom] === undefined) {
            // same user, from a device
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
            users();
        } else {
            // different user
            data.agents.user[data.agentFrom].ipSelected = vars.agents.user[data.agentFrom].ipSelected;
            data.agentFrom = vars.identity.hashDevice;
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
        }
    } else if (data.action === "rename") {
        if (data.agentFrom === vars.identity.hashDevice) {
            sender.broadcast(socketData, "device");
        }
        const renameType = function terminal_server_services_agentManagement_renameType(type:agentType):void {
            const keys:string[] = Object.keys(data.agents[type]);
            let len:number = keys.length;
            if (len > 0) {
                do {
                    len = len - 1;
                    vars.agents[type][keys[len]].name = data.agents[type][keys[len]].name;
                } while (len > 0);
                settings({
                    data: {
                        settings: vars.agents[type],
                        type: type
                    },
                    service: "settings"
                });
            }
        };
        renameType("device");
        renameType("user");
    }
};

export default agent_management;