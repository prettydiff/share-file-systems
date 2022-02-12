/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

import { Socket } from "net";

declare global {

    // browser environment

    /**
     * Defines a global environmental object to the browser environment.
     * ```typescript
     * interface browser {
     *     content: HTMLElement;
     *     data: ui_data;
     *     device: agents;
     *     loadComplete: () => void;
     *     loadFlag: boolean;
     *     localNetwork: localNetwork;
     *     message: service_message;
     *     pageBody: HTMLElement;
     *     socket: WebSocket;
     *     style: HTMLStyleElement;
     *     testBrowser: service_testBrowser;
     *     user: agents;
     * }
     * ``` */
    interface browser {
        content: HTMLElement;
        data: ui_data;
        device: agents;
        loadComplete: () => void;
        loading: boolean;
        localNetwork: localNetwork;
        message: service_message;
        pageBody: HTMLElement;
        socket: WebSocket;
        style: HTMLStyleElement;
        testBrowser: service_testBrowser;
        user: agents;
    }

    /**
     * Local device network identity embedded in the page HTML on page request.
     * ```typescript
     * interface localNetwork {
     *     addresses: networkAddresses;
     *     httpPort: number;
     *     wsPort: number;
     * }
     * ``` */
    interface localNetwork {
        addresses: networkAddresses;
        httpPort: number;
        wsPort: number;
    }

    /**
     * Stores state data embedded into the HTML code on page request.
     * ```typescript
     * interface browserState {
     *     addresses: localNetwork;
     *     settings: settingsItems;
     *     test: service_testBrowser;
     * }
     * ``` */
    interface browserState {
        addresses: localNetwork;
        settings: settingsItems;
        test: service_testBrowser;
    }

    /**
     * The actual state object which contains configuration data and modal configurations.
     * ```typescript
     * interface ui_data {
     *     audio: boolean;
     *     brotli: brotli;
     *     color: colorScheme;
     *     colors: colors;
     *     hashDevice: string;
     *     hashType: hash;
     *     hashUser: string;
     *     modals: {
     *         [key:string]: modal;
     *     };
     *     modalTypes: modalType[];
     *     nameDevice: string;
     *     nameUser: string;
     *     storage: string;
     *     tutorial: boolean;
     *     zIndex: number;
     * }
     * type colorScheme = "dark" | "default";
     * ``` */
    interface ui_data {
        audio: boolean;
        brotli: brotli;
        color: colorScheme;
        colors: colors;
        hashDevice: string;
        hashType: hash;
        hashUser: string;
        modals: {
            [key:string]: config_modal;
        };
        modalTypes: modalType[];
        nameDevice: string;
        nameUser: string;
        storage: string;
        tutorial: boolean;
        zIndex: number;
    }
    // ------------------------------------

    // terminal

    /**
     * Retains a list of IP addresses separated as IPv4 and IPv6.
     * ```typescript
     * interface networkAddresses {
     *    IPv4: string[];
     *    IPv6: string[];
     * }
     * ``` */
     interface networkAddresses {
        IPv4: string[];
        IPv6: string[];
    }

    /**
     * Stores settings related data for global access.
     * ```typescript
     * interface terminalVariables_settings {
     *     brotli    : brotli;
     *     device    : agents;
     *     hashDevice: string;
     *     hashType  : hash;
     *     hashUser  : string;
     *     message   : service_message;
     *     nameDevice: string;
     *     nameUser  : string;
     *     status    : activityStatus;
     *     user      : agents;
     *     verbose   : boolean;
     * }
     * ```
     */
    interface terminalVariables_settings {
        brotli    : brotli;
        device    : agents;
        hashDevice: string;
        hashType  : hash;
        hashUser  : string;
        message   : service_message;
        nameDevice: string;
        nameUser  : string;
        status    : activityStatus;
        user      : agents;
        verbose   : boolean;
    }

    /**
     * The global environmental variable available to all tasks, services,  and commands executed from the terminal.
     * ```typescript
     * interface terminalVariables {
     *     environment: {
     *         addresses   : networkAddresses; // ip addresses available to this device
     *         command     : commands;         // command name currently executing the application
     *         date        : string;           // dynamically populated static value of date of prior version change
     *         git_hash    : string;           // dynamically populated static value of hash from prior git commit at latest build
     *         name        : string;           // a static name of the application
     *         port_default: number            // default port number for the http service
     *         ports       : ports;            // a list of service port numbers
     *         startTime   : bigint;           // nanosecond precision time the application starts for measuring execution performance
     *         version     : string;           // dynamically populated static value of application version number string
     *     };
     *     path: {
     *         js      : string; // file system path of the compiled JavaScript (`${vars.projectPath}lib${vars.sep}js`)
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
    interface terminalVariables {
        environment: {
            addresses   : networkAddresses;
            command     : commands;
            date        : string;
            git_hash    : string;
            name        : string;
            port_default: number;
            ports       : ports;
            startTime   : bigint;
            version     : string;
        };
        path: {
            js      : string;
            project : string;
            sep     : string;
            settings: string;
            storage : string;
        };
        settings: terminalVariables_settings;
        terminal: {
            arguments          : string;
            command_instruction: string;
            commands           : commandDocumentation;
            cwd                : string;
            exclusions         : string[];
            executionKeyword   : string;
        };
        test: {
            flags: {
                error: boolean;
                write: string;
            };
            browser: service_testBrowser;
            socket : agentStream | Socket;
            type   : testListType;
        };
        text: stringStore;
    }

    /**
     * An object to store software status information to display on verbose output of terminal commands.
     * ```typescript
     * interface version {
     *     date: string;
     *     git_hash: string;
     *     version: string;
     * }
     * ``` */
    interface version {
        date: string;
        git_hash: string;
        version: string;
    }
    // ------------------------------------
}