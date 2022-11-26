
/* lib/terminal/commands/library/perf - Allows for performance testing of the application. */

import { AddressInfo } from "net";

import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * Structure of methods for conducting performance tests.
 * ```typescript
 * interface module_perf {
 *     averages: (perfType:string, count:number) => void;
 *     conclude: {
 *         [key:string]: (data:socketData) => void;
 *     };
 *     interval: {
 *         [key:string]: () => void;
 *     };
 *     preparation: {
 *         [key:string]: () => void;
 *     };
 *     socket: websocket_client;
 *     start: (perfType:perfType, callback:(title:string, text:string[], fail:boolean) => void) => void;
 *     startTime: bigInt;
 *     storage: number[][];
 * }
 * ``` */
const perf:module_perf = {
    averages: function terminal_commands_library_perf_averages(perfType:string, count:number):void {
        const storageLength:number = perf.storage.length;
        if (storageLength < 11) {
            //process.nextTick(perf.interval[perfType]);
            setTimeout(perf.interval[perfType], 1000);
        } else {
            const totals:[number, number, number] = [0, 0, 0],
                average:[number, number, number] = [0, 0, 0],
                sd:[number, number, number] = [0, 0, 0],
                storageType = function terminal_commands_library_perf_averages_storageType(type:number):void {
                    let index:number = 10;
                    do {
                        index = index - 1;
                        totals[type] = perf.storage[index][type] + totals[type];
                    } while (index > 0);
                    average[type] = totals[type] / 10;

                    // calculate standard deviation
                    index = 10;
                    do {
                        index = index - 1;
                        sd[type] = sd[type] + (perf.storage[index][type] - average[type]) ** 2;
                    } while (index > 0);
                    sd[type] = Math.abs(Math.sqrt(sd[type] / 10));
                };
            perf.storage.splice(0, 1);
            storageType(0);
            storageType(1);
            storageType(2);
            vars.settings.verbose = true;
            log([
                "",
                `${humanTime(false)} Average fastest message send time (no queue)  : ${vars.text.green + vars.text.bold + average[0].toFixed(8) + vars.text.none} seconds, or ${vars.text.green + vars.text.bold + common.commas(Math.round(count / average[0])) + vars.text.none} messages per second at a standard deviation of \u00b1${(sd[0]).toFixed(2)}.`,
                `${humanTime(false)} Average safe message send time (message queue): ${vars.text.green + vars.text.bold + average[1].toFixed(8) + vars.text.none} seconds, or ${vars.text.green + vars.text.bold + common.commas(Math.round(count / average[1])) + vars.text.none} messages per second at a standard deviation of \u00b1${(sd[1]).toFixed(2)}.`,
                `${humanTime(false)} Average total send and receive process time   : ${vars.text.green + vars.text.bold + average[2].toFixed(8) + vars.text.none} seconds, or ${vars.text.green + vars.text.bold + common.commas(Math.round(count / average[2])) + vars.text.none} messages per second at a standard deviation of \u00b1${(sd[2]).toFixed(2)}.`
            ], true);
            process.exit(0);
        }
    },
    conclude: {
        socket: function terminal_commands_library_perf_concludeSocket():void {
            const duration:number = Number(process.hrtime.bigint() - perf.startTime) / 1e9,
                count:number = 200000,
                storageLength:number = perf.storage.length;
            log([`${humanTime(false)} Index ${storageLength}. Complete send/receive execution time for ${vars.text.cyan + common.commas(count) + vars.text.none} messages: ${vars.text.green + duration + vars.text.none} seconds, or ${vars.text.green + common.commas(Math.round(count / duration)) + vars.text.none} messages per second.`]);
            perf.storage[storageLength - 1][2] = duration;
            perf.averages("socket", count);
        }
    },
    interval: {
        socket: function terminal_commands_library_perf_intervalSocket():void {
            const count:number = 200000;
            let index:number = count,
                sentInsecure:number = 0,
                sentSecure:number = 0,
                startInsecure:bigint = process.hrtime.bigint();
            do {
                index = index - 1;
                transmit_ws.queue({
                    data: ["Performance test", String(index)],
                    service: "log"
                }, perf.socket, 2);
            } while (index > 0);
            sentInsecure = Number(process.hrtime.bigint() - startInsecure) / 1e9;

            index = count;
            perf.startTime = process.hrtime.bigint();
            do {
                index = index - 1;
                transmit_ws.queue({
                    data: ["Performance test", String(index)],
                    service: "log"
                }, perf.socket, 1);
            } while (index > 0);
            sentSecure = Number(process.hrtime.bigint() - perf.startTime) / 1e9;
            perf.storage.push([sentInsecure, sentSecure, 0]);
            log([
                "",
                `${humanTime(false)} Index ${perf.storage.length}. TLS send time without message queues for ${vars.text.cyan + common.commas(count) + vars.text.none} messages: ${vars.text.green + sentInsecure + vars.text.none} seconds, or ${vars.text.green + common.commas(Math.round(count / sentInsecure)) + vars.text.none} messages per second.`,
                `${humanTime(false)} Index ${perf.storage.length}. Preferred TLS send time with a queue for ${vars.text.cyan + common.commas(count) + vars.text.none} messages: ${vars.text.green + sentSecure + vars.text.none} seconds, or ${vars.text.green + common.commas(Math.round(count / sentSecure)) + vars.text.none} messages per second.`
            ]);
            transmit_ws.queue({
                data: ["Performance test", "complete"],
                service: "perf-socket"
            }, perf.socket, 1);
        }
    },
    preparation: {
        socket: function terminal_commands_library_perf_preparationSocket():void {
            const configServer:config_websocket_server = {
                callback: function terminal_commands_library_perf_preparationSocket_callbackServer(address:AddressInfo):void {
                    const callbackClient = function terminal_commands_library_perf_preparationSocket_callbackServer_callbackClient(socket:websocket_client):void {
                            perf.socket = socket;
                            perf.interval.socket();
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
    socket: null,
    start: function terminal_commands_library_perf_start(perfType:perfType):void {
        if (perf.preparation[perfType] === undefined) {
            error([`Unsupported perf type: ${vars.text.angry + perfType + vars.text.none}`]);
            return;
        }
        vars.settings.secure = false;
        log.title(`Performance - ${perfType}`, vars.settings.secure);
        perf.preparation[perfType]();
    },
    startTime: null,
    storage: []
};

export default perf;