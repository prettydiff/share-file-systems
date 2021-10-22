/* lib/terminal/server/ipResolve - Tests connectivity to remote agents from among their known IP addresses. */

import httpSender from "./httpSender.js";
import serverVars from "./serverVars.js";

const ipResolve = function terminal_server_ipResolve(agentName:string, agentType:agentType, callback:(output:string) => void):void {
    const userAddresses:networkAddresses = (agentType === "user" || agentName === "all" || agentName === "user")
            ? ipResolve.userAddresses()
            : {
                IPv4: [],
                IPv6: []
            },
        summary:agentSummary = {
            device: {},
            user: {}
        },
        plural:boolean = (agentName === "all" || agentName === "device" || agentName === "user"),
        userList:string[] = userAddresses.IPv6.concat(userAddresses.IPv4),
        agentCallback = function terminal_server_ipResolve_agentCallback(label:string, agent:string, type:agentType):void {
            agentCount = agentCount - 1;
            summary[type][agent] = label;
            if (agentCount < 1) {
                if (plural === true) {
                    callback(JSON.stringify(summary));
                } else {
                    callback(label);
                }
            }
        },
        responseCallback = function terminal_server_ipResolve_responseCallback(message:Buffer|string):void {
            const agentOnline:agentOnline = JSON.parse(message.toString());
            let status:string;
            if (agentOnline.mode === serverVars.testType || (agentOnline.mode === "browser_remote" && serverVars.testType.indexOf("browser_") === 0)) {
                serverVars[agentOnline.agentType][agentOnline.agent].ipSelected = agentOnline.ipSelected;
                status = "online";
            } else {
                serverVars[agentOnline.agentType][agentOnline.agent].ipSelected = "offline";
                status = `test mode ${agentOnline.mode}`;
            }
            serverVars[agentOnline.agentType][agentOnline.agent].ipAll = agentOnline.ipAll;
            agentCallback(status, agentOnline.agent, agentOnline.agentType);
        },
        ipCycle = function terminal_server_ipResolve_ipCycle(ipCount:number, data:agentOnline, list:string[]):void {
            if (ipCount > 0) {
                ipCount = ipCount - 1;
                send(ipCount, data, list);
            } else {
                serverVars[data.agentType][data.agent].ipSelected = "offline";
                agentCallback("offline", data.agent, data.agentType);
            }
        },
        send = function terminal_server_ipResolve_send(ipCount:number, data:agentOnline, list:string[]):void {
            httpSender({
                agent: data.agent,
                agentType: data.agentType,
                callback: responseCallback,
                ip: list[ipCount],
                payload: JSON.stringify(data),
                port: serverVars[data.agentType][data.agent].ports.http,
                requestError: function terminal_server_ipResponse_send_requestError():void {
                    ipCycle(ipCount, data, list);
                },
                requestType: "agent-online",
                responseError: function terminal_server_ipResponse_send_responseError():void {
                    ipCycle(ipCount, data, list);
                }
            });
        },
        perAgent = function terminal_server_ipResolve_perAgent(name:string, type:agentType):void {
            const unk:boolean = serverVars[type][name] === undefined,
                list:string[] = (type === "user")
                    ? userList
                    : (unk === true)
                        ? []
                        : serverVars.device[name].ipAll.IPv6.concat(serverVars.device[name].ipAll.IPv4);
            if (unk === true) {
                agentCallback("unknown", name, type);
            } else if (type === "device" && name === serverVars.hashDevice) {
                agentCallback("self", name, type);
            } else {
                ipCycle(list.length, {
                    agent: name,
                    agentType: type,
                    ipAll: (type === "user")
                        ? userAddresses
                        : serverVars.localAddresses,
                    ipSelected: "",
                    mode: serverVars.testType
                }, list);
            }
        };
    let agentCount:number;
    if (plural === true) {
        const devices:string[] = (agentName === "user")
                ? []
                : Object.keys(serverVars.device),
            users:string[] = (agentName === "device")
                ? []
                : Object.keys(serverVars.user),
            countD:number = devices.length,
            countU:number = users.length;
        let a:number = 0;
        agentCount = countD + countU;
        if (agentCount < 2) {
            callback("none");
        }
        if (countD > 0) {
            do {
                perAgent(devices[a], "device");
                a = a + 1;
            } while (a < countD);
        }
        if (countU > 0) {
            a = 0;
            do {
                perAgent(users[a], "user");
                a = a + 1;
            } while (a < countU);
        }
    } else {
        agentCount = 1;
        perAgent(agentName, agentType);
    }
};

ipResolve.parse = function terminal_server_ipResolve_parse(input:string):string {
    if (input.indexOf("::ffff:") === 0) {
        return input.replace("::ffff:", "");
    }
    if (input.indexOf(":") > 0 && input.indexOf(".") > 0) {
        return input.slice(0, input.lastIndexOf(":"));
    }
    return input;
};

ipResolve.userAddresses = function terminal_server_ipResolve_userAddresses():networkAddresses {
    const output:networkAddresses = {
            IPv4: [],
            IPv6: []
        },
        deviceKeys:string[] = Object.keys(serverVars.device),
        deviceLength:number = deviceKeys.length,
        populate4 = function terminal_server_ipResolve_userAddresses_populate4(value:string):void {
            if (output.IPv4.indexOf(value) < 0) {
                output.IPv4.push(value);
            }
        },
        populate6 = function terminal_server_ipResolve_userAddresses_populate6(value:string):void {
            if (output.IPv6.indexOf(value) < 0) {
                output.IPv6.push(value);
            }
        };
    let a:number = 0;
    do {
        serverVars.device[deviceKeys[a]].ipAll.IPv4.forEach(populate4);
        serverVars.device[deviceKeys[a]].ipAll.IPv6.forEach(populate6);
        a = a + 1;
    } while (a < deviceLength);
    return output;
};

export default ipResolve;