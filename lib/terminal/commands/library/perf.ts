
/* lib/terminal/commands/library/perf - Allows for performance testing of the application. */

import { AddressInfo } from "net";

import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import readCerts from "../../server/readCerts.js";
import transmit_ws from "../../server/transmission/transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * Structure of methods for conducting performance tests.
 * ```typescript
 * interface module_perf {
 *     averages: (perfType:string) => void;         // outputs averages for the various test runs
 *     conclude: {                                  // outputs message for a given test index
 *         [key:string]: (data:socketData) => void;
 *     };
 *     frequency: number;                           // the number of action to complete in a given test index
 *     interval: {                                  // the task to execute in a given test index
 *         [key:string]: () => void;
 *     };
 *     preparation: {                               // any start up instructions to execute before measuring given test indexes
 *         [key:string]: () => void;
 *     };
 *     size: number;                                // the payload size of the thing exercised or measured
 *     socket: websocket_client;                    // holds a given socket dedicated for performance testing
 *     start: (config:config_perf_start, callback:(title:string, text:string[], fail:boolean) => void) => void;
 *     startTime: bigInt;                           // stores a high precision time number to measure against
 *     storage: number[][];                         // stores raw data per given test index
 * }
 * ``` */
const perf:module_perf = {
    averages: function terminal_commands_library_perf_averages(perfType:string):void {
        const storageLength:number = perf.storage.length;
        if (storageLength < 11) {
            //process.nextTick(perf.interval[perfType]);
            setTimeout(perf.interval[perfType], 1000);
        } else {
            const totals:[number, number, number] = [0, 0, 0],
                sdTotals:[number, number, number] = [0, 0, 0],
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
                        sdTotals[type] = sdTotals[type] + ((perf.storage[index][type] - average[type]) ** 2);
                    } while (index > 0);
                    sd[type] = Math.sqrt(sdTotals[type] / 10);
                },
                logText = function terminal_commands_library_perf_averages_logText(index:number):string {
                    const label:string[] = [
                        "Average fastest message send time (no queue)  : ",
                        "Average safe message send time (message queue): ",
                        "Average total send and receive process time   : "
                    ],
                    colors = function terminal_commands_library_perf_averages_logText_colors(color:string, message:string):string {
                        return vars.text[color] + vars.text.bold + message + vars.text.none;
                    };
                    return `${humanTime(false) + label[index] + colors("green", average[index].toFixed(8))} seconds, or ${colors("green", common.commas(Math.round(perf.frequency / average[index])))} messages per second at a standard deviation of \u00b1${colors("cyan", ((sd[index] / average[index]) * 100).toFixed(2))}%.`;
                };
            perf.storage.splice(0, 1);
            storageType(0);
            storageType(1);
            storageType(2);
            vars.settings.verbose = true;
            log([
                "",
                logText(0),
                logText(1),
                logText(2)
            ], true);
            process.exit(0);
        }
    },
    conclude: {
        socket: function terminal_commands_library_perf_concludeSocket():void {
            const duration:number = Number(process.hrtime.bigint() - perf.startTime) / 1e9,
                storageLength:number = perf.storage.length;
            log([`${humanTime(false)} Index ${storageLength}. Complete send/receive execution for ${vars.text.cyan + common.commas(perf.frequency) + vars.text.none} messages of size ${common.prettyBytes(perf.size)}: ${vars.text.green + duration + vars.text.none} seconds, or ${vars.text.green + common.commas(Math.round(perf.frequency / duration)) + vars.text.none} messages per second.`]);
            perf.storage[storageLength - 1][2] = duration;
            perf.averages("socket");
        }
    },
    frequency: 200000,
    interval: {
        socket: function terminal_commands_library_perf_intervalSocket():void {
            let index:number = perf.frequency,
                sentInsecure:number = 0,
                sentSecure:number = 0;
            const startInsecure:bigint = process.hrtime.bigint(),
                messageBody:string = "x".repeat(1024);
             perf.size = Buffer.from(JSON.stringify({
                data: ["Performance test", messageBody],
                service: "log"
            })).length;
            do {
                index = index - 1;
                transmit_ws.queue({
                    data: ["Performance test", messageBody],
                    service: "log"
                }, perf.socket, 2);
            } while (index > 0);
            sentInsecure = Number(process.hrtime.bigint() - startInsecure) / 1e9;

            index = perf.frequency;
            perf.startTime = process.hrtime.bigint();
            do {
                index = index - 1;
                transmit_ws.queue({
                    data: ["Performance test", messageBody],
                    service: "log"
                }, perf.socket, 1);
            } while (index > 0);
            sentSecure = Number(process.hrtime.bigint() - perf.startTime) / 1e9;
            perf.storage.push([sentInsecure, sentSecure, 0]);
            log([
                "",
                `${humanTime(false)} Index ${perf.storage.length}. Send time without message queues for ${vars.text.cyan + common.commas(perf.frequency) + vars.text.none} messages of size ${common.prettyBytes(perf.size)}: ${vars.text.green + sentInsecure + vars.text.none} seconds, or ${vars.text.green + common.commas(Math.round(perf.frequency / sentInsecure)) + vars.text.none} messages per second.`,
                `${humanTime(false)} Index ${perf.storage.length}. Preferred send time with a queue for ${vars.text.cyan + common.commas(perf.frequency) + vars.text.none} messages of size ${common.prettyBytes(perf.size)}: ${vars.text.green + sentSecure + vars.text.none} seconds, or ${vars.text.green + common.commas(Math.round(perf.frequency / sentSecure)) + vars.text.none} messages per second.`
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
            if (vars.settings.secure === true) {
                readCerts(function terminal_commands_library_perf_preparationSocket_readCerts(options:transmit_tlsOptions):void {
                    configServer.options = options;
                    transmit_ws.server(configServer);
                });
            } else {
                transmit_ws.server(configServer);
            }
        }
    },
    size: 0,
    socket: null,
    start: function terminal_commands_library_perf_start(config:config_perf_start):void {
        const secure:string = (config.secure === true)
            ? "Secure"
            : "Insecure";
        if (perf.preparation[config.type] === undefined) {
            error([`Unsupported perf type: ${vars.text.angry + config.type + vars.text.none}`], null);
            return;
        }
        if (config.secure === false) {
            vars.settings.secure = false;
        }
        log.title(`Performance - ${secure} ${config.type}`, vars.settings.secure);
        perf.frequency = config.frequency;
        perf.preparation[config.type]();
    },
    startTime: null,
    storage: []
};

export default perf;