/* lib/terminal/server/services/agent_management - Add, delete, and modify agent data. */

import common from "../../../common/common.js";
import network from "../transmission/network.js";
import settings from "./settings.js";
import transmit_ws from "../transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

const agent_management = function terminal_server_services_agentManagement(socketData:socketData):void {
    const data:service_agentManagement = socketData.data as service_agentManagement,
        routeBrowser:transmit_agents = {
            device: "browser",
            user: "browser"
        },
        routeDevice:transmit_agents = {
            device: "broadcast",
            user: vars.identity.hashUser
        },
        routeSelf:transmit_agents = {
            device: vars.identity.hashDevice,
            user: vars.identity.hashUser
        };
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
                    if (vars.agents[type][keys[a]] === undefined && (type !== "user" || (type === "user" && keys[a] !== vars.identity.hashUser))) {
                        vars.agents[type][keys[a]] = data.agents[type][keys[a]];
                        count = count + 1;
                    }
                    a = a + 1;
                } while (a < lengthKeys);
                if (count > 0) {
                    if (type === "device") {
                        settings({
                            data: {
                                settings: vars.identity,
                                type: "identity"
                            },
                            route: routeSelf,
                            service: "settings"
                        });
                    }
                    if (type === "device" && vars.agents.device[data.agentFrom] !== undefined && data.identity !== null) {
                        const keys:string[] = Object.keys(vars.agents.device);
                        socketData.route = routeDevice;
                        network.send(socketData);
                        vars.identity.hashUser = data.identity.hashUser;
                        vars.identity.nameUser = data.identity.nameUser;
                        vars.identity.secretUser = data.identity.secretUser;
                        keys.forEach(function terminal_server_services_invite_addAgent_each(device:string):void {
                            if (
                                device !== vars.identity.hashDevice &&
                                (transmit_ws.socketMap.device === undefined || transmit_ws.socketMap.device[device] === undefined)
                            ) {
                                transmit_ws.open.agent({
                                    agent: device,
                                    agentType: "device",
                                    callback: null
                                });
                            }
                        });
                    } else if (type === "user") {
                        transmit_ws.open.agent({
                            agent: keys[0],
                            agentType: "user",
                            callback: null
                        });
                    }
                    socketData.route = routeBrowser;
                    network.send(socketData);
                    settings({
                        data: {
                            settings: vars.agents[type],
                            type: type
                        },
                        route: routeSelf,
                        service: "settings"
                    });
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
                            socket = transmit_ws.getSocket("user", data.agentFrom);
                            if (socket !== null) {
                                socket.destroy();
                                delete transmit_ws.socketMap.user[data.agentFrom];
                            }
                            delete vars.agents.user[data.agentFrom];
                            delete transmit_ws.socketList[data.agentFrom];
                        } else {
                            socket = transmit_ws.getSocket(type, keys[a]);
                            if (socket !== null) {
                                socket.destroy();
                                delete transmit_ws.socketMap[type][keys[a]];
                            }
                            delete vars.agents[type][keys[a]];
                            delete transmit_ws.socketList[keys[a]];
                        }
                        a = a + 1;
                    } while (a < lengthKeys);
                    settings({
                        data: {
                            settings: vars.agents[type],
                            type: type
                        },
                        route: routeSelf,
                        service: "settings"
                    });
                }
            };
            deleteAgents("device");
            deleteAgents("user");
        };
        if (data.agentFrom === vars.identity.hashDevice) {
            // device issuing the deletion
            network.send({
                data: data,
                route: routeDevice,
                service: "agent-management"
            });
            setTimeout(deleteContainer, 25);
        } else if (data.agents.device[vars.identity.hashDevice] !== undefined) {
            // a deleted device
            vars.identity = {
                hashDevice: "",
                hashUser: "",
                nameDevice: "",
                nameUser: "",
                secretDevice: "",
                secretUser: ""
            };
            vars.agents = {
                device: {},
                user: {}
            };
            transmit_ws.socketList = {};
            settings({
                data: {
                    settings: {},
                    type: "device"
                },
                route: routeSelf,
                service: "settings"
            });
            settings({
                data: {
                    settings: {},
                    type: "user"
                },
                route: routeSelf,
                service: "settings"
            });
            settings({
                data: {
                    settings: vars.identity,
                    type: "identity"
                },
                route: routeSelf,
                service: "settings"
            });
            network.send({
                data: null,
                route: routeBrowser,
                service: "reload"
            });
        } else {
            // either
            // a device receiving notification of deletion of a third device
            // a deleted user
            network.send({
                data: data,
                route: routeBrowser,
                service: "agent-management"
            });
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
                        route: routeSelf,
                        service: "settings"
                    });
                }
            },
            users = function terminal_server_services_agentManagement_users():void {
                const userLength:number = transmit_ws.getSocketKeys("user").length;
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
                        secret: vars.identity.secretUser,
                        shares: userData[0],
                        status: "active"
                    };

                    network.send({
                        data: data,
                        route: {
                            device: "broadcast",
                            user: "broadcast"
                        },
                        service: "agent-management"
                    });
                }
            };
        modifyAgents("device");
        modifyAgents("user");
        if (data.agentFrom === vars.identity.hashDevice) {
            // same device
            network.send({
                data: data,
                route: routeDevice,
                service: "agent-management"
            });
            users();
        } else if (vars.agents.user[data.agentFrom] === undefined) {
            // same user, from a device
            network.send({
                data: data,
                route: routeBrowser,
                service: "agent-management"
            });
            users();
        } else {
            // different user
            data.agents.user[data.agentFrom].ipSelected = vars.agents.user[data.agentFrom].ipSelected;
            data.agentFrom = vars.identity.hashDevice;
            network.send({
                data: data,
                route: routeDevice,
                service: "agent-management"
            });
            network.send({
                data: data,
                route: routeBrowser,
                service: "agent-management"
            });
        }
    } else if (data.action === "rename") {
        if (data.agentFrom === vars.identity.hashDevice) {
            socketData.route = routeDevice;
            network.send(socketData);
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
                    route: routeSelf,
                    service: "settings"
                });
            }
        };
        renameType("device");
        renameType("user");
    }
};

export default agent_management;