
/* lib/terminal/server/serverVars - A library of variables globally available for all server related tasks. */
import { NetworkInterfaceInfo } from "os";

import vars from "../utilities/vars.js";

let address:networkAddresses,
    mac:string;
const serverVars:serverVars = {
        addresses: (function terminal_server_addresses():networkAddresses {
            const interfaces:NetworkInterfaceInfo = vars.node.os.networkInterfaces(),
                store:networkAddresses = {
                    IPv4: [],
                    IPv6: []
                },
                keys:string[] = Object.keys(interfaces),
                length:number = keys.length;
            let a:number = 0,
                mac6:string = "",
                mac4:string = "";
            do {
                if (interfaces[keys[a]][0].internal === false) {
                    if (interfaces[keys[a]][0].family === "IPv4") {
                        mac4 = interfaces[keys[a]][0].mac;
                        store.IPv4.push([interfaces[keys[a]][0].address, keys[a]]);
                        if (interfaces[keys[a]][1].family === "IPv6" && interfaces[keys[a]][1].address.indexOf("fe80") !== 0) {
                            mac6 = interfaces[keys[a]][1].mac;
                            store.IPv6.push([interfaces[keys[a]][1].address, keys[a]]);
                        }
                    } else {
                        if (interfaces[keys[a]][0].address.indexOf("fe80") !== 0) {
                            mac6 = interfaces[keys[a]][0].mac;
                            store.IPv6.push([interfaces[keys[a]][0].address, keys[a]]);
                        }
                        if (interfaces[keys[a]][1].family === "IPv4") {
                            mac4 = interfaces[keys[a]][1].mac;
                            store.IPv4.push([interfaces[keys[a]][1].address, keys[a]]);
                        }
                    }
                }
                a = a + 1;
            } while (a < length);
            mac = (mac6 !== "")
                ? mac6
                : mac4;
            if (store.IPv4.length < 1 && store.IPv6.length < 1) {
                address = {
                    IPv4: [["127.0.0.1", "disconnected"]],
                    IPv6: [["::1", "disconnected"]]
                };
            } else {
                address = store;
            }
            return address;
        }()),
        brotli: 7,
        device: {},
        hashDevice: "",
        hashType: "sha3-512",
        hashUser: "",
        ipAddress: (address.IPv6.length > 0)
            ? address.IPv6[0][0]
            : address.IPv4[0][0],
        ipFamily: (address.IPv6.length > 0)
            ? "IPv6"
            : "IPv4",
        nameDevice: `${mac}|${vars.node.os.hostname()}|${process.env.os}|${process.hrtime().join("|")}`,
        nameUser: "",
        secure: true,
        status: "active",
        storage: (vars.command === "test_browser" || vars.command === "test_browser_remote")
            ? `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageBrowser${vars.sep}`
            : (vars.command.indexOf("test") === 0)
                ? `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storageService${vars.sep}`
                : `${vars.projectPath}lib${vars.sep}storage${vars.sep}`,
        timeStore: 0,
        user: {},
        watches: {},
        webPort: 0, // webPort - http port for requests from browser
        wsPort: 0 // wsPort - web socket port for requests from node
    };

export default serverVars;