
/* lib/terminal/utilities/vars - Globally available variables for the terminal utility. */
import { hostname, networkInterfaces, NetworkInterfaceInfo, NetworkInterfaceInfoIPv4, NetworkInterfaceInfoIPv6 } from "os";
import { sep } from "path";

let address:transmit_addresses_IP,
    nameDevice:string;

/**
 * The global environmental variable available to all tasks, services,  and commands executed from the terminal.
 * ```typescript
 * interface module_terminalVariables {
 *     environment: {
 *         addresses   : transmit_addresses_IP; // ip addresses available to this device
 *         command     : commands;              // command name currently executing the application
 *         date        : string;                // dynamically populated static value of date of prior version change
 *         git_hash    : string;                // dynamically populated static value of hash from prior git commit at latest build
 *         name        : string;                // a static name of the application
 *         port_default: number                 // default port number for the http service
 *         ports       : ports;                 // a list of service port numbers
 *         startTime   : bigint;                // nanosecond precision time the application starts for measuring execution performance
 *         version     : string;                // dynamically populated static value of application version number string
 *     };
 *     path: {
 *         js      : string; // file system path of the compiled JavaScript (`${vars.projectPath}lib${vars.sep}js`)
 *         node    : string; // path to the node binary running this application
 *         project : string; // absolute file system path of this application
 *         sep     : string; // file system separator character
 *         settings: string; // location where configuration files are read from and written to
 *         storage : string; // location for temporary file writes when requesting to execute a file not on this immediate device
 *     };
 *     settings: {
 *         brotli    : brotli;          // stores the brotli compress level
 *         device    : agents;          // stores the device type agents
 *         hashDevice: string;          // hash identifier for this device
 *         hashType  : hash;            // current selected hash algorithm, default: sha3-512
 *         hashUser  : string;          // hash identifier for the user of this device
 *         message   : service_message; // a store of message objects
 *         nameDevice: string;          // user friendly name of this device
 *         nameUser  : string;          // user friendly name of this device's user
 *         status    : activityStatus;  // device activity status
 *         user      : agents;          // stores a list of user type agents
 *         verbose   : boolean;         // whether verbose message should be applied to the terminal
 *     };
 *     terminal: {
 *         arguments          : string;               // a list of all terminal arguments before this list is modified, only used in error reporting
 *         command_instruction: string;               // terminal command that executes this application from a terminal, such as "node js/application "
 *         commands           : commandDocumentation; // interactive terminal command documentation
 *         cwd                : string;               // current working directory from the perspective of the TypeScript libraries (`${vars.projectPath}lib`)
 *         exclusions         : string[];             // a file system exclusion list provided by the user from terminal arguments
 *         executionKeyword   : string;               // an OS specific keyword to execute an application by name from the terminal
 *     };
 *     test: {
 *         flags: {
 *             error: boolean;
 *             write: string;
 *         };                             // properties used by service and simulation tests so that error message is identified independent of other test execution
 *         browser: service_testBrowser;  // current test_browser object when running test automation in the browser
 *         socket : agentStream | Socket; // holds a socket for service tests
 *         type   : testListType;         // type of test automation running in the application
 *     };
 *     text: stringStore;                - ANSI text formatting for terminal output
 * }
 * type activityStatus = "" | "active" | "deleted" | "idle" | "offline";
 * type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
 * type commands = "agent_data" | "agent_online" | "base64" | "build" | "certificate" | "commands" | "copy" | "directory" | "get" | "hash" | "lint" | "mkdir" | "remove" | "service" | "test_browser" | "test_service" | "test_simulation" | "test" | "update" | "version";
 * type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
 * type testListType = "" | "browser_device" | "browser_remote" | "browser_self" | "browser_user" | "service" | "simulation";
 * ``` */
const vars:module_terminalVariables = {
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
        node: "",
        project: "",
        sep: "/",
        settings: "",
        storage: ""
    },
    settings: {
        brotli: (function terminal_server_addresses():brotli {
            const interfaces:{ [index: string]: NetworkInterfaceInfo[]; } = networkInterfaces(),
                store:transmit_addresses_IP = {
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
        secure: true,
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