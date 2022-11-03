
/* lib/terminal/commands/library/perf - Allows for performance testing of the application. */

import { AddressInfo } from "net";
import { ChildProcess, spawn } from "child_process";

import error from "../../utilities/error.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

const perf = function terminal_commands_library_perf(perfType:perfType, callback:commandCallback):void {
    const methods:perf = {
        interval: {
            socket: function terminal_common_library_perf_intervalSocket():void {}
        },
        preparation: {
            socket: function terminal_commands_library_perf_preparationSocket():void {
                const configServer:config_websocket_server = {
                    callback: function terminal_commands_library_perf_preparationSocket_callbackServer(address:AddressInfo):void {
                        const callbackClient = function terminal_Commands_library_perf_preparationSocket_callbackServer_callbackClient(socket:websocket_client):void {
                                console.log("client callback from perf");
                            },
                            configClient:config_websocket_openService = {
                                callback: callbackClient,
                                handler: null,
                                hash: "perf",
                                ip: "localhost",
                                port: address.port,
                                type: "perf"
                            };
                        transmit_ws.open.service(configClient);
                    },
                    host: "localhost",
                    port: 0,
                    options: null
                };
                transmit_ws.server(configServer);
                /*const server:ChildProcess = spawn("share websocket address-output", [], {
                    shell: true
                });
                server.stdout.once("data", function terminal_commands_library_perf_preparationSocket_server(data:Buffer) {
                    const str:string = data.toString().replace(/\s+$/, ""),
                        callbackClient = function terminal_Commands_library_perf_preparationSocket_callbackServer_callbackClient(socket:websocket_client):void {
                            console.log("client callback from perf");
                        },
                        configClient:config_websocket_openService = {
                            callback: callbackClient,
                            handler: null,
                            hash: null,
                            ip: "127.0.0.1",
                            port: null,
                            type: "perf"
                        };
                        console.log("|"+str+"|");
                    server.stdout.on("data", function (serverLogs:Buffer) {console.log(serverLogs.toString())})
                    if (str.charAt(0) === "{" && str.charAt(str.length - 1) === "}") {
                        configClient.port = JSON.parse(str).port;
                        transmit_ws.open.service(configClient);
                    } else {
                        error([
                            `Error: expected a JSON string, but instead received:`,
                            str
                        ]);
                    }
                });*/
            }
        }
    };
    if (methods.preparation[perfType] === undefined) {
        error([`Unsupported perf type: ${vars.text.angry + perfType + vars.text.none}`]);
        return;
    }
    methods.preparation[perfType]();
};

export default perf;