/* lib/typescript/browser.d - TypeScript interfaces used by browser specific libraries. */

// audio

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
 * type copyTypes = "copy-file" | "copy-request-files" | "copy-request";
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
// ------------------------------------

// fileBrowser

/**
 * A store of numbers used to populate the file system details modal.
 * ```typescript
 * interface fsDetailCounts {
 *     directories: number;
 *     files: number;
 *     links: number;
 *     size: number;
 * }
 * ``` */
interface fsDetailCounts {
    directories: number;
    files: number;
    links: number;
    size: number;
}

/**
 * Configuration object for the fileBrowser.modalAddress method.
 * ```typescript
 * interface modalHistoryConfig {
 *     address: string;
 *     history: boolean;
 *     id: string;
 *     payload: service_fileSystem;
 * }
 * ``` */
interface modalHistoryConfig {
    address: string;
    history: boolean;
    id: string;
    payload: service_fileSystem;
}

/**
 * An optional configuration object from the fileBrowser.navigate method.
 * ```typescript
 * interface navConfig {
 *     agentName: string;
 *     agentType: agentType;
 *     path: string;
 *     readOnly: boolean;
 *     share: string;
 * }
 * ``` */
interface navConfig {
    agentName: string;
    agentType: agentType;
    path: string;
    readOnly: boolean;
    share: string;
}
// ------------------------------------

// invite

/**
 * A configuration object used in multiple invite module methods.
 * ```typescript
 * interface invite {
 *     action: inviteAction;
 *     deviceName: string;
 *     deviceHash: string;
 *     ipAll: networkAddresses;
 *     ipSelected: string;
 *     message: string;
 *     modal: string;
 *     ports: ports;
 *     shares: agents;
 *     status: inviteStatus;
 *     type: agentType;
 *     userHash: string;
 *     userName: string;
 * }
 * type inviteAction = "invite-complete" | "invite-request" | "invite-response" | "invite-start";
 * type inviteStatus = "accepted" | "declined" | "invited";
 * ``` */
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

/**
 * Object used to identity identify specific DOM input nodes on the invitation request form.
 * ```typescript
 * interface inviteIndexes {
 *     ip: number;
 *     port: number;
 *     type: number;
 * }
 * ``` */
interface inviteIndexes {
    ip: number;
    port: number;
    type: number;
}

/**
 * A configuration object for the invite.payload method which generates an invite type object.
 * ```typescript
 * interface invitePayload {
 *     action: inviteAction;
 *     ipAll: networkAddresses;
 *     ipSelected: string;
 *     message: string;
 *     modal: string;
 *     ports: ports;
 *     status: inviteStatus;
 *     type: agentType;
 * }
 * type inviteAction = "invite-complete" | "invite-request" | "invite-response" | "invite-start";
 * type inviteStatus = "accepted" | "declined" | "invited";
 * ``` */
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

/**
 * The data extracted from the invite request form.
 * ```typescript
 * interface inviteSaved {
 *     ip: string;
 *     message: string;
 *     port: string;
 *     type: agentType;
 * }
 * ``` */
interface inviteSaved {
    ip: string;
    message: string;
    port: string;
    type: agentType;
}
// ------------------------------------

// media

/**
 * The media specific configuration package for generating a media modal.
 * ```typescript
 * interface mediaConfig {
 *     agent: string;
 *     agentType: agentType;
 *     mediaType: mediaType;
 * }
 * type mediaType = "audio" | "video";
 * ``` */
interface mediaConfig {
    agent: string;
    agentType: agentType;
    mediaType: mediaType;
}
// ------------------------------------

// modals

/**
 * A collection of methods for resizing a modal from different respective sides/corners.
 */
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

/**
 * The modal configuration object.
 * ```typescript
 * interface modal {
 *     agent: string;
 *     agentType: agentType;
 *     callback?: () => void;
 *     content: Element;
 *     focus?: Element;
 *     height?: number;
 *     history?: string[];
 *     id?: string;
 *     inputs?: ui_input[];
 *     left?: number;
 *     move?: boolean;
 *     read_only: boolean;
 *     resize?: boolean;
 *     scroll?: boolean;
 *     search?: [string, string];
 *     selection?: {
 *         [key:string]: string;
 *     };
 *     share?: string;
 *     single?: boolean;
 *     status?: modalStatus;
 *     status_bar?: boolean;
 *     status_text?: string;
 *     text_event?: (event:Event) => void;
 *     text_placeholder?: string;
 *     text_value?: string;
 *     timer?: number;
 *     title: string;
 *     top?: number;
 *     type: modalType;
 *     width?: number;
 *     zIndex?: number;
 * }
 * type modalStatus = "hidden" | "maximized" | "minimized" | "normal";
 * type modalType = "configuration" | "details" | "document" | "export" | "fileEdit" | "fileNavigate" | "invite-accept" | "invite-request" | "media" | "message" | "share_delete" | "shares" | "textPad";
 * type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";
 * ``` */
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

// share

/**
 * Configuration object from the share.addAgent method.
 * ```typescript
 * interface addAgent {
 *     type: agentType;
 *     hash: string;
 *     name: string;
 *     save: boolean;
 * }
 * ``` */
interface addAgent {
    type: agentType;
    hash: string;
    name: string;
    save: boolean;
}
// ------------------------------------

// tutorial

/**
 * A user step in the tutorial data.
 * ```typescript
 * interface tutorialData {
 *     description: [string, string][];
 *     event: eventName;
 *     node: testBrowserDOM;
 *     title: string;
 * }
 * type eventName = "blur" | "click" | "contextmenu" | "dblclick" | "focus" | "keydown" | "keyup" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "move" | "refresh-interaction" | "refresh" | "resize" | "select" | "setValue" | "touchend" | "touchstart" | "wait";
 * ``` */
interface tutorialData {
    description: [string, string][];
    event: eventName;
    node: testBrowserDOM;
    title: string;
}
// ------------------------------------

// utils

/**
 * Defines a bounding space for a rectangle draw from one corner to the opposite.  Used for selecting items in a file list.
 * ```typescript
 * interface perimeter {
 *     bottom: number;
 *     left: number;
 *     right: number;
 *     top: number;
 * }
 * ``` */
interface perimeter {
    bottom: number;
    left: number;
    right: number;
    top: number;
}
// ------------------------------------

// webSocket

/**
 * Module definition for browser-side websocket handling.
 * ```typescript
 * interface browserSocket {
 *     send: (data:socketData) => void;
 *     start: (callback: () => void) => void;
 * }
 * ``` */
interface browserSocket {
    send: (data:socketData) => void;
    start: (callback: () => void) => void;
}

/**
 * The WebSocket onmessage handler receives an event object like any other native event handler, but there is a data property specific to web socket events.  There should be a TypeScript type to cover this, but there is isn't, so I created it.
 * ```typescript
 * interface SocketEvent extends Event {
 *     data: string;
 * }
 * ``` */
interface SocketEvent extends Event {
    data: string;
}

/**
 * Defines an empty function used to bypass some constraints between TypeScript types and socket client definitions.
 * ```typescript
 * interface WebSocketLocal extends WebSocket {
 *     new (address:string, protocols:string[]): WebSocket;
 * }
 * ``` */
interface WebSocketLocal extends WebSocket {
    new (address:string, protocols:string[]): WebSocket;
}
// ------------------------------------