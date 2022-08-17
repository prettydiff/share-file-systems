/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

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
 *     addresses: transmit_addresses_IP;
 *     httpPort: number;
 *     wsPort: number;
 * }
 * ``` */
interface localNetwork {
    addresses: transmit_addresses_IP;
    httpPort: number;
    wsPort: number;
}

/**
 * Stores state data embedded into the HTML code on page request.
 * ```typescript
 * interface browserState {
 *     addresses: localNetwork;
 *     settings: settings_item;
 *     test: service_testBrowser;
 * }
 * ``` */
interface browserState {
    addresses: localNetwork;
    settings: settings_item;
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
 *     statusTime: number;
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
    statusTime: number;
    storage: string;
    tutorial: boolean;
    zIndex: number;
}
// ------------------------------------

// terminal

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
 *     secure    : boolean;
 *     status    : activityStatus;
 *     statusTime: number;
 *     storage   : string;
 *     user      : agents;
 *     verbose   : boolean;
 * }
 * ``` */
interface terminalVariables_settings {
    brotli    : brotli;
    device    : agents;
    hashDevice: string;
    hashType  : hash;
    hashUser  : string;
    message   : service_message;
    nameDevice: string;
    nameUser  : string;
    secure    : boolean;
    status    : activityStatus;
    statusTime: number;
    storage   : string;
    user      : agents;
    verbose   : boolean;
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