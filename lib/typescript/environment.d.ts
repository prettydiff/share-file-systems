/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

// browser environment
interface browser {
    content: HTMLElement;
    data: ui_data;
    device: agents;
    loadFlag: boolean;
    localNetwork: localNetwork;
    pageBody: Element;
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
    modalTypes: string[];
    nameDevice: string;
    nameUser: string;
    storage: string;
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
    status: heartbeatStatus;
    storage: string;
    testBrowser: testBrowserRoute;
    testType: testListType;
    user: agents;
    webPort: number;
    wsPort: number;
}
// ------------------------------------

// terminal, universal
interface terminalVariables {
    binary_check: RegExp;
    broadcast: (type:requestType, data:string) => void;
    cli: string;
    command: string;
    commands: commandList;
    cwd: string;
    exclusions: string[];
    flags: {
        error: boolean;
        write: string;
    };
    js: string;
    node: {
        // eslint-disable-next-line
        child : any;
        // eslint-disable-next-line
        crypto: any;
        // eslint-disable-next-line
        fs    : any;
        // eslint-disable-next-line
        http  : any;
        // eslint-disable-next-line
        https : any;
        // eslint-disable-next-line
        http2 : any;
        // eslint-disable-next-line
        net   : any;
        // eslint-disable-next-line
        os    : any;
        // eslint-disable-next-line
        path  : any;
        // eslint-disable-next-line
        stream: any;
        // eslint-disable-next-line
        zlib  : any;
    };
    projectPath: string;
    sep: string;
    startTime: bigint;
    text: {
        [key:string]: string;
    };
    verbose: boolean;
    version: version;
    // eslint-disable-next-line
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