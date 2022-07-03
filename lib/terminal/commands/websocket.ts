
/* lib/terminal/commands/websocket - A utility to start a websocket server from the terminal. */

import { AddressInfo } from "net";

import log from "../utilities/log.js";
import readCerts from "../server/readCerts.js";
import transmit_ws from "../server/transmission/transmit_ws.js";
import vars from "../utilities/vars.js";

const websocket = function terminal_commands_websocket():void {
    const config:config_websocket_server = {
        callback: function terminal_commands_websocket_callback(addressInfo:AddressInfo):void {
            const output:string[] = [],
                ipList = function terminal_commands_websocket_callback_ipList(ipCallback:(ip:string) => void):void {
                    const addresses = function terminal_commands_websocket_callback_ipList_addresses(scheme:"IPv4"|"IPv6"):void {
                        let a:number = vars.environment.addresses[scheme].length;
                        if (a > 0) {
                            do {
                                a = a - 1;
                                ipCallback(vars.environment.addresses[scheme][a]);
                            } while (a > 0);
                        }
                    };
                    addresses("IPv6");
                    addresses("IPv4");
                };
            output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + addressInfo.port + vars.text.none}`);
            output.push("");

            if (vars.environment.addresses.IPv6.length + vars.environment.addresses.IPv4.length === 1) {
                output.push("Local IP address is:");
            } else {
                output.push("Local IP addresses are:");
            }
            output.push("");

            output.push("Listening on addresses:");
            ipList(function terminal_commands_websocket_ipList_ipCallback(ip:string):void {
                output.push(`   ${vars.text.angry}*${vars.text.none} ${ip}`);
            });
            if (certLogs !== null) {
                certLogs.forEach(function terminal_commands_websocket_certLogs(value:string):void {
                    output.push(value);
                });
            }
            output.push("");
            if (vars.test.type === "browser_remote") {
                output.push("");
            } else {
                log.title("Websocket Server");
                output.push(`For command documentation execute: ${vars.text.cyan + vars.terminal.command_instruction}commands${vars.text.none}`);
            }
            log(output, true);
        },
        host: "",
        options: null,
        port: 0
    };
    let a:number = process.argv.length,
        certLogs:string[] = null;

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

    readCerts(function terminal_commands_websocket_readCerts(tlsOptions:transmit_tlsOptions, logs:string[]):void {
        config.options = tlsOptions;
        certLogs = logs;
        transmit_ws.server(config);
    });
};

export default websocket;