/* lib/terminal/utilities/ipList - Returns a list of ip addresses for a specified agent. */

import vars from "./vars.js";

const ipList = function terminal_utilities_ipList(agent:agent, ports:boolean, formatting:string):string[] {
    const output:string[] = [],
        list:transmit_addresses_IP = (agent === null || Object.keys(vars.settings.device).length === 0)
            ? vars.network.addresses
            : agent.ipAll,
        addresses = function terminal_utilities_ipList_addresses(ipType:"IPv4"|"IPv6"):void {
            let a:number = list[ipType].length;
            if (a > 0) {
                do {
                    a = a - 1;
                    output.push(formatting + list[ipType][a]);
                } while (a > 0);
            }
        };
    if (list === null) {
        return output;
    }
    addresses("IPv6");
    addresses("IPv4");
    if (ports === true) {
        output.push("");
        output.push(`${vars.text.cyan}Ports:${vars.text.none}`);
        output.push(`${formatting}HTTP - ${vars.network.ports.http}`);
        output.push(`${formatting}WS   - ${vars.network.ports.ws}`);
    }
    return output;
};

export default ipList;