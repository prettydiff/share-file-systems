/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

import { ServerResponse } from "http";
import { Socket } from "net";

declare global {

    // browser environment

    /**
     * Defines a global environmental object to the browser environment.
     * ```typescript
     * interface browser {
     *     activeElement: HTMLElement;
     *     content: HTMLElement;
     *     data: ui_data;
     *     device: agents;
     *     loadFlag: boolean;
     *     localNetwork: localNetwork;
     *     message: messageItem[];
     *     pageBody: HTMLElement;
     *     socket?: WebSocket;
     *     style: HTMLStyleElement;
     *     testBrowser: service_testBrowser;
     *     user: agents;
     * }
     * ``` */
    interface browser {
        activeElement: HTMLElement;
        content: HTMLElement;
        data: ui_data;
        device: agents;
        loadFlag: boolean;
        localNetwork: localNetwork;
        message: messageItem[];
        pageBody: HTMLElement;
        socket?: WebSocket;
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
            [key:string]: modal;
        };
        modalTypes: modalType[];
        nameDevice: string;
        nameUser: string;
        storage: string;
        tutorial: boolean;
        zIndex: number;
    }
    // ------------------------------------

    // terminal, service specific

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
     * The global environmental object available to application services when running the *service* command.
     * ```typescript
     * interface serverVars {
     *     brotli: brotli;
     *     device: agents;
     *     executionKeyword: string;
     *     hashDevice: string;
     *     hashType: hash;
     *     hashUser: string;
     *     localAddresses: networkAddresses;
     *     message: messageItem[];
     *     nameDevice: string;
     *     nameUser: string;
     *     ports: ports;
     *     secure: boolean;
     *     settings: string;
     *     storage: string;
     *     testBrowser: service_testBrowser;
     *     testSocket: ServerResponse | Socket;
     *     testType: testListType;
     *     user: agents;
     * }
     * type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
     * type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
     * type testListType = "" | "browser_device" | "browser_remote" | "browser_self" | "browser_user" | "service" | "simulation";
     * ``` */
    interface serverVars {
        brotli: brotli;
        device: agents;
        executionKeyword: string;
        hashDevice: string;
        hashType: hash;
        hashUser: string;
        localAddresses: networkAddresses;
        message: messageItem[];
        nameDevice: string;
        nameUser: string;
        ports: ports;
        secure: boolean;
        settings: string;
        storage: string;
        testBrowser: service_testBrowser;
        testSocket: ServerResponse | Socket;
        testType: testListType;
        user: agents;
    }
    // ------------------------------------

    // terminal, universal

    /**
     * The global environmental variable available to all tasks, services,  and commands executed from the terminal.
     * ```typescript
     * interface terminalVariables {
     *     cli: string;
     *     command: commands;
     *     command_instruction: string;
     *     commands: commandDocumentation;
     *     cwd: string;
     *     date: string;
     *     exclusions: string[];
     *     flags: {
     *         error: boolean;
     *         write: string;
     *     };
     *     git_hash: string;
     *     js: string;
     *     name: string;
     *     port_default: {
     *         insecure: number;
     *         secure: number;
     *     };
     *     projectPath: string;
     *     sep: string;
     *     startTime: bigint;
     *     text: {
     *         [key:string]: string;
     *     };
     *     verbose: boolean;
     *     version: string;
     * }
     * type commands = "agent_data" | "agent_online" | "base64" | "build" | "certificate" | "commands" | "copy" | "directory" | "get" | "hash" | "lint" | "mkdir" | "remove" | "service" | "test_browser" | "test_service" | "test_simulation" | "test" | "update" | "version";
     * ``` */
    interface terminalVariables {
        cli: string;
        command: commands;
        command_instruction: string;
        commands: commandDocumentation;
        cwd: string;
        date: string;
        exclusions: string[];
        flags: {
            error: boolean;
            write: string;
        };
        git_hash: string;
        js: string;
        name: string;
        port_default: {
            insecure: number;
            secure: number;
        };
        projectPath: string;
        sep: string;
        startTime: bigint;
        text: {
            [key:string]: string;
        };
        verbose: boolean;
        version: string;
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