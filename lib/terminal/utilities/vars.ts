
/* lib/terminal/utilities/vars - Globally available variables for the terminal utility. */
import { hostname, networkInterfaces, NetworkInterfaceInfo, NetworkInterfaceInfoIPv4, NetworkInterfaceInfoIPv6 } from "os";
import { sep } from "path";

// cspell:words brotli, prettydiff, sharefile

let nameDevice:string;

/**
 * The global environmental variable available to all tasks, services,  and commands executed from the terminal.
 * ```typescript
 * interface module_terminalVariables {
 *     environment: {
 *         command     : commands;              // command name currently executing the application
 *         date        : string;                // dynamically populated static value of date of prior version change
 *         dateRaw     : number;                // raw numeric version of date or prior change
 *         domain      : string[];              // supported domains that resolves to a localhost IP
 *         git_hash    : string;                // dynamically populated static value of hash from prior git commit at latest build
 *         module_type : "commonjs" | "module"  // the type of module system the application is currently using
 *         log         : string[]               // a storage of console.log items
 *         name        : string;                // a static name of the application
 *         startTime   : bigint;                // nanosecond precision time the application starts for measuring execution performance
 *         stateDefault: settings_item          // stores default keys/values for passing and resetting state
 *         version     : string;                // dynamically populated static value of application version number string
 *     };
 *     network: {
 *         addresses   : transmit_addresses_IP;          // ip addresses available to this device
 *         count       : terminalVariables_networkCount; // a count of network transmissions by protocol type and send/receive
 *         domain      : string[];                       // supported domains that resolves to a localhost IP
 *         port_default: number;                         // default port number for the http service
 *         ports       : ports;                          // a list of service port numbers
 *         size        : terminalVariables_networkCount; // a count of data size transmitted by protocol type and send/receive
 *     };
 *     path: {
 *         js      : string; // file system path of the compiled JavaScript (`${vars.projectPath}lib${vars.sep}js`)
 *         node    : string; // path to the node binary running this application
 *         project : string; // absolute file system path of this application
 *         sep     : string; // file system separator character
 *         settings: string; // location where configuration files are read from and written to
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
 *         storage   : string;          // location for temporary file writes when requesting to execute a file not on this immediate device
 *         user      : agents;          // stores a list of user type agents
 *         verbose   : boolean;         // whether verbose message should be applied to the terminal
 *     };
 *     terminal: {
 *         arguments          : string;               // a list of all terminal arguments before this list is modified, only used in error reporting
 *         command_instruction: string;               // terminal command that executes this application from a terminal, such as "node js/lib/terminal/utilities/terminal "
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
 *         type   : test_listType;        // type of test automation running in the application
 *     };
 *     text: stringStore;                 // ANSI text formatting for terminal output
 * }
 * type activityStatus = "" | "active" | "deleted" | "idle" | "offline";
 * type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
 * type commands = "agent_data" | "agent_online" | "base64" | "build" | "certificate" | "commands" | "copy" | "directory" | "get" | "hash" | "lint" | "mkdir" | "remove" | "service" | "test_browser" | "test_service" | "test_simulation" | "test" | "update" | "version | websocket";
 * type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
 * type testListType = "" | "browser_device" | "browser_remote" | "browser_self" | "browser_user" | "service" | "simulation";
 * ``` */
const vars:module_terminalVariables = {
    environment: {
        command: "service",
        date: "",
        dateRaw: 0,
        git_hash: "",
        module_type: "module",
        log: [],
        name: "Share File Systems",
        startTime: process.hrtime.bigint(),
        stateDefault: {
            configuration: {
                audio: false,
                brotli: 0,
                color: "default",
                colors: {
                    device: {},
                    user: {}
                },
                fileSort: "file-system-type",
                hashDevice: "",
                hashType: "sha3-512",
                hashUser: "",
                minimizeAll: false,
                modals: {},
                modalTypes: [],
                nameDevice: "",
                nameUser: "",
                statusTime: 15000,
                storage: "",
                tutorial: false,
                zIndex: 0
            },
            device: {},
            message: [],
            queue: {
                device: {},
                user: {}
            },
            user: {}
        },
        version: ""
    },
    network: {
        addresses: (function terminal_server_addresses():transmit_addresses_IP {
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
                itemLen:number = 0,
                interfaceItem:(NetworkInterfaceInfoIPv4|NetworkInterfaceInfoIPv6)[];
            do {
                interfaceItem = interfaces[keys[a]];
                itemLen = interfaceItem.length;
                do {
                    itemLen = itemLen - 1;
                    if (interfaceItem[itemLen].internal === false) {
                        if (interfaceItem[itemLen].family === "IPv4" && interfaceItem[itemLen].address.indexOf("169.254") !== 0) {
                            mac4 = interfaceItem[itemLen].mac;
                            store.IPv4.push(interfaceItem[itemLen].address);
                        } else if (interfaceItem[itemLen].family === "IPv6" && interfaceItem[itemLen].address.indexOf("fe80") !== 0) {
                            mac6 = interfaceItem[itemLen].mac;
                            store.IPv6.push(interfaceItem[itemLen].address);
                        }
                    }
                } while (itemLen > 0);
                a = a + 1;
            } while (a < length);
            mac = (mac6 !== "")
                ? mac6
                : mac4;
            nameDevice = `${mac}|${hostname()}|${process.env.os}|${process.hrtime.bigint().toString()}`;
            if (store.IPv4.length < 1 && store.IPv6.length < 1) {
                return {
                    IPv4: ["127.0.0.1"],
                    IPv6: ["::1"]
                };
            }
            return store;
        }()),
        count: {
            http: {
                receive: 0,
                send: 0
            },
            ws: {
                receive: 0,
                send: 0
            }
        },
        domain: [
            "localhost",
            "localhost.prettydiff.com",
            "sharefile.systems"
        ],
        port_default: 443,
        ports: {
            http: 0,
            ws: 0
        },
        size: {
            http: {
                receive: 0,
                send: 0
            },
            ws: {
                receive: 0,
                send: 0
            }
        }
    },
    path: {
        js: "",
        node: "",
        project: "",
        sep: sep,
        settings: "",
        testStorage: ""
    },
    settings: {
        audio: true,
        brotli: 7,
        color: "default",
        colors: {
            device: {},
            user: {}
        },
        device: {},
        fileSort: "file-system-type",
        hashDevice: "",
        hashType: "sha3-512",
        hashUser: "",
        message: [],
        minimizeAll: false,
        modals: {},
        modalTypes: [],
        nameDevice: nameDevice,
        nameUser: "",
        queue: {
            device: {},
            user: {}
        },
        secure: true,
        status: "idle",
        statusTime: 15000,
        storage: "",
        tutorial: true,
        user: {},
        verbose: false,
        zIndex: 0
    },
    terminal: {
        arguments: process.argv.join(" "),
        command_instruction: "node js/lib/terminal/utilities/terminal ",
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
                    listBuilder = function terminal_utilities_vars_exclusions_listBuilder(string:string):void {
                        let b:number = 0,
                            item:string[] = [],
                            quote:string = "";
                        const len:number = string.length;
                        do {
                            if (quote === "") {
                                if ((/\s/).test(string.charAt(b)) === true) {
                                    if (item.length > 0) {
                                        list.push(item.join(""));
                                        item = [];
                                    }
                                } else {
                                    if (string.charAt(b) === "\"" || string.charAt(b) === "'") {
                                        quote = string.charAt(b);
                                    } else if (string.charAt(b) === "," && item.length > 0) {
                                        list.push(item.join(""));
                                        item = [];
                                    } else if (string.charAt(b) !== ",") {
                                        item.push(string.charAt(b));
                                    }
                                }
                            } else {
                                if (string.charAt(b) === quote) {
                                    quote = "";
                                    list.push(item.join(""));
                                    item = [];
                                } else {
                                    item.push(string.charAt(b));
                                }
                            }
                            b = b + 1;
                        } while (b < len);
                    };
                let len:number = process.argv.length,
                    ignoreIndex:number = process.argv.indexOf("ignore"),
                    a:number = ignoreIndex + 1,
                    str:string = "";
                do {
                    if (ignoreIndex < 0 && process.argv[a].indexOf("ignore[") === 0) {
                        ignoreIndex = a;
                    } else if (a >= ignoreIndex && (/\]$/).test(process.argv[a]) === true) {
                        str = process.argv.slice(ignoreIndex, a + 1).join(" ").replace(/^ignore\s*\[/, "").replace(/\]$/, "");
                        listBuilder(str);
                        process.argv.splice(ignoreIndex, a - ignoreIndex + 1);
                        return list;
                    }
                    a = a + 1;
                } while (a < len);
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
vars.path.settings = `${vars.path.project}lib${vars.path.sep}settings${vars.path.sep}`;
vars.path.testStorage = `${vars.path.project}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}storageBrowser${vars.path.sep}`;
vars.settings.storage = `${vars.path.project}lib${vars.path.sep}storage${vars.path.sep}`;
vars.environment.stateDefault.configuration.storage = `${vars.path.project}lib${vars.path.sep}storage${vars.path.sep}`;

export default vars;