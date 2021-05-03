/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

// browser environment
interface browser {
    content: HTMLElement;
    data: ui_data;
    device: agents;
    loadFlag: boolean;
    localNetwork: localNetwork;
    message: messageItem[];
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
    modalTypes: modalType[];
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
    // eslint-disable-next-line
    ws: any;
    wsPort: number;
}
// ------------------------------------

// terminal, universal
interface terminalVariables {
    binary_check: RegExp;
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