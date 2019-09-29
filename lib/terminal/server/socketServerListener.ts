
import log from "../log.js";
import vars from "../vars.js";

import newHeartbeat from "./newHeartbeat.js";
import serverVars from "./serverVars.js";

// This function only executes when the server starts listening, comes online.  There are not events in this function.
const socketServerListener = function terminal_server_socketServerListener():void {
    const logOutput = function terminal_server_socketServerListener_logger():void {
        const output:string[] = [];
        let a:number = 0;

        // discover the socket server port in case its a random port
        serverVars.serverPort = serverVars.socketReceiver.address().port;
    
        // discover the web socket port in case its a random port
        serverVars.wsPort = vars.ws.address().port;
    
        // log the port information to the terminal
        output.push("");
        output.push(`${vars.text.cyan}HTTP server${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverVars.webPort + vars.text.none}`);
        output.push(`${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverVars.wsPort + vars.text.none}`);
        output.push(`${vars.text.cyan}TCP Service${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverVars.serverPort + vars.text.none}`);
        output.push("Local IP addresses are:");

        serverVars.addresses[0].forEach(function terminal_server_socketServerListener_logger_localAddresses(value:[string, string, string]):void {
            a = value[0].length;
            if (a < serverVars.addresses[1]) {
                do {
                    value[0] = value[0] + " ";
                    a = a + 1;
                } while (a < serverVars.addresses[1]);
            }
            if (value[0].charAt(0) === " ") {
                output.push(`     ${value[0]}: ${value[1]}`);
            } else {
                output.push(`   ${vars.text.angry}*${vars.text.none} ${value[0]}: ${value[1]}`);
            }
        });
        output.push(`Address for web browser: ${vars.text.bold + vars.text.green}http://localhost:${serverVars.webPort + vars.text.none}`);
        output.push(`or                     : ${vars.text.bold + vars.text.green}http://[${serverVars.addresses[0][0][1]}]:${serverVars.webPort + vars.text.none}`);
        if (serverVars.addresses[0][1][0].charAt(0) === " ") {
            output.push(`or                     : ${vars.text.bold + vars.text.green}http://${serverVars.addresses[0][1][1]}:${serverVars.webPort + vars.text.none}`);
            output.push("");
            output.push(`Address for net service: ${vars.text.bold + vars.text.green + serverVars.addresses[0][1][1]}:${serverVars.serverPort + vars.text.none}`);
        } else {
            output.push("");
            output.push(`Address for net service: ${vars.text.bold + vars.text.green}[${serverVars.addresses[0][0][1]}]:${serverVars.serverPort + vars.text.none}`);
        }
        output.push("");
        log(output);
    };

    // Creates a socket with each shared user, based on data in the /storage/settings.json, upon coming online
    vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}settings.json`, "utf8", function terminal_server_socketServerListener_readSettings(err:nodeError, fileData:string):void {
        if (err !== null && err.code !== "ENOENT") {
            logOutput();
            log([err.toString()]);
        } else {
            const settings:ui_data = JSON.parse(fileData),
                shares:string[] = Object.keys(settings.shares),
                length:number = shares.length;
            if (length < 2) {
                logOutput();
            } else {
                let a:number = 1,
                    ip:string,
                    port:string,
                    lastColon:number;
                do {
                    lastColon = shares[a].lastIndexOf(":");
                    ip = shares[a].slice(shares[a].indexOf("@") + 1, lastColon);
                    port = shares[a].slice(lastColon + 1);
                    newHeartbeat(ip, Number(port), settings.name);
                    a = a + 1;
                } while (a < length);
                logOutput();
            }
        }
    });
};

export default socketServerListener;