
/* lib/terminal/commands/library/perf - Allows for performance testing of the application. */

import { AddressInfo } from "net";

import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

const perf:perf = {
    conclude: {
        socket: function terminal_commands_library_perf_concludeSocket():void {
            const duration:bigint = process.hrtime.bigint() - perf.startTime;
            console.log(Number(duration) / 1e9);
        }
    },
    interval: {
        socket: function terminal_commands_library_perf_intervalSocket(socket:websocket_client):void {
            let index:number = 1e6;
            perf.startTime = process.hrtime.bigint();
            do {
                index = index - 1;
                transmit_ws.queue({
                    data: ["Performance test", String(index)],
                    service: "log"
                }, socket, 1);
            } while (index > 0);
            transmit_ws.queue({
                data: ["Performance test", "complete"],
                service: "perf-socket"
            }, socket, 1);
        }
    },
    preparation: {
        socket: function terminal_commands_library_perf_preparationSocket():void {
            const configServer:config_websocket_server = {
                callback: function terminal_commands_library_perf_preparationSocket_callbackServer(address:AddressInfo):void {
                    const callbackClient = function terminal_commands_library_perf_preparationSocket_callbackServer_callbackClient(socket:websocket_client):void {
                            perf.interval.socket(socket);
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
        }
    },
    start: function terminal_commands_library_perf_start(perfType:perfType, callback:commandCallback):void {
        if (perf.preparation[perfType] === undefined) {
            error([`Unsupported perf type: ${vars.text.angry + perfType + vars.text.none}`]);
            return;
        }
        vars.settings.secure = false;
        log.title(`Performance - ${perfType}`, vars.settings.secure);
        perf.preparation[perfType]();
    },
    startTime: null
};

export default perf;