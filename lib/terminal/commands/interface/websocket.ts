
/* lib/terminal/commands/interface/websocket - Shell interface to start a websocket server from the terminal. */

import readCerts from "../../server/readCerts.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

const websocket = function terminal_commands_interface_websocket(callback:commandCallback):void {
    const config:config_websocket_server = {
        callback: function terminal_commands_interface_websocket_callback(addressInfo:node_net_AddressInfo):void {
            const output:string[] = [],
                ipList = function terminal_commands_interface_websocket_callback_ipList(ipCallback:(ip:string) => void):void {
                    const addresses = function terminal_commands_interface_websocket_callback_ipList_addresses(scheme:"IPv4"|"IPv6"):void {
                        let a:number = vars.network.addresses[scheme].length;
                        if (a > 0) {
                            do {
                                a = a - 1;
                                ipCallback(vars.network.addresses[scheme][a]);
                            } while (a > 0);
                        }
                    };
                    addresses("IPv6");
                    addresses("IPv4");
                };
            if (process.argv.indexOf("address-output") > -1) {
                output.push("{\"address\":[");
                ipList(function terminal_commands_interface_websocket_addressList_ipCallback(ip:string):void {
                    output.push(`"${ip}"`);
                });
                output.push(`],"port":${addressInfo.port}}`);
                callback("", [output.join(",").replace("[,", "[").replace(",]", "]")], null);
            } else {
                output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + String(addressInfo.port) + vars.text.none}`);
                output.push("");

                output.push("Listening on addresses:");
                ipList(function terminal_commands_interface_websocket_ipList_ipCallback(ip:string):void {
                    output.push(`   ${vars.text.angry}*${vars.text.none} ${ip}`);
                });
                output.push("");
                if (vars.test.type === "browser_remote") {
                    output.push("");
                    callback("", output, null);
                } else {
                    output.push(`For command documentation execute: ${vars.text.cyan + vars.terminal.command_instruction}commands${vars.text.none}`);
                    callback("Websocket Server", output, null);
                }
            }
        },
        host: "",
        options: null,
        port: 0
    };
    let a:number = process.argv.length;

    if (a > 0) {
        do {
            a = a - 1;
            if (process.argv[a].indexOf("ip:") === 0) {
                // address
                config.host = process.argv[a].replace("ip:", "");
            } else if ((/^\d+$/).test(process.argv[a]) === true) {
                // port
                config.port = Number(process.argv[a]);
            }
        } while (a > 0);
    }

    readCerts(function terminal_commands_interface_websocket_readCerts(tlsOptions:transmit_tlsOptions):void {
        config.options = tlsOptions;
        transmit_ws.server(config);
    });
};

export default websocket;