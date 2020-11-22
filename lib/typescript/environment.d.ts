/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

// browser environment
interface browser {
    content: HTMLElement;
    data: ui_data;
    device: agents;
    loadTest: boolean;
    localNetwork: localNetwork;
    menu: {
        export: HTMLElement;
        fileNavigator: HTMLElement;
        systemLog: HTMLElement;
        settings: HTMLElement;
        textPad: HTMLElement;
        "user-delete": HTMLElement;
        "user-invite": HTMLElement;
    };
    pageBody: Element;
    socket?: WebSocket;
    style: HTMLStyleElement;
    testBrowser: testBrowserRoute;
    user: agents;
}
interface localNetwork {
    family: "ipv4" | "ipv6";
    ip: string;
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
    modalTypes: string[];
    nameDevice: string;
    nameUser: string;
    zIndex: number;
}
// ------------------------------------

// terminal, service specific
interface FSWatcher extends Function {
    close: Function;
    time: number;
}
interface networkAddresses {
    IPv4: [string, string][];
    IPv6: [string, string][];
}
interface serverVars {
    addresses: networkAddresses;
    brotli: brotli;
    device: agents;
    hashDevice: string;
    hashType: hash;
    hashUser: string;
    ipAddress: string;
    ipFamily: "IPv6" | "IPv4";
    nameDevice: string;
    nameUser: string;
    secure: boolean;
    status: heartbeatStatus;
    storage: string;
    testBrowser?: testBrowserRoute;
    timeStore: number;
    user: agents;
    watches: {
        [key:string]: FSWatcher;
    };
    webPort: number;
    wsPort: number;
}
// ------------------------------------

// terminal, universal
interface terminalVariables {
    binary_check: RegExp;
    cli: string;
    command: string;
    commands: commandList;
    cwd: string;
    exclusions: string[];
    flags: {
        error: boolean;
        write: string;
    },
    js: string;
    node: {
        child : any;
        crypto: any;
        fs    : any;
        http  : any;
        https : any;
        http2 : any;
        net   : any;
        os    : any;
        path  : any;
        zlib  : any;
    };
    projectPath: string;
    sep: string;
    startTime: [number, number];
    testLogFlag: testLogFlag;
    testLogger: (library:string, container:string, message:string) => void;
    testLogStore: string[];
    text: {
        [key:string]: string;
    };
    verbose: boolean;
    version: version;
    ws: any;
}
interface version {
    command: string;
    date: string;
    hash: string;
    name: string;
    number: string;
    port: number;
}
// ------------------------------------