
/* lib/terminal/server/serverVars - A library of variables globally available for all server related tasks. */
import { NetworkInterfaceInfo } from "os";

import vars from "../utilities/vars.js";

let mac:string = "",
    address:[[string, string, string][], number];
const serverVars:serverVars = {
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
                address = [[["disconnected", "::1", "ipv6"], ["disconnected", "127.0.0.1", "ipv4"]], 0];
            } else {
                address = [store, interfaceLongest];
            }
            return address;
        }()),
        brotli: 7,
        device: {},
        hashDevice: "",
        hashType: "sha3-512",
        hashUser: "",
        ipAddress: (address[0].length > 1)
            ? address[0][1][1]
            : address[0][0][1],
        nameDevice: `${mac}|${vars.node.os.hostname()}|${process.env.os}|${process.hrtime().join("|")}`,
        nameUser: "",
        status: "active",
        storage: (vars.command === "test_browser")
            ? `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`
            : (vars.command.indexOf("test") === 0)
                ? `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageService${vars.sep}`
                : `${vars.projectPath}storage${vars.sep}`,
        timeStore: 0,
        user: {},
        watches: {},
        webPort: 0, // webPort - http port for requests from browser
        wsPort: 0 // wsPort - web socket port for requests from node
    };

export default serverVars;