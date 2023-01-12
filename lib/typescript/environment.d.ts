/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

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
 *     title: string;
 *     user: agents;
 *     visible: boolean;
 * }
 * ``` */
interface browser {
    content: HTMLElement;
    data: ui_data;
    device: agents;
    loadComplete: () => void;
    loading: boolean;
    message: service_message;
    network: localNetwork;
    pageBody: HTMLElement;
    socket: WebSocket;
    style: HTMLStyleElement;
    testBrowser: service_testBrowser;
    title: string;
    user: agents;
    visible: boolean;
}

/**
 * Local device network identity embedded in the page HTML on page request.
 * ```typescript
 * interface localNetwork {
 *     addresses: transmit_addresses_IP;
 *     ports: ports;
 * }
 * ``` */
interface localNetwork {
    addresses: transmit_addresses_IP;
    ports: ports;
}

/**
 * The state management object implanted into the page.
 * ```typescript
 * interface stateData {
 *     name: string;
 *     network: localNetwork;
 *     settings: settings_item;
 *     test: service_testBrowser;
 * }
 * ``` */
interface stateData {
    name: string;
    network: localNetwork;
    settings: settings_item;
    test: service_testBrowser;
}

/**
 * Stores transmit counts per protocol type.
 * ```typescript
 * interface terminalVariables_networkCountByType {
 *     receive: number;
 *     send: number;
 * }
 * ``` */
interface terminalVariables_networkCountByType {
    receive: number;
    send: number;
}

/**
 * Stores transmit counts by protocol type.
 * ```typescript
 * interface terminalVariables_networkCount {
 *     http: terminalVariables_networkCountByType;
 *     ws: terminalVariables_networkCountByType;
 * }
 * ``` */
interface terminalVariables_networkCount {
    http: terminalVariables_networkCountByType;
    ws: terminalVariables_networkCountByType;
}

/**
 * Stores settings related data for global access.
 * ```typescript
 * interface terminalVariables_settings {
 *     audio     : boolean;
 *     brotli    : brotli;
 *     color     : string;
 *     colors    : browser_colors;
 *     device    : agents;
 *     fileSort  : fileSort;
 *     hashDevice: string;
 *     hashType  : hash;
 *     hashUser  : string;
 *     message   : service_message;
 *     modals    : {
 *         [key:string]: config_modal;
 *     };
 *     modalTypes: modalType[];
 *     nameDevice: string;
 *     nameUser  : string;
 *     queue     : transmit_queue;
 *     secure    : boolean;
 *     status    : activityStatus;
 *     statusTime: number;
 *     storage   : string;
 *     tutorial  : boolean;
 *     user      : agents;
 *     verbose   : boolean;
 *     zIndex    : number;
 * }
 * ``` */
interface terminalVariables_settings {
    audio     : boolean;
    brotli    : brotli;
    color     : string;
    colors    : browser_colors;
    device    : agents;
    fileSort  : fileSort;
    hashDevice: string;
    hashType  : hash;
    hashUser  : string;
    message   : service_message;
    modals    : {
        [key:string]: config_modal;
    };
    modalTypes: modalType[];
    nameDevice: string;
    nameUser  : string;
    queue     : transmit_queue;
    secure    : boolean;
    status    : activityStatus;
    statusTime: number;
    storage   : string;
    tutorial  : boolean;
    user      : agents;
    verbose   : boolean;
    zIndex    : number;
}

/**
 * The actual state object which contains configuration data and modal configurations.
 * ```typescript
 * interface ui_data {
 *     audio: boolean;
 *     brotli: brotli;
 *     color: string;
 *     colors: browser_colors;
 *     fileSort: fileSort;
 *     hashDevice: string;
 *     hashType: hash;
 *     hashUser: string;
 *     modals: {
 *         [key:string]: modal;
 *     };
 *     modalTypes: modalType[];
 *     nameDevice: string;
 *     nameUser: string;
 *     statusTime: number;
 *     storage: string;
 *     tutorial: boolean;
 *     zIndex: number;
 * }
 * ``` */
interface ui_data {
    audio: boolean;
    brotli: brotli;
    color: string;
    colors: browser_colors;
    fileSort: fileSort;
    hashDevice: string;
    hashType: hash;
    hashUser: string;
    modals: {
        [key:string]: config_modal;
    };
    modalTypes: modalType[];
    nameDevice: string;
    nameUser: string;
    statusTime: number;
    storage: string;
    tutorial: boolean;
    zIndex: number;
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