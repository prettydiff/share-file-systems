
import log from "../log.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const socketServerListener = function terminal_server_socketServerListener():void {
    // discover the socket server port in case its a random port
    serverVars.serverPort = serverVars.socketReceiver.address().port;

    // creates a broadcast utility where all listening clients get a web socket message
    vars.ws.broadcast = function terminal_server_socketServerListener_broadcast(data:string):void {
        vars.ws.clients.forEach(function terminal_server_socketServerListener_broadcast_clients(client):void {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    };

    // discover the web socket port in case its a random port
    serverVars.wsPort = vars.ws.address().port;

    // log the port information to the terminal
    log([
        "",
        `${vars.text.cyan}HTTP server${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverVars.webPort + vars.text.none}`,
        `${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverVars.wsPort + vars.text.none}`,
        `${vars.text.cyan}TCP Service${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverVars.serverPort + vars.text.none}`,
        "Local IP addresses are:"
    ]);

    // log information about addresses to the terminal
    {
        let a:number = 0;
        serverVars.addresses[0].forEach(function terminal_server_socketServerListener_localAddresses(value:[string, string, string]):void {
            a = value[0].length;
            if (a < serverVars.addresses[1]) {
                do {
                    value[0] = value[0] + " ";
                    a = a + 1;
                } while (a < serverVars.addresses[1]);
            }
            if (value[0].charAt(0) === " ") {
                log([`     ${value[0]}: ${value[1]}`]);
            } else {
                log([`   ${vars.text.angry}*${vars.text.none} ${value[0]}: ${value[1]}`]);
            }
        });
        log([
            `Address for web browser: ${vars.text.bold + vars.text.green}http://localhost:${serverVars.webPort + vars.text.none}`,
            `or                     : ${vars.text.bold + vars.text.green}http://[${serverVars.addresses[0][0][1]}]:${serverVars.webPort + vars.text.none}`
        ]);
        if (serverVars.addresses[0][1][0].charAt(0) === " ") {
            log([
                `or                     : ${vars.text.bold + vars.text.green}http://${serverVars.addresses[0][1][1]}:${serverVars.webPort + vars.text.none}`,
                "",
                `Address for net service: ${vars.text.bold + vars.text.green + serverVars.addresses[0][1][1]}:${serverVars.serverPort + vars.text.none}`
            ]);
        } else {
            log(["", `Address for net service: ${vars.text.bold + vars.text.green}[${serverVars.addresses[0][0][1]}]:${serverVars.serverPort + vars.text.none}`]);
        }
        log([""]);
    }
};

export default socketServerListener;