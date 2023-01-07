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
                    if (vars.settings[type][keys[a]] === undefined) {
                        vars.settings[type][keys[a]] = data.agents[type][keys[a]];
                        count = count + 1;
                    }
                    a = a + 1;
                } while (a < lengthKeys);
                if (count > 0) {
                    settings({
                        data: {
                            settings: vars.settings[type],
                            type: type
                        },
                        service: "settings"
                    });
                    if (data.agentFrom === vars.settings.hashDevice) {
                        sender.broadcast({
                            data: data,
                            service: "agent-management"
                        }, "device");
                    } else if (vars.settings.device[data.agentFrom] !== undefined && data.deviceUser !== null && data.deviceUser.length === 128) {
                        vars.settings.hashUser = data.deviceUser;
                    }
                    sender.broadcast(socketData, "browser");
                }
            }
        };
        addAgents("device");
        addAgents("user");
    } else if (data.action === "delete") {
        const deleteAgents = function terminal_server_services_agentManagement_deleteAgents(type:agentType):void {
            const keys:string[] = (data.agents[type] === null)
                    ? []
                    : Object.keys(data.agents[type]),
                lengthKeys:number = keys.length,
                property:"hashDevice"|"hashUser" = `hash${common.capitalize(type)}` as "hashDevice"|"hashUser";
            if (lengthKeys > 0) {
                let a:number = 0,
                    socket:websocket_client = null;
                do {
                    if (keys[a] === vars.settings[property]) {
                        socket = transmit_ws.clientList[type][data.agentFrom];
                        if (socket !== null && socket !== undefined) {
                            socket.destroy();
                        }
                        delete vars.settings[type][data.agentFrom];
                        delete transmit_ws.clientList[type][data.agentFrom];
                    } else {
                        socket = transmit_ws.clientList[type][keys[a]];
                        if (socket !== null && socket !== undefined) {
                            socket.destroy();
                        }
                        delete vars.settings[type][keys[a]];
                        delete transmit_ws.clientList[type][keys[a]];
                    }
                    a = a + 1;
                } while (a < lengthKeys);
                settings({
                    data: {
                        settings: vars.settings[type],
                        type: type
                    },
                    service: "settings"
                });
            }
        };
        deleteAgents("device");
        deleteAgents("user");
        if (data.agentFrom === vars.settings.hashDevice) {
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
        } else {
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
        }
    } else if (data.action === "modify") {
        const modifyAgents = function terminal_server_services_agentManagement_modifyAgents(type:agentType):void {
                const keys:string[] = (data.agents[type] === undefined || data.agents[type] === null)
                        ? []
                        : Object.keys(data.agents[type]),
                    lengthKeys:number = keys.length;
                if (lengthKeys > 0) {
                    let a = 0;
                    do {
                        if (vars.settings[type][keys[a]] !== undefined) {
                            if (data.agents[type][keys[a]].ipSelected === "" || data.agents[type][keys[a]].ipSelected === "127.0.0.1") {
                                data.agents[type][keys[a]].ipSelected = vars.settings[type][keys[a]].ipSelected;
                            }
                            vars.settings[type][keys[a]] = data.agents[type][keys[a]];
                        }
                        a = a + 1;
                    } while (a < lengthKeys);
                    settings({
                        data: {
                            settings: vars.settings[type],
                            type: type
                        },
                        service: "settings"
                    });
                }
            },
            users = function terminal_server_services_agentManagement_users():void {
                const userLength:number = Object.keys(transmit_ws.clientList.user).length;

                if (userLength > 0) {
                    const userData:userData = common.userData(vars.settings.device, "user", "");
                    data.agentFrom = vars.settings.hashUser;
                    data.agents.device = {};
                    data.agents.user[vars.settings.hashUser] = {
                        deviceData: null,
                        ipAll: userData[1],
                        ipSelected: "",
                        name: vars.settings.nameUser,
                        ports: vars.network.ports,
                        queue: [],
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
        if (data.agentFrom === vars.settings.hashDevice) {
            // same device
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
            users();
        } else if (vars.settings.user[data.agentFrom] === undefined) {
            // same user, from a device
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
            users();
        } else {
            // different user
            data.agents.user[data.agentFrom].ipSelected = vars.settings.user[data.agentFrom].ipSelected;
            data.agentFrom = vars.settings.hashDevice;
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
        if (data.agentFrom === vars.settings.hashDevice) {
            sender.broadcast(socketData, "device");
        }
        const renameType = function terminal_server_services_agentManagement_renameType(type:agentType):void {
            const keys:string[] = Object.keys(data.agents[type]);
            let len:number = keys.length;
            if (len > 0) {
                do {
                    len = len - 1;
                    vars.settings[type][keys[len]].name = data.agents[type][keys[len]].name;
                } while (len > 0);
                settings({
                    data: {
                        settings: vars.settings[type],
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