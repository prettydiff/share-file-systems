
/* lib/terminal/utilities/vars - Globally available variables for the terminal utility. */
import { hostname, networkInterfaces, NetworkInterfaceInfo, NetworkInterfaceInfoIPv4, NetworkInterfaceInfoIPv6 } from "os";
import { sep } from "path";

let address:networkAddresses,
    nameDevice:string;

// top scoped variables used in the terminal libraries
const vars:terminalVariables = {
    environment: {
        addresses: null,
        command: "service",
        date: "",
        git_hash: "",
        name: "Share File Systems",
        port_default: 443,
        ports: {
            http: 0,
            ws: 0
        },
        startTime: process.hrtime.bigint(),
        version: ""
    },
    path: {
        js: "",
        project: "",
        sep: "/",
        settings: "",
        storage: ""
    },
    settings: {
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
        }()),
        device: {},
        hashDevice: "",
        hashType: "sha3-512",
        hashUser: "",
        message: [],
        nameDevice: nameDevice,
        nameUser: "",
        status: "active",
        user: {},
        verbose: false
    },
    terminal: {
        arguments: process.argv.join(" "),
        command_instruction: "node js/application ",
        commands: {
            exampleName: {
                description: "Provide a clear purpose.  What problem does this solve?",
                example: [
                    {
                        code: "Provide an example command directive typed into the terminal.",
                        defined: "Describe the code example and differentiate it from other examples"
                    }
                ]
            }
        },
        cwd: process.cwd().replace(/(\/|\\)js$/, ""),
        exclusions: (function terminal_utilities_vars_exclusions():string[] {
            const args:string = process.argv.join(" ");
            if ((/\signore\s*\[/).test(args) === true) {
                const list:string[] = [],
                    listBuilder = function terminal_utilities_vars_exclusions_listBuilder():void {
                        do {
                            if (process.argv[a] === "]" || process.argv[a].charAt(process.argv[a].length - 1) === "]") {
                                if (process.argv[a] !== "]") {
                                    list.push(process.argv[a].replace(/,$/, "").slice(0, process.argv[a].length - 1));
                                }
                                process.argv.splice(ignoreIndex, (a + 1) - ignoreIndex);
                                break;
                            }
                            list.push(process.argv[a].replace(/,$/, ""));
                            a = a + 1;
                        } while (a < len);
                    };
                let a:number = 0,
                    len:number = process.argv.length,
                    ignoreIndex:number = process.argv.indexOf("ignore");
                if (ignoreIndex > -1 && ignoreIndex < len - 1 && process.argv[ignoreIndex + 1].charAt(0) === "[") {
                    a = ignoreIndex + 1;
                    if (process.argv[a] !== "[") {
                        process.argv[a] = process.argv[a].slice(1).replace(/,$/, "");
                    }
                    listBuilder();
                } else {
                    do {
                        if (process.argv[a].indexOf("ignore[") === 0) {
                            ignoreIndex = a;
                            break;
                        }
                        a = a + 1;
                    } while (a < len);
                    if (a < len && process.argv[a] !== "ignore[") {
                        process.argv[a] = process.argv[a].slice(7);
                        if (process.argv[a].charAt(process.argv[a].length - 1) === "]") {
                            list.push(process.argv[a].replace(/,$/, "").slice(0, process.argv[a].length - 1));
                        } else {
                            listBuilder();
                        }
                    }
                }
                return list;
            }
            return [];
        }()),
        executionKeyword: (process.platform === "darwin")
            ? "open"
            : (process.platform === "win32")
                ? ""
                : "xdg-open",
    },
    test: {
        flags: {
            error: false,
            write: ""
        },
        browser: null,
        socket: null,
        type: "",
    },
    text: {
        angry    : "\u001b[1m\u001b[31m",
        blue     : "\u001b[34m",
        bold     : "\u001b[1m",
        boldLine : "\u001b[1m\u001b[4m",
        clear    : "\u001b[24m\u001b[22m",
        cyan     : "\u001b[36m",
        green    : "\u001b[32m",
        noColor  : "\u001b[39m",
        none     : "\u001b[0m",
        purple   : "\u001b[35m",
        red      : "\u001b[31m",
        underline: "\u001b[4m",
        yellow   : "\u001b[33m"
    }
};
vars.environment.addresses = address;
vars.path.sep = sep;
vars.path.settings = `${vars.path.project}lib${vars.path.sep}settings${vars.path.sep}`;
vars.path.storage = `${vars.path.project}lib${vars.path.sep}storage`;

export default vars;