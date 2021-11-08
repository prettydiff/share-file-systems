/* lib/typescript/browser.d - TypeScript interfaces used by browser specific libraries. */

/**
 * Stores audio data as a base64 string and associated meta data.
 * ```typescript
 * interface audio {
 *     [key:string]: {
 *         data: string;
 *         licenseAddress: string;
 *         licenseName: string;
 *         seconds: number;
 *         url: string;
 *     };
 * }
 * ``` */
interface audio {
    [key:string]: {
        data: string;
        licenseAddress: string;
        licenseName: string;
        seconds: number;
        url: string;
    };
}
// ------------------------------------

// configuration
/**
 * Stores two color values against an agent identifier.
 * ```typescript
 * interface colorList {
 *     [key:string]: color;
 * }
 * ``` */
interface colorList {
    [key:string]: color;
}

/**
 * Stores lists of agent colors by agent type.
 * ```typescript
 * interface colors {
 *     device: colorList;
 *     user: colorList;
 * }
 * ``` */
interface colors {
    device: colorList;
    user: colorList;
}

/**
 * A configuration object used with configuration.styleText method.
 * ``` typescript
 * interface styleText{
 *     agent: string;
 *     colors: [string, string];
 *     replace: boolean;
 *     type: agentType;
 * }
 * ``` */
interface styleText{
    agent: string;
    colors: [string, string];
    replace: boolean;
    type: agentType;
}
// ------------------------------------

// context
/**
 * Temporarily stores selected file selection data in response to user interactions, such as a copy event.
 * ```typescript
 * interface clipboard {
 *     agent: string;
 *     agentType: agentType;
 *     data: string[];
 *     id: string;
 *     share: string;
 *     type: contextType;
 * }
 * ``` */
interface clipboard {
    agent: string;
    agentType: agentType;
    data: string[];
    id: string;
    share: string;
    type: contextType;
}

/**
 * A map of supported context functions that generate the associated context menu items and assign their respective handlers.
 */
interface contextFunctions {
    base64: () => void;
    copy: () => void;
    cut: () => void;
    destroy: () => void;
    details: () => void;
    edit: () => void;
    hash: () => void;
    newDirectory: () => void;
    newFile: () => void;
    paste: () => void;
    rename: () => void;
    share: () => void;
}


interface fsDetailCounts {
    directories: number;
    files: number;
    links: number;
    size: number;
}
// ------------------------------------

// fileBrowser
interface modalHistoryConfig {
    address: string;
    history: boolean;
    id: string;
    payload: systemDataFile;
}
interface navConfig {
    agentName: string;
    agentType: agentType;
    path: string;
    readOnly: boolean;
    share: string;
}
// ------------------------------------

// invite
interface addAgent {
    type: agentType;
    hash: string;
    name: string;
    save: boolean;
}
interface invite {
    action: inviteAction;
    deviceName: string;
    deviceHash: string;
    ipAll: networkAddresses;
    ipSelected: string;
    message: string;
    modal: string;
    ports: ports;
    shares: agents;
    status: inviteStatus;
    type: agentType;
    userHash: string;
    userName: string;
}
interface inviteIndexes {
    ip: number;
    port: number;
    type: number;
}
interface invitePayload {
    action: inviteAction;
    ipAll: networkAddresses;
    ipSelected: string;
    message: string;
    modal: string;
    ports: ports;
    status: inviteStatus;
    type: agentType;
}
interface inviteSaved {
    ip: string;
    message: string;
    port: string;
    type: agentType;
}
// ------------------------------------

// message
interface mediaConfig {
    agent: string;
    agentType: agentType;
    mediaType: mediaType;
}
// ------------------------------------

// modals
interface borderMethods {
    b: (event:MouseEvent|TouchEvent) => void;
    bl: (event:MouseEvent|TouchEvent) => void;
    br: (event:MouseEvent|TouchEvent) => void;
    l: (event:MouseEvent|TouchEvent) => void;
    r: (event:MouseEvent|TouchEvent) => void;
    t: (event:MouseEvent|TouchEvent) => void;
    tl: (event:MouseEvent|TouchEvent) => void;
    tr: (event:MouseEvent|TouchEvent) => void;
}
interface modal {
    agent: string;
    agentType: agentType;
    callback?: () => void;
    content: Element;
    focus?: Element;
    height?: number;
    history?: string[];
    id?: string;
    inputs?: ui_input[];
    left?: number;
    move?: boolean;
    read_only: boolean;
    resize?: boolean;
    scroll?: boolean;
    search?: [string, string];
    selection?: {
        [key:string]: string;
    };
    share?: string;
    single?: boolean;
    status?: modalStatus;
    status_bar?: boolean;
    status_text?: string;
    text_event?: (event:Event) => void;
    text_placeholder?: string;
    text_value?: string;
    timer?: number;
    title: string;
    top?: number;
    type: modalType;
    width?: number;
    zIndex?: number;
}
// ------------------------------------

// networks
interface hashShareConfiguration {
    callback:(responseType:requestType, responseText:string) => void;
    device: string;
    share: string;
    type: shareType;
}
interface networkConfig {
    callback: (responseType:requestType, responseText:string) => void;
    error: string;
    payload: socketData;
}
// ------------------------------------

// share
interface shareButton {
    index: number;
    name: string;
    type: agentType;
}
// ------------------------------------

// tutorial
interface tutorialData {
    description: [string, string][];
    event: eventName;
    node: testBrowserDOM;
    title: string;
}
// ------------------------------------

// utils
interface perimeter {
    bottom: number;
    left: number;
    right: number;
    top: number;
}
// ------------------------------------

// webSocket
interface browserSocket {
    start: (callback: () => void) => void;
    send: (data:socketData) => void;
}
interface SocketEvent extends Event {
    data: string;
}
interface WebSocketLocal extends WebSocket {
    new (address:string, protocols:string[]): WebSocket;
}
// ------------------------------------