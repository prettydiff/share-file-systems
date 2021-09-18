/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

import { Server } from "net";

declare global {

    // browser environment
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
        testBrowser: testBrowserRoute;
        user: agents;
    }
    interface localNetwork {
        addresses: networkAddresses;
        httpPort: number;
        wsPort: number;
    }
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
    interface FSWatcher extends Function {
        close: Function;
        time: number;
    }
    interface networkAddresses {
        IPv4: string[];
        IPv6: string[];
    }
    interface serverVars {
        broadcast: (type:requestType, data:string) => void;
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
        secure: boolean;
        settings: string;
        storage: string;
        testBrowser: testBrowserRoute;
        testType: testListType;
        user: agents;
        webPort: number;
        socketClients: socketClient[];
        socketServer: Server;
        wsPort: number;
    }
    // ------------------------------------

    // terminal, universal
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
    interface version {
        date: string;
        git_hash: string;
        version: string;
    }
    // ------------------------------------
}