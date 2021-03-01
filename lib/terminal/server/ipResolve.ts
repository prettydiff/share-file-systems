/* lib/terminal/server/ipResolve - Tests connectivity to remote agents from among their known IP addresses. */

import httpClient from "./httpClient.js";
import serverVars from "./serverVars.js";

const ipResolve = function terminal_server_ipResolve(agentName:string, agentType:agentType, callback:() => void):void {
    const userAddresses:networkAddresses = ipResolve.userAddresses(),
        userList:string[] = userAddresses.IPv6.concat(userAddresses.IPv4),
        deviceList:string[] = serverVars.localAddresses.IPv6.concat(serverVars.localAddresses.IPv4),
        sendCallback = function terminal_server_ipResolve_sendCallback(message:string):void {
            const agentOnline:agentOnline = JSON.parse(message);
            agentCount = agentCount - 1;
            if (agentCount < 1) {
                serverVars[agentOnline.agentType][agentOnline.agent].ipAll = agentOnline.ipAll;
                if (agentOnline.mode === serverVars.testType || (agentOnline.mode === "browser_remote" && serverVars.testType.indexOf("browser_") === 0)) {
                    serverVars[agentOnline.agentType][agentOnline.agent].ipSelected = agentOnline.ipSelected;
                } else {
                    serverVars[agentOnline.agentType][agentOnline.agent].ipSelected = "offline";
                }
                callback();
            }
        },
        send = function terminal_server_ipResolve_send(ipCount:number, data:agentOnline, list:string[]):void {
            httpClient({
                agentType: data.agentType,
                callback: sendCallback,
                errorMessage: `Failed to resolve ip ${list[ipCount]} for ${data.agentType} ${data.agent}`,
                ip: list[ipCount],
                payload: JSON.stringify(data),
                port: serverVars[data.agentType][data.agent].port,
                requestError: function terminal_server_ipResponse_send_requestError():void {
                    ipCycle(ipCount, data, list);
                },
                requestType: "agent-online",
                responseError: function terminal_server_ipResponse_send_responseError():void {
                    ipCycle(ipCount, data, list);
                },
                responseStream: httpClient.stream
            });
        },
        perAgent = function terminal_server_ipResolve_perAgent(name:string, type:agentType):void {
            const list:string[] = (type === "user")
                ? userList
                : deviceList;
            ipCycle(list.length, {
                agent: name,
                agentType: type,
                ipAll: (type === "user")
                    ? userAddresses
                    : serverVars.localAddresses,
                ipSelected: "",
                mode: serverVars.testType
            }, list);
        },
        ipCycle = function terminal_server_ipResolve_ipCycle(ipCount:number, data:agentOnline, list:string[]):void {
            if (ipCount > 0) {
                ipCount = ipCount - 1;
                send(ipCount, data, list);
            } else {
                agentCount = agentCount - 1;
                if (agentCount < 1) {
                    serverVars[data.agentType][data.agent].ipSelected = "offline";
                    callback();
                }
            }
        };
    if (agentName !== "all" && serverVars[agentType][agentName] === undefined) {
        callback();
        return;
    }
    let agentCount:number;
    if (agentName === "all") {
        const devices:string[] = Object.keys(serverVars.device),
            users:string[] = Object.keys(serverVars.user),
            countD:number = devices.length,
            countU:number = users.length;
        let a:number = 0;
        agentCount = countD + countU;
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
        deviceLength:number = deviceKeys.length;
    let a:number = 0;
    do {
        output.IPv4.concat(serverVars.device[deviceKeys[a]].ipAll.IPv4);
        output.IPv6.concat(serverVars.device[deviceKeys[a]].ipAll.IPv6);
        a = a + 1;
    } while (a < deviceLength);
    return output;
};

export default ipResolve;