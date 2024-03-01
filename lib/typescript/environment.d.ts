/* lib/typescript/environment.d - TypeScript interfaces that define environmental objects. */

// cspell: words brotli

/**
 * Defines a global environmental object to the browser environment.
 * ```typescript
 * interface browser {
 *     agents: agentData;
 *     colorDefaults: browser_colorList;
 *     configuration: () => void;
 *     content: HTMLElement;
 *     contextElement: HTMLElement;
 *     contextType: contextType;
 *     dragFlag: dragFlag;
 *     loading: boolean;
 *     loadQueue: socketData[];
 *     message: service_message;
 *     modal_titles: {
 *         [key:string]: {
 *             icon: string;
 *             menu: boolean;
 *             text: string;
 *         };
 *     };
 *     pageBody: HTMLElement;
 *     scrollbar: number;
 *     send: (ata:socketDataType, service:service_type) => void;
 *     socket: WebSocket;
 *     style: HTMLStyleElement;
 *     testBrowser: service_testBrowser;
 *     title: string;
 *     ui: ui_data;
 *     visible: boolean;
 * }
 * ``` */
interface browser {
    agents: agentData;
    colorDefaults: browser_colorList;
    configuration: () => void;
    content: HTMLElement;
    contextElement: HTMLElement;
    contextType: contextType;
    dragFlag: dragFlag;
    identity: identity;
    loading: boolean;
    loadQueue: socketData[];
    message: service_message;
    modal_titles: {
        [key:string]: {
            icon: string;
            menu: boolean;
            text: string;
        };
    };
    network: localNetwork;
    pageBody: HTMLElement;
    scrollbar: number;
    send: (ata:socketDataType, service:service_type) => void;
    socket: WebSocket;
    style: HTMLStyleElement;
    testBrowser: service_testBrowser;
    title: string;
    ui: ui_data;
    visible: boolean;
}

/**
 * Local device network identity embedded in the page HTML on page request.
 * ```typescript
 * interface localNetwork {
 *     addresses: transmit_addresses_IP;
 *     default: {
 *         secure: number;
 *         unsecure: number;
 *     };
 *     port: number;
 * }
 * ``` */
interface localNetwork {
    addresses: transmit_addresses_IP;
    default: {
        secure: number;
        unsecure: number;
    };
    port: number;
}

/**
 * The state management object implanted into the page.
 * ```typescript
 * interface stateData {
 *     name: string;
 *     network: localNetwork;
 *     settings: state_storage;
 *     "socket-map": socketMap;
 *     test: service_testBrowser;
 * }
 * ``` */
interface stateData {
    name: string;
    network: localNetwork;
    settings: state_storage;
    "socket-map": socketMap;
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
 *     message : service_message;
 *     queue   : transmit_queue;
 *     secure  : boolean;
 *     status  : activityStatus;
 *     ui      : ui_data;
 *     verbose : boolean;
 * }
 * ``` */
interface terminalVariables_settings {
    message : service_message;
    queue   : transmit_queue;
    secure  : boolean;
    status  : activityStatus;
    ui      : ui_data;
    verbose : boolean;
}

/**
 * The actual state object which contains configuration data and modal configurations.
 * ```typescript
 * interface ui_data {
 *     audio: boolean;
 *     brotli: brotli;
 *     color: string;
 *     colorBackgrounds: colorBackgrounds;
 *     colors: browser_colors;
 *     fileSort: fileSort;
 *     hashType: hash;
 *     minimizeAll: boolean;
 *     modals: {
 *         [key:string]: config_modal;
 *     };
 *     modalTypes: modalType[];
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
    colorBackgrounds: colorBackgrounds;
    colors: browser_colors;
    fileSort: fileSort;
    hashType: hash;
    minimizeAll: boolean;
    modals: {
        [key:string]: config_modal;
    };
    modalTypes: modalType[];
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
 *     mtime: number;
 *     version: string;
 * }
 * ``` */
interface version {
    date: string;
    git_hash: string;
    mtime: number;
    version: string;
}