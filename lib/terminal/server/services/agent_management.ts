/* lib/terminal/server/services/agent_management - Add, delete, and modify agent data. */

import common from "../../../common/common.js";
import getAddress from "../../utilities/getAddress.js";
import ipResolve  from "../transmission/ipResolve.js";
import responder from "../transmission/responder.js";
import sender from "../transmission/sender.js";
import serverVars from "../serverVars.js";
import settings from "./settings.js";
import transmit_http from "../transmission/transmit_http.js";

const agent_management = function terminal_server_services_agentManagement(socketData:socketData, transmit:transmit):void {
    const data:service_agentManagement = socketData.data as service_agentManagement;
    if (data.action === "add") {
        const addAgents = function terminal_server_services_agentManagement_addAgents(type:agentType):void {
            const keys:string[] = (data.agents[type] === null)
                    ? []
                    : Object.keys(data.agents[type]),
                lengthKeys:number = keys.length;
            if (lengthKeys > 0) {
                let a = 0;
                do {
                    if (serverVars[type][keys[a]] === undefined) {
                        serverVars[type][keys[a]] = data.agents[type][keys[a]];
                    }
                    a = a + 1;
                } while (a < lengthKeys);
                settings({
                    data: {
                        settings: serverVars[type],
                        type: type
                    },
                    service: "settings"
                }, null);
            }
        };
        addAgents("device");
        addAgents("user");
        sender.broadcast(socketData, "browser");
        if (data.agentFrom === serverVars.hashDevice) {
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
        }
    } else if (data.action === "delete") {
        const deleteAgents = function terminal_server_services_agentManagement_deleteAgents(type:agentType):void {
            const keys:string[] = (data.agents[type] === null)
                    ? []
                    : Object.keys(data.agents[type]),
                lengthKeys:number = keys.length,
                property:"hashDevice"|"hashUser" = `hash${common.capitalize(type)}` as "hashDevice"|"hashUser";
            if (lengthKeys > 0) {
                let a = 0;
                do {
                    if (keys[a] === serverVars[property]) {
                        delete serverVars[type][data.agentFrom];
                    } else {
                        delete serverVars[type][keys[a]];
                    }
                    a = a + 1;
                } while (a < lengthKeys);
                settings({
                    data: {
                        settings: serverVars[type],
                        type: type
                    },
                    service: "settings"
                }, null);
            }
        };
        deleteAgents("device");
        deleteAgents("user");
        if (data.agentFrom === serverVars.hashDevice) {
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
                    if (serverVars[type][keys[a]] !== undefined) {
                        if (data.agents[type][keys[a]].ipSelected === "" || data.agents[type][keys[a]].ipSelected === "127.0.0.1") {
                            data.agents[type][keys[a]].ipSelected = serverVars[type][keys[a]].ipSelected;
                        } 
                        serverVars[type][keys[a]] = data.agents[type][keys[a]];
                    }
                    a = a + 1;
                } while (a < lengthKeys);
                settings({
                    data: {
                        settings: serverVars[type],
                        type: type
                    },
                    service: "settings"
                }, null);
            }
        };
        modifyAgents("device");
        modifyAgents("user");
        if (data.agentFrom === serverVars.hashDevice) {
            const addresses:addresses = getAddress(transmit),
                userAddresses:networkAddresses = ipResolve.userAddresses();

            // transmit to devices
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "device");

            // transmit to users
            data.agentFrom = "user";
            data.agents.device = {};
            data.agents.user[serverVars.hashUser] = {
                deviceData: null,
                ipAll: userAddresses,
                ipSelected: addresses.local,
                name: serverVars.nameUser,
                ports: serverVars.ports,
                shares: common.selfShares(serverVars.device),
                status: "active"
            };
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "user");
        } else if (data.agentFrom === "user") {
            data.agentFrom = "device";
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
        } else {
            sender.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
        }
    }

    if (serverVars.testType === "service" && socketData.service === "agent-management") {
        responder({
            data: data,
            service: socketData.service
        }, {
            socket: serverVars.testSocket,
            type: "http"
        });
        serverVars.testSocket = null;
    } else {
        transmit_http.respondEmpty(transmit);
    }
};

export default agent_management;