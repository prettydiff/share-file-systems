/* lib/terminal/server/services/agent_management - Add, delete, and modify agent data. */

import common from "../../../common/common.js";
import getAddress from "../../utilities/getAddress.js";
import ipResolve  from "../transmission/ipResolve.js";
import responder from "../transmission/responder.js";
import serverVars from "../serverVars.js";
import settings from "./settings.js";
import transmit_http from "../transmission/transmit_http.js";
import transmit_ws from "../transmission/transmit_ws.js";

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
        transmit_ws.broadcast(socketData, "browser");
        if (data.from === "invite") {
            data.from = "device";
            transmit_ws.broadcast({
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
        if (data.from === "browser") {
            data.from = "device";
            transmit_ws.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
            data.from = "user";
            data.agentFrom = serverVars.hashUser;
            transmit_ws.broadcast({
                data: data,
                service: "agent-management"
            }, "user");
        } else {
            transmit_ws.broadcast({
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
        if (data.from === "browser") {
            const addresses:addresses = getAddress(transmit),
                userAddresses:networkAddresses = ipResolve.userAddresses();

            // transmit to devices
            data.from = "device";
            transmit_ws.broadcast({
                data: data,
                service: "agent-management"
            }, "device");

            // transmit to users
            data.agentFrom = serverVars.hashUser;
            data.agents.device = {};
            data.from = "user";
            data.agents.user[serverVars.hashUser] = {
                deviceData: null,
                ipAll: userAddresses,
                ipSelected: addresses.local,
                name: serverVars.nameUser,
                ports: serverVars.ports,
                shares: common.selfShares(serverVars.device),
                status: "active"
            };
            transmit_ws.broadcast({
                data: data,
                service: "agent-management"
            }, "user");
        } else if (data.from === "device") {
            transmit_ws.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
        } else if (data.from === "user") {
            data.from = "device";
            transmit_ws.broadcast({
                data: data,
                service: "agent-management"
            }, "browser");
            transmit_ws.broadcast({
                data: data,
                service: "agent-management"
            }, "device");
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