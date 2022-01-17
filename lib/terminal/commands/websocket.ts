
/* lib/terminal/commands/websocket - A utility to start a websocket server from the terminal. */

import { AddressInfo } from "net";

import log from "../utilities/log.js";
import readCerts from "../server/readCerts.js";
import serverVars from "../server/serverVars.js";
import transmit_ws from "../server/transmission/transmit_ws.js";
import vars from "../utilities/vars.js";

const websocket = function terminal_commands_websocket():void {
    const config:config_websocket_server = {
        address: "",
        callback: function terminal_commands_websocket_callback(addressInfo:AddressInfo):void {
            const output:string[] = [],
                ipList = function terminal_server_transmission_agentHttp_server_start_ipList(callback:(ip:string) => void):void {
                    const addresses = function terminal_server_transmission_agentHttp_server_start_ipList_addresses(scheme:"IPv4"|"IPv6"):void {
                        let a:number = serverVars.localAddresses[scheme].length;
                        if (a > 0) {
                            do {
                                a = a - 1;
                                callback(serverVars.localAddresses[scheme][a]);
                            } while (a > 0);
                        }
                    };
                    addresses("IPv6");
                    addresses("IPv4");
                };
            output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + addressInfo.port + vars.text.none}`);
            output.push("");

            if (serverVars.localAddresses.IPv6.length + serverVars.localAddresses.IPv4.length === 1) {
                output.push("Local IP address is:");
            } else {
                output.push("Local IP addresses are:");
            }
            output.push("");

            output.push("Listening on addresses:");
            ipList(function terminal_server_transmission_agentHttp_server_start_logOutput_ipList(ip:string):void {
                output.push(`   ${vars.text.angry}*${vars.text.none} ${ip}`);
            });
            if (certLogs !== null) {
                certLogs.forEach(function terminal_server_transmission_agentHttp_server_start_logOutput_certLogs(value:string):void {
                    output.push(value);
                });
            }
            output.push("");
            if (serverVars.testType === "browser_remote") {
                output.push("");
            } else {
                log.title("Websocket Server");
                output.push(`For command documentation execute: ${vars.text.cyan + vars.command_instruction}commands${vars.text.none}`);
            }
            log(output, true);
        },
        cert: null,
        port: 0,
        secure: false
    };
    let a:number = process.argv.length,
        secure:boolean = false,
        certLogs:string[] = null;

    if (a > 0) {
        do {
            a = a - 1;
            if (process.argv[a].indexOf("ip:") === 0) {
                // address
                config.address = process.argv[a].replace("ip:", "");
            } else if ((/^\d+$/).test(process.argv[a]) === true) {
                // port
                config.port = Number(process.argv[a]);
            } else if (process.argv[a] === "secure") {
                // secure
                config.secure = true;
                secure = true;
            } else if (process.argv[a] === "insecure" && secure === false) {
                // insecure
                config.secure = false;
            }
        } while (a > 0);
    }

    if (config.secure === true) {
        readCerts(function terminal_commands_websocket_readCerts(https:certificate, logs:string[]):void {
            config.cert = https.certificate;
            certLogs = logs;
            transmit_ws.server(config);
        });
    } else {
        transmit_ws.server(config);
    }
};

export default websocket;