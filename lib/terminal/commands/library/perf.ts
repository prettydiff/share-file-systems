
/* lib/terminal/commands/library/perf - Allows for performance testing of the application. */

import { AddressInfo } from "net";

import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";
import { count } from "console";

const perf = function terminal_commands_library_perf(perfType:perfType, callback:commandCallback):void {
    const methods:perf = {
        interval: {
            socket: function terminal_commands_library_perf_intervalSocket(socket:websocket_client):void {
                let time:boolean = true,
                    iteration:number = 11,
                    queueCount:number = 0;
                const count:number[] = [],
                    data:service_fileSystem = {
                        action: "fs-details",
                        agentRequest: null,
                        agentSource: null,
                        agentWrite: null,
                        depth: 1,
                        location: [""],
                        name: "perf"
                    },
                    payload:socketData = {
                        data: data,
                        service: "file-system"
                    },
                    iterate = function terminal_commands_library_perf_intervalSocket_iterate():void {
                        const items:number = 1e7;
                        data.depth = Number(process.hrtime.bigint());
                        do {
                            transmit_ws.queue(payload, socket, 1);
                            queueCount = queueCount + 1;
                        } while (queueCount < items);
                        /*iteration = iteration - 1;
                        if (iteration > 0) {
                            terminal_commands_library_perf_intervalSocket_iterate();
                        } else {
                            count.splice(0, 1);
                            console.log((count[0] + count[1] + count[2] + count[3] + count[4] + count[5] + count[6] + count[7] + count[8] + count[9]) / 1e10);
                            console.log(count);
                        }*/
                    };
                iterate();
                /*do {
                    iteration = iteration - 1;
                    startTime = process.hrtime.bigint();
                    count.push(process.hrtime.bigint() - startTime);
                    // times are too fast, need to capture when queue hits 0 length
                } while (iteration > 0);
                count.splice(0, 1);
                console.log(`${Number((count[0] + count[1] + count[2] + count[3] + count[4] + count[5] + count[6] + count[7] + count[8] + count[9]) / 10n)}`);
                console.log(count);*/
            }
        },
        preparation: {
            socket: function terminal_commands_library_perf_preparationSocket():void {
                const configServer:config_websocket_server = {
                    callback: function terminal_commands_library_perf_preparationSocket_callbackServer(address:AddressInfo):void {
                        const callbackClient = function terminal_commands_library_perf_preparationSocket_callbackServer_callbackClient(socket:websocket_client):void {
                                methods.interval.socket(socket);
                            },
                            receiver = function terminal_commands_library_perf_preparationSocket_callbackServer_receiver(result:Buffer):void {
                                console.log(result.toString());
                            },
                            configClient:config_websocket_openService = {
                                callback: callbackClient,
                                handler: receiver,
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
            }
        }
    };
    if (methods.preparation[perfType] === undefined) {
        error([`Unsupported perf type: ${vars.text.angry + perfType + vars.text.none}`]);
        return;
    }
    vars.settings.secure = false;
    log.title(`Performance - ${perfType}`, vars.settings.secure);
    methods.preparation[perfType]();
};

export default perf;