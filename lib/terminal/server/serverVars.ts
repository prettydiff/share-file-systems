
/* lib/terminal/server/serverVars - A library of variables globally available for all server related tasks. */
import { NetworkInterfaceInfo } from "os";
import { Socket } from "net";

import vars from "../utilities/vars.js";

interface socketList {
    [key:string]: Socket;
}
let mac:string = "";
const socketList:socketList = {},
    serverVars:serverVars = {
        addresses: (function terminal_server_addresses():[[string, string, string][], number] {
            const interfaces:NetworkInterfaceInfo = vars.node.os.networkInterfaces(),
                store:[string, string, string][] = [],
                keys:string[] = Object.keys(interfaces),
                length:number = keys.length;
            let a:number = 0,
                b:number = 0,
                ipv6:number,
                ipv4:number,
                interfaceLongest:number = 0,
                mac6:string = "",
                mac4:string = "";
            do {
                if (interfaces[keys[a]][0].internal === false) { 
                    ipv4 = -1;
                    ipv6 = -1;
                    b = 0;
                    do {
                        if (interfaces[keys[a]][b].address.indexOf("fe80") !== 0) {
                            if (interfaces[keys[a]][b].family === "IPv6") {
                                mac6 = interfaces[keys[a]][b].mac;
                                ipv6 = b;
                                if (ipv4 > -1) {
                                    break;
                                }
                            }
                            if (interfaces[keys[a]][b].family === "IPv4") {
                                mac4 = interfaces[keys[a]][b].mac;
                                ipv4 = b;
                                if (ipv6 > -1) {
                                    break;
                                }
                            }
                        }
                        b = b + 1;
                    } while (b < interfaces[keys[a]].length);
                    if (ipv6 > -1 && interfaces[keys[a]][b].address.indexOf("fe80") !== 0) {
                        store.push([keys[a], interfaces[keys[a]][ipv6].address, "ipv6"]);
                        if (ipv4 > -1) {
                            store.push(["", interfaces[keys[a]][ipv4].address, "ipv4"]);
                        }
                    } else if (ipv4 > -1) {
                        store.push([keys[a], interfaces[keys[a]][ipv4].address, "ipv4"]);
                    }
                    if (keys[a].length > interfaceLongest && interfaces[keys[a]][0].internal === false) {
                        interfaceLongest = keys[a].length;
                    }
                }
                a = a + 1;
            } while (a < length);
            mac = (mac6 !== "")
                ? mac6
                : mac4;
            if (store.length < 1) {
                return [[["disconnected", "::1", "ipv6"], ["disconnected", "127.0.0.1", "ipv4"]], 0];
            }
            return [store, interfaceLongest];
        }()),
        brotli: 7,
        device: {},
        hashDevice: "",
        hashType: "sha3-512",
        hashUser: "",
        nameDevice: `${mac}|${vars.node.os.hostname()}|${process.env.os}|${process.hrtime().join("|")}`,
        nameUser: "",
        status: "idle",
        timeStore: 0,
        user: {},
        watches: {},
        webPort: 0, // webPort - http port for requests from browser
        wsPort: 0 // wsPort - web socket port for requests from node
    };

export default serverVars;