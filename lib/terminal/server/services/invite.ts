
/* lib/terminal/server/services/invite - Manages the order of invitation related processes for traffic across the internet. */

import agent_management from "./agent_management.js";
import common from "../../../common/common.js";
import getAddress from "../../utilities/getAddress.js";
import sender from "../transmission/sender.js";
import service from "../../test/application/service.js";
import transmit_http from "../transmission/transmit_http.js";
import transmit_ws from "../transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

const invite = function terminal_server_services_invite(socketData:socketData, transmit:transmit_type):void {
    const data:service_invite = socketData.data as service_invite,
        addresses:transmit_addresses_socket = (vars.test.type === "service")
            ? {
                local: {
                    address: "127.0.0.1",
                    port: 443
                },
                remote: {
                    address: "127.0.0.1",
                    port: 443
                }
            }
            : getAddress(transmit),
        inviteHttp = function terminal_server_services_invite_inviteHttp():void {
            const payload:socketData = {
                    data: data,
                    service: "invite"
                },
                httpConfig:config_http_request = {
                    agent: "",
                    agentType: data.type,
                    callback: null,
                    ip: (data.action === "invite-request")
                        ? data.agentSource.ipSelected
                        : data.agentRequest.ipSelected,
                    payload: payload,
                    port: (data.action === "invite-request")
                        ? data.agentSource.ports.http
                        : data.agentRequest.ports.http,
                    stream: false
                };
            if (vars.test.type === "service") {
                service.evaluation(payload);
            } else {
                transmit_http.request(httpConfig);
            }
        },
        addAgent = function terminal_server_services_invite_addAgent(type:agentTransmit, callback:(agents:agents) => void):void {
            const addAgentData:service_agentManagement = {
                action: "add",
                agents: (data.type === "device")
                    ? {
                        device: data[type].devices,
                        user: {}
                    }
                    : {
                        device: {},
                        user: {
                            [data[type].hashUser]: {
                                deviceData: null,
                                ipAll: data[type].ipAll,
                                ipSelected: data[type].ipSelected,
                                name: data[type].nameUser,
                                ports: data[type].ports,
                                shares: data[type].shares,
                                status: "active"
                            }
                        }
                    },
                agentFrom: vars.settings.hashDevice,
                userHash: (data.type === "device")
                    ? (type === "agentRequest")
                        ? data.agentRequest.hashUser
                        : vars.settings.hashUser
                    : null,
                userName: (data.type === "device")
                    ? (type === "agentRequest")
                        ? data.agentRequest.nameUser
                        : vars.settings.nameUser
                    : null
            };
            if (vars.test.type !== "service") {
                agent_management({
                    data: addAgentData,
                    service: "agent-management"
                });
            }
            if (callback !== null) {
                callback(addAgentData.agents[data.type]);
            }
        },
        deviceIPSelected = function terminal_server_services_invite_deviceIPSelected(type:agentTransmit):void {
            if (data.type === "device") {
                const keys:string[] = Object.keys(data[type].devices);
                keys.forEach(function terminal_server_services_invite_addAgent_deviceIP(hash:string):void {
                    const device:agent = data[type].devices[hash];
                    device.ipSelected = (device.ipAll.IPv4.indexOf(addresses.remote.address) > -1 || device.ipAll.IPv6.indexOf(addresses.remote.address) > -1)
                        ? addresses.remote.address
                        : (device.ipAll.IPv6.length > 0)
                            ? device.ipAll.IPv6[0]
                            : device.ipAll.IPv4[0];
                });
            }
        },
        /**
         * Methods for processing the various stages of the invitation process.
         * ```typescript
         * interface module_inviteActions {
         *     "invite-complete": () => void; // Step 4: Receipt of the response at the originating device terminal for transmission to the browser.
         *     "invite-request" : () => void; // Step 2: Receipt of the invitation request at the remote machine's terminal for processing to its browser.
         *     "invite-response": () => void; // Step 3: Receipt of the remote user's response at the remote machine's terminal for transmission to the originating machine.
         *     "invite-start"   : () => void; // Step 1: Receipt of an invite request from the local browser.
         * }
         * ``` */
        actions:module_inviteActions = {
            "invite-complete": function terminal_server_services_invite_inviteComplete():void {
                // stage 4 - on start terminal to start browser
                const name:string = (data.type === "device")
                        ? data.agentSource.nameDevice
                        : data.agentSource.nameUser,
                    respond:string = ` invitation returned from ${data.type} '${name}'.`;
                data.message = common.capitalize(data.status) + respond;
                if (vars.test.type === "service") {
                    service.evaluation({
                        data: data,
                        service: "invite"
                    });
                } else {
                    if (data.status === "accepted" && (data.agentRequest.hashDevice === vars.settings.hashDevice || data.agentRequest.hashUser === vars.settings.hashUser)) {
                        deviceIPSelected("agentSource");
                        addAgent("agentSource", function terminal_server_services_invite_inviteComplete_addAgent(agents:agents):void {
                            const keys:string[] = Object.keys(agents);
                            if (data.type === "device") {
                                keys.forEach(function terminal_server_services_invite_inviteComplete_addAgent_each(device:string):void {
                                    transmit_ws.open.agent({
                                        agent: device,
                                        callback: null,
                                        type: "device"
                                    });
                                });
                            } else {
                                transmit_ws.open.agent({
                                    agent: keys[0],
                                    callback: null,
                                    type: "user"
                                });
                            }
                        });
                    }
                }
            },
            "invite-request": function terminal_server_services_invite_inviteRequest():void {
                // stage 2 - on remote terminal to remote browser
                const agent:agent = (data.type === "user")
                        ? vars.settings.user[data.agentRequest.hashUser]
                        : vars.settings.device[data.agentRequest.hashDevice],
                    userData:userData = common.userData(vars.settings.device, data.type, vars.settings.hashDevice);
                data.agentSource = {
                    devices: (data.type === "device")
                        ? vars.settings.device
                        : {},
                    hashDevice: (data.type === "device")
                        ? vars.settings.hashDevice
                        : "",
                    hashUser: vars.settings.hashUser,
                    ipAll: userData[1],
                    ipSelected: addresses.local.address,
                    modal: "",
                    nameDevice: (data.type === "device")
                        ? vars.settings.nameDevice
                        : "",
                    nameUser: vars.settings.nameUser,
                    ports: vars.network.ports,
                    shares: userData[0]
                };
                data.agentRequest.ipSelected = addresses.remote.address;
                deviceIPSelected("agentRequest");
                if (agent === undefined) {
                    sender.broadcast({
                        data: data,
                        service: "invite"
                    }, "browser");
                } else {
                    // if the agent is already registered with the remote then bypass the user by auto-approving the request
                    data.message = `Accepted invitation. Request processed at responding terminal ${addresses.local.address} for type ${data.type}.  Agent already present, so auto accepted and returned to requesting terminal.`;
                    data.action = "invite-complete";
                    data.status = "accepted";
                    inviteHttp();
                }
            },
            "invite-response": function terminal_server_services_invite_inviteResponse():void {
                const respond:string = ` invitation response processed at responding terminal ${addresses.local.address} and sent to requesting terminal ${addresses.remote.address}.`;
                // stage 3 - on remote terminal to start terminal, from remote browser
                data.message = common.capitalize(data.status) + respond;
                data.action = "invite-complete";

                // a delay is required for accepted invitation of device type
                // this delay allows peer devices to recognize the requesting device as a peer before that requesting device attempts to open sockets
                if (data.status === "accepted" && (data.agentSource.hashDevice === vars.settings.hashDevice || data.agentSource.hashUser === vars.settings.hashUser)) {
                    if (data.type === "device") {
                        addAgent("agentRequest", null);
                        setTimeout(
                            function terminal_server_services_invite_inviteResponse_delay():void {
                                inviteHttp();
                            },
                            (vars.test.type.indexOf("browser_") === 0)
                                ? 500
                                : vars.settings.statusTime
                        );
                    } else {
                        inviteHttp();
                    }
                } else {
                    inviteHttp();
                }
            },
            "invite-start": function terminal_server_services_invite_invite():void {
                // stage 1 - on start terminal to remote terminal, from start browser
                data.action = "invite-request";
                inviteHttp();
            }
        };
    if (vars.test.type === "service" && data.message.indexOf("Ignored") === 0) {
        data.status = "ignored";
        service.evaluation({
            data: data,
            service: "invite"
        });
    } else {
        actions[data.action]();
    }
};

export default invite;