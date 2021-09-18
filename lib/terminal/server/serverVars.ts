
/* lib/terminal/server/serverVars - A library of variables globally available for all server related tasks. */

import { hostname, networkInterfaces, NetworkInterfaceInfo, NetworkInterfaceInfoIPv4, NetworkInterfaceInfoIPv6 } from "os";

import vars from "../utilities/vars.js";

let address:networkAddresses,
    nameDevice:string;
const serverVars:serverVars = {
    broadcast: function terminal_utilities_vars_broadcast(type:requestType, data:string):void {
        serverVars.socketClients.forEach(function terminal_utilities_vars_broadcast_clients(client:socketClient):void {
            client.write(`${type},${data}`);
        });
    },                                                                // broadcast        - push out a message digest to all websocket clients (listening browsers on local device)
    brotli: (function terminal_server_addresses():brotli {
        const interfaces:{ [index: string]: NetworkInterfaceInfo[]; } = networkInterfaces(),
            store:networkAddresses = {
                IPv4: [],
                IPv6: []
            },
            keys:string[] = Object.keys(interfaces),
            length:number = keys.length;
        let a:number = 0,
            mac:string = "",
            mac6:string = "",
            mac4:string = "",
            interfaceItem:(NetworkInterfaceInfoIPv4|NetworkInterfaceInfoIPv6)[];
        do {
            interfaceItem = interfaces[keys[a]];
            if (interfaceItem[0].internal === false && interfaceItem[1] !== undefined) {
                if (interfaceItem[0].family === "IPv4") {
                    if (interfaceItem[1].address.indexOf("169.254") !== 0) {
                        mac4 = interfaceItem[0].mac;
                        store.IPv4.push(interfaceItem[0].address);
                    }
                    if (interfaceItem[1].family === "IPv6" && interfaceItem[1].address.indexOf("fe80") !== 0) {
                        mac6 = interfaceItem[1].mac;
                        store.IPv6.push(interfaceItem[1].address);
                    }
                } else {
                    if (interfaceItem[0].address.indexOf("fe80") !== 0) {
                        mac6 = interfaceItem[0].mac;
                        store.IPv6.push(interfaceItem[0].address);
                    }
                    if (interfaceItem[1].family === "IPv4" && interfaceItem[1].address.indexOf("169.254") !== 0) {
                        mac4 = interfaceItem[1].mac;
                        store.IPv4.push(interfaceItem[1].address);
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
        nameDevice = `${mac}|${hostname()}|${process.env.os}|${process.hrtime.bigint().toString()}`;
        return 7;
    }()),                                                             // brotli           - the level of compression against file transfers
    device: {},                                                       // device           - device agent data
    executionKeyword: (process.platform === "darwin")
        ? "open"
        : (process.platform === "win32")
            ? ""
            : "xdg-open",                                             // executionKeyword - the OS keyword to execute a file from the terminal
    hashDevice: "",                                                   // hashDevice       - the id of this device
    hashType: "sha3-512",                                             // hashType         - the hash algorithm this application uses for everything
    hashUser: "",                                                     // hashUser         - id of this user
    localAddresses: address,                                          // localAddresses   - ip addresses available to this device
    message: [],                                                      // message          - a store of message objects
    nameDevice: nameDevice,                                           // nameDevice       - a human friendly name of this device
    nameUser: "",                                                     // nameUser         - a human friendly name of this user
    secure: false,                                                    // secure           - whether the application is running http or https
    settings: `${vars.projectPath}lib${vars.sep}settings${vars.sep}`, // settings         - location of where settings files are saved
    socketClients: [],                                                // socketClients    - a living list of socket connections
    socketServer: null,                                               // socketServer     - WebSocket server object
    storage: `${vars.projectPath}lib${vars.sep}storage`,              // storage          - location of storage for remote files to execute
    testBrowser: null,                                                // testBrowser      - the current test_browser object when running test automation in the browser
    testType: "",                                                     // testType         - the type of test automation running in the application
    user: {},                                                         // user             - user agent data
    webPort: 0,                                                       // webPort          - http port for requests from browser
    wsPort: 0                                                         // wsPort           - web socket port for requests from node
};

export default serverVars;