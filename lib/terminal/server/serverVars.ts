
/* lib/terminal/server/serverVars - A library of variables globally available for all server related tasks. */
import { NetworkInterfaceInfo } from "os";

import vars from "../utilities/vars.js";

let address:networkAddresses,
    mac:string;
const serverVars:serverVars = {
        brotli: (function terminal_server_addresses():brotli {
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
                if (interfaces[keys[a]][0].internal === false && interfaces[keys[a]][1] !== undefined) {
                    if (interfaces[keys[a]][0].family === "IPv4") {
                        if (interfaces[keys[a]][1].address.indexOf("169.254") !== 0) {
                            mac4 = interfaces[keys[a]][0].mac;
                            store.IPv4.push(interfaces[keys[a]][0].address);
                        }
                        if (interfaces[keys[a]][1].family === "IPv6" && interfaces[keys[a]][1].address.indexOf("fe80") !== 0) {
                            mac6 = interfaces[keys[a]][1].mac;
                            store.IPv6.push(interfaces[keys[a]][1].address);
                        }
                    } else {
                        if (interfaces[keys[a]][0].address.indexOf("fe80") !== 0) {
                            mac6 = interfaces[keys[a]][0].mac;
                            store.IPv6.push(interfaces[keys[a]][0].address);
                        }
                        if (interfaces[keys[a]][1].family === "IPv4" && interfaces[keys[a]][1].address.indexOf("169.254") !== 0) {
                            mac4 = interfaces[keys[a]][1].mac;
                            store.IPv4.push(interfaces[keys[a]][1].address);
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
                    IPv4: ["127.0.0.1"],
                    IPv6: ["::1"]
                };
            } else {
                address = store;
            }
            return 7;
        }()),
        device: {},
        hashDevice: "",
        hashType: "sha3-512",
        hashUser: "",
        localAddresses: address,
        nameDevice: `${mac}|${vars.node.os.hostname()}|${process.env.os}|${process.hrtime.bigint().toString()}`,
        nameUser: "",
        requests: 0,
        secure: false,
        status: "active",
        storage: `${vars.projectPath}lib${vars.sep}storage${vars.sep}`,
        testBrowser: null,
        testType: "",
        timeStore: 0,
        user: {},
        watches: {},
        webPort: 0, // webPort - http port for requests from browser
        wsPort: 0 // wsPort - web socket port for requests from node
    };

export default serverVars;